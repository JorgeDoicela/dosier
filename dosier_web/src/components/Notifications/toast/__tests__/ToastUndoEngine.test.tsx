import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createToastCommitController } from '../commitController';
import { ToastItem } from '../ToastItem';
import { ToastContainer, type ToastEntry } from '../ToastContainer';
import type { Toast } from '../types';

function buildToast(overrides: Partial<Toast> = {}): Toast {
    return {
        id: overrides.id ?? 'toast-1',
        title: overrides.title ?? 'Notificación eliminada',
        body: overrides.body ?? 'El registro fue movido fuera de tu bandeja.',
        type: overrides.type ?? 'info',
        durationMs: overrides.durationMs ?? 8000,
        createdAt: overrides.createdAt ?? Date.now(),
        ...overrides,
    };
}

describe('createToastCommitController — exclusión mutua e idempotencia', () => {
    it('ejecuta onCommit exactamente una vez incluso ante llamadas concurrentes', async () => {
        const onCommit = vi.fn().mockImplementation(
            () => new Promise<void>((resolve) => setTimeout(resolve, 20))
        );
        const controller = createToastCommitController(onCommit);

        expect(controller.isPending()).toBe(true);
        await Promise.all([controller.commitOnce(), controller.commitOnce(), controller.commitOnce()]);

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(controller.isPending()).toBe(false);
    });

    it('cancelForUndo cancela un commit pendiente e impide su ejecución posterior', async () => {
        const onCommit = vi.fn();
        const controller = createToastCommitController(onCommit);

        expect(controller.cancelForUndo()).toBe(true);
        expect(controller.isPending()).toBe(false);

        await controller.commitOnce();
        expect(onCommit).not.toHaveBeenCalled();
    });

    it('cancelForUndo devuelve false si el commit ya comenzó a ejecutarse', async () => {
        let resolveCommit!: () => void;
        const onCommit = vi.fn().mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveCommit = resolve;
                })
        );
        const controller = createToastCommitController(onCommit);

        const commitPromise = controller.commitOnce();
        expect(controller.cancelForUndo()).toBe(false);

        resolveCommit();
        await commitPromise;
        expect(onCommit).toHaveBeenCalledTimes(1);
    });

    it('invoca onError con fase commit si onCommit rechaza sin lanzar error no controlado', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const boom = new Error('Fallo de red 503');
        const onCommit = vi.fn().mockRejectedValue(boom);
        const onError = vi.fn();

        const controller = createToastCommitController(onCommit, onError);
        await controller.commitOnce();

        expect(onError).toHaveBeenCalledWith(boom, 'commit');
        expect(controller.isPending()).toBe(false);
        errorSpy.mockRestore();
    });
});

describe('ToastItem — casos de uso reales de Deshacer (Undo) y Commit diferido', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('Patrón A (Rollback): muestra Deshacer, bloquea doble clic y descarta al completarse', async () => {
        let resolveUndo!: () => void;
        const onUndo = vi.fn().mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveUndo = resolve;
                })
        );
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo });
        const controller = createToastCommitController(undefined);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        const undoBtn = screen.getByRole('button', { name: 'Deshacer' });
        const closeBtn = screen.getByRole('button', { name: 'Cerrar notificación' });

        // Simular múltiples clics rápidos antes de que React re-renderice
        fireEvent.click(undoBtn);
        fireEvent.click(undoBtn);
        fireEvent.click(undoBtn);

        expect(onUndo).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Revirtiendo...' })).toBeDisabled();
        expect(closeBtn).toBeDisabled();

        await act(async () => {
            resolveUndo();
        });

        expect(onDismiss).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'undo');
    });

    it('Patrón B (Commit diferido): al expirar el tiempo ejecuta onCommit y nunca onUndo', async () => {
        const onUndo = vi.fn();
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo, onCommit, durationMs: 8000 });
        const controller = createToastCommitController(onCommit);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        await act(async () => {
            vi.advanceTimersByTime(7999);
        });
        expect(onCommit).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(1);
        });

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onUndo).not.toHaveBeenCalled();
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'expire');
    });

    it('Patrón B (Commit diferido): pulsar Deshacer cancela onCommit permanentemente', async () => {
        const onUndo = vi.fn().mockResolvedValue(undefined);
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo, onCommit, durationMs: 8000 });
        const controller = createToastCommitController(onCommit);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
        });

        await act(async () => {
            vi.advanceTimersByTime(10000);
        });

        expect(onUndo).toHaveBeenCalledTimes(1);
        expect(onCommit).not.toHaveBeenCalled();
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'undo');
    });

    it('Patrón B (Commit diferido): cerrar manualmente con X ejecuta onCommit de inmediato', async () => {
        const onUndo = vi.fn();
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo, onCommit, durationMs: 8000 });
        const controller = createToastCommitController(onCommit);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));
        });

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onUndo).not.toHaveBeenCalled();
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'dismiss');
    });

    it('Error en onUndo: mantiene el toast abierto en estado de error y permite Reintentar', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const onError = vi.fn();
        const onUndo = vi
            .fn()
            .mockRejectedValueOnce(new Error('Conflicto 409: registro modificado por otro usuario'))
            .mockResolvedValueOnce(undefined);
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo, onError });
        const controller = createToastCommitController(undefined, onError);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
        });

        expect(onDismiss).not.toHaveBeenCalled();
        expect(onError).toHaveBeenCalledWith(expect.any(Error), 'undo');
        expect(screen.getByText('Error al revertir')).toBeInTheDocument();
        expect(
            screen.getByText('Conflicto 409: registro modificado por otro usuario')
        ).toBeInTheDocument();

        // Avanzar el tiempo en estado de error no debe auto-descartar el toast
        await act(async () => {
            vi.advanceTimersByTime(20000);
        });
        expect(onDismiss).not.toHaveBeenCalled();

        // Reintentar con éxito
        await act(async () => {
            fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
        });

        expect(onUndo).toHaveBeenCalledTimes(2);
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'undo');
        errorSpy.mockRestore();
    });

    it('Protección contra clics accidentales: hacer clic en el cuerpo de un toast con Deshacer no lo cierra', () => {
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo: vi.fn(), url: '/notificaciones' });
        const controller = createToastCommitController(undefined);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        fireEvent.click(screen.getByRole('status'));
        expect(onDismiss).not.toHaveBeenCalled();
    });

    it('Pausa el temporizador en hover y reanuda exactamente con el tiempo restante', async () => {
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo: vi.fn(), durationMs: 8000 });
        const controller = createToastCommitController(undefined);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        const card = screen.getByRole('status');

        await act(async () => {
            vi.advanceTimersByTime(3000);
        });

        // Hover pausa el temporizador (quedan ~5000ms)
        fireEvent.mouseEnter(card);
        await act(async () => {
            vi.advanceTimersByTime(15000);
        });
        expect(onDismiss).not.toHaveBeenCalled();

        // Al salir del hover reanuda con los ~5000ms restantes
        fireEvent.mouseLeave(card);
        await act(async () => {
            vi.advanceTimersByTime(4999);
        });
        expect(onDismiss).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(1);
        });
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'expire');
    });

    it('Soporte de teclado: Escape descarta el toast y ejecuta onCommit si está pendiente', async () => {
        const onCommit = vi.fn().mockResolvedValue(undefined);
        const onDismiss = vi.fn();
        const toast = buildToast({ onUndo: vi.fn(), onCommit });
        const controller = createToastCommitController(onCommit);

        render(
            <ToastItem
                toast={toast}
                commitController={controller}
                onDismiss={onDismiss}
                navigate={vi.fn()}
            />
        );

        const card = screen.getByRole('status');
        await act(async () => {
            fireEvent.keyDown(card, { key: 'Escape' });
        });

        expect(onCommit).toHaveBeenCalledTimes(1);
        expect(onDismiss).toHaveBeenCalledWith('toast-1', 'dismiss');
    });
});

describe('ToastContainer — estabilidad de montaje (regresión key={toasts.length})', () => {
    it('agregar un segundo toast no desmonta ni resetea el estado de un toast en curso', async () => {
        let resolveUndo!: () => void;
        const onUndoA = vi.fn().mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    resolveUndo = resolve;
                })
        );

        const entryA: ToastEntry = {
            toast: buildToast({ id: 'toast-a', title: 'Acción A', onUndo: onUndoA }),
            commitController: createToastCommitController(undefined),
        };
        const entryB: ToastEntry = {
            toast: buildToast({ id: 'toast-b', title: 'Aviso B', onUndo: undefined }),
            commitController: createToastCommitController(undefined),
        };

        const onDismiss = vi.fn();
        const navigate = vi.fn();

        const { rerender } = render(
            <ToastContainer entries={[entryA]} onDismiss={onDismiss} navigate={navigate} />
        );

        // Iniciar undo en Toast A
        fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
        expect(screen.getByRole('button', { name: 'Revirtiendo...' })).toBeDisabled();

        // Llega Toast B mientras Toast A sigue revirtiendo
        rerender(
            <ToastContainer entries={[entryA, entryB]} onDismiss={onDismiss} navigate={navigate} />
        );

        // Toast A DEBE seguir en estado "Revirtiendo..." y NO haber sido remontado a "Deshacer"
        expect(screen.getByRole('button', { name: 'Revirtiendo...' })).toBeDisabled();
        expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument();
        expect(screen.getByText('Aviso B')).toBeInTheDocument();

        await act(async () => {
            resolveUndo();
        });
        expect(onDismiss).toHaveBeenCalledWith('toast-a', 'undo');
    });
});

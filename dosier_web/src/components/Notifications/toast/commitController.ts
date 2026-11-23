import type { ToastOptions } from './types';

export interface ToastCommitController {
    /**
     * Intenta cancelar el commit pendiente para dar paso a onUndo.
     * Devuelve true si el commit fue cancelado exitosamente (exclusividad ganada).
     * Devuelve false si el commit ya comenzó o se completó.
     */
    cancelForUndo: () => boolean;
    /**
     * Ejecuta onCommit exactamente una vez si no ha sido cancelado ni ejecutado antes.
     */
    commitOnce: () => Promise<void>;
    /**
     * Indica si todavía existe un commit pendiente por ejecutar.
     */
    isPending: () => boolean;
}

/**
 * Controlador de exclusión mutua e idempotencia para toasts con confirmación diferida.
 * Garantiza que onCommit y onUndo jamás compitan ni se ejecuten dos veces,
 * incluso ante doble clic, expiración simultánea, cambio de ruta o cierre de pestaña.
 */
export function createToastCommitController(
    onCommit?: ToastOptions['onCommit'],
    onError?: ToastOptions['onError']
): ToastCommitController {
    let state: 'pending' | 'cancelled' | 'committing' | 'committed' = onCommit
        ? 'pending'
        : 'committed';

    return {
        cancelForUndo() {
            if (state === 'committing' || (onCommit && state === 'committed')) {
                return false;
            }
            state = 'cancelled';
            return true;
        },

        async commitOnce() {
            if (!onCommit || state !== 'pending') {
                return;
            }
            state = 'committing';
            try {
                await onCommit();
                state = 'committed';
            } catch (err) {
                state = 'committed';
                console.error('[Toast Commit] Error al confirmar la acción diferida:', err);
                onError?.(err, 'commit');
            }
        },

        isPending() {
            return Boolean(onCommit) && state === 'pending';
        },
    };
}

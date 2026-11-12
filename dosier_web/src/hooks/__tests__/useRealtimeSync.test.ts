import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSync } from '../useRealtimeSync';

describe('useRealtimeSync', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('ejecuta onSync al recibir un evento personalizado de dominio', () => {
        const onSyncMock = vi.fn();
        renderHook(() => useRealtimeSync({
            onSync: onSyncMock,
            events: ['dosier-projects-changed']
        }));

        expect(onSyncMock).not.toHaveBeenCalled();

        act(() => {
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        });

        expect(onSyncMock).toHaveBeenCalledTimes(1);
    });

    it('ejecuta onSync al cambiar la visibilidad de la pestaña a visible', () => {
        const onSyncMock = vi.fn();
        renderHook(() => useRealtimeSync({
            onSync: onSyncMock,
            revalidateOnFocus: true
        }));

        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => 'visible'
        });

        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(onSyncMock).toHaveBeenCalledTimes(1);
    });

    it('aplica throttle y previene bucles de revalidación por foco rápido consecutivo', () => {
        const onSyncMock = vi.fn();
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => 'visible'
        });

        renderHook(() => useRealtimeSync({
            onSync: onSyncMock,
            revalidateOnFocus: true,
            focusThrottleMs: 3000
        }));

        act(() => {
            window.dispatchEvent(new Event('focus'));
        });
        expect(onSyncMock).toHaveBeenCalledTimes(1);

        // Eventos de foco subsecuentes en milisegundos (ej. al desmontar/remontar elementos en el DOM)
        act(() => {
            window.dispatchEvent(new Event('focus'));
            window.dispatchEvent(new Event('focus'));
            vi.advanceTimersByTime(1000);
            window.dispatchEvent(new Event('focus'));
        });

        // Debe mantenerse en 1 llamada gracias al throttle
        expect(onSyncMock).toHaveBeenCalledTimes(1);

        // Tras superar el throttle (3000ms), un nuevo foco sí debe disparar
        act(() => {
            vi.advanceTimersByTime(2500);
            window.dispatchEvent(new Event('focus'));
        });

        expect(onSyncMock).toHaveBeenCalledTimes(2);
    });

    it('ejecuta onSync periódicamente según el heartbeat si la pestaña es visible', () => {
        const onSyncMock = vi.fn();
        Object.defineProperty(document, 'visibilityState', {
            configurable: true,
            get: () => 'visible'
        });

        renderHook(() => useRealtimeSync({
            onSync: onSyncMock,
            heartbeatIntervalMs: 10000
        }));

        expect(onSyncMock).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(10000);
        });

        expect(onSyncMock).toHaveBeenCalledTimes(1);

        act(() => {
            vi.advanceTimersByTime(20000);
        });

        expect(onSyncMock).toHaveBeenCalledTimes(3);
    });

    it('limpia los listeners al desmontarse', () => {
        const onSyncMock = vi.fn();
        const { unmount } = renderHook(() => useRealtimeSync({
            onSync: onSyncMock,
            events: ['dosier-projects-changed']
        }));

        unmount();

        act(() => {
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        });

        expect(onSyncMock).not.toHaveBeenCalled();
    });
});


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


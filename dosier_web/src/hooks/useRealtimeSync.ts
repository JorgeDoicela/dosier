import { useEffect, useRef } from 'react';

export interface UseRealtimeSyncOptions {
    /**
     * Función que ejecuta la sincronización o recarga silenciosa de datos.
     */
    onSync: () => void | Promise<void>;
    /**
     * Eventos globales del sistema que disparan la sincronización inmediata (SignalR y mutaciones de dominio).
     * Por defecto: ['dosier-projects-changed']
     */
    events?: string[];
    /**
     * Si debe revalidar automáticamente cuando la pestaña recupera el foco o vuelve a ser visible.
     * Patrón Stale-While-Revalidate institucional.
     * Por defecto: true
     */
    revalidateOnFocus?: boolean;
    /**
     * Intervalo de refresco pasivo en milisegundos mientras la pestaña permanezca activa/visible.
     * Por defecto: 30000 (30 segundos). Si es 0 o menor, se deshabilita el heartbeat.
     */
    heartbeatIntervalMs?: number;
    /**
     * Flag opcional para condicionar la sincronización según el estado del componente.
     * Por defecto: true
     */
    enabled?: boolean;
}

/**
 * Hook universal de sincronización en tiempo real para DOSIER.
 * Proporciona arquitectura de 3 niveles de actualización continua sin requerir botones manuales de recarga:
 *  1. Eventos reactivos de SignalR WebSockets y mutaciones del ciclo de vida del PEA ('dosier-projects-changed').
 *  2. Revalidación inmediata al recuperar foco o visibilidad de pestaña (revalidateOnFocus).
 *  3. Heartbeat pasivo periódico mientras el usuario visualice la pantalla.
 */
export function useRealtimeSync({
    onSync,
    events = ['dosier-projects-changed'],
    revalidateOnFocus = true,
    heartbeatIntervalMs = 30000,
    enabled = true
}: UseRealtimeSyncOptions): void {
    const syncRef = useRef(onSync);
    syncRef.current = onSync;

    // 1. Escucha reactiva de eventos del bus de dominio (SignalR / WebSockets)
    useEffect(() => {
        if (!enabled || !events || events.length === 0) return;

        const handleDomainEvent = () => {
            syncRef.current();
        };

        events.forEach(eventName => {
            window.addEventListener(eventName, handleDomainEvent);
        });

        return () => {
            events.forEach(eventName => {
                window.removeEventListener(eventName, handleDomainEvent);
            });
        };
    }, [events, enabled]);

    // 2. Revalidación por recuperación de foco o visibilidad de la pestaña (Stale-While-Revalidate)
    useEffect(() => {
        if (!enabled || !revalidateOnFocus) return;

        const handleVisibilityAndFocus = () => {
            if (document.visibilityState === 'visible') {
                syncRef.current();
            }
        };

        window.addEventListener('focus', handleVisibilityAndFocus);
        document.addEventListener('visibilitychange', handleVisibilityAndFocus);

        return () => {
            window.removeEventListener('focus', handleVisibilityAndFocus);
            document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
        };
    }, [revalidateOnFocus, enabled]);

    // 3. Heartbeat pasivo (revalidación periódica solo si la pestaña está activa)
    useEffect(() => {
        if (!enabled || !heartbeatIntervalMs || heartbeatIntervalMs <= 0) return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                syncRef.current();
            }
        }, heartbeatIntervalMs);

        return () => clearInterval(interval);
    }, [heartbeatIntervalMs, enabled]);
}


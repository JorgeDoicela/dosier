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
     * Tiempo mínimo en milisegundos entre revalidaciones consecutivas disparadas por eventos de foco/visibilidad.
     * Evita bucles infinitos de revalidación por refocalización del DOM o cambios rápidos de ventana.
     * Por defecto: 3000 (3 segundos).
     */
    focusThrottleMs?: number;
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
 *  1. Eventos reactivos de SignalR WebSockets y mutaciones del ciclo de vida del PEA ('dosier-projects-changed')
 *     con deduplicación por micro-debounce.
 *  2. Revalidación inmediata al recuperar foco o visibilidad de pestaña (revalidateOnFocus) con throttle defensivo.
 *  3. Heartbeat pasivo periódico mientras el usuario visualice la pantalla.
 */
export function useRealtimeSync({
    onSync,
    events = ['dosier-projects-changed'],
    revalidateOnFocus = true,
    focusThrottleMs = 3000,
    heartbeatIntervalMs = 30000,
    enabled = true
}: UseRealtimeSyncOptions): void {
    const syncRef = useRef(onSync);
    syncRef.current = onSync;

    const lastFocusSyncTimeRef = useRef<number>(0);
    const lastDomainSyncTimeRef = useRef<number>(0);
    const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Clave primitiva para estabilizar la dependencia del array de eventos y evitar re-suscripciones cíclicas
    const eventsKey = (events || []).join('|');

    // 1. Escucha reactiva de eventos del bus de dominio (SignalR / WebSockets) con throttle defensivo de 300ms
    useEffect(() => {
        if (!enabled || !events || events.length === 0) return;

        const handleDomainEvent = () => {
            const now = Date.now();
            const elapsed = now - lastDomainSyncTimeRef.current;
            const DOMAIN_THROTTLE_MS = 300;

            if (elapsed >= DOMAIN_THROTTLE_MS) {
                lastDomainSyncTimeRef.current = now;
                if (trailingTimerRef.current) {
                    clearTimeout(trailingTimerRef.current);
                    trailingTimerRef.current = null;
                }
                syncRef.current();
            } else {
                // Programar una ejecución trailing para no perder el último estado si llegan eventos acumulados
                if (trailingTimerRef.current) clearTimeout(trailingTimerRef.current);
                trailingTimerRef.current = setTimeout(() => {
                    lastDomainSyncTimeRef.current = Date.now();
                    trailingTimerRef.current = null;
                    syncRef.current();
                }, DOMAIN_THROTTLE_MS - elapsed);
            }
        };

        events.forEach(eventName => {
            window.addEventListener(eventName, handleDomainEvent);
        });

        return () => {
            if (trailingTimerRef.current) {
                clearTimeout(trailingTimerRef.current);
                trailingTimerRef.current = null;
            }
            events.forEach(eventName => {
                window.removeEventListener(eventName, handleDomainEvent);
            });
        };
    }, [eventsKey, enabled]);

    // 2. Revalidación por recuperación de foco o visibilidad de la pestaña (Stale-While-Revalidate con throttle)
    useEffect(() => {
        if (!enabled || !revalidateOnFocus) return;

        const handleVisibilityAndFocus = () => {
            if (document.visibilityState !== 'visible') return;

            const now = Date.now();
            if (now - lastFocusSyncTimeRef.current < focusThrottleMs) {
                return;
            }
            lastFocusSyncTimeRef.current = now;
            syncRef.current();
        };

        window.addEventListener('focus', handleVisibilityAndFocus);
        document.addEventListener('visibilitychange', handleVisibilityAndFocus);

        return () => {
            window.removeEventListener('focus', handleVisibilityAndFocus);
            document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
        };
    }, [revalidateOnFocus, enabled, focusThrottleMs]);

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



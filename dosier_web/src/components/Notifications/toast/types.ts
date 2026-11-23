export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default';

export type ToastUndoPhase = 'undo' | 'commit';

export type ToastExecutionStatus = 'idle' | 'undoing' | 'committing' | 'error';

export interface ToastOptions {
    title: string;
    body: string;
    type?: ToastType;
    url?: string;
    actionLabel?: string;
    /**
     * Callback para revertir la acción ejecutada o cancelar una acción diferida.
     * Soporta funciones síncronas y asíncronas. Si lanza error, el toast permanece
     * visible en estado de error permitiendo reintentar.
     */
    onUndo?: () => void | Promise<void>;
    /**
     * Callback de confirmación diferida (patrón Gmail / Linear).
     * Se invoca una única vez al expirar el temporizador, al cerrar manualmente
     * el toast o al salir de la página, siempre que no se haya ejecutado onUndo.
     */
    onCommit?: () => void | Promise<void>;
    /** Etiqueta del botón de reversión (por defecto: "Deshacer"). */
    undoLabel?: string;
    /** Duración en ms antes de descartarse/confirmarse (por defecto: 8000ms con onUndo, 5000ms estándar). */
    durationMs?: number;
    /** Callback opcional invocado si onUndo o onCommit fallan. */
    onError?: (error: unknown, phase: ToastUndoPhase) => void;
    /** Clave de deduplicación: reemplaza un toast activo con la misma clave. */
    dedupeKey?: string;
    /** Si es true, omite sonido y notificación nativa del sistema operativo. */
    silent?: boolean;
    /** Si es false, oculta el botón de cierre manual (por defecto: true). */
    dismissible?: boolean;
}

export interface Toast extends ToastOptions {
    id: string;
    type: ToastType;
    durationMs: number;
    createdAt: number;
}

export const DEFAULT_TOAST_DURATION_MS = 5000;
export const DEFAULT_UNDO_TOAST_DURATION_MS = 8000;
export const MAX_VISIBLE_TOASTS = 5;

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    AlertCircle,
    Bell,
    CheckCircle2,
    Info,
    Loader2,
    X,
    XCircle,
} from 'lucide-react';
import type { Toast, ToastExecutionStatus } from './types';
import type { ToastCommitController } from './commitController';

export interface ToastItemProps {
    toast: Toast;
    commitController: ToastCommitController;
    onDismiss: (id: string, reason: 'expire' | 'dismiss' | 'undo' | 'navigate') => void;
    navigate: (url: string) => void;
}

const RESUME_GRACE_THRESHOLD_MS = 600;
const RESUME_GRACE_EXTENSION_MS = 800;

function extractErrorMessage(err: unknown): string {
    if (err instanceof Error && err.message.trim().length > 0) {
        return err.message;
    }
    if (typeof err === 'string' && err.trim().length > 0) {
        return err;
    }
    return 'No se pudo revertir la acción. Inténtelo de nuevo.';
}

export const ToastItem: React.FC<ToastItemProps> = ({
    toast,
    commitController,
    onDismiss,
    navigate,
}) => {
    const [status, setStatus] = useState<ToastExecutionStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [isDocHidden, setIsDocHidden] = useState(
        typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false
    );

    const containerRef = useRef<HTMLDivElement | null>(null);
    const isMountedRef = useRef(true);
    const settlementRef = useRef<'none' | 'undoing' | 'committing' | 'settled'>('none');
    const remainingMsRef = useRef<number>(toast.durationMs);
    const startedAtRef = useRef<number>(Date.now());
    const timerIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const graceAppliedRef = useRef(false);

    const isUndoable = Boolean(toast.onUndo);
    const isBusy = status === 'undoing' || status === 'committing';
    const isPaused = isHovered || isFocused || isDocHidden || status !== 'idle';
    const isDismissible = toast.dismissible !== false;

    const clearActiveTimer = useCallback(() => {
        if (timerIdRef.current !== null) {
            clearTimeout(timerIdRef.current);
            timerIdRef.current = null;
        }
    }, []);

    const finalizeWithCommit = useCallback(
        async (reason: 'expire' | 'dismiss' | 'navigate') => {
            if (settlementRef.current !== 'none') return;
            settlementRef.current = 'committing';
            clearActiveTimer();

            if (commitController.isPending()) {
                if (isMountedRef.current) {
                    setStatus('committing');
                }
                await commitController.commitOnce();
            }

            settlementRef.current = 'settled';
            if (isMountedRef.current) {
                onDismiss(toast.id, reason);
            }
        },
        [clearActiveTimer, commitController, onDismiss, toast.id]
    );

    const handleUndo = useCallback(
        async (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            e.preventDefault();

            if (!toast.onUndo) return;
            if (settlementRef.current !== 'none') return;

            // Adquirir exclusividad antes de que expire cualquier commit diferido
            const cancelled = commitController.cancelForUndo();
            if (!cancelled) return;

            settlementRef.current = 'undoing';
            clearActiveTimer();
            setErrorMessage(null);
            setStatus('undoing');

            try {
                await toast.onUndo();
                settlementRef.current = 'settled';
                if (isMountedRef.current) {
                    onDismiss(toast.id, 'undo');
                }
            } catch (err) {
                console.error('[Toast Undo] Error al revertir la acción:', err);
                toast.onError?.(err, 'undo');
                // Permitir reintento explícito por el usuario
                settlementRef.current = 'none';
                if (isMountedRef.current) {
                    setErrorMessage(extractErrorMessage(err));
                    setStatus('error');
                }
            }
        },
        [clearActiveTimer, commitController, onDismiss, toast]
    );

    const handleManualClose = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (isBusy) return;

            if (status === 'error') {
                settlementRef.current = 'settled';
                clearActiveTimer();
                onDismiss(toast.id, 'dismiss');
                return;
            }

            void finalizeWithCommit('dismiss');
        },
        [clearActiveTimer, finalizeWithCommit, isBusy, onDismiss, status, toast.id]
    );

    const handleNavigateAction = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            if (!toast.url || isBusy) return;
            navigate(toast.url);
            void finalizeWithCommit('navigate');
        },
        [finalizeWithCommit, isBusy, navigate, toast.url]
    );

    const handleContainerClick = useCallback(() => {
        // Nunca descartar accidentalmente un toast con botón Deshacer, en estado de error o en proceso
        if (isUndoable || isBusy || status === 'error') return;
        if (toast.url) {
            navigate(toast.url);
            void finalizeWithCommit('navigate');
        }
    }, [finalizeWithCommit, isBusy, isUndoable, navigate, status, toast.url]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Escape' && isDismissible && !isBusy) {
                e.stopPropagation();
                if (status === 'error') {
                    settlementRef.current = 'settled';
                    clearActiveTimer();
                    onDismiss(toast.id, 'dismiss');
                } else {
                    void finalizeWithCommit('dismiss');
                }
            }
        },
        [clearActiveTimer, finalizeWithCommit, isBusy, isDismissible, onDismiss, status, toast.id]
    );

    // Pausar el temporizador automáticamente si el usuario cambia de pestaña del navegador
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const handleVisibilityChange = () => {
            setIsDocHidden(document.visibilityState === 'hidden');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Gestión precisa del temporizador con soporte de pausa/reanudación
    useEffect(() => {
        if (settlementRef.current !== 'none' || isPaused) {
            return;
        }

        let delay = remainingMsRef.current;
        if (isUndoable && delay < RESUME_GRACE_THRESHOLD_MS && !graceAppliedRef.current) {
            delay = RESUME_GRACE_EXTENSION_MS;
            remainingMsRef.current = delay;
            graceAppliedRef.current = true;
        }

        startedAtRef.current = Date.now();
        const id = setTimeout(() => {
            timerIdRef.current = null;
            remainingMsRef.current = 0;
            void finalizeWithCommit('expire');
        }, Math.max(delay, 0));
        timerIdRef.current = id;

        return () => {
            if (timerIdRef.current === id) {
                clearTimeout(id);
                timerIdRef.current = null;
                const elapsed = Date.now() - startedAtRef.current;
                remainingMsRef.current = Math.max(remainingMsRef.current - elapsed, 0);
            }
        };
    }, [finalizeWithCommit, isPaused, isUndoable]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            clearActiveTimer();
        };
    }, [clearActiveTimer]);

    const iconConfig = (() => {
        if (status === 'error' || toast.type === 'error') {
            return { Icon: XCircle, colorClass: 'text-rose-600 dark:text-rose-400' };
        }
        if (toast.type === 'success') {
            return { Icon: CheckCircle2, colorClass: 'text-emerald-600 dark:text-emerald-400' };
        }
        if (toast.type === 'warning') {
            return { Icon: AlertCircle, colorClass: 'text-amber-600 dark:text-amber-400' };
        }
        if (toast.type === 'info') {
            return { Icon: Info, colorClass: 'text-[#0070f3] dark:text-blue-400' };
        }
        return { Icon: Bell, colorClass: 'text-[#0070f3] dark:text-blue-400' };
    })();

    const IconComponent = iconConfig.Icon;
    const isAssertive = status === 'error' || toast.type === 'error';

    return (
        <div
            ref={containerRef}
            role={isAssertive ? 'alert' : 'status'}
            aria-live={isAssertive ? 'assertive' : 'polite'}
            aria-atomic="true"
            tabIndex={0}
            translate="no"
            onKeyDown={handleKeyDown}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            onTouchCancel={() => setIsHovered(false)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
                if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
                    setIsFocused(false);
                }
            }}
            onClick={handleContainerClick}
            className={`toast-vercel toast-vercel-${toast.type} group relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0070f3] ${
                !isUndoable && toast.url ? 'cursor-pointer' : 'cursor-default'
            }`}
        >
            <div className={`shrink-0 self-start mt-0.5 ${iconConfig.colorClass}`} aria-hidden="true">
                {isBusy ? (
                    <Loader2 size={15} className="animate-spin" />
                ) : (
                    <IconComponent size={15} />
                )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 leading-snug">
                    {status === 'error' ? 'Error al revertir' : toast.title}
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mt-0.5 break-words">
                    {status === 'error' && errorMessage ? errorMessage : toast.body}
                </p>
            </div>

            {(toast.url || isUndoable) && (
                <div className="w-px h-5 bg-slate-200 dark:bg-zinc-800 shrink-0 self-center" aria-hidden="true" />
            )}

            {toast.url && status !== 'error' && (
                <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleNavigateAction}
                    className="shrink-0 px-2 py-1 text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:underline bg-transparent border-0 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {toast.actionLabel || 'Ver'}
                </button>
            )}

            {isUndoable && (
                <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleUndo}
                    aria-busy={status === 'undoing'}
                    className="shrink-0 px-2 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline bg-transparent border-0 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {status === 'undoing'
                        ? 'Revirtiendo...'
                        : status === 'error'
                        ? 'Reintentar'
                        : toast.undoLabel || 'Deshacer'}
                </button>
            )}

            {isDismissible && (
                <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleManualClose}
                    aria-label="Cerrar notificación"
                    title="Cerrar notificación"
                    className="text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 p-1.5 -mr-1 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex items-center justify-center self-center shrink-0 border-0 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <X size={14} />
                </button>
            )}

            {isUndoable && status === 'idle' && (
                <div
                    className="toast-countdown-track"
                    aria-hidden="true"
                >
                    <div
                        className="toast-countdown-bar"
                        style={{
                            animationDuration: `${toast.durationMs}ms`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                    />
                </div>
            )}
        </div>
    );
};

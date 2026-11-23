import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { getApiRootUrl } from './axios_config';
import { notificacionesService } from '../services/notificacionesService';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    DEFAULT_TOAST_DURATION_MS,
    DEFAULT_UNDO_TOAST_DURATION_MS,
    MAX_VISIBLE_TOASTS,
    type Toast,
    type ToastOptions,
    type ToastType,
} from '../components/Notifications/toast/types';
import { createToastCommitController } from '../components/Notifications/toast/commitController';
import { ToastContainer, type ToastEntry } from '../components/Notifications/toast/ToastContainer';
import {
    restoreItemAtIndex,
    restoreItemsPreservingOrder,
} from '../components/Notifications/toast/undoListHelpers';
import { stripHtmlToText } from '../utils/notificationText';

export type { Toast, ToastOptions, ToastType };

interface Notification {
    uuid: string;
    titulo: string;
    mensaje: string;
    categoria: string;
    fecha_envio: string;
    leido: boolean;
    url_accion?: string;
}

interface SignalRNotificationPayload {
    title?: string;
    body?: string;
    categoria?: string;
    url?: string;
}

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    fetchNotifications: () => Promise<void>;
    markAsRead: (uuid: string) => Promise<void>;
    markAllAsRead: (extraUnreadUuids?: string[] | unknown) => Promise<void>;
    deleteNotification: (uuid: string, snapshot?: Notification) => Promise<void>;
    clearReadNotifications: (readSnapshots?: Notification[]) => Promise<void>;
    /** Aplica la máscara de mutaciones diferidas pendientes (eliminaciones / lecturas en ventana de Deshacer). */
    applyPendingOverlay: <T extends { uuid: string; leido: boolean }>(items: T[]) => T[];
    /** Versión reactiva que se incrementa al deshacer o fallar un commit diferido para resincronizar vistas extendidas. */
    pendingOverlayVersion: number;
    isLoading: boolean;
    isConnected: boolean;
    /**
     * API clásica posicional mantenida por retrocompatibilidad total.
     * Devuelve el ID del toast generado.
     */
    addToast: (
        title: string,
        body: string,
        type?: ToastType,
        url?: string,
        onUndo?: () => void | Promise<void>,
        actionLabel?: string,
        silent?: boolean
    ) => string;
    /**
     * API estructurada recomendada para acciones con deshacer (onUndo),
     * confirmación diferida (onCommit), deduplicación y duración personalizada.
     */
    showToast: (options: ToastOptions) => string;
    /** Descarta un toast específico por ID (ejecutando su onCommit pendiente si aplica). */
    dismissToast: (id: string) => void;
    /** Descarta todos los toasts visibles (ejecutando sus onCommit pendientes si aplica). */
    dismissAllToasts: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

let toastSequence = 0;

function generateToastId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    toastSequence += 1;
    return `toast-${Date.now()}-${toastSequence}`;
}

function stripHtmlTags(text: string): string {
    return text.replace(/<\/?[^>]+(>|$)/g, '');
}

const playNotificationSound = (type: ToastType = 'default') => {
    try {
        const audioWindow = window as Window & {
            webkitAudioContext?: typeof AudioContext;
        };
        const AudioContextClass = window.AudioContext || audioWindow.webkitAudioContext;
        if (!AudioContextClass) return;

        const audioCtx = new AudioContextClass();

        const playPremiumTone = (
            freqs: number[],
            duration: number,
            toneType: 'success' | 'error' | 'info'
        ) => {
            if (audioCtx.state === 'suspended') return;

            const now = audioCtx.currentTime;
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(toneType === 'error' ? 700 : 1600, now);
            filter.connect(audioCtx.destination);

            const mainGain = audioCtx.createGain();
            mainGain.gain.setValueAtTime(0, now);
            mainGain.gain.linearRampToValueAtTime(0.08, now + 0.008);
            mainGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            mainGain.connect(filter);

            freqs.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now);

                const oscGain = audioCtx.createGain();
                oscGain.gain.setValueAtTime(idx === 0 ? 0.8 : 0.35, now);

                osc.connect(oscGain);
                oscGain.connect(mainGain);

                osc.start(now);
                osc.stop(now + duration);
            });
        };

        const playSynthesizedFallback = () => {
            if (type === 'success') {
                playPremiumTone([523.25, 1046.5], 0.25, 'success');
                setTimeout(() => {
                    playPremiumTone([659.25, 1318.51], 0.28, 'success');
                }, 75);
                setTimeout(() => {
                    playPremiumTone([783.99, 1567.98], 0.35, 'success');
                }, 150);
            } else if (type === 'error' || type === 'warning') {
                playPremiumTone([200, 204], 0.35, 'error');
            } else {
                playPremiumTone([880, 1760], 0.2, 'info');
                setTimeout(() => {
                    playPremiumTone([1046.5, 2093.0], 0.3, 'info');
                }, 90);
            }
        };

        if (type === 'default' || type === 'info') {
            const audio = new Audio(`${import.meta.env.BASE_URL}notification.mp3`);
            audio.volume = 0.5;
            audio.play().catch((err) => {
                console.warn('Fallo al reproducir audio personalizado, usando fallback sintetizado:', err);
                playSynthesizedFallback();
            });
        } else {
            playSynthesizedFallback();
        }
    } catch (e) {
        console.warn('Web Audio API notification sound failed to play:', e);
    }
};

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    const [toastEntries, setToastEntries] = useState<ToastEntry[]>([]);
    const toastEntriesRef = useRef<ToastEntry[]>([]);
    toastEntriesRef.current = toastEntries;

    const notificationsRef = useRef<Notification[]>([]);
    notificationsRef.current = notifications;

    const pendingDeletedUuidsRef = useRef<Set<string>>(new Set());
    const pendingReadUuidsRef = useRef<Set<string>>(new Set());
    const [pendingOverlayVersion, setPendingOverlayVersion] = useState(0);

    const applyPendingOverlay = useCallback(
        <T extends { uuid: string; leido: boolean }>(items: T[]): T[] => {
            const deletedSet = pendingDeletedUuidsRef.current;
            const readSet = pendingReadUuidsRef.current;
            if (deletedSet.size === 0 && readSet.size === 0) return items;

            return items
                .filter((item) => !deletedSet.has(item.uuid))
                .map((item) => (readSet.has(item.uuid) ? { ...item, leido: true } : item));
        },
        []
    );

    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) return;
        if (Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (err) {
                console.warn('Error requesting notification permission:', err);
            }
        }
    }, []);

    const removeToastEntry = useCallback(
        (id: string) => {
            setToastEntries((prev) => prev.filter((entry) => entry.toast.id !== id));
        },
        []
    );

    const dismissToast = useCallback((id: string) => {
        const target = toastEntriesRef.current.find((entry) => entry.toast.id === id);
        if (target && target.commitController.isPending()) {
            void target.commitController.commitOnce();
        }
        setToastEntries((prev) => prev.filter((entry) => entry.toast.id !== id));
    }, []);

    const dismissAllToasts = useCallback(() => {
        toastEntriesRef.current.forEach((entry) => {
            if (entry.commitController.isPending()) {
                void entry.commitController.commitOnce();
            }
        });
        setToastEntries([]);
    }, []);

    const showToast = useCallback(
        (options: ToastOptions): string => {
            const id = generateToastId();
            const type: ToastType = options.type ?? 'default';
            const cleanBody = stripHtmlTags(options.body ?? '');
            const durationMs =
                options.durationMs ??
                (options.onUndo ? DEFAULT_UNDO_TOAST_DURATION_MS : DEFAULT_TOAST_DURATION_MS);

            const toast: Toast = {
                ...options,
                id,
                type,
                body: cleanBody,
                durationMs,
                createdAt: Date.now(),
            };

            const commitController = createToastCommitController(options.onCommit, options.onError);
            const newEntry: ToastEntry = { toast, commitController };

            setToastEntries((prev) => {
                let next = [...prev];

                // Deduplicación: si existe un toast con la misma clave, confirmar su commit pendiente y reemplazarlo
                if (options.dedupeKey) {
                    const existingIdx = next.findIndex(
                        (entry) => entry.toast.dedupeKey === options.dedupeKey
                    );
                    if (existingIdx !== -1) {
                        const existing = next[existingIdx];
                        if (existing.commitController.isPending()) {
                            void existing.commitController.commitOnce();
                        }
                        next.splice(existingIdx, 1);
                    }
                }

                // Control de desbordamiento: limitar la pila visible preservando toasts con Deshacer
                while (next.length >= MAX_VISIBLE_TOASTS) {
                    const evictIndex = next.findIndex((entry) => !entry.toast.onUndo);
                    const indexToRemove = evictIndex !== -1 ? evictIndex : 0;
                    const [evicted] = next.splice(indexToRemove, 1);
                    if (evicted?.commitController.isPending()) {
                        void evicted.commitController.commitOnce();
                    }
                }

                next.push(newEntry);
                return next;
            });

            if (
                !options.silent &&
                (type === 'success' || type === 'error' || type === 'warning' || document.hasFocus())
            ) {
                playNotificationSound(type);
            }

            const isWebPushActive = localStorage.getItem('web_push_active') === 'true';
            const shouldShowNative =
                !options.silent &&
                !isWebPushActive &&
                (type === 'default' || type === 'info') &&
                !document.hasFocus() &&
                'Notification' in window &&
                Notification.permission === 'granted';

            if (shouldShowNative) {
                try {
                    const n = new window.Notification(options.title, {
                        body: cleanBody,
                        icon: `${import.meta.env.BASE_URL}logo_fondo_negro.png`,
                    });

                    n.onclick = () => {
                        window.focus();
                        if (options.url) {
                            navigate(options.url);
                        }
                        n.close();
                    };
                } catch (err) {
                    console.warn('Error spawning native desktop notification:', err);
                }
            }

            return id;
        },
        [navigate]
    );

    const addToast = useCallback(
        (
            title: string,
            body: string,
            type: ToastType = 'default',
            url?: string,
            onUndo?: () => void | Promise<void>,
            actionLabel?: string,
            silent = false
        ): string => {
            return showToast({
                title,
                body,
                type,
                url,
                onUndo,
                actionLabel,
                silent,
            });
        },
        [showToast]
    );

    // Garantizar que las confirmaciones diferidas pendientes se ejecuten si el usuario cierra o recarga la pestaña
    useEffect(() => {
        const flushPendingCommits = () => {
            toastEntriesRef.current.forEach((entry) => {
                if (entry.commitController.isPending()) {
                    void entry.commitController.commitOnce();
                }
            });
        };

        window.addEventListener('pagehide', flushPendingCommits);
        window.addEventListener('beforeunload', flushPendingCommits);

        return () => {
            window.removeEventListener('pagehide', flushPendingCommits);
            window.removeEventListener('beforeunload', flushPendingCommits);
            flushPendingCommits();
        };
    }, []);

    const fetchNotifications = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            setIsLoading(true);
            const data = await notificacionesService.getMyNotifications();
            setNotifications(applyPendingOverlay(data));
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, [applyPendingOverlay, isAuthenticated]);

    const markAsRead = async (uuid: string) => {
        try {
            await notificacionesService.markAsRead(uuid);
            setNotifications((prev) =>
                prev.map((n) => (n.uuid === uuid ? { ...n, leido: true } : n))
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async (extraUnreadUuids?: string[] | unknown) => {
        const extra = Array.isArray(extraUnreadUuids)
            ? extraUnreadUuids.filter((u): u is string => typeof u === 'string')
            : [];
        const localUnread = notificationsRef.current
            .filter((n) => !n.leido)
            .map((n) => n.uuid);
        const targetUuids = Array.from(new Set([...localUnread, ...extra]));

        if (targetUuids.length === 0) return;

        const targetSet = new Set(targetUuids);
        targetUuids.forEach((uuid) => pendingReadUuidsRef.current.add(uuid));

        // Actualización optimista inmediata
        setNotifications((prev) =>
            prev.map((n) => (targetSet.has(n.uuid) ? { ...n, leido: true } : n))
        );

        const revertLocalRead = () => {
            targetUuids.forEach((uuid) => pendingReadUuidsRef.current.delete(uuid));
            setNotifications((prev) =>
                prev.map((n) => (targetSet.has(n.uuid) ? { ...n, leido: false } : n))
            );
            setPendingOverlayVersion((v) => v + 1);
        };

        showToast({
            title: 'Notificaciones marcadas como leídas',
            body:
                targetUuids.length === 1
                    ? 'Se marcó 1 notificación como leída.'
                    : `Se marcaron ${targetUuids.length} notificaciones como leídas.`,
            type: 'info',
            dedupeKey: 'notifications-mark-all-read',
            silent: true,
            onUndo: () => {
                revertLocalRead();
            },
            onCommit: async () => {
                try {
                    await notificacionesService.markAllAsRead();
                    targetUuids.forEach((uuid) => pendingReadUuidsRef.current.delete(uuid));
                } catch (error) {
                    console.error('Error marking all notifications as read:', error);
                    revertLocalRead();
                    showToast({
                        title: 'Error al marcar leídas',
                        body: 'No se pudo sincronizar el estado con el servidor. Se restauraron tus notificaciones.',
                        type: 'error',
                    });
                }
            },
        });
    };

    const deleteNotification = async (uuid: string, snapshot?: Notification) => {
        const currentList = notificationsRef.current;
        const originalIndex = currentList.findIndex((n) => n.uuid === uuid);
        const deletedItem = snapshot ?? (originalIndex !== -1 ? currentList[originalIndex] : undefined);

        pendingDeletedUuidsRef.current.add(uuid);
        setNotifications((prev) => prev.filter((n) => n.uuid !== uuid));

        const restoreDeleted = () => {
            pendingDeletedUuidsRef.current.delete(uuid);
            if (deletedItem) {
                setNotifications((prev) =>
                    restoreItemAtIndex(
                        prev,
                        deletedItem,
                        originalIndex !== -1 ? originalIndex : 0,
                        (item) => item.uuid
                    )
                );
            }
            setPendingOverlayVersion((v) => v + 1);
        };

        const label = deletedItem ? stripHtmlToText(deletedItem.titulo) : 'la notificación';

        showToast({
            title: 'Notificación eliminada',
            body: `Se quitó "${label}" de tu bandeja.`,
            type: 'info',
            silent: true,
            onUndo: () => {
                restoreDeleted();
            },
            onCommit: async () => {
                try {
                    await notificacionesService.deleteNotification(uuid);
                    pendingDeletedUuidsRef.current.delete(uuid);
                } catch (error) {
                    console.error('Error deleting notification:', error);
                    restoreDeleted();
                    showToast({
                        title: 'Error al eliminar',
                        body: 'No se pudo eliminar la notificación en el servidor. Se restauró en tu bandeja.',
                        type: 'error',
                    });
                }
            },
        });
    };

    const clearReadNotifications = async (readSnapshots?: Notification[]) => {
        const itemsToClear =
            readSnapshots && readSnapshots.length > 0
                ? readSnapshots
                : notificationsRef.current.filter((n) => n.leido);

        if (itemsToClear.length === 0) return;

        const targetUuids = itemsToClear.map((n) => n.uuid);
        const targetSet = new Set(targetUuids);
        targetUuids.forEach((uuid) => pendingDeletedUuidsRef.current.add(uuid));

        setNotifications((prev) => prev.filter((n) => !targetSet.has(n.uuid)));

        const restoreCleared = () => {
            targetUuids.forEach((uuid) => pendingDeletedUuidsRef.current.delete(uuid));
            setNotifications((prev) =>
                restoreItemsPreservingOrder(
                    prev,
                    itemsToClear,
                    (item) => item.uuid,
                    (a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()
                )
            );
            setPendingOverlayVersion((v) => v + 1);
        };

        showToast({
            title: 'Historial limpio',
            body:
                itemsToClear.length === 1
                    ? 'Se eliminó 1 notificación leída.'
                    : `Se eliminaron ${itemsToClear.length} notificaciones leídas.`,
            type: 'info',
            dedupeKey: 'notifications-clear-read',
            silent: true,
            onUndo: () => {
                restoreCleared();
            },
            onCommit: async () => {
                try {
                    await notificacionesService.clearReadNotifications();
                    targetUuids.forEach((uuid) => pendingDeletedUuidsRef.current.delete(uuid));
                } catch (error) {
                    console.error('Error clearing read notifications:', error);
                    restoreCleared();
                    showToast({
                        title: 'Error al limpiar historial',
                        body: 'No se pudieron eliminar las notificaciones leídas. Se restauró el historial.',
                        type: 'error',
                    });
                }
            },
        });
    };

    // Manejo de la conexión SignalR (Singleton)
    useEffect(() => {
        if (!isAuthenticated) {
            if (connection) {
                connection.stop();
                setConnection(null);
            }
            setNotifications([]);
            setIsConnected(false);
            return;
        }

        requestNotificationPermission();
        fetchNotifications();

        const apiRoot = getApiRootUrl();

        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${apiRoot}/hubs/notifications`, {
                withCredentials: true,
            })
            .withAutomaticReconnect()
            .build();

        let isSubscribed = true;

        newConnection
            .start()
            .then(() => {
                if (!isSubscribed) {
                    newConnection.stop();
                    return;
                }
                if (import.meta.env.DEV) console.log('Global Notification Connection established');
                setIsConnected(true);
                newConnection.on('ReceiveNotification', (payload?: SignalRNotificationPayload) => {
                    fetchNotifications();

                    window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
                    window.dispatchEvent(new CustomEvent('dosier-emails-changed'));

                    if (payload && payload.title && payload.body) {
                        let type: ToastType = 'default';
                        if (payload.categoria === 'SUCCESS') type = 'success';
                        else if (payload.categoria === 'ERROR') type = 'error';
                        else if (payload.categoria === 'WARNING') type = 'warning';
                        else if (payload.categoria === 'INFO') type = 'info';

                        addToast(payload.title, payload.body, type, payload.url || undefined);
                    }
                });

                newConnection.on('EmailQueueUpdated', (payload?: unknown) => {
                    window.dispatchEvent(
                        new CustomEvent('dosier-emails-changed', { detail: payload })
                    );
                });
            })
            .catch((err) => {
                setIsConnected(false);
                if (isSubscribed) {
                    console.error('SignalR Connection Error: ', err);
                }
            });

        newConnection.onclose(() => {
            setIsConnected(false);
        });

        newConnection.onreconnecting(() => {
            setIsConnected(false);
        });

        newConnection.onreconnected(() => {
            setIsConnected(true);
        });

        setConnection(newConnection);

        return () => {
            isSubscribed = false;
            newConnection.stop();
            setIsConnected(false);
        };
    }, [isAuthenticated]);

    const unreadCount = notifications.filter((n) => !n.leido).length;

    // Sincronizar contador de no leídos en el título de la pestaña (Tab Title Badge)
    useEffect(() => {
        const updateTitle = () => {
            let currentTitle = document.title;
            currentTitle = currentTitle.replace(/^\(\d+\+?\)\s*/, '');
            if (unreadCount > 0) {
                document.title = `(${unreadCount}) ${currentTitle}`;
            } else {
                document.title = currentTitle;
            }
        };

        updateTitle();

        const titleElement = document.querySelector('title');
        if (!titleElement) return;

        const observer = new MutationObserver(() => {
            observer.disconnect();
            updateTitle();
            observer.observe(titleElement, { childList: true });
        });

        observer.observe(titleElement, { childList: true });

        return () => {
            observer.disconnect();
        };
    }, [unreadCount]);

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                clearReadNotifications,
                applyPendingOverlay,
                pendingOverlayVersion,
                isLoading,
                isConnected,
                addToast,
                showToast,
                dismissToast,
                dismissAllToasts,
            }}
        >
            {children}

            <ToastContainer
                entries={toastEntries}
                onDismiss={removeToastEntry}
                navigate={navigate}
            />
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};

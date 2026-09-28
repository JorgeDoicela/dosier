import React from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { ExternalLink, Info, AlertTriangle, Mail, Bell } from 'lucide-react';
import { stripHtmlToText } from '../../../../utils/notificationText';
import type { NotificationItem } from '../types';

interface NotificationPanelProps {
    isNotificationsOpen: boolean;
    setIsNotificationsOpen: (v: boolean) => void;
    notifPanelPos: { bottom: number; left: number; width: number };
    unreadCount: number;
    notifications: NotificationItem[];
    markAllAsRead: () => Promise<void>;
    handleNotificationClick: (n: NotificationItem) => Promise<void>;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
    isNotificationsOpen,
    setIsNotificationsOpen,
    notifPanelPos,
    unreadCount,
    notifications,
    markAllAsRead,
    handleNotificationClick
}) => {
    if (!isNotificationsOpen) return null;

    const getNotificationIcon = (category: string) => {
        switch (category) {
            case 'INVESTIGACION': return <ExternalLink size={12} className="text-info" />;
            case 'SISTEMA': return <Info size={12} className="text-text-dim" />;
            case 'URGENTE': return <AlertTriangle size={12} className="text-error" />;
            default: return <Mail size={12} className="text-text-dim" />;
        }
    };

    return createPortal(
        <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsNotificationsOpen(false)} />
            <div
                className="fixed z-[100] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in duration-150"
                style={{
                    bottom: notifPanelPos.bottom,
                    left: notifPanelPos.left,
                    width: notifPanelPos.width
                }}
            >
                <header className="p-3 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <h4 className="text-[10px] font-mono font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest">Notificaciones</h4>
                        {unreadCount > 0 && (
                            <span className="text-[#0070f3] dark:text-blue-400 text-[9px] font-mono font-bold tracking-tight">
                                ({unreadCount} nuevas)
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-[9.5px] font-mono font-semibold text-[#0070f3] hover:underline uppercase tracking-wider bg-transparent border-0 cursor-pointer"
                        >
                            Marcar todo leído
                        </button>
                    )}
                </header>

                <div className="max-h-[380px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <Bell size={20} className="mx-auto text-slate-400 dark:text-zinc-600 opacity-40" />
                            <p className="text-[9.5px] font-mono text-slate-400 dark:text-zinc-500 uppercase font-semibold tracking-widest">Todo en orden</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.uuid}
                                className={`p-3 border-b border-slate-100 dark:border-zinc-800 last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group ${!n.leido ? 'bg-blue-50/40 dark:bg-zinc-900/60' : 'opacity-75'}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div className="flex gap-2.5">
                                    <div className="mt-0.5 shrink-0">
                                        {getNotificationIcon(n.categoria)}
                                    </div>
                                    <div className="space-y-0.5 flex-1 min-w-0 overflow-hidden">
                                        <div className="flex justify-between items-start gap-1">
                                            <h5 className="text-[11.5px] font-semibold text-slate-800 dark:text-zinc-200 leading-tight truncate">{stripHtmlToText(n.titulo)}</h5>
                                            <span className="text-[8.5px] font-mono text-slate-400 dark:text-zinc-500 shrink-0">{new Date(n.fecha_envio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 leading-relaxed line-clamp-2 break-words">{stripHtmlToText(n.mensaje)}</p>
                                        {n.url_accion ? (
                                            <span className="inline-flex items-center gap-1 text-[9.5px] font-medium text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer mt-1">
                                                Ver estado actual
                                                <ExternalLink size={9.5} className="opacity-80" />
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-[8.5px] font-mono text-slate-400 dark:text-zinc-500 uppercase mt-1 tracking-wider">
                                                Informativo
                                            </span>
                                        )}
                                    </div>
                                    {!n.leido && (
                                        <div className="w-1.5 h-1.5 bg-[#0070f3] rounded-full mt-1.5 shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <footer className="p-2 border-t border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-center">
                    <Link
                        to="/notificaciones"
                        onClick={() => { setIsNotificationsOpen(false); }}
                        className="text-[9.5px] font-mono font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 uppercase tracking-widest transition-colors bg-transparent border-0 cursor-pointer no-underline inline-block"
                    >
                        Ver todo el historial
                    </Link>
                </footer>
            </div>
        </>,
        document.body
    );
};

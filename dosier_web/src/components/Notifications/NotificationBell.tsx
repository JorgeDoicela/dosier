import { useState } from 'react';
import { Bell, ExternalLink, Mail, Info, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../../api/NotificationsContext';
import { stripHtmlToText } from '../../utils/notificationText';

const NotificationBell = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

    const handleNotificationClick = async (n: any) => {
        if (!n.leido) {
            await markAsRead(n.uuid);
        }
        
        if (n.url_accion) {
            if (n.url_accion.startsWith('http://') || n.url_accion.startsWith('https://')) {
                try {
                    const urlObj = new URL(n.url_accion);
                    if (urlObj.host === window.location.host) {
                        navigate(urlObj.pathname + urlObj.search + urlObj.hash);
                    } else {
                        window.open(n.url_accion, '_blank');
                    }
                } catch {
                    window.location.href = n.url_accion;
                }
            } else {
                navigate(n.url_accion);
            }
            setIsOpen(false);
        }
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'INVESTIGACION': return <ExternalLink size={14} className="text-info" />;
            case 'SISTEMA': return <Info size={14} className="text-text-dim" />;
            case 'URGENTE': return <AlertTriangle size={14} className="text-error" />;
            default: return <Mail size={14} className="text-text-dim" />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-md bg-surface border border-slate-200/90 dark:border-zinc-800 hover:border-slate-300 text-text-dim hover:text-text-main transition-colors relative cursor-pointer"
            >
                <Bell size={17} strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#0070f3] rounded-full border border-white dark:border-zinc-950" />
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150">
                        <header className="p-3.5 border-b border-slate-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-text-main uppercase tracking-wider font-mono">Notificaciones</h4>
                                {unreadCount > 0 && (
                                    <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button 
                                    onClick={markAllAsRead}
                                    className="text-xs font-medium text-[#0070f3] hover:underline cursor-pointer"
                                >
                                    Marcar todo leído
                                </button>
                            )}
                        </header>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-10 text-center space-y-2">
                                    <Bell size={24} className="mx-auto text-text-dim/40" />
                                    <p className="text-xs text-text-dim uppercase font-mono tracking-wider">Todo en orden</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div 
                                        key={n.uuid} 
                                        className={`p-3.5 border-b border-slate-200/90 dark:border-zinc-800 last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer group ${!n.leido ? 'bg-white dark:bg-zinc-950' : 'bg-slate-50/50 dark:bg-zinc-900/50 opacity-70'}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(n.categoria)}
                                            </div>
                                            <div className="space-y-1 flex-1 min-w-0 overflow-hidden">
                                                <div className="flex justify-between items-start gap-1">
                                                    <h5 className="text-xs font-semibold text-text-main leading-tight truncate">{stripHtmlToText(n.titulo)}</h5>
                                                    <span className="text-[10px] font-mono text-text-dim shrink-0">{new Date(n.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                </div>
                                                <p className="text-xs text-text-dim leading-relaxed line-clamp-2 break-words">{stripHtmlToText(n.mensaje)}</p>
                                                {n.url_accion && (
                                                    <span 
                                                        className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0070f3] hover:underline cursor-pointer mt-1"
                                                    >
                                                        Ir al detalle <ExternalLink size={10} />
                                                    </span>
                                                )}
                                            </div>
                                            {!n.leido && (
                                                <div className="w-1.5 h-1.5 bg-[#0070f3] rounded-full mt-1 shrink-0" />
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <footer className="p-3 border-t border-slate-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-center">
                            <Link 
                                to="/notificaciones"
                                onClick={() => { setIsOpen(false); }}
                                className="text-xs font-medium text-text-dim hover:text-text-main transition-colors no-underline inline-block"
                            >
                                Ver todo el historial
                            </Link>
                        </footer>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;

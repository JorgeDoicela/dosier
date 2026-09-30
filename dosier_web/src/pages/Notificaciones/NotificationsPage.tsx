import { useState, useEffect, useMemo, useRef } from 'react';
import {
    Bell, ExternalLink, Mail, Info, AlertTriangle,
    CheckCheck, Search, Inbox, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificacionesService, type NotificationDto } from '../../services/notificacionesService';
import { useNotifications } from '../../api/NotificationsContext';
import { stripHtmlToText } from '../../utils/notificationText';
import { PageHeader } from '../../components/Common/PageHeader';

type NotificationItem = NotificationDto;

const categoryConfig: Record<string, { icon: typeof Info; color: string; bg: string; label: string }> = {
    INVESTIGACION: { icon: ExternalLink, color: 'text-info', bg: 'bg-info/10', label: 'Investigación' },
    SISTEMA: { icon: Info, color: 'text-text-dim', bg: 'bg-text-main/5', label: 'Sistema' },
    URGENTE: { icon: AlertTriangle, color: 'text-error', bg: 'bg-error/10', label: 'Urgente' },
};

const getCategoryConfig = (cat: string) => categoryConfig[cat] || { icon: Mail, color: 'text-text-dim', bg: 'bg-text-main/5', label: cat };

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { notifications, markAsRead, markAllAsRead, fetchNotifications, deleteNotification, clearReadNotifications, addToast } = useNotifications();
    const [allNotifications, setAllNotifications] = useState<NotificationItem[]>([]);
    const [filter, setFilter] = useState<'all' | 'unread' | 'investigacion' | 'sistema' | 'urgente'>('all');
    const [search, setSearch] = useState('');
    const [loadingAll, setLoadingAll] = useState(false);

    const lastFetchRef = useRef<number>(0);

    useEffect(() => {
        document.title = "Centro de Notificaciones | DOSIER";
    }, []);

    useEffect(() => {
        const handleFocus = () => {
            if (Date.now() - lastFetchRef.current > 30000) {
                handleRefresh();
            }
        };
        window.addEventListener('focus', handleFocus);
        return () => {
            window.removeEventListener('focus', handleFocus);
        };
    }, [notifications]);

    useEffect(() => {
        const loadAll = async () => {
            setLoadingAll(true);
            try {
                const data = await notificacionesService.getMyNotifications(0);
                setAllNotifications(data);
                lastFetchRef.current = Date.now();
            } catch {
                setAllNotifications(notifications as unknown as NotificationItem[]);
            } finally {
                setLoadingAll(false);
            }
        };
        loadAll();
    }, [notifications]);

    const handleNotificationClick = async (n: NotificationItem) => {
        if (!n.leido) {
            await markAsRead(n.uuid);
            setAllNotifications(prev => prev.map(x => x.uuid === n.uuid ? { ...x, leido: true } : x));
        }

        if (!n.url_accion) {
            addToast('Notificación consultada', 'El registro se ha marcado como leído en su historial.', 'info', undefined, undefined, undefined, true);
            return;
        }

        let targetPath = n.url_accion;
        let isExternal = false;

        if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
            try {
                const urlObj = new URL(targetPath);
                if (urlObj.host === window.location.host) {
                    targetPath = urlObj.pathname + urlObj.search + urlObj.hash;
                } else {
                    isExternal = true;
                }
            } catch {
                isExternal = true;
            }
        }

        if (isExternal) {
            window.open(targetPath, '_blank');
            return;
        }

        const currentFullPath = window.location.pathname + window.location.search + window.location.hash;
        if (currentFullPath === targetPath) {
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
            addToast('Estado sincronizado', 'Ya se encuentra en la vista correspondiente. Información actualizada al estado más reciente.', 'info', undefined, undefined, undefined, true);
        } else {
            navigate(targetPath);
            addToast('Navegando al proyecto', 'Consultando el estado actual del proyecto en curso.', 'info', undefined, undefined, undefined, true);
        }
    };

    const handleDelete = async (e: React.MouseEvent, n: NotificationItem) => {
        e.stopPropagation();
        e.preventDefault();

        const originalNotifications = [...allNotifications];
        
        // Actualización optimista inmediata
        setAllNotifications(prev => prev.filter(x => x.uuid !== n.uuid));

        try {
            await deleteNotification(n.uuid);
            addToast(
                "Notificación eliminada",
                `Se ha eliminado "${stripHtmlToText(n.titulo)}"`,
                "info",
                undefined,
                undefined,
                undefined,
                true
            );
        } catch (err) {
            console.error("Error al eliminar la notificación:", err);
            setAllNotifications(originalNotifications);
            addToast("Error", "No se pudo eliminar la notificación", "error");
        }
    };

    const handleClearRead = async () => {
        const originalNotifications = [...allNotifications];
        const readNotifications = allNotifications.filter(n => n.leido);
        
        if (readNotifications.length === 0) return;

        // Actualización optimista: remover leídas localmente
        setAllNotifications(prev => prev.filter(n => !n.leido));

        try {
            await clearReadNotifications();
            addToast(
                "Historial limpio",
                `Se han eliminado ${readNotifications.length} notificaciones leídas`,
                "info",
                undefined,
                undefined,
                undefined,
                true
            );
        } catch (err) {
            console.error("Error al limpiar las notificaciones leídas:", err);
            setAllNotifications(originalNotifications);
            addToast("Error", "No se pudieron limpiar las notificaciones", "error");
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setAllNotifications(prev => prev.map(x => ({ ...x, leido: true })));
    };

    const handleRefresh = async () => {
        await fetchNotifications();
        try {
            const data = await notificacionesService.getMyNotifications(0);
            setAllNotifications(data || []);
            lastFetchRef.current = Date.now();
        } catch { /* fallback to context data */ }
    };

    const filtered = useMemo(() => {
        let list = allNotifications;

        if (filter === 'unread') list = list.filter(n => !n.leido);
        else if (filter === 'investigacion') list = list.filter(n => n.categoria === 'INVESTIGACION');
        else if (filter === 'sistema') list = list.filter(n => n.categoria === 'SISTEMA');
        else if (filter === 'urgente') list = list.filter(n => n.categoria === 'URGENTE');

        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(n =>
                stripHtmlToText(n.titulo).toLowerCase().includes(q) ||
                stripHtmlToText(n.mensaje).toLowerCase().includes(q)
            );
        }

        return list;
    }, [allNotifications, filter, search]);

    const unreadCount = allNotifications.filter(n => !n.leido).length;
    const hasReadNotifications = useMemo(() => allNotifications.some(n => n.leido), [allNotifications]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Ahora';
        if (diffMins < 60) return `Hace ${diffMins}m`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;
        return date.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatFullDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-EC', {
            weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const groupedByDate = useMemo(() => {
        const groups: Record<string, NotificationItem[]> = {};
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        filtered.forEach(n => {
            const date = new Date(n.fecha_envio);
            let key: string;

            if (date.toDateString() === today.toDateString()) key = 'Hoy';
            else if (date.toDateString() === yesterday.toDateString()) key = 'Ayer';
            else if (today.getTime() - date.getTime() < 7 * 86400000) key = 'Esta Semana';
            else key = date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });

            if (!groups[key]) groups[key] = [];
            groups[key].push(n);
        });

        return groups;
    }, [filtered]);

    const filters = [
        { key: 'all' as const, label: 'Todas' },
        { key: 'unread' as const, label: 'Sin leer', count: unreadCount },
        { key: 'investigacion' as const, label: 'Investigación' },
        { key: 'sistema' as const, label: 'Sistema' },
        { key: 'urgente' as const, label: 'Urgente' },
    ];

    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <PageHeader
                kicker="Centro de Notificaciones"
                icon={Bell}
                title="Historial Completo"
                description="Historial de alertas del sistema, avisos de investigación y mensajes institucionales."
            >
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="btn-vercel-secondary flex items-center gap-2 h-10"
                    >
                        <CheckCheck size={14} />
                        <span>Marcar leídas</span>
                    </button>
                )}
            </PageHeader>

            {/* Two-column Vercel Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-up [animation-delay:50ms]">

                {/* Main Content: Left Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Filtros y Búsqueda */}
                    <div className="bg-surface p-4 mb-6 rounded-lg border border-slate-200/90 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center gap-4 animate-fade-up [animation-delay:100ms]">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                            {filters.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${filter === f.key
                                            ? 'bg-[#0070f3] text-white border border-[#0070f3]'
                                            : 'bg-surface border border-slate-200/90 dark:border-zinc-800 text-text-dim hover:text-text-main'
                                        }`}
                                >
                                    {f.label}
                                    {f.count !== undefined && f.count > 0 && (
                                        <span className="ml-1.5 text-[10px] font-mono">({f.count})</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="relative flex-1 w-full md:w-auto md:min-w-[240px]">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Buscar en notificaciones..."
                                className="input-vercel !pl-8 w-full"
                            />
                        </div>

                        {hasReadNotifications && (
                            <button
                                onClick={handleClearRead}
                                className="btn-vercel-secondary flex items-center gap-2 h-9 text-text-dim hover:text-rose-500 hover:border-rose-300 shrink-0 w-full md:w-auto justify-center cursor-pointer"
                                title="Eliminar todas las notificaciones leídas"
                            >
                                <Trash2 size={13} />
                                <span className="text-xs font-medium">Limpiar leídas</span>
                            </button>
                        )}
                    </div>

                    {/* Contenido */}
                    <div className="animate-fade-up [animation-delay:200ms]">
                        {loadingAll && allNotifications.length === 0 ? (
                            <div className="bg-surface p-16 rounded-lg border border-slate-200/90 dark:border-zinc-800 text-center">
                                <div className="animate-spin w-6 h-6 border-2 border-text-dim border-t-transparent rounded-full mx-auto mb-4" />
                                <p className="text-xs text-text-dim uppercase tracking-wider font-mono">Cargando notificaciones...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="bg-surface p-16 rounded-lg border border-dashed border-slate-200/90 dark:border-zinc-800 text-center">
                                <Inbox size={36} className="mx-auto text-text-dim opacity-30 mb-3" />
                                <p className="text-sm text-text-main font-semibold">
                                    {search || filter !== 'all' ? 'Sin resultados para este filtro' : 'Todo en orden'}
                                </p>
                                <p className="text-xs text-text-dim mt-1">
                                    {search || filter !== 'all' ? 'Intenta con otros términos o cambia el filtro' : 'No hay notificaciones pendientes'}
                                </p>
                            </div>
                        ) : (
                            Object.entries(groupedByDate).map(([groupLabel, items]) => (
                                <div key={groupLabel} className="mb-8">
                                    <div className="flex items-center gap-3 mb-3 px-1">
                                        <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider font-mono">{groupLabel}</h3>
                                        <div className="flex-1 border-t border-slate-200/90 dark:border-zinc-800" />
                                        <span className="text-xs font-mono text-text-dim">{items.length}</span>
                                    </div>

                                    <div className="rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden shadow-2xs">
                                        {items.map(n => {
                                            const config = getCategoryConfig(n.categoria);
                                            const IconComp = config.icon;

                                            return (
                                                <div
                                                    key={n.uuid}
                                                    onClick={() => handleNotificationClick(n)}
                                                    className={`p-4 cursor-pointer group transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-900/60 ${
                                                        !n.leido ? 'bg-blue-50/20 dark:bg-blue-950/10' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3.5">
                                                        {/* Punto indicador de no leído + Icono desnudo */}
                                                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                                                            <span className={`w-2 h-2 rounded-full shrink-0 transition-opacity ${
                                                                !n.leido ? 'bg-[#0070f3]' : 'opacity-0'
                                                            }`} />
                                                            <span className={!n.leido ? 'text-[#0070f3]' : 'text-slate-400 dark:text-zinc-500'}>
                                                                <IconComp size={16} />
                                                            </span>
                                                        </div>

                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex justify-between items-start gap-3">
                                                                <h5 className={`text-xs text-slate-900 dark:text-white leading-tight truncate ${
                                                                    !n.leido ? 'font-semibold' : 'font-medium text-slate-700 dark:text-zinc-300'
                                                                }`}>
                                                                    {stripHtmlToText(n.titulo)}
                                                                </h5>
                                                                <div className="flex items-center gap-2.5 shrink-0">
                                                                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                                                                        {formatDate(n.fecha_envio)}
                                                                    </span>
                                                                    <button
                                                                        onClick={(e) => handleDelete(e, n)}
                                                                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                                                                        title="Eliminar notificación"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed line-clamp-2 break-words">
                                                                {stripHtmlToText(n.mensaje)}
                                                            </p>

                                                            <div className="flex items-center gap-3 pt-0.5">
                                                                <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${
                                                                    n.categoria === 'URGENTE' ? 'text-rose-600 dark:text-rose-400' :
                                                                    n.categoria === 'INVESTIGACION' ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400'
                                                                }`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                                                        n.categoria === 'URGENTE' ? 'bg-rose-500' :
                                                                        n.categoria === 'INVESTIGACION' ? 'bg-[#0070f3]' : 'bg-slate-400 dark:bg-zinc-500'
                                                                    }`} />
                                                                    {config.label}
                                                                </span>

                                                                {n.url_accion && (
                                                                    <span className="text-xs font-medium text-[#0070f3] hover:underline flex items-center gap-1">
                                                                        Ir al detalle <ExternalLink size={11} />
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Right Column */}
                <div className="space-y-6">
                    <NotificationSummaryCard
                        title="Resumen de notificaciones"
                        items={[
                            {
                                label: 'Notificaciones',
                                value: allNotifications.length,
                                displayValue: `${allNotifications.length} registradas`,
                                max: 100,
                                color: '#0070f3'
                            },
                            {
                                label: 'Por Leer',
                                value: unreadCount,
                                displayValue: `${unreadCount} pendientes`,
                                max: allNotifications.length || 1,
                                color: unreadCount > 0 ? '#0070f3' : 'var(--text-dim)'
                            }
                        ]}
                    />
                </div>
            </div>
        </main>
    );
};

const NotificationSummaryCard = ({ title, buttonLabel, onButtonClick, items }: any) => (
    <div className="p-5 flex flex-col bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 shadow-2xs rounded-xl">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">{title}</span>
            {buttonLabel && (
                <button
                    onClick={onButtonClick}
                    className="px-3 py-1 bg-[#0070f3] text-white hover:bg-[#005bb5] rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                    {buttonLabel}
                </button>
            )}
        </div>
        <div className="space-y-1">
            {items.map((item: any, idx: number) => {
                const percentage = item.max ? Math.min(100, Math.round((item.value / item.max) * 100)) : 0;
                const radius = 6.5;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (percentage / 100) * circumference;

                return (
                    <div
                        key={idx}
                        className="flex items-center justify-between py-2 px-3 rounded-md transition-all group"
                        style={{ backgroundColor: idx % 2 === 0 ? 'var(--accents-1)' : 'transparent' }}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-[18px] h-[18px] flex items-center justify-center shrink-0">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 18 18">
                                    <circle
                                        cx="9"
                                        cy="9"
                                        r={radius}
                                        className="fill-none"
                                        strokeWidth="1.8"
                                        style={{ stroke: 'var(--accents-2)' }}
                                    />
                                    <circle
                                        cx="9"
                                        cy="9"
                                        r={radius}
                                        className="fill-none transition-all duration-500"
                                        stroke={item.color || 'var(--brand)'}
                                        strokeWidth="1.8"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={item.max ? strokeDashoffset : 0}
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[13px] font-medium text-text-main truncate">
                                    {item.label}
                                </span>
                            </div>
                        </div>
                        <span className="text-[13px] font-mono font-medium text-text-main shrink-0 ml-2">
                            {item.displayValue || item.value}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
);

export default NotificationsPage;

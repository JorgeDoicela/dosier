import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar as CalendarIcon,
    ArrowRight,
    Clock,
    Tag,
    ChevronRight,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    getEventos,
    type EventoCalendario,
    CATEGORIAS_CONFIG
} from '../../../../services/calendarioService';

export const DocenteAgendaWidget: React.FC = () => {
    const navigate = useNavigate();
    const [eventos, setEventos] = useState<EventoCalendario[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        const cargar = async () => {
            try {
                const hoy = new Date();
                const res = await getEventos(hoy);
                if (isMounted) {
                    setEventos(res || []);
                }
            } catch (err) {
                console.error('[DocenteAgendaWidget] Error al cargar eventos:', err);
                if (isMounted) setEventos([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        cargar();

        const handleRevalidate = () => {
            if (document.visibilityState === 'visible') {
                cargar();
            }
        };

        window.addEventListener('focus', handleRevalidate);
        document.addEventListener('visibilitychange', handleRevalidate);

        return () => {
            isMounted = false;
            window.removeEventListener('focus', handleRevalidate);
            document.removeEventListener('visibilitychange', handleRevalidate);
        };
    }, []);

    // Filtrar y ordenar los próximos eventos desde hoy
    const hoy = startOfDay(new Date());
    const proximos = React.useMemo(() => {
        if (!eventos || eventos.length === 0) return [];

        return eventos
            .filter(ev => {
                if (!ev.fecha_inicio) return false;
                try {
                    const d = parseISO(ev.fecha_inicio);
                    // Incluir eventos de hoy o del futuro próximo
                    return isAfter(d, hoy) || format(d, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd');
                } catch {
                    return false;
                }
            })
            .sort((a, b) => {
                const da = a.fecha_inicio ? parseISO(a.fecha_inicio).getTime() : 0;
                const db = b.fecha_inicio ? parseISO(b.fecha_inicio).getTime() : 0;
                return da - db;
            })
            .slice(0, 5); // Tomar los 5 más próximos
    }, [eventos, hoy]);

    const handleVerCalendario = () => {
        navigate('/calendario');
    };

    const handleItemClick = (ev: EventoCalendario) => {
        if (ev.url_accion) {
            if (ev.url_accion.startsWith('http://') || ev.url_accion.startsWith('https://')) {
                window.open(ev.url_accion, '_blank');
            } else {
                navigate(ev.url_accion);
            }
        } else {
            navigate('/calendario');
        }
    };

    const formatFechaBadge = (fechaStr: string) => {
        try {
            const date = parseISO(fechaStr);
            const esMismoDia = format(date, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd');
            if (esMismoDia) {
                return { dia: 'Hoy', mes: format(date, 'MMM', { locale: es }).toUpperCase(), isToday: true };
            }
            return {
                dia: format(date, 'd'),
                mes: format(date, 'MMM', { locale: es }).toUpperCase(),
                isToday: false
            };
        } catch {
            return { dia: '--', mes: 'CAL', isToday: false };
        }
    };

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
                {/* Cabecera del Widget */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-900">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-[#0070f3]" />
                        <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            Agenda y Calendario Curricular
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={handleVerCalendario}
                        className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:text-[#005bb5] transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                        <span>Ver Calendario</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Contenido: Grid Horizontal o Estado Vacío Compacto */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-2">
                        <div className="h-16 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        <div className="h-16 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        <div className="h-16 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                    </div>
                ) : proximos.length === 0 ? (
                    <div className="py-3 px-4 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                            <CalendarIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                            <span>No se registran fechas límite o eventos normativos en los próximos días.</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleVerCalendario}
                            className="text-xs font-semibold text-[#0070f3] hover:underline cursor-pointer inline-flex items-center gap-1 shrink-0"
                        >
                            <span>Explorar cronograma</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2.5">
                        {proximos.slice(0, 4).map(ev => {
                            const badge = formatFechaBadge(ev.fecha_inicio);
                            const catCfg = CATEGORIAS_CONFIG[ev.categoria_global] || {
                                label: ev.categoria_global || 'Institucional',
                                color: '#0070f3'
                            };

                            return (
                                <div
                                    key={ev.uuid || ev.id_evento_calendario}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleItemClick(ev)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') handleItemClick(ev);
                                    }}
                                    className="p-3 rounded-lg border border-slate-100 dark:border-zinc-900 hover:border-slate-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 hover:bg-slate-50/60 dark:hover:bg-zinc-900/50 transition-all flex items-center justify-between gap-3 cursor-pointer text-left group shadow-2xs"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Badge de Fecha */}
                                        <div
                                            className={`w-11 h-11 shrink-0 rounded-lg flex flex-col items-center justify-center border font-mono ${
                                                badge.isToday
                                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900 text-[#0070f3] dark:text-blue-400'
                                                    : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                                            }`}
                                        >
                                            <span className="text-[10px] font-bold uppercase leading-none">
                                                {badge.mes}
                                            </span>
                                            <span className="text-xs font-bold leading-tight mt-0.5">
                                                {badge.dia}
                                            </span>
                                        </div>

                                        {/* Detalle del Evento */}
                                        <div className="space-y-0.5 min-w-0">
                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className="w-1.5 h-1.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: ev.color_hex || catCfg.color }}
                                                />
                                                <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate">
                                                    {ev.subcategoria || catCfg.label}
                                                </span>
                                            </div>
                                            <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors truncate">
                                                {ev.titulo}
                                            </h4>
                                            {ev.descripcion && (
                                                <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                                                    {ev.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-[#0070f3] group-hover:translate-x-0.5 transition-all shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pie del Widget */}
            <div className="pt-2 border-t border-slate-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                <span>Hitos CACES y Cronograma Académico</span>
                <button
                    type="button"
                    onClick={handleVerCalendario}
                    className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                    <span>Abrir Módulo</span>
                    <ExternalLink className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};

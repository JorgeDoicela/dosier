import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, CheckCircle, RotateCcw, Edit2, Trash2, ArrowRight } from 'lucide-react';
import { PRIORIDAD_COLORS, resolveEventUrl } from '../../../services/calendarioService';
import { useAuth } from '../../../api/AuthContext';
import { KANBAN_COLUMNAS, type CalendarEventExtended, type Evento } from '../types/calendarioTypes';
import './KanbanView.css';

type KanbanScopeFilter = 'personal' | 'carrera' | 'peas' | 'todas';

interface KanbanViewProps {
    filteredEventos: CalendarEventExtended[];
    dragOverColumn: string | null;
    draggingUuid: string | null;
    handleDragOver: (e: React.DragEvent, columnId: string) => void;
    setDragOverColumn: (col: string | null) => void;
    handleDrop: (e: React.DragEvent, columnId: string) => void;
    handleDragStart: (e: React.DragEvent, uuid: string) => void;
    handleGlobalDragEnd: () => void;
    setSelectedEvent: (ev: Evento) => void;
    handleQuickComplete: (ev: Evento) => void;
    handleDevolverAInbox: (uuid: string) => void;
    handleEditEventClick: (ev: Evento) => void;
    handleDeleteEvent: (uuid: string) => void;
    handleGoToEventAction: (ev: Evento) => void;
    hasCarreras?: boolean;
}

const isPersonalEvent = (r: Evento): boolean =>
    r.categoria_global === 'Personal' && r.es_privado;

const isPeaEvent = (r: Evento): boolean =>
    r.tipo_entidad_origen === 'PEA';

const isCarreraEvent = (r: Evento): boolean =>
    !r.es_privado && !isPeaEvent(r) && (r.categoria_global === 'Carrera' || Boolean(r.id_carrera));

export const KanbanView: React.FC<KanbanViewProps> = ({
    filteredEventos,
    dragOverColumn,
    draggingUuid,
    handleDragOver,
    setDragOverColumn,
    handleDrop,
    handleDragStart,
    handleGlobalDragEnd,
    setSelectedEvent,
    handleQuickComplete,
    handleDevolverAInbox,
    handleEditEventClick,
    handleDeleteEvent,
    handleGoToEventAction,
    hasCarreras = false,
}) => {
    const { isAdmin } = useAuth();
    const [scopeFilter, setScopeFilter] = useState<KanbanScopeFilter>('personal');

    const { personalEvents, carreraEvents, peaEvents } = useMemo(() => {
        const personal: CalendarEventExtended[] = [];
        const carrera: CalendarEventExtended[] = [];
        const peas: CalendarEventExtended[] = [];
        for (const ev of filteredEventos) {
            if (isPersonalEvent(ev.resource)) {
                personal.push(ev);
            } else if (isPeaEvent(ev.resource)) {
                peas.push(ev);
            } else if (isCarreraEvent(ev.resource)) {
                carrera.push(ev);
            }
        }
        return { personalEvents: personal, carreraEvents: carrera, peaEvents: peas };
    }, [filteredEventos]);

    const showScopeFilter = hasCarreras || carreraEvents.length > 0 || peaEvents.length > 0;
    const activeScope: KanbanScopeFilter = showScopeFilter ? scopeFilter : 'personal';

    const scopedEvents = useMemo(() => {
        if (activeScope === 'personal') return personalEvents;
        if (activeScope === 'carrera') return carreraEvents;
        if (activeScope === 'peas') return peaEvents;
        return [...personalEvents, ...carreraEvents, ...peaEvents];
    }, [activeScope, personalEvents, carreraEvents, peaEvents]);

    const scopeOptions: { id: KanbanScopeFilter; label: string; count: number }[] = [
        { id: 'personal', label: 'Mis tareas', count: personalEvents.length },
        { id: 'carrera', label: 'De la carrera', count: carreraEvents.length },
        ...(peaEvents.length > 0 ? [{ id: 'peas' as const, label: 'PEAs', count: peaEvents.length }] : []),
        { id: 'todas', label: 'Todas', count: personalEvents.length + carreraEvents.length + peaEvents.length },
    ];

    return (
        <div className="flex flex-col flex-1 min-h-0 pt-4 gap-3.5">
            {showScopeFilter && (
                <div className="flex flex-wrap items-center gap-2 px-0.5 shrink-0">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 mr-1">
                        Alcance:
                    </span>
                    {scopeOptions.map((opt) => (
                        <button
                            key={opt.id}
                            type="button"
                            onClick={() => setScopeFilter(opt.id)}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                                activeScope === opt.id
                                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                            }`}
                        >
                            <span>{opt.label}</span>
                            <span className="font-mono text-[11px] opacity-75">{opt.count}</span>
                        </button>
                    ))}
                </div>
            )}

            <div className="kanban-board-container">
                {KANBAN_COLUMNAS.map(col => {
                    const colEvents = scopedEvents.filter(ev => {
                        const estado = ev.resource.estado;
                        if (col.id === 'EnProgreso') {
                            return estado === 'EnProgreso' || estado === 'En Ejecución';
                        }
                        if (col.id === 'Pendiente') {
                            return estado === 'Pendiente' || !estado;
                        }
                        return estado === col.id;
                    });

                    return (
                        <div
                            key={col.id}
                            className={`kanban-column ${dragOverColumn === col.id ? 'drag-over' : ''}`}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            <div className="kanban-column-header">
                                <div className="kanban-column-title-wrapper">
                                    <span className="kanban-column-title">{col.label}</span>
                                    <span className="kanban-column-count">{colEvents.length}</span>
                                </div>
                            </div>
                            <div className="kanban-cards-container">
                                {colEvents.length === 0 ? (
                                    <div className="kanban-empty-state">
                                        {activeScope === 'carrera'
                                            ? 'Sin actividades grupales en este estado'
                                            : 'Arrastra tareas aquí o crea un evento'}
                                    </div>
                                ) : (
                                    colEvents.map(ev => {
                                        const r = ev.resource;
                                        const isCompleted = r.estado === 'Completado';
                                        const isPersonal = isPersonalEvent(r);
                                        const isPea = isPeaEvent(r);
                                        const isCarrera = isCarreraEvent(r);
                                        const canManage = isPersonal || (isCarrera && Boolean(r.puede_gestionar));
                                        const hasAction = !isPersonal && !isCarrera && !!resolveEventUrl(r, isAdmin);
                                        const hasDate = Boolean(r.fecha_inicio && ev.start && (ev.start as Date).getTime() > 0);
                                        const formattedDate = hasDate
                                            ? (r.fecha_fin && r.fecha_fin !== r.fecha_inicio
                                                ? `${format(ev.start as Date, 'd MMM', { locale: es })} - ${format(ev.end as Date, 'd MMM', { locale: es })}`
                                                : format(ev.start as Date, 'd MMM', { locale: es }))
                                            : 'Sin fecha';

                                        return (
                                            <div
                                                key={r.uuid}
                                                draggable={canManage}
                                                onDragStart={(e) => {
                                                    if (!canManage) {
                                                        e.preventDefault();
                                                        return;
                                                    }
                                                    handleDragStart(e, r.uuid);
                                                }}
                                                onDragEnd={handleGlobalDragEnd}
                                                className={`kanban-card ${draggingUuid === r.uuid ? 'dragging' : ''} ${!canManage ? 'cursor-pointer' : ''}`}
                                                style={{ '--card-color': r.color_hex || '#6B7280' } as React.CSSProperties}
                                                onClick={() => setSelectedEvent(r)}
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300 truncate">
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                                    isPea ? 'bg-violet-500' : isCarrera ? 'bg-[#0070f3]' : 'bg-amber-500'
                                                                }`}
                                                            />
                                                            <span className="truncate">
                                                                {isPea
                                                                    ? `PEA · ${r.nombre_carrera || 'Curricular'}`
                                                                    : isCarrera
                                                                        ? (r.nombre_carrera || 'Toda la carrera')
                                                                        : 'Personal'}
                                                            </span>
                                                        </span>
                                                        {r.prioridad && (
                                                            <span
                                                                className="kanban-badge prioridad shrink-0"
                                                                style={{
                                                                    '--prio-bg': PRIORIDAD_COLORS[r.prioridad]?.bg || 'var(--border)',
                                                                    '--prio-text': PRIORIDAD_COLORS[r.prioridad]?.text || 'var(--text-dim)',
                                                                } as React.CSSProperties}
                                                            >
                                                                {r.prioridad}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h4 className={`kanban-card-title ${isCompleted ? 'completado' : ''}`}>
                                                        {r.titulo}
                                                    </h4>
                                                    {r.descripcion && (
                                                        <p className="kanban-card-desc">{r.descripcion}</p>
                                                    )}
                                                </div>
                                                <div className="kanban-card-footer">
                                                    <span className={`kanban-card-date ${!hasDate ? 'kanban-card-sin-fecha' : ''}`}>
                                                        <CalendarIcon size={10} />
                                                        {formattedDate}
                                                    </span>
                                                    <div className="kanban-card-actions" onClick={(e) => e.stopPropagation()}>
                                                        {canManage && !isCompleted && (
                                                            <button
                                                                type="button"
                                                                className="kanban-action-btn complete"
                                                                onClick={() => handleQuickComplete(r)}
                                                                title="Marcar como Completado"
                                                            >
                                                                <CheckCircle size={12} />
                                                            </button>
                                                        )}
                                                        {isPersonal && (
                                                            <button
                                                                type="button"
                                                                className="kanban-action-btn"
                                                                onClick={() => handleDevolverAInbox(r.uuid)}
                                                                title="Devolver a la bandeja Inbox"
                                                            >
                                                                <RotateCcw size={12} />
                                                            </button>
                                                        )}
                                                        {canManage && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="kanban-action-btn"
                                                                    onClick={() => handleEditEventClick(r)}
                                                                    title="Editar"
                                                                >
                                                                    <Edit2 size={12} />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="kanban-action-btn delete"
                                                                    onClick={() => handleDeleteEvent(r.uuid)}
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </>
                                                        )}
                                                        {!canManage && isPea && (
                                                            <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                                                                Flujo PEA
                                                            </span>
                                                        )}
                                                        {(r.url_accion || hasAction) && (
                                                            <button
                                                                type="button"
                                                                className="kanban-action-btn"
                                                                onClick={() => handleGoToEventAction(r)}
                                                                title="Ir al Contexto de Trabajo"
                                                            >
                                                                <ArrowRight size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

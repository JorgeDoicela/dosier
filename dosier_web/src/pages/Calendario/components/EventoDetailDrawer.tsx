import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { ESTADO_LABELS, getContextDescription, resolveEventUrl } from '../../../services/calendarioService';
import { useAuth } from '../../../api/AuthContext';
import type { Evento } from '../types/calendarioTypes';
import './EventoDrawers.css';

interface EventoDetailDrawerProps {
    selectedEvent: Evento | null;
    onClose: () => void;
    handleQuickComplete: (ev: Evento) => void;
    handleEditEventClick: (ev: Evento) => void;
    handleDeleteEvent: (uuid: string) => void;
    handleGoToEventAction: (ev: Evento) => void;
    handleDevolverAInbox?: (uuid: string) => void;
}

export const EventoDetailDrawer: React.FC<EventoDetailDrawerProps> = ({
    selectedEvent,
    onClose,
    handleQuickComplete,
    handleEditEventClick,
    handleDeleteEvent,
    handleGoToEventAction,
    handleDevolverAInbox,
}) => {
    const { isAdmin, isVicerrector, isCoordAcad, user } = useAuth();
    if (!selectedEvent) return null;

    const hasAction = !!resolveEventUrl(selectedEvent, isAdmin);
    const isNormativo = selectedEvent.tipo_entidad_origen === 'CALENDARIO_NORMATIVO';
    const isAutoridadSuperior = isAdmin || isVicerrector || isCoordAcad;
    const isOwner = Boolean(user?.id_usuario && selectedEvent.creado_por === user.id_usuario);
    const canManage = isNormativo && (selectedEvent.puede_gestionar ?? (isOwner || isAutoridadSuperior));
    const isPersonalPrivado = selectedEvent.es_privado && selectedEvent.categoria_global === 'Personal';
    const isCarreraEvent = !selectedEvent.es_privado && (selectedEvent.categoria_global === 'Carrera' || Boolean(selectedEvent.id_carrera));
    const canQuickComplete = canManage && (isPersonalPrivado || isCarreraEvent) && selectedEvent.estado !== 'Completado';
    const canReturnToInbox = Boolean(handleDevolverAInbox && isPersonalPrivado && isOwner && selectedEvent.estado !== 'Inbox');

    const alcanceMeta = selectedEvent.es_privado
        ? { label: 'Personal', dotClass: 'bg-amber-500' }
        : isCarreraEvent
            ? { label: 'Toda la carrera', dotClass: 'bg-[#0070f3]' }
            : isNormativo
                ? { label: 'Todo el instituto', dotClass: 'bg-emerald-600' }
                : { label: selectedEvent.categoria_global, dotClass: 'bg-slate-500' };

    const prioridadDotClass =
        selectedEvent.prioridad === 'Alta'
            ? 'bg-rose-500'
            : selectedEvent.prioridad === 'Baja'
                ? 'bg-emerald-500'
                : 'bg-amber-500';

    const estadoDotClass =
        selectedEvent.estado === 'Completado'
            ? 'bg-emerald-500'
            : selectedEvent.estado === 'EnProgreso' || selectedEvent.estado === 'En Ejecución'
                ? 'bg-[#0070f3]'
                : selectedEvent.estado === 'Cancelado'
                    ? 'bg-slate-400'
                    : 'bg-amber-500';

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="absolute inset-0 cursor-pointer"
                onClick={onClose}
            />

            <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-zinc-100">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${alcanceMeta.dotClass}`} />
                            <span>{alcanceMeta.label}</span>
                        </span>
                        {selectedEvent.subcategoria && selectedEvent.subcategoria !== selectedEvent.categoria_global && (
                            <>
                                <span aria-hidden="true" className="text-slate-400">·</span>
                                <span>{selectedEvent.subcategoria}</span>
                            </>
                        )}
                        {selectedEvent.recurrencia_anual && (
                            <>
                                <span aria-hidden="true" className="text-slate-400">·</span>
                                <span className="text-[#0070f3] dark:text-blue-400 font-medium">Repetición anual</span>
                            </>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Cerrar detalle"
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white dark:bg-zinc-950">
                    <div className="space-y-2">
                        <h2 className={`text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-tight font-sans ${selectedEvent.estado === 'Completado' ? 'line-through opacity-60' : ''}`}>
                            {selectedEvent.titulo}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                            {selectedEvent.descripcion || 'Sin descripción detallada.'}
                        </p>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                            <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Fecha de inicio
                            </dt>
                            <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                                {selectedEvent.fecha_inicio}
                            </dd>
                        </div>

                        {selectedEvent.fecha_fin && selectedEvent.fecha_fin !== selectedEvent.fecha_inicio ? (
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                                <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    Fecha de finalización
                                </dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100 font-mono">
                                    {selectedEvent.fecha_fin}
                                </dd>
                            </div>
                        ) : (
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                                <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    Duración
                                </dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                    Todo el día
                                </dd>
                            </div>
                        )}

                        <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                            <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Prioridad
                            </dt>
                            <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                <span className={`w-1.5 h-1.5 rounded-full ${prioridadDotClass}`} />
                                <span>{selectedEvent.prioridad || 'Media'}</span>
                            </dd>
                        </div>

                        <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1">
                            <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                Estado
                            </dt>
                            <dd className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                <span className={`w-1.5 h-1.5 rounded-full ${estadoDotClass}`} />
                                <span>{ESTADO_LABELS[selectedEvent.estado] ?? selectedEvent.estado}</span>
                            </dd>
                        </div>

                        {(selectedEvent.nombre_carrera || selectedEvent.nombre_docente) && (
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {selectedEvent.nombre_carrera && (
                                    <div>
                                        <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                            Carrera
                                        </dt>
                                        <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                                            {selectedEvent.nombre_carrera}
                                        </dd>
                                    </div>
                                )}
                                {selectedEvent.nombre_docente && (
                                    <div>
                                        <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                            Docente responsable
                                        </dt>
                                        <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                                            {selectedEvent.nombre_docente}
                                        </dd>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedEvent.alerta_dias != null && (
                            <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sm:col-span-2 space-y-1">
                                <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                    Recordatorio
                                </dt>
                                <dd className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                    {selectedEvent.alerta_dias === 0
                                        ? 'El mismo día del evento'
                                        : `${selectedEvent.alerta_dias} día${selectedEvent.alerta_dias !== 1 ? 's' : ''} antes`}
                                </dd>
                            </div>
                        )}

                        {(() => {
                            const desc = getContextDescription(selectedEvent);
                            if (!desc) return null;
                            return (
                                <div className="p-4 rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 sm:col-span-2 space-y-1">
                                    <dt className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                                        Alcance y origen
                                    </dt>
                                    <dd className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                        {desc}
                                    </dd>
                                </div>
                            );
                        })()}
                    </dl>
                </div>

                <div className="px-8 py-5 border-t border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 flex flex-col gap-2.5">
                    {hasAction && (
                        <button
                            type="button"
                            onClick={() => handleGoToEventAction(selectedEvent)}
                            className="w-full py-2.5 bg-[#0070f3] text-white hover:bg-[#005bb5] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Ir al documento o contexto
                        </button>
                    )}

                    {canManage ? (
                        <div className="flex flex-wrap gap-2.5 w-full">
                            {canQuickComplete && (
                                <button
                                    type="button"
                                    onClick={() => handleQuickComplete(selectedEvent)}
                                    className="flex-1 py-2.5 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                >
                                    Marcar completado
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleEditEventClick(selectedEvent)}
                                className="flex-1 py-2.5 px-3.5 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Editar evento
                            </button>
                            {canReturnToInbox && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleDevolverAInbox?.(selectedEvent.uuid);
                                        onClose();
                                    }}
                                    className="py-2.5 px-3.5 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                                >
                                    Devolver a notas
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => handleDeleteEvent(selectedEvent.uuid)}
                                className="py-2.5 px-3.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Eliminar
                            </button>
                        </div>
                    ) : !hasAction && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-2.5 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                            Cerrar
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

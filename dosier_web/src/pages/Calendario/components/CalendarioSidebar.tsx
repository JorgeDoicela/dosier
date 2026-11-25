import React from 'react';
import {
    Folder, Bell, BarChart3, BookOpen, Calendar as CalendarIcon,
    TrendingUp, Edit2, Trash2, ChevronRight, FileText, RotateCcw
} from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    type EventoCalendario,
} from '../../../services/calendarioService';
import type { Event as BigCalendarEvent } from 'react-big-calendar';
import './CalendarioSidebar.css';

import type { CalendarViewMode } from '../types/calendarioTypes';

export interface CalendarEventExtended extends BigCalendarEvent {
    resource: EventoCalendario;
}

interface CalendarioSidebarProps {
    viewMode?: CalendarViewMode;
    stickyNotes: EventoCalendario[];
    draggingUuid: string | null;
    draggingType?: 'note' | 'kanban' | null;
    draggingCanReturnToInbox?: boolean;
    handleNoteDragStart: (e: React.DragEvent, note: EventoCalendario) => void;
    handleGlobalDragEnd: () => void;
    handleEditEventClick: (note: EventoCalendario) => void;
    handleDeleteStickyNote: (uuid: string) => Promise<void>;
    proximosEventos: CalendarEventExtended[];
    setSelectedEvent: (ev: EventoCalendario) => void;
    handleDevolverAInbox?: (uuid: string) => void;
    onDropEventToInbox?: (uuid: string) => void;
}

export const CalendarioSidebar: React.FC<CalendarioSidebarProps> = ({
    viewMode = 'calendar',
    stickyNotes,
    draggingUuid,
    draggingType,
    draggingCanReturnToInbox = true,
    handleNoteDragStart,
    handleGlobalDragEnd,
    handleEditEventClick,
    handleDeleteStickyNote,
    proximosEventos,
    setSelectedEvent,
    handleDevolverAInbox,
    onDropEventToInbox,
}) => {
    const hoy = startOfDay(new Date());
    const [isOverInboxDropZone, setIsOverInboxDropZone] = React.useState(false);

    return (
        <aside className="calendario-sidebar" aria-label="Panel lateral de calendario">
            {/* Próximos Eventos: Siempre visible en las 3 vistas para seguimiento inmediato */}
            <div className="sidebar-section proximos-section">
                <h3>Próximos Eventos</h3>
                {proximosEventos.length === 0 ? (
                    <p className="proximos-empty">Sin eventos próximos</p>
                ) : (
                    <div className="proximos-lista">
                        {proximosEventos.map(ev => {
                            const r = ev.resource;
                            const esMismo = format(ev.start as Date, 'yyyy-MM-dd') === format(hoy, 'yyyy-MM-dd');
                            return (
                                <button
                                    key={r.uuid}
                                    className="proximo-item"
                                    style={{ '--ev-color': r.color_hex || '#6B7280' } as React.CSSProperties}
                                    onClick={() => setSelectedEvent(r)}
                                >
                                    <span className="proximo-dot" />
                                    <div className="proximo-info">
                                        <span className="proximo-titulo">{r.titulo}</span>
                                        <span className="proximo-fecha">
                                            {esMismo ? 'Hoy' : format(ev.start as Date, 'd MMM', { locale: es })}
                                        </span>
                                    </div>
                                    <ChevronRight size={12} className="proximo-arrow" />
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Notas Rápidas: Con soporte de drop para devolver desde Kanban o Calendario (Oculto en vista Inbox) */}
            {viewMode !== 'inbox' && (
                <div
                    className={`sidebar-section sticky-notes-section ${isOverInboxDropZone ? 'drop-target-active' : ''}`}
                    onDragOver={(e) => {
                        if (!draggingCanReturnToInbox) return;
                        const hasType = draggingType === 'kanban' ||
                            Array.from(e.dataTransfer.types || []).includes('dosier/kanban-event') ||
                            Array.from(e.dataTransfer.types || []).includes('text/plain');
                        if (hasType) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (!isOverInboxDropZone) setIsOverInboxDropZone(true);
                        }
                    }}
                    onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setIsOverInboxDropZone(false);
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsOverInboxDropZone(false);
                        const uuid = e.dataTransfer.getData('dosier/kanban-event') || e.dataTransfer.getData('text/plain') || draggingUuid;
                        handleGlobalDragEnd();
                        const returnFn = onDropEventToInbox || handleDevolverAInbox;
                        if (uuid && returnFn) {
                            returnFn(uuid);
                        }
                    }}
                >
                    <h3>Notas Rápidas</h3>
                    <p className="ical-help-text mb-3">
                        Arrastra las notas al <strong>Calendario</strong> o <strong>Kanban</strong> para planificarlas.
                    </p>

                    {isOverInboxDropZone && (
                        <div className="sticky-notes-drop-overlay">
                            <RotateCcw size={20} className="text-[#0070f3]" />
                            <span className="drop-overlay-title">Soltar para devolver</span>
                        </div>
                    )}

                    <div className="sticky-notes-grid">
                        {stickyNotes.length === 0 ? (
                            <p className="proximos-empty">Bandeja vacía</p>
                        ) : (
                            stickyNotes.map(note => {
                                const contextoChip = (() => {
                                    const url = note.url_accion || '';
                                    if (url.startsWith('/documentacion/mis-proyectos') || url.startsWith('/curriculum')) return { label: 'Curricular / PEA', icon: BookOpen };
                                    if (url.startsWith('/documentacion/revision-tecnica') || url.startsWith('/coordinacion')) return { label: 'Revisión Técnica', icon: Folder };
                                    if (url.startsWith('/documentacion') || url.startsWith('/vicerrectoria')) return { label: 'Gestión Curricular', icon: BarChart3 };
                                    if (url.startsWith('/calendario') || url.startsWith('/agenda')) return { label: 'Agenda', icon: CalendarIcon };
                                    if (url.startsWith('/admin')) return { label: 'Directiva / Admin', icon: Folder };
                                    return null;
                                })();

                                return (
                                    <div
                                        key={note.uuid}
                                        draggable
                                        onDragStart={(e) => handleNoteDragStart(e, note)}
                                        onDragEnd={handleGlobalDragEnd}
                                        className={`sticky-note-card ${draggingUuid === note.uuid ? 'dragging' : ''}`}
                                        style={{ '--note-color': note.color_hex || '#F59E0B' } as React.CSSProperties}
                                    >
                                        <div className="sticky-note-content">
                                            <p className="sticky-note-text">{note.titulo}</p>
                                            {note.nota_detalle && (
                                                <p className="sticky-note-detalle">{note.nota_detalle}</p>
                                            )}
                                            {contextoChip && (
                                                <div className="sticky-note-ctx-chip">
                                                    <contextoChip.icon size={10} className="opacity-70" />
                                                    <span>{contextoChip.label}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="sticky-note-actions" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                type="button"
                                                className="sticky-note-action-btn"
                                                onClick={() => handleEditEventClick(note)}
                                                title="Editar nota"
                                            >
                                                <Edit2 size={11} />
                                            </button>
                                            <button
                                                type="button"
                                                className="sticky-note-action-btn delete"
                                                onClick={() => handleDeleteStickyNote(note.uuid)}
                                                title="Eliminar nota"
                                            >
                                                <Trash2 size={11} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

        </aside>
    );
};

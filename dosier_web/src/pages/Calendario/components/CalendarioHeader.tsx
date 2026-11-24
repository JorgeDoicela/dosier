import React, { useState, useRef, useEffect } from 'react';
import type { View } from 'react-big-calendar';
import { Calendar as CalendarIcon, Layers, FileText, Plus, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import type { CalendarViewMode } from '../types/calendarioTypes';
import type { CalendarioCarrera } from '../../../services/calendarioService';
import type { EventoAlcance } from '../hooks/useCalendarioEvents';

interface CalendarioHeaderProps {
    viewMode: CalendarViewMode;
    setViewMode: (mode: CalendarViewMode) => void;
    view: View;
    setView: (view: View) => void;
    handleNavigateClick: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    getLabelFecha: () => string;
    handleNewEventClick: (alcance?: EventoAlcance) => void;
    carrerasUsuario?: CalendarioCarrera[];
    selectedCarreraId?: number | null;
    setSelectedCarreraId?: (id: number | null) => void;
    canPublishInstituto?: boolean;
}

export const CalendarioHeader: React.FC<CalendarioHeaderProps> = ({
    viewMode,
    setViewMode,
    view,
    setView,
    handleNavigateClick,
    getLabelFecha,
    handleNewEventClick,
    carrerasUsuario = [],
    selectedCarreraId = null,
    setSelectedCarreraId,
    canPublishInstituto = false,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const onOutsideClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', onOutsideClick);
        return () => document.removeEventListener('mousedown', onOutsideClick);
    }, [isMenuOpen]);
    return (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800">
            {/* Pestañas Principales de Modo de Vista */}
            <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Modo de vista">
                <button
                    type="button"
                    className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                        viewMode === 'calendar'
                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                    }`}
                    onClick={() => setViewMode('calendar')}
                >
                    <CalendarIcon size={14} />
                    <span>Calendario</span>
                </button>
                <button
                    type="button"
                    className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                        viewMode === 'kanban'
                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                    }`}
                    onClick={() => setViewMode('kanban')}
                >
                    <Layers size={14} />
                    <span>Tablero Kanban</span>
                </button>
                <button
                    type="button"
                    className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                        viewMode === 'inbox'
                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                            : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                    }`}
                    onClick={() => setViewMode('inbox')}
                >
                    <FileText size={14} />
                    <span>Bandeja de Notas</span>
                </button>
            </nav>

            <div className="flex flex-wrap items-center gap-3 pb-2.5 lg:pb-2">
                {viewMode === 'calendar' && (
                    <>
                        {/* Navegador Temporal Plano */}
                        <div className="inline-flex items-center border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 overflow-hidden shadow-2xs">
                            <button
                                onClick={() => handleNavigateClick('PREV')}
                                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-r border-slate-200 dark:border-zinc-800 flex items-center justify-center"
                                title="Anterior"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <span className="text-xs font-semibold px-3 py-1 text-slate-800 dark:text-zinc-200 font-sans select-none min-w-[120px] text-center">
                                {getLabelFecha()}
                            </span>
                            <button
                                onClick={() => handleNavigateClick('NEXT')}
                                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-l border-r border-slate-200 dark:border-zinc-800 flex items-center justify-center"
                                title="Siguiente"
                            >
                                <ChevronRight size={14} />
                            </button>
                            <button
                                onClick={() => handleNavigateClick('TODAY')}
                                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                Hoy
                            </button>
                        </div>

                        {/* Selector Sub-vistas Plano */}
                        <div className="inline-flex items-center gap-1 border border-slate-200 dark:border-zinc-800 rounded-lg p-1 bg-white dark:bg-zinc-900 shadow-2xs">
                            {(['agenda', 'month', 'week', 'day'] as const).map(v => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all cursor-pointer ${
                                        view === v 
                                            ? 'bg-[#0070f3] text-white font-semibold shadow-xs' 
                                            : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                                    }`}
                                    onClick={() => setView(v)}
                                >
                                    {v === 'agenda' ? 'Agenda' : v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Día'}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {carrerasUsuario.length > 1 && setSelectedCarreraId && viewMode !== 'inbox' && (
                    <select
                        value={selectedCarreraId ?? ''}
                        onChange={(e) => setSelectedCarreraId(e.target.value ? Number(e.target.value) : null)}
                        aria-label="Filtrar por carrera"
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-[#0070f3] cursor-pointer max-w-[220px]"
                    >
                        <option value="">Todas mis carreras</option>
                        {carrerasUsuario.map((c) => (
                            <option key={c.id_carrera} value={c.id_carrera}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>
                )}

                {/* Botón Global de Añadir Tarea / Nota */}
                {viewMode === 'inbox' ? (
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all cursor-pointer shadow-xs"
                        onClick={() => {
                            const floatingTrigger = document.querySelector('.sticky-floating-trigger-btn') as HTMLElement;
                            if (floatingTrigger) floatingTrigger.click();
                        }}
                    >
                        <Plus size={14} />
                        <span>Añadir Nota</span>
                    </button>
                ) : (
                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all cursor-pointer shadow-xs"
                            onClick={() => setIsMenuOpen((prev) => !prev)}
                            aria-expanded={isMenuOpen}
                            aria-haspopup="menu"
                        >
                            <Plus size={14} />
                            <span>Nuevo evento</span>
                            <ChevronDown size={13} className={`transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isMenuOpen && (
                            <div
                                role="menu"
                                className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl py-1.5 z-50"
                            >
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setIsMenuOpen(false);
                                        handleNewEventClick('personal');
                                    }}
                                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5"
                                >
                                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                                        Personal
                                    </span>
                                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                                        Solo visible en mi agenda
                                    </span>
                                </button>

                                {carrerasUsuario.length > 0 && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleNewEventClick('carrera');
                                        }}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5 border-t border-slate-100 dark:border-zinc-800"
                                    >
                                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#0070f3]" />
                                            Toda la carrera
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                                            Visible para docentes y coordinación
                                        </span>
                                    </button>
                                )}

                                {canPublishInstituto && (
                                    <button
                                        type="button"
                                        role="menuitem"
                                        onClick={() => {
                                            setIsMenuOpen(false);
                                            handleNewEventClick('instituto');
                                        }}
                                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5 border-t border-slate-100 dark:border-zinc-800"
                                    >
                                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                            Todo el instituto
                                        </span>
                                        <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                                            Visible para todo el ISTPET
                                        </span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

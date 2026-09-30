import React from 'react';
import type { View } from 'react-big-calendar';
import { Calendar as CalendarIcon, Layers, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import type { CalendarViewMode } from '../types/calendarioTypes';

interface CalendarioHeaderProps {
    viewMode: CalendarViewMode;
    setViewMode: (mode: CalendarViewMode) => void;
    view: View;
    setView: (view: View) => void;
    handleNavigateClick: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
    getLabelFecha: () => string;
    handleNewEventClick: () => void;
}

export const CalendarioHeader: React.FC<CalendarioHeaderProps> = ({
    viewMode,
    setViewMode,
    view,
    setView,
    handleNavigateClick,
    getLabelFecha,
    handleNewEventClick,
}) => {
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

                {/* Botón Global de Añadir Tarea / Nota */}
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all cursor-pointer shadow-xs"
                    onClick={viewMode === 'inbox' ? () => {
                        const floatingTrigger = document.querySelector('.sticky-floating-trigger-btn') as HTMLElement;
                        if (floatingTrigger) floatingTrigger.click();
                    } : handleNewEventClick}
                >
                    <Plus size={14} />
                    <span>{viewMode === 'inbox' ? 'Añadir Nota' : 'Añadir Tarea'}</span>
                </button>
            </div>
        </div>
    );
};

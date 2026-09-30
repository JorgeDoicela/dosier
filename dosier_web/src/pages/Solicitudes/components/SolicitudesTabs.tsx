import React from 'react';
import { Layers, History } from 'lucide-react';
import type { SolicitudCategoria } from '../types';

interface SolicitudesTabsProps {
    activeCategory: SolicitudCategoria;
    onSelectCategory: (category: SolicitudCategoria) => void;
    activeTab: 'catalogo' | 'historial';
    onSelectTab: (tab: 'catalogo' | 'historial') => void;
    totalTramites: number;
    totalHistorial: number;
}

export const SolicitudesTabs: React.FC<SolicitudesTabsProps> = ({
    activeCategory,
    onSelectCategory,
    activeTab,
    onSelectTab,
    totalTramites,
    totalHistorial
}) => {
    return (
        <div className="space-y-4 mb-6">
            {/* Riel Principal de Vistas: Catálogo vs Historial */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav 
                    className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" 
                    aria-label="Vistas de solicitudes"
                >
                    <button
                        type="button"
                        onClick={() => onSelectTab('catalogo')}
                        className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'catalogo'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <Layers size={14} className="stroke-[1.75]" />
                        <span>Catálogo de trámites</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                            ({totalTramites})
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onSelectTab('historial')}
                        className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                            activeTab === 'historial'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <History size={14} className="stroke-[1.75]" />
                        <span>Historial y resoluciones</span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                            ({totalHistorial})
                        </span>
                    </button>
                </nav>
            </div>

            {/* Subfiltros contextuales para el catálogo de trámites */}
            {activeTab === 'catalogo' && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-mono uppercase tracking-wider mr-1">
                        Filtrar por:
                    </span>
                    {[
                        { id: 'todas', label: 'Todos los trámites' },
                        { id: 'prorrogas', label: 'Prórrogas de plazo' },
                        { id: 'clonacion', label: 'Clonación curricular' },
                        { id: 'convocatoria', label: 'Convocatorias y aperturas' },
                        { id: 'soporte', label: 'Incidencias y soporte' }
                    ].map(filtro => {
                        const isActive = activeCategory === filtro.id;
                        return (
                            <button
                                key={filtro.id}
                                type="button"
                                onClick={() => onSelectCategory(filtro.id as SolicitudCategoria)}
                                className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border-0 ${
                                    isActive
                                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                        : 'bg-transparent text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                                }`}
                            >
                                {filtro.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

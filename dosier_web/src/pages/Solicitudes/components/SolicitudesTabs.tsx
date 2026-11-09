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
    isAdmin?: boolean;
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
            {/* Riel Principal de Vistas: Canales vs Historial */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav 
                    className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" 
                    aria-label="Vistas de trámites"
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
                        <span>Canales y trámites</span>
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
        </div>
    );
};

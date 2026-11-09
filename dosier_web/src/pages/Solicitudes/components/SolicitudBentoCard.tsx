import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { SolicitudTramiteItem } from '../types';

interface SolicitudBentoCardProps {
    tramite: SolicitudTramiteItem;
    onEjecutarAccion: (tramite: SolicitudTramiteItem) => void;
}

export const SolicitudBentoCard: React.FC<SolicitudBentoCardProps> = ({
    tramite,
    onEjecutarAccion
}) => {
    const IconComponent = tramite.icono;

    return (
        <button
            type="button"
            onClick={() => onEjecutarAccion(tramite)}
            className="w-full text-left bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-xs transition-all duration-150 cursor-pointer group"
        >
            <div className="space-y-3 w-full">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconComponent 
                            size={20} 
                            className="stroke-[1.75] text-[#0070f3] dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform" 
                        />
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                            {tramite.titulo}
                        </h2>
                    </div>
                    <ArrowRight 
                        size={16} 
                        className="stroke-[2] text-slate-400 dark:text-zinc-500 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all shrink-0" 
                    />
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {tramite.descripcion}
                </p>
            </div>
        </button>
    );
};

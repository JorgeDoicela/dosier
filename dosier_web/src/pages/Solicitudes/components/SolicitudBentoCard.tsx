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
        <div className="bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition-all duration-150">
            <div className="space-y-4">
                {/* Cabecera del trámite con icono desnudo */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <IconComponent 
                            size={20} 
                            className="stroke-[1.75] text-[#0070f3] dark:text-blue-400 shrink-0" 
                        />
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                            {tramite.titulo}
                        </h2>
                    </div>

                    {tramite.destacado && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Vigente</span>
                        </span>
                    )}
                </div>

                {/* Descripción fáctica y operativa */}
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                    {tramite.descripcion}
                </p>

                {/* Ficha técnica clave-valor (Anti-KPIs) */}
                <dl className="pt-2 border-t border-slate-100 dark:divide-zinc-800 dark:border-zinc-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <dt className="font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px]">
                            Resolución:
                        </dt>
                        <dd className="font-medium text-slate-800 dark:text-zinc-200">
                            {tramite.sla}
                        </dd>
                    </div>
                    <div className="flex items-center justify-between">
                        <dt className="font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px]">
                            Instancia:
                        </dt>
                        <dd className="font-medium text-slate-800 dark:text-zinc-200">
                            {tramite.responsable}
                        </dd>
                    </div>
                </dl>
            </div>

            {/* Acción directa */}
            <div className="pt-5 mt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                    type="button"
                    onClick={() => onEjecutarAccion(tramite)}
                    className="w-full justify-center px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                    <span>{tramite.accionTexto}</span>
                    <ArrowRight size={13} className="stroke-[2]" />
                </button>
            </div>
        </div>
    );
};

import React from 'react';
import { Filter, Clock, Building2 } from 'lucide-react';

export interface AnalyticsFiltersProps {
    period: string;
    setPeriod: (p: string) => void;
    carrera: string;
    setCarrera: (c: string) => void;
    dbPeriods: string[];
    dbCareers: string[];
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
    period,
    setPeriod,
    carrera,
    setCarrera,
    dbPeriods,
    dbCareers
}) => {
    return (
        <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-2">
                <Filter size={13} className="text-[#0070f3]" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-main">Variables de Corte:</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
                {/* Select Periodo */}
                <div className="relative group">
                    <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="!pl-8 !pr-7 !py-1.5 text-[10px] font-medium uppercase tracking-wider bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-md cursor-pointer text-text-main focus:outline-none focus:border-[#0070f3]"
                        id="period-filter-select"
                    >
                        <option value="TODOS">Todos los Periodos</option>
                        {dbPeriods.map((p, idx) => (
                            <option key={idx} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                {/* Select Carrera */}
                <div className="relative group">
                    <Building2 size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <select
                        value={carrera}
                        onChange={(e) => setCarrera(e.target.value)}
                        className="!pl-8 !pr-7 !py-1.5 text-[10px] font-medium uppercase tracking-wider bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-md cursor-pointer text-text-main focus:outline-none focus:border-[#0070f3]"
                        id="carrera-filter-select"
                    >
                        <option value="TODAS">Todas las Tecnologías</option>
                        {dbCareers.map((c, idx) => (
                            <option key={idx} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

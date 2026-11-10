import React from 'react';
import { Filter } from 'lucide-react';
import { GeistSelect } from '../../../components/Common/GeistSelect';

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
                <div className="w-48">
                    <GeistSelect
                        value={period}
                        onChange={(val) => setPeriod(String(val))}
                        options={[
                            { value: 'TODOS', label: 'Todos los Periodos' },
                            ...dbPeriods.map(p => ({ value: p, label: p }))
                        ]}
                        placeholder="Período..."
                    />
                </div>

                {/* Select Carrera */}
                <div className="w-56">
                    <GeistSelect
                        value={carrera}
                        onChange={(val) => setCarrera(String(val))}
                        options={[
                            { value: 'TODAS', label: 'Todas las Tecnologías' },
                            ...dbCareers.map(c => ({ value: c, label: c }))
                        ]}
                        placeholder="Tecnología..."
                    />
                </div>
            </div>
        </div>
    );
};

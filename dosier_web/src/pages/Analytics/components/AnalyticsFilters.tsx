import React from 'react';
import { Filter, Download } from 'lucide-react';
import { GeistSelect } from '../../../components/Common/GeistSelect';

export interface AnalyticsFiltersProps {
    period: string;
    setPeriod: (p: string) => void;
    carrera: string;
    setCarrera: (c: string) => void;
    dbPeriods: string[];
    dbCareers: string[];
    exporting?: boolean;
    exportError?: string | null;
    onExportPdf?: () => void;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
    period,
    setPeriod,
    carrera,
    setCarrera,
    dbPeriods,
    dbCareers,
    exporting = false,
    exportError = null,
    onExportPdf
}) => {
    const hasFilter = period !== 'TODOS' || carrera !== 'TODAS';

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Lado Izquierdo: Selectores de Filtro */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <Filter size={13} className="text-[#0070f3]" />
                    <span className="text-xs font-medium">Filtrar:</span>
                </div>

                {/* Select Periodo */}
                <div className="w-48">
                    <GeistSelect
                        value={period}
                        onChange={(val) => setPeriod(String(val))}
                        options={[
                            { value: 'TODOS', label: 'Todos los períodos' },
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
                            { value: 'TODAS', label: dbCareers.length === 1 ? dbCareers[0] : 'Todas las carreras' },
                            ...(dbCareers.length > 1 ? dbCareers.map(c => ({ value: c, label: c })) : [])
                        ]}
                        placeholder="Carrera..."
                    />
                </div>

                {hasFilter && (
                    <button
                        onClick={() => {
                            setPeriod('TODOS');
                            setCarrera('TODAS');
                        }}
                        className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer transition-colors px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            {/* Lado Derecho: Descargar Reporte PDF al mismo nivel */}
            {onExportPdf && (
                <div className="flex flex-col items-end gap-1">
                    <button
                        onClick={onExportPdf}
                        disabled={exporting}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        id="export-pdf-report-btn"
                    >
                        <Download size={13} className={exporting ? "animate-spin" : ""} />
                        <span>{exporting ? 'Generando...' : 'Descargar reporte PDF'}</span>
                    </button>
                    {exportError && (
                        <p className="text-[10px] text-red-400 font-medium">{exportError}</p>
                    )}
                </div>
            )}
        </div>
    );
};

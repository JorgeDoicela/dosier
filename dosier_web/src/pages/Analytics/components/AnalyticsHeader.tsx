import React from 'react';
import { Download, BarChart2 } from 'lucide-react';
import { PageHeader } from '../../../components/Common/PageHeader';

export interface AnalyticsHeaderProps {
    refreshing?: boolean;
    exporting: boolean;
    exportError: string | null;
    onReload?: () => void;
    onExportPdf: () => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
    exporting,
    exportError,
    onExportPdf
}) => {
    return (
        <PageHeader
            kicker="Gobernanza Curricular Institucional"
            icon={BarChart2}
            title="Analíticas Curriculares y Trazabilidad del PEA"
            description="Consola de observabilidad en tiempo real. Seguimiento institucional de formulación, revisión y legalización de los Programas de Estudio de la Asignatura."
        >
            <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onExportPdf}
                        disabled={exporting}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        id="export-pdf-report-btn"
                    >
                        <Download size={13} className={exporting ? "animate-spin" : ""} />
                        <span>{exporting ? 'Generando...' : 'Exportar PDF'}</span>
                    </button>
                </div>
                {exportError && (
                    <p className="text-[10px] text-red-400 font-medium mt-1">{exportError}</p>
                )}
            </div>
        </PageHeader>
    );
};

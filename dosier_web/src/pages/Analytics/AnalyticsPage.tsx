import React from 'react';
import { FolderOpen } from 'lucide-react';

// Custom Hooks & Subcomponents
import { useAnalyticsData } from './hooks/useAnalyticsData';
import { useAnalyticsState } from './hooks/useAnalyticsState';

import { SkeletonDashboard } from './components/SkeletonDashboard';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { AnalyticsFilters } from './components/AnalyticsFilters';
import { AnalyticsOverviewTab } from './components/AnalyticsOverviewTab';

export const AnalyticsPage: React.FC = () => {
    const {
        period,
        setPeriod,
        carrera,
        setCarrera,
        selectedChartSegment,
        setSelectedChartSegment,
        exporting,
        exportError,
        handleExportPdf
    } = useAnalyticsState();

    const {
        loading,
        refreshing,
        projects,
        stats,
        processed
    } = useAnalyticsData(period, carrera);

    if (loading) {
        return (
            <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto space-y-6">
                <SkeletonDashboard />
            </main>
        );
    }

    const {
        filteredProjects,
        proyectosPorEstado,
        dbPeriods,
        dbCareers
    } = processed;

    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Cabecera Principal */}
            <AnalyticsHeader
                refreshing={refreshing}
                exporting={exporting}
                exportError={exportError}
                onExportPdf={handleExportPdf}
            />

            {/* Panel de Filtros Directos */}
            <AnalyticsFilters
                period={period}
                setPeriod={setPeriod}
                carrera={carrera}
                setCarrera={setCarrera}
                dbPeriods={dbPeriods}
                dbCareers={dbCareers}
            />

            {/* Contenido Ejecutivo */}
            {filteredProjects.length === 0 && !stats ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center space-y-3">
                    <FolderOpen size={36} className="text-zinc-400 mx-auto" />
                    <div className="space-y-1">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            Sin registros en el corte
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                            No se encontraron instrumentos curriculares PEA para el período o carrera seleccionada.
                        </p>
                    </div>
                    <button
                        onClick={() => { setPeriod('TODOS'); setCarrera('TODAS'); }}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-all cursor-pointer"
                    >
                        Restablecer Filtros
                    </button>
                </div>
            ) : (
                <AnalyticsOverviewTab
                    filteredProjects={filteredProjects}
                    allProjects={projects}
                    stats={stats}
                    proyectosPorEstado={proyectosPorEstado}
                    selectedChartSegment={selectedChartSegment}
                    setSelectedChartSegment={setSelectedChartSegment}
                    carrerasCumplimiento={processed.carrerasCumplimiento}
                    cuelloBotella={processed.cuelloBotella}
                    cargaHorariaCaces={processed.cargaHorariaCaces}
                    onSelectCarrera={(c) => setCarrera(c)}
                />
            )}
        </main>
    );
};

export default AnalyticsPage;

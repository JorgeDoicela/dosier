import React from 'react';
import {
    BarChart3, PieChart, TrendingUp, CheckCircle2, Users,
    Clock, ArrowUpRight, BookOpen, Cpu, FileText, Globe
} from 'lucide-react';
import { KPICard } from './KPICard';
import { DonutChart } from './DonutChart';
import type {
    ProyectoResumen,
    DashboardStats,
    LineaInvestigacionData,
    EstadoConteo
} from '../types/analytics.types';
import { formatDate } from '../utils/cacesCalculator';

export interface AnalyticsOverviewTabProps {
    filteredProjects: ProyectoResumen[];
    allProjects: ProyectoResumen[];
    stats: DashboardStats | null;
    linesData: LineaInvestigacionData[];
    proyectosPorEstado: EstadoConteo[];
    selectedChartSegment: string | null;
    setSelectedChartSegment: (seg: string | null) => void;
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({
    filteredProjects,
    allProjects,
    stats,
    linesData,
    proyectosPorEstado,
    selectedChartSegment,
    setSelectedChartSegment
}) => {
    const aprobadosCount = filteredProjects.filter(p => p.estado === 'Aprobado' || p.estado === 'Finalizado').length;
    const enRevisionCount = filteredProjects.filter(p => p.estado === 'En Revisión' || p.estado === 'Enviado' || p.estado === 'RevisadoCoord' || p.estado === 'RevisadoAcad').length;
    const borradorCount = filteredProjects.filter(p => p.estado === 'Borrador').length;
    const totalDocentes = filteredProjects.reduce((acc, p) => acc + (p.totalInvestigadores || 1), 0);

    return (
        <>
            {/* Bento Grid: KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                <KPICard
                    title="Instrumentos Curriculares"
                    value={filteredProjects.length}
                    icon={<BarChart3 size={14} />}
                    accentColor="brand"
                    subText="Portafolio PEA del corte"
                    badgeText={`Total: ${allProjects.length}`}
                    footerItems={[
                        { label: 'Aprobados', value: aprobadosCount },
                        { label: 'Borrador', value: borradorCount }
                    ]}
                />
                <KPICard
                    title="Documentación Curricular"
                    value={aprobadosCount}
                    icon={<BookOpen size={14} />}
                    accentColor="success"
                    subText="Instrumentos aprobados y vigentes"
                    badgeText={`Aprobados: ${aprobadosCount}`}
                    footerItems={[
                        { label: 'Instrumentos Aprobados', value: aprobadosCount, valueColorClass: 'text-success font-semibold' },
                        { label: 'En Revisión / Trámite', value: enRevisionCount }
                    ]}
                />
                <KPICard
                    title="Cobertura Curricular"
                    value={`${filteredProjects.length > 0 ? Math.round(((aprobadosCount + enRevisionCount) / filteredProjects.length) * 100) : 100}%`}
                    icon={<CheckCircle2 size={14} />}
                    accentColor="warning"
                    subText="Conformidad RRA Art. 21 / 27"
                    footerItems={[
                        { label: 'Revisados / Aprobados', value: aprobadosCount + enRevisionCount, valueColorClass: 'text-success font-semibold' },
                        { label: 'En Formulación', value: borradorCount }
                    ]}
                />
                <KPICard
                    title="Estructura Académica"
                    value={totalDocentes}
                    icon={<Users size={14} />}
                    accentColor="violet"
                    subText="Docentes asignados al período"
                    badgeText={`PEAs: ${filteredProjects.length}`}
                    footerItems={[
                        { label: 'Docentes Asignados', value: totalDocentes },
                        { label: 'En Formulación', value: borradorCount }
                    ]}
                />
            </div>

            {/* Gráficos Consolidados */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up [animation-delay:100ms]">
                {/* Estado Donut Chart */}
                <div className="bg-surface p-5 rounded-lg border border-slate-200/90 dark:border-zinc-800 flex flex-col justify-between h-[360px]">
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">Estado de Instrumentos PEA</h4>
                            <PieChart size={14} className="text-[#0070f3]" />
                        </div>
                        <p className="text-xs text-text-dim mt-1 font-medium font-sans">Estado de la documentación curricular</p>
                    </div>

                    <DonutChart
                        elements={proyectosPorEstado}
                        total={filteredProjects.length}
                        selectedSegment={selectedChartSegment}
                        setSelectedSegment={setSelectedChartSegment}
                    />

                    {/* Leyenda */}
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-medium border-t border-slate-200/90 dark:border-zinc-800 pt-3.5">
                        {proyectosPorEstado.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-1.5 p-1 rounded transition-colors cursor-pointer ${
                                    selectedChartSegment === item.estado ? 'bg-slate-100 dark:bg-zinc-800' : ''
                                }`}
                                onMouseEnter={() => setSelectedChartSegment(item.estado)}
                                onMouseLeave={() => setSelectedChartSegment(null)}
                            >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-text-dim truncate">{item.estado}</span>
                                <span className="ml-auto text-text-main font-mono">{item.cantidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Líneas de Investigación */}
                <div className="bg-surface p-5 lg:col-span-2 flex flex-col justify-between h-[360px] rounded-lg border border-slate-200/90 dark:border-zinc-800">
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">
                                Distribución por Campo / Área Curricular
                            </h4>
                            <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                        <p className="text-xs text-text-dim mt-1 font-medium font-sans">Instrumentos curriculares asociados a áreas del instituto</p>
                    </div>

                    <div className="space-y-2.5 flex-1 justify-center flex flex-col overflow-y-auto custom-scrollbar pr-1 mt-4">
                        {linesData.length === 0 ? (
                            <span className="text-text-dim text-[10px] text-center font-bold block py-10 uppercase font-mono">
                                Sin líneas vinculadas
                            </span>
                        ) : (
                            linesData.map((line, idx) => {
                                const lineIcons = [
                                    <BookOpen size={11} key={1} />,
                                    <Cpu size={11} key={2} />,
                                    <TrendingUp size={11} key={3} />,
                                    <Users size={11} key={4} />,
                                    <CheckCircle2 size={11} key={5} />,
                                    <Globe size={11} key={6} />
                                ];
                                return (
                                    <div key={idx} className="space-y-2 p-3 bg-surface hover:bg-slate-50 dark:hover:bg-zinc-850/50 border border-slate-200/90 dark:border-zinc-800 rounded-lg transition-colors group">
                                        <div className="flex justify-between items-start gap-3 text-xs font-medium">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="text-text-dim group-hover:text-[#0070f3] transition-colors shrink-0">
                                                    {lineIcons[idx % lineIcons.length]}
                                                </span>
                                                <span className="text-text-main truncate leading-normal" title={line.nombre}>
                                                    {line.nombre}
                                                </span>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="text-text-main font-mono block">{line.proyectos} {line.proyectos === 1 ? 'Instrumento' : 'Instrumentos'}</span>
                                                <span className="text-text-dim font-mono text-[10px] block">{line.pct}% del total</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 rounded-full ${line.colorClass}`}
                                                style={{ width: `${line.pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Bitácora y Estado del Repositorio */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-up [animation-delay:200ms]">
                {/* Actividad */}
                <div className="bg-surface p-5 lg:col-span-2 space-y-4 rounded-lg border border-slate-200/90 dark:border-zinc-800">
                    <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">Bitácora de Gestión Curricular</h4>
                        <p className="text-xs text-text-dim mt-1 font-medium font-sans">Historial reciente de auditoría y actualizaciones curriculares</p>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        {stats?.actividadReciente && stats.actividadReciente.length > 0 ? (
                            stats.actividadReciente.map((act, i) => (
                                <div key={`${act.tipo}-${act.uuid || i}-${i}`} className="flex items-center gap-3.5 p-3 bg-surface hover:bg-slate-50 dark:hover:bg-zinc-850/50 border border-slate-200/90 dark:border-zinc-800 rounded-lg transition-colors select-none group">
                                    <span className="text-text-dim shrink-0">
                                        {act.tipo === 'proyecto' ? <Cpu size={14} /> : act.tipo === 'informe' ? <BookOpen size={14} /> : <FileText size={14} />}
                                    </span>
                                    <div className="min-w-0 flex-1 space-y-1">
                                        <p className="text-xs font-medium text-text-main group-hover:text-[#0070f3] transition-colors truncate leading-relaxed">
                                            {act.descripcion}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10.5px] text-text-dim font-mono">
                                            <span className="uppercase tracking-wider">{act.tipo}</span>
                                            <span>•</span>
                                            <span>{formatDate(act.fecha)}</span>
                                            {act.estado && (
                                                <>
                                                    <span>•</span>
                                                    <span className={`inline-flex items-center gap-1 font-medium ${
                                                        act.estado === 'Aprobado' || act.estado === 'En Ejecución'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                                            act.estado === 'Aprobado' || act.estado === 'En Ejecución'
                                                                ? 'bg-emerald-500'
                                                                : 'bg-amber-500'
                                                        }`} />
                                                        {act.estado}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 px-6 border border-dashed border-slate-200/90 dark:border-zinc-800 rounded-lg bg-slate-50/50 dark:bg-zinc-900/40 text-center select-none space-y-3">
                                <Clock size={20} className="text-text-dim/60" />
                                <div className="space-y-1 max-w-xs">
                                    <h5 className="text-xs font-semibold uppercase text-text-main tracking-wider">Bitácora Técnica Inactiva</h5>
                                    <p className="text-xs text-text-dim leading-relaxed font-medium">
                                        No se registran firmas ni cambios de estado en este periodo. Los cambios del portafolio se reflejan aquí en tiempo real.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Integraciones */}
                <div className="bg-surface p-5 lg:col-span-1 flex flex-col justify-between gap-4 rounded-lg border border-slate-200/90 dark:border-zinc-800">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[#0070f3]">
                            <Globe size={14} />
                            <h4 className="text-[10px] font-semibold uppercase tracking-wider font-mono">Servicios Conectados</h4>
                        </div>
                        <h3 className="text-sm font-semibold text-text-main font-sans tracking-tight">Preservación Digital Institucional</h3>
                        <p className="text-xs text-text-dim leading-relaxed font-medium">
                            Sincronización automatizada de documentos firmados con el repositorio digital institucional. Se garantiza el resguardo y trazabilidad permanente de los proyectos.
                        </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 rounded-md space-y-2.5 text-xs font-mono">
                        <div className="flex items-center justify-between">
                            <span className="text-text-dim uppercase tracking-wider text-[10px]">Repositorio Digital</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                En línea
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-text-dim uppercase tracking-wider text-[10px]">Acceso institucional</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                En línea
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-text-dim uppercase tracking-wider text-[10px]">Integridad de Firma</span>
                            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Seguro
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => alert("Redireccionando al portal del Repositorio Abierto del IST Traversari...")}
                        className="btn-vercel-secondary w-full flex items-center justify-between group text-[9.5px] !py-2.5"
                        id="repository-redirect-btn"
                    >
                        <span>Ver Repositorio Abierto</span>
                        <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </button>
                </div>
            </div>
        </>
    );
};

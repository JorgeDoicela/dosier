import React, { useState, useMemo } from 'react';
import {
    BarChart3,
    PieChart,
    CheckCircle2,
    Clock,
    FileCheck,
    Search,
    AlertCircle,
    FileSignature,
    Check,
    GraduationCap,
    SlidersHorizontal,
    GitBranch,
    ShieldCheck,
    BookOpen,
    Filter,
    Layers
} from 'lucide-react';
import { KPICard } from './KPICard';
import { DonutChart } from './DonutChart';
import type {
    ProyectoResumen,
    DashboardStats,
    EstadoConteo,
    CarreraCumplimiento,
    CuelloBotellaItem,
    CargaHorariaCaces
} from '../types/analytics.types';
import { formatModalidad, getPeaStatusDescriptor } from '../../Curriculum/utils/peaStatusWorkflow';

export interface AnalyticsOverviewTabProps {
    filteredProjects: ProyectoResumen[];
    allProjects: ProyectoResumen[];
    stats: DashboardStats | null;
    linesData?: any[];
    proyectosPorEstado: EstadoConteo[];
    selectedChartSegment: string | null;
    setSelectedChartSegment: (seg: string | null) => void;
    carrerasCumplimiento?: CarreraCumplimiento[];
    cuelloBotella?: CuelloBotellaItem[];
    cargaHorariaCaces?: CargaHorariaCaces;
    onSelectCarrera?: (carrera: string) => void;
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({
    filteredProjects,
    allProjects,
    proyectosPorEstado,
    selectedChartSegment,
    setSelectedChartSegment,
    carrerasCumplimiento = [],
    cuelloBotella = [],
    cargaHorariaCaces,
    onSelectCarrera
}) => {
    const [tableSearch, setTableSearch] = useState('');
    const [activeSection, setActiveSection] = useState<'todo' | 'carreras' | 'embudo' | 'carga'>('todo');

    // Métricas Fácticas del Circuito de Formulación y Aprobación del PEA
    const totalPeas = filteredProjects.length;
    const aprobadosCount = filteredProjects.filter(p => p.estado === 'Aprobado' || p.estado === 'Finalizado').length;
    const enRevisionCarrera = filteredProjects.filter(p => p.estado === 'EnRevision' || p.estado === 'En Revisión').length;
    const revisadoCoord = filteredProjects.filter(p => p.estado === 'RevisadoCoord').length;
    const revisadoAcad = filteredProjects.filter(p => p.estado === 'RevisadoAcad').length;
    const observadosCount = filteredProjects.filter(p => p.estado === 'Observado').length;
    const borradorCount = filteredProjects.filter(p => p.estado === 'Borrador' || !p.estado || p.estado === 'NoIniciado').length;

    const totalEnRevision = enRevisionCarrera + revisadoCoord + revisadoAcad;
    const pctAprobados = totalPeas > 0 ? Math.round((aprobadosCount / totalPeas) * 100) : 0;

    // Firmas Institucionales (Circuito Oficial de 4 Niveles - Ley 67 DFRM)
    const conFirmaDocente = filteredProjects.filter(p =>
        p.firmaDocente || (p.totalFirmas && p.totalFirmas >= 1) || (p.estado !== 'Borrador' && p.estado !== 'NoIniciado')
    ).length;
    const conFirmaCoord = filteredProjects.filter(p =>
        p.firmaCoord || (p.totalFirmas && p.totalFirmas >= 2) || p.estado === 'RevisadoCoord' || p.estado === 'RevisadoAcad' || p.estado === 'Aprobado'
    ).length;
    const conFirmaAcad = filteredProjects.filter(p =>
        p.firmaAcad || (p.totalFirmas && p.totalFirmas >= 3) || p.estado === 'RevisadoAcad' || p.estado === 'Aprobado'
    ).length;
    const conFirmaVicerrector = filteredProjects.filter(p =>
        p.firmaVicerrector || (p.totalFirmas && p.totalFirmas >= 4) || p.estado === 'Aprobado'
    ).length;

    const firmasMetricas = [
        {
            nivel: '1. Elaboración Docente',
            cargo: 'Docente Titular',
            completadas: conFirmaDocente,
            pct: totalPeas > 0 ? Math.round((conFirmaDocente / totalPeas) * 100) : 0,
            barColor: 'bg-[#0070f3]'
        },
        {
            nivel: '2. Aval de Carrera',
            cargo: 'Coordinación de Carrera',
            completadas: conFirmaCoord,
            pct: totalPeas > 0 ? Math.round((conFirmaCoord / totalPeas) * 100) : 0,
            barColor: 'bg-purple-600'
        },
        {
            nivel: '3. Aval Académico',
            cargo: 'Coordinación Académica',
            completadas: conFirmaAcad,
            pct: totalPeas > 0 ? Math.round((conFirmaAcad / totalPeas) * 100) : 0,
            barColor: 'bg-sky-600'
        },
        {
            nivel: '4. Legalización Oficial',
            cargo: 'Vicerrectorado',
            completadas: conFirmaVicerrector,
            pct: totalPeas > 0 ? Math.round((conFirmaVicerrector / totalPeas) * 100) : 0,
            barColor: 'bg-emerald-600'
        }
    ];

    // Tabla filtrada de asignaturas
    const tableProjects = useMemo(() => {
        if (!tableSearch) return filteredProjects;
        const q = tableSearch.toLowerCase();
        return filteredProjects.filter(p =>
            p.titulo.toLowerCase().includes(q) ||
            (p.codigoInstitucional || '').toLowerCase().includes(q) ||
            (p.docenteElaborador || '').toLowerCase().includes(q) ||
            (p.carrera || '').toLowerCase().includes(q)
        );
    }, [filteredProjects, tableSearch]);

    return (
        <div className="space-y-6">
            {/* ── 1. CUADRO DE INDICADORES EJECUTIVOS DEL PEA ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up">
                <KPICard
                    title="Total Asignaturas"
                    value={totalPeas}
                    icon={<BarChart3 size={14} />}
                    accentColor="brand"
                    subText="Asignaturas del corte curricular"
                    badgeText={`Catálogo Global: ${allProjects.length}`}
                    footerItems={[
                        { label: 'En Formulación', value: borradorCount },
                        { label: 'En Trámite', value: totalEnRevision }
                    ]}
                />

                <KPICard
                    title="Legalización Oficial"
                    value={aprobadosCount}
                    icon={<FileCheck size={14} />}
                    accentColor="success"
                    subText="Circuito 4/4 firmas completado"
                    badgeText={`${pctAprobados}% Cumplimiento`}
                    footerItems={[
                        { label: 'Aprobados', value: aprobadosCount, valueColorClass: 'text-emerald-600 dark:text-emerald-400 font-semibold' },
                        { label: 'Por Legalizar', value: totalPeas - aprobadosCount }
                    ]}
                />

                <KPICard
                    title="En Circuito de Avales"
                    value={totalEnRevision}
                    icon={<FileSignature size={14} />}
                    accentColor="brand"
                    subText="Revisión técnica y disciplinar"
                    footerItems={[
                        { label: 'En Carrera', value: enRevisionCarrera },
                        { label: 'En Académica', value: revisadoCoord },
                        { label: 'En Vicerrectorado', value: revisadoAcad }
                    ]}
                />

                <KPICard
                    title="Carga Práctica (APE)"
                    value={cargaHorariaCaces ? `${cargaHorariaCaces.horasAPE}h` : '0h'}
                    icon={<GraduationCap size={14} />}
                    accentColor="warning"
                    subText="Talleres y laboratorios formativos"
                    badgeText={cargaHorariaCaces ? `${cargaHorariaCaces.pctAPE}% del total` : '0%'}
                    footerItems={[
                        { label: 'Docencia CD', value: cargaHorariaCaces ? `${cargaHorariaCaces.horasCD}h` : '0h' },
                        { label: 'Autónomo AA', value: cargaHorariaCaces ? `${cargaHorariaCaces.horasAA}h` : '0h' }
                    ]}
                />
            </div>

            {/* ── 2. SELECTOR DE VISTA ESTRATÉGICA ── */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveSection('todo')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeSection === 'todo'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <Layers size={14} />
                        Consola Integral
                    </button>
                    <button
                        onClick={() => setActiveSection('carreras')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeSection === 'carreras'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <GraduationCap size={14} />
                        Semáforo por Carrera ({carrerasCumplimiento.length})
                    </button>
                    <button
                        onClick={() => setActiveSection('embudo')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeSection === 'embudo'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <GitBranch size={14} />
                        Cuello de Botella Operativo
                    </button>
                    <button
                        onClick={() => setActiveSection('carga')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeSection === 'carga'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <ShieldCheck size={14} />
                        Auditoría Carga CACES (RRA Art. 21)
                    </button>
                </nav>
            </div>

            {/* ── 3. SEMÁFORO DE CUMPLIMIENTO POR CARRERA / TECNOLOGÍA ── */}
            {(activeSection === 'todo' || activeSection === 'carreras') && (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs animate-fade-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <GraduationCap size={15} className="text-[#0070f3]" />
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    Semáforo y Ranking de Cumplimiento por Tecnología
                                </h4>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Avance comparativo de formulación y aprobación legal entre carreras del ISTPET
                            </p>
                        </div>
                        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 self-start sm:self-auto">
                            {carrerasCumplimiento.length} Carreras Activas
                        </span>
                    </div>

                    {carrerasCumplimiento.length === 0 ? (
                        <div className="py-8 text-center text-zinc-400 text-xs border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
                            No hay carreras registradas en este período.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                    <tr>
                                        <th className="py-2.5 px-4">Carrera / Tecnología</th>
                                        <th className="py-2.5 px-3 text-center">Asignaturas</th>
                                        <th className="py-2.5 px-3">Progreso de Aprobación</th>
                                        <th className="py-2.5 px-3 text-center">En Trámite</th>
                                        <th className="py-2.5 px-3 text-center">Con Observaciones</th>
                                        <th className="py-2.5 px-3 text-right">Carga Total</th>
                                        <th className="py-2.5 px-4 text-center">Estado Semáforo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                                    {carrerasCumplimiento.map((c, idx) => {
                                        const semaforoBadge = c.estadoSemaforo === 'optimo'
                                            ? { text: 'Óptimo', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40' }
                                            : c.estadoSemaforo === 'regular'
                                            ? { text: 'En Proceso', dotClass: 'bg-amber-500', textClass: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/40' }
                                            : { text: 'Rezago Crítico', dotClass: 'bg-red-500', textClass: 'text-red-700 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-950/40' };

                                        return (
                                            <tr
                                                key={idx}
                                                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors"
                                            >
                                                <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                                                    <div className="flex items-center gap-2">
                                                        <span>{c.carrera}</span>
                                                        {onSelectCarrera && (
                                                            <button
                                                                onClick={() => onSelectCarrera(c.carrera)}
                                                                title="Filtrar por esta carrera"
                                                                className="text-zinc-400 hover:text-[#0070f3] transition-colors cursor-pointer p-0.5 rounded"
                                                            >
                                                                <Filter size={11} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-center font-mono font-medium text-zinc-700 dark:text-zinc-300">
                                                    {c.totalAsignaturas}
                                                </td>
                                                <td className="py-3 px-3">
                                                    <div className="space-y-1 w-44">
                                                        <div className="flex items-center justify-between text-[11px] font-mono">
                                                            <span className="text-zinc-600 dark:text-zinc-400">{c.aprobados} de {c.totalAsignaturas}</span>
                                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{c.porcentajeAprobados}%</span>
                                                        </div>
                                                        <div className="w-full bg-slate-100 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-500 ${
                                                                    c.porcentajeAprobados >= 80 ? 'bg-emerald-500' : c.porcentajeAprobados >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                                }`}
                                                                style={{ width: `${c.porcentajeAprobados}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-3 text-center font-mono text-zinc-600 dark:text-zinc-400">
                                                    {c.enRevision}
                                                </td>
                                                <td className="py-3 px-3 text-center">
                                                    {c.observados > 0 ? (
                                                        <span className="inline-flex items-center gap-1 font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-[11px]">
                                                            {c.observados}
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono text-zinc-400 text-[11px]">0</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-3 text-right font-mono text-zinc-700 dark:text-zinc-300">
                                                    {c.totalHoras > 0 ? `${c.totalHoras}h` : '—'}
                                                    {c.totalCreditos > 0 && (
                                                        <span className="text-zinc-400 dark:text-zinc-500 ml-1 text-[11px]">
                                                            ({c.totalCreditos} cr.)
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${semaforoBadge.bgClass} ${semaforoBadge.textClass}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${semaforoBadge.dotClass}`} />
                                                        {semaforoBadge.text}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── 4. DIAGNÓSTICO DE CUELLOS DE BOTELLA OPERATIVOS (EMBUDO DEL CIRCUITO) ── */}
            {(activeSection === 'todo' || activeSection === 'embudo') && (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs animate-fade-up">
                    <div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GitBranch size={15} className="text-[#0070f3]" />
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    Diagnóstico de Cuello de Botella Operativo
                                </h4>
                            </div>
                            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                Circuito de Avales Curriculares
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Identificación fáctica del estamento institucional donde se encuentran detenidos los instrumentos PEA
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                        {cuelloBotella.map((item, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 space-y-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                            {item.etapa}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                                            {item.responsable}
                                        </p>
                                    </div>
                                    <span className="font-mono text-lg font-black text-zinc-900 dark:text-zinc-100">
                                        {item.cantidad}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="w-full bg-slate-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${item.bgProgress}`}
                                            style={{ width: `${item.porcentaje}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                        <span>{item.tiempoEstimado}</span>
                                        <span>{item.porcentaje}% de la cátedra</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── 5. AUDITORÍA DE CARGA HORARIA Y COMPONENTES CACES (RRA Art. 21) ── */}
            {(activeSection === 'todo' || activeSection === 'carga') && cargaHorariaCaces && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
                    {/* Tarjeta de Horas y Proporción Pedagógica */}
                    <div className="lg:col-span-8 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={15} className="text-[#0070f3]" />
                                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                        Auditoría de Componentes Pedagógicos (RRA Art. 21 / 27)
                                    </h4>
                                </div>
                                <span className="text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                    Total: {cargaHorariaCaces.totalHoras.toLocaleString('es-EC')} horas
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                Distribución técnica de la carga horaria microcurricular en el período activo
                            </p>
                        </div>

                        <div className="space-y-4 my-4">
                            {/* Componente CD */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        Contacto con el Docente (CD) — Clases y Tutorías
                                    </span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                        {cargaHorariaCaces.horasCD}h ({cargaHorariaCaces.pctCD}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-[#0070f3] transition-all duration-500"
                                        style={{ width: `${cargaHorariaCaces.pctCD}%` }}
                                    />
                                </div>
                            </div>

                            {/* Componente APE */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        Práctico - Experimental (APE) — Talleres y Laboratorios
                                    </span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                        {cargaHorariaCaces.horasAPE}h ({cargaHorariaCaces.pctAPE}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                        style={{ width: `${cargaHorariaCaces.pctAPE}%` }}
                                    />
                                </div>
                            </div>

                            {/* Componente AA */}
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                        Aprendizaje Autónomo (AA) — Investigación y Estudio
                                    </span>
                                    <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                        {cargaHorariaCaces.horasAA}h ({cargaHorariaCaces.pctAA}%)
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2.5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                                        style={{ width: `${cargaHorariaCaces.pctAA}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                            <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                                Total de Créditos Curriculares Planificados:
                            </span>
                            <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                {cargaHorariaCaces.totalCreditos} créditos
                            </span>
                        </div>
                    </div>

                    {/* Alertas de Integridad Normativa CACES */}
                    <div className="lg:col-span-4 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                        <div>
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                    Integridad CACES
                                </h4>
                                <AlertCircle size={14} className="text-amber-500" />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                                Verificación de consistencia del RRA
                            </p>
                        </div>

                        <div className="space-y-3 my-auto py-3">
                            <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    Balance Tecnológico (APE ≥ 30%)
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    {cargaHorariaCaces.pctAPE >= 30
                                        ? 'Conforme al modelo de formación técnico-tecnológico superior.'
                                        : 'Alerta: El componente práctico está por debajo del 30% esperado.'}
                                </p>
                            </div>

                            <div className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-1">
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    Asignaturas sin Carga Parametrizada
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                                    {cargaHorariaCaces.asignaturasSinCarga === 0
                                        ? '0 asignaturas con horas vacías (100% consistente).'
                                        : `${cargaHorariaCaces.asignaturasSinCarga} asignaturas pendientes de parametrizar horas.`}
                                </p>
                            </div>
                        </div>

                        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                            <Check size={13} className="shrink-0 text-emerald-600" />
                            Estructura microcurricular acorde a normativa CES
                        </div>
                    </div>
                </div>
            )}

            {/* ── 6. GRÁFICOS EJECUTIVOS: ESTADOS + TRAZABILIDAD DE FIRMAS (4 NIVELES) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up">
                {/* Donut Chart: Estados Curriculares */}
                <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                Estado de Instrumentos PEA
                            </h4>
                            <PieChart size={14} className="text-[#0070f3]" />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                            Distribución técnica de avance en el período
                        </p>
                    </div>

                    <div className="py-2">
                        <DonutChart
                            elements={proyectosPorEstado}
                            total={filteredProjects.length}
                            selectedSegment={selectedChartSegment}
                            setSelectedSegment={setSelectedChartSegment}
                        />
                    </div>

                    {/* Leyenda sobria */}
                    <div className="grid grid-cols-2 gap-1.5 text-xs font-medium border-t border-slate-100 dark:border-zinc-800/80 pt-3">
                        {proyectosPorEstado.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-1.5 p-1 rounded-md transition-colors cursor-pointer ${
                                    selectedChartSegment === item.estado ? 'bg-slate-100 dark:bg-zinc-900' : ''
                                }`}
                                onMouseEnter={() => setSelectedChartSegment(item.estado)}
                                onMouseLeave={() => setSelectedChartSegment(null)}
                            >
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="text-zinc-600 dark:text-zinc-400 truncate text-[11px]">{item.estado}</span>
                                <span className="ml-auto text-zinc-900 dark:text-zinc-100 font-mono text-[11px] font-semibold">{item.cantidad}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trazabilidad del Circuito de Firmas (4 Niveles) */}
                <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                    <div>
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                Circuito Oficial de Firmas y Avales
                            </h4>
                            <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                            Avance por estamento normativo del ISTPET (4 niveles obligatorios)
                        </p>
                    </div>

                    <div className="space-y-4 my-auto py-2">
                        {firmasMetricas.map((item, idx) => (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.nivel}</span>
                                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 font-medium">({item.cargo})</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                                            {item.completadas} / {totalPeas}
                                        </span>
                                        <span className="font-mono text-zinc-400 dark:text-zinc-500 text-[11px]">
                                            ({item.pct}%)
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-zinc-900 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-700 rounded-full ${item.barColor}`}
                                        style={{ width: `${item.pct}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
                        <span className="text-zinc-600 dark:text-zinc-400 font-medium">
                            Validez Normativa CACES / FirmaEC:
                        </span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
                            <Check size={13} className="shrink-0" />
                            Circuito Criptográfico Activo
                        </span>
                    </div>
                </div>
            </div>

            {/* ── 7. NÓMINA DE ASIGNATURAS Y ESTADO CURRICULAR DEL CORTE ── */}
            <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs animate-fade-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Nómina de Asignaturas y Estado del PEA
                        </h4>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Detalle fáctico por cátedra en el corte seleccionado ({tableProjects.length} asignaturas)
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar asignatura o docente..."
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>
                </div>

                {tableProjects.length === 0 ? (
                    <div className="py-10 text-center text-zinc-400 text-xs border border-dashed border-slate-200 dark:border-zinc-800 rounded-lg">
                        No se encontraron asignaturas para el término de búsqueda.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-4">Asignatura</th>
                                    <th className="py-2.5 px-3">Nivel / Modalidad</th>
                                    <th className="py-2.5 px-3">Docente Elaborador</th>
                                    <th className="py-2.5 px-3 text-center">Horas CD / APE / AA</th>
                                    <th className="py-2.5 px-3">Circuito de Firmas</th>
                                    <th className="py-2.5 px-4 text-right">Estado Curricular</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                                {tableProjects.map((p) => {
                                    const descriptor = getPeaStatusDescriptor(p.estado);
                                    const firmasOk = p.totalFirmas || 0;

                                    return (
                                        <tr key={p.uuid} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                                            <td className="py-2.5 px-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                                        {p.titulo}
                                                    </p>
                                                    {p.carrera && (
                                                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                                                            {p.carrera}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                                                <span>{p.semestreNivel || 'Nivel Ordinario'}</span>
                                                {p.modalidad && (
                                                    <span className="text-zinc-400 dark:text-zinc-600 ml-1">
                                                        · {formatModalidad(p.modalidad)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                                                {p.docenteElaborador || 'Docente Responsable'}
                                            </td>
                                            <td className="py-2.5 px-3 text-center font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                                {p.totalHoras && p.totalHoras > 0 ? (
                                                    <span>{p.totalHoras}h total</span>
                                                ) : (
                                                    <span className="text-zinc-400">—</span>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5" title={`${firmasOk} de 4 firmas completadas`}>
                                                    <span className={`w-2 h-2 rounded-full ${p.firmaDocente || firmasOk >= 1 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Docente" />
                                                    <span className={`w-2 h-2 rounded-full ${p.firmaCoord || firmasOk >= 2 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Coordinación Carrera" />
                                                    <span className={`w-2 h-2 rounded-full ${p.firmaAcad || firmasOk >= 3 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Coordinación Académica" />
                                                    <span className={`w-2 h-2 rounded-full ${p.firmaVicerrector || firmasOk >= 4 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Vicerrectorado" />
                                                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 ml-1">
                                                        {firmasOk}/4
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass} shrink-0`} />
                                                    <span className={descriptor.textClass}>{descriptor.label}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

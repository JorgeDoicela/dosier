import React, { useState, useMemo } from 'react';
import {
    PieChart,
    CheckCircle2,
    Search,
    GraduationCap,
    GitBranch,
    BookOpen,
    Filter,
    LayoutDashboard
} from 'lucide-react';
import { DonutChart } from './DonutChart';
import type {
    ProyectoResumen,
    DashboardStats,
    EstadoConteo,
    CarreraCumplimiento,
    CuelloBotellaItem
} from '../types/analytics.types';
import { formatModalidad, getPeaStatusDescriptor } from '../../Curriculum/utils/peaStatusWorkflow';

export interface AnalyticsOverviewTabProps {
    filteredProjects: ProyectoResumen[];
    allProjects: ProyectoResumen[];
    stats: DashboardStats | null;
    proyectosPorEstado: EstadoConteo[];
    selectedChartSegment: string | null;
    setSelectedChartSegment: (seg: string | null) => void;
    carrerasCumplimiento?: CarreraCumplimiento[];
    cuelloBotella?: CuelloBotellaItem[];
    onSelectCarrera?: (carrera: string) => void;
}

export const AnalyticsOverviewTab: React.FC<AnalyticsOverviewTabProps> = ({
    filteredProjects,
    proyectosPorEstado,
    selectedChartSegment,
    setSelectedChartSegment,
    carrerasCumplimiento = [],
    cuelloBotella = [],
    onSelectCarrera
}) => {
    const [tableSearch, setTableSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'resumen' | 'carreras' | 'materias'>('resumen');

    const totalPeas = filteredProjects.length;

    // Firmas institucionales (4 firmas oficiales por PEA)
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
            nivel: '1. Docente titular',
            cargo: 'Docente elaborador',
            completadas: conFirmaDocente,
            pct: totalPeas > 0 ? Math.round((conFirmaDocente / totalPeas) * 100) : 0,
            barColor: 'bg-[#0070f3]'
        },
        {
            nivel: '2. Coordinación de carrera',
            cargo: 'Revisión y aprobación',
            completadas: conFirmaCoord,
            pct: totalPeas > 0 ? Math.round((conFirmaCoord / totalPeas) * 100) : 0,
            barColor: 'bg-purple-600'
        },
        {
            nivel: '3. Coordinación académica',
            cargo: 'Validación académica',
            completadas: conFirmaAcad,
            pct: totalPeas > 0 ? Math.round((conFirmaAcad / totalPeas) * 100) : 0,
            barColor: 'bg-sky-600'
        },
        {
            nivel: '4. Vicerrectorado',
            cargo: 'Aprobación final',
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
            {/* ── SELECTOR DE PESTAÑAS (Riel plano sobre línea base) ── */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('resumen')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'resumen'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <LayoutDashboard size={14} />
                        Resumen general
                    </button>
                    <button
                        onClick={() => setActiveTab('carreras')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'carreras'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <GraduationCap size={14} />
                        Por carrera ({carrerasCumplimiento.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('materias')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                            activeTab === 'materias'
                                ? 'border-[#0070f3] text-[#0070f3]'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                        }`}
                    >
                        <BookOpen size={14} />
                        Lista de asignaturas ({filteredProjects.length})
                    </button>
                </nav>
            </div>

            {/* ── PESTAÑA 1: RESUMEN GENERAL ── */}
            {activeTab === 'resumen' && (
                <div className="space-y-6 animate-fade-up">
                    {/* Etapas del trámite */}
                    <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <GitBranch size={15} className="text-[#0070f3]" />
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    Paso actual del trámite
                                </h4>
                            </div>
                            <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                                Total: {totalPeas} materias
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-2">
                            Indica en qué etapa se encuentra cada PEA y quién debe atenderlo.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
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
                                                {item.responsable} · <span className="text-zinc-400">{item.rol}</span>
                                            </p>
                                        </div>
                                        <span className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">
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
                                            <span>{item.porcentaje}% del total</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gráficos: Distribución por estado y Avance de firmas */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Donut Chart: Estados */}
                        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                        Distribución por estado
                                    </h4>
                                    <PieChart size={14} className="text-[#0070f3]" />
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Cantidad de materias según su estado actual
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

                            {/* Leyenda */}
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

                        {/* Avance de firmas */}
                        <div className="lg:col-span-7 bg-white dark:bg-zinc-950 p-5 rounded-xl border border-slate-200 dark:border-zinc-800 flex flex-col justify-between shadow-xs">
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-mono">
                                        Avance de firmas
                                    </h4>
                                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                    Firmas registradas según el nivel correspondiente (4 firmas por PEA)
                                </p>
                            </div>

                            <div className="space-y-4 my-auto py-2">
                                {firmasMetricas.map((item, idx) => (
                                    <div key={idx} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{item.nivel}</span>
                                                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">({item.cargo})</span>
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
                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Circuito institucional de firmas:
                                </span>
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                    Docente → Carrera → Académica → Vicerrectorado
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── PESTAÑA 2: POR CARRERA ── */}
            {activeTab === 'carreras' && (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs animate-fade-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2">
                                <GraduationCap size={15} className="text-[#0070f3]" />
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                    Avance por carrera
                                </h4>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Materias registradas y porcentaje de aprobación en cada carrera
                            </p>
                        </div>
                        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 self-start sm:self-auto">
                            {carrerasCumplimiento.length} carreras activas
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
                                        <th className="py-2.5 px-4">Carrera</th>
                                        <th className="py-2.5 px-3 text-center">Materias</th>
                                        <th className="py-2.5 px-3">Progreso de aprobación</th>
                                        <th className="py-2.5 px-3 text-center">En trámite</th>
                                        <th className="py-2.5 px-3 text-center">Con observaciones</th>
                                        <th className="py-2.5 px-3 text-center">Pendientes</th>
                                        <th className="py-2.5 px-4 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                                    {carrerasCumplimiento.map((c, idx) => {
                                        const badge = c.estadoSemaforo === 'optimo'
                                            ? { text: 'Al día', dotClass: 'bg-emerald-500', textClass: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40' }
                                            : c.estadoSemaforo === 'regular'
                                            ? { text: 'En proceso', dotClass: 'bg-amber-500', textClass: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/40' }
                                            : { text: 'Pendiente', dotClass: 'bg-slate-400', textClass: 'text-slate-700 dark:text-zinc-300', bgClass: 'bg-slate-100 dark:bg-zinc-900' };

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
                                                                onClick={() => {
                                                                    onSelectCarrera(c.carrera);
                                                                    setActiveTab('materias');
                                                                }}
                                                                title="Ver asignaturas de esta carrera"
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
                                                                    c.porcentajeAprobados >= 80 ? 'bg-emerald-500' : c.porcentajeAprobados >= 40 ? 'bg-amber-500' : 'bg-slate-400'
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
                                                <td className="py-3 px-3 text-center font-mono text-zinc-500 dark:text-zinc-400">
                                                    {c.borradores}
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bgClass} ${badge.textClass}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                                        {badge.text}
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

            {/* ── PESTAÑA 3: LISTA DE ASIGNATURAS ── */}
            {activeTab === 'materias' && (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4 shadow-xs animate-fade-up">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                Lista de asignaturas
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Materias correspondientes al período y carrera seleccionada ({tableProjects.length} asignaturas)
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
                                        <th className="py-2.5 px-3">Docente responsable</th>
                                        <th className="py-2.5 px-3 text-center">Firmas completadas</th>
                                        <th className="py-2.5 px-4 text-right">Estado del PEA</th>
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
                                                                {p.carrera} {p.codigoInstitucional ? `· ${p.codigoInstitucional}` : ''}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-400">
                                                    <span>{p.semestreNivel || 'Nivel regular'}</span>
                                                    {p.modalidad && (
                                                        <span className="text-zinc-400 dark:text-zinc-600 ml-1">
                                                            · {formatModalidad(p.modalidad)}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-2.5 px-3 text-zinc-700 dark:text-zinc-300">
                                                    {p.docenteElaborador || 'Docente asignado'}
                                                </td>
                                                <td className="py-2.5 px-3 text-center">
                                                    <div className="inline-flex items-center gap-1.5" title={`${firmasOk} de 4 firmas completadas`}>
                                                        <span className={`w-2 h-2 rounded-full ${p.firmaDocente || firmasOk >= 1 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Docente" />
                                                        <span className={`w-2 h-2 rounded-full ${p.firmaCoord || firmasOk >= 2 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Coordinación de Carrera" />
                                                        <span className={`w-2 h-2 rounded-full ${p.firmaAcad || firmasOk >= 3 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Coordinación Académica" />
                                                        <span className={`w-2 h-2 rounded-full ${p.firmaVicerrector || firmasOk >= 4 ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} title="Vicerrectorado" />
                                                        <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400 ml-1">
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
            )}
        </div>
    );
};

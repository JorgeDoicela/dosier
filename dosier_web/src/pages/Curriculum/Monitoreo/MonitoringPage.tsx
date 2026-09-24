import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Activity, Calendar, 
    CheckCircle2, Clock, BookOpen, Layers, Award, Shield, FileCheck
} from 'lucide-react';
import { monitoreoService, type ProjectMonitoringDetailDto } from '../../../services/monitoreoService';
import { useWorkflowStates } from '../../../hooks/useWorkflowStates';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Monitoreo Curricular de Programas de Estudio (PEA)
 * ══════════════════════════════════════════════════════════════════════════════
 * Seguimiento del avance pedagógico, distribución horaria CES (CD, APE, TA),
 * unidades temáticas y trazabilidad del circuito colegiado de firmas.
 */

export const MonitoringPage: React.FC = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const navigate = useNavigate();
    const { getEstadoConfig } = useWorkflowStates();

    const [projectDetail, setProjectDetail] = useState<ProjectMonitoringDetailDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const estado = projectDetail?.estado || 'Borrador';
    const cfg = getEstadoConfig(estado);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!projectUuid) return;
            setIsLoading(true);
            try {
                const data = await monitoreoService.getProjectDetail(projectUuid);
                setProjectDetail(data);
            } catch (err: any) {
                console.error('[DOSIER] Error al cargar detalles para el monitoreo curricular:', err);
                setError(err.response?.data?.message || 'No se pudo cargar la información curricular del PEA.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetail();
    }, [projectUuid]);

    if (isLoading) {
        return (
            <div className="flex-1 bg-bg-deep flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4 animate-pulse">
                    <div className="animate-spin h-8 w-8 border-t-2 border-brand rounded-full"></div>
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Cargando Monitoreo Curricular...</p>
                </div>
            </div>
        );
    }

    if (error || !projectDetail) {
        return (
            <div className="flex-1 bg-bg-deep flex items-center justify-center min-h-screen p-8 text-center">
                <div className="bg-surface border border-red-500/20 p-8 rounded-3xl max-w-md shadow-2xl">
                    <h3 className="text-red-500 text-lg font-bold uppercase tracking-wider mb-2">Error de Carga</h3>
                    <p className="text-text-dim text-sm font-medium mb-6">
                        {error || 'No se pudo resolver la información del instrumento curricular.'}
                    </p>
                    <Link to="/documentacion" className="btn-vercel-primary py-3 w-full inline-block text-center no-underline">
                        Volver a Documentación Curricular
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-bg-deep min-h-screen text-text-main p-4 md:p-10 overflow-y-auto selection:bg-text-main selection:text-bg-deep">
            {/* Header Curricular */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0 sticky top-0 bg-bg-deep/95 backdrop-blur z-20 pb-4 border-b border-border-thin">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2.5 rounded-xl bg-surface border border-border-thin hover:border-text-main text-text-dim hover:text-text-main transition-all cursor-pointer"
                        title="Volver a la vista previa"
                    >
                        <ArrowLeft size={14} />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">
                            <Activity size={10} className="text-brand animate-pulse" />
                            <span>Monitoreo de Instrumento Curricular · ISTPET</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{projectDetail.titulo}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`status-label ${cfg.badge} text-[11px] font-semibold uppercase tracking-wider`} style={cfg.style}>
                        <span className={`dot ${cfg.dot}`} style={cfg.dotStyle} />
                        {cfg.label}
                    </span>
                </div>
            </header>

            {/* Ficha Curricular en Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-up">
                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Docente Elaborador</span>
                    <p className="text-sm font-semibold text-text-main truncate">{projectDetail.directorProyecto || 'Docente Responsable'}</p>
                    <span className="text-[10px] text-text-dim font-mono">{projectDetail.periodo || 'Período Activo'}</span>
                </div>

                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Carrera / Código</span>
                    <p className="text-sm font-semibold text-text-main truncate">{projectDetail.carrera || 'ISTPET'}</p>
                    <span className="text-[10px] text-text-dim font-mono">{projectDetail.codigo_asignatura || 'SIN_CODIGO'} · {projectDetail.modalidad || 'Presencial'}</span>
                </div>

                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Carga Horaria CES (RRA)</span>
                    <p className="text-sm font-bold text-text-main">{projectDetail.horas_totales || 0} horas ({projectDetail.creditos || 0} Créditos)</p>
                    <span className="text-[10px] text-text-dim">CD: {projectDetail.horas_docencia || 0}h | APE: {projectDetail.horas_practico_experimental || 0}h | TA: {projectDetail.horas_autonomo || 0}h</span>
                </div>

                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Circuito de Avales (CACES)</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <CheckCircle2 size={13} className="text-brand" />
                        <span className="text-xs font-semibold text-text-main">{projectDetail.avancePorcentaje || 0}% de firmas</span>
                    </div>
                    <span className="text-[10px] text-text-dim block">Firma docente y avales institucionales</span>
                </div>
            </div>

            {/* Contenido Principal: Unidades Temáticas y Cronograma Pedagógico */}
            <main className="animate-fade-up [animation-delay:100ms] space-y-6">
                <div className="bento-card static p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-thin pb-4 gap-3 sm:gap-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <Layers size={18} className="text-brand" />
                                <h3 className="text-lg font-bold text-text-main">Estructura de Unidades Temáticas y Contenidos</h3>
                            </div>
                            <p className="text-xs text-text-dim mt-0.5">
                                Planificación microcurricular oficial de la asignatura: distribución horaria y contenidos por unidad de estudio.
                            </p>
                        </div>
                        <div className="flex gap-4 text-[10px] uppercase font-bold text-text-dim tracking-wider">
                            <span className="badge-vercel badge-vercel-neutral">
                                {projectDetail.unidades?.length || 0} Unidades Curriculares
                            </span>
                        </div>
                    </div>

                    {/* Tabla de Unidades Temáticas */}
                    <div className="overflow-x-auto pr-1 scrollbar-thin scrollbar-thumb-surface border border-border-thin rounded-xl">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-surface/50 text-left border-b border-border-thin">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-16 text-center">Unidad</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim min-w-[260px]">Nombre de la Unidad y Temas</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-24 text-center">Docencia</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-24 text-center">Prácticas</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-24 text-center">Autónomo</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-24 text-center">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-thin">
                                {projectDetail.unidades && projectDetail.unidades.length > 0 ? (
                                    projectDetail.unidades.map((u, idx) => (
                                        <tr key={idx} className="hover:bg-surface/20 transition-colors">
                                            <td className="p-4 text-center font-mono font-bold text-text-dim text-xs">
                                                U{u.numero_unidad}
                                            </td>
                                            <td className="p-4 space-y-1.5">
                                                <p className="text-sm font-semibold text-text-main">{u.nombre_unidad}</p>
                                                {u.temas && u.temas.length > 0 && (
                                                    <div className="pl-2 border-l-2 border-brand/40 space-y-0.5">
                                                        {u.temas.map((t, tIdx) => (
                                                            <div key={tIdx} className="text-xs text-text-dim">
                                                                <span className="font-mono text-[10px] text-brand mr-1">{u.numero_unidad}.{t.numero_tema || tIdx + 1}</span>
                                                                <span>{t.titulo_tema}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center font-mono text-xs text-text-main">{u.horas_docencia}h</td>
                                            <td className="p-4 text-center font-mono text-xs text-text-main">{u.horas_practico_exp}h</td>
                                            <td className="p-4 text-center font-mono text-xs text-text-main">{u.horas_autonomo}h</td>
                                            <td className="p-4 text-center font-mono text-xs font-bold text-brand">{u.total_horas_unidad}h</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-text-dim text-xs uppercase tracking-wider font-mono">
                                            Sin unidades temáticas registradas en este PEA.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Circuito de Firmas y Trazabilidad */}
                <div className="bento-card static p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-2 border-b border-border-thin pb-4">
                        <FileCheck size={18} className="text-brand" />
                        <h3 className="text-lg font-bold text-text-main">Circuito Colegiado de Firmas y Legalización</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                        <div className="p-4 rounded-xl border border-border-thin bg-surface space-y-1">
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">1. Docente Titular</span>
                            <p className="text-xs font-semibold text-text-main">{projectDetail.firmas?.elaborado?.firmante ? 'Firmado' : 'Pendiente'}</p>
                            <span className="text-[10px] text-text-dim block truncate">{projectDetail.firmas?.elaborado?.fecha || 'Sin fecha de legalización'}</span>
                        </div>

                        <div className="p-4 rounded-xl border border-border-thin bg-surface space-y-1">
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">2. Coordinación Carrera</span>
                            <p className="text-xs font-semibold text-text-main">{projectDetail.firmas?.revisadoCoord?.firmante ? 'Aval Aprobado' : 'Pendiente'}</p>
                            <span className="text-[10px] text-text-dim block truncate">{projectDetail.firmas?.revisadoCoord?.fecha || 'Pendiente de aval disciplinar'}</span>
                        </div>

                        <div className="p-4 rounded-xl border border-border-thin bg-surface space-y-1">
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">3. Coordinación Académica</span>
                            <p className="text-xs font-semibold text-text-main">{projectDetail.firmas?.revisadoAcad?.firmante ? 'Aval Aprobado' : 'Pendiente'}</p>
                            <span className="text-[10px] text-text-dim block truncate">{projectDetail.firmas?.revisadoAcad?.fecha || 'Pendiente de control de horas'}</span>
                        </div>

                        <div className="p-4 rounded-xl border border-border-thin bg-surface space-y-1">
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">4. Vicerrectorado Académico</span>
                            <p className="text-xs font-semibold text-text-main">{projectDetail.firmas?.aprobado?.firmante ? 'Legalizado Oficial' : 'Pendiente'}</p>
                            <span className="text-[10px] text-text-dim block truncate">{projectDetail.firmas?.aprobado?.fecha || 'Pendiente de resolución final'}</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MonitoringPage;

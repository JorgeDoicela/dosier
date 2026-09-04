import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeft, Activity, Calendar, 
    CheckCircle2
} from 'lucide-react';
import api from '../../../api/axios_config';
import { useWorkflowStates } from '../../../hooks/useWorkflowStates';

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER ARCHITECTURE: MONITOREO & EJECUCIÓN ACADÉMICA (FASE C)
 * ══════════════════════════════════════════════════════════════════════════════
 */

export const MonitoringPage: React.FC = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const navigate = useNavigate();
    const { getEstadoConfig } = useWorkflowStates();

    const [projectDetail, setProjectDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const estado = projectDetail?.estado || 'Borrador';
    const cfg = getEstadoConfig(estado);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!projectUuid) return;
            setIsLoading(true);
            try {
                const res = await api.get(`/projects/${projectUuid}/detail`);
                setProjectDetail(res.data);
            } catch (err: any) {
                console.error('[DOSIER] Error al cargar detalles para el monitoreo:', err);
                setError(err.response?.data?.message || 'No se pudo cargar la información del proyecto.');
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
                    <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">Cargando Monitoreo...</p>
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
                        {error || 'No se pudo resolver la instancia del proyecto de investigación.'}
                    </p>
                    <Link to="/investigacion" className="btn-vercel-primary py-3 w-full inline-block text-center no-underline">
                        Volver a Investigaciones
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-bg-deep min-h-screen text-text-main p-4 md:p-10 overflow-y-auto selection:bg-text-main selection:text-bg-deep">
            {/* Header del Satélite */}
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 md:gap-0 sticky top-0 bg-bg-deep/80 backdrop-blur z-20 pb-4 border-b border-border-thin">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2.5 rounded-xl bg-surface border border-border-thin hover:border-text-main text-text-dim hover:text-text-main transition-all"
                        title="Volver al proyecto"
                    >
                        <ArrowLeft size={14} />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-dim uppercase tracking-[0.3em]">
                            <Activity size={10} className="text-brand animate-pulse" />
                            <span>Módulo de Monitoreo & Ejecución · IST Traversari</span>
                        </div>
                        <h1 className="text-2xl font-semibold tracking-tight mt-0.5">{projectDetail.titulo}</h1>
                    </div>
                </div>
            </header>

            {/* Ficha Rápida del Proyecto en Bento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-fade-up">
                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Director de Proyecto</span>
                    <p className="text-sm font-semibold text-text-main truncate">{projectDetail.directorProyecto || 'Jorge Doicela'}</p>
                </div>
                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Línea de Investigación</span>
                    <p className="text-sm font-semibold text-text-main truncate">{projectDetail.lineaInvestigacion || 'No especificada'}</p>
                </div>
                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Estado de Ciclo de Vida</span>
                    <span className={`status-label ${cfg.badge} text-[10px] font-semibold w-fit mt-1 uppercase tracking-wider`} style={cfg.style}>
                        <span className={`dot ${cfg.dot}`} style={cfg.dotStyle} />
                        {cfg.label}
                    </span>
                </div>
                <div className="bento-card static p-5 space-y-1">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Acreditación CACES</span>
                    <p className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                        <CheckCircle2 size={12} className="text-success" />
                        <span>Datos de acreditación listos</span>
                    </p>
                </div>
            </div>

            {/* Contenido Principal: Cronograma y Gantt */}
            <main className="animate-fade-up [animation-delay:100ms]">
                <div className="bento-card static p-6 md:p-8 space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border-thin pb-4 gap-3 sm:gap-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <Calendar size={18} className="text-brand" />
                                <h3 className="text-lg font-bold text-text-main">Diagrama de Gantt Académico</h3>
                            </div>
                            <p className="text-xs text-text-dim mt-0.5">Seguimiento de las semanas de desarrollo programadas contra entregables institucionales.</p>
                        </div>
                        <div className="flex gap-4 text-[10px] uppercase font-bold text-text-dim tracking-wider">
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-brand" /> <span>Semana Ejecutada</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded border border-border-thin" /> <span>Planificado</span></div>
                        </div>
                    </div>

                    {/* Contenedor del Scrollbar de Gantt */}
                    <div className="overflow-x-auto pr-1 scrollbar-thin scrollbar-thumb-surface border border-border-thin rounded-xl">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-surface/30 text-left border-b border-border-thin">
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-12 text-center">N°</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim min-w-[250px]">Actividad Planificada</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-32 text-center">CACES</th>
                                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-text-dim w-[450px]">Gantt (Semanas de Plan de Trabajo)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-thin">
                                {projectDetail.cronograma && projectDetail.cronograma.length > 0 ? (
                                    projectDetail.cronograma.map((act: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-surface/20 transition-colors">
                                            <td className="p-4 text-center font-mono font-bold text-text-dim text-xs">{act.numero}</td>
                                            <td className="p-4">
                                                <p className="text-xs font-medium text-text-main">{act.actividad}</p>
                                                {act.responsable && <span className="text-[10px] text-text-dim block mt-0.5 font-medium">Responsable: {act.responsable}</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`badge-vercel text-[9px] font-bold mx-auto w-fit ${act.esEntregableCaces ? 'badge-vercel-warning' : 'badge-vercel-neutral'}`}>
                                                    {act.esEntregableCaces ? 'CACES Mandatorio' : 'Interno'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {/* Representación de semanas del plan de trabajo */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {(act.semanas || Array(12).fill(false)).map((isPlanned: boolean, weekIdx: number) => {
                                                        return (
                                                            <div 
                                                                key={weekIdx} 
                                                                className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-mono font-bold transition-all ${
                                                                    isPlanned 
                                                                        ? 'bg-brand/20 border border-brand/50 text-brand' 
                                                                        : 'border border-border-thin text-text-dim/30'
                                                                }`}
                                                                title={`Semana ${weekIdx + 1}: ${isPlanned ? 'Planificado' : 'Sin actividad'}`}
                                                            >
                                                                S{weekIdx + 1}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-text-dim text-xs uppercase tracking-wider font-mono">
                                            Sin actividades registradas en el cronograma.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MonitoringPage;

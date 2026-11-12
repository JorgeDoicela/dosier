import React, { useEffect, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { curriculumProjectService } from '../../../../services/curriculumProjectService';
import type { TraceabilityItemDto } from '../../../../services/curriculumProjectService';
import type { PeaDto } from '../../../../services/peaService';
import type { ProjectDetail } from '../types/revisionTecnicaTypes';

interface AdminRevisionHistoryPanelProps {
    projectUuid: string;
    pea?: PeaDto | null;
    project?: ProjectDetail | null;
}

const ESTADOS_MAP: Record<string, { label: string; dotClass: string; textClass: string }> = {
    Borrador: {
        label: 'Borrador',
        dotClass: 'bg-slate-400 dark:bg-zinc-500',
        textClass: 'text-slate-600 dark:text-zinc-400'
    },
    EnRevision: {
        label: 'En revisión técnica',
        dotClass: 'bg-[#0070f3]',
        textClass: 'text-[#0070f3] dark:text-blue-400'
    },
    'En Revisión': {
        label: 'En revisión técnica',
        dotClass: 'bg-[#0070f3]',
        textClass: 'text-[#0070f3] dark:text-blue-400'
    },
    Observado: {
        label: 'Observado para corrección',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-600 dark:text-amber-400'
    },
    'En Corrección': {
        label: 'Observado para corrección',
        dotClass: 'bg-amber-500',
        textClass: 'text-amber-600 dark:text-amber-400'
    },
    Corregido: {
        label: 'Corregido por docente',
        dotClass: 'bg-sky-500',
        textClass: 'text-sky-600 dark:text-sky-400'
    },
    RevisadoCoord: {
        label: 'Aprobación de carrera emitida',
        dotClass: 'bg-indigo-500',
        textClass: 'text-indigo-600 dark:text-indigo-400'
    },
    RevisadoAcad: {
        label: 'Aprobación académica emitida',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600 dark:text-emerald-400'
    },
    Aprobado: {
        label: 'Aprobado y legalizado',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600 dark:text-emerald-400'
    },
    Publicado: {
        label: 'Publicado oficialmente',
        dotClass: 'bg-emerald-500',
        textClass: 'text-emerald-600 dark:text-emerald-400'
    },
    Rechazado: {
        label: 'Rechazado',
        dotClass: 'bg-rose-500',
        textClass: 'text-rose-600 dark:text-rose-400'
    }
};

export const AdminRevisionHistoryPanel: React.FC<AdminRevisionHistoryPanelProps> = ({
    projectUuid,
    pea,
    project
}) => {
    const [loading, setLoading] = useState(true);
    const [trazabilidad, setTrazabilidad] = useState<TraceabilityItemDto[]>([]);

    const loadTraceability = useCallback(async () => {
        setLoading(true);
        try {
            const data = await curriculumProjectService.getTraceability(projectUuid);
            const list = Array.isArray(data) ? data : [];
            setTrazabilidad(list);
        } catch (err) {
            console.error('[DOSIER] Error al cargar trazabilidad:', err);
            if (pea?.trazabilidades && Array.isArray(pea.trazabilidades)) {
                setTrazabilidad(pea.trazabilidades as any);
            }
        } finally {
            setLoading(false);
        }
    }, [projectUuid, pea]);

    useEffect(() => {
        loadTraceability();
    }, [loadTraceability]);

    const formatFecha = (iso: string | null | undefined) => {
        if (!iso) return 'Fecha no registrada';
        try {
            return new Intl.DateTimeFormat('es-EC', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(iso));
        } catch {
            return String(iso);
        }
    };


    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-12 text-slate-500 dark:text-zinc-400">
                <Loader2 size={24} className="animate-spin text-[#0070f3]" />
                <p className="text-xs font-medium">Cargando historial y firmas del documento...</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar px-6 sm:px-10 lg:px-14 py-8 bg-white dark:bg-zinc-950">
            <div className="w-full space-y-8">

                {/* ── Encabezado Directo y Espacioso ── */}
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold">
                        Expediente de Auditoría y Control Curricular
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-zinc-100 mt-1">
                        {pea?.nombreAsignatura || project?.title || project?.titulo || 'Programa de Estudio de la Asignatura'}
                    </h1>
                    <p className="text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
                        Carrera: <strong className="text-slate-800 dark:text-zinc-200">{pea?.nombreCarrera || project?.carrera || 'ISTPET'}</strong> • Período Lectivo: <strong className="text-slate-800 dark:text-zinc-200">{pea?.idPeriodo || project?.periodo || 'ABR2026'}</strong>
                    </p>
                </div>

                {/* ── Historial de Revisiones y Firmas ── */}
                <div className="space-y-4 pt-1">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            Historial de revisiones y firmas
                        </h2>
                    </div>

                    {trazabilidad.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 dark:text-zinc-500">
                            <p className="text-xs font-medium">Aún no se registran revisiones o firmas para este documento.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                            {trazabilidad.map((item: any, idx: number) => {
                                const estadoAnt = item.estadoAnterior || item.estado_anterior || 'Inicio';
                                const estadoNue = item.estadoNuevo || item.estado_nuevo || 'Borrador';
                                const fecha = item.fechaTransicion || item.fecha_transicion || item.created_at;
                                const motivo = item.motivo || item.observacion || '';
                                const usuario = item.nombreUsuario || item.nombre_usuario || item.usuario_nombre || 'Sistema Curricular';

                                const metaNuevo = ESTADOS_MAP[estadoNue] || ESTADOS_MAP['Borrador'];
                                const metaAnt = ESTADOS_MAP[estadoAnt] || ESTADOS_MAP['Borrador'];

                                const isTransition = estadoAnt && estadoNue && estadoAnt !== estadoNue && estadoAnt !== 'Nuevo' && estadoAnt !== 'Inicio';
                                const motivoLower = motivo.toLowerCase();

                                let dotClass = metaNuevo.dotClass;
                                let textClass = metaNuevo.textClass;
                                let eventLabel = metaNuevo.label;

                                if (motivoLower.includes('creación') || motivoLower.includes('creacion')) {
                                    dotClass = 'bg-slate-400 dark:bg-zinc-500';
                                    textClass = 'text-slate-600 dark:text-zinc-400';
                                    eventLabel = 'Creación del documento';
                                } else if (motivoLower.includes('subsanación') || motivoLower.includes('subsanacion')) {
                                    dotClass = 'bg-sky-500';
                                    textClass = 'text-sky-600 dark:text-sky-400';
                                    eventLabel = 'Observación subsanada';
                                } else if (motivoLower.includes('observación') || motivoLower.includes('observacion')) {
                                    dotClass = 'bg-amber-500';
                                    textClass = 'text-amber-600 dark:text-amber-400';
                                    eventLabel = 'Revisión disciplinaria';
                                } else if (motivoLower.includes('actualización') || motivoLower.includes('actualizacion') || motivoLower.includes('modificación')) {
                                    dotClass = 'bg-[#0070f3]';
                                    textClass = 'text-[#0070f3] dark:text-blue-400';
                                    eventLabel = 'Modificación de contenido';
                                } else if (motivoLower.includes('firma')) {
                                    dotClass = 'bg-emerald-500';
                                    textClass = 'text-emerald-600 dark:text-emerald-400';
                                    eventLabel = 'Firma digital oficial';
                                }

                                return (
                                    <div key={idx} className="py-4 first:pt-1">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            {isTransition ? (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-slate-500 dark:text-zinc-400 font-medium">
                                                        {metaAnt.label}
                                                    </span>
                                                    <span className="text-slate-300 dark:text-zinc-600 select-none">→</span>
                                                    <span className={`inline-flex items-center gap-1.5 font-medium ${metaNuevo.textClass}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${metaNuevo.dotClass}`} />
                                                        <span>{metaNuevo.label}</span>
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textClass}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                                    <span>{eventLabel}</span>
                                                </span>
                                            )}

                                            <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                                <span>{usuario}</span>
                                                <span className="mx-2 text-slate-300 dark:text-zinc-700">·</span>
                                                <span>{formatFecha(fecha)}</span>
                                            </div>
                                        </div>

                                        {motivo && (
                                            <p className="mt-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                                                {motivo}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

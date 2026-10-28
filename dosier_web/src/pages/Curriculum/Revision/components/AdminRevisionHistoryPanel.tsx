import React, { useEffect, useState, useCallback } from 'react';
import {
    CheckCircle2, AlertTriangle, ShieldCheck, Clock,
    User, ArrowRight, Loader2, ShieldAlert, Award
} from 'lucide-react';
import { curriculumProjectService } from '../../../../services/curriculumProjectService';
import type { TraceabilityItemDto } from '../../../../services/curriculumProjectService';
import type { PeaDto } from '../../../../services/peaService';
import type { ProjectDetail } from '../types/revisionTecnicaTypes';

interface AdminRevisionHistoryPanelProps {
    projectUuid: string;
    pea?: PeaDto | null;
    project?: ProjectDetail | null;
}

const ESTADOS_MAP: Record<string, { label: string; badgeClass: string; icon: typeof CheckCircle2 }> = {
    Borrador: {
        label: 'Borrador',
        badgeClass: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700',
        icon: Clock
    },
    EnRevision: {
        label: 'En Revisión Técnica',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-[#0070f3] dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: Clock
    },
    'En Revisión': {
        label: 'En Revisión Técnica',
        badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-[#0070f3] dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: Clock
    },
    Observado: {
        label: 'Observado para Corrección',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: AlertTriangle
    },
    'En Corrección': {
        label: 'Observado para Corrección',
        badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        icon: AlertTriangle
    },
    Corregido: {
        label: 'Corregido por Docente',
        badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
        icon: Clock
    },
    RevisadoCoord: {
        label: 'Aval de Carrera Emitido',
        badgeClass: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
        icon: Award
    },
    RevisadoAcad: {
        label: 'Aval Académico Emitido',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        icon: CheckCircle2
    },
    Aprobado: {
        label: 'Aprobado y Legalizado',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        icon: CheckCircle2
    },
    Publicado: {
        label: 'Publicado Oficialmente',
        badgeClass: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
        icon: CheckCircle2
    },
    Rechazado: {
        label: 'Rechazado',
        badgeClass: 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: ShieldAlert
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

    const estadoActual = pea?.estado || project?.estado || project?.status || 'EnRevision';
    const estadoMeta = ESTADOS_MAP[estadoActual] || ESTADOS_MAP['EnRevision'];

    // ── CADENA DE FIRMAS DE RESPONSABILIDAD (LEY 67) ──
    const firmas = [
        {
            etapa: '1. Elaboración Microcurricular',
            rol: 'Docente Titular Elaborador',
            responsable: pea?.nombreDocenteElaborador || project?.docente_elaborador || project?.directorProyecto || project?.director_nombre || 'Docente Titular',
            firma: pea?.firmaElaboradoDocente,
            fecha: pea?.fechaElaborado,
            completado: !!pea?.firmaElaboradoDocente || estadoActual !== 'Borrador'
        },
        {
            etapa: '2. Revisión de Coherencia',
            rol: 'Coordinación de Carrera',
            responsable: 'Coordinador de Especialidad',
            firma: pea?.firmaRevisadoCoord,
            fecha: pea?.fechaRevisadoCoord,
            completado: ['RevisadoCoord', 'RevisadoAcad', 'Aprobado', 'Publicado'].includes(estadoActual)
        },
        {
            etapa: '3. Revisión Metodológica',
            rol: 'Coordinación Académica',
            responsable: 'Coordinación Académica ISTPET',
            firma: pea?.firmaRevisadoAcad,
            fecha: pea?.fechaRevisadoAcad,
            completado: ['RevisadoAcad', 'Aprobado', 'Publicado'].includes(estadoActual)
        },
        {
            etapa: '4. Legalización Oficial',
            rol: 'Vicerrectorado Académico',
            responsable: 'Vicerrectorado Académico ISTPET',
            firma: pea?.firmaAprobadoVicerrector,
            fecha: pea?.fechaAprobado,
            completado: ['Aprobado', 'Publicado'].includes(estadoActual)
        }
    ];

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-3 p-12 text-slate-500 dark:text-zinc-400">
                <Loader2 size={24} className="animate-spin text-[#0070f3]" />
                <p className="text-xs font-medium">Cargando expediente de auditoría y trazabilidad...</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto custom-scrollbar px-6 sm:px-10 lg:px-14 py-8 bg-white dark:bg-zinc-950">
            <div className="w-full space-y-8">

                {/* ── Encabezado Directo y Espacioso (Sin caja contenedora grande) ── */}
                <div className="border-b border-slate-200 dark:border-zinc-800 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
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

                        <div className="flex items-center gap-3 self-start md:self-center">
                            <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${estadoMeta.badgeClass}`}>
                                <estadoMeta.icon size={14} />
                                {estadoMeta.label}
                            </span>
                        </div>
                    </div>

                    {/* Ficha métrica clave-valor al ancho completo */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 mt-6 border-t border-slate-100 dark:border-zinc-900">
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Código Asignatura</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{pea?.codigoAsignatura || 'Sin código'}</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Cómputo Horario (CES Art. 21)</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{pea?.totalHorasAsignatura || project?.horas_totales || 0} horas</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Créditos Aprobados</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{pea?.creditos || project?.creditos || 0} créditos</span>
                        </div>
                        <div>
                            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">Eventos de Bitácora</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-zinc-200 mt-0.5 block">{trazabilidad.length} transiciones</span>
                        </div>
                    </div>
                </div>

                {/* ── Cadena de Firmas en 4 Columnas Horizontales Amplias ── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#0070f3] dark:text-blue-400" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                                Cadena de Responsabilidad y Firmas Oficiales (Ley 67)
                            </h2>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                            Firma Electrónica Avanzada / DFRM
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {firmas.map((f, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl border p-4.5 transition-all duration-150 flex flex-col justify-between min-h-[140px] ${
                                    f.completado
                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                                        : 'bg-slate-50/70 dark:bg-zinc-900/40 border-slate-200 dark:border-zinc-800'
                                }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-1 mb-1.5">
                                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                            {f.etapa}
                                        </span>
                                        {f.completado ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 size={13} />
                                                Certificado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
                                                <Clock size={12} />
                                                En espera
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                        {f.rol}
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 line-clamp-2">
                                        {f.responsable}
                                    </p>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-zinc-800/80 text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex flex-col gap-0.5">
                                    <span className="truncate">
                                        {f.firma ? `Certificado: ${f.firma}` : f.completado ? 'Aval Registrado' : 'Sin firma'}
                                    </span>
                                    <span className="text-[10px] opacity-75">{f.fecha ? formatFecha(f.fecha) : ''}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Bitácora Cronológica de Auditoría (Trazabilidad Forense) al Ancho Completo ── */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <Clock size={18} className="text-[#0070f3] dark:text-blue-400" />
                            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                                Bitácora de Transiciones e Historial Forense
                            </h2>
                        </div>
                        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                            Registro Inmutable SHA-256
                        </span>
                    </div>

                    {trazabilidad.length === 0 ? (
                        <div className="p-16 text-center text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                            <Clock size={36} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-medium">Aún no se registran transiciones de estado para este expediente.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-200 dark:divide-zinc-800 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                            {trazabilidad.map((item: any, idx: number) => {
                                const estadoAnt = item.estadoAnterior || item.estado_anterior || 'Inicio';
                                const estadoNue = item.estadoNuevo || item.estado_nuevo || 'Borrador';
                                const fecha = item.fechaTransicion || item.fecha_transicion || item.created_at;
                                const motivo = item.motivo || item.observacion || '';
                                const hash = item.hashIntegridadSha256 || item.hash_integridad_sha256 || item.hashActual;
                                const usuario = item.nombreUsuario || item.nombre_usuario || item.usuario_nombre || 'Sistema Curricular';

                                const metaNuevo = ESTADOS_MAP[estadoNue] || ESTADOS_MAP['Borrador'];
                                const metaAnt = ESTADOS_MAP[estadoAnt] || ESTADOS_MAP['Borrador'];

                                return (
                                    <div key={idx} className="p-5 sm:p-6 hover:bg-slate-50/80 dark:hover:bg-zinc-900/40 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex items-center gap-2.5 flex-wrap">
                                                <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                                                    {metaAnt.label}
                                                </span>
                                                <ArrowRight size={13} className="text-slate-400" />
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${metaNuevo.badgeClass}`}>
                                                    <metaNuevo.icon size={12} />
                                                    {metaNuevo.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-mono">
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <User size={13} className="text-[#0070f3] dark:text-blue-400" />
                                                    {usuario}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={13} />
                                                    {formatFecha(fecha)}
                                                </span>
                                            </div>
                                        </div>

                                        {motivo && (
                                            <div className="mt-3 text-xs sm:text-sm text-slate-800 dark:text-zinc-200 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 rounded-lg p-3.5 leading-relaxed whitespace-pre-wrap font-sans">
                                                {motivo}
                                            </div>
                                        )}

                                        {hash && (
                                            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                                                <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                                                <span className="font-semibold text-slate-600 dark:text-zinc-400">Hash SHA-256:</span>
                                                <span className="truncate select-all">{hash}</span>
                                            </div>
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

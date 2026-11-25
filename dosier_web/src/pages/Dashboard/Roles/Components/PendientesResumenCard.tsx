import React from 'react';
import type { PeaBandejaItemDto } from '../../../../services/peaService';
import { normalizePeaStatus } from '../../../Curriculum/utils/peaStatusWorkflow';

interface PendientesResumenCardProps {
    revisionScopeLabel: string;
    pendientesRevision: PeaBandejaItemDto[];
    misPendientes: PeaBandejaItemDto[];
    misMateriasCount: number;
    isLoading?: boolean;
    onAbrirPea: (pea: PeaBandejaItemDto) => void;
    onVerRevisiones: () => void;
    onVerMisMaterias: () => void;
}

const getMiPendienteDetalle = (pea: PeaBandejaItemDto) => {
    const key = normalizePeaStatus(pea.estado);
    if (key === 'Observado') {
        return {
            estado: 'Con observaciones',
            accion: 'Corregir',
            dotClass: 'bg-amber-500',
            accionClass: 'text-amber-700 dark:text-amber-400'
        };
    }
    if (key === 'NoIniciado') {
        return {
            estado: 'Sin iniciar',
            accion: 'Elaborar',
            dotClass: 'bg-zinc-400 dark:bg-zinc-500',
            accionClass: 'text-[#0070f3] dark:text-blue-400'
        };
    }
    if (key === 'Borrador') {
        return {
            estado: 'Borrador',
            accion: 'Continuar',
            dotClass: 'bg-[#0070f3]',
            accionClass: 'text-[#0070f3] dark:text-blue-400'
        };
    }
    return {
        estado: 'Pendiente de firma',
        accion: 'Firmar',
        dotClass: 'bg-amber-500',
        accionClass: 'text-amber-700 dark:text-amber-400'
    };
};

export const PendientesResumenCard: React.FC<PendientesResumenCardProps> = ({
    revisionScopeLabel,
    pendientesRevision,
    misPendientes,
    misMateriasCount,
    isLoading = false,
    onAbrirPea,
    onVerRevisiones,
    onVerMisMaterias
}) => {
    const totalPendientes = pendientesRevision.length + misPendientes.length;

    const misPendientesOrdenados = React.useMemo(() => {
        const order: Record<string, number> = { Observado: 1, NoIniciado: 2, Borrador: 3 };
        return [...misPendientes].sort((a, b) => {
            const pA = order[normalizePeaStatus(a.estado)] ?? 4;
            const pB = order[normalizePeaStatus(b.estado)] ?? 4;
            if (pA !== pB) return pA - pB;
            return a.nombre_asignatura.localeCompare(b.nombre_asignatura);
        });
    }, [misPendientes]);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Pendientes
                </h2>
                {!isLoading && totalPendientes === 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Al día</span>
                    </span>
                )}
            </div>

            {isLoading ? (
                <div className="space-y-2 py-1">
                    <div className="h-9 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                    <div className="h-9 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                </div>
            ) : totalPendientes === 0 ? (
                <div className="flex items-center justify-between gap-3 py-1">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Sin revisiones ni asignaturas propias pendientes.
                    </p>
                    {misMateriasCount > 0 && (
                        <button
                            type="button"
                            onClick={onVerMisMaterias}
                            className="shrink-0 text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            Mis PEA ({misMateriasCount})
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-1 -mx-2">
                    {pendientesRevision.length > 0 ? (
                        <>
                            {pendientesRevision.slice(0, 2).map(pea => (
                                <button
                                    key={`rev-${pea.id_pea || pea.uuid}`}
                                    type="button"
                                    onClick={() => onAbrirPea(pea)}
                                    className="w-full py-2 px-2 hover:bg-slate-50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors flex items-center justify-between gap-3 text-left cursor-pointer group"
                                >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] mt-1.5 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug">
                                                {pea.nombre_asignatura}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                {pea.nombre_docente_elaborador || 'Docente'} · Por aprobar
                                            </p>
                                        </div>
                                    </div>
                                    <span className="shrink-0 text-xs font-semibold text-[#0070f3] dark:text-blue-400">
                                        Revisar
                                    </span>
                                </button>
                            ))}
                            {pendientesRevision.length > 2 && (
                                <div className="py-1.5 px-2">
                                    <button
                                        type="button"
                                        onClick={onVerRevisiones}
                                        className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                                    >
                                        Ver los {pendientesRevision.length} por revisar
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="py-1.5 px-2 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>{revisionScopeLabel}</span>
                            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Al día</span>
                            </span>
                        </div>
                    )}

                    {misPendientesOrdenados.length > 0 ? (
                        <>
                            {misPendientesOrdenados.slice(0, 3).map(pea => {
                                const detalle = getMiPendienteDetalle(pea);
                                return (
                                    <button
                                        key={`own-${pea.id_pea || pea.uuid}`}
                                        type="button"
                                        onClick={() => onAbrirPea(pea)}
                                        className="w-full py-2 px-2 hover:bg-slate-50 dark:hover:bg-zinc-900/60 rounded-lg transition-colors flex items-center justify-between gap-3 text-left cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-2.5 min-w-0">
                                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${detalle.dotClass}`} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug">
                                                    {pea.nombre_asignatura}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                    Mi asignatura · {detalle.estado}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`shrink-0 text-xs font-semibold ${detalle.accionClass}`}>
                                            {detalle.accion}
                                        </span>
                                    </button>
                                );
                            })}
                            {misPendientesOrdenados.length > 3 && (
                                <div className="py-1.5 px-2">
                                    <button
                                        type="button"
                                        onClick={onVerMisMaterias}
                                        className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                                    >
                                        Ver todas mis asignaturas ({misMateriasCount})
                                    </button>
                                </div>
                            )}
                        </>
                    ) : misMateriasCount > 0 && (
                        <div className="py-1.5 px-2 flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                            <span>Mis asignaturas</span>
                            <button
                                type="button"
                                onClick={onVerMisMaterias}
                                className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                                Al día ({misMateriasCount})
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

import React, { useState, useMemo } from 'react';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';

interface SalaMallaDocentesPanelProps {
    asignaturas: SalaAsignaturaItemDto[];
    carreraNombre: string;
    periodoActual: string;
}

interface GrupoNivel {
    key: string;
    label: string;
    orden: number;
    items: SalaAsignaturaItemDto[];
}

export const SalaMallaDocentesPanel: React.FC<SalaMallaDocentesPanelProps> = ({
    asignaturas,
    carreraNombre,
    periodoActual,
}) => {
    // Agrupar asignaturas por nivel/semestre con orden curricular y capitalización natural
    const gruposPorNivel = useMemo(() => {
        const mapa = new Map<string, GrupoNivel>();

        asignaturas.forEach((asig) => {
            const idNivel = asig.idNivel || asig.id_nivel || 99;
            const rawNivel = asig.nombreNivel || asig.nombre_nivel || `Nivel ${idNivel}`;
            const key = rawNivel.toLowerCase().trim();

            // Capitalización natural ("PRIMERO" -> "Primero")
            const label = rawNivel.charAt(0).toUpperCase() + rawNivel.slice(1).toLowerCase();

            if (!mapa.has(key)) {
                mapa.set(key, {
                    key,
                    label,
                    orden: idNivel,
                    items: [],
                });
            }
            mapa.get(key)!.items.push(asig);
        });

        return Array.from(mapa.values()).sort((a, b) => a.orden - b.orden);
    }, [asignaturas]);

    // Estado para la pestaña de semestre seleccionada (inicia vacío y sincroniza con el primer semestre)
    const [nivelSeleccionado, setNivelSeleccionado] = useState<string>('');

    // Semestre activo garantizado (por defecto el primer semestre disponible)
    const grupoActivo = useMemo(() => {
        if (gruposPorNivel.length === 0) return null;
        const match = gruposPorNivel.find((g) => g.key === nivelSeleccionado);
        return match || gruposPorNivel[0];
    }, [gruposPorNivel, nivelSeleccionado]);

    return (
        <div className="space-y-6">
            {/* Cabecera de la Sección */}
            <div className="border-b border-border-thin pb-4">
                <h2 className="text-sm font-semibold text-text-main">
                    Malla Curricular y Docentes Responsables
                </h2>
                <p className="text-xs text-text-dim mt-0.5">
                    Nómina de asignaturas y cuerpo docente de {carreraNombre} en el período {periodoActual}.
                </p>
            </div>

            {asignaturas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-thin bg-surface p-10 text-center space-y-2">
                    <p className="text-sm font-semibold text-text-main">
                        No se detectaron asignaturas asignadas para esta carrera
                    </p>
                    <p className="text-xs text-text-dim max-w-md mx-auto">
                        Verifica que el distributivo y la malla curricular se encuentren registrados en el período activo de SIGAFI.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Riel Plano de Pestañas por Semestre (sin opción Todos) */}
                    <div className="border-b border-slate-200 dark:border-zinc-800">
                        <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
                            {gruposPorNivel.map((grupo) => {
                                const isActive = (grupoActivo?.key === grupo.key);
                                return (
                                    <button
                                        key={grupo.key}
                                        type="button"
                                        onClick={() => setNivelSeleccionado(grupo.key)}
                                        className={`pb-3 border-b-2 text-xs transition-colors cursor-pointer whitespace-nowrap ${
                                            isActive
                                                ? 'border-[#0070f3] dark:border-blue-400 text-[#0070f3] dark:text-blue-400 font-semibold'
                                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white font-medium'
                                        }`}
                                    >
                                        <span>{grupo.label}</span>
                                        <span className="ml-1.5 text-[11px] font-mono text-slate-400">
                                            ({grupo.items.length})
                                        </span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Lista de Materias del Semestre Activo */}
                    {grupoActivo && (
                        <div className="space-y-3">
                            <div className="rounded-xl border border-border-thin bg-surface divide-y divide-border-thin overflow-hidden shadow-2xs">
                                {grupoActivo.items.map((asig, idx) => {
                                        const cod = asig.codigoAsignatura || asig.codigo_asignatura;
                                        const nom = asig.nombreAsignatura || asig.nombre_asignatura || 'Sin nombre';
                                        const doc = asig.nombreDocenteResponsable || asig.nombre_docente_responsable;
                                        const estadoPea = asig.estadoPea || asig.estado_pea;
                                        const uniqueKey = asig.expedienteUuid || asig.expediente_uuid || (
                                            (asig.idExpediente || asig.id_expediente)
                                                ? `exp_${asig.idExpediente || asig.id_expediente}`
                                                : `asig_${asig.idAsignatura || asig.id_asignatura || cod}_${idx}`
                                        );

                                        return (
                                            <div
                                                key={uniqueKey}
                                                className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {cod && (
                                                            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                                                                {cod}
                                                            </span>
                                                        )}
                                                        <span className="font-semibold text-text-main">
                                                            {nom}
                                                        </span>
                                                    </div>
                                                    <div className="text-text-dim text-[11px]">
                                                        <span>Docente: <strong className="font-medium text-slate-700 dark:text-zinc-300">{doc || 'Por asignar'}</strong></span>
                                                    </div>
                                                </div>

                                                {estadoPea && (
                                                    <div className="shrink-0">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-border-thin bg-bg-deep text-text-main">
                                                            <span
                                                                className={`w-1.5 h-1.5 rounded-full ${
                                                                    estadoPea.toLowerCase().includes('aprob') || estadoPea.toLowerCase().includes('aval')
                                                                        ? 'bg-emerald-600'
                                                                        : estadoPea.toLowerCase().includes('observ')
                                                                            ? 'bg-amber-500'
                                                                            : 'bg-[#0070f3]'
                                                                }`}
                                                            />
                                                            {estadoPea}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
};

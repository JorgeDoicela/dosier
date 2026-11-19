import React, { useMemo } from 'react';
import { Layers, User, BookOpen } from 'lucide-react';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';

interface SalaMallaDocentesPanelProps {
    asignaturas: SalaAsignaturaItemDto[];
    carreraNombre: string;
    periodoActual: string;
}

export const SalaMallaDocentesPanel: React.FC<SalaMallaDocentesPanelProps> = ({
    asignaturas,
    carreraNombre,
    periodoActual,
}) => {
    // Agrupar asignaturas por nivel/semestre
    const gruposPorNivel = useMemo(() => {
        const mapa = new Map<string, SalaAsignaturaItemDto[]>();
        asignaturas.forEach((asig) => {
            const nivel = asig.nombreNivel || asig.nombre_nivel || 'Nivel General';
            if (!mapa.has(nivel)) {
                mapa.set(nivel, []);
            }
            mapa.get(nivel)!.push(asig);
        });
        return Array.from(mapa.entries());
    }, [asignaturas]);

    return (
        <div className="space-y-6">
            <div className="border-b border-border-thin pb-4">
                <div className="flex items-center gap-2 mb-1">
                    <Layers size={16} className="text-[#0070f3]" />
                    <h2 className="text-sm font-semibold text-text-main">
                        Malla Curricular y Docentes Responsables
                    </h2>
                </div>
                <p className="text-xs text-text-dim">
                    Nómina de asignaturas y cuerpo docente de {carreraNombre} en el período {periodoActual}. Información de referencia para la coordinación colegiada.
                </p>
            </div>

            {asignaturas.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-thin bg-surface p-10 text-center space-y-2">
                    <BookOpen size={24} className="mx-auto text-text-dim stroke-[1.5]" />
                    <p className="text-sm font-semibold text-text-main">
                        No se detectaron asignaturas asignadas para esta carrera
                    </p>
                    <p className="text-xs text-text-dim max-w-md mx-auto">
                        Verifica que el distributivo y la malla curricular se encuentren registrados en el período activo de SIGAFI.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {gruposPorNivel.map(([nivel, lista]) => (
                        <div key={nivel} className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-main">
                                    {nivel}
                                </h3>
                                <span className="text-[11px] font-mono text-text-dim">
                                    ({lista.length} {lista.length === 1 ? 'materia' : 'materias'})
                                </span>
                            </div>

                            <div className="rounded-xl border border-border-thin bg-surface divide-y divide-border-thin overflow-hidden shadow-2xs">
                                {lista.map((asig, idx) => {
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
                                                <div className="flex items-center gap-1.5 text-text-dim text-[11px]">
                                                    <User size={12} className="shrink-0" />
                                                    <span>Docente: {doc || 'Por asignar'}</span>
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
                    ))}
                </div>
            )}
        </div>
    );
};

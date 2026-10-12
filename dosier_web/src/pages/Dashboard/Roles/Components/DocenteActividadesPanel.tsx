import React, { useMemo } from 'react';
import type { DocenteAsignaturaDto } from '../../../../services/docenteAsignaturasService';
import {
    ArrowRight,
    PlusCircle,
    Building2,
    Loader2,
    ListTodo
} from 'lucide-react';

interface Props {
    materias: DocenteAsignaturaDto[];
    loading?: boolean;
    onIniciarPea: (asignacion: DocenteAsignaturaDto) => void;
    onContinuarPea: (asignacion: DocenteAsignaturaDto) => void;
    creatingPeaId: number | null;
}

export const getAvanceDetalle = (estado: string) => {
    switch (estado) {
        case 'Aprobado':
        case 'Publicado':
            return {
                porcentaje: 100,
                etiqueta: '100% · Aprobado y Legalizado',
                colorBarra: 'bg-emerald-500',
                colorTexto: 'text-emerald-700 dark:text-emerald-300'
            };
        case 'RevisadoAcad':
            return {
                porcentaje: 90,
                etiqueta: '90% · Aval Académico Emitido',
                colorBarra: 'bg-emerald-600',
                colorTexto: 'text-emerald-600 dark:text-emerald-400'
            };
        case 'RevisadoCoord':
            return {
                porcentaje: 75,
                etiqueta: '75% · Aval de Carrera Emitido',
                colorBarra: 'bg-[#0070f3]',
                colorTexto: 'text-[#0070f3] dark:text-blue-400'
            };
        case 'EnRevision':
            return {
                porcentaje: 50,
                etiqueta: '50% · En Revisión de Carrera',
                colorBarra: 'bg-[#0070f3]',
                colorTexto: 'text-[#0070f3] dark:text-blue-400'
            };
        case 'Corregido':
            return {
                porcentaje: 40,
                etiqueta: '40% · Corregido',
                colorBarra: 'bg-blue-500',
                colorTexto: 'text-blue-600 dark:text-blue-400'
            };
        case 'Observado':
            return {
                porcentaje: 30,
                etiqueta: '30% · Con Observaciones Pendientes',
                colorBarra: 'bg-amber-500',
                colorTexto: 'text-amber-700 dark:text-amber-300'
            };
        case 'Borrador':
            return {
                porcentaje: 25,
                etiqueta: '25% · En Formulación (Borrador)',
                colorBarra: 'bg-zinc-400 dark:bg-zinc-500',
                colorTexto: 'text-zinc-600 dark:text-zinc-300'
            };
        default:
            return {
                porcentaje: 0,
                etiqueta: '0% · Sin Iniciar',
                colorBarra: 'bg-slate-200 dark:bg-zinc-800',
                colorTexto: 'text-zinc-400 dark:text-zinc-500'
            };
    }
};

export const DocenteActividadesPanel: React.FC<Props> = ({
    materias,
    loading,
    onIniciarPea,
    onContinuarPea,
    creatingPeaId
}) => {
    // Ordenar materias por prioridad de acción:
    // 1. Observadas, 2. No iniciadas, 3. Borradores, 4. En revisión, 5. Aprobadas
    const materiasOrdenadas = useMemo(() => {
        const priorityOrder: Record<string, number> = {
            'Observado': 1,
            'NoIniciado': 2,
            '': 2,
            'Borrador': 3,
            'Corregido': 3,
            'EnRevision': 4,
            'RevisadoCoord': 5,
            'RevisadoAcad': 6,
            'Aprobado': 7,
            'Publicado': 7
        };

        return [...materias].sort((a, b) => {
            const pA = priorityOrder[a.estado_pea || ''] ?? 99;
            const pB = priorityOrder[b.estado_pea || ''] ?? 99;
            if (pA !== pB) return pA - pB;
            return a.nombre_asignatura.localeCompare(b.nombre_asignatura);
        });
    }, [materias]);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-4">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-900">
                <div className="flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-[#0070f3]" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        Actividades y Formulación Curricular
                    </h2>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-semibold font-mono border border-slate-200 dark:border-zinc-700">
                    {materias.length} {materias.length === 1 ? 'asignatura' : 'asignaturas'}
                </span>
            </div>

            {/* Lista de Actividades por Asignatura */}
            {loading ? (
                <div className="space-y-3 py-2">
                    <div className="h-24 bg-slate-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                    <div className="h-24 bg-slate-100 dark:bg-zinc-900 rounded-xl animate-pulse" />
                </div>
            ) : materiasOrdenadas.length === 0 ? (
                <div className="py-10 text-center text-zinc-500 text-xs rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                    No se registran asignaturas asignadas en el período seleccionado.
                </div>
            ) : (
                <div className="space-y-3">
                    {materiasOrdenadas.map(materia => {
                        const tienePea = Boolean(materia.id_pea && materia.id_pea > 0);
                        const isCreating = creatingPeaId === materia.id_asignacion;
                        const avance = getAvanceDetalle(materia.estado_pea);
                        const esObservado = materia.estado_pea === 'Observado';

                        const handleCardClick = () => {
                            if (isCreating) return;
                            if (tienePea) {
                                onContinuarPea(materia);
                            } else {
                                onIniciarPea(materia);
                            }
                        };

                        const accionTexto = tienePea
                            ? (esObservado
                                ? 'Corregir PEA'
                                : materia.estado_pea === 'Aprobado'
                                ? 'Ver PEA'
                                : 'Continuar PEA')
                            : 'Elaborar PEA';

                        return (
                            <div
                                key={materia.id_asignacion}
                                onClick={handleCardClick}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleCardClick();
                                    }
                                }}
                                tabIndex={0}
                                role="button"
                                aria-label={`${accionTexto} de ${materia.nombre_asignatura}`}
                                className={`group rounded-xl border p-4 transition-all flex flex-col justify-between space-y-3 bg-white dark:bg-zinc-950 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#0070f3]/40 ${
                                    esObservado
                                        ? 'border-amber-300 dark:border-amber-900/70 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400 dark:hover:border-amber-700 hover:shadow-xs'
                                        : 'border-slate-200 dark:border-zinc-800 hover:border-[#0070f3]/60 dark:hover:border-[#0070f3]/60 hover:shadow-xs'
                                }`}
                            >
                                {/* Top: Título y Datos de la Asignatura */}
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            <Building2 className="w-3.5 h-3.5 text-[#0070f3] shrink-0" />
                                            <span className="truncate">{materia.nombre_carrera}</span>
                                            <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                            <span>Paralelo {materia.paralelo}</span>
                                        </div>

                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-[#0070f3] transition-colors">
                                            {materia.nombre_asignatura}
                                        </h3>
                                    </div>

                                    {/* Botón de Acción Directa */}
                                    <div className="shrink-0 pt-1 sm:pt-0">
                                        {tienePea ? (
                                            <span
                                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all shadow-xs inline-flex items-center gap-1.5 ${
                                                    esObservado
                                                        ? 'bg-amber-600 group-hover:bg-amber-700 text-white'
                                                        : 'bg-[#0070f3] group-hover:bg-[#005bb5] text-white'
                                                }`}
                                            >
                                                <span>{accionTexto}</span>
                                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                            </span>
                                        ) : (
                                            <span
                                                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] group-hover:bg-[#005bb5] text-white transition-all shadow-xs inline-flex items-center gap-1.5 ${
                                                    isCreating ? 'opacity-70' : ''
                                                }`}
                                            >
                                                {isCreating ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Iniciando...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlusCircle className="w-3.5 h-3.5 group-hover:scale-105 transition-transform" />
                                                        <span>Elaborar PEA</span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Cuánto ha avanzado abajo de cada uno */}
                                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-zinc-900">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                                            Avance de Formulación
                                        </span>
                                        <span className={`font-mono text-xs font-semibold ${avance.colorTexto}`}>
                                            {avance.etiqueta}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${avance.colorBarra}`}
                                            style={{ width: `${avance.porcentaje}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

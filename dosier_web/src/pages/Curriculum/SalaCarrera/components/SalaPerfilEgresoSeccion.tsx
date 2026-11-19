import React, { useState, useEffect, useMemo } from 'react';
import { Award, BookOpen, Layers, Plus, CheckCircle2, ChevronRight, FileText } from 'lucide-react';
import { getPerfilEgreso, type PerfilEgresoDto, type PerfilEgresoResultadoDto } from '../../../../services/normativaService';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';

interface SalaPerfilEgresoSeccionProps {
    idCarrera: number;
    carreraNombre: string;
    idMalla?: number;
    asignaturas: SalaAsignaturaItemDto[];
    onCrearAcuerdoPizarra?: (titulo: string, descripcion: string, categoria: string) => void;
}

export const SalaPerfilEgresoSeccion: React.FC<SalaPerfilEgresoSeccionProps> = ({
    idCarrera,
    carreraNombre,
    idMalla = 23,
    asignaturas,
    onCrearAcuerdoPizarra,
}) => {
    const [perfil, setPerfil] = useState<PerfilEgresoDto | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filtroNivel, setFiltroNivel] = useState<string>('todos');

    // Estado del modal de acuerdo vinculado al perfil
    const [modalAcuerdo, setModalAcuerdo] = useState<{ open: boolean; rda?: PerfilEgresoResultadoDto }>({
        open: false,
    });
    const [acuerdoTitulo, setAcuerdoTitulo] = useState<string>('');
    const [acuerdoDetalle, setAcuerdoDetalle] = useState<string>('');
    const [acuerdoCategoria, setAcuerdoCategoria] = useState<string>('Metodología');

    useEffect(() => {
        let mounted = true;
        const cargar = async () => {
            setIsLoading(true);
            try {
                const data = await getPerfilEgreso(idCarrera, idMalla);
                if (mounted && data) {
                    setPerfil(data);
                }
            } catch {
                if (mounted) setPerfil(null);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        cargar();
        return () => { mounted = false; };
    }, [idCarrera, idMalla]);

    // Niveles semestrales únicos de las asignaturas
    const nivelesDisponibles = useMemo(() => {
        const setNiv = new Set<string>();
        asignaturas.forEach((a) => {
            const nom = a.nombreNivel ?? a.nombre_nivel;
            if (nom) setNiv.add(nom);
        });
        return Array.from(setNiv);
    }, [asignaturas]);

    // Manejo de apertura de acuerdo sobre un RDA
    const handleAbrirAcuerdoRda = (rda: PerfilEgresoResultadoDto) => {
        setAcuerdoTitulo(`Alineación Perfil: ${rda.codigo}`);
        setAcuerdoDetalle(
            `Acuerdo curricular respecto al resultado de aprendizaje "${rda.codigo}: ${rda.descripcion}". Se consensúa fortalecer las evidencias evaluativas y proyectos en las asignaturas tributarias.`
        );
        setAcuerdoCategoria('Metodología');
        setModalAcuerdo({ open: true, rda });
    };

    const handleConfirmarAcuerdo = () => {
        if (!acuerdoTitulo.trim() || !onCrearAcuerdoPizarra) return;
        onCrearAcuerdoPizarra(acuerdoTitulo.trim(), acuerdoDetalle.trim(), acuerdoCategoria);
        setModalAcuerdo({ open: false });
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6 select-none">
            {/* Cabecera Informativa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#0070f3] font-semibold">
                        Marco Normativo Institucional • {carreraNombre}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                        Perfil de Egreso y Matriz de Tributación
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Competencias profesionales y resultados de aprendizaje institucionales que sustentan los PEA de la carrera.
                    </p>
                </div>
            </div>

            {/* Ficha Resumen del Perfil */}
            <div className="p-6 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                        Descripción General del Perfil Profesional
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Aprobación CES Vigente
                    </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                    {perfil?.descripcionGeneral ||
                        'El graduado del Instituto Superior Tecnológico Público de Excelencia Técnica (ISTPET) posee competencias especializadas para diseñar, implementar, mantener y evaluar soluciones técnicas rigurosas alineadas a las demandas del sector socioproductivo nacional y estándares vigentes.'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Carrera</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 truncate">{carreraNombre}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Malla de Referencia</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">Malla #{idMalla}</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Resultados Registrados</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{perfil?.resultados?.length || 0} RDA</p>
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">Cátedras del Período</span>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200">{asignaturas.length} asignaturas</p>
                    </div>
                </div>
            </div>

            {/* Lista de Resultados de Aprendizaje del Perfil (RDA) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                        Resultados de Aprendizaje de la Carrera (RDA)
                    </h3>
                    <span className="text-[11px] text-slate-500">
                        {perfil?.resultados?.length || 0} competencias específicas
                    </span>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                        Cargando matriz del perfil de egreso...
                    </div>
                ) : perfil?.resultados && perfil.resultados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {perfil.resultados.map((rda, idx) => (
                            <div
                                key={rda.idResultadoPerfil || idx}
                                className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3 transition-shadow hover:shadow-xs"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-[#0070f3] dark:text-blue-300">
                                            {rda.codigo || `RDA-${idx + 1}`}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            Resultado de Aprendizaje #{rda.orden || idx + 1}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleAbrirAcuerdoRda(rda)}
                                        className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-[#0070f3] dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
                                    >
                                        <Plus size={12} />
                                        <span>Proponer Acuerdo</span>
                                    </button>
                                </div>

                                <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                                    {rda.descripcion}
                                </p>

                                {/* Asignaturas de la carrera con nivel relacionado */}
                                <div className="pt-2 text-[11px] text-slate-500 dark:text-zinc-400 flex flex-wrap items-center gap-2">
                                    <span className="font-semibold text-slate-400 uppercase text-[10px]">
                                        Cátedras Vinculadas:
                                    </span>
                                    {asignaturas.slice(0, 4).map((asig, aidx) => (
                                        <span
                                            key={aidx}
                                            className="px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300"
                                        >
                                            {asig.nombreAsignatura || asig.nombre_asignatura}
                                        </span>
                                    ))}
                                    {asignaturas.length > 4 && (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            +{asignaturas.length - 4} más en la malla
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                        No se encontraron resultados de aprendizaje parametrizados para la malla de esta carrera.
                    </div>
                )}
            </div>

            {/* Modal de Acuerdo Vinculado al RDA */}
            {modalAcuerdo.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
                        <div className="space-y-1 border-b border-slate-100 dark:border-zinc-800 pb-3">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0070f3] font-semibold">
                                Acuerdo Vinculado al Perfil de Egreso
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {modalAcuerdo.rda?.codigo}
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Título del Acuerdo</label>
                                <input
                                    type="text"
                                    value={acuerdoTitulo}
                                    onChange={(e) => setAcuerdoTitulo(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Categoría</label>
                                <select
                                    value={acuerdoCategoria}
                                    onChange={(e) => setAcuerdoCategoria(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                >
                                    <option value="Metodología">Metodología</option>
                                    <option value="Evaluación">Evaluación</option>
                                    <option value="Proyectos de Aula">Proyectos de Aula</option>
                                    <option value="Infraestructura / TIC">Infraestructura / TIC</option>
                                    <option value="General">General</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Detalles consensuados</label>
                                <textarea
                                    value={acuerdoDetalle}
                                    onChange={(e) => setAcuerdoDetalle(e.target.value)}
                                    rows={4}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3] resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setModalAcuerdo({ open: false })}
                                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarAcuerdo}
                                disabled={!acuerdoTitulo.trim()}
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#0060df] disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                                Insertar en Pizarra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaPerfilEgresoSeccion;

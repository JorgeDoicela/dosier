import React, { useState, useEffect } from 'react';
import { BookOpen, Target, Award, ChevronDown, ChevronRight, Layers, ShieldCheck } from 'lucide-react';
import { getPerfilEgreso, getTributacionAsignatura, type PerfilEgresoDto, type AsignaturaTributacionDto } from '../../../../services/normativaService';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';

interface CareerProfileSidebarProps {
    carreraNombre: string;
    idCarrera: number;
    idMalla?: number;
    asignaturaSeleccionada?: SalaAsignaturaItemDto | null;
}

export const CareerProfileSidebar: React.FC<CareerProfileSidebarProps> = ({
    carreraNombre,
    idCarrera,
    idMalla,
    asignaturaSeleccionada
}) => {
    const [perfil, setPerfil] = useState<PerfilEgresoDto | null>(null);
    const [tributaciones, setTributaciones] = useState<AsignaturaTributacionDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRda, setExpandedRda] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let mounted = true;
        const cargarPerfil = async () => {
            if (!idCarrera) return;
            setIsLoading(true);
            try {
                const mallaId = idMalla || 1;
                const data = await getPerfilEgreso(idCarrera, mallaId);
                if (mounted && data) {
                    setPerfil(data);
                }
            } catch (err) {
                console.error('Error al cargar perfil de egreso:', err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        cargarPerfil();
        return () => { mounted = false; };
    }, [idCarrera, idMalla]);

    useEffect(() => {
        let mounted = true;
        const cargarTributacion = async () => {
            if (!asignaturaSeleccionada?.idAsignatura) {
                setTributaciones([]);
                return;
            }
            try {
                const mallaId = idMalla || 1;
                const data = await getTributacionAsignatura(asignaturaSeleccionada.idAsignatura, mallaId);
                if (mounted) {
                    setTributaciones(data);
                }
            } catch (err) {
                console.error('Error al cargar tributación de asignatura:', err);
            }
        };
        cargarTributacion();
        return () => { mounted = false; };
    }, [asignaturaSeleccionada?.idAsignatura, idMalla]);

    const toggleRda = (codigo: string) => {
        setExpandedRda(prev => ({ ...prev, [codigo]: !prev[codigo] }));
    };

    return (
        <aside className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 select-none">
            {/* Cabecera del Perfil */}
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Target size={15} className="text-[#0070f3] dark:text-blue-400 stroke-[1.75]" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold">
                        Marco Curricular de Carrera
                    </span>
                </div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                    {carreraNombre}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                    <ShieldCheck size={13} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Resolución CES Oficial ISTPET</span>
                </div>
            </div>

            {/* Contenido scrolleable del perfil */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
                {isLoading ? (
                    <div className="space-y-3 py-6">
                        <div className="h-4 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" />
                        <div className="h-16 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" />
                        <div className="h-24 bg-slate-100 dark:bg-zinc-900 rounded animate-pulse" />
                    </div>
                ) : perfil ? (
                    <>
                        {/* Descripción General del Perfil de Egreso */}
                        <div>
                            <div className="flex items-center gap-1.5 mb-2 text-slate-900 dark:text-white font-semibold">
                                <BookOpen size={14} className="text-slate-400 dark:text-zinc-500" />
                                <span>Perfil de Egreso Oficial</span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 leading-relaxed text-slate-700 dark:text-zinc-300 text-[11px]">
                                {perfil.descripcionGeneral || 'El egresado posee competencias sólidas para el análisis, formulación y desarrollo técnico integral conforme a los lineamientos aprobados por el CES.'}
                            </div>
                        </div>

                        {/* Asignatura Foco & Tributación */}
                        {asignaturaSeleccionada && (
                            <div className="p-3 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20">
                                <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold mb-1">
                                    <Layers size={13} />
                                    <span>Tributación de Asignatura Foco</span>
                                </div>
                                <div className="text-xs font-semibold text-slate-900 dark:text-white mb-2">
                                    {asignaturaSeleccionada.nombreAsignatura}
                                    {asignaturaSeleccionada.codigoAsignatura && (
                                        <span className="ml-1.5 font-mono text-[10px] text-slate-500">
                                            ({asignaturaSeleccionada.codigoAsignatura})
                                        </span>
                                    )}
                                </div>
                                {tributaciones.length > 0 ? (
                                    <div className="space-y-1.5">
                                        {tributaciones.map((trib) => (
                                            <div key={trib.idRelacion} className="text-[11px] flex items-start justify-between gap-2 p-1.5 rounded bg-white dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                                                <span className="font-mono text-slate-700 dark:text-zinc-300">
                                                    {trib.codigoRdaPerfil || 'RDA'}
                                                </span>
                                                <span className={`text-[10px] font-semibold ${
                                                    trib.nivelAporte === 'Avanzado' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    trib.nivelAporte === 'Medio' ? 'text-blue-600 dark:text-blue-400' :
                                                    'text-slate-500'
                                                }`}>
                                                    Aporte {trib.nivelAporte}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                        Sin matriz de tributación directa registrada en catálogo. Los acuerdos de esta sesión articularán el aporte al perfil.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Resultados de Aprendizaje de Carrera (RDA) */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-semibold">
                                    <Award size={14} className="text-[#0070f3] dark:text-blue-400" />
                                    <span>Resultados del Perfil (RDA Carrera)</span>
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">
                                    {perfil.resultados.length} RDAs
                                </span>
                            </div>

                            <div className="space-y-2">
                                {perfil.resultados.map((rda) => {
                                    const isOpen = Boolean(expandedRda[rda.codigo]);
                                    return (
                                        <div
                                            key={rda.idResultadoPerfil || rda.codigo}
                                            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => toggleRda(rda.codigo)}
                                                className="w-full px-3 py-2 text-left flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
                                            >
                                                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                                                    {rda.codigo}
                                                </span>
                                                {isOpen ? (
                                                    <ChevronDown size={14} className="text-slate-400 shrink-0" />
                                                ) : (
                                                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                                                )}
                                            </button>
                                            {isOpen && (
                                                <div className="px-3 pb-3 pt-1 text-[11px] leading-relaxed text-slate-600 dark:text-zinc-300 border-t border-slate-100 dark:border-zinc-800">
                                                    {rda.descripcion}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-slate-500">
                        No se encontró perfil de egreso registrado para esta carrera y malla.
                    </div>
                )}
            </div>
        </aside>
    );
};

export default CareerProfileSidebar;


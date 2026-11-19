import React, { useState, useEffect } from 'react';
import { getPerfilEgreso, getTributacionAsignatura, type PerfilEgresoDto, type AsignaturaTributacionDto } from '../../../../services/normativaService';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';

interface CareerProfileSidebarProps {
    carreraNombre: string;
    idCarrera: number;
    idMalla?: number;
    asignaturaSeleccionada?: SalaAsignaturaItemDto | null;
    hideHeader?: boolean;
}

export const CareerProfileSidebar: React.FC<CareerProfileSidebarProps> = ({
    carreraNombre,
    idCarrera,
    idMalla,
    asignaturaSeleccionada,
    hideHeader = false
}) => {
    const [perfil, setPerfil] = useState<PerfilEgresoDto | null>(null);
    const [tributaciones, setTributaciones] = useState<AsignaturaTributacionDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <aside className="w-full h-full flex flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 select-none">
            {/* Cabecera del Perfil */}
            {!hideHeader && (
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <span className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold mb-1">
                        Marco Curricular de Carrera
                    </span>
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                        {carreraNombre}
                    </h3>
                    <div className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                        <span>Resolución Oficial ISTPET</span>
                    </div>
                </div>
            )}

            {/* Contenido scrolleable del perfil */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
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
                            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                                Perfil de Egreso de la Carrera
                            </h5>
                            <p className="text-[12px] leading-relaxed text-slate-800 dark:text-zinc-200">
                                {perfil.descripcionGeneral || 'El egresado posee competencias sólidas para el análisis, formulación y desarrollo técnico integral conforme a los lineamientos aprobados para la carrera.'}
                            </p>
                        </div>

                        {/* Asignatura Foco & Tributación */}
                        {asignaturaSeleccionada && (
                            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                                <div className="flex items-center justify-between gap-3 mb-2">
                                    <h5 className="text-[11px] font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400">
                                        Tributación de Asignatura Foco
                                    </h5>
                                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                                        {asignaturaSeleccionada.nombreAsignatura}
                                        {asignaturaSeleccionada.codigoAsignatura && (
                                            <span className="ml-1 text-slate-400 font-normal">
                                                ({asignaturaSeleccionada.codigoAsignatura})
                                            </span>
                                        )}
                                    </span>
                                </div>
                                {tributaciones.length > 0 ? (
                                    <div className="divide-y divide-slate-100 dark:divide-zinc-800/70 border-y border-slate-100 dark:border-zinc-800/70">
                                        {tributaciones.map((trib) => (
                                            <div key={trib.idRelacion} className="py-2 flex items-center justify-between text-[11px]">
                                                <span className="font-mono text-slate-800 dark:text-zinc-200 font-medium">
                                                    {trib.codigoRdaPerfil || 'RDA'}
                                                </span>
                                                <span className={`text-[10px] font-semibold ${trib.nivelAporte === 'Avanzado' ? 'text-emerald-600 dark:text-emerald-400' :
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

                        {/* Resultados de Aprendizaje de Carrera (RDA) Directos sin cuadro ni conteo */}
                        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                            <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-2">
                                Resultados del Perfil (RDA Carrera)
                            </h5>

                            <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                {perfil.resultados.map((rda) => (
                                    <div key={rda.idResultadoPerfil || rda.codigo} className="py-2.5 first:pt-1 last:pb-0">
                                        <div className="font-mono text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">
                                            {rda.codigo}
                                        </div>
                                        <p className="text-[12px] leading-relaxed text-slate-700 dark:text-zinc-300">
                                            {rda.descripcion}
                                        </p>
                                    </div>
                                ))}
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


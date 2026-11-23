import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Loader2 } from 'lucide-react';
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import { salaCarreraService, type SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';
import type { PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

interface MallaDocentesPopoverProps {
    idCarrera: number;
    asignaturas: SalaAsignaturaItemDto[];
    carreraNombre: string;
    periodoActual: string;
    periodosDisponibles?: PeriodoAcademicoDto[];
}

interface GrupoNivel {
    key: string;
    label: string;
    orden: number;
    items: SalaAsignaturaItemDto[];
}

export const MallaDocentesPopover: React.FC<MallaDocentesPopoverProps> = ({
    idCarrera,
    asignaturas,
    carreraNombre,
    periodoActual,
    periodosDisponibles = [],
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [arrowOffset, setArrowOffset] = useState<number>(75);

    const [periodoFiltro, setPeriodoFiltro] = useState<string>(periodoActual);
    const [modalidadFiltro, setModalidadFiltro] = useState<string>('TODAS');
    const [asignaturasConsultadas, setAsignaturasConsultadas] = useState<SalaAsignaturaItemDto[] | null>(null);
    const [cargandoPeriodo, setCargandoPeriodo] = useState<boolean>(false);

    // Consulta asíncrona local si el usuario selecciona otro período para consultar
    useEffect(() => {
        if (!idCarrera || periodoFiltro === periodoActual) {
            setAsignaturasConsultadas(null);
            setCargandoPeriodo(false);
            return;
        }

        let isMountedFlag = true;
        setCargandoPeriodo(true);
        salaCarreraService.getEstado(idCarrera, periodoFiltro)
            .then((data) => {
                if (isMountedFlag) {
                    setAsignaturasConsultadas(data?.asignaturas || []);
                    setCargandoPeriodo(false);
                }
            })
            .catch(() => {
                if (isMountedFlag) {
                    setAsignaturasConsultadas([]);
                    setCargandoPeriodo(false);
                }
            });

        return () => {
            isMountedFlag = false;
        };
    }, [idCarrera, periodoFiltro, periodoActual]);

    const asignaturasActivas = useMemo(() => {
        if (periodoFiltro === periodoActual) {
            return asignaturas;
        }
        return asignaturasConsultadas ?? [];
    }, [periodoFiltro, periodoActual, asignaturas, asignaturasConsultadas]);

    // Opciones para el selector de modalidad extraídas dinámicamente de la nómina
    const opcionesModalidad = useMemo(() => {
        const mapa = new Set<string>();
        asignaturasActivas.forEach((a) => {
            const rawMod = a.nombreModalidad || a.nombre_modalidad;
            if (rawMod && rawMod.trim()) {
                mapa.add(rawMod.trim());
            }
        });

        // Asegurar que las modalidades normativas del ISTPET registradas en BD se incluyan si existen en las asignaturas
        ['Presencial', 'En linea', 'Hibrida', 'Semipresencial'].forEach((std) => {
            if (
                asignaturasActivas.some((a) =>
                    (a.nombreModalidad || a.nombre_modalidad || '')
                        .toLowerCase()
                        .includes(std.toLowerCase())
                )
            ) {
                mapa.add(std);
            }
        });

        const lista = Array.from(mapa).map((m) => {
            const labelNorm = m.charAt(0).toUpperCase() + m.slice(1).toLowerCase();
            return {
                value: m,
                label: labelNorm,
            };
        });

        return [
            { value: 'TODAS', label: 'Todas' },
            ...lista,
        ];
    }, [asignaturasActivas]);

    // Asignaturas filtradas por modalidad
    const asignaturasFiltradas = useMemo(() => {
        if (modalidadFiltro === 'TODAS') return asignaturasActivas;
        const qMod = modalidadFiltro.toLowerCase().trim();
        return asignaturasActivas.filter((asig) => {
            const mod = (asig.nombreModalidad || asig.nombre_modalidad || 'Presencial')
                .toLowerCase()
                .trim();
            return mod === qMod || mod.includes(qMod);
        });
    }, [asignaturasActivas, modalidadFiltro]);

    // Agrupar asignaturas por nivel/semestre con orden curricular y capitalización natural
    const gruposPorNivel = useMemo(() => {
        const mapa = new Map<string, GrupoNivel>();

        asignaturasFiltradas.forEach((asig) => {
            const idNivel = asig.idNivel || asig.id_nivel || 99;
            const rawNivel = asig.nombreNivel || asig.nombre_nivel || `Nivel ${idNivel}`;
            const key = rawNivel.toLowerCase().trim();
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
    }, [asignaturasFiltradas]);

    // Estado del semestre activo (sin opción Todos; por defecto el primer semestre)
    const [nivelSeleccionado, setNivelSeleccionado] = useState<string>('');

    const grupoActivo = useMemo(() => {
        if (gruposPorNivel.length === 0) return null;
        const match = gruposPorNivel.find((g) => g.key === nivelSeleccionado);
        return match || gruposPorNivel[0];
    }, [gruposPorNivel, nivelSeleccionado]);

    // Calcular con precisión el centro del botón disparador para centrar la viñeta
    useEffect(() => {
        if (buttonRef.current) {
            const width = buttonRef.current.offsetWidth;
            if (width > 0) {
                setArrowOffset(Math.round(width / 2));
            }
        }
    }, [isOpen]);

    // Sincronizar período
    useEffect(() => {
        setPeriodoFiltro(periodoActual);
    }, [periodoActual]);

    // Transición suave de apertura y cierre tipo macOS
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        let rafId: number;

        if (isOpen) {
            setIsMounted(true);
            rafId = requestAnimationFrame(() => {
                rafId = requestAnimationFrame(() => {
                    setIsVisible(true);
                });
            });
        } else {
            setIsVisible(false);
            timer = setTimeout(() => {
                setIsMounted(false);
            }, 180);
        }

        return () => {
            clearTimeout(timer);
            cancelAnimationFrame(rafId);
        };
    }, [isOpen]);

    // Cerrar al hacer clic fuera (ignorando clics en portales de GeistSelect)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (
                target &&
                (containerRef.current?.contains(target) ||
                 target.closest('[data-geist-select-portal]') ||
                 target.closest('.geist-select-portal'))
            ) {
                return;
            }
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Cerrar con Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Opciones para el selector de período usando el nombre descriptivo (detalle) de la base de datos
    const opcionesPeriodo = useMemo(() => {
        if (!periodosDisponibles || periodosDisponibles.length === 0) {
            return [
                { value: 'OCT2026', label: 'OCT2026' },
                { value: 'ABR2026', label: 'ABR2026' },
            ];
        }
        return periodosDisponibles.map((p) => {
            const detalle = p.detalle?.trim();
            const nombre = detalle || p.nombre_periodo || p.nombrePeriodo || p.id_periodo;
            return {
                value: p.id_periodo,
                label: nombre,
            };
        });
    }, [periodosDisponibles]);

    return (
        <div className="relative" ref={containerRef}>
            {/* Botón Disparador en la Cabecera */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none border ${
                    isOpen
                        ? 'border-[#0070f3] bg-[#0070f3] text-white shadow-2xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-[#0070f3] dark:hover:border-blue-500 hover:text-[#0070f3] dark:hover:text-blue-400'
                }`}
                title="Consultar Malla Curricular y Docentes anclado"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <span>Malla y Docentes</span>
            </button>

            {/* Popover Anclado Justo Debajo del Botón con Animación macOS */}
            {isMounted && (
                <div
                    role="dialog"
                    aria-label="Malla Curricular y Docentes"
                    className={`absolute top-full mt-2.5 left-0 z-[120] w-[760px] max-w-[calc(100vw-32px)] select-none flex flex-col transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isVisible
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none'
                    }`}
                    style={{
                        height: '74vh',
                        maxHeight: 'calc(100vh - 90px)',
                        minHeight: '480px',
                        transformOrigin: `${arrowOffset}px 0px`,
                    }}
                >
                    {/* Viñeta / Flecha conector macOS apuntando con precisión al botón */}
                    <div
                        style={{ left: `${arrowOffset}px` }}
                        className="absolute -top-[7px] -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-zinc-950 border-t border-l border-slate-300 dark:border-zinc-700 rotate-45 z-30 pointer-events-none shadow-xs"
                    />

                    {/* Contenedor Interior con Bordes Redondeados macOS */}
                    <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
                        {/* Cabecera del Popover en una sola línea sin palabras redundantes */}
                        <div className="px-6 py-3.5 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0 relative">
                            <div className="min-w-0 flex items-center gap-4">
                                <div className="shrink-0">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight flex items-center gap-2">
                                        <span>Malla Curricular y Docentes</span>
                                        {cargandoPeriodo && (
                                            <Loader2 size={13} className="animate-spin text-[#0070f3]" />
                                        )}
                                    </h4>
                                    <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400 truncate">
                                        {carreraNombre}
                                    </p>
                                </div>

                                {/* Selectores de Período y Modalidad juntos en la misma línea */}
                                <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-zinc-800">
                                    {opcionesPeriodo.length > 0 && (
                                        <div className="w-52">
                                            <GeistSelect
                                                value={periodoFiltro}
                                                options={opcionesPeriodo}
                                                onChange={(val) => {
                                                    const nuevoP = String(val);
                                                    setPeriodoFiltro(nuevoP);
                                                }}
                                                size="sm"
                                                className="w-full text-[11px]"
                                            />
                                        </div>
                                    )}

                                    {opcionesModalidad.length > 1 && (
                                        <div className="w-32">
                                            <GeistSelect
                                                value={modalidadFiltro}
                                                options={opcionesModalidad}
                                                onChange={(val) => setModalidadFiltro(String(val))}
                                                size="sm"
                                                className="w-full text-[11px]"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
                                title="Cerrar"
                                aria-label="Cerrar panel"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Riel Plano de Semestres (sin opción Todos) */}
                        <div className="px-6 pt-2 border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-white dark:bg-zinc-950">
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

                        {/* Contenido scrolleable: Lista de Materias del Semestre */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-6 bg-white dark:bg-zinc-950">
                            {cargandoPeriodo ? (
                                <div className="h-48 flex flex-col items-center justify-center text-slate-400 dark:text-zinc-500 gap-2">
                                    <Loader2 size={20} className="animate-spin text-[#0070f3]" />
                                    <span className="text-xs">Consultando asignaturas del período {periodoFiltro}...</span>
                                </div>
                            ) : grupoActivo && grupoActivo.items.length > 0 ? (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                    {grupoActivo.items.map((asig, idx) => {
                                        const nom = asig.nombreAsignatura || asig.nombre_asignatura || 'Sin nombre';
                                        const doc = asig.nombreDocenteResponsable || asig.nombre_docente_responsable;
                                        const mod = asig.nombreModalidad || asig.nombre_modalidad || 'Presencial';
                                        const par = asig.paralelo;
                                        const uniqueKey = asig.expedienteUuid || asig.expediente_uuid || (
                                            (asig.idExpediente || asig.id_expediente)
                                                 ? `exp_${asig.idExpediente || asig.id_expediente}`
                                                 : `asig_${asig.idAsignatura || asig.id_asignatura || idx}_${idx}`
                                        );

                                        return (
                                            <div
                                                key={uniqueKey}
                                                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="min-w-0 space-y-1">
                                                    <h5 className="font-semibold text-slate-900 dark:text-white text-xs leading-snug">
                                                        {nom}
                                                    </h5>
                                                    <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-500 dark:text-zinc-400">
                                                        <span>
                                                            Docente: <strong className="font-medium text-slate-700 dark:text-zinc-300">{doc || 'Por asignar'}</strong>
                                                        </span>
                                                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                                                        <span className="inline-flex items-center text-[10px] font-medium text-slate-600 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded">
                                                            {mod}{par ? ` • Paralelo ${par}` : ''}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center text-slate-400 dark:text-zinc-500 text-xs">
                                    No hay asignaturas registradas para este nivel en el período {periodoFiltro}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

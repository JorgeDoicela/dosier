import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';
import type { PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

interface MallaDocentesPopoverProps {
    asignaturas: SalaAsignaturaItemDto[];
    carreraNombre: string;
    periodoActual: string;
    periodosDisponibles?: PeriodoAcademicoDto[];
    onSincronizarPeriodoSala?: (nuevoPeriodo: string) => void;
}

interface GrupoNivel {
    key: string;
    label: string;
    orden: number;
    items: SalaAsignaturaItemDto[];
}

export const MallaDocentesPopover: React.FC<MallaDocentesPopoverProps> = ({
    asignaturas,
    carreraNombre,
    periodoActual,
    periodosDisponibles = [],
    onSincronizarPeriodoSala,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [arrowOffset, setArrowOffset] = useState<number>(75);

    const [periodoFiltro, setPeriodoFiltro] = useState<string>(periodoActual);

    // Agrupar asignaturas por nivel/semestre con orden curricular y capitalización natural
    const gruposPorNivel = useMemo(() => {
        const mapa = new Map<string, GrupoNivel>();

        asignaturas.forEach((asig) => {
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
    }, [asignaturas]);

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

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
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

    // Opciones para el selector de período
    const opcionesPeriodo = useMemo(() => {
        if (!periodosDisponibles || periodosDisponibles.length === 0) {
            return [
                { value: 'OCT2026', label: 'OCT2026' },
                { value: 'ABR2026', label: 'ABR2026' },
            ];
        }
        return periodosDisponibles.map((p) => ({
            value: p.id_periodo,
            label: p.nombre_periodo ? `${p.id_periodo} - ${p.nombre_periodo}` : p.id_periodo,
        }));
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
                <span className="ml-1.5 font-mono text-[10px] opacity-80">
                    ({asignaturas.length})
                </span>
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
                        {/* Cabecera del Popover con Período Integrado */}
                        <div className="px-6 py-3.5 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 relative">
                            <div className="min-w-0 pr-4 flex items-center gap-4 flex-wrap">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                        Malla Curricular y Docentes
                                    </h4>
                                    <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400 truncate">
                                        {carreraNombre} • {asignaturas.length} asignaturas
                                    </p>
                                </div>

                                {opcionesPeriodo.length > 0 && (
                                    <div className="flex items-center gap-1.5 pl-4 border-l border-slate-200 dark:border-zinc-800">
                                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold shrink-0">
                                            Período:
                                        </span>
                                        <div className="w-44">
                                            <GeistSelect
                                                value={periodoFiltro}
                                                options={opcionesPeriodo}
                                                onChange={(val) => {
                                                    const nuevoP = String(val);
                                                    setPeriodoFiltro(nuevoP);
                                                    onSincronizarPeriodoSala?.(nuevoP);
                                                }}
                                                size="sm"
                                                className="w-full text-[11px]"
                                            />
                                        </div>
                                    </div>
                                )}
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
                            {grupoActivo && (
                                <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
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
                                                className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="min-w-0 space-y-0.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {cod && (
                                                            <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                                                                {cod}
                                                            </span>
                                                        )}
                                                        <span className="font-semibold text-slate-900 dark:text-white">
                                                            {nom}
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-500 dark:text-zinc-400 text-[11px]">
                                                        <span>Docente: <strong className="font-medium text-slate-700 dark:text-zinc-300">{doc || 'Por asignar'}</strong></span>
                                                    </div>
                                                </div>

                                                {estadoPea && (
                                                    <div className="shrink-0">
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">
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
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

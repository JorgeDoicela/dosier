import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { CareerProfileSidebar } from './CareerProfileSidebar';
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import type { PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

interface PerfilEgresoPopoverProps {
    carreraNombre: string;
    idCarrera: number;
    idMalla?: number;
    periodoActual?: string;
    periodosDisponibles?: PeriodoAcademicoDto[];
    onSincronizarPeriodoSala?: (nuevoPeriodo: string) => void;
}

export const PerfilEgresoPopover: React.FC<PerfilEgresoPopoverProps> = ({
    carreraNombre,
    idCarrera,
    idMalla = 23,
    periodoActual = 'OCT2026',
    periodosDisponibles = [],
    onSincronizarPeriodoSala,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [arrowOffset, setArrowOffset] = useState<number>(70);

    const [periodoFiltro, setPeriodoFiltro] = useState<string>(periodoActual);

    // Calcular con precisión el centro del botón disparador para centrar la viñeta
    useEffect(() => {
        if (buttonRef.current) {
            const width = buttonRef.current.offsetWidth;
            if (width > 0) {
                setArrowOffset(Math.round(width / 2));
            }
        }
    }, [isOpen]);

    // Transición suave de apertura y cierre tipo macOS con retención de montaje
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

    // Sincronizar estado inicial
    useEffect(() => {
        setPeriodoFiltro(periodoActual);
    }, [periodoActual]);

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
        return periodosDisponibles.map(p => ({
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
                onClick={() => setIsOpen(prev => !prev)}
                className={`flex items-center px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer select-none border ${
                    isOpen
                        ? 'border-[#0070f3] bg-[#0070f3] text-white shadow-2xs'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:border-[#0070f3] dark:hover:border-blue-500 hover:text-[#0070f3] dark:hover:text-blue-400'
                }`}
                title="Consultar Perfil de Egreso anclado"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
            >
                <span>Perfil de Egreso</span>
            </button>

            {/* Popover Anclado Justo Debajo del Botón con Animación macOS */}
            {isMounted && (
                <div
                    role="dialog"
                    aria-label="Perfil de Egreso"
                    className={`absolute top-full mt-2.5 left-0 z-[120] w-[640px] max-w-[calc(100vw-32px)] select-none flex flex-col transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                        isVisible
                            ? 'opacity-100 scale-100 translate-y-0'
                            : 'opacity-0 scale-95 -translate-y-1.5 pointer-events-none'
                    }`}
                    style={{
                        height: '70vh',
                        maxHeight: 'calc(100vh - 90px)',
                        minHeight: '420px',
                        transformOrigin: `${arrowOffset}px 0px`,
                    }}
                >
                    {/* Viñeta / Flecha conector macOS apuntando con precisión al botón */}
                    <div
                        style={{ left: `${arrowOffset}px` }}
                        className="absolute -top-[7px] -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-zinc-950 border-t border-l border-slate-300 dark:border-zinc-700 rotate-45 z-30 pointer-events-none shadow-xs"
                    />

                    {/* Contenedor Interior con Bordes Redondeados macOS y Contenido */}
                    <div className="w-full h-full bg-white dark:bg-zinc-950 rounded-2xl border border-slate-300 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col">
                        {/* Cabecera del Popover con Período Integrado */}
                        <div className="px-6 py-3.5 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between shrink-0 relative">
                            <div className="min-w-0 pr-4 flex items-center gap-4 flex-wrap">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                                        Perfil de Egreso
                                    </h4>
                                    <p className="text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400 truncate">
                                        {carreraNombre}
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

                        {/* Contenido scrolleable: Perfil de Egreso y RDAs de la Carrera */}
                        <div className="flex-1 min-h-0 overflow-hidden bg-white dark:bg-zinc-950 flex flex-col">
                            <CareerProfileSidebar
                                carreraNombre={carreraNombre}
                                idCarrera={idCarrera}
                                idMalla={idMalla}
                                hideHeader={true}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

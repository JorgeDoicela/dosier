import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    StickyNote,
    CheckCircle2,
    Type,
    ZoomIn,
    ZoomOut,
    Check,
    Loader2
} from 'lucide-react';
import type { PizarraColor } from '../types';
import { PIZARRA_COLORS } from '../types';
import { GeistSelect } from '../../../../../components/Common/GeistSelect';
import type { PeriodoAcademicoDto } from '../../../../../services/docenteAsignaturasService';

export interface PizarraCollabUser {
    id: string | number;
    name: string;
    color: string;
    initials: string;
}

interface PizarraToolbarProps {
    zoom: number;
    isConnected: boolean;
    activeUsersCount?: number;
    activeUsers?: PizarraCollabUser[];
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    onSaveNow?: () => void;
    onAddSticky: (color: PizarraColor) => void;
    onAddAcuerdo: () => void;
    onAddText: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    periodoActual?: string;
    periodosDisponibles?: PeriodoAcademicoDto[];
    onCambiarPeriodo?: (nuevoPeriodo: string) => void;
}

export const PizarraToolbar: React.FC<PizarraToolbarProps> = ({
    zoom,
    isConnected,
    activeUsersCount,
    activeUsers = [],
    saveStatus = 'idle',
    onSaveNow,
    onAddSticky,
    onAddAcuerdo,
    onAddText,
    onZoomIn,
    onZoomOut,
    onResetZoom,
    periodoActual,
    periodosDisponibles = [],
    onCambiarPeriodo,
}) => {
    const isSaving = saveStatus === 'saving';

    const opcionesPeriodo = useMemo(() => {
        if (!periodosDisponibles || periodosDisponibles.length === 0) return [];
        return periodosDisponibles.map((p) => {
            const detalle = p.detalle?.trim();
            const nombre = detalle || p.nombre_periodo || (p as any).nombrePeriodo || p.id_periodo;
            return {
                value: p.id_periodo,
                label: nombre,
            };
        });
    }, [periodosDisponibles]);

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border-thin bg-surface shadow-xs select-none">
            {/* 1. Indicador de Persistencia en Tiempo Real (Idéntico al shell oficial de DOSIER) */}
            <button
                type="button"
                onClick={onSaveNow}
                className="flex items-center gap-1.5 px-2 py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                title="Autoguardado en tiempo real activo. Clic para persistir inmediatamente."
            >
                {isSaving ? (
                    <span className="flex items-center gap-1.5 text-text-dim">
                        <Loader2 size={11} className="animate-spin text-text-dim" />
                        <span>GUARDANDO...</span>
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 size={11} className="text-emerald-500" />
                        <span>GUARDADO</span>
                    </span>
                )}
            </button>

            {/* 2. Estado de Conexión en Tiempo Real (Idéntico al shell oficial de DOSIER) */}
            <div className="flex items-center gap-1.5 select-none whitespace-nowrap px-1">
                {!isConnected ? (
                    <>
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[7px] md:text-[8px] font-semibold text-red-500 uppercase tracking-widest">
                            Sin conexión
                        </span>
                    </>
                ) : (
                    <>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[7px] md:text-[8px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            En línea
                        </span>
                    </>
                )}
            </div>

            {/* 3. Avatares de Colaboradores Conectados en la Sala */}
            {activeUsers.length > 0 && (
                <div className="flex -space-x-1.5 items-center pl-1">
                    {activeUsers.map((u, i) => (
                        <div
                            key={`${u.id}-${i}`}
                            className="w-5 h-5 rounded-full border border-surface flex items-center justify-center text-[8px] font-bold text-white shadow-xs cursor-default transition-transform hover:-translate-y-0.5 select-none"
                            style={{ backgroundColor: u.color }}
                            title={`${u.name}`}
                        >
                            {u.initials}
                        </div>
                    ))}
                </div>
            )}

            <div className="h-4 w-px bg-border-thin" />

            {/* Herramientas Principales con Jerarquía Uniforme (Cero cajas dispares) */}
            <div className="flex items-center gap-1">
                {/* Nota */}
                <button
                    type="button"
                    onClick={() => onAddSticky('yellow')}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Nueva Nota Adhesiva"
                >
                    <StickyNote size={13} className="text-amber-500" />
                    <span>Nota</span>
                </button>

                {/* Acuerdo */}
                <button
                    type="button"
                    onClick={onAddAcuerdo}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Nuevo Acuerdo de Asignatura"
                >
                    <CheckCircle2 size={13} className="text-[#0070f3]" />
                    <span>Acuerdo</span>
                </button>

                {/* Texto */}
                <button
                    type="button"
                    onClick={onAddText}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Texto Libre"
                >
                    <Type size={13} className="text-zinc-500" />
                    <span>Texto</span>
                </button>
            </div>

            <div className="h-4 w-px bg-border-thin" />

            {/* Controles de Navegación y Zoom */}
            <div className="flex items-center gap-0.5">
                <button
                    type="button"
                    onClick={onZoomOut}
                    title="Alejar (-)"
                    className="p-1 rounded-md text-zinc-500 hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ZoomOut size={13} />
                </button>

                <button
                    type="button"
                    onClick={onResetZoom}
                    title="Restablecer zoom a 100%"
                    className="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-medium text-text-dim hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {Math.round(zoom * 100)}%
                </button>

                <button
                    type="button"
                    onClick={onZoomIn}
                    title="Acercar (+)"
                    className="p-1 rounded-md text-zinc-500 hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ZoomIn size={13} />
                </button>
            </div>

            {/* Selector de Período al lado del control de zoom */}
            {opcionesPeriodo.length > 0 && onCambiarPeriodo && (
                <>
                    <div className="h-4 w-px bg-border-thin" />
                    <div className="w-52">
                        <GeistSelect
                            value={periodoActual}
                            options={opcionesPeriodo}
                            onChange={(val) => onCambiarPeriodo(String(val))}
                            size="sm"
                            className="w-full text-[11px]"
                        />
                    </div>
                </>
            )}
        </div>
    );
};

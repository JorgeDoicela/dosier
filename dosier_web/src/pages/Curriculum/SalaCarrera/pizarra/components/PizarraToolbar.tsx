import React from 'react';
import {
    StickyNote,
    CheckCircle2,
    Type,
    ZoomIn,
    ZoomOut
} from 'lucide-react';
import type { PizarraColor } from '../types';
import { PIZARRA_COLORS } from '../types';

interface PizarraToolbarProps {
    zoom: number;
    isConnected: boolean;
    activeUsersCount: number;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    onSaveNow?: () => void;
    onAddSticky: (color: PizarraColor) => void;
    onAddAcuerdo: () => void;
    onAddText: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}

export const PizarraToolbar: React.FC<PizarraToolbarProps> = ({
    zoom,
    isConnected,
    activeUsersCount,
    saveStatus = 'idle',
    onSaveNow,
    onAddSticky,
    onAddAcuerdo,
    onAddText,
    onZoomIn,
    onZoomOut,
    onResetZoom,
}) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border-thin bg-surface shadow-xs select-none">
            {/* Estado Unificado: Conectividad y Guardado en un solo bloque limpio */}
            <button
                type="button"
                onClick={onSaveNow}
                title={saveStatus === 'saving' ? 'Guardando cambios...' : 'Conexión y guardado en tiempo real activo'}
                className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-medium text-text-dim rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
                <span
                    className={`w-2 h-2 rounded-full ${
                        !isConnected
                            ? 'bg-amber-500'
                            : saveStatus === 'saving'
                            ? 'bg-amber-500 animate-pulse'
                            : 'bg-emerald-500'
                    }`}
                />
                <span className="hidden sm:inline">
                    {!isConnected
                        ? 'Conectando...'
                        : saveStatus === 'saving'
                        ? 'Guardando...'
                        : 'En vivo'}
                </span>
                {activeUsersCount > 0 && (
                    <span className="text-[10px] text-text-dim font-mono opacity-80">
                        ({activeUsersCount})
                    </span>
                )}
            </button>

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
                    title="Nuevo Acuerdo de Cátedra"
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
        </div>
    );
};

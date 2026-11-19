import React from 'react';
import {
    Plus,
    StickyNote,
    CheckCircle2,
    Type,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Radio
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
    onClearAll: () => void;
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
    onClearAll,
}) => {
    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1.5 rounded-2xl border border-border-thin bg-surface shadow-lg select-none">
            {/* Estado de sincronización en tiempo real */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-text-dim border-r border-border-thin">
                <span
                    className={`w-2 h-2 rounded-full ${
                        isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                />
                <span className="hidden sm:inline">
                    {isConnected ? 'CoWork en vivo' : 'Conectando'}
                </span>
                {activeUsersCount > 0 && (
                    <span className="text-[10px] bg-bg-deep px-1.5 py-0.2 rounded-full font-mono">
                        {activeUsersCount}
                    </span>
                )}
            </div>

            {/* Estado de Persistencia en Base de Datos por Carrera */}
            {saveStatus !== 'idle' && (
                <button
                    type="button"
                    onClick={onSaveNow}
                    title="Estado de guardado en la base de datos por carrera"
                    className="hidden lg:flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium text-text-dim rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-r border-border-thin pr-2.5"
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${
                            saveStatus === 'saving'
                                ? 'bg-amber-500 animate-ping'
                                : saveStatus === 'saved'
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                        }`}
                    />
                    <span>
                        {saveStatus === 'saving'
                            ? 'Guardando...'
                            : saveStatus === 'saved'
                            ? 'Guardado'
                            : 'Error'}
                    </span>
                </button>
            )}

            {/* Herramientas de Creación */}
            <div className="flex items-center gap-1">
                {/* Nota Amarilla por Defecto */}
                <button
                    type="button"
                    onClick={() => onAddSticky('yellow')}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-200 transition-colors"
                    title="Nueva Nota Adhesiva"
                >
                    <StickyNote size={13} />
                    <span className="hidden md:inline">Nota</span>
                </button>

                {/* Nota Verde */}
                <button
                    type="button"
                    onClick={() => onAddSticky('emerald')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 transition-colors"
                    title="Nota Esmeralda"
                >
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </button>

                {/* Nota Azul */}
                <button
                    type="button"
                    onClick={() => onAddSticky('blue')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 transition-colors"
                    title="Nota Azul"
                >
                    <div className="w-3 h-3 rounded-full bg-[#0070f3]" />
                </button>

                {/* Nota Púrpura */}
                <button
                    type="button"
                    onClick={() => onAddSticky('purple')}
                    className="w-7 h-7 rounded-lg flex items-center justify-center bg-purple-100 hover:bg-purple-200 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 transition-colors"
                    title="Nota Púrpura"
                >
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                </button>

                {/* Tarjeta de Acuerdo */}
                <button
                    type="button"
                    onClick={onAddAcuerdo}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-border-thin"
                    title="Nuevo Acuerdo de Cátedra"
                >
                    <CheckCircle2 size={13} className="text-[#0070f3]" />
                    <span className="hidden md:inline">Acuerdo</span>
                </button>

                {/* Texto Libre */}
                <button
                    type="button"
                    onClick={onAddText}
                    className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Texto Libre"
                >
                    <Type size={13} />
                    <span className="hidden md:inline">Texto</span>
                </button>
            </div>

            <div className="h-4 w-px bg-border-thin mx-1" />

            {/* Controles de Zoom */}
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    onClick={onZoomOut}
                    title="Alejar (-)"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ZoomOut size={13} />
                </button>

                <button
                    type="button"
                    onClick={onResetZoom}
                    title="Restablecer zoom a 100%"
                    className="px-2 py-1 rounded-lg text-[11px] font-mono font-medium text-text-dim hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    {Math.round(zoom * 100)}%
                </button>

                <button
                    type="button"
                    onClick={onZoomIn}
                    title="Acercar (+)"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    <ZoomIn size={13} />
                </button>
            </div>

            <div className="h-4 w-px bg-border-thin mx-1" />

            {/* Limpiar Pizarra */}
            <button
                type="button"
                onClick={() => {
                    if (window.confirm('¿Deseas vaciar todos los elementos de la pizarra en tiempo real?')) {
                        onClearAll();
                    }
                }}
                title="Limpiar elementos"
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            >
                <RotateCcw size={13} />
            </button>
        </div>
    );
};

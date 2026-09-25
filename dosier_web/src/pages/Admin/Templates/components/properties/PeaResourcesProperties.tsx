/**
 * @file PeaResourcesProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'h) Actividades Prácticas' del PEA.
 */

import React from 'react';
import { CheckSquare, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaResourcesPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaResourcesProperties: React.FC<PeaResourcesPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'h) ACTIVIDADES PRÁCTICAS');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'colUnidadLabel', 'Unidad');
        onUpdateConfig(block.id, 'colPracticaLabel', 'Nombre de la práctica y caracterización de la actividad');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                        Título de la Sección
                    </label>
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="text-[9px] text-text-dim hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restablecer a valores institucionales por defecto"
                    >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Restablecer
                    </button>
                </div>
                <input
                    type="text"
                    value={config.title || 'h) ACTIVIDADES PRÁCTICAS'}
                    onChange={(e) => onUpdateConfig(block.id, 'title', e.target.value)}
                    className="w-full bg-surface border border-border-thin rounded-md px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-hidden focus:border-indigo-500"
                />
            </div>

            {/* COLOR DEL ENCABEZADO */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Color Institucional de Encabezado
                </label>
                <ColorPickerField
                    label=""
                    value={config.headerColor || '#1e2a4a'}
                    onChange={(val) => onUpdateConfig(block.id, 'headerColor', val)}
                />
            </div>

            {/* ENCABEZADOS DE COLUMNA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Columnas de la Matriz de Prácticas
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Columna 1 (Unidad)</label>
                    <input
                        type="text"
                        value={config.colUnidadLabel || 'Unidad'}
                        onChange={(e) => onUpdateConfig(block.id, 'colUnidadLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Columna 2 (Nombre y Caracterización)</label>
                    <input
                        type="text"
                        value={config.colPracticaLabel || 'Nombre de la práctica y caracterización de la actividad'}
                        onChange={(e) => onUpdateConfig(block.id, 'colPracticaLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
            </div>
        </div>
    );
};

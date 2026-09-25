/**
 * @file PeaCharacterizationProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'b) Objetivo de la Asignatura y c) Prerrequisitos' del PEA.
 */

import React from 'react';
import { Target, RotateCcw, Palette, Sliders, Plus, Trash2 } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaCharacterizationPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaCharacterizationProperties: React.FC<PeaCharacterizationPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'objetivoLabel', 'b) OBJETIVO DE LA ASIGNATURA:');
        onUpdateConfig(block.id, 'objetivoPlaceholder', 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.');
        onUpdateConfig(block.id, 'prerrequisitosLabel', 'c) PRERREQUISITOS:');
        onUpdateConfig(block.id, 'prerrequisitosColAsignatura', 'Asignatura');
        onUpdateConfig(block.id, 'prerrequisitosColObservacion', 'Observación');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-indigo-500" />
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
                    value={config.title || 'b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS'}
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

            {/* CONFIGURACIÓN: b) OBJETIVO DE LA ASIGNATURA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    b) Objetivo de la Asignatura
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la subsección</label>
                    <input
                        type="text"
                        value={config.objetivoLabel || 'b) OBJETIVO DE LA ASIGNATURA:'}
                        onChange={(e) => onUpdateConfig(block.id, 'objetivoLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.objetivoPlaceholder || 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.'}
                        onChange={(e) => onUpdateConfig(block.id, 'objetivoPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>

            {/* CONFIGURACIÓN: c) PRERREQUISITOS */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    c) Prerrequisitos de la Asignatura
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la subsección</label>
                    <input
                        type="text"
                        value={config.prerrequisitosLabel || 'c) PRERREQUISITOS:'}
                        onChange={(e) => onUpdateConfig(block.id, 'prerrequisitosLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-text-dim">Columna 1</label>
                        <input
                            type="text"
                            value={config.prerrequisitosColAsignatura || 'Asignatura'}
                            onChange={(e) => onUpdateConfig(block.id, 'prerrequisitosColAsignatura', e.target.value)}
                            className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[9px] font-semibold text-text-dim">Columna 2</label>
                        <input
                            type="text"
                            value={config.prerrequisitosColObservacion || 'Observación'}
                            onChange={(e) => onUpdateConfig(block.id, 'prerrequisitosColObservacion', e.target.value)}
                            className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

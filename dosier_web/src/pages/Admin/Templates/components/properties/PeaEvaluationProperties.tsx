/**
 * @file PeaEvaluationProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'i) Evaluación del Aprendizaje' del PEA.
 */

import React from 'react';
import { CheckSquare, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaEvaluationPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaEvaluationProperties: React.FC<PeaEvaluationPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'i) EVALUACIÓN DEL APRENDIZAJE');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'tableHeaderBg', '#bdd7ee');
        onUpdateConfig(block.id, 'colNotasLabel', 'Notas');
        onUpdateConfig(block.id, 'colTipoLabel', 'TIPO DE EVALUACIÓN');
        onUpdateConfig(block.id, 'colCalifLabel', 'CALIFICACION');
        onUpdateConfig(block.id, 'parcial1Desc', 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)');
        onUpdateConfig(block.id, 'parcial1Nota', '10,00');
        onUpdateConfig(block.id, 'parcial2Desc', 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)');
        onUpdateConfig(block.id, 'parcial2Nota', '10,00');
        onUpdateConfig(block.id, 'finalDesc', 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)');
        onUpdateConfig(block.id, 'finalNota', '10,00');
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
                    value={config.title || 'i) EVALUACIÓN DEL APRENDIZAJE'}
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

            {/* FILAS DE EVALUACIÓN OFICIAL (RRA Art. 84 / ISTPET) */}
            <div className="space-y-3 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Matriz Oficial de Calificaciones
                </span>

                {/* NOTA PARCIAL 1 */}
                <div className="p-2 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-main">NOTA PARCIAL 1</span>
                        <input
                            type="text"
                            value={config.parcial1Nota || '10,00'}
                            onChange={(e) => onUpdateConfig(block.id, 'parcial1Nota', e.target.value)}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={config.parcial1Desc || 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)'}
                        onChange={(e) => onUpdateConfig(block.id, 'parcial1Desc', e.target.value)}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>

                {/* NOTA PARCIAL 2 */}
                <div className="p-2 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-main">NOTA PARCIAL 2</span>
                        <input
                            type="text"
                            value={config.parcial2Nota || '10,00'}
                            onChange={(e) => onUpdateConfig(block.id, 'parcial2Nota', e.target.value)}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={config.parcial2Desc || 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)'}
                        onChange={(e) => onUpdateConfig(block.id, 'parcial2Desc', e.target.value)}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>

                {/* EVALUACIÓN FINAL */}
                <div className="p-2 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-main">EVALUACIÓN FINAL</span>
                        <input
                            type="text"
                            value={config.finalNota || '10,00'}
                            onChange={(e) => onUpdateConfig(block.id, 'finalNota', e.target.value)}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={config.finalDesc || 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)'}
                        onChange={(e) => onUpdateConfig(block.id, 'finalDesc', e.target.value)}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>
            </div>
        </div>
    );
};

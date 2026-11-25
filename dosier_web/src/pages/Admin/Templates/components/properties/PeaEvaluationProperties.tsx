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

    const defaultRows = [
        { nota: 'NOTA PARCIAL 1', tipo: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)', calificacion: '10,00' },
        { nota: 'NOTA PARCIAL 2', tipo: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)', calificacion: '10,00' },
        { nota: 'EVALUACIÓN', tipo: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)', calificacion: '10,00' }
    ];

    const currentRows = Array.isArray(config.evaluaciones) && config.evaluaciones.length > 0
        ? config.evaluaciones
        : defaultRows;

    const updateMatrixField = (rowIndex: number, field: 'nota' | 'tipo' | 'calificacion', value: string, legacyKey: string) => {
        const nextRows = currentRows.map((row: any, idx: number) =>
            idx === rowIndex ? { ...row, [field]: value } : row
        );
        onUpdateConfig(block.id, legacyKey, value);
        onUpdateConfig(block.id, 'evaluaciones', nextRows);
    };

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', '9. EVALUACIÓN DEL APRENDIZAJE');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'tableHeaderBg', '#bdd7ee');
        onUpdateConfig(block.id, 'colNotasLabel', 'Notas');
        onUpdateConfig(block.id, 'colTipoLabel', 'TIPO DE EVALUACIÓN');
        onUpdateConfig(block.id, 'colCalifLabel', 'CALIFICACION');
        onUpdateConfig(block.id, 'parcial1Desc', defaultRows[0].tipo);
        onUpdateConfig(block.id, 'parcial1Nota', defaultRows[0].calificacion);
        onUpdateConfig(block.id, 'parcial2Desc', defaultRows[1].tipo);
        onUpdateConfig(block.id, 'parcial2Nota', defaultRows[1].calificacion);
        onUpdateConfig(block.id, 'finalDesc', defaultRows[2].tipo);
        onUpdateConfig(block.id, 'finalNota', defaultRows[2].calificacion);
        onUpdateConfig(block.id, 'evaluaciones', defaultRows);
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
                    value={config.title || '9. EVALUACIÓN DEL APRENDIZAJE'}
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
                        <span className="text-[10px] font-bold text-text-main">{currentRows[0]?.nota || 'NOTA PARCIAL 1'}</span>
                        <input
                            type="text"
                            value={currentRows[0]?.calificacion || config.parcial1Nota || '10,00'}
                            onChange={(e) => updateMatrixField(0, 'calificacion', e.target.value, 'parcial1Nota')}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={currentRows[0]?.tipo || config.parcial1Desc || 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)'}
                        onChange={(e) => updateMatrixField(0, 'tipo', e.target.value, 'parcial1Desc')}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>

                {/* NOTA PARCIAL 2 */}
                <div className="p-2 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-main">{currentRows[1]?.nota || 'NOTA PARCIAL 2'}</span>
                        <input
                            type="text"
                            value={currentRows[1]?.calificacion || config.parcial2Nota || '10,00'}
                            onChange={(e) => updateMatrixField(1, 'calificacion', e.target.value, 'parcial2Nota')}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={currentRows[1]?.tipo || config.parcial2Desc || 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)'}
                        onChange={(e) => updateMatrixField(1, 'tipo', e.target.value, 'parcial2Desc')}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>

                {/* EVALUACIÓN FINAL */}
                <div className="p-2 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-text-main">{currentRows[2]?.nota || 'EVALUACIÓN'}</span>
                        <input
                            type="text"
                            value={currentRows[2]?.calificacion || config.finalNota || '10,00'}
                            onChange={(e) => updateMatrixField(2, 'calificacion', e.target.value, 'finalNota')}
                            className="w-16 bg-surface-hover/40 border border-border-thin rounded px-1.5 py-0.5 text-[10px] text-center font-bold text-text-main"
                        />
                    </div>
                    <input
                        type="text"
                        value={currentRows[2]?.tipo || config.finalDesc || 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)'}
                        onChange={(e) => updateMatrixField(2, 'tipo', e.target.value, 'finalDesc')}
                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                    />
                </div>
            </div>
        </div>
    );
};

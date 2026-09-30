/**
 * @file RenderPeaEvaluation.tsx
 * @description i) Evaluación del Aprendizaje.
 * Tabla interactiva con filas de evaluación editables in-situ, botón + Agregar Componente y eliminación.
 */

import React, { useState } from 'react';
import { Award, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

interface EvaluacionRow {
    nota: string;
    tipo: string;
    calificacion: string | number;
}

export const RenderPeaEvaluationSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const tableHeaderBg = c.tableHeaderBg || '#bdd7ee';
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'i) EVALUACIÓN DEL APRENDIZAJE';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const defaultEvaluaciones: EvaluacionRow[] = [
        {
            nota: 'NOTA PARCIAL 1',
            tipo: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)',
            calificacion: '10,00'
        },
        {
            nota: 'NOTA PARCIAL 2',
            tipo: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)',
            calificacion: '10,00'
        },
        {
            nota: 'EVALUACIÓN FINAL',
            tipo: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)',
            calificacion: '10,00'
        }
    ];

    const evaluaciones: EvaluacionRow[] = Array.isArray(c.evaluaciones) && c.evaluaciones.length > 0
        ? c.evaluaciones
        : defaultEvaluaciones;

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'i) EVALUACIÓN DEL APRENDIZAJE');
        }
        setEditingTitle(false);
    };

    const updateRow = (index: number, field: keyof EvaluacionRow, val: EvaluacionRow[keyof EvaluacionRow]) => {
        if (!onUpdateConfig || !blockId) return;
        const newEvaluaciones = [...evaluaciones];
        newEvaluaciones[index] = { ...newEvaluaciones[index], [field]: val };
        onUpdateConfig(blockId, 'evaluaciones', newEvaluaciones);
    };

    const addRow = () => {
        if (!onUpdateConfig || !blockId) return;
        const nextNum = evaluaciones.length + 1;
        const newRow: EvaluacionRow = {
            nota: `COMPONENTE ${nextNum}`,
            tipo: 'Actividades complementarias de aprendizaje y talleres',
            calificacion: '10,00'
        };
        onUpdateConfig(blockId, 'evaluaciones', [...evaluaciones, newRow]);
    };

    const removeRow = (index: number) => {
        if (!onUpdateConfig || !blockId) return;
        const filtered = evaluaciones.filter((_, i) => i !== index);
        onUpdateConfig(blockId, 'evaluaciones', filtered);
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN i) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    {editingTitle ? (
                        <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                value={titleDraft}
                                onChange={e => setTitleDraft(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') setEditingTitle(false);
                                }}
                                autoFocus
                                className="bg-white text-slate-900 px-1.5 py-0.5 text-[9px] rounded-xs font-bold uppercase outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSaveTitle}
                                className="p-0.5 text-emerald-400 hover:text-emerald-300"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <span>{displayTitle}</span>
                    )}
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-[7.5px] bg-white/20 px-1 py-0.5 rounded-xs flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" /> Editar Título
                </span>
            </div>

            {/* TABLA DE EVALUACIÓN OFICIAL TOTALMENTE EDITABLE */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr
                        className="font-bold border-b border-black text-slate-900 text-center"
                        style={{ backgroundColor: tableHeaderBg }}
                    >
                        <th className="p-1.5 border-r border-black w-[22%] text-left">
                            {c.colNotasLabel || 'Notas'}
                        </th>
                        <th className="p-1.5 border-r border-black w-[58%] text-center">
                            {c.colTipoLabel || 'TIPO DE EVALUACIÓN'}
                        </th>
                        <th className="p-1.5 w-[20%] text-center">
                            {c.colCalifLabel || 'CALIFICACION'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/60 bg-white select-text">
                    {evaluaciones.map((row, idx) => (
                        <tr key={idx} className="border-b border-black group/eval hover:bg-slate-50/50">
                            {/* NOMBRE DE LA NOTA / COMPONENTE */}
                            <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                                <input
                                    type="text"
                                    value={row.nota}
                                    onChange={e => updateRow(idx, 'nota', e.target.value)}
                                    placeholder="Nombre del componente..."
                                    className="w-full font-bold uppercase text-[8.5px] bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs px-1 py-0.5 outline-none"
                                />
                            </td>

                            {/* TIPO DE EVALUACIÓN / DESCRIPCIÓN */}
                            <td className="p-1.5 border-r border-black font-medium text-slate-800">
                                <textarea
                                    value={row.tipo}
                                    onChange={e => updateRow(idx, 'tipo', e.target.value)}
                                    rows={2}
                                    placeholder="Descripción del tipo de evaluación..."
                                    className="w-full font-medium text-[8.5px] bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs px-1 py-0.5 outline-none resize-none leading-tight"
                                />
                            </td>

                            {/* CALIFICACIÓN Y ACCIÓN DE BORRADO */}
                            <td className="p-1.5 text-center font-bold text-slate-900 relative">
                                <div className="flex items-center justify-center gap-1">
                                    <input
                                        type="text"
                                        value={row.calificacion}
                                        onChange={e => updateRow(idx, 'calificacion', e.target.value)}
                                        placeholder="10,00"
                                        className="w-16 text-center font-bold text-[8.5px] bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                                    />
                                    {evaluaciones.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(idx)}
                                            className="opacity-0 group-hover/eval:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity cursor-pointer shrink-0"
                                            title="Eliminar componente"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* BOTÓN OPERATIVO PARA AÑADIR COMPONENTES DE EVALUACIÓN */}
            <div className="border border-black border-t-0 p-1.5 bg-slate-50 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 text-[8.5px] font-semibold text-[#0070f3] hover:text-blue-700 py-0.5 px-2 hover:bg-blue-50/60 rounded-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Componente de Evaluación</span>
                </button>
                <span className="text-[8px] text-slate-400">
                    {evaluaciones.length} {evaluaciones.length === 1 ? 'componente evaluativo' : 'componentes evaluativos'}
                </span>
            </div>
        </div>
    );
};

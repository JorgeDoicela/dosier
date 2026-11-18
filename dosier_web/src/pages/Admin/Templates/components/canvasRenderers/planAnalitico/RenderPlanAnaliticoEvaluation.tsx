/**
 * @file RenderPlanAnaliticoEvaluation.tsx
 * @description 6. EVALUACIÓN del Formato Plan Analítico 2026.
 * Matriz oficial de 3 notas (Parcial 1, Parcial 2, Examen Final) sobre 10.00 puntos cada una.
 */

import React, { useState } from 'react';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

export interface EvaluationItem {
    id: string;
    notaLabel: string;
    tipoEvaluacion: string;
    calificacion: string;
}

const DEFAULT_EVALUATIONS: EvaluationItem[] = [
    {
        id: 'eval-1',
        notaLabel: 'NOTA PARCIAL 1',
        tipoEvaluacion: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)',
        calificacion: '10.00'
    },
    {
        id: 'eval-2',
        notaLabel: 'NOTA PARCIAL 2',
        tipoEvaluacion: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)',
        calificacion: '10.00'
    },
    {
        id: 'eval-3',
        notaLabel: 'NOTA EXAMEN FINAL',
        tipoEvaluacion: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)',
        calificacion: '10.00'
    }
];

export const RenderPlanAnaliticoEvaluation: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '6.  EVALUACIÓN';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const items: EvaluationItem[] = c.items && Array.isArray(c.items) && c.items.length > 0
        ? c.items
        : DEFAULT_EVALUATIONS;

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [editingIdx, setEditingIdx] = useState<number | null>(null);
    const [rowDraft, setRowDraft] = useState<EvaluationItem>({ id: '', notaLabel: '', tipoEvaluacion: '', calificacion: '10.00' });

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleStartEditRow = (idx: number, item: EvaluationItem) => {
        setEditingIdx(idx);
        setRowDraft({ ...item });
    };

    const handleSaveRow = (idx: number) => {
        const updated = items.map((item, i) => i === idx ? { ...rowDraft } : item);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'items', updated);
        }
        setEditingIdx(null);
    };

    const handleAddRow = () => {
        const newItem: EvaluationItem = {
            id: `eval-${Date.now()}`,
            notaLabel: `NOTA ADICIONAL ${items.length + 1}`,
            tipoEvaluacion: 'NUEVO CRITERIO EVALUATIVO',
            calificacion: '10.00'
        };
        const updated = [...items, newItem];
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'items', updated);
        }
    };

    const handleDeleteRow = (idx: number) => {
        const updated = items.filter((_, i) => i !== idx);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'items', updated);
        }
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text">
            {/* Título de la Sección 6 en Azul Cursiva Negrita */}
            <div className="group relative">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 max-w-md">
                        <input
                            type="text"
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="w-full px-2 py-1 text-sm font-bold italic text-blue-800 border border-blue-500 rounded"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSaveTitle}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingTitle(false)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2">
                        <h3 className="text-sm font-bold italic tracking-wide text-blue-800">
                            {sectionTitle}
                        </h3>
                        <button
                            type="button"
                            onClick={() => {
                                setTitleDraft(sectionTitle);
                                setIsEditingTitle(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity"
                            title="Editar título de sección"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tabla Oficial de Evaluación */}
            <div className="w-full border border-black overflow-hidden bg-white">
                <table className="w-full border-collapse text-xs text-black">
                    <thead>
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold">
                            <th className="w-[28%] p-2 border-r border-black text-center align-middle font-bold tracking-wide">
                                NOTAS
                            </th>
                            <th className="w-[52%] p-2 border-r border-black text-center align-middle font-bold tracking-wide">
                                TIPO DE EVALUACIÓN
                            </th>
                            <th className="w-[20%] p-2 text-center align-middle font-bold tracking-wide">
                                CALIFICACIÓN
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, idx) => {
                            const isEditing = editingIdx === idx;
                            return (
                                <tr key={item.id || idx} className="border-t border-black hover:bg-slate-50/50 group">
                                    {/* Celda NOTAS */}
                                    <td className="p-2 border-r border-black align-middle font-bold">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={rowDraft.notaLabel}
                                                onChange={(e) => setRowDraft({ ...rowDraft, notaLabel: e.target.value })}
                                                className="w-full p-1 text-xs border border-blue-500 rounded font-bold"
                                            />
                                        ) : (
                                            <span className="text-slate-900">{item.notaLabel}</span>
                                        )}
                                    </td>

                                    {/* Celda TIPO DE EVALUACIÓN */}
                                    <td className="p-2 border-r border-black align-middle leading-relaxed">
                                        {isEditing ? (
                                            <textarea
                                                value={rowDraft.tipoEvaluacion}
                                                onChange={(e) => setRowDraft({ ...rowDraft, tipoEvaluacion: e.target.value })}
                                                rows={2}
                                                className="w-full p-1 text-xs border border-blue-500 rounded"
                                            />
                                        ) : (
                                            <span className="text-slate-800 font-semibold">{item.tipoEvaluacion}</span>
                                        )}
                                    </td>

                                    {/* Celda CALIFICACIÓN */}
                                    <td className="p-2 text-center align-middle font-mono font-bold">
                                        {isEditing ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={rowDraft.calificacion}
                                                    onChange={(e) => setRowDraft({ ...rowDraft, calificacion: e.target.value })}
                                                    className="w-16 p-1 text-xs text-center border border-blue-500 rounded font-mono font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(idx)}
                                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingIdx(null)}
                                                    className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-slate-900">{item.calificacion}</span>
                                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEditRow(idx, item)}
                                                        className="p-0.5 text-slate-400 hover:text-blue-600"
                                                        title="Editar fila"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    {items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteRow(idx)}
                                                            className="p-0.5 text-slate-400 hover:text-rose-600"
                                                            title="Eliminar fila"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Botón interactivo para añadir fila si se parametriza otra evaluación */}
            <div className="flex justify-end pt-1">
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0070f3] hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded transition-all cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Nota / Componente</span>
                </button>
            </div>
        </div>
    );
};

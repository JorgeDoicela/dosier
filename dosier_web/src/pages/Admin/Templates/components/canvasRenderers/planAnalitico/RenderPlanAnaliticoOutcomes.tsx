/**
 * @file RenderPlanAnaliticoOutcomes.tsx
 * @description 3. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA del Formato Plan Analítico 2026.
 * Renderizador interactivo con cabecera de doble nivel (ID, Capacidad, Nivel de desarrollo: Inicial/Medio/Alto).
 */

import React, { useState } from 'react';
import { Pencil, Check, X, Plus, Trash2 } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

export interface OutcomeItem {
    id: string;
    description: string;
    level: 'Inicial' | 'Medio' | 'Alto' | string;
}

const DEFAULT_OUTCOMES: OutcomeItem[] = [
    { id: '1', description: 'Analizar los fundamentos teóricos y metodológicos de la asignatura.', level: 'Medio' },
    { id: '2', description: 'Desarrollar soluciones técnicas aplicadas con apego a los estándares vigentes.', level: 'Alto' },
    { id: '3', description: 'Evaluar el desempeño de modelos y propuestas con rigor crítico e integridad.', level: 'Alto' }
];

export const RenderPlanAnaliticoOutcomes: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '3.  RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const outcomes: OutcomeItem[] = c.outcomes && Array.isArray(c.outcomes) && c.outcomes.length > 0
        ? c.outcomes
        : DEFAULT_OUTCOMES;

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [rowDraft, setRowDraft] = useState<OutcomeItem>({ id: '', description: '', level: 'Medio' });

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleStartEditRow = (idx: number, item: OutcomeItem) => {
        setEditingIndex(idx);
        setRowDraft({ ...item });
    };

    const handleSaveRow = (idx: number) => {
        const updated = outcomes.map((item, i) => i === idx ? { ...rowDraft } : item);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'outcomes', updated);
        }
        setEditingIndex(null);
    };

    const handleAddRow = () => {
        const nextId = String(outcomes.length + 1);
        const newItem: OutcomeItem = {
            id: nextId,
            description: 'Describir una nueva competencia o capacidad observable del estudiante...',
            level: 'Medio'
        };
        const updated = [...outcomes, newItem];
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'outcomes', updated);
        }
    };

    const handleDeleteRow = (idx: number) => {
        const updated = outcomes.filter((_, i) => i !== idx).map((item, i) => ({
            ...item,
            id: String(i + 1)
        }));
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'outcomes', updated);
        }
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text">
            {/* Título de la Sección 3 en Azul Cursiva Negrita */}
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

            {/* Tabla con Encabezado Doble Nivel y Bordes Negros Oficiales */}
            <div className="w-full border border-black overflow-hidden bg-white">
                <table className="w-full border-collapse text-xs text-black">
                    <thead>
                        {/* Nivel 1 del Encabezado */}
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold">
                            <th
                                rowSpan={2}
                                className="w-[8%] p-2 border-r border-b border-black text-center align-middle font-bold tracking-wide"
                            >
                                ID
                            </th>
                            <th
                                rowSpan={2}
                                className="w-[62%] p-2 border-r border-b border-black text-left align-middle font-bold tracking-wide"
                            >
                                Al finalizar el curso, el/la estudiante estará en capacidad de
                            </th>
                            <th
                                className="w-[30%] p-2 border-b border-black text-center align-middle font-bold tracking-wide"
                            >
                                Nivel de desarrollo de los resultados de aprendizaje
                            </th>
                        </tr>
                        {/* Nivel 2 del Encabezado */}
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold">
                            <th className="p-1.5 border-b border-black text-center align-middle font-semibold text-[11px] tracking-wide">
                                Inicial / Medio / Alto
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {outcomes.map((item, idx) => {
                            const isEditing = editingIndex === idx;
                            return (
                                <tr key={item.id || idx} className="border-t border-black hover:bg-slate-50/50 group">
                                    {/* Celda ID */}
                                    <td className="p-2 border-r border-black text-center font-bold align-middle bg-slate-50/30">
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={rowDraft.id}
                                                onChange={(e) => setRowDraft({ ...rowDraft, id: e.target.value })}
                                                className="w-full px-1 py-0.5 text-xs text-center border border-blue-500 rounded"
                                            />
                                        ) : (
                                            item.id
                                        )}
                                    </td>

                                    {/* Celda Descripción (Capacidad) */}
                                    <td className="p-2 border-r border-black align-middle leading-relaxed">
                                        {isEditing ? (
                                            <textarea
                                                value={rowDraft.description}
                                                onChange={(e) => setRowDraft({ ...rowDraft, description: e.target.value })}
                                                rows={2}
                                                className="w-full p-1 text-xs border border-blue-500 rounded"
                                            />
                                        ) : (
                                            <span className="text-slate-800">{item.description}</span>
                                        )}
                                    </td>

                                    {/* Celda Nivel (Inicial / Medio / Alto) */}
                                    <td className="p-2 text-center align-middle">
                                        {isEditing ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <select
                                                    value={rowDraft.level}
                                                    onChange={(e) => setRowDraft({ ...rowDraft, level: e.target.value })}
                                                    className="px-1 py-0.5 text-xs border border-blue-500 rounded bg-white"
                                                >
                                                    <option value="Inicial">Inicial</option>
                                                    <option value="Medio">Medio</option>
                                                    <option value="Alto">Alto</option>
                                                </select>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveRow(idx)}
                                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingIndex(null)}
                                                    className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-2 relative">
                                                <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold ${
                                                    item.level === 'Alto'
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                        : item.level === 'Inicial'
                                                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                                                }`}>
                                                    {item.level || 'Medio'}
                                                </span>
                                                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEditRow(idx, item)}
                                                        className="p-0.5 text-slate-400 hover:text-blue-600"
                                                        title="Editar resultado"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteRow(idx)}
                                                        className="p-0.5 text-slate-400 hover:text-rose-600"
                                                        title="Eliminar resultado"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
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

            {/* Botón interactivo para añadir filas */}
            <div className="flex justify-end pt-1">
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0070f3] hover:text-blue-700 hover:bg-blue-50 border border-blue-200 rounded transition-all cursor-pointer"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Resultado de Aprendizaje</span>
                </button>
            </div>
        </div>
    );
};

/**
 * @file RenderPeaPrerequisites.tsx
 * @description c) Prerrequisitos Curriculares.
 * Tabla interactiva con celdas editables in-situ, agregado y eliminación de filas dinámicas.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

interface PrerrequisitoRow {
    asignatura: string;
    observacion: string;
}

export const RenderPeaPrerequisitesSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayLabel = c.prerrequisitosLabel || title || 'c) PRERREQUISITOS:';

    const [editingLabel, setEditingLabel] = useState(false);
    const [labelDraft, setLabelDraft] = useState(displayLabel);

    const defaultRows: PrerrequisitoRow[] = [
        { asignatura: 'Programación Orientada a Objetos', observacion: 'Aprobada con nota mínima 7.00' },
        { asignatura: 'Estructura de Datos', observacion: 'Aprobada con nota mínima 7.00' }
    ];

    const rows: PrerrequisitoRow[] = Array.isArray(c.prerrequisitosFilas) && c.prerrequisitosFilas.length > 0
        ? c.prerrequisitosFilas
        : defaultRows;

    const handleSaveLabel = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'prerrequisitosLabel', labelDraft.trim() || 'c) PRERREQUISITOS:');
        }
        setEditingLabel(false);
    };

    const updateRow = (index: number, field: keyof PrerrequisitoRow, val: string) => {
        if (!onUpdateConfig || !blockId) return;
        const newRows = [...rows];
        newRows[index] = { ...newRows[index], [field]: val };
        onUpdateConfig(blockId, 'prerrequisitosFilas', newRows);
    };

    const addRow = () => {
        if (!onUpdateConfig || !blockId) return;
        const newRows = [...rows, { asignatura: '', observacion: 'Aprobada con nota mínima 7.00' }];
        onUpdateConfig(blockId, 'prerrequisitosFilas', newRows);
    };

    const removeRow = (index: number) => {
        if (!onUpdateConfig || !blockId) return;
        const newRows = rows.filter((_, i) => i !== index);
        onUpdateConfig(blockId, 'prerrequisitosFilas', newRows);
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN c) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingLabel(true);
                    setLabelDraft(displayLabel);
                }}
            >
                <div className="flex items-center gap-2">
                    {editingLabel ? (
                        <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                value={labelDraft}
                                onChange={e => setLabelDraft(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveLabel();
                                    if (e.key === 'Escape') setEditingLabel(false);
                                }}
                                autoFocus
                                className="bg-white text-slate-900 px-1.5 py-0.5 text-[9px] rounded-xs font-bold uppercase outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleSaveLabel}
                                className="p-0.5 text-emerald-400 hover:text-emerald-300"
                            >
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <span>{displayLabel}</span>
                    )}
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-[7.5px] bg-white/20 px-1 py-0.5 rounded-xs flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" /> Editar Título
                </span>
            </div>

            {/* TABLA DE PRERREQUISITOS TOTALMENTE EDITABLE */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="bg-slate-50 font-bold border-b border-black text-slate-800">
                        <th className="p-1.5 border-r border-black w-1/2">
                            {c.prerrequisitosColAsignatura || 'Asignatura'}
                        </th>
                        <th className="p-1.5 w-1/2">
                            {c.prerrequisitosColObservacion || 'Observación'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/40 select-text">
                    {rows.map((row, idx) => (
                        <tr key={idx} className="bg-white group/row hover:bg-slate-50/50">
                            <td className="p-1 border-r border-black">
                                <input
                                    type="text"
                                    value={row.asignatura}
                                    onChange={e => updateRow(idx, 'asignatura', e.target.value)}
                                    placeholder="Nombre de la materia prerrequisito..."
                                    className="w-full px-1 py-0.5 border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[8.5px] text-slate-800 outline-none bg-transparent"
                                />
                            </td>
                            <td className="p-1 relative">
                                <div className="flex items-center gap-1">
                                    <input
                                        type="text"
                                        value={row.observacion}
                                        onChange={e => updateRow(idx, 'observacion', e.target.value)}
                                        placeholder="Observación o condición..."
                                        className="w-full px-1 py-0.5 border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[8.5px] text-slate-700 outline-none bg-transparent"
                                    />
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeRow(idx)}
                                            className="opacity-0 group-hover/row:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity cursor-pointer shrink-0"
                                            title="Eliminar fila"
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

            {/* BOTÓN OPERATIVO PARA AÑADIR FILAS DE PRERREQUISITO */}
            <div className="border border-black border-t-0 p-1.5 bg-slate-50 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addRow}
                    className="flex items-center gap-1 text-[8.5px] font-semibold text-[#0070f3] hover:text-blue-700 py-0.5 px-2 hover:bg-blue-50/60 rounded-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Prerrequisito</span>
                </button>
                <span className="text-[8px] text-slate-400">
                    {rows.length} {rows.length === 1 ? 'prerrequisito configurado' : 'prerrequisitos configurados'}
                </span>
            </div>
        </div>
    );
};

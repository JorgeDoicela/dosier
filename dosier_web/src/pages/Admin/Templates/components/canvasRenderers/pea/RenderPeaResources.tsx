/**
 * @file RenderPeaResources.tsx
 * @description h) Actividades Prácticas.
 * Tabla interactiva con celdas editables in-situ, botón + Agregar Práctica y eliminación de filas.
 */

import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

interface PracticaRow {
    unidad: string | number;
    nombre: string;
}

export const RenderPeaResourcesSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'h) ACTIVIDADES PRÁCTICAS';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const defaultPracticas: PracticaRow[] = [
        { unidad: 1, nombre: 'Práctica 1: Configuración del entorno de laboratorio y pruebas de conectividad básica.' },
        { unidad: 2, nombre: 'Práctica 2: Implementación de componentes modulares y pruebas de integración de servicios.' },
        { unidad: 3, nombre: 'Práctica 3: Despliegue de proyecto curricular y verificación de requerimientos técnicos.' }
    ];

    const practicas: PracticaRow[] = Array.isArray(c.practicas) && c.practicas.length > 0
        ? c.practicas
        : defaultPracticas;

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'h) ACTIVIDADES PRÁCTICAS');
        }
        setEditingTitle(false);
    };

    const updatePractica = (index: number, field: keyof PracticaRow, val: PracticaRow[keyof PracticaRow]) => {
        if (!onUpdateConfig || !blockId) return;
        const newPracticas = [...practicas];
        newPracticas[index] = { ...newPracticas[index], [field]: val };
        onUpdateConfig(blockId, 'practicas', newPracticas);
    };

    const addPractica = () => {
        if (!onUpdateConfig || !blockId) return;
        const nextNum = practicas.length + 1;
        const newPractica: PracticaRow = {
            unidad: nextNum <= 3 ? nextNum : 1,
            nombre: `Práctica ${nextNum}: Nueva actividad experimental o de taller`
        };
        onUpdateConfig(blockId, 'practicas', [...practicas, newPractica]);
    };

    const removePractica = (index: number) => {
        if (!onUpdateConfig || !blockId) return;
        const filtered = practicas.filter((_, i) => i !== index);
        onUpdateConfig(blockId, 'practicas', filtered);
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN h) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 shrink-0" />
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

            {/* TABLA DE ACTIVIDADES PRÁCTICAS EDITABLE CELDA POR CELDA */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="bg-slate-50 font-bold border-b border-black text-slate-900">
                        <th className="p-1.5 border-r border-black w-[15%] text-center">
                            {c.colUnidadLabel || 'Unidad'}
                        </th>
                        <th className="p-1.5">
                            {c.colPracticaLabel || 'Nombre de la práctica y caracterización de la actividad'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/40 select-text">
                    {practicas.map((p, idx) => (
                        <tr key={idx} className="bg-white group/row hover:bg-slate-50/50">
                            {/* NÚMERO DE UNIDAD */}
                            <td className="p-1 border-r border-black text-center align-top">
                                <input
                                    type="text"
                                    value={p.unidad}
                                    onChange={e => updatePractica(idx, 'unidad', e.target.value)}
                                    className="w-12 text-center bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs font-bold text-[9px] py-0.5 outline-none"
                                />
                            </td>

                            {/* DETALLE Y CARACTERIZACIÓN */}
                            <td className="p-1 relative">
                                <div className="flex items-start gap-1">
                                    <textarea
                                        value={p.nombre}
                                        onChange={e => updatePractica(idx, 'nombre', e.target.value)}
                                        rows={2}
                                        className="w-full px-1.5 py-0.5 border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[9px] text-slate-800 outline-none bg-transparent resize-none leading-relaxed"
                                        placeholder="Descripción y caracterización de la práctica experimental..."
                                    />
                                    {practicas.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removePractica(idx)}
                                            className="opacity-0 group-hover/row:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded transition-opacity cursor-pointer shrink-0 mt-0.5"
                                            title="Eliminar práctica"
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

            {/* BOTÓN OPERATIVO PARA AÑADIR PRÁCTICAS */}
            <div className="border border-black border-t-0 p-1.5 bg-slate-50 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addPractica}
                    className="flex items-center gap-1 text-[8.5px] font-semibold text-[#0070f3] hover:text-blue-700 py-0.5 px-2 hover:bg-blue-50/60 rounded-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Actividad Práctica</span>
                </button>
                <span className="text-[8px] text-slate-400">
                    {practicas.length} {practicas.length === 1 ? 'práctica registrada' : 'prácticas registradas'}
                </span>
            </div>
        </div>
    );
};

/**
 * @file RenderPeaSignatures.tsx
 * @description k) Firmas de Responsabilidad Institucional.
 * Tabla oficial de 5 columnas con edición in-situ de Nombres, Cargos y Fechas de autoridades.
 */

import React, { useState } from 'react';
import { ShieldCheck, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

export const RenderPeaSignaturesSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'k) FIRMAS DE RESPONSABILIDAD';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'k) FIRMAS DE RESPONSABILIDAD');
        }
        setEditingTitle(false);
    };

    const updateField = (key: string, val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, key, val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN k) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
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

            {/* TABLA OFICIAL DE 5 COLUMNAS Y 4 FILAS TOTALMENTE EDITABLE */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="bg-slate-50 font-bold border-b border-black text-center text-slate-900">
                        <th className="p-1.5 border-r border-black w-[20%] text-left">
                            DESCRIPCIÓN
                        </th>
                        <th className="p-1.5 border-r border-black w-[20%]">
                            ELABORADO
                        </th>
                        <th className="p-1.5 border-r border-black w-[20%]">
                            REVISADO
                        </th>
                        <th className="p-1.5 border-r border-black w-[20%]">
                            REVISADO
                        </th>
                        <th className="p-1.5 w-[20%]">
                            APROBADO
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black bg-white select-text">
                    {/* FILA 1: ESPACIO DE FIRMA DIGITAL / MANUSCRITA */}
                    <tr className="h-14">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900 align-middle">
                            FIRMA
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                            <span className="text-[7.5px] text-slate-400 font-mono">Firma Docente</span>
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                            <span className="text-[7.5px] text-slate-400 font-mono">Coord. Carrera</span>
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                            <span className="text-[7.5px] text-slate-400 font-mono">Coord. Académico</span>
                        </td>
                        <td className="p-1.5 align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                            <span className="text-[7.5px] text-slate-400 font-mono">Vicerrectorado</span>
                        </td>
                    </tr>

                    {/* FILA 2: NOMBRE */}
                    <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            NOMBRE
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.nombreElaborado ?? '[Nombre del Docente]'}
                                onChange={e => updateField('nombreElaborado', e.target.value)}
                                className="w-full text-center text-[8.5px] font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.nombreRevisado1 ?? '[Coordinador Carrera]'}
                                onChange={e => updateField('nombreRevisado1', e.target.value)}
                                className="w-full text-center text-[8.5px] font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.nombreRevisado2 ?? '[Coordinador Académico]'}
                                onChange={e => updateField('nombreRevisado2', e.target.value)}
                                className="w-full text-center text-[8.5px] font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1">
                            <input
                                type="text"
                                value={c.nombreAprobado ?? '[Vicerrectorado]'}
                                onChange={e => updateField('nombreAprobado', e.target.value)}
                                className="w-full text-center text-[8.5px] font-semibold text-slate-800 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                    </tr>

                    {/* FILA 3: CARGO */}
                    <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            CARGO
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.cargoElaborado ?? 'Docente'}
                                onChange={e => updateField('cargoElaborado', e.target.value)}
                                className="w-full text-center text-[8px] text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.cargoRevisado1 ?? 'Coordinador de Carrera'}
                                onChange={e => updateField('cargoRevisado1', e.target.value)}
                                className="w-full text-center text-[8px] text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.cargoRevisado2 ?? 'Coordinador Académico'}
                                onChange={e => updateField('cargoRevisado2', e.target.value)}
                                className="w-full text-center text-[8px] text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                        <td className="p-1">
                            <input
                                type="text"
                                value={c.cargoAprobado ?? 'Vicerrectorado'}
                                onChange={e => updateField('cargoAprobado', e.target.value)}
                                className="w-full text-center text-[8px] text-slate-700 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none"
                            />
                        </td>
                    </tr>

                    {/* FILA 4: FECHA */}
                    <tr>
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            FECHA
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.fechaElaborado ?? ''}
                                onChange={e => updateField('fechaElaborado', e.target.value)}
                                placeholder="DD/MM/AAAA"
                                className="w-full text-center text-[8px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none font-mono"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.fechaRevisado1 ?? ''}
                                onChange={e => updateField('fechaRevisado1', e.target.value)}
                                placeholder="DD/MM/AAAA"
                                className="w-full text-center text-[8px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none font-mono"
                            />
                        </td>
                        <td className="p-1 border-r border-black">
                            <input
                                type="text"
                                value={c.fechaRevisado2 ?? ''}
                                onChange={e => updateField('fechaRevisado2', e.target.value)}
                                placeholder="DD/MM/AAAA"
                                className="w-full text-center text-[8px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none font-mono"
                            />
                        </td>
                        <td className="p-1">
                            <input
                                type="text"
                                value={c.fechaAprobado ?? ''}
                                onChange={e => updateField('fechaAprobado', e.target.value)}
                                placeholder="DD/MM/AAAA"
                                className="w-full text-center text-[8px] text-slate-600 bg-transparent border border-transparent hover:border-slate-300 focus:border-[#0070f3] rounded-xs py-0.5 outline-none font-mono"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

/**
 * @file RenderPeaBibliography.tsx
 * @description j) Bibliografía (Básica y de Consulta).
 * Bloque con edición in-situ de subtítulos y textareas auto-expandibles para referencias en normas APA.
 */

import React, { useState } from 'react';
import { Library, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

export const RenderPeaBibliographySection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'j) BIBLIOGRAFÍA';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const defaultBasica = 'Pressman, R. S. (2019). Ingeniería del software: un enfoque práctico (8va ed.). McGraw-Hill Education.';
    const defaultConsulta = 'Sommerville, I. (2018). Software Engineering (10th ed.). Pearson Education.\nMartin, R. C. (2017). Clean Architecture: A Craftsman\'s Guide to Software Structure and Design. Prentice Hall.';

    const basicaVal = c.basicaText ?? c.basicaPlaceholder ?? defaultBasica;
    const consultaVal = c.consultaText ?? c.consultaPlaceholder ?? defaultConsulta;

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'j) BIBLIOGRAFÍA');
        }
        setEditingTitle(false);
    };

    const handleBasicaChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'basicaText', val);
        }
    };

    const handleConsultaChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'consultaText', val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN j) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <Library className="w-3.5 h-3.5 shrink-0" />
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

            <div className="border border-black border-t-0 divide-y divide-black">
                {/* 1. BIBLIOGRAFÍA BÁSICA */}
                <div>
                    <div className="bg-slate-100 px-2 py-1 font-bold text-[8.5px] border-b border-black text-slate-900 flex justify-between items-center">
                        <span>{c.basicaLabel || 'Bibliografía básica'}</span>
                        <span className="text-[7.5px] text-slate-400 font-normal">Normas APA 7ma Edición</span>
                    </div>
                    <div className="p-2 bg-white select-text">
                        <textarea
                            value={basicaVal}
                            onChange={e => handleBasicaChange(e.target.value)}
                            placeholder="Ingrese las referencias de los libros base o manuales obligatorios..."
                            rows={3}
                            className="w-full p-2 border border-slate-200 hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[10.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:italic bg-white outline-none resize-none transition-colors"
                            style={{ minHeight: '65px' }}
                        />
                    </div>
                </div>

                {/* 2. BIBLIOGRAFÍA DE CONSULTA */}
                <div>
                    <div className="bg-slate-100 px-2 py-1 font-bold text-[8.5px] border-b border-black text-slate-900 flex justify-between items-center">
                        <span>{c.consultaLabel || 'Bibliografía de consulta'}</span>
                        <span className="text-[7.5px] text-slate-400 font-normal">Fuentes complementarias y artículos</span>
                    </div>
                    <div className="p-2 bg-white select-text">
                        <textarea
                            value={consultaVal}
                            onChange={e => handleConsultaChange(e.target.value)}
                            placeholder="Ingrese las fuentes bibliográficas y recursos web de consulta..."
                            rows={3}
                            className="w-full p-2 border border-slate-200 hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[10.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:italic bg-white outline-none resize-none transition-colors"
                            style={{ minHeight: '65px' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

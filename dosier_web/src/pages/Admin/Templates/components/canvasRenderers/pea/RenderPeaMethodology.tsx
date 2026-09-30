/**
 * @file RenderPeaMethodology.tsx
 * @description g) Metodología de Enseñanza (Estrategias y Recursos Didácticos).
 * Bloque con edición in-situ de subtítulos y textareas auto-expandibles para ambas áreas.
 */

import React, { useState } from 'react';
import { BookOpen, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

export const RenderPeaMethodologySection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'g) METODOLOGÍA DE ENSEÑANZA';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const defaultEstrategias = 'En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se desarrollará mediante aprendizaje basado en problemas, proyectos formativos y talleres aplicados.';
    const defaultRecursos = 'Simuladores de software, entornos virtuales de aprendizaje, instrumental de laboratorio y plataformas colaborativas.';

    const estrategiasVal = c.estrategiasText ?? c.estrategiasPlaceholder ?? defaultEstrategias;
    const recursosVal = c.recursosText ?? c.recursosPlaceholder ?? defaultRecursos;

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'g) METODOLOGÍA DE ENSEÑANZA');
        }
        setEditingTitle(false);
    };

    const handleEstrategiasChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'estrategiasText', val);
        }
    };

    const handleRecursosChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'recursosText', val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN g) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
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
                {/* 1. ESTRATEGIAS METODOLÓGICAS */}
                <div>
                    <div className="bg-slate-100 px-2 py-1 font-bold text-[8.5px] uppercase border-b border-black text-slate-900 flex justify-between items-center">
                        <span>{c.estrategiasLabel || 'ESTRATEGIAS METODOLÓGICAS'}</span>
                        <span className="text-[7.5px] text-slate-400 font-normal">Enfoque pedagógico</span>
                    </div>
                    <div className="p-2 bg-white select-text">
                        <textarea
                            value={estrategiasVal}
                            onChange={e => handleEstrategiasChange(e.target.value)}
                            placeholder="Describa las estrategias metodológicas..."
                            rows={3}
                            className="w-full p-2 border border-slate-200 hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[10.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:italic bg-white outline-none resize-none transition-colors"
                            style={{ minHeight: '65px' }}
                        />
                    </div>
                </div>

                {/* 2. RECURSOS DIDÁCTICOS / INFORMATIZACIÓN */}
                <div>
                    <div className="bg-slate-100 px-2 py-1 font-bold text-[8.5px] uppercase border-b border-black text-slate-900 flex justify-between items-center">
                        <span>{c.recursosLabel || 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE'}</span>
                        <span className="text-[7.5px] text-slate-400 font-normal">Herramientas e instrumental</span>
                    </div>
                    <div className="p-2 bg-white select-text">
                        <textarea
                            value={recursosVal}
                            onChange={e => handleRecursosChange(e.target.value)}
                            placeholder="Detalle los recursos didácticos y tecnologías de apoyo..."
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

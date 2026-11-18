/**
 * @file RenderPlanAnaliticoObjective.tsx
 * @description 2. OBJETIVO GENERAL del Formato Plan Analítico 2026.
 * Renderizador interactivo con título en cursiva azul y párrafo enriquecido colaborativo.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

const DEFAULT_OBJECTIVE = 'Desarrollar competencias profesionales y destrezas técnicas en el estudiantado mediante la aplicación de metodologías activas, prácticas experimentales e investigación aplicada alineadas a las necesidades del entorno productivo y los lineamientos del ISTPET.';

function sanitizeObjectiveHtml(raw: string | undefined): string {
    if (!raw) return `<p>${DEFAULT_OBJECTIVE}</p>`;
    if (raw.includes('{{objetivo_general}}') || raw.includes('{{') || raw.trim() === '<p></p>') {
        return `<p>${DEFAULT_OBJECTIVE}</p>`;
    }
    return raw;
}

export const RenderPlanAnaliticoObjective: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '2.  OBJETIVO GENERAL';
    const textHtml = sanitizeObjectiveHtml(c.html);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [isEditingText, setIsEditingText] = useState(false);
    const [textDraft, setTextDraft] = useState(textHtml.replace(/<[^>]*>/g, '').trim() || DEFAULT_OBJECTIVE);

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleSaveText = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'html', `<p>${textDraft.trim() || DEFAULT_OBJECTIVE}</p>`);
        }
        setIsEditingText(false);
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-2 font-sans select-text">
            {/* Título de la Sección 2 en Azul Cursiva Negrita */}
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

            {/* Párrafo Editorial del Objetivo General (Directo sobre la hoja, sin caja de formulario) */}
            <div className="group relative py-1 px-1 min-h-[40px] text-xs text-slate-900 leading-relaxed font-normal">
                {isEditingText ? (
                    <div className="space-y-2 p-2 bg-slate-50 border border-blue-400 rounded">
                        <textarea
                            value={textDraft}
                            onChange={(e) => setTextDraft(e.target.value)}
                            rows={4}
                            className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            placeholder="Redacte el objetivo general de la asignatura..."
                            autoFocus
                        />
                        <div className="flex items-center gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setIsEditingText(false)}
                                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveText}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        <div
                            dangerouslySetInnerHTML={{ __html: textHtml }}
                            className="text-slate-900 text-xs leading-relaxed text-justify cursor-pointer hover:bg-slate-50/60 p-1 rounded transition-colors"
                            onClick={() => {
                                setTextDraft(textHtml.replace(/<[^>]*>/g, '').trim() || DEFAULT_OBJECTIVE);
                                setIsEditingText(true);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setTextDraft(textHtml.replace(/<[^>]*>/g, '').trim() || DEFAULT_OBJECTIVE);
                                setIsEditingText(true);
                            }}
                            className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-xs transition-opacity"
                            title="Editar texto del objetivo general"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

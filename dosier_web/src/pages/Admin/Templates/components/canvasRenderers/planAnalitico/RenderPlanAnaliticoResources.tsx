/**
 * @file RenderPlanAnaliticoResources.tsx
 * @description 5. RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE del Formato Plan Analítico 2026.
 * Incluye el indicador interactivo de Adaptación Curricular (Aplica / No aplica) y redacción colaborativa.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

export const RenderPlanAnaliticoResources: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '5.  RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE';
    const adaptacionCurricular = c.adaptacionCurricular || 'no_aplica'; // 'aplica' | 'no_aplica'
    const textHtml = c.html || '<p>Entorno virtual institucional (Moodle / Teams), proyectores multimedia, laboratorios de cómputo especializados, herramientas de desarrollo colaborativo y software bajo licenciamiento educativo.</p>';

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [isEditingText, setIsEditingText] = useState(false);
    const [textDraft, setTextDraft] = useState(textHtml.replace(/<[^>]*>/g, ''));

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleSaveText = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'html', `<p>${textDraft.trim()}</p>`);
        }
        setIsEditingText(false);
    };

    const handleToggleAdaptacion = (value: 'aplica' | 'no_aplica') => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'adaptacionCurricular', value);
        }
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text">
            {/* Indicador de Adaptación Curricular (Caja Aplica / No aplica) */}
            <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-xs font-serif font-bold text-black tracking-wide">
                    Adaptación Curricular
                </span>
                <div className="inline-flex items-center border border-black text-xs font-serif divide-x divide-black self-start">
                    <button
                        type="button"
                        onClick={() => handleToggleAdaptacion('aplica')}
                        className={`px-3 py-1 flex items-center gap-2 transition-colors cursor-pointer ${
                            adaptacionCurricular === 'aplica'
                                ? 'bg-blue-50 font-bold text-blue-900'
                                : 'bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span>Aplica</span>
                        <span className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[10px] bg-white">
                            {adaptacionCurricular === 'aplica' ? 'X' : ''}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggleAdaptacion('no_aplica')}
                        className={`px-3 py-1 flex items-center gap-2 transition-colors cursor-pointer ${
                            adaptacionCurricular === 'no_aplica'
                                ? 'bg-blue-50 font-bold text-blue-900'
                                : 'bg-white hover:bg-slate-50'
                        }`}
                    >
                        <span>No aplica</span>
                        <span className="w-3.5 h-3.5 border border-black flex items-center justify-center text-[10px] bg-white">
                            {adaptacionCurricular === 'no_aplica' ? 'X' : ''}
                        </span>
                    </button>
                </div>
            </div>

            {/* Título de la Sección 5 en Azul Cursiva Negrita */}
            <div className="group relative pt-2">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 max-w-xl">
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

            {/* Párrafo / Contenedor de Recursos Didácticos (Directo sobre la hoja) */}
            <div className="group relative py-1 px-1 min-h-[40px] text-xs text-slate-900 leading-relaxed font-normal">
                {isEditingText ? (
                    <div className="space-y-2 p-2 bg-slate-50 border border-blue-400 rounded">
                        <textarea
                            value={textDraft}
                            onChange={(e) => setTextDraft(e.target.value)}
                            rows={3}
                            className="w-full p-2 text-xs border border-slate-300 rounded text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            placeholder="Detalle los recursos didácticos, simuladores y herramientas de informatización..."
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
                                setTextDraft(textHtml.replace(/<[^>]*>/g, ''));
                                setIsEditingText(true);
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setTextDraft(textHtml.replace(/<[^>]*>/g, ''));
                                setIsEditingText(true);
                            }}
                            className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-xs transition-opacity"
                            title="Editar recursos didácticos"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

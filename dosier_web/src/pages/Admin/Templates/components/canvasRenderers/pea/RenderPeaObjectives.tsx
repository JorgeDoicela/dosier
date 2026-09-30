/**
 * @file RenderPeaObjectives.tsx
 * @description Renderizadores interactivos para las secciones de Objetivos y Resultados de Aprendizaje:
 * - b) Objetivo de la Asignatura
 * - d) Resultados de Aprendizaje de la Carrera
 * - e) Resultados de Aprendizaje de la Asignatura
 */

import React, { useState } from 'react';
import { Target, Award, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

/** Componente genérico para sección de texto curricular con textarea auto-expandible */
const EditableCurricularTextarea: React.FC<{
    value: string;
    placeholder: string;
    onChange: (val: string) => void;
    rows?: number;
}> = ({ value, placeholder, onChange, rows = 4 }) => {
    return (
        <div className="w-full bg-white p-2">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full p-2 border border-slate-200 focus:border-[#0070f3] rounded-xs text-[11px] leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:italic bg-white outline-none resize-none transition-colors"
                style={{ minHeight: `${rows * 22}px` }}
            />
            <div className="flex justify-between items-center px-1 text-[8px] text-slate-400">
                <span>Edición interactiva en el lienzo — El texto se guarda en la plantilla</span>
                <span>{value.length} caracteres</span>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// b) OBJETIVO DE LA ASIGNATURA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaObjectiveSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayLabel = c.objetivoLabel || title || 'b) OBJETIVO DE LA ASIGNATURA';

    const [editingLabel, setEditingLabel] = useState(false);
    const [labelDraft, setLabelDraft] = useState(displayLabel);

    const defaultPlaceholder = 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.';
    const currentValue = c.objetivoText ?? c.objetivoPlaceholder ?? '';

    const handleSaveLabel = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'objetivoLabel', labelDraft.trim() || 'b) OBJETIVO DE LA ASIGNATURA');
        }
        setEditingLabel(false);
    };

    const handleContentChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'objetivoText', val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingLabel(true);
                    setLabelDraft(displayLabel);
                }}
            >
                <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 shrink-0" />
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

            <div className="border border-black border-t-0 select-text">
                <EditableCurricularTextarea
                    value={currentValue}
                    placeholder={c.objetivoPlaceholder || defaultPlaceholder}
                    onChange={handleContentChange}
                    rows={4}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// d) RESULTADOS DE APRENDIZAJE DE LA CARRERA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCareerOutcomesSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayLabel = c.rdaCarreraLabel || title || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA';

    const [editingLabel, setEditingLabel] = useState(false);
    const [labelDraft, setLabelDraft] = useState(displayLabel);

    const defaultPlaceholder = 'Resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.';
    const currentValue = c.rdaCarreraText ?? c.rdaCarreraPlaceholder ?? '';

    const handleSaveLabel = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'rdaCarreraLabel', labelDraft.trim() || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA');
        }
        setEditingLabel(false);
    };

    const handleContentChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'rdaCarreraText', val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingLabel(true);
                    setLabelDraft(displayLabel);
                }}
            >
                <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 shrink-0" />
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

            <div className="border border-black border-t-0 select-text">
                <EditableCurricularTextarea
                    value={currentValue}
                    placeholder={c.rdaCarreraPlaceholder || defaultPlaceholder}
                    onChange={handleContentChange}
                    rows={4}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaSubjectOutcomesSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const displayLabel = c.rdaAsignaturaLabel || title || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:';

    const [editingLabel, setEditingLabel] = useState(false);
    const [labelDraft, setLabelDraft] = useState(displayLabel);

    const defaultPlaceholder = 'Resultados de aprendizaje específicos alcanzables por el estudiante al finalizar el curso.';
    const currentValue = c.rdaAsignaturaText ?? c.rdaAsignaturaPlaceholder ?? '';

    const handleSaveLabel = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'rdaAsignaturaLabel', labelDraft.trim() || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:');
        }
        setEditingLabel(false);
    };

    const handleContentChange = (val: string) => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'rdaAsignaturaText', val);
        }
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingLabel(true);
                    setLabelDraft(displayLabel);
                }}
            >
                <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 shrink-0" />
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

            <div className="border border-black border-t-0 select-text">
                <EditableCurricularTextarea
                    value={currentValue}
                    placeholder={c.rdaAsignaturaPlaceholder || defaultPlaceholder}
                    onChange={handleContentChange}
                    rows={5}
                />
            </div>
        </div>
    );
};

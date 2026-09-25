/**
 * @file RenderPeaSections.tsx
 * @description Renderizadores de lienzo A4 para los bloques curriculares oficiales del PEA (ISTPET).
 * Réplica exacta y profesional del formato institucional de fábrica (Secciones a hasta k).
 *
 * Características:
 * - Cabecera institucional oficial con logo y campus Chillogallo.
 * - Tablas con bordes limpios y celdas 100% sólidas sin transparencias.
 * - Sub-barras celeste y azul marino institucional según el modelo del ISTPET.
 * - Controles interactivos y edición in-situ en el lienzo.
 */

import React, { useState } from 'react';
import {
    Pencil,
    Check,
    GraduationCap,
    Target,
    Award,
    Layers,
    BookOpen,
    CheckSquare,
    Library,
    ShieldCheck
} from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../properties/SharedColorPicker';

/** Helper: Área de líneas horizontales para redacción curricular (estilo plantilla institucional) */
const RenderLinedArea: React.FC<{
    placeholder?: string;
    lineCount?: number;
    value?: string;
}> = ({ placeholder, lineCount = 4, value }) => {
    if (value && value.trim() !== '') {
        return (
            <div className="bg-white p-2">
                <p className="text-[8.5px] text-slate-800 whitespace-pre-wrap">{value}</p>
            </div>
        );
    }
    return (
        <div className="bg-white p-2 space-y-2">
            {placeholder && (
                <p className="text-[8px] italic text-slate-400 mb-1">{placeholder}</p>
            )}
            {Array.from({ length: lineCount }).map((_, i) => (
                <div key={i} className="w-full border-b border-black/40 h-3" />
            ))}
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// a) DATOS GENERALES DE LA ASIGNATURA (INCLUYE CABECERA OFICIAL ISTPET)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaGeneralSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config, title, blockId, onUpdateConfig }) => {
    const c = config || {};
    const displayTitle = c.title || title || 'a) DATOS GENERALES DE LA ASIGNATURA:';
    const defaultHeaderBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const borderStyle = c.borderStyle || 'solid';
    const isNoBorder = borderStyle === 'none';

    const tableBorderCss = isNoBorder ? 'border-0' : 'border border-black';
    const cellBorderCss = isNoBorder ? 'border-b border-black' : 'border-r border-black';
    const rowBorderCss = 'border-b border-black';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleText, setTitleText] = useState(displayTitle);

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleText.trim() || 'a) DATOS GENERALES DE LA ASIGNATURA:');
        }
        setEditingTitle(false);
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* CABECERA INSTITUCIONAL OFICIAL (LOGO + INSTITUTO TRAVERSARI CHILLOGALLO) */}
            {c.showHeader !== false && (
                <div className="border border-black flex mb-0 bg-white">
                    <div className="w-[30%] border-r border-black p-2.5 flex flex-col items-center justify-center text-center">
                        <div className="flex items-center gap-1.5 font-black text-slate-900 leading-none">
                            <span className="text-xl font-extrabold tracking-tighter text-[#1e2a4a]">IST</span>
                            <div className="text-left text-[8px] font-bold uppercase tracking-tight text-slate-700 leading-tight">
                                <div>TECNOLÓGICO</div>
                                <div>TRAVERSARI</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col justify-center text-center">
                        <h2 className="text-[10px] font-bold uppercase text-slate-900 tracking-wide leading-tight">
                            {c.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"'}
                        </h2>
                        <p className="text-[8px] font-semibold text-slate-800 uppercase tracking-tight mt-0.5">
                            {c.institutionAddress || 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)'}
                        </p>
                        <h3 className="text-[9px] font-bold uppercase text-slate-900 tracking-wider mt-1">
                            {c.documentTitle || 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA'}
                        </h3>
                    </div>
                </div>
            )}

            {/* BARRA AZUL MARINO DE SECCIÓN a) */}
            <div
                className="w-full py-1 px-3 flex items-center justify-between font-bold text-[9px] uppercase tracking-wider cursor-pointer group"
                style={{ backgroundColor: defaultHeaderBg, color: getContrastFg(defaultHeaderBg) }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleText(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    {editingTitle ? (
                        <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                            <input
                                type="text"
                                value={titleText}
                                onChange={e => setTitleText(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                                autoFocus
                                className="bg-white text-slate-900 px-1.5 py-0.5 text-[9px] rounded font-bold uppercase tracking-wider outline-none"
                            />
                            <button type="button" onClick={handleSaveTitle} className="p-0.5 text-emerald-400 hover:text-emerald-300">
                                <Check className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <span>{displayTitle}</span>
                    )}
                </div>
                <span className="opacity-0 group-hover:opacity-100 text-[7.5px] bg-white/20 px-1 py-0.5 rounded flex items-center gap-1">
                    <Pencil className="w-2.5 h-2.5" /> Editar
                </span>
            </div>

            {/* TABLA DE LOS 10 CAMPOS OFICIALES DEL PEA */}
            <table className={`w-full text-left border-collapse ${tableBorderCss} text-[8.5px]`}>
                <tbody>
                    {/* 1. Nombre de la asignatura */}
                    {c.showAsignatura !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} w-[42%] bg-white`}>
                                {c.customLabel_showAsignatura || 'Nombre de la asignatura:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold uppercase">
                                [VINCULADO A SIGAFI — ASIGNATURA SELECCIONADA]
                            </td>
                        </tr>
                    )}

                    {/* 2. Código de carrera */}
                    {c.showCodigoCarrera !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showCodigoCarrera || 'Código de carrera:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-mono">
                                [CÓDIGO DE CARRERA SIGAFI]
                            </td>
                        </tr>
                    )}

                    {/* 3. Carrera */}
                    {c.showCarrera !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showCarrera || 'Carrera:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 uppercase font-semibold">
                                TECNOLOGÍA SUPERIOR EN [CARRERA VINCULADA]
                            </td>
                        </tr>
                    )}

                    {/* 4. Modalidad de estudio */}
                    {c.showModalidad !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showModalidad || 'Modalidad de estudio:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700">
                                Presencial
                            </td>
                        </tr>
                    )}

                    {/* 5. Unidad de Organización Curricular */}
                    {c.showUnidadOrganizacion !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showUnidadOrganizacion || 'Unidad de Organización Curricular:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700">
                                Unidad Profesional
                            </td>
                        </tr>
                    )}

                    {/* 6. Periodo académico */}
                    {c.showPeriodo !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showPeriodo || 'Periodo académico:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                2026-I
                            </td>
                        </tr>
                    )}

                    {/* 7. Semestre */}
                    {c.showSemestre !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showSemestre || 'Semestre:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700">
                                Tercer Semestre
                            </td>
                        </tr>
                    )}

                    {/* 8. Número de horas de la asignatura */}
                    {c.showTotalHoras !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showTotalHoras || 'Número de horas de la asignatura:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                160
                            </td>
                        </tr>
                    )}

                    {/* 9. Número de créditos */}
                    {c.showCreditos !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {c.customLabel_showCreditos || 'Número de créditos:'}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                3.33
                            </td>
                        </tr>
                    )}

                    {/* 10. Organización de aprendizajes por modalidad (con 3 subfilas oficiales) */}
                    {c.showOrganizacionAprendizaje !== false && (
                        <tr>
                            <td className={`p-2 font-bold ${cellBorderCss} align-top bg-white leading-snug`}>
                                {c.customLabel_showOrganizacionAprendizaje || 'Organización de aprendizajes por modalidad, número de horas destinadas a cada componente'}
                            </td>
                            <td className="p-0 bg-white">
                                <table className="w-full text-left border-collapse text-[8.5px]">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className={`p-1.5 font-medium ${cellBorderCss} w-[65%]`}>
                                                Total horas de contacto docente:
                                            </td>
                                            <td className="p-1.5 text-slate-700 font-semibold">
                                                64
                                            </td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className={`p-1.5 font-medium ${cellBorderCss}`}>
                                                Total horas de aprendizaje experimental:
                                            </td>
                                            <td className="p-1.5 text-slate-700 font-semibold">
                                                32
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={`p-1.5 font-medium ${cellBorderCss}`}>
                                                Total horas de practico autónomo:
                                            </td>
                                            <td className="p-1.5 text-slate-700 font-semibold">
                                                64
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// b) OBJETIVO DE LA ASIGNATURA (BLOQUE ATÓMICO)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaObjectiveSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const lineCount = typeof c.lineCount === 'number' ? c.lineCount : 4;

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.objetivoLabel || 'b) OBJETIVO DE LA ASIGNATURA'}</span>
                </div>
            </div>
            <div className="border border-black border-t-0">
                <RenderLinedArea
                    placeholder={c.objetivoPlaceholder || 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.'}
                    lineCount={lineCount}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// c) PRERREQUISITOS (BLOQUE ATÓMICO)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaPrerequisitesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const rowCount = typeof c.filasVacias === 'number' ? c.filasVacias : 2;

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <span>{c.prerrequisitosLabel || 'c) PRERREQUISITOS:'}</span>
            </div>
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
                <tbody className="divide-y divide-black/40">
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black italic text-slate-600">[Completar materia previa]</td>
                        <td className="p-1.5 italic text-slate-600">[Aprobada con nota mínima 7.00]</td>
                    </tr>
                    {Array.from({ length: Math.max(0, rowCount - 1) }).map((_, idx) => (
                        <tr key={idx} className="bg-white h-7">
                            <td className="p-1.5 border-r border-black italic text-slate-400"></td>
                            <td className="p-1.5 italic text-slate-400"></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// d) RESULTADOS DE APRENDIZAJE DE LA CARRERA (BLOQUE ATÓMICO)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCareerOutcomesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const lineCount = typeof c.lineCount === 'number' ? c.lineCount : 4;

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.rdaCarreraLabel || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA'}</span>
                </div>
            </div>
            <div className="border border-black border-t-0">
                <RenderLinedArea
                    placeholder={c.rdaCarreraPlaceholder || 'Resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.'}
                    lineCount={lineCount}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA (BLOQUE ATÓMICO)
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaSubjectOutcomesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const lineCount = typeof c.lineCount === 'number' ? c.lineCount : 5;

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <span>{c.rdaAsignaturaLabel || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:'}</span>
            </div>
            <div className="border border-black border-t-0">
                <RenderLinedArea
                    placeholder={c.rdaAsignaturaPlaceholder || 'Resultados de aprendizaje específicos alcanzables por el estudiante al finalizar el curso.'}
                    lineCount={lineCount}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// [LEGACY] b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCharacterizationSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* b) OBJETIVO DE LA ASIGNATURA */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.objetivoLabel || 'b) OBJETIVO DE LA ASIGNATURA'}</span>
                </div>
            </div>
            <div className="border border-black border-t-0 mb-3">
                <RenderLinedArea
                    placeholder={c.objetivoPlaceholder || 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.'}
                    lineCount={4}
                />
            </div>

            {/* c) PRERREQUISITOS */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <span>{c.prerrequisitosLabel || 'c) PRERREQUISITOS:'}</span>
            </div>
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
                <tbody className="divide-y divide-black/40">
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black italic text-slate-600">[Completar materia previa]</td>
                        <td className="p-1.5 italic text-slate-600">[Aprobada con nota mínima 7.00]</td>
                    </tr>
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black italic text-slate-400"></td>
                        <td className="p-1.5 italic text-slate-400"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// [LEGACY] d) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaCompetenciesRdaSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* d) RESULTADOS DE APRENDIZAJE DE LA CARRERA */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.rdaCarreraLabel || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA'}</span>
                </div>
            </div>
            <div className="border border-black border-t-0 mb-3">
                <RenderLinedArea
                    placeholder={c.rdaCarreraPlaceholder || 'Resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.'}
                    lineCount={4}
                />
            </div>

            {/* e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <span>{c.rdaAsignaturaLabel || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:'}</span>
            </div>
            <div className="border border-black border-t-0">
                <RenderLinedArea
                    placeholder={c.rdaAsignaturaPlaceholder || 'Resultados de aprendizaje específicos alcanzables por el estudiante al finalizar el curso.'}
                    lineCount={5}
                />
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// f) CONTENIDOS DE ENSEÑANZA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaContentsSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const subHeaderBg = c.subHeaderColor || '#bdd7ee';
    const fg = getContrastFg(headerBg);

    const unidades: any[] = Array.isArray(c.unidades) && c.unidades.length > 0 ? c.unidades : [
        { num: 1, titulo: 'UNIDAD 1: [COMPLETAR NOMBRE DE LA UNIDAD]', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
        { num: 2, titulo: 'UNIDAD 2: [COMPLETAR NOMBRE DE LA UNIDAD]', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
        { num: 3, titulo: 'UNIDAD 3: [COMPLETAR NOMBRE DE LA UNIDAD]', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
    ];

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN f) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'f) CONTENIDOS DE ENSEÑANZA:'}</span>
                </div>
            </div>

            {/* TABLA PRINCIPAL CON FORMATO OFICIAL No | UNIDADES DE ESTUDIO Y SUS CONTENIDOS */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="font-bold border-b border-black text-center" style={{ backgroundColor: headerBg, color: fg }}>
                        <th className="p-1 border-r border-black w-[6%]">No</th>
                        <th className="p-1">UNIDADES DE ESTUDIO Y SUS CONTENIDOS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black">
                    {unidades.map((u: any, idx: number) => (
                        <tr key={idx} className="border-b border-black">
                            {/* NÚMERO DE LA UNIDAD */}
                            <td className="p-2 border-r border-black text-center font-bold text-base align-middle bg-white w-[6%]">
                                {u.num}
                            </td>

                            {/* ESTRUCTURA INTERNA DE LA UNIDAD */}
                            <td className="p-0 align-top bg-white">
                                <div className="border-collapse">
                                    {/* ENCABEZADO DE UNIDAD (CELESTE CLARO ISTPET) */}
                                    <div
                                        className="flex items-center justify-between border-b border-black px-2 py-1 font-bold text-[8.5px] uppercase"
                                        style={{ backgroundColor: subHeaderBg, color: '#000000' }}
                                    >
                                        <span>{u.titulo || `UNIDAD ${u.num}:`}</span>
                                        <span>Total de horas por unidad: {u.horasTotal ?? ''}</span>
                                    </div>

                                    {/* SUB-CABECERA DE 3 COLUMNAS DE HORAS */}
                                    <div
                                        className="grid grid-cols-3 border-b border-black text-[8px] font-semibold divide-x divide-black"
                                        style={{ backgroundColor: subHeaderBg, color: '#000000' }}
                                    >
                                        <div className="p-1">
                                            Horas contacto con el docente: <span className="font-bold">{u.horasCD ?? ''}</span>
                                        </div>
                                        <div className="p-1">
                                            Horas Práctico-experimental: <span className="font-bold">{u.horasAPE ?? ''}</span>
                                        </div>
                                        <div className="p-1">
                                            Horas de aprendizaje autónomo: <span className="font-bold">{u.horasTA ?? ''}</span>
                                        </div>
                                    </div>

                                    {/* RENGLONES PARA CONTENIDOS TEMÁTICOS */}
                                    <div className="p-1.5 space-y-2 bg-white">
                                        <div className="w-full border-b border-black/40 h-3" />
                                        <div className="w-full border-b border-black/40 h-3" />
                                        <div className="w-full border-b border-black/40 h-3" />
                                        <div className="w-full border-b border-black/40 h-3" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// g) METODOLOGÍA DE ENSEÑANZA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaMethodologySection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN g) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'g) METODOLOGÍA DE ENSEÑANZA'}</span>
                </div>
            </div>

            <div className="border border-black border-t-0 divide-y divide-black">
                {/* ESTRATEGIAS METODOLÓGICAS */}
                <div>
                    <div className="bg-slate-200/80 px-2 py-0.5 font-bold text-[8.5px] uppercase border-b border-black text-slate-900">
                        {c.estrategiasLabel || 'ESTRATEGIAS METODOLÓGICAS'}
                    </div>
                    <RenderLinedArea
                        placeholder={c.estrategiasPlaceholder || 'En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se tiene la sig. metodología...'}
                        lineCount={5}
                    />
                </div>

                {/* RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE */}
                <div>
                    <div className="bg-slate-200/80 px-2 py-0.5 font-bold text-[8.5px] uppercase border-b border-black text-slate-900">
                        {c.recursosLabel || 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE'}
                    </div>
                    <RenderLinedArea
                        placeholder={c.recursosPlaceholder || 'Simuladores, presentaciones, videos educativos, plataformas virtuales y herramientas interactivas.'}
                        lineCount={5}
                    />
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// h) ACTIVIDADES PRÁCTICAS
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaResourcesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN h) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'h) ACTIVIDADES PRÁCTICAS'}</span>
                </div>
            </div>

            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="bg-slate-50 font-bold border-b border-black text-slate-900">
                        <th className="p-1.5 border-r border-black w-[20%] text-center">
                            {c.colUnidadLabel || 'Unidad'}
                        </th>
                        <th className="p-1.5">
                            {c.colPracticaLabel || 'Nombre de la práctica y caracterización de la actividad'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/40">
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black text-center font-bold">1</td>
                        <td className="p-1.5 italic text-slate-600">[Completar nombre y detalle de la práctica]</td>
                    </tr>
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black text-center font-bold">2</td>
                        <td className="p-1.5 italic text-slate-600">[Completar nombre y detalle de la práctica]</td>
                    </tr>
                    <tr className="bg-white h-7">
                        <td className="p-1.5 border-r border-black text-center font-bold">3</td>
                        <td className="p-1.5 italic text-slate-600">[Completar nombre y detalle de la práctica]</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// i) EVALUACIÓN DEL APRENDIZAJE
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaEvaluationSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const tableHeaderBg = c.tableHeaderBg || '#bdd7ee';
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN i) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'i) EVALUACIÓN DEL APRENDIZAJE'}</span>
                </div>
            </div>

            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr
                        className="font-bold border-b border-black text-slate-900 text-center"
                        style={{ backgroundColor: tableHeaderBg }}
                    >
                        <th className="p-1.5 border-r border-black w-[22%] text-left">
                            {c.colNotasLabel || 'Notas'}
                        </th>
                        <th className="p-1.5 border-r border-black w-[58%] text-center">
                            {c.colTipoLabel || 'TIPO DE EVALUACIÓN'}
                        </th>
                        <th className="p-1.5 w-[20%] text-center">
                            {c.colCalifLabel || 'CALIFICACION'}
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/60 bg-white">
                    <tr className="border-b border-black">
                        <td className="p-2 border-r border-black font-bold uppercase text-slate-900">
                            NOTA PARCIAL 1
                        </td>
                        <td className="p-2 border-r border-black font-medium text-slate-800">
                            {c.parcial1Desc || 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)'}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900">
                            {c.parcial1Nota || '10,00'}
                        </td>
                    </tr>
                    <tr className="border-b border-black">
                        <td className="p-2 border-r border-black font-bold uppercase text-slate-900">
                            NOTA PARCIAL 2
                        </td>
                        <td className="p-2 border-r border-black font-medium text-slate-800">
                            {c.parcial2Desc || 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)'}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900">
                            {c.parcial2Nota || '10,00'}
                        </td>
                    </tr>
                    <tr>
                        <td className="p-2 border-r border-black font-bold uppercase text-slate-900">
                            EVALUACIÓN FINAL
                        </td>
                        <td className="p-2 border-r border-black font-medium text-slate-800">
                            {c.finalDesc || 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)'}
                        </td>
                        <td className="p-2 text-center font-bold text-slate-900">
                            {c.finalNota || '10,00'}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// j) BIBLIOGRAFÍA
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaBibliographySection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-2 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN j) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <Library className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'j) BIBLIOGRAFÍA'}</span>
                </div>
            </div>

            <div className="border border-black border-t-0 divide-y divide-black">
                {/* BIBLIOGRAFÍA BÁSICA */}
                <div>
                    <div className="bg-slate-200/80 px-2 py-0.5 font-bold text-[8.5px] border-b border-black text-slate-900 text-center">
                        {c.basicaLabel || 'Bibliografía básica'}
                    </div>
                    <RenderLinedArea
                        placeholder={c.basicaPlaceholder || 'Texto base o guía según normas APA 7ma edición.'}
                        lineCount={4}
                    />
                </div>

                {/* BIBLIOGRAFÍA DE CONSULTA */}
                <div>
                    <div className="bg-slate-200/80 px-2 py-0.5 font-bold text-[8.5px] border-b border-black text-slate-900 text-center">
                        {c.consultaLabel || 'Bibliografía de consulta'}
                    </div>
                    <RenderLinedArea
                        placeholder={c.consultaPlaceholder || 'Artículos científicos, libros complementarios o recursos web indexados.'}
                        lineCount={4}
                    />
                </div>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// k) FIRMAS DE RESPONSABILIDAD
// ─────────────────────────────────────────────────────────────────────────────

export const RenderPeaSignaturesSection: React.FC<{
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}> = ({ config }) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN k) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider"
                style={{ backgroundColor: headerBg, color: fg }}
            >
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title || 'k) FIRMAS DE RESPONSABILIDAD'}</span>
                </div>
            </div>

            {/* TABLA OFICIAL DE 5 COLUMNAS Y 4 FILAS */}
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
                <tbody className="divide-y divide-black bg-white">
                    {/* FILA 1: FIRMA */}
                    <tr className="h-16">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900 align-middle">
                            FIRMA
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                        </td>
                        <td className="p-1.5 border-r border-black align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                        </td>
                        <td className="p-1.5 align-bottom text-center">
                            <div className="w-full border-b border-dashed border-slate-300 mb-1" />
                        </td>
                    </tr>

                    {/* FILA 2: NOMBRE */}
                    <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            NOMBRE
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800 font-semibold">
                            {c.nombreElaborado || '[Nombre del Docente]'}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800 font-semibold">
                            {c.nombreRevisado1 || '[Coordinador Carrera]'}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800 font-semibold">
                            {c.nombreRevisado2 || '[Coordinador Académico]'}
                        </td>
                        <td className="p-1.5 text-center text-slate-800 font-semibold">
                            {c.nombreAprobado || '[Vicerrectorado]'}
                        </td>
                    </tr>

                    {/* FILA 3: CARGO */}
                    <tr className="border-b border-black">
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            CARGO
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800">
                            {c.cargoElaborado || 'Docente'}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800">
                            {c.cargoRevisado1 || 'Coordinador de Carrera'}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-800">
                            {c.cargoRevisado2 || 'Coordinador Académico'}
                        </td>
                        <td className="p-1.5 text-center text-slate-800">
                            {c.cargoAprobado || 'Vicerrectorado'}
                        </td>
                    </tr>

                    {/* FILA 4: FECHA */}
                    <tr>
                        <td className="p-1.5 border-r border-black font-bold uppercase text-slate-900">
                            FECHA
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-600">
                            {c.fechaElaborado || ''}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-600">
                            {c.fechaRevisado1 || ''}
                        </td>
                        <td className="p-1.5 border-r border-black text-center text-slate-600">
                            {c.fechaRevisado2 || ''}
                        </td>
                        <td className="p-1.5 text-center text-slate-600">
                            {c.fechaAprobado || ''}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

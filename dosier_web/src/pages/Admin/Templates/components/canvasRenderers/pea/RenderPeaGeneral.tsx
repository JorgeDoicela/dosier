/**
 * @file RenderPeaGeneral.tsx
 * @description a) Datos Generales de la Asignatura + Cabecera Oficial ISTPET.
 * Bloque interactivo con edición in-situ de metadatos institucionales y etiquetas de campo.
 */

import React, { useState } from 'react';
import { GraduationCap, Pencil, Check, X } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

export const RenderPeaGeneralSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
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

    const [editingHeader, setEditingHeader] = useState(false);
    const [instName, setInstName] = useState(c.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"');
    const [instAddress, setInstAddress] = useState(c.institutionAddress || 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)');
    const [docTitle, setDocTitle] = useState(c.documentTitle || 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA');

    const [editingLabelKey, setEditingLabelKey] = useState<string | null>(null);
    const [labelDraft, setLabelDraft] = useState('');

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleText.trim() || 'a) DATOS GENERALES DE LA ASIGNATURA:');
        }
        setEditingTitle(false);
    };

    const handleSaveHeader = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'institutionName', instName.trim());
            onUpdateConfig(blockId, 'institutionAddress', instAddress.trim());
            onUpdateConfig(blockId, 'documentTitle', docTitle.trim());
        }
        setEditingHeader(false);
    };

    const startEditLabel = (key: string, currentVal: string) => {
        setEditingLabelKey(key);
        setLabelDraft(currentVal);
    };

    const saveLabel = (key: string) => {
        if (onUpdateConfig && blockId && labelDraft.trim()) {
            onUpdateConfig(blockId, key, labelDraft.trim());
        }
        setEditingLabelKey(null);
    };

    const renderEditableLabel = (key: string, defaultText: string) => {
        const text: string = typeof c[key] === 'string' && c[key] ? (c[key] as string) : defaultText;
        if (editingLabelKey === key) {
            return (
                <div className="flex items-center gap-1 select-text" onClick={e => e.stopPropagation()}>
                    <input
                        type="text"
                        value={labelDraft}
                        onChange={e => setLabelDraft(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') saveLabel(key);
                            if (e.key === 'Escape') setEditingLabelKey(null);
                        }}
                        autoFocus
                        className="bg-white border border-[#0070f3] text-slate-900 px-1 py-0.5 text-[8.5px] rounded-xs font-bold outline-none w-full"
                    />
                    <button
                        type="button"
                        onClick={() => saveLabel(key)}
                        className="p-0.5 text-emerald-600 hover:text-emerald-700 cursor-pointer"
                        title="Guardar etiqueta"
                    >
                        <Check className="w-3 h-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditingLabelKey(null)}
                        className="p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        title="Cancelar"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            );
        }

        return (
            <div
                className="group/lbl flex items-center justify-between cursor-pointer hover:text-[#0070f3] transition-colors"
                onClick={() => startEditLabel(key, text)}
                title="Haz clic para personalizar esta etiqueta"
            >
                <span>{text}</span>
                <Pencil className="w-2.5 h-2.5 opacity-0 group-hover/lbl:opacity-100 text-[#0070f3] shrink-0 ml-1" />
            </div>
        );
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* CABECERA INSTITUCIONAL OFICIAL (LOGO + INSTITUTO TRAVERSARI CHILLOGALLO) */}
            {c.showHeader !== false && (
                <div className="border border-black flex mb-0 bg-white relative group">
                    <div className="w-[30%] p-2 flex flex-col items-center justify-center text-center">
                        <img
                            src="/ISTPET-ORIGINAL.png"
                            alt="ISTPET - Instituto Tecnológico Traversari"
                            className="max-h-[46px] max-w-[150px] w-auto h-auto object-contain"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                                const fallback = (e.target as HTMLElement).nextElementSibling;
                                if (fallback) (fallback as HTMLElement).style.display = 'flex';
                            }}
                        />
                        <div className="hidden items-center gap-1.5 font-bold text-slate-900 leading-none">
                            <span className="text-xl font-bold tracking-tight text-[#1e2a4a]">IST</span>
                            <div className="text-left text-[8px] font-bold uppercase tracking-tight text-slate-700 leading-tight">
                                <div>TECNOLÓGICO</div>
                                <div>TRAVERSARI</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 p-2 flex flex-col justify-center text-center">
                        {editingHeader ? (
                            <div className="space-y-1 select-text" onClick={e => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={instName}
                                    onChange={e => setInstName(e.target.value)}
                                    placeholder="Nombre de la Institución"
                                    className="w-full border border-[#0070f3] px-1.5 py-0.5 text-[9px] font-bold uppercase text-center outline-none"
                                />
                                <input
                                    type="text"
                                    value={instAddress}
                                    onChange={e => setInstAddress(e.target.value)}
                                    placeholder="Dirección o Campus"
                                    className="w-full border border-slate-300 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-center outline-none"
                                />
                                <input
                                    type="text"
                                    value={docTitle}
                                    onChange={e => setDocTitle(e.target.value)}
                                    placeholder="Título del Documento"
                                    className="w-full border border-slate-300 px-1.5 py-0.5 text-[8.5px] font-bold uppercase text-center outline-none"
                                />
                                <div className="flex justify-center gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={handleSaveHeader}
                                        className="px-2 py-0.5 bg-[#0070f3] text-white text-[8px] font-semibold rounded-xs hover:bg-blue-600 flex items-center gap-1"
                                    >
                                        <Check className="w-2.5 h-2.5" /> Guardar Cabecera
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingHeader(false)}
                                        className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[8px] font-medium rounded-xs hover:bg-slate-200"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="cursor-pointer hover:bg-slate-50 p-1 rounded-xs transition-colors"
                                onClick={() => setEditingHeader(true)}
                                title="Haz clic para editar los textos de la cabecera institucional"
                            >
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
                        )}
                    </div>
                    {!editingHeader && (
                        <button
                            type="button"
                            onClick={() => setEditingHeader(true)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-white border border-slate-200 text-slate-500 hover:text-[#0070f3] rounded-xs shadow-xs text-[7px] flex items-center gap-0.5"
                            title="Editar cabecera"
                        >
                            <Pencil className="w-2.5 h-2.5" />
                        </button>
                    )}
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
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSaveTitle();
                                    if (e.key === 'Escape') setEditingTitle(false);
                                }}
                                autoFocus
                                className="bg-white text-slate-900 px-1.5 py-0.5 text-[9px] rounded-xs font-bold uppercase tracking-wider outline-none"
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
                    <Pencil className="w-2.5 h-2.5" /> Editar
                </span>
            </div>

            {/* TABLA DE LOS CAMPOS OFICIALES DEL PEA CON LABELS INTERACTIVOS */}
            <table className={`w-full text-left border-collapse ${tableBorderCss} text-[8.5px]`}>
                <tbody>
                    {/* 1. Nombre de la asignatura */}
                    {c.showAsignatura !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} w-[42%] bg-white`}>
                                {renderEditableLabel('customLabel_showAsignatura', 'Nombre de la asignatura:')}
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
                                {renderEditableLabel('customLabel_showCodigoCarrera', 'Código de carrera:')}
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
                                {renderEditableLabel('customLabel_showCarrera', 'Carrera:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 uppercase font-semibold">
                                TECNOLOGÍA SUPERIOR EN [CARRERA VINCULADA]
                            </td>
                        </tr>
                    )}

                    {/* 4. Código de asignatura (No oficial en Bloque A) */}
                    {c.showCodigoAsignatura === true && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showCodigoAsignatura', 'Código de la asignatura:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-mono">
                                [CÓDIGO DE ASIGNATURA SIGAFI]
                            </td>
                        </tr>
                    )}

                    {/* 5. Modalidad */}
                    {c.showModalidad !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showModalidad', 'Modalidad de estudio:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                Presencial / En línea / Híbrida
                            </td>
                        </tr>
                    )}

                    {/* 6. Unidad de organización curricular */}
                    {c.showUnidadOrganizacion !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showUnidadOrganizacion', 'Unidad de Organización Curricular:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                Unidad Profesional / Básica
                            </td>
                        </tr>
                    )}

                    {/* 7. Periodo académico */}
                    {c.showPeriodo !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showPeriodo', 'Periodo académico:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                [PERIODO LECTIVO ACTIVO]
                            </td>
                        </tr>
                    )}

                    {/* 8. Semestre */}
                    {c.showSemestre !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showSemestre', 'Semestre:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                [NIVEL SEMESTRAL]
                            </td>
                        </tr>
                    )}

                    {/* 9. Número de horas de la asignatura */}
                    {c.showTotalHoras !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showTotalHoras', 'Número de horas de la asignatura:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                160
                            </td>
                        </tr>
                    )}

                    {/* 10. Número de créditos */}
                    {c.showCreditos !== false && (
                        <tr className={rowBorderCss}>
                            <td className={`p-1.5 font-bold ${cellBorderCss} bg-white`}>
                                {renderEditableLabel('customLabel_showCreditos', 'Número de créditos:')}
                            </td>
                            <td className="p-1.5 bg-white text-slate-700 font-semibold">
                                3.33
                            </td>
                        </tr>
                    )}

                    {/* 11. Organización de aprendizajes por componente */}
                    {c.showOrganizacionAprendizaje !== false && (
                        <tr>
                            <td className={`p-2 font-bold ${cellBorderCss} align-top bg-white leading-snug`}>
                                {renderEditableLabel('customLabel_showOrganizacionAprendizaje', 'Organización de aprendizajes por modalidad, número de horas destinadas a cada componente')}
                            </td>
                            <td className="p-0 bg-white">
                                <table className="w-full text-left border-collapse text-[8.5px]">
                                    <tbody>
                                        <tr className="border-b border-black">
                                            <td className="p-1.5 font-medium">
                                                Total horas de contacto docente: <span className="text-slate-700 font-semibold ml-2">64</span>
                                            </td>
                                        </tr>
                                        <tr className="border-b border-black">
                                            <td className="p-1.5 font-medium">
                                                Total horas de práctico experimental: <span className="text-slate-700 font-semibold ml-2">32</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="p-1.5 font-medium">
                                                Total horas de aprendizaje autónomo: <span className="text-slate-700 font-semibold ml-2">64</span>
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

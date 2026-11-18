/**
 * @file RenderTutoriasHeader.tsx
 * @description 1. CABECERA Y DATOS DEL DOCENTE (Formato Seguimiento de Tutorías Académicas 2026).
 * Muestra el logotipo institucional, títulos oficiales y tabla de datos del docente.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from '../planAnalitico/RenderPlanAnaliticoGeneral';

export const RenderTutoriasHeader: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const institutionName = c.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO MAYOR PEDRO TRAVERSARI';
    const documentTitle = c.documentTitle || 'SEGUIMIENTO DE TUTORÍAS ACADÉMICAS';
    const periodoAcademico = c.periodoAcademico || 'PERIODO ACADEMICO ABRIL - SEPTIEMBRE 2026';
    const docenteNombre = c.docenteNombre || '';
    const horarioTutoria = c.horarioTutoria || '';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const [isEditingTitles, setIsEditingTitles] = useState(false);
    const [titlesDraft, setTitlesDraft] = useState({
        institution: institutionName,
        title: documentTitle,
        periodo: periodoAcademico
    });

    const [isEditingDocente, setIsEditingDocente] = useState(false);
    const [docenteDraft, setDocenteDraft] = useState({
        docente: docenteNombre,
        horario: horarioTutoria
    });

    const handleSaveTitles = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'institutionName', titlesDraft.institution.trim() || institutionName);
            onUpdateConfig(blockId, 'documentTitle', titlesDraft.title.trim() || documentTitle);
            onUpdateConfig(blockId, 'periodoAcademico', titlesDraft.periodo.trim() || periodoAcademico);
        }
        setIsEditingTitles(false);
    };

    const handleSaveDocente = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'docenteNombre', docenteDraft.docente.trim());
            onUpdateConfig(blockId, 'horarioTutoria', docenteDraft.horario.trim());
        }
        setIsEditingDocente(false);
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-4 font-sans select-text">
            {/* Cabecera Principal: Logo a la izquierda + Títulos centrados */}
            <div className="flex items-center justify-between border-b-2 border-emerald-700/60 pb-3 gap-4">
                {/* Logo Institucional ISTPET */}
                <div className="flex-shrink-0 flex items-center gap-2">
                    <img
                        src="/logo_istpet_negro.png"
                        alt="ISTPET Logo"
                        className="h-12 w-auto object-contain"
                        onError={(e) => {
                            // Fallback tipográfico institucional si la imagen no carga
                            (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                    />
                    <div className="flex flex-col leading-tight border-l-2 border-[#1e2a4a] pl-2">
                        <span className="font-extrabold text-sm text-[#1e2a4a] tracking-tight">IST TECNOLÓGICO</span>
                        <span className="font-extrabold text-sm text-[#b8912e] tracking-tight">PET TRAVERSARI</span>
                    </div>
                </div>

                {/* Títulos Centrados */}
                <div className="flex-1 text-center group relative px-2">
                    {isEditingTitles ? (
                        <div className="space-y-1.5 max-w-lg mx-auto p-2 bg-slate-50 border border-blue-400 rounded">
                            <input
                                type="text"
                                value={titlesDraft.institution}
                                onChange={(e) => setTitlesDraft({ ...titlesDraft, institution: e.target.value })}
                                className="w-full text-xs font-bold border border-slate-300 rounded p-1 text-center"
                                placeholder="Nombre de la Institución"
                            />
                            <input
                                type="text"
                                value={titlesDraft.title}
                                onChange={(e) => setTitlesDraft({ ...titlesDraft, title: e.target.value })}
                                className="w-full text-sm font-bold border border-slate-300 rounded p-1 text-center text-blue-900"
                                placeholder="Título del Documento"
                            />
                            <input
                                type="text"
                                value={titlesDraft.periodo}
                                onChange={(e) => setTitlesDraft({ ...titlesDraft, periodo: e.target.value })}
                                className="w-full text-xs font-bold text-red-600 border border-slate-300 rounded p-1 text-center"
                                placeholder="Periodo Académico"
                            />
                            <div className="flex items-center justify-end gap-1.5 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsEditingTitles(false)}
                                    className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTitles}
                                    className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => {
                                setTitlesDraft({ institution: institutionName, title: documentTitle, periodo: periodoAcademico });
                                setIsEditingTitles(true);
                            }}
                            className="cursor-pointer hover:bg-slate-50/60 p-1 rounded transition-colors"
                        >
                            <h1 className="text-xs font-bold text-[#1e2a4a] tracking-wide uppercase">
                                {institutionName}
                            </h1>
                            <h2 className="text-sm font-extrabold text-slate-900 tracking-wider uppercase mt-0.5">
                                {documentTitle}
                            </h2>
                            <h3 className="text-xs font-bold text-red-600 tracking-wide uppercase mt-0.5">
                                {periodoAcademico}
                            </h3>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setTitlesDraft({ institution: institutionName, title: documentTitle, periodo: periodoAcademico });
                                    setIsEditingTitles(true);
                                }}
                                className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-xs transition-opacity"
                                title="Editar títulos de cabecera"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Espacio derecho para balance simétrico */}
                <div className="w-24 hidden md:block" />
            </div>

            {/* Ficha de Información del Docente (DOCENTE y HORARIO DE TUTORÍA) */}
            <div className="w-full max-w-xl group relative">
                {isEditingDocente ? (
                    <div className="space-y-2 p-2 bg-slate-50 border border-blue-400 rounded">
                        <div className="flex items-center gap-2">
                            <span className="w-40 text-xs font-bold text-slate-700">DOCENTE:</span>
                            <input
                                type="text"
                                value={docenteDraft.docente}
                                onChange={(e) => setDocenteDraft({ ...docenteDraft, docente: e.target.value })}
                                className="w-full text-xs border border-slate-300 rounded p-1"
                                placeholder="Nombre completo del docente titular"
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-40 text-xs font-bold text-slate-700">HORARIO DE TUTORÍA:</span>
                            <input
                                type="text"
                                value={docenteDraft.horario}
                                onChange={(e) => setDocenteDraft({ ...docenteDraft, horario: e.target.value })}
                                className="w-full text-xs border border-slate-300 rounded p-1"
                                placeholder="Ej. Lunes y Miércoles 16:00 - 17:00"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsEditingDocente(false)}
                                className="px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveDocente}
                                className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onClick={() => {
                            setDocenteDraft({ docente: docenteNombre, horario: horarioTutoria });
                            setIsEditingDocente(true);
                        }}
                        className="cursor-pointer hover:bg-slate-50/60 p-0.5 rounded transition-colors"
                    >
                        <table className="border-collapse text-xs border border-black w-full">
                            <tbody>
                                <tr className="border-b border-black">
                                    <td
                                        style={{ backgroundColor: headerBg }}
                                        className="w-44 px-3 py-1 text-white font-bold uppercase tracking-wider text-[11px] align-middle"
                                    >
                                        DOCENTE:
                                    </td>
                                    <td className="px-3 py-1 font-semibold text-slate-900 bg-white min-h-[24px]">
                                        {docenteNombre || <span className="text-slate-400 italic font-normal">[Nombre del docente titular]</span>}
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        style={{ backgroundColor: headerBg }}
                                        className="w-44 px-3 py-1 text-white font-bold uppercase tracking-wider text-[11px] align-middle"
                                    >
                                        HORARIO DE TUTORÍA:
                                    </td>
                                    <td className="px-3 py-1 text-slate-800 bg-white min-h-[24px]">
                                        {horarioTutoria || <span className="text-slate-400 italic">[Franja horaria asignada]</span>}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDocenteDraft({ docente: docenteNombre, horario: horarioTutoria });
                                setIsEditingDocente(true);
                            }}
                            className="absolute -top-1 right-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-xs transition-opacity"
                            title="Editar datos del docente"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

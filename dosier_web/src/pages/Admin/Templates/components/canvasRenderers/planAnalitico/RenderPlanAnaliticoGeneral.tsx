/**
 * @file RenderPlanAnaliticoGeneral.tsx
 * @description 1. DATOS INFORMATIVOS (Información General) del Formato Plan Analítico 2026.
 * Renderizador interactivo fiel al formato oficial institucional.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';

export interface PlanAnaliticoBlockProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

interface FieldItem {
    key: string;
    label: string;
    value: string;
}

const DEFAULT_FIELDS: FieldItem[] = [
    { key: 'codigo_carrera', label: 'Código de Carrera:', value: '' },
    { key: 'asignatura', label: 'Asignatura:', value: '' },
    { key: 'carrera', label: 'Carrera', value: '' },
    { key: 'periodo', label: 'Periodo Académico:', value: '' },
    { key: 'modalidad', label: 'Modalidad:', value: '' },
    { key: 'nivel', label: 'Nivel:', value: '' },
    { key: 'creditos', label: 'Créditos:', value: '' },
    { key: 'profesor_responsable', label: 'Profesor Responsable de la Asignatura:', value: '' },
    { key: 'horario_tutoria', label: 'Horario de tutoría académica:', value: '' },
    { key: 'email_docente', label: 'E-mail del docente', value: '' }
];

/**
 * Sanea y formatea valores evitando la exposición de tags raw como {{...}}
 */
function sanitizeDocTitle(raw: string | undefined): string {
    if (!raw) return 'PLAN ANALÍTICO DE LA ASIGNATURA: NOMBRE DE LA ASIGNATURA';
    const cleaned = raw.replace(/{{\s*[\w_]+\s*}}/gi, 'NOMBRE DE LA ASIGNATURA').trim();
    return cleaned || 'PLAN ANALÍTICO DE LA ASIGNATURA: NOMBRE DE LA ASIGNATURA';
}

function sanitizeFieldValue(raw: string | undefined): string {
    if (!raw) return '';
    if (/^{{\s*[\w_]+\s*}}$/i.test(raw.trim())) return '';
    return raw;
}

export const RenderPlanAnaliticoGeneral: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const documentTitle = sanitizeDocTitle(c.documentTitle);
    const sectionTitle = c.sectionTitle || title || '1.  DATOS INFORMATIVOS';
    const headerText = c.headerText || 'Información General';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const rawFields: FieldItem[] = c.fields && Array.isArray(c.fields) && c.fields.length >= 10
        ? c.fields
        : DEFAULT_FIELDS;

    const fields: FieldItem[] = rawFields.map(f => ({
        ...f,
        value: sanitizeFieldValue(f.value)
    }));

    const [isEditingDocTitle, setIsEditingDocTitle] = useState(false);
    const [docTitleDraft, setDocTitleDraft] = useState(documentTitle);

    const [isEditingSecTitle, setIsEditingSecTitle] = useState(false);
    const [secTitleDraft, setSecTitleDraft] = useState(sectionTitle);

    const [isEditingHeader, setIsEditingHeader] = useState(false);
    const [headerDraft, setHeaderDraft] = useState(headerText);

    const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
    const [fieldDraft, setFieldDraft] = useState({ label: '', value: '' });

    const handleSaveDocTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'documentTitle', docTitleDraft.trim() || documentTitle);
        }
        setIsEditingDocTitle(false);
    };

    const handleSaveSecTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'sectionTitle', secTitleDraft.trim() || sectionTitle);
            onUpdateConfig(blockId, 'title', secTitleDraft.trim() || sectionTitle);
        }
        setIsEditingSecTitle(false);
    };

    const handleSaveHeader = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'headerText', headerDraft.trim() || headerText);
        }
        setIsEditingHeader(false);
    };

    const handleStartEditField = (field: FieldItem) => {
        setEditingFieldKey(field.key);
        setFieldDraft({ label: field.label, value: field.value });
    };

    const handleSaveField = (key: string) => {
        const updated = fields.map(f => f.key === key ? { ...f, label: fieldDraft.label, value: fieldDraft.value } : f);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'fields', updated);
        }
        setEditingFieldKey(null);
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-4 font-sans select-text">
            {/* Cabecera Principal del Documento */}
            <div className="text-center group relative py-1">
                {isEditingDocTitle ? (
                    <div className="flex items-center justify-center gap-2 max-w-xl mx-auto">
                        <input
                            type="text"
                            value={docTitleDraft}
                            onChange={(e) => setDocTitleDraft(e.target.value)}
                            className="w-full px-2 py-1 text-sm font-semibold border border-blue-500 rounded text-center text-slate-800"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSaveDocTitle}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingDocTitle(false)}
                            className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="inline-flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-700 tracking-wide uppercase">
                            {documentTitle}
                        </h2>
                        <button
                            type="button"
                            onClick={() => {
                                setDocTitleDraft(documentTitle);
                                setIsEditingDocTitle(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity"
                            title="Editar título del documento"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Título de la Sección 1 en Azul Cursiva Negrita */}
            <div className="group relative">
                {isEditingSecTitle ? (
                    <div className="flex items-center gap-2 max-w-md">
                        <input
                            type="text"
                            value={secTitleDraft}
                            onChange={(e) => setSecTitleDraft(e.target.value)}
                            className="w-full px-2 py-1 text-sm font-bold italic text-blue-800 border border-blue-500 rounded"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSaveSecTitle}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                            <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditingSecTitle(false)}
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
                                setSecTitleDraft(sectionTitle);
                                setIsEditingSecTitle(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-opacity"
                            title="Editar título de sección"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Tabla Estructurada: Información General */}
            <div className="w-full border border-black overflow-hidden bg-white">
                {/* Franja Azul Marino: Información General */}
                <div
                    style={{ backgroundColor: headerBg }}
                    className="w-full px-3 py-1.5 text-white font-bold text-sm tracking-wide flex items-center justify-between group"
                >
                    {isEditingHeader ? (
                        <div className="flex items-center gap-2 w-full max-w-xs">
                            <input
                                type="text"
                                value={headerDraft}
                                onChange={(e) => setHeaderDraft(e.target.value)}
                                className="w-full px-2 py-0.5 text-xs text-black rounded"
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={handleSaveHeader}
                                className="p-0.5 bg-emerald-600 text-white rounded"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditingHeader(false)}
                                className="p-0.5 bg-slate-300 text-black rounded"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <span>{headerText}</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setHeaderDraft(headerText);
                                    setIsEditingHeader(true);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-blue-200 hover:text-white"
                                title="Editar título de cabecera"
                            >
                                <Pencil className="w-3 h-3" />
                            </button>
                        </>
                    )}
                </div>

                {/* Grilla 2 Columnas de Par Clave-Valor (4 celdas por fila) */}
                <table className="w-full border-collapse text-xs text-black">
                    <tbody>
                        {/* Fila 1: Código de Carrera | Asignatura */}
                        <tr className="border-t border-black">
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[0]?.label || 'Código de Carrera:'}
                            </td>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <span className="text-slate-800">{fields[0]?.value}</span>
                            </td>
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[1]?.label || 'Asignatura:'}
                            </td>
                            <td className="w-[30%] p-1.5 align-middle">
                                <span className="text-slate-800">{fields[1]?.value}</span>
                            </td>
                        </tr>

                        {/* Fila 2: Carrera | Periodo Académico */}
                        <tr className="border-t border-black">
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[2]?.label || 'Carrera'}
                            </td>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <span className="text-slate-800">{fields[2]?.value}</span>
                            </td>
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[3]?.label || 'Periodo Académico:'}
                            </td>
                            <td className="w-[30%] p-1.5 align-middle">
                                <span className="text-slate-800">{fields[3]?.value}</span>
                            </td>
                        </tr>

                        {/* Fila 3: Modalidad | Nivel */}
                        <tr className="border-t border-black">
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[4]?.label || 'Modalidad:'}
                            </td>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <span className="text-slate-800">{fields[4]?.value}</span>
                            </td>
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[5]?.label || 'Nivel:'}
                            </td>
                            <td className="w-[30%] p-1.5 align-middle">
                                <span className="text-slate-800">{fields[5]?.value}</span>
                            </td>
                        </tr>

                        {/* Fila 4: Créditos | Profesor Responsable de la Asignatura */}
                        <tr className="border-t border-black">
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[6]?.label || 'Créditos:'}
                            </td>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <span className="text-slate-800">{fields[6]?.value}</span>
                            </td>
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[7]?.label || 'Profesor Responsable de la Asignatura:'}
                            </td>
                            <td className="w-[30%] p-1.5 align-middle">
                                <span className="text-slate-800">{fields[7]?.value}</span>
                            </td>
                        </tr>

                        {/* Fila 5: Horario de tutoría académica | E-mail del docente */}
                        <tr className="border-t border-black">
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[8]?.label || 'Horario de tutoría académica:'}
                            </td>
                            <td className="w-[30%] p-1.5 border-r border-black align-middle">
                                <span className="text-slate-800">{fields[8]?.value}</span>
                            </td>
                            <td className="w-[20%] p-1.5 font-bold border-r border-black bg-slate-50/50 align-middle">
                                {fields[9]?.label || 'E-mail del docente'}
                            </td>
                            <td className="w-[30%] p-1.5 align-middle">
                                <span className="text-slate-800">{fields[9]?.value}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

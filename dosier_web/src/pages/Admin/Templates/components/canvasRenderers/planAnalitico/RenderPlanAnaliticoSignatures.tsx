/**
 * @file RenderPlanAnaliticoSignatures.tsx
 * @description 7. FIRMAS DE RESPONSABILIDAD del Formato Plan Analítico 2026.
 * Circuito institucional de 3 firmas: ELABORADO (Docente), REVISADO (Coordinador de Carrera), APROBADO (Coordinador Académico).
 */

import React, { useState } from 'react';
import { Pencil, Check, X, ShieldCheck } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from './RenderPlanAnaliticoGeneral';

interface SignatoryColumn {
    key: 'elaborado' | 'revisado' | 'aprobado';
    header: string;
    nombre: string;
    cargo: string;
    fecha: string;
}

const DEFAULT_SIGNATORIES: SignatoryColumn[] = [
    {
        key: 'elaborado',
        header: 'ELABORADO',
        nombre: '',
        cargo: 'Docente',
        fecha: ''
    },
    {
        key: 'revisado',
        header: 'REVISADO',
        nombre: '',
        cargo: 'Coordinador de Carrera',
        fecha: ''
    },
    {
        key: 'aprobado',
        header: 'APROBADO',
        nombre: '',
        cargo: 'Coordinador Académico',
        fecha: ''
    }
];

function sanitizeSigValue(raw: string | undefined): string {
    if (!raw) return '';
    if (/^{{\s*[\w_]+\s*}}$/i.test(raw.trim())) return '';
    return raw;
}

export const RenderPlanAnaliticoSignatures: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || '7.  FIRMAS DE RESPONSABILIDAD';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const signatureBoxHeight = c.signatureBoxHeight || 80;

    const rawSignatories: SignatoryColumn[] = c.signatories && Array.isArray(c.signatories) && c.signatories.length === 3
        ? c.signatories
        : DEFAULT_SIGNATORIES;

    const signatories: SignatoryColumn[] = rawSignatories.map(s => ({
        ...s,
        nombre: sanitizeSigValue(s.nombre),
        fecha: sanitizeSigValue(s.fecha)
    }));

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const [editingColIdx, setEditingColIdx] = useState<number | null>(null);
    const [colDraft, setColDraft] = useState<SignatoryColumn>({ key: 'elaborado', header: '', nombre: '', cargo: '', fecha: '' });

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleStartEditCol = (idx: number, col: SignatoryColumn) => {
        setEditingColIdx(idx);
        setColDraft({ ...col });
    };

    const handleSaveCol = (idx: number) => {
        const updated = signatories.map((col, i) => i === idx ? { ...colDraft } : col);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'signatories', updated);
        }
        setEditingColIdx(null);
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text">
            {/* Título de la Sección 7 en Azul Cursiva Negrita */}
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

            {/* Tabla Oficial de Firmas: 4 Columnas (DESCRIPCIÓN | ELABORADO | REVISADO | APROBADO) */}
            <div className="w-full border border-black overflow-hidden bg-white">
                <table className="w-full border-collapse text-xs text-black">
                    <thead>
                        <tr style={{ backgroundColor: headerBg }} className="text-white font-bold">
                            <th className="w-[18%] p-2 border-r border-black text-center align-middle font-bold tracking-wide">
                                DESCRIPCIÓN
                            </th>
                            {signatories.map((col, idx) => (
                                <th
                                    key={col.key || idx}
                                    className={`w-[27%] p-2 ${idx < 2 ? 'border-r' : ''} border-black text-center align-middle font-bold tracking-wide`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Fila FIRMA (Caja amplia para sello digital / firma física) */}
                        <tr className="border-t border-black">
                            <td className="p-2 border-r border-black font-bold align-middle bg-slate-50/50">
                                FIRMA
                            </td>
                            {signatories.map((col, idx) => (
                                <td
                                    key={`sig-${col.key || idx}`}
                                    style={{ height: `${signatureBoxHeight}px` }}
                                    className={`p-2 ${idx < 2 ? 'border-r' : ''} border-black align-middle text-center bg-slate-50/20`}
                                >
                                    <div className="w-full h-full border border-dashed border-slate-300 rounded flex flex-col items-center justify-center p-2 text-slate-400">
                                        <ShieldCheck className="w-5 h-5 text-blue-500/40 mb-1" />
                                        <span className="text-[10px] text-slate-400">Firma Electrónica / Sello DFRM</span>
                                    </div>
                                </td>
                            ))}
                        </tr>

                        {/* Fila NOMBRE */}
                        <tr className="border-t border-black">
                            <td className="p-2 border-r border-black font-bold align-middle bg-slate-50/50">
                                NOMBRE
                            </td>
                            {signatories.map((col, idx) => {
                                const isEditing = editingColIdx === idx;
                                return (
                                    <td
                                        key={`name-${col.key || idx}`}
                                        className={`p-2 ${idx < 2 ? 'border-r' : ''} border-black align-middle text-center group`}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={colDraft.nombre}
                                                onChange={(e) => setColDraft({ ...colDraft, nombre: e.target.value })}
                                                className="w-full p-1 text-xs border border-blue-500 rounded text-center"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center gap-1.5">
                                                <span className="text-slate-900 font-semibold">{col.nombre}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartEditCol(idx, col)}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity"
                                                    title="Editar firmante"
                                                >
                                                    <Pencil className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Fila CARGO */}
                        <tr className="border-t border-black">
                            <td className="p-2 border-r border-black font-bold align-middle bg-slate-50/50">
                                CARGO
                            </td>
                            {signatories.map((col, idx) => {
                                const isEditing = editingColIdx === idx;
                                return (
                                    <td
                                        key={`cargo-${col.key || idx}`}
                                        className={`p-2 ${idx < 2 ? 'border-r' : ''} border-black align-middle text-center`}
                                    >
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={colDraft.cargo}
                                                onChange={(e) => setColDraft({ ...colDraft, cargo: e.target.value })}
                                                className="w-full p-1 text-xs border border-blue-500 rounded text-center"
                                            />
                                        ) : (
                                            <span className="text-slate-800">{col.cargo}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>

                        {/* Fila FECHA */}
                        <tr className="border-t border-black">
                            <td className="p-2 border-r border-black font-bold align-middle bg-slate-50/50">
                                FECHA
                            </td>
                            {signatories.map((col, idx) => {
                                const isEditing = editingColIdx === idx;
                                return (
                                    <td
                                        key={`date-${col.key || idx}`}
                                        className={`p-2 ${idx < 2 ? 'border-r' : ''} border-black align-middle text-center`}
                                    >
                                        {isEditing ? (
                                            <div className="flex items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={colDraft.fecha}
                                                    onChange={(e) => setColDraft({ ...colDraft, fecha: e.target.value })}
                                                    className="w-full p-1 text-xs border border-blue-500 rounded text-center"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveCol(idx)}
                                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    <Check className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingColIdx(null)}
                                                    className="p-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600">{col.fecha}</span>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

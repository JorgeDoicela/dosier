/**
 * @file RenderPeaContents.tsx
 * @description f) Contenidos de Enseñanza (Unidades de Estudio y Horas).
 * Bloque con edición in-situ de títulos de unidad, distribución de horas (CD/APE/TA),
 * desglose temático con textarea auto-expandible y adición/eliminación de unidades.
 */

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Pencil, Check } from 'lucide-react';
import { resolveHeaderColor, getContrastFg } from '../../properties/SharedColorPicker';
import type { PeaBlockProps } from './types';

interface UnidadCurricular {
    num: number;
    titulo: string;
    horasTotal: number;
    horasCD: number;
    horasAPE: number;
    horasTA: number;
    contenidos?: string;
}

export const RenderPeaContentsSection: React.FC<PeaBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const subHeaderBg = c.subHeaderColor || '#bdd7ee';
    const fg = getContrastFg(headerBg);
    const displayTitle = c.title || title || 'f) CONTENIDOS DE ENSEÑANZA:';

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(displayTitle);

    const defaultUnidades: UnidadCurricular[] = [
        {
            num: 1,
            titulo: 'UNIDAD 1: INTRODUCCIÓN Y FUNDAMENTOS',
            horasTotal: 30,
            horasCD: 12,
            horasAPE: 6,
            horasTA: 12,
            contenidos: '1.1 Conceptos fundamentales y arquitectura del sistema.\n1.2 Estándares normativos y modelos de referencia.\n1.3 Entornos de desarrollo y herramientas de trabajo.'
        },
        {
            num: 2,
            titulo: 'UNIDAD 2: DESARROLLO Y APLICACIÓN PRÁCTICA',
            horasTotal: 30,
            horasCD: 12,
            horasAPE: 6,
            horasTA: 12,
            contenidos: '2.1 Implementación de módulos principales y componentes.\n2.2 Integración de servicios y persistencia de datos.\n2.3 Pruebas funcionales y validaciones técnicas.'
        },
        {
            num: 3,
            titulo: 'UNIDAD 3: INTEGRACIÓN Y EVALUACIÓN',
            horasTotal: 30,
            horasCD: 12,
            horasAPE: 6,
            horasTA: 12,
            contenidos: '3.1 Despliegue, documentación y auditoría técnica.\n3.2 Evaluación de resultados y métricas de desempeño.\n3.3 Sustentación y entrega del proyecto formativo.'
        }
    ];

    const unidades: UnidadCurricular[] = Array.isArray(c.unidades) && c.unidades.length > 0
        ? c.unidades
        : defaultUnidades;

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || 'f) CONTENIDOS DE ENSEÑANZA:');
        }
        setEditingTitle(false);
    };

    const updateUnidad = (index: number, patch: Partial<UnidadCurricular>) => {
        if (!onUpdateConfig || !blockId) return;
        const newUnidades = [...unidades];
        const current = newUnidades[index];
        const updated = { ...current, ...patch };

        // Si se actualizan horas individuales, recalcular horasTotal
        if ('horasCD' in patch || 'horasAPE' in patch || 'horasTA' in patch) {
            updated.horasTotal = (updated.horasCD || 0) + (updated.horasAPE || 0) + (updated.horasTA || 0);
        }

        newUnidades[index] = updated;
        onUpdateConfig(blockId, 'unidades', newUnidades);
    };

    const addUnidad = () => {
        if (!onUpdateConfig || !blockId) return;
        const nextNum = unidades.length + 1;
        const newUnidad: UnidadCurricular = {
            num: nextNum,
            titulo: `UNIDAD ${nextNum}: NUEVA UNIDAD DE ESTUDIO`,
            horasTotal: 30,
            horasCD: 12,
            horasAPE: 6,
            horasTA: 12,
            contenidos: `${nextNum}.1 Tema principal\n${nextNum}.2 Tema secundario y actividades experimentales`
        };
        onUpdateConfig(blockId, 'unidades', [...unidades, newUnidad]);
    };

    const removeUnidad = (index: number) => {
        if (!onUpdateConfig || !blockId) return;
        const filtered = unidades.filter((_, i) => i !== index);
        // Renumerar las unidades restantes
        const renumbered = filtered.map((u, i) => ({ ...u, num: i + 1 }));
        onUpdateConfig(blockId, 'unidades', renumbered);
    };

    return (
        <div className="w-full my-3 font-sans text-xs bg-white text-slate-900 select-none">
            {/* BARRA AZUL MARINO DE SECCIÓN f) */}
            <div
                className="w-full py-1 px-3 mb-0 font-bold text-[9px] uppercase tracking-wider flex items-center justify-between group cursor-pointer"
                style={{ backgroundColor: headerBg, color: fg }}
                onClick={() => {
                    setEditingTitle(true);
                    setTitleDraft(displayTitle);
                }}
            >
                <div className="flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 shrink-0" />
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

            {/* TABLA PRINCIPAL DE CONTENIDOS CON FORMATO OFICIAL */}
            <table className="w-full text-left border-collapse border border-black border-t-0 text-[8.5px]">
                <thead>
                    <tr className="font-bold border-b border-black text-center" style={{ backgroundColor: headerBg, color: fg }}>
                        <th className="p-1 border-r border-black w-[6%]">No</th>
                        <th className="p-1">UNIDADES DE ESTUDIO Y SUS CONTENIDOS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black">
                    {unidades.map((u, idx) => (
                        <tr key={idx} className="border-b border-black group/unit">
                            {/* NÚMERO DE LA UNIDAD */}
                            <td className="p-2 border-r border-black text-center font-bold text-base align-middle bg-white w-[6%] text-slate-800">
                                {u.num}
                            </td>

                            {/* ESTRUCTURA INTERNA DE LA UNIDAD */}
                            <td className="p-0 align-top bg-white">
                                <div className="border-collapse">
                                    {/* ENCABEZADO DE UNIDAD (CELESTE CLARO ISTPET CON TÍTULO EDITABLE) */}
                                    <div
                                        className="flex items-center justify-between border-b border-black px-2 py-1 font-bold text-[8.5px] uppercase"
                                        style={{ backgroundColor: subHeaderBg, color: '#000000' }}
                                    >
                                        <div className="flex-1 mr-2 select-text">
                                            <input
                                                type="text"
                                                value={u.titulo}
                                                onChange={e => updateUnidad(idx, { titulo: e.target.value })}
                                                placeholder={`UNIDAD ${u.num}: NOMBRE DE LA UNIDAD`}
                                                className="w-full bg-transparent font-bold uppercase text-[8.5px] text-slate-900 border-b border-transparent hover:border-black/40 focus:border-black outline-none px-0.5"
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[8px] font-semibold">
                                                Total de horas por unidad: <span className="font-bold">{u.horasTotal ?? 0}</span>
                                            </span>
                                            {unidades.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeUnidad(idx)}
                                                    className="opacity-0 group-hover/unit:opacity-100 p-0.5 text-rose-700 hover:text-rose-900 cursor-pointer transition-opacity"
                                                    title="Eliminar esta unidad"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* SUB-CABECERA DE 3 COLUMNAS DE HORAS EDITABLES */}
                                    <div
                                        className="grid grid-cols-3 border-b border-black text-[8px] divide-x divide-black select-text"
                                        style={{ backgroundColor: subHeaderBg, color: '#000000' }}
                                    >
                                        <div className="p-1 flex items-center justify-between">
                                            <span className="font-medium">Horas contacto con el docente:</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={160}
                                                value={u.horasCD}
                                                onChange={e => updateUnidad(idx, { horasCD: Number(e.target.value) || 0 })}
                                                className="w-12 text-center bg-white/70 border border-black/30 rounded-xs font-bold text-[8px] py-0.5 outline-none focus:bg-white"
                                            />
                                        </div>
                                        <div className="p-1 flex items-center justify-between">
                                            <span className="font-medium">Horas Práctico-experimental:</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={160}
                                                value={u.horasAPE}
                                                onChange={e => updateUnidad(idx, { horasAPE: Number(e.target.value) || 0 })}
                                                className="w-12 text-center bg-white/70 border border-black/30 rounded-xs font-bold text-[8px] py-0.5 outline-none focus:bg-white"
                                            />
                                        </div>
                                        <div className="p-1 flex items-center justify-between">
                                            <span className="font-medium">Horas de aprendizaje autónomo:</span>
                                            <input
                                                type="number"
                                                min={0}
                                                max={160}
                                                value={u.horasTA}
                                                onChange={e => updateUnidad(idx, { horasTA: Number(e.target.value) || 0 })}
                                                className="w-12 text-center bg-white/70 border border-black/30 rounded-xs font-bold text-[8px] py-0.5 outline-none focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    {/* CONTENIDOS TEMÁTICOS CON TEXTAREA INTERACTIVA AUTO-EXPANDIBLE */}
                                    <div className="p-2 bg-white select-text">
                                        <textarea
                                            value={u.contenidos || ''}
                                            onChange={e => updateUnidad(idx, { contenidos: e.target.value })}
                                            placeholder={`Desglose de temas y contenidos para la Unidad ${u.num} (un tema por línea):\n${u.num}.1 Tema...\n${u.num}.2 Subtema...`}
                                            rows={4}
                                            className="w-full p-1.5 border border-slate-200 hover:border-slate-300 focus:border-[#0070f3] rounded-xs text-[10.5px] leading-relaxed text-slate-800 placeholder:text-slate-400 placeholder:italic bg-white outline-none resize-none transition-colors"
                                            style={{ minHeight: '80px' }}
                                        />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* BOTÓN OPERATIVO PARA AÑADIR NUEVAS UNIDADES */}
            <div className="border border-black border-t-0 p-1.5 bg-slate-50 flex items-center justify-between">
                <button
                    type="button"
                    onClick={addUnidad}
                    className="flex items-center gap-1 text-[8.5px] font-semibold text-[#0070f3] hover:text-blue-700 py-0.5 px-2 hover:bg-blue-50/60 rounded-xs transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Unidad de Estudio</span>
                </button>
                <span className="text-[8px] text-slate-400">
                    {unidades.length} {unidades.length === 1 ? 'unidad configurada' : 'unidades configuradas'}
                </span>
            </div>
        </div>
    );
};

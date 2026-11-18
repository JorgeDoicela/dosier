/**
 * @file RenderInformeAcompFirmas.tsx
 * @description 6. FIRMAS DE RESPONSABILIDAD del Informe de Acompañamiento Académico 2026.
 * Contiene las 2 tablas oficiales con cabecera en azul corporativo:
 *   - Tabla 1: Tutores por nivel (1er, 2do, 3er, 4to Nivel).
 *   - Tabla 2: Coordinador de Carrera, Bienestar Institucional y Coordinador Académico.
 */

import React, { useState, useEffect } from 'react';
import type { FirmaTutorNivelItem, FirmaAutoridadItem } from '../../../types';

export interface RenderInformeAcompFirmasProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

const DEFAULT_TUTORES: FirmaTutorNivelItem[] = [
    { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Primer Nivel', fecha: '' },
    { id: '2', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Segundo Nivel', fecha: '' },
    { id: '3', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Tercer Nivel', fecha: '' },
    { id: '4', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Cuarto Nivel', fecha: '' }
];

const DEFAULT_AUTORIDADES: FirmaAutoridadItem[] = [
    { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Coordinador de Carrera', fecha: '' },
    { id: '2', label: '', nombre: '', cargo: 'Bienestar Institucional', fecha: '' },
    { id: '3', label: 'APROBADO', nombre: '', cargo: 'Coordinador Académico', fecha: '' }
];

export const RenderInformeAcompFirmas: React.FC<RenderInformeAcompFirmasProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.sectionTitle || title || '6.  Firmas de responsabilidad.';
    const headerColor = c.headerColor || '#1e2a4a';

    const [tutores, setTutores] = useState<FirmaTutorNivelItem[]>(() => {
        return Array.isArray(c.firmasTutores) && c.firmasTutores.length > 0
            ? c.firmasTutores
            : DEFAULT_TUTORES;
    });

    const [autoridades, setAutoridades] = useState<FirmaAutoridadItem[]>(() => {
        return Array.isArray(c.firmasAutoridades) && c.firmasAutoridades.length > 0
            ? c.firmasAutoridades
            : DEFAULT_AUTORIDADES;
    });

    useEffect(() => {
        if (Array.isArray(c.firmasTutores) && c.firmasTutores.length > 0) {
            setTutores(c.firmasTutores);
        }
        if (Array.isArray(c.firmasAutoridades) && c.firmasAutoridades.length > 0) {
            setAutoridades(c.firmasAutoridades);
        }
    }, [c.firmasTutores, c.firmasAutoridades]);

    const handleTutorChange = (id: string, field: keyof FirmaTutorNivelItem, value: string) => {
        const next = tutores.map((t) => (t.id === id ? { ...t, [field]: value } : t));
        setTutores(next);
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, 'firmasTutores', next);
        }
    };

    const handleAutoridadChange = (id: string, field: keyof FirmaAutoridadItem, value: string) => {
        const next = autoridades.map((a) => (a.id === id ? { ...a, [field]: value } : a));
        setAutoridades(next);
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, 'firmasAutoridades', next);
        }
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans text-xs space-y-6">
            {/* Título de la sección */}
            <div>
                <h2 className="text-sm font-bold text-black tracking-tight">
                    {sectionTitle}
                </h2>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* TABLA 1: DOCENTES TUTORES (4 NIVELES) */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="border border-black overflow-hidden">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr style={{ backgroundColor: headerColor }} className="text-white font-bold">
                            <th className="border border-black p-2 text-left w-[20%] uppercase text-[11px]">
                                DESCRIPCIÓN
                            </th>
                            {tutores.map((t) => (
                                <th key={t.id} className="border border-black p-2 text-center w-[20%] uppercase text-[11px]">
                                    {t.label || 'ELABORADO'}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Fila FIRMA */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900 align-top">
                                FIRMA
                            </td>
                            {tutores.map((t) => (
                                <td key={t.id} className="border border-black p-2 h-20 align-bottom text-center">
                                    <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto mb-1" />
                                    <span className="text-[10px] text-slate-400 font-mono">Firma Digital / Rúbrica</span>
                                </td>
                            ))}
                        </tr>

                        {/* Fila NOMBRE */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                NOMBRE
                            </td>
                            {tutores.map((t) => (
                                <td key={t.id} className="border border-black p-1">
                                    <input
                                        type="text"
                                        value={t.nombre}
                                        onChange={(e) => handleTutorChange(t.id, 'nombre', e.target.value)}
                                        placeholder="Nombre del tutor..."
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 font-medium"
                                    />
                                </td>
                            ))}
                        </tr>

                        {/* Fila CARGO */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                CARGO
                            </td>
                            {tutores.map((t) => (
                                <td key={t.id} className="border border-black p-2 text-center text-xs font-semibold text-slate-800">
                                    {t.cargo}
                                </td>
                            ))}
                        </tr>

                        {/* Fila FECHA */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                FECHA
                            </td>
                            {tutores.map((t) => (
                                <td key={t.id} className="border border-black p-1 text-center">
                                    <input
                                        type="text"
                                        value={t.fecha}
                                        onChange={(e) => handleTutorChange(t.id, 'fecha', e.target.value)}
                                        placeholder="DD/MM/AAAA"
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* TABLA 2: COORDINACIÓN Y AUTORIDADES */}
            {/* ───────────────────────────────────────────────────────────── */}
            <div className="border border-black overflow-hidden">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr style={{ backgroundColor: headerColor }} className="text-white font-bold">
                            <th className="border border-black p-2 text-left w-[20%] uppercase text-[11px]">
                                DESCRIPCIÓN
                            </th>
                            <th className="border border-black p-2 text-center w-[26.6%] uppercase text-[11px]">
                                ELABORADO
                            </th>
                            <th className="border border-black p-2 text-center w-[26.6%] uppercase text-[11px]">
                                {autoridades[1]?.label || ''}
                            </th>
                            <th className="border border-black p-2 text-center w-[26.6%] uppercase text-[11px]">
                                APROBADO
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Fila FIRMA */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900 align-top">
                                FIRMA
                            </td>
                            {autoridades.map((a) => (
                                <td key={a.id} className="border border-black p-2 h-20 align-bottom text-center">
                                    <div className="border-b border-dashed border-slate-300 w-3/4 mx-auto mb-1" />
                                    <span className="text-[10px] text-slate-400 font-mono">Firma Digital / Rúbrica</span>
                                </td>
                            ))}
                        </tr>

                        {/* Fila NOMBRE */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                NOMBRE
                            </td>
                            {autoridades.map((a) => (
                                <td key={a.id} className="border border-black p-1">
                                    <input
                                        type="text"
                                        value={a.nombre}
                                        onChange={(e) => handleAutoridadChange(a.id, 'nombre', e.target.value)}
                                        placeholder={`Nombre de ${a.cargo}...`}
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 font-medium"
                                    />
                                </td>
                            ))}
                        </tr>

                        {/* Fila CARGO */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                CARGO
                            </td>
                            {autoridades.map((a) => (
                                <td key={a.id} className="border border-black p-2 text-center text-xs font-semibold text-slate-800">
                                    {a.cargo}
                                </td>
                            ))}
                        </tr>

                        {/* Fila FECHA */}
                        <tr className="border-t border-black">
                            <td className="border border-black p-2 font-bold bg-slate-50 text-slate-900">
                                FECHA
                            </td>
                            {autoridades.map((a) => (
                                <td key={a.id} className="border border-black p-1 text-center">
                                    <input
                                        type="text"
                                        value={a.fecha}
                                        onChange={(e) => handleAutoridadChange(a.id, 'fecha', e.target.value)}
                                        placeholder="DD/MM/AAAA"
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

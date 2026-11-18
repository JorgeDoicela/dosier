/**
 * @file RenderInformeAcompNominaTutores.tsx
 * @description 2. NÓMINA DE DOCENTES TUTORES del Informe de Acompañamiento Académico de Carrera 2026.
 * Renderizador de tabla con edición en vivo, agregado y eliminación de filas.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DocenteTutorRowItem } from '../../../types';

export interface RenderInformeAcompNominaTutoresProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

const DEFAULT_ROWS: DocenteTutorRowItem[] = [
    { id: '1', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
    { id: '2', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
    { id: '3', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
    { id: '4', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
    { id: '5', tutor: '', nivel: '', actividad: '', medioVerificacion: '' }
];

export const RenderInformeAcompNominaTutores: React.FC<RenderInformeAcompNominaTutoresProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.sectionTitle || title || '2.  Nómina de docentes tutores:';

    const [rows, setRows] = useState<DocenteTutorRowItem[]>(() => {
        if (Array.isArray(c.tutoresRows) && c.tutoresRows.length > 0) {
            return c.tutoresRows;
        }
        return DEFAULT_ROWS;
    });

    useEffect(() => {
        if (Array.isArray(c.tutoresRows) && c.tutoresRows.length > 0) {
            setRows(c.tutoresRows);
        }
    }, [c.tutoresRows]);

    const updateRowsAndNotify = (newRows: DocenteTutorRowItem[]) => {
        setRows(newRows);
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, 'tutoresRows', newRows);
        }
    };

    const handleCellChange = (id: string, field: keyof DocenteTutorRowItem, value: string) => {
        const updated = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
        updateRowsAndNotify(updated);
    };

    const handleAddRow = () => {
        const newId = String(Date.now());
        const newRow: DocenteTutorRowItem = {
            id: newId,
            tutor: '',
            nivel: '',
            actividad: '',
            medioVerificacion: ''
        };
        updateRowsAndNotify([...rows, newRow]);
    };

    const handleRemoveRow = (id: string) => {
        if (rows.length <= 1) return;
        const updated = rows.filter((r) => r.id !== id);
        updateRowsAndNotify(updated);
    };

    return (
        <div className="w-full bg-white text-slate-900 font-sans text-sm">
            {/* Cabecera de Sección */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-black">
                    {sectionTitle}
                </h2>
                <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#0070f3] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar Tutor
                </button>
            </div>

            {/* Tabla de 4 columnas fiel al formato oficial */}
            <div className="w-full overflow-x-auto border border-black rounded-none">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-white text-black font-bold">
                            <th className="border border-black px-2.5 py-2 text-left w-[30%]">
                                Tutor
                            </th>
                            <th className="border border-black px-2.5 py-2 text-center w-[15%]">
                                Nivel
                            </th>
                            <th className="border border-black px-2.5 py-2 text-left w-[30%]">
                                Actividad
                            </th>
                            <th className="border border-black px-2.5 py-2 text-left w-[25%]">
                                Medio de verificación
                            </th>
                            <th className="border border-black px-1 py-1 w-[32px] text-center print:hidden bg-slate-50">
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                                <td className="border border-black p-1">
                                    <input
                                        type="text"
                                        value={row.tutor}
                                        onChange={(e) => handleCellChange(row.id, 'tutor', e.target.value)}
                                        placeholder="Nombre del docente tutor..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-1 text-center">
                                    <input
                                        type="text"
                                        value={row.nivel}
                                        onChange={(e) => handleCellChange(row.id, 'nivel', e.target.value)}
                                        placeholder="Ej. Tercero"
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-1">
                                    <input
                                        type="text"
                                        value={row.actividad}
                                        onChange={(e) => handleCellChange(row.id, 'actividad', e.target.value)}
                                        placeholder="Descripción de la actividad tutorial..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-1">
                                    <input
                                        type="text"
                                        value={row.medioVerificacion}
                                        onChange={(e) => handleCellChange(row.id, 'medioVerificacion', e.target.value)}
                                        placeholder="Informe, registro de asistencia..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-0 text-center print:hidden bg-slate-50/50">
                                    {rows.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            title="Eliminar fila"
                                            className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors inline-flex items-center justify-center"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

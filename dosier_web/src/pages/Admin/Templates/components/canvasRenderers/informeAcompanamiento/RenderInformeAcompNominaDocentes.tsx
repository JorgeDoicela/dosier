/**
 * @file RenderInformeAcompNominaDocentes.tsx
 * @description 3. NÓMINA DE DOCENTES QUE APORTAN A LA CARRERA del Informe de Acompañamiento Académico de Carrera 2026.
 * Renderizador de tabla con edición en vivo, agregado y eliminación de filas.
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { DocenteAporteRowItem } from '../../../types';

export interface RenderInformeAcompNominaDocentesProps {
    config?: any;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: any) => void;
}

const DEFAULT_DOCENTES_ROWS: DocenteAporteRowItem[] = [
    {
        id: '1',
        nomina: '',
        asignaturas: '',
        nivel: '',
        jornadaTrabajo: '',
        accionesMejora: '',
        accionesCorrectivas: ''
    },
    {
        id: '2',
        nomina: '',
        asignaturas: '',
        nivel: '',
        jornadaTrabajo: '',
        accionesMejora: '',
        accionesCorrectivas: ''
    },
    {
        id: '3',
        nomina: '',
        asignaturas: '',
        nivel: '',
        jornadaTrabajo: '',
        accionesMejora: '',
        accionesCorrectivas: ''
    },
    {
        id: '4',
        nomina: '',
        asignaturas: '',
        nivel: '',
        jornadaTrabajo: '',
        accionesMejora: '',
        accionesCorrectivas: ''
    }
];

export const RenderInformeAcompNominaDocentes: React.FC<RenderInformeAcompNominaDocentesProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.sectionTitle || title || '3.  Nómina de docentes que aportan a la carrera:';

    const [rows, setRows] = useState<DocenteAporteRowItem[]>(() => {
        if (Array.isArray(c.docentesAporteRows) && c.docentesAporteRows.length > 0) {
            return c.docentesAporteRows;
        }
        return DEFAULT_DOCENTES_ROWS;
    });

    useEffect(() => {
        if (Array.isArray(c.docentesAporteRows) && c.docentesAporteRows.length > 0) {
            setRows(c.docentesAporteRows);
        }
    }, [c.docentesAporteRows]);

    const updateRowsAndNotify = (newRows: DocenteAporteRowItem[]) => {
        setRows(newRows);
        if (blockId && onUpdateConfig) {
            onUpdateConfig(blockId, 'docentesAporteRows', newRows);
        }
    };

    const handleCellChange = (id: string, field: keyof DocenteAporteRowItem, value: string) => {
        const updated = rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
        updateRowsAndNotify(updated);
    };

    const handleAddRow = () => {
        const newId = String(Date.now());
        const newRow: DocenteAporteRowItem = {
            id: newId,
            nomina: '',
            asignaturas: '',
            nivel: '',
            jornadaTrabajo: '',
            accionesMejora: '',
            accionesCorrectivas: ''
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
                    Agregar Docente
                </button>
            </div>

            {/* Tabla de 6 columnas fiel al formato oficial */}
            <div className="w-full overflow-x-auto border border-black rounded-none">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-white text-black font-bold">
                            <th className="border border-black px-2.5 py-2 text-left w-[18%]">
                                Nómina
                            </th>
                            <th className="border border-black px-2.5 py-2 text-left w-[20%]">
                                Asignaturas
                            </th>
                            <th className="border border-black px-2.5 py-2 text-center w-[10%]">
                                Nivel
                            </th>
                            <th className="border border-black px-2.5 py-2 text-center w-[14%]">
                                Jornada de trabajo
                            </th>
                            <th className="border border-black px-2.5 py-2 text-left w-[19%]">
                                Acciones de mejora (dentro del periodo)
                            </th>
                            <th className="border border-black px-2.5 py-2 text-left w-[19%]">
                                Acciones correctivas (final del periodo)
                            </th>
                            <th className="border border-black px-1 py-1 w-[32px] text-center print:hidden bg-slate-50">
                                
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-50/60 transition-colors group">
                                <td className="border border-black p-1 align-top">
                                    <textarea
                                        rows={2}
                                        value={row.nomina}
                                        onChange={(e) => handleCellChange(row.id, 'nomina', e.target.value)}
                                        placeholder="Nombre del docente..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none font-medium"
                                    />
                                </td>
                                <td className="border border-black p-1 align-top">
                                    <textarea
                                        rows={2}
                                        value={row.asignaturas}
                                        onChange={(e) => handleCellChange(row.id, 'asignaturas', e.target.value)}
                                        placeholder="Asignatura(s) impartida(s)..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                    />
                                </td>
                                <td className="border border-black p-1 align-top text-center">
                                    <input
                                        type="text"
                                        value={row.nivel}
                                        onChange={(e) => handleCellChange(row.id, 'nivel', e.target.value)}
                                        placeholder="Ej. Tercero"
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-1 align-top text-center">
                                    <input
                                        type="text"
                                        value={row.jornadaTrabajo}
                                        onChange={(e) => handleCellChange(row.id, 'jornadaTrabajo', e.target.value)}
                                        placeholder="Completa / Parcial"
                                        className="w-full px-1.5 py-1 text-xs text-center bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800"
                                    />
                                </td>
                                <td className="border border-black p-1 align-top">
                                    <textarea
                                        rows={2}
                                        value={row.accionesMejora}
                                        onChange={(e) => handleCellChange(row.id, 'accionesMejora', e.target.value)}
                                        placeholder="Acciones aplicadas..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                    />
                                </td>
                                <td className="border border-black p-1 align-top">
                                    <textarea
                                        rows={2}
                                        value={row.accionesCorrectivas}
                                        onChange={(e) => handleCellChange(row.id, 'accionesCorrectivas', e.target.value)}
                                        placeholder="Acciones correctivas..."
                                        className="w-full px-1.5 py-1 text-xs bg-transparent border-0 focus:ring-1 focus:ring-blue-500 rounded text-slate-800 resize-none"
                                    />
                                </td>
                                <td className="border border-black p-0 text-center print:hidden bg-slate-50/50 align-top pt-2">
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

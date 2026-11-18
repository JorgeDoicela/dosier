/**
 * @file RenderTutoriasMatrix.tsx
 * @description 2. MATRIZ DE REGISTRO DE TUTORÍAS (12 Columnas).
 * Matriz interactiva de alta densidad con edición en celda y soporte para filas dinámicas.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { resolveHeaderColor } from '../../properties/SharedColorPicker';
import type { PlanAnaliticoBlockProps } from '../planAnalitico/RenderPlanAnaliticoGeneral';
import type { TutoriaRowItem } from '../../types';

const DEFAULT_ROWS: TutoriaRowItem[] = Array.from({ length: 7 }, (_, i) => ({
    id: `tutoria-row-${i + 1}`,
    num: i + 1,
    fecha: '',
    semana: '',
    estudiantesConvocados: '',
    nivel: '',
    asignatura: '',
    carrera: '',
    modalidadTutoria: '',
    tipoTutoria: '',
    razonTutoria: '',
    observaciones: '',
    formaConvocatoria: ''
}));

export const RenderTutoriasMatrix: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    title,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const sectionTitle = c.title || title || 'REGISTRO DE ACOMPAÑAMIENTO Y TUTORÍAS ACADÉMICAS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const rows: TutoriaRowItem[] = c.tutoriaRows && Array.isArray(c.tutoriaRows) && c.tutoriaRows.length > 0
        ? c.tutoriaRows
        : DEFAULT_ROWS;

    const [editingCell, setEditingCell] = useState<{ rowIdx: number; field: keyof TutoriaRowItem } | null>(null);
    const [cellDraft, setCellDraft] = useState('');

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState(sectionTitle);

    const handleSaveTitle = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'title', titleDraft.trim() || sectionTitle);
        }
        setIsEditingTitle(false);
    };

    const handleStartEditCell = (rowIdx: number, field: keyof TutoriaRowItem, currentValue: any) => {
        setEditingCell({ rowIdx, field });
        setCellDraft(String(currentValue || ''));
    };

    const handleSaveCell = (rowIdx: number, field: keyof TutoriaRowItem) => {
        const updated = rows.map((r, i) => i === rowIdx ? { ...r, [field]: cellDraft.trim() } : r);
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'tutoriaRows', updated);
        }
        setEditingCell(null);
    };

    const handleAddRow = () => {
        const newRow: TutoriaRowItem = {
            id: `tutoria-row-${Date.now()}`,
            num: rows.length + 1,
            fecha: '',
            semana: '',
            estudiantesConvocados: '',
            nivel: '',
            asignatura: '',
            carrera: '',
            modalidadTutoria: '',
            tipoTutoria: '',
            razonTutoria: '',
            observaciones: '',
            formaConvocatoria: ''
        };
        const updated = [...rows, newRow];
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'tutoriaRows', updated);
        }
    };

    const handleDeleteRow = (rowIdx: number) => {
        if (rows.length <= 1) return;
        const updated = rows
            .filter((_, i) => i !== rowIdx)
            .map((r, idx) => ({ ...r, num: idx + 1 }));
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'tutoriaRows', updated);
        }
    };

    return (
        <div className="w-full bg-white text-black p-4 space-y-3 font-sans select-text overflow-x-auto">
            {/* Título de Sección Opcional */}
            <div className="flex items-center justify-between group">
                {isEditingTitle ? (
                    <div className="flex items-center gap-2 max-w-md">
                        <input
                            type="text"
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            className="w-full px-2 py-0.5 text-xs font-bold text-slate-800 border border-blue-500 rounded"
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
                        <span className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                            {sectionTitle}
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setTitleDraft(sectionTitle);
                                setIsEditingTitle(true);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600"
                            title="Editar título de sección"
                        >
                            <Pencil className="w-3 h-3" />
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Registro</span>
                </button>
            </div>

            {/* Matriz Oficial Horizontal de 12 Columnas */}
            <div className="w-full border border-black overflow-hidden bg-white">
                <table className="w-full border-collapse text-[10px] text-black">
                    <thead>
                        <tr style={{ backgroundColor: headerBg }} className="text-white text-center font-bold tracking-tight">
                            <th className="w-[3%] p-1.5 border-r border-black align-middle">Nº</th>
                            <th className="w-[6%] p-1.5 border-r border-black align-middle">Fecha</th>
                            <th className="w-[5%] p-1.5 border-r border-black align-middle">Semana</th>
                            <th className="w-[17%] p-1.5 border-r border-black align-middle">
                                NOMBRES Y APELLIDOS<br />ESTUDIANTES CONVOCADOS
                            </th>
                            <th className="w-[5%] p-1.5 border-r border-black align-middle">NIVEL</th>
                            <th className="w-[12%] p-1.5 border-r border-black align-middle">ASIGNATURA</th>
                            <th className="w-[10%] p-1.5 border-r border-black align-middle">CARRERA</th>
                            <th className="w-[8%] p-1.5 border-r border-black align-middle">MODALIDAD DE TUTORIA</th>
                            <th className="w-[7%] p-1.5 border-r border-black align-middle">TIPOS DE TUTORIA</th>
                            <th className="w-[10%] p-1.5 border-r border-black align-middle">RAZÓN DE TUTORÍA</th>
                            <th className="w-[10%] p-1.5 border-r border-black align-middle">OBSERVACIONES</th>
                            <th className="w-[7%] p-1.5 align-middle">FORMA DE CONVOCATORIA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr key={row.id || rIdx} className="border-t border-black hover:bg-slate-50/70 group">
                                {/* 1. Nº */}
                                <td className="p-1 border-r border-black text-center font-bold bg-slate-50/50 align-middle">
                                    {row.num || rIdx + 1}
                                </td>

                                {/* 2. Fecha */}
                                <td
                                    className="p-1 border-r border-black text-center align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'fecha', row.fecha)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'fecha' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'fecha')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'fecha')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded text-center"
                                            placeholder="DD/MM"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.fecha || <span className="text-slate-300">--</span>}</span>
                                    )}
                                </td>

                                {/* 3. Semana */}
                                <td
                                    className="p-1 border-r border-black text-center align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'semana', row.semana)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'semana' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'semana')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'semana')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded text-center"
                                            placeholder="1"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.semana || <span className="text-slate-300">--</span>}</span>
                                    )}
                                </td>

                                {/* 4. Estudiantes Convocados */}
                                <td
                                    className="p-1 border-r border-black align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'estudiantesConvocados', row.estudiantesConvocados)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'estudiantesConvocados' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'estudiantesConvocados')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'estudiantesConvocados')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Apellidos y Nombres"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-900">{row.estudiantesConvocados}</span>
                                    )}
                                </td>

                                {/* 5. Nivel */}
                                <td
                                    className="p-1 border-r border-black text-center align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'nivel', row.nivel)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'nivel' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'nivel')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'nivel')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded text-center"
                                            placeholder="3ero"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.nivel}</span>
                                    )}
                                </td>

                                {/* 6. Asignatura */}
                                <td
                                    className="p-1 border-r border-black align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'asignatura', row.asignatura)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'asignatura' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'asignatura')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'asignatura')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Nombre asignatura"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.asignatura}</span>
                                    )}
                                </td>

                                {/* 7. Carrera */}
                                <td
                                    className="p-1 border-r border-black align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'carrera', row.carrera)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'carrera' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'carrera')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'carrera')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Carrera"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.carrera}</span>
                                    )}
                                </td>

                                {/* 8. Modalidad de Tutoría */}
                                <td
                                    className="p-1 border-r border-black text-center align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'modalidadTutoria', row.modalidadTutoria)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'modalidadTutoria' ? (
                                        <select
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'modalidadTutoria')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            autoFocus
                                        >
                                            <option value="">--</option>
                                            <option value="Presencial">Presencial</option>
                                            <option value="Virtual">Virtual</option>
                                            <option value="Híbrida">Híbrida</option>
                                        </select>
                                    ) : (
                                        <span className="text-slate-800">{row.modalidadTutoria}</span>
                                    )}
                                </td>

                                {/* 9. Tipos de Tutoría */}
                                <td
                                    className="p-1 border-r border-black text-center align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'tipoTutoria', row.tipoTutoria)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'tipoTutoria' ? (
                                        <select
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'tipoTutoria')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            autoFocus
                                        >
                                            <option value="">--</option>
                                            <option value="Individual">Individual</option>
                                            <option value="Grupal">Grupal</option>
                                        </select>
                                    ) : (
                                        <span className="text-slate-800">{row.tipoTutoria}</span>
                                    )}
                                </td>

                                {/* 10. Razón de Tutoría */}
                                <td
                                    className="p-1 border-r border-black align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'razonTutoria', row.razonTutoria)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'razonTutoria' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'razonTutoria')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'razonTutoria')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Motivo académico"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.razonTutoria}</span>
                                    )}
                                </td>

                                {/* 11. Observaciones */}
                                <td
                                    className="p-1 border-r border-black align-middle cursor-pointer min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'observaciones', row.observaciones)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'observaciones' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'observaciones')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'observaciones')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Observaciones"
                                            autoFocus
                                        />
                                    ) : (
                                        <span className="text-slate-800">{row.observaciones}</span>
                                    )}
                                </td>

                                {/* 12. Forma de Convocatoria + Botón Eliminar en hover */}
                                <td
                                    className="p-1 align-middle cursor-pointer relative min-h-[24px]"
                                    onClick={() => handleStartEditCell(rIdx, 'formaConvocatoria', row.formaConvocatoria)}
                                >
                                    {editingCell?.rowIdx === rIdx && editingCell.field === 'formaConvocatoria' ? (
                                        <input
                                            type="text"
                                            value={cellDraft}
                                            onChange={(e) => setCellDraft(e.target.value)}
                                            onBlur={() => handleSaveCell(rIdx, 'formaConvocatoria')}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell(rIdx, 'formaConvocatoria')}
                                            className="w-full text-[10px] p-0.5 border border-blue-500 rounded"
                                            placeholder="Teams / Correo"
                                            autoFocus
                                        />
                                    ) : (
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-slate-800">{row.formaConvocatoria}</span>
                                            {rows.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteRow(rIdx);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-rose-600 transition-opacity"
                                                    title="Eliminar fila"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
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

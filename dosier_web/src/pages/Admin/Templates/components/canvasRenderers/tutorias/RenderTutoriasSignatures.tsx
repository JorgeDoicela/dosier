/**
 * @file RenderTutoriasSignatures.tsx
 * @description 3. FIRMAS DE RESPONSABILIDAD (Docente y Coordinador de Carrera).
 * Circuito oficial de validación al pie del formato de seguimiento de tutorías académicas.
 */

import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import type { PlanAnaliticoBlockProps } from '../planAnalitico/RenderPlanAnaliticoGeneral';

export const RenderTutoriasSignatures: React.FC<PlanAnaliticoBlockProps> = ({
    config,
    blockId,
    onUpdateConfig
}) => {
    const c = config || {};
    const docenteNombre = c.docenteNombre || '';
    const docenteCargo = c.docenteCargo || 'DOCENTE:';
    const coordinadorNombre = c.coordinadorNombre || '';
    const coordinadorCargo = c.coordinadorCargo || 'REVISADO: COORDINADOR DE CARRERA';

    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState({
        docenteNombre,
        docenteCargo,
        coordinadorNombre,
        coordinadorCargo
    });

    const handleSave = () => {
        if (onUpdateConfig && blockId) {
            onUpdateConfig(blockId, 'docenteNombre', draft.docenteNombre.trim());
            onUpdateConfig(blockId, 'docenteCargo', draft.docenteCargo.trim() || 'DOCENTE:');
            onUpdateConfig(blockId, 'coordinadorNombre', draft.coordinadorNombre.trim());
            onUpdateConfig(blockId, 'coordinadorCargo', draft.coordinadorCargo.trim() || 'REVISADO: COORDINADOR DE CARRERA');
        }
        setIsEditing(false);
    };

    return (
        <div className="w-full bg-white text-black p-6 pt-10 font-sans select-text">
            {isEditing ? (
                <div className="max-w-xl mx-auto space-y-3 p-3 bg-slate-50 border border-blue-400 rounded text-xs">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">Etiqueta Izquierda:</label>
                            <input
                                type="text"
                                value={draft.docenteCargo}
                                onChange={(e) => setDraft({ ...draft, docenteCargo: e.target.value })}
                                className="w-full p-1 border border-slate-300 rounded"
                            />
                            <label className="font-bold text-slate-700">Nombre Docente:</label>
                            <input
                                type="text"
                                value={draft.docenteNombre}
                                onChange={(e) => setDraft({ ...draft, docenteNombre: e.target.value })}
                                className="w-full p-1 border border-slate-300 rounded"
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="font-bold text-slate-700">Etiqueta Derecha:</label>
                            <input
                                type="text"
                                value={draft.coordinadorCargo}
                                onChange={(e) => setDraft({ ...draft, coordinadorCargo: e.target.value })}
                                className="w-full p-1 border border-slate-300 rounded"
                            />
                            <label className="font-bold text-slate-700">Nombre Coordinador:</label>
                            <input
                                type="text"
                                value={draft.coordinadorNombre}
                                onChange={(e) => setDraft({ ...draft, coordinadorNombre: e.target.value })}
                                className="w-full p-1 border border-slate-300 rounded"
                                placeholder="Nombre completo"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-2.5 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Guardar
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-16 max-w-4xl mx-auto items-end pt-12 group relative">
                    {/* Firma Docente */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-64 border-t border-black mb-1.5" />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-900">
                            {docenteCargo}
                        </span>
                        {docenteNombre && (
                            <span className="text-[10px] text-slate-700 font-semibold mt-0.5">
                                {docenteNombre}
                            </span>
                        )}
                    </div>

                    {/* Firma Coordinador de Carrera */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-72 border-t border-black mb-1.5" />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-slate-900">
                            {coordinadorCargo}
                        </span>
                        {coordinadorNombre && (
                            <span className="text-[10px] text-slate-700 font-semibold mt-0.5">
                                {coordinadorNombre}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setDraft({ docenteNombre, docenteCargo, coordinadorNombre, coordinadorCargo });
                            setIsEditing(true);
                        }}
                        className="absolute -top-4 right-0 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded shadow-xs transition-opacity"
                        title="Editar firmas de responsabilidad"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
};

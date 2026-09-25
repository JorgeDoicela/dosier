/**
 * @file PeaContentsProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'f) Contenidos de Enseñanza' del PEA.
 */

import React from 'react';
import { Layers, RotateCcw, Palette, Sliders, Plus, Trash2 } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaContentsPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaContentsProperties: React.FC<PeaContentsPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};
    const unidades: any[] = Array.isArray(config.unidades) ? config.unidades : [
        { num: 1, titulo: 'Unidad 1', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
        { num: 2, titulo: 'Unidad 2', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
        { num: 3, titulo: 'Unidad 3', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
    ];

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'f) CONTENIDOS DE ENSEÑANZA:');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'subHeaderColor', '#bdd7ee');
        onUpdateConfig(block.id, 'numColWidth', '8%');
        onUpdateConfig(block.id, 'unidades', [
            { num: 1, titulo: 'Unidad 1', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
            { num: 2, titulo: 'Unidad 2', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
            { num: 3, titulo: 'Unidad 3', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
        ]);
    };

    const handleAddUnidad = () => {
        const nextNum = unidades.length + 1;
        const newUnidad = {
            num: nextNum,
            titulo: `Unidad ${nextNum}`,
            horasTotal: 30,
            horasCD: 12,
            horasAPE: 6,
            horasTA: 12,
        };
        onUpdateConfig(block.id, 'unidades', [...unidades, newUnidad]);
    };

    const handleRemoveUnidad = (index: number) => {
        if (unidades.length <= 1) return;
        const updated = unidades.filter((_, i) => i !== index).map((u, i) => ({ ...u, num: i + 1 }));
        onUpdateConfig(block.id, 'unidades', updated);
    };

    const handleUpdateUnidad = (index: number, field: string, value: any) => {
        const updated = unidades.map((u, i) => {
            if (i === index) return { ...u, [field]: value };
            return u;
        });
        onUpdateConfig(block.id, 'unidades', updated);
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-500" />
                        Título de la Sección
                    </label>
                    <button
                        type="button"
                        onClick={handleResetDefaults}
                        className="text-[9px] text-text-dim hover:text-text-main flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restablecer a valores institucionales por defecto"
                    >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Restablecer
                    </button>
                </div>
                <input
                    type="text"
                    value={config.title || 'f) CONTENIDOS DE ENSEÑANZA:'}
                    onChange={(e) => onUpdateConfig(block.id, 'title', e.target.value)}
                    className="w-full bg-surface border border-border-thin rounded-md px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-hidden focus:border-indigo-500"
                />
            </div>

            {/* COLOR DE ENCABEZADOS */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Colores Institucionales
                </label>
                <div className="space-y-1.5">
                    <label className="text-[9px] font-semibold text-text-dim">Color Barra Principal</label>
                    <ColorPickerField
                        label=""
                        value={config.headerColor || '#1e2a4a'}
                        onChange={(val) => onUpdateConfig(block.id, 'headerColor', val)}
                    />
                </div>
                <div className="space-y-1.5 mt-2">
                    <label className="text-[9px] font-semibold text-text-dim">Color Sub-barras de Unidad (Celeste ISTPET)</label>
                    <ColorPickerField
                        label=""
                        value={config.subHeaderColor || '#bdd7ee'}
                        onChange={(val) => onUpdateConfig(block.id, 'subHeaderColor', val)}
                    />
                </div>
            </div>

            {/* UNIDADES DE ESTUDIO */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-indigo-500" />
                        Unidades de Estudio ({unidades.length})
                    </span>
                    <button
                        type="button"
                        onClick={handleAddUnidad}
                        className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                    >
                        <Plus className="w-3 h-3" /> Añadir Unidad
                    </button>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {unidades.map((u, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg border border-border-thin bg-surface space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-text-main">
                                    Unidad {u.num}
                                </span>
                                {unidades.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUnidad(idx)}
                                        className="p-1 text-text-dim hover:text-red-500 rounded transition-colors"
                                        title="Eliminar unidad"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>

                            <input
                                type="text"
                                value={u.titulo || ''}
                                onChange={(e) => handleUpdateUnidad(idx, 'titulo', e.target.value)}
                                placeholder="Nombre de la unidad..."
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500"
                            />

                            <div className="grid grid-cols-4 gap-1.5 text-[8.5px]">
                                <div>
                                    <label className="text-text-dim block">Total H.</label>
                                    <input
                                        type="number"
                                        value={u.horasTotal ?? 0}
                                        onChange={(e) => handleUpdateUnidad(idx, 'horasTotal', Number(e.target.value))}
                                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-text-main"
                                    />
                                </div>
                                <div>
                                    <label className="text-text-dim block">CD</label>
                                    <input
                                        type="number"
                                        value={u.horasCD ?? 0}
                                        onChange={(e) => handleUpdateUnidad(idx, 'horasCD', Number(e.target.value))}
                                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-text-main"
                                    />
                                </div>
                                <div>
                                    <label className="text-text-dim block">APE</label>
                                    <input
                                        type="number"
                                        value={u.horasAPE ?? 0}
                                        onChange={(e) => handleUpdateUnidad(idx, 'horasAPE', Number(e.target.value))}
                                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-text-main"
                                    />
                                </div>
                                <div>
                                    <label className="text-text-dim block">TA</label>
                                    <input
                                        type="number"
                                        value={u.horasTA ?? 0}
                                        onChange={(e) => handleUpdateUnidad(idx, 'horasTA', Number(e.target.value))}
                                        className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-text-main"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * @file PeaBibliographyProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'j) Bibliografía' del PEA.
 */

import React from 'react';
import { Library, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaBibliographyPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaBibliographyProperties: React.FC<PeaBibliographyPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'j) BIBLIOGRAFÍA');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'basicaLabel', 'Bibliografía básica');
        onUpdateConfig(block.id, 'basicaPlaceholder', 'Libros de texto base, manuales oficiales o guías según normas APA 7ma edición.');
        onUpdateConfig(block.id, 'consultaLabel', 'Bibliografía de consulta');
        onUpdateConfig(block.id, 'consultaPlaceholder', 'Artículos científicos indexados, libros de consulta complementaria y repositorios digitales.');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <Library className="w-3.5 h-3.5 text-indigo-500" />
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
                    value={config.title || 'j) BIBLIOGRAFÍA'}
                    onChange={(e) => onUpdateConfig(block.id, 'title', e.target.value)}
                    className="w-full bg-surface border border-border-thin rounded-md px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-hidden focus:border-indigo-500"
                />
            </div>

            {/* COLOR DEL ENCABEZADO */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Palette className="w-3 h-3" /> Color Institucional de Encabezado
                </label>
                <ColorPickerField
                    label=""
                    value={config.headerColor || '#1e2a4a'}
                    onChange={(val) => onUpdateConfig(block.id, 'headerColor', val)}
                />
            </div>

            {/* CONFIGURACIÓN: BIBLIOGRAFÍA BÁSICA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Bibliografía Básica
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la sub-barra</label>
                    <input
                        type="text"
                        value={config.basicaLabel || 'Bibliografía básica'}
                        onChange={(e) => onUpdateConfig(block.id, 'basicaLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.basicaPlaceholder || 'Libros de texto base, manuales oficiales o guías según normas APA 7ma edición.'}
                        onChange={(e) => onUpdateConfig(block.id, 'basicaPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>

            {/* CONFIGURACIÓN: BIBLIOGRAFÍA DE CONSULTA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Bibliografía de Consulta
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la sub-barra</label>
                    <input
                        type="text"
                        value={config.consultaLabel || 'Bibliografía de consulta'}
                        onChange={(e) => onUpdateConfig(block.id, 'consultaLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.consultaPlaceholder || 'Artículos científicos indexados, libros de consulta complementaria y repositorios digitales.'}
                        onChange={(e) => onUpdateConfig(block.id, 'consultaPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

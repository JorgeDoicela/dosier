/**
 * @file PeaMethodologyProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'g) Metodología de Enseñanza y Recursos Didácticos' del PEA.
 */

import React from 'react';
import { BookOpen, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaMethodologyPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaMethodologyProperties: React.FC<PeaMethodologyPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'g) METODOLOGÍA DE ENSEÑANZA');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'estrategiasLabel', 'ESTRATEGIAS METODOLÓGICAS');
        onUpdateConfig(block.id, 'estrategiasPlaceholder', 'En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se contempla el aprendizaje basado en problemas, proyectos formativos, aula invertida y trabajo colaborativo.');
        onUpdateConfig(block.id, 'recursosLabel', 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE');
        onUpdateConfig(block.id, 'recursosPlaceholder', 'Simuladores, entornos virtuales, plataformas, software especializado, presentaciones digitales, videos educativos y bibliografía digital indexada.');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
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
                    value={config.title || 'g) METODOLOGÍA DE ENSEÑANZA'}
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

            {/* CONFIGURACIÓN: ESTRATEGIAS METODOLÓGICAS */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Estrategias Metodológicas
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la sub-barra</label>
                    <input
                        type="text"
                        value={config.estrategiasLabel || 'ESTRATEGIAS METODOLÓGICAS'}
                        onChange={(e) => onUpdateConfig(block.id, 'estrategiasLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.estrategiasPlaceholder || 'En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se contempla el aprendizaje basado en problemas, proyectos formativos, aula invertida y trabajo colaborativo.'}
                        onChange={(e) => onUpdateConfig(block.id, 'estrategiasPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>

            {/* CONFIGURACIÓN: RECURSOS DIDÁCTICOS */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Recursos Didácticos / Informatización
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la sub-barra</label>
                    <input
                        type="text"
                        value={config.recursosLabel || 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE'}
                        onChange={(e) => onUpdateConfig(block.id, 'recursosLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o recursos sugeridos (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.recursosPlaceholder || 'Simuladores, entornos virtuales, plataformas, software especializado, presentaciones digitales, videos educativos y bibliografía digital indexada.'}
                        onChange={(e) => onUpdateConfig(block.id, 'recursosPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

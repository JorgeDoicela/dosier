/**
 * @file PeaCompetenciesProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'd) RDAs de la Carrera y e) RDAs de la Asignatura' del PEA.
 */

import React from 'react';
import { Award, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaCompetenciesPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaCompetenciesProperties: React.FC<PeaCompetenciesPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'rdaCarreraLabel', 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA:');
        onUpdateConfig(block.id, 'rdaCarreraPlaceholder', 'Indicar los resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.');
        onUpdateConfig(block.id, 'rdaAsignaturaLabel', 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:');
        onUpdateConfig(block.id, 'rdaAsignaturaPlaceholder', 'Redactar los resultados de aprendizaje específicos alcanzables por el estudiante.');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-500" />
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
                    value={config.title || 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA'}
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

            {/* CONFIGURACIÓN: d) RESULTADOS DE APRENDIZAJE DE LA CARRERA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    d) Resultados de la Carrera (Perfil de Egreso)
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la subsección</label>
                    <input
                        type="text"
                        value={config.rdaCarreraLabel || 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA:'}
                        onChange={(e) => onUpdateConfig(block.id, 'rdaCarreraLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.rdaCarreraPlaceholder || 'Indicar los resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.'}
                        onChange={(e) => onUpdateConfig(block.id, 'rdaCarreraPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>

            {/* CONFIGURACIÓN: e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    e) Resultados de Aprendizaje de la Asignatura (RDA)
                </span>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Etiqueta de la subsección</label>
                    <input
                        type="text"
                        value={config.rdaAsignaturaLabel || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:'}
                        onChange={(e) => onUpdateConfig(block.id, 'rdaAsignaturaLabel', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-xs text-text-main focus:outline-hidden focus:border-indigo-500"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[9.5px] font-semibold text-text-dim">Texto de guía o instrucción (placeholder)</label>
                    <textarea
                        rows={2}
                        value={config.rdaAsignaturaPlaceholder || 'Redactar los resultados de aprendizaje específicos alcanzables por el estudiante.'}
                        onChange={(e) => onUpdateConfig(block.id, 'rdaAsignaturaPlaceholder', e.target.value)}
                        className="w-full bg-surface border border-border-thin rounded-md px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500 resize-none"
                    />
                </div>
            </div>
        </div>
    );
};

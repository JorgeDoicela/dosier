/**
 * @file PeaSignaturesProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'k) Firmas de Responsabilidad' del PEA.
 */

import React from 'react';
import { ShieldCheck, RotateCcw, Palette, Sliders } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaSignaturesPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaSignaturesProperties: React.FC<PeaSignaturesPropertiesProps> = ({
    block,
    onUpdateConfig,
}) => {
    const config = block.config || {};

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', 'k) FIRMAS DE RESPONSABILIDAD');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'cargoElaborado', 'Docente');
        onUpdateConfig(block.id, 'nombreElaborado', '{{docente_elaborador}}');
        onUpdateConfig(block.id, 'cargoRevisado1', 'Coordinador de Carrera');
        onUpdateConfig(block.id, 'nombreRevisado1', '{{coordinador_carrera}}');
        onUpdateConfig(block.id, 'cargoRevisado2', 'Coordinador Académico');
        onUpdateConfig(block.id, 'nombreRevisado2', '{{coordinador_academico}}');
        onUpdateConfig(block.id, 'cargoAprobado', 'Vicerrectorado');
        onUpdateConfig(block.id, 'nombreAprobado', '{{vicerrector}}');
    };

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
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
                    value={config.title || 'k) FIRMAS DE RESPONSABILIDAD'}
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

            {/* CONFIGURACIÓN DE LOS 4 NIVELES INSTITUCIONALES */}
            <div className="space-y-3 pb-3 border-b border-border-thin/20">
                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-indigo-500" />
                    Instancias de Firma Institucional (4 Niveles)
                </span>

                {/* 1. ELABORADO */}
                <div className="p-2.5 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <span className="text-[10px] font-bold text-text-main block">1. ELABORADO</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Cargo</label>
                            <input
                                type="text"
                                value={config.cargoElaborado || 'Docente'}
                                onChange={(e) => onUpdateConfig(block.id, 'cargoElaborado', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Variable o Nombre</label>
                            <input
                                type="text"
                                value={config.nombreElaborado || '{{docente_elaborador}}'}
                                onChange={(e) => onUpdateConfig(block.id, 'nombreElaborado', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] font-mono text-text-main"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. REVISADO - COORDINADOR DE CARRERA */}
                <div className="p-2.5 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <span className="text-[10px] font-bold text-text-main block">2. REVISADO (Carrera)</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Cargo</label>
                            <input
                                type="text"
                                value={config.cargoRevisado1 || 'Coordinador de Carrera'}
                                onChange={(e) => onUpdateConfig(block.id, 'cargoRevisado1', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Variable o Nombre</label>
                            <input
                                type="text"
                                value={config.nombreRevisado1 || '{{coordinador_carrera}}'}
                                onChange={(e) => onUpdateConfig(block.id, 'nombreRevisado1', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] font-mono text-text-main"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. REVISADO - COORDINACIÓN ACADÉMICA */}
                <div className="p-2.5 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <span className="text-[10px] font-bold text-text-main block">3. REVISADO (Académico)</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Cargo</label>
                            <input
                                type="text"
                                value={config.cargoRevisado2 || 'Coordinador Académico'}
                                onChange={(e) => onUpdateConfig(block.id, 'cargoRevisado2', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Variable o Nombre</label>
                            <input
                                type="text"
                                value={config.nombreRevisado2 || '{{coordinador_academico}}'}
                                onChange={(e) => onUpdateConfig(block.id, 'nombreRevisado2', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] font-mono text-text-main"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. APROBADO - VICERRECTORADO */}
                <div className="p-2.5 rounded-lg border border-border-thin bg-surface space-y-1.5">
                    <span className="text-[10px] font-bold text-text-main block">4. APROBADO</span>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Cargo</label>
                            <input
                                type="text"
                                value={config.cargoAprobado || 'Vicerrectorado'}
                                onChange={(e) => onUpdateConfig(block.id, 'cargoAprobado', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Variable o Nombre</label>
                            <input
                                type="text"
                                value={config.nombreAprobado || '{{vicerrector}}'}
                                onChange={(e) => onUpdateConfig(block.id, 'nombreAprobado', e.target.value)}
                                className="w-full bg-surface-hover/30 border border-border-thin rounded px-1.5 py-0.5 text-[9.5px] font-mono text-text-main"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

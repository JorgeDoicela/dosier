import React from 'react';
import { Target, HelpCircle, Palette } from 'lucide-react';
import type { DocumentBlock } from '../../types';

interface PeaObjectivePropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaObjectiveProperties: React.FC<PeaObjectivePropertiesProps> = ({
    block,
    onUpdateConfig
}) => {
    const c = block.config || {};

    const handleConfigChange = (key: string, value: any) => {
        onUpdateConfig(block.id, key, value);
    };

    return (
        <div className="space-y-4">
            {/* Header explicativo */}
            <div className="bg-surface-subtle border border-border-thin rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                        Sección b) Objetivo de la Asignatura
                    </span>
                </div>
                <p className="text-[11px] text-text-dim leading-relaxed">
                    Define la meta formativa integral de la asignatura. Se formula iniciando con verbo en infinitivo, especificando el qué, cómo y para qué, articulado a la formación técnica.
                </p>
            </div>

            {/* Estilo y Color de Cabecera */}
            <div className="border border-border-thin rounded-lg p-3 space-y-3">
                <h4 className="text-[11px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-text-dim" />
                    Apariencia de la Barra de Sección
                </h4>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Color de Barra de Sección</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={c.headerColor || '#1e2a4a'}
                            onChange={(e) => handleConfigChange('headerColor', e.target.value)}
                            className="w-8 h-8 rounded border border-border-thin cursor-pointer bg-transparent"
                        />
                        <input
                            type="text"
                            value={c.headerColor || '#1e2a4a'}
                            onChange={(e) => handleConfigChange('headerColor', e.target.value)}
                            className="flex-1 bg-surface-subtle border border-border-thin rounded px-2.5 py-1 text-xs text-text-main font-mono"
                        />
                    </div>
                </div>
            </div>

            {/* Configuración de Contenido */}
            <div className="border border-border-thin rounded-lg p-3 space-y-3">
                <h4 className="text-[11px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-violet-500" />
                    Etiquetas y Orientaciones
                </h4>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Título / Etiqueta de la Sección</label>
                    <input
                        type="text"
                        value={c.objetivoLabel ?? 'b) OBJETIVO DE LA ASIGNATURA'}
                        onChange={(e) => handleConfigChange('objetivoLabel', e.target.value)}
                        className="w-full bg-surface-subtle border border-border-thin rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Texto de Guía Pedagógica (Placeholder)</label>
                    <textarea
                        rows={3}
                        value={c.objetivoPlaceholder ?? 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.'}
                        onChange={(e) => handleConfigChange('objetivoPlaceholder', e.target.value)}
                        className="w-full bg-surface-subtle border border-border-thin rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Número de Líneas en Hoja Impresa</label>
                    <input
                        type="number"
                        min={2}
                        max={10}
                        value={c.lineCount ?? 4}
                        onChange={(e) => handleConfigChange('lineCount', parseInt(e.target.value) || 4)}
                        className="w-full bg-surface-subtle border border-border-thin rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[10.5px] text-blue-400">
                <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                <span>
                    En el Workspace docente, el campo se enlaza a <code>&lt;CoWorkField&gt;</code> con clave <code>objetivo_asignatura</code> y soporte de autoguardado en tiempo real.
                </span>
            </div>
        </div>
    );
};

import React from 'react';
import { Layers, HelpCircle, Palette } from 'lucide-react';
import type { DocumentBlock } from '../../types';

interface PeaPrerequisitesPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaPrerequisitesProperties: React.FC<PeaPrerequisitesPropertiesProps> = ({
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
                    <Layers className="w-4 h-4 text-violet-500" />
                    <span className="text-xs font-bold text-text-main uppercase tracking-wider">
                        Sección c) Prerrequisitos
                    </span>
                </div>
                <p className="text-[11px] text-text-dim leading-relaxed">
                    Tabla de prelación curricular de la asignatura. Muestra las materias antecedentes requeridas según la malla curricular oficial aprobada por el CES.
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

            {/* Configuración de Tabla de Prerrequisitos */}
            <div className="border border-border-thin rounded-lg p-3 space-y-3">
                <h4 className="text-[11px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-violet-500" />
                    Columnas y Títulos
                </h4>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Título / Etiqueta de la Sección</label>
                    <input
                        type="text"
                        value={c.prerrequisitosLabel ?? 'c) PRERREQUISITOS:'}
                        onChange={(e) => handleConfigChange('prerrequisitosLabel', e.target.value)}
                        className="w-full bg-surface-subtle border border-border-thin rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-violet-500"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[10.5px] font-medium text-text-dim">Columna 1 (Materia)</label>
                        <input
                            type="text"
                            value={c.prerrequisitosColAsignatura ?? 'Asignatura'}
                            onChange={(e) => handleConfigChange('prerrequisitosColAsignatura', e.target.value)}
                            className="w-full bg-surface-subtle border border-border-thin rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-violet-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10.5px] font-medium text-text-dim">Columna 2 (Condición)</label>
                        <input
                            type="text"
                            value={c.prerrequisitosColObservacion ?? 'Observación'}
                            onChange={(e) => handleConfigChange('prerrequisitosColObservacion', e.target.value)}
                            className="w-full bg-surface-subtle border border-border-thin rounded px-2 py-1 text-xs text-text-main focus:outline-none focus:border-violet-500"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-text-dim">Filas Vacías para Impresión</label>
                    <input
                        type="number"
                        min={1}
                        max={6}
                        value={c.filasVacias ?? 2}
                        onChange={(e) => handleConfigChange('filasVacias', parseInt(e.target.value) || 2)}
                        className="w-full bg-surface-subtle border border-border-thin rounded px-2.5 py-1.5 text-xs text-text-main focus:outline-none focus:border-violet-500"
                    />
                </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg text-[10.5px] text-blue-400">
                <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-500" />
                <span>
                    En el Workspace docente, esta tabla se precarga automáticamente a partir de la malla vigente de SIGAFI y permite registrar observaciones complementarias de acreditación.
                </span>
            </div>
        </div>
    );
};

/**
 * @file PeaGeneralProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'Datos Generales y Carga Horaria' del PEA oficial.
 * Permite configurar visibilidad de metadatos, etiquetas personalizadas, paletas de colores y campos adicionales.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, RotateCcw, Palette, GraduationCap, Clock } from 'lucide-react';
import type { DocumentBlock } from '../../types';
import { ColorPickerField } from './SharedColorPicker';

interface PeaGeneralPropertiesProps {
    block: DocumentBlock;
    onUpdateConfig: (blockId: string, key: string, value: any) => void;
}

export const PeaGeneralProperties: React.FC<PeaGeneralPropertiesProps> = ({ block, onUpdateConfig }) => {
    const config = block.config || {};
    const customFields: any[] = Array.isArray(config.customFields) ? config.customFields : [];

    const [isAdding, setIsAdding] = useState(false);
    const [newField, setNewField] = useState({
        label: '',
        fieldKey: '',
        placeholder: '',
        variant: 'standard'
    });

    const handleResetDefaults = () => {
        onUpdateConfig(block.id, 'title', '1. DATOS GENERALES Y CARGA HORARIA');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'borderStyle', 'solid');
        onUpdateConfig(block.id, 'showAsignatura', true);
        onUpdateConfig(block.id, 'showCarrera', true);
        onUpdateConfig(block.id, 'showNivelModalidad', true);
        onUpdateConfig(block.id, 'showUnidadOrganizacion', true);
        onUpdateConfig(block.id, 'showRequisitos', true);
        onUpdateConfig(block.id, 'showDocente', true);
        onUpdateConfig(block.id, 'customFields', []);
        onUpdateConfig(block.id, 'fieldsOrder', []);
    };

    const handleSaveField = () => {
        if (!newField.label.trim()) return;
        const autoKey = newField.fieldKey && newField.fieldKey.trim() !== ''
            ? newField.fieldKey.trim()
            : `pea_custom_${Date.now().toString().slice(-4)}`;

        const fieldToSave = {
            fieldKey: autoKey,
            label: newField.label.trim(),
            fieldType: 'text',
            variant: newField.variant,
            placeholder: newField.placeholder || ''
        };

        onUpdateConfig(block.id, 'customFields', [...customFields, fieldToSave]);
        setNewField({ label: '', fieldKey: '', placeholder: '', variant: 'standard' });
        setIsAdding(false);
    };

    const handleRemoveCustomField = (index: number) => {
        const updated = customFields.filter((_, i) => i !== index);
        onUpdateConfig(block.id, 'customFields', updated);
    };

    const CORE_PEA_ITEMS = [
        { key: 'showAsignatura', labelKey: 'customLabel_showAsignatura', variantKey: 'variant_showAsignatura', defaultLabel: 'Nombre de la Asignatura', desc: 'Mapeado a la tabla asignaturas de SIGAFI.' },
        { key: 'showCarrera', labelKey: 'customLabel_showCarrera', variantKey: 'variant_showCarrera', defaultLabel: 'Carrera y Código Oficial', desc: 'Carrera institucional y código único de la materia.' },
        { key: 'showNivelModalidad', labelKey: 'customLabel_showNivelModalidad', variantKey: 'variant_showNivelModalidad', defaultLabel: 'Nivel y Modalidad de Estudio', desc: 'Semestre formativo, modalidad y paralelo asignado.' },
        { key: 'showUnidadOrganizacion', labelKey: 'customLabel_showUnidadOrganizacion', variantKey: 'variant_showUnidadOrganizacion', defaultLabel: 'Unidad de Organización Curricular', desc: 'Básica, Profesional o Titulación según RRA.' },
        { key: 'showRequisitos', labelKey: 'customLabel_showRequisitos', variantKey: 'variant_showRequisitos', defaultLabel: 'Prerrequisitos y Correquisitos', desc: 'Asignaturas antecedentes y simultáneas de la malla.' },
        { key: 'showDocente', labelKey: 'customLabel_showDocente', variantKey: 'variant_showDocente', defaultLabel: 'Docente Responsable Elaborador', desc: 'Docente asignado en el distributivo institucional.' }
    ];

    return (
        <div className="space-y-4 border-t border-border-thin/20 pt-4 font-sans text-xs">
            {/* CABECERA Y RESET */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                        Título de la Sección PEA
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
                    value={config.title || '1. DATOS GENERALES Y CARGA HORARIA'}
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

            {/* ESTILO DE BORDES */}
            <div className="space-y-1.5 pb-3 border-b border-border-thin/20">
                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                    Estilo de Borde de la Tabla
                </label>
                <select
                    value={config.borderStyle || 'solid'}
                    onChange={(e) => onUpdateConfig(block.id, 'borderStyle', e.target.value)}
                    className="w-full bg-surface border border-border-thin rounded-md px-2.5 py-1.5 text-xs text-text-main focus:outline-hidden focus:border-indigo-500 cursor-pointer"
                >
                    <option value="solid">Borde Institucional Continuo (Oficial)</option>
                    <option value="none">Sin Bordes Exteriores (Limpio)</option>
                </select>
            </div>

            {/* METADATOS CORE DEL PEA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-indigo-500" />
                        Metadatos Curriculares Base
                    </span>
                    <span className="text-[9px] text-text-dim/70">SIGAFI + RRA</span>
                </div>

                <div className="space-y-1.5">
                    {CORE_PEA_ITEMS.map((item) => {
                        const isEnabled = config[item.key] !== false;
                        const customLabel = config[item.labelKey] || item.defaultLabel;
                        const variant = config[item.variantKey] || 'standard';

                        return (
                            <div
                                key={item.key}
                                className={`p-2 rounded-md border transition-all ${
                                    isEnabled
                                        ? 'bg-surface border-border-thin/50'
                                        : 'bg-surface/40 border-border-thin/20 opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={isEnabled}
                                            onChange={(e) => onUpdateConfig(block.id, item.key, e.target.checked)}
                                            className="w-3.5 h-3.5 rounded border-border-thin text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-[11px] font-semibold text-text-main">
                                            {item.defaultLabel}
                                        </span>
                                    </label>

                                    {isEnabled && (
                                        <select
                                            value={variant}
                                            onChange={(e) => onUpdateConfig(block.id, item.variantKey, e.target.value)}
                                            className="text-[9px] bg-surface border border-border-thin rounded px-1.5 py-0.5 text-text-dim cursor-pointer"
                                        >
                                            <option value="standard">Estándar</option>
                                            <option value="banner_navy">Azul Institucional</option>
                                            <option value="banner_gold">Dorado Traversal</option>
                                            <option value="banner_emerald">Verde Académico</option>
                                        </select>
                                    )}
                                </div>

                                {isEnabled && (
                                    <div className="mt-1.5 pl-5">
                                        <input
                                            type="text"
                                            value={customLabel}
                                            placeholder={item.defaultLabel}
                                            onChange={(e) => onUpdateConfig(block.id, item.labelKey, e.target.value)}
                                            className="w-full bg-surface-hover border border-border-thin/40 rounded px-2 py-1 text-[10px] text-text-main focus:outline-hidden focus:border-indigo-500"
                                        />
                                        <p className="text-[8.5px] text-text-dim mt-0.5">{item.desc}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* CAMPOS ADICIONALES PERSONALIZADOS */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                        Campos Adicionales de la Carrera ({customFields.length})
                    </span>
                    {!isAdding && (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="text-[9.5px] text-indigo-500 hover:text-indigo-400 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                            <Plus className="w-3 h-3" /> Añadir
                        </button>
                    )}
                </div>

                {isAdding && (
                    <div className="p-2.5 bg-surface rounded-md border border-indigo-500/30 space-y-2 animate-fade-in">
                        <div>
                            <label className="text-[9px] font-bold text-text-dim uppercase">Etiqueta del Campo</label>
                            <input
                                type="text"
                                value={newField.label}
                                onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                                placeholder="Ej: Laboratorio Asignado, Software Requerido..."
                                className="w-full bg-surface-hover border border-border-thin rounded px-2 py-1 text-xs text-text-main mt-0.5"
                            />
                        </div>
                        <div>
                            <label className="text-[9px] font-bold text-text-dim uppercase">Texto Guía (Placeholder)</label>
                            <input
                                type="text"
                                value={newField.placeholder}
                                onChange={(e) => setNewField({ ...newField, placeholder: e.target.value })}
                                placeholder="Información que el docente deberá ingresar..."
                                className="w-full bg-surface-hover border border-border-thin rounded px-2 py-1 text-xs text-text-main mt-0.5"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-2 py-1 text-[10px] text-text-dim hover:text-text-main cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveField}
                                className="px-2.5 py-1 text-[10px] bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-500 cursor-pointer transition-colors"
                            >
                                Guardar Campo
                            </button>
                        </div>
                    </div>
                )}

                {customFields.map((f, idx) => (
                    <div
                        key={f.fieldKey || idx}
                        className="flex items-center justify-between p-2 bg-surface rounded-md border border-border-thin/40 text-[10px]"
                    >
                        <span className="font-semibold text-text-main truncate max-w-[70%]">{f.label}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveCustomField(idx)}
                            className="text-text-dim hover:text-red-500 p-1 cursor-pointer transition-colors"
                            title="Eliminar campo"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

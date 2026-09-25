/**
 * @file PeaGeneralProperties.tsx
 * @description Panel lateral de propiedades para el bloque 'a) Datos Generales de la Asignatura' del PEA oficial.
 * Permite configurar cabecera institucional oficial, visibilidad de los 10 metadatos curriculares, paletas y campos adicionales.
 */

import React, { useState } from 'react';
import { Plus, Trash2, Sliders, RotateCcw, Palette, GraduationCap, Building2 } from 'lucide-react';
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
        onUpdateConfig(block.id, 'title', 'a) DATOS GENERALES DE LA ASIGNATURA:');
        onUpdateConfig(block.id, 'headerColor', '#1e2a4a');
        onUpdateConfig(block.id, 'borderStyle', 'solid');
        onUpdateConfig(block.id, 'showHeader', true);
        onUpdateConfig(block.id, 'institutionName', 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"');
        onUpdateConfig(block.id, 'institutionAddress', 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)');
        onUpdateConfig(block.id, 'documentTitle', 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA');
        onUpdateConfig(block.id, 'showAsignatura', true);
        onUpdateConfig(block.id, 'showCodigoCarrera', true);
        onUpdateConfig(block.id, 'showCarrera', true);
        onUpdateConfig(block.id, 'showModalidad', true);
        onUpdateConfig(block.id, 'showUnidadOrganizacion', true);
        onUpdateConfig(block.id, 'showPeriodo', true);
        onUpdateConfig(block.id, 'showSemestre', true);
        onUpdateConfig(block.id, 'showTotalHoras', true);
        onUpdateConfig(block.id, 'showCreditos', true);
        onUpdateConfig(block.id, 'showOrganizacionAprendizaje', true);
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
        { key: 'showAsignatura', labelKey: 'customLabel_showAsignatura', variantKey: 'variant_showAsignatura', defaultLabel: 'Nombre de la asignatura:', desc: 'Asignatura seleccionada vinculada a SIGAFI.' },
        { key: 'showCodigoCarrera', labelKey: 'customLabel_showCodigoCarrera', variantKey: 'variant_showCodigoCarrera', defaultLabel: 'Código de carrera:', desc: 'Código curricular asignado a la carrera.' },
        { key: 'showCarrera', labelKey: 'customLabel_showCarrera', variantKey: 'variant_showCarrera', defaultLabel: 'Carrera:', desc: 'Nombre oficial de la carrera tecnológica.' },
        { key: 'showModalidad', labelKey: 'customLabel_showModalidad', variantKey: 'variant_showModalidad', defaultLabel: 'Modalidad de estudio:', desc: 'Presencial, Semipresencial, Híbrida o En Línea.' },
        { key: 'showUnidadOrganizacion', labelKey: 'customLabel_showUnidadOrganizacion', variantKey: 'variant_showUnidadOrganizacion', defaultLabel: 'Unidad de Organización Curricular:', desc: 'Unidad Básica, Profesional o Integración Curricular.' },
        { key: 'showPeriodo', labelKey: 'customLabel_showPeriodo', variantKey: 'variant_showPeriodo', defaultLabel: 'Periodo académico:', desc: 'Período académico semestral vigente.' },
        { key: 'showSemestre', labelKey: 'customLabel_showSemestre', variantKey: 'variant_showSemestre', defaultLabel: 'Semestre:', desc: 'Semestre o nivel curricular de la asignatura.' },
        { key: 'showTotalHoras', labelKey: 'customLabel_showTotalHoras', variantKey: 'variant_showTotalHoras', defaultLabel: 'Número de horas de la asignatura:', desc: 'Total global de horas formativas.' },
        { key: 'showCreditos', labelKey: 'customLabel_showCreditos', variantKey: 'variant_showCreditos', defaultLabel: 'Número de créditos:', desc: 'Número de créditos académicos calculados.' },
        { key: 'showOrganizacionAprendizaje', labelKey: 'customLabel_showOrganizacionAprendizaje', variantKey: 'variant_showOrganizacionAprendizaje', defaultLabel: 'Organización de aprendizajes por modalidad (Horas CD, APE, TA):', desc: 'Desglose en contacto docente, práctico y autónomo.' }
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
                    value={config.title || 'a) DATOS GENERALES DE LA ASIGNATURA:'}
                    onChange={(e) => onUpdateConfig(block.id, 'title', e.target.value)}
                    className="w-full bg-surface border border-border-thin rounded-md px-2.5 py-1.5 text-xs text-text-main font-semibold focus:outline-hidden focus:border-indigo-500"
                />
            </div>

            {/* CABECERA INSTITUCIONAL OFICIAL (LOGO + ISTPET CHILLOGALLO) */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-indigo-500" />
                        Cabecera Institucional Oficial
                    </span>
                    <input
                        type="checkbox"
                        checked={config.showHeader !== false}
                        onChange={(e) => onUpdateConfig(block.id, 'showHeader', e.target.checked)}
                        className="w-4 h-4 text-text-main accent-text-main bg-surface border-border-thin rounded cursor-pointer"
                    />
                </div>

                {config.showHeader !== false && (
                    <div className="space-y-2 pt-1">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Nombre Institucional</label>
                            <input
                                type="text"
                                value={config.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"'}
                                onChange={(e) => onUpdateConfig(block.id, 'institutionName', e.target.value)}
                                className="w-full bg-surface border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Dirección / Campus</label>
                            <input
                                type="text"
                                value={config.institutionAddress || 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)'}
                                onChange={(e) => onUpdateConfig(block.id, 'institutionAddress', e.target.value)}
                                className="w-full bg-surface border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Título del Documento</label>
                            <input
                                type="text"
                                value={config.documentTitle || 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA'}
                                onChange={(e) => onUpdateConfig(block.id, 'documentTitle', e.target.value)}
                                className="w-full bg-surface border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main font-semibold"
                            />
                        </div>
                    </div>
                )}
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
                    <option value="solid">Borde Institucional Continuo (Oficial ISTPET)</option>
                    <option value="none">Sin Bordes Exteriores</option>
                </select>
            </div>

            {/* METADATOS CORE DEL PEA */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider flex items-center gap-1">
                        <Sliders className="w-3 h-3 text-indigo-500" />
                        10 Metadatos Curriculares Oficiales
                    </span>
                    <span className="text-[9px] text-text-dim/70">SIGAFI + ISTPET</span>
                </div>

                <div className="space-y-1.5">
                    {CORE_PEA_ITEMS.map((item) => {
                        const isEnabled = config[item.key] !== false;
                        const customLabel = config[item.labelKey] || item.defaultLabel;

                        return (
                            <div
                                key={item.key}
                                className={`p-2 rounded-md border transition-all ${
                                    isEnabled
                                        ? 'bg-surface border-border-thin'
                                        : 'bg-surface-hover/20 border-transparent opacity-60'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 pr-2 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => onUpdateConfig(block.id, item.key, e.target.checked)}
                                                className="w-3.5 h-3.5 text-indigo-600 rounded border-border-thin cursor-pointer"
                                            />
                                            <span className="text-[10px] font-bold text-text-main truncate">
                                                {customLabel}
                                            </span>
                                        </div>
                                        <p className="text-[8.5px] text-text-dim mt-0.5 leading-tight pl-5">
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* METADATOS PERSONALIZADOS */}
            <div className="space-y-2 pb-3 border-b border-border-thin/20">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                        Campos Adicionales ({customFields.length})
                    </span>
                    {!isAdding && (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-1 text-[9px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors cursor-pointer"
                        >
                            <Plus className="w-3 h-3" /> Añadir
                        </button>
                    )}
                </div>

                {isAdding && (
                    <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/20 space-y-2">
                        <div>
                            <label className="text-[8.5px] text-text-dim block">Etiqueta</label>
                            <input
                                type="text"
                                value={newField.label}
                                onChange={(e) => setNewField(prev => ({ ...prev, label: e.target.value }))}
                                placeholder="Ej: Paralelo Asignado..."
                                className="w-full bg-surface border border-border-thin rounded px-2 py-1 text-[9.5px] text-text-main"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-1.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-2 py-0.5 text-[9px] text-text-dim hover:text-text-main"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveField}
                                className="px-2.5 py-0.5 text-[9px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                )}

                {customFields.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded border border-border-thin bg-surface">
                        <span className="text-[9.5px] font-semibold text-text-main">{f.label}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveCustomField(idx)}
                            className="p-1 text-text-dim hover:text-red-500 rounded transition-colors"
                        >
                            <Trash2 className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

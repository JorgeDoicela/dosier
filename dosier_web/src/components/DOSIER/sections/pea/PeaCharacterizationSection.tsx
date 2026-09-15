import React from 'react';
import { Target, Plus, Trash2, Info, BookOpen } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface PeaCharacterizationSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaCharacterizationSection: React.FC<PeaCharacterizationSectionProps> = ({
    formData,
    cowork,
    onUpdate,
    readOnly = false,
    config,
    onAdd,
    onRemove,
    onUpdateItem
}) => {
    const c = config || {};
    const displayTitle = c.title || 'b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const prerrequisitos: any[] = Array.isArray(formData?.Prerrequisitos) ? formData.Prerrequisitos : [];

    const handleAddPrerrequisito = () => {
        if (readOnly) return;
        const newItem = {
            Asignatura: '',
            Observacion: 'Aprobación de ciclo previo'
        };
        if (onAdd) {
            onAdd('Prerrequisitos', newItem);
        } else {
            const updated = [...prerrequisitos, newItem];
            onUpdate('Prerrequisitos', updated);
        }
    };

    const handleRemovePrerrequisito = (idx: number) => {
        if (readOnly) return;
        if (onRemove) {
            onRemove('Prerrequisitos', idx);
        } else {
            const updated = prerrequisitos.filter((_, i) => i !== idx);
            onUpdate('Prerrequisitos', updated);
        }
    };

    const handleUpdatePrerrequisito = (idx: number, field: string, value: any) => {
        if (readOnly) return;
        if (onUpdateItem) {
            onUpdateItem('Prerrequisitos', idx, field, value);
        } else {
            const updated = prerrequisitos.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            onUpdate('Prerrequisitos', updated);
        }
    };

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Caracterización Curricular
                </span>
            </div>

            {/* b) OBJETIVO DE LA ASIGNATURA */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            b) Objetivo Formativo General de la Asignatura
                        </span>
                    </div>
                    <span className="text-[10px] text-text-dim font-medium">
                        Redacción colaborativa (Yjs)
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Formular con <strong className="text-text-main">Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué?</strong>, articulado directamente al perfil de egreso y nivel de la carrera.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="ObjetivoAsignatura"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="Defina el objetivo formativo general de la asignatura..."
                            className="min-h-[140px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('ObjetivoAsignatura', html, meta)}
                        />
                    </div>
                </div>
            </div>

            {/* c) PRERREQUISITOS CURRICULARES */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        c) Prerrequisitos Curriculares
                    </span>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddPrerrequisito}
                            className="btn-vercel-secondary text-xs px-3 py-1 flex items-center gap-1.5"
                        >
                            <Plus size={13} />
                            <span>Añadir Prerrequisito</span>
                        </button>
                    )}
                </div>

                <div className="p-4">
                    {prerrequisitos.length === 0 ? (
                        <div className="text-center py-8 px-4 border border-dashed border-border-thin rounded-xl bg-bg-deep/40 text-text-dim text-xs">
                            <p className="font-medium">No se han registrado asignaturas prerrequisito.</p>
                            <p className="text-[10px] mt-1 text-text-dim/80">Si la asignatura no tiene prerrequisitos, puede dejar este espacio indicando «Ninguno / Nivel previo aprobado».</p>
                            {!readOnly && (
                                <button
                                    type="button"
                                    onClick={handleAddPrerrequisito}
                                    className="mt-3 btn-vercel-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                                >
                                    <Plus size={13} /> Añadir fila de prerrequisito
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto rounded-xl border border-border-thin">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-bg-deep text-text-dim text-[10px] uppercase tracking-wider font-bold border-b border-border-thin">
                                        <th className="p-3 w-[45%] border-r border-border-thin">Asignatura Prerrequisito</th>
                                        <th className="p-3 w-[45%] border-r border-border-thin">Observación / Condición</th>
                                        {!readOnly && <th className="p-3 w-[10%] text-center">Acción</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-thin bg-surface">
                                    {prerrequisitos.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                            <td className="p-2.5 border-r border-border-thin">
                                                <input
                                                    type="text"
                                                    value={item.Asignatura || item.asignatura || item['0'] || ''}
                                                    onChange={(e) => handleUpdatePrerrequisito(idx, 'Asignatura', e.target.value)}
                                                    disabled={readOnly}
                                                    placeholder="Nombre de la asignatura previa"
                                                    className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand"
                                                />
                                            </td>
                                            <td className="p-2.5 border-r border-border-thin">
                                                <input
                                                    type="text"
                                                    value={item.Observacion || item.observacion || item['1'] || ''}
                                                    onChange={(e) => handleUpdatePrerrequisito(idx, 'Observacion', e.target.value)}
                                                    disabled={readOnly}
                                                    placeholder="Observación o código de condición"
                                                    className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand"
                                                />
                                            </td>
                                            {!readOnly && (
                                                <td className="p-2.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemovePrerrequisito(idx)}
                                                        className="p-1.5 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors"
                                                        title="Eliminar fila"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

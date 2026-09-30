import React from 'react';
import { Layers, Plus, Trash2, Info, BookOpen } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaPrerequisitesSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaPrerequisitesSection: React.FC<PeaPrerequisitesSectionProps> = ({
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
    const displayTitle = c.title || 'c) PRERREQUISITOS CURRICULARES';

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
        <div className="w-full space-y-4 sm:space-y-5 animate-fade-in font-sans">
            {/* Aviso Normativo */}
            <div className="flex gap-2.5 p-3.5 sm:p-4 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs text-text-dim items-start">
                <Info size={16} className="text-[#0070f3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Especifique las asignaturas normadas de la malla curricular aprobada que condicionan la matrícula y cursado de la presente materia, conforme al Régimen Académico del ISTPET.
                </p>
            </div>

            {/* Tabla de Prerrequisitos */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-main">
                        Matriz de Asignaturas Prerrequisito ({prerrequisitos.length})
                    </span>

                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddPrerrequisito}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-border-thin hover:border-[#0070f3] text-xs font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                        >
                            <Plus size={14} className="text-[#0070f3]" />
                            <span>Añadir Prerrequisito</span>
                        </button>
                    )}
                </div>

                {prerrequisitos.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-border-thin rounded-xl bg-surface">
                        <Layers size={28} className="mx-auto text-text-dim opacity-40 mb-2" />
                        <p className="text-xs font-semibold text-text-dim">
                            No se han registrado prerrequisitos para esta asignatura.
                        </p>
                        <p className="text-[11px] text-text-dim/70 mt-1">
                            Si la asignatura no tiene prerrequisitos, puede continuar a la siguiente sección.
                        </p>
                        {!readOnly && (
                            <button
                                type="button"
                                onClick={handleAddPrerrequisito}
                                className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0070f3] text-white text-xs font-semibold hover:bg-[#005bb5] transition-all cursor-pointer shadow-2xs"
                            >
                                <Plus size={13} />
                                <span>Agregar primer prerrequisito</span>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-border-thin bg-surface shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-border-thin bg-bg-deep text-text-dim text-[10px] font-bold uppercase tracking-wider">
                                    <th className="p-3 w-12 text-center border-r border-border-thin">
                                        #
                                    </th>
                                    <th className="p-3 border-r border-border-thin">
                                        Asignatura Prerrequisito
                                    </th>
                                    <th className="p-3 border-r border-border-thin">
                                        Observación / Condición Curricular
                                    </th>
                                    {!readOnly && (
                                        <th className="p-3 w-14 text-center">
                                            Acción
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-thin bg-surface">
                                {prerrequisitos.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                        <td className="p-2.5 text-center font-mono text-text-dim font-bold text-xs border-r border-border-thin">
                                            {idx + 1}
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <CoWorkField
                                                name={`Prerrequisitos[${idx}].Asignatura`}
                                                cowork={cowork}
                                                type="text"
                                                readOnly={readOnly}
                                                placeholder="Nombre normado de la asignatura previa (ej. Programación Básica)"
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-main focus:border-[#0070f3] outline-none"
                                                onValueChange={(val) => handleUpdatePrerrequisito(idx, 'Asignatura', val)}
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <CoWorkField
                                                name={`Prerrequisitos[${idx}].Observacion`}
                                                cowork={cowork}
                                                type="text"
                                                readOnly={readOnly}
                                                placeholder="Condición de aprobación (ej. Haber cursado y aprobado)"
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main focus:border-[#0070f3] outline-none"
                                                onValueChange={(val) => handleUpdatePrerrequisito(idx, 'Observacion', val)}
                                            />
                                        </td>
                                        {!readOnly && (
                                            <td className="p-2.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePrerrequisito(idx)}
                                                    className="p-1.5 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                                                    title="Eliminar prerrequisito"
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
    );
};

import React from 'react';
import { BarChart3, Info, Plus, Trash2, Award } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface EvaluacionItem {
    nota: string;
    tipo: string;
    calificacion: number;
}

interface PeaEvaluationSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaEvaluationSection: React.FC<PeaEvaluationSectionProps> = ({
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
    const displayTitle = c.title || 'i) EVALUACIÓN DEL APRENDIZAJE';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    const rawEvaluaciones: any[] = Array.isArray(formData?.Evaluaciones) ? formData.Evaluaciones : [];

    const defaultEvaluaciones: EvaluacionItem[] = [
        {
            nota: 'Nota Parcial 1',
            tipo: 'Actividades autónomas y práctico-experimentales (evaluación formativa frecuente)',
            calificacion: 10
        },
        {
            nota: 'Nota Parcial 2',
            tipo: 'Evaluaciones sumativas de las unidades de estudio (pruebas parciales y talleres)',
            calificacion: 10
        },
        {
            nota: 'Evaluación Final',
            tipo: 'Evaluación final integradora de la asignatura (examen / proyecto técnico)',
            calificacion: 10
        }
    ];

    const evaluaciones: EvaluacionItem[] = rawEvaluaciones.length > 0 ? rawEvaluaciones.map(e => ({
        nota: e.nota || e.Nota || e['0'] || 'Nota Parcial',
        tipo: e.tipo || e.Tipo || e['1'] || 'Evaluación',
        calificacion: Number(e.calificacion ?? e.Calificacion ?? e['2'] ?? 10)
    })) : defaultEvaluaciones;

    const handleAddEvaluacion = () => {
        if (readOnly) return;
        const newItem: EvaluacionItem = {
            nota: `Componente ${evaluaciones.length + 1}`,
            tipo: 'Actividades académicas y talleres',
            calificacion: 10
        };

        if (onAdd) {
            onAdd('Evaluaciones', newItem);
        } else {
            const updated = [...evaluaciones, newItem];
            onUpdate('Evaluaciones', updated);
        }
    };

    const handleRemoveEvaluacion = (idx: number) => {
        if (readOnly) return;
        if (onRemove) {
            onRemove('Evaluaciones', idx);
        } else {
            const updated = evaluaciones.filter((_, i) => i !== idx);
            onUpdate('Evaluaciones', updated);
        }
    };

    const handleUpdateEvaluacion = (idx: number, field: keyof EvaluacionItem, value: any) => {
        if (readOnly) return;
        if (onUpdateItem) {
            onUpdateItem('Evaluaciones', idx, field, value);
        } else {
            const updated = evaluaciones.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            onUpdate('Evaluaciones', updated);
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
                    <BarChart3 className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    RRA Art. 21 / ISTPET
                </span>
            </div>

            {/* POLÍTICAS Y CRITERIOS DE EVALUACIÓN */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        Criterios y Políticas de Evaluación Continua
                    </span>
                    <span className="text-[10px] text-text-dim font-medium">
                        Régimen Académico Institucional
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Describa las políticas pedagógicas: evaluación diagnóstica, formativa continua y sumativa, puntualidad, deshonestidad académica y mecanismos de retroalimentación oportuna.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="EvaluacionAprendizaje"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="Describa los criterios de evaluación:&#10;• La evaluación es sistemática y orientada al logro de los resultados de aprendizaje...&#10;• Todo trabajo entregado fuera de plazo tendrá penalización acordada...&#10;• Se garantiza el derecho a la recalificación según el RRA institucional..."
                            className="min-h-[140px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('EvaluacionAprendizaje', html, meta)}
                        />
                    </div>
                </div>
            </div>

            {/* MATRIZ OFICIAL DE CALIFICACIONES */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            Matriz Oficial de Calificaciones (Escala vigesimal o sobre 10 pts)
                        </span>
                    </div>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddEvaluacion}
                            className="btn-vercel-secondary text-xs px-3 py-1 flex items-center gap-1.5"
                        >
                            <Plus size={13} />
                            <span>Añadir Componente</span>
                        </button>
                    )}
                </div>

                <div className="p-4">
                    <div className="overflow-x-auto rounded-xl border border-border-thin">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="bg-bg-deep text-text-dim text-[10px] uppercase tracking-wider font-bold border-b border-border-thin">
                                    <th className="p-3 w-[25%] border-r border-border-thin">Notas</th>
                                    <th className="p-3 w-[55%] border-r border-border-thin">Tipo de Evaluación y Caracterización</th>
                                    <th className="p-3 w-[15%] text-center border-r border-border-thin">Calificación Máxima</th>
                                    {!readOnly && <th className="p-3 w-[5%] text-center">Acción</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-thin bg-surface">
                                {evaluaciones.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                        <td className="p-2.5 border-r border-border-thin font-semibold text-text-main">
                                            <input
                                                type="text"
                                                value={item.nota}
                                                onChange={(e) => handleUpdateEvaluacion(idx, 'nota', e.target.value)}
                                                disabled={readOnly}
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-bold text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin">
                                            <input
                                                type="text"
                                                value={item.tipo}
                                                onChange={(e) => handleUpdateEvaluacion(idx, 'tipo', e.target.value)}
                                                disabled={readOnly}
                                                className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main outline-none focus:border-brand"
                                            />
                                        </td>
                                        <td className="p-2.5 border-r border-border-thin text-center font-bold text-brand">
                                            <input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={item.calificacion}
                                                onChange={(e) => handleUpdateEvaluacion(idx, 'calificacion', Number(e.target.value) || 0)}
                                                disabled={readOnly}
                                                className="w-20 mx-auto text-center font-black text-brand bg-bg-deep border border-border-thin rounded-lg py-1.5 text-xs outline-none focus:border-brand"
                                            />
                                        </td>
                                        {!readOnly && (
                                            <td className="p-2.5 text-center">
                                                {evaluaciones.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEvaluacion(idx)}
                                                        className="p-1.5 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors"
                                                        title="Eliminar fila"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

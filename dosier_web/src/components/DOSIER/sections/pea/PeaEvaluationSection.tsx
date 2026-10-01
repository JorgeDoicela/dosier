import React from 'react';
import { BarChart3, Info, Plus, Trash2, Award } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

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

    const rawEvaluaciones: any[] = Array.isArray(formData?.Evaluaciones) ? formData.Evaluaciones : [];

    const defaultEvaluaciones: EvaluacionItem[] = [
        {
            nota: 'NOTA PARCIAL 1',
            tipo: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)',
            calificacion: 10
        },
        {
            nota: 'NOTA PARCIAL 2',
            tipo: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)',
            calificacion: 10
        },
        {
            nota: 'EVALUACIÓN FINAL',
            tipo: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)',
            calificacion: 10
        }
    ];

    const evaluaciones: EvaluacionItem[] = rawEvaluaciones.length > 0 ? rawEvaluaciones.map(e => ({
        nota: e.nota || e.Nota || e['0'] || 'NOTA PARCIAL',
        tipo: e.tipo || e.Tipo || e['1'] || 'EVALUACIÓN',
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
        <div className="w-full space-y-8 animate-fade-in font-sans">
            {/* POLÍTICAS Y CRITERIOS DE EVALUACIÓN */}
            <div className="space-y-3.5">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    Criterios y Políticas de Evaluación Continua
                </h4>

                <p className="text-xs text-text-dim leading-relaxed">
                    Describa las políticas pedagógicas: evaluación diagnóstica, formativa continua y sumativa, puntualidad y retroalimentación oportuna.
                </p>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="EvaluacionAprendizaje"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="Describa los criterios de evaluación:&#10;• La evaluación es sistemática y orientada al logro de los resultados de aprendizaje...&#10;• Todo trabajo entregado fuera de plazo tendrá penalización acordada...&#10;• Se garantiza el derecho a la recalificación según el RRA institucional..."
                        onChange={(html, meta) => onUpdate('EvaluacionAprendizaje', html, meta)}
                    />
                </div>
            </div>

            {/* MATRIZ OFICIAL DE CALIFICACIONES */}
            <div className="space-y-3.5 pt-2">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                        Matriz Oficial de Calificaciones ({evaluaciones.length})
                    </h4>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddEvaluacion}
                            className="px-3.5 sm:px-4 py-2 bg-surface hover:bg-bg-deep border border-border-thin rounded-xl text-xs sm:text-sm font-semibold text-text-main transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                        >
                            <Plus size={16} className="text-[#0070f3]" />
                            <span>Añadir Componente</span>
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto rounded-xl border border-border-thin bg-surface shadow-2xs">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                            <tr className="bg-bg-deep text-text-dim text-xs uppercase tracking-wider font-bold border-b border-border-thin">
                                <th className="p-3.5 sm:p-4 w-[25%] border-r border-border-thin">Notas</th>
                                <th className="p-3.5 sm:p-4 w-[55%] border-r border-border-thin">TIPO DE EVALUACIÓN</th>
                                <th className="p-3.5 sm:p-4 w-[15%] text-center border-r border-border-thin">CALIFICACIÓN</th>
                                {!readOnly && <th className="p-3.5 sm:p-4 w-[5%] text-center">Acción</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-thin bg-surface">
                            {evaluaciones.map((item, idx) => (
                                <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                    <td className="p-3 border-r border-border-thin font-semibold text-text-main">
                                        <input
                                            type="text"
                                            value={item.nota}
                                            onChange={(e) => handleUpdateEvaluacion(idx, 'nota', e.target.value)}
                                            disabled={readOnly}
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm font-bold text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin">
                                        <input
                                            type="text"
                                            value={item.tipo}
                                            onChange={(e) => handleUpdateEvaluacion(idx, 'tipo', e.target.value)}
                                            disabled={readOnly}
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    <td className="p-3 border-r border-border-thin text-center font-bold text-[#0070f3]">
                                        <input
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={item.calificacion}
                                            onChange={(e) => handleUpdateEvaluacion(idx, 'calificacion', Number(e.target.value) || 0)}
                                            disabled={readOnly}
                                            className="w-24 mx-auto text-center font-bold font-mono text-[#0070f3] bg-bg-deep border border-border-thin rounded-lg py-2 text-sm sm:text-base outline-none focus:border-[#0070f3]"
                                        />
                                    </td>
                                    {!readOnly && (
                                        <td className="p-3 text-center">
                                            {evaluaciones.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEvaluacion(idx)}
                                                    className="p-2 rounded-lg text-text-dim hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                                                    title="Eliminar fila"
                                                >
                                                    <Trash2 size={16} />
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
    );
};

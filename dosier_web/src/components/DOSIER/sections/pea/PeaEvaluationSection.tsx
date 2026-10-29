import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface EvaluacionItem {
    nota: string;
    tipo: string;
    calificacion: number;
}

interface PeaEvaluationSectionProps {
    formData: any;
    cowork?: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaEvaluationSection: React.FC<PeaEvaluationSectionProps> = ({
    formData,
    onUpdate,
    readOnly = false,
    config,
    onAdd,
    onRemove,
    onUpdateItem
}) => {
    const c = config || {};
    const colNotasLabel = c.colNotasLabel || 'Notas';
    const colTipoLabel = c.colTipoLabel || 'TIPO DE EVALUACIÓN';
    const colCalifLabel = c.colCalifLabel || 'CALIFICACION';

    const rawEvaluaciones: any[] = Array.isArray(formData?.Evaluaciones)
        ? formData.Evaluaciones
        : (Array.isArray(formData?.evaluaciones) ? formData.evaluaciones : []);

    const normalizeEvaluacion = (e: any, _idx: number): EvaluacionItem => {
        const nota = String(e?.nota ?? e?.Nota ?? e?.denominacion ?? e?.Denominacion ?? e?.['0'] ?? '').trim();
        const tipo = String(e?.tipo ?? e?.Tipo ?? e?.tipoEvaluacion ?? e?.TipoEvaluacion ?? e?.['1'] ?? '').trim();
        const rawCalif = e?.calificacion ?? e?.Calificacion ?? e?.calificacionMaxima ?? e?.CalificacionMaxima ?? e?.['2'];
        const calificacion = rawCalif !== undefined && rawCalif !== null && rawCalif !== '' ? Number(rawCalif) : 10;

        return {
            nota,
            tipo,
            calificacion: isNaN(calificacion) ? 10 : calificacion
        };
    };

    const evaluaciones: EvaluacionItem[] = rawEvaluaciones.map((e, idx) => normalizeEvaluacion(e, idx));

    const handleUpdateEvaluacion = (idx: number, field: keyof EvaluacionItem, value: any) => {
        if (readOnly) return;
        if (onUpdateItem) {
            onUpdateItem('Evaluaciones', idx, field, value);
        } else {
            const updated = evaluaciones.map((item, i) => i === idx ? { ...item, [field]: value } : item);
            onUpdate('Evaluaciones', updated);
        }
    };

    const handleAddEvaluacion = () => {
        if (readOnly) return;
        const newItem: EvaluacionItem = {
            nota: '',
            tipo: '',
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

    return (
        <div className="w-full space-y-4 sm:space-y-5 animate-fade-in font-sans">
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    i) Evaluación del Aprendizaje
                </h4>
            </div>

            {/* TABLA OFICIAL INSTITUCIONAL: MATRIZ DE CALIFICACIONES ISTPET */}
            <div className="overflow-x-auto rounded-xl border border-border-thin bg-surface shadow-2xs">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-bg-deep text-text-dim text-xs uppercase tracking-wider font-bold border-b border-border-thin">
                            <th className="p-3.5 sm:p-4 w-[24%] sm:w-[22%] border-r border-border-thin">
                                {colNotasLabel}
                            </th>
                            <th className="p-3.5 sm:p-4">
                                {colTipoLabel}
                            </th>
                            <th className="p-3.5 sm:p-4 w-[120px] text-center border-l border-border-thin">
                                {colCalifLabel}
                            </th>
                            {!readOnly && evaluaciones.length > 0 && (
                                <th className="p-3.5 sm:p-4 w-[60px] text-center border-l border-border-thin">
                                    Acción
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-thin bg-surface">
                        {evaluaciones.length === 0 ? (
                            <tr>
                                <td colSpan={readOnly ? 3 : 4} className="p-6 text-center text-xs text-text-dim italic">
                                    No se registran componentes de evaluación. {!readOnly && 'Haga clic en "+ Añadir Componente de Evaluación" para agregar uno.'}
                                </td>
                            </tr>
                        ) : (
                            evaluaciones.map((item, idx) => (
                                <tr key={idx} className="hover:bg-bg-deep/30 transition-colors">
                                    <td className="p-3 border-r border-border-thin align-top">
                                        <input
                                            type="text"
                                            value={item.nota}
                                            onChange={(e) => handleUpdateEvaluacion(idx, 'nota', e.target.value)}
                                            disabled={readOnly}
                                            placeholder="Denominación..."
                                            className="w-full bg-surface border border-border-thin rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-bold text-text-main uppercase outline-none focus:border-text-main transition-colors"
                                        />
                                    </td>
                                    <td className="p-3 align-top">
                                        <textarea
                                            value={item.tipo}
                                            onChange={(e) => handleUpdateEvaluacion(idx, 'tipo', e.target.value)}
                                            disabled={readOnly}
                                            rows={Math.max(2, (item.tipo || '').split('\n').length)}
                                            placeholder="Tipo de evaluación o actividad..."
                                            className="w-full bg-surface border border-border-thin rounded-xl p-3 text-xs sm:text-sm text-text-main uppercase outline-none focus:border-text-main resize-none transition-colors leading-relaxed"
                                        />
                                    </td>
                                    <td className="p-3 text-center align-top border-l border-border-thin">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={Number(item.calificacion ?? 10).toFixed(2).replace('.', ',')}
                                            onChange={(e) => {
                                                const rawVal = e.target.value.replace(',', '.');
                                                const num = parseFloat(rawVal);
                                                handleUpdateEvaluacion(idx, 'calificacion', isNaN(num) ? 0 : num);
                                            }}
                                            disabled={readOnly}
                                            className="w-20 mx-auto text-center font-bold font-mono text-sm sm:text-base text-text-main bg-surface border border-border-thin rounded-xl py-2 outline-none focus:border-text-main transition-colors"
                                        />
                                    </td>
                                    {!readOnly && (
                                        <td className="p-3 text-center align-top border-l border-border-thin">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEvaluacion(idx)}
                                                className="p-2 rounded-lg text-text-dim hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                title="Eliminar componente de evaluación"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* BOTÓN AL PIE DE LA TABLA (OPCIONAL PARA COMPONENTES ADICIONALES) */}
            {!readOnly && (
                <button
                    type="button"
                    onClick={handleAddEvaluacion}
                    className="w-full py-3 px-4 rounded-xl bg-surface hover:bg-bg-deep border border-dashed border-border-thin hover:border-[#0070f3] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                >
                    <Plus size={16} className="text-[#0070f3]" />
                    <span>Añadir Componente de Evaluación</span>
                </button>
            )}
        </div>
    );
};

import React, { useMemo } from 'react';
import { Layers, Plus, Trash2, CheckCircle2, AlertTriangle, Calculator, Clock, HelpCircle } from 'lucide-react';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface UnidadTematica {
    num?: number;
    titulo: string;
    horasCD: number;
    horasAPE: number;
    horasTA: number;
    horasTotal?: number;
    contenidos: string;
}

interface PeaContentsSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    onAdd?: (list: string, template: any) => void;
    onRemove?: (list: string, index: number) => void;
    onUpdateItem?: (list: string, index: number, field: string, value: any) => void;
}

export const PeaContentsSection: React.FC<PeaContentsSectionProps> = ({
    formData,
    onUpdate,
    readOnly = false,
    config,
    onAdd,
    onRemove,
    onUpdateItem
}) => {
    const c = config || {};
    const displayTitle = c.title || 'f) CONTENIDOS DE ENSEÑANZA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    // Horas normadas oficiales de la asignatura en SIGAFI / Malla
    const totalHorasOficial = Number(
        formData?.TotalHorasAsignatura ||
        formData?.total_horas_asignatura ||
        formData?.HorasTotales ||
        0
    );

    const rawUnidades: any[] = Array.isArray(formData?.Unidades) ? formData.Unidades : [];

    // Normalizar lista de unidades
    const unidades: UnidadTematica[] = useMemo(() => {
        if (rawUnidades.length === 0) {
            return [
                {
                    num: 1,
                    titulo: 'Fundamentos y Conceptos Clave',
                    horasCD: 16,
                    horasAPE: 8,
                    horasTA: 16,
                    horasTotal: 40,
                    contenidos: '1.1 Introducción y contextualización\n1.2 Principios teóricos y normativos\n1.3 Casos prácticos y aplicación inicial'
                }
            ];
        }

        return rawUnidades.map((u, idx) => {
            const cd = Number(u.horasCD ?? u.HorasCD ?? u.HorasDocencia ?? u['2'] ?? 0);
            const ape = Number(u.horasAPE ?? u.HorasAPE ?? u.HorasPractica ?? u['3'] ?? 0);
            const ta = Number(u.horasTA ?? u.HorasTA ?? u.HorasAutonomo ?? u['4'] ?? 0);
            const total = cd + ape + ta;

            let conts = u.contenidos ?? u.Contenidos ?? u['1'] ?? '';
            if (Array.isArray(conts)) {
                conts = conts.join('\n');
            }

            return {
                num: u.num || idx + 1,
                titulo: u.titulo || u.Titulo || u['0'] || `Unidad ${idx + 1}`,
                horasCD: cd,
                horasAPE: ape,
                horasTA: ta,
                horasTotal: total,
                contenidos: conts
            };
        });
    }, [rawUnidades]);

    // Sumatorias matemáticas en tiempo real
    const mathSummary = useMemo(() => {
        const sumCD = unidades.reduce((acc, u) => acc + (Number(u.horasCD) || 0), 0);
        const sumAPE = unidades.reduce((acc, u) => acc + (Number(u.horasAPE) || 0), 0);
        const sumTA = unidades.reduce((acc, u) => acc + (Number(u.horasTA) || 0), 0);
        const grandTotal = sumCD + sumAPE + sumTA;
        const diff = totalHorasOficial > 0 ? grandTotal - totalHorasOficial : 0;
        const isMatched = totalHorasOficial > 0 && grandTotal === totalHorasOficial;

        return {
            sumCD,
            sumAPE,
            sumTA,
            grandTotal,
            diff,
            isMatched
        };
    }, [unidades, totalHorasOficial]);

    const handleAddUnit = () => {
        if (readOnly) return;
        const newUnit: UnidadTematica = {
            num: unidades.length + 1,
            titulo: `Unidad ${unidades.length + 1}: Nueva Unidad Temática`,
            horasCD: 0,
            horasAPE: 0,
            horasTA: 0,
            horasTotal: 0,
            contenidos: '1. Tema principal\n2. Subtema de aplicación'
        };

        if (onAdd) {
            onAdd('Unidades', newUnit);
        } else {
            const updated = [...unidades, newUnit];
            onUpdate('Unidades', updated);
        }
    };

    const handleRemoveUnit = (idx: number) => {
        if (readOnly) return;
        if (onRemove) {
            onRemove('Unidades', idx);
        } else {
            const updated = unidades.filter((_, i) => i !== idx);
            onUpdate('Unidades', updated);
        }
    };

    const handleUpdateUnit = (idx: number, field: keyof UnidadTematica, value: any) => {
        if (readOnly) return;
        const updatedList = unidades.map((u, i) => {
            if (i !== idx) return u;
            const next = { ...u, [field]: value };
            if (field === 'horasCD' || field === 'horasAPE' || field === 'horasTA') {
                const cd = field === 'horasCD' ? Number(value) || 0 : u.horasCD;
                const ape = field === 'horasAPE' ? Number(value) || 0 : u.horasAPE;
                const ta = field === 'horasTA' ? Number(value) || 0 : u.horasTA;
                next.horasTotal = cd + ape + ta;
            }
            return next;
        });

        if (onUpdateItem) {
            onUpdateItem('Unidades', idx, field, value);
        } else {
            onUpdate('Unidades', updatedList);
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
                    <Layers className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Unidades Temáticas y Carga Horaria
                </span>
            </div>

            {/* VALIDADOR MATEMÁTICO EN TIEMPO REAL */}
            <div className="rounded-xl border border-border-thin bg-surface p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-brand" />
                        <span className="text-xs font-bold uppercase tracking-wider text-text-main">
                            Validador Matemático de Horas Curriculares (RRA Art. 21)
                        </span>
                    </div>
                    {totalHorasOficial > 0 && (
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-bg-deep text-text-dim border border-border-thin">
                            Oficial SIGAFI: {totalHorasOficial}h
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-bg-deep border border-border-thin">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider block">Total Docencia (CD)</span>
                        <span className="text-base font-black text-text-main">{mathSummary.sumCD}h</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bg-deep border border-border-thin">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider block">Total Prácticas (APE)</span>
                        <span className="text-base font-black text-text-main">{mathSummary.sumAPE}h</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-bg-deep border border-border-thin">
                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider block">Total Autónomo (TA)</span>
                        <span className="text-base font-black text-text-main">{mathSummary.sumTA}h</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-brand/10 border border-brand/20">
                        <span className="text-[9px] font-bold text-brand uppercase tracking-wider block">Total Planificado</span>
                        <span className="text-base font-black text-brand">{mathSummary.grandTotal}h</span>
                    </div>
                </div>

                {/* ALERTA DE CONCORDANCIA MATEMÁTICA */}
                {totalHorasOficial > 0 ? (
                    mathSummary.isMatched ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs">
                            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                            <span className="font-semibold">
                                ¡Balance horario exacto! La sumatoria de las unidades ({mathSummary.grandTotal}h) coincide perfectamente con las {totalHorasOficial} horas normadas en SIGAFI.
                            </span>
                        </div>
                    ) : mathSummary.diff < 0 ? (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs">
                            <AlertTriangle size={16} className="shrink-0 text-amber-500" />
                            <span>
                                <strong>Déficit de horas:</strong> Se han planificado {mathSummary.grandTotal}h de las {totalHorasOficial}h oficiales. Faltan <strong>{Math.abs(mathSummary.diff)} horas</strong> por distribuir en las unidades temáticas.
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs">
                            <AlertTriangle size={16} className="shrink-0 text-rose-500" />
                            <span>
                                <strong>Exceso de horas:</strong> La planificación actual ({mathSummary.grandTotal}h) supera por <strong>{mathSummary.diff} horas</strong> el total normado de {totalHorasOficial}h. Ajuste la carga en las unidades.
                            </span>
                        </div>
                    )
                ) : (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim">
                        <Clock size={14} className="text-brand shrink-0" />
                        <span>
                            Ingrese o sincronice las horas totales en los Datos Generales (Sección A) para habilitar la verificación automática de balance horario.
                        </span>
                    </div>
                )}
            </div>

            {/* LISTA DE UNIDADES TEMÁTICAS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide text-text-main">
                        Desglose de Unidades de Aprendizaje ({unidades.length})
                    </span>
                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddUnit}
                            className="btn-vercel-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
                        >
                            <Plus size={14} />
                            <span>Añadir Unidad Temática</span>
                        </button>
                    )}
                </div>

                {unidades.map((u, idx) => (
                    <div key={idx} className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                        {/* Cabecera de la Unidad */}
                        <div className="p-3.5 bg-bg-deep/70 border-b border-border-thin flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 flex-1">
                                <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-surface border border-border-thin text-brand shrink-0">
                                    U{idx + 1}
                                </span>
                                <input
                                    type="text"
                                    value={u.titulo}
                                    onChange={(e) => handleUpdateUnit(idx, 'titulo', e.target.value)}
                                    disabled={readOnly}
                                    placeholder={`Título de la Unidad ${idx + 1}`}
                                    className="w-full bg-surface border border-border-thin rounded-lg px-2.5 py-1 text-xs text-text-main font-bold outline-none focus:border-brand"
                                />
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[11px] font-mono font-bold text-text-dim bg-surface px-2 py-1 rounded border border-border-thin">
                                    Total: {u.horasTotal || 0}h
                                </span>
                                {!readOnly && unidades.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveUnit(idx)}
                                        className="p-1 rounded text-text-dim hover:text-error hover:bg-error/10 transition-colors"
                                        title="Eliminar unidad"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Distribución de Horas de la Unidad */}
                        <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                                        Contacto Docente (CD)
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={u.horasCD}
                                            onChange={(e) => handleUpdateUnit(idx, 'horasCD', Math.max(0, parseInt(e.target.value) || 0))}
                                            disabled={readOnly}
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-main outline-none focus:border-brand"
                                        />
                                        <span className="text-xs text-text-dim font-medium">h</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                                        Práctico Experimental (APE)
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={u.horasAPE}
                                            onChange={(e) => handleUpdateUnit(idx, 'horasAPE', Math.max(0, parseInt(e.target.value) || 0))}
                                            disabled={readOnly}
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-main outline-none focus:border-brand"
                                        />
                                        <span className="text-xs text-text-dim font-medium">h</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                                        Trabajo Autónomo (TA)
                                    </label>
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            type="number"
                                            min={0}
                                            value={u.horasTA}
                                            onChange={(e) => handleUpdateUnit(idx, 'horasTA', Math.max(0, parseInt(e.target.value) || 0))}
                                            disabled={readOnly}
                                            className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs font-semibold text-text-main outline-none focus:border-brand"
                                        />
                                        <span className="text-xs text-text-dim font-medium">h</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contenidos y Subtemas */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">
                                    Contenidos Temáticos y Subtemas (1 por línea)
                                </label>
                                <textarea
                                    value={u.contenidos}
                                    onChange={(e) => handleUpdateUnit(idx, 'contenidos', e.target.value)}
                                    disabled={readOnly}
                                    rows={4}
                                    placeholder="1.1 Título del subtema&#10;1.2 Descripción y actividades de aprendizaje&#10;1.3 Prácticas asociadas"
                                    className="w-full bg-bg-deep border border-border-thin rounded-lg p-2.5 text-xs text-text-main font-mono outline-none focus:border-brand resize-y leading-relaxed"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

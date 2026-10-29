import React, { useMemo } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { CoWorkHandle } from '../../../../core/cowork/types';

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
    const displayTitle = c.title || 'f) CONTENIDOS DE ENSEÑANZA:';

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
            return [];
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

            const unitNum = Number(u.num ?? u.Numero ?? u.NumeroUnidad) || idx + 1;
            const rawTit = String(u.titulo ?? u.Titulo ?? u.NombreUnidad ?? u['0'] ?? '').trim();
            let cleanTit = rawTit;
            // Si el valor era el genérico "Unidad 1" / "UNIDAD 1", limpiarlo para que no se duplique con el badge "UNIDAD 1:"
            if (new RegExp(`^unidad\\s*${unitNum}$`, 'i').test(rawTit)) {
                cleanTit = '';
            } else if (new RegExp(`^unidad\\s*${unitNum}\\s*[:\\-]?\\s*`, 'i').test(rawTit)) {
                cleanTit = rawTit.replace(new RegExp(`^unidad\\s*${unitNum}\\s*[:\\-]?\\s*`, 'i'), '').trim();
            }

            return {
                num: unitNum,
                titulo: cleanTit,
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
        const nextNum = unidades.length + 1;
        const newUnit: UnidadTematica = {
            num: nextNum,
            titulo: '', // Campo limpio para que el docente escriba el tema sin duplicar "Unidad X"
            horasCD: 0,
            horasAPE: 0,
            horasTA: 0,
            horasTotal: 0,
            contenidos: ''
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

        // Aseguramos que el payload contenga tanto el título limpio como el formato completo para PDF y motores documentales
        const payload = updatedList.map((u, i) => {
            const num = u.num || i + 1;
            const cleanTitle = (u.titulo || '').trim();
            const fullTitle = cleanTitle ? `UNIDAD ${num}: ${cleanTitle}` : `UNIDAD ${num}:`;
            return {
                ...u,
                num,
                numero: num,
                titulo: cleanTitle,
                nombre: cleanTitle,
                nombre_unidad: cleanTitle,
                titulo_completo: fullTitle,
                encabezado_unidad: fullTitle
            };
        });

        if (onUpdateItem) {
            onUpdateItem('Unidades', idx, field, value);
        } else {
            onUpdate('Unidades', payload);
        }
    };

    return (
        <div className="w-full space-y-6 sm:space-y-8 animate-fade-in font-sans">
            {/* 1. SECCIÓN DE UNIDADES DE ESTUDIO (SIN ANIDAMIENTO REDUNDANTE) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                        Unidades de Estudio y Contenidos ({unidades.length})
                    </h4>
                </div>

                {/* LISTA DIRECTA DE TARJETAS DE UNIDAD (CERO CUADRO DENTRO DE CUADRO) */}
                <div className="space-y-4 sm:space-y-5">
                    {unidades.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-border-thin rounded-2xl bg-surface">
                            <p className="text-sm font-semibold text-text-dim">
                                No se han registrado unidades temáticas. {!readOnly && 'Haga clic en "+ Añadir Unidad de Estudio" para comenzar.'}
                            </p>
                        </div>
                    ) : (
                        unidades.map((u, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden transition-all"
                            >
                                {/* CABECERA DE LA UNIDAD: TÍTULO Y TOTAL DE HORAS */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-thin px-4 sm:px-5 py-3 sm:py-3.5 bg-bg-deep text-text-main">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="shrink-0 font-bold text-text-main text-xs sm:text-sm uppercase tracking-wide">
                                            UNIDAD {u.num || idx + 1}:
                                        </span>
                                        <input
                                            type="text"
                                            value={u.titulo}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const num = u.num || idx + 1;
                                                const sanitized = val.replace(new RegExp(`^unidad\\s*${num}\\s*[:\\-]?\\s*`, 'i'), '');
                                                handleUpdateUnit(idx, 'titulo', sanitized);
                                            }}
                                            disabled={readOnly}
                                            placeholder={`Nombre o tema de la Unidad ${u.num || idx + 1}`}
                                            className="w-full bg-surface border border-border-thin rounded-xl px-3.5 py-2 text-sm sm:text-base font-semibold text-text-main outline-none focus:border-text-main transition-colors placeholder:text-text-dim/40 placeholder:font-normal"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                                        <span className="text-xs sm:text-sm font-medium text-text-dim">
                                            Total de horas por unidad: <strong className="font-mono text-text-main text-sm sm:text-base ml-1">{u.horasTotal || 0}</strong>
                                        </span>
                                        {!readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveUnit(idx)}
                                                className="p-2 rounded-lg text-text-dim hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                title="Eliminar esta unidad"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                            {/* DISTRIBUCIÓN HORARIA REGLAMENTARIA (3 COLUMNAS CON STEPPERS DISTINGUIDOS) */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border-thin divide-y sm:divide-y-0 sm:divide-x divide-border-thin bg-surface text-text-main">
                                {/* Horas contacto con el docente */}
                                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                                    <span className="font-semibold text-text-dim text-xs sm:text-sm">
                                        Horas contacto con el docente:
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-stretch bg-bg-deep border border-border-thin rounded-xl overflow-hidden focus-within:border-text-main transition-colors">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={u.horasCD}
                                                onFocus={(e) => e.currentTarget.select()}
                                                onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'ArrowUp') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasCD', (u.horasCD || 0) + 1);
                                                    } else if (e.key === 'ArrowDown') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasCD', Math.max(0, (u.horasCD || 0) - 1));
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '');
                                                    const clean = raw.length > 1 && raw.startsWith('0') ? raw.replace(/^0+/, '') || '0' : raw;
                                                    handleUpdateUnit(idx, 'horasCD', Math.max(0, parseInt(clean, 10) || 0));
                                                }}
                                                disabled={readOnly}
                                                className="w-14 sm:w-16 py-2 px-2 text-center font-bold font-mono text-sm sm:text-base text-text-main bg-transparent outline-none cursor-pointer"
                                            />
                                            {!readOnly && (
                                                <div className="flex flex-col border-l border-border-thin divide-y divide-border-thin bg-surface">
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasCD', (u.horasCD || 0) + 1)}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Aumentar hora"
                                                    >
                                                        <ChevronUp size={13} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasCD', Math.max(0, (u.horasCD || 0) - 1))}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Disminuir hora"
                                                    >
                                                        <ChevronDown size={13} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Horas Práctico-experimental */}
                                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                                    <span className="font-semibold text-text-dim text-xs sm:text-sm">
                                        Horas Práctico-experimental:
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-stretch bg-bg-deep border border-border-thin rounded-xl overflow-hidden focus-within:border-text-main transition-colors">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={u.horasAPE}
                                                onFocus={(e) => e.currentTarget.select()}
                                                onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'ArrowUp') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasAPE', (u.horasAPE || 0) + 1);
                                                    } else if (e.key === 'ArrowDown') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasAPE', Math.max(0, (u.horasAPE || 0) - 1));
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '');
                                                    const clean = raw.length > 1 && raw.startsWith('0') ? raw.replace(/^0+/, '') || '0' : raw;
                                                    handleUpdateUnit(idx, 'horasAPE', Math.max(0, parseInt(clean, 10) || 0));
                                                }}
                                                disabled={readOnly}
                                                className="w-14 sm:w-16 py-2 px-2 text-center font-bold font-mono text-sm sm:text-base text-text-main bg-transparent outline-none cursor-pointer"
                                            />
                                            {!readOnly && (
                                                <div className="flex flex-col border-l border-border-thin divide-y divide-border-thin bg-surface">
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasAPE', (u.horasAPE || 0) + 1)}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Aumentar hora"
                                                    >
                                                        <ChevronUp size={13} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasAPE', Math.max(0, (u.horasAPE || 0) - 1))}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Disminuir hora"
                                                    >
                                                        <ChevronDown size={13} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Horas de aprendizaje autónomo */}
                                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                                    <span className="font-semibold text-text-dim text-xs sm:text-sm">
                                        Horas de aprendizaje autónomo:
                                    </span>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="flex items-stretch bg-bg-deep border border-border-thin rounded-xl overflow-hidden focus-within:border-text-main transition-colors">
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={u.horasTA}
                                                onFocus={(e) => e.currentTarget.select()}
                                                onClick={(e) => (e.currentTarget as HTMLInputElement).select()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'ArrowUp') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasTA', (u.horasTA || 0) + 1);
                                                    } else if (e.key === 'ArrowDown') {
                                                        e.preventDefault();
                                                        handleUpdateUnit(idx, 'horasTA', Math.max(0, (u.horasTA || 0) - 1));
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const raw = e.target.value.replace(/\D/g, '');
                                                    const clean = raw.length > 1 && raw.startsWith('0') ? raw.replace(/^0+/, '') || '0' : raw;
                                                    handleUpdateUnit(idx, 'horasTA', Math.max(0, parseInt(clean, 10) || 0));
                                                }}
                                                disabled={readOnly}
                                                className="w-14 sm:w-16 py-2 px-2 text-center font-bold font-mono text-sm sm:text-base text-text-main bg-transparent outline-none cursor-pointer"
                                            />
                                            {!readOnly && (
                                                <div className="flex flex-col border-l border-border-thin divide-y divide-border-thin bg-surface">
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasTA', (u.horasTA || 0) + 1)}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Aumentar hora"
                                                    >
                                                        <ChevronUp size={13} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        tabIndex={-1}
                                                        onClick={() => handleUpdateUnit(idx, 'horasTA', Math.max(0, (u.horasTA || 0) - 1))}
                                                        className="px-1.5 py-0.5 hover:bg-bg-deep text-text-dim hover:text-text-main transition-colors cursor-pointer flex items-center justify-center h-1/2"
                                                        title="Disminuir hora"
                                                    >
                                                        <ChevronDown size={13} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CUERPO DE CONTENIDOS Y TEMAS */}
                            <div className="p-4 sm:p-5 bg-surface">
                                <div className="mb-2.5 flex items-center justify-between">
                                    <span className="text-xs sm:text-[13px] font-bold text-text-dim uppercase tracking-wider">
                                        Contenidos Temáticos y Subtemas (1 por línea):
                                    </span>
                                </div>
                                <textarea
                                    value={u.contenidos}
                                    onChange={(e) => handleUpdateUnit(idx, 'contenidos', e.target.value)}
                                    disabled={readOnly}
                                    rows={Math.max(5, (u.contenidos || '').split('\n').length + 1)}
                                    placeholder="1.1 Introducción y contextualización&#10;1.2 Principios teóricos y normativos&#10;1.3 Casos prácticos y aplicación inicial"
                                    className="w-full bg-bg-deep border border-border-thin rounded-xl p-4 text-sm sm:text-base font-sans text-text-main outline-none focus:border-text-main resize-none leading-relaxed transition-colors placeholder:text-text-dim/40"
                                />
                            </div>
                        </div>
                    ))
                )}

                    {!readOnly && (
                        <button
                            type="button"
                            onClick={handleAddUnit}
                            className="w-full py-3 px-4 rounded-xl bg-surface hover:bg-bg-deep border border-dashed border-border-thin hover:border-[#0070f3] flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-text-main transition-all cursor-pointer shadow-2xs"
                        >
                            <Plus size={16} className="text-[#0070f3]" />
                            <span>Añadir Unidad de Estudio</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 2. PANEL INDEPENDIENTE: ASISTENTE DE CÁLCULO Y BALANCE HORARIO */}
            <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep shadow-xs">
                {/* Encabezado del panel de balance */}
                <div className="px-4 sm:px-5 py-3 bg-bg-deep border-b border-border-thin">
                    <h5 className="text-xs sm:text-sm font-bold text-text-main tracking-tight">
                        Balance de horas por componente
                    </h5>
                    <p className="text-xs text-text-dim mt-0.5">
                        Verifica que la suma de las unidades coincida con la malla oficial.
                    </p>
                </div>

                {/* 3 Componentes en Grid horizontal sin cajas blancas que aparenten inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-thin bg-bg-deep">
                    {/* Componente 1: Contacto Docente */}
                    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <span className="text-xs sm:text-sm font-medium text-text-dim leading-tight">
                            Total horas de contacto docente:
                        </span>
                        <span className="font-bold font-mono text-sm sm:text-base text-text-main shrink-0">
                            {mathSummary.sumCD}h
                        </span>
                    </div>

                    {/* Componente 2: Práctico Experimental */}
                    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <span className="text-xs sm:text-sm font-medium text-text-dim leading-tight">
                            Total horas de práctico experimental:
                        </span>
                        <span className="font-bold font-mono text-sm sm:text-base text-text-main shrink-0">
                            {mathSummary.sumAPE}h
                        </span>
                    </div>

                    {/* Componente 3: Aprendizaje Autónomo */}
                    <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                        <span className="text-xs sm:text-sm font-medium text-text-dim leading-tight">
                            Total horas de aprendizaje autónomo:
                        </span>
                        <span className="font-bold font-mono text-sm sm:text-base text-text-main shrink-0">
                            {mathSummary.sumTA}h
                        </span>
                    </div>
                </div>

                {/* Fila Inferior Concisa y Legible */}
                {totalHorasOficial > 0 ? (
                    <div className={`px-4 py-3 sm:px-5 sm:py-3.5 border-t border-border-thin bg-bg-deep flex items-center gap-3 text-sm sm:text-base ${
                        mathSummary.isMatched
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : mathSummary.diff > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-amber-600 dark:text-amber-400'
                    }`}>
                        <span className="font-mono font-bold tracking-tight">
                            Total: {mathSummary.grandTotal} / {totalHorasOficial} hrs
                        </span>
                        <span className="opacity-50">·</span>
                        <span className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                mathSummary.isMatched
                                    ? 'bg-emerald-500'
                                    : mathSummary.diff > 0
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                            }`} />
                            <span>
                                {mathSummary.isMatched && 'Conforme'}
                                {mathSummary.diff > 0 && `Exceso de ${mathSummary.diff} ${mathSummary.diff === 1 ? 'hora' : 'horas'}`}
                                {mathSummary.diff < 0 && `Faltan ${Math.abs(mathSummary.diff)} ${Math.abs(mathSummary.diff) === 1 ? 'hora' : 'horas'} por asignar`}
                            </span>
                        </span>
                    </div>
                ) : (
                    <div className="px-4 py-2.5 border-t border-border-thin bg-bg-deep text-xs text-text-dim">
                        Total acumulado: {mathSummary.grandTotal} hrs
                    </div>
                )}
            </div>
        </div>
    );
};

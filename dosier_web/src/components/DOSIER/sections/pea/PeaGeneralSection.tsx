import React, { useState, useEffect } from 'react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { getPeriodosAcademicos, type PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

interface PeaGeneralSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaGeneralSection: React.FC<PeaGeneralSectionProps> = ({
    formData,
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const customFields: any[] = Array.isArray(c.customFields) ? c.customFields : [];

    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);

    useEffect(() => {
        let isMounted = true;
        getPeriodosAcademicos().then(list => {
            if (isMounted) setPeriodos(list || []);
        }).catch(() => {});
        return () => { isMounted = false; };
    }, []);

    // Auto-resolver código corto (ej. ABR2026) al nombre oficial de la BD (ej. ABRIL - SEPTIEMBRE 2026)
    useEffect(() => {
        const valActual = formData?.Periodo;
        if (!valActual || periodos.length === 0) return;

        const matched = periodos.find(p => p.id_periodo === valActual);
        if (matched && matched.detalle && matched.detalle !== valActual) {
            onUpdate('Periodo', matched.detalle);
        }
    }, [formData?.Periodo, periodos, onUpdate]);

    // Auto-resolver código de unidad (ej. BASICA) al nombre formal oficial (ej. Unidad Básica)
    useEffect(() => {
        const valActual = formData?.UnidadOrganizacion;
        if (!valActual) return;
        const upper = String(valActual).trim().toUpperCase();
        let normalized = valActual;
        if (upper === 'BASICA' || upper === 'BÁSICA') normalized = 'Unidad Básica';
        else if (upper === 'PROFESIONAL') normalized = 'Unidad Profesional';
        else if (upper === 'TITULACION' || upper === 'TITULACIÓN') normalized = 'Unidad de Integración Curricular';
        else if (upper === 'TRONCO COMUN' || upper === 'TRONCO COMÚN') normalized = 'Unidad Básica';

        if (normalized !== valActual) {
            onUpdate('UnidadOrganizacion', normalized);
        }
    }, [formData?.UnidadOrganizacion, onUpdate]);

    const labelAsignatura = c.customLabel_showAsignatura || 'Nombre de la asignatura';
    const labelCodigoCarrera = c.customLabel_showCodigoCarrera || 'Código de carrera';
    const labelCarrera = c.customLabel_showCarrera || 'Carrera';

    // Balance de carga horaria CACES / RRA Art. 21
    const totalHoras = Number(formData?.TotalHorasAsignatura ?? formData?.total_horas_asignatura ?? 0);
    const horasCd = Number(formData?.HorasContactoDocente ?? formData?.horas_contacto_docente ?? 0);
    const horasApe = Number(formData?.HorasPracticoExperimental ?? formData?.horas_practico_experimental ?? 0);
    const horasTa = Number(formData?.HorasAutonomo ?? formData?.horas_autonomo ?? 0);
    const sumaHoras = horasCd + horasApe + horasTa;
    const diffHoras = sumaHoras - totalHoras;
    const isHorasBalanced = totalHoras > 0 && sumaHoras === totalHoras;

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans">
            {/* 1. Nombre de la asignatura (Dato Maestro Oficial de SIGAFI / Malla) */}
            {c.showAsignatura !== false && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <CoWorkField
                        name="NombreAsignatura"
                        cowork={cowork}
                        type="text"
                        label={labelAsignatura}
                        placeholder="Nombre de la asignatura"
                        readOnly={true}
                        className="w-full bg-bg-deep border border-border-thin rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-5 text-sm sm:text-lg font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('NombreAsignatura', val)}
                    />
                </div>
            )}

            {/* 2. Código de carrera y 3. Carrera */}
            {c.showCarrera !== false && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                        <CoWorkField
                            name="CodigoCarrera"
                            cowork={cowork}
                            type="text"
                            label={labelCodigoCarrera}
                            placeholder="Código institucional (ej. GAS)"
                            readOnly={true}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-mono font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                            uppercase={true}
                            onValueChange={(val) => onUpdate('CodigoCarrera', val)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <CoWorkField
                            name="Carrera"
                            cowork={cowork}
                            type="text"
                            label={labelCarrera}
                            placeholder="Carrera institucional"
                            readOnly={true}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                            uppercase={true}
                            onValueChange={(val) => onUpdate('Carrera', val)}
                        />
                    </div>
                </div>
            )}

            {/* 4. Modalidad de estudio y 5. Unidad de Organización Curricular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {c.showModalidad !== false && (
                    <div>
                        <CoWorkField
                            name="Modalidad"
                            cowork={cowork}
                            type="select"
                            label="Modalidad de estudio"
                            options={[
                                { value: 'Presencial', label: 'Presencial' },
                                { value: 'Semipresencial', label: 'Semipresencial' },
                                { value: 'En Línea', label: 'En Línea' },
                                { value: 'Híbrida', label: 'Híbrida' },
                                { value: 'Dual', label: 'Dual' }
                            ]}
                            readOnly={true}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                            onValueChange={(val) => onUpdate('Modalidad', val)}
                        />
                    </div>
                )}
                {c.showUnidadOrg !== false && (
                    <div>
                        <CoWorkField
                            name="UnidadOrganizacion"
                            cowork={cowork}
                            type="select"
                            label="Unidad de Organización Curricular"
                            options={[
                                { value: 'Unidad Básica', label: 'Unidad Básica' },
                                { value: 'Unidad Profesional', label: 'Unidad Profesional' },
                                { value: 'Unidad de Integración Curricular', label: 'Unidad de Integración Curricular' }
                            ]}
                            readOnly={true}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                            onValueChange={(val) => onUpdate('UnidadOrganizacion', val)}
                        />
                    </div>
                )}
            </div>

            {/* 6. Periodo académico y 7. Semestre */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <CoWorkField
                        name="Periodo"
                        cowork={cowork}
                        type="text"
                        label="Periodo académico"
                        placeholder="Periodo académico activo"
                        readOnly={true}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                        onValueChange={(val) => onUpdate('Periodo', val)}
                    />
                </div>
                {c.showNivelModalidad !== false && (
                    <div>
                        <CoWorkField
                            name="Nivel"
                            cowork={cowork}
                            type="text"
                            label="Semestre"
                            placeholder="Semestre oficial"
                            readOnly={true}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                            uppercase={true}
                            onValueChange={(val) => onUpdate('Nivel', val)}
                        />
                    </div>
                )}
            </div>

            {/* 8. Número de horas de la asignatura y 9. Número de créditos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                    <CoWorkField
                        name="TotalHorasAsignatura"
                        cowork={cowork}
                        type="text"
                        label="Número de horas de la asignatura"
                        placeholder="0"
                        readOnly={true}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-mono font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                        onValueChange={(val) => onUpdate('TotalHorasAsignatura', Number(val) || 0)}
                    />
                </div>
                <div>
                    <CoWorkField
                        name="Creditos"
                        cowork={cowork}
                        type="text"
                        label="Número de créditos"
                        placeholder="0"
                        readOnly={true}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-mono font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                        onValueChange={(val) => onUpdate('Creditos', Number(val) || 0)}
                    />
                </div>
            </div>

            {/* Campos adicionales configurados si existieran */}
            {customFields.map((f: any) => {
                const fieldKey = f.fieldKey || f.id;
                return (
                    <div key={fieldKey} className="grid grid-cols-1 gap-4 sm:gap-6">
                        <CoWorkField
                            name={fieldKey}
                            cowork={cowork}
                            type="text"
                            label={f.label}
                            placeholder={f.placeholder || `Ingrese ${f.label}`}
                            readOnly={readOnly}
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                            onValueChange={(val) => onUpdate(fieldKey, val)}
                        />
                    </div>
                );
            })}

            {/* 10. Organización de aprendizajes por modalidad, número de horas destinadas a cada componente */}
            <div>
                <div className="rounded-xl border border-border-thin overflow-hidden bg-surface shadow-xs">
                    {/* Encabezado compacto sin SVG */}
                    <div className="px-4 py-2.5 bg-bg-deep/40 border-b border-border-thin">
                        <span className="text-[11px] sm:text-xs font-bold text-text-main tracking-tight uppercase leading-snug">
                            Organización de aprendizajes por modalidad, número de horas destinadas a cada componente
                        </span>
                    </div>

                    {/* 3 Componentes en Grid horizontal compacto */}
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-thin bg-surface">
                        {/* Componente 1: Contacto Docente */}
                        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-semibold text-text-main leading-tight">
                                Total horas de contacto docente:
                            </label>
                            <div className="w-20 sm:w-24 shrink-0">
                                <CoWorkField
                                    name="HorasContactoDocente"
                                    cowork={cowork}
                                    type="number"
                                    min={0}
                                    max={totalHoras > 0 ? totalHoras : 999}
                                    placeholder="0"
                                    readOnly={readOnly}
                                    className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3] select-all cursor-pointer"
                                    onValueChange={(val) => onUpdate('HorasContactoDocente', Math.max(0, parseInt(val, 10) || 0))}
                                />
                            </div>
                        </div>

                        {/* Componente 2: Práctico Experimental */}
                        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-semibold text-text-main leading-tight">
                                Total horas de práctico experimental:
                            </label>
                            <div className="w-20 sm:w-24 shrink-0">
                                <CoWorkField
                                    name="HorasPracticoExperimental"
                                    cowork={cowork}
                                    type="number"
                                    min={0}
                                    max={totalHoras > 0 ? totalHoras : 999}
                                    placeholder="0"
                                    readOnly={readOnly}
                                    className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3] select-all cursor-pointer"
                                    onValueChange={(val) => onUpdate('HorasPracticoExperimental', Math.max(0, parseInt(val, 10) || 0))}
                                />
                            </div>
                        </div>

                        {/* Componente 3: Aprendizaje Autónomo */}
                        <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-3">
                            <label className="text-xs sm:text-sm font-semibold text-text-main leading-tight">
                                Total horas de aprendizaje autónomo:
                            </label>
                            <div className="w-20 sm:w-24 shrink-0">
                                <CoWorkField
                                    name="HorasAutonomo"
                                    cowork={cowork}
                                    type="number"
                                    min={0}
                                    max={totalHoras > 0 ? totalHoras : 999}
                                    placeholder="0"
                                    readOnly={readOnly}
                                    className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3] select-all cursor-pointer"
                                    onValueChange={(val) => onUpdate('HorasAutonomo', Math.max(0, parseInt(val, 10) || 0))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Fila Inferior Concisa y Legible */}
                    {totalHoras > 0 && (
                        <div className={`px-4 py-3 sm:px-5 sm:py-3.5 border-t border-border-thin bg-surface flex items-center gap-3 text-sm sm:text-base ${
                                isHorasBalanced
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : diffHoras > 0
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-amber-600 dark:text-amber-400'
                            }`}>
                            <span className="font-mono font-bold tracking-tight">
                                Total: {sumaHoras} / {totalHoras} hrs
                            </span>
                            <span className="opacity-50">·</span>
                            <span className="text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                    isHorasBalanced
                                        ? 'bg-emerald-500'
                                        : diffHoras > 0
                                        ? 'bg-rose-500'
                                        : 'bg-amber-500'
                                }`} />
                                <span>
                                    {isHorasBalanced && 'Conforme'}
                                    {diffHoras > 0 && `Exceso de ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`}
                                    {diffHoras < 0 && `Faltan ${Math.abs(diffHoras)} ${Math.abs(diffHoras) === 1 ? 'hora' : 'horas'}`}
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

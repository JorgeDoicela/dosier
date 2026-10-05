import React from 'react';
import { Clock } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';

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
                                { value: 'BASICA', label: 'Unidad Básica' },
                                { value: 'Unidad Básica', label: 'Unidad Básica' },
                                { value: 'PROFESIONAL', label: 'Unidad Profesional' },
                                { value: 'Unidad Profesional', label: 'Unidad Profesional' },
                                { value: 'TITULACION', label: 'Unidad de Integración Curricular' },
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
            <div className="pt-2 border-t border-border-thin space-y-3">
                <div className="rounded-xl border border-border-thin overflow-hidden bg-surface shadow-xs">
                    <div className="flex flex-col md:flex-row">
                        {/* Celda Izquierda Oficial: Texto Descriptivo */}
                        <div className="w-full md:w-5/12 p-4 sm:p-5 bg-bg-deep/40 border-b md:border-b-0 md:border-r border-border-thin flex flex-col justify-center">
                            <div className="flex items-center gap-2.5">
                                <Clock className="w-4 h-4 text-[#0070f3] shrink-0" />
                                <span className="text-[11px] sm:text-xs font-bold text-text-main tracking-tight uppercase leading-snug">
                                    Organización de aprendizajes por modalidad, número de horas destinadas a cada componente
                                </span>
                            </div>
                        </div>

                        {/* Celda Derecha Oficial: 3 Filas Horizontales Idénticas al Formato Oficial */}
                        <div className="w-full md:w-7/12 divide-y divide-border-thin bg-surface">
                            {/* Fila 1: Contacto Docente */}
                            <div className="p-3 sm:p-4 flex items-center justify-between gap-4">
                                <label className="text-xs sm:text-sm font-semibold text-text-main">
                                    Total horas de contacto docente:
                                </label>
                                <div className="w-24 sm:w-32 shrink-0">
                                    <CoWorkField
                                        name="HorasContactoDocente"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3]"
                                        onValueChange={(val) => onUpdate('HorasContactoDocente', Number(val) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Fila 2: Práctico Experimental */}
                            <div className="p-3 sm:p-4 flex items-center justify-between gap-4">
                                <label className="text-xs sm:text-sm font-semibold text-text-main">
                                    Total horas de práctico experimental:
                                </label>
                                <div className="w-24 sm:w-32 shrink-0">
                                    <CoWorkField
                                        name="HorasPracticoExperimental"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3]"
                                        onValueChange={(val) => onUpdate('HorasPracticoExperimental', Number(val) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Fila 3: Aprendizaje Autónomo */}
                            <div className="p-3 sm:p-4 flex items-center justify-between gap-4">
                                <label className="text-xs sm:text-sm font-semibold text-text-main">
                                    Total horas de aprendizaje autónomo:
                                </label>
                                <div className="w-24 sm:w-32 shrink-0">
                                    <CoWorkField
                                        name="HorasAutonomo"
                                        cowork={cowork}
                                        type="text"
                                        placeholder="0"
                                        readOnly={readOnly}
                                        className="w-full text-center font-bold font-mono text-xs sm:text-sm text-text-main bg-bg-deep border border-border-thin rounded-lg py-2 outline-none focus:border-[#0070f3]"
                                        onValueChange={(val) => onUpdate('HorasAutonomo', Number(val) || 0)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fila Inferior Completa: Total, Balance y Recomendaciones Claras */}
                    {totalHoras > 0 && (
                        <div className={`px-4 py-3 sm:px-5 sm:py-3.5 border-t border-border-thin flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                            isHorasBalanced
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                                : diffHoras > 0
                                ? 'bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-300'
                                : 'bg-amber-50/80 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300'
                        }`}>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs border ${
                                    isHorasBalanced
                                        ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100'
                                        : diffHoras > 0
                                        ? 'bg-rose-100 dark:bg-rose-900/60 border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-100'
                                        : 'bg-amber-100 dark:bg-amber-900/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100'
                                }`}>
                                    Total: {sumaHoras} / {totalHoras} hrs
                                </span>

                                <span className="text-xs font-medium">
                                    {isHorasBalanced && (
                                        <>Distribución horaria conforme. Cumple exactamente con las {totalHoras} horas de la malla.</>
                                    )}
                                    {diffHoras > 0 && (
                                        <>
                                            Exceso de <strong>{diffHoras} {diffHoras === 1 ? 'hora' : 'horas'}</strong>. 
                                            Recomendación: Reduce {diffHoras}h en Contacto Docente, Práctico o Autónomo para cuadrar.
                                        </>
                                    )}
                                    {diffHoras < 0 && (
                                        <>
                                            Faltan <strong>{Math.abs(diffHoras)} {Math.abs(diffHoras) === 1 ? 'hora' : 'horas'}</strong> por asignar. 
                                            Recomendación: Distribuye las {Math.abs(diffHoras)}h restantes en los componentes.
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[11px] text-text-dim shrink-0 self-end md:self-auto">
                                <span>CD: <strong className="text-text-main">{horasCd}h</strong></span>
                                <span>·</span>
                                <span>APE: <strong className="text-text-main">{horasApe}h</strong></span>
                                <span>·</span>
                                <span>TA: <strong className="text-text-main">{horasTa}h</strong></span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

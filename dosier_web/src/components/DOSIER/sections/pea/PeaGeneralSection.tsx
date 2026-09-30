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
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const customFields: any[] = Array.isArray(c.customFields) ? c.customFields : [];

    return (
        <div className="w-full space-y-5 sm:space-y-6 animate-fade-in font-sans">
            {/* Nombre de la Asignatura */}
            {c.showAsignatura !== false && (
                <div>
                    <CoWorkField
                        name="NombreAsignatura"
                        cowork={cowork}
                        type="text"
                        label={c.customLabel_showAsignatura || 'Nombre de la Asignatura'}
                        placeholder="Nombre de la asignatura (ej. Técnicas de Cocina Contemporánea)"
                        readOnly={readOnly}
                        className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-text-main focus:border-[#0070f3] outline-none transition-all uppercase shadow-2xs"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('NombreAsignatura', val)}
                    />
                </div>
            )}

            {/* Código de la Asignatura */}
            {c.showCarrera !== false && (
                <div>
                    <CoWorkField
                        name="CodigoAsignatura"
                        cowork={cowork}
                        type="text"
                        label="Código de la Asignatura"
                        placeholder="Código normado (ej. DS-301)"
                        readOnly={readOnly}
                        className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-mono font-bold text-text-main focus:border-[#0070f3] outline-none transition-all uppercase shadow-2xs"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('CodigoAsignatura', val)}
                    />
                </div>
            )}

            {/* Carrera Institucional */}
            {c.showCarrera !== false && (
                <div>
                    <CoWorkField
                        name="Carrera"
                        cowork={cowork}
                        type="text"
                        label={c.customLabel_showCarrera || 'Carrera Institucional'}
                        placeholder="Carrera a la que pertenece"
                        readOnly={readOnly}
                        className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                        onValueChange={(val) => onUpdate('Carrera', val)}
                    />
                </div>
            )}

            {/* Semestre y Modalidad */}
            {c.showNivelModalidad !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <CoWorkField
                            name="Nivel"
                            cowork={cowork}
                            type="text"
                            label="Semestre / Nivel"
                            placeholder="Ej. Cuarto Semestre"
                            readOnly={readOnly}
                            className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                            onValueChange={(val) => onUpdate('Nivel', val)}
                        />
                    </div>
                    <div>
                        <CoWorkField
                            name="Modalidad"
                            cowork={cowork}
                            type="select"
                            label="Modalidad de Estudio"
                            options={[
                                { value: 'Presencial', label: 'Presencial' },
                                { value: 'Semipresencial', label: 'Semipresencial' },
                                { value: 'En Línea', label: 'En Línea' },
                                { value: 'Híbrida', label: 'Híbrida' },
                                { value: 'Dual', label: 'Dual' }
                            ]}
                            readOnly={readOnly}
                            className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                            onValueChange={(val) => onUpdate('Modalidad', val)}
                        />
                    </div>
                </div>
            )}

            {/* Unidad de Organización Curricular y Período Académico */}
            {c.showUnidadOrg !== false && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                            readOnly={readOnly}
                            className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                            onValueChange={(val) => onUpdate('UnidadOrganizacion', val)}
                        />
                    </div>
                    <div>
                        <CoWorkField
                            name="Periodo"
                            cowork={cowork}
                            type="text"
                            label="Período Académico"
                            placeholder="Ej. OCTUBRE 2025 - MARZO 2026"
                            readOnly={readOnly}
                            className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                            onValueChange={(val) => onUpdate('Periodo', val)}
                        />
                    </div>
                </div>
            )}

            {/* Docente Responsable */}
            {c.showDocente !== false && (
                <div>
                    <CoWorkField
                        name="DocenteElaborador"
                        cowork={cowork}
                        type="text"
                        label="Docente Responsable de la Asignatura"
                        placeholder="Nombre del docente titular responsable"
                        readOnly={readOnly}
                        className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-text-main focus:border-[#0070f3] outline-none transition-all uppercase shadow-2xs"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('DocenteElaborador', val)}
                    />
                </div>
            )}

            {/* Custom fields configurados */}
            {customFields.map((f: any) => {
                const fieldKey = f.fieldKey || f.id;
                return (
                    <div key={fieldKey}>
                        <CoWorkField
                            name={fieldKey}
                            cowork={cowork}
                            type="text"
                            label={f.label}
                            placeholder={f.placeholder || `Ingrese ${f.label}`}
                            readOnly={readOnly}
                            className="w-full bg-surface border border-border-thin rounded-xl px-4 py-3 text-xs sm:text-sm text-text-main focus:border-[#0070f3] outline-none transition-all shadow-2xs"
                            onValueChange={(val) => onUpdate(fieldKey, val)}
                        />
                    </div>
                );
            })}

            {/* ── Sub-Bloque de Carga Horaria Normada (Estilo DIITRA) ── */}
            <div className="pt-4 border-t border-border-thin/80 space-y-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#0070f3]" />
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        Organización de Aprendizajes y Carga Horaria
                    </span>
                    <span className="text-[10px] font-mono text-text-dim uppercase tracking-wider ml-auto">
                        RRA Art. 21
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                            Contacto Docente (CD)
                        </label>
                        <CoWorkField
                            name="HorasContactoDocente"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold text-text-main bg-surface border border-border-thin rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:border-[#0070f3] shadow-2xs"
                            onValueChange={(val) => onUpdate('HorasContactoDocente', Number(val) || 0)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                            Práctico Exp. (APE)
                        </label>
                        <CoWorkField
                            name="HorasPracticoExperimental"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold text-text-main bg-surface border border-border-thin rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:border-[#0070f3] shadow-2xs"
                            onValueChange={(val) => onUpdate('HorasPracticoExperimental', Number(val) || 0)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                            Autónomo (TA)
                        </label>
                        <CoWorkField
                            name="HorasAutonomo"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold text-text-main bg-surface border border-border-thin rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:border-[#0070f3] shadow-2xs"
                            onValueChange={(val) => onUpdate('HorasAutonomo', Number(val) || 0)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                            Total Horas Asignatura
                        </label>
                        <CoWorkField
                            name="TotalHorasAsignatura"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-black text-text-main bg-surface border border-border-thin rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:border-[#0070f3] shadow-2xs"
                            onValueChange={(val) => onUpdate('TotalHorasAsignatura', Number(val) || 0)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider mb-1.5">
                            Número de Créditos
                        </label>
                        <CoWorkField
                            name="Creditos"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-black text-text-main bg-surface border border-border-thin rounded-xl py-2.5 text-xs sm:text-sm outline-none focus:border-[#0070f3] shadow-2xs"
                            onValueChange={(val) => onUpdate('Creditos', Number(val) || 0)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

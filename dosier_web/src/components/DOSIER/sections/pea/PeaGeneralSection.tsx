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

    const labelAsignatura = c.customLabel_showAsignatura || 'Nombre de la Asignatura';
    const labelCodigo = 'Código de la Asignatura';
    const labelCarrera = c.customLabel_showCarrera || 'Carrera Institucional';
    const labelDocente = 'Docente Responsable de la Asignatura';

    return (
        <div className="space-y-6 sm:space-y-8 animate-fade-in font-sans">
            {/* Nombre de la Asignatura (Título principal de la sección estilo DIITRA) */}
            {c.showAsignatura !== false && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <CoWorkField
                        name="NombreAsignatura"
                        cowork={cowork}
                        type="text"
                        label={labelAsignatura}
                        placeholder="Nombre de la asignatura (ej. Técnicas de Cocina Contemporánea)"
                        readOnly={readOnly}
                        className="w-full bg-bg-deep border border-border-thin rounded-xl sm:rounded-2xl px-4 py-3 sm:px-6 sm:py-5 text-sm sm:text-lg font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('NombreAsignatura', val)}
                    />
                </div>
            )}

            {/* Código de la Asignatura */}
            {c.showCarrera !== false && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <CoWorkField
                        name="CodigoAsignatura"
                        cowork={cowork}
                        type="text"
                        label={labelCodigo}
                        placeholder="Código normado (ej. GAS-01-005)"
                        readOnly={readOnly}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-2.5 sm:px-5 sm:py-3.5 text-xs sm:text-sm font-mono font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('CodigoAsignatura', val)}
                    />
                </div>
            )}

            {/* Carrera Institucional */}
            {c.showCarrera !== false && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <CoWorkField
                        name="Carrera"
                        cowork={cowork}
                        type="text"
                        label={labelCarrera}
                        placeholder="Carrera a la que pertenece"
                        readOnly={readOnly}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                        onValueChange={(val) => onUpdate('Carrera', val)}
                    />
                </div>
            )}

            {/* Semestre / Nivel y Modalidad de Estudio */}
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
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
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
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
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
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
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
                            className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all"
                            onValueChange={(val) => onUpdate('Periodo', val)}
                        />
                    </div>
                </div>
            )}

            {/* Docente Responsable de la Asignatura */}
            {c.showDocente !== false && (
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    <CoWorkField
                        name="DocenteElaborador"
                        cowork={cowork}
                        type="text"
                        label={labelDocente}
                        placeholder="Nombre del docente titular responsable"
                        readOnly={readOnly}
                        className="w-full bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl px-3.5 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-bold text-text-main placeholder:text-text-dim/30 focus:border-text-main outline-none transition-all uppercase"
                        uppercase={true}
                        onValueChange={(val) => onUpdate('DocenteElaborador', val)}
                    />
                </div>
            )}

            {/* Campos adicionales configurados */}
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

            {/* ── Sub-Bloque de Carga Horaria Normada (Estilo DIITRA Puro sin Caja Contenedora) ── */}
            <div className="pt-2 border-t border-border-thin space-y-3">
                <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-text-dim" />
                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">
                        Organización de Aprendizajes y Carga Horaria (Horas normadas RRA Art. 21)
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider ml-2 mb-1.5 sm:mb-2">
                            Contacto Docente (CD)
                        </label>
                        <CoWorkField
                            name="HorasContactoDocente"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold font-mono text-text-main bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl py-3 text-xs sm:text-sm outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('HorasContactoDocente', Number(val) || 0)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider ml-2 mb-1.5 sm:mb-2">
                            Práctico Exp. (APE)
                        </label>
                        <CoWorkField
                            name="HorasPracticoExperimental"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold font-mono text-text-main bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl py-3 text-xs sm:text-sm outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('HorasPracticoExperimental', Number(val) || 0)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider ml-2 mb-1.5 sm:mb-2">
                            Autónomo (TA)
                        </label>
                        <CoWorkField
                            name="HorasAutonomo"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold font-mono text-text-main bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl py-3 text-xs sm:text-sm outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('HorasAutonomo', Number(val) || 0)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider ml-2 mb-1.5 sm:mb-2">
                            Total Horas
                        </label>
                        <CoWorkField
                            name="TotalHorasAsignatura"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold font-mono text-text-main bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl py-3 text-xs sm:text-sm outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('TotalHorasAsignatura', Number(val) || 0)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-text-dim uppercase tracking-wider ml-2 mb-1.5 sm:mb-2">
                            Créditos
                        </label>
                        <CoWorkField
                            name="Creditos"
                            cowork={cowork}
                            type="text"
                            placeholder="0"
                            readOnly={readOnly}
                            className="w-full text-center font-bold font-mono text-text-main bg-bg-deep border border-border-thin rounded-lg sm:rounded-xl py-3 text-xs sm:text-sm outline-none focus:border-text-main"
                            onValueChange={(val) => onUpdate('Creditos', Number(val) || 0)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

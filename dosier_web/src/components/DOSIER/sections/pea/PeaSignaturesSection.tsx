import React from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaSignaturesSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
    canSign?: boolean;
}

export const PeaSignaturesSection: React.FC<PeaSignaturesSectionProps> = ({
    formData,
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const displayTitle = c.title || 'k) FIRMAS DE RESPONSABILIDAD';

    const firmas = formData?.FirmasResponsabilidad || {};

    const updateFirma = (cargoKey: string, value: any) => {
        onUpdate('FirmasResponsabilidad', {
            ...(formData?.FirmasResponsabilidad || {}),
            [cargoKey]: value
        });
    };

    const rolesCircuito = [
        {
            key: 'Docente',
            etiqueta: 'ELABORADO:',
            cargo: 'Docente',
            nombreField: 'DocenteNombre',
            fechaField: 'DocenteFecha',
            firmado: Boolean(firmas.DocenteFirmado || firmas.docente_firmado),
            placeholder: formData?.DocenteElaborador || 'Nombre del Docente'
        },
        {
            key: 'CoordinadorCarrera',
            etiqueta: 'REVISADO:',
            cargo: 'Coordinador de Carrera',
            nombreField: 'CoordinadorNombre',
            fechaField: 'CoordinadorFecha',
            firmado: Boolean(firmas.CoordinadorFirmado || firmas.coordinador_firmado),
            placeholder: 'Nombre del Coordinador de Carrera'
        },
        {
            key: 'CoordinadorAcad',
            etiqueta: 'REVISADO:',
            cargo: 'Coordinador Académico',
            nombreField: 'CoordinadorAcadNombre',
            fechaField: 'CoordinadorAcadFecha',
            firmado: Boolean(firmas.CoordinadorAcadFirmado || firmas.coordinador_acad_firmado),
            placeholder: 'Nombre Coordinador Académico'
        },
        {
            key: 'Vicerrector',
            etiqueta: 'APROBADO:',
            cargo: 'Vicerrectorado',
            nombreField: 'VicerrectorNombre',
            fechaField: 'VicerrectorFecha',
            firmado: Boolean(firmas.VicerrectorFirmado || firmas.vicerrector_firmado),
            placeholder: 'Nombre Vicerrector/a'
        }
    ];

    return (
        <div className="w-full space-y-4 sm:space-y-5 animate-fade-in font-sans">
            {/* AVISO NORMATIVO */}
            <div className="flex items-start gap-2.5 p-3.5 sm:p-4 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs text-text-dim">
                <Shield size={16} className="text-[#0070f3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Las firmas consignadas en este instrumento curricular certifican la conformidad con los lineamientos del Consejo de Aseguramiento de la Calidad de la Educación Superior (CACES) y el Reglamento de Régimen Académico del ISTPET.
                </p>
            </div>

            {/* MATRIZ DE 4 FIRMAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rolesCircuito.map((rol) => {
                    const fechaFirma = firmas[rol.fechaField] || '';

                    return (
                        <div
                            key={rol.key}
                            className="rounded-xl border border-border-thin bg-surface p-4 flex flex-col justify-between shadow-xs space-y-4 hover:border-brand/30 transition-colors"
                        >
                            {/* Rol y Estado */}
                            <div className="border-b border-slate-200/90 dark:border-zinc-800 pb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-main">
                                    {rol.etiqueta}
                                </span>
                                {rol.firmado ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Firmado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                        Pendiente
                                    </span>
                                )}
                            </div>

                            {/* Área de Sello / Firma */}
                            <div className="py-2 text-center">
                                {rol.firmado ? (
                                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1">
                                        <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">
                                            Firma Electrónica Válida
                                        </span>
                                        {fechaFirma && (
                                            <span className="text-[9px] text-text-dim font-mono block">
                                                {fechaFirma}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 rounded-lg bg-bg-deep/50 border border-dashed border-border-thin text-center space-y-1">
                                        <UserCheck size={20} className="mx-auto text-text-dim opacity-50" />
                                        <span className="text-[10px] text-text-dim font-medium block">
                                            Sello de Firma Electrónica
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Nombre del Responsable */}
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-text-dim uppercase tracking-wider block">
                                    Nombres y Título:
                                </label>
                                <CoWorkField
                                    name={`Firmas_${rol.nombreField}`}
                                    cowork={cowork}
                                    type="text"
                                    placeholder={rol.placeholder}
                                    readOnly={readOnly || rol.firmado}
                                    className="w-full bg-bg-deep border border-border-thin rounded-lg px-2.5 py-1.5 text-xs text-text-main font-semibold outline-none focus:border-brand"
                                    onValueChange={(val) => updateFirma(rol.nombreField, val)}
                                />
                            </div>

                            {/* Cargo Institucional */}
                            <div className="border-t border-border-thin pt-2 text-center">
                                <span className="text-[10px] font-bold text-text-main block">
                                    {rol.cargo}
                                </span>
                                <span className="text-[9px] text-text-dim block mt-0.5">
                                    ISTPET
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

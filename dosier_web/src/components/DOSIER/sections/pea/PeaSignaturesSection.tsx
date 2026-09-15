import React from 'react';
import { ShieldCheck, CheckCircle2, Clock, UserCheck, Shield } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

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
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

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
            cargo: 'Docente Responsable',
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
            cargo: 'Coordinación Académica',
            nombreField: 'CoordinadorAcadNombre',
            fechaField: 'CoordinadorAcadFecha',
            firmado: Boolean(firmas.CoordinadorAcadFirmado || firmas.coordinador_acad_firmado),
            placeholder: 'Nombre Coordinación Académica'
        },
        {
            key: 'Vicerrector',
            etiqueta: 'APROBADO:',
            cargo: 'Vicerrectorado Académico',
            nombreField: 'VicerrectorNombre',
            fechaField: 'VicerrectorFecha',
            firmado: Boolean(firmas.VicerrectorFirmado || firmas.vicerrector_firmado),
            placeholder: 'Nombre Vicerrector/a Académico/a'
        }
    ];

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Circuito Institucional de Validación
                </span>
            </div>

            {/* AVISO NORMATIVO */}
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border-thin shadow-xs text-xs text-text-dim">
                <Shield size={16} className="text-brand shrink-0" />
                <p className="leading-relaxed">
                    Las firmas consignadas en este instrumento curricular certifican la conformidad con los lineamientos del Consejo de Aseguramiento de la Calidad de la Educación Superior (CACES) y el Reglamento de Régimen Académico del ISTPET.
                </p>
            </div>

            {/* MATRIZ DE 4 FIRMAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {rolesCircuito.map((rol) => {
                    const currentNombre = firmas[rol.nombreField] || '';
                    const fechaFirma = firmas[rol.fechaField] || '';

                    return (
                        <div
                            key={rol.key}
                            className="rounded-xl border border-border-thin bg-surface p-4 flex flex-col justify-between shadow-xs space-y-4 hover:border-brand/30 transition-colors"
                        >
                            {/* Rol y Estado */}
                            <div className="border-b border-border-thin pb-2 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-text-main">
                                    {rol.etiqueta}
                                </span>
                                {rol.firmado ? (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <CheckCircle2 size={11} /> Firmado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-medium text-text-dim bg-bg-deep px-2 py-0.5 rounded-full">
                                        <Clock size={11} /> Pendiente
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

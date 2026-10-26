import React, { useEffect, useRef } from 'react';
import { ShieldCheck, CheckCircle2, UserCheck, Shield } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import usersService from '../../../../services/usersService';

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
    const displayTitle = c.title || 'k) Firmas de Responsabilidad';

    const firmas = formData?.FirmasResponsabilidad || {};
    const hasAutoSyncedRef = useRef(false);

    // Sincronización y autoguardado inteligente según datos oficiales del sistema
    useEffect(() => {
        let isMounted = true;

        const autoCompletarAutoridades = async () => {
            try {
                const fActual = formData?.FirmasResponsabilidad || {};
                const faltaDocente = !fActual.DocenteNombre && Boolean(formData?.DocenteElaborador || formData?.docente);
                const faltaCoord = !fActual.CoordinadorNombre;
                const faltaCoordAcad = !fActual.CoordinadorAcadNombre;
                const faltaVicerrector = !fActual.VicerrectorNombre;

                // Si ya están todos los nombres completos o ya se autoguardaron, evitar consultas innecesarias
                if (!faltaDocente && !faltaCoord && !faltaCoordAcad && !faltaVicerrector) {
                    return;
                }

                if (hasAutoSyncedRef.current) return;
                hasAutoSyncedRef.current = true;

                // Fallbacks defensivos inmediatos de datos inyectados en formData
                let coordCarreraNombre = formData?.CoordinadorCarrera || formData?.coordinador_carrera || formData?.nombre_coordinador_carrera || '';
                let coordAcadNombre = formData?.CoordinadorAcademico || formData?.coordinador_academico || formData?.nombre_coordinador_academico || '';
                let vicerrectorNombre = formData?.Vicerrector || formData?.vicerrector || formData?.nombre_vicerrector || '';

                const periodo = formData?.IdPeriodo || formData?.id_periodo;
                const gobernanza = await usersService.getGobernanzaCarreras(periodo).catch(() => null);
                if (!isMounted) return;

                if (gobernanza) {
                    vicerrectorNombre = vicerrectorNombre || gobernanza.vicerrector?.nombre_completo || (gobernanza.vicerrector as any)?.nombreCompleto || '';
                    coordAcadNombre = coordAcadNombre || gobernanza.coordinador_academico?.nombre_completo || (gobernanza.coordinador_academico as any)?.nombreCompleto || '';

                    const idCarrera = formData?.IdCarrera || formData?.id_carrera;
                    const carreraTexto = String(formData?.Carrera || formData?.carrera || '').toLowerCase().trim();

                    const carreraMatch = (gobernanza.carreras || []).find((c: any) =>
                        (idCarrera && Number(c.id_carrera) === Number(idCarrera)) ||
                        (carreraTexto && (c.carrera || '').toLowerCase().trim().includes(carreraTexto)) ||
                        (carreraTexto && carreraTexto.includes((c.carrera || '').toLowerCase().trim()))
                    );

                    coordCarreraNombre = coordCarreraNombre || carreraMatch?.coordinador?.nombre_completo || (carreraMatch?.coordinador as any)?.nombreCompleto || '';
                }

                const docNombre = fActual.DocenteNombre || formData?.DocenteElaborador || formData?.docente || '';

                const firmasActualizadas = {
                    ...fActual,
                    DocenteNombre: fActual.DocenteNombre || docNombre,
                    DocenteCargo: fActual.DocenteCargo || 'Docente',
                    CoordinadorNombre: fActual.CoordinadorNombre || coordCarreraNombre,
                    CoordinadorCargo: fActual.CoordinadorCargo || 'Coordinador de Carrera',
                    CoordinadorAcadNombre: fActual.CoordinadorAcadNombre || coordAcadNombre,
                    CoordinadorAcadCargo: fActual.CoordinadorAcadCargo || 'Coordinador Académico',
                    VicerrectorNombre: fActual.VicerrectorNombre || vicerrectorNombre,
                    VicerrectorCargo: fActual.VicerrectorCargo || 'Vicerrectorado'
                };

                // Sembrado directo en Yjs para que los CoWorkField individuales se actualicen en vivo
                if (cowork?.ydoc) {
                    cowork.ydoc.transact(() => {
                        const pairs: [string, string][] = [
                            ['Firmas_DocenteNombre', firmasActualizadas.DocenteNombre],
                            ['Firmas_CoordinadorNombre', firmasActualizadas.CoordinadorNombre],
                            ['Firmas_CoordinadorAcadNombre', firmasActualizadas.CoordinadorAcadNombre],
                            ['Firmas_VicerrectorNombre', firmasActualizadas.VicerrectorNombre]
                        ];
                        for (const [key, val] of pairs) {
                            if (val && String(val).trim() !== '') {
                                const ytext = cowork.ydoc.getText(key);
                                if (ytext.toString().trim() === '') {
                                    ytext.delete(0, ytext.length);
                                    ytext.insert(0, val);
                                }
                            }
                        }
                    }, 'auto-autoridades');
                }

                const huboCambios =
                    firmasActualizadas.DocenteNombre !== fActual.DocenteNombre ||
                    firmasActualizadas.CoordinadorNombre !== fActual.CoordinadorNombre ||
                    firmasActualizadas.CoordinadorAcadNombre !== fActual.CoordinadorAcadNombre ||
                    firmasActualizadas.VicerrectorNombre !== fActual.VicerrectorNombre;

                if (huboCambios) {
                    onUpdate('FirmasResponsabilidad', firmasActualizadas);
                    if (firmasActualizadas.DocenteNombre) onUpdate('Firmas_DocenteNombre', firmasActualizadas.DocenteNombre);
                    if (firmasActualizadas.CoordinadorNombre) onUpdate('Firmas_CoordinadorNombre', firmasActualizadas.CoordinadorNombre);
                    if (firmasActualizadas.CoordinadorAcadNombre) onUpdate('Firmas_CoordinadorAcadNombre', firmasActualizadas.CoordinadorAcadNombre);
                    if (firmasActualizadas.VicerrectorNombre) onUpdate('Firmas_VicerrectorNombre', firmasActualizadas.VicerrectorNombre);
                }
            } catch (err) {
                hasAutoSyncedRef.current = false;
                console.warn('[DOSIER] No se pudieron sincronizar las autoridades del sistema:', err);
            }
        };

        autoCompletarAutoridades();
        return () => { isMounted = false; };
    }, [formData?.IdPeriodo, formData?.id_periodo, formData?.IdCarrera, formData?.id_carrera, formData?.Carrera, formData?.carrera, formData?.DocenteElaborador, formData?.docente, formData?.CoordinadorCarrera, formData?.CoordinadorAcademico, formData?.Vicerrector, onUpdate, cowork]);

    const updateFirma = (cargoKey: string, value: any) => {
        onUpdate('FirmasResponsabilidad', {
            ...(formData?.FirmasResponsabilidad || {}),
            [cargoKey]: value
        });
        onUpdate(`Firmas_${cargoKey}`, value);
    };

    const rolesCircuito = [
        {
            key: 'Docente',
            etiqueta: 'ELABORADO:',
            cargo: 'Docente',
            nombreField: 'DocenteNombre',
            fechaField: 'DocenteFecha',
            firmado: Boolean(firmas.DocenteFirmado || firmas.docente_firmado),
            placeholder: formData?.DocenteElaborador || formData?.docente || 'Nombre del Docente'
        },
        {
            key: 'CoordinadorCarrera',
            etiqueta: 'REVISADO:',
            cargo: 'Coordinador de Carrera',
            nombreField: 'CoordinadorNombre',
            fechaField: 'CoordinadorFecha',
            firmado: Boolean(firmas.CoordinadorFirmado || firmas.coordinador_firmado),
            placeholder: formData?.CoordinadorCarrera || formData?.coordinador_carrera || 'Nombre del Coordinador de Carrera'
        },
        {
            key: 'CoordinadorAcad',
            etiqueta: 'REVISADO:',
            cargo: 'Coordinador Académico',
            nombreField: 'CoordinadorAcadNombre',
            fechaField: 'CoordinadorAcadFecha',
            firmado: Boolean(firmas.CoordinadorAcadFirmado || firmas.coordinador_acad_firmado),
            placeholder: formData?.CoordinadorAcademico || formData?.coordinador_academico || 'Nombre Coordinador Académico'
        },
        {
            key: 'Vicerrector',
            etiqueta: 'APROBADO:',
            cargo: 'Vicerrectorado',
            nombreField: 'VicerrectorNombre',
            fechaField: 'VicerrectorFecha',
            firmado: Boolean(firmas.VicerrectorFirmado || firmas.vicerrector_firmado),
            placeholder: formData?.Vicerrector || formData?.vicerrector || 'Nombre Vicerrector/a'
        }
    ];

    return (
        <div className="w-full space-y-6 sm:space-y-7 animate-fade-in font-sans">
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    {displayTitle}
                </h4>
            </div>
            {/* AVISO NORMATIVO */}
            <div className="flex items-start gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim">
                <Shield size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Las firmas consignadas en este instrumento curricular certifican la conformidad con los lineamientos del Consejo de Aseguramiento de la Calidad de la Educación Superior (CACES) y el Reglamento de Régimen Académico del ISTPET.
                </p>
            </div>

            {/* MATRIZ DE 4 FIRMAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {rolesCircuito.map((rol) => {
                    const fechaFirma = firmas[rol.fechaField] || '';

                    return (
                        <div
                            key={rol.key}
                            className="rounded-xl border border-border-thin bg-surface p-4 sm:p-5 flex flex-col justify-between shadow-xs space-y-4 sm:space-y-5 hover:border-brand/30 transition-colors"
                        >
                            {/* Rol y Estado */}
                            <div className="border-b border-slate-200/90 dark:border-zinc-800 pb-2.5 flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-main">
                                    {rol.etiqueta}
                                </span>
                                {rol.firmado ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Firmado
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-dim">
                                        <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                        Pendiente
                                    </span>
                                )}
                            </div>

                            {/* Área de Sello / Firma */}
                            <div className="py-2 text-center">
                                {rol.firmado ? (
                                    <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1.5">
                                        <CheckCircle2 size={28} className="mx-auto text-emerald-500" />
                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                                            Firma Electrónica Válida
                                        </span>
                                        {fechaFirma && (
                                            <span className="text-[11px] text-text-dim font-mono block">
                                                {fechaFirma}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-5 sm:p-6 rounded-xl bg-bg-deep/50 border border-dashed border-border-thin text-center space-y-1.5">
                                        <UserCheck size={24} className="mx-auto text-text-dim opacity-50" />
                                        <span className="text-xs text-text-dim font-medium block">
                                            Sello de Firma Electrónica
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Nombre del Responsable */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-dim uppercase tracking-wider block">
                                    Nombres y Título:
                                </label>
                                <CoWorkField
                                    name={`Firmas_${rol.nombreField}`}
                                    cowork={cowork}
                                    type="text"
                                    placeholder={rol.placeholder}
                                    readOnly={readOnly || rol.firmado}
                                    className="w-full bg-bg-deep border border-border-thin rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main font-semibold outline-none focus:border-[#0070f3]"
                                    onValueChange={(val) => updateFirma(rol.nombreField, val)}
                                />
                            </div>

                            {/* Cargo Institucional */}
                            <div className="border-t border-border-thin pt-2.5 text-center">
                                <span className="text-xs sm:text-sm font-bold text-text-main block">
                                    {rol.cargo}
                                </span>
                                <span className="text-[11px] text-text-dim block mt-0.5">
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

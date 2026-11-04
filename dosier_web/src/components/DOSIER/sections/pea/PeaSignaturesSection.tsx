import React, { useEffect, useRef, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
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
    const isSyncingRef = useRef(false);

    // Sincronización continua de autoridades según datos oficiales de gobernanza institucional
    const sincronizarAutoridades = useCallback(async (forzar = false) => {
        try {
            const fActual = formData?.FirmasResponsabilidad || {};
            const isDocenteFirmado = Boolean(fActual.DocenteFirmado || fActual.docente_firmado);
            const isCoordFirmado = Boolean(fActual.CoordinadorFirmado || fActual.coordinador_firmado);
            const isCoordAcadFirmado = Boolean(fActual.CoordinadorAcadFirmado || fActual.coordinador_acad_firmado);
            const isVicerrectorFirmado = Boolean(fActual.VicerrectorFirmado || fActual.vicerrector_firmado);

            // Si no se fuerza y ya están todos los nombres completos o ya se autoguardaron, evitar consultas redundantes
            if (!forzar && !(!fActual.DocenteNombre) && !(!fActual.CoordinadorNombre) && !(!fActual.CoordinadorAcadNombre) && !(!fActual.VicerrectorNombre)) {
                return;
            }

            if (isSyncingRef.current) return;
            if (!forzar && hasAutoSyncedRef.current) return;
            hasAutoSyncedRef.current = true;
            isSyncingRef.current = true;

            // 1. Fallbacks defensivos inmediatos de datos inyectados en formData
            let coordCarreraNombre = formData?.CoordinadorCarrera || formData?.coordinador_carrera || formData?.nombre_coordinador_carrera || '';
            let coordAcadNombre = formData?.CoordinadorAcademico || formData?.coordinador_academico || formData?.nombre_coordinador_academico || '';
            let vicerrectorNombre = formData?.Vicerrector || formData?.vicerrector || formData?.nombre_vicerrector || '';

            // 2. Consulta en vivo al árbol de gobernanza curricular del periodo
            const periodo = formData?.IdPeriodo || formData?.id_periodo;
            const gobernanza = await usersService.getGobernanzaCarreras(periodo).catch(() => null);

            if (gobernanza) {
                vicerrectorNombre = gobernanza.vicerrector?.nombre_completo || (gobernanza.vicerrector as any)?.nombreCompleto || vicerrectorNombre;
                coordAcadNombre = gobernanza.coordinador_academico?.nombre_completo || (gobernanza.coordinador_academico as any)?.nombreCompleto || coordAcadNombre;

                const idCarrera = formData?.IdCarrera || formData?.id_carrera;
                const carreraTexto = String(formData?.Carrera || formData?.carrera || '').toLowerCase().trim();

                const carreraMatch = (gobernanza.carreras || []).find((c: any) =>
                    (idCarrera && Number(c.id_carrera) === Number(idCarrera)) ||
                    (carreraTexto && (c.carrera || '').toLowerCase().trim().includes(carreraTexto)) ||
                    (carreraTexto && carreraTexto.includes((c.carrera || '').toLowerCase().trim()))
                );

                coordCarreraNombre = carreraMatch?.coordinador?.nombre_completo || (carreraMatch?.coordinador as any)?.nombreCompleto || coordCarreraNombre;
            }

            const docNombre = fActual.DocenteNombre || formData?.DocenteElaborador || formData?.docente || '';

            // 3. Regla de inmutabilidad jurídica: Las firmas ya emitidas jamás se sobreescriben; las no firmadas se actualizan a la autoridad vigente
            const firmasActualizadas = {
                ...fActual,
                DocenteNombre: isDocenteFirmado ? fActual.DocenteNombre : (fActual.DocenteNombre || docNombre),
                DocenteCargo: fActual.DocenteCargo || 'Docente',
                CoordinadorNombre: isCoordFirmado ? fActual.CoordinadorNombre : (coordCarreraNombre || fActual.CoordinadorNombre || ''),
                CoordinadorCargo: fActual.CoordinadorCargo || 'Coordinador de Carrera',
                CoordinadorAcadNombre: isCoordAcadFirmado ? fActual.CoordinadorAcadNombre : (coordAcadNombre || fActual.CoordinadorAcadNombre || ''),
                CoordinadorAcadCargo: fActual.CoordinadorAcadCargo || 'Coordinador Académico',
                VicerrectorNombre: isVicerrectorFirmado ? fActual.VicerrectorNombre : (vicerrectorNombre || fActual.VicerrectorNombre || ''),
                VicerrectorCargo: fActual.VicerrectorCargo || 'Vicerrectorado'
            };

            // 4. Sembrado reactivo directo en Yjs para sincronización instantánea en CoWorkField
            if (cowork?.ydoc) {
                cowork.ydoc.transact(() => {
                    const pairs: [string, string, boolean][] = [
                        ['Firmas_DocenteNombre', firmasActualizadas.DocenteNombre, isDocenteFirmado],
                        ['Firmas_CoordinadorNombre', firmasActualizadas.CoordinadorNombre, isCoordFirmado],
                        ['Firmas_CoordinadorAcadNombre', firmasActualizadas.CoordinadorAcadNombre, isCoordAcadFirmado],
                        ['Firmas_VicerrectorNombre', firmasActualizadas.VicerrectorNombre, isVicerrectorFirmado]
                    ];
                    for (const [key, val, firmado] of pairs) {
                        if (!firmado && val && String(val).trim() !== '') {
                            const ytext = cowork.ydoc.getText(key);
                            if (ytext.toString().trim() !== val) {
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
        } finally {
            isSyncingRef.current = false;
        }
    }, [formData?.FirmasResponsabilidad, formData?.DocenteElaborador, formData?.docente, formData?.CoordinadorCarrera, formData?.coordinador_carrera, formData?.nombre_coordinador_carrera, formData?.CoordinadorAcademico, formData?.coordinador_academico, formData?.nombre_coordinador_academico, formData?.Vicerrector, formData?.vicerrector, formData?.nombre_vicerrector, formData?.IdPeriodo, formData?.id_periodo, formData?.IdCarrera, formData?.id_carrera, formData?.Carrera, formData?.carrera, onUpdate, cowork]);

    // Ejecución inicial al montar
    useEffect(() => {
        sincronizarAutoridades(false);
    }, [sincronizarAutoridades]);

    // Sincronización autónoma silenciosa en segundo plano:
    // 1. Al recuperar foco o visibilidad de pestaña (ej. tras asignar autoridades en otra vista)
    // 2. Al recibir eventos reactivos de SignalR (dosier-projects-changed)
    useEffect(() => {
        const handleSilentSync = () => {
            const f = formData?.FirmasResponsabilidad || {};
            const faltaAlguna = !f.CoordinadorNombre || !f.CoordinadorAcadNombre || !f.VicerrectorNombre;
            sincronizarAutoridades(faltaAlguna);
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                handleSilentSync();
            }
        };

        window.addEventListener('focus', handleSilentSync);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('dosier-projects-changed', handleSilentSync);

        return () => {
            window.removeEventListener('focus', handleSilentSync);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('dosier-projects-changed', handleSilentSync);
        };
    }, [sincronizarAutoridades, formData?.FirmasResponsabilidad]);

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
            <div>
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    {displayTitle}
                </h4>
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

                            {/* Espacio Ampliado para Firma y Sellos */}
                            <div className="py-1">
                                {rol.firmado ? (
                                    <div className="min-h-[95px] p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-1.5">
                                        <CheckCircle2 size={24} className="mx-auto text-emerald-500" />
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
                                    <div className="min-h-[95px] p-3.5 sm:p-4 rounded-xl border border-dashed border-slate-300 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center justify-center text-center space-y-1">
                                        <span className="text-xs font-mono font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                                            Espacio para Firma y Sellos
                                        </span>
                                        <span className="text-[10px] text-slate-400 dark:text-zinc-600 block">
                                            Certificado Digital / FirmaEC
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
                                    className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main font-semibold outline-none bg-surface border-border-thin focus:border-[#0070f3] transition-all"
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

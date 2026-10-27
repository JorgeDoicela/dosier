import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CheckCircle2, ShieldAlert, Pencil } from 'lucide-react';
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
    const [unlockedFields, setUnlockedFields] = useState<Record<string, boolean>>({});
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        rolKey: string;
        etiqueta: string;
        cargo: string;
        nombreField: string;
        valorActual: string;
        valorInstitucional: string;
    } | null>(null);
    const [modalNombreInput, setModalNombreInput] = useState('');

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

    const handleRequestUnlock = (rolKey: string, etiqueta: string, cargo: string, nombreField: string, valorInstitucional = '') => {
        if (readOnly) return;
        const currentVal = firmas[nombreField] || '';
        setModalNombreInput(currentVal || valorInstitucional);
        setConfirmModal({
            open: true,
            rolKey,
            etiqueta,
            cargo,
            nombreField,
            valorActual: currentVal,
            valorInstitucional
        });
    };

    const handleSaveFromModal = () => {
        if (!confirmModal) return;
        const nuevoNombre = modalNombreInput.trim();
        updateFirma(confirmModal.nombreField, nuevoNombre);

        if (cowork?.ydoc) {
            cowork.ydoc.transact(() => {
                const ytext = cowork.ydoc.getText(`Firmas_${confirmModal.nombreField}`);
                if (ytext.toString() !== nuevoNombre) {
                    ytext.delete(0, ytext.length);
                    ytext.insert(0, nuevoNombre);
                }
            }, 'manual-autoridad-modal');
        }

        setConfirmModal(null);
    };

    const handleResetToInstitucional = () => {
        if (!confirmModal) return;
        setModalNombreInput(confirmModal.valorInstitucional);
    };

    const handleLockField = (rolKey: string) => {
        setUnlockedFields(prev => ({ ...prev, [rolKey]: false }));
    };

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
                    const isUnlocked = Boolean(unlockedFields[rol.key]);
                    const isFieldReadOnly = readOnly || rol.firmado || !isUnlocked;

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

                            {/* Sello de Firma si ya fue emitido */}
                            {rol.firmado && (
                                <div className="py-1 text-center">
                                    <div className="p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center space-y-1.5">
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
                                </div>
                            )}

                            {/* Nombre del Responsable */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-text-dim uppercase tracking-wider block">
                                        Nombres y Título:
                                    </label>
                                    {!rol.firmado && !readOnly && (
                                        <button
                                            type="button"
                                            onClick={() => handleRequestUnlock(rol.key, rol.etiqueta, rol.cargo, rol.nombreField, rol.placeholder)}
                                            className="text-[11px] font-semibold text-[#0070f3] hover:text-[#005bb5] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                            title="Cambiar autoridad para este documento"
                                        >
                                            <Pencil size={11} strokeWidth={1.75} />
                                            Modificar
                                        </button>
                                    )}
                                </div>

                                <div className="relative">
                                    <CoWorkField
                                        name={`Firmas_${rol.nombreField}`}
                                        cowork={cowork}
                                        type="text"
                                        placeholder={rol.placeholder}
                                        readOnly={true}
                                        className="w-full border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main font-semibold outline-none bg-bg-deep/70 border-border-thin cursor-pointer select-none transition-all"
                                        onValueChange={(val) => updateFirma(rol.nombreField, val)}
                                    />
                                    {!rol.firmado && !readOnly && (
                                        <div
                                            onClick={() => handleRequestUnlock(rol.key, rol.etiqueta, rol.cargo, rol.nombreField, rol.placeholder)}
                                            className="absolute inset-0 cursor-pointer z-10"
                                            title="Clic para modificar autoridad en este documento"
                                        />
                                    )}
                                </div>
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

            {/* MODAL DE EDICIÓN DE AUTORIDAD */}
            {confirmModal && confirmModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in">
                    <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-4 animate-scale-in">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-[#0070f3] dark:text-blue-400 shrink-0">
                                <ShieldAlert size={20} strokeWidth={1.75} />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-sm font-bold text-text-main">
                                    Modificar Autoridad
                                </h3>
                                <p className="text-xs text-text-dim">
                                    {confirmModal.cargo}
                                </p>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-bg-deep border border-border-thin text-xs text-text-main leading-relaxed space-y-1">
                            <p className="font-medium">
                                Este cambio <span className="font-bold text-[#0070f3]">solo afectará a este documento</span>.
                            </p>
                            <p className="text-[11px] text-text-dim leading-relaxed">
                                No modificará la asignación central de la carrera en el sistema institucional.
                            </p>
                        </div>

                        {/* Campo de edición */}
                        <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-text-main">
                                    Nombre y Título del Responsable:
                                </label>
                                {confirmModal.valorInstitucional && modalNombreInput.trim() !== confirmModal.valorInstitucional.trim() && (
                                    <button
                                        type="button"
                                        onClick={handleResetToInstitucional}
                                        className="text-[11px] font-medium text-[#0070f3] hover:underline cursor-pointer"
                                    >
                                        Restablecer oficial
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={modalNombreInput}
                                onChange={(e) => setModalNombreInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveFromModal();
                                    }
                                }}
                                autoFocus
                                placeholder="Ingrese nombres y apellidos completos..."
                                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-text-main font-semibold outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/20 transition-all"
                            />
                            {confirmModal.valorInstitucional && (
                                <p className="text-[11px] text-text-dim">
                                    Oficial institucional: <span className="font-medium text-text-main">{confirmModal.valorInstitucional}</span>
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-2">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(null)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-text-dim hover:text-text-main hover:bg-bg-deep border border-border-thin transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveFromModal}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors shadow-xs cursor-pointer"
                            >
                                Guardar en este documento
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

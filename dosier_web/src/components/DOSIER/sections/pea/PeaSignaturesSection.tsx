import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { CoWorkField } from '../../../../core/cowork/components/CoWorkField';
import { GeistDatePicker } from '../../../../components/Common/GeistDatePicker';
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

const getFechaActualFormat = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}/${month}/${year}`;
};

export const PeaSignaturesSection: React.FC<PeaSignaturesSectionProps> = ({
    formData,
    cowork,
    onUpdate,
    readOnly = false
}) => {
    const firmas = formData?.FirmasResponsabilidad || {};
    const hasAutoSyncedRef = useRef(false);
    const isSyncingRef = useRef(false);
    const [unlockedFields, setUnlockedFields] = useState<Record<string, boolean>>({});
    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        rolKey: string;
        etiqueta: string;
        cargo: string;
        targetField: string;
        tipo: 'nombre' | 'fecha';
    } | null>(null);

    const handleRequestUnlock = (
        rolKey: string,
        etiqueta: string,
        cargo: string,
        targetField: string,
        tipo: 'nombre' | 'fecha' = 'nombre'
    ) => {
        if (readOnly) return;
        setConfirmModal({
            open: true,
            rolKey,
            etiqueta,
            cargo,
            targetField,
            tipo
        });
    };

    const handleConfirmUnlock = () => {
        if (!confirmModal) return;
        const { rolKey, targetField, tipo } = confirmModal;
        const fieldKey = tipo === 'fecha' ? `${rolKey}_fecha` : rolKey;
        // Solo un campo desbloqueado a la vez
        setUnlockedFields({ [fieldKey]: true });
        setConfirmModal(null);
        setTimeout(() => {
            if (tipo === 'fecha') {
                const card = document.querySelector(`[data-editable-field="${rolKey}_fecha"]`);
                const input = card?.querySelector<HTMLInputElement>('input');
                if (input) {
                    input.click();
                }
            } else {
                const input = document.querySelector<HTMLInputElement>(`input[name="Firmas_${targetField}"]`);
                if (input) {
                    input.focus();
                    input.select();
                }
            }
        }, 50);
    };

    const handleLockField = useCallback((key: string) => {
        setUnlockedFields(prev => {
            if (!prev[key]) return prev;
            const updated = { ...prev };
            delete updated[key];
            return updated;
        });
    }, []);

    // Detección reactiva de clics exteriores para cerrar automáticamente la edición
    useEffect(() => {
        const hayDesbloqueados = Object.values(unlockedFields).some(Boolean);
        if (!hayDesbloqueados) return;

        const handleOutsideClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;

            // Ignorar clics en el diálogo modal de confirmación
            if (target.closest('[data-confirm-modal]')) {
                return;
            }

            // Para cada campo en edición, si el clic fue fuera de su contenedor, bloquearlo
            Object.entries(unlockedFields).forEach(([fieldKey, isUnlocked]) => {
                if (!isUnlocked) return;
                const container = document.querySelector(`[data-editable-field="${fieldKey}"]`);
                if (container && !container.contains(target)) {
                    handleLockField(fieldKey);
                }
            });
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [unlockedFields, handleLockField]);

    // Sincronización continua de autoridades según datos oficiales de gobernanza institucional
    const sincronizarAutoridades = useCallback(async (forzar = false) => {
        try {
            const fActual = formData?.FirmasResponsabilidad || {};
            const isDocenteFirmado = Boolean(fActual.DocenteFirmado || fActual.docente_firmado);
            const isCoordFirmado = Boolean(fActual.CoordinadorFirmado || fActual.coordinador_firmado);
            const isCoordAcadFirmado = Boolean(fActual.CoordinadorAcadFirmado || fActual.coordinador_acad_firmado);
            const isVicerrectorFirmado = Boolean(fActual.VicerrectorFirmado || fActual.vicerrector_firmado);

            const faltaFechaDocente = !fActual.DocenteFecha || String(fActual.DocenteFecha).trim() === '';

            // Si no se fuerza y ya están todos los nombres completos y la fecha de docente definida, evitar consultas redundantes
            if (!forzar && !faltaFechaDocente && !(!fActual.DocenteNombre) && !(!fActual.CoordinadorNombre) && !(!fActual.CoordinadorAcadNombre) && !(!fActual.VicerrectorNombre)) {
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

            // Resolución dinámica de fecha de elaboración (por defecto hoy en formato DD/MM/AAAA)
            const fechaActual = getFechaActualFormat();
            let docFecha = fActual.DocenteFecha || fActual.docente_fecha;
            if (!docFecha || String(docFecha).trim() === '') {
                if (formData?.FechaElaborado || formData?.fecha_elaborado) {
                    const raw = String(formData?.FechaElaborado || formData?.fecha_elaborado);
                    if (raw.includes('T') || raw.includes('-')) {
                        const d = new Date(raw);
                        if (!isNaN(d.getTime())) {
                            const day = String(d.getDate()).padStart(2, '0');
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            docFecha = `${day}/${month}/${d.getFullYear()}`;
                        } else {
                            docFecha = fechaActual;
                        }
                    } else {
                        docFecha = raw;
                    }
                } else {
                    docFecha = fechaActual;
                }
            }

            // 3. Regla de inmutabilidad jurídica: Las firmas ya emitidas jamás se sobreescriben; las no firmadas se actualizan a la autoridad vigente
            const firmasActualizadas = {
                ...fActual,
                DocenteNombre: isDocenteFirmado ? fActual.DocenteNombre : (fActual.DocenteNombre || docNombre),
                DocenteCargo: fActual.DocenteCargo || 'Docente',
                DocenteFecha: isDocenteFirmado ? (fActual.DocenteFecha || docFecha) : docFecha,
                CoordinadorNombre: isCoordFirmado ? fActual.CoordinadorNombre : (coordCarreraNombre || fActual.CoordinadorNombre || ''),
                CoordinadorCargo: fActual.CoordinadorCargo || 'Coordinador de Carrera',
                CoordinadorFecha: fActual.CoordinadorFecha || '',
                CoordinadorAcadNombre: isCoordAcadFirmado ? fActual.CoordinadorAcadNombre : (coordAcadNombre || fActual.CoordinadorAcadNombre || ''),
                CoordinadorAcadCargo: fActual.CoordinadorAcadCargo || 'Coordinador Académico',
                CoordinadorAcadFecha: fActual.CoordinadorAcadFecha || '',
                VicerrectorNombre: isVicerrectorFirmado ? fActual.VicerrectorNombre : (vicerrectorNombre || fActual.VicerrectorNombre || ''),
                VicerrectorCargo: fActual.VicerrectorCargo || 'Vicerrectorado',
                VicerrectorFecha: fActual.VicerrectorFecha || ''
            };

            // 4. Sembrado reactivo directo en Yjs para sincronización instantánea en CoWorkField
            if (cowork?.ydoc) {
                cowork.ydoc.transact(() => {
                    const pairs: [string, string, boolean][] = [
                        ['Firmas_DocenteNombre', firmasActualizadas.DocenteNombre, isDocenteFirmado],
                        ['Firmas_DocenteFecha', firmasActualizadas.DocenteFecha, isDocenteFirmado],
                        ['Firmas_CoordinadorNombre', firmasActualizadas.CoordinadorNombre, isCoordFirmado],
                        ['Firmas_CoordinadorFecha', firmasActualizadas.CoordinadorFecha, isCoordFirmado],
                        ['Firmas_CoordinadorAcadNombre', firmasActualizadas.CoordinadorAcadNombre, isCoordAcadFirmado],
                        ['Firmas_CoordinadorAcadFecha', firmasActualizadas.CoordinadorAcadFecha, isCoordAcadFirmado],
                        ['Firmas_VicerrectorNombre', firmasActualizadas.VicerrectorNombre, isVicerrectorFirmado],
                        ['Firmas_VicerrectorFecha', firmasActualizadas.VicerrectorFecha, isVicerrectorFirmado]
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
                firmasActualizadas.DocenteFecha !== fActual.DocenteFecha ||
                firmasActualizadas.CoordinadorNombre !== fActual.CoordinadorNombre ||
                firmasActualizadas.CoordinadorAcadNombre !== fActual.CoordinadorAcadNombre ||
                firmasActualizadas.VicerrectorNombre !== fActual.VicerrectorNombre;

            if (huboCambios) {
                onUpdate('FirmasResponsabilidad', firmasActualizadas);
                if (firmasActualizadas.DocenteNombre) onUpdate('Firmas_DocenteNombre', firmasActualizadas.DocenteNombre);
                if (firmasActualizadas.DocenteFecha) {
                    onUpdate('Firmas_DocenteFecha', firmasActualizadas.DocenteFecha);
                    onUpdate('FechaElaborado', firmasActualizadas.DocenteFecha);
                    onUpdate('fecha_elaborado', firmasActualizadas.DocenteFecha);
                }
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

    // Ejecución inicial al montar: sembrar fecha docente por defecto en edición y sincronizar autoridades
    useEffect(() => {
        const fActual = formData?.FirmasResponsabilidad || {};
        const isDocenteFirmado = Boolean(fActual.DocenteFirmado || fActual.docente_firmado);
        if (!readOnly && !isDocenteFirmado && (!fActual.DocenteFecha || String(fActual.DocenteFecha).trim() === '')) {
            const fechaDefecto = getFechaActualFormat();
            const firmasConFecha = {
                ...fActual,
                DocenteFecha: fechaDefecto
            };
            onUpdate('FirmasResponsabilidad', firmasConFecha);
            onUpdate('Firmas_DocenteFecha', fechaDefecto);
            onUpdate('FechaElaborado', fechaDefecto);
            onUpdate('fecha_elaborado', fechaDefecto);
            if (cowork?.ydoc) {
                const ytext = cowork.ydoc.getText('Firmas_DocenteFecha');
                if (ytext.toString().trim() !== fechaDefecto) {
                    ytext.delete(0, ytext.length);
                    ytext.insert(0, fechaDefecto);
                }
            }
        }
        sincronizarAutoridades(false);
    }, [sincronizarAutoridades, readOnly, onUpdate, cowork]);

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

                            {/* Estado de Firma Electrónica (Visible al estar firmado) */}
                            {rol.firmado && (
                                <div className="py-1">
                                    <div className="min-h-[80px] p-3.5 sm:p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-1.5">
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
                                <label className="text-xs font-semibold text-text-dim uppercase tracking-wider block">
                                    Nombres y Título:
                                </label>
                                <div
                                    data-editable-field={rol.key}
                                    className="relative"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Escape' || e.key === 'Enter') {
                                            handleLockField(rol.key);
                                            (e.target as HTMLElement)?.blur();
                                        }
                                    }}
                                >
                                    <CoWorkField
                                        name={`Firmas_${rol.nombreField}`}
                                        cowork={cowork}
                                        type="text"
                                        placeholder={rol.placeholder}
                                        readOnly={isFieldReadOnly}
                                        className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm text-text-main font-semibold outline-none transition-all ${
                                            isFieldReadOnly
                                                ? 'bg-slate-50 dark:bg-zinc-900 border-border-thin cursor-pointer select-none'
                                                : 'bg-surface border-[#0070f3] ring-2 ring-[#0070f3]/15 shadow-xs'
                                        }`}
                                        onValueChange={(val) => updateFirma(rol.nombreField, val)}
                                        onBlur={() => handleLockField(rol.key)}
                                    />
                                    {!isUnlocked && !rol.firmado && !readOnly && (
                                        <div
                                            onClick={() => handleRequestUnlock(rol.key, rol.etiqueta, rol.cargo, rol.nombreField, 'nombre')}
                                            className="absolute inset-0 cursor-pointer z-10"
                                            title="Clic para modificar en este documento"
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

                            {/* Fecha de Responsabilidad Institucional */}
                            {(() => {
                                const isFechaUnlocked = Boolean(unlockedFields[`${rol.key}_fecha`]);
                                const isFechaReadOnly = readOnly || rol.firmado;
                                let valorFecha = firmas[rol.fechaField] || '';
                                if (rol.key === 'Docente' && (!valorFecha || String(valorFecha).trim() === '')) {
                                    valorFecha = getFechaActualFormat();
                                }

                                return (
                                    <div className="border-t border-border-thin pt-2.5 space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-text-dim uppercase tracking-wider block">
                                                Fecha:
                                            </label>
                                            {isFechaUnlocked && !isFechaReadOnly && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-[#0070f3] dark:text-blue-400 font-semibold">
                                                        Editando
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLockField(`${rol.key}_fecha`)}
                                                        className="text-[11px] font-bold text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                                                    >
                                                        Listo
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {isFechaUnlocked && !isFechaReadOnly ? (
                                            <div
                                                data-editable-field={`${rol.key}_fecha`}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Escape' || e.key === 'Enter') {
                                                        handleLockField(`${rol.key}_fecha`);
                                                    }
                                                }}
                                            >
                                                <GeistDatePicker
                                                    value={valorFecha}
                                                    inputReadOnly={true}
                                                    onChange={(newDate) => {
                                                        updateFirma(rol.fechaField, newDate);
                                                        if (rol.key === 'Docente') {
                                                            onUpdate('FechaElaborado', newDate);
                                                            onUpdate('fecha_elaborado', newDate);
                                                        } else if (rol.key === 'CoordinadorCarrera') {
                                                            onUpdate('FechaRevisadoCarrera', newDate);
                                                            onUpdate('fecha_revisado_carrera', newDate);
                                                        } else if (rol.key === 'CoordinadorAcad') {
                                                            onUpdate('FechaRevisadoAcademico', newDate);
                                                            onUpdate('fecha_revisado_academico', newDate);
                                                        } else if (rol.key === 'Vicerrector') {
                                                            onUpdate('FechaAprobado', newDate);
                                                            onUpdate('fecha_aprobado', newDate);
                                                        }
                                                        if (cowork?.ydoc) {
                                                            const ytext = cowork.ydoc.getText(`Firmas_${rol.fechaField}`);
                                                            if (ytext.toString() !== newDate) {
                                                                ytext.delete(0, ytext.length);
                                                                ytext.insert(0, newDate);
                                                            }
                                                        }
                                                        // Cerrar y bloquear automáticamente al seleccionar una fecha
                                                        handleLockField(`${rol.key}_fecha`);
                                                    }}
                                                    placeholder="DD/MM/AAAA"
                                                    className="!py-2 !px-3 text-xs sm:text-sm font-mono text-center !bg-surface !border-[#0070f3] ring-2 ring-[#0070f3]/15 shadow-xs"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => {
                                                    if (!readOnly && !rol.firmado) {
                                                        handleRequestUnlock(rol.key, rol.etiqueta, rol.cargo, rol.fechaField, 'fecha');
                                                    }
                                                }}
                                                className={`w-full border rounded-lg px-3 py-2 text-xs sm:text-sm font-mono text-center relative flex items-center justify-center transition-all ${
                                                    !readOnly && !rol.firmado
                                                        ? 'bg-slate-50 dark:bg-zinc-900 border-border-thin hover:border-slate-300 dark:hover:border-zinc-700 cursor-pointer select-none text-text-main'
                                                        : 'bg-slate-50 dark:bg-zinc-900 border-border-thin opacity-80 cursor-default select-none text-text-main'
                                                }`}
                                                title={!readOnly && !rol.firmado ? "Clic para modificar la fecha en este documento" : undefined}
                                            >
                                                <span className={valorFecha ? 'font-medium' : 'text-text-dim/50'}>
                                                    {valorFecha || 'DD/MM/AAAA'}
                                                </span>
                                                {!readOnly && !rol.firmado && (
                                                    <Lock size={13} className="text-zinc-400 absolute right-3 pointer-events-none" />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE CONFIRMACIÓN DE MODIFICACIÓN MANUAL (Teletransportado a body para oscurecer cabecera y barra lateral) */}
            {confirmModal && confirmModal.open && typeof document !== 'undefined' && createPortal(
                <div data-confirm-modal="true" className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-fade-in">
                    <div className="w-full max-w-md rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl p-6 space-y-5 animate-scale-in">
                        <div className="flex items-start gap-3">
                            <div className="p-2.5 rounded-lg bg-blue-500/10 text-[#0070f3] dark:text-blue-400 shrink-0">
                                <ShieldAlert size={20} strokeWidth={1.75} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-text-main">
                                    {confirmModal.tipo === 'fecha'
                                        ? `Modificar Fecha: ${confirmModal.cargo}`
                                        : `Modificar Autoridad: ${confirmModal.cargo}`}
                                </h3>
                                <p className="text-xs text-text-dim">
                                    {confirmModal.etiqueta} {confirmModal.cargo}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs text-text-main leading-relaxed space-y-2">
                            <p className="font-medium">
                                Este cambio <span className="font-bold text-[#0070f3]">solo afectará a este documento</span>.
                            </p>
                            <p className="text-[11px] text-text-dim leading-relaxed">
                                {confirmModal.tipo === 'fecha'
                                    ? 'Permite ajustar la fecha formal de elaboración o revisión según el calendario institucional sin alterar otros registros.'
                                    : 'No modificará la asignación central de la carrera en el sistema institucional.'}
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 pt-1">
                            <button
                                type="button"
                                onClick={() => setConfirmModal(null)}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-text-dim hover:text-text-main hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmUnlock}
                                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors shadow-xs cursor-pointer"
                            >
                                Modificar solo en este documento
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

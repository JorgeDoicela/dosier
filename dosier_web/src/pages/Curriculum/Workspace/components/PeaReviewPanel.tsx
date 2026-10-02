// ═══════════════════════════════════════════════════════════════════
// DOSIER — PeaReviewPanel (Modern Enterprise Docs)
//
// Panel de Revisión Curricular Técnica, Auditoría Normativa CACES /
// RRA CES Art. 21 y Emisión de Avales de Carrera / Académicos.
// ═══════════════════════════════════════════════════════════════════

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    Shield,
    CheckCircle2,
    AlertTriangle,
    Clock,
    FileCheck2,
    Check,
    Send,
    Award,
    RotateCcw,
    Loader2,
    Building2,
    GraduationCap,
    UserCheck,
    Calendar,
    BookOpen,
    HelpCircle,
    ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../api/AuthContext';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useConfirm } from '../../../../api/ConfirmContext';
import {
    cambiarEstadoPea,
    agregarObservacionPea,
    getObservacionesPea,
    subsanarObservacionPea,
    type PeaObservacionDto,
    type PeaDto
} from '../../../../services/peaService';

export interface PeaReviewPanelProps {
    peaData: any;
    entityUuid?: string;
    onStatusChanged?: (newStatus: string, observation?: string) => void;
    className?: string;
    onClose?: () => void;
}

export const PeaReviewPanel: React.FC<PeaReviewPanelProps> = ({
    peaData,
    entityUuid,
    onStatusChanged,
    className = ''
}) => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const { addToast } = useNotifications();
    const confirm = useConfirm();

    const [observaciones, setObservaciones] = useState<PeaObservacionDto[]>([]);
    const [isLoadingObs, setIsLoadingObs] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<string>('');
    const [seccionAfectada, setSeccionAfectada] = useState<string>('General');
    const [fechaLimiteSubsanacion, setFechaLimiteSubsanacion] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const peaId = peaData?.id_pea || peaData?.idPea || peaData?.IdPea || 0;
    const peaUuid = peaData?.uuid || entityUuid || '';

    // Determinar rol activo del usuario
    const userRole = (user?.rol_activo || user?.rol || '').toUpperCase();
    const isDocente = userRole.includes('DOCENTE') || (!userRole.includes('COORD') && !userRole.includes('VICER') && !isAdmin);
    const isCoordCarrera = userRole.includes('COORD_CARRERA') || userRole.includes('CARRERA') || isAdmin;
    const isCoordAcad = userRole.includes('COORD_ACAD') || userRole.includes('ACADEMICA') || isAdmin;
    const isVicerrector = userRole.includes('VICERRECTOR') || userRole.includes('RECTOR') || isAdmin;

    // Estado actual del PEA
    const estado = peaData?.estado || peaData?.Estado || 'Borrador';

    // Cargar observaciones
    const cargarObservaciones = useCallback(async () => {
        const targetId = peaUuid || peaId;
        if (!targetId) return;
        setIsLoadingObs(true);
        try {
            const data = await getObservacionesPea(targetId);
            setObservaciones(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[PeaReviewPanel] Error al cargar observaciones:', err);
        } finally {
            setIsLoadingObs(false);
        }
    }, [peaId, peaUuid]);

    useEffect(() => {
        cargarObservaciones();
    }, [cargarObservaciones]);

    // ─────────────────────────────────────────────────────────────
    // 1. CHEQUEOS AUTOMÁTICOS DE CONSISTENCIA NORMATIVA (CACES/CES)
    // ─────────────────────────────────────────────────────────────

    // A. Distribución de Horas RRA Art. 21
    const totalHoras = Number(peaData?.total_horas_asignatura ?? peaData?.totalHorasAsignatura ?? peaData?.TotalHorasAsignatura ?? 0);
    const hContacto = Number(peaData?.horas_contacto_docente ?? peaData?.horasContactoDocente ?? peaData?.HorasContactoDocente ?? 0);
    const hPractico = Number(peaData?.horas_practico_experimental ?? peaData?.horasPracticoExperimental ?? peaData?.HorasPracticoExperimental ?? 0);
    const hAutonomo = Number(peaData?.horas_autonomo ?? peaData?.horasAutonomo ?? peaData?.HorasAutonomo ?? 0);
    const sumaHoras = hContacto + hPractico + hAutonomo;
    const isHorasOk = totalHoras > 0 && sumaHoras === totalHoras;

    // B. Unidades Temáticas y Contenidos
    const unidades = peaData?.unidades || peaData?.Unidades || [];
    const hasUnidades = Array.isArray(unidades) && unidades.length > 0;
    const hasTemas = hasUnidades && unidades.some((u: any) => (u.temas || u.Temas || []).length > 0);
    const isUnidadesOk = hasUnidades && hasTemas;

    // C. Resultados de Aprendizaje (RDA)
    const rdas = peaData?.resultados_aprendizaje || peaData?.resultadosAprendizaje || peaData?.ResultadosAprendizaje || [];
    const isRdaOk = Array.isArray(rdas) && rdas.length > 0;

    // D. Prácticas APE (si tiene horas prácticas asignadas)
    const practicas = peaData?.actividades_practicas || peaData?.actividadesPracticas || peaData?.ActividadesPracticas || [];
    const isPracticasOk = hPractico === 0 || (Array.isArray(practicas) && practicas.length > 0);

    // E. Sistema de Evaluación (Criterios y aportes)
    const evaluaciones = peaData?.evaluaciones || peaData?.Evaluaciones || [];
    const isEvaluacionOk = Array.isArray(evaluaciones) && evaluaciones.length > 0;

    // F. Bibliografía APA
    const bibliografias = peaData?.bibliografias || peaData?.Bibliografias || [];
    const isBiblioOk = Array.isArray(bibliografias) && bibliografias.length > 0;

    // G. Firma previa del docente elaborador
    const hasDocenteFirma = Boolean(
        peaData?.firma_docente ||
        peaData?.firma_elaborado_docente ||
        peaData?.FirmaElaboradoDocente ||
        estado !== 'Borrador'
    );

    // Conclusión global de consistencia
    const totalChecks = 7;
    const passedChecks = [
        isHorasOk,
        isUnidadesOk,
        isRdaOk,
        isPracticasOk,
        isEvaluacionOk,
        isBiblioOk,
        hasDocenteFirma
    ].filter(Boolean).length;
    const allChecksOk = passedChecks === totalChecks;

    // ─────────────────────────────────────────────────────────────
    // 2. ACCIONES DE WORKFLOW CURRICULAR
    // ─────────────────────────────────────────────────────────────

    // Emitir Aval de Carrera (Coordinador de Carrera)
    const handleEmitirAvalCarrera = async () => {
        if (!allChecksOk) {
            const confirmed = await confirm({
                title: 'Advertencia de Validación Curricular',
                message: `El PEA cumple con ${passedChecks} de ${totalChecks} requisitos normativos de CACES/CES. ¿Desea emitir el Aval de Carrera de todas formas?`,
                confirmText: 'Emitir Aval de todos modos',
                cancelText: 'Cancelar',
                variant: 'warning'
            });
            if (!confirmed) return;
        } else {
            const confirmed = await confirm({
                title: 'Emitir Aval de Coordinación de Carrera',
                message: '¿Confirma la emisión formal del Aval Curricular de Carrera para este PEA? El documento pasará a revisión de Coordinación Académica.',
                confirmText: 'Emitir Aval de Carrera',
                cancelText: 'Cancelar',
                variant: 'primary'
            });
            if (!confirmed) return;
        }

        setIsSubmitting(true);
        try {
            const targetId = peaUuid || peaId;
            const motivo = feedback.trim() || 'Aval curricular de carrera emitido favorablemente. Cumple requisitos del CACES.';
            await cambiarEstadoPea(targetId, 'RevisadoCoord', undefined, motivo);

            addToast(
                'Aval de Carrera Emitido',
                'El PEA ha sido avalado exitosamente y remitido a Coordinación Académica.',
                'success',
                undefined,
                async () => {
                    try {
                        await cambiarEstadoPea(targetId, 'EnRevision', undefined, 'Reversión de aval de carrera');
                        addToast('Acción Revertida', 'Se ha revertido el aval. El PEA vuelve a estado: En Revisión.', 'info');
                        onStatusChanged?.('EnRevision', 'Reversión');
                    } catch (err: any) {
                        addToast('Error al Revertir', err.message || 'No se pudo deshacer la acción.', 'error');
                    }
                }
            );

            onStatusChanged?.('RevisadoCoord', motivo);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[PeaReviewPanel] Error al emitir aval:', err);
            addToast('Error al Emitir Aval', err.response?.data?.message || err.message || 'No se pudo cambiar el estado.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Emitir Aval Académico (Coordinador Académico)
    const handleEmitirAvalAcademico = async () => {
        const confirmed = await confirm({
            title: 'Emitir Aval de Coordinación Académica',
            message: '¿Confirma la emisión del Aval Académico Institucional? El PEA quedará listo para la firma legal final de Vicerrectorado.',
            confirmText: 'Emitir Aval Académico',
            cancelText: 'Cancelar',
            variant: 'primary'
        });
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const targetId = peaUuid || peaId;
            const motivo = feedback.trim() || 'Aval institucional de Coordinación Académica emitido.';
            await cambiarEstadoPea(targetId, 'RevisadoAcad', undefined, motivo);

            addToast(
                'Aval Académico Emitido',
                'El PEA ha sido avalado por Coordinación Académica y remitido a Vicerrectorado para su legalización.',
                'success'
            );

            onStatusChanged?.('RevisadoAcad', motivo);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[PeaReviewPanel] Error al emitir aval académico:', err);
            addToast('Error al Emitir Aval', err.response?.data?.message || err.message || 'No se pudo cambiar el estado.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Devolver PEA al Docente con Observaciones (Observado)
    const handleDevolverConObservaciones = async () => {
        if (!feedback.trim()) {
            addToast('Observación Requerida', 'Debe redactar una retroalimentación detallada explicando los motivos de la observación.', 'warning');
            return;
        }

        const confirmed = await confirm({
            title: 'Devolver PEA al Docente con Observaciones',
            message: 'El PEA pasará al estado "Observado" y se notificará al docente para que realice los ajustes solicitados.',
            confirmText: 'Devolver con Observaciones',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const targetId = peaUuid || peaId;
            const motivo = feedback.trim();

            // 1. Guardar la observación estructurada en base de datos
            await agregarObservacionPea(targetId, {
                rolObservador: userRole.includes('COORD_ACAD') ? 'CoordinadorAcademico' : userRole.includes('VICER') ? 'Vicerrector' : 'CoordinadorCarrera',
                seccionAfectada: seccionAfectada || 'General',
                texto: motivo
            });

            // 2. Transicionar el estado a Observado
            await cambiarEstadoPea(targetId, 'Observado', undefined, motivo);

            addToast(
                'PEA Devuelto con Observaciones',
                'Se registraron las observaciones y el docente ha sido notificado.',
                'warning',
                undefined,
                async () => {
                    try {
                        await cambiarEstadoPea(targetId, 'EnRevision', undefined, 'Reversión: Cancelación de observaciones.');
                        addToast('Acción Revertida', 'El PEA ha vuelto al estado: En Revisión.', 'info');
                        onStatusChanged?.('EnRevision', 'Reversión');
                    } catch (err: any) {
                        addToast('Error al Revertir', err.message || 'No se pudo revertir la devolución.', 'error');
                    }
                }
            );

            setFeedback('');
            await cargarObservaciones();
            onStatusChanged?.('Observado', motivo);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[PeaReviewPanel] Error al devolver PEA:', err);
            addToast('Error al Devolver PEA', err.response?.data?.message || err.message || 'No se pudo devolver el instrumento.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Reenviar PEA a Revisión (Docente subsanando)
    const handleEnviarARevision = async () => {
        const confirmed = await confirm({
            title: 'Enviar PEA a Revisión Oficial',
            message: '¿Confirma el envío formal del PEA a la Coordinación de Carrera para su revisión colegiada y aval?',
            confirmText: 'Enviar a Revisión',
            cancelText: 'Cancelar',
            variant: 'primary'
        });
        if (!confirmed) return;

        setIsSubmitting(true);
        try {
            const targetId = peaUuid || peaId;
            const motivo = feedback.trim() || 'PEA remitido por el docente para revisión curricular.';
            await cambiarEstadoPea(targetId, 'EnRevision', undefined, motivo);

            addToast(
                'PEA Enviado a Revisión',
                'El instrumento ha sido enviado a la Coordinación de Carrera.',
                'success'
            );

            onStatusChanged?.('EnRevision', motivo);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error('[PeaReviewPanel] Error al enviar a revisión:', err);
            addToast('Error al Enviar', err.response?.data?.message || err.message || 'No se pudo enviar el PEA.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 flex flex-col gap-6 shadow-xs animate-fade-in ${className}`}>
            {/* Cabecera del Panel */}
            <div className="border-b border-slate-200 dark:border-zinc-800 pb-4 flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-[#0070f3]" />
                        <h3 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                            Revisión Técnica y Dictamen Curricular
                        </h3>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Auditoría de consistencia RRA CES Art. 21 y gobernanza del PEA ({estado})
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {peaUuid && (
                        <button
                            type="button"
                            onClick={() => navigate(`/documentacion/revision-tecnica/${peaUuid}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer shadow-xs"
                            title="Abrir panel completo de revisión técnica con visor contextual y PDF"
                        >
                            <ExternalLink size={13} />
                            <span>Abrir Panel Completo</span>
                        </button>
                    )}
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-[#0070f3] dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-mono">
                        {passedChecks}/{totalChecks} Normativos
                    </span>
                </div>
            </div>

            {/* Checklist de Consistencia Normativa */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Chequeos de Consistencia Curricular
                    </h4>
                    <span className="text-[11px] text-zinc-500 font-mono">
                        {allChecksOk ? '✓ Todo en orden' : 'Pendientes detectados'}
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                    {/* 1. Horas RRA Art. 21 */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isHorasOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Balance de Horas RRA Art. 21
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                                Total: {totalHoras}h (CD: {hContacto}h + APE: {hPractico}h + AA: {hAutonomo}h = {sumaHoras}h)
                            </p>
                        </div>
                    </div>

                    {/* 2. Unidades y Contenidos */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isUnidadesOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Unidades Temáticas y Contenidos
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {isUnidadesOk ? `${unidades.length} unidades estructuradas con temas asignados.` : 'Falta registrar unidades o temas en la Sección E.'}
                            </p>
                        </div>
                    </div>

                    {/* 3. Resultados de Aprendizaje */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isRdaOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Resultados de Aprendizaje (RDA)
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {isRdaOk ? `${rdas.length} RDAs formulados y tributados al perfil.` : 'No se han registrado RDAs en la Sección D.'}
                            </p>
                        </div>
                    </div>

                    {/* 4. Actividades Prácticas APE */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isPracticasOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Actividades Práctico-Experimentales (APE)
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {hPractico === 0 ? 'Materia teórica (0h APE requeridas).' : `${practicas.length} guías prácticas registradas en la Sección G.`}
                            </p>
                        </div>
                    </div>

                    {/* 5. Criterios de Evaluación */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isEvaluacionOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Mecanismos y Criterios de Evaluación
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {isEvaluacionOk ? `${evaluaciones.length} criterios estructurados en la Sección H.` : 'Falta definir la matriz evaluativa en la Sección H.'}
                            </p>
                        </div>
                    </div>

                    {/* 6. Bibliografía APA */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {isBiblioOk ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Bibliografía Básica y Complementaria
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {isBiblioOk ? `${bibliografias.length} referencias bibliográficas en formato APA.` : 'No hay fuentes bibliográficas en la Sección I.'}
                            </p>
                        </div>
                    </div>

                    {/* 7. Firma del Docente Elaborador */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-100 dark:border-zinc-900 bg-slate-50/50 dark:bg-zinc-900/40">
                        {hasDocenteFirma ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 leading-snug">
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                Firma y Responsabilidad del Docente
                            </p>
                            <p className="text-[11px] text-zinc-500 mt-0.5">
                                {hasDocenteFirma ? 'Firma institucional del docente registrada.' : 'Pendiente de firma del docente elaborador.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Listado de Observaciones Históricas/Activas */}
            {observaciones.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                            Bitácora de Observaciones ({observaciones.length})
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                            {observaciones.filter(o => o.estado === 'Pendiente').length} pendientes
                        </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {observaciones.map(obs => (
                            <div
                                key={obs.idObservacion || obs.uuid}
                                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                                    obs.estado === 'Pendiente'
                                        ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                                        : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[11px] font-medium">
                                    <span className="font-semibold">{obs.rolObservador} • {obs.seccionAfectada}</span>
                                    <span className="text-[10px] opacity-70 font-mono">
                                        {obs.fechaObservacion ? new Date(obs.fechaObservacion).toLocaleDateString('es-EC') : ''}
                                    </span>
                                </div>
                                <p className="text-[11px] leading-relaxed italic">
                                    "{obs.textoObservacion}"
                                </p>
                                {obs.respuestaDocente && (
                                    <div className="pt-1 text-[11px] border-t border-amber-200/60 dark:border-amber-800/40 text-emerald-700 dark:text-emerald-400">
                                        <span className="font-semibold">Subsanación: </span>
                                        {obs.respuestaDocente}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Formulario de Retroalimentación / Dictamen */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-900">
                <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                        Observaciones / Dictamen Técnico
                    </label>
                    <select
                        value={seccionAfectada}
                        onChange={e => setSeccionAfectada(e.target.value)}
                        className="px-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                        <option value="General">General (Todo el PEA)</option>
                        <option value="Sección A: Datos Generales">Sección A: Datos Generales</option>
                        <option value="Sección B: Objetivo">Sección B: Objetivo</option>
                        <option value="Sección C: Prerrequisitos">Sección C: Prerrequisitos</option>
                        <option value="Sección D: RDA">Sección D: RDA</option>
                        <option value="Sección E: Contenidos">Sección E: Contenidos</option>
                        <option value="Sección F: Metodología">Sección F: Metodología</option>
                        <option value="Sección G: Prácticas APE">Sección G: Prácticas APE</option>
                        <option value="Sección H: Evaluación">Sección H: Evaluación</option>
                        <option value="Sección I: Bibliografía">Sección I: Bibliografía</option>
                        <option value="Sección J: Firmas">Sección J: Firmas</option>
                    </select>
                </div>

                <textarea
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Escriba aquí las observaciones detalladas para el docente o el dictamen de aprobación técnica..."
                    disabled={isSubmitting}
                    className="w-full h-24 p-3 text-xs bg-slate-50/60 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3] resize-none transition-all"
                />
            </div>

            {/* Acciones según Rol */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-zinc-900">
                {/* Coordinador de Carrera / Admin */}
                {(isCoordCarrera || isAdmin) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleEmitirAvalCarrera}
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-4 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                            <span>Emitir Aval de Carrera</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDevolverConObservaciones}
                            disabled={isSubmitting || !feedback.trim()}
                            className="w-full py-2.5 px-4 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            <span>Devolver con Observaciones</span>
                        </button>
                    </div>
                )}

                {/* Coordinador Académico (cuando ya cuenta con aval de carrera) */}
                {isCoordAcad && !isCoordCarrera && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={handleEmitirAvalAcademico}
                            disabled={isSubmitting}
                            className="w-full py-2.5 px-4 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>Emitir Aval Académico</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDevolverConObservaciones}
                            disabled={isSubmitting || !feedback.trim()}
                            className="w-full py-2.5 px-4 border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                            {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                            <span>Devolver a Carrera</span>
                        </button>
                    </div>
                )}

                {/* Docente (cuando está en Borrador o ha sido Observado) */}
                {isDocente && (estado === 'Borrador' || estado === 'Observado') && (
                    <button
                        type="button"
                        onClick={handleEnviarARevision}
                        disabled={isSubmitting || !allChecksOk}
                        className="w-full py-2.5 px-4 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Enviar PEA a Revisión</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default PeaReviewPanel;

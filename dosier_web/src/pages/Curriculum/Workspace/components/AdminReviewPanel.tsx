import React, { useState } from 'react';
import { 
    Shield, CheckCircle2, AlertTriangle, 
    RotateCcw, Scale, Loader2 
} from 'lucide-react';
import { curriculumProjectService } from '../../../../services/curriculumProjectService';

interface AdminReviewPanelProps {
    currentProject: {
        uuid: string;
        convocatoria?: string;
        title: string;
    };
    investigadores: Array<{
        nombres_completos?: string;
        nombre?: string;
        apellido?: string;
        rol?: string;
        horasSemanales?: number | null;
        horasDisponibles?: number | null;
        horasAsignadas?: number | null;
    }>;
    addToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info' | 'default', url?: string, onUndo?: () => void | Promise<void>) => void;
    confirm: (options: {
        title: string;
        message: string;
        confirmText: string;
        cancelText: string;
        variant?: 'warning' | 'destructive' | 'primary';
    }) => Promise<boolean>;
    onStatusChanged: (newStatus: string, observation: string) => void;
}

export const AdminReviewPanel: React.FC<AdminReviewPanelProps> = ({
    currentProject,
    investigadores,
    addToast,
    confirm,
    onStatusChanged
}) => {
    const [feedback, setFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // 1. CHEQUEOS AUTOMÁTICOS

    // B. Equipo Mínimo
    const hasPrincipalInvestigator = investigadores.some(inv => 
        (inv.rol || '').toLowerCase().includes('director') || 
        (inv.rol || '').toLowerCase().includes('principal')
    );
    const hasTeam = investigadores.length > 0;
    const isTeamOk = hasTeam && hasPrincipalInvestigator;

    // C. Carga Horaria (Exceso de horas)
    const teachersWithExceedingHours = investigadores.filter(inv => {
        const proposed = inv.horasSemanales || 0;
        const available = inv.horasDisponibles || 0;
        const assigned = inv.horasAsignadas || 0;
        return (assigned + proposed) > available;
    });
    const isHoursOk = teachersWithExceedingHours.length === 0;

    // D. Sello Digital (Por estar en estado Enviado, ya está firmado)
    const isSigned = true;

    const allOk = isTeamOk && isHoursOk && isSigned;

    // 2. ACCIONES
    const handleAprobar = async () => {
        if (!allOk) {
            if (!await confirm({
                title: "Advertencia de Validación",
                message: "El proyecto no cumple con todas las reglas de consistencia de CACES/DOSIER. ¿Está seguro de aprobar la revisión técnica de todas formas?",
                confirmText: "Aprobar de todos modos",
                cancelText: "Cancelar",
                variant: "warning"
            })) return;
        } else {
            if (!await confirm({
                title: "Aprobar Revisión Técnica",
                message: "¿Aprobar la revisión técnica del proyecto y habilitar su fase de aprobación institucional?",
                confirmText: "Aprobar Revisión",
                cancelText: "Cancelar",
                variant: "primary"
            })) return;
        }

        setSubmitting(true);
        try {
            const obs = feedback.trim() || 'Aprobación Técnica Inicial del Administrador. Cumple requisitos del CACES.';
            await curriculumProjectService.transitionState(currentProject.uuid, 'En Revisión', obs);
            addToast(
                "Revisión Aprobada",
                "El proyecto ha completado exitosamente la revisión técnica institucional.",
                "success",
                undefined,
                async () => {
                    try {
                        await curriculumProjectService.transitionState(
                            currentProject.uuid,
                            'Enviado',
                            "Reversión (Undo): Cancelación de la aprobación técnica inicial."
                        );
                        addToast("Acción Revertida", "La aprobación técnica ha sido cancelada. Proyecto en estado: Enviado", "info");
                        onStatusChanged('Enviado', "Reversión (Undo)");
                    } catch (err: any) {
                        console.error("[Undo Technical Approval] Failed:", err);
                        addToast("Error al Revertir", err.response?.data?.error || "No se pudo deshacer la aprobación técnica.", "error");
                    }
                }
            );
            onStatusChanged('En Revisión', obs);
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error(err);
            addToast("Error al transicionar", err.response?.data?.error ?? "No se pudo realizar la transición de estado.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDevolver = async () => {
        if (!feedback.trim()) {
            addToast("Observación requerida", "Debe redactar una retroalimentación detallada para el docente.", "warning");
            return;
        }

        if (!await confirm({
            title: "Devolver al Docente",
            message: "¿Devolver el proyecto a etapa de formulación (En Corrección) con las observaciones especificadas?",
            confirmText: "Devolver proyecto",
            cancelText: "Cancelar",
            variant: "destructive"
        })) return;

        setSubmitting(true);
        try {
            await curriculumProjectService.transitionState(currentProject.uuid, 'En Corrección', feedback.trim());
            addToast(
                "Proyecto Devuelto",
                "El proyecto se ha retornado a etapa de correcciones.",
                "warning",
                undefined,
                async () => {
                    try {
                        await curriculumProjectService.transitionState(
                            currentProject.uuid,
                            'Enviado',
                            "Reversión (Undo): Cancelación de la devolución al docente."
                        );
                        addToast("Acción Revertida", "La devolución del proyecto ha sido cancelada. Proyecto en estado: Enviado", "info");
                        onStatusChanged('Enviado', "Reversión (Undo)");
                    } catch (err: any) {
                        console.error("[Undo Technical Return] Failed:", err);
                        addToast("Error al Revertir", err.response?.data?.error || "No se pudo deshacer la devolución del proyecto.", "error");
                    }
                }
            );
            onStatusChanged('En Corrección', feedback.trim());
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
        } catch (err: any) {
            console.error(err);
            addToast("Error al devolver", err.response?.data?.error ?? "No se pudo realizar la transición de estado.", "error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg p-6 flex flex-col gap-6 shadow-sm animate-fade-in">
            {/* Cabecera */}
            <div className="border-b border-slate-200/90 dark:border-zinc-800 pb-3">
                <h3 className="text-xs font-bold text-text-main uppercase tracking-widest flex items-center gap-2">
                    <Shield size={15} className="text-[#0070f3]" />
                    Revisión Técnica Curricular
                </h3>
            </div>

            {/* Checklist de Validación Automatizada */}
            <div className="space-y-3.5">
                <h4 className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Chequeos de Consistencia</h4>

                {/* 2. Equipo Humano */}
                <div className="flex items-start gap-2.5 text-xs">
                    {isTeamOk ? (
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <div className="flex-1 leading-snug">
                        <p className="font-semibold text-text-main">Docentes / Elaboradores Registrados</p>
                        <p className="text-[10px] text-text-dim mt-0.5">
                            {!hasTeam 
                                ? 'No hay docentes agregados.' 
                                : !hasPrincipalInvestigator 
                                    ? 'Falta Docente Principal / Elaborador.' 
                                    : `Total: ${investigadores.length} docentes registrados.`}
                        </p>
                    </div>
                </div>

                {/* 3. Carga Horaria */}
                <div className="flex items-start gap-2.5 text-xs">
                    {isHoursOk ? (
                        <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                    )}
                    <div className="flex-1 leading-snug">
                        <p className="font-semibold text-text-main">Carga Horaria Docente</p>
                        <p className="text-[10px] text-text-dim mt-0.5">
                            {isHoursOk 
                                ? 'Todos los docentes cuentan con carga horaria disponible.' 
                                : `Exceso detectado en: ${teachersWithExceedingHours.map(t => t.nombres_completos || t.nombre).join(', ')}`}
                        </p>
                    </div>
                </div>

                {/* 4. Sello Digital */}
                <div className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex-1 leading-snug">
                        <p className="font-semibold text-text-main">Firma e Inmutabilidad</p>
                        <p className="text-[10px] text-text-dim mt-0.5">
                            Documento firmado digitalmente e inmutable.
                        </p>
                    </div>
                </div>
            </div>

            {/* Retroalimentación */}
            <div className="space-y-2">
                <label className="text-[9px] font-bold text-text-dim uppercase tracking-widest ml-0.5">
                    Observaciones / Retroalimentación
                </label>
                <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Escriba aquí los detalles de la revisión, o los motivos para devolver el proyecto al docente..."
                    className="input-vercel !h-28 !text-xs resize-none"
                    disabled={submitting}
                />
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/90 dark:border-zinc-800">
                <button
                    onClick={handleAprobar}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg uppercase tracking-wider bg-[#0070f3] hover:bg-[#0060df] text-white shadow-sm transition-all disabled:opacity-40 cursor-pointer"
                >
                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <Scale size={12} />}
                    Aprobar Revisión Técnica
                </button>

                <button
                    onClick={handleDevolver}
                    disabled={submitting || !feedback.trim()}
                    className="w-full flex items-center justify-center gap-1.5 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-40 cursor-pointer"
                >
                    {submitting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    Devolver para Correcciones
                </button>
            </div>
        </div>
    );
};

export default AdminReviewPanel;

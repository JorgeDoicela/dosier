import React, { useState, useEffect, useMemo } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    FileSignature,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../../api/AuthContext';
import { useNotifications } from '../../../../api/NotificationsContext';
import {
    getObservacionesPea,
    type PeaObservacionDto
} from '../../../../services/peaService';
import { PeaObservationsDrawer } from './PeaObservationsDrawer';

export interface PeaWorkflowBarProps {
    peaId: number;
    peaUuid?: string;
    formData: any;
    onOpenSignModal?: () => void;
    onRefreshPea?: () => void;
    activeSectionKey?: string;
    readOnly?: boolean;
}

export const PeaWorkflowBar: React.FC<PeaWorkflowBarProps> = ({
    peaId,
    formData,
    onOpenSignModal,
    onRefreshPea,
    activeSectionKey,
    readOnly = false
}) => {
    const { isAdmin, isDocente, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const { addToast } = useNotifications();

    const [isObservationsOpen, setIsObservationsOpen] = useState(false);
    const [observaciones, setObservaciones] = useState<PeaObservacionDto[]>([]);


    // Cargar observaciones
    const fetchObservaciones = async () => {
        if (!peaId || peaId <= 0) return;
        try {
            const data = await getObservacionesPea(peaId);
            setObservaciones(data || []);
        } catch (err) {
            console.error('[DOSIER] Error al cargar observaciones en barra de workflow:', err);
        }
    };

    useEffect(() => {
        if (peaId > 0) {
            fetchObservaciones();
        }
    }, [peaId]);

    const estado = formData?.estado || formData?.Estado || 'Borrador';

    // ── Cálculo del Balance Matemático de Horas (RRA Art. 21) ──
    const { totalHorasAsignatura, totalPlanificado, isBalanced, horasDiff } = useMemo(() => {
        const total = Number(formData?.TotalHorasAsignatura || formData?.total_horas_asignatura || 0);
        const unidades: any[] = Array.isArray(formData?.Unidades)
            ? formData.Unidades
            : Array.isArray(formData?.unidades)
            ? formData.unidades
            : [];

        let planificado = 0;
        unidades.forEach(u => {
            const cd = Number(u.HorasDocencia ?? u.horasDocencia ?? u.horas_docencia ?? 0);
            const ape = Number(u.HorasPracticoExp ?? u.horasPracticoExp ?? u.horas_practico_exp ?? u.horas_practico_experimental ?? 0);
            const ta = Number(u.HorasAutonomo ?? u.horasAutonomo ?? u.horas_autonomo ?? 0);
            planificado += cd + ape + ta;
        });

        const balanced = total > 0 && planificado === total;
        const diff = planificado - total;

        return {
            totalHorasAsignatura: total,
            totalPlanificado: planificado,
            isBalanced: balanced,
            horasDiff: diff
        };
    }, [formData]);

    const pendientesCount = useMemo(() => {
        return observaciones.filter(o => o.estado === 'Pendiente').length;
    }, [observaciones]);

    // Estados de firma del circuito oficial
    const firmaDocente = Boolean(formData?.FirmaElaboradoDocente || formData?.firma_elaborado_docente);
    const firmaCoord = Boolean(formData?.FirmaRevisadoCoord || formData?.firma_revisado_coord);
    const firmaAcad = Boolean(formData?.FirmaRevisadoAcad || formData?.firma_revisado_acad);
    const firmaVicerrector = Boolean(formData?.FirmaAprobadoVicerrector || formData?.firma_aprobado_vicerrector);

    // Determinar la acción principal disponible según rol y estado
    const accionPrincipal = useMemo(() => {
        if (readOnly) {
            return {
                tipo: 'readonly',
                label: 'Documento en Solo Lectura',
                disabled: true
            };
        }

        if (estado === 'Aprobado' || estado === 'Publicado') {
            return {
                tipo: 'aprobado',
                label: 'PEA Legalizado e Inmutable',
                disabled: true
            };
        }


        // 1. Docente elaborador
        if ((isDocente || isAdmin) && (estado === 'Borrador' || estado === 'Observado')) {
            const puedeEnviar = isBalanced && pendientesCount === 0;
            let motivoDisabled = '';
            if (!isBalanced) motivoDisabled = 'Debe balancear las horas de las unidades antes de enviar.';
            else if (pendientesCount > 0) motivoDisabled = 'Debe subsanar todas las observaciones pendientes.';

            return {
                tipo: 'enviar_revision',
                label: estado === 'Observado' ? 'Firmar y Reenviar PEA Corregido' : 'Firmar y Enviar a Revisión',
                disabled: !puedeEnviar,
                tooltip: motivoDisabled
            };
        }

        // 2. Coordinador de Carrera
        if ((isCoordCarrera || isAdmin) && estado === 'EnRevision') {
            return {
                tipo: 'aval_coord',
                label: 'Emitir Aval de Carrera',
                disabled: false,
                tooltip: 'Certifica la pertinencia disciplinar y avala el PEA'
            };
        }

        // 3. Coordinador Académico
        if ((isCoordAcad || isAdmin) && estado === 'RevisadoCoord') {
            return {
                tipo: 'aval_acad',
                label: 'Emitir Aval Académico',
                disabled: false,
                tooltip: 'Certifica la consistencia metodológica y carga horaria institucional'
            };
        }

        // 4. Vicerrectorado
        if ((isVicerrector || isAdmin) && estado === 'RevisadoAcad') {
            return {
                tipo: 'aprobar_final',
                label: 'Legalizar y Aprobar PEA',
                disabled: false,
                tooltip: 'Aprobación institucional definitiva bajo Ley 67'
            };
        }

        return null;
    }, [estado, isDocente, isCoordCarrera, isCoordAcad, isVicerrector, isAdmin, isBalanced, pendientesCount, readOnly]);


    const handleEjecutarAccion = () => {
        if (!accionPrincipal || accionPrincipal.disabled) return;
        if (onOpenSignModal) {
            onOpenSignModal();
        } else {
            addToast('Firma Electrónica', 'Abra la sección de vista previa (Generar PDF) para formalizar la firma con su certificado.', 'info');
        }
    };

    return (
        <>
            <div className="w-full bg-surface dark:bg-zinc-950 border-b border-border-thin px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-[40]">
                {/* ── Izquierda: Estado del PEA y Semáforo Horario ── */}
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Badge de Estado */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Estado:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                            estado === 'Aprobado' || estado === 'Publicado'
                                ? 'badge-vercel-success'
                                : estado === 'Observado'
                                ? 'badge-vercel-error'
                                : estado === 'EnRevision' || estado === 'RevisadoCoord' || estado === 'RevisadoAcad'
                                ? 'badge-vercel-info'
                                : 'badge-vercel-neutral'
                        }`}>
                            {estado}
                        </span>
                    </div>

                    <div className="h-4 w-[1px] bg-border-thin hidden sm:block" />

                    {/* Semáforo Matemático de Horas */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Horas:</span>
                        <div className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md font-mono text-[11px] font-bold border ${
                            isBalanced
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                : horasDiff < 0
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        }`}>
                            {isBalanced ? (
                                <CheckCircle2 size={12} className="text-emerald-500" />
                            ) : (
                                <AlertCircle size={12} className={horasDiff < 0 ? 'text-amber-500' : 'text-red-500'} />
                            )}
                            <span>{totalPlanificado}h / {totalHorasAsignatura}h</span>
                            {!isBalanced && (
                                <span className="text-[9.5px] ml-0.5 font-sans font-normal">
                                    ({horasDiff > 0 ? `+${horasDiff}h` : `${horasDiff}h`})
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Centro: Stepper de 4 Firmas ── */}
                <div className="hidden xl:flex items-center gap-1 bg-bg-deep px-3 py-1 rounded-lg border border-border-thin text-[10.5px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${firmaDocente ? 'text-emerald-500' : 'text-text-dim/60 line-through'}`}>
                        Docente
                    </span>
                    <ChevronRight size={10} className="text-text-dim/40" />
                    <span className={`px-2 py-0.5 rounded font-semibold ${firmaCoord ? 'text-emerald-500' : 'text-text-dim/60'}`}>
                        Coord. Carrera
                    </span>
                    <ChevronRight size={10} className="text-text-dim/40" />
                    <span className={`px-2 py-0.5 rounded font-semibold ${firmaAcad ? 'text-emerald-500' : 'text-text-dim/60'}`}>
                        Coord. Acad.
                    </span>
                    <ChevronRight size={10} className="text-text-dim/40" />
                    <span className={`px-2 py-0.5 rounded font-semibold ${firmaVicerrector ? 'text-emerald-500' : 'text-text-dim/60'}`}>
                        Vicerrector
                    </span>
                </div>

                {/* ── Derecha: Observaciones y Acción de Workflow ── */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {/* Botón de Observaciones */}
                    <button
                        onClick={() => setIsObservationsOpen(true)}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            pendientesCount > 0
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
                                : 'bg-surface hover:bg-surface-hover border-border-thin text-text-dim hover:text-text-main'
                        }`}
                        title="Ver o formular observaciones"
                    >
                        <MessageSquare size={12} />
                        <span>Observaciones</span>
                        {pendientesCount > 0 && (
                            <span className="px-1.5 py-0.2 bg-amber-500 text-black text-[9.5px] font-bold font-mono rounded-full leading-tight">
                                {pendientesCount}
                            </span>
                        )}
                    </button>

                    {/* Botón de Acción Colegiada Principal */}
                    {accionPrincipal && (
                        <div className="relative group">
                            <button
                                onClick={handleEjecutarAccion}
                                disabled={accionPrincipal.disabled}
                                className={`h-7 px-3.5 rounded-lg font-semibold text-[11px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                                    accionPrincipal.disabled
                                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                                        : 'btn-vercel-primary'
                                }`}
                                title={accionPrincipal.tooltip}
                            >
                                <FileSignature size={12} />
                                <span>{accionPrincipal.label}</span>
                            </button>

                            {accionPrincipal.tooltip && accionPrincipal.disabled && (
                                <div className="absolute right-0 top-full mt-1.5 hidden group-hover:block z-50 p-2 bg-surface dark:bg-zinc-900 border border-border-thin text-[10.5px] text-text-dim rounded-lg shadow-xl whitespace-nowrap">
                                    {accionPrincipal.tooltip}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Drawer Deslizable de Observaciones Curriculares ── */}
            <PeaObservationsDrawer
                isOpen={isObservationsOpen}
                onClose={() => setIsObservationsOpen(false)}
                peaId={peaId}
                activeSectionKey={activeSectionKey}
                onObservationChanged={() => {
                    fetchObservaciones();
                    onRefreshPea?.();
                }}
            />
        </>
    );
};

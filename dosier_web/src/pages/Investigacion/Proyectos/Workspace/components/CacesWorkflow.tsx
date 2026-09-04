import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Settings, CheckCircle2, FileText, FileSignature,
    AlertCircle, BarChart, Shield, Clock
} from 'lucide-react';
import api from '../../../../../api/axios_config';
import { buildWorkspacePath, templateCodeToEditParam } from '../../../../../core/documents/templateUrl';

const WorkflowPhases = [
    { id: 'Borrador', label: 'Formulación', icon: FileText },
    { id: 'Enviado', label: 'Revisión Administrador', icon: Shield },
    { id: 'En Ejecución', label: 'Ejecución y Avance', icon: Settings },
    { id: 'InformeFinal', label: 'Informe Final', icon: FileSignature },
    { id: 'RevisionInformeFinal', label: 'Revisión Administrador', icon: Shield },
];

interface CacesWorkflowProps {
    currentProject: {
        status: string;
        puedeEditar: boolean;
        puntajeEvaluacion: number | null;
        codigoInstitucional: string | null;
        uuid: string;
        esParticipante?: boolean;
        fechaInicio?: string | null;
        fechaFin?: string | null;
        fechaLimiteSubsanacion?: string | null;
        fechaLimiteInformeFinal?: string | null;
        fechaLimiteSubsanacionFinal?: string | null;
        fecha_limite_subsanacion?: string | null;
        fecha_limite_informe_final?: string | null;
        fecha_limite_subsanacion_final?: string | null;
        fecha_fin?: string | null;
        [key: string]: any;
    };
    projectDocuments?: any[];
    templateCode: string;
    isAdmin: boolean;
    iniciandoEjecucion: boolean;
    resolvingDocument: string | null;
    urlPrefix: string;
    resolvedProjectUuid: string;
    setActiveDocument: (doc: string) => void;
    resolveDocumentInstance: (doc: string) => void;
    handleIniciarEjecucion: () => void;
    navigate: (path: string) => void;
}

export const CacesWorkflow: React.FC<CacesWorkflowProps> = ({
    currentProject,
    projectDocuments,
    templateCode,
    isAdmin,
    iniciandoEjecucion,
    resolvingDocument,
    urlPrefix,
    resolvedProjectUuid,
    setActiveDocument,
    resolveDocumentInstance,
    handleIniciarEjecucion,
    navigate
}) => {
    const finalReportTemplateCode = 'INFORME_FINAL_INVESTIGACION';

    const [asyncFinalReportSigned, setAsyncFinalReportSigned] = useState(false);
    const [asyncProtocoloSigned, setAsyncProtocoloSigned] = useState(false);

    const isDocValidlySigned = (doc: any): boolean => {
        if (!doc) return false;
        const hasSignedState = doc.state === 3 || doc.state === '3' || doc.state === 'Signed' || doc.estado === 3 || doc.estado === '3' || doc.estado === 'Firmado' || doc.is_signed === true || doc.isSigned === true;
        const hasSignedFile = Boolean(doc.final_pdf_path || doc.finalPdfPath);
        return Boolean(hasSignedState || hasSignedFile);
    };

    const derivedSignatures = useMemo(() => {
        if (!projectDocuments || projectDocuments.length === 0) return null;
        const protoDoc = projectDocuments.find(
            (d: any) => d.template_code === 'PROTOCOLO_INVESTIGACION' || d.templateCode === 'PROTOCOLO_INVESTIGACION'
        );
        const isAnyFinalDocSigned = (docs: any[]): boolean => {
            if (!docs || docs.length === 0) return false;
            return docs.some((doc: any) => {
                const isMatch = doc.template_code === finalReportTemplateCode || doc.templateCode === finalReportTemplateCode ||
                    doc.template_code === 'INFORME_FINAL_INVESTIGACION' || doc.templateCode === 'INFORME_FINAL_INVESTIGACION' ||
                    doc.template_code === 'INFORME_FINAL' || doc.templateCode === 'INFORME_FINAL';
                if (!isMatch) return false;
                return (
                    doc.is_signed === true || doc.isSigned === true ||
                    doc.state === 3 || doc.state === '3' || doc.state === 'Signed' ||
                    doc.estado === 3 || doc.estado === '3' || doc.estado === 'Firmado' ||
                    Boolean(doc.final_pdf_path || doc.finalPdfPath)
                );
            });
        };

        return {
            isProtocoloSigned: isDocValidlySigned(protoDoc) || ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(currentProject.status),
            isFinalReportSigned: isAnyFinalDocSigned(projectDocuments)
        };
    }, [projectDocuments, currentProject.status, finalReportTemplateCode]);

    const isProtocoloSigned = derivedSignatures ? derivedSignatures.isProtocoloSigned : asyncProtocoloSigned;
    const isFinalReportSigned = derivedSignatures ? derivedSignatures.isFinalReportSigned : asyncFinalReportSigned;

    const renderDeadlineBadge = (dateStr?: string | null, prefix: string = 'Plazo') => {
        if (!dateStr) return null;

        let targetDate: Date;
        if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/').map(Number);
            targetDate = new Date(y, m - 1, d);
        } else {
            targetDate = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
        }

        if (isNaN(targetDate.getTime())) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        targetDate.setHours(0, 0, 0, 0);

        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const formattedDate = targetDate.toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });

        if (diffDays < 0) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">
                    <AlertCircle size={11} className="shrink-0" />
                    <span>Vencido ({Math.abs(diffDays)}d)</span>
                </span>
            );
        } else if (diffDays <= 3) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-mono animate-pulse">
                    <Clock size={11} className="shrink-0" />
                    <span>{diffDays === 0 ? 'Vence hoy' : diffDays === 1 ? 'Vence mañana' : `Vence en ${diffDays}d`}</span>
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-text-dim bg-surface border border-border-thin px-2 py-0.5 rounded-full font-mono">
                    <Clock size={11} className="shrink-0 text-text-dim/70" />
                    <span>{prefix}: {formattedDate} ({diffDays}d)</span>
                </span>
            );
        }
    };

    useEffect(() => {
        if (projectDocuments && projectDocuments.length > 0) return;
        let isMounted = true;
        const checkInstances = async () => {
            if (!resolvedProjectUuid) return;
            try {
                const res = await api.get(`/documents/instances/entity/${resolvedProjectUuid}`);
                if (isMounted && Array.isArray(res.data)) {
                    const protoDoc = res.data.find(
                        (d: any) => d.template_code === 'PROTOCOLO_INVESTIGACION' || d.templateCode === 'PROTOCOLO_INVESTIGACION'
                    );
                    setAsyncProtocoloSigned(isDocValidlySigned(protoDoc) || ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(currentProject.status));

                    const hasSignedFinal = res.data.some(
                        (d: any) => {
                            const isMatch = d.template_code === finalReportTemplateCode || d.templateCode === finalReportTemplateCode ||
                                d.template_code === 'INFORME_FINAL_INVESTIGACION' || d.templateCode === 'INFORME_FINAL_INVESTIGACION' ||
                                d.template_code === 'INFORME_FINAL' || d.templateCode === 'INFORME_FINAL';
                            if (!isMatch) return false;
                            return (
                                d.is_signed === true || d.isSigned === true ||
                                d.state === 3 || d.state === '3' || d.state === 'Signed' ||
                                d.estado === 3 || d.estado === '3' || d.estado === 'Firmado' ||
                                Boolean(d.final_pdf_path || d.finalPdfPath)
                            );
                        }
                    );
                    setAsyncFinalReportSigned(hasSignedFinal);
                }
            } catch {
                // Silencioso si aún no existe la instancia
            }
        };
        checkInstances();
        const onProjectsChanged = () => checkInstances();
        window.addEventListener('dosier-projects-changed', onProjectsChanged);
        return () => {
            isMounted = false;
            window.removeEventListener('dosier-projects-changed', onProjectsChanged);
        };
    }, [resolvedProjectUuid, finalReportTemplateCode, currentProject.status, projectDocuments]);

    return (
        <div className="bento-card static p-6 flex flex-col justify-between group">
            <div className="flex items-center gap-2.5 mb-2">
                <h3 className="text-xs font-semibold tracking-widest text-text-main uppercase opacity-90">
                    Flujo Institucional
                </h3>
            </div>

            <div className="relative pl-8 space-y-4 mt-6">
                {/* Track line */}
                <div className="absolute left-3 top-2.5 bottom-2.5 w-0.5 bg-border-thin"></div>

                {WorkflowPhases.map((phase, idx) => {
                    // Determinar el estado lógico de cada una de las fases
                    let isCurrent = false;
                    let isPast = false;
                    let isFuture = false;

                    const status = currentProject.status;

                    if (phase.id === 'Borrador') {
                        isPast = isProtocoloSigned || ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(status);
                        isCurrent = !isPast && (status === 'Borrador' || status === 'En Corrección' || status === 'Enviado');
                    } else if (phase.id === 'Enviado') {
                        // Fase 2: Revisión técnica del Administrador
                        isPast = ['En Revisión', 'Aprobado', 'En Ejecución', 'Finalizado'].includes(status);
                        isCurrent = !isPast && (status === 'Enviado' || (isProtocoloSigned && status === 'Borrador'));
                        isFuture = !isCurrent && !isPast;
                    } else if (phase.id === 'En Ejecución') {
                        isPast = status === 'Finalizado' || (status === 'En Ejecución' && isFinalReportSigned);
                        isCurrent = status === 'Aprobado' || (status === 'En Ejecución' && !isFinalReportSigned);
                        isFuture = status === 'Borrador' || status === 'En Corrección' || status === 'Enviado' || status === 'En Revisión';
                    } else if (phase.id === 'InformeFinal') {
                        isPast = status === 'Finalizado' || (status === 'En Ejecución' && isFinalReportSigned);
                        isCurrent = status === 'En Ejecución' && !isFinalReportSigned;
                        isFuture = status !== 'En Ejecución' && status !== 'Finalizado';
                    } else if (phase.id === 'RevisionInformeFinal') {
                        isPast = status === 'Finalizado';
                        isCurrent = status === 'En Ejecución' && isFinalReportSigned;
                        isFuture = status !== 'Finalizado' && !(status === 'En Ejecución' && isFinalReportSigned);
                    }

                    const showChecked = isPast;
                    const isCurrentActive = isCurrent;

                    // Determinar fecha límite correspondiente a la fase
                    let deadlineDate: string | null = null;
                    let deadlinePrefix: string = 'Plazo';

                    if (phase.id === 'Borrador' && status === 'En Corrección') {
                        deadlineDate = currentProject.fecha_limite_subsanacion || currentProject.fechaLimiteSubsanacion || null;
                        deadlinePrefix = 'Subsanación';
                    } else if (phase.id === 'En Ejecución' && status === 'En Ejecución' && !showChecked) {
                        deadlineDate = currentProject.fecha_fin || currentProject.fechaFin || null;
                        deadlinePrefix = 'Cierre Proyecto';
                    } else if (phase.id === 'InformeFinal' && status === 'En Ejecución' && !showChecked) {
                        deadlineDate = currentProject.fecha_limite_subsanacion_final || currentProject.fechaLimiteSubsanacionFinal
                            || currentProject.fecha_limite_informe_final || currentProject.fechaLimiteInformeFinal
                            || currentProject.fecha_fin || currentProject.fechaFin || null;
                        deadlinePrefix = (currentProject.fecha_limite_subsanacion_final || currentProject.fechaLimiteSubsanacionFinal)
                            ? 'Subsanación'
                            : 'Entrega';
                    }

                    return (
                        <div key={phase.id} className="relative group/step">
                            {/* Connector segment — verde sólido si está completado */}
                            {idx < WorkflowPhases.length - 1 && (
                                <div className={`absolute top-9 bottom-[-20px] transition-all duration-300 z-0 ${showChecked
                                    ? 'w-[2.5px] -left-[20.25px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                    : 'w-0.5 -left-[20px] bg-border-thin'
                                    }`} />
                            )}

                            {/* Step Dot */}
                            <div className={`absolute -left-[38px] top-0.5 w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-300 z-10 ${showChecked
                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.4)]'
                                : isCurrentActive
                                    ? 'bg-text-main border-text-main text-bg-deep ring-4 ring-text-main/10 shadow-[0_0_12px_rgba(0,0,0,0.08)] animate-pulse'
                                    : (phase.id === 'InformeFinal' && currentProject.status === 'En Ejecución')
                                        ? 'bg-surface border-text-dim/40 text-text-main'
                                        : 'bg-surface border-border-thin text-text-dim'
                                }`}>
                                {showChecked ? (
                                    <CheckCircle2 size={18} className="stroke-[2.5]" />
                                ) : (
                                    <span className="text-xs font-bold font-mono">{idx + 1}</span>
                                )}
                            </div>

                            {/* Card Content */}
                            <div
                                onClick={() => {
                                    if (phase.id === 'Borrador' && (isCurrent || isPast)) {
                                        if (templateCode === 'PROTOCOLO_INVESTIGACION') {
                                            setActiveDocument('PROTOCOLO_INVESTIGACION');
                                        } else {
                                            resolveDocumentInstance('PROTOCOLO_INVESTIGACION');
                                        }
                                    } else if (phase.id === 'Enviado' && (isCurrent || isPast)) {
                                        if (isAdmin) {
                                            navigate(`/investigacion/revision-tecnica/${resolvedProjectUuid}`);
                                        } else if (currentProject.status === 'En Corrección') {
                                            navigate(buildWorkspacePath(templateCode, resolvedProjectUuid, `?edit=${templateCodeToEditParam(templateCode)}`, urlPrefix));
                                        }
                                    } else if (phase.id === 'En Ejecución' && currentProject.status === 'Aprobado' && isAdmin && !iniciandoEjecucion) {
                                        handleIniciarEjecucion();
                                    } else if (phase.id === 'InformeFinal' && (currentProject.status === 'En Ejecución' || currentProject.status === 'Finalizado')) {
                                        navigate(buildWorkspacePath(templateCode, resolvedProjectUuid, `?edit=${templateCodeToEditParam(finalReportTemplateCode)}`, urlPrefix));
                                    } else if (phase.id === 'RevisionInformeFinal' && (currentProject.status === 'En Ejecución' || currentProject.status === 'Finalizado')) {
                                        navigate(`${urlPrefix}/revision-informe-final/${resolvedProjectUuid}`);
                                    }
                                }}
                                className={`p-4 rounded-xl border transition-all duration-300 ${isCurrentActive
                                    ? 'bg-surface border-text-dim/40 shadow-[0_2px_16px_rgba(0,0,0,0.06)] cursor-pointer ring-1 ring-text-dim/10'
                                    : showChecked
                                        ? 'bg-surface/20 border-border-thin cursor-pointer opacity-55 hover:opacity-80'
                                        : (isPast || (phase.id === 'InformeFinal' && currentProject.status === 'En Ejecución'))
                                            ? 'bg-surface/20 border-border-thin cursor-pointer opacity-55 hover:opacity-80'
                                            : isFuture
                                                ? 'bg-transparent border-transparent opacity-30 select-none'
                                                : 'bg-transparent border-transparent hover:border-border-thin/40 hover:bg-surface-hover/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className={`text-xs font-bold tracking-wider uppercase ${isCurrentActive
                                        ? 'text-text-main'
                                        : showChecked || isPast
                                            ? 'text-text-dim'
                                            : 'text-text-dim/60'
                                        }`}>
                                        {phase.label}
                                    </h3>
                                    {deadlineDate && !showChecked && renderDeadlineBadge(deadlineDate, deadlinePrefix)}
                                </div>
                                <p className="text-xs text-text-dim mt-1.5 leading-relaxed font-normal">
                                    {phase.id === 'Borrador' && (
                                        'Construcción colaborativa del protocolo de investigación por parte del equipo.'
                                    )}
                                    {phase.id === 'Enviado' && (
                                        (currentProject.status === 'Prepropuesta' || currentProject.status === 'Prepropuesta Rechazada')
                                            ? 'Validación y dictamen preliminar de la idea de proyecto por parte del Administrador.'
                                            : 'Revisión formal de requisitos, carga horaria, firmas y presupuesto institucional.'
                                    )}
                                    {phase.id === 'En Ejecución' && 'Seguimiento de hitos, envío de informes de avance y ejecución presupuestaria.'}
                                    {phase.id === 'InformeFinal' && 'Elaboración, consolidación de resultados, producción científica y firma digital del equipo.'}
                                    {phase.id === 'RevisionInformeFinal' && 'Auditoría técnica formal, verificación de cumplimiento de metas y dictamen de cierre institucional.'}
                                </p>

                                {/* 1. FORMULACIÓN */}
                                {phase.id === 'Borrador' && (
                                    <div className="mt-4">
                                        <Link
                                            to={buildWorkspacePath(templateCode, resolvedProjectUuid, `?edit=${templateCodeToEditParam(templateCode)}`, urlPrefix)}
                                            onClick={(e) => { e.stopPropagation(); }}
                                            className={`w-full justify-center py-2.5 transition-all duration-300 font-semibold flex items-center gap-1.5 ${isCurrentActive
                                                ? 'btn-vercel-primary shadow-[0_4px_12px_rgba(0,112,243,0.1)]'
                                                : 'btn-vercel-secondary'
                                                }`}
                                        >
                                            <FileText size={14} />
                                            <span>
                                                {(currentProject.puedeEditar === false || isPast)
                                                    ? 'Ver Protocolo'
                                                    : 'Editar Protocolo'}
                                            </span>
                                        </Link>
                                    </div>
                                )}

                                {/* 2. REVISIÓN ADMINISTRADOR (PROTOCOLO) */}
                                {phase.id === 'Enviado' && (isCurrent || isPast) && (
                                    <div className="mt-4 animate-fade-in flex flex-col gap-2.5">
                                        {isAdmin ? (
                                            <Link
                                                to={`/investigacion/revision-tecnica/${resolvedProjectUuid}`}
                                                onClick={(e) => { e.stopPropagation(); }}
                                                className={`w-full justify-center py-2.5 transition-all duration-300 font-semibold flex items-center gap-1.5 ${isCurrentActive
                                                    ? 'btn-vercel-primary shadow-[0_4px_12px_rgba(0,112,243,0.1)]'
                                                    : 'btn-vercel-secondary'
                                                    }`}
                                            >
                                                <Shield size={14} />
                                                <span>{isCurrentActive ? 'Iniciar Revisión Técnica' : 'Ver Revisión Técnica'}</span>
                                            </Link>
                                        ) : (
                                            <div className="w-full py-2.5 px-3 bg-surface/50 border border-border-thin rounded-xl text-center flex items-center justify-center gap-2 text-text-dim text-xs font-medium select-none">
                                                <Clock size={14} className="text-brand animate-pulse" />
                                                <span>En espera de dictamen institucional</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 3. EJECUCIÓN Y AVANCE */}
                                {phase.id === 'En Ejecución' && (
                                    (currentProject.status === 'Aprobado' || currentProject.status === 'En Ejecución' || currentProject.status === 'Finalizado') && (
                                        <div className="mt-4 animate-fade-in flex flex-col gap-2.5">
                                            {currentProject.codigoInstitucional && (
                                                <span className="badge-vercel badge-vercel-success !text-[11px] !py-2 font-mono w-full justify-center">
                                                    Código: {currentProject.codigoInstitucional}
                                                </span>
                                            )}

                                            {currentProject.status === 'Aprobado' ? (
                                                isAdmin ? (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleIniciarEjecucion(); }}
                                                        disabled={iniciandoEjecucion}
                                                        className="btn-vercel-primary !py-2.5 w-full justify-center font-semibold flex items-center gap-1.5 shadow-[0_4px_12px_rgba(0,112,243,0.1)] cursor-pointer disabled:opacity-50"
                                                    >
                                                        <Settings size={14} className={iniciandoEjecucion ? 'animate-spin' : ''} />
                                                        <span>{iniciandoEjecucion ? 'Iniciando...' : 'Iniciar Ejecución del Proyecto'}</span>
                                                    </button>
                                                ) : (
                                                    <div className="w-full py-2.5 px-3 bg-surface/50 border border-border-thin rounded-xl text-center flex items-center justify-center gap-2 text-text-dim text-xs font-medium select-none">
                                                        <Clock size={14} className="text-brand animate-pulse" />
                                                        <span>Proyecto aprobado — En espera de inicio de ejecución</span>
                                                    </div>
                                                )
                                            ) : (
                                                <Link
                                                    to={`${urlPrefix}/informes-avance/${currentProject.uuid}`}
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className="btn-vercel-primary !py-2.5 w-full justify-center font-semibold flex items-center gap-1.5"
                                                >
                                                    <BarChart size={14} />
                                                    <span>Informes de Avance</span>
                                                </Link>
                                            )}
                                        </div>
                                    )
                                )}

                                {/* 4. INFORME FINAL (FORMULACIÓN / REDACCIÓN POR EL EQUIPO) */}
                                {phase.id === 'InformeFinal' && (
                                    (currentProject.status === 'En Ejecución' || currentProject.status === 'Finalizado') && (
                                        <div className="mt-4 animate-fade-in flex flex-col gap-2.5">
                                            <Link
                                                to={buildWorkspacePath(templateCode, resolvedProjectUuid, `?edit=${templateCodeToEditParam(finalReportTemplateCode)}`, urlPrefix)}
                                                onClick={(e) => { e.stopPropagation(); }}
                                                className={`btn-vercel-primary !py-2.5 w-full justify-center font-semibold flex items-center gap-1.5 ${resolvingDocument === finalReportTemplateCode ? 'pointer-events-none opacity-50' : ''} ${isCurrentActive
                                                    ? 'btn-vercel-primary shadow-[0_4px_12px_rgba(0,112,243,0.1)]'
                                                    : 'btn-vercel-secondary'
                                                    }`}
                                            >
                                                <FileSignature size={14} />
                                                <span>
                                                    {isFinalReportSigned || currentProject.status === 'Finalizado'
                                                        ? 'Ver Informe Final'
                                                        : 'Redactar / Firmar Informe Final'}
                                                </span>
                                            </Link>
                                        </div>
                                    )
                                )}

                                {/* 6. REVISIÓN INFORME FINAL (AUDITORÍA TÉCNICA DEL ADMINISTRADOR) */}
                                {phase.id === 'RevisionInformeFinal' && (
                                    (currentProject.status === 'En Ejecución' || currentProject.status === 'Finalizado') && (
                                        <div className="mt-4 animate-fade-in flex flex-col gap-2.5">
                                            {isAdmin ? (
                                                <Link
                                                    to={`${urlPrefix}/revision-informe-final/${resolvedProjectUuid}`}
                                                    onClick={(e) => { e.stopPropagation(); }}
                                                    className={`w-full justify-center py-2.5 transition-all duration-300 font-semibold flex items-center gap-1.5 ${isCurrentActive
                                                        ? 'btn-vercel-primary shadow-[0_4px_12px_rgba(0,112,243,0.1)]'
                                                        : 'btn-vercel-secondary'
                                                        }`}
                                                >
                                                    <Shield size={14} />
                                                    <span>{isCurrentActive ? 'Auditar y Dictaminar Cierre' : 'Ver Auditoría de Cierre'}</span>
                                                </Link>
                                            ) : currentProject.status === 'Finalizado' ? (
                                                <div className="w-full py-2.5 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-semibold select-none">
                                                    <CheckCircle2 size={14} />
                                                    <span>Cierre Institucional Aprobado Formalmente</span>
                                                </div>
                                            ) : (
                                                <div className="w-full py-2.5 px-3 bg-surface/50 border border-border-thin rounded-xl text-center flex items-center justify-center gap-2 text-text-dim text-xs font-medium select-none">
                                                    <Clock size={14} className="text-brand animate-pulse" />
                                                    <span>En espera de auditoría final por el Administrador</span>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CacesWorkflow;



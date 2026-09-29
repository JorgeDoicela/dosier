import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, AlertCircle, FileText, BarChart3, ArrowUpRight } from 'lucide-react';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import WorkspaceActivityPanel from '../WorkspaceActivityPanel';

interface WorkspaceSidebarProps {
    currentProject: {
        linea: string;
        status: string;
        puedeEditar?: boolean;
        puedeFirmar?: boolean;
        directorProyecto?: string;
        dominio?: string;
        fechaLimiteSubsanacion?: string | null;
        fecha_limite_subsanacion?: string | null;
        [key: string]: any;
    };
    projectDocuments?: any[];
    resolvedProjectUuid: string | null;
    setActiveDocument?: (doc: string) => void;
    isAdmin?: boolean;
}

export const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
    currentProject,
    projectDocuments,
    resolvedProjectUuid,
    setActiveDocument,
    isAdmin = false
}) => {
    const location = useLocation();
    const [asyncProtocoloSigned, setAsyncProtocoloSigned] = useState(false);

    const isMisProyectos = location.pathname.startsWith('/documentacion/mis-proyectos');
    const monitoringUrl = isMisProyectos
        ? `/documentacion/mis-proyectos/monitoreo/${resolvedProjectUuid}`
        : `/documentacion/monitoreo/${resolvedProjectUuid}`;

    const isDocValidlySigned = (doc: any): boolean => {
        if (!doc) return false;
        if (['Aprobado', 'En Ejecución', 'Finalizado'].includes(currentProject.status)) return true;
        const hasSignedState = doc.state === 3 || doc.state === '3' || doc.state === 'Signed' || doc.estado === 'Firmado' || doc.is_signed === true || doc.isSigned === true;
        const hasSignedFile = Boolean(doc.final_pdf_path || doc.finalPdfPath);
        return hasSignedState || hasSignedFile;
    };

    const derivedSignatures = useMemo(() => {
        if (!projectDocuments || projectDocuments.length === 0) return null;
        const protoDoc = projectDocuments.find(
            (d: any) => d.template_code === 'PEA_OFICIAL' || d.templateCode === 'PEA_OFICIAL'
        );

        return {
            isProtocoloSigned: isDocValidlySigned(protoDoc)
        };
    }, [projectDocuments, currentProject.status]);

    const isProtocoloSigned = derivedSignatures ? derivedSignatures.isProtocoloSigned : asyncProtocoloSigned;

    useEffect(() => {
        if (projectDocuments && projectDocuments.length > 0) return;
        let isMounted = true;
        const checkSignatures = async () => {
            if (!resolvedProjectUuid) return;
            try {
                const docs = await documentInstanceService.getByEntity(resolvedProjectUuid);
                if (isMounted && Array.isArray(docs)) {
                    const protoDoc = docs.find(
                        (d: any) => d.template_code === 'PEA_OFICIAL' || d.templateCode === 'PEA_OFICIAL'
                    );
                    setAsyncProtocoloSigned(isDocValidlySigned(protoDoc));
                }
            } catch {
                // Silencioso
            }
        };

        checkSignatures();
        const onProjectsChanged = () => checkSignatures();
        window.addEventListener('dosier-projects-changed', onProjectsChanged);
        return () => {
            isMounted = false;
            window.removeEventListener('dosier-projects-changed', onProjectsChanged);
        };
    }, [resolvedProjectUuid, currentProject.status, projectDocuments]);

    const isAllFormulationSigned = isProtocoloSigned;

    return (
        <div className="flex flex-col gap-3">
            {/* Banner de Revisión Técnica para el Administrador */}
            {isAdmin && currentProject.status === 'Enviado' && resolvedProjectUuid && isAllFormulationSigned && (
                <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-xs animate-fade-in group">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Shield size={14} className="text-[#0070f3]" />
                            <span className="text-xs font-bold text-[#0070f3] uppercase tracking-wider">Revisión Técnica Requerida</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            El protocolo ha sido remitido por el Director para su revisión técnica.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Link
                            to={`/documentacion/revision-tecnica/${resolvedProjectUuid}`}
                            className="w-full bg-[#0070f3] text-white hover:bg-[#005bb5] py-2 px-3 text-xs font-semibold rounded-md no-underline flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Shield size={12} />
                            <span>Iniciar Revisión Técnica</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Banner de Correcciones Requeridas para el Docente/Investigador */}
            {!isAdmin && currentProject.status === 'En Corrección' && (
                <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg p-5 flex flex-col justify-between shadow-xs animate-fade-in group">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <AlertCircle size={14} className="text-amber-500" />
                            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Correcciones Requeridas</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            El revisor ha retornado el instrumento con observaciones que deben ser atendidas en su contenido curricular.
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (setActiveDocument) setActiveDocument('PEA_OFICIAL');
                            }}
                            className="w-full bg-[#0070f3] hover:bg-[#0060df] text-white py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all"
                        >
                            <FileText size={12} />
                            <span>Atender Observaciones</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Panel de Actividad Reciente */}
            {resolvedProjectUuid && (
                <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg flex flex-col overflow-hidden">
                    <WorkspaceActivityPanel
                        projectUuid={resolvedProjectUuid}
                    />
                </div>
            )}

            {/* Botón de Acceso a Monitoreo Gantt */}
            {resolvedProjectUuid && (
                <div className="bg-surface border border-slate-200/90 dark:border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 size={13} className="text-[#0070f3]" />
                            <span className="text-xs font-semibold text-text-main">
                                Monitoreo & Gantt
                            </span>
                        </div>
                        <span className="text-[10px] font-mono font-medium text-slate-500 dark:text-zinc-400">
                            Fase C
                        </span>
                    </div>
                    <p className="text-xs text-text-dim leading-relaxed">
                        Seguimiento del cronograma, avance de hitos y temporalidad de la planificación curricular.
                    </p>
                    <Link
                        to={monitoringUrl}
                        className="w-full bg-surface hover:bg-zinc-50 dark:hover:bg-zinc-800 text-text-main border border-slate-200/90 dark:border-zinc-800 py-2 px-3 text-xs rounded-lg no-underline flex items-center justify-center gap-2 group transition-all"
                    >
                        <BarChart3 size={13} className="text-slate-400 dark:text-zinc-500 group-hover:text-[#0070f3] transition-colors" />
                        <span className="font-medium text-text-main group-hover:text-[#0070f3] transition-colors">Monitoreo Gantt</span>
                        <ArrowUpRight size={12} className="text-slate-400 dark:text-zinc-500 group-hover:text-[#0070f3] ml-auto transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSidebar;

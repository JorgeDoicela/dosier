import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertCircle, FileText } from 'lucide-react';
import api from '../../../../../api/axios_config';
import WorkspaceActivityPanel from '../WorkspaceActivityPanel';

interface WorkspaceSidebarProps {
    currentProject: {
        linea: string;
        presupuesto: number;
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
    const [asyncProtocoloSigned, setAsyncProtocoloSigned] = useState(false);

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
            (d: any) => d.template_code === 'PROTOCOLO_INVESTIGACION' || d.templateCode === 'PROTOCOLO_INVESTIGACION'
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
                const res = await api.get(`/documents/instances/entity/${resolvedProjectUuid}`);
                if (isMounted && Array.isArray(res.data)) {
                    const protoDoc = res.data.find(
                        (d: any) => d.template_code === 'PROTOCOLO_INVESTIGACION' || d.templateCode === 'PROTOCOLO_INVESTIGACION'
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
                <div className="bento-card static p-5 flex flex-col justify-between border border-brand/30 bg-brand/[0.03] shadow-md animate-fade-in relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <Shield size={13} className="text-brand animate-pulse" />
                            <span className="section-label text-brand">Revisión Técnica Requerida</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            El protocolo ha sido remitido por el Director para su revisión técnica.
                        </p>
                    </div>
                    <div className="mt-4">
                        <Link
                            to={`/investigacion/revision-tecnica/${resolvedProjectUuid}`}
                            className="w-full btn-brand py-2 px-3 text-[10px] rounded-md no-underline flex items-center justify-center gap-1.5"
                        >
                            <Shield size={12} />
                            <span>Iniciar Revisión Técnica</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Banner de Correcciones Requeridas para el Docente/Investigador */}
            {!isAdmin && currentProject.status === 'En Corrección' && (
                <div className="bento-card static p-5 flex flex-col justify-between border border-warning/30 bg-warning/[0.03] shadow-md animate-fade-in relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-warning/5 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <AlertCircle size={13} className="text-warning animate-pulse" />
                            <span className="section-label text-warning">Correcciones Requeridas</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            El administrador ha retornado el proyecto con observaciones técnicas que deben ser atendidas en su protocolo.
                        </p>
                    </div>
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (setActiveDocument) setActiveDocument('PROTOCOLO_INVESTIGACION');
                            }}
                            className="w-full btn-vercel-primary py-2 px-3 text-[10px] rounded-md flex items-center justify-center gap-1.5"
                        >
                            <FileText size={12} />
                            <span>Atender Observaciones</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Panel de Actividad Reciente */}
            {resolvedProjectUuid && (
                <div className="bento-card static flex flex-col overflow-hidden">
                    <WorkspaceActivityPanel
                        projectUuid={resolvedProjectUuid}
                    />
                </div>
            )}
        </div>
    );
};

export default WorkspaceSidebar;

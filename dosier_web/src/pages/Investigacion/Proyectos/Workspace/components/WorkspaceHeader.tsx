import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

interface WorkspaceHeaderProps {
    currentProject: {
        id: string;
        uuid: string;
        title: string;
        status: string;
        linea: string;
    };
    isSidebarCollapsed: boolean;
    urlPrefix: string;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
    currentProject,
    isSidebarCollapsed,
    urlPrefix,
}) => {
    const returnPath = urlPrefix;
    const returnLabel = urlPrefix.endsWith('mis-proyectos') ? 'Mis Instrumentos PEA' : 'Documentación Curricular';
    const projectCode = (currentProject as any).codigo_institucional || (currentProject as any).codigo || `Instrumento #${currentProject.id}`;

    return (
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 sm:px-10 py-3.5 bg-bg-deep border-b border-border-thin z-50 gap-4 sm:gap-0">
            <div className="flex items-center gap-3">
                {isSidebarCollapsed && (
                    <>
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent('dosier-toggle-sidebar', { detail: 'expand' }))}
                            className="p-1.5 rounded-md hover:bg-surface-hover text-text-dim hover:text-text-main transition-colors duration-150 cursor-pointer animate-fade-in"
                            title="Mostrar panel lateral"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="w-4 h-4"
                            >
                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                <path d="M9 3v18" />
                            </svg>
                        </button>
                        <div className="h-4 w-[1px] bg-border-thin mx-1" />
                    </>
                )}
                <Link 
                    to={returnPath} 
                    className="p-1.5 rounded-md hover:bg-surface-hover text-text-dim hover:text-text-main transition-colors cursor-pointer inline-flex items-center justify-center"
                    title="Volver"
                >
                    <ArrowLeft size={16} />
                </Link>
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-dim font-medium">
                        <Link 
                            to={returnPath}
                            className="hover:text-text-main cursor-pointer transition-colors duration-150 no-underline text-inherit"
                        >
                            {returnLabel}
                        </Link>
                        <ChevronRight size={10} className="opacity-60" />
                        <span className="text-text-main font-semibold font-mono">{projectCode}</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default WorkspaceHeader;

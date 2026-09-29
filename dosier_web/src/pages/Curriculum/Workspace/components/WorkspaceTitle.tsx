import React from 'react';
import { FileSignature } from 'lucide-react';
import { useWorkflowStates } from '../../../../hooks/useWorkflowStates';

interface WorkspaceTitleProps {
    currentProject: {
        title: string;
        status: string;
        uuid: string;
        id: string;
    };
    user: any;
    templateCode: string;
    setActiveDocument: (doc: string) => void;
}

export const WorkspaceTitle: React.FC<WorkspaceTitleProps> = ({
    currentProject,
    templateCode,
    setActiveDocument
}) => {
    const { getEstadoConfig } = useWorkflowStates();
    const cfg = getEstadoConfig(currentProject.status);
    return (
        <>
            {/* ── Page Title ── */}
            <header className="mb-6 md:mb-8 animate-fade-in">
                <div className="space-y-3 max-w-4xl">
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug break-words">
                        {currentProject.title?.trim() || '(Sin título)'}
                    </h1>

                    {/* Metadatos y Badges en una sola línea ordenada */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        {((currentProject as any).codigo_institucional || (currentProject as any).codigo) && (
                            <span className="text-[11px] font-mono text-text-dim font-medium">
                                {(currentProject as any).codigo_institucional || (currentProject as any).codigo}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] font-medium" style={cfg.style}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} style={cfg.dotStyle} />
                            <span>{cfg.label}</span>
                        </div>
                        {(currentProject as any).linea && (
                            <span className="text-[11px] text-text-dim truncate max-w-[280px]" title={(currentProject as any).linea}>
                                {(currentProject as any).linea}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {templateCode && templateCode !== 'PEA_OFICIAL' && (
                <div className="mb-8 p-6 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <FileSignature size={22} className="text-[#0070f3] dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-xs font-semibold text-text-main uppercase tracking-widest">
                                Documento en Edición
                            </h3>
                            <p className="text-xs text-text-dim mt-1.5 leading-relaxed">
                                Estás en el espacio de trabajo de este instrumento curricular. Puedes continuar completando los campos colaborativos del documento o revisar el estado institucional abajo.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveDocument(templateCode)}
                        className="px-5 py-2.5 rounded-lg bg-[#0070f3] hover:bg-[#0060df] text-white text-xs font-semibold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto shrink-0"
                    >
                        <FileSignature size={14} />
                        <span>Continuar Editando</span>
                    </button>
                </div>
            )}
        </>
    );
};

export default WorkspaceTitle;

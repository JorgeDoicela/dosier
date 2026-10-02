import React, { useState } from 'react';
import { ArrowLeft, FileText, Eye, Scale, History, Download, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../../../api/AuthContext';

interface RevisionHeaderProps {
    projectTitle: string;
    projectUuid?: string;
    projectStatus?: string;
    viewMode: 'interactive' | 'pdf' | 'history';
    setViewMode: (mode: 'interactive' | 'pdf' | 'history') => void;
    onNavigateBack: () => void;
    onOpenFinalizeModal: () => void;
    isReadonly?: boolean;
    pdfUrl?: string | null;
}

export const RevisionHeader: React.FC<RevisionHeaderProps> = ({
    projectTitle,
    projectStatus,
    viewMode,
    setViewMode,
    onNavigateBack,
    onOpenFinalizeModal,
    isReadonly = false,
    pdfUrl
}) => {
    const { isAdmin } = useAuth();
    const isAuditActive = isAdmin && !isReadonly && (projectStatus === 'Enviado' || projectStatus === 'En Corrección');

    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    });

    const toggleTheme = () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        document.documentElement.setAttribute('data-theme', nextMode ? 'dark' : 'light');
        localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    };

    const handleDownloadPdf = () => {
        if (!pdfUrl) return;
        const link = document.createElement('a');
        link.href = pdfUrl;
        const safeName = projectTitle
            ? projectTitle.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)
            : 'Instrumento_Curricular';
        link.download = `Instrumento_${safeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = () => {
        if (!projectStatus) return null;
        let dotColor = 'bg-slate-400';
        let textColor = 'text-slate-600 dark:text-zinc-400';
        if (projectStatus === 'Enviado') {
            dotColor = 'bg-[#0070f3]';
            textColor = 'text-[#0070f3] dark:text-blue-400';
        } else if (projectStatus === 'En Corrección') {
            dotColor = 'bg-amber-500';
            textColor = 'text-amber-600 dark:text-amber-400';
        } else if (projectStatus === 'En Revisión') {
            dotColor = 'bg-blue-500';
            textColor = 'text-blue-600 dark:text-blue-400';
        } else if (projectStatus === 'Aprobado' || projectStatus === 'En Ejecución') {
            dotColor = 'bg-emerald-500';
            textColor = 'text-emerald-600 dark:text-emerald-400';
        }
        
        return (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-medium ${textColor}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                <span>{projectStatus}</span>
            </span>
        );
    };

    return (
        <div className="px-4 md:px-6 py-2.5 border-b border-border-thin bg-surface flex flex-col md:flex-row justify-between items-center gap-3 md:gap-0 z-[50] shrink-0 font-sans">
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div className="flex items-center gap-3">
                    {/* Botón Volver */}
                    <button
                        onClick={onNavigateBack}
                        className="flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer text-xs font-medium bg-white dark:bg-zinc-950 shadow-2xs"
                        title="Volver"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                        <span>Volver</span>
                    </button>

                    {/* Divisor Vertical */}
                    <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-0.5" />

                    {/* Identidad */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xs md:text-sm font-black text-text-main tracking-tight uppercase leading-none truncate max-w-[150px] xs:max-w-[220px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[460px]" title={projectTitle}>
                                {projectTitle || 'Cargando...'}
                            </h2>
                            {getStatusBadge()}
                        </div>
                        <p className="text-[8px] text-text-dim font-bold uppercase tracking-widest mt-1 truncate">
                            Revisión Técnica del Programa de Estudio de la Asignatura (PEA)
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
                {/* Selector de Vistas Tri-estado */}
                <div className="flex items-center gap-1 border border-border-thin bg-surface p-1 rounded-xl shadow-2xs">
                    <button
                        onClick={() => setViewMode('interactive')}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'interactive'
                            ? 'bg-text-main text-bg-deep font-bold shadow-xs'
                            : 'text-text-dim hover:text-text-main hover:bg-surface-hover'
                            }`}
                        title="Inspeccionar secciones del PEA"
                    >
                        <Eye size={11} />
                        <span>Revisión Contextual</span>
                    </button>
                    <button
                        onClick={() => setViewMode('pdf')}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'pdf'
                            ? 'bg-text-main text-bg-deep font-bold shadow-xs'
                            : 'text-text-dim hover:text-text-main hover:bg-surface-hover'
                            }`}
                        title="Ver documento en PDF oficial"
                    >
                        <FileText size={11} />
                        <span>Vista PDF</span>
                    </button>
                    <button
                        onClick={() => setViewMode('history')}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === 'history'
                            ? 'bg-text-main text-bg-deep font-bold shadow-xs'
                            : 'text-text-dim hover:text-text-main hover:bg-surface-hover'
                            }`}
                        title="Ver dictamen y trazabilidad oficial"
                    >
                        <History size={11} />
                        <span>Historial & Dictamen</span>
                    </button>
                </div>

                {/* Botón Descargar PDF */}
                {pdfUrl && (
                    <button
                        onClick={handleDownloadPdf}
                        className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-thin text-text-main shadow-2xs transition-all cursor-pointer flex items-center justify-center active:scale-95"
                        title="Descargar archivo PDF"
                        aria-label="Descargar archivo PDF"
                    >
                        <Download size={13} />
                    </button>
                )}

                {/* Botón Alternar Tema */}
                <button
                    onClick={toggleTheme}
                    className="p-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-thin text-text-main shadow-2xs transition-all cursor-pointer flex items-center justify-center active:scale-95"
                    title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    aria-label={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                >
                    {isDarkMode ? (
                        <Sun size={13} className="text-amber-400 hover:rotate-45 transition-transform" />
                    ) : (
                        <Moon size={13} className="text-slate-700 dark:text-zinc-300 hover:-rotate-12 transition-transform" />
                    )}
                </button>

                {/* Botón de Auditoría Activa */}
                {isAuditActive ? (
                    <button
                        onClick={onOpenFinalizeModal}
                        className="px-3.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand text-white hover:bg-brand/90 shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                        <Scale size={12} />
                        Emitir Dictamen
                    </button>
                ) : (
                    <span className="px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider bg-surface border border-border-thin text-text-dim flex items-center gap-1.5 font-mono shadow-2xs">
                        Consulta
                    </span>
                )}
            </div>
        </div>
    );
};

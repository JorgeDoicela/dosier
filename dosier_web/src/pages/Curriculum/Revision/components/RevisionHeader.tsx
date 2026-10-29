import React, { useState } from 'react';
import {
    ArrowLeft,
    FileText,
    Eye,
    Scale,
    History,
    Download,
    Sun,
    Moon,
    CheckCircle2,
    MessageSquare,
    AlertCircle,
    BookOpen,
    Clock
} from 'lucide-react';
import { useAuth } from '../../../../api/AuthContext';
import {
    normalizePeaStatus,
    isPeaBorrador,
    isPeaEnRevision,
    isPeaAvalado,
    getPeaStatusDescriptor
} from '../../utils/peaStatusWorkflow';

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
    isRightSidebarOpen?: boolean;
    onToggleRightSidebar?: () => void;
    totalObservationsCount?: number;
    pendingObservationsCount?: number;
    isVisible?: boolean;
}

export const RevisionHeader: React.FC<RevisionHeaderProps> = ({
    projectTitle,
    projectStatus,
    viewMode,
    setViewMode,
    onNavigateBack,
    onOpenFinalizeModal,
    isReadonly = false,
    pdfUrl,
    isRightSidebarOpen = false,
    onToggleRightSidebar,
    totalObservationsCount = 0,
    pendingObservationsCount = 0,
    isVisible = true
}) => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isAuthority = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;

    const isReviewState = isPeaEnRevision(projectStatus) || isPeaAvalado(projectStatus);
    const isAuditActive = isAuthority && !isReadonly && isPeaEnRevision(projectStatus);

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
        link.download = `PEA_${safeName}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getStatusBadge = () => {
        if (!projectStatus) return null;
        const descriptor = getPeaStatusDescriptor(projectStatus);
        const label = descriptor.key === 'EnRevision' ? 'Revisión' : descriptor.label;
        return (
            <span className={`inline-flex items-center text-xs font-medium ${descriptor.textClass}`}>
                <span>{label}</span>
            </span>
        );
    };

    const getActionButtonLabel = () => {
        if (isVicerrector) return 'Legalizar y dictaminar';
        if (isCoordAcad) return 'Emitir aval académico';
        if (isCoordCarrera) return 'Emitir aval de carrera';
        return 'Gestionar dictamen';
    };

    return (
        <header
            className={`absolute top-0 left-0 right-0 px-4 md:px-6 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800 z-[50] font-sans transition-all duration-300 ease-in-out ${
                isVisible ? 'translate-y-0 opacity-100 shadow-xs' : '-translate-y-full opacity-0 pointer-events-none'
            }`}
        >
            <div className="h-14 flex items-center justify-between gap-6">
                {/* 1. Izquierda: Volver y Riel Plano de Pestañas */}
                <div className="h-full flex items-center gap-5 min-w-0">
                    <button
                        onClick={onNavigateBack}
                        className="flex items-center gap-1.5 py-1 px-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors group cursor-pointer text-xs font-medium shrink-0"
                        title="Volver a la lista de asignaturas"
                        aria-label="Volver"
                    >
                        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
                        <span>Volver</span>
                    </button>

                    <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 shrink-0" />

                    <nav className="h-full -mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar shrink-0" aria-label="Vistas de revisión">
                        <button
                            type="button"
                            onClick={() => setViewMode('interactive')}
                            className={`h-full text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                                viewMode === 'interactive'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                            }`}
                        >
                            <Eye size={13} />
                            <span>Revisión del PEA</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('pdf')}
                            className={`h-full text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                                viewMode === 'pdf'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                            }`}
                        >
                            <FileText size={13} />
                            <span>Documento oficial PDF</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setViewMode('history')}
                            className={`h-full text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                                viewMode === 'history'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                            }`}
                        >
                            <History size={13} />
                            <span>Historial y firmas</span>
                        </button>
                    </nav>
                </div>

                {/* 3. Derecha: Acciones de Cabecera y Dictamen */}
                <div className="flex items-center gap-2 shrink-0">
                    {/* Indicador Informativo Discreto de Observaciones */}
                    {pendingObservationsCount > 0 && (
                        <span
                            className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            title={`${pendingObservationsCount} observaciones pendientes de subsanar`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{pendingObservationsCount} {pendingObservationsCount === 1 ? 'pendiente' : 'pendientes'}</span>
                        </span>
                    )}

                    <button
                        onClick={toggleTheme}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                        title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                        aria-label="Alternar tema"
                    >
                        {isDarkMode ? (
                            <Sun size={14} className="text-amber-400 hover:rotate-45 transition-transform" />
                        ) : (
                            <Moon size={14} className="text-slate-700 dark:text-zinc-300 hover:-rotate-12 transition-transform" />
                        )}
                    </button>

                    {/* Botón Principal de Aval o Dictamen */}
                    {isAuditActive ? (
                        <button
                            onClick={onOpenFinalizeModal}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <Scale size={13} />
                            <span>{getActionButtonLabel()}</span>
                        </button>
                    ) : normalizePeaStatus(projectStatus) === 'Aprobado' || normalizePeaStatus(projectStatus) === 'Publicado' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 size={13} />
                            <span>Aprobado</span>
                        </span>
                    ) : isPeaBorrador(projectStatus) ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            <Clock size={13} className="text-slate-400" />
                            <span>Borrador en formulación</span>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                            Modo consulta
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
};

import React from 'react';
import {
    ChevronLeft,
    BookOpen,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    FileText,
    Users,
    DollarSign,
    Calendar,
    Target,
    CheckSquare,
    BarChart,
    Library,
    Award,
    Shield
} from 'lucide-react';
import { SECTIONS } from '../types/revisionTecnicaTypes';
import type { SectionComment } from '../types/revisionTecnicaTypes';

interface SectionsSidebarProps {
    isOpen: boolean;
    width: number;
    isDraggingLeft: boolean;
    leftSidebarRef: React.RefObject<HTMLDivElement>;
    activeSection: string;
    setActiveSection: (section: string) => void;
    onClose: () => void;
    startDraggingLeft: (e: React.MouseEvent) => void;
    comments: Record<string, SectionComment[]>;
    templateBlocks?: any[];
    templateSections?: any[];
    onOpenFinalizeModal?: () => void;
}

const ICON_MAP: Record<string, any> = {
    BookOpen,
    FileText,
    Users,
    DollarSign,
    Calendar,
    Target,
    CheckSquare,
    BarChart,
    Library,
    Award,
    Shield
};

export const SectionsSidebar: React.FC<SectionsSidebarProps> = ({
    isOpen,
    width,
    isDraggingLeft,
    leftSidebarRef,
    activeSection,
    setActiveSection,
    onClose,
    startDraggingLeft,
    comments,
    templateBlocks,
    templateSections,
    onOpenFinalizeModal
}) => {
    const SECTION_FIELD_KEYS: Record<string, string[]> = {
        pea_general_section: ['NombreAsignatura', 'CodigoAsignatura', 'Carrera', 'CodigoCarrera', 'Modalidad', 'UnidadOrganizacion', 'Periodo', 'Nivel', 'TotalHorasAsignatura', 'Creditos', 'HorasContactoDocente', 'HorasPracticoExperimental', 'HorasAutonomo', 'DocenteElaborador'],
        pea_objectives_section: ['ObjetivoAsignatura'],
        pea_prerequisites_section: ['Prerrequisitos'],
        pea_competencies_rda_section: ['RdaCarrera', 'ResultadosAprendizaje'],
        pea_contents_section: ['Unidades'],
        pea_methodology_section: ['MetodologiaEnsenanza', 'RecursosDidacticos'],
        pea_resources_section: ['ActividadesPracticas'],
        pea_evaluation_section: ['EvaluacionAprendizaje', 'Evaluaciones'],
        pea_bibliography_section: ['BibliografiaBasica', 'BibliografiaConsulta'],
        pea_signatures_section: ['FirmasResponsabilidad']
    };

    const getSectionCommentsCount = (secId: string): number => {
        const keys = SECTION_FIELD_KEYS[secId] || [secId];
        return keys.reduce((acc, k) => acc + (comments[k]?.length || 0), 0);
    };

    // Calcular las secciones visibles dinámicas
    const sectionsToDisplay = React.useMemo(() => {
        // 1. Si provienen directamente de ui-config
        if (templateSections && Array.isArray(templateSections) && templateSections.length > 0) {
            return templateSections.map(sec => {
                const mappedIcon = (sec.iconName && ICON_MAP[sec.iconName]) || (SECTIONS.find(s => s.id === sec.id)?.icon) || BookOpen;
                return {
                    id: sec.id,
                    label: sec.label || sec.title || 'Sección',
                    icon: mappedIcon
                };
            });
        }

        return SECTIONS;
    }, [templateSections]);

    return (
        <div
            ref={leftSidebarRef}
            style={{ width: isOpen ? `${width}px` : '0px' }}
            className={`h-full bg-bg-deep border-r border-border-thin flex flex-col shrink-0 relative overflow-hidden select-none ${
                isDraggingLeft ? 'transition-none' : 'transition-all duration-300'
            }`}
        >
            {/* Header con estilo Workspace */}
            <div className="p-5 pb-3 border-b border-border-thin flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-text-main shrink-0" />
                    <span className="text-[10px] font-black text-text-dim uppercase tracking-[0.2em] font-mono">
                        Navegación del PEA
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 hover:bg-surface-hover rounded-lg text-text-dim hover:text-text-main transition-colors cursor-pointer"
                    title="Contraer navegación"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Lista de Secciones */}
            <div className="p-4 flex flex-col gap-2 flex-1 overflow-y-auto custom-scrollbar">
                {sectionsToDisplay.map((sec) => {
                    const SecIcon = sec.icon;
                    const isActive = activeSection === sec.id;
                    const commentCount = getSectionCommentsCount(sec.id);

                    return (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all cursor-pointer group ${
                                isActive
                                    ? 'bg-text-main text-bg-deep font-bold shadow-lg translate-x-1'
                                    : 'text-text-dim hover:text-text-main hover:bg-surface-hover/80 font-semibold'
                            }`}
                        >
                            <div className="flex items-center gap-3 min-w-0 pr-2">
                                <SecIcon
                                    size={16}
                                    className={`shrink-0 transition-transform ${
                                        isActive ? 'text-bg-deep scale-110' : 'text-text-dim group-hover:text-text-main'
                                    }`}
                                />
                                <span className="text-xs uppercase tracking-wider truncate font-sans">
                                    {sec.label}
                                </span>
                            </div>

                            {/* Badge de estado / observaciones */}
                            <div className="flex items-center gap-1.5 shrink-0">
                                {commentCount > 0 ? (
                                    <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-mono font-medium ${
                                            isActive
                                                ? 'text-bg-deep'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}
                                        title={`${commentCount} observación(es)`}
                                    >
                                        <AlertCircle size={11} className="shrink-0" />
                                        <span>{commentCount}</span>
                                    </span>
                                ) : (
                                    <span
                                        className={`p-0.5 rounded-full opacity-40 group-hover:opacity-100 transition-opacity ${
                                            isActive ? 'text-bg-deep' : 'text-emerald-500'
                                        }`}
                                        title="Sin observaciones"
                                    >
                                        <CheckCircle2 size={12} />
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>


            {/* Tirador Resizer derecho */}
            <div
                onMouseDown={startDraggingLeft}
                className="absolute top-0 right-0 bottom-0 w-1.5 cursor-col-resize hover:bg-brand/35 active:bg-brand/50 z-20 transition-all"
                title="Arrastra para ajustar el ancho"
            />
        </div>
    );
};

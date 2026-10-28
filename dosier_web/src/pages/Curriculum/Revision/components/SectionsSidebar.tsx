import React from 'react';
import {
    ChevronLeft,
    BookOpen
} from 'lucide-react';
import { SECTIONS } from '../types/revisionTecnicaTypes';
import type { SectionComment } from '../types/revisionTecnicaTypes';

interface SectionsSidebarProps {
    isOpen: boolean;
    width: number;
    leftSidebarRef: React.RefObject<HTMLDivElement>;
    activeSection: string;
    setActiveSection: (section: string) => void;
    onClose: () => void;
    comments: Record<string, SectionComment[]>;
    templateBlocks?: any[];
    templateSections?: any[];
    onOpenFinalizeModal?: () => void;
}

export const SectionsSidebar: React.FC<SectionsSidebarProps> = ({
    isOpen,
    width,
    leftSidebarRef,
    activeSection,
    setActiveSection,
    onClose,
    comments
}) => {
    const SECTION_FIELD_KEYS: Record<string, string[]> = {
        pea_general_section: [
            'NombreAsignatura',
            'CodigoAsignatura',
            'Carrera',
            'CodigoCarrera',
            'Modalidad',
            'UnidadOrganizacion',
            'Periodo',
            'Nivel',
            'TotalHorasAsignatura',
            'Creditos',
            'HorasContactoDocente',
            'HorasPracticoExperimental',
            'HorasAutonomo',
            'DocenteElaborador'
        ],
        pea_objectives_section: ['ObjetivoAsignatura'],
        pea_prerequisites_section: ['Prerrequisitos'],
        pea_career_outcomes_section: ['RdaCarrera'],
        pea_subject_outcomes_section: ['ResultadosAprendizaje'],
        pea_contents_section: ['Unidades'],
        pea_methodology_section: ['MetodologiaEnsenanza', 'RecursosDidacticos'],
        pea_resources_section: ['ActividadesPracticas'],
        pea_evaluation_section: ['Evaluaciones', 'EvaluacionAprendizaje'],
        pea_bibliography_section: ['BibliografiaBasica', 'BibliografiaConsulta'],
        pea_signatures_section: ['FirmasResponsabilidad']
    };

    const getSectionCommentsCount = (secId: string): number => {
        const keys = SECTION_FIELD_KEYS[secId] || [secId];
        return keys.reduce((acc, k) => acc + (comments[k]?.length || 0), 0);
    };

    const getSectionPendingCount = (secId: string): number => {
        const keys = SECTION_FIELD_KEYS[secId] || [secId];
        return keys.reduce(
            (acc, k) =>
                acc + (comments[k] ? comments[k].filter(c => c.status === 'Pendiente').length : 0),
            0
        );
    };

    const sectionsToDisplay = React.useMemo(() => {
        return [
            { id: 'all', label: 'Folio completo (continuo)', icon: BookOpen },
            ...SECTIONS
        ];
    }, []);

    return (
        <aside
            ref={leftSidebarRef}
            style={{
                width: isOpen ? `${width}px` : '0px',
                transition: 'width 300ms ease-in-out'
            }}
            className={`h-full bg-white dark:bg-zinc-950 flex flex-col shrink-0 overflow-hidden select-none z-20 ${
                isOpen ? 'border-r border-slate-200/90 dark:border-zinc-800' : 'border-r-0'
            }`}
        >
            {/* Contenedor interior con ancho fijo para evitar compresión de texto durante la transición */}
            <div style={{ width: `${width}px` }} className="flex flex-col h-full shrink-0">
                {/* Cabecera del Índice */}
                <div className="p-4 py-3.5 border-b border-slate-200/90 dark:border-zinc-800 flex justify-between items-center bg-white dark:bg-zinc-950 shrink-0">
                    <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-[#0070f3] dark:text-blue-400" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-100">
                            Índice del PEA
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                        title="Contraer índice del PEA"
                        aria-label="Contraer índice del PEA"
                    >
                        <ChevronLeft size={16} />
                    </button>
                </div>

                {/* Lista de Secciones */}
                <nav className="p-3 space-y-1 flex-1 overflow-y-auto custom-scrollbar">
                    {sectionsToDisplay.map((sec) => {
                        const SecIcon = sec.icon;
                        const isActive = activeSection === sec.id;
                        const pendingCount = getSectionPendingCount(sec.id);
                        const totalCount = getSectionCommentsCount(sec.id);

                        return (
                            <button
                                key={sec.id}
                                type="button"
                                onClick={() => setActiveSection(sec.id)}
                                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-sm transition-all cursor-pointer group ${
                                    isActive
                                        ? 'bg-blue-50 text-[#0070f3] dark:bg-blue-950/40 dark:text-blue-400 font-semibold shadow-2xs'
                                        : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100/70 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-zinc-100 font-normal'
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                    <SecIcon
                                        size={16}
                                        className={`shrink-0 transition-colors ${
                                            isActive
                                                ? 'text-[#0070f3] dark:text-blue-400'
                                                : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300'
                                        }`}
                                    />
                                    <span className="truncate">{sec.label}</span>
                                </div>

                                {/* Punto Discreto de Observaciones Pendientes */}
                                {pendingCount > 0 ? (
                                    <span
                                        className="w-2 h-2 rounded-full bg-amber-500 shrink-0"
                                        title={`${pendingCount} requerimiento(s) pendiente(s)`}
                                    />
                                ) : totalCount > 0 ? (
                                    <span
                                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                                        title={`${totalCount} requerimiento(s) resueltos`}
                                    />
                                ) : null}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </aside>
    );
};

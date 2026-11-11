import React, { useState } from 'react';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';
import { Info, SquarePen, Check, Loader2, Scale, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { isPeaBorrador, getPeaStatusDescriptor } from '../../utils/peaStatusWorkflow';
import { SectionObservationColumn } from './SectionObservationColumn';
import { useAuth } from '../../../../api/AuthContext';

export interface DatosGeneralesEditPayload {
    modalidad: string;
    unidadOrganizacion: string;
    nivel: string;
    creditos: number;
    totalHoras: number;
    horasCD: number;
    horasAPE: number;
    horasTA: number;
}

const stripHtml = (html: any): string => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

const renderHtml = (html: any, placeholder: string = 'No registrado') => {
    const raw = typeof html === 'string' ? html : (html ? String(html) : '');
    if (!raw || stripHtml(raw).length === 0) {
        return <p className="text-xs text-slate-400 dark:text-zinc-500 italic py-2 select-text">{placeholder}</p>;
    }
    return (
        <div 
            className="text-xs font-sans leading-relaxed text-slate-700 dark:text-zinc-300 py-1 select-text prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: raw }}
        />
    );
};

interface InteractiveSectionsProps {
    activeSection?: string;
    activeCommentField?: string;
    setActiveSection?: (section: string) => void;
    project: ProjectDetail;
    investigadores?: any[];
    docSnapshot: any;
    templateBlocks?: any[];
    isHoursOk: boolean;
    teachersWithExceedingHours?: any[];
    getFieldCardClasses?: (fieldKey: string, extraClasses?: string) => string;
    renderFieldStatusBadge?: (fieldKey: string) => React.ReactNode;
    setActiveCommentField?: (field: string) => void;
    setIsRightSidebarOpen?: (open: boolean) => void;
    getSafeArray: (value: any) => any[];
    comments?: Record<string, SectionComment[]>;
    canAudit?: boolean;
    readOnly?: boolean;
    submitting?: boolean;
    isListening?: boolean;
    onSaveComment?: (sectionKey: string, text: string) => Promise<void>;
    onRemoveComment?: (sectionKey: string, id: number) => Promise<void>;
    onStartListening?: (onTranscript: (text: string) => void) => void;
    onScroll?: React.UIEventHandler<HTMLDivElement>;
    onUpdateDatosGenerales?: (payload: DatosGeneralesEditPayload) => Promise<boolean>;
}

export const InteractiveSections: React.FC<InteractiveSectionsProps> = ({
    activeSection,
    activeCommentField = '',
    setActiveSection,
    project,
    docSnapshot,
    isHoursOk = true,
    setActiveCommentField,
    setIsRightSidebarOpen,
    getSafeArray,
    comments = {},
    canAudit = false,
    readOnly = false,
    submitting = false,
    isListening = false,
    onSaveComment,
    onRemoveComment,
    onStartListening,
    onScroll,
    onUpdateDatosGenerales
}) => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isAuthority = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;

    const snap = docSnapshot || {};
    const statusDescriptor = getPeaStatusDescriptor(project.status, { esSupervisor: true });
    const statusLabel = statusDescriptor.key === 'EnRevision' ? 'En Revisión' : statusDescriptor.label;

    // Estado local para edición directa in-situ de Datos Generales
    const [isEditingGeneral, setIsEditingGeneral] = useState<boolean>(false);
    const [editModalidad, setEditModalidad] = useState<string>('Presencial');
    const [editUnidadOrg, setEditUnidadOrg] = useState<string>('Unidad Básica');
    const [editNivel, setEditNivel] = useState<string>('');
    const [editCreditos, setEditCreditos] = useState<number>(3);
    const [editTotalHoras, setEditTotalHoras] = useState<number>(144);
    const [editHorasCD, setEditHorasCD] = useState<number>(48);
    const [editHorasAPE, setEditHorasAPE] = useState<number>(48);
    const [editHorasTA, setEditHorasTA] = useState<number>(48);
    const [savingGeneral, setSavingGeneral] = useState<boolean>(false);
    const [isConfirmSaveOpen, setIsConfirmSaveOpen] = useState<boolean>(false);

    const handleStartEditGeneral = () => {
        let mod = snap.Modalidad || project.modalidad || 'Presencial';
        if (mod.toLowerCase() === 'en linea' || mod.toLowerCase() === 'en línea') {
            mod = 'En Línea';
        }
        setEditModalidad(mod);

        let uOrg = snap.UnidadOrganizacion || 'Unidad Básica';
        const uUpper = String(uOrg).trim().toUpperCase();
        if (uUpper === 'BASICA' || uUpper === 'BÁSICA' || uUpper === 'TRONCO COMUN' || uUpper === 'TRONCO COMÚN') {
            uOrg = 'Unidad Básica';
        } else if (uUpper === 'PROFESIONAL') {
            uOrg = 'Unidad Profesional';
        } else if (uUpper === 'TITULACION' || uUpper === 'TITULACIÓN') {
            uOrg = 'Unidad de Integración Curricular';
        }
        setEditUnidadOrg(uOrg);

        setEditNivel((snap.Nivel || project.semestre_nivel || '').toUpperCase());
        
        const cred = Number(snap.Creditos ?? project.creditos ?? 3) || 3;
        setEditCreditos(cred);

        const horasSemanales = Number(snap.HorasSemanales ?? snap.horas_semanales ?? project.peaData?.horas_semanales ?? 0);
        let cd = Number(snap.HorasContactoDocente ?? project.horas_docencia ?? 0);
        let ape = Number(snap.HorasPracticoExperimental ?? project.horas_practica ?? 0);
        let ta = Number(snap.HorasAutonomo ?? project.horas_autonomo ?? 0);
        let tot = Number(snap.TotalHorasAsignatura ?? project.horas_totales ?? 0);

        if (cd <= 0 && ape <= 0 && ta <= 0) {
            if (tot <= 0) tot = cred * 48;
            if (horasSemanales > 0 && (horasSemanales * 16) < tot) {
                cd = horasSemanales * 16;
                const restante = tot - cd;
                ape = Math.floor(restante / 2);
                ta = tot - cd - ape;
            } else {
                const third = Math.floor(tot / 3);
                cd = third;
                ape = third;
                ta = tot - cd - ape;
            }
        } else if (tot <= 0) {
            tot = cd + ape + ta;
        }

        setEditHorasCD(cd);
        setEditHorasAPE(ape);
        setEditHorasTA(ta);
        setEditTotalHoras(cd + ape + ta);
        setIsEditingGeneral(true);
    };

    const handleCancelEditGeneral = () => {
        setIsEditingGeneral(false);
    };

    const handleHorasCDChange = (val: string) => {
        const cd = Math.max(0, parseInt(val, 10) || 0);
        setEditHorasCD(cd);
        const newTot = cd + editHorasAPE + editHorasTA;
        setEditTotalHoras(newTot);
        if (newTot > 0 && newTot % 48 === 0) {
            setEditCreditos(newTot / 48);
        }
    };

    const handleHorasAPEChange = (val: string) => {
        const ape = Math.max(0, parseInt(val, 10) || 0);
        setEditHorasAPE(ape);
        const newTot = editHorasCD + ape + editHorasTA;
        setEditTotalHoras(newTot);
        if (newTot > 0 && newTot % 48 === 0) {
            setEditCreditos(newTot / 48);
        }
    };

    const handleHorasTAChange = (val: string) => {
        const ta = Math.max(0, parseInt(val, 10) || 0);
        setEditHorasTA(ta);
        const newTot = editHorasCD + editHorasAPE + ta;
        setEditTotalHoras(newTot);
        if (newTot > 0 && newTot % 48 === 0) {
            setEditCreditos(newTot / 48);
        }
    };

    const handleCreditosChange = (newCred: number) => {
        const c = Math.max(1, newCred);
        setEditCreditos(c);
        const newTot = c * 48;
        const horasSemanales = Number(snap.HorasSemanales ?? snap.horas_semanales ?? project.peaData?.horas_semanales ?? 0);
        let cd = 0;
        let ape = 0;
        let ta = 0;
        if (horasSemanales > 0 && (horasSemanales * 16) < newTot) {
            cd = horasSemanales * 16;
            const restante = newTot - cd;
            ape = Math.floor(restante / 2);
            ta = newTot - cd - ape;
        } else {
            const third = Math.floor(newTot / 3);
            cd = third;
            ape = third;
            ta = newTot - third * 2;
        }
        setEditTotalHoras(newTot);
        setEditHorasCD(cd);
        setEditHorasAPE(ape);
        setEditHorasTA(ta);
    };

    const handleSaveEditGeneral = async (): Promise<boolean> => {
        if (!onUpdateDatosGenerales) return false;
        setSavingGeneral(true);
        try {
            const ok = await onUpdateDatosGenerales({
                modalidad: editModalidad,
                unidadOrganizacion: editUnidadOrg,
                nivel: editNivel,
                creditos: editCreditos,
                totalHoras: editTotalHoras,
                horasCD: editHorasCD,
                horasAPE: editHorasAPE,
                horasTA: editHorasTA
            });
            if (ok) {
                setIsEditingGeneral(false);
                setIsConfirmSaveOpen(false);
                return true;
            }
            return false;
        } finally {
            setSavingGeneral(false);
        }
    };

    const handleAutoBalance = () => {
        const total = (editHorasCD + editHorasAPE + editHorasTA) > 0 
            ? (editHorasCD + editHorasAPE + editHorasTA) 
            : (editCreditos * 48);
        const horasSemanales = Number(snap.HorasSemanales ?? snap.horas_semanales ?? project.peaData?.horas_semanales ?? 0);
        let cd = 0;
        let ape = 0;
        let ta = 0;
        if (horasSemanales > 0 && (horasSemanales * 16) < total) {
            cd = horasSemanales * 16;
            const restante = total - cd;
            ape = Math.floor(restante / 2);
            ta = total - cd - ape;
        } else {
            const third = Math.floor(total / 3);
            cd = third;
            ape = third;
            ta = total - cd - ape;
        }
        setEditHorasCD(cd);
        setEditHorasAPE(ape);
        setEditHorasTA(ta);
        setEditTotalHoras(total);
        if (total > 0 && total % 48 === 0) {
            setEditCreditos(total / 48);
        }
    };

    const sumaComponentesGeneral = editHorasCD + editHorasAPE + editHorasTA;
    const horasNormativasCreditos = editCreditos * 48;
    const isCreditosEquivalente = editTotalHoras === horasNormativasCreditos;
    const isGeneralBalanced = isCreditosEquivalente;

    const getFieldComments = (fieldKey: string): SectionComment[] => {
        const list = [...(comments[fieldKey] || [])];
        const aliases: Record<string, string[]> = {
            NombreAsignatura: ['pea_general_section', 'General'],
            ObjetivoAsignatura: ['pea_objectives_section', 'objetivo_asignatura'],
            Prerrequisitos: ['pea_prerequisites_section'],
            AportePerfilEgreso: ['RdaCarrera', 'pea_career_outcomes_section'],
            ResultadosAprendizaje: ['pea_subject_outcomes_section'],
            ContenidosCurriculares: ['Unidades', 'pea_contents_section'],
            MetodologiaEnsenanza: ['pea_methodology_section'],
            RecursosDidacticos: ['ActividadesPracticas', 'pea_resources_section'],
            CriteriosEvaluacion: ['Evaluaciones', 'pea_evaluation_section'],
            Bibliografia: ['BibliografiaBasica', 'BibliografiaConsulta', 'pea_bibliography_section'],
            FirmasLegalizacion: ['FirmasResponsabilidad', 'pea_signatures_section']
        };

        (aliases[fieldKey] || []).forEach(alias => {
            if (comments[alias]) {
                comments[alias].forEach(c => {
                    if (!list.some(existing => (existing.id && existing.id === c.id) || (existing.uuid && existing.uuid === c.uuid))) {
                        list.push(c);
                    }
                });
            }
        });

        return list;
    };

    const handleSelectSection = (fieldKey: string) => {
        setActiveCommentField?.(fieldKey);
        setActiveSection?.(fieldKey);
        setIsRightSidebarOpen?.(true);

        // Si el usuario está seleccionando texto para copiar o consultar, respetar la selección nativa
        if (window.getSelection()?.toString()) {
            return;
        }

        // Garantizar foco inmediato en el compositor en cualquier clic de navegación
        setTimeout(() => {
            const el = document.getElementById(`composer-textarea-${fieldKey}`) as HTMLTextAreaElement | null;
            if (el && !el.disabled) {
                el.focus();
                const len = el.value.length;
                el.setSelectionRange(len, len);
            }
        }, 15);
    };

    const getSectionWrapperClasses = (fieldKey: string) => {
        const isSelected = activeCommentField === fieldKey || activeSection === fieldKey;
        return `group relative rounded-2xl p-6 sm:p-7 transition-colors duration-150 cursor-pointer select-text space-y-4 bg-white dark:bg-zinc-950 border-2 ${
            isSelected
                ? 'border-[#0070f3] dark:border-blue-500 shadow-sm'
                : 'border-slate-200/90 dark:border-zinc-800/90'
        }`;
    };

    const renderSectionHeader = (
        title: string,
        _subtitle: string,
        _fieldKey: string,
        extraAction?: React.ReactNode
    ) => {
        return (
            <div className="flex items-center justify-between gap-3 pb-1">
                <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
                        {title}
                    </h2>
                </div>
                {extraAction && (
                    <div className="shrink-0" onClick={e => e.stopPropagation()}>
                        {extraAction}
                    </div>
                )}
            </div>
        );
    };

    const renderSectionRow = (
        fieldKey: string,
        title: string,
        children: React.ReactNode
    ) => {
        const isSelected = activeCommentField === fieldKey || activeSection === fieldKey;
        const fieldComments = getFieldComments(fieldKey);

        return (
            <div key={fieldKey} className="relative flex flex-col lg:flex-row items-center w-full min-w-0">
                {/* Columna del Documento PEA */}
                <div className="flex-1 min-w-0 w-full">
                    {children}
                </div>

                {/* Línea Continua Conectora en el centro vertical */}
                <div className="hidden lg:flex items-center shrink-0 w-6 xl:w-8 self-center -mx-0.5 z-10" aria-hidden="true">
                    <div
                        className={`w-full h-1 rounded-full transition-colors duration-150 ${
                            isSelected
                                ? 'bg-[#0070f3] dark:bg-blue-500 shadow-sm shadow-blue-500/40'
                                : 'bg-slate-200 dark:bg-zinc-800'
                        }`}
                    />
                </div>

                {/* Columna Contextual de Observaciones centrada verticalmente sin scroll sticky */}
                <div className="w-full lg:w-[380px] xl:w-[440px] 2xl:w-[480px] shrink-0 min-w-0 max-w-full self-center mt-3 lg:mt-0">
                    <SectionObservationColumn
                        fieldKey={fieldKey}
                        sectionTitle={title}
                        comments={fieldComments}
                        isSelected={isSelected}
                        onSelect={() => handleSelectSection(fieldKey)}
                        canAudit={canAudit}
                        readOnly={readOnly}
                        submitting={submitting}
                        isListeningGlobal={isListening}
                        onSaveComment={onSaveComment || (async () => {})}
                        onRemoveComment={onRemoveComment || (async () => {})}
                        onStartListening={onStartListening || (() => {})}
                    />
                </div>
            </div>
        );
    };

    return (
        <div
            onScroll={onScroll}
            className="flex-1 h-full overflow-y-auto custom-scrollbar px-4 sm:px-6 md:px-8 pb-8 pt-[72px] sm:pt-[80px] bg-white dark:bg-zinc-950 font-sans"
        >
            {/* ── LIENZO ESPACIOSO APROVECHANDO TODO EL ESPACIO HORIZONTAL ── */}
            <div className="w-full space-y-8">

                {/* ── CABECERA INSTITUCIONAL COMPLETA A TODO LO ANCHO (HORIZONTAL) ── */}
                <div className="w-full space-y-6">
                    {/* ── BANNER INFORMATIVO SI ESTÁ EN BORRADOR NO ENVIADO ── */}
                    {isPeaBorrador(project.status) && (
                        <div className="p-4 rounded-xl border border-blue-200/90 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-3 shadow-2xs">
                            <Info size={17} className="text-[#0070f3] dark:text-blue-400 shrink-0 mt-0.5" />
                            <div className="space-y-0.5">
                                <p className="font-semibold text-xs text-blue-950 dark:text-blue-100">
                                    Instrumento Curricular en Formulación Docente (Borrador)
                                </p>
                                <p className="text-[11px] text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
                                    Este Programa de Estudio de la Asignatura (PEA) está siendo redactado por el docente titular y aún no ha sido remitido formalmente a la Coordinación de Carrera. Esta vista es exclusiva para acompañamiento curricular en modo lectura; las observaciones formales y la emisión de aval se habilitarán tras el envío oficial.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ── CABECERA INSTITUCIONAL TÉCNICA UNIFICADA ── */}
                    <div className="space-y-6">
                        {/* Eyebrow y Título Principal de la Asignatura */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-semibold">
                                    Programa de Estudio de la Asignatura (PEA)
                                </span>
                                {!isHoursOk && (
                                    <span className="inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Descuadre de horas
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-baseline gap-3">
                                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                    {project.title}
                                </h1>
                                <span className={`text-xs font-semibold ${statusDescriptor.textClass}`}>
                                    {statusLabel}
                                </span>
                            </div>
                        </div>

                        {/* Metadatos Clave en Barra Horizontal Continua con Separadores Técnicos */}
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                    Carrera
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block truncate" title={snap.Carrera || project.carrera}>
                                    {snap.Carrera || project.carrera || 'No asignada'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block shrink-0" />
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                    Nivel / Semestre
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                                    {(snap.Nivel || project.semestre_nivel || '').toLowerCase().startsWith('semestre') || (snap.Nivel || project.semestre_nivel || '').toLowerCase().startsWith('nivel')
                                        ? (snap.Nivel || project.semestre_nivel)
                                        : `Semestre ${snap.Nivel || project.semestre_nivel || 'N/A'}`}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block shrink-0" />
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                    Modalidad
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block">
                                    {snap.Modalidad || project.modalidad || '-'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block shrink-0" />
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                    Docente Titular
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block truncate" title={snap.DocenteElaborador || project.docente_elaborador}>
                                    {snap.DocenteElaborador || project.docente_elaborador || 'No asignado'}
                                </span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block shrink-0" />
                            <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                    Período Lectivo
                                </span>
                                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-0.5 block truncate" title={snap.Periodo || project.periodo}>
                                    {snap.Periodo || project.periodo || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CUERPO PRINCIPAL DEL PEA: SECCIONES CON OBSERVACIONES EN PARALELO ── */}
                <div className="space-y-12">

                    {/* ── SECCIÓN 1: DATOS GENERALES DE LA ASIGNATURA ── */}
                    {renderSectionRow(
                        'NombreAsignatura',
                        'Datos Generales',
                        <section id="section-pea_general_section" onClick={() => handleSelectSection('NombreAsignatura')} className={getSectionWrapperClasses('NombreAsignatura')}>
                            {renderSectionHeader(
                                '1. Datos Generales de la Asignatura',
                                'Metadatos curriculares institucionales, distribución horaria y créditos oficiales',
                                'NombreAsignatura',
                                (isAuthority || canAudit) && (
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        {isEditingGeneral ? (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEditGeneral}
                                                    disabled={savingGeneral}
                                                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                >
                                                    <X size={12} />
                                                    <span>Cancelar</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setIsConfirmSaveOpen(true)}
                                                    disabled={savingGeneral}
                                                    className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer shadow-xs disabled:opacity-60"
                                                >
                                                    {savingGeneral ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                    <span>{savingGeneral ? 'Guardando...' : 'Guardar y cerrar'}</span>
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleStartEditGeneral}
                                                className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1 px-1"
                                                title="Editar directamente datos generales, modalidad, unidad de organización y horas CACES"
                                            >
                                                <SquarePen size={13} />
                                                <span>Editar datos</span>
                                            </button>
                                        )}
                                    </div>
                                )
                            )}

                            {isEditingGeneral ? (
                                /* ── MODO EDICIÓN IN-SITU DIRECTA ── */
                                <div className="space-y-4 pt-1" onClick={(e) => e.stopPropagation()}>
                                    <dl className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Nombre de la Asignatura</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                                {stripHtml(snap.NombreAsignatura) || stripHtml(project.title) || 'No registrado'}
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Código de Carrera</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-mono font-semibold text-slate-800 dark:text-zinc-200">
                                                {snap.CodigoCarrera || project.codigo_carrera || '-'}
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Carrera</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                                {snap.Carrera || project.carrera || 'No asignada'}
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">Modalidad</dt>
                                            <dd className="sm:col-span-2 mt-1 sm:mt-0">
                                                <select
                                                    value={editModalidad}
                                                    onChange={(e) => setEditModalidad(e.target.value)}
                                                    className="w-full sm:max-w-xs px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                >
                                                    <option value="Presencial">Presencial</option>
                                                    <option value="Semipresencial">Semipresencial</option>
                                                    <option value="En Línea">En Línea</option>
                                                    <option value="Híbrida">Híbrida</option>
                                                    <option value="Dual">Dual</option>
                                                </select>
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">Unidad de Organización Curricular</dt>
                                            <dd className="sm:col-span-2 mt-1 sm:mt-0">
                                                <select
                                                    value={editUnidadOrg}
                                                    onChange={(e) => setEditUnidadOrg(e.target.value)}
                                                    className="w-full sm:max-w-xs px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                >
                                                    <option value="Unidad Básica">Unidad Básica</option>
                                                    <option value="Unidad Profesional">Unidad Profesional</option>
                                                    <option value="Unidad de Integración Curricular">Unidad de Integración Curricular</option>
                                                </select>
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">Semestre / Nivel</dt>
                                            <dd className="sm:col-span-2 mt-1 sm:mt-0">
                                                <input
                                                    type="text"
                                                    value={editNivel}
                                                    onChange={(e) => setEditNivel(e.target.value.toUpperCase())}
                                                    placeholder="Ej: PRIMERO, SEGUNDO, TERCERO..."
                                                    className="w-full sm:max-w-xs px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3] uppercase font-semibold"
                                                />
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Período Académico</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                                {snap.Periodo || project.periodo || '-'}
                                            </dd>
                                        </div>
                                        <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                                <span>Distribución Horaria y Créditos (CACES)</span>
                                                <span className="block text-[11px] font-normal text-slate-500 dark:text-zinc-400 mt-0.5">
                                                    CD + APE + TA = Total
                                                </span>
                                            </dt>
                                            <dd className="sm:col-span-2 space-y-3 mt-1 sm:mt-0">
                                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                                    <div>
                                                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block font-medium">Total (h)</label>
                                                        <div className="relative mt-1">
                                                            <input
                                                                type="number"
                                                                readOnly
                                                                value={editTotalHoras}
                                                                title="Total calculado automáticamente: Docencia + Práctica APE + Autónomo"
                                                                className="w-full px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-100/90 dark:bg-zinc-800/80 text-slate-900 dark:text-zinc-100 cursor-default select-none focus:outline-none"
                                                            />
                                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 dark:text-zinc-500 select-none">
                                                                auto
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block font-medium">Créditos</label>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={editCreditos}
                                                            onChange={(e) => handleCreditosChange(parseInt(e.target.value, 10) || 1)}
                                                            className="w-full mt-1 px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block font-medium">Docencia</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editHorasCD}
                                                            onChange={(e) => handleHorasCDChange(e.target.value)}
                                                            className="w-full mt-1 px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block font-medium">Práctica APE</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editHorasAPE}
                                                            onChange={(e) => handleHorasAPEChange(e.target.value)}
                                                            className="w-full mt-1 px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 block font-medium">Autónomo</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editHorasTA}
                                                            onChange={(e) => handleHorasTAChange(e.target.value)}
                                                            className="w-full mt-1 px-2.5 py-1.5 text-xs sm:text-sm font-mono font-bold rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                                    isCreditosEquivalente 
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                                                        : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                                                }`}>
                                                    <div className="flex items-center gap-1.5">
                                                        {isCreditosEquivalente ? (
                                                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                                        ) : (
                                                            <AlertCircle size={14} className="text-amber-600 shrink-0" />
                                                        )}
                                                        <span>
                                                            {isCreditosEquivalente 
                                                                ? `Balance CACES válido: ${editHorasCD}h (CD) + ${editHorasAPE}h (APE) + ${editHorasTA}h (TA) = ${editTotalHoras}h (${editCreditos} créditos normativos · 48h/crédito)`
                                                                : `Total calculado: ${editTotalHoras}h (${editHorasCD}h + ${editHorasAPE}h + ${editHorasTA}h). Equivale a ${(editTotalHoras / 48).toFixed(1)} créditos (Registrados: ${editCreditos} = ${horasNormativasCreditos}h).`}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleAutoBalance}
                                                        className="font-semibold text-[#0070f3] dark:text-blue-400 hover:underline shrink-0 cursor-pointer text-xs"
                                                        title="Distribuir total de horas en tercios (1/3 exacto para cada componente)"
                                                    >
                                                        Distribuir en 1/3
                                                    </button>
                                                </div>
                                            </dd>
                                        </div>
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-6 sm:items-center">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Docente Titular Elaborador</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                                {snap.DocenteElaborador || project.docente_elaborador || project.directorProyecto || '-'}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                            ) : (
                                /* ── MODO VISUALIZACIÓN FORMATEADA NORMAL ── */
                                <dl className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Nombre de la Asignatura</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                            {stripHtml(snap.NombreAsignatura) || stripHtml(project.title) || 'No registrado'}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Código de Carrera</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-mono font-semibold text-slate-800 dark:text-zinc-200">
                                            {snap.CodigoCarrera || project.codigo_carrera || '-'}
                                        </dd>
                                    </div>
                                    {(snap.CodigoAsignatura || project.codigo_asignatura) && (
                                        <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                            <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Código de Asignatura</dt>
                                            <dd className="sm:col-span-2 text-sm sm:text-base font-mono font-semibold text-slate-800 dark:text-zinc-200">
                                                {snap.CodigoAsignatura || project.codigo_asignatura}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Carrera</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                            {snap.Carrera || project.carrera || 'No asignada'}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Modalidad</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                            {snap.Modalidad || project.modalidad || '-'}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Unidad de Organización Curricular</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                            {snap.UnidadOrganizacion || '-'}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Semestre / Nivel</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                            {(snap.Nivel || project.semestre_nivel || '').toLowerCase().startsWith('nivel') || (snap.Nivel || project.semestre_nivel || '').toLowerCase().startsWith('semestre')
                                                ? (snap.Nivel || project.semestre_nivel)
                                                : `Nivel ${snap.Nivel || project.semestre_nivel || '-'}`}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Período Académico</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                            {snap.Periodo || project.periodo || '-'}
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Distribución Horaria y Créditos (CACES)</dt>
                                        <dd className="sm:col-span-2">
                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">Total</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">{snap.TotalHorasAsignatura || project.horas_totales || 0}h</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">Créditos</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">{snap.Creditos || project.creditos || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">Docencia</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">{snap.HorasContactoDocente || project.horas_docencia || 0}h</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">Práctica APE</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">{snap.HorasPracticoExperimental || project.horas_practica || 0}h</span>
                                                </div>
                                                <div>
                                                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">Autónomo</span>
                                                    <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 font-mono mt-0.5 block">{snap.HorasAutonomo || project.horas_autonomo || 0}h</span>
                                                </div>
                                            </div>
                                        </dd>
                                    </div>
                                    <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6">
                                        <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Docente Titular Elaborador</dt>
                                        <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                            {snap.DocenteElaborador || project.docente_elaborador || project.directorProyecto || '-'}
                                        </dd>
                                    </div>
                                </dl>
                            )}
                        </section>
                    )}

                    {/* ── SECCIÓN 2: OBJETIVO DE LA ASIGNATURA ── */}
                    {renderSectionRow(
                        'ObjetivoAsignatura',
                        'Objetivo General',
                        <section id="section-pea_objectives_section" onClick={() => handleSelectSection('ObjetivoAsignatura')} className={getSectionWrapperClasses('ObjetivoAsignatura')}>
                            {renderSectionHeader(
                                '2. Objetivo General de la Asignatura',
                                'Finalidad formativa, propósito metodológico y alcance del aprendizaje',
                                'ObjetivoAsignatura'
                            )}
                            <div className="py-3 text-sm sm:text-base text-slate-800 dark:text-zinc-200 leading-relaxed">
                                {renderHtml(
                                    snap.ObjetivoAsignatura || snap.objetivo_asignatura || snap.objetivoAsignatura || project.descripcion,
                                    'Sin objetivo formativo redactado por el docente.'
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 3: PRERREQUISITOS Y CO-REQUISITOS ── */}
                    {renderSectionRow(
                        'Prerrequisitos',
                        'Prerrequisitos',
                        <section id="section-pea_prerequisites_section" onClick={() => handleSelectSection('Prerrequisitos')} className={getSectionWrapperClasses('Prerrequisitos')}>
                            {renderSectionHeader(
                                '3. Prerrequisitos y Co-requisitos',
                                'Asignaturas previas requeridas y articulación curricular de la malla',
                                'Prerrequisitos'
                            )}
                            <div className="overflow-x-auto py-1">
                                {getSafeArray(snap.Prerrequisitos).length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="border-b border-slate-200 dark:border-zinc-800 text-xs font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold tracking-wider">
                                            <tr>
                                                <th className="py-3 pr-4 font-semibold">#</th>
                                                <th className="py-3 px-4 font-semibold">Asignatura Prerrequisito</th>
                                                <th className="py-3 pl-4 font-semibold">Condición / Código</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-sm sm:text-base">
                                            {getSafeArray(snap.Prerrequisitos).map((item: any, idx: number) => {
                                                const asig = item.Asignatura || item.asignatura || item.NombreAsignatura || item.nombre_asignatura || item.nombreAsignatura || item.nombre || item['0'] || '-';
                                                const obs = item.Observacion || item.observacion || item.Condicion || item.condicion || item['1'] || '-';
                                                return (
                                                    <tr key={idx}>
                                                        <td className="py-3 pr-4 font-mono text-slate-400 font-medium">{idx + 1}</td>
                                                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                                                            {asig}
                                                        </td>
                                                        <td className="py-3 pl-4 text-slate-600 dark:text-zinc-300">
                                                            {obs}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="py-3 text-sm text-slate-400 dark:text-zinc-500 italic">
                                        Esta asignatura no registra prerrequisitos obligatorios en la malla.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 4: RESULTADOS DE APRENDIZAJE DE CARRERA (RDA) ── */}
                    {renderSectionRow(
                        'AportePerfilEgreso',
                        'Aporte al Perfil de Egreso',
                        <section id="section-pea_career_outcomes_section" onClick={() => handleSelectSection('AportePerfilEgreso')} className={getSectionWrapperClasses('AportePerfilEgreso')}>
                            {renderSectionHeader(
                                '4. Resultados de Aprendizaje de Carrera (Perfil de Egreso)',
                                'Competencias generales de titulación a las que tributa directamente la asignatura',
                                'AportePerfilEgreso'
                            )}
                            <div className="py-3 text-sm sm:text-base text-slate-800 dark:text-zinc-200 leading-relaxed font-normal">
                                {renderHtml(
                                    snap.RdaCarrera || snap.rda_carrera || snap.rdacarrera || snap.RDA_Carrera,
                                    'Sin aportes al perfil de egreso registrados.'
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 5: RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA ── */}
                    {renderSectionRow(
                        'ResultadosAprendizaje',
                        'Resultados de Aprendizaje',
                        <section id="section-pea_subject_outcomes_section" onClick={() => handleSelectSection('ResultadosAprendizaje')} className={getSectionWrapperClasses('ResultadosAprendizaje')}>
                            {renderSectionHeader(
                                '5. Resultados de Aprendizaje de la Asignatura',
                                'Logros formativos específicos verificables al concluir el ciclo académico',
                                'ResultadosAprendizaje'
                            )}
                            <div className="space-y-3 py-1">
                                {Array.isArray(snap.ResultadosAprendizaje) && snap.ResultadosAprendizaje.length > 0 ? (
                                    snap.ResultadosAprendizaje.map((rda: any, idx: number) => {
                                        const texto = typeof rda === 'string'
                                            ? rda
                                            : (rda.descripcion || rda.Descripcion || rda.texto || rda.Texto || rda.rda || '-');
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-start gap-3.5 py-2.5 border-b border-slate-100 dark:border-zinc-800/60 last:border-b-0"
                                            >
                                                <span className="w-6 h-6 rounded-md bg-blue-50 text-[#0070f3] dark:bg-blue-950/60 dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <p className="text-sm sm:text-base text-slate-800 dark:text-zinc-200 leading-relaxed pt-0.5">
                                                    {texto}
                                                </p>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-3 text-sm text-slate-400 dark:text-zinc-500 italic">
                                        {renderHtml(snap.ResultadosAprendizaje, 'Sin resultados de aprendizaje detallados por el docente.')}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 6: CONTENIDOS Y UNIDADES TEMÁTICAS ── */}
                    {renderSectionRow(
                        'Unidades',
                        'Contenidos y Unidades',
                        <section id="section-pea_contents_section" onClick={() => handleSelectSection('Unidades')} className={getSectionWrapperClasses('Unidades')}>
                            {renderSectionHeader(
                                '6. Contenidos de Enseñanza y Unidades Temáticas',
                                'Desglose programático por unidades de estudio, horas pedagógicas y temas',
                                'Unidades'
                            )}
                            <div className="divide-y divide-slate-200/80 dark:divide-zinc-800 space-y-6">
                                {getSafeArray(snap.Unidades).length > 0 ? (
                                    getSafeArray(snap.Unidades).map((u: any, idx: number) => {
                                        const nombre = u.titulo || u.Titulo || u.nombre || u.NombreUnidad || u.nombre_unidad || u.nombreUnidad || u['0'] || `Unidad ${idx + 1}`;
                                        const contenido = u.contenidos || u.Contenidos || u.temas || u.Temas || u['1'] || '-';
                                        const hDoc = u.horasCD || u.HorasCD || u.horasDocencia || u.horas_docencia || u.horasDocente || u['2'] || 0;
                                        const hPrac = u.horasAPE || u.HorasAPE || u.horasPractica || u.horas_practica || u.horasPracticoExp || u['3'] || 0;
                                        const hAut = u.horasTA || u.HorasTA || u.horasAutonomo || u.horas_autonomo || u['4'] || 0;
                                        const hTot = u.horasTotal || u.HorasTotal || u.TotalHorasUnidad || u.total_horas || u.totalHoras || u['5'] || (Number(hDoc) + Number(hPrac) + Number(hAut));

                                        return (
                                            <div
                                                key={idx}
                                                className="pt-6 first:pt-0 space-y-3"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2">
                                                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                                                        <span className="w-6 h-6 rounded-md bg-[#0070f3]/10 text-[#0070f3] dark:text-blue-400 flex items-center justify-center font-mono text-xs font-bold">
                                                            {idx + 1}
                                                        </span>
                                                        <span>{nombre}</span>
                                                    </h3>
                                                    <div className="flex items-center gap-2.5 text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-3 py-1 rounded-lg">
                                                        <span>Docencia: <strong className="text-slate-800 dark:text-zinc-200">{hDoc}h</strong></span>
                                                        <span>•</span>
                                                        <span>Práctica: <strong className="text-slate-800 dark:text-zinc-200">{hPrac}h</strong></span>
                                                        <span>•</span>
                                                        <span>Autónomo: <strong className="text-slate-800 dark:text-zinc-200">{hAut}h</strong></span>
                                                        <span>•</span>
                                                        <span className="font-bold text-[#0070f3] dark:text-blue-400">Total: {hTot}h</span>
                                                    </div>
                                                </div>

                                                <div className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed pl-8">
                                                    {typeof contenido === 'string' ? (
                                                        <div dangerouslySetInnerHTML={{ __html: contenido }} />
                                                    ) : Array.isArray(contenido) ? (
                                                        <ul className="list-disc list-inside space-y-1.5">
                                                            {contenido.map((t: any, tIdx: number) => (
                                                                <li key={tIdx}>{typeof t === 'string' ? t : (t.nombre_tema || t.nombre || JSON.stringify(t))}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p>{String(contenido)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-3 text-sm text-slate-400 dark:text-zinc-500 italic">
                                        <p>Sin unidades temáticas registradas por el docente.</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 7: METODOLOGÍA Y RECURSOS ── */}
                    {renderSectionRow(
                        'MetodologiaEnsenanza',
                        'Metodología de Enseñanza',
                        <section id="section-pea_methodology_section" onClick={() => handleSelectSection('MetodologiaEnsenanza')} className={getSectionWrapperClasses('MetodologiaEnsenanza')}>
                            {renderSectionHeader(
                                '7. Metodología de Enseñanza y Recursos Didácticos',
                                'Estrategias pedagógicas activas, entornos virtuales y materiales de aprendizaje',
                                'MetodologiaEnsenanza'
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-2">
                                <div className="space-y-2.5">
                                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-2">
                                        Estrategias Metodológicas
                                    </h4>
                                    <div className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
                                        {renderHtml(snap.MetodologiaEnsenanza, 'Sin metodología detallada.')}
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-2">
                                        Recursos Didácticos y Plataformas
                                    </h4>
                                    <div className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
                                        {renderHtml(snap.RecursosDidacticos, 'Sin recursos didácticos registrados.')}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 8: PRÁCTICAS APE ── */}
                    {renderSectionRow(
                        'ActividadesPracticas',
                        'Prácticas APE',
                        <section id="section-pea_resources_section" onClick={() => handleSelectSection('ActividadesPracticas')} className={getSectionWrapperClasses('ActividadesPracticas')}>
                            {renderSectionHeader(
                                '8. Actividades Prácticas y Experimentales (APE)',
                                'Talleres, caracterización de prácticas de laboratorio y trabajo de campo',
                                'ActividadesPracticas'
                            )}
                            <div className="overflow-x-auto py-1">
                                {getSafeArray(snap.ActividadesPracticas).length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="border-b border-slate-200 dark:border-zinc-800 text-xs font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold tracking-wider">
                                            <tr>
                                                <th className="py-3 pr-4 font-semibold">#</th>
                                                <th className="py-3 px-4 font-semibold">Unidad</th>
                                                <th className="py-3 px-4 font-semibold">Nombre de la Práctica / Caracterización</th>
                                                <th className="py-3 pl-4 text-right font-semibold">Duración</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-sm sm:text-base">
                                            {getSafeArray(snap.ActividadesPracticas).map((p: any, idx: number) => {
                                                const uVal = p.unidad || p.Unidad || p.numeroUnidad || p['0'] || '-';
                                                const nom = p.nombre || p.Nombre || p.nombrePractica || p.NombrePractica || p.nombre_practica || p.descripcion || p['1'] || '-';
                                                const car = p.caracterizacion || p.Caracterizacion || p.escenario || p.producto || '';
                                                const hrs = p.horas ?? p.Horas ?? p.duracionHoras ?? p.DuracionHoras ?? p.duracion_horas ?? p['2'];
                                                return (
                                                    <tr key={idx}>
                                                        <td className="py-3 pr-4 font-mono text-slate-400 font-medium">{idx + 1}</td>
                                                        <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                                                            {uVal}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                                                            <div className="font-bold text-slate-900 dark:text-zinc-100">{nom}</div>
                                                            {car && <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{car}</div>}
                                                        </td>
                                                        <td className="py-3 pl-4 text-right font-mono font-bold text-[#0070f3] dark:text-blue-400">
                                                            {hrs !== undefined && hrs !== null && hrs !== '' ? `${hrs}h` : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="py-3 text-sm text-slate-400 dark:text-zinc-500 italic">
                                        No se registran actividades prácticas en este período.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 9: EVALUACIÓN DEL APRENDIZAJE ── */}
                    {renderSectionRow(
                        'Evaluaciones',
                        'Evaluación del Aprendizaje',
                        <section id="section-pea_evaluation_section" onClick={() => handleSelectSection('Evaluaciones')} className={getSectionWrapperClasses('Evaluaciones')}>
                            {renderSectionHeader(
                                '9. Evaluación del Aprendizaje',
                                'Matriz oficial de ponderaciones y criterios de calificación del ISTPET',
                                'Evaluaciones'
                            )}
                            <div className="overflow-x-auto py-1">
                                {getSafeArray(snap.Evaluaciones).length > 0 ? (
                                    <table className="w-full text-left">
                                        <thead className="border-b border-slate-200 dark:border-zinc-800 text-xs font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold tracking-wider">
                                            <tr>
                                                <th className="py-3 pr-4 font-semibold">Evaluación</th>
                                                <th className="py-3 px-4 font-semibold">Tipo de Actividad / Criterio</th>
                                                <th className="py-3 pl-4 text-right font-semibold">Puntaje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 text-sm sm:text-base">
                                            {getSafeArray(snap.Evaluaciones).map((ev: any, idx: number) => {
                                                const nota = ev.nota || ev.Nota || ev['0'] || ev.denominacion || ev.Denominacion || '-';
                                                const tipo = ev.tipo || ev.Tipo || ev['1'] || ev.tipoEvaluacion || ev.TipoEvaluacion || '-';
                                                const calif = ev.calificacion ?? ev.Calificacion ?? ev['2'] ?? ev.calificacionMaxima ?? ev.CalificacionMaxima;
                                                return (
                                                    <tr key={idx}>
                                                        <td className="py-3 pr-4 font-bold text-slate-900 dark:text-zinc-100">
                                                            {nota}
                                                        </td>
                                                        <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                                                            {tipo}
                                                        </td>
                                                        <td className="py-3 pl-4 text-right font-mono font-bold text-base text-[#0070f3] dark:text-blue-400">
                                                            {calif !== undefined && calif !== null && calif !== '' ? calif : '-'}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="py-3 text-sm text-slate-400 dark:text-zinc-500 italic">
                                        Sin esquema de evaluación registrado.
                                    </p>
                                )}
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 10: BIBLIOGRAFÍA ── */}
                    {renderSectionRow(
                        'Bibliografia',
                        'Bibliografía',
                        <section id="section-pea_bibliography_section" onClick={() => handleSelectSection('Bibliografia')} className={getSectionWrapperClasses('Bibliografia')}>
                            {renderSectionHeader(
                                '10. Bibliografía Institucional (Normas APA)',
                                'Obras básicas de biblioteca y referencias complementarias recomendadas',
                                'Bibliografia'
                            )}
                            <div className="space-y-6 py-2">
                                <div className="space-y-2.5">
                                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-2">
                                        Bibliografía Básica
                                    </h4>
                                    {snap.BibliografiaBasica ? (
                                        <div className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
                                            {renderHtml(snap.BibliografiaBasica, 'Sin bibliografía básica registrada.')}
                                        </div>
                                    ) : Array.isArray(snap.Bibliografias) && snap.Bibliografias.some((b: any) => (b.tipoBibliografia || b.tipo_bibliografia || b.TipoBibliografia || 'Basica').toLowerCase().includes('basic')) ? (
                                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-slate-700 dark:text-zinc-300">
                                            {snap.Bibliografias
                                                .filter((b: any) => (b.tipoBibliografia || b.tipo_bibliografia || b.TipoBibliografia || 'Basica').toLowerCase().includes('basic'))
                                                .map((b: any, bIdx: number) => (
                                                    <li key={bIdx}>{b.citaCompletaApa || b.cita_completa_apa || b.CitaCompletaApa || `${b.autor || ''} - ${b.tituloLibro || b.titulo_libro || ''}`}</li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Sin bibliografía básica registrada.</p>
                                    )}
                                </div>
                                <div className="space-y-2.5">
                                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400 font-bold border-b border-slate-200 dark:border-zinc-800 pb-2">
                                        Bibliografía Complementaria de Consulta
                                    </h4>
                                    {snap.BibliografiaConsulta ? (
                                        <div className="text-sm sm:text-base text-slate-700 dark:text-zinc-300 leading-relaxed">
                                            {renderHtml(snap.BibliografiaConsulta, 'Sin bibliografía complementaria registrada.')}
                                        </div>
                                    ) : Array.isArray(snap.Bibliografias) && snap.Bibliografias.some((b: any) => !(b.tipoBibliografia || b.tipo_bibliografia || b.TipoBibliografia || 'Basica').toLowerCase().includes('basic')) ? (
                                        <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-slate-700 dark:text-zinc-300">
                                            {snap.Bibliografias
                                                .filter((b: any) => !(b.tipoBibliografia || b.tipo_bibliografia || b.TipoBibliografia || 'Basica').toLowerCase().includes('basic'))
                                                .map((b: any, bIdx: number) => (
                                                    <li key={bIdx}>{b.citaCompletaApa || b.cita_completa_apa || b.CitaCompletaApa || `${b.autor || ''} - ${b.tituloLibro || b.titulo_libro || ''}`}</li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-slate-400 dark:text-zinc-500 italic">Sin bibliografía complementaria registrada.</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}

                    {/* ── SECCIÓN 11: FIRMAS DE RESPONSABILIDAD ── */}
                    {renderSectionRow(
                        'FirmasLegalizacion',
                        'Firmas de Responsabilidad',
                        <section id="section-pea_signatures_section" onClick={() => handleSelectSection('FirmasLegalizacion')} className={getSectionWrapperClasses('FirmasLegalizacion')}>
                            {renderSectionHeader(
                                '11. Firmas de Responsabilidad y Avales Institucionales',
                                'Firmas digitales y validación colegiada del circuito microcurricular',
                                'FirmasLegalizacion'
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                                <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Elaborado por:</span>
                                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                        {snap.FirmasResponsabilidad?.DocenteNombre || snap.DocenteElaborador || project.directorProyecto || '-'}
                                    </p>
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 block">Docente Titular</span>
                                </div>

                                <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Revisado por:</span>
                                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                        {snap.FirmasResponsabilidad?.CoordinadorNombre || '-'}
                                    </p>
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 block">Coordinador de Carrera</span>
                                </div>

                                <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Verificado por:</span>
                                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                        {snap.FirmasResponsabilidad?.CoordinadorAcadNombre || 'Coordinación Académica'}
                                    </p>
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 block">Coordinador Académico</span>
                                </div>

                                <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Aprobado por:</span>
                                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                        {snap.FirmasResponsabilidad?.VicerrectorNombre || 'Vicerrectorado'}
                                    </p>
                                    <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 block">Vicerrectorado Académico</span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Modal de Confirmación para Guardar Datos Generales */}
            {isConfirmSaveOpen && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
                    onClick={() => !savingGeneral && setIsConfirmSaveOpen(false)}
                >
                    <div 
                        className="w-full max-w-md rounded-xl bg-white dark:bg-[#131720] border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-5 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                Confirmar actualización de datos generales
                            </h3>
                            <button
                                type="button"
                                onClick={() => !savingGeneral && setIsConfirmSaveOpen(false)}
                                disabled={savingGeneral}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-5 space-y-3">
                            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                Se actualizarán las especificaciones curriculares de la asignatura en el documento oficial del PEA:
                            </p>

                            <div className="rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800/80 p-3 space-y-2 text-xs">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-zinc-400">Modalidad:</span>
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{editModalidad}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-zinc-400">Unidad Curricular:</span>
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{editUnidadOrg}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-zinc-400">Semestre / Nivel:</span>
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{editNivel || '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-zinc-400">Horas Totales:</span>
                                    <span className="font-mono font-semibold text-slate-900 dark:text-zinc-100">{editTotalHoras}h ({editCreditos} créditos)</span>
                                </div>
                                <div className="pt-1.5 border-t border-slate-200/60 dark:border-zinc-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-zinc-400">
                                    <span>Docencia CD: <strong className="text-slate-700 dark:text-zinc-200">{editHorasCD}h</strong></span>
                                    <span>Práctica APE: <strong className="text-slate-700 dark:text-zinc-200">{editHorasAPE}h</strong></span>
                                    <span>Autónomo TA: <strong className="text-slate-700 dark:text-zinc-200">{editHorasTA}h</strong></span>
                                </div>
                            </div>

                            {!isCreditosEquivalente && (
                                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                                    <AlertCircle size={14} className="shrink-0" />
                                    <span>Advertencia: El total de horas ({editTotalHoras}h) difiere de la equivalencia por créditos ({editCreditos} créditos = {editCreditos * 48}h).</span>
                                </div>
                            )}
                        </div>

                        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={() => setIsConfirmSaveOpen(false)}
                                disabled={savingGeneral}
                                className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveEditGeneral}
                                disabled={savingGeneral}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-blue-600 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                            >
                                {savingGeneral ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                <span>{savingGeneral ? 'Guardando...' : 'Confirmar y guardar'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

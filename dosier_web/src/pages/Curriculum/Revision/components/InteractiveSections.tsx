import React from 'react';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';
import { SECTIONS } from '../types/revisionTecnicaTypes';
import {
    BookOpen,
    MessageSquare,
    Plus,
    ArrowLeft,
    ArrowRight,
    Info,
    CheckCircle2
} from 'lucide-react';
import { isPeaBorrador } from '../../utils/peaStatusWorkflow';

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
    activeSection: string;
    setActiveSection?: (section: string) => void;
    project: ProjectDetail;
    investigadores?: any[];
    docSnapshot: any;
    templateBlocks?: any[];
    isLeftSidebarOpen?: boolean;
    setIsLeftSidebarOpen?: (open: boolean) => void;
    isHoursOk: boolean;
    teachersWithExceedingHours?: any[];
    getFieldCardClasses?: (fieldKey: string, extraClasses?: string) => string;
    renderFieldStatusBadge?: (fieldKey: string) => React.ReactNode;
    renderCommentButton?: (fieldKey: string, fieldName: string) => React.ReactNode;
    setActiveCommentField: (field: string) => void;
    setIsRightSidebarOpen: (open: boolean) => void;
    getSafeArray: (value: any) => any[];
    comments?: Record<string, SectionComment[]>;
    canAudit?: boolean;
}

export const InteractiveSections: React.FC<InteractiveSectionsProps> = ({
    activeSection,
    setActiveSection,
    project,
    docSnapshot,
    isHoursOk = true,
    setActiveCommentField,
    setIsRightSidebarOpen,
    getSafeArray,
    comments = {},
    canAudit = false
}) => {
    const snap = docSnapshot || {};

    const openObservationFor = (fieldKey: string) => {
        setActiveCommentField(fieldKey);
        setIsRightSidebarOpen(true);
    };

    const getFieldComments = (fieldKey: string): SectionComment[] => {
        return comments[fieldKey] || [];
    };

    const renderSectionHeader = (
        title: string,
        subtitle: string,
        fieldKey: string
    ) => {
        const fieldComments = getFieldComments(fieldKey);
        const pendingCount = fieldComments.filter(c => c.status === 'Pendiente').length;

        return (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {fieldComments.length > 0 ? (
                        <button
                            type="button"
                            onClick={() => openObservationFor(fieldKey)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium cursor-pointer transition-colors ${
                                pendingCount > 0
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}
                            title="Ver o agregar observaciones a esta sección"
                        >
                            <MessageSquare size={15} />
                            <span>
                                {fieldComments.length} {fieldComments.length === 1 ? 'observación' : 'observaciones'}
                                {pendingCount > 0 ? ` (${pendingCount} pendiente)` : ' (resueltas)'}
                            </span>
                        </button>
                    ) : canAudit ? (
                        <button
                            type="button"
                            onClick={() => openObservationFor(fieldKey)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer"
                            title="Añadir una observación a esta sección"
                        >
                            <Plus size={15} />
                            <span>Observar sección</span>
                        </button>
                    ) : null}
                </div>
            </div>
        );
    };

    // Separador de Hojas continuo (estilo Word / Docs)
    const renderSheetDivider = (pageNumber: number, title: string) => (
        <div className="relative py-10 my-4 select-none print:hidden flex items-center justify-center" aria-hidden="true">
            <div className="w-full border-t border-slate-200 dark:border-zinc-800 border-dashed" />
            <span className="absolute bg-white dark:bg-zinc-950 px-4 py-1 text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-widest font-semibold border border-slate-200 dark:border-zinc-800 rounded-full shadow-2xs">
                Hoja {pageNumber} • {title}
            </span>
        </div>
    );

    return (
        <div className="flex-1 h-full overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10 bg-white dark:bg-zinc-950 font-sans">
            {/* ── LIENZO ESPACIOSO APROVECHANDO TODO EL ESPACIO (Modern Enterprise Docs) ── */}
            <div className="w-full max-w-7xl mx-auto space-y-8">

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

                {/* ── CABECERA INSTITUCIONAL Y CÓMPUTO NORMATIVO (CES ART. 21) ── */}
                <div className="pb-6 border-b border-slate-200 dark:border-zinc-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Programa de Estudio de la Asignatura (PEA)
                            </h1>
                            <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400">
                                Asignatura: <strong className="text-slate-900 dark:text-zinc-100 font-bold">{project.title}</strong>
                            </p>
                        </div>

                        {/* Estado Normativo CES Art. 21 en Ficha Clara y Legible */}
                        <div className="flex flex-col sm:items-end space-y-1.5 sm:w-72 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-medium">
                                    Normativa CES Art. 21:
                                </span>
                                <span className={`inline-flex items-center gap-1.5 font-semibold text-xs px-2.5 py-0.5 rounded-md ${
                                    isHoursOk
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                }`}>
                                    <span className={`w-2 h-2 rounded-full ${isHoursOk ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {isHoursOk ? 'Conforme' : 'Descuadre'}
                                </span>
                            </div>
                            <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">
                                {project.horas_totales || 0} horas <span className="text-xs sm:text-sm font-normal text-slate-500 font-sans">({project.creditos || 0} créditos)</span>
                            </div>
                            <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                                {project.horas_docencia || 0}h docencia • {project.horas_practica || 0}h práctica • {project.horas_autonomo || 0}h autónomo
                            </div>
                        </div>
                    </div>

                    {/* Ficha Clave-Valor de Alta Densidad */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                        <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                Carrera
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-1 block truncate" title={project.carrera}>
                                {project.carrera || 'No asignada'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                Nivel y Modalidad
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-1 block">
                                Semestre {project.semestre_nivel || 'N/A'} • {project.modalidad || 'Presencial'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                Docente Titular
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-1 block truncate" title={project.docente_elaborador}>
                                {project.docente_elaborador || 'No asignado'}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-medium">
                                Período Lectivo
                            </span>
                            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 mt-1 block truncate">
                                {project.periodo || 'Abril - Septiembre 2026'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── CUERPO PRINCIPAL DEL PEA: SECCIÓN ACTIVA O TODAS EN FOLIO CONTINUO ── */}
                <div className="space-y-12">

                    {/* ── SECCIÓN 1: DATOS GENERALES DE LA ASIGNATURA ── */}
                    <section id="section-pea_general_section" className="space-y-4">
                        {renderSectionHeader(
                            '1. Datos Generales de la Asignatura',
                            'Metadatos curriculares institucionales, distribución horaria y créditos oficiales',
                            'NombreAsignatura'
                        )}

                        {/* Matriz Unificada de Especificaciones */}
                        <dl className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Nombre de la Asignatura</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                    {stripHtml(snap.NombreAsignatura) || stripHtml(project.title) || 'No registrado'}
                                </dd>
                            </div>
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Código Institucional</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-mono font-semibold text-slate-800 dark:text-zinc-200">
                                    {snap.CodigoAsignatura || project.codigo_asignatura || 'Sin código institucional'}
                                </dd>
                            </div>
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Carrera y Régimen</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                    {snap.Carrera || project.carrera || 'No asignada'} • Modalidad {snap.Modalidad || project.modalidad || 'Presencial'}
                                </dd>
                            </div>
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Unidad de Organización Curricular</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                    {snap.UnidadOrganizacion || 'Unidad Profesional'}
                                </dd>
                            </div>
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Semestre y Período Académico</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-semibold text-slate-800 dark:text-zinc-200">
                                    Nivel {snap.Nivel || project.semestre_nivel || '-'} • Período {snap.Periodo || project.periodo || '-'}
                                </dd>
                            </div>
                            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-6">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400 pt-2">Distribución Horaria y Créditos (CACES)</dt>
                                <dd className="sm:col-span-2 space-y-2">
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
                                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono uppercase font-semibold mb-1">Total</span>
                                            <span className="font-extrabold text-slate-900 dark:text-zinc-100 font-mono text-base sm:text-xl">{snap.TotalHorasAsignatura || project.horas_totales || 0}h</span>
                                        </div>
                                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono uppercase font-semibold mb-1">Créditos</span>
                                            <span className="font-extrabold text-slate-900 dark:text-zinc-100 font-mono text-base sm:text-xl">{snap.Creditos || project.creditos || 0}</span>
                                        </div>
                                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono uppercase font-semibold mb-1">Docencia</span>
                                            <span className="font-extrabold text-slate-900 dark:text-zinc-100 font-mono text-base sm:text-xl">{snap.HorasContactoDocente || project.horas_docencia || 0}h</span>
                                        </div>
                                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono uppercase font-semibold mb-1">Práctica APE</span>
                                            <span className="font-extrabold text-slate-900 dark:text-zinc-100 font-mono text-base sm:text-xl">{snap.HorasPracticoExperimental || project.horas_practica || 0}h</span>
                                        </div>
                                        <div className="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800">
                                            <span className="text-xs text-slate-500 dark:text-zinc-400 block font-mono uppercase font-semibold mb-1">Autónomo</span>
                                            <span className="font-extrabold text-slate-900 dark:text-zinc-100 font-mono text-base sm:text-xl">{snap.HorasAutonomo || project.horas_autonomo || 0}h</span>
                                        </div>
                                    </div>
                                </dd>
                            </div>
                            <div className="py-3.5 sm:grid sm:grid-cols-3 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                <dt className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-zinc-400">Docente Titular Elaborador</dt>
                                <dd className="sm:col-span-2 text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100">
                                    {snap.DocenteElaborador || project.docente_elaborador || project.directorProyecto || 'Docente Titular'}
                                </dd>
                            </div>
                        </dl>
                    </section>

                    {renderSheetDivider(2, 'Objetivo y Articulación Curricular')}

                    {/* ── SECCIÓN 2: OBJETIVO DE LA ASIGNATURA ── */}
                    <section id="section-pea_objectives_section" className="space-y-4">
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

                    {/* ── SECCIÓN 3: PRERREQUISITOS Y CO-REQUISITOS ── */}
                    <section id="section-pea_prerequisites_section" className="space-y-4 pt-6">
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
                                                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
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

                    {renderSheetDivider(3, 'Resultados de Aprendizaje')}

                    {/* ── SECCIÓN 4: RESULTADOS DE APRENDIZAJE DE CARRERA (RDA) ── */}
                    <section id="section-pea_career_outcomes_section" className="space-y-4">
                        {renderSectionHeader(
                            '4. Resultados de Aprendizaje de Carrera (Perfil de Egreso)',
                            'Competencias generales de titulación a las que tributa directamente la asignatura',
                            'RdaCarrera'
                        )}
                        <div className="py-3 text-sm sm:text-base text-slate-800 dark:text-zinc-200 leading-relaxed font-normal">
                            {renderHtml(
                                snap.RdaCarrera || snap.rda_carrera || snap.rdacarrera || snap.RDA_Carrera,
                                'Sin aportes al perfil de egreso registrados.'
                            )}
                        </div>
                    </section>

                    {/* ── SECCIÓN 5: RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA ── */}
                    <section id="section-pea_subject_outcomes_section" className="space-y-4 pt-6">
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

                    {renderSheetDivider(4, 'Contenidos y Unidades Temáticas')}

                    {/* ── SECCIÓN 6: CONTENIDOS Y UNIDADES TEMÁTICAS ── */}
                    <section id="section-pea_contents_section" className="space-y-4">
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
                                                        <span>Doc: <strong className="text-slate-800 dark:text-zinc-200">{hDoc}h</strong></span>
                                                        <span>•</span>
                                                        <span>Prác: <strong className="text-slate-800 dark:text-zinc-200">{hPrac}h</strong></span>
                                                        <span>•</span>
                                                        <span>Aut: <strong className="text-slate-800 dark:text-zinc-200">{hAut}h</strong></span>
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

                    {renderSheetDivider(5, 'Metodología y Prácticas APE')}

                    {/* ── SECCIÓN 7: METODOLOGÍA Y RECURSOS ── */}
                    <section id="section-pea_methodology_section" className="space-y-4">
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

                    {/* ── SECCIÓN 8: PRÁCTICAS APE ── */}
                    <section id="section-pea_resources_section" className="space-y-4 pt-6">
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
                                            const hrs = p.horas || p.Horas || p.duracionHoras || p.DuracionHoras || p.duracion_horas || p['2'] || 2;
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                    <td className="py-3 pr-4 font-mono text-slate-400 font-medium">{idx + 1}</td>
                                                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-zinc-200 whitespace-nowrap">
                                                        {uVal}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                                                        <div className="font-bold text-slate-900 dark:text-zinc-100">{nom}</div>
                                                        {car && <div className="text-xs text-slate-500 dark:text-zinc-400 mt-1">{car}</div>}
                                                    </td>
                                                    <td className="py-3 pl-4 text-right font-mono font-bold text-[#0070f3] dark:text-blue-400">
                                                        {hrs}h
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

                    {renderSheetDivider(6, 'Evaluación y Bibliografía Institucional')}

                    {/* ── SECCIÓN 9: EVALUACIÓN DEL APRENDIZAJE ── */}
                    <section id="section-pea_evaluation_section" className="space-y-4">
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
                                            const nota = ev.denominacion || ev.Denominacion || ev.nota || ev.Nota || ev['0'] || '-';
                                            const tipo = ev.tipoEvaluacion || ev.TipoEvaluacion || ev.tipo || ev.Tipo || ev['1'] || '-';
                                            const calif = ev.calificacionMaxima || ev.CalificacionMaxima || ev.calificacion || ev.Calificacion || ev['2'] || '10,00';
                                            return (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                    <td className="py-3 pr-4 font-bold text-slate-900 dark:text-zinc-100">
                                                        {nota}
                                                    </td>
                                                    <td className="py-3 px-4 text-slate-700 dark:text-zinc-300">
                                                        {tipo}
                                                    </td>
                                                    <td className="py-3 pl-4 text-right font-mono font-bold text-base text-[#0070f3] dark:text-blue-400">
                                                        {calif}
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

                    {/* ── SECCIÓN 10: BIBLIOGRAFÍA ── */}
                    <section id="section-pea_bibliography_section" className="space-y-4 pt-6">
                        {renderSectionHeader(
                            '10. Bibliografía Institucional (Normas APA)',
                            'Obras básicas de biblioteca y referencias complementarias recomendadas',
                            'BibliografiaBasica'
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

                    {renderSheetDivider(7, 'Firmas de Responsabilidad y Avales')}

                    {/* ── SECCIÓN 11: FIRMAS DE RESPONSABILIDAD ── */}
                    <section id="section-pea_signatures_section" className="space-y-4">
                        {renderSectionHeader(
                            '11. Firmas de Responsabilidad y Avales Institucionales',
                            'Firmas digitales y validación colegiada del circuito microcurricular',
                            'FirmasResponsabilidad'
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                            <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Elaborado por:</span>
                                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                    {snap.FirmasResponsabilidad?.DocenteNombre || snap.DocenteElaborador || project.directorProyecto || 'Docente'}
                                </p>
                                <span className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 block">Docente Titular</span>
                            </div>

                            <div className="border-t-2 border-slate-300 dark:border-zinc-700 pt-3 text-center space-y-1">
                                <span className="text-xs font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block font-medium">Revisado por:</span>
                                <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                                    {snap.FirmasResponsabilidad?.CoordinadorNombre || 'Coordinación Carrera'}
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

                </div>

                {/* ── CIERRE DEL DOCUMENTO (FOLIO COMPLETO) ── */}
                <div className="pt-10 pb-16 border-t border-slate-200 dark:border-zinc-800 text-center space-y-2 select-none print:hidden">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 text-xs font-mono font-medium border border-slate-200/60 dark:border-zinc-800">
                        <span>Fin del Instrumento Curricular • PEA ISTPET</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                        Todas las secciones del documento se encuentran desplegadas para su revisión técnica continua.
                    </p>
                </div>

            </div>
        </div>
    );
};

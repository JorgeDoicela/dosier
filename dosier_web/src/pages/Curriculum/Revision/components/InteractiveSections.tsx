import React from 'react';
import { 
    BookOpen, 
    FileText, 
    Target, 
    CheckSquare, 
    Activity, 
    Users, 
    Clock, 
    Calendar,
    Award,
    Shield,
    Library
} from 'lucide-react';
import type { ProjectDetail } from '../types/revisionTecnicaTypes';

const stripHtml = (html: any): string => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<[^>]*>/g, '').trim();
};

const renderHtml = (html: any, placeholder: string = 'No registrado') => {
    const raw = typeof html === 'string' ? html : (html ? String(html) : '');
    if (!raw || stripHtml(raw).length === 0) {
        return <p className="text-xs text-text-dim/60 italic mt-2 select-text">{placeholder}</p>;
    }
    return (
        <div 
            className="text-xs font-sans leading-relaxed text-text-main mt-2 select-text prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: raw }}
        />
    );
};

interface InteractiveSectionsProps {
    activeSection: string;
    project: ProjectDetail;
    investigadores: any[];
    docSnapshot: any;
    templateBlocks?: any[];
    isLeftSidebarOpen: boolean;
    setIsLeftSidebarOpen: (open: boolean) => void;
    isHoursOk: boolean;
    teachersWithExceedingHours: any[];
    getFieldCardClasses: (fieldKey: string, extraClasses?: string) => string;
    renderFieldStatusBadge: (fieldKey: string) => React.ReactNode;
    renderCommentButton: (fieldKey: string, fieldName: string) => React.ReactNode;
    setActiveCommentField: (field: string) => void;
    setIsRightSidebarOpen: (open: boolean) => void;
    getSafeArray: (value: any) => any[];
}

export const InteractiveSections: React.FC<InteractiveSectionsProps> = ({
    activeSection,
    project,
    docSnapshot,
    getFieldCardClasses,
    renderFieldStatusBadge,
    renderCommentButton,
    setActiveCommentField,
    setIsRightSidebarOpen,
    getSafeArray
}) => {
    const snap = docSnapshot || {};

    return (
        <div className="flex-1 h-full p-6 md:p-8 overflow-y-auto space-y-6 relative custom-scrollbar bg-bg-deep/20 font-sans">

            {/* 1. DATOS GENERALES */}
            {activeSection === 'pea_general_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            1. Datos Generales de la Asignatura
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Metadatos curriculares institucionales, horas y créditos
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 select-none">
                        {/* ASIGNATURA */}
                        <div 
                            id="field-card-NombreAsignatura"
                            onClick={() => { setActiveCommentField('NombreAsignatura'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('NombreAsignatura')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Nombre de la Asignatura
                                    </span>
                                    {renderFieldStatusBadge('NombreAsignatura')}
                                </div>
                                {renderCommentButton('NombreAsignatura', 'Nombre de Asignatura')}
                            </div>
                            <p className="text-sm font-bold text-text-main leading-relaxed mt-2 select-text">
                                {stripHtml(snap.NombreAsignatura) || stripHtml(project.title) || 'No registrado'}
                            </p>
                        </div>

                        {/* CÓDIGO Y CARRERA */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                id="field-card-CodigoAsignatura"
                                onClick={() => { setActiveCommentField('CodigoAsignatura'); setIsRightSidebarOpen(true); }}
                                className={getFieldCardClasses('CodigoAsignatura')}
                            >
                                <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                            Código de la Asignatura
                                        </span>
                                        {renderFieldStatusBadge('CodigoAsignatura')}
                                    </div>
                                    {renderCommentButton('CodigoAsignatura', 'Código Asignatura')}
                                </div>
                                <p className="text-xs font-mono font-semibold text-text-main mt-2 select-text">
                                    {snap.CodigoAsignatura || project.codigo_asignatura || 'Sin código institucional'}
                                </p>
                            </div>

                            <div 
                                id="field-card-Carrera"
                                onClick={() => { setActiveCommentField('Carrera'); setIsRightSidebarOpen(true); }}
                                className={getFieldCardClasses('Carrera')}
                            >
                                <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                            Carrera Institucional
                                        </span>
                                        {renderFieldStatusBadge('Carrera')}
                                    </div>
                                    {renderCommentButton('Carrera', 'Carrera')}
                                </div>
                                <p className="text-xs font-semibold text-text-main mt-2 select-text">
                                    {snap.Carrera || project.carrera || 'No asignada'}
                                </p>
                            </div>
                        </div>

                        {/* MODALIDAD, UNIDAD, NIVEL, PERIODO */}
                        <div 
                            id="field-card-Modalidad"
                            onClick={() => { setActiveCommentField('Modalidad'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('Modalidad')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Estructura y Régimen Curricular
                                    </span>
                                    {renderFieldStatusBadge('Modalidad')}
                                </div>
                                {renderCommentButton('Modalidad', 'Modalidad y Régimen')}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 select-text">
                                <div>
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Modalidad</span>
                                    <span className="text-xs font-semibold text-text-main">{snap.Modalidad || project.modalidad || 'Presencial'}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Unidad de Org.</span>
                                    <span className="text-xs font-semibold text-text-main">{snap.UnidadOrganizacion || 'Unidad Profesional'}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Semestre / Nivel</span>
                                    <span className="text-xs font-semibold text-text-main">{snap.Nivel || project.semestre_nivel || '-'}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Período</span>
                                    <span className="text-xs font-semibold text-text-main">{snap.Periodo || project.periodo || '-'}</span>
                                </div>
                            </div>
                        </div>

                        {/* HORAS Y CRÉDITOS */}
                        <div 
                            id="field-card-TotalHorasAsignatura"
                            onClick={() => { setActiveCommentField('TotalHorasAsignatura'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('TotalHorasAsignatura')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Distribución de Horas y Créditos (CACES)
                                    </span>
                                    {renderFieldStatusBadge('TotalHorasAsignatura')}
                                </div>
                                {renderCommentButton('TotalHorasAsignatura', 'Horas y Créditos')}
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-2 select-text">
                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-center">
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Total Horas</span>
                                    <span className="text-sm font-bold text-text-main font-mono">{snap.TotalHorasAsignatura || project.horas_totales || 0}h</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-center">
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Créditos</span>
                                    <span className="text-sm font-bold text-text-main font-mono">{snap.Creditos || project.creditos || 0}</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-center">
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Docencia</span>
                                    <span className="text-sm font-bold text-text-main font-mono">{snap.HorasContactoDocente || project.horas_docencia || 0}h</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-center">
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Práctica APE</span>
                                    <span className="text-sm font-bold text-text-main font-mono">{snap.HorasPracticoExperimental || project.horas_practica || 0}h</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-center">
                                    <span className="text-[9px] text-text-dim uppercase font-mono block">Autónomo</span>
                                    <span className="text-sm font-bold text-text-main font-mono">{snap.HorasAutonomo || project.horas_autonomo || 0}h</span>
                                </div>
                            </div>
                        </div>

                        {/* DOCENTE ELABORADOR */}
                        <div 
                            id="field-card-DocenteElaborador"
                            onClick={() => { setActiveCommentField('DocenteElaborador'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('DocenteElaborador')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Docente Titular Elaborador
                                    </span>
                                    {renderFieldStatusBadge('DocenteElaborador')}
                                </div>
                                {renderCommentButton('DocenteElaborador', 'Docente')}
                            </div>
                            <p className="text-xs font-semibold text-text-main mt-2 select-text">
                                {snap.DocenteElaborador || project.docente_elaborador || project.directorProyecto || 'Docente de Asignatura'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. OBJETIVO FORMATIVO */}
            {activeSection === 'pea_objectives_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            2. Objetivo de la Asignatura
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Finalidad formativa general y alcance metodológico del contenido
                        </p>
                    </div>

                    <div 
                        id="field-card-ObjetivoAsignatura"
                        onClick={() => { setActiveCommentField('ObjetivoAsignatura'); setIsRightSidebarOpen(true); }}
                        className={getFieldCardClasses('ObjetivoAsignatura')}
                    >
                        <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                    b) Objetivo General de la Asignatura
                                </span>
                                {renderFieldStatusBadge('ObjetivoAsignatura')}
                            </div>
                            {renderCommentButton('ObjetivoAsignatura', 'Objetivo Asignatura')}
                        </div>
                        {renderHtml(snap.ObjetivoAsignatura || project.descripcion, 'Sin objetivo formativo redactado')}
                    </div>
                </div>
            )}

            {/* 3. PRERREQUISITOS CURRICULARES */}
            {activeSection === 'pea_prerequisites_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            3. Prerrequisitos Curriculares
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Condiciones académicas previas y tributación de malla
                        </p>
                    </div>

                    <div 
                        id="field-card-Prerrequisitos"
                        onClick={() => { setActiveCommentField('Prerrequisitos'); setIsRightSidebarOpen(true); }}
                        className={getFieldCardClasses('Prerrequisitos')}
                    >
                        <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                    c) Matriz de Prerrequisitos y Co-requisitos
                                </span>
                                {renderFieldStatusBadge('Prerrequisitos')}
                            </div>
                            {renderCommentButton('Prerrequisitos', 'Prerrequisitos')}
                        </div>

                        {getSafeArray(snap.Prerrequisitos).length > 0 ? (
                            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-text-dim">
                                        <tr>
                                            <th className="px-3 py-2">#</th>
                                            <th className="px-3 py-2">Asignatura Prerrequisito</th>
                                            <th className="px-3 py-2">Observación / Condición</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                                        {getSafeArray(snap.Prerrequisitos).map((item: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                <td className="px-3 py-2 font-mono text-text-dim">{idx + 1}</td>
                                                <td className="px-3 py-2 text-text-main font-semibold">{item.asignatura || item.nombre || item['0'] || '-'}</td>
                                                <td className="px-3 py-2 text-text-dim">{item.observacion || item.condicion || item['1'] || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-text-dim/60 italic mt-3">No registra prerrequisitos obligatorios.</p>
                        )}
                    </div>
                </div>
            )}

            {/* 4. RESULTADOS DE APRENDIZAJE */}
            {activeSection === 'pea_competencies_rda_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            4. Resultados de Aprendizaje (RDA)
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Aporte al perfil de egreso y competencias disciplinares de la asignatura
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* RDA CARRERA */}
                        <div 
                            id="field-card-RdaCarrera"
                            onClick={() => { setActiveCommentField('RdaCarrera'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('RdaCarrera')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        d) Aporte a los RDA del Perfil de Egreso de la Carrera
                                    </span>
                                    {renderFieldStatusBadge('RdaCarrera')}
                                </div>
                                {renderCommentButton('RdaCarrera', 'RDA Carrera')}
                            </div>
                            {renderHtml(snap.RdaCarrera, 'Sin aportes al perfil de egreso registrados')}
                        </div>

                        {/* RDA ASIGNATURA */}
                        <div 
                            id="field-card-ResultadosAprendizaje"
                            onClick={() => { setActiveCommentField('ResultadosAprendizaje'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('ResultadosAprendizaje')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        e) Resultados de Aprendizaje de la Asignatura (RDA)
                                    </span>
                                    {renderFieldStatusBadge('ResultadosAprendizaje')}
                                </div>
                                {renderCommentButton('ResultadosAprendizaje', 'RDA Asignatura')}
                            </div>

                            {Array.isArray(snap.ResultadosAprendizaje) && snap.ResultadosAprendizaje.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                    {snap.ResultadosAprendizaje.map((rda: any, idx: number) => (
                                        <div key={idx} className="p-3 rounded-lg bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 text-xs">
                                            <span className="font-mono text-[10px] font-bold text-[#0070f3] block mb-1">
                                                RDA {idx + 1}
                                            </span>
                                            <p className="text-text-main font-medium leading-relaxed">
                                                {typeof rda === 'string' ? rda : (rda.descripcion || rda.texto || rda.rda || '-')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                renderHtml(snap.ResultadosAprendizaje, 'Sin resultados de aprendizaje detallados')
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 5. CONTENIDOS DE ENSEÑANZA */}
            {activeSection === 'pea_contents_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            5. Contenidos de Enseñanza y Horas
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Unidades temáticas, desagregación horaria y subtemas
                        </p>
                    </div>

                    <div 
                        id="field-card-Unidades"
                        onClick={() => { setActiveCommentField('Unidades'); setIsRightSidebarOpen(true); }}
                        className={getFieldCardClasses('Unidades')}
                    >
                        <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                    f) Unidades de Estudio, Horas y Contenidos Temáticos
                                </span>
                                {renderFieldStatusBadge('Unidades')}
                            </div>
                            {renderCommentButton('Unidades', 'Unidades')}
                        </div>

                        {getSafeArray(snap.Unidades).length > 0 ? (
                            <div className="mt-3 space-y-3">
                                {getSafeArray(snap.Unidades).map((u: any, idx: number) => {
                                    const nombre = u.nombre || u.nombre_unidad || u['0'] || `Unidad ${idx + 1}`;
                                    const contenido = u.contenidos || u.temas || u['1'] || '-';
                                    const hDoc = u.horas_docencia || u.horasDocencia || u['2'] || 0;
                                    const hPrac = u.horas_practica || u.horasPractica || u['3'] || 0;
                                    const hAut = u.horas_autonomo || u.horasAutonomo || u['4'] || 0;
                                    const hTot = u.total_horas || u.totalHoras || u['5'] || (Number(hDoc) + Number(hPrac) + Number(hAut));

                                    return (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
                                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-900 pb-2">
                                                <h4 className="text-xs font-bold text-text-main flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-[#0070f3]/10 text-[#0070f3] flex items-center justify-center font-mono text-[10px]">
                                                        {idx + 1}
                                                    </span>
                                                    <span>{nombre}</span>
                                                </h4>
                                                <div className="flex items-center gap-2 text-[10px] font-mono text-text-dim">
                                                    <span>Doc: {hDoc}h</span>
                                                    <span>•</span>
                                                    <span>Prác: {hPrac}h</span>
                                                    <span>•</span>
                                                    <span>Aut: {hAut}h</span>
                                                    <span>•</span>
                                                    <span className="font-bold text-[#0070f3]">Total: {hTot}h</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-text-main font-normal leading-relaxed pt-1">
                                                {typeof contenido === 'string' ? (
                                                    <div dangerouslySetInnerHTML={{ __html: contenido }} />
                                                ) : Array.isArray(contenido) ? (
                                                    <ul className="list-disc list-inside space-y-1">
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
                                })}
                            </div>
                        ) : (
                            <p className="text-xs text-text-dim/60 italic mt-3">Sin unidades de estudio registradas.</p>
                        )}
                    </div>
                </div>
            )}

            {/* 6. METODOLOGÍA Y RECURSOS */}
            {activeSection === 'pea_methodology_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            6. Metodología y Recursos Didácticos
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Estrategias pedagógicas activas, laboratorios y plataformas virtuales
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div 
                            id="field-card-MetodologiaEnsenanza"
                            onClick={() => { setActiveCommentField('MetodologiaEnsenanza'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('MetodologiaEnsenanza')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Estrategias Metodológicas de Enseñanza
                                    </span>
                                    {renderFieldStatusBadge('MetodologiaEnsenanza')}
                                </div>
                                {renderCommentButton('MetodologiaEnsenanza', 'Metodología')}
                            </div>
                            {renderHtml(snap.MetodologiaEnsenanza, 'Sin estrategias metodológicas registradas')}
                        </div>

                        <div 
                            id="field-card-RecursosDidacticos"
                            onClick={() => { setActiveCommentField('RecursosDidacticos'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('RecursosDidacticos')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Recursos Didácticos e Informatización del Aprendizaje
                                    </span>
                                    {renderFieldStatusBadge('RecursosDidacticos')}
                                </div>
                                {renderCommentButton('RecursosDidacticos', 'Recursos Didácticos')}
                            </div>
                            {renderHtml(snap.RecursosDidacticos, 'Sin recursos didácticos detallados')}
                        </div>
                    </div>
                </div>
            )}

            {/* 7. ACTIVIDADES PRÁCTICAS (APE) */}
            {activeSection === 'pea_resources_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            7. Actividades Prácticas y Experimentales (APE)
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Talleres, laboratorios y caracterización de actividades prácticas
                        </p>
                    </div>

                    <div 
                        id="field-card-ActividadesPracticas"
                        onClick={() => { setActiveCommentField('ActividadesPracticas'); setIsRightSidebarOpen(true); }}
                        className={getFieldCardClasses('ActividadesPracticas')}
                    >
                        <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                    h) Guías de Práctica de Aplicación y Experimentación
                                </span>
                                {renderFieldStatusBadge('ActividadesPracticas')}
                            </div>
                            {renderCommentButton('ActividadesPracticas', 'Prácticas APE')}
                        </div>

                        {getSafeArray(snap.ActividadesPracticas).length > 0 ? (
                            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-text-dim">
                                        <tr>
                                            <th className="px-3 py-2">#</th>
                                            <th className="px-3 py-2">Unidad</th>
                                            <th className="px-3 py-2">Nombre de la Práctica & Caracterización</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                                        {getSafeArray(snap.ActividadesPracticas).map((p: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                <td className="px-3 py-2 font-mono text-text-dim">{idx + 1}</td>
                                                <td className="px-3 py-2 font-semibold text-text-main whitespace-nowrap">{p.unidad || p['0'] || '-'}</td>
                                                <td className="px-3 py-2 text-text-main">{p.nombre || p.descripcion || p['1'] || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-text-dim/60 italic mt-3">Sin actividades prácticas registradas.</p>
                        )}
                    </div>
                </div>
            )}

            {/* 8. EVALUACIÓN DEL APRENDIZAJE */}
            {activeSection === 'pea_evaluation_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            8. Evaluación del Aprendizaje
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Criterios, políticas normativas y ponderación de calificaciones
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div 
                            id="field-card-EvaluacionAprendizaje"
                            onClick={() => { setActiveCommentField('EvaluacionAprendizaje'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('EvaluacionAprendizaje')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Criterios y Políticas de Evaluación
                                    </span>
                                    {renderFieldStatusBadge('EvaluacionAprendizaje')}
                                </div>
                                {renderCommentButton('EvaluacionAprendizaje', 'Políticas Evaluación')}
                            </div>
                            {renderHtml(snap.EvaluacionAprendizaje, 'Sin criterios o políticas registradas')}
                        </div>

                        <div 
                            id="field-card-Evaluaciones"
                            onClick={() => { setActiveCommentField('Evaluaciones'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('Evaluaciones')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        i) Ponderación y Calificaciones Oficiales
                                    </span>
                                    {renderFieldStatusBadge('Evaluaciones')}
                                </div>
                                {renderCommentButton('Evaluaciones', 'Tabla Evaluaciones')}
                            </div>

                            {getSafeArray(snap.Evaluaciones).length > 0 ? (
                                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 dark:border-zinc-800">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-text-dim">
                                            <tr>
                                                <th className="px-3 py-2">Evaluación</th>
                                                <th className="px-3 py-2">Tipo de Actividad</th>
                                                <th className="px-3 py-2 text-right">Puntaje</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium">
                                            {getSafeArray(snap.Evaluaciones).map((ev: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/40">
                                                    <td className="px-3 py-2 text-text-main font-semibold">{ev.nota || ev['0'] || '-'}</td>
                                                    <td className="px-3 py-2 text-text-dim">{ev.tipo || ev['1'] || '-'}</td>
                                                    <td className="px-3 py-2 text-right font-mono font-bold text-[#0070f3]">{ev.calificacion || ev['2'] || '10,00'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-text-dim/60 italic mt-3">Sin esquema de ponderación registrado.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 9. BIBLIOGRAFÍA */}
            {activeSection === 'pea_bibliography_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            9. Bibliografía Oficial (Normas APA)
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Obras básicas de biblioteca institucional y referencias complementarias
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div 
                            id="field-card-BibliografiaBasica"
                            onClick={() => { setActiveCommentField('BibliografiaBasica'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('BibliografiaBasica')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Bibliografía Básica
                                    </span>
                                    {renderFieldStatusBadge('BibliografiaBasica')}
                                </div>
                                {renderCommentButton('BibliografiaBasica', 'Bibliografía Básica')}
                            </div>
                            {renderHtml(snap.BibliografiaBasica, 'Sin bibliografía básica registrada')}
                        </div>

                        <div 
                            id="field-card-BibliografiaConsulta"
                            onClick={() => { setActiveCommentField('BibliografiaConsulta'); setIsRightSidebarOpen(true); }}
                            className={getFieldCardClasses('BibliografiaConsulta')}
                        >
                            <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                        Bibliografía de Consulta / Complementaria
                                    </span>
                                    {renderFieldStatusBadge('BibliografiaConsulta')}
                                </div>
                                {renderCommentButton('BibliografiaConsulta', 'Bibliografía de Consulta')}
                            </div>
                            {renderHtml(snap.BibliografiaConsulta, 'Sin bibliografía de consulta registrada')}
                        </div>
                    </div>
                </div>
            )}

            {/* 10. FIRMAS DE RESPONSABILIDAD */}
            {activeSection === 'pea_signatures_section' && (
                <div className="space-y-5 animate-fade-in">
                    <div className="border-b border-border-thin/60 pb-3">
                        <h3 className="text-xs font-bold text-text-main uppercase tracking-widest font-mono">
                            10. Firmas de Responsabilidad Institucional
                        </h3>
                        <p className="text-[10px] text-text-dim uppercase mt-0.5 font-mono">
                            Avales, aprobación curricular y firmas digitales de autoridad
                        </p>
                    </div>

                    <div 
                        id="field-card-FirmasResponsabilidad"
                        onClick={() => { setActiveCommentField('FirmasResponsabilidad'); setIsRightSidebarOpen(true); }}
                        className={getFieldCardClasses('FirmasResponsabilidad')}
                    >
                        <div className="flex justify-between items-center border-b border-border-thin/20 pb-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-text-dim uppercase tracking-wider font-mono">
                                    k) Cuadro de Firmas y Avales Institucionales
                                </span>
                                {renderFieldStatusBadge('FirmasResponsabilidad')}
                            </div>
                            {renderCommentButton('FirmasResponsabilidad', 'Firmas')}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                            {/* DOCENTE */}
                            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-center space-y-1">
                                <span className="text-[9px] font-mono text-text-dim uppercase block">Elaborado por:</span>
                                <p className="text-xs font-bold text-text-main truncate">
                                    {snap.FirmasResponsabilidad?.DocenteNombre || snap.DocenteElaborador || project.directorProyecto || 'Docente'}
                                </p>
                                <span className="text-[10px] text-text-dim block">Docente Titular</span>
                            </div>

                            {/* COORDINADOR CARRERA */}
                            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-center space-y-1">
                                <span className="text-[9px] font-mono text-text-dim uppercase block">Revisado por:</span>
                                <p className="text-xs font-bold text-text-main truncate">
                                    {snap.FirmasResponsabilidad?.CoordinadorNombre || 'Coordinación Carrera'}
                                </p>
                                <span className="text-[10px] text-text-dim block">Coordinador de Carrera</span>
                            </div>

                            {/* COORDINADOR ACADÉMICO */}
                            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-center space-y-1">
                                <span className="text-[9px] font-mono text-text-dim uppercase block">Verificado por:</span>
                                <p className="text-xs font-bold text-text-main truncate">
                                    {snap.FirmasResponsabilidad?.CoordinadorAcadNombre || 'Coordinación Académica'}
                                </p>
                                <span className="text-[10px] text-text-dim block">Coordinador Académico</span>
                            </div>

                            {/* VICERRECTOR */}
                            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-center space-y-1">
                                <span className="text-[9px] font-mono text-text-dim uppercase block">Aprobado por:</span>
                                <p className="text-xs font-bold text-text-main truncate">
                                    {snap.FirmasResponsabilidad?.VicerrectorNombre || 'Vicerrectorado'}
                                </p>
                                <span className="text-[10px] text-text-dim block">Vicerrectorado Académico</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

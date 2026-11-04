import React, { useState, useEffect, useMemo } from 'react';
import {
    Sparkles,
    X,
    Check
} from 'lucide-react';
import DOMPurify from 'dompurify';
import type { PeaStructuredDraft } from '../../../../services/peaAiService';

export interface PeaAiProposalModalProps {
    isOpen: boolean;
    onClose: () => void;
    draft: PeaStructuredDraft | null;
    onApply: (selectedSections: string[]) => void;
}

const SECTION_LABELS: Record<string, string> = {
    pea_objectives_section: '2. Objetivo de la Asignatura',
    pea_prerequisites_section: '3. Prerrequisitos Curriculares',
    pea_career_outcomes_section: '4. Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta',
    pea_subject_outcomes_section: '5. Resultados de Aprendizaje de la Asignatura',
    pea_contents_section: '6. Contenidos de Enseñanza',
    pea_methodology_section: '7. Metodología y Recursos Didácticos',
    pea_resources_section: '8. Actividades Prácticas',
    pea_evaluation_section: '9. Evaluación del Aprendizaje',
    pea_bibliography_section: '10. Bibliografía'
};

const sanitizeHtml = (html: string): string => {
    if (!html) return '';
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
};

export const PeaAiProposalModal: React.FC<PeaAiProposalModalProps> = ({
    isOpen,
    onClose,
    draft,
    onApply
}) => {
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    const targetSection = draft?.validationSummary?.targetSection || 'all';

    const availableSections = useMemo(() => {
        const allSections = draft?.validationSummary?.generatedSections || [];
        if (targetSection && targetSection !== 'all') {
            const filtered = allSections.filter(s => s === targetSection);
            return filtered.length > 0 ? filtered : allSections;
        }
        return allSections;
    }, [draft, targetSection]);

    useEffect(() => {
        if (!isOpen || !draft) {
            setSelectedSections([]);
            return;
        }
        setSelectedSections(availableSections);
    }, [isOpen, draft, availableSections]);

    if (!isOpen || !draft) return null;

    const toggleSection = (secId: string) => {
        setSelectedSections(prev =>
            prev.includes(secId) ? prev.filter(s => s !== secId) : [...prev, secId]
        );
    };

    const handleCardClick = (secId: string) => {
        // Si el usuario estuvo seleccionando texto para copiar, evitar alternar
        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            return;
        }
        toggleSection(secId);
    };

    const toggleAllSelection = () => {
        if (selectedSections.length === availableSections.length) {
            setSelectedSections([]);
        } else {
            setSelectedSections([...availableSections]);
        }
    };

    const handleApply = () => {
        if (selectedSections.length === 0) return;
        onApply(selectedSections);
        onClose();
    };

    const renderSectionDetail = (secId: string) => {
        switch (secId) {
            case 'pea_objectives_section': {
                if (!draft.objetivoAsignatura) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin contenido generado.</p>;
                }
                return (
                    <div
                        className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.objetivoAsignatura) }}
                    />
                );
            }

            case 'pea_prerequisites_section': {
                if (!draft.prerrequisitos || draft.prerrequisitos.length === 0) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">No requiere prerrequisitos curriculares.</p>;
                }
                return (
                    <div className="space-y-2">
                        {draft.prerrequisitos.map((p, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-xs"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] mt-1.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{p.asignatura}</span>
                                    {p.observacion && (
                                        <p className="text-slate-500 dark:text-zinc-400 text-[11px] mt-0.5">
                                            {p.observacion}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'pea_career_outcomes_section': {
                if (!draft.rdaCarrera) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin contenido generado.</p>;
                }
                return (
                    <div
                        className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.rdaCarrera) }}
                    />
                );
            }

            case 'pea_subject_outcomes_section': {
                if (!draft.resultadosAprendizaje) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin contenido generado.</p>;
                }
                return (
                    <div
                        className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.resultadosAprendizaje) }}
                    />
                );
            }

            case 'pea_contents_section': {
                if (!draft.unidades || draft.unidades.length === 0) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin unidades temáticas generadas.</p>;
                }
                return (
                    <div className="space-y-3">
                        {draft.unidades.map(u => (
                            <div
                                key={u.num}
                                className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-2"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                        Unidad {u.num}: {u.titulo}
                                    </span>
                                    <span className="text-[11px] font-mono font-medium text-[#0070f3] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-900/60">
                                        {u.horasCD}h CD + {u.horasAPE}h APE + {u.horasTA}h TA = {u.horasTotal}h
                                    </span>
                                </div>
                                {u.contenidos && (
                                    <div
                                        className="text-slate-600 dark:text-zinc-300 text-xs leading-relaxed prose prose-sm dark:prose-invert max-w-none pt-2 border-t border-slate-200/60 dark:border-zinc-800"
                                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(u.contenidos) }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                );
            }

            case 'pea_methodology_section': {
                if (!draft.metodologiaEnsenanza) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin contenido generado.</p>;
                }
                return (
                    <div
                        className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed space-y-2 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(draft.metodologiaEnsenanza) }}
                    />
                );
            }

            case 'pea_resources_section': {
                if (!draft.actividadesPracticas || draft.actividadesPracticas.length === 0) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin actividades experimentales generadas.</p>;
                }
                return (
                    <div className="space-y-2.5">
                        {draft.actividadesPracticas.map((p, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                        Práctica {idx + 1}: {p.nombre}
                                    </span>
                                    <span className="text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-900/60">
                                        {p.horas}h (Unidad {p.unidad})
                                    </span>
                                </div>
                                {p.escenario && (
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400">
                                        <strong className="text-slate-800 dark:text-zinc-200">Escenario:</strong> {p.escenario}
                                    </p>
                                )}
                                {p.producto && (
                                    <p className="text-[11px] text-slate-700 dark:text-zinc-300">
                                        <strong className="text-slate-900 dark:text-zinc-100">Producto acreditable:</strong> {p.producto}
                                    </p>
                                )}
                                {p.caracterizacion && (
                                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-zinc-800">
                                        <strong className="text-slate-800 dark:text-zinc-200">Caracterización:</strong> {p.caracterizacion}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }

            case 'pea_evaluation_section': {
                if (!draft.evaluaciones || draft.evaluaciones.length === 0) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin componentes de evaluación generados.</p>;
                }
                return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {draft.evaluaciones.map((ev, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs flex items-center justify-between gap-3"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                        {ev.nota || `Componente ${idx + 1}`}
                                    </p>
                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
                                        {ev.tipo}
                                    </p>
                                </div>
                                <span className="font-mono font-bold text-xs text-[#0070f3] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-200/60 dark:border-blue-900/60 shrink-0">
                                    {ev.calificacion} pts
                                </span>
                            </div>
                        ))}
                    </div>
                );
            }

            case 'pea_bibliography_section': {
                if (!draft.bibliografias || draft.bibliografias.length === 0) {
                    return <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin referencias bibliográficas generadas.</p>;
                }
                return (
                    <div className="space-y-2">
                        {draft.bibliografias.map((b, idx) => (
                            <div
                                key={idx}
                                className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs space-y-1.5"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                            b.tipoBibliografia === 'Basica'
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800'
                                                : 'bg-zinc-100 text-zinc-700 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
                                        }`}
                                    >
                                        {b.tipoBibliografia === 'Basica' ? 'Básica' : 'Consulta'}
                                    </span>
                                    <span className="font-medium text-slate-900 dark:text-zinc-100 truncate">
                                        {b.tituloLibro || b.autor}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-mono">
                                    {b.citaCompletaApa || `${b.autor}. ${b.tituloLibro}. ${b.editorialCiudad}`}
                                </p>
                            </div>
                        ))}
                    </div>
                );
            }

            default:
                return null;
        }
    };

    const getSectionQuickMeta = (secId: string): string => {
        switch (secId) {
            case 'pea_contents_section':
                return `${draft.unidades.length} unidades temáticas`;
            case 'pea_resources_section':
                return `${draft.actividadesPracticas.length} prácticas estructuradas`;
            case 'pea_evaluation_section':
                return `${draft.evaluaciones.length} criterios sobre 10 pts`;
            case 'pea_bibliography_section':
                return `${draft.bibliografias.length} referencias APA`;
            default:
                return '';
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-3 sm:p-5 animate-fade-in"
            onClick={onClose}
        >
            <div
                className="w-full max-w-4xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col max-h-[92vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera Sólida */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Sparkles size={18} className="text-[#0070f3] shrink-0" strokeWidth={1.75} />
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                Propuesta Curricular Generada con IA
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                Revise los contenidos formulados antes de aplicarlos al documento
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
                        aria-label="Cerrar"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Subcabecera de Selección */}
                <div className="px-6 py-3 bg-white dark:bg-zinc-950 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 shrink-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                        {availableSections.length === 1
                            ? `Sección formulada (${selectedSections.length} de 1)`
                            : `Secciones formuladas (${selectedSections.length} de ${availableSections.length})`}
                    </span>
                    {availableSections.length > 1 && (
                        <button
                            type="button"
                            onClick={toggleAllSelection}
                            className="text-[11px] text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            {selectedSections.length === availableSections.length
                                ? 'Deseleccionar todo'
                                : 'Seleccionar todo'}
                        </button>
                    )}
                </div>

                {/* Cuerpo del Modal con Contenido Siempre Expandido */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4 bg-zinc-50/50 dark:bg-zinc-950">
                    <div className="space-y-4">
                        {availableSections.map(secId => {
                            const isChecked = selectedSections.includes(secId);
                            const label = SECTION_LABELS[secId] || secId;
                            const meta = getSectionQuickMeta(secId);

                            return (
                                <div
                                    key={secId}
                                    onClick={() => handleCardClick(secId)}
                                    className={`rounded-xl border transition-all duration-150 overflow-hidden cursor-pointer select-text ${
                                        isChecked
                                            ? 'border-[#0070f3]/50 dark:border-blue-500/50 bg-white dark:bg-zinc-950 ring-1 ring-[#0070f3]/20 shadow-xs'
                                            : 'border-slate-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60 hover:opacity-90'
                                    }`}
                                >
                                    {/* Cabecera del bloque */}
                                    <div className="flex items-center justify-between gap-3 p-3.5 bg-white dark:bg-zinc-950 border-b border-slate-100 dark:border-zinc-800/80">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    toggleSection(secId);
                                                }}
                                                className="w-4 h-4 rounded border-slate-300 text-[#0070f3] focus:ring-[#0070f3] cursor-pointer shrink-0"
                                            />
                                            <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                {label}
                                            </span>
                                        </div>
                                        {meta && (
                                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 shrink-0">
                                                {meta}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contenido Completo Permanente */}
                                    <div className="p-4 bg-white dark:bg-zinc-950">
                                        {renderSectionDetail(secId)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pie Sólido con Botones de Acción */}
                <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={selectedSections.length === 0}
                        className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                    >
                        <Check size={14} />
                        <span>Aplicar al PEA ({selectedSections.length})</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

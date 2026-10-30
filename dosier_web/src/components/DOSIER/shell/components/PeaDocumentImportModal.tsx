import React, { useState, useEffect, useRef } from 'react';
import {
    FileUp,
    FileText,
    Trash2,
    X,
    Check,
    Loader2,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    extractPeaFromDocument
} from '../../../../services/peaDocumentExtractorService';
import {
    convertDraftToEditorFields,
    getPeaAiConfig,
    type PeaAiConfigStatus,
    type PeaStructuredDraft
} from '../../../../services/peaAiService';
import { useNotifications } from '../../../../api/NotificationsContext';

interface PeaDocumentImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    peaUuid: string;
    formData: any;
    onApplyDraft: (patch: Record<string, any>) => void;
}

const SECTION_LABELS: Record<string, string> = {
    pea_objectives_section: 'b) Objetivo de la Asignatura',
    pea_prerequisites_section: 'c) Prerrequisitos Curriculares',
    pea_career_outcomes_section: 'd) Resultados de Aprendizaje de la Carrera',
    pea_subject_outcomes_section: 'e) Resultados de Aprendizaje de la Asignatura',
    pea_contents_section: 'f) Contenidos de Enseñanza y Unidades Temáticas',
    pea_methodology_section: 'g) Metodología y Recursos Didácticos',
    pea_resources_section: 'h) Actividades Prácticas Experimentales',
    pea_evaluation_section: 'i) Evaluación del Aprendizaje',
    pea_bibliography_section: 'j) Bibliografía Básica y de Consulta'
};

const stripHtmlPreview = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<\/(p|li|ul|ol|div|h[1-6])>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

export const PeaDocumentImportModal: React.FC<PeaDocumentImportModalProps> = ({
    isOpen,
    onClose,
    peaUuid,
    formData,
    onApplyDraft
}) => {
    const { addToast } = useNotifications();
    const [configStatus, setConfigStatus] = useState<PeaAiConfigStatus | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importInstructions, setImportInstructions] = useState<string>('');
    const [isImporting, setIsImporting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [extractedDraft, setExtractedDraft] = useState<PeaStructuredDraft | null>(null);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setSelectedFile(null);
        setExtractedDraft(null);
        setSelectedSections([]);
        loadConfig();
    }, [isOpen]);

    const loadConfig = async () => {
        try {
            const status = await getPeaAiConfig();
            setConfigStatus(status);
        } catch (e) {
            console.error('[DOSIER EXTRACTOR] Error cargando estado de config:', e);
        }
    };

    if (!isOpen) return null;

    const nombreAsignatura = formData?.NombreAsignatura || formData?.nombre_asignatura || 'Asignatura Curricular';
    const nombreCarrera = formData?.Carrera || formData?.carrera || 'Carrera Institucional';
    const rawHorasCD = Number(formData?.HorasContactoDocente ?? formData?.horas_contacto_docente ?? 0);
    const rawHorasAPE = Number(formData?.HorasPracticoExperimental ?? formData?.horas_practico_experimental ?? 0);
    const rawHorasTA = Number(formData?.HorasAutonomo ?? formData?.horas_autonomo ?? 0);
    const totalHoras = Number(formData?.TotalHorasAsignatura ?? formData?.total_horas_asignatura ?? (rawHorasCD + rawHorasAPE + rawHorasTA));

    const isUnconfiguredSplit = rawHorasCD <= 0 && rawHorasAPE <= 0 && totalHoras > 0;
    const horasCD = isUnconfiguredSplit ? Math.floor(totalHoras / 3) : rawHorasCD;
    const horasAPE = isUnconfiguredSplit ? Math.floor(totalHoras / 3) : rawHorasAPE;
    const horasTA = isUnconfiguredSplit ? (totalHoras - horasCD - horasAPE) : rawHorasTA;

    const validateAndSelectFile = (file: File | null | undefined) => {
        if (!file) return;
        const lowerName = file.name.toLowerCase();
        const isImage =
            file.type.startsWith('image/') ||
            /\.(png|jpg|jpeg|webp|gif|bmp|tiff|svg)$/i.test(lowerName);

        if (isImage) {
            addToast(
                'Formato de imagen no admitido',
                'El extractor acepta exclusivamente documentos digitales de texto (.pdf o .docx). No se admiten imágenes.',
                'error'
            );
            return;
        }

        const isAllowedDoc = lowerName.endsWith('.pdf') || lowerName.endsWith('.docx');
        if (!isAllowedDoc) {
            addToast(
                'Formato no compatible',
                'Seleccione únicamente un archivo PDF digital (.pdf) o Microsoft Word (.docx).',
                'error'
            );
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            addToast(
                'Archivo demasiado grande',
                'El archivo supera el límite máximo permitido de 15 MB.',
                'error'
            );
            return;
        }

        setSelectedFile(file);
        setExtractedDraft(null);
    };

    const handleStartExtraction = async () => {
        if (!peaUuid) {
            addToast('Documento no identificado', 'Guarde primero el documento para habilitar la importación.', 'warning');
            return;
        }
        if (!selectedFile) {
            addToast('Archivo requerido', 'Seleccione un archivo digital (.pdf o .docx) para extraer sus datos.', 'warning');
            return;
        }

        setIsImporting(true);
        setExtractedDraft(null);
        try {
            const draft = await extractPeaFromDocument(peaUuid, selectedFile, {
                customInstructions: importInstructions.trim() || undefined,
                currentHorasCD: horasCD,
                currentHorasAPE: horasAPE,
                currentHorasTA: horasTA,
                currentTotalHoras: totalHoras
            });

            setExtractedDraft(draft);
            setSelectedSections(draft.validationSummary.generatedSections);
            addToast(
                'Extracción completada',
                `Se extrajeron con éxito ${draft.validationSummary.generatedSections.length} secciones desde "${selectedFile.name}".`,
                'success'
            );
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo procesar el documento.';
            addToast('Error en extracción de documento', typeof msg === 'string' ? msg : 'Verifique el archivo subido.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    const toggleSectionSelection = (secId: string) => {
        setSelectedSections(prev =>
            prev.includes(secId) ? prev.filter(s => s !== secId) : [...prev, secId]
        );
    };

    const handleApplySelected = () => {
        if (!extractedDraft || selectedSections.length === 0) return;
        const patch = convertDraftToEditorFields(extractedDraft, selectedSections);
        onApplyDraft(patch);
        addToast(
            'Datos importados al PEA',
            `Se han poblado ${selectedSections.length} secciones en el editor oficial.`,
            'success'
        );
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-mac-popover flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Cabecera Sólida */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <FileUp size={18} className="text-[#0070f3] shrink-0" strokeWidth={1.75} />
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                Extractor e Importador de PEA (PDF / Word)
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                Extracción y migración fiel de contenidos desde archivo digital (.pdf o .docx)
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

                {/* Cuerpo del Modal */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-white dark:bg-zinc-950">
                    {/* Ficha técnica de horas oficiales SIGAFI que blindan el cuadre */}
                    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <div>
                            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Docencia (CD)
                            </dt>
                            <dd className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                                {horasCD}h
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Práctica (APE)
                            </dt>
                            <dd className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                                {horasAPE}h
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Autónomo (TA)
                            </dt>
                            <dd className="text-xs font-semibold text-slate-900 dark:text-zinc-100 mt-0.5">
                                {horasTA}h
                            </dd>
                        </div>
                        <div>
                            <dt className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                                Total Oficial
                            </dt>
                            <dd className="text-xs font-semibold text-[#0070f3] dark:text-blue-400 mt-0.5">
                                {totalHoras}h
                            </dd>
                        </div>
                    </dl>

                    {configStatus && !configStatus.isReady && (
                        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50 dark:bg-[#1a1610] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-zinc-200">
                                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                                <span>El mapeo inteligente de documentos requiere una API Key activa configurada en el sistema.</span>
                            </div>
                        </div>
                    )}

                    {/* Selector de Archivo Digital */}
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    Archivo original del PEA / Sílabo (.pdf digital o .docx)
                                </label>
                                <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                                    Texto digital · Sin imágenes · Máx. 15 MB
                                </span>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={e => {
                                    const f = e.target.files?.[0];
                                    validateAndSelectFile(f);
                                    e.target.value = '';
                                }}
                                className="hidden"
                            />

                            {!selectedFile ? (
                                <div
                                    onDragOver={e => {
                                        e.preventDefault();
                                        setIsDragOver(true);
                                    }}
                                    onDragLeave={() => setIsDragOver(false)}
                                    onDrop={e => {
                                        e.preventDefault();
                                        setIsDragOver(false);
                                        const f = e.dataTransfer.files?.[0];
                                        validateAndSelectFile(f);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`p-6 rounded-xl border border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                                        isDragOver
                                            ? 'border-[#0070f3] bg-zinc-50 dark:bg-zinc-900'
                                            : 'border-slate-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:border-[#0070f3]'
                                    }`}
                                >
                                    <FileUp size={22} className="text-[#0070f3]" strokeWidth={1.75} />
                                    <div className="space-y-0.5">
                                        <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            Haga clic para seleccionar o arrastre el archivo aquí
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                            Formatos admitidos: PDF digital con texto seleccionable (.pdf) y Word (.docx). No se admiten fotos o imágenes.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText size={18} className="text-[#0070f3] shrink-0" strokeWidth={1.75} />
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB · Documento cargado listo para extracción
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setExtractedDraft(null);
                                        }}
                                        className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                                        title="Quitar archivo"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                Indicaciones para la adaptación al formato oficial (opcional)
                            </label>
                            <textarea
                                rows={2}
                                value={importInstructions}
                                onChange={e => setImportInstructions(e.target.value)}
                                placeholder="Ej. Respetar estrictamente los contenidos temáticos del archivo y actualizar las fuentes a APA 7ma edición..."
                                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3] resize-none"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={handleStartExtraction}
                                disabled={isImporting || !selectedFile}
                                className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                {isImporting ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Extrayendo y mapeando tablas...</span>
                                    </>
                                ) : (
                                    <>
                                        <FileUp size={14} />
                                        <span>Extraer e importar documento</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Previsualización en Folio Continuo */}
                    {extractedDraft && (
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                    Secciones extraídas del documento ({selectedSections.length} seleccionadas)
                                </span>
                                {extractedDraft.validationSummary.isHoursExactMatch && (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 size={13} />
                                        <span>Cuadre SIGAFI verificado ({extractedDraft.validationSummary.generatedTotalHoras}h)</span>
                                    </span>
                                )}
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                {extractedDraft.validationSummary.generatedSections.map(secId => {
                                    const isChecked = selectedSections.includes(secId);
                                    const label = SECTION_LABELS[secId] || secId;

                                    let previewText = '';
                                    if (secId === 'pea_objectives_section') {
                                        previewText = stripHtmlPreview(extractedDraft.objetivoAsignatura);
                                    } else if (secId === 'pea_prerequisites_section') {
                                        previewText = extractedDraft.prerrequisitos.map(p => `${p.asignatura}${p.observacion ? ` (${p.observacion})` : ''}`).join(', ');
                                    } else if (secId === 'pea_career_outcomes_section') {
                                        previewText = stripHtmlPreview(extractedDraft.rdaCarrera);
                                    } else if (secId === 'pea_subject_outcomes_section') {
                                        previewText = stripHtmlPreview(extractedDraft.resultadosAprendizaje);
                                    } else if (secId === 'pea_contents_section') {
                                        previewText = extractedDraft.unidades
                                            .map(u => `U${u.num}: ${u.titulo} (${u.horasCD}CD + ${u.horasAPE}APE + ${u.horasTA}TA = ${u.horasTotal}h)`)
                                            .join(' · ');
                                    } else if (secId === 'pea_methodology_section') {
                                        previewText = stripHtmlPreview(extractedDraft.metodologiaEnsenanza);
                                    } else if (secId === 'pea_resources_section') {
                                        previewText = `${extractedDraft.actividadesPracticas.length} prácticas experimentales extraídas`;
                                    } else if (secId === 'pea_evaluation_section') {
                                        previewText = `${extractedDraft.evaluaciones.length} criterios de evaluación sobre 10 pts`;
                                    } else if (secId === 'pea_bibliography_section') {
                                        previewText = `${extractedDraft.bibliografias.length} referencias bibliográficas en formato APA`;
                                    }

                                    return (
                                        <label
                                            key={secId}
                                            className="flex items-start gap-3 p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => toggleSectionSelection(secId)}
                                                className="mt-0.5 rounded border-slate-300 text-[#0070f3] focus:ring-[#0070f3]"
                                            />
                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                                    {label}
                                                </div>
                                                {previewText && (
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                                        {previewText}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pie Sólido */}
                {extractedDraft && (
                    <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Los datos generales y firmas de SIGAFI permanecen intactos.
                        </span>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleApplySelected}
                                disabled={selectedSections.length === 0}
                                className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <Check size={14} />
                                <span>Aplicar al PEA ({selectedSections.length})</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

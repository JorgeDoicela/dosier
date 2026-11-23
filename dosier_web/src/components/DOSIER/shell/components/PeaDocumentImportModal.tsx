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
import { FullscreenLoader } from '../../../Common/FullscreenLoader';
import { PeaUnitOfficialTableView } from '../../sections/pea/PeaUnitOfficialTableView';

export interface PeaDocumentImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    peaUuid: string;
    formData: any;
    initialFile?: File | null;
    initialInstructions?: string;
    initialDraft?: PeaStructuredDraft | null;
    autoExtractOnOpen?: boolean;
    onApplyDraft: (patch: Record<string, any>) => void;
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

const stripHtmlPreview = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<\/(p|li|ul|ol|div|h[1-6])>/gi, ' ')
        .replace(/<[^>]+>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const parseMethodologyParagraphs = (raw: string): Array<{ heading?: string; body: string }> => {
    if (!raw) return [];

    let clean = raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|li|h[1-6])>/gi, '\n\n')
        .replace(/<[^>]+>/g, '')
        .trim();

    const knownMethodologies = [
        'Aprendizaje Basado en Problemas (ABP):',
        'Aprendizaje Basado en Problemas:',
        'Aula Invertida:',
        'Aprendizaje Orientado a Proyectos (POL):',
        'Aprendizaje Orientado a Proyectos:',
        'Estudio de Casos:',
        'Estudios de Caso:',
        'Gamificación:',
        'Aprendizaje Cooperativo:',
        'Clase Magistral Activa:'
    ];

    for (const km of knownMethodologies) {
        const idx = clean.indexOf(km);
        if (idx > 0 && clean[idx - 1] !== '\n') {
            clean = clean.slice(0, idx) + '\n\n' + clean.slice(idx);
        }
    }

    clean = clean.replace(/([.!?])\s+([A-ZÁÉÍÓÚ][\w\s\(\)\/\-]{3,50}:)\s+/g, '$1\n\n$2 ');

    const rawParagraphs = clean.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
    const results: Array<{ heading?: string; body: string }> = [];

    for (const p of rawParagraphs) {
        const headingMatch = p.match(/^([A-ZÁÉÍÓÚ][\w\s\(\)\/\-]{3,60}:)\s*([\s\S]*)$/);
        if (headingMatch) {
            results.push({
                heading: headingMatch[1].trim(),
                body: headingMatch[2].trim()
            });
        } else {
            results.push({
                body: p
            });
        }
    }

    return results;
};

const parseDidacticResourcesList = (raw: string): string[] => {
    if (!raw) return [];

    const liMatches = Array.from(raw.matchAll(/<(?:li|td)\b[^>]*>([\s\S]*?)<\/(?:li|td)>/gi)).map(m => m[1]);
    if (liMatches.length > 0) {
        return liMatches
            .map(item => item.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean);
    }

    const cleanLines = raw
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/(p|div|tr)>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .split(/\r?\n/)
        .map(l => l.replace(/^[-•*]\s*/, '').trim())
        .filter(Boolean);

    if (cleanLines.length > 1) {
        return cleanLines;
    }

    if (cleanLines.length === 1) {
        const single = cleanLines[0];
        if (single.includes(';')) {
            return single.split(/;\s*/).map(s => s.trim()).filter(Boolean);
        }

        const knownSplitWords = [
            'Office 365',
            'Node Js',
            'Node.js',
            'Entorno virtual de Aprendizaje',
            'EVA - ISTPET',
            'EVA',
            'Guía de Estudio',
            'Guías de Estudio',
            'Visual Studio Comunity',
            'Visual Studio Community',
            'Guías de Práctico Experimental',
            'Guía de Práctico Experimental',
            'Visual Studio Code',
            'Antigravity',
            'Docker',
            'Git',
            'GitHub',
            'Postman',
            'MySQL Workbench'
        ];

        let testStr = single;
        for (const kw of knownSplitWords) {
            const re = new RegExp(`(?<!^)\\b(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'g');
            testStr = testStr.replace(re, '\n$1');
        }
        const splitted = testStr.split('\n').map(s => s.trim()).filter(Boolean);
        if (splitted.length > 1) {
            return splitted;
        }

        return [single];
    }

    return [];
};

const parseRdaItems = (html: string): string[] => {
    if (!html) return [];
    if (html.includes('<p') || html.includes('<li')) {
        const matches = html.match(/<(p|li)\b[^>]*>(.*?)<\/\1>/gi);
        if (matches && matches.length > 0) {
            return matches
                .map(m => m.replace(/<[^>]+>/g, '').replace(/^(?:[-•*]|\d+[\.\)-]|rda\s*[-#]?\s*\d*\s*:?)\s*/i, '').trim())
                .filter(Boolean);
        }
    }
    const lines = html.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
        return lines.map(l => l.replace(/^(?:[-•*]|\d+[\.\)-]|rda\s*[-#]?\s*\d*\s*:?)\s*/i, '').trim()).filter(Boolean);
    }
    const sentences = html.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/).map(s => s.trim()).filter(Boolean);
    if (sentences.length > 1) {
        return sentences.map(s => s.replace(/^(?:[-•*]|\d+[\.\)-]|rda\s*[-#]?\s*\d*\s*:?)\s*/i, '').trim()).filter(Boolean);
    }
    return [html.replace(/<[^>]+>/g, '').trim()].filter(Boolean);
};

export const PeaDocumentImportModal: React.FC<PeaDocumentImportModalProps> = ({
    isOpen,
    onClose,
    peaUuid,
    formData,
    initialFile = null,
    initialInstructions = '',
    initialDraft = null,
    autoExtractOnOpen = false,
    onApplyDraft
}) => {
    const { addToast } = useNotifications();
    const [configStatus, setConfigStatus] = useState<PeaAiConfigStatus | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(initialFile || null);
    const [isImporting, setIsImporting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [extractedDraft, setExtractedDraft] = useState<PeaStructuredDraft | null>(initialDraft || null);
    const [selectedSections, setSelectedSections] = useState<string[]>(initialDraft?.validationSummary?.generatedSections || []);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const nombreAsignatura = formData?.NombreAsignatura || formData?.nombre_asignatura || 'Asignatura Curricular';
    const nombreCarrera = formData?.Carrera || formData?.carrera || 'Carrera Institucional';
    const rawHorasCD = Number(formData?.HorasContactoDocente ?? formData?.horas_contacto_docente ?? 0);
    const rawHorasAPE = Number(formData?.HorasPracticoExperimental ?? formData?.horas_practico_experimental ?? 0);
    const rawHorasTA = Number(formData?.HorasAutonomo ?? formData?.horas_autonomo ?? 0);
    const totalHoras = Number(formData?.TotalHorasAsignatura ?? formData?.total_horas_asignatura ?? (rawHorasCD + rawHorasAPE + rawHorasTA));

    const executeExtraction = async (fileToExtract: File, instructionsText: string) => {
        if (!peaUuid) {
            addToast('Documento no identificado', 'Guarde primero el documento para habilitar la importación.', 'warning');
            return;
        }
        setIsImporting(true);
        setExtractedDraft(null);
        try {
            const draft = await extractPeaFromDocument(peaUuid, fileToExtract, {
                customInstructions: instructionsText.trim() || undefined,
                currentHorasCD: rawHorasCD > 0 ? rawHorasCD : undefined,
                currentHorasAPE: rawHorasAPE > 0 ? rawHorasAPE : undefined,
                currentHorasTA: rawHorasTA > 0 ? rawHorasTA : undefined,
                currentTotalHoras: totalHoras > 0 ? totalHoras : undefined
            });

            setExtractedDraft(draft);
            setSelectedSections(draft.validationSummary.generatedSections);
            addToast(
                'Extracción completada',
                `Se extrajeron con éxito ${draft.validationSummary.generatedSections.length} secciones desde "${fileToExtract.name}".`,
                'success'
            );
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo procesar el documento.';
            addToast('Error en extracción de documento', typeof msg === 'string' ? msg : 'Verifique el archivo subido.', 'error');
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const file = initialFile || null;
        setSelectedFile(file);
        if (initialDraft) {
            setExtractedDraft(initialDraft);
            setSelectedSections(initialDraft.validationSummary?.generatedSections || []);
        } else {
            setExtractedDraft(null);
            setSelectedSections([]);
        }
        loadConfig();
    }, [isOpen, initialFile, initialDraft]);

    const loadConfig = async () => {
        try {
            const status = await getPeaAiConfig();
            setConfigStatus(status);
        } catch (e) {
            console.error('[DOSIER EXTRACTOR] Error cargando estado de config:', e);
        }
    };

    if (!isOpen) return null;

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
        if (!selectedFile) {
            addToast('Archivo requerido', 'Seleccione un archivo digital (.pdf o .docx) para extraer sus datos.', 'warning');
            return;
        }
        await executeExtraction(selectedFile, '');
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
                    <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                            Extractor e Importador de PEA (PDF / Word)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                            Extracción y migración fiel de contenidos desde archivo digital (.pdf o .docx)
                        </p>
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
                    {configStatus && !configStatus.isReady && (
                        <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50 dark:bg-[#1a1610] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-zinc-200">
                                <AlertCircle size={15} className="text-amber-600 shrink-0" />
                                <span>El mapeo inteligente de documentos requiere una API Key activa configurada en el sistema.</span>
                            </div>
                        </div>
                    )}

                    {/* Selector de Archivo Digital o Ficha de Documento Procesado */}
                    {!extractedDraft ? (
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
                                        className={`p-6 rounded-xl border border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${isDragOver
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
                                                Formatos admitidos: PDF digital con texto seleccionable (.pdf) y Word (.docx).
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                {(selectedFile.size / 1024).toFixed(1)} KB · Documento cargado listo para extracción
                                            </p>
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

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleStartExtraction}
                                    disabled={isImporting || !selectedFile}
                                    className={`px-4 py-2 text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                                        isImporting
                                            ? 'bg-[#0070f3] cursor-wait opacity-100 ring-2 ring-blue-400/30'
                                            : !selectedFile
                                            ? 'bg-[#0070f3] opacity-40 cursor-not-allowed'
                                            : 'bg-[#0070f3] hover:bg-[#005bb5] cursor-pointer'
                                    }`}
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin text-white shrink-0" />
                                            <span>Extrayendo y mapeando tablas...</span>
                                        </>
                                    ) : (
                                        <span>Extraer e importar documento</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                    {selectedFile?.name || initialFile?.name || 'Documento procesado'}
                                </p>
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    Contenido extraído y estructurado exitosamente
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Previsualización en Folio Continuo */}
                    {extractedDraft && (
                        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        Secciones extraídas ({selectedSections.length} de {extractedDraft.validationSummary.generatedSections.length})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSections(
                                            selectedSections.length === extractedDraft.validationSummary.generatedSections.length
                                                ? []
                                                : [...extractedDraft.validationSummary.generatedSections]
                                        )}
                                        className="text-[11px] text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer ml-1.5"
                                    >
                                        {selectedSections.length === extractedDraft.validationSummary.generatedSections.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                {extractedDraft.validationSummary.generatedSections.map(secId => {
                                    const isChecked = selectedSections.includes(secId);
                                    const label = SECTION_LABELS[secId] || secId;

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
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                                    {label}
                                                </div>

                                                {/* Renderizador Estructurado por Sección */}
                                                {secId === 'pea_objectives_section' && (
                                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                                        {stripHtmlPreview(extractedDraft.objetivoAsignatura)}
                                                    </p>
                                                )}

                                                {secId === 'pea_prerequisites_section' && (
                                                    <div className="space-y-1 pt-0.5">
                                                        {extractedDraft.prerrequisitos.map((p, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-600 dark:text-zinc-300">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 shrink-0" />
                                                                <span className="font-medium text-slate-800 dark:text-zinc-200">{p.asignatura}</span>
                                                                {p.observacion && (
                                                                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">({p.observacion})</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {secId === 'pea_career_outcomes_section' && (
                                                    <div className="space-y-1.5 pt-0.5">
                                                        {parseRdaItems(extractedDraft.rdaCarrera).map((item, idx) => (
                                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 shrink-0 mt-1.5" />
                                                                <span className="flex-1">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {secId === 'pea_subject_outcomes_section' && (
                                                    <div className="space-y-1.5 pt-0.5">
                                                        {parseRdaItems(extractedDraft.resultadosAprendizaje).map((item, idx) => (
                                                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                                <span className="font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
                                                                    {idx + 1}.
                                                                </span>
                                                                <span className="flex-1">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {secId === 'pea_contents_section' && (
                                                    <div className="space-y-3 pt-1">
                                                        {extractedDraft.unidades.map((u, uIdx) => (
                                                            <PeaUnitOfficialTableView
                                                                key={u.num || uIdx}
                                                                unidad={u}
                                                                index={uIdx}
                                                            />
                                                        ))}
                                                        <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-end px-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
                                                            <span className="font-semibold text-slate-700 dark:text-zinc-300">
                                                                Total: {extractedDraft.totalHorasAsignatura || extractedDraft.unidades.reduce((acc, u) => acc + (u.horasTotal || 0), 0)} horas
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {secId === 'pea_methodology_section' && (
                                                    <div className="space-y-3 pt-1">
                                                        {extractedDraft.metodologiaEnsenanza && (
                                                            <div className="space-y-1.5">
                                                                <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                                                                    Estrategias Metodológicas:
                                                                </span>
                                                                <div className="space-y-2 pt-0.5">
                                                                    {parseMethodologyParagraphs(extractedDraft.metodologiaEnsenanza).map((p, pIdx) => (
                                                                        <div key={pIdx} className="space-y-0.5">
                                                                            {p.heading && (
                                                                                <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-xs">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                                                                    <span>{p.heading}</span>
                                                                                </div>
                                                                            )}
                                                                            <p className={`text-xs text-slate-600 dark:text-zinc-400 leading-relaxed ${p.heading ? 'pl-3' : ''}`}>
                                                                                {p.body}
                                                                            </p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {extractedDraft.recursosDidacticos && (
                                                            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-zinc-800">
                                                                <span className="text-[11px] font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                                                                    Recursos Didácticos e Informatización:
                                                                </span>
                                                                <div className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden divide-y divide-slate-100 dark:divide-zinc-850 shadow-2xs mt-1">
                                                                    {parseDidacticResourcesList(extractedDraft.recursosDidacticos).map((res, rIdx) => (
                                                                        <div key={rIdx} className="px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 flex items-center gap-2 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                                                            <span className="font-medium text-slate-800 dark:text-zinc-200">{res}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {secId === 'pea_resources_section' && (
                                                    <div className="mt-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs text-xs">
                                                        <table className="w-full text-left border-collapse">
                                                            <thead>
                                                                <tr className="bg-slate-100/90 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wide">
                                                                    <th className="px-3.5 py-2 w-24 sm:w-28 text-center border-r border-slate-200 dark:border-zinc-800">
                                                                        Unidad
                                                                    </th>
                                                                    <th className="px-3.5 py-2">
                                                                        Nombre de la práctica y caracterización de la actividad
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                                                                {extractedDraft.actividadesPracticas.map((p, idx) => {
                                                                    const unitDisplay = String(p.unidadTexto || p.unidad || idx + 1).replace(/^unidad\s*/i, '');
                                                                    const desc = p.nombre || p.caracterizacion || 'Práctica experimental';
                                                                    return (
                                                                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                                                            <td className="px-3.5 py-2.5 text-center font-bold text-slate-900 dark:text-zinc-100 border-r border-slate-200/60 dark:border-zinc-800 align-top">
                                                                                <span className="px-2 py-0.5 rounded bg-blue-50 text-[#0070f3] dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60 font-mono text-xs font-semibold">
                                                                                    {unitDisplay}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-3.5 py-2.5 text-slate-700 dark:text-zinc-300 leading-relaxed align-top">
                                                                                {desc}
                                                                            </td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {secId === 'pea_evaluation_section' && (
                                                    <div className="space-y-1 pt-0.5">
                                                        {extractedDraft.evaluaciones.map((e, idx) => (
                                                            <div key={idx} className="flex items-center justify-between text-xs text-slate-600 dark:text-zinc-300">
                                                                <div className="flex items-center gap-2 truncate pr-2">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-500 shrink-0" />
                                                                    <span className="truncate">{e.nota || e.tipo || 'Criterio de evaluación'}</span>
                                                                </div>
                                                                {e.calificacion && (
                                                                    <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-zinc-300 shrink-0">
                                                                        {e.calificacion} pts
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {secId === 'pea_bibliography_section' && (
                                                    <div className="space-y-2 pt-1">
                                                        {extractedDraft.bibliografias.map((b, idx) => {
                                                            const isBasica = (b.tipoBibliografia || '').toLowerCase().includes('basic') || b.tipoBibliografia === 'Basica';
                                                            return (
                                                                <div
                                                                    key={idx}
                                                                    className="p-2.5 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-start gap-2.5 text-xs shadow-2xs"
                                                                >
                                                                    <span
                                                                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 border mt-0.5 ${
                                                                            isBasica
                                                                                ? 'bg-blue-50 text-[#0070f3] border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900'
                                                                                : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900'
                                                                        }`}
                                                                    >
                                                                        {isBasica ? 'Básica' : 'Consulta'}
                                                                    </span>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
                                                                            {b.citaCompletaApa || `${b.autor || ''} (${b.tituloLibro || ''}). ${b.editorialCiudad || ''}`}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
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
                    <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
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
                )}
            </div>
        </div>
    );
};

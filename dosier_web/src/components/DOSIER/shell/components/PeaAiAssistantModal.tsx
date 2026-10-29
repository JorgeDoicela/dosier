import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles,
    Key,
    X,
    Check,
    Loader2,
    Eye,
    EyeOff,
    CheckCircle2,
    AlertCircle,
    Layers,
    RefreshCw,
    FileUp,
    FileText,
    Trash2
} from 'lucide-react';
import {
    getPeaAiConfig,
    savePeaAiConfig,
    generatePeaAiDraft,
    importPeaFromDocument,
    convertDraftToEditorFields,
    type PeaAiConfigStatus,
    type PeaAiProvider,
    type PeaStructuredDraft
} from '../../../../services/peaAiService';
import { useNotifications } from '../../../../api/NotificationsContext';

interface PeaAiAssistantModalProps {
    isOpen: boolean;
    onClose: () => void;
    peaUuid: string;
    formData: any;
    initialTargetSection?: string;
    isAdmin?: boolean;
    onApplyDraft: (patch: Record<string, any>) => void;
}

const TARGET_SECTION_OPTIONS = [
    { value: 'all', label: 'Todo el PEA completo (Secciones b — j)' },
    { value: 'pea_objectives_section', label: 'b) Objetivo de la Asignatura' },
    { value: 'pea_prerequisites_section', label: 'c) Prerrequisitos Curriculares' },
    { value: 'pea_career_outcomes_section', label: 'd) Resultados de Aprendizaje de la Carrera' },
    { value: 'pea_subject_outcomes_section', label: 'e) Resultados de Aprendizaje de la Asignatura' },
    { value: 'pea_contents_section', label: 'f) Unidades Temáticas, Contenidos y Cuadre de Horas' },
    { value: 'pea_methodology_section', label: 'g) Metodología y Recursos Didácticos' },
    { value: 'pea_resources_section', label: 'h) Actividades Prácticas Experimentales' },
    { value: 'pea_evaluation_section', label: 'i) Evaluación del Aprendizaje' },
    { value: 'pea_bibliography_section', label: 'j) Bibliografía Básica y de Consulta (APA 7)' }
];

const PROVIDER_PRESETS: Record<PeaAiProvider, {
    label: string;
    defaultBaseUrl: string;
    defaultModel: string;
    models: string[];
    keyPlaceholder: string;
    keyDocs: string;
}> = {
    deepseek: {
        label: 'DeepSeek API (Recomendado)',
        defaultBaseUrl: 'https://api.deepseek.com/chat/completions',
        defaultModel: 'deepseek-chat',
        models: ['deepseek-chat', 'deepseek-reasoner'],
        keyPlaceholder: 'sk-...',
        keyDocs: 'DeepSeek Platform'
    },
    openrouter: {
        label: 'OpenRouter (Claude, Llama 3, Mistral, Qwen, DeepSeek...)',
        defaultBaseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        defaultModel: 'deepseek/deepseek-chat',
        models: [
            'deepseek/deepseek-chat',
            'anthropic/claude-3.5-sonnet',
            'meta-llama/llama-3.3-70b-instruct',
            'google/gemini-2.0-flash-001',
            'mistralai/mistral-large-2411',
            'qwen/qwen-2.5-coder-32b-instruct'
        ],
        keyPlaceholder: 'sk-or-v1-...',
        keyDocs: 'OpenRouter Platform'
    },
    gemini: {
        label: 'Google Gemini API',
        defaultBaseUrl: 'https://generativelanguage.googleapis.com',
        defaultModel: 'gemini-2.5-flash',
        models: ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash'],
        keyPlaceholder: 'AIzaSy...',
        keyDocs: 'Google AI Studio'
    },
    anthropic: {
        label: 'Anthropic Claude API',
        defaultBaseUrl: 'https://api.anthropic.com/v1/messages',
        defaultModel: 'claude-3-5-sonnet-latest',
        models: ['claude-3-5-sonnet-latest', 'claude-3-5-haiku-latest', 'claude-3-opus-latest'],
        keyPlaceholder: 'sk-ant-...',
        keyDocs: 'Anthropic Console'
    },
    openai: {
        label: 'OpenAI API (GPT-4o)',
        defaultBaseUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
        models: ['gpt-4o-mini', 'gpt-4o', 'o3-mini'],
        keyPlaceholder: 'sk-proj-...',
        keyDocs: 'OpenAI Platform'
    },
    groq: {
        label: 'Groq (Inferencia Ultra Rápida)',
        defaultBaseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        defaultModel: 'llama-3.3-70b-versatile',
        models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
        keyPlaceholder: 'gsk_...',
        keyDocs: 'Groq Console'
    },
    ollama: {
        label: 'Ollama / Modelo Local en Servidor',
        defaultBaseUrl: 'http://localhost:11434/v1/chat/completions',
        defaultModel: 'llama3',
        models: ['llama3', 'qwen2.5', 'deepseek-r1', 'mistral'],
        keyPlaceholder: 'Opcional en servidor local',
        keyDocs: 'Servidor Local Ollama'
    },
    custom: {
        label: 'Personalizado / Cualquier endpoint compatible con OpenAI',
        defaultBaseUrl: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'custom-model',
        models: [],
        keyPlaceholder: 'sk-... (o dejar en blanco si no requiere)',
        keyDocs: 'Servidor / Proxy OpenAI-compatible'
    }
};

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

export const PeaAiAssistantModal: React.FC<PeaAiAssistantModalProps> = ({
    isOpen,
    onClose,
    peaUuid,
    formData,
    initialTargetSection = 'all',
    isAdmin = false,
    onApplyDraft
}) => {
    const { addToast } = useNotifications();
    const [activeTab, setActiveTab] = useState<'generate' | 'import' | 'config'>('generate');
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [configStatus, setConfigStatus] = useState<PeaAiConfigStatus | null>(null);

    // Estado de Configuración API Key
    const [provider, setProvider] = useState<PeaAiProvider>('deepseek');
    const [model, setModel] = useState<string>('deepseek-chat');
    const [baseUrl, setBaseUrl] = useState<string>('https://api.deepseek.com/chat/completions');
    const [isCustomModelInput, setIsCustomModelInput] = useState<boolean>(false);
    const [apiKeyInput, setApiKeyInput] = useState<string>('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [scope, setScope] = useState<'user' | 'global'>('user');
    const [savingConfig, setSavingConfig] = useState(false);

    // Estado de Generación Curricular e Importación de Archivos (.pdf / .docx)
    const [targetSection, setTargetSection] = useState<string>(initialTargetSection || 'all');
    const [customInstructions, setCustomInstructions] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedDraft, setGeneratedDraft] = useState<PeaStructuredDraft | null>(null);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    // Estado de Importación Digital (exclusivamente .pdf y .docx, sin imágenes)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [importInstructions, setImportInstructions] = useState<string>('');
    const [isImporting, setIsImporting] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const normalizedTarget = TARGET_SECTION_OPTIONS.some(o => o.value === initialTargetSection)
            ? initialTargetSection
            : 'all';
        setTargetSection(normalizedTarget);
        setGeneratedDraft(null);
        setSelectedFile(null);
        loadConfiguration();
    }, [isOpen, initialTargetSection]);

    const loadConfiguration = async () => {
        setLoadingConfig(true);
        try {
            const status = await getPeaAiConfig();
            setConfigStatus(status);
            setProvider(status.activeProvider);
            setModel(status.activeModel);
            if (status.activeBaseUrl) {
                setBaseUrl(status.activeBaseUrl);
            } else {
                setBaseUrl(PROVIDER_PRESETS[status.activeProvider]?.defaultBaseUrl || 'https://api.deepseek.com/chat/completions');
            }
            const presetModels = PROVIDER_PRESETS[status.activeProvider]?.models || [];
            if (!presetModels.includes(status.activeModel) && status.activeModel) {
                setIsCustomModelInput(true);
            }
        } catch (err) {
            console.error('[DOSIER AI] Error cargando configuración:', err);
        } finally {
            setLoadingConfig(false);
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

    const handleProviderChange = (newProv: PeaAiProvider) => {
        setProvider(newProv);
        const preset = PROVIDER_PRESETS[newProv];
        if (preset) {
            setBaseUrl(preset.defaultBaseUrl);
            setModel(preset.defaultModel);
            setIsCustomModelInput(newProv === 'custom');
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingConfig(true);
        try {
            const status = await savePeaAiConfig({
                provider,
                model,
                baseUrl,
                apiKey: apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
                scope: isAdmin ? scope : 'user'
            });
            setConfigStatus(status);
            setApiKeyInput('');
            addToast(
                'Configuración Guardada',
                'La credencial y el modelo de IA se han almacenado de forma cifrada.',
                'success'
            );
            setActiveTab('generate');
        } catch (err: any) {
            addToast(
                'Error al guardar configuración',
                err?.response?.data?.message || err?.message || 'No se pudo guardar la configuración de IA.',
                'error'
            );
        } finally {
            setSavingConfig(false);
        }
    };

    const handleGenerate = async () => {
        if (!peaUuid) {
            addToast('Identificador requerido', 'Guarde primero el documento para habilitar la generación.', 'warning');
            return;
        }
        setIsGenerating(true);
        setGeneratedDraft(null);
        try {
            const rawUnits: any[] = Array.isArray(formData?.Unidades) ? formData.Unidades : [];
            const currentUnidades = rawUnits.map((u, idx) => ({
                num: Number(u.num ?? u.Numero ?? idx + 1),
                titulo: String(u.titulo ?? u.Titulo ?? u.NombreUnidad ?? ''),
                contenidos: String(u.contenidos ?? u.Contenidos ?? ''),
                horasCD: Number(u.horasCD ?? u.HorasCD ?? 0),
                horasAPE: Number(u.horasAPE ?? u.HorasAPE ?? 0),
                horasTA: Number(u.horasTA ?? u.HorasTA ?? 0)
            })).filter(u => u.titulo || u.contenidos);

            const draft = await generatePeaAiDraft(peaUuid, {
                targetSection,
                customInstructions: customInstructions.trim() || undefined,
                provider,
                model,
                baseUrlOverride: baseUrl.trim() || undefined,
                currentHorasCD: rawHorasCD,
                currentHorasAPE: rawHorasAPE,
                currentHorasTA: rawHorasTA,
                currentTotalHoras: totalHoras,
                currentUnidades: currentUnidades.length > 0 ? currentUnidades : undefined
            });

            setGeneratedDraft(draft);

            const initialSelected = targetSection === 'all'
                ? draft.validationSummary.generatedSections
                : draft.validationSummary.generatedSections.filter(s => s === targetSection);

            setSelectedSections(
                initialSelected.length > 0 ? initialSelected : draft.validationSummary.generatedSections
            );
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo generar el borrador curricular.';
            addToast('Error en Generación IA', typeof msg === 'string' ? msg : 'Verifique su API Key y conexión.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    const validateAndSelectFile = (file: File | null | undefined) => {
        if (!file) return;
        const lowerName = file.name.toLowerCase();
        const isImage =
            file.type.startsWith('image/') ||
            /\.(png|jpg|jpeg|webp|gif|bmp|tiff|svg)$/i.test(lowerName);

        if (isImage) {
            addToast(
                'Formato de imagen no admitido',
                'El importador acepta exclusivamente documentos digitales con texto seleccionable (.pdf y .docx). No se admiten imágenes.',
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
        setGeneratedDraft(null);
    };

    const handleImportDocument = async () => {
        if (!peaUuid) {
            addToast('Identificador requerido', 'Guarde primero el documento para habilitar la importación.', 'warning');
            return;
        }
        if (!selectedFile) {
            addToast('Archivo requerido', 'Seleccione un archivo .pdf o .docx antes de iniciar el reconocimiento.', 'warning');
            return;
        }

        setIsImporting(true);
        setGeneratedDraft(null);
        try {
            const draft = await importPeaFromDocument(peaUuid, selectedFile, {
                customInstructions: importInstructions.trim() || undefined,
                provider,
                model,
                baseUrlOverride: baseUrl.trim() || undefined,
                currentHorasCD: rawHorasCD,
                currentHorasAPE: rawHorasAPE,
                currentHorasTA: rawHorasTA,
                currentTotalHoras: totalHoras
            });

            setGeneratedDraft(draft);
            setSelectedSections(draft.validationSummary.generatedSections);
            addToast(
                'Documento reconocido y estructurado',
                `Se extrajeron ${draft.validationSummary.generatedSections.length} secciones desde "${selectedFile.name}". Revise la previsualización y aplique los cambios.`,
                'success'
            );
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'No se pudo procesar el documento digital.';
            addToast('Error al importar documento', typeof msg === 'string' ? msg : 'Verifique que el archivo contenga texto digital seleccionable.', 'error');
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
        if (!generatedDraft || selectedSections.length === 0) return;
        const patch = convertDraftToEditorFields(generatedDraft, selectedSections);
        onApplyDraft(patch);
        addToast(
            'Contenido Aplicado al PEA',
            `Se han completado ${selectedSections.length} sección(es) en el editor colaborativo.`,
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
                        <Sparkles size={18} className="text-[#0070f3] shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                Asistente Curricular de Inteligencia Artificial
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">
                                {nombreAsignatura} — {nombreCarrera}
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

                {/* Navegación de Pestañas sobre Riel Plano */}
                <div className="px-6 bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800">
                    <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setActiveTab('generate')}
                            className={`py-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                                activeTab === 'generate'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Layers size={14} />
                            <span>Generar contenido curricular</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('import')}
                            className={`py-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                                activeTab === 'import'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <FileUp size={14} />
                            <span>Importar archivo (PDF / Word)</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('config')}
                            className={`py-3 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${
                                activeTab === 'config'
                                    ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                            }`}
                        >
                            <Key size={14} />
                            <span>Configuración de API Key</span>
                            <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                    configStatus?.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                            />
                        </button>
                    </nav>
                </div>

                {/* Cuerpo del Modal */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5 bg-white dark:bg-zinc-950">
                    {activeTab === 'config' ? (
                        <form onSubmit={handleSaveConfig} className="space-y-5">
                            <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-1.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                        Estado de conexión del motor IA
                                    </span>
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-zinc-300">
                                        <span
                                            className={`w-2 h-2 rounded-full ${
                                                configStatus?.isReady ? 'bg-emerald-500' : 'bg-amber-500'
                                            }`}
                                        />
                                        {configStatus?.isReady
                                            ? `Activa (${configStatus.maskedApiKey || 'Configurada'})`
                                            : 'Sin API Key configurada'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                    La clave se almacena cifrada con AES-256 en el servidor y nunca se expone en el navegador.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Proveedor de IA (Agnóstico / Compatible con cualquier modelo)
                                    </label>
                                    <select
                                        value={provider}
                                        onChange={e => handleProviderChange(e.target.value as PeaAiProvider)}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    >
                                        {Object.entries(PROVIDER_PRESETS).map(([k, p]) => (
                                            <option key={k} value={k}>
                                                {p.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Endpoint URL (Base URL para llamada OpenAI-compatible)
                                    </label>
                                    <input
                                        type="text"
                                        value={baseUrl}
                                        onChange={e => setBaseUrl(e.target.value)}
                                        placeholder="https://..."
                                        disabled={provider === 'gemini'}
                                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3] disabled:opacity-50"
                                    />
                                    <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                                        {provider === 'gemini'
                                            ? 'Google Gemini utiliza su protocolo nativo optimizado con validación formal JSON.'
                                            : 'Puedes usar cualquier servidor compatible con la especificación OpenAI (/chat/completions).'}
                                    </p>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <div className="flex items-center justify-between">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                            Modelo Curricular
                                        </label>
                                        {PROVIDER_PRESETS[provider]?.models.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setIsCustomModelInput(prev => !prev)}
                                                className="text-[11px] text-[#0070f3] dark:text-blue-400 hover:underline cursor-pointer"
                                            >
                                                {isCustomModelInput ? 'Elegir de lista predefinida' : 'Escribir nombre de modelo manual'}
                                            </button>
                                        )}
                                    </div>

                                    {isCustomModelInput || PROVIDER_PRESETS[provider]?.models.length === 0 ? (
                                        <input
                                            type="text"
                                            value={model}
                                            onChange={e => setModel(e.target.value)}
                                            placeholder="Ej. deepseek-chat, claude-3-5-sonnet-20241022, qwen-2.5-coder-32b, etc."
                                            className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                        />
                                    ) : (
                                        <select
                                            value={model}
                                            onChange={e => setModel(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                        >
                                            {PROVIDER_PRESETS[provider]?.models.map(m => (
                                                <option key={m} value={m}>
                                                    {m}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                    API Key ({PROVIDER_PRESETS[provider]?.keyDocs || 'Proveedor'})
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={showApiKey ? 'text' : 'password'}
                                        value={apiKeyInput}
                                        onChange={e => setApiKeyInput(e.target.value)}
                                        placeholder={
                                            configStatus?.maskedApiKey
                                                ? `Clave actual: ${configStatus.maskedApiKey} (dejar vacío para conservar)`
                                                : PROVIDER_PRESETS[provider]?.keyPlaceholder || 'sk-...'
                                        }
                                        className="w-full pl-3 pr-10 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowApiKey(prev => !prev)}
                                        className="absolute right-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                                        aria-label="Mostrar u ocultar clave"
                                    >
                                        {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            {isAdmin && (
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                        Alcance de la credencial
                                    </label>
                                    <select
                                        value={scope}
                                        onChange={e => setScope(e.target.value as 'user' | 'global')}
                                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                    >
                                        <option value="user">Solo para mi cuenta de usuario</option>
                                        <option value="global">Institucional global (habilita IA a todos los docentes)</option>
                                    </select>
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('generate')}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 cursor-pointer"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingConfig}
                                    className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                >
                                    {savingConfig ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                    <span>Guardar configuración</span>
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-5">
                            {/* Ficha técnica de parámetros SIGAFI que alimentan el generador */}
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

                            {!loadingConfig && !configStatus?.isReady && (
                                <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/80 bg-amber-50 dark:bg-[#1a1610] flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-zinc-200">
                                        <AlertCircle size={15} className="text-amber-600 shrink-0" />
                                        <span>Configure su API Key de DeepSeek, Gemini u OpenAI para habilitar el autollenado curricular.</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('config')}
                                        className="px-3 py-1.5 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-lg shrink-0 cursor-pointer"
                                    >
                                        Configurar API Key
                                    </button>
                                </div>
                            )}

                            {activeTab === 'generate' ? (
                                /* Controles de Generación */
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                            Alcance del autocompletado
                                        </label>
                                        <select
                                            value={targetSection}
                                            onChange={e => setTargetSection(e.target.value)}
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3]"
                                        >
                                            {TARGET_SECTION_OPTIONS.map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                            Enfoque o lineamientos específicos del docente (opcional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={customInstructions}
                                            onChange={e => setCustomInstructions(e.target.value)}
                                            placeholder="Ej. Estructurar en 4 unidades, priorizar prácticas con herramientas open-source, contenedores y proyectos aplicados..."
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3] resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || !configStatus?.isReady}
                                            className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span>Estructurando propuesta curricular...</span>
                                                </>
                                            ) : generatedDraft ? (
                                                <>
                                                    <RefreshCw size={14} />
                                                    <span>Regenerar propuesta</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles size={14} />
                                                    <span>Generar propuesta curricular</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                /* Controles de Importación de Archivo Digital (.pdf / .docx) */
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                Documento PEA de origen (.pdf digital o .docx)
                                            </label>
                                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                                                Solo texto digital (sin imágenes) · Máx. 15 MB
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
                                                        Haga clic para seleccionar o arrastre su archivo aquí
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                        Formatos admitidos: PDF con texto seleccionable (.pdf) y Microsoft Word (.docx). No se admiten imágenes.
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileText size={18} className="text-[#0070f3] shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                                            {selectedFile.name}
                                                        </p>
                                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                                                            {(selectedFile.size / 1024).toFixed(1)} KB · Documento digital listo para extracción
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedFile(null);
                                                        setGeneratedDraft(null);
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
                                            Indicaciones adicionales para la adaptación curricular (opcional)
                                        </label>
                                        <textarea
                                            rows={2}
                                            value={importInstructions}
                                            onChange={e => setImportInstructions(e.target.value)}
                                            placeholder="Ej. Conservar íntegramente los subtemas de las unidades del documento y actualizar la bibliografía a APA 7ma edición..."
                                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#0070f3] resize-none"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleImportDocument}
                                            disabled={isImporting || !selectedFile || !configStatus?.isReady}
                                            className="px-4 py-2 bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                            {isImporting ? (
                                                <>
                                                    <Loader2 size={14} className="animate-spin" />
                                                    <span>Extrayendo y estructurando documento...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FileUp size={14} />
                                                    <span>Analizar e importar documento</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Previsualización en Folio Continuo antes de aplicar */}
                            {generatedDraft && (
                                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-zinc-800">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                            Secciones estructuradas listas para aplicar ({selectedSections.length} seleccionadas)
                                        </span>
                                        {generatedDraft.validationSummary.isHoursExactMatch && (
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <CheckCircle2 size={13} />
                                                <span>Cuadre SIGAFI verificado ({generatedDraft.validationSummary.generatedTotalHoras}h)</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800 bg-white dark:bg-zinc-950">
                                        {generatedDraft.validationSummary.generatedSections.map(secId => {
                                            const isChecked = selectedSections.includes(secId);
                                            const label = SECTION_LABELS[secId] || secId;

                                            let previewText = '';
                                            if (secId === 'pea_objectives_section') {
                                                previewText = stripHtmlPreview(generatedDraft.objetivoAsignatura);
                                            } else if (secId === 'pea_prerequisites_section') {
                                                previewText = generatedDraft.prerrequisitos.map(p => p.asignatura).join(', ');
                                            } else if (secId === 'pea_career_outcomes_section') {
                                                previewText = stripHtmlPreview(generatedDraft.rdaCarrera);
                                            } else if (secId === 'pea_subject_outcomes_section') {
                                                previewText = stripHtmlPreview(generatedDraft.resultadosAprendizaje);
                                            } else if (secId === 'pea_contents_section') {
                                                previewText = generatedDraft.unidades
                                                    .map(u => `U${u.num}: ${u.titulo} (${u.horasCD}CD + ${u.horasAPE}APE + ${u.horasTA}TA = ${u.horasTotal}h)`)
                                                    .join(' · ');
                                            } else if (secId === 'pea_methodology_section') {
                                                previewText = stripHtmlPreview(generatedDraft.metodologiaEnsenanza);
                                            } else if (secId === 'pea_resources_section') {
                                                previewText = `${generatedDraft.actividadesPracticas.length} prácticas experimentales estructuradas`;
                                            } else if (secId === 'pea_evaluation_section') {
                                                previewText = `${generatedDraft.evaluaciones.length} componentes de evaluación sobre 10 pts`;
                                            } else if (secId === 'pea_bibliography_section') {
                                                previewText = `${generatedDraft.bibliografias.length} obras en formato APA 7ma edición`;
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
                    )}
                </div>

                {/* Pie Sólido de Confirmación */}
                {activeTab !== 'config' && generatedDraft && (
                    <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Los datos generales de SIGAFI y firmas se mantienen intactos.
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


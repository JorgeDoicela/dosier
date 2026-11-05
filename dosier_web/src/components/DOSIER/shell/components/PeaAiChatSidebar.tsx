import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    Sparkles,
    Send,
    Loader2,
    Check,
    Trash2,
    Settings,
    Key,
    AlertCircle,
    Eye,
    ChevronDown,
    ArrowDownToLine,
    AlertTriangle
} from 'lucide-react';
import { GeistSelect } from '../../../Common/GeistSelect';
import {
    getPeaAiConfig,
    savePeaAiConfig,
    AI_PROVIDER_MODELS,
    type PeaAiConfigStatus,
    type PeaStructuredDraft,
    convertDraftToEditorFields
} from '../../../../services/peaAiService';
import { formatDynamicSectionLabel } from '../../../../utils/sectionNumbering';
import { useAuth } from '../../../../api/AuthContext';

export interface PeaChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: Date | string;
    targetSection?: string;
    draft?: PeaStructuredDraft;
    applied?: boolean;
    appliedSections?: string[];
}

export interface PeaAiChatSidebarProps {
    instanceUuid?: string;
    resolvedPeaUuid?: string;
    formData?: any;
    sectionItems?: { id: string; label: string }[];
    onTriggerAiGeneration?: (
        targetSection: string,
        customInstructions: string,
        customModel?: string,
        history?: Array<{ role: 'user' | 'assistant'; content: string }>
    ) => Promise<PeaStructuredDraft | null | void> | void;
    onApplyStructuredDraft?: (patch: Record<string, any>) => void;
    onOpenAiConfigModal?: () => void;
    isGeneratingAi?: boolean;
    aiConfigVersion?: number;
}

export interface PeaSectionMeta {
    id: string;
    num: string;
    shortLabel: string;
    fullLabel: string;
}

export const PEA_SECTIONS_CATALOG: PeaSectionMeta[] = [
    { id: 'pea_objectives_section', num: '2', shortLabel: '2. Objetivo', fullLabel: '2. Objetivo de la Asignatura' },
    { id: 'pea_prerequisites_section', num: '3', shortLabel: '3. Prerrequisitos', fullLabel: '3. Prerrequisitos Curriculares' },
    { id: 'pea_career_outcomes_section', num: '4', shortLabel: '4. RDA Carrera', fullLabel: '4. RDA Carrera (Perfil de Egreso)' },
    { id: 'pea_subject_outcomes_section', num: '5', shortLabel: '5. RDA Asignatura', fullLabel: '5. RDA de la Asignatura' },
    { id: 'pea_contents_section', num: '6', shortLabel: '6. Unidades', fullLabel: '6. Contenidos de Enseñanza (Unidades)' },
    { id: 'pea_methodology_section', num: '7', shortLabel: '7. Metodología', fullLabel: '7. Metodología y Recursos Didácticos' },
    { id: 'pea_resources_section', num: '8', shortLabel: '8. Prácticas', fullLabel: '8. Actividades Prácticas (APE)' },
    { id: 'pea_evaluation_section', num: '9', shortLabel: '9. Evaluación', fullLabel: '9. Sistema de Evaluación Curricular' },
    { id: 'pea_bibliography_section', num: '10', shortLabel: '10. Bibliografía', fullLabel: '10. Bibliografía APA 7ma' }
];

const SECTION_LABELS: Record<string, string> = {
    pea_objectives_section: '2. Objetivo de la Asignatura',
    pea_prerequisites_section: '3. Prerrequisitos Curriculares',
    pea_career_outcomes_section: '4. RDA de la Carrera',
    pea_subject_outcomes_section: '5. RDA de la Asignatura',
    pea_contents_section: '6. Contenidos de Enseñanza',
    pea_methodology_section: '7. Metodología y Recursos',
    pea_resources_section: '8. Actividades Prácticas',
    pea_evaluation_section: '9. Evaluación del Aprendizaje',
    pea_bibliography_section: '10. Bibliografía'
};

export const PeaAiChatSidebar: React.FC<PeaAiChatSidebarProps> = ({
    instanceUuid,
    resolvedPeaUuid,
    formData,
    sectionItems,
    onTriggerAiGeneration,
    onApplyStructuredDraft,
    onOpenAiConfigModal,
    isGeneratingAi = false,
    aiConfigVersion = 0
}) => {
    const { user } = useAuth();

    // Clave de almacenamiento local única por PEA / Instancia
    const storageKey = useMemo(() => {
        const id = resolvedPeaUuid || instanceUuid;
        return id ? `dosier_pea_chat_${id}` : null;
    }, [resolvedPeaUuid, instanceUuid]);

    // Configuración y proveedor de IA
    const [aiConfigStatus, setAiConfigStatus] = useState<PeaAiConfigStatus | null>(null);
    const [loadingAiConfig, setLoadingAiConfig] = useState<boolean>(false);

    // Estado del chat
    const [messages, setMessages] = useState<PeaChatMessage[]>([]);
    const [inputPrompt, setInputPrompt] = useState<string>('');
    const [selectedSections, setSelectedSections] = useState<string[]>(['all']);
    const [isSectionMenuOpen, setIsSectionMenuOpen] = useState<boolean>(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const sectionMenuRef = useRef<HTMLDivElement>(null);

    // Flag de hidratación de historial
    const isHistoryLoadedRef = useRef<boolean>(false);

    // Cargar historial persistido al montar o cambiar de documento
    useEffect(() => {
        isHistoryLoadedRef.current = false;
        if (!storageKey) {
            setMessages([]);
            setAppliedSectionsByMsg({});
            isHistoryLoadedRef.current = true;
            return;
        }

        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                } else if (parsed && typeof parsed === 'object') {
                    if (Array.isArray(parsed.messages)) {
                        setMessages(parsed.messages);
                    }
                    if (parsed.appliedSectionsByMsg && typeof parsed.appliedSectionsByMsg === 'object') {
                        setAppliedSectionsByMsg(parsed.appliedSectionsByMsg);
                    }
                }
            } else {
                setMessages([]);
                setAppliedSectionsByMsg({});
            }
        } catch (err) {
            console.error('[DOSIER AI Chat] Error recuperando historial local:', err);
            setMessages([]);
            setAppliedSectionsByMsg({});
        } finally {
            isHistoryLoadedRef.current = true;
        }
    }, [storageKey]);

    // Cerrar popover de selección múltiple al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (sectionMenuRef.current && !sectionMenuRef.current.contains(e.target as Node)) {
                setIsSectionMenuOpen(false);
            }
        };
        if (isSectionMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSectionMenuOpen]);

    const isAllSelected = selectedSections.includes('all') || selectedSections.length === PEA_SECTIONS_CATALOG.length;

    const handleToggleAll = () => {
        if (isAllSelected) {
            setSelectedSections([]);
        } else {
            setSelectedSections(['all']);
        }
    };

    const handleToggleSection = (secId: string) => {
        if (isAllSelected) {
            // Estaba todo seleccionado y desmarca una: quedan las otras 8
            const remaining = PEA_SECTIONS_CATALOG.map(s => s.id).filter(id => id !== secId);
            setSelectedSections(remaining);
            return;
        }

        if (selectedSections.includes(secId)) {
            const updated = selectedSections.filter(id => id !== secId);
            setSelectedSections(updated);
        } else {
            const updated = [...selectedSections, secId];
            if (updated.length === PEA_SECTIONS_CATALOG.length) {
                setSelectedSections(['all']);
            } else {
                setSelectedSections(updated);
            }
        }
    };

    const sectionButtonLabel = useMemo(() => {
        if (isAllSelected || selectedSections.length === 0) {
            return 'Todo el PEA (Secciones 2 — 10)';
        }
        if (selectedSections.length === 1) {
            const item = PEA_SECTIONS_CATALOG.find(s => s.id === selectedSections[0]);
            return item ? item.shortLabel : selectedSections[0];
        }
        const nums = PEA_SECTIONS_CATALOG
            .filter(s => selectedSections.includes(s.id))
            .map(s => s.num);
        return `${selectedSections.length} secciones (${nums.join(', ')})`;
    }, [isAllSelected, selectedSections]);

    // Sincronizar modelo seleccionado con el status
    useEffect(() => {
        if (aiConfigStatus?.activeModel) {
            setSelectedModel(aiConfigStatus.activeModel);
        }
    }, [aiConfigStatus?.activeModel]);

    // Opciones del selector de modelos/modos según el proveedor
    const availableModelOptions = useMemo(() => {
        const provider = aiConfigStatus?.activeProvider || 'deepseek';
        const specs = AI_PROVIDER_MODELS[provider] || [];
        if (specs.length === 0) {
            return [
                {
                    value: selectedModel || 'deepseek-chat',
                    label: selectedModel || 'Modelo Estándar'
                }
            ];
        }
        return specs.map(spec => ({
            value: spec.id,
            label: spec.modeLabel
        }));
    }, [aiConfigStatus?.activeProvider, selectedModel]);

    // Cambio dinámico de modo/modelo in-situ
    const handleModelChange = async (newModel: string) => {
        setSelectedModel(newModel);
        if (aiConfigStatus?.activeProvider) {
            try {
                await savePeaAiConfig({
                    provider: aiConfigStatus.activeProvider,
                    model: newModel,
                    baseUrl: aiConfigStatus.activeBaseUrl || undefined,
                    reasoningEffort: aiConfigStatus.activeReasoningEffort || undefined,
                    scope: 'user'
                });
                setAiConfigStatus(prev => prev ? { ...prev, activeModel: newModel } : prev);
            } catch (err) {
                console.error('[DOSIER AI Chat] Error guardando cambio de modelo:', err);
            }
        }
    };

    // Vista previa expandida de borrador por mensaje
    const [previewDraftMap, setPreviewDraftMap] = useState<Record<string, boolean>>({});

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Cargar estado de la clave de API / proveedor
    useEffect(() => {
        setLoadingAiConfig(true);
        getPeaAiConfig()
            .then(st => setAiConfigStatus(st))
            .catch(err => console.error('[DOSIER AI Chat] Error cargando config:', err))
            .finally(() => setLoadingAiConfig(false));
    }, [aiConfigVersion]);

    // Scroll automático al final cuando llegan mensajes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isGeneratingAi]);

    // Secciones disponibles dinámicas
    const aiAvailableSections = useMemo(() => {
        if (sectionItems && sectionItems.length > 0) {
            return sectionItems
                .map((sec, idx) => ({
                    id: sec.id,
                    label: formatDynamicSectionLabel(sec.label, idx)
                }))
                .filter(sec => sec.id !== 'pea_general_section' && sec.id !== 'pea_signatures_section');
        }
        return Object.entries(SECTION_LABELS).map(([id, label]) => ({ id, label }));
    }, [sectionItems]);

    // Toggle de vista previa de borrador
    const togglePreview = (msgId: string) => {
        setPreviewDraftMap(prev => ({ ...prev, [msgId]: !prev[msgId] }));
    };

    // Tracking de secciones transferidas por mensaje: { [msgId]: ['pea_objectives_section', ...] }
    const [appliedSectionsByMsg, setAppliedSectionsByMsg] = useState<Record<string, string[]>>({});

    // Clave de confirmación inline: `${msgId}_${sectionId}` o `${msgId}_all`
    const [confirmOverwriteKey, setConfirmOverwriteKey] = useState<string | null>(null);
    const confirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        };
    }, []);

    // Persistir historial reactivamente cuando cambian los mensajes o secciones aplicadas
    useEffect(() => {
        if (!isHistoryLoadedRef.current || !storageKey) return;
        try {
            if (messages.length === 0) {
                localStorage.removeItem(storageKey);
            } else {
                const payload = {
                    messages: messages.slice(-25),
                    appliedSectionsByMsg
                };
                localStorage.setItem(storageKey, JSON.stringify(payload));
            }
        } catch (err) {
            console.error('[DOSIER AI Chat] Error persistiendo historial local:', err);
        }
    }, [messages, appliedSectionsByMsg, storageKey]);

    // Detección de contenido previo en el editor para cada sección del PEA
    const hasDataInEditor = useCallback((sectionId: string): boolean => {
        if (!formData) return false;
        switch (sectionId) {
            case 'pea_objectives_section': {
                const text = String(formData?.ObjetivoAsignatura ?? formData?.objetivo_asignatura ?? '').replace(/<[^>]+>/g, '').trim();
                return text.length > 0;
            }
            case 'pea_prerequisites_section': {
                const arr = formData?.Prerrequisitos ?? formData?.prerrequisitos;
                return Array.isArray(arr) && arr.length > 0;
            }
            case 'pea_career_outcomes_section': {
                const text = String(formData?.RdaCarrera ?? formData?.rda_carrera ?? '').replace(/<[^>]+>/g, '').trim();
                return text.length > 0;
            }
            case 'pea_subject_outcomes_section': {
                const text = String(formData?.ResultadosAprendizaje ?? formData?.resultados_aprendizaje ?? '').replace(/<[^>]+>/g, '').trim();
                return text.length > 0;
            }
            case 'pea_contents_section': {
                const arr = formData?.Unidades ?? formData?.unidades;
                return Array.isArray(arr) && arr.length > 0;
            }
            case 'pea_methodology_section': {
                const met = String(formData?.MetodologiaEnsenanza ?? formData?.metodologia_ensenanza ?? '').replace(/<[^>]+>/g, '').trim();
                const rec = String(formData?.RecursosDidacticos ?? formData?.recursos_didacticos ?? '').replace(/<[^>]+>/g, '').trim();
                return met.length > 0 || rec.length > 0;
            }
            case 'pea_resources_section': {
                const arr = formData?.ActividadesPracticas ?? formData?.actividades_practicas;
                return Array.isArray(arr) && arr.length > 0;
            }
            case 'pea_evaluation_section': {
                const arr = formData?.Evaluaciones ?? formData?.evaluaciones;
                return Array.isArray(arr) && arr.length > 0;
            }
            case 'pea_bibliography_section': {
                const arr = formData?.Bibliografias ?? formData?.bibliografias;
                const bas = String(formData?.BibliografiaBasica ?? formData?.bibliografia_basica ?? '').replace(/<[^>]+>/g, '').trim();
                return (Array.isArray(arr) && arr.length > 0) || bas.length > 0;
            }
            default:
                return false;
        }
    }, [formData]);

    const getPresentSectionIdsInDraft = useCallback((draft: PeaStructuredDraft): string[] => {
        const ids: string[] = [];
        if (draft.objetivoAsignatura) ids.push('pea_objectives_section');
        if (draft.prerrequisitos && draft.prerrequisitos.length > 0) ids.push('pea_prerequisites_section');
        if (draft.rdaCarrera) ids.push('pea_career_outcomes_section');
        if (draft.resultadosAprendizaje) ids.push('pea_subject_outcomes_section');
        if (draft.unidades && draft.unidades.length > 0) ids.push('pea_contents_section');
        if (draft.metodologiaEnsenanza || draft.recursosDidacticos) ids.push('pea_methodology_section');
        if (draft.actividadesPracticas && draft.actividadesPracticas.length > 0) ids.push('pea_resources_section');
        if (draft.evaluaciones && draft.evaluaciones.length > 0) ids.push('pea_evaluation_section');
        if ((draft.bibliografias && draft.bibliografias.length > 0) || draft.bibliografiaBasica || draft.bibliografiaConsulta) ids.push('pea_bibliography_section');
        return ids;
    }, []);

    const isSectionApplied = (msgId: string, sectionId: string): boolean => {
        const list = appliedSectionsByMsg[msgId] || [];
        return list.includes(sectionId);
    };

    const isAllDraftApplied = (msgId: string, draft: PeaStructuredDraft): boolean => {
        const presentIds = getPresentSectionIdsInDraft(draft);
        if (presentIds.length === 0) return false;
        const appliedList = appliedSectionsByMsg[msgId] || [];
        return presentIds.every(id => appliedList.includes(id));
    };

    // Aplicar una única sección al editor con confirmación si ya existen datos
    const handleApplySingleSection = useCallback((msgId: string, draft: PeaStructuredDraft, sectionId: string) => {
        if (!onApplyStructuredDraft) return;

        const confirmKey = `${msgId}_${sectionId}`;
        const hasExisting = hasDataInEditor(sectionId);

        // Si ya existen datos y aún no confirmó, pedir confirmación de 4 segundos
        if (hasExisting && confirmOverwriteKey !== confirmKey) {
            setConfirmOverwriteKey(confirmKey);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => {
                setConfirmOverwriteKey(null);
            }, 4000);
            return;
        }

        // Si confirmó o no tenía datos previos, aplicar inmediatamente
        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        setConfirmOverwriteKey(null);

        const patch = convertDraftToEditorFields(draft, [sectionId]);
        onApplyStructuredDraft(patch);

        setAppliedSectionsByMsg(prev => {
            const currentList = prev[msgId] || [];
            if (currentList.includes(sectionId)) return prev;
            return { ...prev, [msgId]: [...currentList, sectionId] };
        });
    }, [onApplyStructuredDraft, hasDataInEditor, confirmOverwriteKey]);

    // Aplicar todas las secciones al editor con confirmación global si sobreescribe
    const handleApplyAllSections = useCallback((msgId: string, draft: PeaStructuredDraft, allSecIds: string[]) => {
        if (!onApplyStructuredDraft) return;

        const confirmKey = `${msgId}_all`;
        const hasExisting = allSecIds.some(secId => hasDataInEditor(secId));

        if (hasExisting && confirmOverwriteKey !== confirmKey) {
            setConfirmOverwriteKey(confirmKey);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => {
                setConfirmOverwriteKey(null);
            }, 4000);
            return;
        }

        if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
        setConfirmOverwriteKey(null);

        const targetSec = draft.validationSummary?.targetSection;
        const selectedSections = targetSec && targetSec !== 'all' ? [targetSec] : undefined;

        const patch = convertDraftToEditorFields(draft, selectedSections);
        onApplyStructuredDraft(patch);

        setAppliedSectionsByMsg(prev => ({
            ...prev,
            [msgId]: allSecIds
        }));

        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, applied: true } : m));
    }, [onApplyStructuredDraft, hasDataInEditor, confirmOverwriteKey]);

    // Subcomponente de acción granular por sección
    const renderSectionHeaderWithAction = (
        msgId: string,
        draft: PeaStructuredDraft,
        sectionId: string,
        sectionTitle: string
    ) => {
        const isApplied = isSectionApplied(msgId, sectionId);
        const confirmKey = `${msgId}_${sectionId}`;
        const isConfirming = confirmOverwriteKey === confirmKey;
        const hasExisting = hasDataInEditor(sectionId);

        return (
            <div className="flex items-center justify-between gap-2 mb-1">
                <strong className="block text-text-main font-semibold text-[11px] truncate">
                    {sectionTitle}
                </strong>
                {isApplied ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Check size={11} strokeWidth={2.5} />
                        <span>Transferido</span>
                    </span>
                ) : isConfirming ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleApplySingleSection(msgId, draft, sectionId);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/25 cursor-pointer animate-pulse shrink-0 transition-all"
                        title="Haga clic para confirmar el reemplazo del contenido actual en el editor"
                    >
                        <AlertTriangle size={10} />
                        <span>¿Sobrescribir?</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleApplySingleSection(msgId, draft, sectionId);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-400 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:text-[#0070f3] text-[10px] font-medium transition-colors cursor-pointer shadow-2xs shrink-0"
                        title={hasExisting ? 'Reemplazará el contenido actual en el editor' : 'Transferir esta sección al editor'}
                    >
                        <ArrowDownToLine size={10} />
                        <span>Transferir</span>
                        {hasExisting && (
                            <span className="text-[9px] text-amber-600 dark:text-amber-400 font-normal">· reemplaza</span>
                        )}
                    </button>
                )}
            </div>
        );
    };

    // Envío del prompt
    const handleSendMessage = useCallback(async (customText?: string, customTarget?: string) => {
        const textToSend = (customText ?? inputPrompt).trim();
        const effectiveSectionsArr = isAllSelected || selectedSections.length === 0 ? ['all'] : selectedSections;
        const selectedTarget = customTarget ?? (isAllSelected || selectedSections.length === 0 ? 'all' : selectedSections.join(','));

        if (!textToSend || isGeneratingAi) return;
        if (!aiConfigStatus?.isReady) {
            onOpenAiConfigModal?.();
            return;
        }

        const userMsgId = `user_${Date.now()}`;
        const assistantMsgId = `assistant_${Date.now() + 1}`;

        // Metadato para la burbuja del usuario
        const userScopeBadge = isAllSelected || effectiveSectionsArr.includes('all')
            ? 'Todo el PEA'
            : effectiveSectionsArr.length === 1
                ? (PEA_SECTIONS_CATALOG.find(s => s.id === effectiveSectionsArr[0])?.shortLabel || effectiveSectionsArr[0])
                : `Secciones ${effectiveSectionsArr.map(id => PEA_SECTIONS_CATALOG.find(s => s.id === id)?.num || id).join(', ')}`;

        // 1. Agregar mensaje del usuario
        const userMsg: PeaChatMessage = {
            id: userMsgId,
            sender: 'user',
            text: textToSend,
            timestamp: new Date(),
            targetSection: userScopeBadge
        };

        // 2. Crear mensaje inicial del asistente
        const targetLabel = isAllSelected || effectiveSectionsArr.includes('all')
            ? 'todo el PEA oficial (secciones 2 a 10)'
            : effectiveSectionsArr.map(id => PEA_SECTIONS_CATALOG.find(s => s.id === id)?.shortLabel || id).join(', ');

        const assistantMsg: PeaChatMessage = {
            id: assistantMsgId,
            sender: 'assistant',
            text: `Formulando propuesta curricular para ${targetLabel}...`,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg, assistantMsg]);
        setInputPrompt('');

        // 3. Ejecutar generación a través del handler principal enviando historial previo
        try {
            if (onTriggerAiGeneration) {
                const historyToSend: Array<{ role: 'user' | 'assistant'; content: string }> = messages
                    .filter(m => m.text && !m.text.startsWith('Error en la generación'))
                    .slice(-6)
                    .map(m => ({
                        role: m.sender === 'user' ? 'user' : 'assistant',
                        content: m.text
                    }));

                const res = await onTriggerAiGeneration(
                    selectedTarget,
                    textToSend,
                    selectedModel || aiConfigStatus?.activeModel,
                    historyToSend
                );
                const draft = res as PeaStructuredDraft | null;

                if (draft) {
                    const sectionCount = draft.validationSummary?.generatedSections?.length || 1;
                    const resultText = `He formulado la propuesta curricular para ${targetLabel}. Se generaron ${sectionCount} sección(es) con horas normadas cuadradas con el distributivo oficial. Puedes revisar el contenido y aplicarlo directamente al documento.`;

                    setMessages(prev => prev.map(m => {
                        if (m.id === assistantMsgId) {
                            return {
                                ...m,
                                text: resultText,
                                draft,
                                applied: false
                            };
                        }
                        return m;
                    }));
                } else {
                    setMessages(prev => prev.map(m => {
                        if (m.id === assistantMsgId) {
                            return {
                                ...m,
                                text: 'Propuesta generada y lista en el editor.'
                            };
                        }
                        return m;
                    }));
                }
            }
        } catch (err: any) {
            const errorMsg = err?.message || 'Ocurrió un error al procesar la propuesta curricular con el proveedor de IA.';
            setMessages(prev => prev.map(m => {
                if (m.id === assistantMsgId) {
                    return {
                        ...m,
                        text: `Error en la generación: ${errorMsg}`
                    };
                }
                return m;
            }));
        }
    }, [inputPrompt, isAllSelected, selectedSections, selectedModel, isGeneratingAi, aiConfigStatus, onTriggerAiGeneration, onOpenAiConfigModal]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            // Envío instantáneo con Ctrl+Enter o Cmd+Enter
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleSendMessage();
                return;
            }

            // Salto de línea manual con Shift+Enter
            if (e.shiftKey) {
                return;
            }

            const target = e.currentTarget;
            const cursorPosition = target.selectionStart;
            const textBeforeCursor = target.value.slice(0, cursorPosition);

            // Si el carácter inmediatamente anterior es un salto de línea (\n), es el segundo Enter consecutivo -> enviar
            if (textBeforeCursor.endsWith('\n')) {
                e.preventDefault();
                handleSendMessage();
                return;
            }

            // Si es el primer Enter, el evento nativo del navegador inserta el salto de línea normal (\n)
        }
    };

    const handleClearChat = () => {
        setMessages([]);
        setAppliedSectionsByMsg({});
        setPreviewDraftMap({});
        setConfirmOverwriteKey(null);
        if (storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch (err) {
                console.error('[DOSIER AI Chat] Error eliminando historial local:', err);
            }
        }
    };

    const formatTimeOnly = (d: Date | string) => {
        try {
            const date = typeof d === 'string' ? new Date(d) : d;
            return date.toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    const cleanHtmlText = (html?: string): string => {
        if (!html) return '';
        return html
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<\/li>/gi, '\n')
            .replace(/<[^>]+>/g, '')
            .replace(/\n{2,}/g, '\n')
            .trim();
    };

    return (
        <div className="flex flex-col h-full flex-1 bg-surface text-text-main font-sans">
            {/* ── Cabecera Superior del Asistente ── */}
            <div className="px-3 py-2 border-b border-border-thin flex items-center justify-between gap-2 shrink-0 bg-surface min-h-[38px]">
                <div className="flex items-center gap-2 min-w-0">
                    <Sparkles size={14} className="text-[#0070f3] shrink-0" strokeWidth={1.75} />
                    <h3 className="text-xs font-semibold text-text-main truncate leading-none">
                        Asistente Curricular IA
                    </h3>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {messages.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearChat}
                            title="Reiniciar conversación"
                            className="p-1 rounded-md text-text-dim hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            <Trash2 size={13} />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onOpenAiConfigModal}
                        title="Configurar proveedor y modelo"
                        className="p-1 rounded-md text-text-dim hover:text-[#0070f3] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <Settings size={13} />
                    </button>
                </div>
            </div>

            {/* ── Banner de Alerta si falta API Key ── */}
            {!loadingAiConfig && !aiConfigStatus?.isReady && (
                <div className="m-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <AlertCircle size={14} className="shrink-0" />
                        <span>Se requiere configurar una clave de API (DeepSeek, Gemini u OpenAI).</span>
                    </div>
                    <button
                        type="button"
                        onClick={onOpenAiConfigModal}
                        className="w-full py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <Key size={13} />
                        <span>Configurar API Key</span>
                    </button>
                </div>
            )}

            {/* ── Feed de Conversación con Scroll ── */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4 flex flex-col">
                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center select-none space-y-3.5 my-auto">
                        {/* Logo oficial institucional de DOSIER adaptado a modo claro/oscuro */}
                        <div className="flex items-center justify-center">
                            <img
                                src={`${import.meta.env.BASE_URL}logo_negro.png`}
                                alt="DOSIER"
                                className="h-9 w-auto object-contain dark:hidden"
                            />
                            <img
                                src={`${import.meta.env.BASE_URL}logo_blanco.png`}
                                alt="DOSIER"
                                className="h-9 w-auto object-contain hidden dark:block"
                            />
                        </div>

                        {/* Saludo personalizado con el nombre del usuario */}
                        <div className="space-y-1 max-w-xs">
                            <h4 className="text-sm font-semibold text-text-main tracking-tight">
                                Hola, {user?.nombre_completo || user?.usuario || 'Docente'}
                            </h4>
                            <p className="text-xs text-text-dim leading-relaxed">
                                ¿En qué puedo ayudarte hoy con tu Programa de Estudio de la Asignatura?
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isUser = msg.sender === 'user';
                        const isPreviewExpanded = previewDraftMap[msg.id] ?? false;

                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                            >
                                {/* Metadato del mensaje */}
                                <div className="flex items-center gap-1.5 text-[10px] text-text-dim px-1">
                                    <span>{formatTimeOnly(msg.timestamp)}</span>
                                    {isUser && msg.targetSection && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-[9px]">
                                            {msg.targetSection === 'all' ? 'Todo el PEA' : (SECTION_LABELS[msg.targetSection] || msg.targetSection)}
                                        </span>
                                    )}
                                </div>

                                {/* Cuerpo del Mensaje */}
                                <div
                                    className={`text-xs leading-relaxed rounded-2xl p-3.5 shadow-xs ${
                                        isUser
                                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 max-w-[85%]'
                                            : 'bg-surface border border-border-thin text-text-main max-w-full w-full space-y-3'
                                    }`}
                                >
                                    {/* Estado en proceso o Texto del Asistente */}
                                    {!isUser && !msg.draft ? (
                                        <div className="flex items-center gap-2 text-text-dim py-1 font-medium">
                                            <Loader2 size={13} className="animate-spin text-[#0070f3]" />
                                            <span>{msg.text}</span>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    )}

                                    {/* Propuesta Directa sin cuadro sobre cuadro */}
                                    {!isUser && msg.draft && (
                                        <div className="pt-3 border-t border-border-thin space-y-3">
                                            {/* Resumen de Horas y Validación CACES */}
                                            {msg.draft.validationSummary && (
                                                <div className="space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                                                        <span className="font-semibold text-text-main">
                                                            Carga Horaria Validada
                                                        </span>
                                                        <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                                                            {msg.draft.validationSummary.generatedTotalHoras}h Total
                                                        </span>
                                                        {msg.draft.validationSummary.isBloomVerbValid && msg.draft.validationSummary.bloomVerbDetected && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-500/10 text-[#0070f3] dark:text-blue-400 border border-blue-500/20 font-medium">
                                                                Bloom: {msg.draft.validationSummary.bloomVerbDetected}
                                                            </span>
                                                        )}
                                                        {msg.draft.validationSummary.arePracticesCompliant && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                                                                APE Normada
                                                            </span>
                                                        )}
                                                        {msg.draft.validationSummary.isBibliographyCompliant && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20 font-medium">
                                                                APA 7ma
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Botón de toggle de vista previa en su propia línea inferior */}
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => togglePreview(msg.id)}
                                                    className="text-[11px] text-[#0070f3] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer font-medium"
                                                >
                                                    <Eye size={12} />
                                                    <span>{isPreviewExpanded ? 'Ocultar vista previa' : 'Ver contenido propuesto'}</span>
                                                </button>
                                            </div>

                                            {/* Desglose detallado desplegable: Sin caja con fondo gris, sin cuadros anidados, sin scrollbar asfixiante */}
                                            {isPreviewExpanded && (
                                                <div className="space-y-3 pt-2.5 border-t border-border-thin text-[11px] leading-relaxed">
                                                    {msg.draft.objetivoAsignatura && (
                                                        <div>
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_objectives_section', '2. Objetivo de la Asignatura')}
                                                            <p className="text-text-dim text-[10.5px] whitespace-pre-wrap">{cleanHtmlText(msg.draft.objetivoAsignatura)}</p>
                                                        </div>
                                                    )}
                                                    {msg.draft.prerrequisitos?.length > 0 && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_prerequisites_section', '3. Prerrequisitos Curriculares')}
                                                            <ul className="list-disc pl-4 space-y-0.5 text-text-dim text-[10.5px]">
                                                                {msg.draft.prerrequisitos.map((p, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-semibold text-text-main">{p.asignatura}:</span> {p.observacion}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {msg.draft.rdaCarrera && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_career_outcomes_section', '4. RDA Perfil de Egreso (Carrera)')}
                                                            <p className="text-text-dim text-[10.5px] whitespace-pre-wrap">{cleanHtmlText(msg.draft.rdaCarrera)}</p>
                                                        </div>
                                                    )}
                                                    {msg.draft.resultadosAprendizaje && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_subject_outcomes_section', '5. RDA de la Asignatura')}
                                                            <p className="text-text-dim text-[10.5px] whitespace-pre-wrap">{cleanHtmlText(msg.draft.resultadosAprendizaje)}</p>
                                                        </div>
                                                    )}
                                                    {msg.draft.unidades?.length > 0 && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_contents_section', `6. Unidades Temáticas (${msg.draft.unidades.length})`)}
                                                            <ul className="list-disc pl-4 space-y-1 text-text-dim text-[10.5px]">
                                                                {msg.draft.unidades.map((u, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-semibold text-text-main">{u.titulo}:</span> {u.horasTotal}h ({u.horasCD}CD / {u.horasAPE}APE / {u.horasTA}TA)
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {(msg.draft.metodologiaEnsenanza || msg.draft.recursosDidacticos) && (
                                                        <div className="pt-2 border-t border-border-thin/50 space-y-1">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_methodology_section', '7. Metodología y Recursos Didácticos')}
                                                            {msg.draft.metodologiaEnsenanza && (
                                                                <p className="text-text-dim text-[10.5px] whitespace-pre-wrap">{cleanHtmlText(msg.draft.metodologiaEnsenanza)}</p>
                                                            )}
                                                            {msg.draft.recursosDidacticos && (
                                                                <p className="text-text-dim text-[10.5px] whitespace-pre-wrap">{cleanHtmlText(msg.draft.recursosDidacticos)}</p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {msg.draft.actividadesPracticas?.length > 0 && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_resources_section', `8. Actividades Prácticas y Experimentales (${msg.draft.actividadesPracticas.length})`)}
                                                            <ul className="list-disc pl-4 space-y-0.5 text-text-dim text-[10.5px]">
                                                                {msg.draft.actividadesPracticas.map((a, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-semibold text-text-main">Unidad {a.unidad}:</span> {a.nombre} ({a.horas}h — {a.escenario})
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {msg.draft.evaluaciones?.length > 0 && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_evaluation_section', `9. Sistema de Evaluación Curricular (${msg.draft.evaluaciones.length})`)}
                                                            <ul className="list-disc pl-4 space-y-0.5 text-text-dim text-[10.5px]">
                                                                {msg.draft.evaluaciones.map((e, i) => (
                                                                    <li key={i}>
                                                                        <span className="font-semibold text-text-main">{e.nota}:</span> {e.tipo} ({e.calificacion} pts)
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                    {(msg.draft.bibliografias?.length > 0 || msg.draft.bibliografiaBasica || msg.draft.bibliografiaConsulta) && (
                                                        <div className="pt-2 border-t border-border-thin/50">
                                                            {renderSectionHeaderWithAction(msg.id, msg.draft, 'pea_bibliography_section', '10. Bibliografía APA 7ma')}
                                                            {msg.draft.bibliografias?.length > 0 ? (
                                                                <ul className="list-disc pl-4 space-y-0.5 text-text-dim text-[10.5px]">
                                                                    {msg.draft.bibliografias.map((b, i) => (
                                                                        <li key={i}>
                                                                            <span className="font-semibold text-text-main">[{b.tipoBibliografia}]</span> {b.citaCompletaApa || `${b.autor}. ${b.tituloLibro}.`}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            ) : (
                                                                <p className="text-text-dim text-[10.5px] mt-0.5 whitespace-pre-wrap">
                                                                    {cleanHtmlText(msg.draft.bibliografiaBasica)} {cleanHtmlText(msg.draft.bibliografiaConsulta)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Botón de Aplicación Directa (Lote Completo con Confirmación si Sobrescribe) */}
                                            {(() => {
                                                const presentSectionIds = getPresentSectionIdsInDraft(msg.draft);
                                                const allApplied = msg.applied || isAllDraftApplied(msg.id, msg.draft);
                                                const isConfirmingAll = confirmOverwriteKey === `${msg.id}_all`;
                                                const hasAnyOverwritable = presentSectionIds.some(secId => hasDataInEditor(secId));

                                                return (
                                                    <div className="pt-1">
                                                        {allApplied ? (
                                                            <div className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5">
                                                                <Check size={14} />
                                                                <span>Propuesta completa aplicada al PEA</span>
                                                            </div>
                                                        ) : isConfirmingAll ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApplyAllSections(msg.id, msg.draft!, presentSectionIds)}
                                                                className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs animate-pulse"
                                                            >
                                                                <AlertTriangle size={14} />
                                                                <span>¿Confirmar reemplazo de secciones en el editor?</span>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleApplyAllSections(msg.id, msg.draft!, presentSectionIds)}
                                                                className="w-full py-2.5 px-3 bg-[#0070f3] hover:bg-[#0060df] text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                                            >
                                                                <Sparkles size={14} />
                                                                <span>{hasAnyOverwritable ? 'Aplicar todas las secciones al PEA' : 'Aplicar cambios al PEA'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* ── Dock de Prompt Conversacional Fijo en la Base ── */}
            <div className="p-3 border-t border-border-thin bg-surface space-y-2 shrink-0">
                {/* Selectores lado a lado: Modo/Modelo de IA (más compacto) y Alcance de Secciones */}
                <div className="grid grid-cols-[38%_1fr] gap-2 w-full">
                    <div className="min-w-0" title="Modo y modelo de ejecución de IA">
                        <GeistSelect
                            size="sm"
                            value={selectedModel || aiConfigStatus?.activeModel || 'deepseek-chat'}
                            onChange={val => handleModelChange(String(val))}
                            className="w-full text-[11px]"
                            options={availableModelOptions}
                        />
                    </div>
                    {/* Selector Multi-Sección con Popover hacia arriba */}
                    <div className="relative min-w-0" ref={sectionMenuRef} title="Seleccionar secciones a formular">
                        <button
                            type="button"
                            onClick={() => setIsSectionMenuOpen(prev => !prev)}
                            className="w-full h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-[11px] font-medium text-text-main flex items-center justify-between gap-1.5 transition-colors cursor-pointer truncate shadow-2xs"
                        >
                            <span className="truncate">{sectionButtonLabel}</span>
                            <ChevronDown size={12} className={`shrink-0 text-text-dim transition-transform ${isSectionMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Popover desplegable hacia arriba con fondo 100% sólido */}
                        {isSectionMenuOpen && (
                            <div className="absolute bottom-full mb-1.5 right-0 w-80 max-w-[calc(100vw-32px)] z-50 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl p-2.5 space-y-2 select-none">
                                {/* Cabecera del popover */}
                                <div className="flex items-center justify-between pb-1.5 border-b border-border-thin">
                                    <span className="text-[11px] font-semibold text-text-main">
                                        Alcance Curricular
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px]">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSections(['all'])}
                                            className="text-[#0070f3] dark:text-blue-400 hover:underline font-medium cursor-pointer"
                                        >
                                            Todas
                                        </button>
                                        <span className="text-text-dim">•</span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSections([])}
                                            className="text-text-dim hover:text-text-main font-medium cursor-pointer"
                                        >
                                            Limpiar
                                        </button>
                                    </div>
                                </div>

                                {/* Opción global "Todo el PEA" */}
                                <label className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-xs font-semibold text-text-main">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={handleToggleAll}
                                        className="w-3.5 h-3.5 rounded accent-[#0070f3] cursor-pointer"
                                    />
                                    <span className="flex-1 truncate">Todo el PEA (Secciones 2 — 10)</span>
                                </label>

                                <div className="border-t border-border-thin/60 my-1" />

                                {/* Lista de las 9 secciones */}
                                <div className="space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
                                    {PEA_SECTIONS_CATALOG.map((sec) => {
                                        const isChecked = isAllSelected || selectedSections.includes(sec.id);
                                        return (
                                            <label
                                                key={sec.id}
                                                className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer text-[11px] ${
                                                    isChecked
                                                        ? 'bg-blue-50/50 dark:bg-blue-950/30 text-text-main font-medium'
                                                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-text-dim'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => handleToggleSection(sec.id)}
                                                    className="w-3.5 h-3.5 rounded accent-[#0070f3] cursor-pointer shrink-0"
                                                />
                                                <span className="truncate">{sec.fullLabel}</span>
                                            </label>
                                        );
                                    })}
                                </div>

                                {/* Pie del popover */}
                                <div className="pt-2 border-t border-border-thin flex items-center justify-between text-[11px]">
                                    <span className="text-[10px] text-text-dim font-mono">
                                        {isAllSelected ? '9/9 seleccionadas' : `${selectedSections.length}/9 seleccionadas`}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setIsSectionMenuOpen(false)}
                                        className="px-2.5 py-1 bg-[#0070f3] hover:bg-[#0060df] text-white text-[10.5px] font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
                                    >
                                        Listo
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input de chat con botón de envío integrado */}
                <div className="relative border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 focus-within:border-[#0070f3] dark:focus-within:border-blue-400 transition-colors shadow-2xs overflow-hidden">
                    <textarea
                        ref={textareaRef}
                        rows={2}
                        value={inputPrompt}
                        onChange={e => setInputPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pídele al asistente curricular... (Doble Enter o botón para enviar)"
                        disabled={isGeneratingAi || !aiConfigStatus?.isReady}
                        className="w-full p-2.5 pr-10 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 bg-transparent border-0 outline-none ring-0 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none resize-none leading-relaxed block"
                        style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    />

                    <div className="absolute right-2 bottom-2">
                        <button
                            type="button"
                            onClick={() => handleSendMessage()}
                            disabled={!inputPrompt.trim() || isGeneratingAi || !aiConfigStatus?.isReady}
                            className="p-1.5 rounded-lg bg-[#0070f3] hover:bg-[#0060df] disabled:opacity-30 disabled:cursor-not-allowed text-white transition-all cursor-pointer shadow-xs flex items-center justify-center"
                            title="Enviar instrucción"
                        >
                            {isGeneratingAi ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <Send size={13} />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PeaAiChatSidebar);

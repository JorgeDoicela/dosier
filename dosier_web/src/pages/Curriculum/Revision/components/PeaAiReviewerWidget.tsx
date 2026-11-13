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
    X,
    ChevronDown,
    ChevronUp,
    ArrowUpRight,
    PlusCircle
} from 'lucide-react';
import { PeaAiAssistantModal } from '../../../../components/DOSIER/shell/components/PeaAiAssistantModal';
import {
    getPeaAiConfig,
    savePeaAiConfig,
    analyzePeaForReview,
    AI_PROVIDER_MODELS,
    type PeaAiConfigStatus,
    type PeaAiReviewFocusMode,
    type PeaAiReviewAnalysisResponse,
    type PeaReviewSuggestedObservation
} from '../../../../services/peaAiService';
import { useAuth } from '../../../../api/AuthContext';
import { useNotifications } from '../../../../api/NotificationsContext';
import type { ProjectDetail } from '../types/revisionTecnicaTypes';

export interface ReviewerChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    focusLabel?: string;
    analysis?: PeaAiReviewAnalysisResponse;
}

export interface PeaAiReviewerWidgetProps {
    projectUuid?: string;
    project: ProjectDetail;
    docSnapshot: any;
    canAudit?: boolean;
    onSaveComment?: (sectionKey: string, text: string) => Promise<void>;
    onNavigateToSection?: (sectionKey: string) => void;
}

const FOCUS_OPTIONS: Array<{ value: PeaAiReviewFocusMode; label: string; promptLabel: string }> = [
    {
        value: 'overview',
        label: 'Explicación integral del PEA',
        promptLabel: 'Explicame el proyecto PEA, su estructura pedagógica y coherencia general.'
    },
    {
        value: 'career_profile',
        label: 'Comparar con perfil de carrera',
        promptLabel: 'Compara este PEA con el perfil de egreso de la carrera, prerrequisitos de malla y RDAs.'
    },
    {
        value: 'hours_audit',
        label: 'Auditar horas, créditos y APE',
        promptLabel: 'Audita el cuadre matemático de horas (CD, APE, TA), créditos (48h) y prácticas experimentales.'
    }
];

const stripHtmlClean = (val: any): string | undefined => {
    if (typeof val !== 'string') return undefined;
    const stripped = val.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return stripped.length > 0 && stripped !== '-' ? stripped : undefined;
};

const normalizeClientSectionKey = (rawKey: string): string => {
    const k = (rawKey || '').trim();
    if (!k) return 'ObjetivoAsignatura';
    const lower = k.toLowerCase();
    if (lower.includes('general') || lower.includes('nombre') || lower.includes('hora') || lower.includes('credito')) return 'NombreAsignatura';
    if (lower.includes('objetivo')) return 'ObjetivoAsignatura';
    if (lower.includes('prerreq')) return 'Prerrequisitos';
    if (lower.includes('perfil') || lower.includes('career') || lower.includes('rdacarrera') || lower.includes('aporte')) return 'AportePerfilEgreso';
    if (lower.includes('resultado') || lower.includes('subject') || lower.includes('rda')) return 'ResultadosAprendizaje';
    if (lower.includes('contenido') || lower.includes('unidad') || lower.includes('content')) return 'Unidades';
    if (lower.includes('metodolog')) return 'MetodologiaEnsenanza';
    if (lower.includes('practica') || lower.includes('ape') || lower.includes('actividad') || lower.includes('recurso')) return 'ActividadesPracticas';
    if (lower.includes('evaluac') || lower.includes('criterio')) return 'Evaluaciones';
    if (lower.includes('bibliog')) return 'Bibliografia';
    return k;
};

const extractUnitContenidosClean = (u: any): string => {
    const raw = u.contenidos ?? u.Contenidos ?? u.temas ?? u.Temas ?? u['1'] ?? '';
    if (typeof raw === 'string') {
        const clean = stripHtmlClean(raw) || '';
        if (clean.toLowerCase() === 'contenidos y subtemas de aprendizaje') return '';
        return clean;
    }
    if (Array.isArray(raw)) {
        return raw
            .map((t: any) => {
                if (typeof t === 'string') return stripHtmlClean(t) || '';
                if (!t || typeof t !== 'object') return '';
                const titulo = stripHtmlClean(t.TituloTema ?? t.titulo_tema ?? t.titulo ?? t.nombre_tema ?? t.nombre) || '';
                const desc = stripHtmlClean(t.DescripcionSubtemas ?? t.descripcion_subtemas ?? t.descripcion ?? t.subtemas) || '';
                const isPlaceholder = !titulo || titulo.toLowerCase() === 'contenidos y subtemas de aprendizaje';
                if (isPlaceholder && !desc) return '';
                if (!isPlaceholder && desc) return `${titulo}: ${desc}`;
                return desc || titulo;
            })
            .filter(Boolean)
            .join('; ');
    }
    return '';
};

export const PeaAiReviewerWidget: React.FC<PeaAiReviewerWidgetProps> = ({
    projectUuid,
    project,
    docSnapshot,
    canAudit = false,
    onSaveComment,
    onNavigateToSection
}) => {
    const { user, isAdmin } = useAuth();
    const { addToast } = useNotifications();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
    const [aiConfigStatus, setAiConfigStatus] = useState<PeaAiConfigStatus | null>(null);
    const [loadingConfig, setLoadingConfig] = useState<boolean>(false);
    const [configVersion, setConfigVersion] = useState<number>(0);

    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedFocus, setSelectedFocus] = useState<PeaAiReviewFocusMode>('overview');
    const [inputPrompt, setInputPrompt] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    const [messages, setMessages] = useState<ReviewerChatMessage[]>([]);
    const [expandedDetailsMap, setExpandedDetailsMap] = useState<Record<string, boolean>>({});
    const [appliedObsKeys, setAppliedObsKeys] = useState<Record<string, boolean>>({});
    const [applyingObsKey, setApplyingObsKey] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isHistoryLoadedRef = useRef<boolean>(false);

    const storageKey = useMemo(() => {
        const id = projectUuid || project?.uuid;
        return id ? `dosier_pea_reviewer_ai_${id}` : null;
    }, [projectUuid, project?.uuid]);

    // Cargar historial local por PEA
    useEffect(() => {
        isHistoryLoadedRef.current = false;
        if (!storageKey) {
            setMessages([]);
            setAppliedObsKeys({});
            isHistoryLoadedRef.current = true;
            return;
        }
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                    if (Array.isArray(parsed.messages)) {
                        const cleaned = parsed.messages.map((m: any) =>
                            m?.sender === 'assistant' && !m?.analysis && typeof m?.text === 'string' && m.text.startsWith('Analizando el PEA')
                                ? { ...m, text: 'Error en el análisis: La consulta fue interrumpida al recargar la página.' }
                                : m
                        );
                        setMessages(cleaned);
                    }
                    if (parsed.appliedObsKeys && typeof parsed.appliedObsKeys === 'object') {
                        setAppliedObsKeys(parsed.appliedObsKeys);
                    }
                }
            } else {
                setMessages([]);
                setAppliedObsKeys({});
            }
        } catch {
            setMessages([]);
            setAppliedObsKeys({});
        } finally {
            isHistoryLoadedRef.current = true;
        }
    }, [storageKey]);

    // Guardar historial local
    useEffect(() => {
        if (!isHistoryLoadedRef.current || !storageKey) return;
        try {
            if (messages.length === 0) {
                localStorage.removeItem(storageKey);
            } else {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify({
                        messages: messages.slice(-20),
                        appliedObsKeys
                    })
                );
            }
        } catch {
            // Ignorar errores de cuota localStorage
        }
    }, [messages, appliedObsKeys, storageKey]);

    // Cargar configuración de proveedor IA al abrir el asistente
    useEffect(() => {
        if (!isOpen) return;
        setLoadingConfig(true);
        getPeaAiConfig()
            .then(st => {
                setAiConfigStatus(st);
                if (st.activeModel) {
                    setSelectedModel(st.activeModel);
                }
            })
            .catch(err => console.error('[DOSIER Reviewer AI] Error cargando config:', err))
            .finally(() => setLoadingConfig(false));
    }, [isOpen, configVersion]);

    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isAnalyzing, isOpen]);

    const availableModels = useMemo(() => {
        const provider = aiConfigStatus?.activeProvider || 'deepseek';
        const specs = AI_PROVIDER_MODELS[provider] || [];
        if (specs.length === 0) {
            const cur = selectedModel || aiConfigStatus?.activeModel || 'deepseek-chat';
            return [{ id: cur, label: cur, modeLabel: cur }];
        }
        return specs;
    }, [aiConfigStatus?.activeProvider, aiConfigStatus?.activeModel, selectedModel]);

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
                setAiConfigStatus(prev => (prev ? { ...prev, activeModel: newModel } : prev));
            } catch (err) {
                console.error('[DOSIER Reviewer AI] Error actualizando modelo:', err);
            }
        }
    };

    const buildSnapshotRequestPayload = useCallback(() => {
        const snap = docSnapshot || {};

        const rawUnits: any[] = Array.isArray(snap.Unidades) ? snap.Unidades : [];
        const peaDbUnits: any[] = Array.isArray((project?.peaData as any)?.unidades) ? (project.peaData as any).unidades : [];
        const currentUnidades = rawUnits
            .map((u: any, idx: number) => {
                const dbU = peaDbUnits[idx] || {};
                const cd = Number(u.horasCD ?? u.HorasCD ?? u.horasDocencia ?? u.HorasDocencia ?? u.horas_docencia ?? u.horasDocente ?? u['2'] ?? dbU.horasDocencia ?? dbU.horas_docencia ?? 0);
                const ape = Number(u.horasAPE ?? u.HorasAPE ?? u.horasPractica ?? u.horas_practica ?? u.horasPracticoExp ?? u.HorasPracticoExp ?? u.horas_practico_exp ?? u['3'] ?? dbU.horasPracticoExp ?? dbU.horas_practico_exp ?? 0);
                const ta = Number(u.horasTA ?? u.HorasTA ?? u.horasAutonomo ?? u.HorasAutonomo ?? u.horas_autonomo ?? u['4'] ?? dbU.horasAutonomo ?? dbU.horas_autonomo ?? 0);
                return {
                    num: Number(u.num ?? u.Numero ?? u.numero ?? u.NumeroUnidad ?? u.numero_unidad ?? idx + 1),
                    titulo: (stripHtmlClean(u.titulo ?? u.Titulo ?? u.nombre ?? u.NombreUnidad ?? u.nombre_unidad ?? u['0'] ?? '') || '').trim(),
                    contenidos: extractUnitContenidosClean(u),
                    horasCD: cd,
                    horasAPE: ape,
                    horasTA: ta
                };
            })
            .filter(u => u.titulo || u.contenidos);

        const rawPrereqs: any[] = Array.isArray(snap.Prerrequisitos) ? snap.Prerrequisitos : [];
        const currentPrerrequisitos = rawPrereqs
            .map((p: any) => ({
                asignatura: (stripHtmlClean(p.asignatura ?? p.Asignatura ?? p.NombreAsignatura ?? p.nombre_asignatura ?? p[0] ?? '') || '').trim(),
                observacion: (stripHtmlClean(p.observacion ?? p.Observacion ?? p.observaciones ?? p.Condicion ?? p.condicion ?? p[1] ?? '') || '').trim()
            }))
            .filter(p => p.asignatura);

        const rawPracticas: any[] = Array.isArray(snap.ActividadesPracticas) ? snap.ActividadesPracticas : [];
        const currentActividadesPracticas = rawPracticas
            .map((p: any, idx: number) => {
                const rawHoras = p.horas ?? p.Horas ?? p.duracionHoras ?? p.DuracionHoras ?? p.duracion_horas ?? p['2'] ?? 2;
                const parsedHoras = Number(String(rawHoras).replace(',', '.'));
                return {
                    unidad: Number(String(p.unidad ?? p.Unidad ?? p.numeroUnidad ?? p.NumeroUnidad ?? p.NumeroPractica ?? p.numeroPractica ?? p.numero_practica ?? idx + 1).replace(/\D/g, '')) || idx + 1,
                    nombre: (stripHtmlClean(p.nombre ?? p.Nombre ?? p.nombrePractica ?? p.NombrePractica ?? p.nombre_practica ?? p.nombre_caracterizacion ?? p.NombreCaracterizacion ?? p.tema ?? p.Tema ?? p.descripcion ?? p['1'] ?? '') || '').trim(),
                    horas: Number.isFinite(parsedHoras) && parsedHoras > 0 ? parsedHoras : 2,
                    escenario: (stripHtmlClean(p.escenario ?? p.Escenario ?? '') || '').trim(),
                    producto: (stripHtmlClean(p.producto ?? p.Producto ?? '') || '').trim(),
                    caracterizacion: (stripHtmlClean(p.caracterizacion ?? p.Caracterizacion ?? '') || '').trim()
                };
            })
            .filter(p => p.nombre);

        const rawEvals: any[] = Array.isArray(snap.Evaluaciones) ? snap.Evaluaciones : [];
        const currentEvaluaciones = rawEvals
            .map((e: any) => {
                const rawCalif = e.calificacion ?? e.Calificacion ?? e.calificacionMaxima ?? e.CalificacionMaxima ?? e.calificacion_maxima ?? e.porcentaje ?? e.Porcentaje ?? e['2'] ?? 10;
                const parsedCalif = Number(String(rawCalif).replace(',', '.'));
                return {
                    nota: (stripHtmlClean(e.nota ?? e.Nota ?? e.denominacion ?? e.Denominacion ?? e.criterio ?? e.Criterio ?? e['0'] ?? '') || '').trim(),
                    tipo: (stripHtmlClean(e.tipo ?? e.Tipo ?? e.tipoEvaluacion ?? e.TipoEvaluacion ?? e.tipo_evaluacion ?? e.descripcion ?? e.Descripcion ?? e['1'] ?? '') || '').trim(),
                    calificacion: Number.isFinite(parsedCalif) && parsedCalif > 0 ? parsedCalif : 10
                };
            })
            .filter(e => e.nota || e.tipo);

        const rawBibs: any[] = Array.isArray(snap.Bibliografias) ? snap.Bibliografias : [];
        const currentBibliografias = rawBibs
            .map((b: any) => ({
                tipoBibliografia: String(b.tipoBibliografia ?? b.TipoBibliografia ?? b.tipo_bibliografia ?? 'Basica'),
                autor: (stripHtmlClean(b.autor ?? b.Autor ?? '') || '').trim(),
                tituloLibro: (stripHtmlClean(b.tituloLibro ?? b.TituloLibro ?? b.titulo_libro ?? '') || '').trim(),
                editorialCiudad: (stripHtmlClean(b.editorialCiudad ?? b.EditorialCiudad ?? b.editorial_ciudad ?? '') || '').trim(),
                citaCompletaApa: (stripHtmlClean(b.citaCompletaApa ?? b.CitaCompletaApa ?? b.cita_completa_apa ?? '') || '').trim()
            }))
            .filter(b => b.citaCompletaApa || b.tituloLibro);

        const rdaCarreraClean = (stripHtmlClean(snap.RdaCarrera) || '').replace(/\s+/g, '');
        let rdaAsigStr: string | undefined;
        if (typeof snap.ResultadosAprendizaje === 'string') {
            rdaAsigStr = stripHtmlClean(snap.ResultadosAprendizaje);
        } else if (Array.isArray(snap.ResultadosAprendizaje)) {
            const cleanedRdas = snap.ResultadosAprendizaje
                .filter((r: any) => {
                    const tipo = String(r?.tipoRda || r?.TipoRda || r?.tipo_rda || '').toLowerCase();
                    return tipo !== 'carrera';
                })
                .map((r: any) => {
                    const raw = stripHtmlClean(typeof r === 'string' ? r : (r?.descripcion ?? r?.Descripcion ?? r?.texto ?? '')) || '';
                    return raw.replace(/^rda\s*\d+\s*:\s*/i, '').trim();
                })
                .filter((t: string) => {
                    if (!t || t === '-' || /^rda\s*[-#]?\s*\d*\s*:?$/i.test(t)) return false;
                    if (rdaCarreraClean.length > 20 && t.replace(/\s+/g, '') === rdaCarreraClean) return false;
                    return true;
                });
            rdaAsigStr = cleanedRdas.length > 0 ? cleanedRdas.join(' | ') : undefined;
        }

        const toOptionalNumber = (val: any): number | undefined => {
            if (val === undefined || val === null || val === '') return undefined;
            const n = Number(val);
            return Number.isFinite(n) ? n : undefined;
        };

        return {
            currentCreditos: toOptionalNumber(snap.Creditos ?? project.creditos),
            currentHorasCD: toOptionalNumber(snap.HorasContactoDocente ?? project.horas_docencia),
            currentHorasAPE: toOptionalNumber(snap.HorasPracticoExperimental ?? project.horas_practica),
            currentHorasTA: toOptionalNumber(snap.HorasAutonomo ?? project.horas_autonomo),
            currentTotalHoras: toOptionalNumber(snap.TotalHorasAsignatura ?? project.horas_totales),
            currentModalidad: String(snap.Modalidad ?? project.modalidad ?? '').trim() || undefined,
            currentUnidadOrganizacion: String(snap.UnidadOrganizacion ?? project.dominio ?? '').trim() || undefined,
            currentNivel: String(snap.Nivel ?? project.semestre_nivel ?? '').trim() || undefined,
            currentObjetivo: stripHtmlClean(snap.ObjetivoAsignatura ?? project.descripcion),
            currentPrerrequisitos: currentPrerrequisitos.length > 0 ? currentPrerrequisitos : undefined,
            currentRdaCarrera: stripHtmlClean(snap.RdaCarrera),
            currentResultadosAprendizaje: rdaAsigStr,
            currentUnidades: currentUnidades.length > 0 ? currentUnidades : undefined,
            currentMetodologiaEnsenanza: stripHtmlClean(snap.MetodologiaEnsenanza),
            currentRecursosDidacticos: stripHtmlClean(snap.RecursosDidacticos),
            currentActividadesPracticas: currentActividadesPracticas.length > 0 ? currentActividadesPracticas : undefined,
            currentEvaluaciones: currentEvaluaciones.length > 0 ? currentEvaluaciones : undefined,
            currentBibliografias: currentBibliografias.length > 0 ? currentBibliografias : undefined,
            currentBibliografiaBasica: stripHtmlClean(snap.BibliografiaBasica),
            currentBibliografiaConsulta: stripHtmlClean(snap.BibliografiaConsulta)
        };
    }, [docSnapshot, project]);

    const handleTriggerAnalysis = useCallback(
        async (customFocus?: PeaAiReviewFocusMode, customPromptText?: string) => {
            const targetUuid = projectUuid || project?.uuid;
            if (!targetUuid || isAnalyzing) return;

            if (!aiConfigStatus?.isReady) {
                setIsConfigModalOpen(true);
                return;
            }

            const effectiveFocus = customFocus ?? selectedFocus;
            const focusMeta = FOCUS_OPTIONS.find(f => f.value === effectiveFocus) || FOCUS_OPTIONS[0];
            const promptToSend = (customPromptText ?? inputPrompt).trim();
            const displayUserText = promptToSend || focusMeta.promptLabel;

            const userMsgId = `rev_user_${Date.now()}`;
            const assistantMsgId = `rev_ast_${Date.now() + 1}`;

            const userMsg: ReviewerChatMessage = {
                id: userMsgId,
                sender: 'user',
                text: displayUserText,
                timestamp: new Date().toISOString(),
                focusLabel: focusMeta.label
            };

            const loadingAstMsg: ReviewerChatMessage = {
                id: assistantMsgId,
                sender: 'assistant',
                text: `Analizando el PEA de ${project.title} y contrastando con la malla y perfil de ${project.carrera || 'la carrera'}...`,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, userMsg, loadingAstMsg]);
            if (!customPromptText) {
                setInputPrompt('');
            }
            setIsAnalyzing(true);

            try {
                const historyToSend = messages
                    .filter(m => m.text && !m.text.startsWith('Error en el análisis'))
                    .slice(-6)
                    .map(m => ({
                        role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
                        content: m.analysis ? `${m.analysis.analysisSummary}\n${m.analysis.hoursComparisonSummary}` : m.text
                    }));

                const snapPayload = buildSnapshotRequestPayload();
                const analysis = await analyzePeaForReview(targetUuid, {
                    focusMode: effectiveFocus,
                    customQuestion: promptToSend || undefined,
                    provider: aiConfigStatus.activeProvider,
                    model: selectedModel || aiConfigStatus.activeModel,
                    reasoningEffort: aiConfigStatus.activeReasoningEffort || undefined,
                    baseUrlOverride: aiConfigStatus.activeBaseUrl || undefined,
                    ...snapPayload,
                    conversationHistory: historyToSend
                });

                const hasPriorAnalysis = messages.some(m => m.sender === 'assistant' && Boolean(m.analysis));
                const isConversationalSummary =
                    hasPriorAnalysis &&
                    !customPromptText &&
                    Boolean(promptToSend) &&
                    /resum|explic|trata|sintetiz|cu[aá]l|qu[eé]\s+es/i.test(promptToSend) &&
                    !/revis|audit|observ|evalu|verific|erro/i.test(promptToSend);

                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMsgId
                            ? {
                                  ...m,
                                  text: analysis.analysisSummary,
                                  analysis
                              }
                            : m
                    )
                );
                setExpandedDetailsMap(prev => {
                    const collapsedPrev: Record<string, boolean> = {};
                    Object.keys(prev).forEach(k => {
                        collapsedPrev[k] = false;
                    });
                    collapsedPrev[assistantMsgId] = !isConversationalSummary;
                    return collapsedPrev;
                });
            } catch (err: any) {
                const errMsg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'No se pudo completar el análisis curricular con el proveedor de IA.';
                setMessages(prev =>
                    prev.map(m =>
                        m.id === assistantMsgId
                            ? {
                                  ...m,
                                  text: `Error en el análisis: ${errMsg}`
                              }
                            : m
                    )
                );
                addToast('Error en Asistente IA', errMsg, 'error');
            } finally {
                setIsAnalyzing(false);
            }
        },
        [
            projectUuid,
            project,
            isAnalyzing,
            aiConfigStatus,
            selectedFocus,
            inputPrompt,
            messages,
            selectedModel,
            buildSnapshotRequestPayload,
            addToast
        ]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                handleTriggerAnalysis();
                return;
            }
            if (e.shiftKey) return;

            const target = e.currentTarget;
            const textBefore = target.value.slice(0, target.selectionStart);
            if (textBefore.endsWith('\n')) {
                e.preventDefault();
                handleTriggerAnalysis();
            }
        }
    };

    const [applyingBatchMsgId, setApplyingBatchMsgId] = useState<string | null>(null);

    const handleApplyObservation = async (msgId: string, obsIdx: number, obs: PeaReviewSuggestedObservation) => {
        if (!onSaveComment) return;
        const key = `${msgId}_${obsIdx}`;
        if (appliedObsKeys[key] || applyingObsKey === key || applyingBatchMsgId === msgId) return;

        const targetSectionKey = normalizeClientSectionKey(obs.sectionKey);
        setApplyingObsKey(key);
        try {
            await onSaveComment(targetSectionKey, obs.observationText);
            setAppliedObsKeys(prev => ({ ...prev, [key]: true }));
        } catch {
            // El toast de error ya lo maneja saveCommentForSection
        } finally {
            setApplyingObsKey(null);
        }
    };

    const handleApplyAllObservations = async (msgId: string, observations: PeaReviewSuggestedObservation[]) => {
        if (!onSaveComment || applyingBatchMsgId) return;
        setApplyingBatchMsgId(msgId);
        const newlyApplied: Record<string, boolean> = {};
        try {
            for (let idx = 0; idx < observations.length; idx++) {
                const key = `${msgId}_${idx}`;
                if (appliedObsKeys[key]) continue;
                const obs = observations[idx];
                const targetSectionKey = normalizeClientSectionKey(obs.sectionKey);
                await onSaveComment(targetSectionKey, obs.observationText);
                newlyApplied[key] = true;
            }
        } catch {
            // El toast de error lo maneja saveCommentForSection
        } finally {
            if (Object.keys(newlyApplied).length > 0) {
                setAppliedObsKeys(prev => ({ ...prev, ...newlyApplied }));
            }
            setApplyingBatchMsgId(null);
        }
    };

    const handleClearHistory = () => {
        setMessages([]);
        setExpandedDetailsMap({});
        setAppliedObsKeys({});
        if (storageKey) {
            try {
                localStorage.removeItem(storageKey);
            } catch {}
        }
    };

    const formatTime = (iso: string) => {
        try {
            return new Date(iso).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    return (
        <>
            {/* ── Botón Flotante (FAB) para Revisores ── */}
            {!isOpen && (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-[140] bg-[#0070f3] hover:bg-[#005bb5] text-white px-4 py-2.5 rounded-full shadow-xl border border-blue-500/30 flex items-center text-xs font-semibold transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                    title="Abrir Asistente de revisión"
                >
                    <span>Asistente de revisión</span>
                </button>
            )}

            {/* ── Ventana Flotante Sólida del Asistente de Revisión IA ── */}
            {isOpen && (
                <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[150] w-[94vw] sm:w-[440px] md:w-[470px] h-[82vh] max-h-[740px] bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 font-sans">
                    {/* Cabecera Superior */}
                    <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
                        <div className="min-w-0">
                            <h3 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                                Asistente de revisión
                            </h3>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearHistory}
                                    title="Reiniciar conversación"
                                    className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsConfigModalOpen(true)}
                                title="Configurar proveedor y modelo IA"
                                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-[#0070f3] hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <Settings size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                title="Minimizar asistente"
                                className="p-1.5 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>
                    </div>

                    {/* Alerta si falta API Key */}
                    {!loadingConfig && !aiConfigStatus?.isReady && (
                        <div className="m-3 p-3 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-zinc-900 space-y-2 shrink-0">
                            <div className="flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300 font-medium">
                                <AlertCircle size={14} className="shrink-0" />
                                <span>Se requiere configurar una clave de API (DeepSeek, Gemini u OpenAI).</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsConfigModalOpen(true)}
                                className="w-full py-1.5 px-3 bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Key size={13} />
                                <span>Configurar API Key</span>
                            </button>
                        </div>
                    )}

                    {/* Cuerpo de Conversación */}
                    <div className="flex-1 overflow-y-auto p-3.5 space-y-4 flex flex-col bg-white dark:bg-zinc-950 custom-scrollbar">
                        {messages.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-6 px-3 text-center space-y-4 my-auto">
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

                                <div className="space-y-1 max-w-xs">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                                        Hola, {user?.nombre_completo || user?.usuario || 'Evaluador Curricular'}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                        ¿En qué puedo ayudarte hoy a revisar este Programa de Estudio de la Asignatura?
                                    </p>
                                </div>

                                {/* Acciones rápidas de auditoría para el revisor */}
                                <div className="w-full grid grid-cols-1 gap-2 pt-2 text-left">
                                    {FOCUS_OPTIONS.map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            disabled={isAnalyzing}
                                            onClick={() => {
                                                setSelectedFocus(opt.value);
                                                handleTriggerAnalysis(opt.value, opt.promptLabel);
                                            }}
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-400 bg-zinc-50 dark:bg-zinc-900 hover:bg-white dark:hover:bg-zinc-800/80 transition-all flex items-center justify-between gap-2 text-xs font-medium text-slate-800 dark:text-zinc-200 cursor-pointer disabled:opacity-50"
                                        >
                                            <span>{opt.label}</span>
                                            <ArrowUpRight size={13} className="text-[#0070f3] shrink-0" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, msgIdx) => {
                                const isUser = msg.sender === 'user';
                                const isExpanded = expandedDetailsMap[msg.id] ?? (msgIdx === messages.length - 1);

                                return (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                                    >
                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500 px-1">
                                            <span>{formatTime(msg.timestamp)}</span>
                                            {isUser && msg.focusLabel && (
                                                <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400">
                                                    · {msg.focusLabel}
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className={`text-xs leading-relaxed rounded-2xl p-3.5 ${
                                                isUser
                                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 max-w-[88%]'
                                                    : 'bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 w-full space-y-3'
                                            }`}
                                        >
                                            {!isUser && isAnalyzing && !msg.analysis && msg.id === messages[messages.length - 1]?.id ? (
                                                <div className="flex items-center gap-2.5 text-slate-600 dark:text-zinc-300 py-1">
                                                    <Loader2 size={14} className="animate-spin text-[#0070f3] shrink-0" />
                                                    <span>{msg.text}</span>
                                                </div>
                                            ) : !isUser && msg.text.startsWith('Error en el análisis:') ? (
                                                <div className="flex items-start gap-2 text-red-600 dark:text-red-400 py-0.5 font-medium">
                                                    <AlertCircle size={13} className="shrink-0 mt-0.5" />
                                                    <span className="whitespace-pre-line">{msg.text}</span>
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
                                            )}

                                            {/* Bloques estructurados de auditoría si existen */}
                                            {msg.analysis && (
                                                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800 space-y-3">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedDetailsMap(prev => ({
                                                                ...prev,
                                                                [msg.id]: !isExpanded
                                                            }))
                                                        }
                                                        className="w-full flex items-center justify-between text-[11px] font-semibold text-[#0070f3] dark:text-blue-400 cursor-pointer"
                                                    >
                                                        <span>
                                                            Verificación de Perfil, Horas y Observaciones (
                                                            {msg.analysis.checks.length} criterios)
                                                        </span>
                                                        {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                                    </button>

                                                    {isExpanded && (
                                                        <div className="space-y-3 pt-1">
                                                            {/* Lista de Checks Normativos */}
                                                            {msg.analysis.checks.length > 0 && (
                                                                <div className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 divide-y divide-slate-100 dark:divide-zinc-800/80 overflow-hidden">
                                                                    {msg.analysis.checks.map((chk, idx) => {
                                                                        const dotColor =
                                                                            chk.status === 'cumple'
                                                                                ? 'bg-emerald-500'
                                                                                : chk.status === 'alerta'
                                                                                ? 'bg-amber-500'
                                                                                : 'bg-red-500';
                                                                        const statusText =
                                                                            chk.status === 'cumple'
                                                                                ? 'Cumple'
                                                                                : chk.status === 'alerta'
                                                                                ? 'Alerta'
                                                                                : 'Observado';

                                                                        return (
                                                                            <div key={idx} className="p-2.5 space-y-1">
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <span className="font-semibold text-[11px] text-slate-900 dark:text-zinc-100">
                                                                                        {chk.criterion}
                                                                                    </span>
                                                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600 dark:text-zinc-400 shrink-0">
                                                                                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
                                                                                        {statusText}
                                                                                    </span>
                                                                                </div>
                                                                                <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                                                                                    {chk.detail}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}

                                                            {/* Observaciones Sugeridas para Insertar con 1 clic */}
                                                            {msg.analysis.suggestedObservations.length > 0 && (
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block font-semibold">
                                                                            Observaciones sugeridas por sección ({msg.analysis.suggestedObservations.length})
                                                                        </span>
                                                                        {canAudit &&
                                                                            onSaveComment &&
                                                                            msg.analysis.suggestedObservations.length > 1 &&
                                                                            msg.analysis.suggestedObservations.some((_, idx) => !appliedObsKeys[`${msg.id}_${idx}`]) && (
                                                                                <button
                                                                                    type="button"
                                                                                    disabled={applyingBatchMsgId === msg.id || Boolean(applyingObsKey)}
                                                                                    onClick={() =>
                                                                                        handleApplyAllObservations(
                                                                                            msg.id,
                                                                                            msg.analysis!.suggestedObservations
                                                                                        )
                                                                                    }
                                                                                    className="text-[11px] font-semibold text-[#0070f3] dark:text-blue-400 hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 shrink-0"
                                                                                    title="Registrar todas las observaciones pendientes en sus respectivas secciones"
                                                                                >
                                                                                    {applyingBatchMsgId === msg.id && (
                                                                                        <Loader2 size={11} className="animate-spin" />
                                                                                    )}
                                                                                    <span>Registrar todas</span>
                                                                                </button>
                                                                            )}
                                                                    </div>
                                                                    {msg.analysis.suggestedObservations.map((obs, obsIdx) => {
                                                                        const obsKey = `${msg.id}_${obsIdx}`;
                                                                        const isApplied = Boolean(appliedObsKeys[obsKey]);
                                                                        const isApplying = applyingObsKey === obsKey || applyingBatchMsgId === msg.id;
                                                                        const canonicalKey = normalizeClientSectionKey(obs.sectionKey);

                                                                        return (
                                                                            <div
                                                                                key={obsIdx}
                                                                                className="p-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 space-y-2"
                                                                            >
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => onNavigateToSection?.(canonicalKey)}
                                                                                        className="text-[11px] font-semibold text-[#0070f3] dark:text-blue-400 hover:underline text-left truncate cursor-pointer"
                                                                                        title="Ir a esta sección en el documento"
                                                                                    >
                                                                                        {obs.sectionLabel || canonicalKey}
                                                                                    </button>

                                                                                    {canAudit && onSaveComment && (
                                                                                        isApplied ? (
                                                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                                                                                <Check size={11} strokeWidth={2.5} />
                                                                                                <span>Registrada</span>
                                                                                            </span>
                                                                                        ) : (
                                                                                            <button
                                                                                                type="button"
                                                                                                disabled={isApplying}
                                                                                                onClick={() => handleApplyObservation(msg.id, obsIdx, obs)}
                                                                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white text-[10px] font-semibold transition-colors cursor-pointer shrink-0"
                                                                                                title="Registrar formalmente esta observación en la sección"
                                                                                            >
                                                                                                {isApplying ? (
                                                                                                    <Loader2 size={10} className="animate-spin" />
                                                                                                ) : (
                                                                                                    <PlusCircle size={10} />
                                                                                                )}
                                                                                                <span>Registrar observación</span>
                                                                                            </button>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                                                                                    {obs.observationText}
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Pie de Controles e Input */}
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 space-y-2 shrink-0">
                        {/* Chips de auditoría rápida cuando hay mensajes */}
                        {messages.length > 0 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                                {FOCUS_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        disabled={isAnalyzing}
                                        onClick={() => {
                                            setSelectedFocus(opt.value);
                                            handleTriggerAnalysis(opt.value, opt.promptLabel);
                                        }}
                                        className="shrink-0 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-[#0070f3] dark:hover:border-blue-400 text-[10px] font-medium text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 focus-within:border-[#0070f3] rounded-2xl p-2.5 transition-colors shadow-xs">
                            <textarea
                                value={inputPrompt}
                                onChange={e => setInputPrompt(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isAnalyzing}
                                rows={2}
                                placeholder="Pregunta sobre el PEA, horas o perfil de carrera... (Doble Enter o botón para enviar)"
                                className="w-full bg-transparent text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 resize-none focus:outline-hidden leading-relaxed"
                            />
                            
                            <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-100 dark:border-zinc-800/60">
                                {/* Selector compacto de modelo en la esquina inferior izquierda */}
                                <div className="relative inline-flex items-center gap-1 group">
                                    <select
                                        value={selectedModel || aiConfigStatus?.activeModel || ''}
                                        onChange={e => handleModelChange(e.target.value)}
                                        disabled={isAnalyzing}
                                        className="appearance-none bg-transparent pr-4 pl-0 py-0.5 text-[11px] font-medium text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-100 cursor-pointer focus:outline-hidden truncate max-w-[210px] transition-colors"
                                        title="Cambiar modelo de IA"
                                    >
                                        {availableModels.map(m => (
                                            <option
                                                key={m.id}
                                                value={m.id}
                                                className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100"
                                            >
                                                {m.modeLabel || m.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronUp size={11} className="pointer-events-none absolute right-0 text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
                                </div>

                                {/* Botón de enviar en la esquina inferior derecha */}
                                <button
                                    type="button"
                                    disabled={isAnalyzing}
                                    onClick={() => handleTriggerAnalysis()}
                                    className="p-1.5 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] disabled:opacity-50 text-white transition-colors cursor-pointer shrink-0"
                                    title="Enviar consulta al asistente"
                                >
                                    {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Configuración del Proveedor IA */}
            <PeaAiAssistantModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                peaUuid={projectUuid || project?.uuid}
                isAdmin={isAdmin}
                onConfigSaved={() => setConfigVersion(v => v + 1)}
            />
        </>
    );
};

export default PeaAiReviewerWidget;


import api from '../api/axios_config';

export type PeaAiProvider =
    | 'deepseek'
    | 'openrouter'
    | 'gemini'
    | 'anthropic'
    | 'openai'
    | 'groq'
    | 'ollama'
    | 'custom';

export type AiReasoningEffort = 'low' | 'medium' | 'high';

export interface AiModelSpec {
    id: string;
    label: string;
    mode: 'reasoning' | 'fast' | 'general' | 'balanced';
    modeLabel: string;
    description: string;
    supportsEffort?: boolean;
}

export const AI_PROVIDER_MODELS: Record<PeaAiProvider, AiModelSpec[]> = {
    deepseek: [
        {
            id: 'deepseek-reasoner',
            label: 'DeepSeek-R1 (Razonamiento Lógico Profundo / CoT)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento R1',
            description: 'Cadena de pensamiento analítico paso a paso para cuadrar horas y malla curricular.'
        },
        {
            id: 'deepseek-chat',
            label: 'DeepSeek-V3 (Generación Rápida y Fluida)',
            mode: 'fast',
            modeLabel: 'Chat V3 Rápido',
            description: 'Redacción académica ágil y coherente sin latencia prolongada.'
        }
    ],
    openai: [
        {
            id: 'o3-mini',
            label: 'o3-mini (Razonamiento STEM y Curricular)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento o3-mini',
            description: 'Razonamiento estructurado con nivel de esfuerzo configurable (Bajo, Medio, Alto).',
            supportsEffort: true
        },
        {
            id: 'o1',
            label: 'o1 (Razonamiento Profundo Integral)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento o1',
            description: 'Capacidad deductiva máxima para resolución pedagógica compleja.',
            supportsEffort: true
        },
        {
            id: 'gpt-4o',
            label: 'GPT-4o (Multimodal Omni de Alta Capacidad)',
            mode: 'general',
            modeLabel: 'Multimodal GPT-4o',
            description: 'Modelo insignia general para redacción y análisis curricular integral.'
        },
        {
            id: 'gpt-4o-mini',
            label: 'GPT-4o Mini (Rápido, Ligero y Eficiente)',
            mode: 'fast',
            modeLabel: 'Rápido GPT-4o-mini',
            description: 'Baja latencia ideal para borradores y consultas frecuentes.'
        }
    ],
    gemini: [
        {
            id: 'gemini-2.5-pro',
            label: 'Gemini 2.5 Pro (Razonamiento y Análisis Complejo)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento 2.5 Pro',
            description: 'Comprensión contextual profunda de competencias laborales y perfiles de egreso.'
        },
        {
            id: 'gemini-2.5-flash',
            label: 'Gemini 2.5 Flash (Velocidad y Precisión Ágil)',
            mode: 'fast',
            modeLabel: 'Flash 2.5 Ágil',
            description: 'Respuesta balanceada ultrarrápida para diseño curricular estructurado.'
        },
        {
            id: 'gemini-2.0-flash',
            label: 'Gemini 2.0 Flash (Estándar Rápido)',
            mode: 'fast',
            modeLabel: 'Flash 2.0',
            description: 'Generación directa y ágil para secciones curriculares.'
        }
    ],
    anthropic: [
        {
            id: 'claude-3-5-sonnet-latest',
            label: 'Claude 3.5 Sonnet (Rigor Pedagógico y Redacción)',
            mode: 'balanced',
            modeLabel: 'Análisis Sonnet',
            description: 'Alta precisión en taxonomía de Bloom, redacción de objetivos y RDA.'
        },
        {
            id: 'claude-3-5-haiku-latest',
            label: 'Claude 3.5 Haiku (Respuesta Instantánea)',
            mode: 'fast',
            modeLabel: 'Haiku Instantáneo',
            description: 'Velocidad máxima para generación concisa.'
        }
    ],
    openrouter: [
        {
            id: 'deepseek/deepseek-r1',
            label: 'DeepSeek-R1 (Razonamiento vía OpenRouter)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento R1',
            description: 'Inferencia de razonamiento profundo CoT.'
        },
        {
            id: 'deepseek/deepseek-chat',
            label: 'DeepSeek-V3 (Chat Universal)',
            mode: 'fast',
            modeLabel: 'Chat V3',
            description: 'Generación ágil y fluida.'
        },
        {
            id: 'openai/o3-mini',
            label: 'OpenAI o3-mini (Razonamiento Lógico)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento o3-mini',
            description: 'Modelo de razonamiento estructurado.'
        },
        {
            id: 'anthropic/claude-3.5-sonnet',
            label: 'Claude 3.5 Sonnet (vía OpenRouter)',
            mode: 'balanced',
            modeLabel: 'Claude Sonnet',
            description: 'Calidad superior en prosa pedagógica.'
        },
        {
            id: 'google/gemini-2.5-flash',
            label: 'Google Gemini 2.5 Flash',
            mode: 'fast',
            modeLabel: 'Gemini Flash',
            description: 'Equilibrio de velocidad y precisión.'
        }
    ],
    groq: [
        {
            id: 'deepseek-r1-distill-llama-70b',
            label: 'DeepSeek R1 Distill Llama 70B (Razonamiento LPU)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento Ultra-rápido',
            description: 'Inferencia de razonamiento a más de 300 tokens/seg en hardware Groq.'
        },
        {
            id: 'llama-3.3-70b-versatile',
            label: 'Llama 3.3 70B Versatile',
            mode: 'balanced',
            modeLabel: 'Llama 3.3 70B',
            description: 'Modelo abierto versátil de alta precisión.'
        },
        {
            id: 'llama-3.1-8b-instant',
            label: 'Llama 3.1 8B Instant',
            mode: 'fast',
            modeLabel: 'Llama 8B Instant',
            description: 'Latencia mínima.'
        }
    ],
    ollama: [
        {
            id: 'deepseek-r1',
            label: 'deepseek-r1 (Razonamiento Local)',
            mode: 'reasoning',
            modeLabel: 'Razonamiento Local',
            description: 'Razonamiento local privado sin salida de datos a la nube.'
        },
        {
            id: 'llama3',
            label: 'llama3 (Estándar Local)',
            mode: 'general',
            modeLabel: 'Llama 3 Local',
            description: 'Modelo local de propósito general.'
        },
        {
            id: 'qwen2.5',
            label: 'qwen2.5 (Estructurado y Técnico)',
            mode: 'balanced',
            modeLabel: 'Qwen 2.5',
            description: 'Excelente apego a formatos curriculares JSON.'
        }
    ],
    custom: []
};

export const resolveAiModelBadge = (
    provider?: string,
    model?: string,
    effort?: string
): { label: string; modeLabel: string; isReasoning: boolean } => {
    const p = (provider || 'deepseek').toLowerCase() as PeaAiProvider;
    const m = (model || '').toLowerCase();

    const presetList = AI_PROVIDER_MODELS[p] || [];
    const matched = presetList.find(spec => spec.id.toLowerCase() === m);

    const isReasoning = Boolean(
        matched?.mode === 'reasoning' ||
        m.includes('reasoner') ||
        m.includes('r1') ||
        m.startsWith('o1') ||
        m.startsWith('o3')
    );

    let modeText = matched?.modeLabel;
    if (!modeText) {
        if (isReasoning) modeText = 'Modo Razonamiento';
        else modeText = 'Modo Estándar';
    }

    if (matched?.supportsEffort && effort) {
        const effortMap: Record<string, string> = {
            low: 'Bajo',
            medium: 'Medio',
            high: 'Alto'
        };
        const effLabel = effortMap[effort.toLowerCase()] || effort;
        modeText = `${modeText} (${effLabel})`;
    }

    const providerNames: Record<string, string> = {
        deepseek: 'DeepSeek',
        openai: 'OpenAI',
        gemini: 'Gemini',
        anthropic: 'Claude',
        openrouter: 'OpenRouter',
        groq: 'Groq',
        ollama: 'Ollama',
        custom: 'IA'
    };

    const provName = providerNames[p] || p;
    return {
        label: `${provName} · ${modeText}`,
        modeLabel: modeText,
        isReasoning
    };
};

export interface PeaAiConfigStatus {
    hasUserApiKey: boolean;
    hasGlobalApiKey: boolean;
    activeProvider: PeaAiProvider;
    activeModel: string;
    activeBaseUrl?: string | null;
    activeReasoningEffort?: AiReasoningEffort | null;
    maskedApiKey?: string | null;
    isReady: boolean;
}

export interface SavePeaAiConfigRequest {
    provider: PeaAiProvider;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
    reasoningEffort?: AiReasoningEffort;
    scope?: 'user' | 'global';
}

export interface PeaDraftPrerrequisito {
    asignatura: string;
    observacion: string;
}

export interface PeaDraftUnidad {
    num: number;
    titulo: string;
    contenidos: string;
    horasCD: number;
    horasAPE: number;
    horasTA: number;
    horasTotal: number;
}

export interface PeaDraftActividadPractica {
    unidad: number;
    nombre: string;
    horas: number;
    escenario: string;
    producto: string;
    caracterizacion: string;
}

export interface PeaDraftEvaluacion {
    nota: string;
    tipo: string;
    calificacion: number;
}

export interface PeaDraftBibliografia {
    tipoBibliografia: 'Basica' | 'Consulta';
    autor: string;
    tituloLibro: string;
    editorialCiudad: string;
    citaCompletaApa: string;
}

export interface PeaDraftValidationSummary {
    providerUsed: string;
    modelUsed: string;
    targetSection: string;
    sigafiHorasCD: number;
    sigafiHorasAPE: number;
    sigafiHorasTA: number;
    sigafiTotalHoras: number;
    generatedHorasCD: number;
    generatedHorasAPE: number;
    generatedHorasTA: number;
    generatedTotalHoras: number;
    isHoursExactMatch: boolean;
    isBloomVerbValid?: boolean;
    bloomVerbDetected?: string;
    arePracticesCompliant?: boolean;
    isBibliographyCompliant?: boolean;
    complianceNotes?: string[];
    generatedSections: string[];
}

export interface PeaStructuredDraft {
    objetivoAsignatura: string;
    rdaCarrera: string;
    resultadosAprendizaje: string;
    metodologiaEnsenanza: string;
    recursosDidacticos: string;
    bibliografiaBasica: string;
    bibliografiaConsulta: string;
    totalHorasAsignatura?: number;
    horasContactoDocente?: number;
    horasPracticoExperimental?: number;
    horasAutonomo?: number;
    codigoCarrera?: string;
    prerrequisitos: PeaDraftPrerrequisito[];
    unidades: PeaDraftUnidad[];
    actividadesPracticas: PeaDraftActividadPractica[];
    evaluaciones: PeaDraftEvaluacion[];
    bibliografias: PeaDraftBibliografia[];
    validationSummary: PeaDraftValidationSummary;
}

export interface GeneratePeaDraftRequest {
    targetSection?: string;
    targetSections?: string[];
    customInstructions?: string;
    provider?: PeaAiProvider;
    model?: string;
    reasoningEffort?: AiReasoningEffort;
    baseUrlOverride?: string;
    apiKeyOverride?: string;
    currentHorasCD?: number;
    currentHorasAPE?: number;
    currentHorasTA?: number;
    currentTotalHoras?: number;
    currentUnidades?: Array<{
        num: number;
        titulo: string;
        contenidos: string;
        horasCD: number;
        horasAPE: number;
        horasTA: number;
    }>;
    currentObjetivo?: string;
    currentPrerrequisitos?: Array<{ asignatura: string; observacion?: string }>;
    currentRdaCarrera?: string;
    currentResultadosAprendizaje?: string;
    currentMetodologiaEnsenanza?: string;
    currentRecursosDidacticos?: string;
    currentActividadesPracticas?: Array<{ unidad?: number; nombre: string; horas?: number; escenario?: string; producto?: string }>;
    currentEvaluaciones?: Array<{ nota: string; tipo: string; calificacion: number }>;
    currentBibliografias?: Array<{ tipo_bibliografia?: string; tipoBibliografia?: string; autor?: string; titulo_libro?: string; tituloLibro?: string; editorial_ciudad?: string; editorialCiudad?: string; cita_completa_apa?: string; citaCompletaApa?: string }>;
    currentBibliografiaBasica?: string;
    currentBibliografiaConsulta?: string;
    conversationHistory?: Array<{
        role: 'user' | 'assistant';
        content: string;
    }>;
}

const normalizeConfigStatus = (raw: any): PeaAiConfigStatus => {
    const prov = String(raw?.active_provider ?? raw?.activeProvider ?? 'deepseek').toLowerCase();
    const validProviders: PeaAiProvider[] = ['deepseek', 'openrouter', 'gemini', 'anthropic', 'openai', 'groq', 'ollama', 'custom'];
    const activeProvider: PeaAiProvider = validProviders.includes(prov as PeaAiProvider)
        ? (prov as PeaAiProvider)
        : 'deepseek';

    return {
        hasUserApiKey: Boolean(raw?.has_user_api_key ?? raw?.hasUserApiKey),
        hasGlobalApiKey: Boolean(raw?.has_global_api_key ?? raw?.hasGlobalApiKey),
        activeProvider,
        activeModel: String(raw?.active_model ?? raw?.activeModel ?? 'deepseek-chat'),
        activeBaseUrl: raw?.active_base_url ?? raw?.activeBaseUrl ?? null,
        activeReasoningEffort: (raw?.active_reasoning_effort ?? raw?.activeReasoningEffort ?? null) as AiReasoningEffort | null,
        maskedApiKey: raw?.masked_api_key ?? raw?.maskedApiKey ?? null,
        isReady: Boolean(raw?.is_ready ?? raw?.isReady)
    };
};

const sanitizeHeading = (val: string, pattern: RegExp): string => {
    if (!val) return '';
    return val
        .replace(pattern, '')
        .replace(/^\s*<p\b[^>]*>\s*(?:&nbsp;|\s)*<\/p>/i, '')
        .trim();
};

export const normalizeStructuredDraft = (raw: any): PeaStructuredDraft => {
    const rawPrerreq: any[] = raw?.prerrequisitos ?? raw?.Prerrequisitos ?? [];
    const rawUnidades: any[] = raw?.unidades ?? raw?.Unidades ?? [];
    const rawPracticas: any[] = raw?.actividades_practicas ?? raw?.actividadesPracticas ?? raw?.ActividadesPracticas ?? [];
    const rawEvaluaciones: any[] = raw?.evaluaciones ?? raw?.Evaluaciones ?? [];
    const rawBiblio: any[] = raw?.bibliografias ?? raw?.Bibliografias ?? [];
    const vs = raw?.validation_summary ?? raw?.validationSummary ?? {};

    const rawObj = String(raw?.objetivo_asignatura ?? raw?.objetivoAsignatura ?? raw?.ObjetivoAsignatura ?? '');
    const rawMet = String(raw?.metodologia_ensenanza ?? raw?.metodologiaEnsenanza ?? raw?.MetodologiaEnsenanza ?? '');
    const rawRec = String(raw?.recursos_didacticos ?? raw?.recursosDidacticos ?? raw?.RecursosDidacticos ?? '');
    const rawBibB = String(raw?.bibliografia_basica ?? raw?.bibliografiaBasica ?? raw?.BibliografiaBasica ?? '');
    const rawBibC = String(raw?.bibliografia_consulta ?? raw?.bibliografiaConsulta ?? raw?.BibliografiaConsulta ?? '');

    const totalHoras = Number(raw?.total_horas_asignatura ?? raw?.totalHorasAsignatura ?? raw?.TotalHorasAsignatura ?? 0);
    const horasCD = Number(raw?.horas_contacto_docente ?? raw?.horasContactoDocente ?? raw?.HorasContactoDocente ?? 0);
    const horasAPE = Number(raw?.horas_practico_experimental ?? raw?.horasPracticoExperimental ?? raw?.HorasPracticoExperimental ?? 0);
    const horasTA = Number(raw?.horas_autonomo ?? raw?.horasAutonomo ?? raw?.HorasAutonomo ?? 0);
    const codCarrera = String(raw?.codigo_carrera ?? raw?.codigoCarrera ?? raw?.CodigoCarrera ?? '').trim();

    return {
        totalHorasAsignatura: totalHoras > 0 ? totalHoras : undefined,
        horasContactoDocente: horasCD > 0 ? horasCD : undefined,
        horasPracticoExperimental: horasAPE > 0 ? horasAPE : undefined,
        horasAutonomo: horasTA > 0 ? horasTA : undefined,
        codigoCarrera: codCarrera || undefined,
        objetivoAsignatura: sanitizeHeading(rawObj, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*(?:b\)\s*)?objetivo\s+de\s+la\s+asignatura\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i),
        rdaCarrera: String(raw?.rda_carrera ?? raw?.rdaCarrera ?? raw?.RdaCarrera ?? ''),
        resultadosAprendizaje: String(raw?.resultados_aprendizaje ?? raw?.resultadosAprendizaje ?? raw?.ResultadosAprendizaje ?? ''),
        metodologiaEnsenanza: sanitizeHeading(rawMet, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*(?:estrategias\s+metodol[oó]gicas|metodolog[ií]a\s+de\s+ense[ñn]anza)\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i),
        recursosDidacticos: sanitizeHeading(rawRec, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*recursos\s+did[aá]cticos(?:\s*[\/\-]\s*informatizaci[oó]n\s+del\s+aprendizaje)?\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i),
        bibliografiaBasica: sanitizeHeading(rawBibB, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*bibliograf[ií]a\s+b[aá]sica\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i),
        bibliografiaConsulta: sanitizeHeading(rawBibC, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*bibliograf[ií]a\s+de\s+consulta\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i),
        prerrequisitos: rawPrerreq.map((p: any) => ({
            asignatura: String(p?.asignatura ?? p?.Asignatura ?? ''),
            observacion: String(p?.observacion ?? p?.Observacion ?? '')
        })),
        unidades: rawUnidades.map((u: any, idx: number) => {
            const cd = Number(u?.horas_cd ?? u?.horasCD ?? u?.HorasCD ?? 0);
            const ape = Number(u?.horas_ape ?? u?.horasAPE ?? u?.HorasAPE ?? 0);
            const ta = Number(u?.horas_ta ?? u?.horasTA ?? u?.HorasTA ?? 0);
            return {
                num: Number(u?.num ?? u?.Num ?? idx + 1),
                titulo: String(u?.titulo ?? u?.Titulo ?? ''),
                contenidos: String(u?.contenidos ?? u?.Contenidos ?? ''),
                horasCD: cd,
                horasAPE: ape,
                horasTA: ta,
                horasTotal: cd + ape + ta
            };
        }),
        actividadesPracticas: rawPracticas.map((p: any, idx: number) => ({
            unidad: Number(p?.unidad ?? p?.Unidad ?? idx + 1),
            nombre: String(p?.nombre ?? p?.Nombre ?? ''),
            horas: Number(p?.horas ?? p?.Horas ?? 2),
            escenario: String(p?.escenario ?? p?.Escenario ?? ''),
            producto: String(p?.producto ?? p?.Producto ?? ''),
            caracterizacion: String(p?.caracterizacion ?? p?.Caracterizacion ?? '')
        })),
        evaluaciones: rawEvaluaciones.map((e: any) => ({
            nota: String(e?.nota ?? e?.Nota ?? ''),
            tipo: String(e?.tipo ?? e?.Tipo ?? ''),
            calificacion: Number(e?.calificacion ?? e?.Calificacion ?? 10)
        })),
        bibliografias: rawBiblio.map((b: any) => ({
            tipoBibliografia: (String(b?.tipo_bibliografia ?? b?.tipoBibliografia ?? b?.TipoBibliografia ?? 'Basica')
                .toLowerCase().includes('cons') ? 'Consulta' : 'Basica') as 'Basica' | 'Consulta',
            autor: String(b?.autor ?? b?.Autor ?? ''),
            tituloLibro: String(b?.titulo_libro ?? b?.tituloLibro ?? b?.TituloLibro ?? ''),
            editorialCiudad: String(b?.editorial_ciudad ?? b?.editorialCiudad ?? b?.EditorialCiudad ?? ''),
            citaCompletaApa: String(b?.cita_completa_apa ?? b?.citaCompletaApa ?? b?.CitaCompletaApa ?? '')
        })),
        validationSummary: {
            providerUsed: String(vs?.provider_used ?? vs?.providerUsed ?? 'gemini'),
            modelUsed: String(vs?.model_used ?? vs?.modelUsed ?? ''),
            targetSection: String(vs?.target_section ?? vs?.targetSection ?? 'all'),
            sigafiHorasCD: Number(vs?.sigafi_horas_cd ?? vs?.sigafiHorasCD ?? 0),
            sigafiHorasAPE: Number(vs?.sigafi_horas_ape ?? vs?.sigafiHorasAPE ?? 0),
            sigafiHorasTA: Number(vs?.sigafi_horas_ta ?? vs?.sigafiHorasTA ?? 0),
            sigafiTotalHoras: Number(vs?.sigafi_total_horas ?? vs?.sigafiTotalHoras ?? 0),
            generatedHorasCD: Number(vs?.generated_horas_cd ?? vs?.generatedHorasCD ?? 0),
            generatedHorasAPE: Number(vs?.generated_horas_ape ?? vs?.generatedHorasAPE ?? 0),
            generatedHorasTA: Number(vs?.generated_horas_ta ?? vs?.generatedHorasTA ?? 0),
            generatedTotalHoras: Number(vs?.generated_total_horas ?? vs?.generatedTotalHoras ?? 0),
            isHoursExactMatch: Boolean(vs?.is_hours_exact_match ?? vs?.isHoursExactMatch),
            isBloomVerbValid: vs?.is_bloom_verb_valid ?? vs?.isBloomVerbValid ?? true,
            bloomVerbDetected: vs?.bloom_verb_detected ?? vs?.bloomVerbDetected ?? undefined,
            arePracticesCompliant: vs?.are_practices_compliant ?? vs?.arePracticesCompliant ?? true,
            isBibliographyCompliant: vs?.is_bibliography_compliant ?? vs?.isBibliographyCompliant ?? true,
            complianceNotes: Array.isArray(vs?.compliance_notes ?? vs?.complianceNotes)
                ? (vs?.compliance_notes ?? vs?.complianceNotes)
                : [],
            generatedSections: Array.isArray(vs?.generated_sections ?? vs?.generatedSections)
                ? (vs?.generated_sections ?? vs?.generatedSections)
                : []
        }
    };
};

export const getPeaAiConfig = async (): Promise<PeaAiConfigStatus> => {
    const res = await api.get('/pea/ai/config');
    return normalizeConfigStatus(res.data);
};

export const savePeaAiConfig = async (req: SavePeaAiConfigRequest): Promise<PeaAiConfigStatus> => {
    const res = await api.post('/pea/ai/config', {
        provider: req.provider,
        model: req.model,
        base_url: req.baseUrl,
        api_key: req.apiKey,
        reasoning_effort: req.reasoningEffort,
        scope: req.scope ?? 'user'
    });
    return normalizeConfigStatus(res.data);
};

export const generatePeaAiDraft = async (
    peaUuid: string,
    req: GeneratePeaDraftRequest = {}
): Promise<PeaStructuredDraft> => {
    const res = await api.post(`/pea/uuid/${peaUuid}/ai/generar`, {
        target_section: req.targetSection ?? (req.targetSections && req.targetSections.length > 0 ? req.targetSections.join(',') : 'all'),
        target_sections: req.targetSections,
        custom_instructions: req.customInstructions,
        provider: req.provider,
        model: req.model,
        reasoning_effort: req.reasoningEffort,
        base_url_override: req.baseUrlOverride,
        api_key_override: req.apiKeyOverride,
        current_horas_cd: req.currentHorasCD,
        current_horas_ape: req.currentHorasAPE,
        current_horas_ta: req.currentHorasTA,
        current_total_horas: req.currentTotalHoras,
        current_objetivo: req.currentObjetivo,
        current_prerrequisitos: req.currentPrerrequisitos?.map(p => ({
            asignatura: p.asignatura,
            observacion: p.observacion ?? ''
        })),
        current_rda_carrera: req.currentRdaCarrera,
        current_resultados_aprendizaje: req.currentResultadosAprendizaje,
        current_metodologia_ensenanza: req.currentMetodologiaEnsenanza,
        current_recursos_didacticos: req.currentRecursosDidacticos,
        current_actividades_practicas: req.currentActividadesPracticas?.map(p => ({
            unidad: p.unidad ?? 1,
            nombre: p.nombre,
            horas: p.horas ?? 2,
            escenario: p.escenario ?? '',
            producto: p.producto ?? ''
        })),
        current_evaluaciones: req.currentEvaluaciones?.map(e => ({
            nota: e.nota,
            tipo: e.tipo,
            calificacion: e.calificacion
        })),
        current_bibliografias: req.currentBibliografias?.map(b => ({
            tipo_bibliografia: b.tipoBibliografia ?? b.tipo_bibliografia ?? 'Basica',
            autor: b.autor ?? '',
            titulo_libro: b.tituloLibro ?? b.titulo_libro ?? '',
            editorial_ciudad: b.editorialCiudad ?? b.editorial_ciudad ?? '',
            cita_completa_apa: b.citaCompletaApa ?? b.cita_completa_apa ?? ''
        })),
        current_bibliografia_basica: req.currentBibliografiaBasica,
        current_bibliografia_consulta: req.currentBibliografiaConsulta,
        conversation_history: req.conversationHistory?.map(h => ({
            role: h.role,
            content: h.content
        })),
        current_unidades: req.currentUnidades?.map(u => ({
            num: u.num,
            titulo: u.titulo,
            contenidos: u.contenidos,
            horas_cd: u.horasCD,
            horas_ape: u.horasAPE,
            horas_ta: u.horasTA
        }))
    });
    return normalizeStructuredDraft(res.data);
};

// ── Asistente de Revisión y Auditoría Curricular (Coordinadores / Vicerrectorado) ──

export type PeaAiReviewFocusMode =
    | 'overview'
    | 'career_profile'
    | 'hours_audit'
    | 'custom';

export interface PeaReviewCheckItem {
    criterion: string;
    status: 'cumple' | 'alerta' | 'observado';
    detail: string;
}

export interface PeaReviewSuggestedObservation {
    sectionKey: string;
    sectionLabel: string;
    severity: 'alta' | 'media' | 'sugerencia';
    observationText: string;
}

export interface PeaAiReviewAnalysisResponse {
    analysisSummary: string;
    careerAlignmentAnalysis: string;
    hoursComparisonSummary: string;
    checks: PeaReviewCheckItem[];
    suggestedObservations: PeaReviewSuggestedObservation[];
    providerUsed: string;
    modelUsed: string;
}

export interface AnalyzePeaReviewRequest {
    focusMode?: PeaAiReviewFocusMode;
    customQuestion?: string;
    provider?: PeaAiProvider;
    model?: string;
    reasoningEffort?: AiReasoningEffort;
    baseUrlOverride?: string;
    apiKeyOverride?: string;
    currentCreditos?: number;
    currentHorasCD?: number;
    currentHorasAPE?: number;
    currentHorasTA?: number;
    currentTotalHoras?: number;
    currentModalidad?: string;
    currentUnidadOrganizacion?: string;
    currentNivel?: string;
    currentObjetivo?: string;
    currentPrerrequisitos?: Array<{ asignatura: string; observacion?: string }>;
    currentRdaCarrera?: string;
    currentResultadosAprendizaje?: string;
    currentUnidades?: Array<{
        num: number;
        titulo: string;
        contenidos: string;
        horasCD: number;
        horasAPE: number;
        horasTA: number;
    }>;
    currentMetodologiaEnsenanza?: string;
    currentRecursosDidacticos?: string;
    currentActividadesPracticas?: Array<{
        unidad?: number;
        nombre: string;
        horas?: number;
        escenario?: string;
        producto?: string;
        caracterizacion?: string;
    }>;
    currentEvaluaciones?: Array<{ nota: string; tipo: string; calificacion: number }>;
    currentBibliografias?: Array<{
        tipoBibliografia?: string;
        autor?: string;
        tituloLibro?: string;
        editorialCiudad?: string;
        citaCompletaApa?: string;
    }>;
    currentBibliografiaBasica?: string;
    currentBibliografiaConsulta?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export const normalizeReviewAnalysisResponse = (raw: any): PeaAiReviewAnalysisResponse => {
    const rawChecks: any[] = raw?.checks ?? raw?.Checks ?? [];
    const rawObs: any[] = raw?.suggested_observations ?? raw?.suggestedObservations ?? raw?.SuggestedObservations ?? [];

    return {
        analysisSummary: String(raw?.analysis_summary ?? raw?.analysisSummary ?? raw?.AnalysisSummary ?? ''),
        careerAlignmentAnalysis: String(raw?.career_alignment_analysis ?? raw?.careerAlignmentAnalysis ?? raw?.CareerAlignmentAnalysis ?? ''),
        hoursComparisonSummary: String(raw?.hours_comparison_summary ?? raw?.hoursComparisonSummary ?? raw?.HoursComparisonSummary ?? ''),
        checks: rawChecks.map((c: any) => {
            const st = String(c?.status ?? c?.Status ?? 'cumple').toLowerCase();
            return {
                criterion: String(c?.criterion ?? c?.Criterion ?? ''),
                status: (st === 'observado' || st === 'alerta' ? st : 'cumple') as 'cumple' | 'alerta' | 'observado',
                detail: String(c?.detail ?? c?.Detail ?? '')
            };
        }).filter(c => c.criterion),
        suggestedObservations: rawObs.map((o: any) => {
            const sev = String(o?.severity ?? o?.Severity ?? 'media').toLowerCase();
            return {
                sectionKey: String(o?.section_key ?? o?.sectionKey ?? o?.SectionKey ?? 'ObjetivoAsignatura'),
                sectionLabel: String(o?.section_label ?? o?.sectionLabel ?? o?.SectionLabel ?? 'Sección del PEA'),
                severity: (sev === 'alta' || sev === 'sugerencia' ? sev : 'media') as 'alta' | 'media' | 'sugerencia',
                observationText: String(o?.observation_text ?? o?.observationText ?? o?.ObservationText ?? '')
            };
        }).filter(o => o.observationText),
        providerUsed: String(raw?.provider_used ?? raw?.providerUsed ?? raw?.ProviderUsed ?? 'deepseek'),
        modelUsed: String(raw?.model_used ?? raw?.modelUsed ?? raw?.ModelUsed ?? '')
    };
};

export const analyzePeaForReview = async (
    peaUuid: string,
    req: AnalyzePeaReviewRequest = {}
): Promise<PeaAiReviewAnalysisResponse> => {
    const res = await api.post(`/pea/uuid/${peaUuid}/ai/revisar`, {
        focus_mode: req.focusMode ?? 'overview',
        custom_question: req.customQuestion,
        provider: req.provider,
        model: req.model,
        reasoning_effort: req.reasoningEffort,
        base_url_override: req.baseUrlOverride,
        api_key_override: req.apiKeyOverride,
        current_creditos: req.currentCreditos,
        current_horas_cd: req.currentHorasCD,
        current_horas_ape: req.currentHorasAPE,
        current_horas_ta: req.currentHorasTA,
        current_total_horas: req.currentTotalHoras,
        current_modalidad: req.currentModalidad,
        current_unidad_organizacion: req.currentUnidadOrganizacion,
        current_nivel: req.currentNivel,
        current_objetivo: req.currentObjetivo,
        current_prerrequisitos: req.currentPrerrequisitos?.map(p => ({
            asignatura: p.asignatura,
            observacion: p.observacion ?? ''
        })),
        current_rda_carrera: req.currentRdaCarrera,
        current_resultados_aprendizaje: req.currentResultadosAprendizaje,
        current_unidades: req.currentUnidades?.map(u => ({
            num: u.num,
            titulo: u.titulo,
            contenidos: u.contenidos,
            horas_cd: u.horasCD,
            horas_ape: u.horasAPE,
            horas_ta: u.horasTA
        })),
        current_metodologia_ensenanza: req.currentMetodologiaEnsenanza,
        current_recursos_didacticos: req.currentRecursosDidacticos,
        current_actividades_practicas: req.currentActividadesPracticas?.map(p => ({
            unidad: p.unidad ?? 1,
            nombre: p.nombre,
            horas: p.horas ?? 2,
            escenario: p.escenario ?? '',
            producto: p.producto ?? '',
            caracterizacion: p.caracterizacion ?? ''
        })),
        current_evaluaciones: req.currentEvaluaciones?.map(e => ({
            nota: e.nota,
            tipo: e.tipo,
            calificacion: e.calificacion
        })),
        current_bibliografias: req.currentBibliografias?.map(b => ({
            tipo_bibliografia: b.tipoBibliografia ?? 'Basica',
            autor: b.autor ?? '',
            titulo_libro: b.tituloLibro ?? '',
            editorial_ciudad: b.editorialCiudad ?? '',
            cita_completa_apa: b.citaCompletaApa ?? ''
        })),
        current_bibliografia_basica: req.currentBibliografiaBasica,
        current_bibliografia_consulta: req.currentBibliografiaConsulta,
        conversation_history: req.conversationHistory?.map(h => ({
            role: h.role,
            content: h.content
        }))
    });
    return normalizeReviewAnalysisResponse(res.data);
};

// ── Extractor e Importador de Documentos (.pdf / .docx) ──
// Re-exportación para retrocompatibilidad con componentes existentes
export { extractPeaFromDocument, type ImportPeaDocumentOptions } from './peaDocumentExtractorService';
export { extractPeaFromDocument as importPeaFromDocument } from './peaDocumentExtractorService';

/**
 * Convierte un PeaStructuredDraft al mapa exacto de campos del DocumentTemplateRegistry (PEA_OFICIAL),
 * filtrando opcionalmente por las secciones seleccionadas por el docente.
 */
export const convertDraftToEditorFields = (
    draft: PeaStructuredDraft,
    selectedSectionIds?: string[]
): Record<string, any> => {
    const includeSection = (secId: string) =>
        !selectedSectionIds || selectedSectionIds.length === 0 || selectedSectionIds.includes(secId);

    const patch: Record<string, any> = {};

    if (includeSection('pea_objectives_section') && draft.objetivoAsignatura) {
        patch.ObjetivoAsignatura = draft.objetivoAsignatura;
    }

    if (includeSection('pea_prerequisites_section') && draft.prerrequisitos.length > 0) {
        const validPrereqs = draft.prerrequisitos
            .filter(p => (p.asignatura || '').trim().length > 0)
            .map((p, idx) => {
                const asig = p.asignatura.trim();
                const obs = (p.observacion || 'Haber cursado y aprobado la asignatura según malla curricular').trim();
                return {
                    id: `ai_prerreq_${Date.now()}_${idx}`,
                    Asignatura: asig,
                    Observacion: obs,
                    asignatura: asig,
                    observacion: obs,
                    nombre_asignatura: asig,
                    observaciones: obs,
                    '0': asig,
                    '1': obs
                };
            });
        if (validPrereqs.length > 0) {
            patch.Prerrequisitos = validPrereqs;
        }
    }

    if (includeSection('pea_career_outcomes_section') && draft.rdaCarrera) {
        patch.RdaCarrera = draft.rdaCarrera;
    }

    if (includeSection('pea_subject_outcomes_section') && draft.resultadosAprendizaje) {
        patch.ResultadosAprendizaje = draft.resultadosAprendizaje;
    }

    if (includeSection('pea_contents_section') && draft.unidades.length > 0) {
        let workingUnits = [...draft.unidades];
        const initialTotalHours = workingUnits.reduce((acc, u) => acc + (Number(u.horasCD) || 0) + (Number(u.horasAPE) || 0) + (Number(u.horasTA) || 0), 0);

        // Si todas las unidades extraídas vinieron con 0 horas, distribuir inteligentemente las horas globales
        if (initialTotalHours <= 0) {
            const count = workingUnits.length;
            const targetTotal = (draft.totalHorasAsignatura && draft.totalHorasAsignatura > 0)
                ? draft.totalHorasAsignatura
                : (draft.validationSummary?.sigafiTotalHoras && draft.validationSummary.sigafiTotalHoras > 0 ? draft.validationSummary.sigafiTotalHoras : 96);

            let tCd = (draft.horasContactoDocente && draft.horasContactoDocente > 0) ? draft.horasContactoDocente : Math.floor(targetTotal / 3);
            let tApe = (draft.horasPracticoExperimental && draft.horasPracticoExperimental > 0) ? draft.horasPracticoExperimental : Math.floor(targetTotal / 3);
            let tTa = (draft.horasAutonomo && draft.horasAutonomo > 0) ? draft.horasAutonomo : (targetTotal - tCd - tApe);

            const distribute = (totalBucket: number) => {
                const baseVal = Math.floor(totalBucket / count);
                const rem = totalBucket % count;
                return Array.from({ length: count }, (_, i) => baseVal + (i < rem ? 1 : 0));
            };

            const cdDist = distribute(tCd);
            const apeDist = distribute(tApe);
            const taDist = distribute(tTa);

            workingUnits = workingUnits.map((u, i) => ({
                ...u,
                horasCD: cdDist[i],
                horasAPE: apeDist[i],
                horasTA: taDist[i],
                horasTotal: cdDist[i] + apeDist[i] + taDist[i]
            }));
        }

        patch.Unidades = workingUnits.map((u, idx) => {
            const num = u.num || idx + 1;
            const cleanTitle = (u.titulo || '').replace(new RegExp(`^unidad\\s*${num}\\s*[:.\\-]?\\s*`, 'i'), '').trim();
            const fullTitle = cleanTitle ? `UNIDAD ${num}: ${cleanTitle}` : `UNIDAD ${num}:`;
            return {
                id: `ai_unit_${Date.now()}_${idx}`,
                num,
                numero: num,
                titulo: cleanTitle,
                nombre: cleanTitle,
                nombre_unidad: cleanTitle,
                titulo_completo: fullTitle,
                encabezado_unidad: fullTitle,
                contenidos: u.contenidos,
                horasCD: u.horasCD,
                horasAPE: u.horasAPE,
                horasTA: u.horasTA,
                horasTotal: u.horasCD + u.horasAPE + u.horasTA
            };
        });

        // Sincronizar también la Organización de Aprendizajes por Modalidad en la Sección 1
        // para que el desglose de horas (CD, APE, TA) coincida con las unidades generadas
        let sumCD = workingUnits.reduce((acc, u) => acc + (Number(u.horasCD) || 0), 0);
        let sumAPE = workingUnits.reduce((acc, u) => acc + (Number(u.horasAPE) || 0), 0);
        let sumTA = workingUnits.reduce((acc, u) => acc + (Number(u.horasTA) || 0), 0);
        const total = sumCD + sumAPE + sumTA;
        if (total > 0 && sumCD <= 0 && sumAPE <= 0) {
            const third = Math.floor(total / 3);
            sumCD = third;
            sumAPE = third;
            sumTA = total - sumCD - sumAPE;
        }
        if (sumCD + sumAPE + sumTA > 0) {
            patch.HorasContactoDocente = sumCD;
            patch.HorasPracticoExperimental = sumAPE;
            patch.HorasAutonomo = sumTA;
            patch.TotalHorasAsignatura = total;
            patch.total_horas_asignatura = total;
        }

        if (draft.codigoCarrera) {
            patch.CodigoCarrera = draft.codigoCarrera;
            patch.codigo_carrera = draft.codigoCarrera;
        }
    }

    if (includeSection('pea_methodology_section')) {
        if (draft.metodologiaEnsenanza) {
            patch.MetodologiaEnsenanza = sanitizeHeading(draft.metodologiaEnsenanza, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*(?:estrategias\s+metodol[oó]gicas|metodolog[ií]a\s+de\s+ense[ñn]anza)\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i);
        }
        if (draft.recursosDidacticos) {
            patch.RecursosDidacticos = sanitizeHeading(draft.recursosDidacticos, /^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*recursos\s+did[aá]cticos(?:\s*[\/\-]\s*informatizaci[oó]n\s+del\s+aprendizaje)?\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?/i);
        }
    }

    if (includeSection('pea_resources_section') && draft.actividadesPracticas.length > 0) {
        patch.ActividadesPracticas = draft.actividadesPracticas.map((p, idx) => {
            const unitNum = Number(p.unidad) || idx + 1;
            const unitLabel = `Unidad ${unitNum}`;
            const baseName = (p.nombre || '').trim();
            const details = (p.caracterizacion || [p.escenario, p.producto].filter(Boolean).join(' | ')).trim();
            const fullDescription = details && !baseName.toLowerCase().includes(details.toLowerCase())
                ? `${baseName} — ${details}`
                : baseName;

            return {
                id: `ai_prac_${Date.now()}_${idx}`,
                unidad: unitLabel,
                Unidad: unitLabel,
                nombre: fullDescription,
                Nombre: fullDescription,
                nombre_caracterizacion: fullDescription,
                NombreCaracterizacion: fullDescription,
                horas: p.horas,
                escenario: p.escenario,
                producto: p.producto,
                caracterizacion: details
            };
        });
    }

    if (includeSection('pea_evaluation_section') && draft.evaluaciones.length > 0) {
        patch.Evaluaciones = draft.evaluaciones.map((e, idx) => ({
            id: `ai_eval_${Date.now()}_${idx}`,
            nota: e.nota,
            Nota: e.nota,
            tipo: e.tipo,
            Tipo: e.tipo,
            calificacion: e.calificacion,
            Calificacion: e.calificacion
        }));
    }

    if (includeSection('pea_bibliography_section')) {
        if (draft.bibliografiaBasica) patch.BibliografiaBasica = draft.bibliografiaBasica;
        if (draft.bibliografiaConsulta) patch.BibliografiaConsulta = draft.bibliografiaConsulta;
        if (draft.bibliografias.length > 0) {
            patch.Bibliografias = draft.bibliografias.map((b, idx) => ({
                id: `ai_bib_${Date.now()}_${idx}`,
                TipoBibliografia: b.tipoBibliografia,
                Autor: b.autor,
                TituloLibro: b.tituloLibro,
                EditorialCiudad: b.editorialCiudad,
                CitaCompletaApa: b.citaCompletaApa
            }));
        }
    }

    return patch;
};


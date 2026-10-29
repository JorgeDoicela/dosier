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

export interface PeaAiConfigStatus {
    hasUserApiKey: boolean;
    hasGlobalApiKey: boolean;
    activeProvider: PeaAiProvider;
    activeModel: string;
    activeBaseUrl?: string | null;
    maskedApiKey?: string | null;
    isReady: boolean;
}

export interface SavePeaAiConfigRequest {
    provider: PeaAiProvider;
    model?: string;
    baseUrl?: string;
    apiKey?: string;
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
    prerrequisitos: PeaDraftPrerrequisito[];
    unidades: PeaDraftUnidad[];
    actividadesPracticas: PeaDraftActividadPractica[];
    evaluaciones: PeaDraftEvaluacion[];
    bibliografias: PeaDraftBibliografia[];
    validationSummary: PeaDraftValidationSummary;
}

export interface GeneratePeaDraftRequest {
    targetSection?: string;
    customInstructions?: string;
    provider?: PeaAiProvider;
    model?: string;
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
        maskedApiKey: raw?.masked_api_key ?? raw?.maskedApiKey ?? null,
        isReady: Boolean(raw?.is_ready ?? raw?.isReady)
    };
};

const normalizeStructuredDraft = (raw: any): PeaStructuredDraft => {
    const rawPrerreq: any[] = raw?.prerrequisitos ?? raw?.Prerrequisitos ?? [];
    const rawUnidades: any[] = raw?.unidades ?? raw?.Unidades ?? [];
    const rawPracticas: any[] = raw?.actividades_practicas ?? raw?.actividadesPracticas ?? raw?.ActividadesPracticas ?? [];
    const rawEvaluaciones: any[] = raw?.evaluaciones ?? raw?.Evaluaciones ?? [];
    const rawBiblio: any[] = raw?.bibliografias ?? raw?.Bibliografias ?? [];
    const vs = raw?.validation_summary ?? raw?.validationSummary ?? {};

    return {
        objetivoAsignatura: String(raw?.objetivo_asignatura ?? raw?.objetivoAsignatura ?? raw?.ObjetivoAsignatura ?? ''),
        rdaCarrera: String(raw?.rda_carrera ?? raw?.rdaCarrera ?? raw?.RdaCarrera ?? ''),
        resultadosAprendizaje: String(raw?.resultados_aprendizaje ?? raw?.resultadosAprendizaje ?? raw?.ResultadosAprendizaje ?? ''),
        metodologiaEnsenanza: String(raw?.metodologia_ensenanza ?? raw?.metodologiaEnsenanza ?? raw?.MetodologiaEnsenanza ?? ''),
        recursosDidacticos: String(raw?.recursos_didacticos ?? raw?.recursosDidacticos ?? raw?.RecursosDidacticos ?? ''),
        bibliografiaBasica: String(raw?.bibliografia_basica ?? raw?.bibliografiaBasica ?? raw?.BibliografiaBasica ?? ''),
        bibliografiaConsulta: String(raw?.bibliografia_consulta ?? raw?.bibliografiaConsulta ?? raw?.BibliografiaConsulta ?? ''),
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
        scope: req.scope ?? 'user'
    });
    return normalizeConfigStatus(res.data);
};

export const generatePeaAiDraft = async (
    peaUuid: string,
    req: GeneratePeaDraftRequest = {}
): Promise<PeaStructuredDraft> => {
    const res = await api.post(`/pea/uuid/${peaUuid}/ai/generar`, {
        target_section: req.targetSection ?? 'all',
        custom_instructions: req.customInstructions,
        provider: req.provider,
        model: req.model,
        base_url_override: req.baseUrlOverride,
        api_key_override: req.apiKeyOverride,
        current_horas_cd: req.currentHorasCD,
        current_horas_ape: req.currentHorasAPE,
        current_horas_ta: req.currentHorasTA,
        current_total_horas: req.currentTotalHoras,
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

export interface ImportPeaDocumentOptions {
    customInstructions?: string;
    provider?: PeaAiProvider;
    model?: string;
    baseUrlOverride?: string;
    apiKeyOverride?: string;
    currentHorasCD?: number;
    currentHorasAPE?: number;
    currentHorasTA?: number;
    currentTotalHoras?: number;
}

export const importPeaFromDocument = async (
    peaUuid: string,
    file: File,
    options: ImportPeaDocumentOptions = {}
): Promise<PeaStructuredDraft> => {
    const formData = new FormData();
    formData.append('file', file);

    if (options.customInstructions?.trim()) {
        formData.append('custom_instructions', options.customInstructions.trim());
    }
    if (options.provider) {
        formData.append('provider', options.provider);
    }
    if (options.model?.trim()) {
        formData.append('model', options.model.trim());
    }
    if (options.baseUrlOverride?.trim()) {
        formData.append('base_url_override', options.baseUrlOverride.trim());
    }
    if (options.apiKeyOverride?.trim()) {
        formData.append('api_key_override', options.apiKeyOverride.trim());
    }
    if (typeof options.currentHorasCD === 'number') {
        formData.append('current_horas_cd', String(options.currentHorasCD));
    }
    if (typeof options.currentHorasAPE === 'number') {
        formData.append('current_horas_ape', String(options.currentHorasAPE));
    }
    if (typeof options.currentHorasTA === 'number') {
        formData.append('current_horas_ta', String(options.currentHorasTA));
    }
    if (typeof options.currentTotalHoras === 'number') {
        formData.append('current_total_horas', String(options.currentTotalHoras));
    }

    const res = await api.post(`/pea/uuid/${peaUuid}/ai/importar-archivo`, formData, {
        headers: { 'Content-Type': undefined },
        transformRequest: [(data, headers) => {
            if (data instanceof FormData) {
                delete headers['Content-Type'];
            }
            return data;
        }]
    });
    return normalizeStructuredDraft(res.data);
};

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
        patch.Prerrequisitos = draft.prerrequisitos.map((p, idx) => ({
            id: `ai_prerreq_${Date.now()}_${idx}`,
            Asignatura: p.asignatura,
            Observacion: p.observacion,
            asignatura: p.asignatura,
            observacion: p.observacion,
            '0': p.asignatura,
            '1': p.observacion
        }));
    }

    if (includeSection('pea_career_outcomes_section') && draft.rdaCarrera) {
        patch.RdaCarrera = draft.rdaCarrera;
    }

    if (includeSection('pea_subject_outcomes_section') && draft.resultadosAprendizaje) {
        patch.ResultadosAprendizaje = draft.resultadosAprendizaje;
    }

    if (includeSection('pea_contents_section') && draft.unidades.length > 0) {
        patch.Unidades = draft.unidades.map((u, idx) => {
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
        const sumCD = draft.unidades.reduce((acc, u) => acc + (Number(u.horasCD) || 0), 0);
        const sumAPE = draft.unidades.reduce((acc, u) => acc + (Number(u.horasAPE) || 0), 0);
        const sumTA = draft.unidades.reduce((acc, u) => acc + (Number(u.horasTA) || 0), 0);
        if (sumCD + sumAPE + sumTA > 0) {
            patch.HorasContactoDocente = sumCD;
            patch.HorasPracticoExperimental = sumAPE;
            patch.HorasAutonomo = sumTA;
        }
    }

    if (includeSection('pea_methodology_section')) {
        if (draft.metodologiaEnsenanza) patch.MetodologiaEnsenanza = draft.metodologiaEnsenanza;
        if (draft.recursosDidacticos) patch.RecursosDidacticos = draft.recursosDidacticos;
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


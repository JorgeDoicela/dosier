import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import {
    getPeaAiConfig,
    savePeaAiConfig,
    generatePeaAiDraft,
    analyzePeaForReview,
    normalizeStructuredDraft,
    normalizeReviewAnalysisResponse,
    convertDraftToEditorFields
} from '../peaAiService';

vi.mock('../../api/axios_config', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('peaAiService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('getPeaAiConfig normaliza propiedades snake_case y camelCase', async () => {
        (api.get as any).mockResolvedValue({
            data: {
                has_user_api_key: true,
                has_global_api_key: false,
                active_provider: 'openai',
                active_model: 'o3-mini',
                active_base_url: 'https://api.openai.com/v1/chat/completions',
                active_reasoning_effort: 'high',
                masked_api_key: 'sk-p••••1234',
                is_ready: true
            }
        });

        const cfg = await getPeaAiConfig();
        expect(cfg.hasUserApiKey).toBe(true);
        expect(cfg.activeProvider).toBe('openai');
        expect(cfg.activeModel).toBe('o3-mini');
        expect(cfg.activeReasoningEffort).toBe('high');
        expect(cfg.isReady).toBe(true);
    });

    it('savePeaAiConfig envía reasoning_effort y scope correctamente', async () => {
        (api.post as any).mockResolvedValue({
            data: {
                active_provider: 'openai',
                active_model: 'o3-mini',
                active_reasoning_effort: 'high',
                is_ready: true
            }
        });

        await savePeaAiConfig({
            provider: 'openai',
            model: 'o3-mini',
            reasoningEffort: 'high',
            apiKey: 'sk-test-1234',
            scope: 'user'
        });

        expect(api.post).toHaveBeenCalledWith('/pea/ai/config', {
            provider: 'openai',
            model: 'o3-mini',
            base_url: undefined,
            api_key: 'sk-test-1234',
            reasoning_effort: 'high',
            scope: 'user'
        });
    });

    it('generatePeaAiDraft envía todo el snapshot del editor y reasoning_effort en snake_case', async () => {
        (api.post as any).mockResolvedValue({
            data: {
                objetivo_asignatura: '<p>Diseñar software</p>',
                validation_summary: {
                    provider_used: 'deepseek',
                    model_used: 'deepseek-reasoner',
                    target_section: 'pea_objectives_section,pea_contents_section',
                    is_hours_exact_match: true,
                    is_bloom_verb_valid: true,
                    bloom_verb_detected: 'Diseñar',
                    generated_sections: ['pea_objectives_section', 'pea_contents_section']
                }
            }
        });

        const draft = await generatePeaAiDraft('pea-uuid-123', {
            targetSection: 'pea_objectives_section,pea_contents_section',
            targetSections: ['pea_objectives_section', 'pea_contents_section'],
            customInstructions: 'Refina el objetivo y las unidades',
            provider: 'deepseek',
            model: 'deepseek-reasoner',
            reasoningEffort: 'high',
            currentObjetivo: '<p>Objetivo previo</p>',
            currentMetodologiaEnsenanza: '<p>ABP</p>',
            currentRecursosDidacticos: '<p>Laboratorios</p>',
            currentPrerrequisitos: [{ asignatura: 'Algoritmos', observacion: 'Aprobada' }],
            currentActividadesPracticas: [{ unidad: 1, nombre: 'Práctica 1', horas: 4, escenario: 'Lab', producto: 'Informe' }],
            currentEvaluaciones: [{ nota: 'Docencia', tipo: 'Formativa', calificacion: 10 }],
            currentBibliografias: [{ tipoBibliografia: 'Basica', autor: 'Gamma', tituloLibro: 'Patrones', citaCompletaApa: 'Gamma (2020).' }],
            currentUnidades: [{ num: 1, titulo: 'Intro', contenidos: '1.1 A', horasCD: 12, horasAPE: 12, horasTA: 12 }]
        });

        expect(api.post).toHaveBeenCalledTimes(1);
        const [, payload] = (api.post as any).mock.calls[0];
        expect(payload.reasoning_effort).toBe('high');
        expect(payload.current_objetivo).toBe('<p>Objetivo previo</p>');
        expect(payload.current_metodologia_ensenanza).toBe('<p>ABP</p>');
        expect(payload.current_recursos_didacticos).toBe('<p>Laboratorios</p>');
        expect(payload.current_prerrequisitos).toHaveLength(1);
        expect(payload.current_actividades_practicas).toHaveLength(1);
        expect(payload.current_evaluaciones).toHaveLength(1);
        expect(payload.current_bibliografias).toHaveLength(1);
        expect(draft.validationSummary.bloomVerbDetected).toBe('Diseñar');
        expect(draft.validationSummary.isBloomVerbValid).toBe(true);
    });

    it('convertDraftToEditorFields respeta múltiples secciones seleccionadas sin perder ninguna', () => {
        const draft = normalizeStructuredDraft({
            objetivo_asignatura: '<p>Desarrollar aplicaciones</p>',
            metodologia_ensenanza: '<p>Aprendizaje activo</p>',
            recursos_didacticos: '<p>IDE y Git</p>',
            unidades: [
                { num: 1, titulo: 'Unidad 1: Fundamentos', contenidos: '1.1 Intro', horas_cd: 24, horas_ape: 24, horas_ta: 24 }
            ],
            bibliografias: [
                { tipo_bibliografia: 'Basica', autor: 'Martin', titulo_libro: 'Clean Code', cita_completa_apa: 'Martin (2021).' }
            ]
        });

        const patch = convertDraftToEditorFields(draft, ['pea_objectives_section', 'pea_contents_section']);

        expect(patch.ObjetivoAsignatura).toBe('<p>Desarrollar aplicaciones</p>');
        expect(patch.Unidades).toHaveLength(1);
        expect(patch.Unidades[0].titulo).toBe('Fundamentos');
        expect(patch.MetodologiaEnsenanza).toBeUndefined();
        expect(patch.Bibliografias).toBeUndefined();
    });

    it('normalizeReviewAnalysisResponse mapea checks y observaciones sugeridas defensivamente', () => {
        const res = normalizeReviewAnalysisResponse({
            analysis_summary: 'Resumen técnico',
            career_alignment_analysis: 'Alineado',
            hours_comparison_summary: '144h exactas',
            checks: [
                { criterion: 'Horas RRA', status: 'cumple', detail: 'OK' },
                { criterion: 'Prácticas APE', status: 'observado', detail: 'Faltan 10h' }
            ],
            suggested_observations: [
                {
                    section_key: 'ActividadesPracticas',
                    section_label: '8. Prácticas APE',
                    severity: 'alta',
                    observation_text: 'Completar 10h de práctica experimental.'
                }
            ]
        });

        expect(res.checks).toHaveLength(2);
        expect(res.checks[1].status).toBe('observado');
        expect(res.suggestedObservations).toHaveLength(1);
        expect(res.suggestedObservations[0].sectionKey).toBe('ActividadesPracticas');
    });

    it('analyzePeaForReview envía payload completo y normaliza la respuesta', async () => {
        (api.post as any).mockResolvedValue({
            data: {
                analysis_summary: 'Todo conforme.',
                checks: [{ criterion: 'Horas', status: 'cumple', detail: '144h' }],
                suggested_observations: []
            }
        });

        const res = await analyzePeaForReview('pea-uuid-999', {
            focusMode: 'hours_audit',
            customQuestion: '¿Cuadran las horas?',
            currentCreditos: 3,
            currentTotalHoras: 144
        });

        expect(api.post).toHaveBeenCalledWith('/pea/uuid/pea-uuid-999/ai/revisar', expect.objectContaining({
            focus_mode: 'hours_audit',
            custom_question: '¿Cuadran las horas?',
            current_creditos: 3,
            current_total_horas: 144
        }));
        expect(res.analysisSummary).toBe('Todo conforme.');
    });
});


import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PeaAiChatSidebar } from '../PeaAiChatSidebar';
import { PeaAiReviewerWidget } from '../../../../../pages/Curriculum/Revision/components/PeaAiReviewerWidget';
import * as peaAiService from '../../../../../services/peaAiService';

vi.mock('../../../../../api/AuthContext', () => ({
    useAuth: () => ({
        user: { nombre_completo: 'Ing. María Pérez', usuario: 'mperez' },
        isAdmin: false
    })
}));

const mockAddToast = vi.fn();
vi.mock('../../../../../api/NotificationsContext', () => ({
    useNotifications: () => ({
        addToast: mockAddToast
    })
}));

vi.mock('../../../../../services/peaAiService', async (importOriginal) => {
    const actual = await importOriginal<typeof peaAiService>();
    return {
        ...actual,
        getPeaAiConfig: vi.fn(),
        savePeaAiConfig: vi.fn(),
        analyzePeaForReview: vi.fn()
    };
});

describe('PeaAiChatSidebar (Elaborador)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        (peaAiService.getPeaAiConfig as any).mockResolvedValue({
            hasUserApiKey: true,
            hasGlobalApiKey: false,
            activeProvider: 'deepseek',
            activeModel: 'deepseek-chat',
            isReady: true
        });
    });

    it('aplica múltiples secciones seleccionadas correctamente sin perder datos', async () => {
        const mockDraft: peaAiService.PeaStructuredDraft = {
            objetivoAsignatura: '<p>Diseñar software robusto</p>',
            rdaCarrera: '',
            resultadosAprendizaje: '',
            metodologiaEnsenanza: '<p>Metodología activa</p>',
            recursosDidacticos: '',
            bibliografiaBasica: '',
            bibliografiaConsulta: '',
            prerrequisitos: [],
            unidades: [
                { num: 1, titulo: 'Fundamentos', contenidos: '1.1 Intro', horasCD: 24, horasAPE: 24, horasTA: 24, horasTotal: 72 }
            ],
            actividadesPracticas: [],
            evaluaciones: [],
            bibliografias: [],
            validationSummary: {
                providerUsed: 'deepseek',
                modelUsed: 'deepseek-chat',
                targetSection: 'pea_objectives_section,pea_contents_section',
                sigafiHorasCD: 24,
                sigafiHorasAPE: 24,
                sigafiHorasTA: 24,
                sigafiTotalHoras: 72,
                generatedHorasCD: 24,
                generatedHorasAPE: 24,
                generatedHorasTA: 24,
                generatedTotalHoras: 72,
                isHoursExactMatch: true,
                generatedSections: ['pea_objectives_section', 'pea_contents_section']
            }
        };

        const onTriggerAiGeneration = vi.fn().mockResolvedValue(mockDraft);
        const onApplyStructuredDraft = vi.fn();

        render(
            <PeaAiChatSidebar
                resolvedPeaUuid="pea-test-1"
                formData={{}}
                onTriggerAiGeneration={onTriggerAiGeneration}
                onApplyStructuredDraft={onApplyStructuredDraft}
            />
        );

        await waitFor(() => {
            expect(peaAiService.getPeaAiConfig).toHaveBeenCalled();
        });

        const textarea = screen.getByPlaceholderText(/Pídele al asistente curricular/i);
        fireEvent.change(textarea, { target: { value: 'Formula objetivo y unidades' } });
        fireEvent.click(screen.getByTitle('Enviar instrucción'));

        await waitFor(() => {
            expect(screen.getByText(/Aplicar cambios al PEA/i)).toBeTruthy();
        });

        fireEvent.click(screen.getByText(/Aplicar cambios al PEA/i));

        expect(onApplyStructuredDraft).toHaveBeenCalledTimes(1);
        const appliedPatch = onApplyStructuredDraft.mock.calls[0][0];
        expect(appliedPatch.ObjetivoAsignatura).toBe('<p>Diseñar software robusto</p>');
        expect(appliedPatch.Unidades).toHaveLength(1);
        expect(appliedPatch.MetodologiaEnsenanza).toBeUndefined();
    });

    it('muestra error real del backend y detiene el spinner cuando falla la generación', async () => {
        const onTriggerAiGeneration = vi.fn().mockRejectedValue({
            response: { data: { message: 'El proveedor DEEPSEEK rechazó la solicitud (HTTP 401).' } },
            message: 'Request failed with status code 400'
        });

        const { container } = render(
            <PeaAiChatSidebar
                resolvedPeaUuid="pea-test-err"
                formData={{}}
                onTriggerAiGeneration={onTriggerAiGeneration}
            />
        );

        await waitFor(() => {
            expect(peaAiService.getPeaAiConfig).toHaveBeenCalled();
        });

        const textarea = screen.getByPlaceholderText(/Pídele al asistente curricular/i);
        fireEvent.change(textarea, { target: { value: 'Genera el PEA' } });
        fireEvent.click(screen.getByTitle('Enviar instrucción'));

        await waitFor(() => {
            expect(
                screen.getByText(/Error en la generación: El proveedor DEEPSEEK rechazó la solicitud \(HTTP 401\)\./i)
            ).toBeTruthy();
        });

        // No debe quedar ningún spinner girando en el mensaje de error
        expect(container.querySelector('.animate-spin')).toBeNull();
    });

    it('envía resumen de la propuesta previa en el historial multi-turno del chat', async () => {
        const draft1: peaAiService.PeaStructuredDraft = {
            objetivoAsignatura: '<p>Diseñar bases de datos relacionales.</p>',
            rdaCarrera: '',
            resultadosAprendizaje: '',
            metodologiaEnsenanza: '',
            recursosDidacticos: '',
            bibliografiaBasica: '',
            bibliografiaConsulta: '',
            prerrequisitos: [],
            unidades: [
                { num: 1, titulo: 'Modelado ER', contenidos: '1.1 Entidades', horasCD: 24, horasAPE: 24, horasTA: 24, horasTotal: 72 },
                { num: 2, titulo: 'Normalización', contenidos: '2.1 Formas normales', horasCD: 24, horasAPE: 24, horasTA: 24, horasTotal: 72 }
            ],
            actividadesPracticas: [],
            evaluaciones: [],
            bibliografias: [],
            validationSummary: {
                providerUsed: 'deepseek',
                modelUsed: 'deepseek-chat',
                targetSection: 'all',
                sigafiHorasCD: 48,
                sigafiHorasAPE: 48,
                sigafiHorasTA: 48,
                sigafiTotalHoras: 144,
                generatedHorasCD: 48,
                generatedHorasAPE: 48,
                generatedHorasTA: 48,
                generatedTotalHoras: 144,
                isHoursExactMatch: true,
                generatedSections: ['pea_objectives_section', 'pea_contents_section']
            }
        };

        const onTriggerAiGeneration = vi
            .fn()
            .mockResolvedValueOnce(draft1)
            .mockResolvedValueOnce(draft1);

        render(
            <PeaAiChatSidebar
                resolvedPeaUuid="pea-multiturn-1"
                formData={{}}
                onTriggerAiGeneration={onTriggerAiGeneration}
            />
        );

        await waitFor(() => expect(peaAiService.getPeaAiConfig).toHaveBeenCalled());

        const textarea = screen.getByPlaceholderText(/Pídele al asistente curricular/i);
        fireEvent.change(textarea, { target: { value: 'Formula el PEA completo' } });
        fireEvent.click(screen.getByTitle('Enviar instrucción'));

        await waitFor(() => expect(screen.getByText(/Aplicar cambios al PEA/i)).toBeTruthy());

        // Segundo turno: pide ajustar la unidad 2 sin haber aplicado aún al editor
        fireEvent.change(textarea, { target: { value: 'Cambia la Unidad 2 a SQL Avanzado' } });
        fireEvent.click(screen.getByTitle('Enviar instrucción'));

        await waitFor(() => expect(onTriggerAiGeneration).toHaveBeenCalledTimes(2));

        const secondCallHistory = onTriggerAiGeneration.mock.calls[1][3];
        expect(secondCallHistory).toBeDefined();
        const assistantHistoryMsg = secondCallHistory.find((h: any) => h.role === 'assistant');
        expect(assistantHistoryMsg.content).toContain('Normalización');
        expect(assistantHistoryMsg.content).toContain('Diseñar bases de datos relacionales');
    });

    it('solicita confirmación ¿Sobrescribir? antes de reemplazar datos existentes en el editor', async () => {
        const draft: peaAiService.PeaStructuredDraft = {
            objetivoAsignatura: '<p>Nuevo objetivo propuesto</p>',
            rdaCarrera: '',
            resultadosAprendizaje: '',
            metodologiaEnsenanza: '',
            recursosDidacticos: '',
            bibliografiaBasica: '',
            bibliografiaConsulta: '',
            prerrequisitos: [],
            unidades: [],
            actividadesPracticas: [],
            evaluaciones: [],
            bibliografias: [],
            validationSummary: {
                providerUsed: 'deepseek',
                modelUsed: 'deepseek-chat',
                targetSection: 'pea_objectives_section',
                sigafiHorasCD: 48,
                sigafiHorasAPE: 48,
                sigafiHorasTA: 48,
                sigafiTotalHoras: 144,
                generatedHorasCD: 0,
                generatedHorasAPE: 0,
                generatedHorasTA: 0,
                generatedTotalHoras: 0,
                isHoursExactMatch: true,
                generatedSections: ['pea_objectives_section']
            }
        };

        const onTriggerAiGeneration = vi.fn().mockResolvedValue(draft);
        const onApplyStructuredDraft = vi.fn();

        render(
            <PeaAiChatSidebar
                resolvedPeaUuid="pea-overwrite-1"
                formData={{ ObjetivoAsignatura: '<p>Objetivo ya redactado por el docente</p>' }}
                onTriggerAiGeneration={onTriggerAiGeneration}
                onApplyStructuredDraft={onApplyStructuredDraft}
            />
        );

        await waitFor(() => expect(peaAiService.getPeaAiConfig).toHaveBeenCalled());

        const textarea = screen.getByPlaceholderText(/Pídele al asistente curricular/i);
        fireEvent.change(textarea, { target: { value: 'Mejora el objetivo' } });
        fireEvent.click(screen.getByTitle('Enviar instrucción'));

        await waitFor(() => expect(screen.getByText(/Ver contenido propuesto/i)).toBeTruthy());
        fireEvent.click(screen.getByText(/Ver contenido propuesto/i));

        // Primer clic en Transferir debe pedir confirmación sin sobrescribir
        fireEvent.click(screen.getByText('Transferir'));
        expect(onApplyStructuredDraft).not.toHaveBeenCalled();
        expect(screen.getByText('¿Sobrescribir?')).toBeTruthy();

        // Segundo clic confirma y aplica
        fireEvent.click(screen.getByText('¿Sobrescribir?'));
        expect(onApplyStructuredDraft).toHaveBeenCalledTimes(1);
        expect(onApplyStructuredDraft.mock.calls[0][0].ObjetivoAsignatura).toBe('<p>Nuevo objetivo propuesto</p>');
    });

    it('sanitiza mensajes isLoading huérfanos recuperados desde localStorage sin dejar spinner infinito', async () => {
        localStorage.setItem(
            'dosier_pea_chat_pea-stale-loading',
            JSON.stringify({
                messages: [
                    {
                        id: 'u1',
                        sender: 'user',
                        text: 'Genera el PEA',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 'a1',
                        sender: 'assistant',
                        text: 'Formulando propuesta curricular...',
                        timestamp: new Date().toISOString(),
                        isLoading: true
                    }
                ],
                appliedSectionsByMsg: {}
            })
        );

        const { container } = render(
            <PeaAiChatSidebar
                resolvedPeaUuid="pea-stale-loading"
                formData={{}}
            />
        );

        await waitFor(() => {
            expect(screen.getByText(/La generación fue interrumpida al recargar la página/i)).toBeTruthy();
        });
        expect(container.querySelector('.animate-spin')).toBeNull();
    });
});

describe('PeaAiReviewerWidget (Revisor)', () => {
    const baseProject: any = {
        uuid: 'rev-pea-uuid-1',
        title: 'Programación Orientada a Objetos',
        carrera: 'Desarrollo de Software',
        creditos: 3,
        horas_totales: 144,
        horas_docencia: 48,
        horas_practica: 48,
        horas_autonomo: 48
    };

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
        (peaAiService.getPeaAiConfig as any).mockResolvedValue({
            hasUserApiKey: true,
            hasGlobalApiKey: false,
            activeProvider: 'deepseek',
            activeModel: 'deepseek-chat',
            isReady: true
        });
    });

    it('permite análisis inicial y consulta de seguimiento sin ReferenceError y permite registrar observación', async () => {
        (peaAiService.analyzePeaForReview as any)
            .mockResolvedValueOnce({
                analysisSummary: 'Auditoría inicial: se detecta desfase en APE.',
                careerAlignmentAnalysis: 'Alineado con perfil.',
                hoursComparisonSummary: '144h declaradas.',
                checks: [
                    { criterion: 'Cobertura de prácticas APE', status: 'observado', detail: 'Faltan 12h APE.' }
                ],
                suggestedObservations: [
                    {
                        sectionKey: 'ActividadesPracticas',
                        sectionLabel: '8. Actividades Prácticas y Experimentales (APE)',
                        severity: 'alta',
                        observationText: 'Completar 12 horas adicionales de prácticas APE.'
                    }
                ],
                providerUsed: 'deepseek',
                modelUsed: 'deepseek-chat'
            })
            .mockResolvedValueOnce({
                analysisSummary: 'En resumen, debes observar la sección 8 por falta de horas APE.',
                careerAlignmentAnalysis: 'Alineado.',
                hoursComparisonSummary: '144h.',
                checks: [],
                suggestedObservations: [],
                providerUsed: 'deepseek',
                modelUsed: 'deepseek-chat'
            });

        const onSaveComment = vi.fn().mockResolvedValue(undefined);

        render(
            <PeaAiReviewerWidget
                projectUuid="rev-pea-uuid-1"
                project={baseProject}
                docSnapshot={{}}
                canAudit={true}
                onSaveComment={onSaveComment}
            />
        );

        // Abrir el widget
        fireEvent.click(screen.getByTitle('Abrir Asistente de revisión'));

        await waitFor(() => {
            expect(peaAiService.getPeaAiConfig).toHaveBeenCalled();
        });

        // 1. Análisis inicial con botón rápido
        fireEvent.click(screen.getByText('Explicación integral del PEA'));

        await waitFor(() => {
            expect(screen.getByText(/Auditoría inicial: se detecta desfase en APE/i)).toBeTruthy();
        });

        // 2. Consulta de seguimiento conversacional (regresión de ReferenceError customPromptOverride)
        const textarea = screen.getByPlaceholderText(/Pregunta sobre el PEA, horas o perfil de carrera/i);
        fireEvent.change(textarea, { target: { value: 'Resúmeme qué debo observar' } });
        fireEvent.click(screen.getByTitle('Enviar consulta al asistente'));

        await waitFor(() => {
            expect(screen.getByText(/En resumen, debes observar la sección 8 por falta de horas APE/i)).toBeTruthy();
        });
        expect(mockAddToast).not.toHaveBeenCalledWith('Error en Asistente IA', expect.anything(), 'error');

        // 3. Registrar observación sugerida del primer mensaje
        fireEvent.click(screen.getByText(/Verificación de Perfil, Horas y Observaciones \(1 criterios\)/i));
        await waitFor(() => {
            expect(screen.getByText('Registrar observación')).toBeTruthy();
        });
        fireEvent.click(screen.getByText('Registrar observación'));

        await waitFor(() => {
            expect(onSaveComment).toHaveBeenCalledWith(
                'ActividadesPracticas',
                'Completar 12 horas adicionales de prácticas APE.'
            );
        });
    });

    it('envía ceros explícitos de horas en el snapshot del revisor para detectar desfases reales', async () => {
        (peaAiService.analyzePeaForReview as any).mockResolvedValue({
            analysisSummary: 'Se detectaron 0h CD y 0h APE.',
            careerAlignmentAnalysis: '',
            hoursComparisonSummary: '0h CD, 0h APE, 144h TA',
            checks: [],
            suggestedObservations: [],
            providerUsed: 'deepseek',
            modelUsed: 'deepseek-chat'
        });

        render(
            <PeaAiReviewerWidget
                projectUuid="rev-zero-hours"
                project={{
                    ...baseProject,
                    uuid: 'rev-zero-hours',
                    horas_docencia: 0,
                    horas_practica: 0,
                    horas_autonomo: 144
                }}
                docSnapshot={{
                    HorasContactoDocente: 0,
                    HorasPracticoExperimental: 0,
                    HorasAutonomo: 144,
                    TotalHorasAsignatura: 144,
                    Creditos: 3
                }}
                canAudit={true}
            />
        );

        fireEvent.click(screen.getByTitle('Abrir Asistente de revisión'));
        await waitFor(() => expect(peaAiService.getPeaAiConfig).toHaveBeenCalled());

        fireEvent.click(screen.getByText('Auditar horas, créditos y APE'));

        await waitFor(() => expect(peaAiService.analyzePeaForReview).toHaveBeenCalledTimes(1));
        const sentPayload = (peaAiService.analyzePeaForReview as any).mock.calls[0][1];
        expect(sentPayload.currentHorasCD).toBe(0);
        expect(sentPayload.currentHorasAPE).toBe(0);
        expect(sentPayload.currentHorasTA).toBe(144);
    });

    it('preserva observaciones ya guardadas en Registrar todas cuando falla parcialmente la segunda', async () => {
        (peaAiService.analyzePeaForReview as any).mockResolvedValue({
            analysisSummary: 'Se encontraron 2 observaciones.',
            careerAlignmentAnalysis: '',
            hoursComparisonSummary: '',
            checks: [
                { criterion: 'Unidades', status: 'observado', detail: 'Desfase' }
            ],
            suggestedObservations: [
                {
                    sectionKey: 'Unidades',
                    sectionLabel: '6. Unidades',
                    severity: 'alta',
                    observationText: 'Ajustar horas de unidades.'
                },
                {
                    sectionKey: 'ActividadesPracticas',
                    sectionLabel: '8. Prácticas APE',
                    severity: 'alta',
                    observationText: 'Completar horas APE.'
                }
            ],
            providerUsed: 'deepseek',
            modelUsed: 'deepseek-chat'
        });

        const onSaveComment = vi
            .fn()
            .mockResolvedValueOnce(undefined) // 1ra guarda bien
            .mockRejectedValueOnce(new Error('Timeout BD')) // 2da falla
            .mockResolvedValueOnce(undefined); // Reintento solo de la 2da guarda bien

        render(
            <PeaAiReviewerWidget
                projectUuid="rev-partial-batch"
                project={{ ...baseProject, uuid: 'rev-partial-batch' }}
                docSnapshot={{}}
                canAudit={true}
                onSaveComment={onSaveComment}
            />
        );

        fireEvent.click(screen.getByTitle('Abrir Asistente de revisión'));
        await waitFor(() => expect(peaAiService.getPeaAiConfig).toHaveBeenCalled());

        fireEvent.click(screen.getByText('Explicación integral del PEA'));

        await waitFor(() => expect(screen.getByText('Registrar todas')).toBeTruthy());
        fireEvent.click(screen.getByText('Registrar todas'));

        await waitFor(() => expect(onSaveComment).toHaveBeenCalledTimes(2));

        // La 1ra quedó marcada como Registrada, la 2da aún tiene botón Registrar todas / Registrar observación
        expect(screen.getByText('Registrada')).toBeTruthy();

        // Al volver a pulsar Registrar todas, solo debe intentar guardar la 2da (no duplicar la 1ra)
        fireEvent.click(screen.getByText('Registrar todas'));
        await waitFor(() => expect(onSaveComment).toHaveBeenCalledTimes(3));
        expect(onSaveComment.mock.calls[2]).toEqual(['ActividadesPracticas', 'Completar horas APE.']);
    });
});

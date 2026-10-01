import { useState, useEffect, useCallback, useRef } from 'react';
import { FIELD_LABELS } from '../types/revisionTecnicaTypes';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import { documentTemplateService } from '../../../../services/documentTemplateService';
import { curriculumProjectService } from '../../../../services/curriculumProjectService';
import { collaborationService } from '../../../../services/collaborationService';

interface UseRevisionTecnicaDataParams {
    projectUuid: string | undefined;
    navigate: (path: string) => void;
    addToast: (title: string, message: string, type?: 'success' | 'error' | 'warning' | 'info' | 'default', url?: string, onUndo?: () => void | Promise<void>) => void;
    confirm: (options: { title: string; message: string; confirmText?: string; cancelText?: string; variant?: 'primary' | 'destructive' | 'warning' }) => Promise<boolean>;
    comments: Record<string, SectionComment[]>;
    setComments: React.Dispatch<React.SetStateAction<Record<string, SectionComment[]>>>;
    activeCommentField: string;
    setContextualInput: (val: string) => void;
}

export const useRevisionTecnicaData = ({
    projectUuid,
    navigate,
    addToast,
    confirm,
    comments,
    setComments,
}: UseRevisionTecnicaDataParams) => {
    const addToastRef = useRef(addToast);
    const confirmRef = useRef(confirm);

    useEffect(() => {
        addToastRef.current = addToast;
        confirmRef.current = confirm;
    }, [addToast, confirm]);

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [investigadores, setInvestigadores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [docSnapshot, setDocSnapshot] = useState<any>({});
    const [templateBlocks, setTemplateBlocks] = useState<any[]>([]);
    const [templateSections, setTemplateSections] = useState<any[]>([]);

    const loadTemplateBlocks = useCallback(async (uuid: string) => {
        try {
            let loadedBlocks: any[] = [];

            // 1. Anclaje de versión: obtener el snapshot inmutable guardado en la instancia del documento
            try {
                const instanceRes = await documentInstanceService.resolve({
                    templateCode: 'PEA_OFICIAL',
                    entityUuid: uuid
                });

                const instanceUuid = instanceRes?.uuid || (instanceRes as any)?.Uuid;
                if (instanceUuid) {
                    try {
                        const uiConfigRes = await documentInstanceService.getUiConfig(instanceUuid);
                        if (uiConfigRes?.sections && Array.isArray(uiConfigRes.sections)) {
                            setTemplateSections(uiConfigRes.sections);
                        }
                    } catch {}
                }

                const snapshotJson = (instanceRes as any)?.templateConfigSnapshotJson || instanceRes?.template_config_snapshot_json;
                if (snapshotJson) {
                    const parsed = JSON.parse(snapshotJson);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        loadedBlocks = parsed;
                    }
                }
            } catch (err) {
                console.warn('[DOSIER] No se pudo obtener snapshot congelado de la instancia, usando fallback.', err);
            }

            // 2. Fallback: Si es un borrador nuevo sin snapshot congelado, usar la versión activa publicada
            if (loadedBlocks.length === 0) {
                try {
                    const uiConfigRes = await documentInstanceService.getTemplateUiConfig('PEA_OFICIAL');
                    if (uiConfigRes?.sections && Array.isArray(uiConfigRes.sections)) {
                        setTemplateSections(uiConfigRes.sections);
                    }
                } catch {}

                const tmplRes = await documentTemplateService.getTemplateByCode('PEA_OFICIAL');
                if (tmplRes?.htmlContent) {
                    const match = tmplRes.data.htmlContent.match(/<!-- DOSIER_SECTIONS_JSON: (.*?) -->/);
                    if (match && match[1]) {
                        try {
                            const decoded = decodeURIComponent(escape(atob(match[1])));
                            loadedBlocks = JSON.parse(decoded);
                        } catch {}
                    }
                }
                if (loadedBlocks.length === 0 && tmplRes.data?.collaborativeFieldsJson) {
                    try {
                        const parsed = JSON.parse(tmplRes.data.collaborativeFieldsJson);
                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
                            loadedBlocks = parsed;
                        }
                    } catch {}
                }
            }

            setTemplateBlocks(loadedBlocks);
        } catch (e) {
            console.error('[DOSIER] Error al cargar bloques de plantilla:', e);
        }
    }, []);

    const teachersWithExceedingHours = investigadores.filter(inv => {
        const proposed = inv.horasSemanales || 0;
        const available = inv.horasDisponibles || inv.horas_disponibles || 0;
        const assigned = inv.horasAsignadas || inv.horas_asignadas || 0;
        return (assigned + proposed) > available;
    });
    const isHoursOk = teachersWithExceedingHours.length === 0;

    const loadPdf = useCallback(async (uuid: string) => {
        setLoadingPdf(true);
        try {
            const instanceRes = await documentInstanceService.resolve({
                templateCode: 'PEA_OFICIAL',
                entityUuid: uuid
            });
            const finalPath = (instanceRes as any)?.finalPdfPath || instanceRes?.final_pdf_path;

            if (finalPath) {
                const cleanPath = finalPath.replace(/\\/g, '/');
                try {
                    const fileBlob = await documentInstanceService.getStorageFile(cleanPath);
                    const blobUrl = URL.createObjectURL(fileBlob);
                    setPdfUrl(blobUrl);
                } catch (storageErr) {
                    console.error('[DOSIER] El documento final/firmado registrado no se encuentra en el almacenamiento del servidor:', storageErr);
                    setPdfUrl(null);
                }
                return;
            }

            // Solo si no existe finalPath (instancia en borrador), se genera la previsualización de borrador
            const projectDetail = await curriculumProjectService.getProjectDetail(uuid);
            const pdfBlob = await curriculumProjectService.generatePdf(projectDetail, true);
            const blobUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(blobUrl);
        } catch (err) {
            console.error('[DOSIER] Error al cargar PDF:', err);
            setPdfUrl(null);
        } finally {
            setLoadingPdf(false);
        }
    }, []);

    const calculateMetrics = useCallback(async (uuid: string, projectData?: any) => {
        try {
            const instanceRes = await documentInstanceService.resolve({
                templateCode: 'PEA_OFICIAL',
                entityUuid: uuid
            });
            const dataJson = (instanceRes as any)?.dataSnapshotJson || instanceRes?.data_snapshot_json || '{}';
            let metadata = typeof dataJson === 'string' ? JSON.parse(dataJson) : (dataJson || {});

            const pea = projectData?.peaData || projectData || {};

            metadata = {
                // 1. Datos Generales
                NombreAsignatura: metadata.NombreAsignatura || pea.nombre_asignatura || pea.nombreAsignatura || projectData?.titulo || '',
                CodigoAsignatura: metadata.CodigoAsignatura || pea.codigo_asignatura || pea.codigoAsignatura || projectData?.codigo_institucional || '',
                Carrera: metadata.Carrera || pea.nombre_carrera || pea.nombreCarrera || projectData?.carrera || '',
                CodigoCarrera: metadata.CodigoCarrera || pea.codigo_carrera || pea.codigoCarrera || '',
                Modalidad: metadata.Modalidad || pea.modalidad || 'Presencial',
                UnidadOrganizacion: metadata.UnidadOrganizacion || pea.unidad_organizacion || pea.unidadOrganizacion || 'Unidad Profesional',
                Periodo: metadata.Periodo || pea.nombre_periodo || pea.nombrePeriodo || pea.periodo || '',
                Nivel: metadata.Nivel || pea.semestre_nivel || pea.semestreNivel || '',
                TotalHorasAsignatura: metadata.TotalHorasAsignatura || pea.total_horas_asignatura || pea.totalHorasAsignatura || 0,
                Creditos: metadata.Creditos || pea.creditos || 0,
                HorasContactoDocente: metadata.HorasContactoDocente || pea.horas_contacto_docente || pea.horasContactoDocente || 0,
                HorasPracticoExperimental: metadata.HorasPracticoExperimental || pea.horas_practico_experimental || pea.horasPracticoExperimental || 0,
                HorasAutonomo: metadata.HorasAutonomo || pea.horas_autonomo || pea.horasAutonomo || 0,
                DocenteElaborador: metadata.DocenteElaborador || pea.nombre_docente_elaborador || pea.nombreDocenteElaborador || projectData?.director_nombre || '',

                // 2. Objetivos
                ObjetivoAsignatura: metadata.ObjetivoAsignatura || pea.objetivo_asignatura || pea.objetivoAsignatura || projectData?.descripcion || '',

                // 3. Prerrequisitos
                Prerrequisitos: metadata.Prerrequisitos || pea.prerrequisitos || [],

                // 4. RDA
                RdaCarrera: metadata.RdaCarrera || pea.rda_carrera || '',
                ResultadosAprendizaje: metadata.ResultadosAprendizaje || pea.resultados_aprendizaje || pea.resultadosAprendizaje || [],

                // 5. Contenidos
                Unidades: metadata.Unidades || pea.unidades || [],

                // 6. Metodología
                MetodologiaEnsenanza: metadata.MetodologiaEnsenanza || pea.metodologia_ensenanza || pea.metodologiaEnsenanza || '',
                RecursosDidacticos: metadata.RecursosDidacticos || pea.recursos_didacticos || pea.recursosDidacticos || '',

                // 7. Prácticas
                ActividadesPracticas: metadata.ActividadesPracticas || pea.actividades_practicas || pea.actividadesPracticas || [],

                // 8. Evaluación
                EvaluacionAprendizaje: metadata.EvaluacionAprendizaje || pea.evaluacion_aprendizaje || pea.evaluacionAprendizaje || '',
                Evaluaciones: metadata.Evaluaciones || pea.evaluaciones || [],

                // 9. Bibliografía
                BibliografiaBasica: metadata.BibliografiaBasica || '',
                BibliografiaConsulta: metadata.BibliografiaConsulta || '',
                Bibliografias: metadata.Bibliografias || pea.bibliografias || [],

                // 10. Firmas
                FirmasResponsabilidad: metadata.FirmasResponsabilidad || {
                    DocenteNombre: metadata.DocenteElaborador || pea.nombre_docente_elaborador || projectData?.director_nombre || '',
                    DocenteCargo: 'Docente Titular',
                    CoordinadorNombre: '',
                    CoordinadorCargo: 'Coordinador de Carrera',
                    CoordinadorAcadNombre: '',
                    CoordinadorAcadCargo: 'Coordinador Académico',
                    VicerrectorNombre: '',
                    VicerrectorCargo: 'Vicerrectorado'
                },
                ...metadata
            };

            setDocSnapshot(metadata);
        } catch (e) {
            console.error('[DOSIER] Error al cargar snapshot colaborativo:', e);
        }
    }, []);

    const loadProjectData = useCallback(async () => {
        if (!projectUuid) return;
        setLoading(true);
        try {
            const resData = await curriculumProjectService.getProjectDetail(projectUuid);
            const pea = resData.peaData || resData;

            const projectDetail: ProjectDetail = {
                uuid: resData.uuid,
                title: resData.titulo?.trim() || pea.nombre_asignatura || '(Sin título)',
                status: resData.estado || pea.estado || 'Borrador',
                presupuesto: 0,
                convocatoriaMontoMaximo: null,
                convocatoria: pea.nombre_periodo || '',
                linea: pea.nombre_carrera || resData.carrera || '',
                carrera: pea.nombre_carrera || resData.carrera || '',
                dominio: pea.unidad_organizacion || '',
                descripcion: pea.objetivo_asignatura || resData.descripcion || '',
                directorProyecto: pea.nombre_docente_elaborador || resData.director_nombre || 'Docente Titular',
                codigo_asignatura: pea.codigo_asignatura || '',
                modalidad: pea.modalidad || 'Presencial',
                semestre_nivel: pea.semestre_nivel || '',
                horas_totales: pea.total_horas_asignatura || 0,
                creditos: pea.creditos || 0,
                horas_docencia: pea.horas_contacto_docente || 0,
                horas_practica: pea.horas_practico_experimental || 0,
                horas_autonomo: pea.horas_autonomo || 0,
                docente_elaborador: pea.nombre_docente_elaborador || resData.director_nombre || '',
                periodo: pea.nombre_periodo || '',
                peaData: pea
            };

            setProject(projectDetail);
            setInvestigadores([]);

            const savedComments = localStorage.getItem(`comments_${projectUuid}`);
            if (savedComments) {
                setComments(JSON.parse(savedComments));
            }

            loadPdf(projectUuid);
            await calculateMetrics(projectUuid, resData);
            await loadTemplateBlocks(projectUuid);

            try {
                const collabRes: any = await collaborationService.getPulse(projectUuid);
                const commentsList = collabRes?.comments || collabRes?.data?.comments || [];
                if (Array.isArray(commentsList) && commentsList.length > 0) {
                    const backendComments: Record<string, SectionComment[]> = {};
                    commentsList.forEach((c: any) => {
                        const content = c.contenido || '';
                        const keyMatch = content.match(/^\[KEY:(.*?)\]\s*\[(.*?)\]\s*\((.*?)\):\s*(.*)$/);
                        if (keyMatch) {
                            const fieldKey = keyMatch[1];
                            const statusStr = keyMatch[3];
                            const text = keyMatch[4];
                            if (!backendComments[fieldKey]) {
                                backendComments[fieldKey] = [];
                            }
                            backendComments[fieldKey].push({
                                id: c.idComentario || c.id,
                                status: statusStr === 'Aprobado' ? 'Aprobado' : 'Corregir',
                                text: text,
                                creadoEn: c.creadoEn,
                                nombreUsuario: c.nombreUsuario
                            });
                        } else {
                            const match = content.match(/^\[(.*?)\]\s*\((.*?)\):\s*(.*)$/);
                            if (match) {
                                const label = match[1];
                                const statusStr = match[2];
                                const text = match[3];
                                const fieldKey = Object.keys(FIELD_LABELS).find(k => FIELD_LABELS[k] === label) || label;
                                if (!backendComments[fieldKey]) {
                                    backendComments[fieldKey] = [];
                                }
                                backendComments[fieldKey].push({
                                    id: c.idComentario || c.id,
                                    status: statusStr === 'Aprobado' ? 'Aprobado' : 'Corregir',
                                    text: text,
                                    creadoEn: c.creadoEn,
                                    nombreUsuario: c.nombreUsuario
                                });
                            }
                        }
                    });

                    Object.keys(backendComments).forEach(key => {
                        backendComments[key].sort((a, b) => a.id - b.id);
                    });

                    if (Object.keys(backendComments).length > 0) {
                        setComments(prev => {
                            const merged = { ...prev, ...backendComments };
                            localStorage.setItem(`comments_${projectUuid}`, JSON.stringify(merged));
                            return merged;
                        });
                    }
                }
            } catch (err) {
                console.error('[DOSIER] Error al sincronizar comentarios de colaboración del backend:', err);
            }

        } catch (err) {
            console.error('[DOSIER] Error al cargar detalles de revisión:', err);
            addToastRef.current("Error", "No se pudo cargar la información del proyecto.", "error");
        } finally {
            setLoading(false);
        }
    }, [projectUuid, loadPdf, calculateMetrics, setComments]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]);

    const handleAprobar = async (generalFeedback: string): Promise<boolean> => {
        if (!project) return false;

        const isBudgetOk = project.convocatoriaMontoMaximo ? project.presupuesto <= project.convocatoriaMontoMaximo : true;
        const hasTeam = investigadores.length > 0;

        if (!isBudgetOk || !hasTeam || !isHoursOk) {
            let msg = "La propuesta no cumple con todos los controles de consistencia automática.";
            if (!isHoursOk) {
                msg += ` Se detectó exceso de carga horaria en los siguientes docentes: ${teachersWithExceedingHours.map(t => t.nombres_completos || t.nombre).join(', ')}.`;
            }
            if (!await confirm({
                title: "Advertencia de Cumplimiento CACES",
                message: `${msg} ¿Desea aprobarla de todos modos?`,
                confirmText: "Aprobar de todos modos",
                cancelText: "Cancelar",
                variant: "warning"
            })) return false;
        } else {
            if (!await confirm({
                title: "Aprobar Revisión Técnica",
                message: "¿Aprobar la consistencia del protocolo y validar su revisión técnica institucional?",
                confirmText: "Aprobar Revisión",
                cancelText: "Cancelar",
                variant: "primary"
            })) return false;
        }

        setSubmitting(true);
        try {
            const sectionIssues = Object.entries(comments)
                .filter(([_, list]) => list && list.length > 0)
                .map(([sec, list]) => {
                    const label = FIELD_LABELS[sec] || sec.toUpperCase();
                    return `[${label}]: ${list.map(c => c.text).join('; ')}`;
                })
                .join(' | ');

            const obs = generalFeedback.trim()
                || (sectionIssues ? `Revisión Técnica aprobada con observaciones menores: ${sectionIssues}` : 'Aprobación Técnica Inicial del Administrador. Protocolo completo y consistente.');

            const originalState = project.status;

            await curriculumProjectService.transitionState(project.uuid, 'En Revisión', obs);

            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));

            addToast(
                "Revisión Aprobada",
                "El protocolo ha completado exitosamente la revisión técnica institucional.",
                "success",
                undefined,
                async () => {
                    try {
                        await curriculumProjectService.transitionState(
                            project.uuid,
                            originalState,
                            "Reversión (Undo): Retorno al estado anterior por cancelación de la aprobación."
                        );
                        addToast("Acción Revertida", `La aprobación ha sido cancelada. Proyecto en estado: ${originalState}`, "info");
                        window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
                        navigate(`/documentacion/revision-tecnica/${projectUuid}`);
                    } catch (err) {
                        console.error("[Undo Approval] Failed:", err);
                        addToast("Error al Revertir", "No se pudo deshacer la aprobación del protocolo.", "error");
                    }
                }
            );
            navigate(`/documentacion/monitoreo/${projectUuid}`);
            return true;
        } catch (err: any) {
            console.error(err);
            addToast("Error", err.response?.data?.error ?? "No se pudo realizar la transición del estado.", "error");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    const handleDevolver = async (generalFeedback: string, fechaLimite?: string): Promise<boolean> => {
        if (!project) return false;

        const hasContextualComments = Object.values(comments).some(list => list && list.length > 0);
        if (!generalFeedback.trim() && !hasContextualComments) {
            addToast("Justificación Requerida", "Por favor redacte observaciones generales o específicas con las correcciones para el docente.", "warning");
            return false;
        }

        if (!await confirm({
            title: "Devolver al Docente",
            message: `¿Retornar el proyecto a fase de formulación (En Corrección) con las observaciones descritas${fechaLimite ? ` y plazo límite al ${fechaLimite}` : ''}?`,
            confirmText: "Devolver con Plazo",
            cancelText: "Cancelar",
            variant: "destructive"
        })) return false;

        setSubmitting(true);
        try {
            const sectionIssues = Object.entries(comments)
                .filter(([_, list]) => list && list.length > 0)
                .map(([sec, list]) => {
                    const label = FIELD_LABELS[sec] || sec.toUpperCase();
                    return `* ${label}:\n  ` + list.map(c => `- ${c.text}`).join('\n  ');
                })
                .join('\n');

            const fullObs = generalFeedback.trim()
                ? `${generalFeedback.trim()}\n\nObservaciones por Sección:\n${sectionIssues}`
                : `Correcciones solicitadas en las siguientes secciones:\n${sectionIssues}`;

            const originalState = project.status;

            await curriculumProjectService.transitionState(project.uuid, 'En Corrección', fullObs, fechaLimite || undefined);

            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));

            addToast(
                "Proyecto Devuelto",
                "El protocolo ha sido devuelto al docente para correcciones.",
                "warning",
                undefined,
                async () => {
                    try {
                        await curriculumProjectService.transitionState(
                            project.uuid,
                            originalState,
                            "Reversión (Undo): Retorno al estado anterior por cancelación de la devolución."
                        );
                        addToast("Acción Revertida", `La devolución ha sido cancelada. Proyecto en estado: ${originalState}`, "info");
                        window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
                        navigate(`/documentacion/revision-tecnica/${projectUuid}`);
                    } catch (err) {
                        console.error("[Undo Return] Failed:", err);
                        addToast("Error al Revertir", "No se pudo deshacer la devolución del proyecto.", "error");
                    }
                }
            );
            navigate(`/documentacion/monitoreo/${projectUuid}`);
            return true;
        } catch (err: any) {
            console.error(err);
            addToast("Error", err.response?.data?.error ?? "No se pudo realizar la devolución del proyecto.", "error");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        project,
        investigadores,
        loading,
        submitting,
        pdfUrl,
        loadingPdf,
        docSnapshot,
        templateBlocks,
        templateSections,
        teachersWithExceedingHours,
        isHoursOk,
        handleAprobar,
        handleDevolver
    };
};

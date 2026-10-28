import { useState, useEffect, useCallback, useRef } from 'react';
import { FIELD_LABELS } from '../types/revisionTecnicaTypes';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';
import { documentInstanceService } from '../../../../services/documentInstanceService';
import { documentTemplateService } from '../../../../services/documentTemplateService';
import { curriculumProjectService } from '../../../../services/curriculumProjectService';
import {
    getPeaByUuid,
    firmarPea,
    cambiarEstadoPea,
    type PeaDto
} from '../../../../services/peaService';
import { useAuth } from '../../../../api/AuthContext';

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
    setComments: _setComments
}: UseRevisionTecnicaDataParams) => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const addToastRef = useRef(addToast);
    const confirmRef = useRef(confirm);

    useEffect(() => {
        addToastRef.current = addToast;
        confirmRef.current = confirm;
    }, [addToast, confirm]);

    const [project, setProject] = useState<ProjectDetail | null>(null);
    const [rawPea, setRawPea] = useState<PeaDto | null>(null);
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

            if (loadedBlocks.length === 0) {
                try {
                    const uiConfigRes = await documentInstanceService.getTemplateUiConfig('PEA_OFICIAL');
                    if (uiConfigRes?.sections && Array.isArray(uiConfigRes.sections)) {
                        setTemplateSections(uiConfigRes.sections);
                    }
                } catch {}

                const tmplRes = await documentTemplateService.getTemplateByCode('PEA_OFICIAL');
                const rawHtml = tmplRes?.htmlContent || (tmplRes as any)?.html_content;
                if (rawHtml) {
                    const match = rawHtml.match(/<!-- DOSIER_SECTIONS_JSON:\s*(.*?) -->/);
                    if (match && match[1]) {
                        try {
                            const decoded = decodeURIComponent(escape(atob(match[1])));
                            loadedBlocks = JSON.parse(decoded);
                        } catch {}
                    }
                }
            }

            setTemplateBlocks(loadedBlocks);
        } catch (e) {
            console.error('[DOSIER] Error al cargar bloques de plantilla:', e);
        }
    }, []);

    const loadPdf = useCallback(async (uuid: string) => {
        setLoadingPdf(true);
        try {
            const instanceRes = await documentInstanceService.resolve({
                templateCode: 'PEA_OFICIAL',
                entityUuid: uuid
            });
            const finalPath = (instanceRes as any)?.finalPdfPath || instanceRes?.final_pdf_path;

            const instanceUuid = instanceRes?.uuid || (instanceRes as any)?.Uuid;
            if (instanceUuid) {
                try {
                    const pdfBlob = await documentInstanceService.getInstancePdf(instanceUuid);
                    const typedBlob = new Blob([pdfBlob], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(typedBlob);
                    setPdfUrl(blobUrl);
                    return;
                } catch (pdfErr) {
                    console.warn('[DOSIER] Fallo al obtener PDF por instancia, intentando storage:', pdfErr);
                }
            }

            if (finalPath) {
                const cleanPath = finalPath.replace(/\\/g, '/');
                try {
                    const fileBlob = await documentInstanceService.getStorageFile(cleanPath);
                    const typedBlob = new Blob([fileBlob], { type: 'application/pdf' });
                    const blobUrl = URL.createObjectURL(typedBlob);
                    setPdfUrl(blobUrl);
                    return;
                } catch (storageErr) {
                    console.error('[DOSIER] El documento final no se encuentra en storage:', storageErr);
                    setPdfUrl(null);
                }
            }

            const projectDetail = await curriculumProjectService.getProjectDetail(uuid);
            const pdfBlob = await curriculumProjectService.generatePdf(projectDetail, true);
            const typedBlob = new Blob([pdfBlob], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(typedBlob);
            setPdfUrl(blobUrl);
        } catch (err) {
            console.error('[DOSIER] Error al cargar PDF del PEA:', err);
            setPdfUrl(null);
        } finally {
            setLoadingPdf(false);
        }
    }, []);

    const calculateMetrics = useCallback(async (uuid: string, pea: PeaDto) => {
        try {
            let metadata: any = {};
            try {
                const instanceRes = await documentInstanceService.resolve({
                    templateCode: 'PEA_OFICIAL',
                    entityUuid: uuid
                });
                const dataJson = (instanceRes as any)?.dataSnapshotJson || instanceRes?.data_snapshot_json || '{}';
                metadata = typeof dataJson === 'string' ? JSON.parse(dataJson) : (dataJson || {});
            } catch {}

            const rdaCarreraFromPea = Array.isArray(pea.resultadosAprendizaje)
                ? (pea.resultadosAprendizaje.find((r: any) => r.tipoRda === 'Carrera' || r.tipo_rda === 'Carrera')?.descripcion || '')
                : '';

            const rdaAsignaturaFromPea = Array.isArray(pea.resultadosAprendizaje)
                ? pea.resultadosAprendizaje.filter((r: any) => r.tipoRda !== 'Carrera' && r.tipo_rda !== 'Carrera')
                : [];

            const rawRdaAsig = metadata.ResultadosAprendizaje ?? metadata.resultados_aprendizaje ?? metadata.resultadosAprendizaje;
            const rdaFinal = (rawRdaAsig !== undefined && rawRdaAsig !== null && (typeof rawRdaAsig === 'string' ? rawRdaAsig.trim().length > 0 : rawRdaAsig.length > 0))
                ? rawRdaAsig
                : (rdaAsignaturaFromPea.length > 0 ? rdaAsignaturaFromPea : '');

            const rdaCarreraFinal = metadata.RdaCarrera || metadata.rda_carrera || metadata.rdacarrera || metadata.RDA_Carrera || rdaCarreraFromPea || '';

            const prerreqFinal = (Array.isArray(metadata.Prerrequisitos) && metadata.Prerrequisitos.length > 0)
                ? metadata.Prerrequisitos
                : (Array.isArray(metadata.prerrequisitos) && metadata.prerrequisitos.length > 0)
                ? metadata.prerrequisitos
                : (pea.prerrequisitos || []);

            const unidadesFinal = (Array.isArray(metadata.Unidades) && metadata.Unidades.length > 0)
                ? metadata.Unidades
                : (Array.isArray(metadata.unidades) && metadata.unidades.length > 0)
                ? metadata.unidades
                : (pea.unidades || []);

            const practicasFinal = (Array.isArray(metadata.ActividadesPracticas) && metadata.ActividadesPracticas.length > 0)
                ? metadata.ActividadesPracticas
                : (Array.isArray(metadata.actividades_practicas) && metadata.actividades_practicas.length > 0)
                ? metadata.actividades_practicas
                : (pea.actividadesPracticas || []);

            const evalsFinal = (Array.isArray(metadata.Evaluaciones) && metadata.Evaluaciones.length > 0)
                ? metadata.Evaluaciones
                : (Array.isArray(metadata.evaluaciones) && metadata.evaluaciones.length > 0)
                ? metadata.evaluaciones
                : (pea.evaluaciones || []);

            const bibliosFinal = (Array.isArray(metadata.Bibliografias) && metadata.Bibliografias.length > 0)
                ? metadata.Bibliografias
                : (Array.isArray(metadata.bibliografias) && metadata.bibliografias.length > 0)
                ? metadata.bibliografias
                : (pea.bibliografias || []);

            metadata = {
                // 1. Datos Generales
                NombreAsignatura: metadata.NombreAsignatura || metadata.nombre_asignatura || metadata.nombreAsignatura || pea.nombreAsignatura || '',
                CodigoAsignatura: metadata.CodigoAsignatura || metadata.codigo_asignatura || metadata.codigoAsignatura || pea.codigoAsignatura || '',
                Carrera: metadata.Carrera || metadata.nombreCarrera || pea.nombreCarrera || '',
                Modalidad: metadata.Modalidad || metadata.modalidad || pea.modalidad || 'Presencial',
                UnidadOrganizacion: metadata.UnidadOrganizacion || metadata.unidad_organizacion || metadata.unidadOrganizacion || pea.unidadOrganizacion || 'Unidad Profesional',
                Periodo: metadata.Periodo || metadata.idPeriodo || pea.idPeriodo || '',
                Nivel: metadata.Nivel || metadata.semestre_nivel || metadata.semestreNivel || pea.semestreNivel || '',
                TotalHorasAsignatura: metadata.TotalHorasAsignatura || metadata.total_horas || metadata.totalHorasAsignatura || pea.totalHorasAsignatura || 0,
                Creditos: metadata.Creditos || metadata.creditos || pea.creditos || 0,
                HorasContactoDocente: metadata.HorasContactoDocente || metadata.horas_docencia || metadata.horasContactoDocente || pea.horasContactoDocente || 0,
                HorasPracticoExperimental: metadata.HorasPracticoExperimental || metadata.horas_practica || metadata.horasPracticoExperimental || pea.horasPracticoExperimental || 0,
                HorasAutonomo: metadata.HorasAutonomo || metadata.horas_autonomo || metadata.horasAutonomo || pea.horasAutonomo || 0,
                DocenteElaborador: metadata.DocenteElaborador || metadata.docente_elaborador || pea.nombreDocenteElaborador || pea.idDocenteElaborador || '',

                // 2. Objetivos
                ObjetivoAsignatura: metadata.ObjetivoAsignatura || metadata.objetivo_asignatura || metadata.objetivoAsignatura || pea.objetivoAsignatura || '',

                // 3. Prerrequisitos
                Prerrequisitos: prerreqFinal,

                // 4. RDA Carrera y Asignatura
                RdaCarrera: rdaCarreraFinal,
                ResultadosAprendizaje: rdaFinal,

                // 5. Contenidos
                Unidades: unidadesFinal,

                // 6. Metodología
                MetodologiaEnsenanza: metadata.MetodologiaEnsenanza || metadata.metodologia_ensenanza || metadata.metodologiaEnsenanza || pea.metodologiaEnsenanza || '',
                RecursosDidacticos: metadata.RecursosDidacticos || metadata.recursos_didacticos || metadata.recursosDidacticos || pea.recursosDidacticos || '',

                // 7. Prácticas
                ActividadesPracticas: practicasFinal,

                // 8. Evaluación
                EvaluacionAprendizaje: metadata.EvaluacionAprendizaje || metadata.evaluacion_aprendizaje || metadata.evaluacionAprendizaje || pea.evaluacionAprendizaje || '',
                Evaluaciones: evalsFinal,

                // 9. Bibliografía
                BibliografiaBasica: metadata.BibliografiaBasica || metadata.bibliografia_basica || metadata.bibliografiaBasica || '',
                BibliografiaConsulta: metadata.BibliografiaConsulta || metadata.bibliografia_consulta || metadata.bibliografiaConsulta || '',
                Bibliografias: bibliosFinal,

                // 10. Firmas
                FirmasResponsabilidad: metadata.FirmasResponsabilidad || {
                    DocenteNombre: pea.nombreDocenteElaborador || '',
                    DocenteCargo: 'Docente Titular',
                    CoordinadorCargo: 'Coordinador de Carrera',
                    CoordinadorAcadCargo: 'Coordinador Académico',
                    VicerrectorCargo: 'Vicerrectorado Académico'
                },
                ...metadata
            };

            setDocSnapshot(metadata);
        } catch (e) {
            console.error('[DOSIER] Error al calcular métricas colaborativas:', e);
        }
    }, []);

    const loadProjectData = useCallback(async () => {
        if (!projectUuid) return;
        setLoading(true);
        try {
            const pea = await getPeaByUuid(projectUuid);
            setRawPea(pea);

            const projectDetail: ProjectDetail = {
                uuid: pea.uuid,
                title: pea.nombreAsignatura || '(Sin asignatura)',
                status: pea.estado || 'Borrador',
                presupuesto: 0,
                convocatoriaMontoMaximo: null,
                convocatoria: pea.idPeriodo || '',
                linea: pea.nombreCarrera || '',
                carrera: pea.nombreCarrera || '',
                dominio: pea.unidadOrganizacion || '',
                descripcion: pea.objetivoAsignatura || '',
                directorProyecto: pea.nombreDocenteElaborador || 'Docente Titular',
                codigo_asignatura: pea.codigoAsignatura || '',
                modalidad: pea.modalidad || 'Presencial',
                semestre_nivel: pea.semestreNivel || '',
                horas_totales: pea.totalHorasAsignatura || 0,
                creditos: pea.creditos || 0,
                horas_docencia: pea.horasContactoDocente || 0,
                horas_practica: pea.horasPracticoExperimental || 0,
                horas_autonomo: pea.horasAutonomo || 0,
                docente_elaborador: pea.nombreDocenteElaborador || pea.idDocenteElaborador || '',
                periodo: pea.idPeriodo || '',
                peaData: pea
            };

            setProject(projectDetail);
            loadPdf(projectUuid);
            await calculateMetrics(projectUuid, pea);
            await loadTemplateBlocks(projectUuid);
        } catch (err) {
            console.error('[DOSIER] Error al cargar detalles de revisión del PEA:', err);
            addToastRef.current("Error", "No se pudo cargar el expediente curricular del PEA.", "error");
        } finally {
            setLoading(false);
        }
    }, [projectUuid, loadPdf, calculateMetrics, loadTemplateBlocks]);

    useEffect(() => {
        loadProjectData();
    }, [loadProjectData]);

    // Cuadre normativo CES Art. 21
    const totalSumaHoras = (project?.horas_docencia || 0) + (project?.horas_practica || 0) + (project?.horas_autonomo || 0);
    const isHoursOk = project?.horas_totales ? totalSumaHoras === project.horas_totales : true;

    // ── GESTIÓN DE AVALES Y FIRMAS INSTITUCIONALES ──
    const handleAprobar = async (
        generalFeedback: string,
        password?: string,
        tipoFirma: 'DOSIER' | 'FirmaEC' = 'DOSIER',
        certificadoP12Base64?: string,
        contraseniaP12?: string
    ): Promise<boolean> => {
        if (!project || !projectUuid) return false;

        const rolFirmante = isVicerrector
            ? 'Vicerrector'
            : isCoordAcad
                ? 'CoordinadorAcademico'
                : 'CoordinadorCarrera';

        const rolEtiqueta = isVicerrector
            ? 'Aprobación Definitiva de Vicerrectorado'
            : isCoordAcad
                ? 'Aval de Coordinación Académica'
                : 'Aval de Coordinación de Carrera';

        const pendientesCount = Object.values(comments).reduce(
            (acc, list) => acc + (list ? list.filter(c => c.status === 'Pendiente').length : 0),
            0
        );

        if (pendientesCount > 0) {
            const proceed = await confirm({
                title: "Observaciones Pendientes",
                message: `Existen ${pendientesCount} observación(es) en estado pendiente. ¿Está seguro de emitir el aval favorable sin exigir subsanación previa?`,
                confirmText: "Avalar de Todos Modos",
                cancelText: "Volver a Revisar",
                variant: "warning"
            });
            if (!proceed) return false;
        }

        setSubmitting(true);
        try {
            const resultado = await firmarPea(projectUuid, {
                password: password || undefined,
                rolFirmante: rolFirmante as any,
                tipoFirma,
                certificadoP12Base64,
                contraseniaP12,
                motivo: generalFeedback.trim() || `Emisión oficial de ${rolEtiqueta}. Pertinencia y diseño curricular conforme a normativa CES.`
            });

            addToast(
                "Aval Emitido Exitosamente",
                `Se registró la firma digital institucional (${resultado.firmaCode}). El PEA avanzó a estado '${resultado.estadoNuevo}'.`,
                "success"
            );

            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
            await loadProjectData();
            return true;
        } catch (err: any) {
            console.error('[DOSIER] Error al firmar y avalar PEA:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || "No se pudo estampar la firma del aval curricular.";
            addToast("Error al Emitir Aval", msg, "error");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    // ── DEVOLUCIÓN AL DOCENTE CON OBSERVACIONES (ESTADO: OBSERVADO) ──
    const handleDevolver = async (generalFeedback: string, fechaLimite?: string): Promise<boolean> => {
        if (!project || !projectUuid) return false;

        const totalObservaciones = Object.values(comments).reduce((acc, list) => acc + (list?.length || 0), 0);
        if (!generalFeedback.trim() && totalObservaciones === 0) {
            addToast("Observaciones Requeridas", "Debe redactar una síntesis general o registrar al menos una observación por sección antes de devolver el PEA.", "warning");
            return false;
        }

        const confirmDevolver = await confirm({
            title: "Devolver PEA para Subsanaciones",
            message: `¿Desea cambiar el estado a 'Observado' y remitir las observaciones al docente elaborador${fechaLimite ? ` con fecha límite al ${fechaLimite}` : ''}?`,
            confirmText: "Devolver al Docente",
            cancelText: "Cancelar",
            variant: "destructive"
        });
        if (!confirmDevolver) return false;

        setSubmitting(true);
        try {
            const sectionIssues = Object.entries(comments)
                .filter(([_, list]) => list && list.length > 0)
                .map(([sec, list]) => {
                    const label = FIELD_LABELS[sec] || sec;
                    return `• ${label}: ${list.map(c => c.text).join('; ')}`;
                })
                .join('\n');

            const motivoFull = generalFeedback.trim()
                ? `${generalFeedback.trim()}${sectionIssues ? `\n\nDetalle por Sección:\n${sectionIssues}` : ''}`
                : `Correcciones requeridas:\n${sectionIssues}`;

            await cambiarEstadoPea(projectUuid, 'Observado', undefined, motivoFull);

            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
            addToast(
                "PEA Devuelto con Observaciones",
                "El estado ha cambiado a 'Observado'. El editor microcurricular ha sido habilitado para que el docente subsane los requerimientos.",
                "warning"
            );

            await loadProjectData();
            return true;
        } catch (err: any) {
            console.error('[DOSIER] Error al devolver PEA:', err);
            const msg = err.response?.data?.message || err.response?.data?.error || "No se pudo actualizar el estado del PEA.";
            addToast("Error al Devolver", msg, "error");
            return false;
        } finally {
            setSubmitting(false);
        }
    };

    return {
        project,
        rawPea,
        investigadores: [],
        loading,
        submitting,
        pdfUrl,
        loadingPdf,
        docSnapshot,
        templateBlocks,
        templateSections,
        isHoursOk,
        teachersWithExceedingHours: [],
        handleAprobar,
        handleDevolver,
        reloadProject: loadProjectData
    };
};

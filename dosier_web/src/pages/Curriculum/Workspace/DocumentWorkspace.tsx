// ══════════════════════════════════════════════════════════════════════════════
// DOSIER ARCHITECTURE NOTE: DIRECTRIZ DE EXTENSIBILIDAD DE TRABAJO (DECISIÓN DE DISEÑO)
// ══════════════════════════════════════════════════════════════════════════════
//
// 1. ESTABILIDAD DEL WORKSPACE CORE:
//    - Este componente (ProjectWorkspace) es un orquestador desacoplado ultraliviano.
//    - Lógica de estado delegada a Custom Hooks de Orquestación (useProjectCore, useProjectTeam,
//      usePreproposalState).
//    - Paneles extensos desacoplados en subcomponentes dedicados (PreproposalAdminView, PreproposalAuthorView).
//
// ══════════════════════════════════════════════════════════════════════════════

import React, { useEffect, useCallback, useRef } from 'react';
import { Shield } from 'lucide-react';
import { FullscreenLoader } from '../../../components/Common/FullscreenLoader';
import DocumentEditor from './Wizard/DocumentEditor';

// Hooks de Orquestación
import { useProjectCore } from './hooks/useProjectCore';
import { useProjectPreferences } from './hooks/useProjectPreferences';

// Subcomponentes Desacoplados
import WorkspaceHeader from './components/WorkspaceHeader';
import WorkspaceTitle from './components/WorkspaceTitle';
import CacesWorkflow from './components/CacesWorkflow';
import WorkspaceSidebar from './components/WorkspaceSidebar';

export const DocumentWorkspace: React.FC = () => {
    const core = useProjectCore();
    const {
        templateCode,
        user,
        isAdmin,
        navigate,
        urlPrefix,
        activeDocument,
        setActiveDocument,
        isSidebarCollapsed,
        currentProject,
        setCurrentProject,
        projectDocuments,
        isLoading,
        resolvedProjectUuid,
        subDocumentUuids,
        isUnauthorized,
        isNotFound,
        fetchProject,
        resolveDocumentInstance
    } = core;

    const { touchProject } = useProjectPreferences();

    useEffect(() => {
        if (currentProject?.uuid) {
            touchProject(
                currentProject.uuid,
                currentProject.titulo,
                currentProject.codigo_institucional || (currentProject as any).codigo
            );
        }
    }, [currentProject?.uuid, currentProject?.titulo, (currentProject as any)?.codigo_institucional, touchProject]);

    const editorUuid = activeDocument ? subDocumentUuids[activeDocument] : undefined;
    const preloadedData = React.useMemo(() => {
        const base: any = { Uuid: editorUuid };
        if (activeDocument === 'PEA_OFICIAL') {
            const pea = currentProject?.peaData || currentProject || {};
            const asigNombre = pea.nombre_asignatura || pea.nombreAsignatura || currentProject?.titulo || currentProject?.title || '';
            const carreraNombre = pea.nombre_carrera || pea.nombreCarrera || currentProject?.carrera || '';
            const perNombre = pea.id_periodo || pea.idPeriodo || currentProject?.convocatoria || '';
            const docNombre = pea.nombre_docente_elaborador || pea.nombreDocenteElaborador || currentProject?.directorProyecto || '';

            base.titulo = asigNombre;
            base.NombreAsignatura = asigNombre;
            base.nombre_asignatura = asigNombre;
            base.CodigoAsignatura = pea.codigo_asignatura || pea.codigoAsignatura || '';
            base.codigo_asignatura = pea.codigo_asignatura || pea.codigoAsignatura || '';
            base.Carrera = carreraNombre;
            base.carrera = carreraNombre;
            base.Periodo = perNombre;
            base.periodo = perNombre;
            base.Modalidad = pea.modalidad || 'Presencial';
            base.modalidad = pea.modalidad || 'Presencial';
            base.Nivel = pea.semestre_nivel || pea.semestreNivel || '';
            base.nivel = pea.semestre_nivel || pea.semestreNivel || '';
            base.UnidadOrganizacion = pea.unidad_organizacion || pea.unidadOrganizacion || '';
            base.unidad_organizacion = pea.unidadOrganizacion || pea.unidadOrganizacion || '';
            base.TotalHorasAsignatura = pea.total_horas_asignatura ?? pea.totalHorasAsignatura ?? 0;
            base.total_horas_asignatura = pea.total_horas_asignatura ?? pea.totalHorasAsignatura ?? 0;
            base.Creditos = pea.creditos ?? 0;
            base.creditos = pea.creditos ?? 0;
            base.HorasContactoDocente = pea.horas_contacto_docente ?? pea.horasContactoDocente ?? 0;
            base.HorasPracticoExperimental = pea.horas_practico_experimental ?? pea.horasPracticoExperimental ?? 0;
            base.HorasAutonomo = pea.horas_autonomo ?? pea.horasAutonomo ?? 0;
            base.DocenteElaborador = docNombre;
            base.docente = docNombre;
            base.ObjetivoAsignatura = pea.objetivo_asignatura || pea.objetivoAsignatura || '';
            base.MetodologiaEnsenanza = pea.metodologia_ensenanza || pea.metodologiaEnsenanza || '';
            base.RecursosDidacticos = pea.recursos_didacticos || pea.recursosDidacticos || '';
            base.EvaluacionAprendizaje = pea.evaluacion_aprendizaje || pea.evaluacionAprendizaje || '';
            base.Unidades = pea.unidades || pea.Unidades || [];
            base.ResultadosAprendizaje = pea.resultados_aprendizaje || pea.resultadosAprendizaje || pea.ResultadosAprendizaje || [];
            base.ActividadesPracticas = pea.actividades_practicas || pea.actividadesPracticas || pea.ActividadesPracticas || [];
            base.Bibliografias = pea.bibliografias || pea.Bibliografias || [];
            base.Prerrequisitos = pea.prerrequisitos || pea.Prerrequisitos || [];
            base.Evaluaciones = pea.evaluaciones || pea.Evaluaciones || [];
        }
        return base;
    }, [editorUuid, activeDocument, currentProject?.peaData, currentProject?.directorProyecto, currentProject?.titulo, currentProject?.title, currentProject?.carrera, currentProject?.convocatoria]);

    // ── Sincronización Silenciosa y Throttling Enterprise (10/10) ──
    const FOCUS_THROTTLE_MS = 15000; // Cooldown mínimo de 15s entre revalidaciones por foco/visibilidad
    const lastSyncTimestampRef = useRef<number>(0);
    const isSyncingRef = useRef<boolean>(false);

    // Contenedor mutable para evitar recrear listeners en cada render
    const syncCallbacksRef = useRef({
        fetchProject,
        populateTeam: team.populateTeamFromProject
    });

    useEffect(() => {
        syncCallbacksRef.current = {
            fetchProject,
            populateTeam: team.populateTeamFromProject
        };
    });

    const triggerSync = useCallback(async (_isSilent = true) => {
        if (isSyncingRef.current) return;
        isSyncingRef.current = true;
        lastSyncTimestampRef.current = Date.now();

        try {
            const { fetchProject: doFetchProject, populateTeam: doPopulateTeam } = syncCallbacksRef.current;
            await Promise.allSettled([
                doFetchProject((data) => {
                    if (data) doPopulateTeam(data);
                })
            ]);
        } finally {
            isSyncingRef.current = false;
        }
    }, []);

    // Carga inicial o cuando cambia el documento activo/uuid
    useEffect(() => {
        if (resolvedProjectUuid) {
            triggerSync(false);
        }
    }, [resolvedProjectUuid, activeDocument, triggerSync]);

    // Registro atómico de listeners nativos (se suscribe una sola vez al montar)
    useEffect(() => {
        // Evento explícito de DOSIER (tras guardar, firmar o revertir) -> Inmediato sin cooldown
        const onCustomEvent = () => {
            triggerSync(true);
        };

        // Eventos del navegador (enfoque de ventana o cambio de pestaña) -> Throttled a 15s
        const onWindowFocusOrVisible = () => {
            if (document.visibilityState !== 'visible') return;
            const now = Date.now();
            if (now - lastSyncTimestampRef.current >= FOCUS_THROTTLE_MS) {
                triggerSync(true);
            }
        };

        window.addEventListener('dosier-projects-changed', onCustomEvent);
        window.addEventListener('focus', onWindowFocusOrVisible);
        document.addEventListener('visibilitychange', onWindowFocusOrVisible);

        return () => {
            window.removeEventListener('dosier-projects-changed', onCustomEvent);
            window.removeEventListener('focus', onWindowFocusOrVisible);
            document.removeEventListener('visibilitychange', onWindowFocusOrVisible);
        };
    }, [triggerSync]);

    // Polling en segundo plano cuando el proyecto está en un estado pendiente de revisión
    useEffect(() => {
        if (!currentProject?.status) return;

        const isPendingState = ['Enviado', 'Prepropuesta', 'Prepropuesta Rechazada', 'En Revisión', 'En Corrección'].includes(currentProject.status);
        if (!isPendingState) return;

        const intervalId = setInterval(() => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                if (now - lastSyncTimestampRef.current >= FOCUS_THROTTLE_MS) {
                    triggerSync(true);
                }
            }
        }, 15000); // Polling suave cada 15s

        return () => clearInterval(intervalId);
    }, [currentProject?.status, triggerSync]);

    if (isLoading || !resolvedProjectUuid) {
        return <FullscreenLoader message="Cargando proyecto..." />;
    }

    if (isNotFound) {
        return (
            <div className="flex-1 bg-bg-deep flex items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bento-card static p-8 max-w-md w-full flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center text-error">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-sm font-semibold text-text-main uppercase tracking-widest">Proyecto no encontrado</h3>
                    <p className="text-xs text-text-dim leading-relaxed">
                        El proyecto solicitado no existe o ha sido eliminado del sistema.
                    </p>
                    <button onClick={() => navigate(urlPrefix)} className="btn-vercel-primary text-xs w-full justify-center">
                        Volver a Proyectos
                    </button>
                </div>
            </div>
        );
    }

    if (isUnauthorized) {
        return (
            <div className="flex-1 bg-bg-deep flex items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="bento-card static p-8 max-w-md w-full flex flex-col items-center gap-4">
                    <Shield size={48} className="text-error" />
                    <h3 className="text-sm font-semibold text-text-main uppercase tracking-widest">Acceso Restringido</h3>
                    <p className="text-xs text-text-dim leading-relaxed">
                        No tienes permisos para visualizar ni participar en este proyecto de investigación colaborativo.
                    </p>
                    <button onClick={() => navigate(urlPrefix)} className="btn-vercel-primary text-xs w-full justify-center">
                        Volver a Proyectos
                    </button>
                </div>
            </div>
        );
    }

    const handleCloseEditor = () => {
        if (templateCode === 'PEA_OFICIAL' || activeDocument === 'PEA_OFICIAL') {
            if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
            } else {
                navigate(urlPrefix ? `${urlPrefix}/proyectos?tab=supervision-pea` : '/documentacion/proyectos?tab=supervision-pea');
            }
            return;
        }
        setActiveDocument(null);
    };

    if (activeDocument) {
        const editorUuid = subDocumentUuids[activeDocument];

        if (!editorUuid) {
            return <FullscreenLoader message="Resolviendo documento..." />;
        }

        let isReadOnly = false;
        let readOnlyReason: 'state' | 'membership' | 'review' = 'state';

        if (activeDocument === 'PEA_OFICIAL' || activeDocument === 'GUIA_PRACTICA_LAB') {
            isReadOnly = !currentProject.puedeEditar;
            readOnlyReason = (currentProject.status !== 'Borrador' && currentProject.status !== 'En Corrección' && currentProject.status !== 'NoIniciado') ? 'state' : 'membership';
        } else if (activeDocument === 'RUBRICA_EVALUACION') {
            isReadOnly = true;
            readOnlyReason = 'review';
        } else {
            isReadOnly = currentProject.status === 'Finalizado';
            readOnlyReason = 'state';
        }

        const canSignDocument = currentProject.puedeFirmar;

        return (
            <DocumentEditor
                templateCode={activeDocument}
                initialData={preloadedData}
                entityUuid={resolvedProjectUuid || undefined}
                onClose={handleCloseEditor}
                readOnly={isReadOnly}
                readOnlyReason={readOnlyReason}
                projectStatus={currentProject.status}
                canSign={canSignDocument}
            />
        );
    }

    return (
        <div className="h-screen w-full flex flex-col bg-bg-deep overflow-hidden selection:bg-text-main selection:text-bg-deep transition-colors duration-300">
            <WorkspaceHeader
                currentProject={currentProject}
                isSidebarCollapsed={isSidebarCollapsed}
                urlPrefix={urlPrefix}
            />

            <div className="flex-1 overflow-y-auto">
                <main className="max-w-[1600px] mx-auto p-4 md:p-10 animate-fade-up">
                    <WorkspaceTitle
                        currentProject={currentProject}
                        user={user}
                        templateCode={templateCode}
                        setActiveDocument={setActiveDocument}
                    />

                    <div className="flex flex-col lg:grid lg:grid-cols-[1fr_300px] gap-4 lg:items-start">
                        <div className="flex flex-col gap-3">
                            <CacesWorkflow
                                currentProject={currentProject}
                                projectDocuments={projectDocuments}
                                templateCode={templateCode}
                                isAdmin={isAdmin}
                                urlPrefix={urlPrefix}
                                resolvedProjectUuid={resolvedProjectUuid}
                                setActiveDocument={setActiveDocument}
                                resolveDocumentInstance={resolveDocumentInstance}
                                navigate={navigate}
                            />
                        </div>

                        <div className="lg:sticky lg:top-0 flex flex-col gap-3">
                            <WorkspaceSidebar
                                currentProject={currentProject}
                                projectDocuments={projectDocuments}
                                resolvedProjectUuid={resolvedProjectUuid}
                                setActiveDocument={setActiveDocument}
                                isAdmin={isAdmin}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocumentWorkspace;

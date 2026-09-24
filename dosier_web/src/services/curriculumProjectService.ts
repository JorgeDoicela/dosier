import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO de Proyectos Curriculares
// ─────────────────────────────────────────────────────────────

export interface ProjectDetailDto {
    uuid: string;
    title?: string;
    titulo?: string;
    descripcion?: string;
    estado?: string;
    status?: string;
    codigo_institucional?: string;
    codigoInstitucional?: string;
    id_carrera?: number;
    idCarrera?: number;
    carrera?: string;
    carrera_nombre?: string;
    director_id?: string;
    director_nombre?: string;
    director_email?: string;
    members?: any[];
    [key: string]: any;
}

export interface TeamChangeRequestDto {
    uuid: string;
    project_uuid: string;
    tipo_solicitud: string;
    usuario_afectado_id?: string;
    usuario_afectado_nombre?: string;
    rol_propuesto?: string;
    justificacion?: string;
    estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | string;
    created_at?: string;
    reviewed_at?: string;
    review_notes?: string;
    [key: string]: any;
}

export interface ProjectActivityLogDto {
    id?: number;
    uuid?: string;
    project_uuid: string;
    user_name?: string;
    accion: string;
    descripcion?: string;
    fecha?: string;
    [key: string]: any;
}

export interface TraceabilityItemDto {
    uuid?: string;
    fase: string;
    estado: string;
    observacion?: string;
    created_at?: string;
    usuario_nombre?: string;
    [key: string]: any;
}

export interface DocenteCarreraDto {
    idCarrera?: number;
    id_carrera?: number;
    carrera1?: string;
    nombre_carrera?: string;
    carrera?: string;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Gestión de Proyectos Curriculares y Workspace
// ─────────────────────────────────────────────────────────────

export const curriculumProjectService = {
    /**
     * Obtiene el detalle completo del proyecto curricular o del PEA.
     */
    getProjectDetail: (projectUuid: string, isPeaTemplate = false): Promise<ProjectDetailDto> => {
        const endpoint = isPeaTemplate
            ? `/pea/uuid/${encodeURIComponent(projectUuid)}`
            : `/projects/${encodeURIComponent(projectUuid)}/detail`;
        return api.get<ProjectDetailDto>(endpoint).then(r => r.data);
    },

    /**
     * Obtiene el registro de actividad histórica de un proyecto.
     */
    getActivity: (projectUuid: string, params?: { page?: number; limit?: number }): Promise<any> =>
        api.get(`/projects/${encodeURIComponent(projectUuid)}/activity`, { params }).then(r => r.data),

    /**
     * Obtiene la nómina de solicitudes de cambio de equipo de un proyecto.
     */
    getTeamChangeRequests: (projectUuid: string): Promise<TeamChangeRequestDto[]> =>
        api.get<TeamChangeRequestDto[]>(`/projects/${encodeURIComponent(projectUuid)}/team-change-requests`).then(r => r.data || []),

    /**
     * Crea una solicitud formal de modificación de integrantes del equipo.
     */
    createTeamChangeRequest: (projectUuid: string, payload: any): Promise<any> =>
        api.post(`/projects/${encodeURIComponent(projectUuid)}/team-change-requests`, payload).then(r => r.data),

    /**
     * Revisa (aprueba o rechaza) una solicitud de cambio de equipo.
     */
    reviewTeamChangeRequest: (
        projectUuid: string,
        requestUuid: string,
        payload: any
    ): Promise<any> =>
        api.patch(
            `/projects/${encodeURIComponent(projectUuid)}/team-change-requests/${encodeURIComponent(requestUuid)}/review`,
            payload
        ).then(r => r.data),

    /**
     * Transfiere la dirección del proyecto a otro docente calificado.
     */
    transferDirector: (projectUuid: string, payloadOrCedula: string | { nuevo_director_cedula: string; motivo?: string; descripcion?: string; new_director_id?: string }): Promise<any> => {
        const body = typeof payloadOrCedula === 'string'
            ? { new_director_id: payloadOrCedula, nuevo_director_cedula: payloadOrCedula }
            : payloadOrCedula;
        return api.post(`/projects/${encodeURIComponent(projectUuid)}/transfer-director`, body).then(r => r.data);
    },

    /**
     * Actualiza directamente los integrantes del equipo de trabajo.
     */
    updateTeam: (projectUuid: string, payload: any): Promise<any> =>
        api.patch(`/projects/${encodeURIComponent(projectUuid)}/team`, payload).then(r => r.data),

    /**
     * Inicia la fase de ejecución oficial del proyecto.
     */
    iniciarEjecucion: (projectUuid: string): Promise<any> =>
        api.post(`/Projects/${encodeURIComponent(projectUuid)}/iniciar-ejecucion`).then(r => r.data),

    /**
     * Obtiene el historial de trazabilidad de cambios de estado del proyecto.
     */
    getTraceability: (projectUuid: string): Promise<TraceabilityItemDto[]> =>
        api.get<TraceabilityItemDto[]>(`/projects/${encodeURIComponent(projectUuid)}/traceability`).then(r => r.data || []),

    /**
     * Ejecuta una transición de estado del proyecto curricular con observaciones.
     */
    transitionState: (projectUuid: string, newState: string, observation?: string): Promise<any> => {
        return api.post(
            `/projects/${encodeURIComponent(projectUuid)}/transition`,
            null,
            {
                params: {
                    newState,
                    observation: observation || ''
                }
            }
        ).then(r => r.data);
    },

    /**
     * Obtiene las carreras asociadas al docente autenticado.
     */
    getDocenteCarreras: (): Promise<DocenteCarreraDto[]> =>
        api.get<DocenteCarreraDto[]>('/catalogs/mi-carrera').then(r => r.data || []),

    /**
     * Obtiene la nómina general de proyectos curriculares.
     */
    getAllProjects: (): Promise<any[]> =>
        api.get<any[]>('/projects').then(r => r.data || []),

    /**
     * Obtiene los proyectos curriculares vinculados al estudiante autenticado.
     */
    getMyProjects: (): Promise<any[]> =>
        api.get<any[]>('/projects/my').then(r => r.data || []),

    /**
     * Envía un proyecto a la papelera de reciclaje curricular.
     */
    deleteProject: (projectUuid: string): Promise<any> =>
        api.delete(`/projects/${encodeURIComponent(projectUuid)}`).then(r => r.data),

    /**
     * Genera un PDF de previsualización de borrador o consolidado del proyecto.
     */
    generatePdf: (projectData: any, isDraft = true): Promise<Blob> =>
        api.post(`/projects/generate-pdf?isDraft=${isDraft}`, projectData, { responseType: 'blob' })
            .then(r => new Blob([r.data])),

    /**
     * Obtiene las convocatorias curriculares e institucionales registradas.
     */
    getConvocatorias: (): Promise<any[]> =>
        api.get<any[]>('/Convocatorias').then(r => r.data || []),

    /**
     * Busca grupos de investigación o cuerpos colegiados por término.
     */
    searchGroups: (queryClean: string, options?: { signal?: AbortSignal }): Promise<any[]> =>
        api.get<any[]>(`/Groups?search=${encodeURIComponent(queryClean)}`, options).then(r => r.data || []),
};

export default curriculumProjectService;

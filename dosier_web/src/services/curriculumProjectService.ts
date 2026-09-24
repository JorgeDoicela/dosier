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
     * Obtiene el detalle completo del instrumento curricular (PEA o documento de aula).
     */
    getProjectDetail: async (projectUuid: string, _isPeaTemplate = true): Promise<ProjectDetailDto> => {
        try {
            const res = await api.get<any>(`/pea/uuid/${encodeURIComponent(projectUuid)}`);
            const data = res.data;
            return {
                uuid: data.uuid || projectUuid,
                titulo: data.nombre_asignatura || data.nombreAsignatura || data.titulo || '',
                title: data.nombre_asignatura || data.nombreAsignatura || data.titulo || '',
                estado: data.estado || 'Borrador',
                status: data.estado || 'Borrador',
                carrera: data.nombre_carrera || data.nombreCarrera || data.carrera || '',
                carrera_nombre: data.nombre_carrera || data.nombreCarrera || '',
                director_nombre: data.nombre_docente_elaborador || data.nombreDocenteElaborador || 'Docente Responsable',
                descripcion: data.objetivo_asignatura || data.objetivoAsignatura || '',
                descripcion_proyecto: data.objetivo_asignatura || data.objetivoAsignatura || '',
                codigo_institucional: data.codigo_asignatura || data.codigoAsignatura || '',
                id_carrera: data.id_carrera || data.idCarrera,
                peaData: data,
                investigadores: []
            };
        } catch {
            // Fallback para instancias universales del motor de documentos
            const docRes = await api.get<any>(`/documents/instances/${encodeURIComponent(projectUuid)}`);
            const doc = docRes.data;
            return {
                uuid: doc.uuid || projectUuid,
                titulo: doc.title || 'Documento Curricular',
                title: doc.title || 'Documento Curricular',
                estado: doc.status || 'Borrador',
                status: doc.status || 'Borrador',
                carrera: '',
                director_nombre: doc.created_by || 'Docente',
                investigadores: []
            };
        }
    },

    /**
     * Obtiene el registro de actividad histórica de un proyecto o documento.
     */
    getActivity: (projectUuid: string, _params?: { page?: number; limit?: number }): Promise<any> =>
        api.get(`/documents/instances/${encodeURIComponent(projectUuid)}`).then(r => r.data).catch(() => ({ items: [] })),

    /**
     * Obtiene el historial de trazabilidad de cambios de estado del PEA o documento.
     */
    getTraceability: (projectUuid: string): Promise<TraceabilityItemDto[]> =>
        api.get<TraceabilityItemDto[]>(`/pea/${encodeURIComponent(projectUuid)}/trazabilidad`)
            .then(r => r.data || [])
            .catch(() => []),

    /**
     * Ejecuta una transición de estado del proyecto curricular con observaciones y plazo opcional.
     */
    transitionState: (projectUuid: string, newState: string, observation?: string, _fechaLimite?: string): Promise<any> => {
        return api.patch(
            `/pea/${encodeURIComponent(projectUuid)}/estado`,
            {
                nuevo_estado: newState,
                motivo: observation || ''
            }
        ).then(r => r.data).catch(() => ({ success: true }));
    },

    /**
     * Obtiene las carreras asociadas al docente autenticado.
     */
    getDocenteCarreras: (): Promise<DocenteCarreraDto[]> =>
        api.get<DocenteCarreraDto[]>('/catalogs/mi-carrera').then(r => r.data || []),

    /**
     * Obtiene la nómina general de proyectos curriculares (PEAs institucionales).
     */
    getAllProjects: (): Promise<any[]> =>
        api.get<any[]>('/pea/bandeja')
            .then(r => {
                const list = Array.isArray(r.data) ? r.data : [];
                return list.map((p: any) => ({
                    uuid: p.uuid,
                    titulo: p.nombre_asignatura,
                    title: p.nombre_asignatura,
                    codigo_institucional: p.codigo_asignatura,
                    carrera: p.nombre_carrera,
                    director_nombre: p.nombre_docente_elaborador,
                    estado: p.estado,
                    status: p.estado,
                    fecha_modificacion: p.fecha_modificacion,
                    template_code: 'PEA_OFICIAL'
                }));
            })
            .catch(() => []),

    /**
     * Obtiene los instrumentos PEA vinculados al docente autenticado.
     */
    getMyProjects: (): Promise<any[]> =>
        api.get<any[]>('/docente-asignaturas/mis-materias')
            .then(r => {
                const list = Array.isArray(r.data) ? r.data : [];
                return list
                    .filter((m: any) => m.uuid_pea || m.id_pea)
                    .map((m: any) => ({
                        uuid: m.uuid_pea || String(m.id_pea),
                        titulo: m.nombre_asignatura,
                        title: m.nombre_asignatura,
                        codigo_institucional: m.codigo_asignatura,
                        carrera: m.nombre_carrera,
                        estado: m.estado_pea || 'Borrador',
                        status: m.estado_pea || 'Borrador',
                        fecha_modificacion: m.fecha_modificacion,
                        template_code: 'PEA_OFICIAL'
                    }));
            })
            .catch(() => []),

    /**
     * Envía un proyecto o documento a la papelera de reciclaje curricular.
     */
    deleteProject: (projectUuid: string): Promise<any> =>
        api.delete(`/documents/instances/${encodeURIComponent(projectUuid)}`)
            .then(r => r.data)
            .catch(() => ({ success: true })),

    /**
     * Genera un PDF de previsualización de borrador o consolidado del documento curricular.
     */
    generatePdf: (projectData: any, isDraft = true): Promise<Blob> =>
        api.post(`/documents/render?templateCode=PEA_OFICIAL&isDraft=${isDraft}`, projectData, { responseType: 'blob' })
            .then(r => new Blob([r.data])),

    /**
     * Obtiene las convocatorias curriculares e institucionales registradas.
     */
    getConvocatorias: (): Promise<any[]> =>
        api.get<any[]>('/docente-asignaturas/periodos').then(r => r.data || []),
};

export default curriculumProjectService;

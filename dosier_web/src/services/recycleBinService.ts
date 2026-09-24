import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface DeletedProjectDto {
    uuid: string;
    titulo?: string;
    nombre?: string;
    codigoInstitucional?: string;
    codigo_institucional?: string;
    siglas?: string;
    estado: string;
    fechaEliminacion: string;
    fecha_eliminacion?: string;
    eliminadoPor: string;
    eliminado_por?: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Papelera de Reciclaje
// ─────────────────────────────────────────────────────────────

export const recycleBinService = {
    /**
     * Obtiene la nómina de proyectos o documentos curriculares en la papelera de reciclaje.
     */
    getDeletedProjects: (): Promise<DeletedProjectDto[]> =>
        api.get('/recyclebin/projects').then(r => r.data || []),

    /**
     * Restaura un documento curricular o proyecto eliminado de vuelta a su estado activo.
     */
    restoreProject: (uuid: string): Promise<{ message: string }> =>
        api.post(`/recyclebin/restore/project/${encodeURIComponent(uuid)}`).then(r => r.data),

    /**
     * Elimina definitivamente y de forma irreversible un elemento de la base de datos.
     */
    purgeProject: (uuid: string): Promise<{ message: string }> =>
        api.delete(`/recyclebin/purge/project/${encodeURIComponent(uuid)}`).then(r => r.data),
};

export default recycleBinService;

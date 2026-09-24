import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO de Colaboración Curricular
// ─────────────────────────────────────────────────────────────

export interface CommentDto {
    id: number | string;
    section_id?: string;
    sectionId?: string;
    user_name?: string;
    userName?: string;
    content: string;
    created_at?: string;
    createdAt?: string;
    resolved?: boolean;
    [key: string]: any;
}

export interface PulseDto {
    active_users?: Array<{ id: string; name: string; avatar?: string }>;
    last_activity?: string;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Colaboración, Comentarios y Pulso en Tiempo Real
// ─────────────────────────────────────────────────────────────

export const collaborationService = {
    /**
     * Obtiene el listado de comentarios de retroalimentación de un documento o sección.
     */
    getComments: (entityUuid: string): Promise<CommentDto[]> =>
        api.get<CommentDto[]>(`/collaboration/comments/${encodeURIComponent(entityUuid)}`).then(r => r.data || []),

    /**
     * Registra un nuevo comentario u observación técnica.
     */
    createComment: (payload: any): Promise<CommentDto> =>
        api.post<CommentDto>('/collaboration/comments', payload).then(r => r.data),

    /**
     * Actualiza el contenido o estado de un comentario existente.
     */
    updateComment: (id: number | string, payload: any): Promise<CommentDto> =>
        api.put<CommentDto>(`/collaboration/comments/${encodeURIComponent(String(id))}`, payload).then(r => r.data),

    /**
     * Elimina un comentario de la bitácora técnica.
     */
    deleteComment: (id: number | string): Promise<void> =>
        api.delete(`/collaboration/comments/${encodeURIComponent(String(id))}`).then(() => undefined),

    /**
     * Obtiene el pulso de concurrencia y usuarios activos en el documento.
     */
    getPulse: (projectUuid: string): Promise<PulseDto> =>
        api.get<PulseDto>(`/collaboration/${encodeURIComponent(projectUuid)}/pulse`).then(r => r.data),

    /**
     * Sube un archivo adjunto o nota de voz a la infraestructura de colaboración.
     */
    uploadFile: (formData: FormData, onUploadProgress?: (progressEvent: any) => void): Promise<{ url: string; [key: string]: any }> =>
        api.post('/collaboration/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress
        }).then(r => r.data),

    /**
     * Elimina una imagen o adjunto del servidor de colaboración.
     */
    deleteImage: (imageUrl: string): Promise<any> =>
        api.delete(`/collaboration/delete-image?url=${encodeURIComponent(imageUrl)}`).then(r => r.data),
};

export default collaborationService;

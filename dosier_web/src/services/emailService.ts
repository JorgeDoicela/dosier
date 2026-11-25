import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface EmailHistoryItemDto {
    id_email_historial?: number;
    idEmailHistorial?: number;
    uuid: string;
    destinatario: string;
    id_usuario_destinatario?: number;
    idUsuarioDestinatario?: number;
    nombre_destinatario?: string;
    nombreDestinatario?: string;
    asunto: string;
    cuerpo: string;
    estado: string;
    error_mensaje?: string;
    errorMensaje?: string;
    fecha_envio?: string;
    fechaEnvio?: string;
    adjuntos_json?: string;
    adjuntosJson?: string;
    metadata_json?: string;
    metadataJson?: string;
}

export interface EmailTemplateDto {
    id_email_template?: number;
    idEmailTemplate?: number;
    uuid: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    asunto: string;
    cuerpo_html?: string;
    cuerpoHtml?: string;
    activo: boolean | number | string;
    fecha_creado?: string;
    fechaCreado?: string;
    fecha_actualizado?: string;
    fechaActualizado?: string;
}

export interface SaveEmailTemplateDto {
    id_email_template?: number;
    uuid?: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    asunto: string;
    cuerpo_html: string;
    activo: boolean;
}

export interface SendEmailPayloadDto {
    template_codigo?: string;
    destinatarios_emails: string[];
    destinatarios_user_ids: number[];
    target_role: string | null;
    target_carrera_id: number | null;
    target_carrera_ids?: number[];
    target_modalidad_ids?: number[];
    target_pea_estado?: string | null;
    target_periodo_id?: string | null;
    custom_subject: string;
    custom_body: string;
    template_data: Record<string, string>;
    attachments: Array<{
        nombre_archivo: string;
        base64_content: string | null;
        ruta_archivo: string | null;
        content_type: string | null;
    }>;
    entity_uuid: string | null;
    entity_type: string | null;
    certificate_base64: string | null;
    signature_password: string | null;
}

export interface PeriodoCatalogDto {
    id_periodo?: string;
    idPeriodo?: string;
    detalle?: string;
    fecha_inicial?: string;
    fechaInicial?: string;
    fecha_final?: string;
    fechaFinal?: string;
    activo?: boolean;
    cerrado?: boolean;
}

export interface EmailEngineScopeDto {
    primary_role?: string;
    primaryRole?: string;
    is_global_scope?: boolean;
    isGlobalScope?: boolean;
    can_manage_templates?: boolean;
    canManageTemplates?: boolean;
    can_delete_templates?: boolean;
    canDeleteTemplates?: boolean;
    can_view_all_history?: boolean;
    canViewAllHistory?: boolean;
    allowed_broadcast_roles?: string[];
    allowedBroadcastRoles?: string[];
    allowed_carrera_ids?: number[];
    allowedCarreraIds?: number[];
    allowed_carreras?: Array<{
        id_carrera?: number;
        idCarrera?: number;
        carrera1?: string;
        alias_carrera?: string;
        aliasCarrera?: string;
        modalidad_ids?: number[];
        modalidadIds?: number[];
    }>;
    allowedCarreras?: Array<{
        id_carrera?: number;
        idCarrera?: number;
        carrera1?: string;
        alias_carrera?: string;
        aliasCarrera?: string;
        modalidad_ids?: number[];
        modalidadIds?: number[];
    }>;
    available_modalidades?: Array<{
        id_modalidad?: number;
        idModalidad?: number;
        nombre?: string;
        carrera_ids?: number[];
        carreraIds?: number[];
    }>;
    availableModalidades?: Array<{
        id_modalidad?: number;
        idModalidad?: number;
        nombre?: string;
        carrera_ids?: number[];
        carreraIds?: number[];
    }>;
}

export interface EmailAudiencePreviewPayloadDto {
    target_role: string | null;
    target_carrera_id?: number | null;
    target_carrera_ids: number[];
    target_modalidad_ids: number[];
    target_pea_estado: string | null;
    target_periodo_id: string | null;
}

export interface EmailAudiencePreviewResponseDto {
    total_recipients?: number;
    totalRecipients?: number;
    sample?: EmailRecipientOptionDto[];
}

export interface EmailRecipientOptionDto {
    id_usuario?: number;
    idUsuario?: number;
    nombre_completo?: string;
    nombreCompleto?: string;
    email: string;
    tipo?: string;
    carrera?: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Motor de Correos y Plantillas SMTP — DOSIER
// ─────────────────────────────────────────────────────────────

export const emailService = {
    getEmailHistory: (limit = 100): Promise<EmailHistoryItemDto[]> =>
        api.get<EmailHistoryItemDto[]>(`/Admin/email-engine/history?limit=${limit}`).then(r => r.data || []),

    getTemplates: (): Promise<EmailTemplateDto[]> =>
        api.get<EmailTemplateDto[]>('/Admin/email-engine/templates').then(r => r.data || []),

    createTemplate: (payload: SaveEmailTemplateDto): Promise<EmailTemplateDto> =>
        api.post<EmailTemplateDto>('/Admin/email-engine/templates', payload).then(r => r.data),

    updateTemplate: (id: number, payload: SaveEmailTemplateDto): Promise<EmailTemplateDto> =>
        api.put<EmailTemplateDto>(`/Admin/email-engine/templates/${id}`, payload).then(r => r.data),

    deleteTemplate: (id: number): Promise<void> =>
        api.delete(`/Admin/email-engine/templates/${id}`).then(() => undefined),

    sendEmail: (payload: SendEmailPayloadDto): Promise<{ success: boolean; message: string }> =>
        api.post('/Admin/email-engine/send', payload).then(r => r.data),

    getPeriodos: (): Promise<PeriodoCatalogDto[]> =>
        api.get<PeriodoCatalogDto[]>('/catalogs/periodos').then(r => r.data || []).catch(() => []),

    getScope: (): Promise<EmailEngineScopeDto> =>
        api.get<EmailEngineScopeDto>('/Admin/email-engine/scope').then(r => r.data),

    searchRecipients: (params: {
        search?: string;
        type?: string;
        carreraId?: string | number;
        limit?: number;
    }): Promise<EmailRecipientOptionDto[]> =>
        api.get<EmailRecipientOptionDto[]>('/Admin/email-engine/recipients', { params }).then(r => r.data || []),

    getScopedPeas: (alcanceInstitucional: boolean): Promise<any[]> =>
        api.get<any[]>('/pea/bandeja', { params: { alcanceInstitucional } }).then(r => (Array.isArray(r.data) ? r.data : [])).catch(() => []),

    previewAudience: (payload: EmailAudiencePreviewPayloadDto): Promise<EmailAudiencePreviewResponseDto> =>
        api.post<EmailAudiencePreviewResponseDto>('/Admin/email-engine/audience/preview', payload).then(r => r.data),
};

export default emailService;

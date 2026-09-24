import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface EmailHistoryItemDto {
    idEmailLog?: number;
    destinatario: string;
    asunto: string;
    fechaEnvio: string;
    estado: string;
    errorDetalle?: string;
    idTemplate?: number;
    [key: string]: any;
}

export interface EmailTemplateDto {
    idEmailTemplate: number;
    nombre: string;
    asunto: string;
    cuerpoHtml: string;
    variablesDisponibles?: string;
    categoria?: string;
    activo: boolean;
    actualizadoEn?: string;
    [key: string]: any;
}

export interface SaveEmailTemplateDto {
    nombre: string;
    asunto: string;
    cuerpo_html: string;
    categoria?: string;
    activo?: boolean;
}

export interface SendEmailPayloadDto {
    recipients: string[];
    subject: string;
    body_html: string;
    template_id?: number;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Motor de Correos y Plantillas SMTP
// ─────────────────────────────────────────────────────────────

export const emailService = {
    /**
     * Obtiene el historial de envíos de correo despachados por el sistema.
     */
    getEmailHistory: (limit = 100): Promise<EmailHistoryItemDto[]> =>
        api.get<EmailHistoryItemDto[]>(`/Admin/email-engine/history?limit=${limit}`).then(r => r.data || []),

    /**
     * Obtiene el catálogo de plantillas institucionales de correo.
     */
    getTemplates: (): Promise<EmailTemplateDto[]> =>
        api.get<EmailTemplateDto[]>('/Admin/email-engine/templates').then(r => r.data || []),

    /**
     * Crea una nueva plantilla de correo institucional.
     */
    createTemplate: (payload: SaveEmailTemplateDto): Promise<EmailTemplateDto> =>
        api.post<EmailTemplateDto>('/Admin/email-engine/templates', payload).then(r => r.data),

    /**
     * Actualiza una plantilla de correo existente.
     */
    updateTemplate: (id: number, payload: SaveEmailTemplateDto): Promise<EmailTemplateDto> =>
        api.put<EmailTemplateDto>(`/Admin/email-engine/templates/${id}`, payload).then(r => r.data),

    /**
     * Elimina una plantilla de correo.
     */
    deleteTemplate: (id: number): Promise<void> =>
        api.delete(`/Admin/email-engine/templates/${id}`).then(() => undefined),

    /**
     * Despacha un correo electrónico a la lista de destinatarios configurada.
     */
    sendEmail: (payload: SendEmailPayloadDto): Promise<{ message: string; [key: string]: any }> =>
        api.post('/Admin/email-engine/send', payload).then(r => r.data),
};

export default emailService;

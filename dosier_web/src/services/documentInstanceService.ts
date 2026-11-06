import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO de Instancias Documentales
// ─────────────────────────────────────────────────────────────

export interface DocumentInstanceDto {
    uuid: string;
    entity_uuid?: string;
    entity_type?: string;
    template_code?: string;
    title?: string;
    version?: number;
    data_snapshot_json?: string | null;
    created_at?: string;
    updated_at?: string;
    is_signed?: boolean;
    final_pdf_path?: string | null;
    traceability_code?: string | null;
    [key: string]: any;
}

export interface ResolveInstanceParamsDto {
    templateCode: string;
    entityUuid: string;
    title?: string;
    entityType?: string;
    autoCreate?: boolean;
}

export const parseFilenameFromDisposition = (dispositionHeader?: string, fallback = 'documento.pdf'): string => {
    if (!dispositionHeader) return fallback;
    const utf8Match = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match && utf8Match[1]) {
        try {
            return decodeURIComponent(utf8Match[1].trim().replace(/^["']|["']$/g, ''));
        } catch { }
    }
    const standardMatch = dispositionHeader.match(/filename="?([^";]+)"?/i);
    if (standardMatch && standardMatch[1]) {
        return standardMatch[1].trim().replace(/^["']|["']$/g, '');
    }
    return fallback;
};

// ─────────────────────────────────────────────────────────────
//  Servicio de Instancias Documentales
// ─────────────────────────────────────────────────────────────

export const documentInstanceService = {
    /**
     * Obtiene la nómina de instancias documentales asociadas a una entidad curricular (PEA o Proyecto).
     */
    getByEntity: (entityUuid: string): Promise<DocumentInstanceDto[]> =>
        api.get<DocumentInstanceDto[]>(`/documents/instances/entity/${encodeURIComponent(entityUuid)}`)
            .then(r => r.data || [])
            .catch(() => []),

    /**
     * Obtiene la nómina de instancias documentales globales no vinculadas a una entidad específica.
     */
    getGlobal: (): Promise<DocumentInstanceDto[]> =>
        api.get<DocumentInstanceDto[]>('/documents/instances/global')
            .then(r => r.data || [])
            .catch(() => []),

    /**
     * Resuelve de forma dinámica la instancia documental asociada a una plantilla y entidad curricular.
     */
    resolve: (params: ResolveInstanceParamsDto): Promise<DocumentInstanceDto> =>
        api.get<DocumentInstanceDto>('/documents/instances/resolve', { params })
            .then(r => r.data),

    /**
     * Obtiene el expediente detallado de una instancia documental por su UUID.
     */
    getById: (instanceUuid: string): Promise<DocumentInstanceDto> =>
        api.get<DocumentInstanceDto>(`/documents/instances/${encodeURIComponent(instanceUuid)}`)
            .then(r => r.data),

    /**
     * Actualiza los metadatos o el snapshot JSON de una instancia documental.
     */
    updateMetadata: (instanceUuid: string, metadata: Record<string, any>): Promise<any> =>
        api.patch(`/documents/instances/${encodeURIComponent(instanceUuid)}/metadata`, metadata)
            .then(r => r.data),

    /**
     * Obtiene la configuración de UI e interfaz de una instancia documental activa.
     */
    getUiConfig: (instanceUuid: string): Promise<any> =>
        api.get(`/documents/instances/${encodeURIComponent(instanceUuid)}/ui-config`)
            .then(r => r.data)
            .catch(() => null),

    /**
     * Obtiene la configuración de UI por defecto de una plantilla de documento.
     */
    getTemplateUiConfig: (templateCode: string): Promise<any> =>
        api.get(`/documents/instances/templates/${encodeURIComponent(templateCode)}/ui-config`)
            .then(r => r.data)
            .catch(() => null),

    /**
     * Descarga un archivo binario desde el almacenamiento institucional.
     */
    getStorageFile: (cleanPath: string): Promise<Blob> =>
        api.get(`/storage/${cleanPath}`, { responseType: 'blob' })
            .then(r => new Blob([r.data], { type: 'application/pdf' })),

    /**
     * Actualiza la versión de plantilla de una instancia documental a la más reciente.
     */
    upgradeTemplate: (documentId: string): Promise<any> =>
        api.post(`/documents/instances/${encodeURIComponent(documentId)}/upgrade-template`)
            .then(r => r.data),

    /**
     * Crea manualmente una nueva instancia documental.
     */
     createInstance: (payload: any): Promise<any> =>
        api.post('/documents/instances', payload)
            .then(r => r.data),

    /**
     * Obtiene un catálogo dinámico a partir de una URL relativa o institucional.
     */
    getCatalogByUrl: (url: string): Promise<any[]> =>
        api.get(url).then(r => r.data || []),

    /**
     * Renderiza un PDF preliminar o definitivo de la plantilla en el motor documental.
     */
    renderDocumentPdf: (templateCode: string, formData: any, isDraft = true, isBlind = false): Promise<Blob> =>
        api.post(`/documents/render?templateCode=${encodeURIComponent(templateCode)}&isDraft=${isDraft}&isBlind=${isBlind}`, formData, { responseType: 'blob' })
            .then(r => new Blob([r.data], { type: 'application/pdf' })),

    /**
     * Renderiza un PDF preliminar o definitivo obteniendo también el nombre resuelto de archivo.
     */
    renderDocumentPdfWithFilename: async (templateCode: string, formData: any, isDraft = true, isBlind = false): Promise<{ blob: Blob; filename: string }> => {
        const response = await api.post(`/documents/render?templateCode=${encodeURIComponent(templateCode)}&isDraft=${isDraft}&isBlind=${isBlind}`, formData, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const filename = parseFilenameFromDisposition(response.headers?.['content-disposition'], `${templateCode}.pdf`);
        return { blob, filename };
    },

    /**
     * Obtiene el PDF firmado o consolidado de una instancia documental existente.
     */
    getInstancePdf: (instanceUuid: string): Promise<Blob> =>
        api.get(`/documents/instances/${encodeURIComponent(instanceUuid)}/pdf`, { responseType: 'blob' })
            .then(r => new Blob([r.data], { type: 'application/pdf' })),

    /**
     * Obtiene el PDF firmado o consolidado obteniendo también el nombre institucional resuelto.
     */
    getInstancePdfWithFilename: async (instanceUuid: string): Promise<{ blob: Blob; filename: string }> => {
        const response = await api.get(`/documents/instances/${encodeURIComponent(instanceUuid)}/pdf`, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const filename = parseFilenameFromDisposition(response.headers?.['content-disposition'], `documento_${instanceUuid}.pdf`);
        return { blob, filename };
    },

    /**
     * Retorna la URL de streaming directo para visores PDF e iframes con nombre amigable.
     */
    getInstancePdfUrl: (instanceUuid: string, filename?: string): string => {
        const baseUrl = api.defaults.baseURL || '/api';
        const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        if (filename) {
            return `${cleanBase}/documents/instances/${encodeURIComponent(instanceUuid)}/pdf/${encodeURIComponent(filename)}`;
        }
        return `${cleanBase}/documents/instances/${encodeURIComponent(instanceUuid)}/pdf`;
    },
};

export default documentInstanceService;

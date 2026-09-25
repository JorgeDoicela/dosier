import api from '../api/axios_config';
import type { DocumentTemplateDto } from '../pages/Admin/Templates/types';

export type { DocumentTemplateDto };

export interface GlobalThemeDto {
    themeConfigJson?: string | null;
    [key: string]: any;
}

export interface PublishTemplateDto {
    htmlContent: string;
    customCss?: string | null;
    collaborativeFieldsJson?: string | null;
    themeConfigJson?: string | null;
}

export interface TemplateUsageCountDto {
    count: number;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Gestión de Plantillas Documentales y Tema Global
// ─────────────────────────────────────────────────────────────

export const documentTemplateService = {
    /**
     * Obtiene el catálogo completo de plantillas documentales institucionales.
     */
    getTemplates: (): Promise<DocumentTemplateDto[]> =>
        api.get<DocumentTemplateDto[]>('/admin/templates').then(r => r.data || []),

    /**
     * Obtiene la configuración del tema visual institucional global.
     */
    getGlobalTheme: (): Promise<GlobalThemeDto> =>
        api.get<GlobalThemeDto>('/admin/templates/global-theme').then(r => r.data),

    /**
     * Actualiza la configuración del diseño visual institucional global.
     */
    updateGlobalTheme: (themeConfigJson: string): Promise<any> =>
        api.put('/admin/templates/global-theme', { themeConfigJson }).then(r => r.data),

    /**
     * Obtiene el detalle estructural completo de una plantilla por su código.
     */
    getTemplateByCode: (code: string): Promise<DocumentTemplateDto> =>
        api.get<DocumentTemplateDto>(`/admin/templates/${encodeURIComponent(code)}`).then(r => r.data),

    /**
     * Consulta el número de documentos activos creados a partir de esta plantilla.
     */
    getTemplateUsageCount: (code: string): Promise<TemplateUsageCountDto> =>
        api.get<TemplateUsageCountDto>(`/admin/templates/${encodeURIComponent(code)}/usage-count`).then(r => r.data),

    /**
     * Publica una nueva versión de la plantilla con su HTML generado y campos colaborativos.
     */
    publishTemplate: (code: string, payload: PublishTemplateDto): Promise<any> =>
        api.put(`/admin/templates/${encodeURIComponent(code)}`, payload).then(r => r.data),

    /**
     * Actualiza la configuración de firmas institucionales de una plantilla.
     */
    updateSignatureConfig: (code: string, payload: any): Promise<any> =>
        api.put(`/admin/templates/${encodeURIComponent(code)}/signature-config`, payload).then(r => r.data),

    /**
     * Restablece la estructura de la plantilla a sus bloques oficiales de fábrica.
     */
    resetToDefault: (code: string): Promise<any> =>
        api.post(`/admin/templates/${encodeURIComponent(code)}/reset-to-default`).then(r => r.data),

    /**
     * Guarda el orden de visualización institucional de las plantillas.
     */
    reorderTemplates: (codes: string[]): Promise<any> =>
        api.put('/admin/templates/order', { codes }).then(r => r.data),

    /**
     * Renderiza el PDF oficial de una plantilla con datos institucionales de muestra.
     */
    renderPdfBlob: (code: string, isDraft: boolean = false, download: boolean = false): Promise<Blob> =>
        api.get(`/admin/templates/${encodeURIComponent(code)}/render-pdf?isDraft=${isDraft}&download=${download}`, {
            responseType: 'blob'
        }).then(r => new Blob([r.data], { type: 'application/pdf' })),

    /**
     * Renderiza un PDF en caliente con el HTML, CSS y Tema visual editados en el diseñador.
     */
    renderCustomPdfBlob: (
        code: string,
        payload: {
            htmlContent?: string | null;
            customCss?: string | null;
            themeConfigJson?: string | null;
            sampleData?: any;
        },
        isDraft: boolean = false,
        download: boolean = false
    ): Promise<Blob> =>
        api.post(
            `/admin/templates/${encodeURIComponent(code)}/render-pdf?isDraft=${isDraft}&download=${download}`,
            payload,
            { responseType: 'blob' }
        ).then(r => new Blob([r.data], { type: 'application/pdf' })),
};

export default documentTemplateService;

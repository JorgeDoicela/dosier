import api from '../api/axios_config';
import {
    normalizeStructuredDraft,
    type PeaStructuredDraft,
    type PeaAiProvider
} from './peaAiService';

export interface ImportPeaDocumentOptions {
    customInstructions?: string;
    provider?: PeaAiProvider;
    model?: string;
    baseUrlOverride?: string;
    apiKeyOverride?: string;
    currentHorasCD?: number;
    currentHorasAPE?: number;
    currentHorasTA?: number;
    currentTotalHoras?: number;
}

/**
 * Servicio desacoplado para la extracción, lectura y mapeo estructurado de PEAs
 * preexistentes a partir de documentos digitales (.pdf y .docx).
 */
export const extractPeaFromDocument = async (
    peaUuid: string,
    file: File,
    options: ImportPeaDocumentOptions = {}
): Promise<PeaStructuredDraft> => {
    const formData = new FormData();
    formData.append('file', file);

    if (options.customInstructions?.trim()) {
        formData.append('custom_instructions', options.customInstructions.trim());
    }
    if (options.provider) {
        formData.append('provider', options.provider);
    }
    if (options.model?.trim()) {
        formData.append('model', options.model.trim());
    }
    if (options.baseUrlOverride?.trim()) {
        formData.append('base_url_override', options.baseUrlOverride.trim());
    }
    if (options.apiKeyOverride?.trim()) {
        formData.append('api_key_override', options.apiKeyOverride.trim());
    }
    if (typeof options.currentHorasCD === 'number') {
        formData.append('current_horas_cd', String(options.currentHorasCD));
    }
    if (typeof options.currentHorasAPE === 'number') {
        formData.append('current_horas_ape', String(options.currentHorasAPE));
    }
    if (typeof options.currentHorasTA === 'number') {
        formData.append('current_horas_ta', String(options.currentHorasTA));
    }
    if (typeof options.currentTotalHoras === 'number') {
        formData.append('current_total_horas', String(options.currentTotalHoras));
    }

    const res = await api.post(`/pea/uuid/${peaUuid}/importar-documento`, formData, {
        headers: { 'Content-Type': undefined },
        transformRequest: [(data, headers) => {
            if (data instanceof FormData) {
                delete headers['Content-Type'];
            }
            return data;
        }]
    });

    return normalizeStructuredDraft(res.data);
};


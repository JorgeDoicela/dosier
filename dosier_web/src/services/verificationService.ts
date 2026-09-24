import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface VerificationResultDto {
    valido: boolean;
    tipoDocumento?: string;
    templateCode?: string;
    tituloDocumento?: string;
    traceabilityCode?: string;
    docHash?: string;
    firmadoEn?: string;
    firmanteNombre?: string;
    firmanteRol?: string;
    carrera?: string;
    periodo?: string;
    fechaEmision?: string;
    estado?: string;
    metadata?: Record<string, any>;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Verificación Pública Forense y QR
// ─────────────────────────────────────────────────────────────

export const verificationService = {
    /**
     * Verifica la validez y autenticidad pública de un documento mediante su código de trazabilidad o firma.
     * @param code Código de trazabilidad o DFRM-* del documento.
     */
    verifyDocument: (code: string): Promise<VerificationResultDto> =>
        api.get(`/documents/verify/${encodeURIComponent(code.trim())}`).then(r => r.data),
};

export default verificationService;

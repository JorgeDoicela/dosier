import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface ConsentimientoDto {
    id_consentimiento: number;
    uuid?: string;
    id_usuario: number;
    nombre_usuario: string;
    version_politica: string;
    canal: string;
    fecha_consentimiento: string;
    fecha_registro?: string;
    ip_direccion?: string;
    ip_registro?: string;
    user_agent?: string;
    estado: string;
    revocado?: boolean;
    fecha_revocacion?: string;
}

export interface RegistrarConsentimientoDto {
    version_politica: string;
}

export interface TerminoVigenteDto {
    id_termino: number;
    version_termino: string;
    contenido?: string;
    fecha_publicacion?: string;
    es_vigente: boolean;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Cumplimiento LOPDP (SIGAFI Institucional)
// ─────────────────────────────────────────────────────────────

export const lopdpService = {
    /**
     * Obtiene el término y condiciones oficial vigente de SIGAFI (pd_terminos_condiciones).
     */
    getTerminoVigente: (): Promise<TerminoVigenteDto> =>
        api.get('/lopdp/termino-vigente').then(r => r.data),

    /**
     * Registra la aceptación formal de una política o consentimiento de firma electrónica en SIGAFI.
     */
    registrarConsentimiento: (versionPoliticaOrPayload: string | { version_politica: string; canal?: string }): Promise<{ message: string }> => {
        const payload = typeof versionPoliticaOrPayload === 'string'
            ? { version_politica: versionPoliticaOrPayload }
            : versionPoliticaOrPayload;
        return api.post('/lopdp/consentimiento', payload).then(r => r.data);
    },

    /**
     * Obtiene el historial administrativo de consentimientos otorgados.
     */
    getConsentimientos: (): Promise<ConsentimientoDto[]> =>
        api.get('/lopdp/consentimientos').then(r => r.data || []),

    /**
     * Obtiene el perfil de privacidad y estado de consentimiento del usuario autenticado.
     */
    getPerfil: (): Promise<any> =>
        api.get('/lopdp/perfil').then(r => r.data),

    /**
     * Revoca el consentimiento otorgado previamente bajo la normativa LOPDP.
     */
    revocarConsentimiento: (): Promise<{ message: string }> =>
        api.post('/lopdp/revocar').then(r => r.data),
};

export default lopdpService;

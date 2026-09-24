import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface ConsentimientoDto {
    id_consentimiento: number;
    id_usuario: number;
    nombre_usuario: string;
    version_politica: string;
    ip_registro?: string;
    user_agent?: string;
    canal: string;
    fecha_registro: string;
    revocado: boolean;
    fecha_revocacion?: string;
}

export interface RegistrarConsentimientoDto {
    version_politica: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Cumplimiento LOPDP
// ─────────────────────────────────────────────────────────────

export const lopdpService = {
    /**
     * Registra la aceptación formal de una política o consentimiento de firma electrónica.
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

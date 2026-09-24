import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface RecuperarContraseniaRequestDto {
    identificador: string;
    cedula?: string | null;
}

export interface RecuperarContraseniaResponseDto {
    message: string;
    requiresDisambiguation?: boolean;
    requires_disambiguation?: boolean;
}

export interface VerContraseniaResponseDto {
    valido: boolean;
    esHashInaccesible?: boolean;
    es_hash_inaccesible?: boolean;
    nombre?: string;
    password?: string;
    esRevisorExterno?: boolean;
    es_revisor_externo?: boolean;
    message?: string;
}

export interface RestablecerContraseniaRecuperacionDto {
    token: string;
    newPassword: string;
}

export interface RevertirContraseniaAlertaDto {
    token: string;
    newPassword: string;
}

export interface CambiarContraseniaDto {
    currentPassword: string;
    newPassword: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Autenticación y Credenciales
// ─────────────────────────────────────────────────────────────

export const authService = {
    /**
     * Solicita el envío de un enlace de recuperación de contraseña institucional.
     */
    recuperarContrasenia: (dto: RecuperarContraseniaRequestDto): Promise<RecuperarContraseniaResponseDto> =>
        api.post('/auth/recuperar-contrasenia', {
            identificador: dto.identificador,
            cedula: dto.cedula ?? null
        }).then(r => r.data),

    /**
     * Valida el token de recuperación y resuelve la contraseña o la necesidad de restablecimiento.
     */
    verContrasenia: (token: string): Promise<VerContraseniaResponseDto> =>
        api.post('/auth/ver-contrasenia', { token }).then(r => r.data),

    /**
     * Restablece la contraseña de acceso usando el token de recuperación.
     */
    restablecerContraseniaRecuperacion: (dto: RestablecerContraseniaRecuperacionDto): Promise<{ message: string }> =>
        api.post('/auth/restablecer-contrasenia-recuperacion', {
            token: dto.token,
            new_password: dto.newPassword
        }).then(r => r.data),

    /**
     * Restablece la contraseña de emergencia a partir del token de alerta de seguridad.
     */
    revertirContraseniaAlerta: (dto: RevertirContraseniaAlertaDto): Promise<{ message: string }> =>
        api.post('/auth/revertir-contrasenia-alerta', {
            token: dto.token,
            new_password: dto.newPassword
        }).then(r => r.data),

    /**
     * Permite cambiar la contraseña de un usuario autenticado en la sesión.
     */
    cambiarContrasenia: (dto: CambiarContraseniaDto): Promise<{ message: string }> =>
        api.post('/auth/cambiar-contrasenia', {
            current_password: dto.currentPassword,
            new_password: dto.newPassword
        }).then(r => r.data),

    /**
     * Obtiene los datos del perfil y roles del usuario autenticado en la sesión activa.
     */
    getMe: (): Promise<any> =>
        api.get('/auth/me').then(r => r.data),

    /**
     * Inicia sesión con credenciales tradicionales de usuario y contraseña.
     */
    login: (credentials: any): Promise<any> =>
        api.post('/auth/login', credentials).then(r => r.data),

    /**
     * Inicia sesión institucional federada mediante token de Microsoft Azure AD / Entra ID.
     */
    loginWithMicrosoft: (idToken: string): Promise<any> =>
        api.post('/auth/microsoft-login', { idToken }).then(r => r.data),

    /**
     * Inicia sesión con token de acceso rápido (Magic Link).
     */
    magicLogin: (token: string): Promise<{ auth: any; pin?: string }> =>
        api.post('/auth/magic-login', { token }).then(r => r.data),

    /**
     * Confirma la sesión mediante token de enlace mágico.
     */
    confirmMagicLogin: (token: string): Promise<void> =>
        api.post('/auth/magic-confirm', { token }).then(() => undefined),

    /**
     * Autentica la sesión mediante código PIN de transferencia entre dispositivos (Handoff).
     */
    handoffLogin: (pin: string): Promise<any> =>
        api.post('/auth/magic-handoff', { pin }).then(r => r.data),

    /**
     * Cierra la sesión activa en el servidor e invalida la cookie o estado.
     */
    logout: (): Promise<void> =>
        api.post('/auth/logout').then(() => undefined),

    /**
     * Reenvía un enlace mágico de autenticación.
     */
    magicResend: (email: string): Promise<any> =>
        api.post('/auth/magic-resend', { email }).then(r => r.data),
};

export default authService;

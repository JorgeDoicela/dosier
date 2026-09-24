import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import { authService } from '../authService';

vi.mock('../../api/axios_config', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('recuperarContrasenia', () => {
        it('debe enviar identificador y cedula nula cuando no se proporciona cedula', async () => {
            const mockResponse = { data: { message: 'Enlace enviado exitosamente.' } };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.recuperarContrasenia({
                identificador: 'docente@istpet.edu.ec'
            });

            expect(api.post).toHaveBeenCalledWith('/auth/recuperar-contrasenia', {
                identificador: 'docente@istpet.edu.ec',
                cedula: null
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('debe enviar la cedula cuando se requiere desambiguacion', async () => {
            const mockResponse = { data: { message: 'Enlace enviado.' } };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.recuperarContrasenia({
                identificador: 'docente@istpet.edu.ec',
                cedula: '1712345678'
            });

            expect(api.post).toHaveBeenCalledWith('/auth/recuperar-contrasenia', {
                identificador: 'docente@istpet.edu.ec',
                cedula: '1712345678'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('verContrasenia', () => {
        it('debe enviar el token de recuperacion al endpoint de verificacion', async () => {
            const mockResponse = {
                data: {
                    valido: true,
                    nombre: 'Ing. Docente',
                    password: 'password123'
                }
            };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.verContrasenia('token-recuperacion-abc');

            expect(api.post).toHaveBeenCalledWith('/auth/ver-contrasenia', {
                token: 'token-recuperacion-abc'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('restablecerContraseniaRecuperacion', () => {
        it('debe enviar el token y new_password formateados para el backend', async () => {
            const mockResponse = { data: { message: 'Contraseña restablecida con éxito.' } };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.restablecerContraseniaRecuperacion({
                token: 'tok-123',
                newPassword: 'NuevaPassword2026'
            });

            expect(api.post).toHaveBeenCalledWith('/auth/restablecer-contrasenia-recuperacion', {
                token: 'tok-123',
                new_password: 'NuevaPassword2026'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('revertirContraseniaAlerta', () => {
        it('debe enviar token y new_password al endpoint de alerta de seguridad', async () => {
            const mockResponse = { data: { message: 'Contraseña revertida.' } };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.revertirContraseniaAlerta({
                token: 'alert-tok-456',
                newPassword: 'SeguraPassword2026'
            });

            expect(api.post).toHaveBeenCalledWith('/auth/revertir-contrasenia-alerta', {
                token: 'alert-tok-456',
                new_password: 'SeguraPassword2026'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('cambiarContrasenia', () => {
        it('debe enviar current_password y new_password al endpoint de cambio de credenciales', async () => {
            const mockResponse = { data: { message: 'Contraseña actualizada.' } };
            (api.post as any).mockResolvedValueOnce(mockResponse);

            const result = await authService.cambiarContrasenia({
                currentPassword: 'ViejaPassword123',
                newPassword: 'NuevaPassword456'
            });

            expect(api.post).toHaveBeenCalledWith('/auth/cambiar-contrasenia', {
                current_password: 'ViejaPassword123',
                new_password: 'NuevaPassword456'
            });
            expect(result).toEqual(mockResponse.data);
        });
    });

    describe('sesión institucional', () => {
        it('getMe debe invocar /auth/me vía GET', async () => {
            const mockMe = { data: { id_referencia: '123', nombre_completo: 'Test User' } };
            (api.get as any).mockResolvedValueOnce(mockMe);

            const result = await authService.getMe();
            expect(api.get).toHaveBeenCalledWith('/auth/me');
            expect(result).toEqual(mockMe.data);
        });

        it('login debe invocar /auth/login vía POST con credenciales', async () => {
            const mockLoginRes = { data: { id_referencia: '123', roles: ['DOSIER_DOCENTE'] } };
            (api.post as any).mockResolvedValueOnce(mockLoginRes);

            const credentials = { usuario: 'docente', password: '123' };
            const result = await authService.login(credentials);
            expect(api.post).toHaveBeenCalledWith('/auth/login', credentials);
            expect(result).toEqual(mockLoginRes.data);
        });

        it('loginWithMicrosoft debe enviar el idToken a /auth/microsoft-login', async () => {
            const mockRes = { data: { id_referencia: 'ms-1' } };
            (api.post as any).mockResolvedValueOnce(mockRes);

            const result = await authService.loginWithMicrosoft('ms-jwt-token');
            expect(api.post).toHaveBeenCalledWith('/auth/microsoft-login', { idToken: 'ms-jwt-token' });
            expect(result).toEqual(mockRes.data);
        });

        it('magicLogin debe invocar /auth/magic-login con token', async () => {
            const mockRes = { data: { auth: { token: 'jwt' }, pin: '123456' } };
            (api.post as any).mockResolvedValueOnce(mockRes);

            const result = await authService.magicLogin('magic-tok');
            expect(api.post).toHaveBeenCalledWith('/auth/magic-login', { token: 'magic-tok' });
            expect(result).toEqual(mockRes.data);
        });

        it('confirmMagicLogin debe invocar /auth/magic-confirm con token', async () => {
            (api.post as any).mockResolvedValueOnce({ data: {} });

            await authService.confirmMagicLogin('magic-tok');
            expect(api.post).toHaveBeenCalledWith('/auth/magic-confirm', { token: 'magic-tok' });
        });

        it('handoffLogin debe invocar /auth/magic-handoff con pin', async () => {
            const mockRes = { data: { id_referencia: 'ho-1' } };
            (api.post as any).mockResolvedValueOnce(mockRes);

            const result = await authService.handoffLogin('987654');
            expect(api.post).toHaveBeenCalledWith('/auth/magic-handoff', { pin: '987654' });
            expect(result).toEqual(mockRes.data);
        });

        it('logout debe invocar /auth/logout vía POST', async () => {
            (api.post as any).mockResolvedValueOnce({ data: {} });

            await authService.logout();
            expect(api.post).toHaveBeenCalledWith('/auth/logout');
        });
    });
});

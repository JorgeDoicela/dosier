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
});

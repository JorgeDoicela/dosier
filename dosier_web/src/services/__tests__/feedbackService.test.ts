import { describe, it, expect, vi, afterEach } from 'vitest';
import { getFeedbackMediaUrl } from '../feedbackService';
import * as axiosConfig from '../../api/axios_config';

describe('getFeedbackMediaUrl', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('retorna cadena vacía si no hay url', () => {
        expect(getFeedbackMediaUrl(undefined)).toBe('');
        expect(getFeedbackMediaUrl('')).toBe('');
        expect(getFeedbackMediaUrl('   ')).toBe('');
    });

    it('preserva URLs absolutas, blob y data URLs', () => {
        expect(getFeedbackMediaUrl('https://cdn.ejemplo.com/img.png')).toBe('https://cdn.ejemplo.com/img.png');
        expect(getFeedbackMediaUrl('http://localhost:5185/api/feedback/attachments/202611/a.png')).toBe('http://localhost:5185/api/feedback/attachments/202611/a.png');
        expect(getFeedbackMediaUrl('blob:http://localhost:3010/123')).toBe('blob:http://localhost:3010/123');
        expect(getFeedbackMediaUrl('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA');
    });

    it('resuelve rutas /api/... en desarrollo local con proxy Vite (/api)', () => {
        vi.spyOn(axiosConfig, 'getApiBaseUrl').mockReturnValue('/api');
        vi.spyOn(axiosConfig, 'getApiRootUrl').mockReturnValue('');

        expect(getFeedbackMediaUrl('/api/feedback/attachments/202611/captura.png'))
            .toBe('/api/feedback/attachments/202611/captura.png');
        expect(getFeedbackMediaUrl('/uploads/feedback/202611/captura.png'))
            .toBe('/api/feedback/attachments/202611/captura.png');
    });

    it('resuelve rutas /api/... en producción IIS bajo /dosier (/apiDosier/api)', () => {
        vi.spyOn(axiosConfig, 'getApiBaseUrl').mockReturnValue('/apiDosier/api');
        vi.spyOn(axiosConfig, 'getApiRootUrl').mockReturnValue('/apiDosier');

        expect(getFeedbackMediaUrl('/api/feedback/attachments/202611/captura.png'))
            .toBe('/apiDosier/api/feedback/attachments/202611/captura.png');
        expect(getFeedbackMediaUrl('/uploads/feedback/202611/captura.png'))
            .toBe('/apiDosier/api/feedback/attachments/202611/captura.png');
    });

    it('resuelve rutas cuando VITE_API_BASE_URL apunta a otro host/puerto', () => {
        vi.spyOn(axiosConfig, 'getApiBaseUrl').mockReturnValue('http://localhost:5175/api');
        vi.spyOn(axiosConfig, 'getApiRootUrl').mockReturnValue('http://localhost:5175');

        expect(getFeedbackMediaUrl('/api/feedback/attachments/202611/captura.png'))
            .toBe('http://localhost:5175/api/feedback/attachments/202611/captura.png');
    });
});


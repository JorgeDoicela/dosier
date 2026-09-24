import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import { documentTemplateService } from '../documentTemplateService';

vi.mock('../../api/axios_config', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Sprint 4 Service Layer Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('documentTemplateService', () => {
        it('getTemplates debe consultar /admin/templates', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ code: 'PEA_OFICIAL', name: 'PEA' }] });
            const list = await documentTemplateService.getTemplates();
            expect(api.get).toHaveBeenCalledWith('/admin/templates');
            expect(list).toHaveLength(1);
        });

        it('getGlobalTheme debe consultar /admin/templates/global-theme', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { themeConfigJson: '{}' } });
            const theme = await documentTemplateService.getGlobalTheme();
            expect(api.get).toHaveBeenCalledWith('/admin/templates/global-theme');
            expect(theme.themeConfigJson).toBe('{}');
        });

        it('updateGlobalTheme debe enviar PUT a /admin/templates/global-theme', async () => {
            (api.put as any).mockResolvedValueOnce({ data: { success: true } });
            await documentTemplateService.updateGlobalTheme('{"brand":{}}');
            expect(api.put).toHaveBeenCalledWith('/admin/templates/global-theme', { themeConfigJson: '{"brand":{}}' });
        });

        it('getTemplateByCode debe consultar /admin/templates/:code', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { code: 'PEA_OFICIAL' } });
            const tmpl = await documentTemplateService.getTemplateByCode('PEA_OFICIAL');
            expect(api.get).toHaveBeenCalledWith('/admin/templates/PEA_OFICIAL');
            expect(tmpl.code).toBe('PEA_OFICIAL');
        });

        it('getTemplateUsageCount debe consultar /admin/templates/:code/usage-count', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { count: 5 } });
            const usage = await documentTemplateService.getTemplateUsageCount('PEA_OFICIAL');
            expect(api.get).toHaveBeenCalledWith('/admin/templates/PEA_OFICIAL/usage-count');
            expect(usage.count).toBe(5);
        });

        it('publishTemplate debe enviar PUT a /admin/templates/:code con payload', async () => {
            (api.put as any).mockResolvedValueOnce({ data: { success: true } });
            const payload = {
                htmlContent: '<html></html>',
                customCss: null,
                collaborativeFieldsJson: '[]',
                themeConfigJson: '{}'
            };
            await documentTemplateService.publishTemplate('PEA_OFICIAL', payload);
            expect(api.put).toHaveBeenCalledWith('/admin/templates/PEA_OFICIAL', payload);
        });

        it('resetToDefault debe enviar POST a /admin/templates/:code/reset-to-default', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { success: true } });
            await documentTemplateService.resetToDefault('PEA_OFICIAL');
            expect(api.post).toHaveBeenCalledWith('/admin/templates/PEA_OFICIAL/reset-to-default');
        });

        it('reorderTemplates debe enviar PUT a /admin/templates/order con codes', async () => {
            (api.put as any).mockResolvedValueOnce({ data: { success: true } });
            await documentTemplateService.reorderTemplates(['PEA_OFICIAL', 'RUBRICA_EVALUACION']);
            expect(api.put).toHaveBeenCalledWith('/admin/templates/order', {
                codes: ['PEA_OFICIAL', 'RUBRICA_EVALUACION']
            });
        });
    });
});

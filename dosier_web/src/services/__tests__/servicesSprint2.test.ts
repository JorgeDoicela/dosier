import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import { recycleBinService } from '../recycleBinService';
import { notificacionesService } from '../notificacionesService';
import { verificationService } from '../verificationService';
import { lopdpService } from '../lopdpService';
import { monitoreoService } from '../monitoreoService';
import { analyticsService } from '../analyticsService';

vi.mock('../../api/axios_config', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Sprint 2 Service Layer Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('recycleBinService', () => {
        it('getDeletedProjects debe consultar /recyclebin/projects', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'item-1', titulo: 'PEA Eliminado' }] });
            const result = await recycleBinService.getDeletedProjects();
            expect(api.get).toHaveBeenCalledWith('/recyclebin/projects');
            expect(result).toHaveLength(1);
        });

        it('restoreProject debe enviar POST a /recyclebin/restore/project/:uuid', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { message: 'Restaurado' } });
            const result = await recycleBinService.restoreProject('proj-123');
            expect(api.post).toHaveBeenCalledWith('/recyclebin/restore/project/proj-123');
            expect(result.message).toBe('Restaurado');
        });

        it('purgeProject debe enviar DELETE a /recyclebin/purge/project/:uuid', async () => {
            (api.delete as any).mockResolvedValueOnce({ data: { message: 'Purgado' } });
            const result = await recycleBinService.purgeProject('proj-123');
            expect(api.delete).toHaveBeenCalledWith('/recyclebin/purge/project/proj-123');
            expect(result.message).toBe('Purgado');
        });
    });

    describe('notificacionesService', () => {
        it('getMyNotifications debe enviar query limit si se define', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [] });
            await notificacionesService.getMyNotifications(0);
            expect(api.get).toHaveBeenCalledWith('/Admin/notifications/my?limit=0');
        });

        it('markAsRead debe enviar PATCH', async () => {
            (api.patch as any).mockResolvedValueOnce({ data: {} });
            await notificacionesService.markAsRead('notif-1');
            expect(api.patch).toHaveBeenCalledWith('/Admin/notifications/notif-1/read');
        });

        it('deleteNotification debe enviar DELETE', async () => {
            (api.delete as any).mockResolvedValueOnce({ data: {} });
            await notificacionesService.deleteNotification('notif-1');
            expect(api.delete).toHaveBeenCalledWith('/Admin/notifications/notif-1');
        });

        it('unsubscribeDevice debe enviar POST a /Admin/notifications/unsubscribe', async () => {
            (api.post as any).mockResolvedValueOnce({ data: {} });
            await notificacionesService.unsubscribeDevice('token-push-123');
            expect(api.post).toHaveBeenCalledWith('/Admin/notifications/unsubscribe', { device_token: 'token-push-123' });
        });
    });

    describe('verificationService', () => {
        it('verifyDocument debe consultar /documents/verify/:code con trim y encode', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { valido: true } });
            const result = await verificationService.verifyDocument('  DFRM-1234  ');
            expect(api.get).toHaveBeenCalledWith('/documents/verify/DFRM-1234');
            expect(result.valido).toBe(true);
        });
    });

    describe('lopdpService', () => {
        it('registrarConsentimiento debe enviar POST con version_politica', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { message: 'Registrado' } });
            const res = await lopdpService.registrarConsentimiento('LOPDP_GENERAL');
            expect(api.post).toHaveBeenCalledWith('/lopdp/consentimiento', { version_politica: 'LOPDP_GENERAL' });
            expect(res.message).toBe('Registrado');
        });

        it('getConsentimientos debe consultar /lopdp/consentimientos', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ id_consentimiento: 1 }] });
            const res = await lopdpService.getConsentimientos();
            expect(api.get).toHaveBeenCalledWith('/lopdp/consentimientos');
            expect(res).toHaveLength(1);
        });
    });

    describe('monitoreoService', () => {
        it('getProjectDetail debe consultar /pea/uuid/:uuid', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { uuid: 'proj-abc', nombre_asignatura: 'PEA Monitoreo', estado: 'Borrador' } });
            const res = await monitoreoService.getProjectDetail('proj-abc');
            expect(api.get).toHaveBeenCalledWith('/pea/uuid/proj-abc');
            expect(res.titulo).toBe('PEA Monitoreo');
        });
    });

    describe('analyticsService', () => {
        it('getProjects y getStats deben llamar a las rutas correctas', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'p1', nombre_asignatura: 'Matemática', estado: 'Borrador' }] });
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'p1', nombre_asignatura: 'Matemática', estado: 'Borrador' }] });
            (api.get as any).mockResolvedValueOnce({ data: [{ nombre: 'Software' }] });

            const p = await analyticsService.getProjects();
            const s = await analyticsService.getStats();
            const c = await analyticsService.getCarreras();

            expect(api.get).toHaveBeenCalledWith('/pea/bandeja');
            expect(api.get).toHaveBeenCalledWith('/catalogs/carreras');
            expect(p).toHaveLength(1);
            expect(s?.totalProyectos).toBe(1);
            expect(c).toHaveLength(1);
        });
    });
});

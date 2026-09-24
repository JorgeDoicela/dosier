import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import { collaborationService } from '../collaborationService';
import { authService } from '../authService';
import { lopdpService } from '../lopdpService';
import { documentTemplateService } from '../documentTemplateService';
import { curriculumProjectService } from '../curriculumProjectService';
import { documentInstanceService } from '../documentInstanceService';
import { monitoreoService } from '../monitoreoService';
import { notificacionesService } from '../notificacionesService';
import { signDocumentWithP12 } from '../signaturesService';
import { getEventosRango } from '../calendarioService';

vi.mock('../../api/axios_config', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Sprint 5 Service Layer Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('collaborationService', () => {
        it('getComments debe consultar /collaboration/comments/:uuid', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ id: 1, content: 'Observación técnica' }] });
            const list = await collaborationService.getComments('uuid-123');
            expect(api.get).toHaveBeenCalledWith('/collaboration/comments/uuid-123');
            expect(list).toHaveLength(1);
        });

        it('createComment debe enviar POST a /collaboration/comments', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { id: 2, content: 'Nuevo comentario' } });
            const res = await collaborationService.createComment({ content: 'Nuevo comentario' });
            expect(api.post).toHaveBeenCalledWith('/collaboration/comments', { content: 'Nuevo comentario' });
            expect(res.id).toBe(2);
        });

        it('updateComment debe enviar PUT a /collaboration/comments/:id', async () => {
            (api.put as any).mockResolvedValueOnce({ data: { id: 2, content: 'Modificado' } });
            const res = await collaborationService.updateComment(2, { content: 'Modificado' });
            expect(api.put).toHaveBeenCalledWith('/collaboration/comments/2', { content: 'Modificado' });
            expect(res.content).toBe('Modificado');
        });

        it('deleteComment debe enviar DELETE a /collaboration/comments/:id', async () => {
            (api.delete as any).mockResolvedValueOnce({ data: null });
            await collaborationService.deleteComment(2);
            expect(api.delete).toHaveBeenCalledWith('/collaboration/comments/2');
        });

        it('getPulse debe consultar /collaboration/:uuid/pulse', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { active_users: [] } });
            const pulse = await collaborationService.getPulse('uuid-123');
            expect(api.get).toHaveBeenCalledWith('/collaboration/uuid-123/pulse');
            expect(pulse.active_users).toEqual([]);
        });

        it('uploadFile debe enviar POST multipart a /collaboration/upload', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { url: 'https://storage/audio.webm' } });
            const form = new FormData();
            const res = await collaborationService.uploadFile(form);
            expect(api.post).toHaveBeenCalledWith('/collaboration/upload', form, expect.objectContaining({
                headers: { 'Content-Type': 'multipart/form-data' }
            }));
            expect(res.url).toBe('https://storage/audio.webm');
        });

        it('deleteImage debe enviar DELETE con url codificada a /collaboration/delete-image', async () => {
            (api.delete as any).mockResolvedValueOnce({ data: { success: true } });
            await collaborationService.deleteImage('/storage/img.png');
            expect(api.delete).toHaveBeenCalledWith('/collaboration/delete-image?url=%2Fstorage%2Fimg.png');
        });
    });

    describe('authService - extensions', () => {
        it('magicResend debe enviar POST a /auth/magic-resend con email', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { message: 'Enviado' } });
            const res = await authService.magicResend('usuario@istpet.edu.ec');
            expect(api.post).toHaveBeenCalledWith('/auth/magic-resend', { email: 'usuario@istpet.edu.ec' });
            expect(res.message).toBe('Enviado');
        });
    });

    describe('lopdpService - extensions', () => {
        it('getPerfil debe consultar /lopdp/perfil', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { cedula: '1723456789' } });
            const perfil = await lopdpService.getPerfil();
            expect(api.get).toHaveBeenCalledWith('/lopdp/perfil');
            expect(perfil.cedula).toBe('1723456789');
        });

        it('revocarConsentimiento debe enviar POST a /lopdp/revocar', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { status: 'Revocado' } });
            const res = await lopdpService.revocarConsentimiento();
            expect(api.post).toHaveBeenCalledWith('/lopdp/revocar');
            expect(res.status).toBe('Revocado');
        });
    });

    describe('documentTemplateService - extensions', () => {
        it('updateSignatureConfig debe enviar PUT a /admin/templates/:code/signature-config', async () => {
            (api.put as any).mockResolvedValueOnce({ data: { success: true } });
            await documentTemplateService.updateSignatureConfig('PEA_OFICIAL', '{"slots":[]}');
            expect(api.put).toHaveBeenCalledWith('/admin/templates/PEA_OFICIAL/signature-config', '{"slots":[]}');
        });
    });

    describe('curriculumProjectService - extensions', () => {
        it('getAllProjects debe consultar /pea/bandeja', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'p1', nombre_asignatura: 'Matemática' }] });
            const list = await curriculumProjectService.getAllProjects();
            expect(api.get).toHaveBeenCalledWith('/pea/bandeja');
            expect(list).toHaveLength(1);
        });

        it('getMyProjects debe consultar /docente-asignaturas/mis-materias', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ id_asignacion: 1, uuid_pea: 'p2', nombre_asignatura: 'Física' }] });
            const list = await curriculumProjectService.getMyProjects();
            expect(api.get).toHaveBeenCalledWith('/docente-asignaturas/mis-materias');
            expect(list).toHaveLength(1);
        });

        it('deleteProject debe enviar DELETE a /documents/instances/:uuid', async () => {
            (api.delete as any).mockResolvedValueOnce({ data: { success: true } });
            await curriculumProjectService.deleteProject('p1');
            expect(api.delete).toHaveBeenCalledWith('/documents/instances/p1');
        });

        it('getConvocatorias debe consultar /docente-asignaturas/periodos', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
            const list = await curriculumProjectService.getConvocatorias();
            expect(api.get).toHaveBeenCalledWith('/docente-asignaturas/periodos');
            expect(list).toHaveLength(1);
        });

        it('searchGroups debe resolver lista', async () => {
            const list = await curriculumProjectService.searchGroups('IA');
            expect(Array.isArray(list)).toBe(true);
        });
    });

    describe('documentInstanceService - extensions', () => {
        it('getUiConfig debe consultar /documents/instances/:uuid/ui-config', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { sections: [] } });
            const config = await documentInstanceService.getUiConfig('inst-1');
            expect(api.get).toHaveBeenCalledWith('/documents/instances/inst-1/ui-config');
            expect(config.sections).toEqual([]);
        });

        it('getTemplateUiConfig debe consultar /documents/instances/templates/:code/ui-config', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { blocks: [] } });
            const config = await documentInstanceService.getTemplateUiConfig('PEA_OFICIAL');
            expect(api.get).toHaveBeenCalledWith('/documents/instances/templates/PEA_OFICIAL/ui-config');
            expect(config.blocks).toEqual([]);
        });

        it('upgradeTemplate debe enviar POST a /documents/instances/:id/upgrade-template', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { upgraded: true } });
            const res = await documentInstanceService.upgradeTemplate('inst-1');
            expect(api.post).toHaveBeenCalledWith('/documents/instances/inst-1/upgrade-template');
            expect(res.upgraded).toBe(true);
        });

        it('createInstance debe enviar POST a /documents/instances', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { uuid: 'inst-new' } });
            const res = await documentInstanceService.createInstance({ templateCode: 'PEA' });
            expect(api.post).toHaveBeenCalledWith('/documents/instances', { templateCode: 'PEA' });
            expect(res.uuid).toBe('inst-new');
        });

        it('getGlobal debe consultar /documents/instances/global', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'g1' }] });
            const res = await documentInstanceService.getGlobal();
            expect(api.get).toHaveBeenCalledWith('/documents/instances/global');
            expect(res).toHaveLength(1);
        });

        it('getCatalogByUrl debe consultar la url especificada', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ id: 1 }] });
            const res = await documentInstanceService.getCatalogByUrl('/catalogs/custom');
            expect(api.get).toHaveBeenCalledWith('/catalogs/custom');
            expect(res).toHaveLength(1);
        });
    });

    describe('monitoreoService - ping', () => {
        it('ping debe consultar /ping con opciones', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { status: 'pong' } });
            const res = await monitoreoService.ping({ timeout: 3500 });
            expect(api.get).toHaveBeenCalledWith('/ping', { timeout: 3500 });
            expect(res.status).toBe('pong');
        });
    });

    describe('notificacionesService - subscribeDevice', () => {
        it('subscribeDevice debe enviar POST a /Admin/notifications/subscribe', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { success: true } });
            await notificacionesService.subscribeDevice({ device_token: 'token123', plataforma: 'web_push' });
            expect(api.post).toHaveBeenCalledWith('/Admin/notifications/subscribe', { device_token: 'token123', plataforma: 'web_push' });
        });
    });

    describe('signaturesService - signDocumentWithP12', () => {
        it('signDocumentWithP12 debe enviar POST a /signatures/sign-p12', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { signed: true } });
            const form = new FormData();
            const res = await signDocumentWithP12(form);
            expect(api.post).toHaveBeenCalledWith('/signatures/sign-p12', form, expect.any(Object));
            expect(res.signed).toBe(true);
        });
    });

    describe('calendarioService - getEventosRango', () => {
        it('getEventosRango debe consultar /calendario/eventos con params de rango', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'ev1' }] });
            const res = await getEventosRango('2026-09-01', '2026-09-07');
            expect(api.get).toHaveBeenCalledWith('/calendario/eventos', {
                params: { desde: '2026-09-01', hasta: '2026-09-07' }
            });
            expect(res).toHaveLength(1);
        });
    });
});

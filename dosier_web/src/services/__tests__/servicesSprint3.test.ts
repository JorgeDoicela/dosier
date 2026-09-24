import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../api/axios_config';
import { usersService } from '../usersService';
import { auditService } from '../auditService';
import { emailService } from '../emailService';
import { configuracionService } from '../configuracionService';
import { documentMaintenanceService } from '../documentMaintenanceService';
import { documentInstanceService } from '../documentInstanceService';
import { curriculumProjectService } from '../curriculumProjectService';

vi.mock('../../api/axios_config', () => ({
    default: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn()
    }
}));

describe('Sprint 3 Service Layer Tests', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('usersService', () => {
        it('getUsers debe consultar /Admin/users con query params', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { items: [], total_count: 0 } });
            await usersService.getUsers('type=DOCENTE&pageSize=10');
            expect(api.get).toHaveBeenCalledWith('/Admin/users?type=DOCENTE&pageSize=10');
        });

        it('getUserByUuid debe consultar /Admin/users/:uuid?type=:type', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { id_profesor: '1712345678' } });
            const user = await usersService.getUserByUuid('1712345678', 'DOCENTE');
            expect(api.get).toHaveBeenCalledWith('/Admin/users/1712345678?type=DOCENTE');
            expect(user.id_profesor).toBe('1712345678');
        });

        it('assignRole debe enviar POST a /Admin/roles/assign', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { message: 'Asignado' } });
            const res = await usersService.assignRole({ id_usuario: 'user-1', role_code: 'DOSIER_DOCENTE', user_type: 'DOCENTE' });
            expect(api.post).toHaveBeenCalledWith('/Admin/roles/assign', expect.any(Object));
            expect(res.message).toBe('Asignado');
        });
    });

    describe('auditService', () => {
        it('getAuditLogs debe invocar /Admin/audit/advanced con query params', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { items: [], total_count: 0 } });
            await auditService.getAuditLogs('page=1&pageSize=20');
            expect(api.get).toHaveBeenCalledWith('/Admin/audit/advanced?page=1&pageSize=20');
        });
    });

    describe('emailService', () => {
        it('getEmailHistory debe consultar /Admin/email-engine/history', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [] });
            await emailService.getEmailHistory(50);
            expect(api.get).toHaveBeenCalledWith('/Admin/email-engine/history?limit=50');
        });

        it('sendEmail debe enviar POST a /Admin/email-engine/send', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { message: 'Enviado' } });
            const res = await emailService.sendEmail({ recipients: ['docente@istpet.edu.ec'], subject: 'Aviso', body_html: '<p>Mensaje</p>' });
            expect(api.post).toHaveBeenCalledWith('/Admin/email-engine/send', expect.any(Object));
            expect(res.message).toBe('Enviado');
        });
    });

    describe('configuracionService', () => {
        it('getPeriodos debe consultar /catalogs/periodos', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ idPeriodo: '2026-A' }] });
            const periodos = await configuracionService.getPeriodos();
            expect(api.get).toHaveBeenCalledWith('/catalogs/periodos');
            expect(periodos).toHaveLength(1);
        });

        it('getEventosNormativos debe consultar /calendario/normativos', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [] });
            await configuracionService.getEventosNormativos();
            expect(api.get).toHaveBeenCalledWith('/calendario/normativos');
        });
    });

    describe('documentMaintenanceService', () => {
        it('getDiagnosis debe consultar /documents/instances/maintenance/diagnose', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [] });
            await documentMaintenanceService.getDiagnosis();
            expect(api.get).toHaveBeenCalledWith('/documents/instances/maintenance/diagnose');
        });

        it('purgeSingle debe enviar POST a /documents/instances/maintenance/purge/:uuid', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { success: true } });
            await documentMaintenanceService.purgeSingle('doc-uuid-1');
            expect(api.post).toHaveBeenCalledWith('/documents/instances/maintenance/purge/doc-uuid-1');
        });

        it('purgeAll debe enviar POST a /documents/instances/maintenance/purge-all', async () => {
            (api.post as any).mockResolvedValueOnce({ data: { count: 3 } });
            const res = await documentMaintenanceService.purgeAll();
            expect(api.post).toHaveBeenCalledWith('/documents/instances/maintenance/purge-all');
            expect(res.count).toBe(3);
        });
    });

    describe('documentInstanceService', () => {
        it('getByEntity debe consultar /documents/instances/entity/:uuid', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ uuid: 'inst-1' }] });
            const list = await documentInstanceService.getByEntity('ent-123');
            expect(api.get).toHaveBeenCalledWith('/documents/instances/entity/ent-123');
            expect(list).toHaveLength(1);
        });

        it('resolve debe consultar /documents/instances/resolve con params', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { uuid: 'inst-pea' } });
            const res = await documentInstanceService.resolve({ templateCode: 'PEA_OFICIAL', entityUuid: 'pea-123' });
            expect(api.get).toHaveBeenCalledWith('/documents/instances/resolve', {
                params: { templateCode: 'PEA_OFICIAL', entityUuid: 'pea-123' }
            });
            expect(res.uuid).toBe('inst-pea');
        });

        it('updateMetadata debe enviar PATCH a /documents/instances/:uuid/metadata', async () => {
            (api.patch as any).mockResolvedValueOnce({ data: { success: true } });
            await documentInstanceService.updateMetadata('inst-123', { Titulo: 'Nuevo Titulo' });
            expect(api.patch).toHaveBeenCalledWith('/documents/instances/inst-123/metadata', { Titulo: 'Nuevo Titulo' });
        });
    });

    describe('curriculumProjectService', () => {
        it('getProjectDetail con PEA debe consultar /pea/uuid/:uuid', async () => {
            (api.get as any).mockResolvedValueOnce({ data: { uuid: 'pea-1' } });
            await curriculumProjectService.getProjectDetail('pea-1', true);
            expect(api.get).toHaveBeenCalledWith('/pea/uuid/pea-1');
        });

        it('getProjectDetail con documento general debe consultar /documents/instances/:uuid ante fallback', async () => {
            (api.get as any).mockRejectedValueOnce(new Error('No es PEA'));
            (api.get as any).mockResolvedValueOnce({ data: { uuid: 'inst-1', title: 'Guía de Práctica' } });
            const result = await curriculumProjectService.getProjectDetail('inst-1');
            expect(api.get).toHaveBeenCalledWith('/pea/uuid/inst-1');
            expect(api.get).toHaveBeenCalledWith('/documents/instances/inst-1');
            expect(result.title).toBe('Guía de Práctica');
        });

        it('transitionState debe enviar PATCH a /pea/:uuid/estado', async () => {
            (api.patch as any) = vi.fn().mockResolvedValueOnce({ data: { success: true } });
            await curriculumProjectService.transitionState('proj-1', 'Aprobado', 'Revisión exitosa');
            expect(api.patch).toHaveBeenCalledWith('/pea/proj-1/estado', {
                nuevo_estado: 'Aprobado',
                motivo: 'Revisión exitosa'
            });
        });

        it('getTraceability debe consultar /pea/:uuid/trazabilidad', async () => {
            (api.get as any).mockResolvedValueOnce({ data: [{ fase: 'Elaboracion', estado: 'Borrador' }] });
            const res = await curriculumProjectService.getTraceability('proj-1');
            expect(api.get).toHaveBeenCalledWith('/pea/proj-1/trazabilidad');
            expect(res).toHaveLength(1);
        });
    });
});

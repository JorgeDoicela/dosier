import { describe, it, expect } from 'vitest';
import {
    normalizePeaStatus,
    resolveRoleKey,
    isPeaBorrador,
    isPeaEnRevision,
    isPeaAvalado,
    isPeaLegalizado,
    isPeaPropio,
    isPeaPendienteParaRol,
    isPeaAprobadoParaRol,
    isPeaRezagado,
    getPeaNavegacion,
    getPeaMetricsForRole,
    filterPeasByWorkflowTab,
    getPeaStatusDescriptor,
    formatModalidad
} from '../peaStatusWorkflow';

describe('Dominio Curricular: Reglas de Negocio Centrales del PEA (ISTPET)', () => {
    describe('resolveRoleKey — Resolución canónica de rol', () => {
        it('resuelve correctamente a partir de strings y códigos RBAC', () => {
            expect(resolveRoleKey('DOSIER_ADMIN')).toBe('DOSIER_ADMIN');
            expect(resolveRoleKey('admin')).toBe('DOSIER_ADMIN');
            expect(resolveRoleKey('DOSIER_VICERRECTOR')).toBe('DOSIER_VICERRECTOR');
            expect(resolveRoleKey('DOSIER_COORD_ACAD')).toBe('DOSIER_COORD_ACAD');
            expect(resolveRoleKey('DOSIER_COORD_CARRERA')).toBe('DOSIER_COORD_CARRERA');
            expect(resolveRoleKey('DOSIER_DOCENTE')).toBe('DOSIER_DOCENTE');
            expect(resolveRoleKey(null)).toBe('DOSIER_DOCENTE');
        });

        it('resuelve correctamente a partir del objeto de flags useAuth()', () => {
            expect(resolveRoleKey({ isAdmin: true })).toBe('DOSIER_ADMIN');
            expect(resolveRoleKey({ isVicerrector: true })).toBe('DOSIER_VICERRECTOR');
            expect(resolveRoleKey({ isCoordAcad: true })).toBe('DOSIER_COORD_ACAD');
            expect(resolveRoleKey({ isCoordCarrera: true })).toBe('DOSIER_COORD_CARRERA');
            expect(resolveRoleKey({ isDocente: true })).toBe('DOSIER_DOCENTE');
        });
    });

    describe('normalizePeaStatus — Normalización de estados', () => {
        it('normaliza strings con espacios o variaciones', () => {
            expect(normalizePeaStatus('en_revision')).toBe('EnRevision');
            expect(normalizePeaStatus('EN REVISION')).toBe('EnRevision');
            expect(normalizePeaStatus('revisado_coord')).toBe('RevisadoCoord');
            expect(normalizePeaStatus('revisado_acad')).toBe('RevisadoAcad');
            expect(normalizePeaStatus('aprobado')).toBe('Aprobado');
            expect(normalizePeaStatus('publicado')).toBe('Publicado');
            expect(normalizePeaStatus('no_iniciado')).toBe('NoIniciado');
            expect(normalizePeaStatus('')).toBe('Borrador');
            expect(normalizePeaStatus(undefined)).toBe('Borrador');
        });
    });

    describe('isPeaPropio — Regla unificada de autoría docente', () => {
        const user = {
            id_sigafi: '1720477031',
            nombre_completo: 'Carlos Enrique Valencia Llerena'
        };

        it('identifica autoría por id_sigafi', () => {
            const pea = { id_docente_elaborador: '1720477031', nombre_docente_elaborador: 'Otro Nombre' };
            expect(isPeaPropio(pea, user)).toBe(true);
        });

        it('identifica autoría por nombre completo si no coincide id', () => {
            const pea = { id_docente_elaborador: '9999999999', nombre_docente_elaborador: 'carlos enrique valencia llerena' };
            expect(isPeaPropio(pea, user)).toBe(true);
        });

        it('retorna false si no coincide ni id ni nombre', () => {
            const pea = { id_docente_elaborador: '1752531192', nombre_docente_elaborador: 'Christian Castro' };
            expect(isPeaPropio(pea, user)).toBe(false);
        });
    });

    describe('isPeaPendienteParaRol — Regla de pendientes según rol', () => {
        it('Coordinación Académica solo tiene pendiente RevisadoCoord', () => {
            expect(isPeaPendienteParaRol('RevisadoCoord', 'DOSIER_COORD_ACAD')).toBe(true);
            expect(isPeaPendienteParaRol('EnRevision', 'DOSIER_COORD_ACAD')).toBe(false);
            expect(isPeaPendienteParaRol('RevisadoAcad', 'DOSIER_COORD_ACAD')).toBe(false);
            expect(isPeaPendienteParaRol('Borrador', 'DOSIER_COORD_ACAD')).toBe(false);
        });

        it('Vicerrectorado solo tiene pendiente RevisadoAcad', () => {
            expect(isPeaPendienteParaRol('RevisadoAcad', 'DOSIER_VICERRECTOR')).toBe(true);
            expect(isPeaPendienteParaRol('RevisadoCoord', 'DOSIER_VICERRECTOR')).toBe(false);
            expect(isPeaPendienteParaRol('Aprobado', 'DOSIER_VICERRECTOR')).toBe(false);
        });

        it('Coordinación de Carrera tiene pendiente EnRevision, Observado y Corregido', () => {
            expect(isPeaPendienteParaRol('EnRevision', 'DOSIER_COORD_CARRERA')).toBe(true);
            expect(isPeaPendienteParaRol('Observado', 'DOSIER_COORD_CARRERA')).toBe(true);
            expect(isPeaPendienteParaRol('Corregido', 'DOSIER_COORD_CARRERA')).toBe(true);
            expect(isPeaPendienteParaRol('RevisadoCoord', 'DOSIER_COORD_CARRERA')).toBe(false);
            expect(isPeaPendienteParaRol('Borrador', 'DOSIER_COORD_CARRERA')).toBe(false);
        });

        it('Docente tiene pendiente Borrador, NoIniciado y Observado', () => {
            expect(isPeaPendienteParaRol('Borrador', 'DOSIER_DOCENTE')).toBe(true);
            expect(isPeaPendienteParaRol('NoIniciado', 'DOSIER_DOCENTE')).toBe(true);
            expect(isPeaPendienteParaRol('Observado', 'DOSIER_DOCENTE')).toBe(true);
            expect(isPeaPendienteParaRol('EnRevision', 'DOSIER_DOCENTE')).toBe(false);
        });

        it('Admin tiene pendiente cualquier etapa activa de revisión', () => {
            expect(isPeaPendienteParaRol('EnRevision', 'DOSIER_ADMIN')).toBe(true);
            expect(isPeaPendienteParaRol('RevisadoCoord', 'DOSIER_ADMIN')).toBe(true);
            expect(isPeaPendienteParaRol('RevisadoAcad', 'DOSIER_ADMIN')).toBe(true);
            expect(isPeaPendienteParaRol('Aprobado', 'DOSIER_ADMIN')).toBe(false);
        });
    });

    describe('isPeaAprobadoParaRol — Regla de aprobados según rol', () => {
        it('para Coordinación Académica, RevisadoCoord NO es aprobado', () => {
            expect(isPeaAprobadoParaRol('RevisadoCoord', 'DOSIER_COORD_ACAD')).toBe(false);
            expect(isPeaAprobadoParaRol('RevisadoAcad', 'DOSIER_COORD_ACAD')).toBe(true);
            expect(isPeaAprobadoParaRol('Aprobado', 'DOSIER_COORD_ACAD')).toBe(true);
        });

        it('para Carrera, RevisadoCoord SI es aprobado (ya dictaminó)', () => {
            expect(isPeaAprobadoParaRol('RevisadoCoord', 'DOSIER_COORD_CARRERA')).toBe(true);
            expect(isPeaAprobadoParaRol('EnRevision', 'DOSIER_COORD_CARRERA')).toBe(false);
        });

        it('para Vicerrectorado y Admin, solo Aprobado o Publicado', () => {
            expect(isPeaAprobadoParaRol('RevisadoAcad', 'DOSIER_VICERRECTOR')).toBe(false);
            expect(isPeaAprobadoParaRol('Aprobado', 'DOSIER_VICERRECTOR')).toBe(true);
            expect(isPeaAprobadoParaRol('Publicado', 'DOSIER_VICERRECTOR')).toBe(true);
        });
    });

    describe('getPeaNavegacion — Enrutamiento y acción institucional', () => {
        const user = { id_sigafi: '1720477031', nombre_completo: 'Carlos Valencia' };

        it('enruta a editor workspace si la asignatura es propia', () => {
            const peaPropio = {
                uuid: 'uuid-123',
                estado: 'Borrador',
                id_docente_elaborador: '1720477031'
            };
            const nav = getPeaNavegacion(peaPropio, user, 'DOSIER_DOCENTE');
            expect(nav.esEdicionPropia).toBe(true);
            expect(nav.url).toBe('/documentacion/mis-proyectos/workspace/pea-oficial/uuid-123?edit=pea-oficial');
            expect(nav.actionLabel).toBe('Continuar PEA');
        });

        it('enruta a mesa de revisión si es supervisor revisando materia de terceros', () => {
            const peaTercero = {
                uuid: 'uuid-456',
                estado: 'RevisadoCoord',
                id_docente_elaborador: '0604114280'
            };
            const nav = getPeaNavegacion(peaTercero, user, 'DOSIER_COORD_ACAD');
            expect(nav.esEdicionPropia).toBe(false);
            expect(nav.url).toBe('/documentacion/revision-tecnica/uuid-456');
            expect(nav.actionLabel).toBe('Aprobación Académica');
        });
    });

    describe('getPeaMetricsForRole — Consistencia matemática entre vistas', () => {
        const peas = [
            { id_pea: 1, estado: 'RevisadoCoord', id_docente_elaborador: '1720477031', firma_docente: 'firma' },
            { id_pea: 2, estado: 'Borrador', id_docente_elaborador: '1752531192', firma_docente: null },
            { id_pea: 3, estado: 'Borrador', id_docente_elaborador: '1752531192', firma_docente: null },
            { id_pea: 4, estado: 'Aprobado', id_docente_elaborador: '0604114280', firma_docente: 'firma' },
        ];
        const userCastro = { id_sigafi: '1752531192', nombre_completo: 'Christian Castro' };

        it('calcula métricas exactas para Coordinación Académica', () => {
            const metrics = getPeaMetricsForRole(peas, 'DOSIER_COORD_ACAD', userCastro);
            expect(metrics.total).toBe(4);
            expect(metrics.pendientes).toBe(1); // RevisadoCoord
            expect(metrics.aprobados).toBe(1); // Aprobado
            expect(metrics.enElaboracion).toBe(2); // Los 2 borradores
            expect(metrics.misMateriasCount).toBe(2); // Las 2 de Castro
            expect(metrics.misPendientesCount).toBe(2);
            expect(metrics.rezagadosCount).toBe(2);
        });
    });
});


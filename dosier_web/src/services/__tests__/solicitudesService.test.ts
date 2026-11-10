import { describe, it, expect } from 'vitest';
import { solicitudesService, CATALOGO_TRAMITES_OFICIALES } from '../solicitudesService';

describe('solicitudesService — Gestión de Trámites y Roles Curriculares', () => {
    it('el administrador tiene acceso a todos los trámites oficiales', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_ADMIN'], true);
        expect(tramites.length).toBe(CATALOGO_TRAMITES_OFICIALES.length);
    });

    it('el docente tiene acceso al buzón de incidencias curriculares', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_DOCENTE'], false);
        const ids = tramites.map(t => t.id);
        expect(ids).toContain('incidencia_curricular');
    });

    it('la coordinación de carrera tiene acceso al buzón de incidencias curriculares', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_COORD_CARRERA'], false);
        const ids = tramites.map(t => t.id);
        expect(ids).toContain('incidencia_curricular');
    });

    it('la coordinación académica tiene acceso al buzón de incidencias curriculares', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_COORD_ACAD'], false);
        const ids = tramites.map(t => t.id);
        expect(ids).toContain('incidencia_curricular');
    });

    it('el vicerrectorado académico tiene acceso al buzón de incidencias curriculares', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_VICERRECTOR'], false);
        const ids = tramites.map(t => t.id);
        expect(ids).toContain('incidencia_curricular');
    });

    it('usuarios sin roles curriculares no tienen acceso a trámites restringidos', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['ROL_INEXISTENTE'], false);
        expect(tramites.length).toBe(0);
    });
});

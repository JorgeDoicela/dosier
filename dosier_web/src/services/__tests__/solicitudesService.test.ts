import { describe, it, expect } from 'vitest';
import { solicitudesService, CATALOGO_TRAMITES_OFICIALES } from '../solicitudesService';

describe('solicitudesService — Gestión de Trámites y Roles Curriculares', () => {
    it('el administrador tiene acceso a todos los trámites oficiales', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_ADMIN'], true);
        expect(tramites.length).toBe(CATALOGO_TRAMITES_OFICIALES.length);
    });

    it('el docente solo tiene acceso a trámites pertinentes a docencia (prórroga, clonación, buzón)', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_DOCENTE'], false);
        const ids = tramites.map(t => t.id);

        expect(ids).toContain('prorroga_docente');
        expect(ids).toContain('clonacion_docente');
        expect(ids).toContain('incidencia_docente');
        expect(ids).not.toContain('apertura_convocatoria');
        expect(ids).not.toContain('excepcion_normativa');
    });

    it('la coordinación de carrera tiene trámites de concesión, recordatorios y buzón', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_COORD_CARRERA'], false);
        const ids = tramites.map(t => t.id);

        expect(ids).toContain('prorroga_coordinacion');
        expect(ids).toContain('recordatorio_docentes');
        expect(ids).toContain('incidencia_docente');
    });

    it('la coordinación académica tiene trámites de concesión, recordatorios, apertura y soporte', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_COORD_ACAD'], false);
        const ids = tramites.map(t => t.id);

        expect(ids).toContain('prorroga_coordinacion');
        expect(ids).toContain('apertura_convocatoria');
        expect(ids).toContain('recordatorio_docentes');
    });

    it('el vicerrectorado académico tiene acceso a excepciones normativas y apertura', () => {
        const tramites = solicitudesService.getTramitesPorRoles(['DOSIER_VICERRECTOR'], false);
        const ids = tramites.map(t => t.id);

        expect(ids).toContain('excepcion_normativa');
        expect(ids).toContain('apertura_convocatoria');
    });

    it('retorna el historial de solicitudes institucionales correctamente', async () => {
        const historial = await solicitudesService.getHistorialSolicitudes();
        expect(historial).toBeInstanceOf(Array);
        expect(historial.length).toBeGreaterThan(0);
        expect(historial[0]).toHaveProperty('codigo');
        expect(historial[0]).toHaveProperty('estado');
    });
});

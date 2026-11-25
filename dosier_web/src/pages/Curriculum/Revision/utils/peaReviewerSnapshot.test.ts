import { describe, it, expect } from 'vitest';
import {
    normalizeClientSectionKey,
    buildReviewerSnapshotPayload,
    isObservationAlreadyRegistered,
    getPendingSectionObservationCount
} from './peaReviewerSnapshot';
import type { ProjectDetail, SectionComment } from '../types/revisionTecnicaTypes';

const baseProject: ProjectDetail = {
    uuid: 'pea-uuid-1',
    title: 'SGBD II',
    status: 'EnRevision',
    presupuesto: 0,
    convocatoriaMontoMaximo: null,
    convocatoria: '',
    linea: '',
    carrera: 'DESARROLLO DE SOFTWARE',
    dominio: 'Unidad Profesional',
    descripcion: '',
    directorProyecto: '',
    creditos: 3,
    horas_totales: 144,
    horas_docencia: 32,
    horas_practica: 56,
    horas_autonomo: 56
};

describe('peaReviewerSnapshot', () => {
    it('normaliza correctamente RecursosDidacticos a MetodologiaEnsenanza y pea_resources_section a ActividadesPracticas', () => {
        expect(normalizeClientSectionKey('RecursosDidacticos')).toBe('MetodologiaEnsenanza');
        expect(normalizeClientSectionKey('Metodología y Recursos')).toBe('MetodologiaEnsenanza');
        expect(normalizeClientSectionKey('pea_resources_section')).toBe('ActividadesPracticas');
        expect(normalizeClientSectionKey('ActividadesPracticas')).toBe('ActividadesPracticas');
        expect(normalizeClientSectionKey('8')).toBe('ActividadesPracticas');
        expect(normalizeClientSectionKey('7')).toBe('MetodologiaEnsenanza');
    });

    it('preserva 0 horas en actividades prácticas sin inventar 2 horas por defecto', () => {
        const payload = buildReviewerSnapshotPayload(
            {
                ActividadesPracticas: [
                    { unidad: 1, nombre: 'Práctica de normalización', horas: 0 },
                    { unidad: 2, nombre: 'Práctica de índices', horas: '' }
                ]
            },
            baseProject
        );

        expect(payload.currentActividadesPracticas).toHaveLength(2);
        expect(payload.currentActividadesPracticas?.[0].horas).toBe(0);
        expect(payload.currentActividadesPracticas?.[1].horas).toBe(0);
    });

    it('detecta observaciones ya registradas y cuenta observaciones pendientes por sección', () => {
        const existingComments: Record<string, SectionComment[]> = {
            Unidades: [
                {
                    id: 1,
                    status: 'Pendiente',
                    text: 'Ajustar las horas de las unidades temáticas en la Sección 6.'
                },
                {
                    id: 2,
                    status: 'Subsanada',
                    text: 'Observación anterior ya resuelta.'
                }
            ]
        };

        expect(
            isObservationAlreadyRegistered(
                existingComments,
                'Unidades',
                '  ajustar las horas   de las unidades temáticas en la sección 6. '
            )
        ).toBe(true);

        expect(
            isObservationAlreadyRegistered(
                existingComments,
                'Unidades',
                'Otra observación diferente.'
            )
        ).toBe(false);

        expect(getPendingSectionObservationCount(existingComments, 'Unidades')).toBe(1);
        expect(getPendingSectionObservationCount(existingComments, 'Bibliografia')).toBe(0);
    });
});

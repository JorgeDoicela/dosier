import { describe, it, expect, beforeEach } from 'vitest';
import {
    recordRecentSubjectOpen,
    getSubjectLastOpenedAt,
    sortSubjectsByRecentOpen,
    sortOtherPeasIntelligently
} from '../recentSubjectStorage';

describe('recentSubjectStorage — Algoritmo invisible de ordenamiento inteligente', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('registra y recupera correctamente el timestamp de apertura reciente', () => {
        recordRecentSubjectOpen({ uuid: 'pea-uuid-001', id_pea: 10 });
        const lastOpened = getSubjectLastOpenedAt({ uuid: 'pea-uuid-001' });
        expect(lastOpened).toBeGreaterThan(0);
    });

    it('sortSubjectsByRecentOpen ubica de primero la materia abierta más recientemente', () => {
        const materias = [
            { id_asignacion: 1, nombre: 'Matemáticas' },
            { id_asignacion: 2, nombre: 'Programación' },
            { id_asignacion: 3, nombre: 'Base de Datos' }
        ];

        // Se abre primero la 1, y luego la 3
        recordRecentSubjectOpen({ id_asignacion: 1 });
        // Simular tiempo posterior para la 3
        const raw = JSON.parse(localStorage.getItem('dosier_recent_opened_asignaciones') || '{}');
        raw['asig_3'] = Date.now() + 1000;
        localStorage.setItem('dosier_recent_opened_asignaciones', JSON.stringify(raw));

        const ordenadas = sortSubjectsByRecentOpen(materias);
        expect(ordenadas[0].id_asignacion).toBe(3);
        expect(ordenadas[1].id_asignacion).toBe(1);
        expect(ordenadas[2].id_asignacion).toBe(2);
    });

    describe('sortOtherPeasIntelligently — Bandeja de PEAs de otros docentes', () => {
        const peas = [
            {
                id_pea: 1,
                uuid: 'uuid-1',
                nombre_asignatura: 'Seguridad de la Información',
                nombre_carrera: 'Desarrollo de Software',
                estado_colaboracion: undefined
            },
            {
                id_pea: 2,
                uuid: 'uuid-2',
                nombre_asignatura: 'Sistemas Web',
                nombre_carrera: 'Desarrollo de Software',
                estado_colaboracion: 'Aprobada'
            },
            {
                id_pea: 3,
                uuid: 'uuid-3',
                nombre_asignatura: 'Álgebra Lineal',
                nombre_carrera: 'Gastronomía',
                estado_colaboracion: 'Pendiente'
            },
            {
                id_pea: 4,
                uuid: 'uuid-4',
                nombre_asignatura: 'Arquitectura Computacional',
                nombre_carrera: 'Ciberseguridad',
                estado_colaboracion: undefined
            },
            {
                id_pea: 5,
                uuid: 'uuid-5',
                nombre_asignatura: 'Auditoría Forense',
                nombre_carrera: 'Desarrollo de Software',
                estado_colaboracion: undefined
            }
        ];

        const carrerasDocente = new Set(['Desarrollo de Software']);

        it('prioriza colaboraciones aprobadas sobre pendientes y materias sin solicitud', () => {
            const ordenados = sortOtherPeasIntelligently(peas, carrerasDocente);
            // 'Sistemas Web' tiene 'Aprobada', debe ir primero
            expect(ordenados[0].nombre_asignatura).toBe('Sistemas Web');
            // 'Álgebra Lineal' tiene 'Pendiente', debe ir segundo
            expect(ordenados[1].nombre_asignatura).toBe('Álgebra Lineal');
        });

        it('ubica al puesto #1 absoluto un PEA que el docente abrió recientemente, incluso si era sin solicitud', () => {
            // El docente abrió recientemente 'Arquitectura Computacional'
            recordRecentSubjectOpen({ uuid: 'uuid-4', id_pea: 4 });

            const ordenados = sortOtherPeasIntelligently(peas, carrerasDocente);
            expect(ordenados[0].nombre_asignatura).toBe('Arquitectura Computacional');
            expect(ordenados[1].nombre_asignatura).toBe('Sistemas Web'); // La aprobada pasa al segundo
        });

        it('entre materias sin colaboración previa, prioriza las de la misma carrera del docente sobre carreras ajenas', () => {
            const materiasSinColab = [
                {
                    id_pea: 10,
                    uuid: 'u-10',
                    nombre_asignatura: 'Cocina Nacional',
                    nombre_carrera: 'Gastronomía',
                    estado_colaboracion: undefined
                },
                {
                    id_pea: 11,
                    uuid: 'u-11',
                    nombre_asignatura: 'Estructura de Datos',
                    nombre_carrera: 'Desarrollo de Software',
                    estado_colaboracion: undefined
                }
            ];

            const ordenados = sortOtherPeasIntelligently(materiasSinColab, carrerasDocente);
            expect(ordenados[0].nombre_asignatura).toBe('Estructura de Datos');
            expect(ordenados[1].nombre_asignatura).toBe('Cocina Nacional');
        });

        it('ordena alfabéticamente de forma natural ante igualdad de condiciones', () => {
            const materiasIguales = [
                {
                    id_pea: 20,
                    uuid: 'u-20',
                    nombre_asignatura: 'Redes II',
                    nombre_carrera: 'Desarrollo de Software',
                    estado_colaboracion: undefined
                },
                {
                    id_pea: 21,
                    uuid: 'u-21',
                    nombre_asignatura: 'Base de Datos I',
                    nombre_carrera: 'Desarrollo de Software',
                    estado_colaboracion: undefined
                }
            ];

            const ordenados = sortOtherPeasIntelligently(materiasIguales, carrerasDocente);
            expect(ordenados[0].nombre_asignatura).toBe('Base de Datos I');
            expect(ordenados[1].nombre_asignatura).toBe('Redes II');
        });
    });
});

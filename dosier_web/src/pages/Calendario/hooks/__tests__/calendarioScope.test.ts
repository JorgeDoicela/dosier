import { describe, it, expect } from 'vitest';
import {
    buildPayload,
    getContextDescription,
    CATEGORIAS_CONFIG,
    type EventoCalendario,
} from '../../../../services/calendarioService';

const makeEvento = (overrides: Partial<EventoCalendario> = {}): EventoCalendario => ({
    id_evento_calendario: 'NORM-1',
    uuid: 'evt-1',
    titulo: 'Reunión de área',
    descripcion: 'Revisión de PEAs',
    categoria_global: 'Carrera',
    subcategoria: 'Reunion',
    fecha_inicio: '2026-11-25',
    fecha_fin: '2026-11-25',
    es_todo_el_dia: true,
    color_hex: '#3B82F6',
    url_accion: null,
    es_privado: false,
    prioridad: 'Media',
    estado: 'Pendiente',
    creado_por: 10,
    alerta_dias: 3,
    recurrencia_anual: false,
    tipo_entidad_origen: 'CALENDARIO_NORMATIVO',
    id_carrera: 5,
    nombre_carrera: 'Desarrollo de Software',
    puede_gestionar: false,
    ...overrides,
});

describe('calendarioService — alcance personal, carrera e institucional', () => {
    it('expone la categoría Carrera en CATEGORIAS_CONFIG', () => {
        expect(CATEGORIAS_CONFIG.Carrera).toBeDefined();
        expect(CATEGORIAS_CONFIG.Carrera.label).toBe('Evento de Carrera');
    });

    it('buildPayload preserva id_carrera y roles_visibles cuando se indican', () => {
        const payload = buildPayload({
            titulo: 'Reunión de Software',
            descripcion: 'Avance de sílabos',
            tipo: 'Reunion',
            fechaInicio: '2026-11-25',
            fechaFin: '2026-11-25',
            esTodoElDia: true,
            colorHex: '#3B82F6',
            esPrivado: false,
            prioridad: 'Alta',
            estado: 'EnProgreso',
            alertaDias: 2,
            recurrenciaAnual: false,
            rolesVisibles: 'DOSIER_DOCENTE',
            idCarrera: 5,
        });

        expect(payload.es_privado).toBe(false);
        expect(payload.id_carrera).toBe(5);
        expect(payload.roles_visibles).toBe('DOSIER_DOCENTE');
        expect(payload.alerta_dias).toBe(2);
    });

    it('buildPayload asigna id_carrera en null cuando no se especifica', () => {
        const payload = buildPayload({
            titulo: 'Mi nota privada',
            descripcion: '',
            tipo: 'Personal',
            fechaInicio: '2026-11-25',
            fechaFin: null,
            esTodoElDia: true,
            colorHex: '#F59E0B',
            esPrivado: true,
            prioridad: 'Media',
            estado: 'Pendiente',
            alertaDias: '',
            recurrenciaAnual: false,
        });

        expect(payload.es_privado).toBe(true);
        expect(payload.id_carrera).toBeNull();
        expect(payload.alerta_dias).toBeNull();
    });

    it('getContextDescription diferencia evento de carrera, institucional y personal', () => {
        const evCarrera = makeEvento();
        const evPersonal = makeEvento({
            categoria_global: 'Personal',
            es_privado: true,
            id_carrera: null,
            nombre_carrera: null,
        });
        const evInstituto = makeEvento({
            categoria_global: 'Normativo',
            es_privado: false,
            id_carrera: null,
            nombre_carrera: null,
        });

        expect(getContextDescription(evCarrera)).toContain('docentes y la coordinación de esta carrera');
        expect(getContextDescription(evPersonal)).toContain('agenda');
        expect(getContextDescription(evInstituto)).toContain('normativo');
    });
});

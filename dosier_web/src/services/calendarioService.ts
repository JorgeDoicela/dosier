import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────

export interface EventoCalendario {
    id_evento_calendario: string;
    uuid: string;
    titulo: string;
    descripcion: string;
    categoria_global: string;
    subcategoria: string;
    fecha_inicio: string;
    fecha_fin: string | null;
    es_todo_el_dia: boolean;
    color_hex: string | null;
    url_accion: string | null;
    es_privado: boolean;
    prioridad: string;
    estado: string;
    creado_por: number | null;
    alerta_dias: number | null;
    recurrencia_anual: boolean;
    id_entidad_origen?: number | null;
    uuid_entidad_origen?: string | null;
    tipo_entidad_origen?: string | null;
    // Notas Rápidas — campos extendidos
    nota_detalle?: string | null;
    orden_bandeja?: number | null;
}

export interface EventoPayload {
    titulo: string;
    descripcion: string;
    tipo_evento: string;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    es_todo_el_dia: boolean;
    recurrencia_anual: boolean;
    recurrencia_hasta: null;
    roles_visibles: null;
    modulo_origen: string;
    url_accion: string | null;
    color_hex: string | null;
    alerta_dias: number | null;
    activo: boolean;
    es_privado: boolean;
    prioridad: string;
    estado: string;
    // Notas Rápidas — campos extendidos
    nota_detalle?: string | null;
    orden_bandeja?: number | null;
}

// ─────────────────────────────────────────────────────────────
//  API calls
// ─────────────────────────────────────────────────────────────

const formatLocalDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const getEventos = (date: Date): Promise<EventoCalendario[]> => {
    const desde = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const hasta = new Date(date.getFullYear(), date.getMonth() + 2, 0);
    return api.get('/calendario/eventos', {
        params: { desde: formatLocalDate(desde), hasta: formatLocalDate(hasta) }
    }).then(r => r.data || []);
};

export const getEventosRango = (desde: string, hasta: string): Promise<EventoCalendario[]> =>
    api.get('/calendario/eventos', {
        params: { desde, hasta }
    }).then(r => r.data || []);

export const getStickyNotes = (): Promise<EventoCalendario[]> =>
    api.get('/calendario/usuario/notas').then(r => r.data || []);

export const createEvento = (payload: EventoPayload): Promise<EventoCalendario> =>
    api.post('/calendario/usuario/eventos', payload).then(r => r.data);

export const updateEvento = (uuid: string, payload: EventoPayload): Promise<EventoCalendario> =>
    api.put(`/calendario/usuario/eventos/${uuid}`, payload).then(r => r.data);

export const deleteEvento = (uuid: string): Promise<void> =>
    api.delete(`/calendario/usuario/eventos/${uuid}`).then(() => undefined);

export const devolverAInbox = (uuid: string): Promise<void> =>
    api.patch(`/calendario/usuario/eventos/${uuid}/inbox`).then(() => undefined);

export const reordenarBandeja = (items: { uuid: string; orden: number }[]): Promise<void> =>
    api.patch('/calendario/usuario/notas/reordenar', items).then(() => undefined);

export const getIcalToken = (): Promise<{ feed_url: string }> =>
    api.post('/calendario/ical/token').then(r => r.data);

// ─────────────────────────────────────────────────────────────
//  Helpers de UI
// ─────────────────────────────────────────────────────────────

export const CATEGORIAS_CONFIG: Record<string, { label: string; color: string }> = {
    Normativo:   { label: 'CACES / Normativa',        color: '#1E3A8A' },
    EntregaPea:  { label: 'Entrega PEA Docente',      color: '#3B82F6' },
    Revision:    { label: 'Revisión Coordinación',    color: '#8B5CF6' },
    Firmas:      { label: 'Legalización y Firmas',    color: '#10B981' },
    Reunion:     { label: 'Reunión de Área / Cátedra', color: '#EC4899' },
    Personal:    { label: 'Mis Tareas / Agenda',       color: '#F59E0B' },
    // Compatibilidad retroactiva con eventos preexistentes
    Convocatoria:{ label: 'Entrega PEA Docente',      color: '#3B82F6' },
    Proyecto:    { label: 'Instrumento Curricular',   color: '#10B981' },
    Monitoreo:   { label: 'Supervisión Curricular',   color: '#8B5CF6' },
    PeerReview:  { label: 'Revisión Coordinación',    color: '#EC4899' },
};

export const PRIORIDAD_COLORS: Record<string, { bg: string; text: string }> = {
    Alta:  { bg: 'var(--error-subtle)',   text: 'var(--error)' },
    Media: { bg: 'var(--warning-subtle)', text: 'var(--warning)' },
    Baja:  { bg: 'var(--success-subtle)', text: 'var(--success)' },
};

export const ESTADO_LABELS: Record<string, string> = {
    Pendiente:  'Pendiente',
    EnProgreso: 'En Progreso',
    Completado: 'Completado',
    Cancelado:  'Cancelado',
};

export const COLORES_OPCIONES = [
    { value: '#F59E0B', label: 'Naranja (Personal)' },
    { value: '#3B82F6', label: 'Azul (Reuniones)' },
    { value: '#10B981', label: 'Verde (Hitos)' },
    { value: '#EC4899', label: 'Rosado (Revisiones)' },
    { value: '#8B5CF6', label: 'Morado (Monitoreo)' },
    { value: '#EF4444', label: 'Rojo (Urgente)' },
];

/** Construye el payload para crear/editar un evento personal */
export const buildPayload = (fields: {
    titulo: string;
    descripcion: string;
    tipo: string;
    fechaInicio: string | null;
    fechaFin: string | null;
    esTodoElDia: boolean;
    colorHex: string;
    esPrivado: boolean;
    prioridad: string;
    estado: string;
    alertaDias: number | '';
    recurrenciaAnual: boolean;
    urlAccion?: string | null;
    notaDetalle?: string | null;
    ordenBandeja?: number | null;
}): EventoPayload => ({
    titulo: fields.titulo,
    descripcion: fields.descripcion,
    tipo_evento: fields.tipo,
    fecha_inicio: fields.fechaInicio,
    fecha_fin: fields.fechaFin || null,
    es_todo_el_dia: fields.esTodoElDia,
    recurrencia_anual: fields.recurrenciaAnual,
    recurrencia_hasta: null,
    roles_visibles: null,
    modulo_origen: 'PERSONAL',
    url_accion: fields.urlAccion ?? null,
    color_hex: fields.colorHex,
    alerta_dias: fields.alertaDias !== '' ? Number(fields.alertaDias) : null,
    activo: true,
    es_privado: fields.esPrivado,
    prioridad: fields.prioridad,
    estado: fields.estado,
    nota_detalle: fields.notaDetalle ?? null,
    orden_bandeja: fields.ordenBandeja ?? null,
});

export const EVENTO_CONTEXTO_HELP: Record<string, string> = {
    PROYECTO: 'Este hito está vinculado al módulo de Proyectos de Investigación. Representa una fecha oficial establecida en el cronograma aprobado para la ejecución del proyecto.',
    CONVOCATORIA: 'Este evento corresponde a un hito oficial del cronograma de Convocatorias. Es clave para el control de los plazos de postulación y revisión de propuestas.',
};

/** Retorna la explicación conceptual del origen de un hito */
export const getContextDescription = (ev: EventoCalendario): string | null => {
    if (ev.tipo_entidad_origen === 'CALENDARIO_NORMATIVO') {
        return ev.categoria_global === 'Normativo'
            ? 'Hito o plazo normativo de carácter institucional o externo (ej. CACES, autoevaluaciones, etc.). Su cumplimiento es auditado.'
            : 'Tarea o evento personal programado en la agenda del usuario.';
    }
    return EVENTO_CONTEXTO_HELP[ev.tipo_entidad_origen || ''] || null;
};

/**
 * Resuelve la URL de navegación de un evento según su tipo de entidad, subcategoría y rol del usuario.
 * Desacopla la base de datos de las rutas del frontend.
 */
export const resolveEventUrl = (ev: {
    url_accion?: string | null;
    tipo_entidad_origen?: string | null;
    uuid_entidad_origen?: string | null;
    id_entidad_origen?: number | null;
    categoria_global?: string;
    subcategoria?: string;
    uuid?: string;
}, isAdmin: boolean = false): string | null => {
    // 1. Si el evento contiene una URL explícita (ej. link normativo externo o PDF)
    if (ev.url_accion) {
        return ev.url_accion;
    }

    const projectUuid = ev.uuid_entidad_origen || ev.uuid;
    const prefix = isAdmin ? '/documentacion' : '/documentacion/mis-proyectos';

    // 2. Mapeo según el tipo de entidad de dominio curricular
    switch (ev.tipo_entidad_origen) {
        case 'PEA':
        case 'PROYECTO': {
            if (!projectUuid) return `${prefix}`;
            if (ev.subcategoria === 'RevisionCoordinacion' || ev.subcategoria === 'RevisionTecnica') {
                return `/documentacion/revision-tecnica/${projectUuid}`;
            }
            return `${prefix}/workspace/PEA_OFICIAL/${projectUuid}`;
        }
        case 'REVISION':
        case 'PEER_REVIEW':
            return projectUuid ? `/documentacion/revision-tecnica/${projectUuid}` : `${prefix}`;
        case 'MONITOREO':
            return projectUuid ? `${prefix}/monitoreo/${projectUuid}` : `${prefix}`;
        case 'CONVOCATORIA':
        case 'PERIODO':
            return `${prefix}`;
        default:
            break;
    }

    // 3. Fallbacks por categoría global
    if ((ev.categoria_global === 'EntregaPea' || ev.categoria_global === 'Proyecto') && projectUuid) {
        return `${prefix}/workspace/PEA_OFICIAL/${projectUuid}`;
    }
    if ((ev.categoria_global === 'Revision' || ev.categoria_global === 'PeerReview') && projectUuid) {
        return `/documentacion/revision-tecnica/${projectUuid}`;
    }
    if (ev.categoria_global === 'Monitoreo' && projectUuid) {
        return `${prefix}/monitoreo/${projectUuid}`;
    }
    if (ev.categoria_global === 'Convocatoria' || ev.categoria_global === 'Normativo') {
        return `${prefix}`;
    }

    return null;
};


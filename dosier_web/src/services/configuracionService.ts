import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface PeriodoAcademicoDto {
    idPeriodo: string;
    detalle?: string;
    fechaInicial?: string;
    fechaFinal?: string;
    activo?: boolean;
    cerrado?: boolean;
    [key: string]: any;
}

export interface SavePeriodoDto {
    idPeriodo?: string;
    detalle: string;
    fechaInicial: string;
    fechaFinal: string;
    [key: string]: any;
}

export interface EventoNormativoDto {
    uuid?: string;
    titulo: string;
    descripcion?: string;
    tipoEvento: string;
    fechaInicio: string;
    fechaFin?: string;
    esTodoElDia: boolean;
    recurrenciaAnual: boolean;
    recurrenciaHasta?: string;
    rolesVisibles?: string;
    moduloOrigen?: string;
    urlAccion?: string;
    colorHex?: string;
    alertaDias?: number;
    activo?: boolean;
    [key: string]: any;
}

export interface SaveEventoNormativoDto {
    titulo: string;
    descripcion?: string;
    tipo_evento: string;
    fecha_inicio: string;
    fecha_fin?: string | null;
    es_todo_el_dia: boolean;
    recurrencia_anual: boolean;
    recurrencia_hasta?: string | null;
    roles_visibles?: string | null;
    modulo_origen?: string | null;
    url_accion?: string | null;
    color_hex?: string | null;
    alerta_dias?: number | null;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Configuración Institucional y Calendario Normativo
// ─────────────────────────────────────────────────────────────

export const configuracionService = {
    /**
     * Obtiene el catálogo oficial de períodos académicos.
     */
    getPeriodos: (): Promise<PeriodoAcademicoDto[]> =>
        api.get<PeriodoAcademicoDto[]>('/catalogs/periodos').then(r => r.data || []),

    /**
     * Registra un nuevo período académico en el sistema.
     */
    createPeriodo: (payload: SavePeriodoDto): Promise<PeriodoAcademicoDto> =>
        api.post('/catalogs/periodos', payload).then(r => r.data),

    /**
     * Actualiza las fechas y metadatos de un período académico existente.
     */
    updatePeriodo: (idPeriodo: string, payload: SavePeriodoDto): Promise<PeriodoAcademicoDto> =>
        api.put(`/catalogs/periodos/${encodeURIComponent(idPeriodo)}`, payload).then(r => r.data),

    /**
     * Elimina un período académico.
     */
    deletePeriodo: (idPeriodo: string): Promise<void> =>
        api.delete(`/catalogs/periodos/${encodeURIComponent(idPeriodo)}`).then(() => undefined),

    /**
     * Obtiene la nómina de eventos y fechas límite normativas institucionales.
     */
    getEventosNormativos: (): Promise<EventoNormativoDto[]> =>
        api.get<EventoNormativoDto[]>('/calendario/normativos').then(r => r.data || []),

    /**
     * Registra un nuevo evento o fecha límite normativa en el calendario curricular.
     */
    createEventoNormativo: (payload: SaveEventoNormativoDto): Promise<EventoNormativoDto> =>
        api.post('/calendario/normativos', payload).then(r => r.data),

    /**
     * Actualiza un evento normativo existente.
     */
    updateEventoNormativo: (uuid: string, payload: SaveEventoNormativoDto): Promise<EventoNormativoDto> =>
        api.put(`/calendario/normativos/${encodeURIComponent(uuid)}`, payload).then(r => r.data),

    /**
     * Elimina un evento normativo del calendario institucional.
     */
    deleteEventoNormativo: (uuid: string): Promise<void> =>
        api.delete(`/calendario/normativos/${encodeURIComponent(uuid)}`).then(() => undefined),

    /**
     * Obtiene los estados y etapas del flujo de trabajo curricular oficial.
     */
    getWorkflowEstados: (): Promise<any[]> =>
        api.get('/catalogs/workflow/estados').then(r => r.data || []),

    /**
     * Obtiene los próximos eventos y convocatorias del calendario curricular.
     */
    getEventosCalendario: (params?: any): Promise<any[]> =>
        api.get('/calendario/eventos', { params }).then(r => r.data || []),
};

export default configuracionService;

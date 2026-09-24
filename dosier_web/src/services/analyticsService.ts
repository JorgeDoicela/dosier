import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface AnalyticsProjectDto {
    uuid: string;
    titulo: string;
    codigoInstitucional?: string;
    estado: string;
    carrera?: string;
    lineaInvestigacion?: string;
    convocatoriaTitulo?: string;
    presupuestoTotal?: number;
    porcentajeCompletado?: number;
    [key: string]: any;
}

export interface AnalyticsStatsDto {
    totalProyectos: number;
    activos: number;
    completados: number;
    enRevision: number;
    presupuestoEjecutado?: number;
    [key: string]: any;
}

export interface CarreraCatalogoDto {
    idCarrera?: number;
    nombre: string;
    codigo?: string;
    modalidad?: string;
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Métricas y Analíticas CACES
// ─────────────────────────────────────────────────────────────

export const analyticsService = {
    /**
     * Obtiene la nómina de proyectos con sus atributos para agregación analítica.
     */
    getProjects: (): Promise<AnalyticsProjectDto[]> =>
        api.get('/projects').then(r => r.data || []),

    /**
     * Obtiene los indicadores y métricas consolidadas del dashboard.
     */
    getStats: (): Promise<AnalyticsStatsDto | null> =>
        api.get('/projects/stats').then(r => r.data || null),

    /**
     * Obtiene el catálogo de carreras activas registradas en el sistema.
     */
    getCarreras: (): Promise<CarreraCatalogoDto[]> =>
        api.get('/catalogs/carreras').then(r => r.data || []),
};

export default analyticsService;

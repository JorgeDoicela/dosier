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
     * Obtiene la nómina de instrumentos curriculares con sus atributos para agregación analítica.
     */
    getProjects: (): Promise<AnalyticsProjectDto[]> =>
        api.get<any[]>('/pea/bandeja').then(r => {
            const list = Array.isArray(r.data) ? r.data : [];
            return list.map((p: any) => ({
                uuid: p.uuid,
                titulo: p.nombre_asignatura,
                codigoInstitucional: p.codigo_asignatura,
                estado: p.estado,
                carrera: p.nombre_carrera,
                convocatoriaTitulo: p.id_periodo,
                porcentajeCompletado: Math.round((p.total_firmas_completadas || 0) * 25),
                presupuestoTotal: 0
            }));
        }).catch(() => []),

    /**
     * Obtiene los indicadores y métricas consolidadas del dashboard.
     */
    getStats: async (): Promise<AnalyticsStatsDto | null> => {
        try {
            const list = await analyticsService.getProjects();
            return {
                totalProyectos: list.length,
                activos: list.filter(p => p.estado !== 'Aprobado' && p.estado !== 'Rechazado').length,
                completados: list.filter(p => p.estado === 'Aprobado').length,
                enRevision: list.filter(p => p.estado === 'EnRevision' || p.estado === 'RevisadoCoord' || p.estado === 'RevisadoAcad').length,
                presupuestoEjecutado: 0
            };
        } catch {
            return null;
        }
    },

    /**
     * Obtiene el catálogo de carreras activas registradas en el sistema.
     */
    getCarreras: (): Promise<CarreraCatalogoDto[]> =>
        api.get('/catalogs/carreras').then(r => r.data || []),
};

export default analyticsService;

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
    idCarrera?: number;
    convocatoriaTitulo?: string;
    porcentajeCompletado?: number;
    docenteElaborador?: string;
    semestreNivel?: string;
    modalidad?: string;
    totalHoras?: number;
    creditos?: number;
    horasCD?: number;
    horasAPE?: number;
    horasAA?: number;
    firmaDocente?: boolean;
    firmaCoord?: boolean;
    firmaAcad?: boolean;
    firmaVicerrector?: boolean;
    totalFirmas?: number;
    totalObservaciones?: number;
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
     * Obtiene la nómina de instrumentos curriculares con sus atributos para agregación analítica institucional.
     */
    getProjects: (): Promise<AnalyticsProjectDto[]> =>
        api.get<any[]>('/pea/bandeja', { params: { alcanceInstitucional: true } }).then(r => {
            const list = Array.isArray(r.data) ? r.data : [];
            return list.map((p: any) => ({
                uuid: p.uuid,
                titulo: p.nombre_asignatura,
                codigoInstitucional: p.codigo_asignatura,
                estado: p.estado,
                carrera: p.nombre_carrera,
                idCarrera: p.id_carrera,
                convocatoriaTitulo: p.id_periodo,
                porcentajeCompletado: Math.round((p.total_firmas_completadas || 0) * 25),
                docenteElaborador: p.nombre_docente_elaborador,
                semestreNivel: p.semestre_nivel,
                modalidad: p.modalidad,
                totalHoras: Number(p.total_horas_asignatura) || 0,
                creditos: Number(p.creditos) || 0,
                horasCD: Number(p.horas_contacto_docente) || 0,
                horasAPE: Number(p.horas_practico_experimental) || 0,
                horasAA: Number(p.horas_autonomo) || 0,
                firmaDocente: Boolean(p.firma_docente),
                firmaCoord: Boolean(p.firma_coord),
                firmaAcad: Boolean(p.firma_acad),
                firmaVicerrector: Boolean(p.firma_vicerrector),
                totalFirmas: p.total_firmas_completadas || 0,
                totalObservaciones: p.total_observaciones_pendientes || 0
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

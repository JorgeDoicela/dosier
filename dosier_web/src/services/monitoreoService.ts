import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface ProjectMonitoringDetailDto {
    uuid: string;
    titulo: string;
    estado: string;
    directorProyecto?: string;
    carrera?: string;
    lineaInvestigacion?: string;
    presupuestoTotal?: number;
    fechaInicio?: string;
    fechaFin?: string;
    avancePorcentaje?: number;
    trazabilidad?: any[];
    miembros?: any[];
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Monitoreo Curricular e Institucional
// ─────────────────────────────────────────────────────────────

export const monitoreoService = {
    /**
     * Obtiene el detalle técnico y avance curricular de un proyecto o documento para la vista de monitoreo.
     */
    getProjectDetail: (projectUuid: string): Promise<ProjectMonitoringDetailDto> =>
        api.get(`/projects/${encodeURIComponent(projectUuid)}/detail`).then(r => r.data),

    /**
     * Comprueba la disponibilidad de la API y mide la latencia de conexión.
     */
    ping: (options?: { timeout?: number }): Promise<any> =>
        api.get('/ping', options).then(r => r.data),
};

export default monitoreoService;

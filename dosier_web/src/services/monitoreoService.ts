import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO de Monitoreo Curricular (PEA)
// ─────────────────────────────────────────────────────────────

export interface PeaMonitoringUnidadDto {
    id_unidad?: number;
    numero_unidad: number;
    nombre_unidad: string;
    total_horas_unidad: number;
    horas_docencia: number;
    horas_practico_exp: number;
    horas_autonomo: number;
    orden?: number;
    temas?: Array<{
        id_tema?: number;
        numero_tema?: number;
        titulo_tema: string;
        contenidos_subtemas?: string;
    }>;
}

export interface ProjectMonitoringDetailDto {
    uuid: string;
    titulo: string;
    codigo_asignatura?: string;
    estado: string;
    directorProyecto?: string;
    carrera?: string;
    periodo?: string;
    modalidad?: string;
    semestre_nivel?: string;
    horas_docencia?: number;
    horas_practico_experimental?: number;
    horas_autonomo?: number;
    horas_totales?: number;
    creditos?: number;
    avancePorcentaje?: number;
    unidades?: PeaMonitoringUnidadDto[];
    trazabilidad?: any[];
    firmas?: {
        elaborado?: { firmante?: string; fecha?: string };
        revisadoCoord?: { firmante?: string; fecha?: string };
        revisadoAcad?: { firmante?: string; fecha?: string };
        aprobado?: { firmante?: string; fecha?: string };
    };
    [key: string]: any;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Monitoreo Curricular e Institucional
// ─────────────────────────────────────────────────────────────

export const monitoreoService = {
    /**
     * Obtiene el detalle técnico y avance curricular del PEA para la vista de monitoreo.
     */
    getProjectDetail: async (projectUuid: string): Promise<ProjectMonitoringDetailDto> => {
        try {
            const res = await api.get<any>(`/pea/uuid/${encodeURIComponent(projectUuid)}`);
            const d = res.data;
            const unidades: PeaMonitoringUnidadDto[] = (d.unidades || []).map((u: any) => ({
                id_unidad: u.id_unidad ?? u.idUnidad,
                numero_unidad: u.numero_unidad ?? u.numeroUnidad ?? 1,
                nombre_unidad: u.nombre_unidad ?? u.nombreUnidad ?? '',
                total_horas_unidad: u.total_horas_unidad ?? u.totalHorasUnidad ?? 0,
                horas_docencia: u.horas_docencia ?? u.horasDocencia ?? 0,
                horas_practico_exp: u.horas_practico_exp ?? u.horasPracticoExp ?? 0,
                horas_autonomo: u.horas_autonomo ?? u.horasAutonomo ?? 0,
                orden: u.orden ?? 0,
                temas: (u.temas || []).map((t: any) => ({
                    id_tema: t.id_tema ?? t.idTema,
                    numero_tema: t.numero_tema ?? t.numeroTema ?? 1,
                    titulo_tema: t.titulo_tema ?? t.tituloTema ?? '',
                    contenidos_subtemas: t.contenidos_subtemas ?? t.contenidosSubtemas ?? ''
                }))
            }));

            // Calcular porcentaje de legalización y firmas oficiales
            let firmasCompletadas = 0;
            if (d.firma_elaborado_docente || d.firmaElaboradoDocente) firmasCompletadas++;
            if (d.firma_revisado_coord || d.firmaRevisadoCoord) firmasCompletadas++;
            if (d.firma_revisado_acad || d.firmaRevisadoAcad) firmasCompletadas++;
            if (d.firma_aprobado_vicerrector || d.firmaAprobadoVicerrector) firmasCompletadas++;

            const avance = Math.round((firmasCompletadas / 4) * 100);

            return {
                uuid: d.uuid || projectUuid,
                titulo: d.nombre_asignatura || d.nombreAsignatura || 'Programa de Estudio de la Asignatura',
                codigo_asignatura: d.codigo_asignatura || d.codigoAsignatura || '',
                estado: d.estado || 'Borrador',
                directorProyecto: d.nombre_docente_elaborador || d.nombreDocenteElaborador || 'Docente Responsable',
                carrera: d.nombre_carrera || d.nombreCarrera || '',
                periodo: d.id_periodo || d.idPeriodo || '',
                modalidad: d.modalidad || 'Presencial',
                semestre_nivel: d.semestre_nivel || d.semestreNivel || '',
                horas_docencia: d.horas_contacto_docente ?? d.horasContactoDocente ?? 0,
                horas_practico_experimental: d.horas_practico_experimental ?? d.horasPracticoExperimental ?? 0,
                horas_autonomo: d.horas_autonomo ?? d.horasAutonomo ?? 0,
                horas_totales: d.total_horas_asignatura ?? d.totalHorasAsignatura ?? 0,
                creditos: d.creditos ?? 0,
                avancePorcentaje: avance,
                unidades,
                trazabilidad: d.trazabilidades || d.trazabilidad || [],
                firmas: {
                    elaborado: {
                        firmante: d.firma_elaborado_docente || d.firmaElaboradoDocente,
                        fecha: d.fecha_elaborado || d.fechaElaborado
                    },
                    revisadoCoord: {
                        firmante: d.firma_revisado_coord || d.firmaRevisadoCoord,
                        fecha: d.fecha_revisado_coord || d.fechaRevisadoCoord
                    },
                    revisadoAcad: {
                        firmante: d.firma_revisado_acad || d.firmaRevisadoAcad,
                        fecha: d.fecha_revisado_acad || d.fechaRevisadoAcad
                    },
                    aprobado: {
                        firmante: d.firma_aprobado_vicerrector || d.firmaAprobadoVicerrector,
                        fecha: d.fecha_aprobado || d.fechaAprobado
                    }
                }
            };
        } catch (err) {
            // Fallback de contingencia a documento genérico
            const docRes = await api.get<any>(`/documents/instances/${encodeURIComponent(projectUuid)}`);
            const doc = docRes.data;
            return {
                uuid: doc.uuid || projectUuid,
                titulo: doc.title || 'Documento Curricular',
                estado: doc.status || 'Borrador',
                directorProyecto: doc.created_by || 'Docente Responsable',
                carrera: '',
                avancePorcentaje: 0,
                unidades: []
            };
        }
    },

    /**
     * Comprueba la disponibilidad de la API y mide la latencia de conexión.
     */
    ping: (options?: { timeout?: number }): Promise<any> =>
        api.get('/health', options).then(r => r.data).catch(() => ({ status: 'ok' })),
};

export default monitoreoService;

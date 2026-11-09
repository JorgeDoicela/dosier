import api from '../api/axios_config';
import type { PeaUnidadDto, PeaResultadoAprendizajeDto, PeaActividadPracticaDto, PeaDto } from './peaService';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos de la Sala Curricular Colegiada por Carrera
// ─────────────────────────────────────────────────────────────

export interface SalaAsignaturaItemDto {
    id_expediente?: number;
    idExpediente?: number;
    expediente_uuid?: string;
    expedienteUuid?: string;
    id_asignatura?: number;
    idAsignatura?: number;
    nombre_asignatura?: string;
    nombreAsignatura?: string;
    codigo_asignatura?: string;
    codigoAsignatura?: string;
    id_docente_responsable?: string;
    idDocenteResponsable?: string;
    nombre_docente_responsable?: string;
    nombreDocenteResponsable?: string;
    id_nivel?: number;
    idNivel?: number;
    nombre_nivel?: string;
    nombreNivel?: string;
    id_malla?: number;
    idMalla?: number;
    id_pea?: number;
    idPea?: number;
    pea_uuid?: string;
    peaUuid?: string;
    estado_pea?: string;
    estadoPea?: string;
    tiene_borrador_sala?: boolean;
    tieneBorradorSala?: boolean;
    ultima_actualizacion_borrador?: string;
    ultimaActualizacionBorrador?: string;
}

export interface SalaCarreraEstadoDto {
    id_carrera?: number;
    idCarrera?: number;
    nombre_carrera?: string;
    nombreCarrera?: string;
    id_periodo?: string;
    idPeriodo?: string;
    activa: boolean;
    moderador_id?: string;
    moderadorId?: string;
    moderador_nombre?: string;
    moderadorNombre?: string;
    fecha_apertura?: string;
    fechaApertura?: string;
    tema_principal?: string;
    temaPrincipal?: string;
    total_asignaturas?: number;
    totalAsignaturas?: number;
    asignaturas_con_borrador?: number;
    asignaturasConBorrador?: number;
    asignaturas: SalaAsignaturaItemDto[];
}

export interface BorradorPrePeaDto {
    id_expediente?: number;
    idExpediente?: number;
    id_asignatura?: number;
    idAsignatura?: number;
    nombre_asignatura?: string;
    nombreAsignatura?: string;
    objetivo_asignatura?: string;
    objetivoAsignatura?: string;
    metodologia_ensenanza?: string;
    metodologiaEnsenanza?: string;
    recursos_didacticos?: string;
    recursosDidacticos?: string;
    evaluacion_aprendizaje?: string;
    evaluacionAprendizaje?: string;
    justificacion_cambios_malla?: string;
    justificacionCambiosMalla?: string;
    notas_lluvia_ideas?: string;
    notasLluviaIdeas?: string;
    unidades?: PeaUnidadDto[];
    resultados_aprendizaje?: PeaResultadoAprendizajeDto[];
    resultadosAprendizaje?: PeaResultadoAprendizajeDto[];
    actividades_practicas?: PeaActividadPracticaDto[];
    actividadesPracticas?: PeaActividadPracticaDto[];
    actualizado_en?: string;
    actualizadoEn?: string;
    actualizado_por?: string;
    actualizadoPor?: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Fachada para Salas Curriculares Colegiadas
// ─────────────────────────────────────────────────────────────

export const salaCarreraService = {
    /**
     * Consulta el estado de la sala curricular de la carrera en el período indicado.
     */
    getEstado: (idCarrera: number, idPeriodo: string): Promise<SalaCarreraEstadoDto> =>
        api.get<SalaCarreraEstadoDto>(`/expedientes-curriculares/sala-carrera/${idCarrera}/${encodeURIComponent(idPeriodo)}`)
            .then(r => r.data),

    /**
     * Activa o pausa la sesión colaborativa en tiempo real de la sala.
     */
    conmutarEstado: (idCarrera: number, idPeriodo: string, activar: boolean, temaPrincipal?: string): Promise<{ success: boolean; activa: boolean }> =>
        api.post<{ success: boolean; activa: boolean }>(`/expedientes-curriculares/sala-carrera/${idCarrera}/${encodeURIComponent(idPeriodo)}/conmutar`, {
            activar,
            temaPrincipal
        }).then(r => r.data),

    /**
     * Obtiene el borrador y acuerdos pre-PEA formulados para un expediente curricular.
     */
    getBorrador: (idExpediente: number): Promise<BorradorPrePeaDto> =>
        api.get<BorradorPrePeaDto>(`/expedientes-curriculares/${idExpediente}/borrador-pre-pea`)
            .then(r => r.data),

    /**
     * Guarda o actualiza los acuerdos y propuesta de borrador en el expediente.
     */
    guardarBorrador: (idExpediente: number, borrador: BorradorPrePeaDto): Promise<BorradorPrePeaDto> =>
        api.put<BorradorPrePeaDto>(`/expedientes-curriculares/${idExpediente}/borrador-pre-pea`, {
            borrador
        }).then(r => r.data),

    /**
     * Traspasa e inyecta el borrador pre-PEA directamente en el PEA oficial de la asignatura.
     */
    aplicarAlPea: (idExpediente: number, idPea?: number): Promise<{ success: boolean; pea: PeaDto; message: string }> => {
        const query = idPea ? `?idPea=${idPea}` : '';
        return api.post<{ success: boolean; pea: PeaDto; message: string }>(`/expedientes-curriculares/${idExpediente}/aplicar-borrador-pea${query}`)
            .then(r => r.data);
    },

    /**
     * Descarga el acta o minuta oficial de acuerdos de armonización curricular en PDF.
     */
    descargarActaPdf: async (idCarrera: number, idPeriodo: string): Promise<{ blob: Blob; fileName: string; traceabilityCode?: string }> => {
        const response = await api.post(`/expedientes-curriculares/sala-carrera/${idCarrera}/${encodeURIComponent(idPeriodo)}/generar-acta`, null, {
            responseType: 'blob'
        });
        const traceabilityCode = response.headers['x-traceability-code'] || '';
        const fileName = `Acta_Armonizacion_Carrera_${idCarrera}_${idPeriodo}.pdf`;
        return { blob: response.data, fileName, traceabilityCode };
    }
};

export default salaCarreraService;


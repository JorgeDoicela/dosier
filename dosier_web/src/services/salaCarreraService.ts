import api from '../api/axios_config';

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
    asignaturas: SalaAsignaturaItemDto[];
}

export interface PizarraSalaCarreraDto {
    id_carrera?: number;
    idCarrera?: number;
    id_periodo?: string;
    idPeriodo?: string;
    elements_json?: string;
    elementsJson?: string;
    yjs_state_base64?: string;
    yjsStateBase64?: string;
    version?: number;
    actualizado_en?: string;
    actualizadoEn?: string;
}

export interface GuardarPizarraSalaCarreraRequest {
    elementsJson: string;
    yjsStateBase64?: string;
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
     * Consulta el estado persistido de la pizarra interactiva de la carrera y período.
     */
    getPizarra: (idCarrera: number, idPeriodo: string): Promise<PizarraSalaCarreraDto> =>
        api.get<PizarraSalaCarreraDto>(`/expedientes-curriculares/sala-carrera/${idCarrera}/${encodeURIComponent(idPeriodo)}/pizarra`)
            .then(r => r.data),

    /**
     * Guarda el estado de la pizarra interactiva de la carrera y período en doc_cowork_documentos.
     */
    guardarPizarra: (idCarrera: number, idPeriodo: string, data: GuardarPizarraSalaCarreraRequest): Promise<PizarraSalaCarreraDto> =>
        api.put<PizarraSalaCarreraDto>(`/expedientes-curriculares/sala-carrera/${idCarrera}/${encodeURIComponent(idPeriodo)}/pizarra`, data)
            .then(r => r.data)
};

export default salaCarreraService;

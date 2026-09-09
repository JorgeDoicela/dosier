import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos Curriculares Oficiales del PEA (ISTPET - RRA CES Art. 21/24)
// ─────────────────────────────────────────────────────────────

export interface PeaTemaDto {
    idTema?: number;
    uuid?: string;
    idUnidad?: number;
    numeroTema: number;
    tituloTema: string;
    descripcionSubtemas?: string;
    orden: number;
}

export interface PeaUnidadDto {
    idUnidad?: number;
    uuid?: string;
    idPea?: number;
    numeroUnidad: number;
    nombreUnidad: string;
    totalHorasUnidad: number;
    horasDocencia: number;
    horasPracticoExp: number;
    horasAutonomo: number;
    orden: number;
    temas: PeaTemaDto[];
}

export interface PeaResultadoAprendizajeDto {
    idRda?: number;
    uuid?: string;
    idPea?: number;
    idResultadoPerfil?: number;
    tipoRda: string;
    codigoRda?: string;
    descripcion: string;
    nivelDesarrollo: string;
    orden: number;
}

export interface PeaActividadPracticaDto {
    idPractica?: number;
    uuid?: string;
    idPea?: number;
    idUnidad?: number;
    numeroPractica: number;
    nombrePractica: string;
    caracterizacion?: string;
    duracionHoras: number;
    orden: number;
}

export interface PeaBibliografiaDto {
    idBiblio?: number;
    uuid?: string;
    idPea?: number;
    tipoBibliografia: string;
    autor: string;
    anio?: number;
    tituloLibro: string;
    editorialCiudad?: string;
    isbn?: string;
    urlRecurso?: string;
    citaCompletaApa?: string;
    orden: number;
}

export interface PeaObservacionDto {
    idObservacion: number;
    uuid: string;
    idPea: number;
    idUsuarioObservador?: number;
    nombreObservador?: string;
    rolObservador: string;
    seccionAfectada: string;
    textoObservacion: string;
    estado: 'Pendiente' | 'Subsanada' | 'Desestimada';
    respuestaDocente?: string;
    fechaObservacion: string;
    fechaResolucion?: string;
}

export interface PeaTrazabilidadDto {
    idTrazabilidad: number;
    uuid: string;
    idPea: number;
    idUsuario?: number;
    nombreUsuario?: string;
    estadoAnterior?: string;
    estadoNuevo: string;
    motivo?: string;
    hashIntegridadSha256?: string;
    fechaTransicion: string;
}

export interface PeaPrerrequisitoDto {
    idPrerequisito?: number;
    uuid?: string;
    idPea?: number;
    idAsignaturaOrigen?: number;
    codigoAsignatura?: string;
    nombreAsignatura: string;
    observacion?: string;
    orden: number;
}

export interface PeaEvaluacionDto {
    idEvaluacion?: number;
    uuid?: string;
    idPea?: number;
    denominacion: string;
    tipoEvaluacion: string;
    calificacionMaxima: number;
    orden: number;
}

export interface PeaDto {
    idPea: number;
    uuid: string;
    idCarrera: number;
    nombreCarrera?: string;
    idAsignatura: number;
    nombreAsignatura?: string;
    codigoAsignatura?: string;
    idPeriodo: string;
    idAsignacion?: number;
    idMalla?: number;
    idDetalleMalla?: number;
    idNivel?: number;
    idModalidad?: number;
    idSeccion?: number;
    paralelo?: string;
    fuenteMalla?: string;
    idDocenteElaborador?: string;
    nombreDocenteElaborador?: string;
    modalidad: string;
    unidadOrganizacion?: string;
    semestreNivel?: string;
    totalHorasAsignatura: number;
    creditos: number;
    horasContactoDocente: number;
    horasPracticoExperimental: number;
    horasAutonomo: number;
    objetivoAsignatura?: string;
    metodologiaEnsenanza?: string;
    recursosDidacticos?: string;
    evaluacionAprendizaje?: string;
    estado: string;
    version: number;
    activo: boolean;
    idExpediente?: number;

    // Firmas Digitales Oficiales (Ley 67)
    firmaElaboradoDocente?: string;
    fechaElaborado?: string;
    firmaRevisadoCoord?: string;
    fechaRevisadoCoord?: string;
    firmaRevisadoAcad?: string;
    fechaRevisadoAcad?: string;
    firmaAprobadoVicerrector?: string;
    fechaAprobado?: string;

    unidades: PeaUnidadDto[];
    resultadosAprendizaje: PeaResultadoAprendizajeDto[];
    actividadesPracticas: PeaActividadPracticaDto[];
    bibliografias: PeaBibliografiaDto[];
    observaciones: PeaObservacionDto[];
    trazabilidades: PeaTrazabilidadDto[];
    prerrequisitos?: PeaPrerrequisitoDto[];
    evaluaciones?: PeaEvaluacionDto[];
}

// ─────────────────────────────────────────────────────────────
//  DTOs de Firma Digital Oficial (Ley 67)
// ─────────────────────────────────────────────────────────────

export interface FirmarPeaDto {
    password?: string;
    rolFirmante: 'Docente' | 'Coordinador' | 'CoordinadorAcademico' | 'Vicerrector';
    tipoFirma: 'DOSIER' | 'FirmaEC';
    certificadoP12Base64?: string;
    contraseniaP12?: string;
    motivo?: string;
}

export interface PeaFirmaResultadoDto {
    exito: boolean;
    mensaje: string;
    firmaCode: string;
    docHash: string;
    estadoNuevo: string;
    fechaFirma: string;
    verificationUrl: string;
}

// ─────────────────────────────────────────────────────────────
//  Funciones de Cliente API (Axios con soporte snake_case)
// ─────────────────────────────────────────────────────────────

export const getPeaById = (id: number): Promise<PeaDto> =>
    api.get(`/pea/${id}`).then(r => r.data);

export const getPeaByAsignaturaPeriodo = (idAsignatura: number, idPeriodo: string): Promise<PeaDto> =>
    api.get('/pea/buscar', { params: { idAsignatura, idPeriodo } }).then(r => r.data);

export const crearPeaDesdeAsignacion = (idAsignacion: number): Promise<PeaDto> =>
    api.post(`/pea/desde-asignacion/${idAsignacion}`).then(r => r.data);

export const guardarPea = (dto: Partial<PeaDto>): Promise<PeaDto> =>
    api.post('/pea', dto).then(r => r.data);

export const cambiarEstadoPea = (id: number, nuevoEstado: string, firma?: string, motivo?: string): Promise<{ success: boolean }> =>
    api.patch(`/pea/${id}/estado`, {
        nuevo_estado: nuevoEstado,
        firma,
        motivo
    }).then(r => r.data);

export const firmarPea = (id: number, dto: FirmarPeaDto): Promise<PeaFirmaResultadoDto> =>
    api.post(`/pea/${id}/firmar`, {
        password: dto.password,
        rol_firmante: dto.rolFirmante,
        tipo_firma: dto.tipoFirma,
        certificado_p12_base64: dto.certificadoP12Base64,
        contrasenia_p12: dto.contraseniaP12,
        motivo: dto.motivo
    }).then(r => r.data);

export const clonarPeaPeriodo = (id: number, nuevoPeriodo: string): Promise<PeaDto> =>
    api.post(`/pea/${id}/clonar`, null, { params: { nuevoPeriodo } }).then(r => r.data);

export const getObservacionesPea = (id: number): Promise<PeaObservacionDto[]> =>
    api.get(`/pea/${id}/observaciones`).then(r => r.data);

export const agregarObservacionPea = (
    id: number,
    req: { rolObservador?: string; seccionAfectada?: string; texto: string }
): Promise<PeaObservacionDto> =>
    api.post(`/pea/${id}/observaciones`, {
        rol_observador: req.rolObservador,
        seccion_afectada: req.seccionAfectada,
        texto: req.texto
    }).then(r => r.data);

export const subsanarObservacionPea = (idObs: number, respuestaDocente: string): Promise<{ success: boolean }> =>
    api.patch(`/pea/observaciones/${idObs}/subsanar`, {
        respuesta_docente: respuestaDocente
    }).then(r => r.data);

export const getTrazabilidadPea = (id: number): Promise<PeaTrazabilidadDto[]> =>
    api.get(`/pea/${id}/trazabilidad`).then(r => r.data);

export interface ProyectoResumen {
    idProyecto?: number;
    uuid: string;
    codigoInstitucional: string | null;
    titulo: string;
    estado: string;
    lineaInvestigacion?: string | null;
    carrera: string | null;
    idCarrera?: number;
    presupuestoTotal?: number | null;
    presupuestoEjecutado?: number | null;
    puntajeEvaluacion?: number | null;
    fechaRegistro?: string | null;
    fechaModificacion?: string | null;
    convocatoriaTitulo: string | null;
    totalInvestigadores?: number;
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

export interface EstadoConteo {
    estado: string;
    cantidad: number;
    color: string;
}

export interface ActividadReciente {
    tipo: string;
    descripcion: string;
    fecha: string;
    uuid: string | null;
    estado: string | null;
}

export interface DashboardStats {
    totalProyectos: number;
    proyectosBorrador: number;
    proyectosEnRevision: number;
    proyectosAprobados: number;
    proyectosEnEjecucion: number;
    proyectosFinalizados: number;
    totalConvocatoriasAbiertas: number;
    totalInvestigadoresActivos: number;
    proyectosPorEstado: EstadoConteo[];
    actividadReciente: ActividadReciente[];
}

export interface CarreraCumplimiento {
    carrera: string;
    totalAsignaturas: number;
    aprobados: number;
    enRevision: number;
    observados: number;
    borradores: number;
    porcentajeAprobados: number;
    estadoSemaforo: 'optimo' | 'regular' | 'critico';
}

export interface CuelloBotellaItem {
    etapa: string;
    responsable: string;
    rol: string;
    cantidad: number;
    porcentaje: number;
    colorBadge: string;
    bgProgress: string;
}

export interface ProcessedAnalyticsData {
    filteredProjects: ProyectoResumen[];
    proyectosPorEstado: EstadoConteo[];
    dbPeriods: string[];
    dbCareers: string[];
    carrerasCumplimiento: CarreraCumplimiento[];
    cuelloBotella: CuelloBotellaItem[];
}

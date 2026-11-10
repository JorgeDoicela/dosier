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

export interface CacesIndicator {
    code: string;
    name: string;
    description: string;
    status: 'CUMPLIDO' | 'EN PROCESO' | 'ALERTA';
    progress: number;
    metaLabel: string;
    currentLabel: string;
}

export interface LineaInvestigacionData {
    nombre: string;
    proyectos: number;
    pres: number;
    pct: number;
    colorClass: string;
}

export interface CarreraCumplimiento {
    carrera: string;
    totalAsignaturas: number;
    aprobados: number;
    enRevision: number;
    observados: number;
    borradores: number;
    porcentajeAprobados: number;
    totalHoras: number;
    totalCreditos: number;
    estadoSemaforo: 'optimo' | 'regular' | 'critico';
}

export interface CuelloBotellaItem {
    etapa: string;
    responsable: string;
    rol: string;
    cantidad: number;
    porcentaje: number;
    tiempoEstimado: string;
    colorBadge: string;
    bgProgress: string;
}

export interface CargaHorariaCaces {
    totalHoras: number;
    totalCreditos: number;
    horasCD: number;
    horasAPE: number;
    horasAA: number;
    pctCD: number;
    pctAPE: number;
    pctAA: number;
    asignaturasSinCarga: number;
}

export interface ProcessedAnalyticsData {
    filteredProjects: ProyectoResumen[];
    linesData: LineaInvestigacionData[];
    proyectosPorEstado: EstadoConteo[];
    budgetTotal: number;
    budgetExecuted: number;
    cacesIndicators: readonly CacesIndicator[];
    dbPeriods: string[];
    dbCareers: string[];
    carrerasCumplimiento: CarreraCumplimiento[];
    cuelloBotella: CuelloBotellaItem[];
    cargaHorariaCaces: CargaHorariaCaces;
}

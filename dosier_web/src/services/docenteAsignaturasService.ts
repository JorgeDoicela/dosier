import api from '../api/axios_config';

export interface PeriodoAcademicoDto {
    id_periodo: string;
    detalle?: string;
    fecha_inicial?: string;
    fecha_final?: string;
    es_activo: boolean;
}

export interface DocenteAsignaturaDto {
    id_asignacion: number;
    id_asignatura: number;
    codigo_asignatura?: string;
    nombre_asignatura: string;

    id_carrera: number;
    codigo_carrera?: string;
    nombre_carrera: string;
    alias_carrera?: string;

    id_periodo: string;
    detalle_periodo?: string;

    id_modalidad: number;
    nombre_modalidad?: string;

    id_nivel: number;
    nombre_nivel?: string;
    paralelo: string;

    id_malla: number;
    id_detalle_malla: number;
    fuente_malla: string;

    // Distribución horaria y curricular
    horas_totales: number;
    horas_docencia: number;
    horas_practico_experimental: number;
    horas_autonomo: number;
    creditos: number;
    unidad_organizacion_curricular?: string;

    // Prerrequisitos de la asignatura
    prerrequisitos: string[];

    // Estado del PEA oficial de la asignatura
    estado_pea: 'NoIniciado' | 'Borrador' | 'EnRevision' | 'Observado' | 'Corregido' | 'RevisadoCoord' | 'RevisadoAcad' | 'Aprobado' | string;
    id_pea?: number;
    uuid_pea?: string;
    version_pea?: number;
    advertencias_contexto: string[];
}

export interface AcademicContextDto {
    id_asignacion: number;
    id_profesor: string;
    id_periodo: string;
    id_carrera: number;
    nombre_carrera?: string;
    codigo_carrera?: string;
    id_malla: number;
    descripcion_malla?: string;
    id_detalle_malla: number;
    id_asignatura: number;
    codigo_asignatura?: string;
    nombre_asignatura?: string;
    id_nivel: number;
    nombre_nivel?: string;
    id_modalidad: number;
    nombre_modalidad?: string;
    id_seccion: number;
    nombre_seccion?: string;
    paralelo: string;
    horas_totales: number;
    horas_docencia: number;
    horas_practico_experimental: number;
    horas_autonomo: number;
    creditos: number;
    unidad_organizacion_curricular?: string;
    modalidad_autorizada: boolean;
    fuente_malla: string;
    prerrequisitos: Array<{ id_asignatura: number; codigo?: string; asignatura?: string }>;
    advertencias: string[];
}

/**
 * Obtiene la lista de asignaturas asignadas al docente autenticado en el período indicado (o en el activo).
 */
export const getMisMaterias = async (periodoId?: string): Promise<DocenteAsignaturaDto[]> => {
    const params = periodoId ? { periodoId } : {};
    const res = await api.get('/docente-asignaturas/mis-materias', { params });
    return res.data || [];
};

/**
 * Obtiene el período académico institucional actualmente activo.
 */
export const getPeriodoActivo = async (): Promise<PeriodoAcademicoDto | null> => {
    try {
        const res = await api.get('/docente-asignaturas/periodo-activo');
        return res.data;
    } catch {
        return null;
    }
};

/**
 * Obtiene todos los períodos académicos disponibles en la institución.
 */
export const getPeriodosAcademicos = async (): Promise<PeriodoAcademicoDto[]> => {
    const res = await api.get('/docente-asignaturas/periodos');
    return res.data || [];
};

/**
 * Obtiene el contexto académico oficial de una asignación docente.
 */
export const getContextoAcademico = async (idAsignacion: number): Promise<AcademicContextDto> => {
    const res = await api.get(`/docente-asignaturas/contexto/${idAsignacion}`);
    return res.data;
};

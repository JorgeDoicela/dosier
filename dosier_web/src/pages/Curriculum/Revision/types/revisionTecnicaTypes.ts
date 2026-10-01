import { FileText, Users, Activity, DollarSign, Target, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProjectDetail {
    uuid: string;
    title: string;
    status: string;
    presupuesto: number;
    convocatoriaMontoMaximo: number | null;
    convocatoria: string;
    linea: string;
    carrera: string;
    dominio: string;
    descripcion: string;
    directorProyecto: string;
    codigo_asignatura?: string;
    modalidad?: string;
    semestre_nivel?: string;
    horas_totales?: number;
    creditos?: number;
    horas_docencia?: number;
    horas_practica?: number;
    horas_autonomo?: number;
    docente_elaborador?: string;
    periodo?: string;
    peaData?: any;
}

export interface SectionComment {
    id: number;
    status: 'Pendiente' | 'Aprobado' | 'Corregir';
    text: string;
    creadoEn?: string;
    nombreUsuario?: string;
}

export interface SectionItem {
    id: string;
    label: string;
    icon: LucideIcon;
}

export const FIELD_LABELS: Record<string, string> = {
    // 1. Datos Generales
    NombreAsignatura: 'Nombre de la Asignatura',
    CodigoAsignatura: 'Código de la Asignatura',
    Carrera: 'Carrera Institucional',
    CodigoCarrera: 'Código de Carrera',
    Modalidad: 'Modalidad de Estudio',
    UnidadOrganizacion: 'Unidad de Organización Curricular',
    Periodo: 'Período Académico',
    Nivel: 'Semestre / Nivel',
    TotalHorasAsignatura: 'Total Horas de la Asignatura',
    Creditos: 'Número de Créditos',
    HorasContactoDocente: 'Horas Aprendizaje en Contacto Docente',
    HorasPracticoExperimental: 'Horas Aprendizaje Práctico-Experimental',
    HorasAutonomo: 'Horas Aprendizaje Autónomo',
    DocenteElaborador: 'Docente Titular Elaborador',

    // 2. Objetivos
    ObjetivoAsignatura: 'Objetivo General de la Asignatura',

    // 3. Prerrequisitos
    Prerrequisitos: 'Matriz de Prerrequisitos y Co-requisitos',

    // 4. RDA
    RdaCarrera: 'RDA de Carrera al que Aporta la Asignatura',
    ResultadosAprendizaje: 'Resultados de Aprendizaje de la Asignatura (RDA)',

    // 5. Contenidos
    Unidades: 'Unidades Temáticas, Horas y Contenidos',

    // 6. Metodología
    MetodologiaEnsenanza: 'Estrategias Metodológicas de Enseñanza',
    RecursosDidacticos: 'Recursos Didácticos y Entornos Virtuales',

    // 7. Prácticas
    ActividadesPracticas: 'Guías de Prácticas de Aplicación y Experimentación (APE)',

    // 8. Evaluación
    EvaluacionAprendizaje: 'Criterios y Políticas de Evaluación',
    Evaluaciones: 'Ponderación de Evaluaciones Parciales y Examen',

    // 9. Bibliografía
    BibliografiaBasica: 'Bibliografía Básica Institucional (Normas APA)',
    BibliografiaConsulta: 'Bibliografía Complementaria de Consulta',

    // 10. Firmas
    FirmasResponsabilidad: 'Firmas de Responsabilidad Curricular'
};

export const SECTIONS: SectionItem[] = [
    { id: 'pea_general_section', label: '1. Datos Generales', icon: FileText },
    { id: 'pea_objectives_section', label: '2. Objetivo de Asignatura', icon: Target },
    { id: 'pea_prerequisites_section', label: '3. Prerrequisitos', icon: Activity },
    { id: 'pea_competencies_rda_section', label: '4. Resultados Aprendizaje', icon: BookOpen },
    { id: 'pea_contents_section', label: '5. Contenidos y Horas', icon: FileText },
    { id: 'pea_methodology_section', label: '6. Metodología y Recursos', icon: BookOpen },
    { id: 'pea_resources_section', label: '7. Prácticas APE', icon: Activity },
    { id: 'pea_evaluation_section', label: '8. Evaluación Aprendizaje', icon: Target },
    { id: 'pea_bibliography_section', label: '9. Bibliografía APA', icon: BookOpen },
    { id: 'pea_signatures_section', label: '10. Firmas Institucionales', icon: Users }
];

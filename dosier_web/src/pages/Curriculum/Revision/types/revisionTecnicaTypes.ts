import { FileText, Users, Activity, Target, BookOpen } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ProjectDetail {
    uuid: string;
    title: string;
    titulo?: string;
    status: string;
    estado?: string;
    presupuesto: number;
    convocatoriaMontoMaximo: number | null;
    convocatoria: string;
    linea: string;
    carrera: string;
    dominio: string;
    descripcion: string;
    directorProyecto: string;
    director_nombre?: string;
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
    uuid?: string;
    status: 'Pendiente' | 'Subsanada' | 'Desestimada';
    text: string;
    creadoEn?: string;
    nombreUsuario?: string;
    rolObservador?: string;
    seccionAfectada?: string;
    respuestaDocente?: string;
    fechaResolucion?: string;
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
    Evaluaciones: 'i) Matriz Oficial de Evaluaciones y Calificaciones (ISTPET)',

    // 9. Bibliografía
    BibliografiaBasica: 'Bibliografía Básica Institucional (Normas APA)',
    BibliografiaConsulta: 'Bibliografía Complementaria de Consulta',

    // 10. Firmas
    FirmasResponsabilidad: 'Firmas de Responsabilidad Curricular'
};

export const SECTIONS: SectionItem[] = [
    { id: 'pea_general_section', label: '1. Datos generales', icon: FileText },
    { id: 'pea_objectives_section', label: '2. Objetivo formativo', icon: Target },
    { id: 'pea_prerequisites_section', label: '3. Prerrequisitos', icon: Activity },
    { id: 'pea_career_outcomes_section', label: '4. RDA de carrera', icon: BookOpen },
    { id: 'pea_subject_outcomes_section', label: '5. RDA de asignatura', icon: BookOpen },
    { id: 'pea_contents_section', label: '6. Contenidos y unidades', icon: FileText },
    { id: 'pea_methodology_section', label: '7. Metodología y recursos', icon: BookOpen },
    { id: 'pea_resources_section', label: '8. Prácticas APE', icon: Activity },
    { id: 'pea_evaluation_section', label: '9. Evaluación del aprendizaje', icon: Target },
    { id: 'pea_bibliography_section', label: '10. Bibliografía institucional', icon: BookOpen },
    { id: 'pea_signatures_section', label: '11. Firmas de responsabilidad', icon: Users }
];

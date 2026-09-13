// ═══════════════════════════════════════════════════════════════════
// DOSIER — Document Template Registry (Esquemas de Datos)
//
// RESPONSABILIDAD ÚNICA: Definir la ESTRUCTURA de cada tipo de documento.
//   - Esquema inicial de campos (schema)
//   - Listas colaborativas (lists)
//   - Secciones con sus IDs y labels
//   - Configuración de campos para AgnosticSection (config.fields)
//
// ESTE ARCHIVO NO IMPORTA COMPONENTES REACT.
// Los componentes de React para cada sección están en:
//   → DocumentComponentRegistry.ts
//
// Esto permite que este archivo se use en:
//   - Tests unitarios sin necesidad de React/DOM
//   - Generadores de scripts del backend
//   - Validadores de esquemas
//   - Documentación generada automáticamente
// ═══════════════════════════════════════════════════════════════════

export interface FieldConfig {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'rich-text' | 'list';
    collaborative: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    options?: string[];
}

export interface SectionSchema {
    id: string;
    label: string;
    iconName?: string;         // Nombre del ícono de Lucide (ej: 'BookOpen')
    icon_name?: string;
    componentName?: string;
    component_name?: string;
    config?: {
        referenceTemplateCode?: string;
        fields?: FieldConfig[];
    };
}

export interface DocumentSchema {
    title: string;
    subtitle: string;
    schema: Record<string, any>;
    lists: string[];
    sections: SectionSchema[];
}

export const DocumentTemplateRegistry: Record<string, DocumentSchema> = {
    PROTOCOLO_INVESTIGACION: {
        title: "Proyecto de Investigación",
        subtitle: "Formulación del Proyecto de Investigación - ISTPET",
        schema: {
            // Sección 1: Identificación
            Titulo: '',
            IdCarrera: 0,
            Periodo: '',
            TiempoEjecucion: '',
            Programa: '',
            Dominio: '',
            LineaInvestigacion: '',
            SublineaInvestigacion: '',
            TipoInvestigacion: 'APLICADA',       // 'BÁSICA' | 'APLICADA' | 'DESARROLLO EXPERIMENTAL'
            CampoAmplio: '',
            CampoEspecifico: '',
            CampoDetallado: '',
            DirectorProyecto: '',
            FechaPresentacion: '',
            FechaInicio: '',
            FechaFin: '',

            // Sección 2: Investigadores
            Investigadores: [],

            // Sección 3: Especificación Técnica
            Antecedentes: '',
            DescripcionProyecto: '',
            Justificacion: '',
            ObjetivoGeneral: '',
            ObjetivosEspecificos: '',
            ObjetivosDesarrolloSostenible: '',
            MarcoTeorico: '',
            Metodologia: '',
            Evaluacion: '',

            // Sección 4: Recursos, Costo y Financiamiento
            RecursosDisponibles: [],
            RecursosNecesarios: [],
            CostoTotal: 0,
            FinanciamientoIstpet: false,
            FinanciamientoOtrasFuentes: false,
            NombresOtrasFuentes: '',

            // Sección 5: Resultados Esperados
            ResultadosEsperados: [],

            // Sección 6: Impactos
            Impacto: { social: '', cientifico: '', economico: '', politico: '', ambiental: '', otro: '' },

            // Sección 7: Cronograma
            Cronograma: [],

            // Sección 8: Bibliografía
            Bibliografia: '',

            // Sección 9: Firmas de Responsabilidad
            FirmasResponsabilidad: {
                DirectorNombre: '',
                DirectorCargo: 'Director del Proyecto',
                CoordinadorNombre: '',
                CoordinadorCargo: 'Coordinador de Carrera'
            }
        },
        lists: ['Investigadores', 'RecursosDisponibles', 'RecursosNecesarios', 'Cronograma'],
        sections: [
            { id: 'identificacion', label: '1. Identificación', iconName: 'FileText', componentName: 'ProjectGeneralSection' },
            { id: 'investigadores', label: '2. Investigadores', iconName: 'Users', componentName: 'ResearchersSection' },
            { id: 'especificacion', label: '3. Especificación', iconName: 'Layers', componentName: 'ProjectTechnicalSection' },
            { id: 'recursos', label: '4. Recursos y Presupuesto', iconName: 'DollarSign', componentName: 'ProjectBudgetSection' },
            { id: 'impactos', label: '6. Impactos', iconName: 'TrendingUp', componentName: 'ImpactsSection' },
            { id: 'cronograma', label: '7. Cronograma (Gantt)', iconName: 'Calendar', componentName: 'GanttSection' },
            { id: 'bibliografia', label: '8. Bibliografía', iconName: 'BookOpen', componentName: 'AgnosticSection' },
            { id: 'firmas', label: '9. Firmas de Responsabilidad', iconName: 'PenTool', componentName: 'SignaturesSection' }
        ]
    },
    PEA_OFICIAL: {
        title: "Programa de Estudio de la Asignatura (PEA)",
        subtitle: "Formato Curricular Oficial Normalizado - ISTPET",
        schema: {
            // Datos Generales de la Asignatura
            CodigoAsignatura: '',
            NombreAsignatura: '',
            Carrera: '',
            Periodo: '',
            Modalidad: 'Presencial',
            Nivel: '',
            UnidadOrganizacion: '',
            TotalHorasAsignatura: 0,
            Creditos: 0,
            HorasContactoDocente: 0,
            HorasPracticoExperimental: 0,
            HorasAutonomo: 0,
            DocenteElaborador: '',

            // Secciones Descriptivas y Metodológicas
            ObjetivoAsignatura: '',
            MetodologiaEnsenanza: '',
            RecursosDidacticos: '',
            EvaluacionAprendizaje: '',

            // Colecciones Curriculares
            Prerrequisitos: [],
            ResultadosAprendizaje: [],
            Unidades: [],
            ActividadesPracticas: [],
            Bibliografias: [],
            Evaluaciones: [],

            // Firmas de Responsabilidad Institucional
            FirmasResponsabilidad: {
                DocenteNombre: '',
                DocenteCargo: 'Docente Elaborador',
                CoordinadorNombre: '',
                CoordinadorCargo: 'Coordinador de Carrera',
                CoordinadorAcadNombre: '',
                CoordinadorAcadCargo: 'Coordinación Académica',
                VicerrectorNombre: '',
                VicerrectorCargo: 'Vicerrectorado Académico'
            }
        },
        lists: ['Prerrequisitos', 'ResultadosAprendizaje', 'Unidades', 'ActividadesPracticas', 'Bibliografias', 'Evaluaciones'],
        sections: [
            { id: 'pea_general_section', label: 'a) Datos Generales y Carga Horaria', iconName: 'FileText', componentName: 'AgnosticSection' },
            { id: 'pea_characterization_section', label: 'b) Objetivo y c) Prerrequisitos', iconName: 'Target', componentName: 'AgnosticSection' },
            { id: 'pea_competencies_rda_section', label: 'd) y e) Resultados de Aprendizaje', iconName: 'Award', componentName: 'AgnosticSection' },
            { id: 'pea_contents_section', label: 'f) Contenidos de Enseñanza', iconName: 'Layers', componentName: 'AgnosticSection' },
            { id: 'pea_methodology_section', label: 'g) Metodología y Recursos Didácticos', iconName: 'BookOpen', componentName: 'AgnosticSection' },
            { id: 'pea_resources_section', label: 'h) Actividades Prácticas', iconName: 'CheckSquare', componentName: 'AgnosticSection' },
            { id: 'pea_evaluation_section', label: 'i) Evaluación del Aprendizaje', iconName: 'BarChart', componentName: 'AgnosticSection' },
            { id: 'pea_bibliography_section', label: 'j) Bibliografía Básica y de Consulta', iconName: 'Library', componentName: 'AgnosticSection' },
            { id: 'pea_signatures_section', label: 'k) Firmas de Responsabilidad', iconName: 'Shield', componentName: 'AgnosticSection' }
        ]
    }
};

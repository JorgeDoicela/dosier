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
    type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'rich-text' | 'list' | 'table';
    collaborative: boolean;
    placeholder?: string;
    min?: number;
    max?: number;
    options?: string[];
    headerStyle?: 'blue' | 'gold' | 'gray' | 'none';
    toolbarMode?: string;
    config?: {
        columns?: string[];
        headers?: string[];
        allowDynamicRows?: boolean;
        allow_dynamic_rows?: boolean;
        headerStyle?: 'blue' | 'gold' | 'gray';
        defaultRows?: any[];
        default_rows?: any[];
    };
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
        toolbarMode?: string;
        fields?: FieldConfig[];
        [key: string]: any;
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
    PEA_OFICIAL: {
        title: "Programa de Estudio de la Asignatura (PEA)",
        subtitle: "Formato Curricular Oficial Normalizado - ISTPET",
        schema: {
            // Datos Generales de la Asignatura
            NombreAsignatura: '',
            CodigoCarrera: '',
            Carrera: '',
            CodigoAsignatura: '',
            Modalidad: 'Presencial',
            UnidadOrganizacion: 'Unidad Profesional',
            Periodo: '',
            Nivel: '',
            TotalHorasAsignatura: 0,
            Creditos: 0,
            HorasContactoDocente: 0,
            HorasPracticoExperimental: 0,
            HorasAutonomo: 0,
            DocenteElaborador: '',

            // Secciones Descriptivas y Metodológicas
            ObjetivoAsignatura: '',
            RdaCarrera: '',
            ResultadosAprendizaje: '',
            MetodologiaEnsenanza: '',
            RecursosDidacticos: '',
            BibliografiaBasica: '',
            BibliografiaConsulta: '',

            // Colecciones Curriculares
            Prerrequisitos: [],
            Unidades: [],
            ActividadesPracticas: [],
            Bibliografias: [],
            Evaluaciones: [],
            FirmasResponsabilidadDetalle: [],

            // Firmas de Responsabilidad Institucional
            FirmasResponsabilidad: {
                DocenteNombre: '',
                DocenteCargo: 'Docente',
                CoordinadorNombre: '',
                CoordinadorCargo: 'Coordinador de Carrera',
                CoordinadorAcadNombre: '',
                CoordinadorAcadCargo: 'Coordinador Académico',
                VicerrectorNombre: '',
                VicerrectorCargo: 'Vicerrectorado'
            }
        },
        lists: ['Prerrequisitos', 'Unidades', 'ActividadesPracticas', 'Bibliografias', 'Evaluaciones', 'FirmasResponsabilidadDetalle'],
        sections: [
            {
                id: 'pea_general_section',
                label: 'Datos Generales de la Asignatura',
                iconName: 'FileText',
                componentName: 'PeaGeneralSection',
                config: {
                    fields: [
                        { name: 'NombreAsignatura', label: 'Nombre de la Asignatura', type: 'text', collaborative: true, placeholder: 'Ej. Desarrollo de Software' },
                        { name: 'CodigoCarrera', label: 'Código de Carrera', type: 'text', collaborative: true, placeholder: 'Ej. SOF-01' },
                        { name: 'Carrera', label: 'Carrera Institucional', type: 'text', collaborative: true, placeholder: 'Ej. Tecnología Superior en Desarrollo de Software' },
                        { name: 'CodigoAsignatura', label: 'Código de la Asignatura', type: 'text', collaborative: true, placeholder: 'Ej. DS-301' },
                        { name: 'Modalidad', label: 'Modalidad de Estudio', type: 'select', collaborative: true, options: ['Presencial', 'Semipresencial', 'En Línea', 'Híbrida'] },
                        { name: 'UnidadOrganizacion', label: 'Unidad de Organización Curricular', type: 'select', collaborative: true, options: ['Unidad Básica', 'Unidad Profesional', 'Unidad de Integración Curricular'] },
                        { name: 'Periodo', label: 'Periodo Académico', type: 'text', collaborative: true, placeholder: 'Ej. OCT2025' },
                        { name: 'Nivel', label: 'Semestre', type: 'text', collaborative: true, placeholder: 'Ej. Tercer Semestre' },
                        { name: 'TotalHorasAsignatura', label: 'Número de horas de la asignatura', type: 'number', collaborative: true, placeholder: 'Ej. 160' },
                        { name: 'Creditos', label: 'Número de créditos', type: 'number', collaborative: true, placeholder: 'Ej. 3' },
                        { name: 'HorasContactoDocente', label: 'Total horas de contacto docente', type: 'number', collaborative: true, placeholder: 'Ej. 64' },
                        { name: 'HorasPracticoExperimental', label: 'Total horas de práctico experimental', type: 'number', collaborative: true, placeholder: 'Ej. 32' },
                        { name: 'HorasAutonomo', label: 'Total horas de aprendizaje autónomo', type: 'number', collaborative: true, placeholder: 'Ej. 64' },
                        { name: 'DocenteElaborador', label: 'Docente Elaborador', type: 'text', collaborative: true, placeholder: 'Nombre del docente titular' }
                    ]
                }
            },
            {
                id: 'pea_objectives_section',
                label: 'Objetivo de la Asignatura',
                iconName: 'Target',
                componentName: 'PeaObjectivesSection',
                config: {
                    toolbarMode: 'none',
                    fields: [
                        {
                            name: 'ObjetivoAsignatura',
                            label: 'Objetivo de la Asignatura',
                            type: 'rich-text',
                            collaborative: true,
                            toolbarMode: 'none',
                            headerStyle: 'blue',
                            placeholder: 'Defina el objetivo formativo general de la asignatura...'
                        }
                    ]
                }
            },
            {
                id: 'pea_prerequisites_section',
                label: 'Prerrequisitos Curriculares',
                iconName: 'CheckSquare',
                componentName: 'PeaPrerequisitesSection',
                config: {
                    fields: [
                        {
                            name: 'Prerrequisitos',
                            label: 'Prerrequisitos Curriculares',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Asignatura Prerrequisito', 'Observación / Condición'],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'pea_career_outcomes_section',
                label: 'Resultados de Aprendizaje de la Carrera (Perfil de Egreso)',
                iconName: 'Award',
                componentName: 'PeaCareerOutcomesSection',
                config: {
                    fields: [
                        {
                            name: 'RdaCarrera',
                            label: 'Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Indique los resultados de aprendizaje del perfil de egreso a los que tributa la asignatura...'
                        }
                    ]
                }
            },
            {
                id: 'pea_subject_outcomes_section',
                label: 'Resultados de Aprendizaje de la Asignatura',
                iconName: 'CheckSquare',
                componentName: 'PeaSubjectOutcomesSection',
                config: {
                    fields: [
                        {
                            name: 'ResultadosAprendizaje',
                            label: 'Resultados de Aprendizaje de la Asignatura',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Redacte los resultados de aprendizaje específicos alcanzables por el estudiante...'
                        }
                    ]
                }
            },
            {
                id: 'pea_contents_section',
                label: 'Contenidos de Enseñanza (Unidades)',
                iconName: 'Layers',
                componentName: 'PeaContentsSection',
                config: {
                    fields: [
                        {
                            name: 'Unidades',
                            label: 'Unidades de Estudio, Horas y Contenidos Temáticos',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Unidad / Tema', 'Contenidos y Subtemas', 'Horas Docencia', 'Horas Práctica', 'Horas Autónomo', 'Total Horas'],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'pea_methodology_section',
                label: 'Metodología y Recursos Didácticos',
                iconName: 'BookOpen',
                componentName: 'PeaMethodologySection',
                config: {
                    fields: [
                        {
                            name: 'MetodologiaEnsenanza',
                            label: 'Estrategias Metodológicas de Enseñanza',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Detalle las estrategias pedagógicas activas según el modelo educativo del ISTPET...'
                        },
                        {
                            name: 'RecursosDidacticos',
                            label: 'Recursos Didácticos / Informatización del Aprendizaje',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Detalle simuladores, entornos virtuales, plataformas, software especializado y materiales didácticos...'
                        }
                    ]
                }
            },
            {
                id: 'pea_resources_section',
                label: 'Actividades Prácticas (APE)',
                iconName: 'CheckSquare',
                componentName: 'PeaResourcesSection',
                config: {
                    fields: [
                        {
                            name: 'ActividadesPracticas',
                            label: 'Actividades Prácticas y Experimentales',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Unidad', 'Nombre de la Práctica y Caracterización de la Actividad'],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'pea_evaluation_section',
                label: 'Evaluación del Aprendizaje',
                iconName: 'BarChart',
                componentName: 'PeaEvaluationSection',
                config: {
                    fields: [
                        {
                            name: 'Evaluaciones',
                            label: 'Evaluación del Aprendizaje',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Notas', 'TIPO DE EVALUACIÓN', 'CALIFICACION'],
                                allowDynamicRows: true,
                                headerStyle: 'blue',
                                defaultRows: []
                            }
                        }
                    ]
                }
            },
            {
                id: 'pea_bibliography_section',
                label: 'Bibliografía',
                iconName: 'Library',
                componentName: 'PeaBibliographySection',
                config: {
                    fields: [
                        {
                            name: 'BibliografiaBasica',
                            label: 'Bibliografía básica',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: '1. Autor, A. (Año). Título de la obra básica. Editorial...'
                        },
                        {
                            name: 'BibliografiaConsulta',
                            label: 'Bibliografía de consulta',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: '1. Enlaces a bases de datos científicas, artículos y libros de consulta complementaria...'
                        }
                    ]
                }
            },
            {
                id: 'pea_signatures_section',
                label: 'Firmas de Responsabilidad',
                iconName: 'Shield',
                componentName: 'PeaSignaturesSection',
                config: {
                    fields: [
                        {
                            name: 'FirmasResponsabilidadDetalle',
                            label: 'Firmas de Responsabilidad',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['DESCRIPCIÓN', 'ELABORADO', 'REVISADO', 'REVISADO', 'APROBADO'],
                                allowDynamicRows: false,
                                headerStyle: 'blue',
                                defaultRows: [
                                    { '0': 'FIRMA', '1': '', '2': '', '3': '', '4': '' },
                                    { '0': 'NOMBRE', '1': '', '2': '', '3': '', '4': '' },
                                    { '0': 'CARGO', '1': 'Docente', '2': 'Coordinador de Carrera', '3': 'Coordinador Académico', '4': 'Vicerrectorado' },
                                    { '0': 'FECHA', '1': '{{fecha_elaborado}}', '2': '', '3': '', '4': '' }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    },
    PLAN_ANALITICO: {
        title: "2. Formato Plan Analítico 2026",
        subtitle: "Planificación Curricular Normalizada - ISTPET",
        schema: {
            CodigoCarrera: '',
            NombreAsignatura: '',
            Carrera: '',
            PeriodoAcademico: '',
            Modalidad: 'Presencial',
            Nivel: '',
            Creditos: '',
            ProfesorResponsable: '',
            HorarioTutoria: '',
            EmailDocente: '',
            ObjetivoGeneral: '',
            ResultadosAprendizaje: []
        },
        lists: ['ResultadosAprendizaje'],
        sections: [
            {
                id: 'plan_analitico_datos_informativos',
                label: '1. Datos Informativos',
                iconName: 'GraduationCap',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'CodigoCarrera', label: 'Código de Carrera', type: 'text', collaborative: true },
                        { name: 'NombreAsignatura', label: 'Asignatura', type: 'text', collaborative: true },
                        { name: 'Carrera', label: 'Carrera', type: 'text', collaborative: true },
                        { name: 'PeriodoAcademico', label: 'Periodo Académico', type: 'text', collaborative: true },
                        { name: 'Modalidad', label: 'Modalidad', type: 'text', collaborative: true },
                        { name: 'Nivel', label: 'Nivel', type: 'text', collaborative: true },
                        { name: 'Creditos', label: 'Créditos', type: 'text', collaborative: true },
                        { name: 'ProfesorResponsable', label: 'Profesor Responsable de la Asignatura', type: 'text', collaborative: true },
                        { name: 'HorarioTutoria', label: 'Horario de tutoría académica', type: 'text', collaborative: true },
                        { name: 'EmailDocente', label: 'E-mail del docente', type: 'text', collaborative: true }
                    ]
                }
            },
            {
                id: 'plan_analitico_objetivo_general',
                label: '2. Objetivo General',
                iconName: 'Target',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'ObjetivoGeneral', label: 'Objetivo General de la Asignatura', type: 'rich-text', collaborative: true }
                    ]
                }
            },
            {
                id: 'plan_analitico_rdas',
                label: '3. Resultados de Aprendizaje de la Asignatura',
                iconName: 'CheckSquare',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'ResultadosAprendizaje',
                            label: 'Resultados de Aprendizaje de la Asignatura',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['ID', 'Al finalizar el curso, el/la estudiante estará en capacidad de', 'Nivel de desarrollo de los resultados de aprendizaje (Inicial / Medio / Alto)'],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'plan_analitico_metodologia_matriz',
                label: '4. Metodología, Contenidos, Resultados de Aprendizaje',
                iconName: 'Layers',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'MatrizAprendizaje19Semanas',
                            label: 'Matriz Semanal de Organización del Aprendizaje (19 Semanas)',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Contenidos (Unidades y Temas)', 'Semana', 'Docencia', 'Práctico Experimental', 'Actividades Autónomas', 'ID RDAs', 'Calificación'],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'plan_analitico_recursos',
                label: '5. Recursos Didácticos / Informatización del Aprendizaje',
                iconName: 'Lightbulb',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'AdaptacionCurricular', label: 'Adaptación Curricular', type: 'select', options: ['Aplica', 'No aplica'], collaborative: true },
                        { name: 'RecursosDidacticos', label: 'Recursos Didácticos e Informatización', type: 'rich-text', collaborative: true }
                    ]
                }
            },
            {
                id: 'plan_analitico_evaluacion',
                label: '6. Evaluación',
                iconName: 'CheckSquare',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'MatrizEvaluacion',
                            label: 'Matriz Oficial de Evaluación',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Notas', 'Tipo de Evaluación', 'Calificación'],
                                allowDynamicRows: false,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'plan_analitico_firmas',
                label: '7. Firmas de Responsabilidad',
                iconName: 'ShieldCheck',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'FirmaElaboradoDocente', label: 'Docente (Elaborado)', type: 'text', collaborative: true },
                        { name: 'FirmaRevisadoCoord', label: 'Coordinador de Carrera (Revisado)', type: 'text', collaborative: true },
                        { name: 'FirmaAprobadoAcad', label: 'Coordinador Académico (Aprobado)', type: 'text', collaborative: true }
                    ]
                }
            }
        ]
    },
    SEGUIMIENTO_TUTORIAS: {
        title: "3. Formato Seguimiento de Tutorías Académicas 2026",
        subtitle: "Acompañamiento y Nivelación Curricular - ISTPET",
        schema: {
            DocenteNombre: '',
            HorarioTutoria: '',
            PeriodoAcademico: 'ABRIL - SEPTIEMBRE 2026',
            TutoriasRegistros: [],
            FirmaDocente: '',
            FirmaCoordinador: ''
        },
        lists: ['TutoriasRegistros'],
        sections: [
            {
                id: 'tutorias_header_section',
                label: '1. Cabecera y Datos del Docente',
                iconName: 'GraduationCap',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'DocenteNombre', label: 'Nombre del Docente', type: 'text', collaborative: true },
                        { name: 'HorarioTutoria', label: 'Horario de Tutoría', type: 'text', collaborative: true },
                        { name: 'PeriodoAcademico', label: 'Periodo Académico', type: 'text', collaborative: true }
                    ]
                }
            },
            {
                id: 'tutorias_matrix_section',
                label: '2. Matriz de Registro de Tutorías (12 Columnas)',
                iconName: 'Layers',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'TutoriasRegistros',
                            label: 'Matriz de Registro de Tutorías',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: [
                                    'Nº',
                                    'Fecha',
                                    'Semana',
                                    'Nombres y Apellidos Estudiantes Convocados',
                                    'Nivel',
                                    'Asignatura',
                                    'Carrera',
                                    'Modalidad de Tutoría',
                                    'Tipos de Tutoría',
                                    'Razón de Tutoría',
                                    'Observaciones',
                                    'Forma de Convocatoria'
                                ],
                                allowDynamicRows: true,
                                headerStyle: 'blue'
                            }
                        }
                    ]
                }
            },
            {
                id: 'tutorias_signatures_section',
                label: '3. Firmas de Responsabilidad',
                iconName: 'ShieldCheck',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'FirmaDocente', label: 'Docente', type: 'text', collaborative: true },
                        { name: 'FirmaCoordinador', label: 'Revisado: Coordinador de Carrera', type: 'text', collaborative: true }
                    ]
                }
            }
        ]
    },
    INFORME_ACOMPANAMIENTO_CARRERA: {
        title: "6. Informe de Acompañamiento Académico de Carrera 26-26",
        subtitle: "Coordinación de Carrera y Unidad Académica - ISTPET",
        schema: {
            InformeTitulo: 'INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA',
            CoordinadorNombre: '',
            CarreraNombre: '',
            PeriodoAcademico: '',
            Parcial: 'Parcial 1/ Modular',
            ReportaA: 'UNIDAD ACADÉMICA',
            FechaPresentacion: '',
            DocentesTutores: [],
            DocentesAporteCarrera: []
        },
        lists: ['DocentesTutores', 'DocentesAporteCarrera'],
        sections: [
            {
                id: 'informe_acomp_datos_informativos_section',
                label: '1. Datos Informativos',
                iconName: 'GraduationCap',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'CoordinadorNombre', label: 'Nombre del Coordinador', type: 'text', collaborative: true },
                        { name: 'CarreraNombre', label: 'Carrera', type: 'text', collaborative: true },
                        { name: 'PeriodoAcademico', label: 'Periodo Académico', type: 'text', collaborative: true },
                        { name: 'Parcial', label: 'Parcial', type: 'text', collaborative: true },
                        { name: 'ReportaA', label: 'Reporta a', type: 'text', collaborative: true },
                        { name: 'FechaPresentacion', label: 'Fecha de Presentación', type: 'text', collaborative: true }
                    ]
                }
            },
            {
                id: 'informe_acomp_nomina_tutores_section',
                label: '2. Nómina de Docentes Tutores',
                iconName: 'Users',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'DocentesTutores',
                            label: 'Nómina de Docentes Tutores',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Tutor', 'Nivel', 'Actividad', 'Medio de verificación'],
                                allowDynamicRows: true
                            }
                        }
                    ]
                }
            },
            {
                id: 'informe_acomp_nomina_docentes_section',
                label: '3. Nómina de Docentes que Aportan a la Carrera',
                iconName: 'Layers',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        {
                            name: 'DocentesAporteCarrera',
                            label: 'Nómina de Docentes que Aportan a la Carrera',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: [
                                    'Nómina',
                                    'Asignaturas',
                                    'Nivel',
                                    'Jornada de trabajo',
                                    'Acciones de mejora (dentro del periodo)',
                                    'Acciones correctivas (final del periodo)'
                                ],
                                allowDynamicRows: true
                            }
                        }
                    ]
                }
            },
            {
                id: 'informe_acomp_gestion_academica_section',
                label: '4. Gestión Académica de la Carrera',
                iconName: 'CheckSquare',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'ReunionesCarrera', label: '4.1 Reuniones de Carrera', type: 'textarea', collaborative: true },
                        { name: 'ActividadesCoordinador', label: '4.2 Actividades Coordinador', type: 'table', collaborative: true },
                        { name: 'EstudiantesMetricas', label: '4.3 Métricas Estudiantes por Nivel', type: 'table', collaborative: true },
                        { name: 'GestionDocente', label: '4.4 Indicadores de Gestión Docente', type: 'table', collaborative: true },
                        { name: 'ObservacionesAcompanamiento', label: '4.5 Observaciones de Acompañamiento', type: 'table', collaborative: true }
                    ]
                }
            },
            {
                id: 'informe_acomp_conclusiones_section',
                label: '5. Conclusiones y Recomendaciones',
                iconName: 'FileText',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'ConclusionesRecomendaciones', label: 'Conclusiones y Recomendaciones por Punto', type: 'textarea', collaborative: true }
                    ]
                }
            },
            {
                id: 'informe_acomp_firmas_section',
                label: '6. Firmas de Responsabilidad',
                iconName: 'ShieldCheck',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'FirmasTutores', label: 'Firmas de Tutores por Nivel', type: 'table', collaborative: true },
                        { name: 'FirmasAutoridades', label: 'Firmas de Coordinación y Autoridades', type: 'table', collaborative: true }
                    ]
                }
            }
        ]
    }
};

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
    GUIA_PRACTICA_LAB: {
        title: "Guía de Práctica de Laboratorio / Taller",
        subtitle: "Formato Institucional de Prácticas Experimentales y de Taller - ISTPET",
        schema: {
            // Sección 1: Identificación
            NumeroPractica: 1,
            TituloPractica: '',
            NombreAsignatura: '',
            Carrera: '',
            Periodo: '',
            Docente: '',
            LaboratorioEspacio: '',
            DuracionHoras: 2,

            // Sección 2: Objetivos
            ObjetivoPractica: '',
            ResultadosAprendizaje: '',

            // Sección 3: Fundamento y Seguridad
            FundamentoTeorico: '',
            NormasSeguridad: '',

            // Sección 4: Recursos
            EquiposMateriales: '',
            SoftwareHerramientas: '',

            // Sección 5: Procedimiento
            ProcedimientoMetodologico: '',

            // Sección 6: Conclusiones
            CriteriosEvaluacion: '',
            BibliografiaRecomendada: ''
        },
        lists: [],
        sections: [
            {
                id: 'guia_identificacion',
                label: '1. Datos Informativos de la Práctica',
                iconName: 'FileText',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'TituloPractica', label: 'Tema / Título de la Práctica', type: 'text', collaborative: true, placeholder: 'Ej. Configuración de VLANs y Enrutamiento Inter-VLAN...' },
                        { name: 'NumeroPractica', label: 'Número de Práctica', type: 'number', collaborative: false, min: 1, max: 50 },
                        { name: 'LaboratorioEspacio', label: 'Laboratorio / Taller Asignado', type: 'text', collaborative: true, placeholder: 'Ej. Laboratorio de Redes y Telecomunicaciones...' },
                        { name: 'DuracionHoras', label: 'Duración Estimada (Horas Pedagógicas)', type: 'number', collaborative: false, min: 1, max: 20 }
                    ]
                }
            },
            {
                id: 'guia_objetivos',
                label: '2. Objetivos y Resultados de Aprendizaje',
                iconName: 'Target',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'ObjetivoPractica', label: 'Objetivo General de la Práctica', type: 'rich-text', collaborative: true, placeholder: 'Defina el objetivo observable y procedimental que el estudiante alcanzará...' },
                        { name: 'ResultadosAprendizaje', label: 'Resultado de Aprendizaje Asociado (del PEA)', type: 'rich-text', collaborative: true, placeholder: 'Copie o vincule el RDA correspondiente del PEA de la asignatura...' }
                    ]
                }
            },
            {
                id: 'guia_fundamento',
                label: '3. Marco Conceptual y Medidas de Seguridad',
                iconName: 'ShieldAlert',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'FundamentoTeorico', label: 'Fundamento Teórico Resumido', type: 'rich-text', collaborative: true, placeholder: 'Conceptos clave, fórmulas o diagramas base para la práctica...' },
                        { name: 'NormasSeguridad', label: 'Normas de Bioseguridad y Operación del Laboratorio', type: 'rich-text', collaborative: true, placeholder: 'Reglas de protección personal, manejo de instrumental y prevención de riesgos...' }
                    ]
                }
            },
            {
                id: 'guia_recursos',
                label: '4. Equipamiento, Materiales e Insumos',
                iconName: 'Wrench',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'EquiposMateriales', label: 'Equipos, Dispositivos e Instrumentos', type: 'rich-text', collaborative: true, placeholder: 'Detalle el instrumental de hardware o componentes requeridos...' },
                        { name: 'SoftwareHerramientas', label: 'Software, Simuladores o Licencias', type: 'rich-text', collaborative: true, placeholder: 'Versiones de software, entornos de desarrollo o simuladores...' }
                    ]
                }
            },
            {
                id: 'guia_procedimiento',
                label: '5. Procedimiento Metodológico Paso a Paso',
                iconName: 'ListOrdered',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'ProcedimientoMetodologico', label: 'Guía de Desarrollo Experimental Paso a Paso', type: 'rich-text', collaborative: true, placeholder: 'Instrucciones ordenadas, capturas de referencia, tablas de registro de datos...' }
                    ]
                }
            },
            {
                id: 'guia_evaluacion',
                label: '6. Criterios de Evaluación y Bibliografía',
                iconName: 'CheckSquare',
                componentName: 'AgnosticSection',
                config: {
                    fields: [
                        { name: 'CriteriosEvaluacion', label: 'Criterios y Rúbrica de Calificación', type: 'rich-text', collaborative: true, placeholder: 'Puntaje asignado al informe, desempeño práctico y cuestionario...' },
                        { name: 'BibliografiaRecomendada', label: 'Bibliografía de Consulta Práctica', type: 'rich-text', collaborative: true, placeholder: 'Manuales técnicos, normas técnicas y referencias...' }
                    ]
                }
            }
        ]
    },
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
            EvaluacionAprendizaje: '',
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
                label: 'a) DATOS GENERALES DE LA ASIGNATURA:',
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
                id: 'pea_characterization_section',
                label: 'b) Objetivo y c) Prerrequisitos',
                iconName: 'Target',
                componentName: 'PeaCharacterizationSection',
                config: {
                    fields: [
                        {
                            name: 'ObjetivoAsignatura',
                            label: 'b) Objetivo de la Asignatura',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Defina el objetivo formativo general de la asignatura...'
                        },
                        {
                            name: 'Prerrequisitos',
                            label: 'c) Prerrequisitos Curriculares',
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
                id: 'pea_competencies_rda_section',
                label: 'd) y e) Resultados de Aprendizaje',
                iconName: 'Award',
                componentName: 'PeaCompetenciesSection',
                config: {
                    fields: [
                        {
                            name: 'RdaCarrera',
                            label: 'd) Resultados de Aprendizaje de la Carrera a los que Aporta',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Indique los resultados de aprendizaje del perfil de egreso a los que tributa la asignatura...'
                        },
                        {
                            name: 'ResultadosAprendizaje',
                            label: 'e) Resultados de Aprendizaje de la Asignatura (RDA)',
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
                label: 'f) Contenidos de Enseñanza',
                iconName: 'Layers',
                componentName: 'PeaContentsSection',
                config: {
                    fields: [
                        {
                            name: 'Unidades',
                            label: 'f) Unidades de Estudio, Horas y Contenidos Temáticos',
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
                label: 'g) Metodología y Recursos Didácticos',
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
                label: 'h) Actividades Prácticas',
                iconName: 'CheckSquare',
                componentName: 'PeaResourcesSection',
                config: {
                    fields: [
                        {
                            name: 'ActividadesPracticas',
                            label: 'h) Actividades Prácticas y Experimentales',
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
                label: 'i) Evaluación del Aprendizaje',
                iconName: 'BarChart',
                componentName: 'PeaEvaluationSection',
                config: {
                    fields: [
                        {
                            name: 'EvaluacionAprendizaje',
                            label: 'Criterios y Políticas de Evaluación',
                            type: 'rich-text',
                            collaborative: true,
                            headerStyle: 'blue',
                            placeholder: 'Describa las políticas institucionales de evaluación continua, formativa y sumativa...'
                        },
                        {
                            name: 'Evaluaciones',
                            label: 'i) EVALUACIÓN DEL APRENDIZAJE',
                            type: 'table',
                            collaborative: true,
                            config: {
                                columns: ['Notas', 'TIPO DE EVALUACIÓN', 'CALIFICACION'],
                                allowDynamicRows: true,
                                headerStyle: 'blue',
                                defaultRows: [
                                    { '0': 'NOTA PARCIAL 1', '1': 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)', '2': '10,00' },
                                    { '0': 'NOTA PARCIAL 2', '1': 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)', '2': '10,00' },
                                    { '0': 'EVALUACIÓN FINAL', '1': 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)', '2': '10,00' }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                id: 'pea_bibliography_section',
                label: 'j) BIBLIOGRAFÍA',
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
                label: 'k) FIRMAS DE RESPONSABILIDAD',
                iconName: 'Shield',
                componentName: 'PeaSignaturesSection',
                config: {
                    fields: [
                        {
                            name: 'FirmasResponsabilidadDetalle',
                            label: 'k) FIRMAS DE RESPONSABILIDAD',
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
                                    { '0': 'FECHA', '1': '', '2': '', '3': '', '4': '' }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    }
};

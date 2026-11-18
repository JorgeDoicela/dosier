/**
 * @file defaultBlocksFactory.ts
 * @description Fábrica centralizada y desacoplada de bloques por defecto para el Template Builder de DOSIER.
 *
 * @architecture
 * Implementa el principio Open/Closed (SOLID) y Strategy Pattern:
 * 1. Para plantillas con definición institucional específica, carga su estructura oficial completa.
 * 2. Para cualquier plantilla nueva o futura, genera automáticamente una estructura rica y coherente
 *    basada en su categoría (DocumentCategory) y sus campos colaborativos (collaborativeFieldsJson).
 * 3. Elimina de forma permanente la aparición de plantillas genéricas vacías o incompletas de 4 bloques.
 */

import type { DocumentTemplateDto, DocumentBlock, BlockType, TechnicalSubsection } from '../types';

/**
 * Genera la portada base institucional con diseño de rombos geométricos del ISTPET.
 */
export function createBaseCoverBlock(
    title: string,
    options: {
        colorTitle?: 'navy' | 'gold' | string;
        carrera?: string;
        periodo?: string;
        themeColor?: string;
        showInstitution?: boolean;
    } = {}
): DocumentBlock {
    return {
        id: `block-cover-${Date.now()}`,
        type: 'cover' as BlockType,
        title: 'Portada Institucional (Rombos)',
        isActive: true,
        config: {
            tituloSuperior: title,
            colorTituloSuperior: options.colorTitle || 'navy',
            prefijoCarrera: 'TECNOLOGÍA SUPERIOR EN',
            prefijoPeriodo: 'PERIODO ACADÉMICO',
            colorTema: options.themeColor || '#1e2a4a',
            colorCarrera: '#1e2a4a',
            colorPeriodo: '#475569',
            colorTemaProyecto: '#1e2a4a',
            colorInstitution: '#1e2a4a',
            institutionVariant: 'clean',
            institutionFontSize: 11,
            institutionItalica: false,
            showInstitution: options.showInstitution !== undefined ? options.showInstitution : true,
            textoInstitucion: 'INSTITUTO TECNOLÓGICO SUPERIOR MAYOR PEDRO TRAVERSARI',
            xLogo: 10,
            yLogo: 3,
            xInstitution: 10,
            yInstitution: 13,
            showTitle: true,
            xTitle: 10,
            yTitle: 32,
            showTemaProyecto: true,
            xTema: 10,
            yTema: 46,
            showCarrera: true,
            xCarrera: 10,
            yCarrera: 70,
            showPeriodo: true,
            xPeriodo: 10,
            yPeriodo: 80
        }
    };
}

/**
 * Genera el bloque de firmas institucional de cierre.
 */
export function createBaseSignaturesBlock(
    signatories: Array<{ label: string; name: string; role: string }>
): DocumentBlock {
    return {
        id: `block-signatures-${Date.now()}`,
        type: 'signatures' as BlockType,
        title: 'Firmas de Responsabilidad y Trazabilidad',
        isActive: true,
        config: {
            signatories
        }
    };
}

/** Subsecciones técnicas de investigación I+D+i */
const RESEARCH_TECHNICAL_SUBSECTIONS: TechnicalSubsection[] = [
    { id: 'sec_antecedentes', fieldKey: 'Antecedentes', numberPrefix: '3.1', title: 'ANTECEDENTES ESPECÍFICOS DE LA PROBLEMÁTICA', placeholder: 'Identificar y analizar estudios previos...', requirementText: 'DETALLAR EN DOS PÁRRAFOS DE 8 A 12 LÍNEAS MÍNIMO', enabled: true, colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_descripcion', fieldKey: 'DescripcionProyecto', numberPrefix: '3.2', title: 'DESCRIPCIÓN DEL PROYECTO', placeholder: 'Definir el propósito del proyecto...', requirementText: 'DETALLAR EN UN PÁRRAFO DE 8 A 12 LÍNEAS MÍNIMO', enabled: true, colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_justificacion', fieldKey: 'Justificacion', numberPrefix: '3.3', title: 'JUSTIFICACIÓN', placeholder: 'Especificar la importancia científica...', requirementText: 'CITAR USANDO NORMAS APA 7MA EDICIÓN', enabled: true, colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_banner_objetivos', fieldKey: 'BannerObjetivos', numberPrefix: '3.4', title: 'OBJETIVOS', placeholder: '', requirementText: '', enabled: true, colSpan: 2, variant: 'banner_gold', hasContent: false, isGroupHeader: true },
    { id: 'sec_objetivo_general', fieldKey: 'ObjetivoGeneral', numberPrefix: '', title: 'GENERAL', placeholder: 'Formular el objetivo general...', requirementText: 'VERBO EN INFINITIVO + ¿QUÉ? + ¿CÓMO? + ¿PARA QUÉ?', enabled: true, colSpan: 1, variant: 'banner_navy', hasContent: true, parentId: 'sec_banner_objetivos' },
    { id: 'sec_objetivos_especificos', fieldKey: 'ObjetivosEspecificos', numberPrefix: '', title: 'ESPECÍFICOS', placeholder: '1. Desarrollar...\n2. Implementar...', requirementText: 'INFINITIVO + ACCIÓN ESPECÍFICA + MEDIO O METODOLOGÍA + PROPÓSITO', enabled: true, colSpan: 1, variant: 'banner_navy', hasContent: true, parentId: 'sec_banner_objetivos' },
    { id: 'sec_marco_teorico', fieldKey: 'MarcoTeorico', numberPrefix: '3.5', title: 'MARCO TEÓRICO', placeholder: 'Describir los conceptos clave...', requirementText: 'EL TEXTO MÁXIMO DEBE ABARCAR DOS PÁGINAS, CITAR USANDO NORMAS APA 7MA EDICIÓN', enabled: true, colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_metodologia', fieldKey: 'Metodologia', numberPrefix: '3.6', title: 'METODOLOGÍA', placeholder: 'Describir el enfoque metodológico...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_evaluacion', fieldKey: 'Evaluacion', numberPrefix: '3.7', title: 'EVALUACIÓN', placeholder: 'Describir los criterios e indicadores...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, colSpan: 2, variant: 'standard', hasContent: true }
];

/**
 * Genera la estructura completa de bloques oficiales del PEA (RRA Art. 21 / ISTPET).
 */
export function createPeaDefaultBlocks(): DocumentBlock[] {
    return [
        // ── PÁGINA 1: CABECERA, DATOS GENERALES, OBJETIVO, PRERREQUISITOS Y RESULTADOS ──
        {
            id: 'block-pea-general',
            type: 'pea_general_section' as BlockType,
            title: '1. DATOS GENERALES DE LA ASIGNATURA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                borderStyle: 'solid',
                showHeader: true,
                institutionName: 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"',
                institutionAddress: 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)',
                documentTitle: 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA',
                showAsignatura: true,
                showCodigoCarrera: true,
                showCarrera: true,
                showCodigoAsignatura: false,
                showModalidad: true,
                showUnidadOrganizacion: true,
                customLabel_showModalidad: 'Modalidad de estudio:',
                customLabel_showUnidadOrganizacion: 'Unidad de Organización Curricular:',
                showPeriodo: true,
                showSemestre: true,
                showTotalHoras: true,
                showCreditos: true,
                showOrganizacionAprendizaje: true,
                customFields: []
            }
        },
        {
            id: 'block-pea-objective',
            type: 'pea_objective_section' as BlockType,
            title: '2. OBJETIVO DE LA ASIGNATURA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                objetivoLabel: '2. OBJETIVO DE LA ASIGNATURA',
                objetivoPlaceholder: 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.',
                lineCount: 4,
                toolbarMode: 'none'
            }
        },
        {
            id: 'block-pea-prerequisites',
            type: 'pea_prerequisites_section' as BlockType,
            title: '3. PRERREQUISITOS CURRICULARES',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                prerrequisitosLabel: '3. PRERREQUISITOS CURRICULARES',
                prerrequisitosColAsignatura: 'Asignatura',
                prerrequisitosColObservacion: 'Observación',
                filasVacias: 2
            }
        },
        {
            id: 'block-pea-career-outcomes',
            type: 'pea_career_outcomes_section' as BlockType,
            title: '4. RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                rdaCarreraLabel: '4. RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA',
                rdaCarreraPlaceholder: 'Resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.',
                lineCount: 4
            }
        },
        {
            id: 'block-pea-subject-outcomes',
            type: 'pea_subject_outcomes_section' as BlockType,
            title: '5. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                rdaAsignaturaLabel: '5. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA',
                rdaAsignaturaPlaceholder: 'Resultados de aprendizaje específicos alcanzables por el estudiante al finalizar el curso.',
                lineCount: 5
            }
        },

        // ── SALTO DE PÁGINA (PÁGINA 1 → PÁGINA 2) ───────────────────────────
        {
            id: 'block-pea-break-1',
            type: 'page_break' as BlockType,
            title: 'Salto de Página A4 (Página 1 → Página 2)',
            isActive: false,
            config: {}
        },

        // ── PÁGINA 2: CONTENIDOS, METODOLOGÍA, ACTIVIDADES PRÁCTICAS Y EVALUACIÓN ─
        {
            id: 'block-pea-contents',
            type: 'pea_contents_section' as BlockType,
            title: '6. CONTENIDOS DE ENSEÑANZA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                subHeaderColor: '#bdd7ee',
                unidades: [
                    { num: 1, titulo: 'UNIDAD 1: INTRODUCCIÓN Y FUNDAMENTOS', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
                    { num: 2, titulo: 'UNIDAD 2: DESARROLLO Y APLICACIÓN PRÁCTICA', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 },
                    { num: 3, titulo: 'UNIDAD 3: INTEGRACIÓN Y EVALUACIÓN', horasTotal: 30, horasCD: 12, horasAPE: 6, horasTA: 12 }
                ]
            }
        },
        {
            id: 'block-pea-methodology',
            type: 'pea_methodology_section' as BlockType,
            title: '7. METODOLOGÍA Y RECURSOS DIDÁCTICOS',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                estrategiasLabel: 'ESTRATEGIAS METODOLÓGICAS',
                estrategiasPlaceholder: 'En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se tiene la sig. metodología...',
                recursosLabel: 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE',
                recursosPlaceholder: 'Simuladores, presentaciones, videos educativos, plataformas virtuales y herramientas interactivas.'
            }
        },
        {
            id: 'block-pea-resources',
            type: 'pea_resources_section' as BlockType,
            title: '8. ACTIVIDADES PRÁCTICAS',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                colUnidadLabel: 'Unidad',
                colPracticaLabel: 'Nombre de la práctica y caracterización de la actividad'
            }
        },
        {
            id: 'block-pea-evaluation',
            type: 'pea_evaluation_section' as BlockType,
            title: '9. EVALUACIÓN DEL APRENDIZAJE',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                tableHeaderBg: '#bdd7ee',
                colNotasLabel: 'Notas',
                colTipoLabel: 'TIPO DE EVALUACIÓN',
                colCalifLabel: 'CALIFICACION',
                parcial1Desc: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)',
                parcial1Nota: '10,00',
                parcial2Desc: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)',
                parcial2Nota: '10,00',
                finalDesc: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)',
                finalNota: '10,00'
            }
        },

        // ── SALTO DE PÁGINA (PÁGINA 2 → PÁGINA 3) ───────────────────────────
        {
            id: 'block-pea-break-2',
            type: 'page_break' as BlockType,
            title: 'Salto de Página A4 (Página 2 → Página 3)',
            isActive: true,
            config: {}
        },

        // ── PÁGINA 3: BIBLIOGRAFÍA Y FIRMAS DE RESPONSABILIDAD ───────────────
        {
            id: 'block-pea-bibliography',
            type: 'pea_bibliography_section' as BlockType,
            title: '10. BIBLIOGRAFÍA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                basicaLabel: 'Bibliografía básica',
                basicaPlaceholder: 'Texto base o guía según normas APA 7ma edición.',
                consultaLabel: 'Bibliografía de consulta',
                consultaPlaceholder: 'Artículos científicos, libros complementarios o recursos web indexados.'
            }
        },
        {
            id: 'block-pea-signatures',
            type: 'pea_signatures_section' as BlockType,
            title: '11. FIRMAS DE RESPONSABILIDAD',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                cargoElaborado: 'Docente',
                cargoRevisado1: 'Coordinador de Carrera',
                cargoRevisado2: 'Coordinador Académico',
                cargoAprobado: 'Vicerrectorado',
                signatureBoxHeight: 95
            }
        }
    ];
}

/**
 * Genera la estructura de bloques oficiales de fábrica para el Formato Plan Analítico 2026.
 * Sigue con máxima fidelidad la estructura editorial y visual del formato institucional oficial del ISTPET.
 */
export function createPlanAnaliticoDefaultBlocks(): DocumentBlock[] {
    return [
        {
            id: 'block-plan-analitico-general',
            type: 'plan_analitico_general_section' as BlockType,
            title: '1. DATOS INFORMATIVOS',
            isActive: true,
            config: {
                documentTitle: 'PLAN ANALÍTICO DE LA ASIGNATURA: NOMBRE DE LA ASIGNATURA',
                sectionTitle: '1.  DATOS INFORMATIVOS',
                headerText: 'Información General',
                headerColor: '#1e2a4a',
                fields: [
                    { key: 'codigo_carrera', label: 'Código de Carrera:', value: '' },
                    { key: 'asignatura', label: 'Asignatura:', value: '' },
                    { key: 'carrera', label: 'Carrera', value: '' },
                    { key: 'periodo', label: 'Periodo Académico:', value: '' },
                    { key: 'modalidad', label: 'Modalidad:', value: '' },
                    { key: 'nivel', label: 'Nivel:', value: '' },
                    { key: 'creditos', label: 'Créditos:', value: '' },
                    { key: 'profesor_responsable', label: 'Profesor Responsable de la Asignatura:', value: '' },
                    { key: 'horario_tutoria', label: 'Horario de tutoría académica:', value: '' },
                    { key: 'email_docente', label: 'E-mail del docente', value: '' }
                ]
            }
        },
        {
            id: 'block-plan-analitico-objective',
            type: 'plan_analitico_objective_section' as BlockType,
            title: '2. OBJETIVO GENERAL',
            isActive: true,
            config: {
                title: '2.  OBJETIVO GENERAL',
                titleColor: '#1e40af',
                html: '<p>Desarrollar competencias profesionales y destrezas técnicas en el estudiantado mediante la aplicación de metodologías activas, prácticas experimentales e investigación aplicada alineadas a las necesidades del entorno productivo y los lineamientos del ISTPET.</p>',
                placeholder: 'Redacte el objetivo general de la asignatura orientado al desarrollo de competencias profesionales...'
            }
        },
        {
            id: 'block-plan-analitico-outcomes',
            type: 'plan_analitico_outcomes_section' as BlockType,
            title: '3. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA',
            isActive: true,
            config: {
                title: '3.  RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA',
                titleColor: '#1e40af',
                headerColor: '#1e2a4a',
                outcomes: [
                    { id: '1', description: 'Analizar los fundamentos teóricos y metodológicos de la asignatura.', level: 'Medio' },
                    { id: '2', description: 'Desarrollar soluciones prácticas contextualizadas al perfil profesional.', level: 'Alto' },
                    { id: '3', description: 'Evaluar resultados técnico-académicos con criterios de rigor e integridad.', level: 'Alto' }
                ]
            }
        },

        // ── SALTO DE PÁGINA (PÁGINA 1 → PÁGINA 2) ───────────────────────────
        {
            id: 'block-plan-analitico-break-1',
            type: 'page_break' as BlockType,
            title: 'Salto de Página A4 (Página 1 → Página 2)',
            isActive: true,
            config: {}
        },

        // ── PÁGINA 2: METODOLOGÍA, CONTENIDOS Y RDAS (MATRIZ SEMANAL 19 SEMANAS) ─
        {
            id: 'block-plan-analitico-matrix',
            type: 'plan_analitico_methodology_matrix_section' as BlockType,
            title: '4. METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE',
            isActive: true,
            config: {
                title: '4.  METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE',
                headerColor: '#1e2a4a',
                weeksLabel: '19 SEMANAS'
            }
        },

        // ── SALTO DE PÁGINA (PÁGINA 2 → PÁGINA 3) ───────────────────────────
        {
            id: 'block-plan-analitico-break-2',
            type: 'page_break' as BlockType,
            title: 'Salto de Página A4 (Página 2 → Página 3)',
            isActive: true,
            config: {}
        },

        // ── PÁGINA 3: RECURSOS DIDÁCTICOS, EVALUACIÓN Y FIRMAS ────────────────
        {
            id: 'block-plan-analitico-resources',
            type: 'plan_analitico_resources_section' as BlockType,
            title: '5. RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE',
            isActive: true,
            config: {
                title: '5.  RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE',
                adaptacionCurricular: 'no_aplica',
                html: '<p>Entorno virtual institucional (Moodle / Teams), proyectores multimedia, laboratorios de cómputo especializados, herramientas de desarrollo colaborativo y software bajo licenciamiento educativo.</p>'
            }
        },
        {
            id: 'block-plan-analitico-evaluation',
            type: 'plan_analitico_evaluation_section' as BlockType,
            title: '6. EVALUACIÓN',
            isActive: true,
            config: {
                title: '6.  EVALUACIÓN',
                headerColor: '#1e2a4a',
                items: [
                    { id: 'eval-1', notaLabel: 'NOTA PARCIAL 1', tipoEvaluacion: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)', calificacion: '10.00' },
                    { id: 'eval-2', notaLabel: 'NOTA PARCIAL 2', tipoEvaluacion: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)', calificacion: '10.00' },
                    { id: 'eval-3', notaLabel: 'NOTA EXAMEN FINAL', tipoEvaluacion: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)', calificacion: '10.00' }
                ]
            }
        },
        {
            id: 'block-plan-analitico-signatures',
            type: 'plan_analitico_signatures_section' as BlockType,
            title: '7. FIRMAS DE RESPONSABILIDAD',
            isActive: true,
            config: {
                title: '7.  FIRMAS DE RESPONSABILIDAD',
                headerColor: '#1e2a4a',
                signatureBoxHeight: 80,
                signatories: [
                    { key: 'elaborado', header: 'ELABORADO', nombre: '', cargo: 'Docente', fecha: '' },
                    { key: 'revisado', header: 'REVISADO', nombre: '', cargo: 'Coordinador de Carrera', fecha: '' },
                    { key: 'aprobado', header: 'APROBADO', nombre: '', cargo: 'Coordinador Académico', fecha: '' }
                ]
            }
        }
    ];
}

/**
 * Genera la estructura de bloques oficiales de fábrica para el Formato de Seguimiento de Tutorías Académicas 2026.
 * Formato apaisado (Landscape A4) con matriz de 12 columnas y circuito de firmas de validación.
 */
export function createTutoriasDefaultBlocks(): DocumentBlock[] {
    return [
        {
            id: 'block-tutorias-header',
            type: 'tutorias_header_section' as BlockType,
            title: '1. CABECERA Y DATOS DEL DOCENTE',
            isActive: true,
            config: {
                institutionName: 'INSTITUTO SUPERIOR TECNOLÓGICO MAYOR PEDRO TRAVERSARI',
                documentTitle: 'SEGUIMIENTO DE TUTORÍAS ACADÉMICAS',
                periodoAcademico: 'PERIODO ACADEMICO ABRIL - SEPTIEMBRE 2026',
                docenteNombre: '',
                horarioTutoria: '',
                headerColor: '#1e2a4a'
            }
        },
        {
            id: 'block-tutorias-matrix',
            type: 'tutorias_matrix_section' as BlockType,
            title: '2. MATRIZ DE REGISTRO DE TUTORÍAS',
            isActive: true,
            config: {
                title: 'REGISTRO DE ACOMPAÑAMIENTO Y TUTORÍAS ACADÉMICAS',
                headerColor: '#1e2a4a',
                tutoriaRows: Array.from({ length: 7 }, (_, i) => ({
                    id: `tutoria-row-${i + 1}`,
                    num: i + 1,
                    fecha: '',
                    semana: '',
                    estudiantesConvocados: '',
                    nivel: '',
                    asignatura: '',
                    carrera: '',
                    modalidadTutoria: '',
                    tipoTutoria: '',
                    razonTutoria: '',
                    observaciones: '',
                    formaConvocatoria: ''
                }))
            }
        },
        {
            id: 'block-tutorias-signatures',
            type: 'tutorias_signatures_section' as BlockType,
            title: '3. FIRMAS DE RESPONSABILIDAD',
            isActive: true,
            config: {
                docenteCargo: 'DOCENTE:',
                docenteNombre: '',
                coordinadorCargo: 'REVISADO: COORDINADOR DE CARRERA',
                coordinadorNombre: ''
            }
        }
    ];
}

/**
 * Genera la estructura oficial del Formato Informe de Acompañamiento Académico de Carrera (2026).
 * Cada punto del documento normativo constituye un bloque modular e interactivo independiente.
 */
export function createInformeAcompanamientoDefaultBlocks(): DocumentBlock[] {
    return [
        {
            id: 'block-informe-1-datos',
            type: 'informe_acomp_datos_informativos_section',
            title: '1. Datos informativos:',
            isActive: true,
            config: {
                informeTitulo: 'INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA',
                informeCoordinador: '',
                informeCarrera: '',
                informePeriodo: '',
                informeParcial: 'Parcial 1/ Modular',
                informeReportaA: 'UNIDAD ACADÉMICA',
                informeFechaPresentacion: ''
            }
        },
        {
            id: 'block-informe-2-tutores',
            type: 'informe_acomp_nomina_tutores_section',
            title: '2. Nómina de docentes tutores:',
            isActive: true,
            config: {
                tutoresRows: [
                    { id: '1', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
                    { id: '2', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
                    { id: '3', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
                    { id: '4', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
                    { id: '5', tutor: '', nivel: '', actividad: '', medioVerificacion: '' }
                ]
            }
        },
        {
            id: 'block-informe-3-docentes',
            type: 'informe_acomp_nomina_docentes_section',
            title: '3. Nómina de docentes que aportan a la carrera:',
            isActive: true,
            config: {
                docentesAporteRows: [
                    { id: '1', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
                    { id: '2', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
                    { id: '3', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
                    { id: '4', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' }
                ]
            }
        },
        {
            id: 'block-informe-4-gestion-academica',
            type: 'informe_acomp_gestion_academica_section',
            title: '4.  Gestión Académica de la carrera',
            isActive: true,
            config: {
                reuniones: {
                    horarioReunion: '',
                    numeroReuniones: '',
                    principalesAspectos: '',
                    principalesAcuerdos: ''
                },
                actividadesCoordinador: [
                    { id: '1', actividad: '', productoEsperado: '', estado: '' },
                    { id: '2', actividad: '', productoEsperado: '', estado: '' },
                    { id: '3', actividad: '', productoEsperado: '', estado: '' },
                    { id: '4', actividad: '', productoEsperado: '', estado: '' }
                ],
                estudiantesNivel: [
                    { id: '1', nivel: '1º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
                    { id: '2', nivel: '2º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
                    { id: '3', nivel: '3º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
                    { id: '4', nivel: '4º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
                    { id: '5', nivel: '5º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' }
                ],
                gestionDocentes: [
                    { id: '1', docente: '', horasContacto: '', evaPermanente: '', horasTutoria: '', estudiantesTutoria: '', horasVinculacion: '', horasInvestigacion: '', horasPracticas: '', horasTitulacion: '', asignaturas: '', estudiantesProblemasRendimiento: '' },
                    { id: '2', docente: '', horasContacto: '', evaPermanente: '', horasTutoria: '', estudiantesTutoria: '', horasVinculacion: '', horasInvestigacion: '', horasPracticas: '', horasTitulacion: '', asignaturas: '', estudiantesProblemasRendimiento: '' },
                    { id: '3', docente: '', horasContacto: '', evaPermanente: '', horasTutoria: '', estudiantesTutoria: '', horasVinculacion: '', horasInvestigacion: '', horasPracticas: '', horasTitulacion: '', asignaturas: '', estudiantesProblemasRendimiento: '' }
                ],
                observaciones: [
                    { id: '1', estudiante: '', nivel: '1º', resultado: '' },
                    { id: '2', estudiante: '', nivel: '2º', resultado: '' },
                    { id: '3', estudiante: '', nivel: '3º', resultado: '' }
                ]
            }
        },
        {
            id: 'block-informe-5-conclusiones',
            type: 'informe_acomp_conclusiones_section',
            title: '5.  Conclusiones y Recomendaciones',
            isActive: true,
            config: {
                bannerText: 'CONCLUSIÓN Y RECOMENDACIÓN POR CADA UNO DE LOS PUNTOS TRATADOS.',
                items: [
                    { id: '1', punto: '1. Sobre la coordinación y datos informativos', conclusion: '', recomendacion: '' },
                    { id: '2', punto: '2. Sobre la nómina de docentes tutores y medios de verificación', conclusion: '', recomendacion: '' },
                    { id: '3', punto: '3. Sobre los docentes que aportan a la carrera y acciones de mejora', conclusion: '', recomendacion: '' },
                    { id: '4', punto: '4. Sobre la gestión académica, reuniones, rendimiento estudiantil y EVA', conclusion: '', recomendacion: '' }
                ]
            }
        },
        {
            id: 'block-informe-6-firmas',
            type: 'informe_acomp_firmas_section',
            title: '6.  Firmas de responsabilidad.',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                firmasTutores: [
                    { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Primer Nivel', fecha: '' },
                    { id: '2', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Segundo Nivel', fecha: '' },
                    { id: '3', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Tercer Nivel', fecha: '' },
                    { id: '4', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Cuarto Nivel', fecha: '' }
                ],
                firmasAutoridades: [
                    { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Coordinador de Carrera', fecha: '' },
                    { id: '2', label: '', nombre: '', cargo: 'Bienestar Institucional', fecha: '' },
                    { id: '3', label: 'APROBADO', nombre: '', cargo: 'Coordinador Académico', fecha: '' }
                ]
            }
        }
    ];
}

/**
 * Fábrica principal de bloques por defecto.
 */
export function generateDefaultBlocksForTemplate(
    template: DocumentTemplateDto,
    _fullData?: any
): DocumentBlock[] {
    const code = template.code.toUpperCase();

    // ─────────────────────────────────────────────────────────────────────────
    // 1. ESTRATEGIAS PARA PLANTILLAS INSTITUCIONALES CONOCIDAS
    // ─────────────────────────────────────────────────────────────────────────

    // A. FORMATO PLAN ANALÍTICO 2026
    if (code === 'PLAN_ANALITICO' || code.includes('PLAN_ANALITICO') || code.includes('ANALITICO')) {
        return createPlanAnaliticoDefaultBlocks();
    }

    // B. FORMATO SEGUIMIENTO DE TUTORÍAS ACADÉMICAS 2026
    if (code === 'SEGUIMIENTO_TUTORIAS' || code.includes('TUTORIA') || code.includes('TUTORÍAS')) {
        return createTutoriasDefaultBlocks();
    }

    // C. INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA 2026
    if (code === 'INFORME_ACOMPANAMIENTO' || code === 'INFORME_ACOMPANAMIENTO_CARRERA' || code.includes('ACOMPANAMIENTO') || code.includes('ACOMPAÑAMIENTO')) {
        return createInformeAcompanamientoDefaultBlocks();
    }

    // D. PROGRAMA DE ESTUDIO DE LA ASIGNATURA (PEA)
    if (code === 'PEA_OFICIAL' || code === 'PEA' || code.includes('PROGRAMA DE ESTUDIO') || template.category === 90) {
        return createPeaDefaultBlocks();
    }




    // ─────────────────────────────────────────────────────────────────────────
    // 2. FÁBRICA INTELIGENTE EXTENSIBLE (FALLBACK POR CATEGORÍA DE NEGOCIO)
    // ─────────────────────────────────────────────────────────────────────────
    const fallbackTitle = template.name || 'DOCUMENTO INSTITUCIONAL';

    return [
        createBaseCoverBlock(fallbackTitle.toUpperCase(), { colorTitle: 'navy' }),
        {
            id: 'block-gen-auto',
            type: 'project_general_section' as BlockType,
            title: '1. IDENTIFICACIÓN Y DATOS GENERALES',
            isActive: true,
            config: {
                showTitulo: true,
                showPrograma: true,
                showGrupo: true,
                showLinea: true,
                showDirector: true,
                showFechas: true
            }
        },
        {
            id: 'block-part-auto',
            type: 'researchers_table' as BlockType,
            title: '2. EQUIPO DE PARTICIPANTES',
            isActive: true,
            config: { mostrarCedula: true, mostrarEmail: true, mostrarHoras: true }
        },
        {
            id: 'block-tech-auto',
            type: 'project_technical_section' as BlockType,
            title: '3. ESPECIFICACIÓN Y PLAN DE TRABAJO',
            isActive: true,
            config: {
                technicalSections: RESEARCH_TECHNICAL_SUBSECTIONS
            }
        },
        createBaseSignaturesBlock([
            { label: 'Responsable del Documento', name: '{{director_proyecto}}', role: 'Responsable' },
            { label: 'Coordinación Institucional', name: 'Ing. Estefani Sánchez Mgtr.', role: 'Coordinadora' }
        ])
    ];
}

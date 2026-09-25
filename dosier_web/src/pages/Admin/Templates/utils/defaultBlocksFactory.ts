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
            title: 'a) DATOS GENERALES DE LA ASIGNATURA:',
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
                showModalidad: true,
                showUnidadOrganizacion: true,
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
            title: 'b) OBJETIVO DE LA ASIGNATURA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                objetivoLabel: 'b) OBJETIVO DE LA ASIGNATURA',
                objetivoPlaceholder: 'Formular con Verbo en infinitivo + ¿Qué? + ¿Cómo? + ¿Para qué? articulado al nivel formativo de la carrera.',
                lineCount: 4
            }
        },
        {
            id: 'block-pea-prerequisites',
            type: 'pea_prerequisites_section' as BlockType,
            title: 'c) PRERREQUISITOS:',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                prerrequisitosLabel: 'c) PRERREQUISITOS:',
                prerrequisitosColAsignatura: 'Asignatura',
                prerrequisitosColObservacion: 'Observación',
                filasVacias: 2
            }
        },
        {
            id: 'block-pea-career-outcomes',
            type: 'pea_career_outcomes_section' as BlockType,
            title: 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                rdaCarreraLabel: 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA',
                rdaCarreraPlaceholder: 'Resultados de aprendizaje del perfil de egreso a los que tributa la asignatura.',
                lineCount: 4
            }
        },
        {
            id: 'block-pea-subject-outcomes',
            type: 'pea_subject_outcomes_section' as BlockType,
            title: 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                rdaAsignaturaLabel: 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:',
                rdaAsignaturaPlaceholder: 'Resultados de aprendizaje específicos alcanzables por el estudiante al finalizar el curso.',
                lineCount: 5
            }
        },

        // ── SALTO DE PÁGINA (PÁGINA 1 → PÁGINA 2) ───────────────────────────
        {
            id: 'block-pea-break-1',
            type: 'page_break' as BlockType,
            title: 'Salto de Página A4 (Página 1 → Página 2)',
            isActive: true,
            config: {}
        },

        // ── PÁGINA 2: CONTENIDOS, METODOLOGÍA, ACTIVIDADES PRÁCTICAS Y EVALUACIÓN ─
        {
            id: 'block-pea-contents',
            type: 'pea_contents_section' as BlockType,
            title: 'f) CONTENIDOS DE ENSEÑANZA:',
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
            title: 'g) METODOLOGÍA DE ENSEÑANZA',
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
            title: 'h) ACTIVIDADES PRÁCTICAS',
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
            title: 'i) EVALUACIÓN DEL APRENDIZAJE',
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
            title: 'j) BIBLIOGRAFÍA',
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
            title: 'k) FIRMAS DE RESPONSABILIDAD',
            isActive: true,
            config: {
                headerColor: '#1e2a4a',
                cargoElaborado: 'Docente',
                cargoRevisado1: 'Coordinador de Carrera',
                cargoRevisado2: 'Coordinador Académico',
                cargoAprobado: 'Vicerrectorado'
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

    // B. GUÍA DE PRÁCTICA DE LABORATORIO / TALLER
    if (code === 'GUIA_PRACTICA_LAB' || code === 'GUIA_PRACTICA' || code.includes('PRÁCTICA') || code.includes('PRACTICA')) {
        return [
            createBaseCoverBlock('GUÍA DE PRÁCTICA DE LABORATORIO / TALLER', { colorTitle: 'navy', showInstitution: true }),
            {
                id: 'block-guia-identificacion',
                type: 'agnostic_section' as BlockType,
                title: '1. DATOS INFORMATIVOS DE LA PRÁCTICA',
                isActive: true,
                config: {
                    title: '1. Datos Informativos',
                    fields: [
                        { name: 'TituloPractica', label: 'Tema / Título de la Práctica', type: 'text', collaborative: true },
                        { name: 'NumeroPractica', label: 'Número de Práctica', type: 'number', collaborative: false },
                        { name: 'LaboratorioEspacio', label: 'Laboratorio / Taller Asignado', type: 'text', collaborative: true },
                        { name: 'DuracionHoras', label: 'Duración Estimada (Horas Pedagógicas)', type: 'number', collaborative: false }
                    ]
                }
            },
            {
                id: 'block-guia-objetivos',
                type: 'rich_text' as BlockType,
                title: '2. OBJETIVOS Y RESULTADOS DE APRENDIZAJE',
                isActive: true,
                config: {
                    title: '2. Objetivos y Resultados de Aprendizaje',
                    placeholder: 'Defina los objetivos formativos y resultados de aprendizaje que el estudiante alcanzará...'
                }
            },
            {
                id: 'block-guia-fundamento',
                type: 'rich_text' as BlockType,
                title: '3. MARCO CONCEPTUAL Y MEDIDAS DE SEGURIDAD',
                isActive: true,
                config: {
                    title: '3. Marco Conceptual y Bioseguridad',
                    placeholder: 'Detalle el sustento teórico y normas de seguridad en laboratorio...'
                }
            },
            {
                id: 'block-guia-recursos',
                type: 'rich_text' as BlockType,
                title: '4. EQUIPAMIENTO, MATERIALES E INSUMOS',
                isActive: true,
                config: {
                    title: '4. Equipamiento e Insumos',
                    placeholder: 'Listado de equipos, instrumental, simuladores o licencias requeridas...'
                }
            },
            {
                id: 'block-guia-procedimiento',
                type: 'rich_text' as BlockType,
                title: '5. PROCEDIMIENTO METODOLÓGICO PASO A PASO',
                isActive: true,
                config: {
                    title: '5. Procedimiento Metodológico',
                    placeholder: 'Instrucciones paso a paso, diagrama de conexión o capturas de referencia...'
                }
            },
            {
                id: 'block-guia-evaluacion',
                type: 'rich_text' as BlockType,
                title: '6. CRITERIOS DE EVALUACIÓN Y BIBLIOGRAFÍA',
                isActive: true,
                config: {
                    title: '6. Evaluación y Bibliografía',
                    placeholder: 'Rúbrica de calificación del informe y bibliografía de consulta técnica...'
                }
            },
            createBaseSignaturesBlock([
                { label: 'Docente Responsable', name: '{{docente_elaborador}}', role: 'Docente de la Asignatura' },
                { label: 'Coordinación de Carrera', name: '{{coordinador_carrera}}', role: 'Coordinador de Carrera' }
            ])
        ];
    }

    // C. PROGRAMA DE ESTUDIO DE LA ASIGNATURA (PEA)
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

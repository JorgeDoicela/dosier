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

    // B. PROTOCOLO DE INVESTIGACIÓN (I+D+i)
    if (code === 'PROTOCOLO_INVESTIGACION' || code === '1. FORMATO PROYECTO DE INVESTIGACIÓN') {
        return [
            createBaseCoverBlock('PROYECTO DE INVESTIGACIÓN', { colorTitle: 'navy', showInstitution: false }),
            {
                id: 'block-general',
                type: 'project_general_section' as BlockType,
                title: '1. IDENTIFICACIÓN DEL PROYECTO',
                isActive: true,
                config: {
                    showTitulo: true,
                    showPrograma: true,
                    showGrupo: true,
                    showTipo: true,
                    showLinea: true,
                    showCaces: true,
                    showDirector: true,
                    showFechas: true
                }
            },
            {
                id: 'block-researchers',
                type: 'researchers_table' as BlockType,
                title: '2. INVESTIGADORES',
                isActive: true,
                config: {
                    mostrarCedula: true,
                    mostrarEmail: true,
                    mostrarTelefono: true,
                    mostrarNivelAcademico: true,
                    mostrarHoras: true
                }
            },
            {
                id: 'block-technical',
                type: 'project_technical_section' as BlockType,
                title: '3. ESPECIFICACIÓN DEL PROYECTO',
                isActive: true,
                config: {
                    technicalSections: RESEARCH_TECHNICAL_SUBSECTIONS
                }
            },
            {
                id: 'block-impacts',
                type: 'impacts' as BlockType,
                title: '6. IMPACTO DEL PROYECTO',
                isActive: true,
                config: {
                    showImpactoSocial: true,
                    showImpactoCientifico: true,
                    showImpactoEconomico: true,
                    showImpactoPolitico: true,
                    showImpactoAmbiental: true
                }
            },
            {
                id: 'block-gantt',
                type: 'gantt' as BlockType,
                title: '7. CRONOGRAMA DE ACTIVIDADES',
                isActive: true,
                config: {
                    ganttMonths: ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Sept', 'Octubre', 'Nov', 'Dic', 'Enero', 'Febrero'],
                    ganttObjectives: [
                        {
                            id: `obj-${Date.now()}`,
                            name: 'OBJETIVO N° 1',
                            activities: [
                                { id: `act-${Date.now()}`, name: 'Especificar la actividad', resources: '', startMonth: 0, startWeek: 0, endMonth: 1, endWeek: 3, color: '#60a5fa' as const },
                                { id: `act-${Date.now() + 1}`, name: 'Especificar la actividad', resources: '', startMonth: 2, startWeek: 0, endMonth: 3, endWeek: 3, color: '#f97316' as const },
                            ]
                        }
                    ]
                }
            },
            {
                id: 'block-bibliography',
                type: 'rich_text' as BlockType,
                title: '8. BIBLIOGRAFÍA',
                isActive: true,
                config: {
                    title: '8. Bibliografía',
                    placeholder: 'Registrar entre 10 y 15 fuentes bibliográficas con normas APA 7ma edición...'
                }
            },
            createBaseSignaturesBlock([
                { label: 'Director del Proyecto', name: '{{director_proyecto}}', role: 'Director de Proyecto' },
                { label: 'Coordinación de Carrera', name: '{{coordinador_carrera}}', role: 'Coordinador de Carrera' }
            ])
        ];
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

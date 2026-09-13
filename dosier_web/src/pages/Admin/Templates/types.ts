export type ToolbarMode = 'apa_full' | 'standard' | 'compact';
export type SignaturesMode = 'team_dynamic' | 'institutional_chain' | 'custom_manual';

export interface DocumentTemplateDto {
    id: number;
    code: string;
    name: string;
    description: string | null;
    category: number;
    version: number;
    isActive: boolean;
    requiresLopdpClause: boolean;
    supportsBlindMode: boolean;
    requiresElectronicSignature: boolean;
    signatureType: string;
    collaborativeFieldsJson: string | null;
    updatedAt: string;
    updatedBy: string | null;
    htmlContent?: string;
    customCss?: string | null;
    themeConfigJson?: string | null;
}

export interface TableRow {
    cells: string[];
}

export interface BentoGridItem {
    id: string;
    key: string;
    label: string;
    type: 'core' | 'custom';
    colSpan: 1 | 2 | 3;
    enabled: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tipos de bloque soportados por el constructor visual
// ─────────────────────────────────────────────────────────────────────────────
export type BlockType =
    | 'cover'
    | 'title'
    | 'rich_text'
    | 'advanced_table'
    | 'multi_section_table'
    | 'two_column'
    | 'page_break'
    | 'gantt'
    | 'researchers_table'
    | 'signatures'
    | 'project_general_section'
    | 'project_technical_section'
    | 'impacts'
    | 'pea_general_section'
    | 'pea_characterization_section'
    | 'pea_competencies_rda_section'
    | 'pea_contents_section'
    | 'pea_methodology_section'
    | 'pea_resources_section'
    | 'pea_evaluation_section'
    | 'pea_bibliography_section'
    | 'pea_signatures_section';

export interface BlockMetaInfo {
    label: string;
    defaultTitle: string;
    category: string;
}

export const BLOCK_METADATA: Record<BlockType, BlockMetaInfo> = {
    cover: { label: 'Portada Institucional', defaultTitle: 'Portada Institucional', category: 'Estructural' },
    title: { label: 'Título de Sección', defaultTitle: 'Título de Sección', category: 'Estructural' },
    rich_text: { label: 'Párrafo Enriquecido', defaultTitle: 'Párrafo Enriquecido', category: 'Contenido' },
    advanced_table: { label: 'Tabla Avanzada', defaultTitle: 'Tabla de Datos', category: 'Tablas' },
    multi_section_table: { label: 'Tabla Multi-Sección', defaultTitle: 'Tabla Multi-Sección', category: 'Tablas' },
    two_column: { label: 'Dos Columnas', defaultTitle: 'Dos Columnas', category: 'Estructural' },
    page_break: { label: 'Salto de Página', defaultTitle: 'Salto de Página', category: 'Estructural' },
    gantt: { label: 'Cronograma de Actividades (Gantt)', defaultTitle: 'Cronograma de Actividades (Gantt)', category: 'Planificación' },
    project_general_section: { label: 'Identificación del Proyecto', defaultTitle: '1. IDENTIFICACIÓN DEL PROYECTO', category: 'Base de Datos' },
    researchers_table: { label: 'Investigadores', defaultTitle: '2. INVESTIGADORES', category: 'Base de Datos' },
    project_technical_section: { label: 'Especificación Técnica', defaultTitle: '3. ESPECIFICACIÓN TÉCNICA', category: 'Base de Datos' },
    impacts: { label: 'Matriz de Impactos', defaultTitle: '6. MATRIZ DE IMPACTOS', category: 'Base de Datos' },
    signatures: { label: 'Firmas de Responsabilidad', defaultTitle: 'FIRMAS DE RESPONSABILIDAD', category: 'Base de Datos' },
    // Bloques Curriculares Oficiales PEA (RRA Art. 21 / ISTPET) - Secciones a) a k)
    pea_general_section: { label: 'a) Datos Generales de la Asignatura', defaultTitle: 'a) DATOS GENERALES DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_characterization_section: { label: 'b) Objetivo y c) Prerrequisitos', defaultTitle: 'b) OBJETIVO DE LA ASIGNATURA Y c) PRERREQUISITOS', category: 'Curricular (PEA)' },
    pea_competencies_rda_section: { label: 'd) RDAs Carrera y e) RDAs Asignatura', defaultTitle: 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_contents_section: { label: 'f) Contenidos de Enseñanza (Unidades)', defaultTitle: 'f) CONTENIDOS DE ENSEÑANZA', category: 'Curricular (PEA)' },
    pea_methodology_section: { label: 'g) Metodología y Recursos Didácticos', defaultTitle: 'g) METODOLOGÍA DE ENSEÑANZA', category: 'Curricular (PEA)' },
    pea_resources_section: { label: 'h) Actividades Prácticas', defaultTitle: 'h) ACTIVIDADES PRÁCTICAS', category: 'Curricular (PEA)' },
    pea_evaluation_section: { label: 'i) Evaluación del Aprendizaje', defaultTitle: 'i) EVALUACIÓN DEL APRENDIZAJE', category: 'Curricular (PEA)' },
    pea_bibliography_section: { label: 'j) Bibliografía Básica y Consulta', defaultTitle: 'j) BIBLIOGRAFÍA', category: 'Curricular (PEA)' },
    pea_signatures_section: { label: 'k) Firmas de Responsabilidad (4 Niveles)', defaultTitle: 'k) FIRMAS DE RESPONSABILIDAD', category: 'Curricular (PEA)' }
};

// ─────────────────────────────────────────────────────────────────────────────
// Configuraciones de bloques específicos
// ─────────────────────────────────────────────────────────────────────────────

export interface TableSection {
    title: string;
    headerStyle: 'blue' | 'gold' | 'gray' | 'none';
    headers: string[];
    colWidths: string[];
    rows: TableRow[];
}

export type ColumnCount = 2 | 3 | 4 | 5 | 6;

export interface Signatory {
    label: string;
    name: string;
    role: string;
}

export interface TechnicalSubsection {
    id: string;
    fieldKey: string;           // p. ej. 'Antecedentes', 'MarcoTeorico', 'custom_1'
    numberPrefix?: string;       // p. ej. '3.1', '1.1'
    title: string;              // p. ej. 'Antecedentes de la Problemática'
    placeholder?: string;        // Guía/Instrucción de redacción
    requirementText?: string;    // Requisito institucional visible en formato tabla/PDF (ej: DETALLAR EN DOS PÁRRAFOS...)
    enabled: boolean;
    scribanVariable?: string;   // Variable Scriban Handlebars en PDF
    legacyKey?: string;         // Referencia booleana retrocompatible (p. ej. 'showAntecedentes')
    colSpan?: 1 | 2;            // 1 = 50% (media fila), 2 = 100% (fila completa)
    variant?: 'standard' | 'banner_gold' | 'banner_navy' | 'header_only';
    hasContent?: boolean;       // true = posee campo redactable (CoWork); false = separador / encabezado puro
    headerColor?: 'navy' | 'gold' | 'slate' | 'emerald' | string;
    isGroupHeader?: boolean;    // true = actúa como categoría/grupo de subsecciones
    parentId?: string;          // ID o fieldKey de la subsección padre
    toolbarMode?: ToolbarMode;  // 'apa_full' | 'standard' | 'compact'
    pageBreakBefore?: boolean;  // Forzar salto de página antes de esta subsección en PDF
    avoidBreakInside?: boolean; // Evitar que la subsección se divida entre páginas en PDF
    borderStyle?: 'solid' | 'accent_left' | 'none' | string;
}

export const DEFAULT_TECHNICAL_SUBSECTIONS: TechnicalSubsection[] = [
    { id: 'sec_antecedentes', fieldKey: 'Antecedentes', numberPrefix: '3.1', title: 'ANTECEDENTES ESPECÍFICOS DE LA PROBLEMÁTICA', placeholder: 'Identificar y analizar estudios previos...', requirementText: 'DETALLAR EN DOS PÁRRAFO DE 8 A 12 LÍNEAS MÍNIMO', enabled: true, scribanVariable: 'antecedentes', legacyKey: 'showAntecedentes', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_descripcion', fieldKey: 'DescripcionProyecto', numberPrefix: '3.2', title: 'DESCRIPCIÓN DEL PROYECTO', placeholder: 'Definir el propósito del proyecto...', requirementText: 'DETALLAR EN UN PÁRRAFO DE 8 A 12 LÍNEAS MÍNIMO', enabled: true, scribanVariable: 'descripcion_proyecto', legacyKey: 'showDescripcionProyecto', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_justificacion', fieldKey: 'Justificacion', numberPrefix: '3.3', title: 'JUSTIFICACIÓN', placeholder: 'Especificar la importancia científica...', requirementText: 'CITAR USANDO NORMAS APA 7MA EDICIÓN', enabled: true, scribanVariable: 'justificacion', legacyKey: 'showJustificacion', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_banner_objetivos', fieldKey: 'BannerObjetivos', numberPrefix: '3.4', title: 'OBJETIVOS', placeholder: '', requirementText: '', enabled: true, scribanVariable: 'banner_objetivos', colSpan: 2, variant: 'banner_gold', hasContent: false, isGroupHeader: true },
    { id: 'sec_objetivo_general', fieldKey: 'ObjetivoGeneral', numberPrefix: '', title: 'GENERAL', placeholder: 'Formular el objetivo general...', requirementText: 'VERBO EN INFINITIVO + ¿QUÉ? + ¿CÓMO? + ¿PARA QUÉ?', enabled: true, scribanVariable: 'objetivo_general', legacyKey: 'showObjetivoGeneral', colSpan: 1, variant: 'banner_navy', hasContent: true, parentId: 'sec_banner_objetivos' },
    { id: 'sec_objetivos_especificos', fieldKey: 'ObjetivosEspecificos', numberPrefix: '', title: 'ESPECÍFICOS', placeholder: '1. Desarrollar...\n2. Implementar...', requirementText: 'INFINITIVO + ACCIÓN ESPECÍFICA + MEDIO O METODOLOGÍA + PROPÓSITO', enabled: true, scribanVariable: 'objetivos_especificos', legacyKey: 'showObjetivosEspecificos', colSpan: 1, variant: 'banner_navy', hasContent: true, parentId: 'sec_banner_objetivos' },
    { id: 'sec_marco_teorico', fieldKey: 'MarcoTeorico', numberPrefix: '3.5', title: 'MARCO TEÓRICO', placeholder: 'Describir los conceptos clave...', requirementText: 'EL TEXTO MÁXIMO DEBE ABARCAR DOS PÁGINAS, CITAR USANDO NORMAS APA 7MA EDICIÓN', enabled: true, scribanVariable: 'marco_teorico', legacyKey: 'showMarcoTeorico', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_metodologia', fieldKey: 'Metodologia', numberPrefix: '3.6', title: 'METODOLOGÍA', placeholder: 'Describir el enfoque metodológico...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, scribanVariable: 'metodologia', legacyKey: 'showMetodologia', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_evaluacion', fieldKey: 'Evaluacion', numberPrefix: '3.7', title: 'EVALUACIÓN', placeholder: 'Describir los criterios e indicadores...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, scribanVariable: 'evaluacion', legacyKey: 'showEvaluacion', colSpan: 2, variant: 'standard', hasContent: true }
];

export interface ImpactCategory {
    id: string;
    key: string;
    title: string;
    placeholder?: string;
    enabled: boolean;
    colSpan?: 1 | 2;
    scribanVariable?: string;
    legacyKey?: string;
}

export const DEFAULT_IMPACT_CATEGORIES: ImpactCategory[] = [
    { id: 'imp_social', key: 'social', title: 'Social / Comunitario', placeholder: 'Impacto directo en la sociedad y la comunidad...', enabled: true, colSpan: 2, scribanVariable: 'impacto.social', legacyKey: 'showSocial' },
    { id: 'imp_cientifico', key: 'cientifico', title: 'Científico / Tecnológico', placeholder: 'Aportes al conocimiento científico e innovaciones tecnológicas...', enabled: true, colSpan: 2, scribanVariable: 'impacto.cientifico', legacyKey: 'showCientifico' },
    { id: 'imp_economico', key: 'economico', title: 'Económico / Productivo', placeholder: 'Beneficios económicos, optimización o desarrollo productivo...', enabled: true, colSpan: 2, scribanVariable: 'impacto.economico', legacyKey: 'showEconomico' },
    { id: 'imp_ambiental', key: 'ambiental', title: 'Ambiental / Ecológico', placeholder: 'Sostenibilidad ambiental y mitigación de huella ecológica...', enabled: true, colSpan: 2, scribanVariable: 'impacto.ambiental', legacyKey: 'showAmbiental' },
    { id: 'imp_educativo', key: 'educativo', title: 'Metodológico / Educativo', placeholder: 'Impacto en la formación académica y metodologías de enseñanza...', enabled: true, colSpan: 2, scribanVariable: 'impacto.educativo', legacyKey: 'showEducativo' },
];

export const DEFAULT_FINAL_REPORT_WRITING_SUBSECTIONS: TechnicalSubsection[] = [
    { id: 'sec_rep_resumen', fieldKey: 'ResumenEjecutivo', numberPrefix: '1.1', title: 'RESUMEN EJECUTIVO', placeholder: 'Sintetizar los principales hallazgos...', requirementText: 'MÁXIMO 250 PALABRAS', enabled: true, colSpan: 2, variant: 'standard' },
    { id: 'sec_rep_intro', fieldKey: 'Introduccion', numberPrefix: '1.2', title: 'INTRODUCCIÓN Y ANTECEDENTES', placeholder: 'Contextualizar el problema...', requirementText: 'DETALLAR CONTEXTO INSTITUCIONAL', enabled: true, colSpan: 2, variant: 'standard' },
    { id: 'sec_rep_resultados', fieldKey: 'ResultadosAlcanzados', numberPrefix: '1.3', title: 'RESULTADOS ALCANZADOS', placeholder: 'Detallar los resultados...', requirementText: 'EVIDENCIAR CUMPLIMIENTO DE OBJETIVOS', enabled: true, colSpan: 2, variant: 'standard' },
    { id: 'sec_rep_conclusiones', fieldKey: 'Conclusiones', numberPrefix: '1.4', title: 'CONCLUSIONES', placeholder: 'Conclusiones derivadas...', requirementText: 'MÍNIMO 3 CONCLUSIONES PRINCIPALES', enabled: true, colSpan: 2, variant: 'standard' },
    { id: 'sec_rep_recomendaciones', fieldKey: 'Recomendaciones', numberPrefix: '1.5', title: 'RECOMENDACIONES', placeholder: 'Recomendaciones para el área...', requirementText: 'ORIENTADAS A LA SOSTENIBILIDAD', enabled: true, colSpan: 2, variant: 'standard' }
];

export const getNormalizedColumns = (cols?: any) => ({
    showCategory: cols?.showCategory !== false,
    showProduct: cols?.showProduct !== false,
    showIndicator: cols?.showIndicator !== false,
    showMeans: cols?.showMeans !== false,
    showTarget: cols?.showTarget !== false,
    showTrl: cols?.showTrl !== false,
    ...cols
});

export const getNormalizedCategories = (cats?: any[]): any[] => {
    if (Array.isArray(cats) && cats.length > 0) return cats;
    return [
        { id: 'cat_articulos', name: 'Artículos Científicos / Ponencias', enabled: true },
        { id: 'cat_libros', name: 'Libros / Capítulos de Libro', enabled: true },
        { id: 'cat_prototipos', name: 'Prototipos / Software / Modelos', enabled: true },
        { id: 'cat_transferencia', name: 'Transferencia Tecnológica / Guías', enabled: true }
    ];
};

export interface DocumentBlock {
    id: string;
    type: BlockType;
    title?: string;
    enabled?: boolean;
    isActive?: boolean;
    config: {
        [key: string]: any;
        // ── cover ───────────────────────────────────────────────────────────
        showInstitution?: boolean;
        showTitle?: boolean;
        showTemaProyecto?: boolean;
        showCarrera?: boolean;
        showPeriodo?: boolean;
        textoInstitucion?: string;
        tituloSuperior?: string;
        placeholderTema?: string;
        carreraPorDefecto?: string;
        periodoPorDefecto?: string;
        colorTituloSuperior?: 'navy' | 'gold' | 'slate' | 'white' | string;
        tituloFontSize?: number;
        tituloItalica?: boolean;
        temaFontSize?: number;
        temaItalica?: boolean;
        carreraFontSize?: number;
        carreraItalica?: boolean;
        periodoFontSize?: number;
        periodoItalica?: boolean;
        headerBgColor?: string;
        headerBorderColor?: string;

        // ── title ───────────────────────────────────────────────────────────
        titleText?: string;
        titleLevel?: 'h1' | 'h2' | 'h3';
        titleColor?: 'navy' | 'gold' | 'slate' | string;
        alignment?: 'left' | 'center' | 'right';
        fontSize?: number | string;
        bold?: boolean;
        italic?: boolean;
        underline?: boolean;
        badgeText?: string;
        badgeColor?: 'blue' | 'gold' | 'green' | 'red';
        badgeAlign?: 'left' | 'center' | 'right';

        // ── rich_text ───────────────────────────────────────────────────────
        content?: string;
        minWords?: number;
        maxWords?: number;
        toolbarMode?: ToolbarMode;
        placeholder?: string;
        requirementText?: string;
        apaGuidelines?: string[];
        showWordCount?: boolean;
        showCharCount?: boolean;
        guidelines?: string[];

        // ── advanced_table / multi_section_table ────────────────────────────
        headers?: string[];
        colWidths?: string[];
        rows?: TableRow[];
        tableSections?: TableSection[];
        columnCount?: ColumnCount;
        tableBorderColor?: string;
        tableHeaderColor?: string;
        alternateRowBg?: boolean;

        // ── two_column ──────────────────────────────────────────────────────
        leftContent?: string;
        rightContent?: string;
        leftWidth?: number;
        rightWidth?: number;

        // ── page_break ──────────────────────────────────────────────────────
        breakType?: 'page' | 'column';

        // ── gantt ───────────────────────────────────────────────────────────
        activities?: any[];
        totalWeeks?: number;

        // ── researchers_table ───────────────────────────────────────────────
        researchers?: any[];

        // ── signatures ──────────────────────────────────────────────────────
        signaturesMode?: SignaturesMode;
        signatories?: Signatory[];
        showSignaturesGrid?: boolean;
        showLegalClause?: boolean;
        customClauseText?: string;

        // ── project_general_section ─────────────────────────────────────────
        generalFields?: BentoGridItem[];

        // ── project_technical_section ───────────────────────────────────────
        technicalSubsections?: TechnicalSubsection[];

        // ── project_budget_section / resources ──────────────────────────────
        budgetItems?: any[];
        totalBudget?: number;

        // ── impacts ─────────────────────────────────────────────────────────
        impacts?: any[];

        // ── certificate blocks ─────────────────────────────────────────────
        certificateTitle?: string;
        certificateSubtitle?: string;
        certificateNumber?: string;
        recipientName?: string;
        recipientRole?: string;
        recipientCedula?: string;
        textAchievement?: string;
        projectTitle?: string;
        completionDate?: string;
    };
}


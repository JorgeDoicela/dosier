export type ToolbarMode = 'none' | 'apa_full' | 'standard' | 'compact';
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
    filenamePattern?: string | null;
    filename_pattern?: string | null;
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
    | 'pea_objective_section'
    | 'pea_prerequisites_section'
    | 'pea_career_outcomes_section'
    | 'pea_subject_outcomes_section'
    | 'pea_characterization_section'
    | 'pea_competencies_rda_section'
    | 'pea_contents_section'
    | 'pea_methodology_section'
    | 'pea_resources_section'
    | 'pea_evaluation_section'
    | 'pea_bibliography_section'
    | 'pea_signatures_section'
    | 'plan_analitico_general_section'
    | 'plan_analitico_objective_section'
    | 'plan_analitico_outcomes_section'
    | 'plan_analitico_methodology_matrix_section'
    | 'plan_analitico_resources_section'
    | 'plan_analitico_evaluation_section'
    | 'plan_analitico_signatures_section'
    | 'tutorias_header_section'
    | 'tutorias_matrix_section'
    | 'tutorias_signatures_section'
    | 'informe_acomp_datos_informativos_section'
    | 'informe_acomp_nomina_tutores_section'
    | 'informe_acomp_nomina_docentes_section'
    | 'informe_acomp_gestion_academica_section'
    | 'informe_acomp_conclusiones_section'
    | 'informe_acomp_firmas_section';

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
    pea_general_section: { label: '1. Datos Generales de la Asignatura', defaultTitle: '1. DATOS GENERALES DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_objective_section: { label: '2. Objetivo de la Asignatura', defaultTitle: '2. OBJETIVO DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_prerequisites_section: { label: '3. Prerrequisitos Curriculares', defaultTitle: '3. PRERREQUISITOS CURRICULARES', category: 'Curricular (PEA)' },
    pea_career_outcomes_section: { label: '4. Resultados de Aprendizaje de la Carrera', defaultTitle: '4. RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA', category: 'Curricular (PEA)' },
    pea_subject_outcomes_section: { label: '5. Resultados de Aprendizaje de la Asignatura', defaultTitle: '5. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_characterization_section: { label: '[Legacy] Objetivo y Prerrequisitos', defaultTitle: 'OBJETIVO DE LA ASIGNATURA Y PRERREQUISITOS', category: 'Curricular (PEA)' },
    pea_competencies_rda_section: { label: '[Legacy] RDAs Carrera y Asignatura', defaultTitle: 'RESULTADOS DE APRENDIZAJE DE LA CARRERA Y DE LA ASIGNATURA', category: 'Curricular (PEA)' },
    pea_contents_section: { label: '6. Contenidos de Enseñanza (Unidades)', defaultTitle: '6. CONTENIDOS DE ENSEÑANZA', category: 'Curricular (PEA)' },
    pea_methodology_section: { label: '7. Metodología y Recursos Didácticos', defaultTitle: '7. METODOLOGÍA Y RECURSOS DIDÁCTICOS', category: 'Curricular (PEA)' },
    pea_resources_section: { label: '8. Actividades Prácticas (APE)', defaultTitle: '8. ACTIVIDADES PRÁCTICAS', category: 'Curricular (PEA)' },
    pea_evaluation_section: { label: '9. Evaluación del Aprendizaje', defaultTitle: '9. EVALUACIÓN DEL APRENDIZAJE', category: 'Curricular (PEA)' },
    pea_bibliography_section: { label: '10. Bibliografía', defaultTitle: '10. BIBLIOGRAFÍA', category: 'Curricular (PEA)' },
    pea_signatures_section: { label: '11. Firmas de Responsabilidad', defaultTitle: '11. FIRMAS DE RESPONSABILIDAD', category: 'Curricular (PEA)' },
    plan_analitico_general_section: { label: '1. Datos Informativos (Información General)', defaultTitle: '1. DATOS INFORMATIVOS', category: 'Plan Analítico (2026)' },
    plan_analitico_objective_section: { label: '2. Objetivo General', defaultTitle: '2. OBJETIVO GENERAL', category: 'Plan Analítico (2026)' },
    plan_analitico_outcomes_section: { label: '3. Resultados de Aprendizaje', defaultTitle: '3. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA', category: 'Plan Analítico (2026)' },
    plan_analitico_methodology_matrix_section: { label: '4. Metodología, Contenidos y RDAs (19 Semanas)', defaultTitle: '4. METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE', category: 'Plan Analítico (2026)' },
    plan_analitico_resources_section: { label: '5. Recursos Didácticos & Adaptación Curricular', defaultTitle: '5. RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE', category: 'Plan Analítico (2026)' },
    plan_analitico_evaluation_section: { label: '6. Evaluación del Aprendizaje', defaultTitle: '6. EVALUACIÓN', category: 'Plan Analítico (2026)' },
    plan_analitico_signatures_section: { label: '7. Firmas de Responsabilidad (3 Firmas)', defaultTitle: '7. FIRMAS DE RESPONSABILIDAD', category: 'Plan Analítico (2026)' },
    tutorias_header_section: { label: '1. Cabecera y Datos del Docente', defaultTitle: '1. CABECERA Y DATOS DEL DOCENTE', category: 'Tutorías Académicas (2026)' },
    tutorias_matrix_section: { label: '2. Matriz de Registro de Tutorías (12 Columnas)', defaultTitle: '2. MATRIZ DE REGISTRO DE TUTORÍAS', category: 'Tutorías Académicas (2026)' },
    tutorias_signatures_section: { label: '3. Firmas de Responsabilidad (Docente y Coordinador)', defaultTitle: '3. FIRMAS DE RESPONSABILIDAD', category: 'Tutorías Académicas (2026)' },
    informe_acomp_datos_informativos_section: { label: '1. Datos Informativos', defaultTitle: '1. Datos informativos:', category: 'Informe Acompañamiento Carrera (2026)' },
    informe_acomp_nomina_tutores_section: { label: '2. Nómina de Docentes Tutores', defaultTitle: '2. Nómina de docentes tutores:', category: 'Informe Acompañamiento Carrera (2026)' },
    informe_acomp_nomina_docentes_section: { label: '3. Nómina de Docentes que Aportan a la Carrera', defaultTitle: '3. Nómina de docentes que aportan a la carrera:', category: 'Informe Acompañamiento Carrera (2026)' },
    informe_acomp_gestion_academica_section: { label: '4. Gestión Académica de la Carrera (5 Sub-Secciones)', defaultTitle: '4.  Gestión Académica de la carrera', category: 'Informe Acompañamiento Carrera (2026)' },
    informe_acomp_conclusiones_section: { label: '5. Conclusiones y Recomendaciones', defaultTitle: '5.  Conclusiones y Recomendaciones', category: 'Informe Acompañamiento Carrera (2026)' },
    informe_acomp_firmas_section: { label: '6. Firmas de Responsabilidad (Tutores y Autoridades)', defaultTitle: '6.  Firmas de responsabilidad.', category: 'Informe Acompañamiento Carrera (2026)' }
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

        // ── tutorias blocks (2026) ──────────────────────────────────────────
        docenteNombre?: string;
        horarioTutoria?: string;
        periodoAcademico?: string;
        coordinadorNombre?: string;
        coordinadorCargo?: string;
        tutoriaRows?: TutoriaRowItem[];

        // ── informe acompañamiento carrera blocks (2026) ───────────────────
        informeTitulo?: string;
        informeCoordinador?: string;
        informeCarrera?: string;
        informePeriodo?: string;
        informeParcial?: string;
        informeReportaA?: string;
        informeFechaPresentacion?: string;
        tutoresRows?: DocenteTutorRowItem[];
        docentesAporteRows?: DocenteAporteRowItem[];
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Estructuras de datos para Informe de Acompañamiento Académico de Carrera
// ─────────────────────────────────────────────────────────────────────────────

export interface DocenteTutorRowItem {
    id: string;
    tutor: string;
    nivel: string;
    actividad: string;
    medioVerificacion: string;
}

export interface DocenteAporteRowItem {
    id: string;
    nomina: string;
    asignaturas: string;
    nivel: string;
    jornadaTrabajo: string;
    accionesMejora: string;
    accionesCorrectivas: string;
}

export interface InformeAcompDatosInformativosConfig {
    informeTitulo?: string;
    informeCoordinador?: string;
    informeCarrera?: string;
    informePeriodo?: string;
    informeParcial?: string;
    informeReportaA?: string;
    informeFechaPresentacion?: string;
}

export interface InformeAcompNominaTutoresConfig {
    tutoresRows?: DocenteTutorRowItem[];
}

export interface InformeAcompNominaDocentesConfig {
    docentesAporteRows?: DocenteAporteRowItem[];
}

export interface ReunionCarreraConfig {
    horarioReunion?: string;
    numeroReuniones?: string | number;
    principalesAspectos?: string;
    principalesAcuerdos?: string;
}

export interface ActividadCoordinadorRowItem {
    id: string;
    actividad: string;
    productoEsperado: string;
    estado: string;
}

export interface EstudianteNivelRowItem {
    id: string;
    nivel: string;
    matriculados: string | number;
    retirados: string | number;
    problemasAsistencia: string | number;
    problemasRendimiento: string | number;
    noRindieronExamen: string | number;
    bienestarInstitucional: string | number;
    becados: string | number;
}

export interface GestionDocenteRowItem {
    id: string;
    docente: string;
    horasContacto: string;
    evaPermanente: string;
    horasTutoria: string;
    estudiantesTutoria: string;
    horasVinculacion: string;
    horasInvestigacion: string;
    horasPracticas: string;
    horasTitulacion: string;
    asignaturas: string;
    estudiantesProblemasRendimiento: string;
}

export interface AcompanamientoObservacionRowItem {
    id: string;
    estudiante: string;
    nivel: string;
    resultado: string;
}

export interface InformeAcompGestionAcademicaConfig {
    sectionTitle?: string;
    reuniones?: ReunionCarreraConfig;
    actividadesCoordinador?: ActividadCoordinadorRowItem[];
    estudiantesNivel?: EstudianteNivelRowItem[];
    gestionDocentes?: GestionDocenteRowItem[];
    observaciones?: AcompanamientoObservacionRowItem[];
}

export interface ConclusionRecomendacionItem {
    id: string;
    punto: string;
    conclusion: string;
    recomendacion: string;
}

export interface InformeAcompConclusionesConfig {
    sectionTitle?: string;
    bannerText?: string;
    items?: ConclusionRecomendacionItem[];
    rawText?: string;
}

export interface FirmaTutorNivelItem {
    id: string;
    label: string;
    nombre: string;
    cargo: string;
    fecha: string;
}

export interface FirmaAutoridadItem {
    id: string;
    label: string;
    nombre: string;
    cargo: string;
    fecha: string;
}

export interface InformeAcompFirmasConfig {
    sectionTitle?: string;
    headerColor?: string;
    firmasTutores?: FirmaTutorNivelItem[];
    firmasAutoridades?: FirmaAutoridadItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Estructuras de datos para Tutorías Académicas (Formato Oficial ISTPET)
// ─────────────────────────────────────────────────────────────────────────────

export interface TutoriaRowItem {
    id: string;
    num: number;
    fecha: string;
    semana: string | number;
    estudiantesConvocados: string;
    nivel: string;
    asignatura: string;
    carrera: string;
    modalidadTutoria: string;
    tipoTutoria: string;
    razonTutoria: string;
    observaciones: string;
    formaConvocatoria: string;
}

export interface TutoriasHeaderConfig {
    institutionName?: string;
    documentTitle?: string;
    periodoAcademico?: string;
    docenteNombre?: string;
    horarioTutoria?: string;
    headerColor?: string;
}

export interface TutoriasMatrixConfig {
    headerColor?: string;
    rows?: TutoriaRowItem[];
}

export interface TutoriasSignaturesConfig {
    docenteNombre?: string;
    docenteCargo?: string;
    coordinadorNombre?: string;
    coordinadorCargo?: string;
}



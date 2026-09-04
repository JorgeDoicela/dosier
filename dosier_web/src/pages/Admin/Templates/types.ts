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
    | 'project_progress_report'
    | 'impacts'
    | 'progress_header_section'
    | 'progress_activity_section'
    | 'progress_status_section';

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
    project_progress_report: { label: 'Avance de Ejecución', defaultTitle: '7. AVANCE DE EJECUCIÓN', category: 'Base de Datos' },
    signatures: { label: 'Firmas de Responsabilidad', defaultTitle: 'FIRMAS DE RESPONSABILIDAD', category: 'Base de Datos' },
    progress_header_section: { label: 'Datos Generales del Proyecto', defaultTitle: '1. DATOS GENERALES DEL PROYECTO', category: 'Informe de Avance' },
    progress_activity_section: { label: 'Matriz de Actividades y Avance', defaultTitle: '2. MATRIZ DE ACTIVIDADES Y AVANCE', category: 'Informe de Avance' },
    progress_status_section: { label: 'Estado y Observaciones', defaultTitle: '3. ESTADO Y OBSERVACIONES GENERALES', category: 'Informe de Avance' }
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
    { id: 'sec_ods', fieldKey: 'ObjetivosDesarrolloSostenible', numberPrefix: '3.5', title: 'OBJETIVOS DE DESARROLLO SOSTENIBLE', placeholder: 'Los objetivos de desarrollo sostenible de la ONU son 17...', requirementText: 'Alineación con Objetivos de Desarrollo Sostenible ONU', enabled: true, scribanVariable: 'objetivos_desarrollo_sostenible', legacyKey: 'showOds', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_marco_teorico', fieldKey: 'MarcoTeorico', numberPrefix: '3.6', title: 'MARCO TEÓRICO', placeholder: 'Describir los conceptos clave...', requirementText: 'EL TEXTO MÁXIMO DEBE ABARCAR DOS PÁGINAS, CITAR USANDO NORMAS APA 7MA EDICIÓN', enabled: true, scribanVariable: 'marco_teorico', legacyKey: 'showMarcoTeorico', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_metodologia', fieldKey: 'Metodologia', numberPrefix: '3.7', title: 'METODOLOGÍA', placeholder: 'Describir el enfoque metodológico...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, scribanVariable: 'metodologia', legacyKey: 'showMetodologia', colSpan: 2, variant: 'standard', hasContent: true },
    { id: 'sec_evaluacion', fieldKey: 'Evaluacion', numberPrefix: '3.8', title: 'EVALUACIÓN', placeholder: 'Describir los criterios e indicadores...', requirementText: 'DETALLAR EN MÍNIMO 2 PÁRRAFOS DE 5 LÍNEAS', enabled: true, scribanVariable: 'evaluacion', legacyKey: 'showEvaluacion', colSpan: 2, variant: 'standard', hasContent: true }
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

        // ── progress_header_section ─────────────────────────────────────────
        progressHeaderFields?: ProgressHeaderField[];
        progressHeaderTitle?: string;
        progressHeaderColor?: 'navy' | 'gold' | 'slate' | string;

        // ── progress_activity_section ───────────────────────────────────────
        activityColumns?: ProgressActivityColumn[];
        activityVariants?: ProgressActivityVariant[];
        activityHeaderColor?: 'navy' | 'gold' | 'slate' | string;

        // ── progress_status_section ────────────────────────────────────────
        statusTitle?: string;
        progressStatusSections?: ProgressStatusSubsection[];
        progressStatusHeaderColor?: 'navy' | 'gold' | 'slate' | string;
        statusOptions?: string[];

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

// ─────────────────────────────────────────────────────────────────────────────
// Interfaces del Informe de Avance (Subsecciones configurables)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProgressHeaderField {
    id: string;
    fieldKey: string;
    label: string;
    scribanVariable?: string;
    enabled: boolean;
    colSpan: 1 | 2;
    fieldType: 'text' | 'date' | 'checkbox_group' | 'computed';
    options?: string[];
    placeholder?: string;
    readOnly?: boolean;
}

export const DEFAULT_PROGRESS_HEADER_FIELDS: ProgressHeaderField[] = [
    { id: 'ph_numero', fieldKey: 'NumeroInforme', label: 'Número de Informe', scribanVariable: 'numero_informe', enabled: true, colSpan: 1, fieldType: 'text', readOnly: true },
    { id: 'ph_titulo', fieldKey: 'NombreProyecto', label: 'Nombre del Proyecto', scribanVariable: 'nombre_proyecto', enabled: true, colSpan: 2, fieldType: 'computed', readOnly: true },
    { id: 'ph_programa', fieldKey: 'Programa', label: 'Programa', scribanVariable: 'programa', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_grupo', fieldKey: 'GrupoInvestigacion', label: 'Grupo de Investigación', scribanVariable: 'grupo_investigacion', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_dominio', fieldKey: 'Dominio', label: 'Dominio', scribanVariable: 'dominio', enabled: true, colSpan: 2, fieldType: 'computed', readOnly: true },
    { id: 'ph_linea', fieldKey: 'LineaInvestigacion', label: 'Línea de Investigación', scribanVariable: 'linea_investigacion', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_sublinea', fieldKey: 'SublineaInvestigacion', label: 'Sublínea de Investigación', scribanVariable: 'sublinea_investigacion', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_campo_amplio', fieldKey: 'CampoAmplio', label: 'Campo Amplio', scribanVariable: 'campo_amplio', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_campo_especifico', fieldKey: 'CampoEspecifico', label: 'Campo Específico', scribanVariable: 'campo_especifico', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_campo_detallado', fieldKey: 'CampoDetallado', label: 'Campo Detallado', scribanVariable: 'campo_detallado', enabled: true, colSpan: 2, fieldType: 'computed', readOnly: true },
    { id: 'ph_carrera', fieldKey: 'Carrera', label: 'Carrera', scribanVariable: 'carrera', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_tipo', fieldKey: 'TipoInvestigacion', label: 'Tipo de Investigación', scribanVariable: 'tipo_investigacion', enabled: true, colSpan: 1, fieldType: 'checkbox_group', options: ['BÁSICA', 'APLICADA', 'DESARROLLO EXPERIMENTAL'] },
    { id: 'ph_periodo', fieldKey: 'Periodo', label: 'Período Académico', scribanVariable: 'periodo', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_director', fieldKey: 'DirectorProyecto', label: 'Director del Proyecto', scribanVariable: 'director_proyecto', enabled: true, colSpan: 1, fieldType: 'computed', readOnly: true },
    { id: 'ph_investigadores', fieldKey: 'InvestigadoresTexto', label: 'Investigadores Activos', scribanVariable: 'investigadores_texto', enabled: true, colSpan: 2, fieldType: 'computed', readOnly: true },
    { id: 'ph_fechas', fieldKey: 'Fechas', label: 'Fechas (Inicio → Fin)', scribanVariable: 'fechas', enabled: true, colSpan: 2, fieldType: 'computed', readOnly: true },
];

export type ProgressActivityVariant = 'ejecutadas' | 'no_previstas' | 'obstaculos';

export interface ProgressActivityColumn {
    id: string;
    fieldKey: string;
    label: string;
    scribanVariable?: string;
    enabled: boolean;
    colSpan: 1 | 2;
    colWidthPct?: number;
    fieldType: 'text' | 'rich_text' | 'number_pct' | 'date' | 'textarea';
    placeholder?: string;
    requirementText?: string;
    variant?: 'standard' | 'banner_gold' | 'banner_navy';
    headerColor?: 'navy' | 'gold' | 'slate';
}

export const DEFAULT_ACTIVITY_COLUMNS: ProgressActivityColumn[] = [
    { id: 'col_num', fieldKey: 'NumeroActividad', label: 'N° Actividad', scribanVariable: 'numero_actividad', enabled: true, colSpan: 1, colWidthPct: 10, fieldType: 'text', placeholder: 'Actividad 1' },
    { id: 'col_objetivo', fieldKey: 'ObjetivoAsociado', label: 'Objetivo Específico', scribanVariable: 'objetivo_asociado', enabled: false, colSpan: 2, colWidthPct: 20, fieldType: 'textarea', placeholder: 'Objetivo al que se asocia...' },
    { id: 'col_limitacion', fieldKey: 'Limitacion', label: 'Limitación / Obstáculo', scribanVariable: 'limitacion', enabled: false, colSpan: 2, colWidthPct: 20, fieldType: 'textarea', placeholder: 'Describir el obstáculo encontrado...' },
    { id: 'col_actividades', fieldKey: 'ActividadesEjecutadas', label: 'Actividades Ejecutadas', scribanVariable: 'actividades_ejecutadas', enabled: true, colSpan: 2, colWidthPct: 35, fieldType: 'rich_text', placeholder: 'Describir las actividades realizadas...', requirementText: 'DETALLAR POR CADA ACTIVIDAD REALIZADA' },
    { id: 'col_resultados', fieldKey: 'ResultadosObtenidos', label: 'Resultados Obtenidos', scribanVariable: 'resultados_obtenidos', enabled: true, colSpan: 2, colWidthPct: 25, fieldType: 'rich_text', placeholder: 'Resultados alcanzados...', requirementText: 'INCLUIR EVIDENCIAS EN ANEXOS' },
    { id: 'col_pct', fieldKey: 'PorcentajeAvance', label: '% Avance', scribanVariable: 'porcentaje_avance', enabled: true, colSpan: 1, colWidthPct: 8, fieldType: 'number_pct', placeholder: '0' },
    { id: 'col_participantes', fieldKey: 'Participantes', label: 'Participantes', scribanVariable: 'participantes', enabled: true, colSpan: 1, colWidthPct: 12, fieldType: 'text', placeholder: 'Director + Investigadores' },
    { id: 'col_inicio', fieldKey: 'FechaInicio', label: 'Fecha Inicio', scribanVariable: 'fecha_inicio', enabled: true, colSpan: 1, colWidthPct: 10, fieldType: 'date' },
    { id: 'col_fin', fieldKey: 'FechaFin', label: 'Fecha Fin', scribanVariable: 'fecha_fin', enabled: true, colSpan: 1, colWidthPct: 10, fieldType: 'date' },
    { id: 'col_obs', fieldKey: 'Observaciones', label: 'Observaciones', scribanVariable: 'observaciones', enabled: true, colSpan: 2, colWidthPct: 15, fieldType: 'textarea', placeholder: 'Ver Anexo N°...' },
];

export interface ProgressStatusSubsection {
    id: string;
    fieldKey: string;
    title: string;
    enabled: boolean;
    colSpan: 1 | 2;
    fieldType: 'status_table' | 'rich_text' | 'readonly_text';
    placeholder?: string;
    requirementText?: string;
    scribanVariable?: string;
    accessRole?: 'all' | 'director' | 'admin';
    variant?: 'standard' | 'banner_gold' | 'banner_navy' | 'header_only';
}

export const DEFAULT_PROGRESS_STATUS_SUBSECTIONS: ProgressStatusSubsection[] = [
    { id: 'ps_estado', fieldKey: 'EstadoEjecucion', title: 'ESTADO DE EJECUCIÓN DEL PROYECTO', enabled: true, colSpan: 2, fieldType: 'status_table', scribanVariable: 'estado_ejecucion', accessRole: 'all', variant: 'banner_navy', requirementText: 'MARCAR CON X EL ESTADO ACTUAL' },
    { id: 'ps_descripcion', fieldKey: 'DescripcionFaseActual', title: 'DESCRIPCIÓN DE LA FASE ACTUAL', enabled: true, colSpan: 2, fieldType: 'rich_text', scribanVariable: 'descripcion_fase_actual', accessRole: 'all', variant: 'standard', placeholder: 'Describir brevemente el estado actual del proyecto...', requirementText: 'DETALLAR EN 3 A 6 LÍNEAS' },
    { id: 'ps_obs_director', fieldKey: 'ObservacionesDirector', title: 'OBSERVACIONES DEL DIRECTOR', enabled: true, colSpan: 2, fieldType: 'rich_text', scribanVariable: 'observaciones_director', accessRole: 'director', variant: 'banner_gold', placeholder: 'Observaciones del Director del Proyecto...' },
    { id: 'ps_obs_coord', fieldKey: 'ObservacionesCoordinador', title: 'OBSERVACIONES DEL COORDINADOR DOSIER', enabled: true, colSpan: 2, fieldType: 'rich_text', scribanVariable: 'observaciones_coordinador', accessRole: 'admin', variant: 'banner_gold', placeholder: 'Revisión y observaciones del Coordinador de Investigación...' },
];


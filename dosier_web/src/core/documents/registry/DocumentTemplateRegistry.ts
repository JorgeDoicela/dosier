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
            IdConvocatoria: 0,
            Periodo: '',
            TiempoEjecucion: '',
            Programa: '',
            GrupoInvestigacionTipo: 'NO',       // 'NO' | 'SI'
            GrupoInvestigacionNombre: '',
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

            // Sección 5: Productos Esperados
            ProductosEsperados: [],

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

    INFORME_AVANCE: {
        title: "Informe de Avance de Proyecto",
        subtitle: "Ejecución y Monitoreo (Fase 3)",
        schema: {
            // Sección 1: Bitácora Científica & Actividades Ejecutadas
            ConclusionesParciales: '',
            ActividadesEjecutadas: [],
            ActividadesNoPrevistas: [],
            Obstaculos: [],
            
            // Sección 2: Estado de Ejecución
            EstadoEjecucion: 'EN AVANCE',
            DescripcionFaseActual: '',
            
            // Sección 3: Observaciones y Roles
            ObservacionesDirector: '',
            ObservacionesCoordinador: '',
            
            // Legacy / Compatibilidad
            HitosCompletados: [],
            Evidencias: [],
            PresupuestoEjecutado: [],
        },
        lists: ['ActividadesEjecutadas', 'ActividadesNoPrevistas', 'Obstaculos', 'HitosCompletados', 'Evidencias', 'PresupuestoEjecutado'],
        sections: [
            { id: 'avance_bitacora', label: '1. Bitácora Científica', iconName: 'FileText', componentName: 'ProgressLogSection' },
            { id: 'avance_estado', label: '2. Estado de Ejecución', iconName: 'CheckCircle', componentName: 'ProgressStateSection' },
            { id: 'avance_observaciones', label: '3. Observaciones y Firmas', iconName: 'PenTool', componentName: 'ProgressObservationsSection' }
        ]
    },

    INFORME_FINAL_INVESTIGACION: {
        title: "Informe Final de Investigación",
        subtitle: "Cierre institucional y consolidación de resultados - ISTPET",
        schema: {
            // Ficha Técnica
            Titulo: '',
            Programa: '',
            Carrera: '',
            Periodo: '',
            TipoInvestigacion: '',
            AlcanceProyecto: '',
            FechaInicio: '',
            FechaFin: '',
            Investigadores: [],
            // Redacción Científica y Resultados
            Indice: '',
            Resumen: '',
            Introduccion: '',
            Objetivos: '',
            Fundamentos: '',
            Metodos: '',
            Resultados: '',
            Productos: '',
            Impactos: '',
            Transferencia: '',
            InformeFinanciero: '',
            Conclusiones: '',
            Recomendaciones: '',
            Bibliografia: '',
            Anexos: ''
        },
        lists: ['Investigadores'],
        sections: [
            {
                id: 'datos_generales_informe_final',
                label: '1. Datos del Proyecto',
                iconName: 'BookOpen',
                componentName: 'FinalReportHeaderSection',
                config: {
                    showTipoInvestigacion: true,
                    showAlcanceProyecto: true,
                    showFechasProyecto: true,
                    showTablaInvestigadores: true
                }
            },
            {
                id: 'redaccion_informe_final',
                label: '2. Redacción Científica y Resultados',
                iconName: 'FileText',
                componentName: 'TechnicalSection',
                config: {
                    writingSections: [
                        { id: 'sec_indice', fieldKey: 'Indice', numberPrefix: '2.', title: 'ÍNDICE', placeholder: 'Elaborar un índice detallado del contenido, tablas, figuras y anexos...', requirementText: 'ESTRUCTURA Y PAGINACIÓN INSTITUCIONAL', enabled: true },
                        { id: 'sec_resumen', fieldKey: 'Resumen', numberPrefix: '3.', title: 'RESUMEN', placeholder: '(250-300 palabras, 3-4 párrafos). Síntesis del problema, metodología, resultados clave y conclusiones principales.', requirementText: '250-300 PALABRAS, NORMAS APA 7ª', enabled: true },
                        { id: 'sec_introduccion', fieldKey: 'Introduccion', numberPrefix: '4.', title: 'INTRODUCCIÓN', placeholder: '(500-700 palabras). Justificación, planteamiento del problema, contexto institucional y motivación científica.', requirementText: '500-700 PALABRAS, ANTECEDENTES Y MOTIVACIÓN', enabled: true },
                        { id: 'sec_objetivos', fieldKey: 'Objetivos', numberPrefix: '5.', title: 'OBJETIVOS Y CUMPLIMIENTO', placeholder: 'Detalle el cumplimiento y grado de alcance del objetivo general y los objetivos específicos planteados.', requirementText: 'VERIFICACIÓN DE METAS PLANIFICADAS', enabled: true },
                        { id: 'sec_fundamentos', fieldKey: 'Fundamentos', numberPrefix: '6.', title: 'FUNDAMENTOS TEÓRICOS', placeholder: '(Extensión variable). Marco referencial, estado del arte y sustento conceptual del proyecto.', requirementText: 'CITAS EN FORMATO APA 7ª EDICIÓN', enabled: true },
                        { id: 'sec_metodos', fieldKey: 'Metodos', numberPrefix: '7.', title: 'MÉTODOS Y PROCEDIMIENTOS', placeholder: '(700-900 palabras). Diseño metodológico, población/muestra, técnicas e instrumentos aplicados.', requirementText: '700-900 PALABRAS, RIGOR CIENTÍFICO', enabled: true },
                        { id: 'sec_resultados', fieldKey: 'Resultados', numberPrefix: '8.', title: 'RESULTADOS Y DISCUSIÓN', placeholder: '(800-1200 palabras). Análisis detallado de los hallazgos empíricos o técnicos, contrastación con la hipótesis o literatura.', requirementText: '800-1200 PALABRAS, HALLAZGOS Y DISCUSIÓN', enabled: true },
                        { id: 'sec_productos', fieldKey: 'Productos', numberPrefix: '9.', title: 'PRODUCTOS Y ENTREGABLES', placeholder: '(400-600 palabras). Artículos, prototipos, registros de propiedad intelectual o manuales técnicos generados.', requirementText: '400-600 PALABRAS, EVIDENCIAS TANGIBLES', enabled: true },
                        { id: 'sec_impactos', fieldKey: 'Impactos', numberPrefix: '10.', title: 'IMPACTOS ALCANZADOS', placeholder: '(500-800 palabras). Impacto social, tecnológico, ambiental, productivo y formativo generado por el proyecto.', requirementText: '500-800 PALABRAS, RETORNO INSTITUCIONAL', enabled: true },
                        { id: 'sec_transferencia', fieldKey: 'Transferencia', numberPrefix: '11.', title: 'TRANSFERENCIA DE RESULTADOS', placeholder: '(400-600 palabras). Estrategias de difusión, adopción comunitaria o licenciamiento de la tecnología.', requirementText: '400-600 PALABRAS, VINCULACIÓN EFECTIVA', enabled: true },
                        { id: 'sec_informe_financiero', fieldKey: 'InformeFinanciero', numberPrefix: '12.', title: 'INFORME FINANCIERO DE GASTOS', placeholder: 'Balance y liquidación presupuestaria: recursos planificados vs ejecutados, contrapartes y justificación.', requirementText: 'LIQUIDACIÓN PRESUPUESTARIA AUDITABLE', enabled: true },
                        { id: 'sec_conclusiones', fieldKey: 'Conclusiones', numberPrefix: '13.', title: 'CONCLUSIONES', placeholder: '(500-700 palabras). Conclusiones directas vinculadas a cada objetivo de investigación.', requirementText: '500-700 PALABRAS, CONCLUSIONES FORMALES', enabled: true },
                        { id: 'sec_recomendaciones', fieldKey: 'Recomendaciones', numberPrefix: '14.', title: 'RECOMENDACIONES', placeholder: '(500-700 palabras). Recomendaciones para futuras investigaciones, mejoras institucionales o escalamiento.', requirementText: '500-700 PALABRAS, PROYECCIÓN FUTURA', enabled: true },
                        { id: 'sec_bibliografia', fieldKey: 'Bibliografia', numberPrefix: '15.', title: 'BIBLIOGRAFÍA', placeholder: 'Listado completo de fuentes bibliográficas consultadas y citadas.', requirementText: 'NORMAS APA 7ª EDICIÓN COMPLETA', enabled: true },
                        { id: 'sec_anexos', fieldKey: 'Anexos', numberPrefix: '16.', title: 'ANEXOS', placeholder: 'Índice de anexos, enlaces a repositorios de datos, cartas de validación y evidencias complementarias.', requirementText: 'DOCUMENTOS COMPLEMENTARIOS Y EVIDENCIAS', enabled: true }
                    ]
                }
            }
        ]
    }
};

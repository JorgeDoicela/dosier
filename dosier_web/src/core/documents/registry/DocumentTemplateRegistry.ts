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
    }
};

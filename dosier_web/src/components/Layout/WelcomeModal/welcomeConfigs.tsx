import type { RoleWelcomeConfig } from './types';

export const ADMIN_WELCOME: RoleWelcomeConfig = {
    role: 'admin',
    roleLabel: 'Administrador Curricular',
    greeting: 'Bienvenido a DOSIER',
    systemDescription: '¡Qué gusto tenerte aquí! Desde este espacio lideras y coordinas la gestión documental académica del instituto. Cuentas con herramientas integrales para auditar PEAs, Sílabos de 19 semanas, Guías APE y acompañar a nuestros docentes en cada período.',
    sectionTitle: '¿Qué deseas gestionar hoy?',
    benefits: [
        {
            title: 'Planificación y Portafolios Docentes',
            description: 'Supervisa la carga horaria, avance curricular y entrega de portafolios docentes con total trazabilidad.',
            tag: 'Portafolios',
            path: '/dashboard'
        },
        {
            title: 'Validación Curricular y Mallas SIGAFI',
            description: 'Audita la correspondencia matemática de horas de docencia, APE y trabajo autónomo según las mallas oficiales.',
            tag: 'Validación',
            path: '/dashboard'
        },
        {
            title: 'Ciclo Documental y Plantillas',
            description: 'Administra formatos oficiales (PEA, Sílabo, Guías APE y Estudio) con firma digital .p12 y verificación QR.',
            tag: 'Documentos',
            path: '/admin/documentos'
        },
        {
            title: 'Gobernanza y Usuarios',
            description: 'Gestiona roles, asignaciones de materias y accesos institucionales para coordinadores y docentes.',
            tag: 'Gobernanza',
            path: '/usuarios'
        }
    ],
    primaryActionLabel: 'Comenzar',
    primaryActionPath: '/dashboard'
};

export const DOCENTE_WELCOME: RoleWelcomeConfig = {
    role: 'docente',
    roleLabel: 'Docente de Materia',
    greeting: 'Bienvenido a DOSIER',
    systemDescription: '¡Te damos la bienvenida a tu espacio de gestión y redacción curricular! Aquí puedes elaborar tus PEAs, planificar tu cronograma semanal de 19 semanas, diseñar tus guías de práctica APE y compilar tu portafolio oficial.',
    sectionTitle: 'Espacios diseñados para tu labor',
    benefits: [
        {
            title: 'Co-Redacción en Vivo (PEA y Sílabo)',
            description: 'Escribe y estructura tus entregables curriculares en tiempo real junto a tus docentes de materia con plantillas oficiales.',
            tag: 'Colaboración',
            path: '/dashboard'
        },
        {
            title: 'Cronograma Semanal de 19 Semanas',
            description: 'Planifica tus 19 semanas con fechas sincronizadas de Parcial 1 (Semana 9) y Parcial 2 (Semana 18) de SIGAFI.',
            tag: 'Sílabos',
            path: '/dashboard'
        },
        {
            title: 'Guías de Práctica APE y Rúbricas',
            description: 'Diseña las guías de laboratorio institucional y establece rúbricas de evaluación analíticas para tus estudiantes.',
            tag: 'Prácticas',
            path: '/dashboard'
        },
        {
            title: 'Firma Electrónica y Portafolio CACES',
            description: 'Firma tus documentos con certificado .p12 y compila tu expediente listo para auditorías de acreditación.',
            tag: 'Acreditación',
            path: '/verificacion'
        }
    ],
    primaryActionLabel: 'Comenzar',
    primaryActionPath: '/dashboard'
};

export const ESTUDIANTE_WELCOME: RoleWelcomeConfig = {
    role: 'estudiante',
    roleLabel: 'Estudiante ISTPET',
    greeting: 'Bienvenido a DOSIER',
    systemDescription: '¡Bienvenido al portal académico de contenidos y guías de estudio! Accede a las guías prácticas APE, cronogramas de tus asignaturas y compendios de estudio oficiales.',
    sectionTitle: 'Recursos para tu formación',
    benefits: [
        {
            title: 'Guías Práctico-Experimentales (APE)',
            description: 'Consulta los procedimientos, instrucciones y normas de seguridad de tus prácticas de laboratorio.',
            tag: 'Guías APE',
            path: '/dashboard'
        },
        {
            title: 'Guías de Estudio y Compendios',
            description: 'Accede a los contenidos teóricos por unidad, glosarios y cuestionarios de autoevaluación.',
            tag: 'Estudio',
            path: '/dashboard'
        },
        {
            title: 'Sílabos y Fechas de Exámenes',
            description: 'Revisa la planificación de temas y fechas clave de parciales y exámenes del período académico.',
            tag: 'Cronograma',
            path: '/dashboard'
        },
        {
            title: 'Verificación de Documentos',
            description: 'Consulta y valida la autenticidad de tus documentos oficiales con código QR y sello criptográfico.',
            tag: 'Verificación',
            path: '/verificacion'
        }
    ],
    primaryActionLabel: 'Comenzar',
    primaryActionPath: '/dashboard'
};

export const REVISOR_WELCOME: RoleWelcomeConfig = {
    role: 'revisor',
    roleLabel: 'Coordinador / Revisor Académico',
    greeting: 'Bienvenido a DOSIER',
    systemDescription: '¡Agradecemos tu labor académica! Tu criterio técnico es fundamental para garantizar la coherencia curricular y el cumplimiento de las mallas académicas institucionales.',
    sectionTitle: 'Herramientas de revisión curricular',
    benefits: [
        {
            title: 'Validación de PEAs y Sílabos',
            description: 'Revisa la articulación entre resultados de aprendizaje, contenidos mínimos y distribución horaria.',
            tag: 'Curricular',
            path: '/dashboard'
        },
        {
            title: 'Control de 19 Semanas y Parciales',
            description: 'Verifica la concordancia de horas semanales y fechas de exámenes con el calendario institucional.',
            tag: 'Auditoría',
            path: '/dashboard'
        },
        {
            title: 'Emisión de Dictámenes y Observaciones',
            description: 'Registra tus observaciones constructivas y resoluciones formales con respaldo de firma digital.',
            tag: 'Dictámenes',
            path: '/dashboard'
        },
        {
            title: 'Firma y Legalización Institucional',
            description: 'Sella los documentos aprobados con firma electrónica .p12 y código QR de verificación pública.',
            tag: 'Firmas',
            path: '/verificacion'
        }
    ],
    primaryActionLabel: 'Comenzar',
    primaryActionPath: '/dashboard'
};

export const DEFAULT_WELCOME: RoleWelcomeConfig = {
    role: 'todos',
    roleLabel: 'Miembro de la Comunidad',
    greeting: 'Bienvenido a DOSIER',
    systemDescription: '¡Te damos la bienvenida a DOSIER! Te invitamos a conocer las herramientas de gestión documental curricular del Tecnológico Traversari.',
    sectionTitle: 'Descubre nuestros espacios',
    benefits: [
        {
            title: 'Planificación Curricular y Portafolios',
            description: 'Explora la elaboración de PEAs, Sílabos de 19 semanas y Guías de Práctica APE de cada carrera.',
            tag: 'Académico',
            path: '/dashboard'
        },
        {
            title: 'Acreditación y Verificación Oficial',
            description: 'Accede a normativas, formatos institucionales y herramientas de verificación de documentos con código QR.',
            tag: 'Recursos',
            path: '/verificacion'
        }
    ],
    primaryActionLabel: 'Comenzar',
    primaryActionPath: '/dashboard'
};

export const getWelcomeConfigByRole = (
    isAdmin: boolean,
    isDocente: boolean,
    isEstudiante: boolean,
    isRevisor: boolean
): RoleWelcomeConfig => {
    if (isAdmin) return ADMIN_WELCOME;
    if (isDocente) return DOCENTE_WELCOME;
    if (isEstudiante) return ESTUDIANTE_WELCOME;
    if (isRevisor) return REVISOR_WELCOME;
    return DEFAULT_WELCOME;
};

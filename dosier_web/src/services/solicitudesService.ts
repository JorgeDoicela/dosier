import { 
    Clock, 
    Copy, 
    Calendar, 
    Bell, 
    MessageSquarePlus, 
    Settings, 
    ShieldCheck 
} from 'lucide-react';
import type { 
    SolicitudTramiteItem, 
    SolicitudRegistroHistorial 
} from '../pages/Solicitudes/types';

/**
 * Catálogo canónico de trámites y solicitudes curriculares del ISTPET.
 * Se adapta y filtra según el rol institucional activo.
 */
export const CATALOGO_TRAMITES_OFICIALES: SolicitudTramiteItem[] = [
    {
        id: 'prorroga_docente',
        titulo: 'Prórroga de Entrega de PEA',
        descripcion: 'Solicita una extensión formal de la fecha límite para la formulación o corrección del Programa de Estudio de la Asignatura ante la Coordinación.',
        icono: Clock,
        categoria: 'prorrogas',
        rolesPermitidos: ['DOSIER_DOCENTE'],
        sla: '24 horas',
        responsable: 'Coordinación de Carrera',
        accionTexto: 'Solicitar prórroga',
        tipoAccion: 'modal_prorroga',
        destacado: true
    },
    {
        id: 'clonacion_docente',
        titulo: 'Clonación de PEA Aprobado',
        descripcion: 'Importa las unidades temáticas, metodología y bibliografía de una asignatura de períodos lectivos anteriores legalizada por CACES.',
        icono: Copy,
        categoria: 'clonacion',
        rolesPermitidos: ['DOSIER_DOCENTE', 'DOSIER_COORD_CARRERA', 'DOSIER_ADMIN'],
        sla: 'Inmediato',
        responsable: 'Sistema DOSIER',
        accionTexto: 'Clonar contenidos',
        tipoAccion: 'modal_clonar',
        destacado: true
    },
    {
        id: 'incidencia_docente',
        titulo: 'Buzón de Incidencias Curriculares',
        descripcion: 'Reporta discrepancias en horas distributivas de SIGAFI, errores de acreditación o fallas técnicas en la firma digital de instrumentos.',
        icono: MessageSquarePlus,
        categoria: 'soporte',
        rolesPermitidos: ['DOSIER_DOCENTE', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        sla: '48 horas',
        responsable: 'Soporte Técnico Institucional',
        accionTexto: 'Abrir buzón',
        tipoAccion: 'ruta',
        rutaDestino: '/incidencias'
    },
    {
        id: 'prorroga_coordinacion',
        titulo: 'Concesión de Prórrogas de Carrera',
        descripcion: 'Extiende el cronograma de entrega del PEA para una carrera o asigna días adicionales a docentes rezagados con justificativo académico.',
        icono: Clock,
        categoria: 'prorrogas',
        rolesPermitidos: ['DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        sla: 'Resolución inmediata',
        responsable: 'Coordinación Académica',
        accionTexto: 'Conceder prórroga',
        tipoAccion: 'modal_prorroga',
        destacado: true
    },
    {
        id: 'recordatorio_docentes',
        titulo: 'Recordatorio Masivo a Docentes',
        descripcion: 'Emite una notificación institucional y por correo electrónico a los docentes con instrumentos en borrador o próximos al vencimiento de plazo.',
        icono: Bell,
        categoria: 'convocatoria',
        rolesPermitidos: ['DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_ADMIN'],
        sla: 'Envío inmediato',
        responsable: 'Motor de Notificaciones',
        accionTexto: 'Enviar recordatorio',
        tipoAccion: 'modal_recordatorio'
    },
    {
        id: 'apertura_convocatoria',
        titulo: 'Apertura de Convocatoria Curricular',
        descripcion: 'Activa el ciclo de elaboración del PEA para el período lectivo oficial, sincronizando las fechas límites docentes y de supervisión colegiada.',
        icono: Calendar,
        categoria: 'convocatoria',
        rolesPermitidos: ['DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        sla: 'Inmediato',
        responsable: 'Vicerrectorado Académico',
        accionTexto: 'Configurar convocatoria',
        tipoAccion: 'modal_convocatoria',
        destacado: true
    },
    {
        id: 'excepcion_normativa',
        titulo: 'Excepción Normativa de Calendario',
        descripcion: 'Autoriza prórrogas mayores o excepciones curriculares extraordinarias fuera de término formal CACES con dictamen de Vicerrectorado.',
        icono: ShieldCheck,
        categoria: 'prorrogas',
        rolesPermitidos: ['DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        sla: '48 horas',
        responsable: 'Consejo Académico',
        accionTexto: 'Evaluar excepción',
        tipoAccion: 'modal_prorroga'
    },
    {
        id: 'parametros_normativos',
        titulo: 'Parámetros Normativos de Solicitudes',
        descripcion: 'Administra los límites máximos de prórroga permitidos, los plazos de vigencia curricular y las políticas institucionales de clonación.',
        icono: Settings,
        categoria: 'soporte',
        rolesPermitidos: ['DOSIER_ADMIN'],
        sla: 'Inmediato',
        responsable: 'Administrador DOSIER',
        accionTexto: 'Ajustar parámetros',
        tipoAccion: 'ruta',
        rutaDestino: '/configuracion?tab=parametros'
    }
];

/**
 * Registros históricos representativos de solicitudes institucionales.
 */
export const REGISTROS_HISTORIAL_MOCK: SolicitudRegistroHistorial[] = [
    {
        id: 'sol-001',
        codigo: 'SOL-2026-089',
        titulo: 'Prórroga de 5 días para entrega de PEA - Desarrollo de Software',
        categoria: 'Prórrogas',
        solicitante: 'Ing. Carlos Mendoza',
        rolSolicitante: 'Docente Titular',
        carrera: 'Desarrollo de Software',
        fecha: 'Hace 2 horas',
        estado: 'aprobado',
        detalle: 'Concedida por Coordinación de Carrera ante actualización de mallas SIGAFI.'
    },
    {
        id: 'sol-002',
        codigo: 'SOL-2026-088',
        titulo: 'Clonación de contenidos curriculares - Base de Datos II',
        categoria: 'Clonación',
        solicitante: 'Lic. Ana Morales',
        rolSolicitante: 'Docente Titular',
        carrera: 'Ciberseguridad',
        fecha: 'Ayer',
        estado: 'resuelto',
        detalle: 'Estructura metodológica y bibliografía CACES importadas desde 2025-B.'
    },
    {
        id: 'sol-003',
        codigo: 'SOL-2026-087',
        titulo: 'Apertura extraordinaria para revisión de PEA extemporáneo',
        categoria: 'Convocatoria',
        solicitante: 'Coordinación de Carrera',
        rolSolicitante: 'Coordinador',
        carrera: 'Redes y Telecomunicaciones',
        fecha: 'Hace 3 días',
        estado: 'en_revision',
        detalle: 'Pendiente de aval formal de Coordinación Académica.'
    },
    {
        id: 'sol-004',
        codigo: 'SOL-2026-086',
        titulo: 'Inconsistencia en horas autónomas vs Art. 21 CES',
        categoria: 'Soporte',
        solicitante: 'Dr. Roberto Dávila',
        rolSolicitante: 'Docente Titular',
        carrera: 'Desarrollo de Software',
        fecha: 'Hace 5 días',
        estado: 'resuelto',
        detalle: 'Se ajustó la asignación horaria en el distributivo de SIGAFI.'
    }
];

export const solicitudesService = {
    /**
     * Retorna los trámites disponibles filtrados por los roles del usuario.
     */
    getTramitesPorRoles: (userRoles: string[], isAdmin = false): SolicitudTramiteItem[] => {
        if (isAdmin) return CATALOGO_TRAMITES_OFICIALES;
        const normalizedUserRoles = userRoles.map(r => r.toUpperCase());
        return CATALOGO_TRAMITES_OFICIALES.filter(tramite => 
            tramite.rolesPermitidos.some(r => normalizedUserRoles.includes(r.toUpperCase()))
        );
    },

    /**
     * Retorna el historial de solicitudes institucionales.
     */
    getHistorialSolicitudes: async (): Promise<SolicitudRegistroHistorial[]> => {
        return REGISTROS_HISTORIAL_MOCK;
    }
};

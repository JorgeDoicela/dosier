import { 
    MessageSquarePlus 
} from 'lucide-react';
import type { 
    SolicitudTramiteItem, 
    SolicitudRegistroHistorial,
    SolicitudEstado
} from '../pages/Solicitudes/types';
import { getMyFeedback, getAllFeedback, type FeedbackReporte } from './feedbackService';

/**
 * Catálogo canónico de canales y trámites operativos del ISTPET.
 * Exclusivamente compuesto por herramientas reales y conectadas con el backend.
 */
export const CATALOGO_TRAMITES_OFICIALES: SolicitudTramiteItem[] = [
    {
        id: 'incidencia_curricular',
        titulo: 'Buzón de Incidencias Curriculares',
        descripcion: 'Reporta discrepancias en horas distributivas de SIGAFI, errores de acreditación CACES o requerimientos de soporte técnico institucional.',
        icono: MessageSquarePlus,
        categoria: 'soporte',
        rolesPermitidos: ['DOSIER_DOCENTE', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        sla: '48 horas',
        responsable: 'Soporte Técnico Institucional',
        accionTexto: 'Abrir buzón',
        tipoAccion: 'ruta',
        rutaDestino: '/incidencias',
        destacado: true
    }
];

const mapearEstadoFeedback = (estado: string): SolicitudEstado => {
    switch (estado?.toUpperCase()) {
        case 'ATENDIDO':
            return 'resuelto';
        case 'EN_REVISION':
            return 'en_revision';
        case 'DESCARTADO':
            return 'rechazado';
        case 'PENDIENTE':
        default:
            return 'pendiente';
    }
};

const mapearTipoFeedback = (tipo: string): string => {
    switch (tipo?.toUpperCase()) {
        case 'ERROR':
            return 'Incidencia Técnica';
        case 'SUGERENCIA':
            return 'Mejora Curricular';
        case 'DUDA':
            return 'Consulta Operativa';
        default:
            return 'Soporte Curricular';
    }
};

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
     * Retorna el historial de solicitudes e incidencias reales registradas en el backend.
     */
    getHistorialSolicitudes: async (isAdmin = false): Promise<SolicitudRegistroHistorial[]> => {
        try {
            const reportes: FeedbackReporte[] = isAdmin 
                ? await getAllFeedback() 
                : await getMyFeedback();

            if (!Array.isArray(reportes)) return [];

            return reportes.map(r => {
                const idNum = r.id_feedback || r.idFeedback;
                const codigo = idNum ? `INC-${String(idNum).padStart(4, '0')}` : r.uuid.substring(0, 8).toUpperCase();
                const fechaRaw = r.fecha_creacion || r.fechaCreacion;
                let fechaFormateada = 'Reciente';
                if (fechaRaw) {
                    try {
                        const dateObj = new Date(fechaRaw);
                        if (!isNaN(dateObj.getTime())) {
                            fechaFormateada = dateObj.toLocaleDateString('es-EC', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                            });
                        }
                    } catch {
                        fechaFormateada = 'Reciente';
                    }
                }

                return {
                    id: r.uuid,
                    codigo,
                    titulo: r.titulo,
                    categoria: mapearTipoFeedback(r.tipo),
                    solicitante: r.nombre_usuario || r.nombreUsuario || 'Usuario Institucional',
                    rolSolicitante: r.rol_usuario || r.rolUsuario || 'Docente',
                    carrera: 'Institucional',
                    fecha: fechaFormateada,
                    estado: mapearEstadoFeedback(r.estado),
                    detalle: r.descripcion
                };
            });
        } catch {
            return [];
        }
    }
};

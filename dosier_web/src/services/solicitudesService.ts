import { 
    MessageSquarePlus 
} from 'lucide-react';
import type { 
    SolicitudTramiteItem 
} from '../pages/Solicitudes/types';

/**
 * Catálogo canónico de canales y trámites operativos del ISTPET.
 */
export const CATALOGO_TRAMITES_OFICIALES: SolicitudTramiteItem[] = [
    {
        id: 'incidencia_curricular',
        titulo: 'Buzón de Incidencias Curriculares',
        descripcion: 'Canal para reportar inconsistencias en horas distributivas de SIGAFI, soporte técnico e incidencias curriculares.',
        icono: MessageSquarePlus,
        categoria: 'soporte',
        rolesPermitidos: ['DOSIER_DOCENTE', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR', 'DOSIER_ADMIN'],
        tipoAccion: 'ruta',
        rutaDestino: '/incidencias'
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
    }
};

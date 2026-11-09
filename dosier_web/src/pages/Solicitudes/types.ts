import type { LucideIcon } from 'lucide-react';

export type SolicitudCategoria = 'todas' | 'soporte';

export type SolicitudAccionTipo = 'ruta';

export interface SolicitudTramiteItem {
    id: string;
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    categoria: SolicitudCategoria;
    rolesPermitidos: string[];
    sla?: string;
    responsable?: string;
    accionTexto?: string;
    tipoAccion: SolicitudAccionTipo;
    rutaDestino?: string;
    destacado?: boolean;
}

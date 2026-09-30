import type { LucideIcon } from 'lucide-react';

export type SolicitudCategoria = 'todas' | 'prorrogas' | 'clonacion' | 'convocatoria' | 'soporte';

export type SolicitudAccionTipo = 
    | 'modal_prorroga'
    | 'modal_clonar'
    | 'modal_convocatoria'
    | 'modal_recordatorio'
    | 'ruta';

export type SolicitudEstado = 'pendiente' | 'aprobado' | 'en_revision' | 'rechazado' | 'resuelto';

export interface SolicitudTramiteItem {
    id: string;
    titulo: string;
    descripcion: string;
    icono: LucideIcon;
    categoria: SolicitudCategoria;
    rolesPermitidos: string[];
    sla: string;
    responsable: string;
    accionTexto: string;
    tipoAccion: SolicitudAccionTipo;
    rutaDestino?: string;
    destacado?: boolean;
}

export interface SolicitudRegistroHistorial {
    id: string;
    codigo: string;
    titulo: string;
    categoria: string;
    solicitante: string;
    rolSolicitante: string;
    carrera?: string;
    fecha: string;
    estado: SolicitudEstado;
    detalle: string;
}

export interface SolicitudFiltroState {
    categoria: SolicitudCategoria;
    busqueda: string;
    estado?: SolicitudEstado | 'todos';
}

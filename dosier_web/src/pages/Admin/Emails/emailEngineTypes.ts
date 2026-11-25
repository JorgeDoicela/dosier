export interface EmailTemplate {
    idEmailTemplate: number;
    uuid: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    asunto: string;
    cuerpoHtml: string;
    activo: boolean;
    fechaCreado?: string;
    fechaActualizado?: string;
}

export interface EmailHistorial {
    idEmailHistorial: number;
    uuid: string;
    destinatario: string;
    idUsuarioDestinatario?: number;
    nombreDestinatario?: string;
    asunto: string;
    cuerpo: string;
    estado: string;
    errorMensaje?: string;
    fechaEnvio: string;
    adjuntosJson?: string;
    metadataJson?: string;
}

export interface Carrera {
    idCarrera: number;
    carrera1: string;
    aliasCarrera?: string;
    modalidadIds?: number[];
}

export interface ModalidadOption {
    idModalidad: number;
    nombre: string;
    carreraIds: number[];
}

export interface PeaContextItem {
    uuid: string;
    nombreAsignatura: string;
    codigoAsignatura?: string;
    carrera?: string;
    idCarrera?: number;
    periodo?: string;
    estado: string;
    docenteElaborador?: string;
    semestreNivel?: string;
    modalidad?: string;
    totalHoras?: number;
    creditos?: number;
}

export interface PeriodoAcademicoItem {
    idPeriodo: string;
    detalle: string;
    fechaInicial?: string;
    fechaFinal?: string;
    activo: boolean;
    cerrado?: boolean;
}

export interface AttachmentFile {
    name: string;
    size: number;
    type: string;
    base64: string;
}

export interface EmailEngineScope {
    primaryRole: string;
    isGlobalScope: boolean;
    canManageTemplates: boolean;
    canDeleteTemplates: boolean;
    canViewAllHistory: boolean;
    allowedBroadcastRoles: string[];
    allowedCarreraIds: number[];
    allowedCarreras: Carrera[];
    availableModalidades: ModalidadOption[];
}

export interface AudiencePreviewResult {
    totalRecipients: number;
    sample: Array<{
        idUsuario: number;
        nombreCompleto: string;
        email: string;
    }>;
}

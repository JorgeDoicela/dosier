import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos
// ─────────────────────────────────────────────────────────────

export interface UserSignatureProfileDto {
    idUsuario?: number;
    id_usuario?: number;
    esConfigurado?: boolean;
    es_configurado?: boolean;
    firmaImagenB64?: string;
    firma_imagen_b64?: string;
    iniciales?: string;
    cargo?: string;
    departamento?: string;
    tipoSello?: 'completo' | 'solo_firma';
    tipo_sello?: 'completo' | 'solo_firma';
    actualizadoEn?: string;
    actualizado_en?: string;
}

export interface UpdateSignatureProfileDto {
    firmaImagenB64?: string;
    iniciales?: string;
    cargo?: string;
    departamento?: string;
    tipoSello?: 'completo' | 'solo_firma';
}

export interface SignDocumentDto {
    documentoUuid: string;
    password: string;
    rolFirmante?: string;
}

export interface SignatureResultDto {
    message: string;
    firmaCode: string;
    docHash: string;
    firmadoEn: string;
    verificationUrl: string;
}

export interface SignatureRecordDto {
    idFirma: number;
    firmaCode: string;
    firmanteNombre: string;
    firmanteRol: string;
    fechaFirma: string;
    estado: number; // 1=Valid, 2=Revoked
    docHash?: string;
    motivoRevocacion?: string;
    revocadaEn?: string;
}

export interface SignatureVerificationDto {
    esValida: boolean;
    firmaCode: string;
    firmanteNombre: string;
    firmanteRol: string;
    documentoUuid: string;
    fechaFirma: string;
    docHash: string;
    mensajeEstado: string;
}

export interface RevokeSignatureDto {
    firmaCode: string;
    motivoRevocacion: string;
}

// ─────────────────────────────────────────────────────────────
//  Llamadas API
// ─────────────────────────────────────────────────────────────

export const getSignatureProfile = (): Promise<UserSignatureProfileDto> =>
    api.get('/signatures/profile').then(r => r.data);

export const updateSignatureProfile = (dto: UpdateSignatureProfileDto): Promise<UserSignatureProfileDto> => {
    const payload = {
        cargo: dto.cargo,
        departamento: dto.departamento,
        iniciales: dto.iniciales,
        firma_imagen_b64: dto.firmaImagenB64,
        tipo_sello: dto.tipoSello,
        tipoSello: dto.tipoSello
    };
    return api.put('/signatures/profile', payload).then(r => r.data);
};

export const signDocumentWithDosier = (dto: SignDocumentDto): Promise<SignatureResultDto> =>
    api.post('/signatures/sign', dto).then(r => r.data);

export const getDocumentSignatures = (documentUuid: string): Promise<SignatureRecordDto[]> =>
    api.get(`/signatures/document/${documentUuid}`).then(r => r.data);

export const verifySignaturePublic = (firmaCode: string): Promise<SignatureVerificationDto> =>
    api.get(`/signatures/verify/${firmaCode}`).then(r => r.data);

export const revokeSignature = (dto: RevokeSignatureDto): Promise<{ message: string }> =>
    api.post('/signatures/revoke', dto).then(r => r.data);

export const signDocumentWithP12 = (formData: FormData): Promise<any> =>
    api.post('/signatures/sign-p12', formData, {
        headers: { 'Content-Type': undefined },
        transformRequest: [(data, headers) => {
            if (data instanceof FormData) {
                delete headers['Content-Type'];
            }
            return data;
        }]
    }).then(r => r.data);

import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  DTOs de Normativas Externas y Marco Regulatorio (CES / CACES)
// ─────────────────────────────────────────────────────────────

export interface NormativaArticuloDto {
    idArticulo: number;
    uuid: string;
    idNormativa: number;
    codigoResolucion: string;
    organismoEmisor: string;
    numeroArticulo: string;
    titulo?: string;
    contenido: string;
    requisitoCurricular?: string;
    orden: number;
}

export interface NormativaDto {
    idNormativa: number;
    uuid: string;
    organismoEmisor: 'CES' | 'CACES' | 'SENESCYT' | 'MINEDUC' | 'OTRO';
    tipoNormativa: string;
    codigoResolucion: string;
    titulo: string;
    descripcion?: string;
    fechaEmision?: string;
    fechaVigencia?: string;
    archivoUrl?: string;
    activo: boolean;
    articulos: NormativaArticuloDto[];
}

export interface ModeloEducativoDto {
    idModelo: number;
    uuid: string;
    codigo: string;
    nombre: string;
    version: string;
    resolucionAprobacion?: string;
    descripcion?: string;
    fechaVigenciaDesde: string;
    fechaVigenciaHasta?: string;
    archivoUrl?: string;
    activo: boolean;
}

export interface PerfilEgresoResultadoDto {
    idResultadoPerfil: number;
    uuid: string;
    idPerfilEgreso: number;
    codigo: string;
    descripcion: string;
    orden: number;
}

export interface PerfilEgresoDto {
    idPerfilEgreso: number;
    uuid: string;
    idCarrera: number;
    nombreCarrera?: string;
    idMalla: number;
    version: string;
    descripcionGeneral: string;
    activo: boolean;
    resultados: PerfilEgresoResultadoDto[];
}

export interface AsignaturaTributacionDto {
    idRelacion: number;
    idAsignatura: number;
    idMalla: number;
    idResultadoPerfil: number;
    codigoRda: string;
    descripcionRda: string;
    nivelAporte: 'Introductorio' | 'Medio' | 'Avanzado';
}

// ─────────────────────────────────────────────────────────────
//  Funciones de Cliente API (Axios con normalización snake_case)
// ─────────────────────────────────────────────────────────────

const mapArticulo = (raw: any): NormativaArticuloDto => ({
    idArticulo: raw.id_articulo ?? raw.idArticulo ?? 0,
    uuid: raw.uuid ?? '',
    idNormativa: raw.id_normativa ?? raw.idNormativa ?? 0,
    codigoResolucion: raw.codigo_resolucion ?? raw.codigoResolucion ?? '',
    organismoEmisor: raw.organismo_emisor ?? raw.organismoEmisor ?? '',
    numeroArticulo: raw.numero_articulo ?? raw.numeroArticulo ?? '',
    titulo: raw.titulo ?? '',
    contenido: raw.contenido ?? '',
    requisitoCurricular: raw.requisito_curricular ?? raw.requisitoCurricular ?? '',
    orden: raw.orden ?? 0
});

const mapNormativa = (raw: any): NormativaDto => ({
    idNormativa: raw.id_normativa ?? raw.idNormativa ?? 0,
    uuid: raw.uuid ?? '',
    organismoEmisor: raw.organismo_emisor ?? raw.organismoEmisor ?? 'CACES',
    tipoNormativa: raw.tipo_normativa ?? raw.tipoNormativa ?? '',
    codigoResolucion: raw.codigo_resolucion ?? raw.codigoResolucion ?? '',
    titulo: raw.titulo ?? '',
    descripcion: raw.descripcion ?? '',
    fechaEmision: raw.fecha_emision ?? raw.fechaEmision,
    fechaVigencia: raw.fecha_vigencia ?? raw.fechaVigencia,
    archivoUrl: raw.archivo_url ?? raw.archivoUrl,
    activo: Boolean(raw.activo),
    articulos: Array.isArray(raw.articulos) ? raw.articulos.map(mapArticulo) : []
});

export const getNormativas = async (organismo?: string): Promise<NormativaDto[]> => {
    const res = await api.get('/normativas', { params: organismo ? { organismo } : undefined });
    return Array.isArray(res.data) ? res.data.map(mapNormativa) : [];
};

export const getChecklistCurricular = async (organismo?: string): Promise<NormativaArticuloDto[]> => {
    const res = await api.get('/normativas/checklist', { params: organismo ? { organismo } : undefined });
    return Array.isArray(res.data) ? res.data.map(mapArticulo) : [];
};

export const getModeloEducativo = async (): Promise<ModeloEducativoDto | null> => {
    try {
        const res = await api.get('/normativas/modelo-educativo');
        const raw = res.data;
        if (!raw) return null;
        return {
            idModelo: raw.id_modelo ?? raw.idModelo ?? 0,
            uuid: raw.uuid ?? '',
            codigo: raw.codigo ?? '',
            nombre: raw.nombre ?? '',
            version: raw.version ?? '1.0',
            resolucionAprobacion: raw.resolucion_aprobacion ?? raw.resolucionAprobacion,
            descripcion: raw.descripcion,
            fechaVigenciaDesde: raw.fecha_vigencia_desde ?? raw.fechaVigenciaDesde,
            fechaVigenciaHasta: raw.fecha_vigencia_hasta ?? raw.fechaVigenciaHasta,
            archivoUrl: raw.archivo_url ?? raw.archivoUrl,
            activo: Boolean(raw.activo)
        };
    } catch {
        return null;
    }
};

export const getPerfilEgreso = async (idCarrera: number, idMalla: number): Promise<PerfilEgresoDto | null> => {
    try {
        const res = await api.get('/normativas/perfil-egreso', { params: { idCarrera, idMalla } });
        const raw = res.data;
        if (!raw) return null;
        return {
            idPerfilEgreso: raw.id_perfil_egreso ?? raw.idPerfilEgreso ?? 0,
            uuid: raw.uuid ?? '',
            idCarrera: raw.id_carrera ?? raw.idCarrera ?? 0,
            nombreCarrera: raw.nombre_carrera ?? raw.nombreCarrera,
            idMalla: raw.id_malla ?? raw.idMalla ?? 0,
            version: raw.version ?? '1.0',
            descripcionGeneral: raw.descripcion_general ?? raw.descripcionGeneral ?? '',
            activo: Boolean(raw.activo),
            resultados: Array.isArray(raw.resultados)
                ? raw.resultados.map((r: any) => ({
                      idResultadoPerfil: r.id_resultado_perfil ?? r.idResultadoPerfil ?? 0,
                      uuid: r.uuid ?? '',
                      idPerfilEgreso: r.id_perfil_egreso ?? r.idPerfilEgreso ?? 0,
                      codigo: r.codigo ?? '',
                      descripcion: r.descripcion ?? '',
                      orden: r.orden ?? 0
                  }))
                : []
        };
    } catch {
        return null;
    }
};

export const getTributacionAsignatura = async (idAsignatura: number, idMalla: number): Promise<AsignaturaTributacionDto[]> => {
    try {
        const res = await api.get('/normativas/tributacion-asignatura', { params: { idAsignatura, idMalla } });
        if (!Array.isArray(res.data)) return [];
        return res.data.map((r: any) => ({
            idRelacion: r.id_relacion ?? r.idRelacion ?? 0,
            idAsignatura: r.id_asignatura ?? r.idAsignatura ?? 0,
            idMalla: r.id_malla ?? r.idMalla ?? 0,
            idResultadoPerfil: r.id_resultado_perfil ?? r.idResultadoPerfil ?? 0,
            codigoRda: r.codigo_rda ?? r.codigoRda ?? '',
            descripcionRda: r.descripcion_rda ?? r.descripcionRda ?? '',
            nivelAporte: r.nivel_aporte ?? r.nivelAporte ?? 'Medio'
        }));
    } catch {
        return [];
    }
};

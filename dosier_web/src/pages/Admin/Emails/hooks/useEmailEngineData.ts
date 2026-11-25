import { useState, useEffect, useCallback } from 'react';
import {
    emailService,
    type EmailEngineScopeDto,
    type PeriodoCatalogDto
} from '../../../../services/emailService';
import type {
    EmailTemplate, EmailHistorial, Carrera, PeaContextItem, PeriodoAcademicoItem, EmailEngineScope
} from '../emailEngineTypes';

export const DEFAULT_EMAIL_SCOPE: EmailEngineScope = {
    primaryRole: '',
    isGlobalScope: false,
    canManageTemplates: false,
    canDeleteTemplates: false,
    canViewAllHistory: false,
    allowedBroadcastRoles: ['DOSIER_DOCENTE'],
    allowedCarreraIds: [],
    allowedCarreras: [],
    availableModalidades: []
};

export const mapTemplateToCamelCase = (t: any): EmailTemplate => {
    if (!t) return t;
    return {
        idEmailTemplate: t.id_email_template !== undefined ? t.id_email_template : t.idEmailTemplate,
        uuid: t.uuid,
        codigo: t.codigo,
        nombre: t.nombre,
        descripcion: t.descripcion,
        asunto: t.asunto,
        cuerpoHtml: t.cuerpo_html !== undefined ? t.cuerpo_html : t.cuerpoHtml,
        activo: t.activo === true || t.activo === 1 || t.activo === '1',
        fechaCreado: t.fecha_creado !== undefined ? t.fecha_creado : t.fechaCreado,
        fechaActualizado: t.fecha_actualizado !== undefined ? t.fecha_actualizado : t.fechaActualizado
    };
};

export const mapHistorialToCamelCase = (h: any): EmailHistorial => {
    if (!h) return h;
    return {
        idEmailHistorial: h.id_email_historial !== undefined ? h.id_email_historial : h.idEmailHistorial,
        uuid: h.uuid,
        destinatario: h.destinatario,
        idUsuarioDestinatario: h.id_usuario_destinatario !== undefined ? h.id_usuario_destinatario : h.idUsuarioDestinatario,
        nombreDestinatario: h.nombre_destinatario !== undefined ? h.nombre_destinatario : h.nombreDestinatario,
        asunto: h.asunto,
        cuerpo: h.cuerpo,
        estado: h.estado,
        errorMensaje: h.error_mensaje !== undefined ? h.error_mensaje : h.errorMensaje,
        fechaEnvio: h.fecha_envio !== undefined ? h.fecha_envio : h.fechaEnvio,
        adjuntosJson: h.adjuntos_json !== undefined ? h.adjuntos_json : h.adjuntosJson,
        metadataJson: h.metadata_json !== undefined ? h.metadata_json : h.metadataJson
    };
};

export const mapCarreraToCamelCase = (c: any): Carrera => {
    if (!c) return c;
    return {
        idCarrera: c.id_carrera !== undefined ? c.id_carrera : c.idCarrera,
        carrera1: c.carrera1 ?? c.nombre ?? '',
        aliasCarrera: c.alias_carrera !== undefined ? c.alias_carrera : c.aliasCarrera,
        modalidadIds: c.modalidad_ids ?? c.modalidadIds ?? []
    };
};

export const mapScopeToCamelCase = (s: EmailEngineScopeDto | null | undefined): EmailEngineScope => {
    if (!s) return DEFAULT_EMAIL_SCOPE;
    const rawCarreras = s.allowed_carreras ?? s.allowedCarreras ?? [];
    const rawModalidades = s.available_modalidades ?? s.availableModalidades ?? [];
    return {
        primaryRole: s.primary_role ?? s.primaryRole ?? '',
        isGlobalScope: Boolean(s.is_global_scope ?? s.isGlobalScope),
        canManageTemplates: Boolean(s.can_manage_templates ?? s.canManageTemplates),
        canDeleteTemplates: Boolean(s.can_delete_templates ?? s.canDeleteTemplates),
        canViewAllHistory: Boolean(s.can_view_all_history ?? s.canViewAllHistory),
        allowedBroadcastRoles: s.allowed_broadcast_roles ?? s.allowedBroadcastRoles ?? ['DOSIER_DOCENTE'],
        allowedCarreraIds: s.allowed_carrera_ids ?? s.allowedCarreraIds ?? [],
        allowedCarreras: rawCarreras.map(mapCarreraToCamelCase),
        availableModalidades: rawModalidades.map(m => ({
            idModalidad: m.id_modalidad ?? m.idModalidad ?? 0,
            nombre: m.nombre ?? '',
            carreraIds: m.carrera_ids ?? m.carreraIds ?? []
        })).filter(m => m.idModalidad > 0 && Boolean(m.nombre))
    };
};

export const mapRawPeaToContextItem = (p: any): PeaContextItem => ({
    uuid: p.uuid,
    nombreAsignatura: p.nombre_asignatura ?? p.nombreAsignatura ?? 'Asignatura sin nombre',
    codigoAsignatura: p.codigo_asignatura ?? p.codigoAsignatura,
    carrera: p.nombre_carrera ?? p.nombreCarrera ?? p.carrera,
    idCarrera: p.id_carrera ?? p.idCarrera,
    periodo: p.id_periodo ?? p.idPeriodo,
    estado: p.estado || 'Borrador',
    docenteElaborador: p.nombre_docente_elaborador ?? p.nombreDocenteElaborador,
    semestreNivel: p.semestre_nivel ?? p.semestreNivel,
    modalidad: p.modalidad,
    totalHoras: Number(p.total_horas_asignatura ?? p.totalHorasAsignatura ?? 0) || 0,
    creditos: Number(p.creditos ?? 0) || 0
});

export const mapPeriodoItem = (p: PeriodoCatalogDto): PeriodoAcademicoItem => {
    const idPeriodo = p.id_periodo ?? p.idPeriodo ?? '';
    return {
        idPeriodo,
        detalle: p.detalle?.trim() || idPeriodo,
        fechaInicial: p.fecha_inicial ?? p.fechaInicial,
        fechaFinal: p.fecha_final ?? p.fechaFinal,
        activo: Boolean(p.activo),
        cerrado: Boolean(p.cerrado)
    };
};

export interface UseEmailEngineDataResult {
    scope: EmailEngineScope;
    templates: EmailTemplate[];
    setTemplates: React.Dispatch<React.SetStateAction<EmailTemplate[]>>;
    carreras: Carrera[];
    peas: PeaContextItem[];
    periodos: PeriodoAcademicoItem[];
    loading: boolean;
    reloadCatalogs: () => Promise<void>;
}

export const useEmailEngineData = (): UseEmailEngineDataResult => {
    const [scope, setScope] = useState<EmailEngineScope>(DEFAULT_EMAIL_SCOPE);
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [carreras, setCarreras] = useState<Carrera[]>([]);
    const [peas, setPeas] = useState<PeaContextItem[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [scopeRaw, templatesData, periodosData] = await Promise.all([
                emailService.getScope(),
                emailService.getTemplates(),
                emailService.getPeriodos()
            ]);

            const parsedScope = mapScopeToCamelCase(scopeRaw);
            setScope(parsedScope);
            setTemplates(templatesData.map(mapTemplateToCamelCase));
            setCarreras(parsedScope.allowedCarreras);
            setPeriodos(
                periodosData
                    .map(mapPeriodoItem)
                    .filter(p => Boolean(p.idPeriodo))
            );

            const peasRaw = await emailService.getScopedPeas(parsedScope.isGlobalScope);
            const mappedPeas = peasRaw.map(mapRawPeaToContextItem);
            const filteredPeas = parsedScope.isGlobalScope
                ? mappedPeas
                : mappedPeas.filter(p => p.idCarrera != null && parsedScope.allowedCarreraIds.includes(p.idCarrera));

            setPeas(filteredPeas);
        } catch (e) {
            console.error('[DOSIER EMAIL ENGINE] Error loading catalogs:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    return {
        scope,
        templates,
        setTemplates,
        carreras,
        peas,
        periodos,
        loading,
        reloadCatalogs: loadInitialData
    };
};

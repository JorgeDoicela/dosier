import type { EmailTemplate } from './emailEngineTypes';

export interface SubjectVariant {
    id: string;
    label: string;
    asunto: string;
}

export const AUTO_TOKENS = new Set([
    '[[destinatario_nombre]]',
    '[[destinatario_email]]',
    '[[anio_actual]]',
    '[[institucion_nombre]]',
    '[[sistema_url]]'
]);

export const TOKEN_LABELS: Record<string, { label: string; hint?: string }> = {
    '[[destinatario_nombre]]': { label: 'Nombre del destinatario' },
    '[[destinatario_email]]': { label: 'Correo del destinatario' },
    '[[anio_actual]]': { label: 'Año en curso' },
    '[[institucion_nombre]]': { label: 'Institución' },
    '[[sistema_url]]': { label: 'Enlace a DOSIER' },

    // Contexto PEA Curricular
    '[[pea_asignatura]]': { label: 'Asignatura (PEA)' },
    '[[pea_codigo]]': { label: 'Código de asignatura' },
    '[[pea_carrera]]': { label: 'Carrera' },
    '[[pea_periodo]]': { label: 'Período académico' },
    '[[pea_nivel]]': { label: 'Semestre / Nivel' },
    '[[pea_modalidad]]': { label: 'Modalidad de estudio' },
    '[[pea_estado]]': { label: 'Estado del PEA' },
    '[[pea_docente]]': { label: 'Docente elaborador' },
    '[[pea_docente_email]]': { label: 'Correo del docente' },
    '[[pea_horas_totales]]': { label: 'Horas totales RRA' },
    '[[pea_creditos]]': { label: 'Créditos académicos' },
    '[[pea_workspace_url]]': { label: 'Enlace al editor PEA' },
    '[[pea_revision_url]]': { label: 'Enlace a revisión técnica' },

    // Contexto Período Académico
    '[[periodo_codigo]]': { label: 'Código del período' },
    '[[periodo_nombre]]': { label: 'Nombre del período' },
    '[[periodo_fecha_inicio]]': { label: 'Fecha de inicio' },
    '[[periodo_fecha_fin]]': { label: 'Fecha de cierre' },
    '[[periodo_estado]]': { label: 'Estado del período' },

    // Contexto Calendario / Workflow
    '[[titulo_evento]]': { label: 'Título del evento curricular' },
    '[[fecha_evento]]': { label: 'Fecha del evento' },
    '[[dias_restantes]]': { label: 'Días restantes' },
    '[[descripcion_evento]]': { label: 'Descripción del evento' },
    '[[fecha_limite]]': { label: 'Fecha límite de entrega' },
    '[[observacion_resumen]]': { label: 'Resumen de observaciones' },
    '[[url_accion]]': { label: 'Enlace de acción' },
    '[[mensaje_adicional]]': { label: 'Nota adicional' }
};

/** Contexto recomendado por tipo de plantilla curricular */
export const TEMPLATE_RECOMMENDED_CONTEXT: Record<string, { entityType: string; hint: string }> = {
    PEA_RECORDATORIO_ELABORACION: {
        entityType: 'PEA',
        hint: 'Vincule un PEA específico para completar automáticamente la asignatura, carrera, período y enlace al editor.'
    },
    PEA_OBSERVACIONES_SUBSANACION: {
        entityType: 'PEA',
        hint: 'Vincule el PEA observado para completar asignatura, carrera, docente y enlace directo de corrección.'
    },
    PEA_SOLICITUD_AVAL: {
        entityType: 'PEA',
        hint: 'Vincule el PEA pendiente de aval para completar todos los datos curriculares y el enlace de revisión técnica.'
    },
    PEA_APROBACION_OFICIAL: {
        entityType: 'PEA',
        hint: 'Vincule el PEA legalizado para completar sus datos y habilitar la generación automática del PDF oficial adjunto.'
    },
    PERIODO_APERTURA_DISTRIBUTIVO: {
        entityType: 'Periodo',
        hint: 'Vincule un Período Académico de SIGAFI para completar automáticamente nombre, código y fechas de vigencia.'
    }
};

export const SUBJECT_VARIANTS: Record<string, SubjectVariant[]> = {
    PEA_RECORDATORIO_ELABORACION: [
        { id: 'default', label: 'Recordatorio estándar', asunto: 'Recordatorio: Elaboración de PEA — [[pea_asignatura]] ([[pea_periodo]])' },
        { id: 'urgente', label: 'Plazo próximo a vencer', asunto: 'Plazo próximo: Entrega pendiente de PEA — [[pea_asignatura]]' }
    ],
    PEA_OBSERVACIONES_SUBSANACION: [
        { id: 'default', label: 'Solicitud de subsanación', asunto: 'Acción requerida: Observaciones en PEA de [[pea_asignatura]]' },
        { id: 'seguimiento', label: 'Seguimiento de correcciones', asunto: 'Seguimiento: Subsanación pendiente en PEA de [[pea_asignatura]]' }
    ],
    PEA_SOLICITUD_AVAL: [
        { id: 'default', label: 'Revisión y aval', asunto: 'Revisión requerida: PEA de [[pea_asignatura]] — [[pea_carrera]]' },
        { id: 'vicerrectorado', label: 'Legalización Vicerrectorado', asunto: 'Pendiente de aprobación oficial: PEA [[pea_asignatura]]' }
    ],
    COMUNICADO_CURRICULAR: [
        { id: 'default', label: 'Comunicado institucional', asunto: 'DOSIER — Comunicado de Gestión Curricular' },
        { id: 'lineamiento', label: 'Lineamiento CACES / CES', asunto: 'DOSIER — Lineamientos Curriculares CACES / CES' }
    ]
};

export function getSubjectVariants(template: EmailTemplate): SubjectVariant[] {
    const variants = SUBJECT_VARIANTS[template.codigo];
    if (variants?.length) return variants;
    return [{ id: 'default', label: 'Asunto estándar', asunto: template.asunto }];
}

export function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function buildBodyWithAdditionalMessage(bodyHtml: string, additionalMessage: string): string {
    const note = additionalMessage.trim();
    if (!note) {
        return bodyHtml.replace(/<p[^>]*>\s*\[\[mensaje_adicional\]\]\s*<\/p>/gi, '')
            .replace(/\[\[mensaje_adicional\]\]/g, '');
    }

    const escaped = escapeHtml(note).replace(/\n/g, '<br/>');
    if (bodyHtml.includes('[[mensaje_adicional]]')) {
        return bodyHtml.replace(/\[\[mensaje_adicional\]\]/g, escaped);
    }

    const insert = `<p style="color:#444444;font-size:14px;line-height:1.6;margin:16px 0 20px 0;">${escaped}</p>`;
    const footerMatch = bodyHtml.match(/<div style="border-top: 1px solid #eaeaea/i);
    if (footerMatch && footerMatch.index !== undefined) {
        return bodyHtml.slice(0, footerMatch.index) + insert + bodyHtml.slice(footerMatch.index);
    }
    return bodyHtml + insert;
}

export function getTokenLabel(token: string): string {
    return TOKEN_LABELS[token]?.label ?? token.replace(/\[\[|\]\]/g, '').replace(/_/g, ' ');
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Valores de ejemplo para la vista previa (no se envían al backend si están vacíos en el formulario) */
export function getPreviewDefaults(origin: string): Record<string, string> {
    return {
        '[[destinatario_nombre]]': 'Docente Ejemplo',
        '[[destinatario_email]]': 'docente.ejemplo@istpet.edu.ec',
        '[[anio_actual]]': new Date().getFullYear().toString(),
        '[[institucion_nombre]]': 'Instituto Superior Tecnológico Traversari',
        '[[sistema_url]]': origin
    };
}

/** Solo incluye valores no vacíos; los defaults de preview no se pisan con strings vacíos */
export function mergeTokenReplacements(
    tokenValues: Record<string, string>,
    origin: string
): Record<string, string> {
    const merged = { ...getPreviewDefaults(origin) };
    Object.entries(tokenValues).forEach(([tok, val]) => {
        if (val?.trim()) merged[tok] = val.trim();
    });
    return merged;
}

/** Sustituye tokens. En asunto siempre texto plano; en cuerpo HTML escapa valores y marca pendientes sin romper etiquetas */
export function applyTokenReplacements(
    template: string,
    replacements: Record<string, string>,
    mode: 'text' | 'html'
): string {
    let result = template;

    Object.entries(replacements).forEach(([tok, val]) => {
        const safeVal = mode === 'html' ? escapeHtml(val) : val;
        result = result.replace(new RegExp(escapeRegExp(tok), 'g'), safeVal);
    });

    result = result.replace(/\[\[([a-zA-Z0-9_]+)\]\]/g, (match) => {
        const label = getTokenLabel(match);
        if (mode === 'text') return `«${label}»`;
        return `<span class="email-preview-pending" style="background:rgba(0,112,243,0.06);border:1px solid rgba(0,112,243,0.28);padding:1px 6px;border-radius:4px;color:#0070f3;font-size:11px;font-family:monospace;font-weight:600;">${escapeHtml(label)}</span>`;
    });

    return result;
}

/** Datos que se envían al API: sin claves con valor vacío */
export function buildTemplateDataForSend(tokenValues: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(tokenValues).filter(([, v]) => Boolean(v?.trim()))
    );
}

/** Payload en snake_case (convención del API .NET) */
export function buildEmailSendPayload(input: {
    templateCodigo: string;
    destinatariosEmails: string[];
    destinatariosUserIds?: number[];
    targetRole: string | null;
    targetCarreraId: number | null;
    targetCarreraIds?: number[];
    targetModalidadIds?: number[];
    targetPeaEstado?: string | null;
    targetPeriodoId?: string | null;
    customSubject: string;
    customBody: string;
    templateData: Record<string, string>;
    attachments: Array<{
        nombreArchivo: string;
        base64Content?: string;
        rutaArchivo?: string;
        contentType?: string;
    }>;
    entityUuid: string | null;
    entityType: string | null;
    certificateBase64: string | null;
    signaturePassword: string | null;
}) {
    return {
        template_codigo: input.templateCodigo,
        destinatarios_emails: input.destinatariosEmails,
        destinatarios_user_ids: input.destinatariosUserIds ?? [],
        target_role: input.targetRole,
        target_carrera_id: input.targetCarreraId,
        target_carrera_ids: input.targetCarreraIds ?? [],
        target_modalidad_ids: input.targetModalidadIds ?? [],
        target_pea_estado: input.targetPeaEstado ?? null,
        target_periodo_id: input.targetPeriodoId ?? null,
        custom_subject: input.customSubject,
        custom_body: input.customBody,
        template_data: input.templateData,
        attachments: input.attachments.map(a => ({
            nombre_archivo: a.nombreArchivo,
            base64_content: a.base64Content ?? null,
            ruta_archivo: a.rutaArchivo ?? null,
            content_type: a.contentType ?? null
        })),
        entity_uuid: input.entityUuid,
        entity_type: input.entityType,
        certificate_base64: input.certificateBase64,
        signature_password: input.signaturePassword
    };
}

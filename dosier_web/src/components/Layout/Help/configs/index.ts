import type { HelpConfig } from '../types';
import {
    DEFAULT_CONFIG,
    DASHBOARD_CONFIG,
    SETTINGS_CONFIG,
    ANALYTICS_CONFIG,
    NOTIFICATIONS_CONFIG,
    VERIFY_CONFIG,
    CALENDARIO_CONFIG,
    SOLICITUDES_CONFIG,
    INCIDENCIAS_CONFIG,
    LOPDP_ADMIN_CONFIG
} from './general';
import {
    DOCUMENTACION_CONFIG,
    MIS_PROYECTOS_CONFIG,
    WORKSPACE_CONFIG,
    MONITOREO_CONFIG,
    REVISION_TECNICA_CONFIG,
    SALAS_CURRICULARES_CONFIG
} from './documentacion';
import {
    USUARIOS_CONFIG,
    AUDITORIA_CONFIG,
    PLANTILLAS_CONFIG,
    ALMACENAMIENTO_CONFIG,
    EMAILS_CONFIG
} from './admin';

export const HELP_MAP: Record<string, HelpConfig> = {
    '/dashboard': DASHBOARD_CONFIG,
    '/calendario': CALENDARIO_CONFIG,
    '/configuracion': SETTINGS_CONFIG,
    '/parametros-normativos': SETTINGS_CONFIG,
    '/lopdp': LOPDP_ADMIN_CONFIG,
    '/analiticas': ANALYTICS_CONFIG,
    '/notificaciones': NOTIFICATIONS_CONFIG,
    '/verificacion': VERIFY_CONFIG,
    '/solicitudes': SOLICITUDES_CONFIG,
    '/incidencias': INCIDENCIAS_CONFIG,

    '/salas-curriculares': SALAS_CURRICULARES_CONFIG,
    '/documentacion': DOCUMENTACION_CONFIG,
    '/documentacion/mis-proyectos': MIS_PROYECTOS_CONFIG,
    '/documentacion/workspace': WORKSPACE_CONFIG,
    '/documentacion/monitoreo': MONITOREO_CONFIG,
    '/documentacion/revision-tecnica': REVISION_TECNICA_CONFIG,

    '/usuarios': USUARIOS_CONFIG,
    '/auditoria': AUDITORIA_CONFIG,
    '/plantillas': PLANTILLAS_CONFIG,
    '/admin/documentos': ALMACENAMIENTO_CONFIG,
    '/emails': EMAILS_CONFIG
};

export { DEFAULT_CONFIG };

const ROUTE_ALIASES: Record<string, string> = {
    '/settings': '/configuracion',
    '/admin/configuracion': '/configuracion',
    '/formatos': '/plantillas',
    '/formatos-oficiales': '/plantillas',
    '/admin/plantillas': '/plantillas',
    '/templates': '/plantillas',
    '/solicitud': '/solicitudes',
    '/feedback': '/incidencias',
    '/sugerencias': '/incidencias',
    '/admin/incidencias': '/incidencias',
    '/mis-incidencias': '/incidencias',
    '/admin': '/usuarios',
    '/auditoria/': '/auditoria',
    '/admin/auditoria': '/auditoria',
    '/admin/audit': '/auditoria',
    '/admin/lopdp': '/lopdp',
    '/lopdp/admin': '/lopdp',
    '/admin/emails': '/emails',
    '/verificar-firma': '/verificacion',
    '/verify': '/verificacion'
};

export const normalizePathname = (path: string): string => {
    const cleanPath = (path.split('?')[0].split('#')[0] || '/').replace(/\/+$/, '') || '/';

    if (ROUTE_ALIASES[cleanPath]) {
        return ROUTE_ALIASES[cleanPath];
    }

    const segments = cleanPath.split('/').filter(Boolean);

    if (segments[0] === 'verificacion' || segments[0] === 'verificar-firma' || segments[0] === 'verify') {
        return '/verificacion';
    }
    if (segments[0] === 'salas-curriculares') {
        return '/salas-curriculares';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'carrera' && segments[3] === 'sala-curricular') {
        return '/salas-curriculares';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'workspace') {
        return '/documentacion/workspace';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'mis-proyectos' && segments[2] === 'workspace') {
        return '/documentacion/workspace';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'monitoreo') {
        return '/documentacion/monitoreo';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'mis-proyectos' && segments[2] === 'monitoreo') {
        return '/documentacion/monitoreo';
    }
    if (segments[0] === 'documentacion' && segments[1] === 'revision-tecnica') {
        return '/documentacion/revision-tecnica';
    }

    return cleanPath;
};

/**
 * Resuelve la configuración de ayuda con prioridad:
 * 1) contextKey explícito (submódulos, pestañas o secciones),
 * 2) ruta + query exacta si existe registrada,
 * 3) ruta normalizada en HELP_MAP,
 * 4) DEFAULT_CONFIG.
 */
export const resolveHelpConfig = (
    pathname: string,
    search = '',
    contextKey?: string
): HelpConfig => {
    if (contextKey && HELP_MAP[contextKey]) {
        return HELP_MAP[contextKey];
    }

    const cleanSearch = search.trim();
    if (cleanSearch) {
        const keyWithSearch = `${normalizePathname(pathname)}${cleanSearch.startsWith('?') ? cleanSearch : `?${cleanSearch}`}`;
        if (HELP_MAP[keyWithSearch]) {
            return HELP_MAP[keyWithSearch];
        }
    }

    const normalized = normalizePathname(pathname);
    return HELP_MAP[normalized] || DEFAULT_CONFIG;
};

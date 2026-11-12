/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Modelo y Gobernanza Central de Estados del PEA (ISTPET)
 * ══════════════════════════════════════════════════════════════════════════════
 * Módulo ÚNICO y CENTRALIZADO de reglas de negocio para el ciclo de vida del PEA.
 * Define la máquina de estados institucional, permisos por rol, propiedad de
 * asignaturas, navegación inteligente, cálculo unificado de métricas y descriptores visuales.
 */

export type PeaStatusKey =
    | 'Borrador'
    | 'NoIniciado'
    | 'EnRevision'
    | 'Observado'
    | 'Corregido'
    | 'RevisadoCoord'
    | 'RevisadoAcad'
    | 'Aprobado'
    | 'Publicado'
    | 'Rechazado';

export type InstitutionalRole =
    | 'DOSIER_DOCENTE'
    | 'DOSIER_COORD_CARRERA'
    | 'DOSIER_COORD_ACAD'
    | 'DOSIER_VICERRECTOR'
    | 'DOSIER_ADMIN';

export interface RoleFlagsContext {
    isAdmin?: boolean;
    isCoordAcad?: boolean;
    isCoordCarrera?: boolean;
    isVicerrector?: boolean;
    isDocente?: boolean;
    activeRole?: string;
}

export type RoleContextInput = InstitutionalRole | RoleFlagsContext | string | null | undefined;

export interface PeaStatusDescriptor {
    key: PeaStatusKey;
    label: string;
    sublabel: string;
    dotClass: string;
    textClass: string;
    borderClass: string;
    badgeBgClass: string;
    canAudit: boolean;
    primaryActionLabel: string;
    primaryActionVariant: 'primary' | 'secondary' | 'neutral' | 'success';
}

export interface StatusDescriptorOptions {
    /**
     * Si es true, adapta la semántica visual para la mesa de supervisión y coordinación curricular:
     * El estado 'Observado' se presenta como 'En Revisión Técnica' para las autoridades,
     * reservando la etiqueta 'Con Observaciones' exclusivamente para la vista del docente que debe subsanar.
     */
    esSupervisor?: boolean;
}

export interface PeaSubjectAuthor {
    id_docente_elaborador?: string | null;
    nombre_docente_elaborador?: string | null;
}

export interface AuthenticatedUserIdentity {
    id_sigafi?: string | null;
    idSigafi?: string | null;
    id_referencia?: string | null;
    id?: number | string | null;
    id_usuario?: number | string | null;
    cedula?: string | null;
    nombre_completo?: string | null;
    nombre?: string | null;
}

export interface PeaNavigationTarget {
    url: string;
    actionLabel: string;
    esEdicionPropia: boolean;
}

export interface PeaCurricularMetrics {
    total: number;
    pendientes: number;
    aprobados: number;
    enElaboracion: number;
    misMateriasCount: number;
    misPendientesCount: number;
    rezagadosCount: number;
}

export type WorkflowFilterTab =
    | 'por_revisar'
    | 'pendientes'
    | 'aprobados'
    | 'en_redaccion'
    | 'mis_materias'
    | 'todos';

/**
 * Resuelve de forma canónica el rol institucional desde un string, código RBAC o contexto de useAuth().
 */
export const resolveRoleKey = (roleContext: RoleContextInput): InstitutionalRole => {
    if (!roleContext) return 'DOSIER_DOCENTE';

    if (typeof roleContext === 'string') {
        const upper = roleContext.trim().toUpperCase();
        if (upper === 'DOSIER_ADMIN' || upper === 'ADMIN') return 'DOSIER_ADMIN';
        if (upper === 'DOSIER_VICERRECTOR' || upper === 'VICERRECTOR') return 'DOSIER_VICERRECTOR';
        if (
            upper === 'DOSIER_COORD_ACAD' ||
            upper === 'COORD_ACAD' ||
            upper === 'COORDINACION_ACADEMICA' ||
            upper === 'COORDINADOR_ACADEMICO'
        ) {
            return 'DOSIER_COORD_ACAD';
        }
        if (
            upper === 'DOSIER_COORD_CARRERA' ||
            upper === 'COORD_CARRERA' ||
            upper === 'COORDINACION_CARRERA' ||
            upper === 'COORDINADOR_CARRERA'
        ) {
            return 'DOSIER_COORD_CARRERA';
        }
        return 'DOSIER_DOCENTE';
    }

    if (roleContext.isAdmin) return 'DOSIER_ADMIN';
    if (roleContext.isVicerrector) return 'DOSIER_VICERRECTOR';
    if (roleContext.isCoordAcad) return 'DOSIER_COORD_ACAD';
    if (roleContext.isCoordCarrera) return 'DOSIER_COORD_CARRERA';
    if (roleContext.activeRole) return resolveRoleKey(roleContext.activeRole);

    return 'DOSIER_DOCENTE';
};

/**
 * Normaliza cualquier string de estado proveniente del backend, MySQL o APIs legadas
 * a un valor estricto de la unión PeaStatusKey.
 */
export const normalizePeaStatus = (status?: string | null): PeaStatusKey => {
    if (!status || typeof status !== 'string') return 'Borrador';

    const clean = status.trim().toLowerCase().replace(/[\s_-]+/g, '');

    switch (clean) {
        case 'aprobado':
            return 'Aprobado';
        case 'publicado':
            return 'Publicado';
        case 'revisadoacad':
        case 'avalacademico':
        case 'coordacad':
            return 'RevisadoAcad';
        case 'revisadocoord':
        case 'avalcarrera':
        case 'coordcarrera':
            return 'RevisadoCoord';
        case 'enrevision':
        case 'enviado':
        case 'revision':
        case 'listopararevision':
            return 'EnRevision';
        case 'observado':
            return 'Observado';
        case 'corregido':
        case 'encorreccion':
        case 'encorrección':
            return 'Corregido';
        case 'rechazado':
            return 'Rechazado';
        case 'noiniciado':
            return 'NoIniciado';
        case 'borrador':
        case 'borradordocente':
        default:
            return 'Borrador';
    }
};

/**
 * Determina si el instrumento está en etapa de elaboración/redacción docente
 * y todavía no ha sido enviado formalmente a coordinación.
 */
export const isPeaBorrador = (status?: string | null): boolean => {
    const key = normalizePeaStatus(status);
    return key === 'Borrador' || key === 'NoIniciado';
};

/**
 * Determina si el instrumento fue enviado formalmente por el docente y se encuentra
 * en el circuito activo de revisión curricular técnica y dictamen.
 */
export const isPeaEnRevision = (status?: string | null): boolean => {
    const key = normalizePeaStatus(status);
    return key === 'EnRevision' || key === 'Observado' || key === 'Corregido';
};

/**
 * Determina si el instrumento cuenta con aval de carrera, académico o legalización final.
 */
export const isPeaAvalado = (status?: string | null): boolean => {
    const key = normalizePeaStatus(status);
    return (
        key === 'RevisadoCoord' ||
        key === 'RevisadoAcad' ||
        key === 'Aprobado' ||
        key === 'Publicado'
    );
};

/**
 * Determina si el PEA está legalizado formalmente por Vicerrectorado y en vigencia institucional.
 */
export const isPeaLegalizado = (status?: string | null): boolean => {
    const key = normalizePeaStatus(status);
    return key === 'Aprobado' || key === 'Publicado';
};

/**
 * Regla de negocio unificada: determina si una materia o PEA pertenece a la carga docente
 * asignada al usuario autenticado.
 */
export const isPeaPropio = (
    pea: PeaSubjectAuthor | null | undefined,
    user: AuthenticatedUserIdentity | null | undefined
): boolean => {
    if (!pea || !user) return false;

    const userIdentifiers = [
        user.id_sigafi,
        user.idSigafi,
        user.id_referencia,
        user.id !== undefined && user.id !== null ? String(user.id) : null,
        user.id_usuario !== undefined && user.id_usuario !== null ? String(user.id_usuario) : null,
        user.cedula
    ].filter((val): val is string => Boolean(val && typeof val === 'string' && val.trim().length > 0));

    const matchesId = Boolean(
        pea.id_docente_elaborador &&
        userIdentifiers.some(
            id => id.trim().toLowerCase() === pea.id_docente_elaborador!.trim().toLowerCase()
        )
    );

    const targetNombre = user.nombre_completo || user.nombre;
    const matchesNombre = Boolean(
        pea.nombre_docente_elaborador &&
        targetNombre &&
        pea.nombre_docente_elaborador.trim().toLowerCase() === targetNombre.trim().toLowerCase()
    );

    return matchesId || matchesNombre;
};

/**
 * Regla de negocio unificada: determina si un PEA requiere acción pendiente según el rol institucional.
 */
export const isPeaPendienteParaRol = (
    status: string | null | undefined,
    roleContext: RoleContextInput
): boolean => {
    const key = normalizePeaStatus(status);
    const role = resolveRoleKey(roleContext);

    switch (role) {
        case 'DOSIER_VICERRECTOR':
            return key === 'RevisadoAcad';

        case 'DOSIER_COORD_ACAD':
            return key === 'RevisadoCoord';

        case 'DOSIER_COORD_CARRERA':
            return key === 'EnRevision' || key === 'Observado' || key === 'Corregido';

        case 'DOSIER_DOCENTE':
            return key === 'Borrador' || key === 'NoIniciado' || key === 'Observado';

        case 'DOSIER_ADMIN':
            return (
                key === 'EnRevision' ||
                key === 'Observado' ||
                key === 'Corregido' ||
                key === 'RevisadoCoord' ||
                key === 'RevisadoAcad'
            );

        default:
            return false;
    }
};

/**
 * Regla de negocio unificada: determina si un PEA ya fue aprobado o superó la instancia de revisión del rol.
 */
export const isPeaAprobadoParaRol = (
    status: string | null | undefined,
    roleContext: RoleContextInput
): boolean => {
    const key = normalizePeaStatus(status);
    const role = resolveRoleKey(roleContext);

    switch (role) {
        case 'DOSIER_VICERRECTOR':
        case 'DOSIER_ADMIN':
            return key === 'Aprobado' || key === 'Publicado';

        case 'DOSIER_COORD_ACAD':
            // Para Coordinación Académica, solo está aprobado si ya cuenta con aval académico o legalización final
            return key === 'RevisadoAcad' || key === 'Aprobado' || key === 'Publicado';

        case 'DOSIER_COORD_CARRERA':
        case 'DOSIER_DOCENTE':
            // Para Coordinación de Carrera y Docente, cualquier aval desde carrera en adelante
            return isPeaAvalado(key);

        default:
            return false;
    }
};

/**
 * Regla de negocio unificada: determina si un PEA presenta rezago en su formulación o entrega.
 */
export const isPeaRezagado = (
    pea: { estado?: string | null; firma_docente?: string | null } | null | undefined
): boolean => {
    if (!pea) return false;
    const key = normalizePeaStatus(pea.estado);
    return key === 'Borrador' || key === 'NoIniciado' || key === 'Observado' || !pea.firma_docente;
};

/**
 * Regla de negocio unificada: resuelve la ruta de navegación y la etiqueta de acción principal
 * para un PEA en base a su titularidad y al rol del usuario.
 */
export const getPeaNavegacion = (
    pea: {
        uuid: string;
        estado?: string | null;
        id_docente_elaborador?: string | null;
        nombre_docente_elaborador?: string | null;
    },
    user?: AuthenticatedUserIdentity | null,
    roleContext?: RoleContextInput
): PeaNavigationTarget => {
    const esPropia = isPeaPropio(pea, user);
    const role = resolveRoleKey(roleContext);
    const key = normalizePeaStatus(pea.estado);

    if (esPropia) {
        const actionLabel = key === 'Observado' ? 'Corregir PEA' : 'Continuar PEA';
        return {
            url: `/documentacion/mis-proyectos/workspace/pea-oficial/${pea.uuid}?edit=pea-oficial`,
            actionLabel,
            esEdicionPropia: true
        };
    }

    const url = `/documentacion/revision-tecnica/${pea.uuid}`;
    let actionLabel = 'Ver PEA';

    if (isPeaPendienteParaRol(key, role)) {
        if (role === 'DOSIER_VICERRECTOR') {
            actionLabel = 'Firmar y Legalizar';
        } else if (role === 'DOSIER_COORD_ACAD') {
            actionLabel = 'Aprobación Académica';
        } else {
            actionLabel = 'Revisión Técnica';
        }
    } else if (isPeaAprobadoParaRol(key, role)) {
        actionLabel = 'Auditar dictamen';
    }

    return {
        url,
        actionLabel,
        esEdicionPropia: false
    };
};

/**
 * Regla de negocio unificada: calcula todas las métricas operativas y de supervisión curricular
 * para un universo de PEAs, garantizando absoluta consistencia entre dashboards y bandejas.
 */
export const getPeaMetricsForRole = (
    peas: any[],
    roleContext: RoleContextInput,
    user?: AuthenticatedUserIdentity | null
): PeaCurricularMetrics => {
    const list = Array.isArray(peas) ? peas : [];
    const role = resolveRoleKey(roleContext);

    let pendientes = 0;
    let aprobados = 0;
    let enElaboracion = 0;
    let misMateriasCount = 0;
    let misPendientesCount = 0;
    let rezagadosCount = 0;

    for (const p of list) {
        const estado = p.estado || p.status;
        if (isPeaPendienteParaRol(estado, role)) {
            pendientes++;
        }
        if (isPeaAprobadoParaRol(estado, role)) {
            aprobados++;
        }
        if (isPeaBorrador(estado)) {
            enElaboracion++;
        }
        if (isPeaRezagado(p)) {
            rezagadosCount++;
        }
        if (user && isPeaPropio(p, user)) {
            misMateriasCount++;
            if (isPeaBorrador(estado) || normalizePeaStatus(estado) === 'Observado' || !p.firma_docente) {
                misPendientesCount++;
            }
        }
    }

    return {
        total: list.length,
        pendientes,
        aprobados,
        enElaboracion,
        misMateriasCount,
        misPendientesCount,
        rezagadosCount
    };
};

/**
 * Regla de negocio unificada: filtra un conjunto de PEAs según la pestaña activa del workflow.
 */
export const filterPeasByWorkflowTab = (
    peas: any[],
    tab: WorkflowFilterTab,
    roleContext: RoleContextInput,
    user?: AuthenticatedUserIdentity | null
): any[] => {
    const list = Array.isArray(peas) ? peas : [];
    const role = resolveRoleKey(roleContext);

    return list.filter(p => {
        const estado = p.estado || p.status;
        switch (tab) {
            case 'por_revisar':
            case 'pendientes':
                return isPeaPendienteParaRol(estado, role);
            case 'aprobados':
                return isPeaAprobadoParaRol(estado, role);
            case 'en_redaccion':
                return isPeaBorrador(estado);
            case 'mis_materias':
                return isPeaPropio(p, user);
            case 'todos':
            default:
                return true;
        }
    });
};

/**
 * Retorna el descriptor visual y semántico completo para renderizado uniforme en la aplicación.
 */
export const getPeaStatusDescriptor = (
    status?: string | null,
    options?: StatusDescriptorOptions | boolean
): PeaStatusDescriptor => {
    const key = normalizePeaStatus(status);
    const esSupervisor = typeof options === 'boolean' ? options : Boolean(options?.esSupervisor);

    switch (key) {
        case 'Aprobado':
        case 'Publicado':
            return {
                key,
                label: 'Aprobado Institucional',
                sublabel: 'Legalizado y vigente',
                dotClass: 'bg-emerald-500',
                textClass: 'text-emerald-700 dark:text-emerald-300',
                borderClass: 'border-emerald-200 dark:border-emerald-900/60',
                badgeBgClass: 'bg-emerald-50 dark:bg-emerald-950/80',
                canAudit: false,
                primaryActionLabel: 'Ver expediente',
                primaryActionVariant: 'success'
            };

        case 'RevisadoAcad':
            return {
                key,
                label: 'Aprobación Académica',
                sublabel: 'En espera de firma vicerrectoral',
                dotClass: 'bg-[#0070f3]',
                textClass: 'text-[#0070f3] dark:text-blue-400',
                borderClass: 'border-indigo-200 dark:border-indigo-900/60',
                badgeBgClass: 'bg-indigo-50 dark:bg-indigo-950/80',
                canAudit: true,
                primaryActionLabel: 'Auditar dictamen',
                primaryActionVariant: 'primary'
            };

        case 'RevisadoCoord':
            return {
                key,
                label: 'Aprobación de Carrera',
                sublabel: 'En espera de revisión académica',
                dotClass: 'bg-sky-500',
                textClass: 'text-sky-700 dark:text-sky-300',
                borderClass: 'border-sky-200 dark:border-sky-900/60',
                badgeBgClass: 'bg-sky-50 dark:bg-sky-950/80',
                canAudit: true,
                primaryActionLabel: 'Auditar dictamen',
                primaryActionVariant: 'primary'
            };

        case 'EnRevision':
            return {
                key,
                label: 'En Revisión Técnica',
                sublabel: 'Remitido por docente para dictamen',
                dotClass: 'bg-amber-500',
                textClass: 'text-amber-800 dark:text-amber-300',
                borderClass: 'border-amber-200 dark:border-amber-900/60',
                badgeBgClass: 'bg-amber-50 dark:bg-amber-950/80',
                canAudit: true,
                primaryActionLabel: 'Revisión Técnica',
                primaryActionVariant: 'primary'
            };

        case 'Observado':
            if (esSupervisor) {
                return {
                    key,
                    label: 'En Revisión Técnica',
                    sublabel: 'En proceso de dictamen curricular con observaciones',
                    dotClass: 'bg-amber-500',
                    textClass: 'text-amber-800 dark:text-amber-300',
                    borderClass: 'border-amber-200 dark:border-amber-900/60',
                    badgeBgClass: 'bg-amber-50 dark:bg-amber-950/80',
                    canAudit: true,
                    primaryActionLabel: 'Revisión Técnica',
                    primaryActionVariant: 'primary'
                };
            }
            return {
                key,
                label: 'Con Observaciones',
                sublabel: 'Devuelto al docente para ajustes',
                dotClass: 'bg-rose-500',
                textClass: 'text-rose-700 dark:text-rose-300',
                borderClass: 'border-rose-200 dark:border-rose-900/60',
                badgeBgClass: 'bg-rose-50 dark:bg-rose-950/80',
                canAudit: true,
                primaryActionLabel: 'Corregir PEA',
                primaryActionVariant: 'primary'
            };

        case 'Corregido':
            return {
                key,
                label: 'Corregido por Docente',
                sublabel: 'Reingresado para segunda revisión',
                dotClass: 'bg-indigo-500',
                textClass: 'text-indigo-700 dark:text-indigo-300',
                borderClass: 'border-indigo-200 dark:border-indigo-900/60',
                badgeBgClass: 'bg-indigo-50 dark:bg-indigo-950/80',
                canAudit: true,
                primaryActionLabel: 'Revisión Técnica',
                primaryActionVariant: 'primary'
            };

        case 'Rechazado':
            return {
                key,
                label: 'Rechazado',
                sublabel: 'No admitido curricularmente',
                dotClass: 'bg-rose-600',
                textClass: 'text-rose-800 dark:text-rose-300',
                borderClass: 'border-rose-300 dark:border-rose-900',
                badgeBgClass: 'bg-rose-100 dark:bg-rose-950',
                canAudit: false,
                primaryActionLabel: 'Ver expediente',
                primaryActionVariant: 'neutral'
            };

        case 'NoIniciado':
            return {
                key,
                label: 'Sin Inicializar',
                sublabel: 'Docente no ha creado el borrador',
                dotClass: 'bg-zinc-400',
                textClass: 'text-zinc-600 dark:text-zinc-400',
                borderClass: 'border-zinc-200 dark:border-zinc-800',
                badgeBgClass: 'bg-zinc-50 dark:bg-zinc-900',
                canAudit: false,
                primaryActionLabel: 'Sin avance',
                primaryActionVariant: 'neutral'
            };

        case 'Borrador':
        default:
            return {
                key: 'Borrador',
                label: 'En redacción docente',
                sublabel: 'Borrador no remitido a coordinación',
                dotClass: 'bg-slate-400 dark:bg-zinc-500',
                textClass: 'text-slate-600 dark:text-zinc-400',
                borderClass: 'border-slate-200 dark:border-zinc-800',
                badgeBgClass: 'bg-slate-100 dark:bg-zinc-900',
                canAudit: false,
                primaryActionLabel: 'Consultar avance',
                primaryActionVariant: 'secondary'
            };
    }
};

/**
 * Normaliza y formatea la modalidad curricular según la denominación oficial institucional.
 */
export const formatModalidad = (mod?: string | null, idModalidad?: number | null): string => {
    if (mod && mod.trim()) {
        const clean = mod.trim();
        const lower = clean.toLowerCase();
        if (
            lower.includes('linea') ||
            lower.includes('línea') ||
            lower.includes('virtual') ||
            lower.includes('online')
        ) {
            return 'En línea';
        }
        if (lower.includes('semipresencial')) {
            return 'Semipresencial';
        }
        if (lower.includes('hibrid') || lower.includes('híbrid')) {
            return 'Híbrida';
        }
        if (lower.includes('presencial')) {
            return 'Presencial';
        }
        return clean;
    }
    if (idModalidad === 2 || idModalidad === 3) {
        return 'En línea';
    }
    return 'Presencial';
};

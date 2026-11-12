/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — Dominio Curricular: Modelo y Gobernanza de Estados del PEA (ISTPET)
 * ══════════════════════════════════════════════════════════════════════════════
 * Define la máquina de estados institucional, normalización tipada, permisos
 * de auditoría y descriptores visuales bajo Modern Enterprise Docs.
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

export interface StatusDescriptorOptions {
    /**
     * Si es true, adapta la semántica visual para la mesa de supervisión y coordinación curricular:
     * El estado 'Observado' se presenta como 'En Revisión Técnica' para las autoridades,
     * reservando la etiqueta 'Con Observaciones' exclusivamente para la vista del docente que debe subsanar.
     */
    esSupervisor?: boolean;
}

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
        if (lower.includes('linea') || lower.includes('línea') || lower.includes('virtual') || lower.includes('online')) {
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


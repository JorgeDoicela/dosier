/**
 * Utilidad de persistencia local para tracking de apertura y ordenamiento
 * de asignaturas/PEA por uso reciente del usuario (algoritmo invisible).
 */

const STORAGE_KEY = 'dosier_recent_opened_asignaciones';

export interface SubjectIdentifiable {
    id_asignacion?: number;
    idAsignacion?: number;
    uuid_pea?: string;
    uuid?: string;
    id_pea?: number;
    idPea?: number;
}

/**
 * Registra en localStorage el instante exacto en que el usuario abre o interactúa
 * con una asignatura/PEA.
 */
export const recordRecentSubjectOpen = (subject: SubjectIdentifiable): void => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data: Record<string, number> = raw ? JSON.parse(raw) : {};
        const now = Date.now();
        const rawUuid = subject.uuid_pea || subject.uuid;
        const uuidVal = rawUuid ? rawUuid.trim().toLowerCase() : undefined;
        const asigId = subject.id_asignacion ?? subject.idAsignacion;
        const peaId = subject.id_pea ?? subject.idPea;

        if (asigId) {
            data[`asig_${asigId}`] = now;
        }
        if (uuidVal) {
            data[`uuid_${uuidVal}`] = now;
        }
        if (peaId) {
            data[`pea_${peaId}`] = now;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent('dosier-recents-updated'));
    } catch (err) {
        console.warn('[DOSIER Recents] Error al guardar apertura reciente:', err);
    }
};

/**
 * Obtiene el timestamp en ms de la última apertura de una asignatura.
 * Consulta tanto el registro directo de asignaciones como el historial
 * de proyectos recientes guardado por el Workspace (useProjectPreferences).
 */
export const getSubjectLastOpenedAt = (subject: SubjectIdentifiable): number => {
    try {
        let maxTime = 0;
        const rawUuid = subject.uuid_pea || subject.uuid;
        const uuidVal = rawUuid ? rawUuid.trim().toLowerCase() : undefined;
        const asigId = subject.id_asignacion ?? subject.idAsignacion;
        const peaId = subject.id_pea ?? subject.idPea;

        // 1. Registro directo por asignación / PEA
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data: Record<string, number> = JSON.parse(raw);
            if (asigId && data[`asig_${asigId}`]) {
                maxTime = Math.max(maxTime, data[`asig_${asigId}`]);
            }
            if (uuidVal && data[`uuid_${uuidVal}`]) {
                maxTime = Math.max(maxTime, data[`uuid_${uuidVal}`]);
            }
            if (peaId && data[`pea_${peaId}`]) {
                maxTime = Math.max(maxTime, data[`pea_${peaId}`]);
            }
        }

        // 2. Compatibilidad con el historial general de proyectos del Workspace (dosier_recents_*)
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('dosier_recents_')) {
                try {
                    const recents = JSON.parse(localStorage.getItem(k) || '[]');
                    if (Array.isArray(recents)) {
                        const match = recents.find((r: { uuid?: string; lastVisitedAt?: number }) => {
                            if (!r?.uuid) return false;
                            const rUuid = String(r.uuid).trim().toLowerCase();
                            return (uuidVal && rUuid === uuidVal) ||
                                (peaId && rUuid === String(peaId));
                        });
                        if (match?.lastVisitedAt) {
                            maxTime = Math.max(maxTime, match.lastVisitedAt);
                        }
                    }
                } catch {
                    // Ignorar entradas corruptas
                }
            }
        }

        return maxTime;
    } catch {
        return 0;
    }
};

/**
 * Ordena la lista de asignaturas priorizando las más recientemente abiertas
 * por el usuario en orden descendente, sin importar el estado del PEA
 * (Borrador, En Revisión, Aval, Con Observaciones, Aprobado, etc.).
 */
export const sortSubjectsByRecentOpen = <T extends SubjectIdentifiable>(subjects: T[]): T[] => {
    return [...subjects].sort((a, b) => {
        const timeA = getSubjectLastOpenedAt(a);
        const timeB = getSubjectLastOpenedAt(b);

        if (timeB !== timeA) {
            return timeB - timeA; // El más recientemente abierto va primero
        }

        // Si ninguno tiene historial de apertura local reciente, ordenar por fecha de modificación si existe
        const dateA = (a as any).fecha_modificacion || (a as any).fechaModificacion;
        const dateB = (b as any).fecha_modificacion || (b as any).fechaModificacion;
        if (dateA && dateB) {
            const parsedA = new Date(dateA).getTime();
            const parsedB = new Date(dateB).getTime();
            if (!isNaN(parsedA) && !isNaN(parsedB) && parsedB !== parsedA) {
                return parsedB - parsedA;
            }
        }

        return 0; // Conserva el orden original
    });
};


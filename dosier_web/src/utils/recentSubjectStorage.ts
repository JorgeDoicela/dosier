/**
 * Utilidad de persistencia local para tracking de apertura y ordenamiento
 * de asignaturas/PEA por uso reciente del usuario (algoritmo invisible).
 */

const STORAGE_KEY = 'dosier_recent_opened_asignaciones';

export interface SubjectIdentifiable {
    id_asignacion: number;
    uuid_pea?: string;
    id_pea?: number;
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

        if (subject.id_asignacion) {
            data[`asig_${subject.id_asignacion}`] = now;
        }
        if (subject.uuid_pea) {
            data[`uuid_${subject.uuid_pea}`] = now;
        }
        if (subject.id_pea) {
            data[`pea_${subject.id_pea}`] = now;
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

        // 1. Registro directo por asignación / PEA
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const data: Record<string, number> = JSON.parse(raw);
            if (subject.id_asignacion && data[`asig_${subject.id_asignacion}`]) {
                maxTime = Math.max(maxTime, data[`asig_${subject.id_asignacion}`]);
            }
            if (subject.uuid_pea && data[`uuid_${subject.uuid_pea}`]) {
                maxTime = Math.max(maxTime, data[`uuid_${subject.uuid_pea}`]);
            }
            if (subject.id_pea && data[`pea_${subject.id_pea}`]) {
                maxTime = Math.max(maxTime, data[`pea_${subject.id_pea}`]);
            }
        }

        // 2. Compatibilidad con el historial general de proyectos del Workspace (dosier_recents_*)
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('dosier_recents_')) {
                try {
                    const recents = JSON.parse(localStorage.getItem(k) || '[]');
                    if (Array.isArray(recents)) {
                        const match = recents.find((r: { uuid?: string; lastVisitedAt?: number }) =>
                            (subject.uuid_pea && r.uuid === subject.uuid_pea) ||
                            (subject.id_pea && String(r.uuid) === String(subject.id_pea))
                        );
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

        return 0; // Conserva el orden original si ninguno ha sido abierto o tienen el mismo timestamp
    });
};


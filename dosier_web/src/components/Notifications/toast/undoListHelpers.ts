/**
 * Restaura un elemento eliminado en su posición original de forma funcional e idempotente.
 * Nunca sobrescribe el array completo con un snapshot viejo, evitando resucitar otros
 * elementos eliminados posteriormente o perder elementos nuevos que hayan llegado.
 */
export function restoreItemAtIndex<T>(
    currentList: T[],
    item: T,
    originalIndex: number,
    getKey: (entry: T) => string
): T[] {
    const key = getKey(item);
    if (currentList.some((entry) => getKey(entry) === key)) {
        return currentList;
    }
    const clampedIndex = Math.min(Math.max(originalIndex, 0), currentList.length);
    const next = [...currentList];
    next.splice(clampedIndex, 0, item);
    return next;
}

/**
 * Restaura múltiples elementos eliminados en lote sin duplicar claves existentes,
 * aplicando opcionalmente un comparador para preservar el orden canónico (ej. cronológico).
 */
export function restoreItemsPreservingOrder<T>(
    currentList: T[],
    itemsToRestore: T[],
    getKey: (entry: T) => string,
    sortCompare?: (a: T, b: T) => number
): T[] {
    if (itemsToRestore.length === 0) return currentList;

    const existingKeys = new Set(currentList.map(getKey));
    const missing = itemsToRestore.filter((item) => !existingKeys.has(getKey(item)));
    if (missing.length === 0) return currentList;

    const merged = [...currentList, ...missing];
    if (sortCompare) {
        merged.sort(sortCompare);
    }
    return merged;
}

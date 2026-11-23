import { describe, it, expect } from 'vitest';
import {
    restoreItemAtIndex,
    restoreItemsPreservingOrder,
} from '../undoListHelpers';

interface Item {
    uuid: string;
    titulo: string;
    fecha_envio: string;
}

const makeItems = (): Item[] => [
    { uuid: 'n1', titulo: 'Primera', fecha_envio: '2026-11-23T10:00:00Z' },
    { uuid: 'n2', titulo: 'Segunda', fecha_envio: '2026-11-23T09:00:00Z' },
    { uuid: 'n3', titulo: 'Tercera', fecha_envio: '2026-11-23T08:00:00Z' },
];

describe('restoreItemAtIndex — restauración segura sin resucitar otros elementos', () => {
    it('restaura un elemento en su posición original', () => {
        const initial = makeItems();
        const afterDelete = initial.filter((x) => x.uuid !== 'n2');

        const restored = restoreItemAtIndex(afterDelete, initial[1], 1, (x) => x.uuid);
        expect(restored.map((x) => x.uuid)).toEqual(['n1', 'n2', 'n3']);
    });

    it('al eliminar A y luego B, deshacer A NO resucita B', () => {
        const initial = makeItems();
        const itemA = initial[0];
        // Eliminar n1 y luego n2
        const afterBothDeletes = initial.filter((x) => x.uuid !== 'n1' && x.uuid !== 'n2');
        expect(afterBothDeletes.map((x) => x.uuid)).toEqual(['n3']);

        // Deshacer solo n1
        const restored = restoreItemAtIndex(afterBothDeletes, itemA, 0, (x) => x.uuid);
        expect(restored.map((x) => x.uuid)).toEqual(['n1', 'n3']);
    });

    it('es idempotente y no duplica si el elemento ya existe en la lista', () => {
        const initial = makeItems();
        const restored = restoreItemAtIndex(initial, initial[1], 1, (x) => x.uuid);
        expect(restored).toBe(initial);
        expect(restored).toHaveLength(3);
    });

    it('ajusta el índice si la lista actual es más corta que el índice original', () => {
        const initial = makeItems();
        const onlyFirst = [initial[0]];
        const restored = restoreItemAtIndex(onlyFirst, initial[2], 5, (x) => x.uuid);
        expect(restored.map((x) => x.uuid)).toEqual(['n1', 'n3']);
    });
});

describe('restoreItemsPreservingOrder — restauración en lote cronológica', () => {
    it('restaura múltiples elementos leídos en orden descendente sin perder nuevos', () => {
        const cleared = [
            { uuid: 'n2', titulo: 'Leída 2', fecha_envio: '2026-11-23T09:00:00Z' },
            { uuid: 'n3', titulo: 'Leída 3', fecha_envio: '2026-11-23T08:00:00Z' },
        ];
        const currentWithNew = [
            { uuid: 'n4', titulo: 'Nueva recién llegada', fecha_envio: '2026-11-23T11:00:00Z' },
            { uuid: 'n1', titulo: 'No leída 1', fecha_envio: '2026-11-23T10:00:00Z' },
        ];

        const restored = restoreItemsPreservingOrder(
            currentWithNew,
            cleared,
            (x) => x.uuid,
            (a, b) => new Date(b.fecha_envio).getTime() - new Date(a.fecha_envio).getTime()
        );

        expect(restored.map((x) => x.uuid)).toEqual(['n4', 'n1', 'n2', 'n3']);
    });

    it('no duplica elementos que ya estaban presentes', () => {
        const current = makeItems();
        const restored = restoreItemsPreservingOrder(current, [current[0], current[2]], (x) => x.uuid);
        expect(restored).toBe(current);
        expect(restored).toHaveLength(3);
    });
});

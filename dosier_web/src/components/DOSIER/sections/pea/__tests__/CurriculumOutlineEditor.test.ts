import { describe, it, expect } from 'vitest';
import { renumberOutlineText } from '../CurriculumOutlineEditor';

describe('CurriculumOutlineEditor - renumberOutlineText', () => {
    it('formatea y renumera temas y subtemas correlativos de forma limpia', () => {
        const input = `Tema 1: Introducción a la Web
1.1 Conceptos
1.3 Arquitectura
Tema 2: Backend
1.1 Node
1.5 Express`;

        const output = renumberOutlineText(input, 1);

        expect(output).toContain('Tema 1: Introducción a la Web');
        expect(output).toContain('1.1 Conceptos');
        expect(output).toContain('1.2 Arquitectura');
        expect(output).toContain('Tema 2: Backend');
        expect(output).toContain('2.1 Node');
        expect(output).toContain('2.2 Express');
    });

    it('asigna el prefijo de la unidad a subtemas si no hay título previo', () => {
        const input = `1.1 Fundamentos
1.4 Algoritmos`;

        const output = renumberOutlineText(input, 3);

        expect(output).toContain('3.1 Fundamentos');
        expect(output).toContain('3.2 Algoritmos');
    });

    it('convierte viñetas simples a numeración correlativa', () => {
        const input = `- Concepto A
- Concepto B`;

        const output = renumberOutlineText(input, 2);

        expect(output).toContain('2.1 Concepto A');
        expect(output).toContain('2.2 Concepto B');
    });
});
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from '../HelpModal';
import { HELP_MAP } from '../configs';

vi.mock('../../../../api/AuthContext', () => ({
    useAuth: () => ({
        isAdmin: false,
        isDocente: false,
        isCoordCarrera: true,
        isCoordAcad: false,
        isVicerrector: false,
        activeRole: 'DOSIER_COORD_CARRERA',
        roleDisplayName: 'Coordinación de Carrera'
    })
}));

describe('HelpModal y sistema de esquemas visuales', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza todas las rutas registradas y la ruta por defecto con esquema visual 100% sin palabras', () => {
        const routes = [...Object.keys(HELP_MAP), '/ruta-inexistente'];

        for (const route of routes) {
            const { unmount } = render(
                <HelpModal isOpen={true} onClose={vi.fn()} pathname={route} />
            );

            const frame = screen.getByTestId('help-mockup-frame');
            expect(frame).toBeInTheDocument();
            expect(frame.textContent?.trim()).toBe('');

            unmount();
        }
    });

    it('permite navegar paso a paso con Atrás, Siguiente y teclado sin mostrar etiquetas PASO X DE Y', () => {
        const onClose = vi.fn();
        render(<HelpModal isOpen={true} onClose={onClose} pathname="/dashboard" />);

        expect(screen.getByText('Panel de Coordinación de Carrera')).toBeInTheDocument();
        expect(screen.queryByText(/PASO \d+ DE \d+/i)).not.toBeInTheDocument();

        const btnNext = screen.getByRole('button', { name: 'Siguiente' });
        fireEvent.click(btnNext);
        expect(screen.queryByText(/PASO \d+ DE \d+/i)).not.toBeInTheDocument();

        const btnBack = screen.getByRole('button', { name: 'Atrás' });
        fireEvent.click(btnBack);
        expect(screen.getByText('Vista general del módulo')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});

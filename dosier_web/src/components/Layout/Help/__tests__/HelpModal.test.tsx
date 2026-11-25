import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from '../HelpModal';
import { HelpVideoPanel } from '../HelpVideoPanel';
import { resolveVideoSource } from '../videoSource';
import { HELP_MAP, resolveHelpConfig } from '../configs';
import { HELP_OPEN_EVENT, openContextualHelp } from '../helpEvents';

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

vi.mock('../../../../services/helpVideosService', () => ({
    HELP_VIDEOS_CHANGED_EVENT: 'dosier-help-videos-changed',
    helpVideosService: {
        getByRoute: vi.fn().mockResolvedValue([]),
        getAllAdmin: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        remove: vi.fn()
    }
}));

describe('HelpModal y sistema de esquemas visuales + modo video', () => {
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

    it('alterna entre guía visual y modo videos mostrando estado activo y regreso limpio cuando no hay videos', async () => {
        render(<HelpModal isOpen={true} onClose={vi.fn()} pathname="/dashboard" />);

        const btnGuide = screen.getByRole('button', { name: 'Guía visual' });
        const btnVideos = screen.getByRole('button', { name: 'Videos' });
        expect(btnGuide).toHaveAttribute('aria-pressed', 'true');
        expect(btnVideos).toHaveAttribute('aria-pressed', 'false');

        fireEvent.click(btnVideos);
        expect(btnGuide).toHaveAttribute('aria-pressed', 'false');
        expect(btnVideos).toHaveAttribute('aria-pressed', 'true');
        expect(await screen.findByText('Sin videos registrados')).toBeInTheDocument();
        expect(screen.queryByTestId('help-mockup-frame')).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Volver a guía visual' }));
        expect(btnGuide).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByTestId('help-mockup-frame')).toBeInTheDocument();
    });

    it('abre directamente en modo videos cuando initialMode es videos', async () => {
        render(
            <HelpModal
                isOpen={true}
                onClose={vi.fn()}
                pathname="/dashboard"
                initialMode="videos"
            />
        );

        expect(await screen.findByText('Sin videos registrados')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Videos' })).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getByRole('button', { name: 'Guía visual' })).toHaveAttribute('aria-pressed', 'false');
    });

    it('reproduce videos nativos (.mp4) y embebidos (YouTube) permitiendo cambiar entre múltiples tutoriales', () => {
        const onBack = vi.fn();
        render(
            <HelpVideoPanel
                moduleTitle="Panel de Coordinación de Carrera"
                onBackToGuide={onBack}
                videos={[
                    {
                        id: 'v1',
                        title: 'Recorrido inicial',
                        description: 'Cómo revisar PEAs pendientes.',
                        duration: '02:15',
                        url: '/videos/coord-carrera.mp4'
                    },
                    {
                        id: 'v2',
                        title: 'Registro de observaciones',
                        duration: '01:40',
                        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                    }
                ]}
            />
        );

        const videoEl = document.querySelector('video');
        expect(videoEl).not.toBeNull();
        expect(videoEl?.getAttribute('src')).toBe('/videos/coord-carrera.mp4');

        fireEvent.click(screen.getByRole('button', { name: /Registro de observaciones/i }));
        const iframeEl = document.querySelector('iframe');
        expect(iframeEl).not.toBeNull();
        expect(iframeEl?.getAttribute('src')).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0');
    });

    it('resuelve fuentes de video de forma segura y rechaza esquemas inseguros', () => {
        expect(resolveVideoSource('/videos/tutorial.mp4')).toEqual({
            kind: 'native',
            src: '/videos/tutorial.mp4'
        });
        expect(resolveVideoSource('https://youtu.be/abc123XYZ')).toEqual({
            kind: 'embed',
            provider: 'youtube',
            src: 'https://www.youtube-nocookie.com/embed/abc123XYZ?rel=0'
        });
        expect(resolveVideoSource('https://vimeo.com/12345678')).toEqual({
            kind: 'embed',
            provider: 'vimeo',
            src: 'https://player.vimeo.com/video/12345678'
        });
        expect(resolveVideoSource('https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrSt/view?usp=sharing')).toEqual({
            kind: 'embed',
            provider: 'gdrive',
            src: 'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrSt/preview'
        });
        expect(resolveVideoSource('https://www.loom.com/share/1234567890abcdef1234567890abcdef')).toEqual({
            kind: 'embed',
            provider: 'loom',
            src: 'https://www.loom.com/embed/1234567890abcdef1234567890abcdef'
        });
        expect(resolveVideoSource('https://cdn.istpet.edu.ec/manual/guia')).toEqual({
            kind: 'external',
            src: 'https://cdn.istpet.edu.ec/manual/guia'
        });
        expect(resolveVideoSource('javascript:alert(1)')).toEqual({ kind: 'invalid' });
        expect(resolveVideoSource('//evil.com/video.mp4')).toEqual({ kind: 'invalid' });
    });

    it('escala con listas largas de videos habilitando buscador al superar 5 elementos', () => {
        const manyVideos = Array.from({ length: 6 }).map((_, idx) => ({
            id: `sec-${idx + 1}`,
            title: idx === 4 ? 'Bibliografía APA 7' : `Sección ${idx + 1}`,
            duration: '01:20',
            url: `/videos/sec-${idx + 1}.mp4`
        }));

        render(
            <HelpVideoPanel
                moduleTitle="Workspace PEA"
                videos={manyVideos}
                onBackToGuide={vi.fn()}
            />
        );

        const searchInput = screen.getByLabelText('Filtrar videos');
        fireEvent.change(searchInput, { target: { value: 'Bibliografía' } });

        expect(screen.getByRole('button', { name: /Bibliografía APA 7/i })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Sección 1/i })).not.toBeInTheDocument();
    });

    it('resuelve contextos de Workspace, Sala Curricular y contextKey explícito, y despacha dosier-open-help', () => {
        expect(resolveHelpConfig('/documentacion/mis-proyectos/workspace/pea-oficial/abc-123').title)
            .toBe('Espacio de Trabajo y Co-Redacción PEA');
        expect(resolveHelpConfig('/salas-curriculares/9', '?periodo=OCT2026').title)
            .toBe('Salas Curriculares Colegiadas');
        expect(resolveHelpConfig('/dashboard', '', '/plantillas').title)
            .toBe('Editor de Plantillas Documentales');

        const listener = vi.fn();
        window.addEventListener(HELP_OPEN_EVENT, listener);
        openContextualHelp({ mode: 'videos', contextKey: '/documentacion/workspace' });
        window.removeEventListener(HELP_OPEN_EVENT, listener);

        expect(listener).toHaveBeenCalledTimes(1);
    });
});

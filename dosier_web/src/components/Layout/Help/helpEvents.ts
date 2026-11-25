export type HelpModalMode = 'guide' | 'videos';

export interface OpenHelpDetail {
    mode?: HelpModalMode;
    contextKey?: string;
}

export const HELP_OPEN_EVENT = 'dosier-open-help';

/**
 * Abre la guía contextual desde cualquier pantalla, cabecera o subcomponente
 * (incluyendo vistas de altura completa como DocumentWorkspace y SalaCarreraPage).
 */
export const openContextualHelp = (detail?: OpenHelpDetail): void => {
    window.dispatchEvent(new CustomEvent<OpenHelpDetail>(HELP_OPEN_EVENT, { detail }));
};

/**
 * @file types.ts
 * @description Contratos de tipado estricto para los renderizadores de bloques curriculares del PEA en el lienzo.
 */

export interface PeaBlockConfig {
    [key: string]: unknown;
    headerColor?: string;
    subHeaderColor?: string;
    tableHeaderBg?: string;
    borderStyle?: string;
    showHeader?: boolean;
    institutionName?: string;
    institutionAddress?: string;
    documentTitle?: string;
    title?: string;
}

export interface PeaBlockProps {
    config?: PeaBlockConfig;
    title?: string;
    blockId?: string;
    onUpdateConfig?: (blockId: string, key: string, value: unknown) => void;
}

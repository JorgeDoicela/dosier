/**
 * @file DocumentTemplatesPage.tsx
 * @description Vista principal de la consola de administración de plantillas de documentos en DOSIER.
 *
 * @architecture
 * Implementa un diseño de maquetación interactivo en 3 columnas (Catálogo, Lienzo A4 y Propiedades).
 * Utiliza el custom hook `useDocumentTemplatesPage` para la gestión centralizada de estado y API,
 * reduciendo la responsabilidad de este componente a la maquetación y estructura visual.
 *
 * @pattern Custom Hook + Sub-componentes Modularizados
 */

import React from 'react';
import { PageHeader } from '../../../components/Common/PageHeader';
import {
    FileCode2,
    Save,
    Plus,
    ChevronDown,
    RefreshCw,
    RotateCcw,
    Eye
} from 'lucide-react';
import { DndContext, rectIntersection } from '@dnd-kit/core';
import type { BlockType } from './types';
import { TemplateCatalog } from './components/TemplateCatalog';
import { BlockCanvas } from './components/BlockCanvas';
import { BlockProperties } from './components/BlockProperties';
import { BlockPalette } from './components/BlockPalette';
import { TemplatePreviewModal } from './components/TemplatePreviewModal';
import { useDocumentTemplatesPage } from './hooks/useDocumentTemplatesPage';
import { generateHtmlFromBlocks } from './utils/HtmlGenerator';
import { mergeWithDefaults } from './utils/theme-schema';

/** Tipos de bloques de los que solo se permite una única instancia por plantilla */
const UNIQUE_BLOCK_TYPES: BlockType[] = [
    'cover',
    'project_general_section',
    'project_technical_section',
    'researchers_table',
    'gantt',
    'impacts',
    'signatures',
    'pea_general_section',
    'pea_objective_section',
    'pea_prerequisites_section',
    'pea_career_outcomes_section',
    'pea_subject_outcomes_section',
    'pea_characterization_section',
    'pea_competencies_rda_section',
    'pea_contents_section',
    'pea_methodology_section',
    'pea_resources_section',
    'pea_evaluation_section',
    'pea_bibliography_section',
    'pea_signatures_section'
];

export const DocumentTemplatesPage: React.FC = () => {
    const {
        templates,
        selectedTemplate,
        blocks,
        activeBlockId,
        setActiveBlockId,
        loading,
        saving,
        isDirty,
        isDark,
        showPalette,
        setShowPalette,
        activeMobileTab,
        setActiveMobileTab,
        paletteRef,
        headerCollapsed,
        setHeaderCollapsed,
        isSidebarCollapsed,
        toggleSidebar,
        sensors,
        activeBlock,
        previewModalOpen,
        previewingTemplate,
        handleOpenPreview,
        handleClosePreview,
        handleQuickDownloadPdf,
        handleSelectTemplate,
        handleAddBlock,
        handleDuplicateBlock,
        handleDeleteBlock,
        handleToggleActive,
        handleUpdateConfig,
        handleUpdateThemeConfig,
        handleSaveTemplate,
        handleResetToDefault,
        handleCellChange,
        handleAddRow,
        handleRemoveRow,
        handleDragEnd,
        handleReorderTemplates,
    } = useDocumentTemplatesPage();

    return (
        <main className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] px-4 sm:px-6 lg:px-8 py-3 overflow-hidden bg-bg-deep select-none">
            {/* Cabecera de Página Colapsable */}
            <div className={`relative transition-all duration-300 ease-in-out shrink-0 ${headerCollapsed
                ? 'max-h-0 opacity-0 mb-0 pb-0 pointer-events-none overflow-hidden'
                : 'max-h-[170px] opacity-100 pb-5 mb-1 overflow-visible'
                }`}>
                <PageHeader
                    kicker="Administración de Plantillas"
                    icon={FileCode2}
                    title="Editor de Plantillas"
                    description="Diseñador visual de documentos y PEA oficial. Arrastra bloques, añade tablas y define la maquetación del PDF oficial del ISTPET."
                    className="relative z-30"
                />

                {selectedTemplate && !headerCollapsed && (
                    <div className="absolute bottom-1 right-0 flex items-center gap-2.5 z-30 animate-fade-in">
                        <button
                            type="button"
                            onClick={() => handleOpenPreview()}
                            title="Previsualizar PDF en caliente con los bloques y estilos actuales"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-thin text-text-main bg-surface hover:bg-surface-hover hover:border-border-hover text-xs font-medium transition-all cursor-pointer"
                        >
                            <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Previsualizar PDF</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleResetToDefault}
                            disabled={loading || saving}
                            title="Restablecer la plantilla a los archivos oficiales de fábrica"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-thin text-text-muted hover:text-text-main bg-surface hover:bg-surface-hover hover:border-border-hover text-xs font-medium transition-all cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>Restablecer a Fábrica</span>
                        </button>

                        <div ref={paletteRef} className="relative">
                            <button
                                type="button"
                                onClick={() => setShowPalette(p => !p)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-thin text-text-main bg-surface hover:bg-surface-hover hover:border-border-hover text-xs font-medium transition-all cursor-pointer"
                            >
                                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                                Agregar Bloque
                                <ChevronDown className={`w-3 h-3 transition-transform ${showPalette ? 'rotate-180' : ''}`} />
                            </button>

                            {showPalette && (
                                <BlockPalette
                                    blocks={blocks}
                                    uniqueBlockTypes={UNIQUE_BLOCK_TYPES}
                                    onAddBlock={handleAddBlock}
                                    onClose={() => setShowPalette(false)}
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleSaveTemplate}
                            disabled={saving || !isDirty}
                            className="btn-vercel-primary flex items-center gap-1.5 text-xs font-semibold !py-1.5 !px-3 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                            <span>{saving ? 'Publicando...' : 'Publicar Plantilla'}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Botones Flotantes Circulares cuando la Cabecera está Colapsada */}
            {selectedTemplate && headerCollapsed && (
                <div className="absolute top-[13px] right-6 md:right-14 z-50 flex items-center gap-2 animate-fade-in">
                    <button
                        type="button"
                        onClick={() => handleOpenPreview()}
                        title="Previsualizar PDF oficial"
                        className="w-9 h-9 rounded-full border border-border-thin text-text-main bg-surface hover:bg-surface-hover hover:border-border-hover flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
                    >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    <div ref={paletteRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setShowPalette(p => !p)}
                            title="Agregar Bloque"
                            className="w-9 h-9 rounded-full border border-border-thin text-text-main bg-surface hover:bg-surface-hover hover:border-border-hover flex items-center justify-center transition-all cursor-pointer shadow-md shrink-0"
                        >
                            <Plus className="w-4 h-4" strokeWidth={1.5} />
                        </button>

                        {showPalette && (
                            <BlockPalette
                                blocks={blocks}
                                uniqueBlockTypes={UNIQUE_BLOCK_TYPES}
                                onAddBlock={handleAddBlock}
                                onClose={() => setShowPalette(false)}
                            />
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={saving || !isDirty}
                        title={`Guardar y Publicar v${selectedTemplate.version}`}
                        className="w-9 h-9 rounded-full bg-text-main text-bg-deep flex items-center justify-center hover:opacity-90 transition-all shadow-md disabled:opacity-40 cursor-pointer shrink-0"
                    >
                        {saving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                        ) : (
                            <Save className="w-4 h-4" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            )}

            {/* Pestañas de Vista Compacta */}
            {selectedTemplate && (
                <div className="flex md:hidden border-b border-border-thin bg-surface shrink-0 mb-3 rounded-lg overflow-hidden border">
                    <button
                        type="button"
                        onClick={() => setActiveMobileTab('catalog')}
                        className={`flex-1 py-2 text-center text-xs font-bold transition-colors cursor-pointer ${activeMobileTab === 'catalog' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-text-dim'}`}
                    >
                        Catálogo
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveMobileTab('canvas')}
                        className={`flex-1 py-2 text-center text-xs font-bold transition-colors cursor-pointer ${activeMobileTab === 'canvas' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-text-dim'}`}
                    >
                        Lienzo ({blocks.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveMobileTab('properties')}
                        className={`flex-1 py-2 text-center text-xs font-bold transition-colors cursor-pointer ${activeMobileTab === 'properties' ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-text-dim'}`}
                    >
                        Ajustes
                    </button>
                </div>
            )}

            {/* Área Principal de 3 Columnas */}
            <div className="flex-1 flex gap-4 min-h-0 overflow-hidden relative">
                <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleDragEnd}>
                    {/* Columna Izquierda: Catálogo */}
                    <div className={`w-80 shrink-0 flex-col min-h-0 md:flex ${activeMobileTab === 'catalog' ? 'flex w-full md:w-80' : 'hidden'}`}>
                        <TemplateCatalog
                            templates={templates}
                            selectedTemplate={selectedTemplate}
                            onSelectTemplate={handleSelectTemplate}
                            onPreviewTemplate={handleOpenPreview}
                            onDownloadPdf={handleQuickDownloadPdf}
                            isSidebarCollapsed={isSidebarCollapsed}
                            onToggleSidebar={toggleSidebar}
                            headerCollapsed={headerCollapsed}
                            onReorderTemplates={handleReorderTemplates}
                        />
                    </div>

                    {/* Columna Central: Lienzo Interactivo A4 */}
                    <div className={`flex-1 min-w-0 flex-col min-h-0 md:flex ${activeMobileTab === 'canvas' ? 'flex w-full md:w-auto' : 'hidden'}`}>
                        <BlockCanvas
                            selectedTemplate={selectedTemplate}
                            templateName={selectedTemplate?.name}
                            blocks={blocks}
                            activeBlockId={activeBlockId}
                            onSelectBlock={setActiveBlockId}
                            onDuplicateBlock={handleDuplicateBlock}
                            onDeleteBlock={handleDeleteBlock}
                            onToggleActive={handleToggleActive}
                            onUpdateConfig={handleUpdateConfig}
                            onCellChange={handleCellChange}
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            isDark={isDark}
                            onSaveTemplate={handleSaveTemplate}
                            saving={saving}
                            isDirty={isDirty}
                            headerCollapsed={headerCollapsed}
                            onToggleHeader={() => setHeaderCollapsed(prev => !prev)}
                        />
                    </div>

                    {/* Columna Derecha: Panel de Propiedades y Tema */}
                    <div className={`w-96 shrink-0 flex-col min-h-0 md:flex ${activeMobileTab === 'properties' ? 'flex w-full md:w-96' : 'hidden'}`}>
                        <BlockProperties
                            selectedTemplate={selectedTemplate}
                            activeBlock={activeBlock}
                            onUpdateConfig={handleUpdateConfig}
                            onCellChange={handleCellChange}
                            onAddRow={handleAddRow}
                            onRemoveRow={handleRemoveRow}
                            themeConfigJson={selectedTemplate?.themeConfigJson}
                            onUpdateThemeConfig={handleUpdateThemeConfig}
                            headerCollapsed={headerCollapsed}
                        />
                    </div>
                </DndContext>
            </div>

            {/* Modal de Previsualización y Descarga Oficial del PDF */}
            <TemplatePreviewModal
                isOpen={previewModalOpen}
                template={previewingTemplate}
                onClose={handleClosePreview}
                generatedHtml={
                    selectedTemplate && previewingTemplate?.code === selectedTemplate.code && blocks.length > 0
                        ? generateHtmlFromBlocks(blocks, mergeWithDefaults(selectedTemplate.themeConfigJson))
                        : undefined
                }
                mergedTheme={
                    selectedTemplate && previewingTemplate?.code === selectedTemplate.code
                        ? mergeWithDefaults(selectedTemplate.themeConfigJson)
                        : undefined
                }
            />
        </main>
    );
};

export default DocumentTemplatesPage;

import React from 'react';
import {
    FileText,
    PanelLeft,
    GripVertical,
    BarChart3,
    GraduationCap,
    Award,
    Eye,
    Download
} from 'lucide-react';
import {
    DndContext,
    rectIntersection,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    type DragStartEvent,
    type DragEndEvent
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DocumentTemplateDto } from '../types';

interface TemplateCatalogProps {
    templates: DocumentTemplateDto[];
    selectedTemplate: DocumentTemplateDto | null;
    onSelectTemplate: (tmpl: DocumentTemplateDto) => void;
    onPreviewTemplate?: (tmpl: DocumentTemplateDto) => void;
    onDownloadPdf?: (tmpl: DocumentTemplateDto) => void;
    isSidebarCollapsed?: boolean;
    onToggleSidebar?: () => void;
    headerCollapsed?: boolean;
    onReorderTemplates?: (newTemplates: DocumentTemplateDto[]) => void;
}

type TemplateCategoryKey = 'CURRICULAR' | 'ACREDITACION' | 'REPORTES' | 'INSTITUCIONAL';

function getTemplateCategory(code: string): TemplateCategoryKey {
    const c = (code || '').toUpperCase();
    if (c.includes('PEA') || c.includes('CURRICULUM') || c.includes('ESTUDIO') || c.includes('ASIGNATURA')) return 'CURRICULAR';
    if (c.includes('CACES') || c.includes('ACREDIT') || c.includes('ACTA') || c.includes('CERTIF')) return 'ACREDITACION';
    if (c.startsWith('REPORTE') || c.includes('ANALITICA') || c.includes('SEGUIMIENTO')) return 'REPORTES';
    return 'INSTITUCIONAL';
}

function getTemplateIcon(code: string) {
    const cat = getTemplateCategory(code);
    switch (cat) {
        case 'CURRICULAR':
            return <GraduationCap className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />;
        case 'ACREDITACION':
            return <Award className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />;
        case 'REPORTES':
            return <BarChart3 className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />;
        default:
            return <FileText className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" strokeWidth={1.5} />;
    }
}

interface TemplateItemProps {
    template: DocumentTemplateDto;
    isSelected: boolean;
    onSelect?: () => void;
    onPreview?: (tmpl: DocumentTemplateDto) => void;
    onDownload?: (tmpl: DocumentTemplateDto) => void;
    dragHandleProps?: any;
    isDragging?: boolean;
    isOverlay?: boolean;
}

const TemplateItem: React.FC<TemplateItemProps> = ({
    template,
    isSelected,
    onSelect,
    onPreview,
    onDownload,
    dragHandleProps,
    isDragging,
    isOverlay
}) => {
    return (
        <div
            className={`group w-full flex items-center relative border-b border-zinc-200/60 dark:border-zinc-800/60 last:border-b-0 transition-opacity duration-150 ${
                isSelected 
                    ? 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100 font-bold' 
                    : 'bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            } ${isDragging ? 'opacity-25 bg-zinc-100/30' : 'opacity-100'} ${
                isOverlay ? 'shadow-xl border rounded border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 z-[9999]' : ''
            }`}
        >
            {/* Indicador de selección activa */}
            {isSelected && !isDragging && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 dark:bg-blue-400" />
            )}

            {/* Handle para arrastre */}
            <div
                {...dragHandleProps}
                className="p-3 pr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center self-stretch touch-none transition-colors"
                title="Arrastrar para ordenar"
            >
                <GripVertical className="w-3.5 h-3.5" strokeWidth={1.5} />
            </div>
            
            <button
                type="button"
                onClick={onSelect}
                disabled={isOverlay}
                className="flex-1 text-left p-3 pl-1.5 flex items-start gap-3 transition-all min-w-0 cursor-pointer"
            >
                <div className="p-1.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shrink-0 text-zinc-700 dark:text-zinc-200 shadow-none">
                    {getTemplateIcon(template.code)}
                </div>
                
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`text-[11px] leading-snug transition-colors break-words ${isSelected ? 'font-bold text-zinc-900 dark:text-zinc-100' : 'font-medium text-zinc-800 dark:text-zinc-200'}`}>
                            {template.name}
                        </span>
                        <span className="text-[8px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono border border-zinc-200 dark:border-zinc-700 shrink-0 text-zinc-500 dark:text-zinc-400">
                            v{template.version}
                        </span>
                    </div>
                </div>
            </button>

            {/* Acciones Rápidas en hover: Previsualizar y Descargar PDF */}
            {!isOverlay && (
                <div className="flex items-center gap-0.5 pr-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onPreview?.(template);
                        }}
                        title={`Previsualizar PDF oficial de ${template.name}`}
                        className="p-1.5 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDownload?.(template);
                        }}
                        title={`Descargar PDF oficial de ${template.name}`}
                        className="p-1.5 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                    >
                        <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                </div>
            )}
        </div>
    );
};

interface SortableTemplateItemProps {
    template: DocumentTemplateDto;
    isSelected: boolean;
    onSelect: () => void;
    onPreview?: (tmpl: DocumentTemplateDto) => void;
    onDownload?: (tmpl: DocumentTemplateDto) => void;
}

const SortableTemplateItem: React.FC<SortableTemplateItemProps> = ({
    template,
    isSelected,
    onSelect,
    onPreview,
    onDownload
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: template.code });

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <TemplateItem
                template={template}
                isSelected={isSelected}
                onSelect={onSelect}
                onPreview={onPreview}
                onDownload={onDownload}
                dragHandleProps={{ ...attributes, ...listeners }}
                isDragging={isDragging}
            />
        </div>
    );
};

export const TemplateCatalog: React.FC<TemplateCatalogProps> = ({
    templates,
    selectedTemplate,
    onSelectTemplate,
    onPreviewTemplate,
    onDownloadPdf,
    isSidebarCollapsed,
    onToggleSidebar,
    headerCollapsed,
    onReorderTemplates
}) => {
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(String(event.active.id));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = templates.findIndex(t => t.code === active.id);
            const newIndex = templates.findIndex(t => t.code === over.id);
            
            if (oldIndex !== -1 && newIndex !== -1) {
                const newTemplates = arrayMove(templates, oldIndex, newIndex);
                if (onReorderTemplates) {
                    onReorderTemplates(newTemplates);
                }
            }
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    const activeTemplate = templates.find(t => t.code === activeId);

    // Agrupación de plantillas oficiales
    const curricularTemplates = templates.filter(t => getTemplateCategory(t.code) === 'CURRICULAR');
    const acreditacionTemplates = templates.filter(t => getTemplateCategory(t.code) === 'ACREDITACION');
    const reportesTemplates = templates.filter(t => getTemplateCategory(t.code) === 'REPORTES');
    const institucionalTemplates = templates.filter(t => getTemplateCategory(t.code) === 'INSTITUCIONAL');

    return (
        <div className="w-full h-full border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 flex flex-col overflow-hidden min-h-0">
            {/* Header del panel */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between shrink-0 h-10">
                <div className="flex items-center gap-2 min-w-0">
                    {onToggleSidebar && headerCollapsed && isSidebarCollapsed && (
                        <button
                            type="button"
                            onClick={onToggleSidebar}
                            title={isSidebarCollapsed ? "Mostrar panel lateral" : "Ocultar panel lateral"}
                            className="p-1 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors cursor-pointer shrink-0"
                        >
                            <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                    )}
                    <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        Plantillas Oficiales ({templates.length})
                    </span>
                </div>
            </div>
            
            {/* Lista dividida por categorías institucionales con scroll fluido */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-200/60 dark:divide-zinc-800/60 custom-scrollbar min-h-0 pb-12">
                <DndContext
                    sensors={sensors}
                    collisionDetection={rectIntersection}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={templates.map(t => t.code)} strategy={verticalListSortingStrategy}>
                        <div className="flex flex-col">
                            {/* SECCIÓN 1: CURRÍCULO & ASIGNATURAS (PEA) */}
                            {curricularTemplates.length > 0 && (
                                <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                                    <div className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                                            <GraduationCap size={11} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                                            Currículo & Asignaturas (PEA)
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {curricularTemplates.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                                        {curricularTemplates.map(t => (
                                            <SortableTemplateItem
                                                key={t.code}
                                                template={t}
                                                isSelected={selectedTemplate?.code === t.code}
                                                onSelect={() => onSelectTemplate(t)}
                                                onPreview={onPreviewTemplate}
                                                onDownload={onDownloadPdf}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECCIÓN 2: ACREDITACIÓN & CACES */}
                            {acreditacionTemplates.length > 0 && (
                                <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                                    <div className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                                            <Award size={11} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                                            Acreditación & CACES
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {acreditacionTemplates.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                                        {acreditacionTemplates.map(t => (
                                            <SortableTemplateItem
                                                key={t.code}
                                                template={t}
                                                isSelected={selectedTemplate?.code === t.code}
                                                onSelect={() => onSelectTemplate(t)}
                                                onPreview={onPreviewTemplate}
                                                onDownload={onDownloadPdf}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECCIÓN 3: REPORTES & ANALÍTICAS */}
                            {reportesTemplates.length > 0 && (
                                <div className="border-b border-zinc-200/60 dark:border-zinc-800/60">
                                    <div className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                                            <BarChart3 size={11} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                                            Reportes & Analíticas
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {reportesTemplates.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                                        {reportesTemplates.map(t => (
                                            <SortableTemplateItem
                                                key={t.code}
                                                template={t}
                                                isSelected={selectedTemplate?.code === t.code}
                                                onSelect={() => onSelectTemplate(t)}
                                                onPreview={onPreviewTemplate}
                                                onDownload={onDownloadPdf}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* SECCIÓN 4: OTRAS PLANTILLAS INSTITUCIONALES */}
                            {institucionalTemplates.length > 0 && (
                                <div>
                                    <div className="px-3 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-b border-zinc-200/50 dark:border-zinc-800/50 flex items-center justify-between">
                                        <span className="text-[9px] font-mono font-bold tracking-wider text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1.5">
                                            <FileText size={11} className="text-zinc-500 dark:text-zinc-400" strokeWidth={1.5} />
                                            Otras Plantillas Institucionales
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                                            {institucionalTemplates.length}
                                        </span>
                                    </div>
                                    <div className="divide-y divide-zinc-200/40 dark:divide-zinc-800/40">
                                        {institucionalTemplates.map(t => (
                                            <SortableTemplateItem
                                                key={t.code}
                                                template={t}
                                                isSelected={selectedTemplate?.code === t.code}
                                                onSelect={() => onSelectTemplate(t)}
                                                onPreview={onPreviewTemplate}
                                                onDownload={onDownloadPdf}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                    
                    <DragOverlay adjustScale={false}>
                        {activeTemplate ? (
                            <TemplateItem
                                template={activeTemplate}
                                isSelected={selectedTemplate?.code === activeTemplate.code}
                                isOverlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
};

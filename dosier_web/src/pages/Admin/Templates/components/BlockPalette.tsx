import React from 'react';
import {
    Image,
    Heading1,
    AlignLeft,
    Grid,
    LayoutTemplate,
    Columns2,
    Minus,
    BarChart2,
    BookOpen,
    Users,
    FileText,
    DollarSign,
    Award,
    PenLine,
    Table,
    Layout,
    GraduationCap,
    ClipboardCheck
} from 'lucide-react';
import type { BlockType, DocumentBlock } from '../types';

interface BlockPaletteProps {
    blocks: DocumentBlock[];
    uniqueBlockTypes: BlockType[];
    onAddBlock: (type: BlockType) => void;
    onClose: () => void;
}

interface PaletteItem {
    type: BlockType;
    icon: React.ElementType;
    label: string;
    desc: string;
    color: string;
}

interface PaletteCategory {
    title: string;
    items: PaletteItem[];
}

export const BlockPalette: React.FC<BlockPaletteProps> = ({
    blocks,
    uniqueBlockTypes,
    onAddBlock,
    onClose
}) => {
    const categories: PaletteCategory[] = [
        {
            title: 'Bloques Estructurales & Contenido',
            items: [
                { type: 'cover', icon: Image, label: 'Portada Institucional', desc: 'Portada del PDF con logos y título.', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'title', icon: Heading1, label: 'Título de Sección', desc: 'Encabezado de sección para el PDF.', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'rich_text', icon: AlignLeft, label: 'Párrafo Enriquecido', desc: 'Editor colaborativo en el Workspace.', color: 'text-pink-500 bg-pink-500/5' },
                { type: 'advanced_table', icon: Grid, label: 'Tabla Avanzada', desc: 'Tabla con filas y columnas fijas.', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'multi_section_table', icon: LayoutTemplate, label: 'Tabla Multi-Sección', desc: 'Conjunto de sub-tablas fijas.', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'two_column', icon: Columns2, label: 'Dos Columnas', desc: 'Dos bloques de texto lado a lado.', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'page_break', icon: Minus, label: 'Salto de Página', desc: 'Forzar salto de página en el PDF.', color: 'text-zinc-400 bg-zinc-400/5' },
                { type: 'gantt', icon: BarChart2, label: 'Diagrama de Gantt', desc: 'Pestaña de Cronograma en Workspace.', color: 'text-indigo-500 bg-indigo-500/5' }
            ]
        },
        {
            title: 'Bloques de Base de Datos (Dinámicos)',
            items: [
                { type: 'project_general_section', icon: BookOpen, label: 'Identificación del Proyecto', desc: 'Metadatos institucionales (título, carrera, plazos).', color: 'text-emerald-500 bg-emerald-500/5' },
                { type: 'researchers_table', icon: Users, label: 'Investigadores', desc: 'Participantes y docentes del proyecto científico.', color: 'text-emerald-500 bg-emerald-500/5' },
                { type: 'project_technical_section', icon: FileText, label: 'Especificación Técnica', desc: 'Sub-secciones de redacción científica y técnica.', color: 'text-emerald-500 bg-emerald-500/5' },
                { type: 'project_progress_report', icon: BarChart2, label: 'Avance de Ejecución', desc: 'Hitos y evidencias de desarrollo académico.', color: 'text-emerald-500 bg-emerald-500/5' },
                { type: 'signatures', icon: PenLine, label: 'Firmas de Responsabilidad', desc: 'Firmas de docentes, directores y autoridades institucionales.', color: 'text-emerald-500 bg-emerald-500/5' }
            ]
        },
        {
            title: 'Bloques de Informe de Avance',
            items: [
                { type: 'progress_header_section', icon: FileText, label: 'Datos Generales del Proyecto', desc: 'Datos generales auto-poblados del proyecto (ISTPET).', color: 'text-blue-500 bg-blue-500/5' },
                { type: 'progress_activity_section', icon: Table, label: 'Matriz de Actividades y Avance', desc: 'Tabla configurable (Ejecutadas, NP u Obstáculos).', color: 'text-amber-500 bg-amber-500/5' },
                { type: 'progress_status_section', icon: Layout, label: 'Estado y Observaciones', desc: 'Estado del proyecto y redacción con permisos de rol.', color: 'text-indigo-500 bg-indigo-500/5' }
            ]
        }
    ];

    return (
        <div className="absolute top-full right-0 mt-2 z-[100] bg-surface border border-border-thin rounded-xl shadow-2xl p-4 w-[520px] max-h-[72vh] overflow-y-auto custom-scrollbar animate-fade-in-up flex flex-col gap-4">
            {categories.map((cat, catIdx) => (
                <div key={cat.title} className={catIdx > 0 ? 'border-t border-border-thin/30 pt-3' : ''}>
                    <p className="text-[9px] font-semibold text-text-dim/80 uppercase tracking-wider px-1 mb-2">
                        {cat.title}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {cat.items.map((item) => {
                            const ItemIcon = item.icon;
                            const alreadyExists = uniqueBlockTypes.includes(item.type) && blocks.some(b => b.type === item.type);
                            return (
                                <button
                                    key={item.type}
                                    type="button"
                                    disabled={alreadyExists}
                                    onClick={() => {
                                        onAddBlock(item.type);
                                        onClose();
                                    }}
                                    className={`flex items-start gap-2.5 p-2 rounded-md text-left transition-all ${alreadyExists
                                        ? 'opacity-35 cursor-not-allowed'
                                        : 'hover:bg-surface-hover hover:text-text-main cursor-pointer'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded shrink-0 mt-0.5 ${item.color}`}>
                                        <ItemIcon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-bold text-text-main truncate flex items-center gap-1.5">
                                            <span>{item.label}</span>
                                            {alreadyExists && (
                                                <span className="text-[8px] font-medium font-mono bg-surface-hover border border-border-thin/30 px-1.5 py-0.5 rounded text-text-dim shrink-0">
                                                    Añadido
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-[9px] text-text-dim leading-snug mt-0.5 line-clamp-2">
                                            {item.desc}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

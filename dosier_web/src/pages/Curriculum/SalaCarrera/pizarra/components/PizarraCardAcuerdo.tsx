import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, GripHorizontal } from 'lucide-react';
import type { PizarraElement } from '../types';
import { GeistSelect, type GeistSelectOption } from '../../../../../components/Common/GeistSelect';

interface PizarraCardAcuerdoProps {
    element: PizarraElement;
    isSelected: boolean;
    zoom: number;
    onSelect: () => void;
    onUpdate: (patch: Partial<PizarraElement>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onBringToFront: () => void;
}

export const CATEGORIAS_ACUERDO = [
    'Articulación y Contenidos (RDA)',
    'Metodología',
    'Evaluación',
    'Prácticas y Proyectos (APE / PIS)',
    'Recursos, Bibliografía y TIC',
    'General',
] as const;

const OPCIONES_CATEGORIA: GeistSelectOption[] = CATEGORIAS_ACUERDO.map((cat) => ({
    value: cat,
    label: cat,
}));

export const PizarraCardAcuerdo: React.FC<PizarraCardAcuerdoProps> = ({
    element,
    isSelected,
    zoom,
    onSelect,
    onUpdate,
    onDelete,
    onDuplicate,
    onBringToFront,
}) => {
    const [localTitle, setLocalTitle] = useState(element.title || '');
    const [localContent, setLocalContent] = useState(element.content || '');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number }>({
        mouseX: 0,
        mouseY: 0,
        elemX: element.x,
        elemY: element.y,
    });

    const isResizingRef = useRef(false);
    const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
        mouseX: 0,
        mouseY: 0,
        startW: element.width || 320,
        startH: element.height || 210,
    });

    useEffect(() => {
        setLocalTitle(element.title || '');
        setLocalContent(element.content || '');
    }, [element.title, element.content]);

    // Auto-crecimiento vertical dinámico para no truncar la redacción
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(60, textareaRef.current.scrollHeight)}px`;
        }
    }, [localContent]);

    // Manejador de inicio de arrastre de la tarjeta
    const handleMouseDown = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).tagName === 'TEXTAREA' ||
            (e.target as HTMLElement).tagName === 'INPUT' ||
            (e.target as HTMLElement).tagName === 'SELECT' ||
            (e.target as HTMLElement).tagName === 'BUTTON' ||
            (e.target as HTMLElement).closest('.pizarra-no-drag')
        ) {
            return;
        }
        e.stopPropagation();
        onSelect();
        onBringToFront();

        isDraggingRef.current = true;
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            elemX: element.x,
            elemY: element.y,
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const deltaX = (moveEvent.clientX - dragStartRef.current.mouseX) / zoom;
            const deltaY = (moveEvent.clientY - dragStartRef.current.mouseY) / zoom;
            onUpdate({
                x: Math.round(dragStartRef.current.elemX + deltaX),
                y: Math.round(dragStartRef.current.elemY + deltaY),
            });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Manejador de redimensión libre (esquina inferior derecha)
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect();
        onBringToFront();

        isResizingRef.current = true;
        resizeStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startW: element.width || 320,
            startH: element.height || 210,
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizingRef.current) return;
            const deltaX = (moveEvent.clientX - resizeStartRef.current.mouseX) / zoom;
            const deltaY = (moveEvent.clientY - resizeStartRef.current.mouseY) / zoom;

            const nextW = Math.max(260, Math.round(resizeStartRef.current.startW + deltaX));
            const nextH = Math.max(170, Math.round(resizeStartRef.current.startH + deltaY));

            onUpdate({
                width: nextW,
                height: nextH,
            });
        };

        const handleMouseUp = () => {
            isResizingRef.current = false;
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleBlur = () => {
        if (localTitle !== element.title || localContent !== element.content) {
            onUpdate({ title: localTitle, content: localContent });
        }
    };

    const initials = element.authorInitials || (element.authorName ? element.authorName.substring(0, 2).toUpperCase() : 'DO');

    return (
        <div
            id={`card-${element.id}`}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate3d(${element.x}px, ${element.y}px, 0)`,
                width: element.width || 320,
                minHeight: element.height || 210,
                zIndex: element.zIndex || 1,
            }}
            className={`group absolute rounded-2xl border border-border-thin bg-surface px-3.5 pt-2.5 pb-2 flex flex-col justify-between transition-shadow select-none ${
                isSelected
                    ? 'ring-2 ring-[#0070f3] shadow-lg border-[#0070f3]'
                    : 'shadow-xs hover:shadow-md'
            }`}
        >
            {/* Cabecera compacta: Agarre + Etiqueta + Acciones contextuales */}
            <div className="flex items-center justify-between h-5 mb-2 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5">
                    <GripHorizontal size={13} className="text-zinc-400 dark:text-zinc-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="text-[10px] font-semibold text-[#0070f3] dark:text-blue-400">
                        Acuerdo curricular
                    </span>
                </div>

                {/* Acciones contextuales (Duplicar / Eliminar) */}
                <div
                    className={`pizarra-no-drag flex items-center gap-0.5 transition-opacity ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                        title="Duplicar acuerdo"
                        className="p-0.5 rounded text-zinc-500 hover:text-text-main transition-colors"
                    >
                        <Copy size={12} />
                    </button>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title="Eliminar acuerdo"
                        className="p-0.5 rounded text-zinc-500 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Selector oficial GeistSelect + Título + Contenido con auto-grow */}
            <div className="flex-1 flex flex-col gap-2 py-0.5">
                <div className="w-full pizarra-no-drag" onMouseDown={(e) => e.stopPropagation()}>
                    <GeistSelect
                        value={element.category || 'General'}
                        options={OPCIONES_CATEGORIA}
                        onChange={(val) => onUpdate({ category: String(val) })}
                        size="sm"
                        className="w-full text-xs"
                    />
                </div>

                <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={onSelect}
                    placeholder="Título del acuerdo o compromiso de la materia..."
                    className="pizarra-input w-full bg-transparent border-0 border-b border-transparent focus:border-border-thin pb-0.5 text-xs font-semibold text-text-main placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none"
                    style={{ outline: 'none', boxShadow: 'none' }}
                />

                <textarea
                    ref={textareaRef}
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    onBlur={handleBlur}
                    onFocus={onSelect}
                    placeholder="Detalles y consensos acordados entre los docentes para el PEA..."
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="pizarra-textarea w-full bg-transparent resize-none border-0 !border-none !outline-none !shadow-none !ring-0 focus:!border-none focus:!outline-none focus:!shadow-none focus:!ring-0 text-xs text-text-dim placeholder:text-zinc-400/80 dark:placeholder:text-zinc-500 leading-relaxed"
                />
            </div>

            {/* Pie ultra-compacto: Autor con micro-avatar + Tirador de redimensión libre */}
            <div className="pt-1 mt-auto flex items-center justify-between text-text-dim">
                <div
                    className="flex items-center gap-1.5 max-w-[calc(100%-24px)] overflow-hidden"
                    title={`${element.authorName || 'Docente'}${element.updatedAt ? ` · ${new Date(element.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}`}
                >
                    <span
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0 shadow-2xs"
                        style={{ backgroundColor: element.authorColor || '#0070f3' }}
                    >
                        {initials}
                    </span>
                    <span className="text-[10px] font-medium text-text-main truncate">
                        {element.authorName || 'Docente'}
                    </span>
                    {element.updatedAt ? (
                        <span className="text-[9px] opacity-60 shrink-0">
                            · {new Date(element.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    ) : null}
                </div>

                {/* Tirador de Redimensión Libre (Corner Resize Handle) */}
                <div
                    onMouseDown={handleResizeMouseDown}
                    title="Arrastra para redimensionar"
                    className="pizarra-no-drag p-0.5 -mr-1 -mb-1 rounded-br-xl cursor-se-resize text-zinc-400 hover:text-[#0070f3] dark:text-zinc-500 dark:hover:text-blue-400 transition-colors"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="opacity-50 hover:opacity-100">
                        <path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

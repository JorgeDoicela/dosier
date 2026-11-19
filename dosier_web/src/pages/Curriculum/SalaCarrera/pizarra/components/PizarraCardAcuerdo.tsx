import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, GripHorizontal, CheckCircle2, Bookmark } from 'lucide-react';
import type { PizarraElement } from '../types';

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

const CATEGORIAS = ['Metodología', 'Evaluación', 'Proyectos de Aula', 'Infraestructura / TIC', 'General'];

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
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number }>({
        mouseX: 0,
        mouseY: 0,
        elemX: element.x,
        elemY: element.y,
    });

    useEffect(() => {
        setLocalTitle(element.title || '');
        setLocalContent(element.content || '');
    }, [element.title, element.content]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA' || 
            (e.target as HTMLElement).tagName === 'INPUT' || 
            (e.target as HTMLElement).tagName === 'SELECT' || 
            (e.target as HTMLElement).tagName === 'BUTTON') {
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

    const handleBlur = () => {
        if (localTitle !== element.title || localContent !== element.content) {
            onUpdate({ title: localTitle, content: localContent });
        }
    };

    return (
        <div
            id={`card-${element.id}`}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate3d(${element.x}px, ${element.y}px, 0)`,
                width: element.width || 300,
                minHeight: element.height || 210,
                zIndex: element.zIndex || 1,
            }}
            className={`absolute rounded-xl border border-border-thin bg-surface p-4 flex flex-col justify-between transition-shadow select-none ${
                isSelected
                    ? 'ring-2 ring-[#0070f3] shadow-md border-[#0070f3]'
                    : 'shadow-2xs hover:shadow-xs'
            }`}
        >
            {/* Cabecera estructurada */}
            <div className="flex items-center justify-between pb-2 border-b border-border-thin cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5">
                    <GripHorizontal size={14} className="text-zinc-400 dark:text-zinc-500" />
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0070f3] uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        Acuerdo Curricular
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                        title="Duplicar acuerdo"
                        className="p-1 rounded-md text-zinc-500 hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                        className="p-1 rounded-md text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Categoría y Título */}
            <div className="py-2 space-y-2">
                <div className="flex items-center justify-between gap-2">
                    <select
                        value={element.category || 'General'}
                        onChange={(e) => onUpdate({ category: e.target.value })}
                        className="text-[10px] font-medium text-text-dim bg-bg-deep border border-border-thin rounded px-2 py-0.5 focus:outline-none focus:border-[#0070f3]"
                    >
                        {CATEGORIAS.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Título del acuerdo o compromiso..."
                    className="w-full bg-transparent border-b border-border-thin focus:border-[#0070f3] pb-1 text-xs font-semibold text-text-main placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none"
                />

                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    onBlur={handleBlur}
                    placeholder="Detalles del acuerdo consensuado entre los docentes..."
                    rows={3}
                    className="w-full bg-transparent resize-none border-none focus:outline-none text-xs text-text-dim placeholder:text-zinc-400 dark:placeholder:text-zinc-600 leading-relaxed"
                />
            </div>

            {/* Pie de autoría */}
            <div className="pt-2 border-t border-border-thin flex items-center justify-between text-[10px] text-text-dim">
                <span className="font-medium truncate max-w-[160px]" title={element.authorName}>
                    {element.authorName || 'Docente'}
                </span>
                <span className="opacity-70 text-[9px]">
                    {element.updatedAt ? new Date(element.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
        </div>
    );
};

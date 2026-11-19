import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Copy, GripHorizontal, Palette } from 'lucide-react';
import type { PizarraElement, PizarraColor } from '../types';
import { PIZARRA_COLORS } from '../types';

interface PizarraStickyNoteProps {
    element: PizarraElement;
    isSelected: boolean;
    zoom: number;
    onSelect: () => void;
    onUpdate: (patch: Partial<PizarraElement>) => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onBringToFront: () => void;
}

export const PizarraStickyNote: React.FC<PizarraStickyNoteProps> = ({
    element,
    isSelected,
    zoom,
    onSelect,
    onUpdate,
    onDelete,
    onDuplicate,
    onBringToFront,
}) => {
    const [localContent, setLocalContent] = useState(element.content);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; elemX: number; elemY: number }>({
        mouseX: 0,
        mouseY: 0,
        elemX: element.x,
        elemY: element.y,
    });

    useEffect(() => {
        setLocalContent(element.content);
    }, [element.content]);

    const colorConfig = PIZARRA_COLORS[element.color] || PIZARRA_COLORS.yellow;

    // Manejador de inicio de arrastre
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') {
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

    const handleContentBlur = () => {
        if (localContent !== element.content) {
            onUpdate({ content: localContent });
        }
    };

    const handleColorChange = (newColor: PizarraColor) => {
        onUpdate({ color: newColor });
        setIsColorPickerOpen(false);
    };

    return (
        <div
            id={`note-${element.id}`}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate3d(${element.x}px, ${element.y}px, 0)`,
                width: element.width || 240,
                minHeight: element.height || 180,
                zIndex: element.zIndex || 1,
            }}
            className={`absolute rounded-xl border p-3 flex flex-col justify-between transition-shadow select-none ${colorConfig.bg} ${colorConfig.border} ${
                isSelected
                    ? 'ring-2 ring-[#0070f3] shadow-md'
                    : 'shadow-2xs hover:shadow-xs'
            }`}
        >
            {/* Cabecera / Barra de agarre */}
            <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5 cursor-grab active:cursor-grabbing">
                <div className="flex items-center gap-1.5">
                    <GripHorizontal size={14} className="text-zinc-400 dark:text-zinc-500" />
                    <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider">
                        Nota
                    </span>
                </div>

                {/* Acciones flotantes de la nota */}
                <div className="flex items-center gap-1">
                    {/* Selector de Color */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsColorPickerOpen(!isColorPickerOpen);
                            }}
                            title="Cambiar color"
                            className="p-1 rounded-md text-zinc-500 hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <Palette size={12} />
                        </button>
                        {isColorPickerOpen && (
                            <div
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 z-50 flex items-center gap-1.5 p-1.5 rounded-lg border border-border-thin bg-surface shadow-md"
                            >
                                {(Object.keys(PIZARRA_COLORS) as PizarraColor[]).map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => handleColorChange(c)}
                                        className={`w-4 h-4 rounded-full border border-black/10 dark:border-white/10 ${PIZARRA_COLORS[c].bg} ${
                                            element.color === c ? 'ring-2 ring-[#0070f3]' : ''
                                        }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Duplicar */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate();
                        }}
                        title="Duplicar"
                        className="p-1 rounded-md text-zinc-500 hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                        <Copy size={12} />
                    </button>

                    {/* Eliminar */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        title="Eliminar nota"
                        className="p-1 rounded-md text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Cuerpo editable de la nota */}
            <div className="flex-1 py-2">
                <textarea
                    value={localContent}
                    onChange={(e) => setLocalContent(e.target.value)}
                    onBlur={handleContentBlur}
                    onFocus={onSelect}
                    placeholder="Escribe un acuerdo o idea..."
                    rows={4}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className={`pizarra-textarea w-full bg-transparent resize-none border-0 !border-none !outline-none !shadow-none !ring-0 focus:!border-none focus:!outline-none focus:!shadow-none focus:!ring-0 text-xs font-normal leading-relaxed ${colorConfig.text} placeholder:text-zinc-400 dark:placeholder:text-zinc-600`}
                />
            </div>

            {/* Pie con autor y fecha */}
            <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-text-dim">
                <span className="font-medium truncate max-w-[140px]" title={element.authorName}>
                    {element.authorName || 'Docente'}
                </span>
                <span className="opacity-70 text-[9px]">
                    {element.updatedAt ? new Date(element.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
            </div>
        </div>
    );
};

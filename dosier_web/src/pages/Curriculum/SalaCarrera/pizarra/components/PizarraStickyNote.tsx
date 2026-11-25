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
    const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
    const [resizeSize, setResizeSize] = useState<{ width: number; height: number } | null>(null);
    const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
    const colorPickerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastDragSyncRef = useRef<number>(0);
    const lastResizeSyncRef = useRef<number>(0);
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
        startW: element.width || 280,
        startH: element.height || 200,
    });

    // Cerrar selector de color al hacer clic fuera o deseleccionar la nota
    useEffect(() => {
        if (!isColorPickerOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
                setIsColorPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isColorPickerOpen]);

    useEffect(() => {
        if (!isSelected) {
            setIsColorPickerOpen(false);
        }
    }, [isSelected]);

    // Auto-ajuste de altura del textarea para permitir redacción sin cortes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.max(80, textareaRef.current.scrollHeight)}px`;
        }
    }, [element.content]);

    const colorConfig = PIZARRA_COLORS[element.color] || PIZARRA_COLORS.yellow;

    // Manejador de inicio de arrastre de la nota
    const handleMouseDown = (e: React.MouseEvent) => {
        if (
            (e.target as HTMLElement).tagName === 'TEXTAREA' ||
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
            const nextPos = {
                x: Math.round(dragStartRef.current.elemX + deltaX),
                y: Math.round(dragStartRef.current.elemY + deltaY),
            };
            setDragPos(nextPos);

            const now = Date.now();
            if (now - lastDragSyncRef.current >= 50) {
                lastDragSyncRef.current = now;
                onUpdate(nextPos);
            }
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            if (isDraggingRef.current) {
                const deltaX = (upEvent.clientX - dragStartRef.current.mouseX) / zoom;
                const deltaY = (upEvent.clientY - dragStartRef.current.mouseY) / zoom;
                onUpdate({
                    x: Math.round(dragStartRef.current.elemX + deltaX),
                    y: Math.round(dragStartRef.current.elemY + deltaY),
                });
            }
            isDraggingRef.current = false;
            setDragPos(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Manejador de redimensión interactiva (esquina inferior derecha)
    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onSelect();
        onBringToFront();

        isResizingRef.current = true;
        resizeStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            startW: element.width || 280,
            startH: element.height || 200,
        };

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!isResizingRef.current) return;
            const deltaX = (moveEvent.clientX - resizeStartRef.current.mouseX) / zoom;
            const deltaY = (moveEvent.clientY - resizeStartRef.current.mouseY) / zoom;

            const nextSize = {
                width: Math.max(220, Math.round(resizeStartRef.current.startW + deltaX)),
                height: Math.max(160, Math.round(resizeStartRef.current.startH + deltaY)),
            };
            setResizeSize(nextSize);

            const now = Date.now();
            if (now - lastResizeSyncRef.current >= 50) {
                lastResizeSyncRef.current = now;
                onUpdate(nextSize);
            }
        };

        const handleMouseUp = (upEvent: MouseEvent) => {
            if (isResizingRef.current) {
                const deltaX = (upEvent.clientX - resizeStartRef.current.mouseX) / zoom;
                const deltaY = (upEvent.clientY - resizeStartRef.current.mouseY) / zoom;
                onUpdate({
                    width: Math.max(220, Math.round(resizeStartRef.current.startW + deltaX)),
                    height: Math.max(160, Math.round(resizeStartRef.current.startH + deltaY)),
                });
            }
            isResizingRef.current = false;
            setResizeSize(null);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleColorChange = (newColor: PizarraColor) => {
        onUpdate({ color: newColor });
        setIsColorPickerOpen(false);
    };

    const renderX = dragPos ? dragPos.x : element.x;
    const renderY = dragPos ? dragPos.y : element.y;
    const renderW = resizeSize ? resizeSize.width : (element.width || 280);
    const renderH = resizeSize ? resizeSize.height : (element.height || 200);

    const initials = element.authorInitials || (element.authorName ? element.authorName.substring(0, 2).toUpperCase() : 'DO');

    return (
        <div
            id={`note-${element.id}`}
            onMouseDown={handleMouseDown}
            style={{
                transform: `translate3d(${renderX}px, ${renderY}px, 0)`,
                width: renderW,
                minHeight: renderH,
                zIndex: element.zIndex || 1,
            }}
            className={`group absolute rounded-2xl border px-3.5 pt-2 pb-2 flex flex-col justify-between transition-shadow select-none ${colorConfig.bg} ${colorConfig.border} ${
                isSelected
                    ? 'ring-2 ring-[#0070f3] shadow-lg'
                    : 'shadow-xs hover:shadow-md'
            }`}
        >
            {/* Cabecera ultra-compacta: Agarre sutil + Acciones flotantes */}
            <div className="flex items-center justify-between h-4 mb-1 cursor-grab active:cursor-grabbing">
                {/* Agarre discreto sin robar altura */}
                <div className="flex items-center text-zinc-400 dark:text-zinc-500 opacity-40 group-hover:opacity-100 transition-opacity">
                    <GripHorizontal size={13} />
                </div>

                {/* Acciones contextuales (visibles al hover o selección) */}
                <div
                    className={`pizarra-no-drag flex items-center gap-0.5 transition-opacity ${
                        isSelected || isColorPickerOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                >
                    {/* Selector de Color */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsColorPickerOpen(!isColorPickerOpen);
                            }}
                            title="Cambiar color de nota"
                            className="p-0.5 rounded text-zinc-500 hover:text-text-main transition-colors"
                        >
                            <Palette size={12} />
                        </button>
                        {isColorPickerOpen && (
                            <div
                                ref={colorPickerRef}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="absolute right-0 top-6 z-50 flex items-center gap-1.5 px-2 py-1.5 rounded-xl border border-border-thin bg-surface shadow-xl animate-in fade-in zoom-in-95 duration-100"
                            >
                                {(Object.keys(PIZARRA_COLORS) as PizarraColor[]).map((c) => {
                                    const cConfig = PIZARRA_COLORS[c];
                                    const isCurrent = element.color === c;
                                    return (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => handleColorChange(c)}
                                            title={cConfig.name}
                                            style={{ backgroundColor: cConfig.swatchHex }}
                                            className={`w-4 h-4 rounded-full border border-black/10 dark:border-white/20 transition-all hover:scale-125 cursor-pointer shrink-0 ${
                                                isCurrent
                                                    ? 'ring-2 ring-[#0070f3] ring-offset-1 ring-offset-white dark:ring-offset-zinc-950 scale-110'
                                                    : 'hover:shadow-xs'
                                            }`}
                                        />
                                    );
                                })}
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
                        title="Duplicar nota"
                        className="p-0.5 rounded text-zinc-500 hover:text-text-main transition-colors"
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
                        className="p-0.5 rounded text-zinc-500 hover:text-rose-600 transition-colors"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Cuerpo de escritura holgado: Máximo espacio útil para el texto */}
            <div className="flex-1 py-0 flex flex-col justify-start">
                <textarea
                    ref={textareaRef}
                    value={element.content || ''}
                    onChange={(e) => onUpdate({ content: e.target.value })}
                    onFocus={onSelect}
                    placeholder="Escribe un acuerdo, observación o idea curricular..."
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className={`pizarra-textarea w-full bg-transparent resize-none border-0 !border-none !outline-none !shadow-none !ring-0 focus:!border-none focus:!outline-none focus:!shadow-none focus:!ring-0 text-sm font-normal leading-relaxed ${colorConfig.text} placeholder:text-zinc-400/80 dark:placeholder:text-zinc-500`}
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

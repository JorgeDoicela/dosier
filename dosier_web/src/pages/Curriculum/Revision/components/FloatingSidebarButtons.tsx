import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingSidebarButtonsProps {
    isRightSidebarOpen: boolean;
    auditoriaButtonTop: number;
    auditoriaButtonLeft: number | null;
    isDraggingButton: boolean;
    handleButtonDragStart: (e: React.MouseEvent) => void;
    onOpenRightSidebar?: () => void;
    pendingCount?: number;
    totalCount?: number;
}

export const FloatingSidebarButtons: React.FC<FloatingSidebarButtonsProps> = ({
    isRightSidebarOpen,
    auditoriaButtonTop,
    auditoriaButtonLeft,
    isDraggingButton,
    handleButtonDragStart,
    onOpenRightSidebar,
    pendingCount = 0,
    totalCount = 0
}) => {
    return (
        <>
            {/* ── Botón flotante para abrir las Observaciones del PEA (Derecha) ── */}
            {!isRightSidebarOpen && (
                <button
                    type="button"
                    onMouseDown={handleButtonDragStart}
                    onClick={onOpenRightSidebar}
                    style={{
                        top: `${auditoriaButtonTop}px`,
                        left: auditoriaButtonLeft !== null ? `${auditoriaButtonLeft}px` : undefined,
                        right: auditoriaButtonLeft !== null ? 'auto' : '0px'
                    }}
                    className={`absolute z-[60] py-6 px-2 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-[#0070f3] dark:hover:text-blue-400 shadow-md hover:shadow-xl flex flex-col items-center gap-2 transition-all duration-200 animate-fade-in group cursor-pointer select-none rounded-l-2xl border-r-0 hover:-translate-x-1.5 ${
                        isDraggingButton || (auditoriaButtonLeft !== null)
                            ? 'rounded-xl border-[#0070f3] dark:border-blue-400 text-[#0070f3] dark:text-blue-400 bg-white dark:bg-zinc-950 shadow-xl'
                            : ''
                    }`}
                    title={`Clic para abrir observaciones ${totalCount > 0 ? `(${totalCount})` : ''} (o arrastra para mover)`}
                    aria-label="Abrir observaciones del PEA"
                >
                    <div className="relative shrink-0">
                        <MessageSquare
                            size={15}
                            className="text-[#0070f3] dark:text-blue-400 group-hover:scale-110 transition-transform"
                        />
                        {pendingCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        ) : totalCount > 0 ? (
                            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        ) : null}
                    </div>
                    <span className="[writing-mode:vertical-lr] text-[10px] font-bold tracking-wider opacity-85 group-hover:opacity-100 transition-opacity font-mono uppercase">
                        Notas
                    </span>
                </button>
            )}
        </>
    );
};

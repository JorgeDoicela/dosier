import React from 'react';
import type { EventoAlcance } from '../hooks/useCalendarioEvents';

interface EventoAlcanceMenuProps {
    showCarrera: boolean;
    canPublishInstituto: boolean;
    onSelect: (alcance: EventoAlcance) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const EventoAlcanceMenu: React.FC<EventoAlcanceMenuProps> = ({
    showCarrera,
    canPublishInstituto,
    onSelect,
    className = '',
    style,
}) => {
    return (
        <div
            role="menu"
            style={style}
            className={`w-64 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl py-1.5 z-50 ${className}`.trim()}
        >
            <button
                type="button"
                role="menuitem"
                onClick={() => onSelect('personal')}
                className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5"
            >
                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Personal
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                    Solo visible en mi agenda
                </span>
            </button>

            {showCarrera && (
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => onSelect('carrera')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5 border-t border-slate-100 dark:border-zinc-800"
                >
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#0070f3]" />
                        Toda la carrera
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                        Visible para docentes y coordinación
                    </span>
                </button>
            )}

            {canPublishInstituto && (
                <button
                    type="button"
                    role="menuitem"
                    onClick={() => onSelect('instituto')}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-0.5 border-t border-slate-100 dark:border-zinc-800"
                >
                    <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        Todo el instituto
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400 pl-4">
                        Visible para todo el ISTPET
                    </span>
                </button>
            )}
        </div>
    );
};

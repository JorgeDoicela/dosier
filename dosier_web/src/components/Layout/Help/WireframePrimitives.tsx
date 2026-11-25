import React from 'react';

export type WireframeTone = 'blue' | 'emerald' | 'amber' | 'rose' | 'neutral';

const TONE_DOT: Record<WireframeTone, string> = {
    blue: 'bg-[#0070f3]',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    neutral: 'bg-slate-300 dark:bg-zinc-600'
};

const TONE_BUTTON: Record<WireframeTone, string> = {
    blue: 'bg-[#0070f3] border-[#0070f3]',
    emerald: 'bg-emerald-600 border-emerald-600',
    amber: 'bg-amber-600 border-amber-600',
    rose: 'bg-rose-500/15 border-rose-500/40',
    neutral: 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-700'
};

const TONE_BUTTON_BAR: Record<WireframeTone, string> = {
    blue: 'bg-white/85',
    emerald: 'bg-white/85',
    amber: 'bg-white/85',
    rose: 'bg-rose-500/70',
    neutral: 'bg-slate-400/70 dark:bg-zinc-500'
};

/**
 * Contenedor de zona superior o inferior del esquema visual.
 */
export const WfZone: React.FC<{
    className?: string;
    children: React.ReactNode;
    layout?: 'row' | 'col' | 'grid2' | 'split';
}> = ({ className = '', children, layout = 'col' }) => {
    const layoutClass =
        layout === 'row'
            ? 'flex items-center justify-between gap-2'
            : layout === 'grid2'
            ? 'grid grid-cols-2 gap-1.5'
            : layout === 'split'
            ? 'flex gap-1.5 min-h-0'
            : 'flex flex-col gap-1.5';

    return (
        <div className={`rounded-lg border p-2 transition-all duration-300 ${layoutClass} ${className}`}>
            {children}
        </div>
    );
};

/**
 * Barra de búsqueda con lupa geométrica pura (sin texto).
 */
export const WfSearchBar: React.FC<{ className?: string; widthClass?: string }> = ({
    className = '',
    widthClass = 'flex-1'
}) => (
    <div
        className={`h-4 rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-1.5 flex items-center gap-1.5 ${widthClass} ${className}`}
    >
        <span className="relative w-2 h-2 shrink-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-zinc-500 block" />
            <span className="w-1 h-[1px] bg-slate-400 dark:bg-zinc-500 rotate-45 absolute -bottom-[1px] -right-[1px]" />
        </span>
        <span className="w-1/2 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
    </div>
);

/**
 * Selector desplegable con indicador chevron geométrico.
 */
export const WfSelect: React.FC<{ widthClass?: string; active?: boolean }> = ({
    widthClass = 'w-16',
    active = false
}) => (
    <div
        className={`h-4 rounded-md border px-1.5 flex items-center justify-between gap-1 shrink-0 ${
            active
                ? 'border-[#0070f3]/40 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
        } ${widthClass}`}
    >
        <span className="w-2/3 h-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
        <span className="w-1 h-1 border-r border-b border-slate-400 dark:border-zinc-500 rotate-45 -mt-0.5 shrink-0" />
    </div>
);

/**
 * Riel plano de pestañas con indicador inferior azul en la pestaña activa.
 */
export const WfTabs: React.FC<{ count?: number; activeIndex?: number }> = ({
    count = 3,
    activeIndex = 0
}) => (
    <div className="border-b border-slate-200 dark:border-zinc-800 px-0.5">
        <div className="-mb-px flex items-center gap-2.5">
            {Array.from({ length: count }).map((_, idx) => {
                const isActive = idx === activeIndex;
                return (
                    <div
                        key={idx}
                        className={`pb-1 border-b-[1.5px] ${
                            isActive ? 'border-[#0070f3]' : 'border-transparent'
                        }`}
                    >
                        <span
                            className={`block h-1.5 rounded-full ${
                                isActive
                                    ? 'w-9 bg-slate-700 dark:bg-zinc-200'
                                    : idx % 2 === 0
                                    ? 'w-7 bg-slate-200 dark:bg-zinc-700'
                                    : 'w-8 bg-slate-200 dark:bg-zinc-700'
                            }`}
                        />
                    </div>
                );
            })}
        </div>
    </div>
);

/**
 * Silueta de botón de acción sin texto.
 */
export const WfButton: React.FC<{ tone?: WireframeTone; widthClass?: string; heightClass?: string }> = ({
    tone = 'blue',
    widthClass = 'w-10',
    heightClass = 'h-3.5'
}) => (
    <div
        className={`rounded border flex items-center justify-center px-1.5 shrink-0 ${TONE_BUTTON[tone]} ${widthClass} ${heightClass}`}
    >
        <span className={`w-full h-1 rounded-full ${TONE_BUTTON_BAR[tone]}`} />
    </div>
);

/**
 * Indicador de estado con punto discreto + barra corta.
 */
export const WfStatusBadge: React.FC<{ tone?: WireframeTone; barWidth?: string }> = ({
    tone = 'blue',
    barWidth = 'w-8'
}) => (
    <div className="flex items-center gap-1 shrink-0">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE_DOT[tone]}`} />
        <span className={`h-1 rounded-full bg-slate-200 dark:bg-zinc-700 ${barWidth}`} />
    </div>
);

/**
 * Barra de progreso horizontal.
 */
export const WfProgressBar: React.FC<{ percent?: number; tone?: WireframeTone }> = ({
    percent = 65,
    tone = 'blue'
}) => (
    <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
        <div
            className={`h-full rounded-full ${TONE_DOT[tone]}`}
            style={{ width: `${Math.max(8, Math.min(100, percent))}%` }}
        />
    </div>
);

/**
 * Fila de lista / tabla con punto de estado opcional, avatar opcional y acción.
 */
export const WfListRow: React.FC<{
    dotTone?: WireframeTone;
    avatar?: boolean;
    titleWidth?: string;
    metaWidth?: string;
    progress?: number;
    actionTone?: WireframeTone;
    secondaryAction?: boolean;
}> = ({
    dotTone,
    avatar = false,
    titleWidth = 'w-24',
    metaWidth = 'w-14',
    progress,
    actionTone,
    secondaryAction = false
}) => (
    <div className="flex items-center justify-between gap-2 py-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {avatar && (
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-zinc-700 shrink-0" />
            )}
            {dotTone && !avatar && (
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${TONE_DOT[dotTone]}`} />
            )}
            <div className="space-y-1 min-w-0 flex-1">
                <div className={`h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 ${titleWidth}`} />
                {progress !== undefined ? (
                    <WfProgressBar percent={progress} tone={dotTone || 'blue'} />
                ) : (
                    <div className={`h-1 rounded-full bg-slate-200 dark:bg-zinc-800 ${metaWidth}`} />
                )}
            </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
            {secondaryAction && <WfButton tone="neutral" widthClass="w-7" heightClass="h-3" />}
            {actionTone && <WfButton tone={actionTone} widthClass="w-9" heightClass="h-3" />}
        </div>
    </div>
);

/**
 * Tarjeta compacta para grillas de asignaturas o trámites.
 */
export const WfMiniCard: React.FC<{
    dotTone?: WireframeTone;
    progress?: number;
    actionTone?: WireframeTone;
}> = ({ dotTone = 'blue', progress, actionTone = 'blue' }) => (
    <div className="rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 flex flex-col justify-between gap-1.5">
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="w-7 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                <span className={`w-1.5 h-1.5 rounded-full ${TONE_DOT[dotTone]}`} />
            </div>
            <span className="block w-5/6 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
            <span className="block w-1/2 h-1 rounded-full bg-slate-200 dark:bg-zinc-800" />
        </div>
        <div className="space-y-1">
            {progress !== undefined && <WfProgressBar percent={progress} tone={dotTone} />}
            <WfButton tone={actionTone} widthClass="w-full" heightClass="h-3" />
        </div>
    </div>
);

/**
 * Gráfica circular (donut) sin texto usando SVG geométrico puro.
 */
export const WfDonutChart: React.FC = () => (
    <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 flex flex-col items-center justify-center gap-1.5">
        <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90" aria-hidden="true">
            <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                className="text-slate-100 dark:text-zinc-800"
            />
            <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                stroke="#10b981"
                strokeWidth="4.5"
                strokeDasharray="44 82"
                strokeLinecap="round"
            />
            <circle
                cx="18"
                cy="18"
                r="13"
                fill="none"
                stroke="#0070f3"
                strokeWidth="4.5"
                strokeDasharray="24 82"
                strokeDashoffset="-48"
                strokeLinecap="round"
            />
        </svg>
        <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="w-5 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
            <span className="w-4 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
        </div>
    </div>
);

/**
 * Gráfica de barras comparativas sin texto.
 */
export const WfBarChart: React.FC = () => (
    <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 flex flex-col justify-between gap-1">
        <div className="flex items-end justify-center gap-1.5 flex-1 border-b border-slate-100 dark:border-zinc-800 pb-1">
            <span className="w-2.5 h-2/5 rounded-t-xs bg-amber-500/80" />
            <span className="w-2.5 h-4/5 rounded-t-xs bg-[#0070f3]" />
            <span className="w-2.5 h-3/5 rounded-t-xs bg-[#0070f3]/60" />
            <span className="w-2.5 h-full rounded-t-xs bg-emerald-500" />
        </div>
        <div className="flex justify-center gap-1.5">
            <span className="w-2.5 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            <span className="w-2.5 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            <span className="w-2.5 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            <span className="w-2.5 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
        </div>
    </div>
);

/**
 * Código QR geométrico puro (sin texto).
 */
export const WfQrGlyph: React.FC = () => (
    <div className="w-9 h-9 rounded-md border border-[#0070f3]/40 bg-white dark:bg-zinc-950 p-1 grid grid-cols-3 gap-0.5 shrink-0">
        <span className="border-[1.5px] border-slate-700 dark:border-zinc-200 rounded-[1px]" />
        <span className="bg-slate-300 dark:bg-zinc-700 rounded-[1px]" />
        <span className="border-[1.5px] border-slate-700 dark:border-zinc-200 rounded-[1px]" />
        <span className="bg-slate-400 dark:bg-zinc-600 rounded-[1px]" />
        <span className="bg-[#0070f3] rounded-[1px]" />
        <span className="bg-slate-300 dark:bg-zinc-700 rounded-[1px]" />
        <span className="border-[1.5px] border-slate-700 dark:border-zinc-200 rounded-[1px]" />
        <span className="bg-slate-300 dark:bg-zinc-700 rounded-[1px]" />
        <span className="bg-slate-700 dark:bg-zinc-200 rounded-[1px]" />
    </div>
);

/**
 * Sello de verificación / aprobación esmeralda geométrico.
 */
export const WfCheckBadge: React.FC = () => (
    <span className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
        <span className="w-1.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-white rotate-45 -mt-0.5" />
    </span>
);

/**
 * Grilla de calendario de 7 columnas con hitos destacados.
 */
export const WfCalendarGrid: React.FC<{ highlightedDays?: number[] }> = ({
    highlightedDays = [3, 9, 11]
}) => (
    <div className="grid grid-cols-7 gap-1 flex-1">
        {Array.from({ length: 14 }).map((_, idx) => {
            const isEvent = highlightedDays.includes(idx);
            const isAmber = idx === highlightedDays[1];
            return (
                <div
                    key={idx}
                    className={`rounded border p-0.5 flex flex-col justify-between ${
                        isEvent
                            ? isAmber
                                ? 'border-amber-400/60 bg-amber-50/70 dark:bg-amber-950/30'
                                : 'border-[#0070f3]/50 bg-blue-50/60 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
                    }`}
                >
                    <span className="w-1.5 h-1 rounded-full bg-slate-300 dark:bg-zinc-700" />
                    {isEvent && (
                        <span
                            className={`w-full h-1 rounded-full ${
                                isAmber ? 'bg-amber-500' : 'bg-[#0070f3]'
                            }`}
                        />
                    )}
                </div>
            );
        })}
    </div>
);

/**
 * Stepper vertical con riel conector (Connected Rail).
 */
export const WfStepperRail: React.FC = () => {
    const nodes: Array<{ status: 'done' | 'active' | 'pending'; w1: string; w2: string }> = [
        { status: 'done', w1: 'w-20', w2: 'w-12' },
        { status: 'active', w1: 'w-24', w2: 'w-16' },
        { status: 'pending', w1: 'w-16', w2: 'w-10' }
    ];
    return (
        <div className="flex flex-col gap-2 py-0.5">
            {nodes.map((n, idx) => (
                <div key={idx} className="flex items-center gap-2 relative">
                    {idx < nodes.length - 1 && (
                        <span className="absolute left-[7px] top-4 w-[1.5px] h-3 bg-slate-200 dark:bg-zinc-800" />
                    )}
                    <span
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                            n.status === 'done'
                                ? 'bg-emerald-500'
                                : n.status === 'active'
                                ? 'bg-[#0070f3] ring-2 ring-blue-100 dark:ring-blue-950'
                                : 'border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                        }`}
                    >
                        {n.status === 'done' && (
                            <span className="w-1 h-1.5 border-r border-b border-white rotate-45 -mt-0.5" />
                        )}
                        {n.status === 'active' && <span className="w-1 h-1 rounded-full bg-white" />}
                    </span>
                    <div className="space-y-1 flex-1">
                        <span className={`block h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600 ${n.w1}`} />
                        <span className={`block h-1 rounded-full bg-slate-200 dark:bg-zinc-800 ${n.w2}`} />
                    </div>
                </div>
            ))}
        </div>
    );
};

/**
 * Hoja documental A4 con bloques editables / firma.
 */
export const WfDocSheet: React.FC<{ collaborative?: boolean; stamped?: boolean }> = ({
    collaborative = false,
    stamped = false
}) => (
    <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 flex flex-col justify-between gap-1.5">
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="w-1/2 h-2 rounded-full bg-slate-300 dark:bg-zinc-600" />
                {collaborative && (
                    <div className="flex -space-x-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#0070f3] border border-white dark:border-zinc-950" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-zinc-950" />
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 gap-1">
                <span className="h-3 rounded border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
                <span className="h-3 rounded border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900" />
            </div>
            <div
                className={`rounded border p-1.5 space-y-1 ${
                    collaborative
                        ? 'border-[#0070f3]/60 bg-blue-50/40 dark:bg-blue-950/20'
                        : 'border-slate-200 dark:border-zinc-800'
                }`}
            >
                <div className="flex items-center gap-1">
                    <span className="w-3/4 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                    {collaborative && <span className="w-0.5 h-2.5 bg-[#0070f3] rounded-full" />}
                </div>
                <span className="block w-full h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                <span className="block w-2/3 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
            </div>
        </div>
        {stamped && (
            <div className="flex items-center justify-end gap-1.5 pt-0.5">
                <span className="w-10 h-1 rounded-full bg-emerald-500/60" />
                <WfCheckBadge />
            </div>
        )}
    </div>
);

/**
 * Bloque de diferencias (Antes / Después) sin texto.
 */
export const WfDiffPanel: React.FC = () => (
    <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-1.5 flex flex-col justify-center gap-1.5">
        <div className="rounded bg-rose-500/10 border-l-2 border-rose-500 px-1.5 py-1 flex items-center gap-1">
            <span className="w-1.5 h-0.5 bg-rose-500 rounded-full shrink-0" />
            <span className="w-4/5 h-1 bg-rose-500/50 rounded-full" />
        </div>
        <div className="rounded bg-emerald-500/10 border-l-2 border-emerald-500 px-1.5 py-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="w-4/5 h-1 bg-emerald-500/60 rounded-full" />
        </div>
    </div>
);

/**
 * Hilo de conversación / mensajería sin texto.
 */
export const WfThreadBubbles: React.FC = () => (
    <div className="flex-1 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1.5 flex flex-col justify-center gap-1.5">
        <div className="self-start w-3/4 rounded-md bg-slate-100 dark:bg-zinc-800 p-1.5 space-y-1">
            <span className="block w-full h-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
            <span className="block w-2/3 h-1 rounded-full bg-slate-300 dark:bg-zinc-600" />
        </div>
        <div className="self-end w-2/3 rounded-md bg-[#0070f3] p-1.5 space-y-1">
            <span className="block w-full h-1 rounded-full bg-white/80" />
            <span className="block w-1/2 h-1 rounded-full bg-white/70" />
        </div>
    </div>
);

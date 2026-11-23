// ─────────────────────────────────────────────────────────────
// Tipos del Motor de Pizarra Interactiva en Tiempo Real (CoWork / Yjs)
// ─────────────────────────────────────────────────────────────

export type PizarraElementType = 'sticky' | 'card' | 'text' | 'frame';

export type PizarraColor = 'yellow' | 'emerald' | 'blue' | 'purple' | 'amber' | 'slate' | 'rose';

export interface PizarraElement {
    id: string;
    type: PizarraElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    title?: string;
    content: string;
    color: PizarraColor;
    authorName: string;
    authorColor: string;
    authorInitials: string;
    updatedAt: number;
    zIndex: number;
    category?: string; // Ej: 'Metodología', 'Laboratorios', 'Evaluación', 'General'
}

export interface PizarraCursorData {
    x: number;
    y: number;
    userName: string;
    userColor: string;
    userRole?: string;
    userInitials?: string;
    selectedId?: string | null;
    lastActive: number;
}

export interface ViewportTransform {
    x: number;
    y: number;
    zoom: number;
}

export const PIZARRA_COLORS: Record<PizarraColor, {
    bg: string;
    border: string;
    header: string;
    badge: string;
    text: string;
    name: string;
    swatchHex: string;
}> = {
    yellow: {
        bg: 'bg-amber-50 dark:bg-[#2c2211]',
        border: 'border-amber-200 dark:border-amber-700/80',
        header: 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100',
        badge: 'bg-amber-200 text-amber-900 dark:bg-amber-800 dark:text-amber-100',
        text: 'text-zinc-900 dark:text-amber-100',
        name: 'Amarillo',
        swatchHex: '#facc15',
    },
    emerald: {
        bg: 'bg-emerald-50 dark:bg-[#0f2a1d]',
        border: 'border-emerald-200 dark:border-emerald-700/80',
        header: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100',
        badge: 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100',
        text: 'text-zinc-900 dark:text-emerald-100',
        name: 'Esmeralda',
        swatchHex: '#10b981',
    },
    blue: {
        bg: 'bg-blue-50 dark:bg-[#12233f]',
        border: 'border-blue-200 dark:border-blue-700/80',
        header: 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100',
        badge: 'bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-100',
        text: 'text-zinc-900 dark:text-blue-100',
        name: 'Azul',
        swatchHex: '#3b82f6',
    },
    purple: {
        bg: 'bg-purple-50 dark:bg-[#251739]',
        border: 'border-purple-200 dark:border-purple-700/80',
        header: 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100',
        badge: 'bg-purple-200 text-purple-900 dark:bg-purple-800 dark:text-purple-100',
        text: 'text-zinc-900 dark:text-purple-100',
        name: 'Púrpura',
        swatchHex: '#a855f7',
    },
    amber: {
        bg: 'bg-orange-50 dark:bg-[#301c12]',
        border: 'border-orange-200 dark:border-orange-700/80',
        header: 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100',
        badge: 'bg-orange-200 text-orange-900 dark:bg-orange-800 dark:text-orange-100',
        text: 'text-zinc-900 dark:text-orange-100',
        name: 'Ámbar',
        swatchHex: '#f97316',
    },
    slate: {
        bg: 'bg-zinc-50 dark:bg-[#1a1d24]',
        border: 'border-zinc-200 dark:border-zinc-700',
        header: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100',
        badge: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200',
        text: 'text-zinc-900 dark:text-zinc-100',
        name: 'Gris Neutro',
        swatchHex: '#71717a',
    },
    rose: {
        bg: 'bg-rose-50 dark:bg-[#31151e]',
        border: 'border-rose-200 dark:border-rose-700/80',
        header: 'bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100',
        badge: 'bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100',
        text: 'text-zinc-900 dark:text-rose-100',
        name: 'Rosa',
        swatchHex: '#f43f5e',
    },
};

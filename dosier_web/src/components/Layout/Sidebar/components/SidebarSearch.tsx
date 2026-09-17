import React from 'react';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
    triggerCommandPalette: () => void;
    searchShortcut: string;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ triggerCommandPalette, searchShortcut }) => {
    return (
        <div className="px-3 mb-2">
            <div
                onClick={triggerCommandPalette}
                className="flex h-8.5 items-center gap-2 px-2.5 bg-subtle border border-subtle-border rounded-lg group hover:border-black/[0.12] dark:hover:border-white/[0.15] transition-all cursor-pointer"
            >
                <Search size={13} className="text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                <span className="text-[13px] text-zinc-500 dark:text-zinc-400 flex-1 font-medium group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Buscar</span>
                <kbd className="text-[10px] font-mono font-medium bg-surface px-1.5 py-0.5 rounded border border-subtle-border text-zinc-500 dark:text-zinc-400 shadow-2xs">{searchShortcut}</kbd>
            </div>
        </div>
    );
};

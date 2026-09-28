import React from 'react';
import { Search } from 'lucide-react';

interface SidebarSearchProps {
    triggerCommandPalette: () => void;
    searchShortcut: string;
}

export const SidebarSearch: React.FC<SidebarSearchProps> = ({ triggerCommandPalette, searchShortcut }) => {
    return (
        <div className="px-3 mb-2.5">
            <div
                onClick={triggerCommandPalette}
                className="flex h-8.5 items-center gap-2 px-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-md group hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-zinc-850 transition-all cursor-pointer"
            >
                <Search size={13.5} strokeWidth={1.75} className="text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200 transition-colors shrink-0" />
                <span className="text-[13px] text-slate-500 dark:text-zinc-400 flex-1 font-medium group-hover:text-slate-900 dark:group-hover:text-zinc-100 transition-colors">Buscar</span>
                <kbd className="text-[10px] font-mono font-medium bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200/50 dark:border-zinc-700 text-slate-500 dark:text-zinc-400">{searchShortcut}</kbd>
            </div>
        </div>
    );
};

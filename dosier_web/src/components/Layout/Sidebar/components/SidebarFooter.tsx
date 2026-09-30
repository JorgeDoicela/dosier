import React from 'react';
import { Check, Shield } from 'lucide-react';
import type { RoleOption } from '../../../../api/AuthContext';

const MoreHorizontalIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

interface SidebarFooterProps {
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (v: boolean) => void;
    isAdmin: boolean;
    user: any;
    userInitials: string;
    username: string;
    roleDisplayName: string;
    availableRoles?: RoleOption[];
    activeRole?: string;
    setActiveRole?: (roleCode: string) => void;
}

const NAV_FADE_HEIGHT = '3.5rem';

const formatShortName = (fullName?: string): string => {
    if (!fullName || typeof fullName !== 'string') return '';
    const clean = fullName.trim();
    if (!clean) return '';
    const parts = clean.split(/\s+/);
    if (parts.length <= 1) return clean;
    if (parts.length === 2) return `${parts[0]} ${parts[1]}`;
    if (parts.length === 3) {
        return `${parts[0]} ${parts[2] || parts[1]}`;
    }
    return `${parts[0]} ${parts[2]}`;
};

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
    isUserMenuOpen,
    setIsUserMenuOpen,
    isAdmin,
    user,
    userInitials,
    username,
    roleDisplayName,
    availableRoles = [],
    activeRole = '',
    setActiveRole
}) => {
    const hasMultipleRoles = Boolean(isAdmin && availableRoles && availableRoles.length > 1);

    return (
        <div className="px-2.5 pt-2 pb-0.5 mt-auto relative shrink-0 bg-white dark:bg-[#131720] border-t border-slate-100 dark:border-zinc-800/80">
            {hasMultipleRoles && isUserMenuOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute bottom-14 left-2.5 right-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150 slide-in-from-bottom-2">
                        <div className="px-2 py-1.5 border-b border-slate-100 dark:border-zinc-800 mb-1">
                            <span className="text-[9.5px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block mb-1.5">
                                Rol Institucional
                            </span>
                            <div className="space-y-0.5">
                                {availableRoles.map(r => (
                                    <div
                                        key={r.code}
                                        onClick={() => {
                                            if (setActiveRole) setActiveRole(r.code);
                                            setIsUserMenuOpen(false);
                                        }}
                                        className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md cursor-pointer transition-colors ${
                                            activeRole === r.code
                                                ? 'bg-blue-50/80 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 font-semibold border border-blue-200/60 dark:border-blue-900/50'
                                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Shield size={13} className={activeRole === r.code ? 'text-[#0070f3] dark:text-blue-400 shrink-0' : 'text-slate-400 dark:text-zinc-500 shrink-0'} />
                                            <span className="truncate">{r.name}</span>
                                        </div>
                                        {activeRole === r.code && <Check size={13} className="text-[#0070f3] dark:text-blue-400 shrink-0 ml-1.5" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center justify-between gap-1 p-1 select-none">
                <div
                    className={`flex items-center gap-2 min-w-0 flex-1 group py-1 px-1.5 rounded-md transition-colors ${
                        hasMultipleRoles ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-850/60' : ''
                    }`}
                    onClick={hasMultipleRoles ? () => setIsUserMenuOpen(!isUserMenuOpen) : undefined}
                    title={hasMultipleRoles ? 'Cambiar rol institucional' : undefined}
                >
                    {/* Username & Role */}
                    <div className="flex-1 min-w-0 flex flex-col items-start leading-tight">
                        <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200 truncate w-full tracking-tight group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                            {formatShortName(user?.nombre_completo) || username}
                        </span>
                        <span className="text-[9.5px] font-mono font-semibold text-slate-400 dark:text-zinc-500 truncate w-full uppercase tracking-wider mt-0.5">
                            {roleDisplayName}
                        </span>
                    </div>
                    {/* Options Button only if multiple roles */}
                    {hasMultipleRoles && (
                        <span className="p-1 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors shrink-0">
                            <MoreHorizontalIcon className="w-3.5 h-3.5" />
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

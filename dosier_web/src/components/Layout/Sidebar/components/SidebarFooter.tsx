import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Settings, Trash2, LogOut, Bell, Check, Shield } from 'lucide-react';
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
    currentTheme: 'dark' | 'light';
    toggleTheme: () => void;
    isUserMenuOpen: boolean;
    setIsUserMenuOpen: (v: boolean) => void;
    logout: () => Promise<void>;
    isAdmin: boolean;
    user: any;
    userInitials: string;
    username: string;
    roleDisplayName: string;
    availableRoles?: RoleOption[];
    activeRole?: string;
    setActiveRole?: (roleCode: string) => void;
    bellRef: React.RefObject<HTMLButtonElement>;
    isNotificationsOpen: boolean;
    setIsNotificationsOpen: (v: boolean) => void;
    unreadCount: number;
    updateNotifPanelPos: () => void;
    navigate: (path: string) => void;
}

const NAV_FADE_HEIGHT = '3.5rem';

export const SidebarFooter: React.FC<SidebarFooterProps> = ({
    currentTheme,
    toggleTheme,
    isUserMenuOpen,
    setIsUserMenuOpen,
    logout,
    isAdmin,
    user,
    userInitials,
    username,
    roleDisplayName,
    availableRoles = [],
    activeRole = '',
    setActiveRole,
    bellRef,
    isNotificationsOpen,
    setIsNotificationsOpen,
    unreadCount,
    updateNotifPanelPos,
    navigate
}) => {
    return (
        <div className="px-2.5 pt-2 pb-0.5 mt-auto relative shrink-0 bg-white dark:bg-[#131720] border-t border-slate-100 dark:border-zinc-800/80">
            {isUserMenuOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute bottom-14 left-2.5 right-2.5 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg shadow-xl z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150 slide-in-from-bottom-2">
                        {isAdmin && availableRoles && availableRoles.length > 1 && (
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
                        )}
                        <div
                            onClick={() => {
                                toggleTheme();
                                setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors"
                        >
                            {currentTheme === 'dark' ? <Sun size={14} className="text-slate-400 dark:text-zinc-500" /> : <Moon size={14} className="text-slate-400 dark:text-zinc-500" />}
                            <span>{currentTheme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}</span>
                        </div>
                        <Link
                            to="/configuracion"
                            onClick={() => {
                                setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors no-underline"
                        >
                            <Settings size={14} className="text-slate-400 dark:text-zinc-500" />
                            <span>Configuración</span>
                        </Link>
                        {(isAdmin || user?.roles?.includes('DOSIER_DOCENTE')) && (
                            <Link
                                to="/papelera"
                                onClick={() => {
                                    setIsUserMenuOpen(false);
                                }}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-50 dark:hover:bg-zinc-900 rounded-md cursor-pointer transition-colors no-underline"
                            >
                                <Trash2 size={14} className="text-slate-400 dark:text-zinc-500" />
                                <span>Papelera</span>
                            </Link>
                        )}
                        <hr className="border-slate-100 dark:border-zinc-800 my-1" />
                        <div
                            onClick={async () => {
                                setIsUserMenuOpen(false);
                                await logout();
                                navigate('/');
                            }}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md cursor-pointer transition-colors"
                        >
                            <LogOut size={14} />
                            <span>Cerrar Sesión</span>
                        </div>
                    </div>
                </>
            )}

            <div className="flex items-center justify-between gap-1 p-1 select-none">
                <div
                    className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1 group py-1 px-1 rounded-md hover:bg-slate-50 dark:hover:bg-zinc-850/60 transition-colors"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                    {/* User Avatar with institutional styling */}
                    <div className="relative shrink-0">
                        <div className="w-7 h-7 rounded-md bg-slate-900 dark:bg-zinc-800 border border-slate-700/60 dark:border-zinc-700 flex items-center justify-center text-[10.5px] font-mono font-bold text-white uppercase shadow-2xs">
                            {userInitials}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#131720]" />
                    </div>
                    {/* Username & Role */}
                    <div className="flex-1 min-w-0 flex flex-col items-start leading-tight">
                        <span className="text-[12px] font-semibold text-slate-800 dark:text-zinc-200 truncate w-full tracking-tight group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                            {user?.nombre_completo || username}
                        </span>
                        <span className="text-[9.5px] font-mono font-semibold text-slate-400 dark:text-zinc-500 truncate w-full uppercase tracking-wider mt-0.5">
                            {roleDisplayName}
                        </span>
                    </div>
                    {/* Options Button */}
                    <span className="p-1 text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-300 transition-colors shrink-0">
                        <MoreHorizontalIcon className="w-3.5 h-3.5" />
                    </span>
                </div>

                {/* Notification Bell */}
                <div className="relative shrink-0 ml-1">
                    <button
                        ref={bellRef}
                        onClick={() => {
                            if (!isNotificationsOpen) updateNotifPanelPos();
                            setIsNotificationsOpen(!isNotificationsOpen);
                        }}
                        className="p-1.5 rounded-md text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-850/60 transition-colors relative flex items-center justify-center cursor-pointer border-0 bg-transparent"
                        title="Ver notificaciones"
                    >
                        <Bell size={15} strokeWidth={1.75} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#0070f3] rounded-full ring-2 ring-white dark:ring-[#131720]" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

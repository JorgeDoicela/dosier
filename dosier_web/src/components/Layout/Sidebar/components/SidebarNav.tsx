import React from 'react';
import { Link } from 'react-router-dom';
import { 
    BookOpen, 
    Calendar, 
    Tag, 
    Globe, 
    Activity, 
    GraduationCap, 
    Users, 
    TrendingUp, 
    ShieldCheck, 
    ClipboardList, 
    Loader2,
    FileCheck2,
    HardDrive,
    UserCheck
} from 'lucide-react';
import type { MenuItem, SidebarProject } from '../types';

const ChevronRightIcon = ({ className = "w-3 h-3", size = 12 }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);

const MoreHorizontalIcon = ({ className = "w-4 h-4", size = 16 }: { className?: string; size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
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

interface SidebarNavProps {
    group1: MenuItem[];
    group2: MenuItem[];
    group3: MenuItem[];
    activeItem: MenuItem | null;
    isInvestigacionOpen: boolean;
    setIsInvestigacionOpen: (v: boolean) => void;
    isMisProyectosOpen: boolean;
    setIsMisProyectosOpen: (v: boolean) => void;
    isAnalyticsOpen: boolean;
    setIsAnalyticsOpen: (v: boolean) => void;
    isUsersOpen: boolean;
    setIsUsersOpen: (v: boolean) => void;
    isParametrosOpen: boolean;
    setIsParametrosOpen: (v: boolean) => void;
    sidebarProjects: SidebarProject[];
    sidebarMyProjects?: SidebarProject[];
    sidebarProjectsLoading: boolean;
    showAllProjects: boolean;
    setShowAllProjects: (v: boolean) => void;
    location: { pathname: string; search: string };
    onClose?: () => void;
}

const NAV_SCROLL_SPACER = 'h-24';

export const SidebarNav: React.FC<SidebarNavProps> = ({
    group1,
    group2,
    group3,
    activeItem,
    isInvestigacionOpen,
    setIsInvestigacionOpen,
    isMisProyectosOpen,
    setIsMisProyectosOpen,
    isAnalyticsOpen,
    setIsAnalyticsOpen,
    isUsersOpen,
    setIsUsersOpen,
    isParametrosOpen,
    setIsParametrosOpen,
    sidebarProjects,
    sidebarMyProjects,
    sidebarProjectsLoading,
    showAllProjects,
    setShowAllProjects,
    location,
    onClose
}) => {
    const renderMenuItem = (item: MenuItem) => {
        const isActive = item === activeItem;
        const isDocumentacion = item.name === 'Documentación' || item.name === 'Mis Instrumentos PEA' || item.path.startsWith('/documentacion');

        if (isDocumentacion) {
            const isMenuOpen = item.path === '/documentacion' ? isInvestigacionOpen : isMisProyectosOpen;

            const toggleOpen = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.path === '/documentacion') {
                    setIsInvestigacionOpen(!isInvestigacionOpen);
                } else {
                    setIsMisProyectosOpen(!isMisProyectosOpen);
                }
            };

            const relevantProjects = item.path === '/documentacion/mis-proyectos' ? (sidebarMyProjects || []) : sidebarProjects;
            const displayLimit = 6;
            const shownProjects = showAllProjects ? relevantProjects : relevantProjects.slice(0, displayLimit);
            const hasMore = relevantProjects.length > displayLimit;
            const targetBasePath = item.path;

            return (
                <div key={item.name} className="flex flex-col gap-0.5">
                    <div
                        className={`flex items-center justify-between rounded-md transition-colors duration-150 group w-full ${
                            isActive
                                ? 'bg-blue-50/75 dark:bg-blue-950/35 text-[#0070f3] dark:text-blue-400 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/50'
                        }`}
                    >
                        <Link
                            to={targetBasePath}
                            onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                    if (item.path === '/documentacion') {
                                        setIsInvestigacionOpen(true);
                                    } else {
                                        setIsMisProyectosOpen(true);
                                    }
                                    if (onClose) onClose();
                                }
                            }}
                            className="flex items-center gap-2.5 min-w-0 py-1.5 px-2.5 rounded-md border-0 bg-transparent text-inherit cursor-pointer flex-1 text-left no-underline"
                        >
                            <item.icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={`shrink-0 ${
                                    isActive
                                        ? 'text-[#0070f3] dark:text-blue-400'
                                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                                }`}
                            />
                            <span className={`text-[13.5px] tracking-tight truncate ${
                                isActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                            }`}>
                                {item.name}
                            </span>
                        </Link>
                        <button
                            onClick={toggleOpen}
                            className="p-1.5 mr-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors shrink-0"
                            title="Expandir"
                        >
                            <ChevronRightIcon className={`shrink-0 transition-transform duration-200 ${
                                isMenuOpen ? 'rotate-90' : ''
                            }`} />
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                            {sidebarProjectsLoading && relevantProjects.length === 0 ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 ml-3 text-[12px] font-mono text-slate-400 dark:text-zinc-500 select-none">
                                    <Loader2 size={12} className="shrink-0 animate-spin text-slate-400" />
                                    <span>Cargando...</span>
                                </div>
                            ) : relevantProjects.length === 0 ? (
                                <div className="flex items-center gap-2 px-3 py-1.5 ml-3 text-[12px] font-mono text-slate-400 dark:text-zinc-500 select-none">
                                    <BookOpen size={13} strokeWidth={1.5} className="shrink-0 text-slate-300 dark:text-zinc-600" />
                                    <span>Sin instrumentos</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-0.5 max-h-[340px] overflow-y-auto custom-scrollbar pr-1">
                                        {shownProjects.map((p) => {
                                            const tCode = (p.template_code || p.templateCode || 'PEA_OFICIAL').toLowerCase().replace(/_/g, '-');
                                            const basePath = item.path.includes('/mis-proyectos') ? '/documentacion/mis-proyectos/workspace' : '/documentacion/workspace';
                                            const projectPath = `${basePath}/${tCode}/${p.uuid}`;

                                            const isSubActive = location.pathname.includes(`/workspace/`) && location.pathname.includes(p.uuid);

                                            return (
                                                <Link
                                                    key={p.uuid}
                                                    to={projectPath}
                                                    onClick={() => {
                                                        if (onClose) onClose();
                                                    }}
                                                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 ${
                                                        isSubActive
                                                            ? 'bg-blue-50/70 dark:bg-blue-950/30 text-[#0070f3] dark:text-blue-400 font-semibold'
                                                            : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0 py-0.5">
                                                        <BookOpen
                                                            size={13}
                                                            strokeWidth={isSubActive ? 2 : 1.75}
                                                            className={`shrink-0 ${
                                                                isSubActive ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                                                            }`}
                                                        />
                                                        <span
                                                            className={`text-[12.5px] tracking-tight truncate ${
                                                                isSubActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                                                            }`}
                                                            title={p.titulo?.trim() || '(Sin título)'}
                                                        >
                                                            {p.titulo?.trim() || '(Sin título)'}
                                                        </span>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                    {hasMore && !showAllProjects && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowAllProjects(true);
                                            }}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40 border-0 bg-transparent w-full text-left"
                                        >
                                            <MoreHorizontalIcon className="shrink-0 text-slate-400" size={13} />
                                            <span className="text-[11.5px] font-mono font-medium tracking-tight">
                                                Ver {sidebarProjects.length - displayLimit} más
                                            </span>
                                        </button>
                                    )}
                                    {hasMore && showAllProjects && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowAllProjects(false);
                                            }}
                                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40 border-0 bg-transparent w-full text-left"
                                        >
                                            <ChevronRightIcon className="shrink-0 -rotate-90 text-slate-400" size={12} />
                                            <span className="text-[11.5px] font-mono font-medium tracking-tight">
                                                Ver menos
                                            </span>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            );
        }

        if (item.name === 'Analíticas') {
            const isMenuOpen = isAnalyticsOpen;
            return (
                <div key={item.name} className="flex flex-col gap-0.5">
                    <div
                        className={`flex items-center justify-between rounded-md transition-colors duration-150 group w-full ${
                            isActive
                                ? 'bg-blue-50/75 dark:bg-blue-950/35 text-[#0070f3] dark:text-blue-400 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/50'
                        }`}
                    >
                        <Link
                            to="/analiticas"
                            onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                    setIsAnalyticsOpen(true);
                                    if (onClose) onClose();
                                }
                            }}
                            className="flex items-center gap-2.5 min-w-0 py-1.5 px-2.5 rounded-md border-0 bg-transparent text-inherit cursor-pointer flex-1 text-left no-underline"
                        >
                            <item.icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={`shrink-0 ${
                                    isActive
                                        ? 'text-[#0070f3] dark:text-blue-400'
                                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                                }`}
                            />
                            <span className={`text-[13.5px] tracking-tight truncate ${
                                isActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                            }`}>
                                {item.name}
                            </span>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsAnalyticsOpen(!isAnalyticsOpen);
                            }}
                            className="p-1.5 mr-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors shrink-0"
                            title="Expandir"
                        >
                            <ChevronRightIcon className={`shrink-0 transition-transform duration-200 ${
                                isMenuOpen ? 'rotate-90' : ''
                            }`} />
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                            {[
                                { name: 'Métricas Curriculares', path: '/analiticas?tab=general', icon: TrendingUp },
                                { name: 'Cumplimiento Curricular', path: '/analiticas?tab=caces', icon: ShieldCheck },
                                { name: 'Portafolio de Instrumentos', path: '/analiticas?tab=proyectos', icon: ClipboardList }
                            ].map((subItem) => {
                                const isSubActive = location.pathname === '/analiticas' && (
                                    (subItem.path.includes('tab=general') && (!location.search || location.search.includes('tab=general'))) ||
                                    location.search.includes(subItem.path.split('?')[1])
                                );

                                return (
                                    <Link
                                        key={subItem.name}
                                        to={subItem.path}
                                        onClick={() => {
                                            if (onClose) onClose();
                                        }}
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 ${
                                            isSubActive
                                                ? 'bg-blue-50/70 dark:bg-blue-950/30 text-[#0070f3] dark:text-blue-400 font-semibold'
                                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 py-0.5">
                                            <subItem.icon
                                                size={13}
                                                strokeWidth={isSubActive ? 2 : 1.75}
                                                className={`shrink-0 ${
                                                    isSubActive ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                                                }`}
                                            />
                                            <span className={`text-[12.5px] tracking-tight truncate ${
                                                isSubActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                                            }`}>
                                                {subItem.name}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        if (item.name === 'Usuarios') {
            const isMenuOpen = isUsersOpen;
            return (
                <div key={item.name} className="flex flex-col gap-0.5">
                    <div
                        className={`flex items-center justify-between rounded-md transition-colors duration-150 group w-full ${
                            isActive
                                ? 'bg-blue-50/75 dark:bg-blue-950/35 text-[#0070f3] dark:text-blue-400 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/50'
                        }`}
                    >
                        <Link
                            to="/usuarios"
                            onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                    setIsUsersOpen(true);
                                    if (onClose) onClose();
                                }
                            }}
                            className="flex items-center gap-2.5 min-w-0 py-1.5 px-2.5 rounded-md border-0 bg-transparent text-inherit cursor-pointer flex-1 text-left no-underline"
                        >
                            <item.icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={`shrink-0 ${
                                    isActive
                                        ? 'text-[#0070f3] dark:text-blue-400'
                                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                                }`}
                            />
                            <span className={`text-[13.5px] tracking-tight truncate ${
                                isActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                            }`}>
                                {item.name}
                            </span>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsUsersOpen(!isUsersOpen);
                            }}
                            className="p-1.5 mr-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors shrink-0"
                            title="Expandir"
                        >
                            <ChevronRightIcon className={`shrink-0 transition-transform duration-200 ${
                                isMenuOpen ? 'rotate-90' : ''
                            }`} />
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                            {[
                                { name: 'Docentes', path: '/usuarios?type=DOCENTE', icon: GraduationCap },
                                { name: 'Administrativos', path: '/usuarios?type=ADMINISTRATIVO', icon: Users }
                            ].map((subItem) => {
                                const isSubActive = location.pathname === '/usuarios' && (
                                    (subItem.path.includes('type=DOCENTE') && (!location.search || location.search.includes('type=DOCENTE'))) ||
                                    location.search.includes(subItem.path.split('?')[1])
                                );

                                return (
                                    <Link
                                        key={subItem.name}
                                        to={subItem.path}
                                        onClick={() => {
                                            if (onClose) onClose();
                                        }}
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 ${
                                            isSubActive
                                                ? 'bg-blue-50/70 dark:bg-blue-950/30 text-[#0070f3] dark:text-blue-400 font-semibold'
                                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 py-0.5">
                                            <subItem.icon
                                                size={13}
                                                strokeWidth={isSubActive ? 2 : 1.75}
                                                className={`shrink-0 ${
                                                    isSubActive ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                                                }`}
                                            />
                                            <span className={`text-[12.5px] tracking-tight truncate ${
                                                isSubActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                                            }`}>
                                                {subItem.name}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        if (item.path === '/configuracion' || item.path === '/parametros-normativos') {
            const isMenuOpen = isParametrosOpen;
            return (
                <div key={item.name} className="flex flex-col gap-0.5">
                    <div
                        className={`flex items-center justify-between rounded-md transition-colors duration-150 group w-full ${
                            isActive
                                ? 'bg-blue-50/75 dark:bg-blue-950/35 text-[#0070f3] dark:text-blue-400 font-semibold'
                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/50'
                        }`}
                    >
                        <Link
                            to="/configuracion"
                            onClick={(e) => {
                                if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
                                    setIsParametrosOpen(true);
                                    if (onClose) onClose();
                                }
                            }}
                            className="flex items-center gap-2.5 min-w-0 py-1.5 px-2.5 rounded-md border-0 bg-transparent text-inherit cursor-pointer flex-1 text-left no-underline"
                        >
                            <item.icon
                                size={15}
                                strokeWidth={isActive ? 2 : 1.75}
                                className={`shrink-0 ${
                                    isActive
                                        ? 'text-[#0070f3] dark:text-blue-400'
                                        : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                                }`}
                            />
                            <span className={`text-[13.5px] tracking-tight truncate ${
                                isActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                            }`}>
                                {item.name}
                            </span>
                        </Link>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsParametrosOpen(!isParametrosOpen);
                            }}
                            className="p-1.5 mr-1 rounded text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 border-0 bg-transparent cursor-pointer flex items-center justify-center transition-colors shrink-0"
                            title="Expandir"
                        >
                            <ChevronRightIcon className={`shrink-0 transition-transform duration-200 ${
                                isMenuOpen ? 'rotate-90' : ''
                            }`} />
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="flex flex-col gap-0.5 mt-0.5 animate-in slide-in-from-top-1 duration-150">
                            {[
                                { name: 'Períodos Académicos', path: '/configuracion?mainTab=parametros&tab=periodos', icon: Calendar, tabMatch: 'periodos' },
                                { name: 'Hitos de Calendario', path: '/configuracion?mainTab=parametros&tab=calendario', icon: Calendar, tabMatch: 'calendario' },
                                { name: 'Firmas por Plantilla', path: '/configuracion?mainTab=plantillas', icon: FileCheck2, tabMatch: 'plantillas' },
                                { name: 'Almacenamiento', path: '/configuracion?mainTab=almacenamiento', icon: HardDrive, tabMatch: 'almacenamiento' },
                                { name: 'Mi Perfil & Firma', path: '/configuracion', icon: UserCheck, tabMatch: 'perfil' }
                            ].map((subItem) => {
                                const isSubActive = (location.pathname === '/configuracion' || location.pathname === '/parametros-normativos') && (
                                    subItem.tabMatch === 'perfil'
                                        ? (!location.search || (!location.search.includes('tab=') && !location.search.includes('mainTab=')))
                                        : (location.search.includes(subItem.tabMatch))
                                );

                                return (
                                    <Link
                                        key={subItem.name}
                                        to={subItem.path}
                                        onClick={() => {
                                            if (onClose) onClose();
                                        }}
                                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ml-3 ${
                                            isSubActive
                                                ? 'bg-blue-50/70 dark:bg-blue-950/30 text-[#0070f3] dark:text-blue-400 font-semibold'
                                                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 py-0.5">
                                            <subItem.icon
                                                size={13}
                                                strokeWidth={isSubActive ? 2 : 1.75}
                                                className={`shrink-0 ${
                                                    isSubActive ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                                                }`}
                                            />
                                            <span className={`text-[12.5px] tracking-tight truncate ${
                                                isSubActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                                            }`}>
                                                {subItem.name}
                                            </span>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={item.name}
                to={item.path}
                onClick={() => {
                    if (onClose) onClose();
                }}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer transition-colors duration-150 group no-underline ${
                    item.indent ? 'ml-3' : ''
                } ${
                    isActive
                        ? 'bg-blue-50/75 dark:bg-blue-950/35 text-[#0070f3] dark:text-blue-400 font-semibold'
                        : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/60 dark:hover:bg-zinc-850/50'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0 py-0.5">
                    <item.icon
                        size={item.indent ? 13 : 15}
                        strokeWidth={isActive ? 2 : 1.75}
                        className={`shrink-0 ${
                            isActive
                                ? 'text-[#0070f3] dark:text-blue-400'
                                : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-200'
                        }`}
                    />
                    <span className={`text-[13.5px] tracking-tight truncate ${
                        item.indent ? 'text-[12.5px]' : ''
                    } ${
                        isActive ? 'font-semibold text-[#0070f3] dark:text-blue-400' : 'font-medium'
                    }`}>
                        {item.name}
                    </span>
                </div>
                {item.hasChevron && (
                    <ChevronRightIcon className={`shrink-0 ml-1.5 transition-colors ${
                        isActive ? 'text-[#0070f3]/70 dark:text-blue-400/70' : 'text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300'
                    }`} />
                )}
            </Link>
        );
    };

    return (
        <nav className="flex-1 min-h-0 overflow-y-auto pr-1 scroll-pb-24 select-none outline-none relative custom-scrollbar">
            <div className="px-2 space-y-0.5">
                {group1.map(renderMenuItem)}

                {group2.length > 0 && (
                    <>
                        <div className="border-t border-slate-100 dark:border-zinc-800/80 my-2 mx-1.5" />
                        {group2.map(renderMenuItem)}
                    </>
                )}

                {group3.length > 0 && (
                    <>
                        <div className="border-t border-slate-100 dark:border-zinc-800/80 my-2 mx-1.5" />
                        {group3.map(renderMenuItem)}
                    </>
                )}
            </div>
            <div className={`${NAV_SCROLL_SPACER} shrink-0`} aria-hidden="true" />
        </nav>
    );
};

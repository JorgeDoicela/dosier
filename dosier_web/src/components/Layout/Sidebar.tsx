import React from 'react';
import type { SidebarProps } from './Sidebar/types';
import { useSidebar } from './Sidebar/hooks/useSidebar';
import { SidebarBrand } from './Sidebar/components/SidebarBrand';
import { SidebarSearch } from './Sidebar/components/SidebarSearch';
import { SidebarNav } from './Sidebar/components/SidebarNav';
import { SidebarFooter } from './Sidebar/components/SidebarFooter';

const SIDEBAR_TRANSITION_MS = 280;
const SIDEBAR_COLLAPSE_MS = 420;
const SIDEBAR_EASING = 'cubic-bezier(0.32, 0.72, 0, 1)';
const SIDEBAR_COLLAPSE_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

const Sidebar: React.FC<SidebarProps> = ({
    currentTheme,
    toggleTheme,
    isOpen,
    onClose,
    isCollapsed,
    onCollapse,
    onExpand
}) => {
    const {
        logout,
        isAdmin,
        user,
        roleDisplayName,
        availableRoles,
        activeRole,
        setActiveRole,
        navigate,
        location,
        searchShortcut,
        isDragging,
        isClosingAnim,
        peekWidth,
        desktopWidth,
        contentWidth,
        isDesktop,
        sidebarReveal,
        isSidebarClosing,
        isUserMenuOpen,
        setIsUserMenuOpen,
        sidebarProjects,
        sidebarMyProjects,
        sidebarProjectsLoading,
        showAllProjects,
        setShowAllProjects,
        activeItem,
        group1,
        group2,
        group3,
        startResizing,
        startExpandDrag,
        triggerCommandPalette,
        userInitials,
        username,
        expandedWidth,
        isAnalyticsOpen,
        setIsAnalyticsOpen,
        isUsersOpen,
        setIsUsersOpen,
        isParametrosOpen,
        setIsParametrosOpen,
        isInvestigacionOpen,
        setIsInvestigacionOpen,
        isMisProyectosOpen,
        setIsMisProyectosOpen,
        isSolicitudesOpen,
        setIsSolicitudesOpen,
        collapseAllMenus
    } = useSidebar({ isCollapsed, onCollapse, onExpand });

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            <aside
                style={{
                    width: isDesktop ? desktopWidth : undefined,
                    transition: isDesktop && !isDragging
                        ? `width ${isClosingAnim ? SIDEBAR_COLLAPSE_MS : SIDEBAR_TRANSITION_MS}ms ${isClosingAnim ? SIDEBAR_COLLAPSE_EASING : SIDEBAR_EASING}, opacity ${isClosingAnim ? SIDEBAR_COLLAPSE_MS : 200}ms ${SIDEBAR_COLLAPSE_EASING}`
                        : undefined
                }}
                className={`
          fixed inset-y-0 left-0 z-[70] bg-surface border-r border-border outline-none shrink-0 overflow-hidden
          lg:translate-x-0 lg:static lg:h-screen lg:relative
          ${isOpen ? 'translate-x-0 shadow-2xl w-64' : '-translate-x-full w-64 lg:translate-x-0 lg:w-auto'}
          ${isCollapsed && peekWidth === null && !isClosingAnim ? 'lg:border-r-0 lg:opacity-0 lg:pointer-events-none lg:p-0' : 'lg:opacity-100'}
        `}
            >
                <div
                    className="flex flex-col h-full pt-4 pb-3 w-full"
                    style={{
                        width: isDesktop ? contentWidth : '100%',
                        minWidth: isDesktop ? contentWidth : '100%',
                        opacity: sidebarReveal,
                        transition: isDesktop && !isDragging
                            ? `opacity ${isClosingAnim ? SIDEBAR_COLLAPSE_MS : SIDEBAR_TRANSITION_MS}ms ${isClosingAnim ? SIDEBAR_COLLAPSE_EASING : SIDEBAR_EASING}`
                            : undefined
                    }}
                >
                    <SidebarBrand currentTheme={currentTheme} onClose={onClose} onBrandClick={collapseAllMenus} />

                    <SidebarSearch triggerCommandPalette={triggerCommandPalette} searchShortcut={searchShortcut} />

                    <SidebarNav
                        group1={group1}
                        group2={group2}
                        group3={group3}
                        activeItem={activeItem}
                        isInvestigacionOpen={isInvestigacionOpen}
                        setIsInvestigacionOpen={setIsInvestigacionOpen}
                        isMisProyectosOpen={isMisProyectosOpen}
                        setIsMisProyectosOpen={setIsMisProyectosOpen}
                        isSolicitudesOpen={isSolicitudesOpen}
                        setIsSolicitudesOpen={setIsSolicitudesOpen}
                        isAnalyticsOpen={isAnalyticsOpen}
                        setIsAnalyticsOpen={setIsAnalyticsOpen}
                        isUsersOpen={isUsersOpen}
                        setIsUsersOpen={setIsUsersOpen}
                        isParametrosOpen={isParametrosOpen}
                        setIsParametrosOpen={setIsParametrosOpen}
                        sidebarProjects={sidebarProjects}
                        sidebarMyProjects={sidebarMyProjects}
                        sidebarProjectsLoading={sidebarProjectsLoading}
                        showAllProjects={showAllProjects}
                        setShowAllProjects={setShowAllProjects}
                        location={location}
                        onClose={onClose}
                    />

                    <SidebarFooter
                        isUserMenuOpen={isUserMenuOpen}
                        setIsUserMenuOpen={setIsUserMenuOpen}
                        isAdmin={isAdmin}
                        user={user}
                        userInitials={userInitials}
                        username={username}
                        roleDisplayName={roleDisplayName}
                        availableRoles={availableRoles}
                        activeRole={activeRole}
                        setActiveRole={setActiveRole}
                    />
                </div>

                {(isSidebarClosing || isClosingAnim) && (
                    <div
                        aria-hidden
                        className="absolute inset-y-0 right-0 pointer-events-none z-10"
                        style={{
                            width: Math.max(48, expandedWidth - desktopWidth + 32),
                            background: 'linear-gradient(to right, transparent, var(--bg))',
                            opacity: 1 - sidebarReveal,
                            transition: isDragging
                                ? undefined
                                : `opacity ${isClosingAnim ? SIDEBAR_COLLAPSE_MS : SIDEBAR_TRANSITION_MS}ms ${isClosingAnim ? SIDEBAR_COLLAPSE_EASING : SIDEBAR_EASING}`
                        }}
                    />
                )}

            </aside>

            {/* Drag Resizer Handle - Colocado fuera de aside para evitar overflow-hidden y no tapar el scrollbar */}
            {!isCollapsed && isDesktop && (
                <div
                    onMouseDown={startResizing}
                    style={{
                        left: desktopWidth - 2,
                    }}
                    className="hidden lg:block fixed top-0 bottom-0 w-4 cursor-col-resize z-[80] outline-none group"
                    title="Derecha ensancha · izquierda compacta (se queda) · más allá se oculta · clic oculta"
                >
                    <div className="absolute inset-y-0 left-[2px] w-px bg-border-thin/60 group-hover:bg-text-dim/50 group-active:bg-text-dim/70 transition-colors" />
                </div>
            )}

            {/* Zona de arrastre para reabrir (estilo Vercel) */}
            {isCollapsed && (
                <div
                    onMouseDown={startExpandDrag}
                    className="hidden lg:block fixed inset-y-0 left-0 w-3 z-[65] cursor-col-resize"
                    title="Arrastrar para mostrar panel"
                />
            )}
        </>
    );
};

export default Sidebar;

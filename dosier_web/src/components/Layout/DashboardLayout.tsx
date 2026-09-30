import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../api/AuthContext';
import Sidebar from './Sidebar';
import { CommandPalette } from '../Common/CommandPalette';
import { Menu, HelpCircle, MessageSquarePlus, Sun, Moon, Settings, Trash2, LogOut } from 'lucide-react';
import NotificationBell from '../Notifications/NotificationBell';
import { HelpModal } from './Help/HelpModal';
import { WelcomeModal } from './WelcomeModal/WelcomeModal';
import { notificacionesService } from '../../services/notificacionesService';
import { StickyNotesFloatingButton } from '../Common/StickyNotesFloatingButton';
import { getStickyNotes } from '../../services/calendarioService';
import { FeedbackModal } from '../Feedback/FeedbackModal';
import api from '../../api/axios_config';
import { useNotifications } from '../../api/NotificationsContext';

interface LayoutProps {
    children: React.ReactNode;
    theme: 'dark' | 'light';
    toggleTheme: () => void;
}

const getPageTitle = (pathname: string): string => {
    if (pathname === '/dashboard') return 'Panel de Control';
    if (pathname === '/configuracion') return 'Configuración';
    if (pathname === '/derechos-arco') return 'Derechos ARCO';
    if (pathname === '/lopdp') return 'Panel LOPDP (Admin)';
    if (pathname === '/analiticas') return 'Analíticas';
    if (pathname === '/notificaciones') return 'Notificaciones';
    if (pathname === '/usuarios') return 'Gestión de Usuarios';
    if (pathname === '/admin/documentos') return 'Ciclo de Vida Documental';
    if (pathname === '/auditoria') return 'Registro de auditoría';
    if (pathname === '/grupos') return 'Comités y Grupos Documentales';
    if (pathname === '/parametros-normativos') return 'Parámetros';
    if (pathname === '/documentacion') return 'Portafolio y Documentación';
    if (pathname === '/documentacion/mis-proyectos') return 'Mis Proyectos y Documentos';
    if (pathname.startsWith('/documentacion/monitoreo/')) return 'Monitoreo de Expediente';
    if (pathname === '/convocatorias') return 'Convocatorias';
    if (pathname === '/verificacion' || pathname.startsWith('/verificacion/')) return 'Verificación Documental';
    if (pathname === '/incidencias' || pathname === '/feedback' || pathname === '/sugerencias') return 'Buzón de Incidencias';
    if (pathname === '/admin/incidencias') return 'Gestión de Incidencias (Admin)';
    return '';
};

const DashboardLayout: React.FC<LayoutProps> = ({ children, theme, toggleTheme }) => {
    const { isAuthenticated, isLoading, user, logout, isAdmin } = useAuth();
    const { addToast, fetchNotifications, isConnected } = useNotifications();
    const location = useLocation();
    const navigate = useNavigate();
    const isWorkspace = location.pathname.includes('/workspace/');
    const isFullHeightPage = isWorkspace || location.pathname === '/plantillas' || location.pathname === '/admin/plantillas';
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved === 'true';
    });
    const [topBarCollapsed, setTopBarCollapsed] = useState(false);

    // ── Cierre de Bienvenida y Activación Única de Notificación de Bienvenida ──
    const handleWelcomeClose = useCallback(async () => {
        setIsWelcomeOpen(false);
        try {
            const res = await api.post('/Admin/notifications/trigger-welcome');
            if (res.data?.sent) {
                if (!isConnected && res.data.titulo && res.data.mensaje) {
                    addToast(res.data.titulo, res.data.mensaje, 'default', res.data.url_accion || '/notificaciones');
                }
                await fetchNotifications();
            }
        } catch (err) {
            console.warn('Error al activar notificación inicial de bienvenida:', err);
        }
    }, [isConnected, addToast, fetchNotifications]);

    // ── Disparador de Pantalla de Bienvenida Inicial (Drawer) ─────────────────
    useEffect(() => {
        if (!user || !isAuthenticated || isLoading || isWorkspace) return;

        const userKey = user.id_referencia || user.id_usuario?.toString() || user.usuario || 'default';
        const isDismissed = localStorage.getItem(`dosier_welcome_dismissed_${userKey}`) === 'true';

        if (isDismissed) return;

        const timer = setTimeout(() => {
            setIsWelcomeOpen(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [user, isAuthenticated, isLoading, isWorkspace]);

    // ── Listener para apertura global de reporte de incidencias ─────────────
    useEffect(() => {
        const handleOpenFeedback = () => setIsFeedbackOpen(true);
        window.addEventListener('dosier-open-feedback', handleOpenFeedback);
        return () => window.removeEventListener('dosier-open-feedback', handleOpenFeedback);
    }, []);

    // ── Contador de notas rápidas sin planificar (badge del botón flotante) ─────
    const [pendingNotesCount, setPendingNotesCount] = useState(0);

    const fetchPendingCount = useCallback(async () => {
        if (!isAuthenticated || isLoading) return;
        try {
            const notas = await getStickyNotes();
            setPendingNotesCount(notas.length);
        } catch {
            // silencioso — no romper el layout por esto
        }
    }, [isAuthenticated, isLoading]);

    useEffect(() => {
        fetchPendingCount();
    }, [fetchPendingCount]);

    useEffect(() => {
        const handleNoteCreated = () => fetchPendingCount();
        window.addEventListener('dosier:note-created', handleNoteCreated);
        return () => window.removeEventListener('dosier:note-created', handleNoteCreated);
    }, [fetchPendingCount]);

    useEffect(() => {
        if (!isAuthenticated || isLoading || !user) return;

        const initWebPush = async () => {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                if (import.meta.env.DEV) console.log('Este navegador no soporta notificaciones Web Push.');
                localStorage.setItem('web_push_active', 'false');
                return;
            }

            try {
                // 1. Registrar Service Worker de forma explícita
                const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);

                // 2. Esperar a que el service worker esté completamente listo
                await navigator.serviceWorker.ready;

                // 3. Solicitar permiso para mostrar notificaciones si no está decidido
                if (Notification.permission === 'default') {
                    const permission = await Notification.requestPermission();
                    if (permission !== 'granted') {
                        if (import.meta.env.DEV) console.log('El usuario rechazó los permisos de notificación.');
                        localStorage.setItem('web_push_active', 'false');
                        return;
                    }
                } else if (Notification.permission === 'denied') {
                    if (import.meta.env.DEV) console.log('Permiso de notificación denegado previamente.');
                    localStorage.setItem('web_push_active', 'false');
                    return;
                }

                if (sessionStorage.getItem('web_push_attempted') === 'true') {
                    return;
                }
                sessionStorage.setItem('web_push_attempted', 'true');

                // 4. Suscribirse al servidor de Push con la llave VAPID pública oficial configurada en el backend
                const VAPID_PUBLIC_KEY = 'BEEx5SX2kXyqhLIAD1oMlYVMEM9ZACpRCA8z12C1x_FUobijWo-LlV0O9R3Ql0jgAvYAnTg1ktBlLyDIRcJnOO8';

                const urlBase64ToUint8Array = (base64String: string) => {
                    const padding = '='.repeat((4 - base64String.length % 4) % 4);
                    const base64 = (base64String + padding)
                        .replace(/\-/g, '+')
                        .replace(/_/g, '/');

                    const rawData = window.atob(base64);
                    const outputArray = new Uint8Array(rawData.length);

                    for (let i = 0; i < rawData.length; ++i) {
                        outputArray[i] = rawData.charCodeAt(i);
                    }
                    return outputArray;
                };

                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
                    });
                    if (import.meta.env.DEV) console.log('Nueva suscripción Web Push creada:', subscription);
                }

                // 5. Condensar la suscripción para que quepa de forma segura en el límite de 512 caracteres de la BD
                const subJson = subscription.toJSON();
                const tokenString = `${subJson.endpoint}|${subJson.keys?.p256dh || ''}|${subJson.keys?.auth || ''}`;

                await notificacionesService.subscribeDevice({
                    device_token: tokenString,
                    plataforma: 'web_push'
                });
                if (import.meta.env.DEV) console.log('Suscripción Web Push sincronizada.');
                localStorage.setItem('web_push_active', 'true');
            } catch {
                localStorage.setItem('web_push_active', 'false');
            }
        };

        // Retardo estratégico de 2 segundos para no interferir con la carga crítica del dashboard
        const timer = setTimeout(() => {
            initWebPush();
        }, 2000);

        return () => clearTimeout(timer);
    }, [isAuthenticated, isLoading, user]);

    const handleSidebarCollapse = () => {
        setIsCollapsed(true);
        localStorage.setItem('sidebar_collapsed', 'true');
    };

    const handleSidebarExpand = () => {
        setIsCollapsed(false);
        localStorage.setItem('sidebar_collapsed', 'false');
    };

    useEffect(() => {
        const handleToggle = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail === 'expand') {
                handleSidebarExpand();
            } else if (customEvent.detail === 'collapse') {
                handleSidebarCollapse();
            } else {
                setIsCollapsed(prev => {
                    const next = !prev;
                    localStorage.setItem('sidebar_collapsed', String(next));
                    return next;
                });
            }
        };
        window.addEventListener('dosier-toggle-sidebar', handleToggle);
        return () => window.removeEventListener('dosier-toggle-sidebar', handleToggle);
    }, []);

    useEffect(() => {
        const event = new CustomEvent('dosier-sidebar-state-change', { detail: { isCollapsed } });
        window.dispatchEvent(event);
    }, [isCollapsed]);

    useEffect(() => {
        const handleTopbarCollapse = (e: Event) => {
            const customEvent = e as CustomEvent;
            setTopBarCollapsed(!!customEvent.detail?.collapsed);
        };
        window.addEventListener('dosier-topbar-collapse-change', handleTopbarCollapse);
        return () => window.removeEventListener('dosier-topbar-collapse-change', handleTopbarCollapse);
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isWorkspace) return;
        const currentScrollY = e.currentTarget.scrollTop;

        if (currentScrollY < 10) {
            if (!showHeader) setShowHeader(true);
        } else if (currentScrollY > lastScrollY + 10) {
            if (showHeader) setShowHeader(false);
        } else if (currentScrollY < lastScrollY - 10) {
            if (!showHeader) setShowHeader(true);
        }
        setLastScrollY(currentScrollY);
    };


    return (
        <div className="flex h-screen w-full bg-bg-deep overflow-hidden font-sans selection:bg-text-main selection:text-bg-deep transition-colors duration-300">
            <CommandPalette />

            <Sidebar
                currentTheme={theme}
                toggleTheme={toggleTheme}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                onCollapse={handleSidebarCollapse}
                onExpand={handleSidebarExpand}
            />

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Desktop TopBar */}
                {!isWorkspace && (
                    <header className={`hidden lg:flex items-center justify-between bg-surface border-b border-border sticky top-0 z-[40] transition-[max-height,opacity] duration-150 ease-out ${topBarCollapsed
                            ? 'max-h-0 opacity-0 overflow-hidden border-b-0 pointer-events-none'
                            : 'max-h-14 h-14 opacity-100'
                        }`}>
                        <div className="max-w-[1600px] mx-auto w-full px-4 md:px-10 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                {isCollapsed && (
                                    <>
                                        <button
                                            onClick={handleSidebarExpand}
                                            className="p-1.5 rounded-md hover:bg-surface-hover text-text-dim hover:text-text-main transition-colors duration-150 cursor-pointer shrink-0"
                                            title="Mostrar panel lateral"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="w-4 h-4"
                                            >
                                                <rect width="18" height="18" x="3" y="3" rx="2" />
                                                <path d="M9 3v18" />
                                            </svg>
                                        </button>
                                        <div className="h-4 w-[1px] bg-border-thin mx-0.5 shrink-0" />
                                    </>
                                )}
                                <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-text-main truncate select-none">
                                    {getPageTitle(location.pathname)}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsFeedbackOpen(true)}
                                    className="p-1.5 rounded-md text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                                    title="Reportar problema o sugerencia"
                                    aria-label="Abrir formulario de feedback e incidencias"
                                >
                                    <MessageSquarePlus size={16} className="text-text-main" />
                                </button>
                                <button
                                    onClick={() => setIsHelpOpen(true)}
                                    className="p-1.5 rounded-md text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                                    title="Guía Interactiva"
                                    aria-label="Abrir guía interactiva"
                                >
                                    <HelpCircle size={16} className="text-text-main" />
                                </button>
                                <NotificationBell size="sm" />

                                <div className="h-4 w-[1px] bg-border-thin mx-1" />

                                <button
                                    onClick={toggleTheme}
                                    className="p-1.5 rounded-md text-text-main hover:bg-surface-hover transition-colors cursor-pointer"
                                    title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                                    aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                                >
                                    {theme === 'dark' ? <Sun size={16} className="text-text-main" /> : <Moon size={16} className="text-text-main" />}
                                </button>

                                <Link
                                    to="/configuracion"
                                    className="p-1.5 rounded-md text-text-main hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-center no-underline"
                                    title="Configuración"
                                    aria-label="Ir a Configuración"
                                >
                                    <Settings size={16} className="text-text-main" />
                                </Link>

                                {(isAdmin || user?.roles?.includes('DOSIER_DOCENTE')) && (
                                    <Link
                                        to="/papelera"
                                        className="p-1.5 rounded-md text-text-main hover:bg-surface-hover transition-colors cursor-pointer flex items-center justify-center no-underline"
                                        title="Papelera"
                                        aria-label="Ir a Papelera"
                                    >
                                        <Trash2 size={16} className="text-text-main" />
                                    </Link>
                                )}

                                <button
                                    onClick={async () => {
                                        await logout();
                                        navigate('/');
                                    }}
                                    className="p-1.5 rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer flex items-center justify-center"
                                    title="Cerrar Sesión"
                                    aria-label="Cerrar Sesión"
                                >
                                    <LogOut size={16} />
                                </button>
                            </div>
                        </div>
                    </header>
                )}

                {/* Mobile Header */}
                {!isWorkspace && (
                    <header className={`lg:hidden flex items-center justify-between px-6 bg-surface border-b border-border z-50 transition-all duration-300 ease-in-out ${showHeader && !topBarCollapsed
                            ? 'max-h-20 py-4 opacity-100'
                            : 'max-h-0 py-0 opacity-0 overflow-hidden border-b-0 pointer-events-none'
                        }`}>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-text-dim hover:text-text-main transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <Link to="/dashboard" className="flex items-center justify-center cursor-pointer">
                            <img
                                src={theme === 'dark' ? `${import.meta.env.BASE_URL}logo_blanco.png` : `${import.meta.env.BASE_URL}logo_negro.png`}
                                alt="DOSIER"
                                className="h-7 w-auto object-contain"
                            />
                        </Link>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setIsFeedbackOpen(true)}
                                className="p-2 text-text-main hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                                title="Reportar problema o sugerencia"
                                aria-label="Abrir formulario de feedback e incidencias"
                            >
                                <MessageSquarePlus size={20} className="text-text-main" />
                            </button>
                            <button
                                onClick={() => setIsHelpOpen(true)}
                                className="p-2 text-text-main hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                                title="Guía Interactiva"
                                aria-label="Abrir guía interactiva"
                            >
                                <HelpCircle size={20} className="text-text-main" />
                            </button>
                            <NotificationBell size="md" />
                            <button
                                onClick={toggleTheme}
                                className="p-2 text-text-main hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
                                title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                            >
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <Link
                                to="/configuracion"
                                className="p-2 text-text-main hover:bg-surface-hover rounded-md transition-colors cursor-pointer flex items-center justify-center no-underline"
                                title="Configuración"
                            >
                                <Settings size={20} />
                            </Link>
                            {(isAdmin || user?.roles?.includes('DOSIER_DOCENTE')) && (
                                <Link
                                    to="/papelera"
                                    className="p-2 text-text-main hover:bg-surface-hover rounded-md transition-colors cursor-pointer flex items-center justify-center no-underline"
                                    title="Papelera"
                                >
                                    <Trash2 size={20} />
                                </Link>
                            )}
                            <button
                                onClick={async () => {
                                    await logout();
                                    navigate('/');
                                }}
                                className="p-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                                title="Cerrar Sesión"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </header>
                )}

                <div
                    onScroll={handleScroll}
                    className={`flex-1 ${isFullHeightPage ? 'overflow-hidden h-full' : 'overflow-y-auto custom-scrollbar'}`}
                >
                    <div className={isFullHeightPage ? 'h-full w-full' : 'max-w-[1600px] mx-auto w-full'}>
                        {children}
                    </div>
                </div>
            </div>

            <HelpModal
                isOpen={isHelpOpen}
                onClose={() => setIsHelpOpen(false)}
                pathname={location.pathname}
            />

            <WelcomeModal
                isOpen={isWelcomeOpen}
                onClose={handleWelcomeClose}
                onOpenGuide={() => {
                    handleWelcomeClose();
                    setIsHelpOpen(true);
                }}
            />

            {!isFullHeightPage && (
                <StickyNotesFloatingButton
                    pendingCount={pendingNotesCount}
                />
            )}

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
            />
        </div>
    );
};

export default DashboardLayout;


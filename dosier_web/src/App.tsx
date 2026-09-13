import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './api/AuthContext';
import { NotificationsProvider } from './api/NotificationsContext';
import { ConfirmProvider } from './api/ConfirmContext';
import { buildWorkspacePath } from './core/documents/templateUrl';
import { FullscreenLoader } from './components/Common/FullscreenLoader';

// ─── Lazy imports: cada página se carga solo cuando se necesita ───────────────
const DashboardLayout        = lazy(() => import('./components/Layout/DashboardLayout'));
const UsersPage              = lazy(() => import('./pages/Admin/UsersPage'));
const Dashboard              = lazy(() => import('./pages/Dashboard/Dashboard'));
const Landing                = lazy(() => import('./pages/Landing/Landing'));
const Login                  = lazy(() => import('./pages/Login/Login'));
const MagicLogin             = lazy(() => import('./pages/Login/MagicLogin'));
const PinHandoff             = lazy(() => import('./pages/Login/PinHandoff'));
const MagicResend            = lazy(() => import('./pages/Login/MagicResend'));
const MicrosoftCallback      = lazy(() => import('./pages/Login/MicrosoftCallback'));
const RecuperarContrasenia   = lazy(() => import('./pages/Login/RecuperarContrasenia'));
const VerContrasenia         = lazy(() => import('./pages/Login/VerContrasenia'));
const ResearchProjectsPage   = lazy(() => import('./pages/Investigacion/Proyectos/ResearchProjectsPage'));
const MyProjectsPage         = lazy(() => import('./pages/Investigacion/Proyectos/MyProjectsPage'));
const ProjectWorkspace       = lazy(() => import('./pages/Investigacion/Proyectos/Workspace/ProjectWorkspace').then(m => ({ default: m.ProjectWorkspace })));
const RevisionTecnicaPage    = lazy(() => import('./pages/Investigacion/Proyectos/RevisionTecnicaPage').then(m => ({ default: m.RevisionTecnicaPage })));
const MonitoringPage         = lazy(() => import('./pages/Investigacion/Monitoreo/MonitoringPage'));
const AuditPage              = lazy(() => import('./pages/Admin/AuditPage'));
const VerifyDocument         = lazy(() => import('./pages/Public/VerifyDocument'));
const AnalyticsPage          = lazy(() => import('./pages/Analytics/AnalyticsPage'));
const NotificationsPage      = lazy(() => import('./pages/Notificaciones/NotificationsPage'));
const EmailEnginePage        = lazy(() => import('./pages/Admin/Emails/EmailEnginePage'));
const SettingsPage           = lazy(() => import('./pages/Settings/SettingsPage'));
const LopdpConsentPage       = lazy(() => import('./pages/Lopdp/LopdpConsentPage'));
const LopdpAdminPage         = lazy(() => import('./pages/Lopdp/LopdpAdminPage'));
const CalendarioPage         = lazy(() => import('./pages/Calendario/CalendarioPage').then(m => ({ default: m.CalendarioPage })));
const RecycleBinPage         = lazy(() => import('./pages/RecycleBin/RecycleBinPage'));
const ResetAlertPage         = lazy(() => import('./pages/Auth/ResetAlertPage'));
const DocumentMaintenancePage = lazy(() => import('./pages/Admin/DocumentMaintenancePage'));
const DocumentTemplatesPage   = lazy(() => import('./pages/Admin/Templates/DocumentTemplatesPage'));

// ─── Fallback de carga ────────────────────────────────────────────────────────
const PageLoader = () => (
    <FullscreenLoader />
);

// ─── Guards de ruta ───────────────────────────────────────────────────────────
const RedirectPreserveSearch = ({ to }: { to: string }) => {
    const location = useLocation();
    return <Navigate to={`${to}${location.search}`} replace />;
};

const RedirectVerifyCode = () => {
    const { code } = useParams<{ code: string }>();
    const location = useLocation();
    return <Navigate to={`/verificacion/${code || ''}${location.search}`} replace />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, user } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Intercept user if LOPDP terms have not been accepted yet
    if (user?.acepto_lopdp === false && location.pathname !== '/consentimiento-lopdp') {
        return <Navigate to="/consentimiento-lopdp" replace />;
    }

    // Redirect user to dashboard if trying to go back to consent screen after accepting
    if (user?.acepto_lopdp === true && location.pathname === '/consentimiento-lopdp') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const AuthenticatedRedirect = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, isAdmin } = useAuth();
    if (isLoading) return null;

    if (!isAuthenticated || !isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

const PermissionRoute = ({ children, module, op }: { children: React.ReactNode; module: string; op: string }) => {
    const { isAuthenticated, isLoading, hasPermission, isAdmin } = useAuth();
    if (isLoading) return null;

    if (!isAuthenticated || (!isAdmin && !hasPermission(module, op))) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

export const RoleRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
    const { isAuthenticated, isLoading, isAdmin, isDocente, isCoordCarrera, isCoordAcad, isVicerrector, isEstudiante, isRevisor, roles } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles.includes('ANY')) return <>{children}</>;

    if (isAdmin) return <>{children}</>;

    if (roles.some(r => allowedRoles.map(a => a.toUpperCase()).includes(r.toUpperCase()))) return <>{children}</>;

    if (isDocente && allowedRoles.includes('DOSIER_DOCENTE')) return <>{children}</>;

    if (isCoordCarrera && allowedRoles.includes('DOSIER_COORD_CARRERA')) return <>{children}</>;

    if (isCoordAcad && allowedRoles.includes('DOSIER_COORD_ACAD')) return <>{children}</>;

    if (isVicerrector && allowedRoles.includes('DOSIER_VICERRECTOR')) return <>{children}</>;

    if (isRevisor && (allowedRoles.includes('DOSIER_REVISOR') || allowedRoles.includes('DOSIER_REVISOR_EXTERNO'))) return <>{children}</>;

    if (isEstudiante && allowedRoles.includes('DOSIER_ESTUDIANTE')) return <>{children}</>;

    return <Navigate to="/dashboard" replace />;
};

const ResearcherRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    return <>{children}</>;
};

const NavigateToProjectDetail = () => {
    const { projectUuid } = useParams();
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isSupervisor = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;
    const prefix = isSupervisor ? '/documentacion' : '/documentacion/mis-proyectos';
    return <Navigate to={`${prefix}/monitoreo/${projectUuid}`} replace />;
};

const NavigateToWorkspaceDetail = () => {
    const { projectUuid } = useParams();
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isSupervisor = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;
    const prefix = isSupervisor ? '/documentacion' : '/documentacion/mis-proyectos';
    return <Navigate to={buildWorkspacePath('PROTOCOLO_INVESTIGACION', projectUuid!, '', prefix)} replace />;
};

const NavigateToResearchProjects = () => {
    const { isAdmin, isCoordCarrera, isCoordAcad, isVicerrector } = useAuth();
    const isSupervisor = isAdmin || isCoordCarrera || isCoordAcad || isVicerrector;
    const target = isSupervisor ? '/documentacion' : '/documentacion/mis-proyectos';
    return <Navigate to={target} replace />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
        
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    return (
        <AuthProvider>
            <BrowserRouter basename={import.meta.env.BASE_URL}>
                <ConfirmProvider>
                    <NotificationsProvider>
                    <Suspense fallback={<PageLoader />}>
                    <Routes>
                        {/* Public Landing Page */}
                        <Route path="/" element={
                            <AuthenticatedRedirect>
                                <Landing currentTheme={theme} toggleTheme={toggleTheme} />
                            </AuthenticatedRedirect>
                        } />
                        <Route path="/login" element={
                            <AuthenticatedRedirect>
                                <Login currentTheme={theme} toggleTheme={toggleTheme} />
                            </AuthenticatedRedirect>
                        } />
                        <Route path="/auth/magic-login" element={
                            <MagicLogin currentTheme={theme} toggleTheme={toggleTheme} />
                        } />
                        <Route path="/auth/pin" element={
                            <PinHandoff currentTheme={theme} toggleTheme={toggleTheme} />
                        } />
                        <Route path="/auth/magic-resend" element={
                            <MagicResend currentTheme={theme} toggleTheme={toggleTheme} />
                        } />
                        <Route path="/auth/microsoft-callback" element={
                            <MicrosoftCallback />
                        } />
                        <Route path="/auth/recuperar-contrasenia" element={
                            <RecuperarContrasenia currentTheme={theme} toggleTheme={toggleTheme} />
                        } />
                        <Route path="/auth/ver-contrasenia" element={
                            <VerContrasenia currentTheme={theme} toggleTheme={toggleTheme} />
                        } />
                        <Route path="/auth/reestablecer-alerta" element={
                            <ResetAlertPage />
                        } />

                        {/* Internal Pages with Layout (Stable) */}
                        <Route element={
                            <ProtectedRoute>
                                <DashboardLayout theme={theme} toggleTheme={toggleTheme}>
                                    <Outlet />
                                </DashboardLayout>
                            </ProtectedRoute>
                        }>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/calendario" element={<CalendarioPage />} />
                            <Route path="/papelera" element={<RecycleBinPage />} />
                            <Route path="/configuracion" element={<SettingsPage />} />
                            <Route path="/settings" element={<RedirectPreserveSearch to="/configuracion" />} />
                            <Route path="/derechos-arco" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/lopdp" element={<AdminRoute><LopdpAdminPage /></AdminRoute>} />
                            <Route path="/analiticas" element={<RoleRoute allowedRoles={['DOSIER_ADMIN', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}><AnalyticsPage /></RoleRoute>} />
                            <Route path="/notificaciones" element={<NotificationsPage />} />
                            <Route path="/usuarios" element={<PermissionRoute module="USUARIOS" op="VER"><UsersPage /></PermissionRoute>} />
                            <Route path="/auditoria" element={<RoleRoute allowedRoles={['DOSIER_ADMIN', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}><AuditPage /></RoleRoute>} />
                            <Route path="/parametros-normativos" element={<Navigate to="/configuracion?tab=parametros" replace />} />
                             <Route path="/emails" element={<AdminRoute><EmailEnginePage /></AdminRoute>} />
                             <Route path="/admin/documentos" element={<AdminRoute><DocumentMaintenancePage /></AdminRoute>} />
                             <Route path="/plantillas" element={<AdminRoute><DocumentTemplatesPage /></AdminRoute>} />
                             <Route path="/admin/plantillas" element={<RedirectPreserveSearch to="/plantillas" />} />
                             <Route path="/templates" element={<RedirectPreserveSearch to="/plantillas" />} />
                             <Route path="/admin" element={<Navigate to="/usuarios" replace />} />
                             <Route path="/admin/audit" element={<Navigate to="/auditoria" replace />} />
                             <Route path="/admin/configuracion" element={<RedirectPreserveSearch to="/parametros-normativos" />} />
                             <Route path="/admin/lopdp" element={<Navigate to="/lopdp" replace />} />
                             <Route path="/admin/emails" element={<Navigate to="/emails" replace />} />
                             <Route path="/proyectos/:projectUuid" element={<NavigateToProjectDetail />} />
                            <Route path="/documentacion/proyectos" element={<NavigateToResearchProjects />} />
                            <Route path="/investigacion/proyectos" element={<RedirectPreserveSearch to="/documentacion" />} />
                            <Route path="/investigacion/proyectos/workspace/:projectUuid" element={<NavigateToWorkspaceDetail />} />
                            <Route path="/lopdp/arco" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/lopdp/admin" element={<Navigate to="/lopdp" replace />} />
                            
                            {/* Supervision Context (Admin, Coordinadores, Vicerrector) */}
                            <Route path="/documentacion" element={<RoleRoute allowedRoles={['DOSIER_ADMIN', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}><ResearchProjectsPage /></RoleRoute>} />
                            <Route path="/documentacion/workspace/:templateCode/:projectUuid" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
                            <Route path="/documentacion/monitoreo/:projectUuid" element={<RoleRoute allowedRoles={['DOSIER_ADMIN', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}><MonitoringPage /></RoleRoute>} />
                            <Route path="/documentacion/revision-tecnica/:projectUuid" element={<RevisionTecnicaPage />} />

                            {/* Retrocompatibilidad /investigacion */}
                            <Route path="/investigacion" element={<RedirectPreserveSearch to="/documentacion" />} />
                            <Route path="/investigacion/workspace/:templateCode/:projectUuid" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
                            <Route path="/investigacion/monitoreo/:projectUuid" element={<RoleRoute allowedRoles={['DOSIER_ADMIN', 'DOSIER_COORD_CARRERA', 'DOSIER_COORD_ACAD', 'DOSIER_VICERRECTOR']}><MonitoringPage /></RoleRoute>} />
                            <Route path="/investigacion/revision-tecnica/:projectUuid" element={<RevisionTecnicaPage />} />
                            
                            {/* Author / Docente Context */}
                            <Route path="/documentacion/mis-proyectos" element={<ResearcherRoute><MyProjectsPage /></ResearcherRoute>} />
                            <Route path="/documentacion/mis-proyectos/workspace/:templateCode/:projectUuid" element={<ProtectedRoute><ProjectWorkspace /></ProtectedRoute>} />
                            <Route path="/documentacion/mis-proyectos/monitoreo/:projectUuid" element={<ResearcherRoute><MonitoringPage /></ResearcherRoute>} />
                            <Route path="/investigacion/mis-proyectos" element={<RedirectPreserveSearch to="/documentacion/mis-proyectos" />} />
                            
                            <Route path="/verificacion" element={<VerifyDocument />} />
                            <Route path="/verificar-firma" element={<RedirectPreserveSearch to="/verificacion" />} />
                            <Route path="/verify" element={<RedirectPreserveSearch to="/verificacion" />} />
                        </Route>

                        {/* Public Verification Page (Accessible without authentication) */}
                        <Route path="/verificacion/:code" element={<VerifyDocument />} />
                        <Route path="/verificar-firma/:code" element={<RedirectVerifyCode />} />
                        <Route path="/verify/:code" element={<RedirectVerifyCode />} />

                        <Route path="/consentimiento-lopdp" element={
                            <ProtectedRoute>
                                <LopdpConsentPage />
                            </ProtectedRoute>
                        } />

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                    </Suspense>
                </NotificationsProvider>
               </ConfirmProvider>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;

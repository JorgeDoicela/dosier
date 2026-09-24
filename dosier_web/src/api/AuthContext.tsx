import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { notificacionesService } from '../services/notificacionesService';

export interface User {
    id_referencia: string;
    nombre_completo: string;
    role: string;
    tipo_usuario: string;
    permissions: string[];
    administrador: boolean;
    roles: string[];
    usuario?: string;
    id_usuario?: number;
    id_sigafi?: string;
    idSigafi?: string;
    id?: number | string;
    role_codes?: string[];
    acepto_lopdp?: boolean;
}

export const ROLE_DISPLAY_NAMES: Record<string, string> = {
    DOSIER_ADMIN: 'Administrador del Sistema',
    DOSIER_VICERRECTOR: 'Vicerrectorado Académico',
    DOSIER_COORD_ACAD: 'Coordinación Académica',
    DOSIER_COORD_CARRERA: 'Coordinación de Carrera',
    DOSIER_DOCENTE: 'Docente Elaborador',
};

export interface RoleOption {
    code: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<User>;
    loginWithMicrosoft: (idToken: string) => Promise<User>;
    magicLogin: (token: string) => Promise<{ user: User; pin: string | null; token: string }>;
    confirmMagicLogin: (user: User, token: string) => Promise<void>;
    handoffLogin: (pin: string) => Promise<User>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasPermission: (module: string, operation: string) => boolean;
    roles: string[];
    availableRoles: RoleOption[];
    activeRole: string;
    setActiveRole: (roleCode: string) => void;
    isAdmin: boolean;
    isDocente: boolean;
    isCoordCarrera: boolean;
    isCoordAcad: boolean;
    isVicerrector: boolean;
    isEstudiante: boolean;
    isRevisor: boolean;
    roleDisplayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRole, setActiveRoleState] = useState<string>(() => {
        return localStorage.getItem('dosier_active_role') || '';
    });

    const setActiveRole = useCallback((roleCode: string) => {
        setActiveRoleState(roleCode);
        localStorage.setItem('dosier_active_role', roleCode);
    }, []);

    const refreshUser = useCallback(async () => {
        if (!localStorage.getItem('dosier_logged_in')) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const data = await authService.getMe();
            const normalized: User = {
                ...data,
                roles: data.role_codes || data.roles || [],
                role: data.role_codes?.[0] || data.role,
                acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
            };
            setUser(normalized);

            const userRoles = (normalized.role_codes || normalized.roles || []).map((r: string) => r.toUpperCase());
            const stored = localStorage.getItem('dosier_active_role');
            if (stored && userRoles.includes(stored)) {
                setActiveRoleState(stored);
            } else if (userRoles.length > 0) {
                setActiveRoleState(userRoles[0]);
                localStorage.setItem('dosier_active_role', userRoles[0]);
            }
        } catch (error: any) {
            setUser(null);
            localStorage.removeItem('dosier_logged_in');
            localStorage.removeItem('dosier_active_role');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Ejecución única al montar el proveedor
        refreshUser();
    }, [refreshUser]);

    const login = async (credentials: any) => {
        const data = await authService.login(credentials);

        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');

        const userRoles = (normalizedUser.role_codes || normalizedUser.roles || []).map((r: string) => r.toUpperCase());
        if (userRoles.length > 0) {
            setActiveRoleState(userRoles[0]);
            localStorage.setItem('dosier_active_role', userRoles[0]);
        }

        return normalizedUser;
    };

    const loginWithMicrosoft = async (idToken: string) => {
        const data = await authService.loginWithMicrosoft(idToken);

        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');

        const userRoles = (normalizedUser.role_codes || normalizedUser.roles || []).map((r: string) => r.toUpperCase());
        if (userRoles.length > 0) {
            setActiveRoleState(userRoles[0]);
            localStorage.setItem('dosier_active_role', userRoles[0]);
        }

        return normalizedUser;
    };

    const magicLogin = async (token: string) => {
        const { auth, pin } = await authService.magicLogin(token);

        const normalizedUser: User = {
            ...auth,
            roles: auth.role_codes || auth.roles || [],
            role: auth.role_codes?.[0] || auth.role,
            acepto_lopdp: auth.acepto_lopdp !== undefined ? auth.acepto_lopdp : auth.aceptoLopdp
        };

        return { user: normalizedUser, pin: pin || null, token: auth.token };
    };

    const confirmMagicLogin = async (user: User, token: string) => {
        await authService.confirmMagicLogin(token);
        setUser(user);
        localStorage.setItem('dosier_logged_in', 'true');

        const userRoles = (user.role_codes || user.roles || []).map((r: string) => r.toUpperCase());
        if (userRoles.length > 0) {
            setActiveRoleState(userRoles[0]);
            localStorage.setItem('dosier_active_role', userRoles[0]);
        }
    };

    const handoffLogin = async (pin: string) => {
        const data = await authService.handoffLogin(pin);

        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');

        const userRoles = (normalizedUser.role_codes || normalizedUser.roles || []).map((r: string) => r.toUpperCase());
        if (userRoles.length > 0) {
            setActiveRoleState(userRoles[0]);
            localStorage.setItem('dosier_active_role', userRoles[0]);
        }

        return normalizedUser;
    };

    const logout = async () => {
        setUser(null);
        localStorage.removeItem('dosier_logged_in');
        localStorage.removeItem('dosier_active_role');
        localStorage.removeItem('web_push_active');

        (async () => {
            try {
                const logoutTasks: Promise<any>[] = [];

                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        const subscription = await registration.pushManager.getSubscription();
                        if (subscription) {
                            const subJson = subscription.toJSON();
                            const tokenString = `${subJson.endpoint}|${subJson.keys?.p256dh || ''}|${subJson.keys?.auth || ''}`;
                            logoutTasks.push(
                                notificacionesService.unsubscribeDevice(tokenString)
                                    .catch(e => console.error('Error unsubscribing push on server:', e))
                            );
                            logoutTasks.push(
                                subscription.unsubscribe()
                                    .catch(e => console.error('Error unsubscribing browser push:', e))
                            );
                        }
                    }
                }

                logoutTasks.push(authService.logout().catch(() => { }));
                await Promise.all(logoutTasks);
            } catch (err) {
                console.error('Error procesando deslogueo en segundo plano:', err);
            }
        })();
    };

    const hasPermission = useCallback((module: string, operation: string): boolean => {
        if (!user || !user.permissions) return false;
        const target = `${module}:${operation}`.toUpperCase();
        return user.permissions.includes(target);
    }, [user]);

    const roles = React.useMemo(() => {
        if (!user) return [];
        const rawRoles = user.roles || (user.role ? [user.role] : []);
        return rawRoles.map(r => r.toUpperCase());
    }, [user]);

    const availableRoles = React.useMemo<RoleOption[]>(() => {
        return roles.map(code => ({
            code,
            name: ROLE_DISPLAY_NAMES[code] || code
        }));
    }, [roles]);

    const isAdmin = React.useMemo(() => {
        return Boolean(user?.administrador || roles.includes('DOSIER_ADMIN') || roles.includes('ADMIN'));
    }, [user, roles]);

    const isDocente = React.useMemo(() => {
        return roles.includes('DOSIER_DOCENTE') || roles.includes('DOCENTE');
    }, [roles]);

    const isCoordCarrera = React.useMemo(() => {
        return roles.includes('DOSIER_COORD_CARRERA') || roles.includes('COORDINADOR_CARRERA');
    }, [roles]);

    const isCoordAcad = React.useMemo(() => {
        return roles.includes('DOSIER_COORD_ACAD') || roles.includes('COORDINADOR_ACADEMICO');
    }, [roles]);

    const isVicerrector = React.useMemo(() => {
        return roles.includes('DOSIER_VICERRECTOR') || roles.includes('VICERRECTOR');
    }, [roles]);

    const isEstudiante = false;

    const isRevisor = React.useMemo(() => {
        return isCoordCarrera || isCoordAcad || isVicerrector || roles.includes('DOSIER_REVISOR') || roles.includes('DOSIER_REVISOR_EXTERNO');
    }, [isCoordCarrera, isCoordAcad, isVicerrector, roles]);

    const roleDisplayName = React.useMemo(() => {
        if (activeRole && ROLE_DISPLAY_NAMES[activeRole]) {
            return ROLE_DISPLAY_NAMES[activeRole];
        }
        if (isAdmin) return ROLE_DISPLAY_NAMES.DOSIER_ADMIN;
        if (isVicerrector) return ROLE_DISPLAY_NAMES.DOSIER_VICERRECTOR;
        if (isCoordAcad) return ROLE_DISPLAY_NAMES.DOSIER_COORD_ACAD;
        if (isCoordCarrera) return ROLE_DISPLAY_NAMES.DOSIER_COORD_CARRERA;
        if (isDocente) return ROLE_DISPLAY_NAMES.DOSIER_DOCENTE;
        return 'Usuario Institucional';
    }, [activeRole, isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente]);

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            loginWithMicrosoft,
            magicLogin,
            confirmMagicLogin,
            handoffLogin,
            logout,
            refreshUser,
            hasPermission,
            roles,
            availableRoles,
            activeRole,
            setActiveRole,
            isAdmin,
            isDocente,
            isCoordCarrera,
            isCoordAcad,
            isVicerrector,
            isEstudiante,
            isRevisor,
            roleDisplayName
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

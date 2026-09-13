import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from './axios_config';

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

    const refreshUser = useCallback(async () => {
        if (!localStorage.getItem('dosier_logged_in') && !localStorage.getItem('dosier_logged_in')) {
            setUser(null);
            setIsLoading(false);
            return;
        }
        try {
            const response = await api.get('/auth/me');
            const data = response.data;
            const normalized: User = {
                ...data,
                acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
            };
            setUser(normalized);
        } catch (error: any) {
            setUser(null);
            localStorage.removeItem('dosier_logged_in');
            localStorage.removeItem('dosier_logged_in');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        // Ejecución única al montar el proveedor
        refreshUser();
    }, [refreshUser]);

    const login = async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        const data = response.data;

        // Normalizar los roles para usar los códigos de roles (role_codes) en lugar de los nombres descriptivos.
        // Esto mantiene la coherencia entre el estado posterior al login y el obtenido al refrescar la página.
        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');
        return normalizedUser;
    };

    const loginWithMicrosoft = async (idToken: string) => {
        const response = await api.post('/auth/microsoft-login', { idToken });
        const data = response.data;

        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');
        return normalizedUser;
    };

    const magicLogin = async (token: string) => {
        const response = await api.post('/auth/magic-login', { token });
        const { auth, pin } = response.data;

        const normalizedUser: User = {
            ...auth,
            roles: auth.role_codes || auth.roles || [],
            role: auth.role_codes?.[0] || auth.role,
            acepto_lopdp: auth.acepto_lopdp !== undefined ? auth.acepto_lopdp : auth.aceptoLopdp
        };

        // Retornamos sin iniciar la sesión en este dispositivo de forma automática.
        // La sesión se establecerá explícitamente cuando el usuario confirme el acceso.
        return { user: normalizedUser, pin: pin || null, token: auth.token };
    };

    const confirmMagicLogin = async (user: User, token: string) => {
        await api.post('/auth/magic-confirm', { token });
        setUser(user);
        localStorage.setItem('dosier_logged_in', 'true');
    };

    const handoffLogin = async (pin: string) => {
        const response = await api.post('/auth/magic-handoff', { pin });
        const data = response.data;

        const normalizedUser: User = {
            ...data,
            roles: data.role_codes || data.roles || [],
            role: data.role_codes?.[0] || data.role,
            acepto_lopdp: data.acepto_lopdp !== undefined ? data.acepto_lopdp : data.aceptoLopdp
        };

        setUser(normalizedUser);
        localStorage.setItem('dosier_logged_in', 'true');
        return normalizedUser;
    };

    const logout = async () => {
        // 1. Limpieza local inmediata para que la UI responda al instante (milisegundos)
        setUser(null);
        localStorage.removeItem('dosier_logged_in');
        localStorage.removeItem('dosier_logged_in');
        localStorage.removeItem('web_push_active');

        // 2. Ejecutar desuscripción y logout en segundo plano de forma no bloqueante
        (async () => {
            try {
                const logoutTasks: Promise<any>[] = [];

                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    // getRegistration() no bloquea la ejecución si el service worker no está listo
                    const registration = await navigator.serviceWorker.getRegistration();
                    if (registration) {
                        const subscription = await registration.pushManager.getSubscription();
                        if (subscription) {
                            const subJson = subscription.toJSON();
                            const tokenString = `${subJson.endpoint}|${subJson.keys?.p256dh || ''}|${subJson.keys?.auth || ''}`;
                            logoutTasks.push(
                                api.post('/Admin/notifications/unsubscribe', { device_token: tokenString })
                                    .catch(e => console.error('Error unsubscribing push on server:', e))
                            );
                            logoutTasks.push(
                                subscription.unsubscribe()
                                    .catch(e => console.error('Error unsubscribing browser push:', e))
                            );
                        }
                    }
                }

                // Cierre de sesión en el backend
                logoutTasks.push(api.post('/auth/logout').catch(() => { }));

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
        if (isVicerrector) return 'Vicerrectorado Académico';
        if (isCoordAcad) return 'Coordinación Académica';
        if (isCoordCarrera) return 'Coordinador de Carrera';
        if (isAdmin) return 'Administrador Institucional';
        if (isDocente) return 'Docente Titular';
        return 'Usuario Institucional';
    }, [isVicerrector, isCoordAcad, isCoordCarrera, isAdmin, isDocente]);

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

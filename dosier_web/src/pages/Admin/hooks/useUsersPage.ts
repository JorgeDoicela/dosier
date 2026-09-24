import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usersService, type ManagedUserDto, type RoleDto } from '../../../services/usersService';

export type ManagedUser = ManagedUserDto;
export type Role = RoleDto;

export interface PendingUserDraft {
    type: 'edit';
    uuid: string;
    userName: string;
    timestamp: number;
}

export interface ConfirmDialog {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void | Promise<void>;
    type: 'danger' | 'warning' | 'info' | 'success';
}

export const useUsersPage = () => {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [search, setSearch] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const lastOpenedUuidRef = useRef<string | null>(null);
    const openedAtRef = useRef<number>(0);
    const isOverlayMouseDownRef = useRef(false);
    const typeParam = searchParams.get('type');
    const userType: 'DOCENTE' | 'ADMINISTRATIVO' = 
        (typeParam === 'ADMINISTRATIVO') ? 'ADMINISTRATIVO' : 'DOCENTE';
    const openUuid = searchParams.get('open');

    // Subfiltros de segmentación
    const [soloConHoras, setSoloConHoras] = useState(true);
    const [estadoEstudiante, setEstadoEstudiante] = useState<'ACTIVO' | 'GRADUADO' | 'TODOS'>('ACTIVO');
    const [origenEstudiante, setOrigenEstudiante] = useState<'INSTITUTO' | 'CONDUCCION' | 'TODOS'>('INSTITUTO');
    const [departamento, setDepartamento] = useState('');

    const setUserType = (type: 'DOCENTE' | 'ADMINISTRATIVO') => {
        setSearch('');
        setDetailUser(null);
        setPage(1);
        lastOpenedUuidRef.current = null;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set('type', type);
            next.delete('open');
            return next;
        });
    };

    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [pageSize] = useState(10);

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
    const [detailUser, setDetailUser] = useState<ManagedUser | null>(null);
    const [lastActiveUserId, setLastActiveUserId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Researcher/docente profile metadata draft states
    const [pendingUserDraft, setPendingUserDraft] = useState<PendingUserDraft | null>(null);

    const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                search,
                type: userType,
                page: String(page),
                pageSize: String(pageSize),
                soloConHoras: String(soloConHoras),
                estadoEstudiante,
                origenEstudiante,
                departamento
            });
            const data = await usersService.getUsers(params);
            const items: ManagedUser[] = data.items;
            setUsers(items);
            setTotalCount(data.total_count);
            setTotalPages(data.total_pages);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Deep-link from CommandPalette
    useEffect(() => {
        if (!openUuid) {
            lastOpenedUuidRef.current = null;
            return;
        }
        if (openUuid === lastOpenedUuidRef.current) return;
        lastOpenedUuidRef.current = openUuid; // Synchronous ref assignment to prevent race-conditions on fast re-renders
        let cancelled = false;

        const resolveOpenUser = async () => {
            try {
                const data = await usersService.getUsers(
                    `search=${encodeURIComponent(openUuid)}&type=${userType}&page=1&pageSize=5`
                );
                if (cancelled) return;

                const items: ManagedUser[] = data.items ?? [];
                const searchLower = openUuid.trim().toLowerCase();
                const target = items.find(
                    u => 
                        (u.id_profesor && u.id_profesor.trim().toLowerCase() === searchLower) ||
                        (u.user_uuid && u.user_uuid.trim().toLowerCase() === searchLower)
                ) ?? items[0];

                if (target) {
                    setDetailUser(target);
                    setSearch(target.id_profesor || target.nombre_completo);
                    setPage(1);
                    openedAtRef.current = Date.now();
                    setLastActiveUserId(null);
                }
            } catch (err) {
                console.error('[resolveOpenUser] Error en petición API:', err);
            }
        };

        resolveOpenUser();
        return () => { 
            cancelled = true; 
            lastOpenedUuidRef.current = null; // Permite que re-montajes de React StrictMode vuelvan a ejecutar la petición
        };
    }, [openUuid, userType]);

    const handleCloseDetail = () => {
        if (Date.now() - openedAtRef.current < 300) {
            return;
        }
        if (detailUser) {
            setLastActiveUserId(detailUser.id_profesor);
        }
        setDetailUser(null);
        lastOpenedUuidRef.current = null;
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.delete('open');
            return next;
        }, { replace: true });
    };

    const [availableDepartments, setAvailableDepartments] = useState<string[]>([]);

    const fetchRoles = async () => {
        try {
            const data = await usersService.getRoles();
            setRoles(data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const data = await usersService.getDepartments();
            setAvailableDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    useEffect(() => {
        fetchRoles();
        fetchDepartments();

        // Check researcher/docente draft
        const userMetaStr = localStorage.getItem('user_metadata_draft_metadata');
        if (userMetaStr) {
            try {
                setPendingUserDraft(JSON.parse(userMetaStr));
            } catch (e) {
                console.error("Error reading user draft metadata", e);
            }
        }
    }, []);

    // Researcher profile draft handlers
    const handleRestoreUserDraft = () => {
        if (!pendingUserDraft) return;
        const user = users.find(u => u.user_uuid === pendingUserDraft.uuid);
        if (user) {
            setSelectedUser(user);
        } else {
            // Partial user since UserProfileModal only needs uuid and name
            setSelectedUser({
                user_uuid: pendingUserDraft.uuid,
                nombre_completo: pendingUserDraft.userName,
                id_profesor: '',
                email: '',
                type: '',
                roles: [],
                role_codes: [],
                firma_habilitada: false
            } as any);
        }
    };

    const handleDiscardUserDraft = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Descartar Borrador de Perfil',
            message: '¿Está seguro de descartar el borrador guardado del perfil de usuario? Esta acción no se puede deshacer.',
            type: 'danger',
            onConfirm: () => {
                localStorage.removeItem('user_metadata_draft_metadata');
                if (pendingUserDraft?.uuid) {
                    localStorage.removeItem(`edit_user_metadata_draft_${pendingUserDraft.uuid}`);
                }
                setPendingUserDraft(null);
                setConfirmDialog(p => ({ ...p, isOpen: false }));
            }
        });
    };

    const toggleRole = async (userId: string, roleCode: string, hasRole: boolean) => {
        setUpdating(`${userId}-${roleCode}`);
        try {
            if (hasRole) {
                await usersService.revokeRole({ id_usuario: userId, role_code: roleCode, user_type: userType });
            } else {
                await usersService.assignRole({ id_usuario: userId, role_code: roleCode, user_type: userType });
            }
            await fetchUsers();
        } catch (error) {
            console.error('Error updating role:', error);
        } finally {
            setUpdating(null);
        }
    };

    const handleRoleToggle = (userId: string, userName: string, roleCode: string, roleName: string, hasRole: boolean) => {
        setConfirmDialog({
            isOpen: true,
            title: hasRole ? 'Revocar Rol' : 'Asignar Rol',
            message: hasRole
                ? `¿Está seguro de revocar el rol "${roleName}" al usuario "${userName}"?`
                : `¿Está seguro de asignar el rol "${roleName}" al usuario "${userName}"?`,
            type: hasRole ? 'danger' : 'success',
            onConfirm: async () => {
                await toggleRole(userId, roleCode, hasRole);
            }
        });
    };

    return {
        users,
        roles,
        search,
        setSearch,
        userType,
        setUserType,
        soloConHoras,
        setSoloConHoras,
        estadoEstudiante,
        setEstadoEstudiante,
        origenEstudiante,
        setOrigenEstudiante,
        departamento,
        setDepartamento,
        availableDepartments,
        page,
        setPage,
        pageSize,
        totalCount,
        totalPages,
        loading,
        updating,
        selectedUser,
        setSelectedUser,
        detailUser,
        setDetailUser,
        lastActiveUserId,
        setLastActiveUserId,
        error,
        setError,
        pendingUserDraft,
        setPendingUserDraft,
        confirmDialog,
        setConfirmDialog,
        searchInputRef,
        isOverlayMouseDownRef,
        fetchUsers,
        handleCloseDetail,
        handleRestoreUserDraft,
        handleDiscardUserDraft,
        handleRoleToggle
    };
};

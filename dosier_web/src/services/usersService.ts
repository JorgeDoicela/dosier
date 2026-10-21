import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface ManagedUserDto {
    id_profesor: string;
    nombre_completo: string;
    email: string;
    user_uuid: string;
    type: string;
    roles: string[];
    role_codes: string[];
    firma_habilitada: boolean;
    horas_docente?: number;
    horas_clase?: number;
    materias_asignadas?: number;
    catedras_asignadas?: number;
    tiene_carga_docente?: boolean;
    horas_investigacion?: number;
    horas_asignadas?: number;
    tiene_horas_investigacion?: boolean;
    departamento?: string;
    cargo_instituto?: string;
    tipo_contrato?: string;
    carrera?: string;
    nivel?: string;
    es_graduado?: boolean;
    es_instituto?: boolean;
}

export interface RoleDto {
    id_rol: number;
    nombre: string;
    codigo_rol: string;
}

export interface UserRoleActionDto {
    id_usuario: string;
    role_code: string;
    user_type: string;
}


export interface UsersQueryResponseDto {
    items: ManagedUserDto[];
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    [key: string]: any;
}

export interface UserMetadataDto {
    nombre: string;
    email: string;
    [key: string]: any;
}

export interface AutoridadInstitucionalDto {
    id_autoridad: number;
    id_sigafi: string;
    nombre_completo: string;
    cargo_curricular: string;
    email?: string;
    id_carrera?: number;
    carrera_nombre?: string;
    es_activo: boolean;
}

export interface DocenteCarreraResumenDto {
    id_profesor: string;
    nombre_completo: string;
    email?: string;
    horas_docente: number;
    materias_asignadas: number;
    roles: string[];
    es_coordinador: boolean;
}

export interface CarreraGobernanzaDto {
    id_carrera: number;
    carrera: string;
    alias_carrera?: string;
    resolucion?: string;
    coordinador?: AutoridadInstitucionalDto;
    total_docentes: number;
    total_materias: number;
    docentes: DocenteCarreraResumenDto[];
}

export interface GobernanzaCurricularDto {
    periodo_activo: string;
    vicerrector?: AutoridadInstitucionalDto;
    coordinador_academico?: AutoridadInstitucionalDto;
    carreras: CarreraGobernanzaDto[];
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Administración de Usuarios y Roles
// ─────────────────────────────────────────────────────────────

export const usersService = {
    /**
     * Obtiene la lista paginada y filtrada de usuarios institucionales.
     */
    getUsers: (queryStringOrParams: string | URLSearchParams): Promise<UsersQueryResponseDto> => {
        const query = queryStringOrParams.toString();
        const url = `/Admin/users${query ? `?${query}` : ''}`;
        return api.get(url).then(r => r.data);
    },

    /**
     * Obtiene el perfil detallado de un usuario por su UUID.
     */
    getUserByUuid: (uuid: string, type: string): Promise<ManagedUserDto> =>
        api.get(`/Admin/users/${encodeURIComponent(uuid)}?type=${encodeURIComponent(type)}`).then(r => r.data),

    /**
     * Obtiene el catálogo de roles curriculares e institucionales disponibles.
     */
    getRoles: (): Promise<RoleDto[]> =>
        api.get('/Admin/roles').then(r => r.data || []),

    /**
     * Obtiene la lista de departamentos académicos institucionales.
     */
    getDepartments: (): Promise<string[]> =>
        api.get('/Admin/departments').then(r => r.data || []),

    /**
     * Asigna un rol curricular a un usuario específico.
     */
    assignRole: (dto: UserRoleActionDto): Promise<{ message: string }> =>
        api.post('/Admin/roles/assign', dto).then(r => r.data),

    /**
     * Revoca un rol curricular previamente asignado a un usuario.
     */
    revokeRole: (dto: UserRoleActionDto): Promise<{ message: string }> =>
        api.post('/Admin/roles/revoke', dto).then(r => r.data),


    /**
     * Obtiene los metadatos editables de perfil de una cuenta de usuario.
     */
    getUserMetadata: (userUuid: string): Promise<UserMetadataDto> =>
        api.get(`/Admin/metadata/${encodeURIComponent(userUuid)}`).then(r => r.data),

    /**
     * Actualiza los metadatos de perfil de una cuenta de usuario.
     */
    updateUserMetadata: (userUuid: string, metadata: UserMetadataDto): Promise<{ message: string }> =>
        api.put(`/Admin/metadata/${encodeURIComponent(userUuid)}`, metadata).then(r => r.data),

    /**
     * Obtiene el árbol relacional completo de gobernanza curricular y carreras del instituto.
     */
    getGobernanzaCarreras: (periodo?: string): Promise<GobernanzaCurricularDto> => {
        const query = periodo ? `?idPeriodo=${encodeURIComponent(periodo)}` : '';
        return api.get(`/Admin/gobernanza-carreras${query}`).then(r => r.data);
    },
};

export default usersService;

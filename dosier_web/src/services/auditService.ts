import api from '../api/axios_config';

// ─────────────────────────────────────────────────────────────
//  Tipos y Contratos DTO
// ─────────────────────────────────────────────────────────────

export interface AuditLogDto {
    id: number;
    admin_name: string;
    action: string;
    details: string;
    date: string;
    ip_address?: string;
    user_agent?: string;
    modulo?: string;
    target_name?: string;
    snapshot_before?: string | null;
    snapshot_after?: string | null;
    [key: string]: any;
}

export interface PagedAuditResultDto {
    items: AuditLogDto[];
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
}

export interface AuditQueryParams {
    page?: number | string;
    pageSize?: number | string;
    search?: string;
    modulo?: string;
    action?: string;
    from?: string;
    to?: string;
}

// ─────────────────────────────────────────────────────────────
//  Servicio de Auditoría Forense y Trazabilidad
// ─────────────────────────────────────────────────────────────

export const auditService = {
    /**
     * Consulta la bitácora forense de auditoría con filtros avanzados y paginación.
     */
    getAuditLogs: (params: AuditQueryParams | URLSearchParams | string): Promise<PagedAuditResultDto> => {
        let queryString = '';
        if (typeof params === 'string') {
            queryString = params;
        } else if (params instanceof URLSearchParams) {
            queryString = params.toString();
        } else {
            const p = new URLSearchParams();
            if (params.page !== undefined) p.set('page', String(params.page));
            if (params.pageSize !== undefined) p.set('pageSize', String(params.pageSize));
            if (params.search) p.set('search', params.search);
            if (params.modulo) p.set('modulo', params.modulo);
            if (params.action) p.set('action', params.action);
            if (params.from) p.set('from', params.from);
            if (params.to) p.set('to', params.to);
            queryString = p.toString();
        }

        return api.get<PagedAuditResultDto>(`/Admin/audit/advanced${queryString ? `?${queryString}` : ''}`).then(r => r.data);
    },
};

export default auditService;

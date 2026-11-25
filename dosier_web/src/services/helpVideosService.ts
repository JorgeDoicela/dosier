import api, { getApiRootUrl } from '../api/axios_config';
import type { DosierRole, HelpVideoItem } from '../components/Layout/Help/types';

export const HELP_VIDEOS_CHANGED_EVENT = 'dosier-help-videos-changed';

export interface HelpVideoRecord extends HelpVideoItem {
    route_key: string;
    is_uploaded_file: boolean;
    file_name?: string;
    order: number;
    created_at?: string;
}

interface RawHelpVideoDto {
    id?: string;
    route_key?: string;
    routeKey?: string;
    title?: string;
    description?: string;
    duration?: string;
    url?: string;
    is_uploaded_file?: boolean;
    isUploadedFile?: boolean;
    file_name?: string;
    fileName?: string;
    roles?: string[];
    order?: number;
    created_at?: string;
    createdAt?: string;
}

export interface CreateHelpVideoPayload {
    routeKey: string;
    title: string;
    description?: string;
    duration?: string;
    url?: string;
    roles?: DosierRole[];
    archivo?: File | null;
}

export interface UpdateHelpVideoPayload {
    title: string;
    description?: string;
    duration?: string;
    url?: string;
    roles?: DosierRole[];
}

export const resolveHelpVideoMediaUrl = (rawUrl: string): string => {
    const clean = (rawUrl || '').trim();
    if (!clean) return '';
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    if (clean.startsWith('/api/')) {
        const root = getApiRootUrl();
        return root ? `${root}${clean}` : clean;
    }
    return clean;
};

const VALID_ROLES = new Set<DosierRole>([
    'admin',
    'docente',
    'coord_carrera',
    'coord_acad',
    'vicerrector',
    'todos'
]);

const mapVideoDto = (raw: RawHelpVideoDto): HelpVideoRecord => {
    const rawUrl = raw.url ?? '';
    const roles = (raw.roles ?? [])
        .map(r => r.trim().toLowerCase() as DosierRole)
        .filter(r => VALID_ROLES.has(r));

    return {
        id: raw.id ?? '',
        route_key: raw.route_key ?? raw.routeKey ?? '/',
        title: raw.title ?? 'Video tutorial',
        description: raw.description || undefined,
        duration: raw.duration || undefined,
        url: resolveHelpVideoMediaUrl(rawUrl),
        is_uploaded_file: Boolean(raw.is_uploaded_file ?? raw.isUploadedFile),
        file_name: raw.file_name ?? raw.fileName ?? undefined,
        roles: roles.length > 0 ? roles : undefined,
        order: raw.order ?? 0,
        created_at: raw.created_at ?? raw.createdAt
    };
};

export const helpVideosService = {
    async getByRoute(routeKey: string): Promise<HelpVideoRecord[]> {
        const res = await api.get<RawHelpVideoDto[]>('/help/videos', {
            params: { routeKey }
        });
        return Array.isArray(res.data) ? res.data.map(mapVideoDto) : [];
    },

    async getAllAdmin(): Promise<HelpVideoRecord[]> {
        const res = await api.get<RawHelpVideoDto[]>('/help/videos/admin');
        return Array.isArray(res.data) ? res.data.map(mapVideoDto) : [];
    },

    async create(payload: CreateHelpVideoPayload): Promise<HelpVideoRecord> {
        const formData = new FormData();
        formData.append('route_key', payload.routeKey);
        formData.append('title', payload.title.trim());
        if (payload.description?.trim()) {
            formData.append('description', payload.description.trim());
        }
        if (payload.duration?.trim()) {
            formData.append('duration', payload.duration.trim());
        }
        if (payload.roles && payload.roles.length > 0) {
            formData.append('roles', payload.roles.join(','));
        }
        if (payload.archivo) {
            formData.append('archivo', payload.archivo);
        } else if (payload.url?.trim()) {
            formData.append('url', payload.url.trim());
        }

        const res = await api.post<RawHelpVideoDto>('/help/videos', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        window.dispatchEvent(new CustomEvent(HELP_VIDEOS_CHANGED_EVENT));
        return mapVideoDto(res.data);
    },

    async update(routeKey: string, id: string, payload: UpdateHelpVideoPayload): Promise<HelpVideoRecord> {
        const res = await api.put<RawHelpVideoDto>(
            `/help/videos/${encodeURIComponent(id)}`,
            {
                title: payload.title.trim(),
                description: payload.description?.trim() || null,
                duration: payload.duration?.trim() || null,
                url: payload.url !== undefined ? payload.url.trim() : null,
                roles: payload.roles ?? []
            },
            { params: { routeKey } }
        );
        window.dispatchEvent(new CustomEvent(HELP_VIDEOS_CHANGED_EVENT));
        return mapVideoDto(res.data);
    },

    async reorder(routeKey: string, orderedIds: string[]): Promise<HelpVideoRecord[]> {
        const res = await api.put<RawHelpVideoDto[]>('/help/videos/reorder', {
            route_key: routeKey,
            ordered_ids: orderedIds
        });
        window.dispatchEvent(new CustomEvent(HELP_VIDEOS_CHANGED_EVENT));
        return Array.isArray(res.data) ? res.data.map(mapVideoDto) : [];
    },

    async remove(routeKey: string, id: string): Promise<void> {
        await api.delete(`/help/videos/${encodeURIComponent(id)}`, {
            params: { routeKey }
        });
        window.dispatchEvent(new CustomEvent(HELP_VIDEOS_CHANGED_EVENT));
    }
};

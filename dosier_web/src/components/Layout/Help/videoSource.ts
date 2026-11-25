export type VideoEmbedProvider = 'youtube' | 'vimeo' | 'gdrive' | 'loom';

export type ResolvedVideoSource =
    | { kind: 'native'; src: string }
    | { kind: 'embed'; src: string; provider: VideoEmbedProvider }
    | { kind: 'external'; src: string }
    | { kind: 'invalid' };

const NATIVE_VIDEO_EXT_RE = /\.(mp4|webm|ogg|m4v|mov)(\?.*)?(#.*)?$/i;

const isSafeUrl = (rawUrl: string): boolean => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return false;
    if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
    try {
        const parsed = new URL(trimmed);
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
        return false;
    }
};

const extractYouTubeId = (url: URL): string | null => {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'youtu.be') {
        const id = url.pathname.split('/').filter(Boolean)[0];
        return id && /^[a-zA-Z0-9_-]{6,20}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        if (url.pathname === '/watch') {
            const v = url.searchParams.get('v');
            return v && /^[a-zA-Z0-9_-]{6,20}$/.test(v) ? v : null;
        }
        const segments = url.pathname.split('/').filter(Boolean);
        if ((segments[0] === 'embed' || segments[0] === 'shorts') && segments[1]) {
            return /^[a-zA-Z0-9_-]{6,20}$/.test(segments[1]) ? segments[1] : null;
        }
    }
    return null;
};

const extractVimeoId = (url: URL): string | null => {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return null;
    const segments = url.pathname.split('/').filter(Boolean);
    const candidate = segments[segments[0] === 'video' ? 1 : 0];
    return candidate && /^\d{5,15}$/.test(candidate) ? candidate : null;
};

const extractGoogleDriveId = (url: URL): string | null => {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'drive.google.com') return null;
    const match = url.pathname.match(/^\/file\/d\/([a-zA-Z0-9_-]{10,80})(?:\/|$)/);
    return match ? match[1] : null;
};

const extractLoomId = (url: URL): string | null => {
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    if (host !== 'loom.com') return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if ((segments[0] === 'share' || segments[0] === 'embed') && segments[1]) {
        return /^[a-zA-Z0-9]{16,40}$/.test(segments[1]) ? segments[1] : null;
    }
    return null;
};

/**
 * Resuelve de forma segura la fuente de video para reproducir archivos locales,
 * enlaces embebibles (YouTube, Vimeo, Google Drive, Loom) o enlaces externos validados.
 */
export const resolveVideoSource = (rawUrl: string): ResolvedVideoSource => {
    const trimmed = rawUrl.trim();
    if (!isSafeUrl(trimmed)) {
        return { kind: 'invalid' };
    }

    if (trimmed.startsWith('/') || NATIVE_VIDEO_EXT_RE.test(trimmed)) {
        return { kind: 'native', src: trimmed };
    }

    try {
        const parsed = new URL(trimmed);

        const ytId = extractYouTubeId(parsed);
        if (ytId) {
            return {
                kind: 'embed',
                provider: 'youtube',
                src: `https://www.youtube-nocookie.com/embed/${ytId}?rel=0`
            };
        }

        const vimeoId = extractVimeoId(parsed);
        if (vimeoId) {
            return {
                kind: 'embed',
                provider: 'vimeo',
                src: `https://player.vimeo.com/video/${vimeoId}`
            };
        }

        const driveId = extractGoogleDriveId(parsed);
        if (driveId) {
            return {
                kind: 'embed',
                provider: 'gdrive',
                src: `https://drive.google.com/file/d/${driveId}/preview`
            };
        }

        const loomId = extractLoomId(parsed);
        if (loomId) {
            return {
                kind: 'embed',
                provider: 'loom',
                src: `https://www.loom.com/embed/${loomId}`
            };
        }

        return { kind: 'external', src: parsed.toString() };
    } catch {
        return { kind: 'invalid' };
    }
};

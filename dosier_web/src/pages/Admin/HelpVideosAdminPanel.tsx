import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HELP_MAP } from '../../components/Layout/Help/configs';
import type { DosierRole } from '../../components/Layout/Help/types';
import { helpVideosService, type HelpVideoRecord } from '../../services/helpVideosService';
import { GeistSelect } from '../../components/Common/GeistSelect';
import { useNotifications } from '../../api/NotificationsContext';
import { useConfirm } from '../../api/ConfirmContext';

const ROLE_OPTIONS: Array<{ value: DosierRole; label: string }> = [
    { value: 'docente', label: 'Docente' },
    { value: 'coord_carrera', label: 'Coord. Carrera' },
    { value: 'coord_acad', label: 'Coord. Académica' },
    { value: 'vicerrector', label: 'Vicerrector' },
    { value: 'admin', label: 'Administrador' }
];

const ROUTE_OPTIONS = Object.entries(HELP_MAP)
    .filter(([route]) => route !== '/parametros-normativos')
    .map(([route, cfg]) => ({
        value: route,
        label: `${cfg.title} (${route})`
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

export const HelpVideosAdminPanel: React.FC = () => {
    const { addToast } = useNotifications();
    const confirm = useConfirm();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [videos, setVideos] = useState<HelpVideoRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [filterRoute, setFilterRoute] = useState<string>('todas');

    // Formulario de nuevo video
    const [routeKey, setRouteKey] = useState<string>('/dashboard');
    const [sourceType, setSourceType] = useState<'file' | 'url'>('file');
    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [duration, setDuration] = useState<string>('');
    const [url, setUrl] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedRoles, setSelectedRoles] = useState<DosierRole[]>([]);

    // Edición en línea y reordenamiento
    const [editingKey, setEditingKey] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState<string>('');
    const [editDescription, setEditDescription] = useState<string>('');
    const [editDuration, setEditDuration] = useState<string>('');
    const [editUrl, setEditUrl] = useState<string>('');
    const [editRoles, setEditRoles] = useState<DosierRole[]>([]);
    const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
    const [isReordering, setIsReordering] = useState<boolean>(false);

    const loadVideos = async () => {
        setIsLoading(true);
        try {
            const list = await helpVideosService.getAllAdmin();
            setVideos(list);
        } catch (err) {
            console.error('[HelpVideosAdminPanel] Error cargando videos:', err);
            addToast('Error', 'No se pudo cargar el catálogo de videos de ayuda.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadVideos();
    }, []);

    const routeLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const [route, cfg] of Object.entries(HELP_MAP)) {
            map[route] = cfg.title;
        }
        return map;
    }, []);

    const filteredVideos = useMemo(() => {
        if (filterRoute === 'todas') return videos;
        return videos.filter(v => v.route_key === filterRoute);
    }, [videos, filterRoute]);

    const toggleRole = (role: DosierRole) => {
        setSelectedRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDuration('');
        setUrl('');
        setSelectedFile(null);
        setSelectedRoles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            addToast('Título requerido', 'Ingresa un título descriptivo para el video.', 'warning');
            return;
        }
        if (sourceType === 'file' && !selectedFile) {
            addToast('Archivo requerido', 'Selecciona un archivo de video (.mp4 o .webm).', 'warning');
            return;
        }
        if (sourceType === 'url' && !url.trim()) {
            addToast('Enlace requerido', 'Ingresa la URL del video (YouTube, Drive, Vimeo o Loom).', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const created = await helpVideosService.create({
                routeKey,
                title: title.trim(),
                description: description.trim() || undefined,
                duration: duration.trim() || undefined,
                url: sourceType === 'url' ? url.trim() : undefined,
                archivo: sourceType === 'file' ? selectedFile : null,
                roles: selectedRoles
            });
            setVideos(prev => [...prev, created]);
            resetForm();
            addToast('Video publicado', `Se agregó "${created.title}" a la guía del módulo.`, 'success');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            const msg = axiosErr?.response?.data?.message || 'No se pudo guardar el video.';
            addToast('Error al guardar', msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (video: HelpVideoRecord) => {
        const ok = await confirm({
            title: 'Eliminar video de ayuda',
            message: `¿Deseas eliminar "${video.title}" del módulo ${routeLabelMap[video.route_key] || video.route_key}?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            variant: 'destructive'
        });
        if (!ok) return;

        try {
            await helpVideosService.remove(video.route_key, video.id);
            setVideos(prev => prev.filter(v => !(v.id === video.id && v.route_key === video.route_key)));
            if (editingKey === `${video.route_key}-${video.id}`) {
                setEditingKey(null);
            }
            addToast('Video eliminado', 'El video fue retirado de la guía contextual.', 'success');
        } catch (err) {
            console.error('[HelpVideosAdminPanel] Error eliminando video:', err);
            addToast('Error', 'No se pudo eliminar el video.', 'error');
        }
    };

    const startEdit = (video: HelpVideoRecord) => {
        setEditingKey(`${video.route_key}-${video.id}`);
        setEditTitle(video.title);
        setEditDescription(video.description || '');
        setEditDuration(video.duration || '');
        setEditUrl(video.is_uploaded_file ? '' : video.url);
        setEditRoles((video.roles || []).filter(r => r !== 'todos'));
    };

    const toggleEditRole = (role: DosierRole) => {
        setEditRoles(prev =>
            prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
        );
    };

    const handleSaveEdit = async (video: HelpVideoRecord) => {
        if (!editTitle.trim()) {
            addToast('Título requerido', 'Ingresa un título descriptivo para el video.', 'warning');
            return;
        }
        if (!video.is_uploaded_file && !editUrl.trim()) {
            addToast('Enlace requerido', 'Ingresa una URL válida para el video.', 'warning');
            return;
        }

        setIsSavingEdit(true);
        try {
            const updated = await helpVideosService.update(video.route_key, video.id, {
                title: editTitle.trim(),
                description: editDescription.trim() || undefined,
                duration: editDuration.trim() || undefined,
                url: video.is_uploaded_file ? undefined : editUrl.trim(),
                roles: editRoles
            });
            setVideos(prev =>
                prev.map(v => (v.id === video.id && v.route_key === video.route_key ? updated : v))
            );
            setEditingKey(null);
            addToast('Video actualizado', `Se guardaron los cambios en "${updated.title}".`, 'success');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            addToast('Error al actualizar', axiosErr?.response?.data?.message || 'No se pudo actualizar el video.', 'error');
        } finally {
            setIsSavingEdit(false);
        }
    };

    const handleMove = async (video: HelpVideoRecord, direction: -1 | 1) => {
        const routeVideos = videos
            .filter(v => v.route_key === video.route_key)
            .sort((a, b) => a.order - b.order);
        const idx = routeVideos.findIndex(v => v.id === video.id);
        const targetIdx = idx + direction;
        if (idx < 0 || targetIdx < 0 || targetIdx >= routeVideos.length) return;

        const nextOrder = [...routeVideos];
        const [moved] = nextOrder.splice(idx, 1);
        nextOrder.splice(targetIdx, 0, moved);

        setIsReordering(true);
        try {
            const reordered = await helpVideosService.reorder(
                video.route_key,
                nextOrder.map(v => v.id)
            );
            setVideos(prev => {
                const others = prev.filter(v => v.route_key !== video.route_key);
                return [...others, ...reordered].sort((a, b) =>
                    a.route_key.localeCompare(b.route_key) || a.order - b.order
                );
            });
        } catch (err) {
            console.error('[HelpVideosAdminPanel] Error reordenando videos:', err);
            addToast('Error', 'No se pudo actualizar el orden de los videos.', 'error');
        } finally {
            setIsReordering(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Formulario para agregar video */}
            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            Agregar video tutorial
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Sube un archivo MP4/WebM o vincula un enlace externo para cualquier pantalla de DOSIER.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5" role="group" aria-label="Origen del video">
                        <button
                            type="button"
                            onClick={() => setSourceType('file')}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                                sourceType === 'file'
                                    ? 'bg-[#0070f3] text-white border-[#0070f3] font-semibold'
                                    : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 font-medium'
                            }`}
                        >
                            Subir archivo
                        </button>
                        <button
                            type="button"
                            onClick={() => setSourceType('url')}
                            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors cursor-pointer ${
                                sourceType === 'url'
                                    ? 'bg-[#0070f3] text-white border-[#0070f3] font-semibold'
                                    : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 font-medium'
                            }`}
                        >
                            Enlace externo
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                            Pantalla / Módulo
                        </label>
                        <GeistSelect
                            value={routeKey}
                            onChange={(val) => setRouteKey(String(val))}
                            options={ROUTE_OPTIONS}
                            placeholder="Selecciona una pantalla..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                            Título del video
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej. Cómo elaborar y enviar el PEA"
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                            {sourceType === 'file' ? 'Archivo de video (máx. 80 MB)' : 'URL del video (YouTube, Drive, Vimeo, Loom)'}
                        </label>
                        {sourceType === 'file' ? (
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg,.m4v,.mov"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-700 dark:text-zinc-300 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 dark:file:bg-zinc-800 dark:file:text-zinc-200 cursor-pointer"
                            />
                        ) : (
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3]"
                            />
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                            Duración (opcional)
                        </label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Ej. 02:45"
                            className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                        Descripción breve (opcional)
                    </label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Resumen corto de lo que explica este video"
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3]"
                    />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                            Visible para:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedRoles([])}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                                selectedRoles.length === 0
                                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                            }`}
                        >
                            Todos los roles
                        </button>
                        {ROLE_OPTIONS.map(r => {
                            const active = selectedRoles.includes(r.value);
                            return (
                                <button
                                    key={r.value}
                                    type="button"
                                    onClick={() => toggleRole(r.value)}
                                    className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                                        active
                                            ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 font-medium'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] disabled:opacity-50 transition-colors cursor-pointer shrink-0"
                    >
                        {isSubmitting ? 'Guardando...' : 'Publicar video'}
                    </button>
                </div>
            </form>

            {/* Catálogo de videos publicados */}
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                            Videos publicados ({filteredVideos.length})
                        </h3>
                    </div>
                    <div className="w-full sm:w-72">
                        <GeistSelect
                            value={filterRoute}
                            onChange={(val) => setFilterRoute(String(val))}
                            options={[
                                { value: 'todas', label: 'Todas las pantallas' },
                                ...ROUTE_OPTIONS
                            ]}
                            placeholder="Filtrar por pantalla..."
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="space-y-2.5 py-2">
                        <div className="h-12 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                        <div className="h-12 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                    </div>
                ) : filteredVideos.length === 0 ? (
                    <p className="py-8 text-center text-xs text-slate-500 dark:text-zinc-400">
                        No hay videos registrados para este filtro.
                    </p>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                        {filteredVideos.map(video => {
                            const rowKey = `${video.route_key}-${video.id}`;
                            const isEditing = editingKey === rowKey;
                            const sameRouteList = videos
                                .filter(v => v.route_key === video.route_key)
                                .sort((a, b) => a.order - b.order);
                            const posInRoute = sameRouteList.findIndex(v => v.id === video.id);
                            const canMoveUp = sameRouteList.length > 1 && posInRoute > 0;
                            const canMoveDown = sameRouteList.length > 1 && posInRoute >= 0 && posInRoute < sameRouteList.length - 1;

                            if (isEditing) {
                                return (
                                    <div key={rowKey} className="py-4 space-y-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg px-4 my-2 border border-slate-200 dark:border-zinc-800">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                                    Título
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editTitle}
                                                    onChange={(e) => setEditTitle(e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                                    Duración
                                                </label>
                                                <input
                                                    type="text"
                                                    value={editDuration}
                                                    onChange={(e) => setEditDuration(e.target.value)}
                                                    placeholder="Ej. 02:45"
                                                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                                />
                                            </div>
                                        </div>

                                        {!video.is_uploaded_file && (
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                                    URL del video
                                                </label>
                                                <input
                                                    type="url"
                                                    value={editUrl}
                                                    onChange={(e) => setEditUrl(e.target.value)}
                                                    className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-1">
                                            <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                                                Descripción breve
                                            </label>
                                            <input
                                                type="text"
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditRoles([])}
                                                    className={`px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                                                        editRoles.length === 0
                                                            ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                                                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 font-medium'
                                                    }`}
                                                >
                                                    Todos
                                                </button>
                                                {ROLE_OPTIONS.map(r => (
                                                    <button
                                                        key={r.value}
                                                        type="button"
                                                        onClick={() => toggleEditRole(r.value)}
                                                        className={`px-2 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                                                            editRoles.includes(r.value)
                                                                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                                                                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-zinc-800 font-medium'
                                                        }`}
                                                    >
                                                        {r.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingKey(null)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 cursor-pointer"
                                                >
                                                    Cancelar
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={isSavingEdit}
                                                    onClick={() => handleSaveEdit(video)}
                                                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] disabled:opacity-50 cursor-pointer"
                                                >
                                                    {isSavingEdit ? 'Guardando...' : 'Guardar'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={rowKey}
                                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                            <span>{routeLabelMap[video.route_key] || video.route_key}</span>
                                            <span>·</span>
                                            <span>{video.is_uploaded_file ? 'Archivo subido' : 'Enlace externo'}</span>
                                            {video.duration && (
                                                <>
                                                    <span>·</span>
                                                    <span>{video.duration}</span>
                                                </>
                                            )}
                                            {video.roles && video.roles.length > 0 && (
                                                <>
                                                    <span>·</span>
                                                    <span>{video.roles.join(', ')}</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                            {video.title}
                                        </p>
                                        {video.description && (
                                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                                                {video.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {sameRouteList.length > 1 && (
                                            <>
                                                <button
                                                    type="button"
                                                    disabled={!canMoveUp || isReordering}
                                                    onClick={() => handleMove(video, -1)}
                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-35 cursor-pointer"
                                                >
                                                    Subir
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={!canMoveDown || isReordering}
                                                    onClick={() => handleMove(video, 1)}
                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 disabled:opacity-35 cursor-pointer"
                                                >
                                                    Bajar
                                                </button>
                                            </>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => startEdit(video)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                        >
                                            Editar
                                        </button>
                                        <a
                                            href={video.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors no-underline"
                                        >
                                            Abrir
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(video)}
                                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 transition-colors cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

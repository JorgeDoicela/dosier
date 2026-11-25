import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import type { HelpVideoItem } from './types';
import { resolveVideoSource } from './videoSource';

interface HelpVideoPanelProps {
    moduleTitle: string;
    videos: HelpVideoItem[];
    isLoading?: boolean;
    onBackToGuide: () => void;
}

export const HelpVideoPanel: React.FC<HelpVideoPanelProps> = ({
    moduleTitle,
    videos,
    isLoading = false,
    onBackToGuide
}) => {
    const [selectedId, setSelectedId] = useState<string>(videos[0]?.id ?? '');
    const [query, setQuery] = useState<string>('');
    const [hasLoadError, setHasLoadError] = useState<boolean>(false);

    useEffect(() => {
        setSelectedId(videos[0]?.id ?? '');
        setQuery('');
        setHasLoadError(false);
    }, [videos]);

    const filteredVideos = useMemo(() => {
        const clean = query.trim().toLowerCase();
        if (!clean) return videos;
        return videos.filter(v =>
            v.title.toLowerCase().includes(clean) ||
            (v.description?.toLowerCase().includes(clean) ?? false)
        );
    }, [videos, query]);

    if (isLoading && videos.length === 0) {
        return (
            <div className="flex-1 min-h-[380px] px-7 py-8 flex flex-col items-center justify-center bg-white dark:bg-zinc-950">
                <div className="w-full max-w-xl space-y-3">
                    <div className="w-full aspect-video rounded-xl bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                    <div className="h-3.5 w-48 rounded bg-slate-100 dark:bg-zinc-900 animate-pulse" />
                </div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex-1 min-h-[380px] px-7 py-10 flex flex-col items-center justify-center text-center bg-white dark:bg-zinc-950">
                <div className="max-w-sm space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Sin videos registrados
                    </h4>
                    <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                        Todavía no hay videotutoriales cargados para {moduleTitle}. Puedes consultar el recorrido visual mientras se publican.
                    </p>
                    <button
                        type="button"
                        onClick={onBackToGuide}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                    >
                        Volver a guía visual
                    </button>
                </div>
            </div>
        );
    }

    const activeVideo =
        filteredVideos.find(v => v.id === selectedId) ||
        filteredVideos[0] ||
        videos[0];
    const resolved = resolveVideoSource(activeVideo.url);
    const hasMultiple = videos.length > 1;
    const showSearch = videos.length >= 5;

    return (
        <div
            data-testid="help-video-panel"
            className="flex-1 overflow-y-auto custom-scrollbar min-h-[380px] px-7 py-5 flex flex-col md:flex-row gap-6 bg-white dark:bg-zinc-950"
        >
            {hasMultiple && (
                <div className="w-full md:w-[34%] flex flex-col gap-2 shrink-0">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                            Videos disponibles
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                            {filteredVideos.length}
                        </span>
                    </div>

                    {showSearch && (
                        <div className="relative">
                            <Search
                                size={13}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Filtrar videos..."
                                aria-label="Filtrar videos"
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3]"
                            />
                        </div>
                    )}

                    <div className="space-y-1 md:max-h-[340px] md:overflow-y-auto custom-scrollbar pr-0.5">
                        {filteredVideos.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 py-4 text-center">
                                Sin coincidencias para "{query}".
                            </p>
                        ) : (
                            filteredVideos.map((video, idx) => {
                                const isSelected = video.id === activeVideo.id;
                                return (
                                    <button
                                        key={video.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedId(video.id);
                                            setHasLoadError(false);
                                        }}
                                        className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors cursor-pointer flex items-start gap-2.5 ${isSelected
                                            ? 'bg-slate-50 dark:bg-zinc-900'
                                            : 'hover:bg-slate-50/70 dark:hover:bg-zinc-900/50'
                                            }`}
                                    >
                                        <span
                                            className={`text-[11px] font-mono font-semibold shrink-0 pt-0.5 ${isSelected
                                                ? 'text-[#0070f3] dark:text-blue-400'
                                                : 'text-slate-400 dark:text-zinc-500'
                                                }`}
                                        >
                                            {String(idx + 1).padStart(2, '0')}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-semibold leading-snug ${isSelected
                                                ? 'text-[#0070f3] dark:text-blue-400'
                                                : 'text-slate-900 dark:text-zinc-100'
                                                }`}>
                                                {video.title}
                                            </p>
                                            {video.duration && (
                                                <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                                                    {video.duration}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col justify-center gap-3 min-w-0">
                <div className="w-full aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 bg-zinc-950 flex items-center justify-center">
                    {resolved.kind === 'invalid' || hasLoadError ? (
                        <div className="p-6 text-center space-y-2">
                            <p className="text-xs font-semibold text-zinc-200">
                                No se pudo cargar este video
                            </p>
                            <p className="text-[11px] text-zinc-400">
                                Verifica que el archivo o enlace configurado siga disponible.
                            </p>
                        </div>
                    ) : resolved.kind === 'native' ? (
                        <video
                            key={resolved.src}
                            src={resolved.src}
                            poster={activeVideo.poster}
                            controls
                            preload="metadata"
                            playsInline
                            onError={() => setHasLoadError(true)}
                            className="w-full h-full object-contain bg-zinc-950"
                        />
                    ) : resolved.kind === 'embed' ? (
                        <iframe
                            key={resolved.src}
                            src={resolved.src}
                            title={activeVideo.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0 bg-zinc-950"
                        />
                    ) : (
                        <div className="p-6 text-center space-y-3">
                            <p className="text-xs text-zinc-300">
                                Este tutorial está alojado en un enlace externo.
                            </p>
                            <a
                                href={resolved.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors no-underline"
                            >
                                Abrir video
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                            {activeVideo.title}
                        </h4>
                        {activeVideo.description && (
                            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                {activeVideo.description}
                            </p>
                        )}
                    </div>
                    {!hasMultiple && activeVideo.duration && (
                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 shrink-0 pt-0.5">
                            {activeVideo.duration}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

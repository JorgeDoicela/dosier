import React, { useState } from 'react';
import { Play, ImageOff, VideoOff, Maximize2 } from 'lucide-react';
import { getFeedbackMediaUrl, type FeedbackAdjunto } from '../../../services/feedbackService';

interface FeedbackMediaThumbnailItemProps {
    adjunto: FeedbackAdjunto;
    onClick: () => void;
}

const FeedbackMediaThumbnailItem: React.FC<FeedbackMediaThumbnailItemProps> = ({ adjunto, onClick }) => {
    const [loaded, setLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const mime = adjunto.tipo_mime || adjunto.tipoMime || '';
    const isVideo = mime.startsWith('video/');
    const mediaUrl = getFeedbackMediaUrl(adjunto.url);
    const fileName = adjunto.nombre_original || adjunto.nombreOriginal || 'Adjunto';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`h-20 sm:h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-400 transition-colors group relative cursor-pointer inline-flex items-center justify-center p-0 bg-zinc-100 dark:bg-zinc-900 shrink-0 ${
                !loaded || hasError || !mediaUrl ? 'w-28 sm:w-36' : 'w-auto max-w-[240px]'
            }`}
            title={fileName}
        >
            {!loaded && !hasError && mediaUrl && (
                <div className="absolute inset-0 bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            )}

            {hasError || !mediaUrl ? (
                <div className="flex flex-col items-center justify-center gap-1 px-2 text-center text-slate-400 dark:text-zinc-500">
                    {isVideo ? <VideoOff size={16} /> : <ImageOff size={16} />}
                    <span className="text-[10px] font-medium leading-tight">No disponible</span>
                </div>
            ) : isVideo ? (
                <div className="relative h-full w-full flex items-center justify-center bg-zinc-950">
                    <video
                        src={mediaUrl}
                        className={`h-full w-auto max-w-[240px] object-contain block transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        muted
                        preload="metadata"
                        onLoadedData={() => setLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    <div className="absolute inset-0 bg-black/35 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 flex items-center justify-center text-slate-900 dark:text-zinc-100 shadow-sm">
                            <Play size={11} className="ml-0.5" />
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-zinc-900/90 text-white text-[9px] font-mono">
                        Video
                    </div>
                </div>
            ) : (
                <>
                    <img
                        src={mediaUrl}
                        alt={fileName}
                        className={`h-full w-auto max-w-[240px] block transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setLoaded(true)}
                        onError={() => setHasError(true)}
                    />
                    {loaded && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded bg-zinc-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Maximize2 size={10} />
                        </div>
                    )}
                </>
            )}
        </button>
    );
};

interface FeedbackMediaThumbnailsProps {
    archivos?: FeedbackAdjunto[];
    onSelect: (index: number) => void;
    className?: string;
}

export const FeedbackMediaThumbnails: React.FC<FeedbackMediaThumbnailsProps> = ({
    archivos,
    onSelect,
    className = 'flex items-center gap-2.5 overflow-x-auto pb-1 pt-2 custom-scrollbar'
}) => {
    if (!archivos || archivos.length === 0) return null;

    return (
        <div className={className}>
            {archivos.map((adj, idx) => (
                <FeedbackMediaThumbnailItem
                    key={`${adj.url}-${idx}`}
                    adjunto={adj}
                    onClick={() => onSelect(idx)}
                />
            ))}
        </div>
    );
};


import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, ChevronLeft, ChevronRight, Video, Image as ImageIcon,
    Trash2, Monitor, Cpu, Wifi, Globe, Terminal, Copy, Check,
    Layers
} from 'lucide-react';
import { useAuth } from '../../../api/AuthContext';
import { 
    getFeedbackMediaUrl, 
    type FeedbackReporte, 
    type FeedbackAdjunto 
} from '../../../services/feedbackService';
import { ESTADO_ROW_OPTIONS } from './FeedbackBadges';
import { GeistSelect } from '../../../components/Common/GeistSelect';

interface DeviceDiagnosticMetadata {
    browser?: string;
    os?: string;
    url?: string;
    pathname?: string;
    screen?: string;
    viewport?: string;
    devicePixelRatio?: number | string;
    language?: string;
    isOnline?: boolean;
    connectionType?: string;
    deviceMemoryGB?: string;
    hardwareConcurrency?: string;
    userAgent?: string;
    timestamp?: string;
    userRef?: string;
    userName?: string;
    userRole?: string;
    [key: string]: any;
}

interface FeedbackDetailDrawerProps {
    report: FeedbackReporte | null;
    initialMediaIndex?: number;
    isAdmin?: boolean;
    onClose: () => void;
    onStatusChange?: (id: number, nuevoEstado: string) => Promise<void>;
    onDeleteClick?: (report: FeedbackReporte) => void;
    onReportUpdated?: (updated: FeedbackReporte) => void;
}

const parseMetadata = (raw?: any): DeviceDiagnosticMetadata | null => {
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

export const FeedbackDetailDrawer: React.FC<FeedbackDetailDrawerProps> = ({
    report,
    initialMediaIndex = 0,
    isAdmin = false,
    onClose,
    onStatusChange,
    onDeleteClick,
    onReportUpdated
}) => {
    const { user } = useAuth();
    const isDosierAdmin = isAdmin || user?.roles?.includes('DOSIER_ADMIN') || user?.roles?.includes('ADMINISTRADOR');
    const [activeMediaIndex, setActiveMediaIndex] = useState<number>(initialMediaIndex);
    const [dragOffset, setDragOffset] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [copiedDiag, setCopiedDiag] = useState<boolean>(false);
    const [showFullUa, setShowFullUa] = useState<boolean>(false);
    const dragStartX = useRef<number | null>(null);

    useEffect(() => {
        setActiveMediaIndex(initialMediaIndex);
        setDragOffset(0);
        setIsDragging(false);
        setCopiedDiag(false);
        setShowFullUa(false);
    }, [initialMediaIndex, report]);

    useEffect(() => {
        if (!report) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowLeft') {
                const total = report.archivos?.length || 0;
                if (total > 1) {
                    e.preventDefault();
                    setActiveMediaIndex(prev => (prev > 0 ? prev - 1 : total - 1));
                }
            } else if (e.key === 'ArrowRight') {
                const total = report.archivos?.length || 0;
                if (total > 1) {
                    e.preventDefault();
                    setActiveMediaIndex(prev => (prev < total - 1 ? prev + 1 : 0));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [report, onClose]);

    if (!report) return null;

    const reportId = report.id_feedback || report.idFeedback || 0;
    const activeFiles = report.archivos || [];
    const currentMedia: FeedbackAdjunto | null = activeFiles.length > 0 ? activeFiles[activeMediaIndex] || activeFiles[0] : null;
    const isCurrentVideo = Boolean(currentMedia && (currentMedia.tipo_mime || currentMedia.tipoMime || '').startsWith('video/'));
    const currentMediaUrl = currentMedia ? getFeedbackMediaUrl(currentMedia.url) : '';

    const meta = parseMetadata(report.metadata_navegador || report.metadataNavegador);

    const handlePointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('button, video, a, input')) return;
        if (activeFiles.length <= 1) return;
        dragStartX.current = e.clientX;
        setIsDragging(true);
        try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {}
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging || dragStartX.current === null) return;
        const deltaX = e.clientX - dragStartX.current;
        setDragOffset(deltaX);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging || dragStartX.current === null) return;
        const deltaX = e.clientX - dragStartX.current;
        const threshold = 40;

        if (deltaX > threshold) {
            setActiveMediaIndex(prev => (prev > 0 ? prev - 1 : activeFiles.length - 1));
        } else if (deltaX < -threshold) {
            setActiveMediaIndex(prev => (prev < activeFiles.length - 1 ? prev + 1 : 0));
        }

        setIsDragging(false);
        setDragOffset(0);
        dragStartX.current = null;
        try {
            (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {}
    };

    const handlePointerCancel = () => {
        setIsDragging(false);
        setDragOffset(0);
        dragStartX.current = null;
    };

    const handleCopyDiagnostic = () => {
        const diagData = {
            id_reporte: reportId,
            titulo: report.titulo,
            usuario: report.nombre_usuario || report.nombreUsuario,
            rol: report.rol_usuario || report.rolUsuario,
            cedula: report.cedula,
            ruta_origen: report.ruta_origen || report.rutaOrigen || meta?.pathname,
            diagnostico_maquina: meta
        };

        navigator.clipboard.writeText(JSON.stringify(diagData, null, 2));
        setCopiedDiag(true);
        setTimeout(() => setCopiedDiag(false), 2000);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label={`Visor de adjuntos: ${report.titulo}`}
        >
            <div
                className="absolute inset-0 bg-black/60 cursor-pointer animate-fade-in"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg sm:max-w-xl lg:max-w-2xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0">
                            {isCurrentVideo ? <Video size={16} /> : <ImageIcon size={16} />}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-[13.5px] font-semibold text-text-main truncate">
                                {isCurrentVideo ? 'Video Adjunto' : 'Captura Adjunta'}
                            </h3>
                            {activeFiles.length > 1 && (
                                <p className="text-[11px] font-mono text-text-dim">
                                    Archivo {activeMediaIndex + 1} de {activeFiles.length}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        {isDosierAdmin && onDeleteClick && (
                            <button
                                type="button"
                                onClick={() => onDeleteClick(report)}
                                className="px-2.5 py-1 text-[11px] font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-1.5 cursor-pointer"
                                title="Eliminar reporte permanentemente"
                            >
                                <Trash2 size={12} />
                                <span>Eliminar</span>
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Cerrar [ESC]"
                            aria-label="Cerrar panel"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar gap-4 bg-white dark:bg-zinc-950">
                    {/* Área Principal de la Imagen / Video */}
                    {currentMedia ? (
                        <div 
                            onPointerDown={handlePointerDown}
                            onPointerMove={handlePointerMove}
                            onPointerUp={handlePointerUp}
                            onPointerCancel={handlePointerCancel}
                            className="relative w-full aspect-video rounded-xl bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center touch-none select-none"
                            style={{
                                transform: isDragging ? `translateX(${dragOffset}px)` : 'translateX(0)',
                                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
                            }}
                        >
                            {isCurrentVideo ? (
                                <video 
                                    src={currentMediaUrl} 
                                    controls 
                                    autoPlay 
                                    className="max-h-full max-w-full object-contain"
                                />
                            ) : (
                                <img 
                                    src={currentMediaUrl} 
                                    alt={currentMedia.nombre_original || 'Captura'} 
                                    className="max-h-full max-w-full object-contain pointer-events-none"
                                />
                            )}

                            {activeFiles.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaIndex(prev => (prev > 0 ? prev - 1 : activeFiles.length - 1))}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                                        title="Anterior"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveMediaIndex(prev => (prev < activeFiles.length - 1 ? prev + 1 : 0))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors cursor-pointer"
                                        title="Siguiente"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center">
                            <p className="text-[12px] text-text-dim">Esta incidencia no cuenta con archivos adjuntos.</p>
                        </div>
                    )}

                    {/* Miniaturas de archivos adjuntos */}
                    {activeFiles.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {activeFiles.map((f, i) => {
                                const isVid = Boolean((f.tipo_mime || f.tipoMime || '').startsWith('video/'));
                                const u = getFeedbackMediaUrl(f.url);
                                const isSelected = i === activeMediaIndex;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setActiveMediaIndex(i)}
                                        className={`h-14 w-20 rounded-lg overflow-hidden border shrink-0 relative transition-all cursor-pointer ${
                                            isSelected 
                                                ? 'border-brand ring-2 ring-brand/30' 
                                                : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {isVid ? (
                                            <div className="h-full w-full bg-zinc-900 flex items-center justify-center text-white">
                                                <Video size={14} />
                                            </div>
                                        ) : (
                                            <img src={u} alt={f.nombre_original || ''} className="h-full w-full object-cover" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* SECCIÓN TÉCNICA: Diagnóstico de la Máquina */}
                    {isDosierAdmin && (
                        <div className="bento-card static overflow-hidden">
                            <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-text-main">
                                    <Monitor size={14} className="text-text-dim shrink-0" />
                                    <span className="text-[11px] font-bold tracking-wider uppercase font-mono">
                                        Diagnóstico Técnico del Entorno
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleCopyDiagnostic}
                                    className="btn-vercel-secondary text-[11px] px-2.5 py-1 flex items-center gap-1.5 text-text-main cursor-pointer"
                                    title="Copiar JSON completo del diagnóstico"
                                >
                                    {copiedDiag ? (
                                        <>
                                            <Check size={12} className="text-emerald-500" />
                                            <span className="text-emerald-500 font-medium">Copiado</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={12} />
                                            <span>Copiar datos</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {meta ? (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                        <div className="p-3.5 sm:border-r border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                                            <Monitor size={14} className="text-text-dim shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">SO y Navegador</span>
                                                <span className="font-semibold text-text-main text-[12px] truncate block mt-0.5">
                                                    {meta.os || 'Desconocido'} • {meta.browser || 'Navegador'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 flex items-start gap-2.5">
                                            <Layers size={14} className="text-text-dim shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Resolución / Ventana</span>
                                                <span className="font-mono text-text-main text-[11.5px] truncate block mt-0.5">
                                                    {meta.screen || 'N/A'} <span className="text-text-dim font-normal">(VP: {meta.viewport || 'N/A'})</span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 sm:border-r sm:border-t border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                                            <Cpu size={14} className="text-text-dim shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Hardware</span>
                                                <span className="font-mono text-text-main text-[11.5px] truncate block mt-0.5">
                                                    {meta.hardwareConcurrency || 'N/D'} | {meta.deviceMemoryGB || 'RAM N/D'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-3.5 border-t border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                                            <Wifi size={14} className="text-text-dim shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider block">Red e Idioma</span>
                                                <span className="font-mono text-text-main text-[11.5px] truncate block mt-0.5">
                                                    {meta.connectionType || 'Estable'} • {meta.language || 'es'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {(meta.url || meta.pathname || report.ruta_origen || report.rutaOrigen) && (
                                        <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 space-y-1 bg-white dark:bg-zinc-950">
                                            <div className="flex items-center gap-1.5 text-text-dim text-[10px] font-bold uppercase tracking-wider">
                                                <Globe size={13} className="text-text-dim" />
                                                <span>Ruta curricular al momento del reporte</span>
                                            </div>
                                            <div className="font-mono text-[11.5px] text-text-main break-all bg-zinc-50 dark:bg-zinc-900 px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-800 select-all">
                                                {meta.url || meta.pathname || report.ruta_origen || report.rutaOrigen}
                                            </div>
                                        </div>
                                    )}

                                    {meta.userAgent && (
                                        <div className="p-3.5 space-y-2 bg-white dark:bg-zinc-950">
                                            <button
                                                type="button"
                                                onClick={() => setShowFullUa(!showFullUa)}
                                                className="w-full flex items-center justify-between text-left text-[10px] text-text-dim font-bold uppercase tracking-wider hover:text-text-main cursor-pointer group transition-colors"
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <Terminal size={13} className="text-text-dim group-hover:text-text-main transition-colors" />
                                                    <span>User Agent completo</span>
                                                </span>
                                                <span className="text-[11px] font-mono text-brand hover:underline font-semibold">
                                                    {showFullUa ? 'Ocultar' : 'Ver'}
                                                </span>
                                            </button>
                                            {showFullUa && (
                                                <div className="font-mono text-[10.5px] leading-relaxed text-text-dim bg-zinc-50 dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-zinc-800 break-all animate-fade-in select-all">
                                                    {meta.userAgent}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-white dark:bg-zinc-950">
                                    <p className="text-[11.5px] text-text-dim italic">
                                        No se registraron metadatos técnicos adicionales para esta incidencia.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Panel de administración de estado */}
                    {isDosierAdmin && onStatusChange && (
                        <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between gap-3 shrink-0">
                            <span className="text-[12px] text-text-dim font-medium">Estado del reporte:</span>
                            <div className="w-56 sm:w-64 shrink-0">
                                <GeistSelect
                                    value={report.estado}
                                    onChange={(val) => {
                                        const nuevoEstado = String(val);
                                        onStatusChange(reportId, nuevoEstado);
                                        onReportUpdated?.({ ...report, estado: nuevoEstado });
                                    }}
                                    options={ESTADO_ROW_OPTIONS}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

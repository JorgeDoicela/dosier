import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Send, Bug, HelpCircle, 
    UploadCloud, Trash2, Image as ImageIcon, Video, CheckCircle2, 
    ExternalLink, AlertCircle, Info, ChevronLeft, ChevronRight, Eye,
    Clipboard
} from 'lucide-react';
import { useAuth } from '../../api/AuthContext';
import { useLocation } from 'react-router-dom';
import { getSupportConfig, sendFeedback, type SupportConfig } from '../../services/feedbackService';

interface FeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type FeedbackType = 'ERROR' | 'DUDA';

const normalizeMediaFile = (file: File): File => {
    let type = file.type;
    const name = file.name || '';
    const ext = name.split('.').pop()?.toLowerCase();

    if (!type && ext) {
        if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) {
            type = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
        } else if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
            type = ext === 'mov' ? 'video/quicktime' : `video/${ext}`;
        }
    }

    const isGeneric = !name || name === 'image.png' || name === 'blob';
    if (isGeneric) {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, '0');
        const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
        const finalExt = type.split('/')[1]?.split('+')[0] || (type.startsWith('video/') ? 'mp4' : 'png');
        const prefix = type.startsWith('video/') ? 'Video' : 'Captura';
        return new File([file], `${prefix}_${timeStr}.${finalExt}`, { type });
    }

    if (type !== file.type) {
        return new File([file], name, { type });
    }

    return file;
};

const extractMediaFilesFromDataTransfer = (dataTransfer: DataTransfer): File[] => {
    const files: File[] = [];

    if (dataTransfer.items && dataTransfer.items.length > 0) {
        for (let i = 0; i < dataTransfer.items.length; i++) {
            const item = dataTransfer.items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    const normalized = normalizeMediaFile(file);
                    if (normalized.type.startsWith('image/') || normalized.type.startsWith('video/')) {
                        files.push(normalized);
                    }
                }
            }
        }
    }

    if (files.length === 0 && dataTransfer.files && dataTransfer.files.length > 0) {
        for (let i = 0; i < dataTransfer.files.length; i++) {
            const file = dataTransfer.files[i];
            const normalized = normalizeMediaFile(file);
            if (normalized.type.startsWith('image/') || normalized.type.startsWith('video/')) {
                files.push(normalized);
            }
        }
    }

    return files;
};

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
    const { user, roleDisplayName } = useAuth();
    const location = useLocation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [tipo, setTipo] = useState<FeedbackType>('ERROR');
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [archivos, setArchivos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ name: string; url: string; isVideo: boolean; size: string }[]>([]);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const [supportConfig, setSupportConfig] = useState<SupportConfig>({
        whatsAppNumber: '593969677280',
        maxImageSizeBytes: 5 * 1024 * 1024,
        maxVideoSizeBytes: 15 * 1024 * 1024
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{ titulo?: string; descripcion?: string; archivos?: string; general?: string }>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [previewModalIndex, setPreviewModalIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

    const archivosRef = useRef(archivos);
    archivosRef.current = archivos;
    const previewsRef = useRef(previews);
    previewsRef.current = previews;

    // Bloquear scroll de fondo al abrir
    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    // Tecla Escape para cerrar (modal o preview) y Flechas para navegar en preview
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (previewModalIndex !== null) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewModalIndex(null);
                    return;
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setPreviewModalIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : previews.length - 1) : null);
                    return;
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setPreviewModalIndex(prev => prev !== null ? (prev < previews.length - 1 ? prev + 1 : 0) : null);
                    return;
                }
            } else {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    onClose();
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    const form = document.getElementById('feedback-drawer-form') as HTMLFormElement | null;
                    if (form) form.requestSubmit();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, previewModalIndex, previews.length]);

    useEffect(() => {
        if (isOpen) {
            getSupportConfig().then(cfg => {
                if (cfg) setSupportConfig(cfg);
            });
            setIsSuccess(false);
            setErrors({});
            setContextMenu(null);
        }
    }, [isOpen]);

    // Soporte global de pegado con teclado (Ctrl + V / Pegar captura o video)
    useEffect(() => {
        if (!isOpen) return;

        const handlePaste = (e: ClipboardEvent) => {
            if (!e.clipboardData) return;

            const target = e.target as HTMLElement | null;
            const isTextInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

            const mediaFiles = extractMediaFilesFromDataTransfer(e.clipboardData);

            if (mediaFiles.length > 0) {
                e.preventDefault();
                processFiles(mediaFiles);
            } else if (!isTextInput) {
                // Sin acción si no hay multimedia ni foco de texto
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [isOpen]);

    // Cerrar menú contextual al interactuar o hacer scroll fuera
    useEffect(() => {
        if (!contextMenu) return;
        const handleClose = () => setContextMenu(null);
        window.addEventListener('click', handleClose);
        window.addEventListener('scroll', handleClose, true);
        return () => {
            window.removeEventListener('click', handleClose);
            window.removeEventListener('scroll', handleClose, true);
        };
    }, [contextMenu]);

    // Limpieza de URLs blob al desmontar
    useEffect(() => {
        return () => {
            previewsRef.current.forEach(p => URL.revokeObjectURL(p.url));
        };
    }, []);

    if (!isOpen) return null;

    const maxImgBytes = supportConfig.maxImageSizeBytes || supportConfig.max_image_size_bytes || 5 * 1024 * 1024;
    const maxVidBytes = supportConfig.maxVideoSizeBytes || supportConfig.max_video_size_bytes || 15 * 1024 * 1024;
    const whatsAppNum = supportConfig.whatsAppNumber || supportConfig.whats_app_number || '593969677280';

    const formatBytes = (bytes: number): string => {
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const processFiles = (selectedFiles: File[]) => {
        setErrors(prev => ({ ...prev, archivos: undefined }));
        if (selectedFiles.length === 0) return;

        const currentImages = archivosRef.current.filter(f => f.type.startsWith('image/'));
        const currentVideos = archivosRef.current.filter(f => f.type.startsWith('video/'));

        const newFilesToAdd: File[] = [];
        const newPreviewsToAdd: { name: string; url: string; isVideo: boolean; size: string }[] = [];

        for (const rawFile of selectedFiles) {
            const file = normalizeMediaFile(rawFile);
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type.startsWith('video/');

            if (!isImage && !isVideo) {
                setErrors(prev => ({ ...prev, archivos: `El archivo "${file.name}" no es una imagen ni un video válido.` }));
                continue;
            }

            if (isImage) {
                if (currentImages.length + newFilesToAdd.filter(f => f.type.startsWith('image/')).length >= 3) {
                    setErrors(prev => ({ ...prev, archivos: 'Solo puedes adjuntar hasta 3 imágenes.' }));
                    break;
                }
                if (file.size > maxImgBytes) {
                    setErrors(prev => ({ ...prev, archivos: `La imagen "${file.name}" (${formatBytes(file.size)}) supera el límite de ${formatBytes(maxImgBytes)}.` }));
                    continue;
                }
            }

            if (isVideo) {
                if (currentVideos.length + newFilesToAdd.filter(f => f.type.startsWith('video/')).length >= 1) {
                    setErrors(prev => ({ ...prev, archivos: 'Solo puedes adjuntar hasta 1 clip de video.' }));
                    break;
                }
                if (file.size > maxVidBytes) {
                    setErrors(prev => ({ ...prev, archivos: `El video "${file.name}" (${formatBytes(file.size)}) supera el límite de ${formatBytes(maxVidBytes)}.` }));
                    continue;
                }
            }

            newFilesToAdd.push(file);
            newPreviewsToAdd.push({
                name: file.name,
                url: URL.createObjectURL(file),
                isVideo,
                size: formatBytes(file.size)
            });
        }

        setArchivos(prev => [...prev, ...newFilesToAdd]);
        setPreviews(prev => [...prev, ...newPreviewsToAdd]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePasteFromClipboard = async () => {
        try {
            if (!navigator.clipboard || !navigator.clipboard.read) {
                setErrors(prev => ({
                    ...prev,
                    archivos: 'Usa el atajo de teclado Ctrl + V para pegar la captura o video directamente.'
                }));
                return;
            }

            const clipboardItems = await navigator.clipboard.read();
            const files: File[] = [];

            for (const item of clipboardItems) {
                for (const type of item.types) {
                    if (type.startsWith('image/') || type.startsWith('video/')) {
                        const blob = await item.getType(type);
                        const rawFile = new File([blob], 'clipboard_file', { type });
                        files.push(normalizeMediaFile(rawFile));
                    }
                }
            }

            if (files.length > 0) {
                processFiles(files);
            } else {
                setErrors(prev => ({
                    ...prev,
                    archivos: 'No se encontraron imágenes ni videos en el portapapeles. Copia o toma una captura de pantalla primero y vuelve a intentar.'
                }));
            }
        } catch {
            setErrors(prev => ({
                ...prev,
                archivos: 'Para pegar tu captura o video, presiona la combinación de teclas Ctrl + V.'
            }));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(Array.from(e.target.files || []));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const files = Array.from(e.dataTransfer.files || []);
        processFiles(files);
    };

    const handleRemoveFile = (index: number) => {
        URL.revokeObjectURL(previews[index].url);
        setArchivos(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
        setErrors(prev => ({ ...prev, archivos: undefined }));
        if (previewModalIndex === index) {
            setPreviewModalIndex(null);
        } else if (previewModalIndex !== null && previewModalIndex > index) {
            setPreviewModalIndex(previewModalIndex - 1);
        }
    };

    const handleWhatsAppClick = () => {
        const nombre = user?.nombre_completo || 'Docente';
        const rol = roleDisplayName || 'Docente ISTPET';
        const ruta = location.pathname.replace(/^\//, '') || 'inicio';

        const asuntoTexto = titulo.trim();
        const detalleTexto = descripcion.trim();

        let mensajeWhatsApp = `*SOPORTE DOSIER (ISTPET)*\n`;
        mensajeWhatsApp += `*Usuario:* ${nombre}\n`;
        mensajeWhatsApp += `*Rol:* ${rol}\n`;
        mensajeWhatsApp += `*Pantalla:* ${ruta}\n`;
        mensajeWhatsApp += `*Tipo:* ${tipo === 'ERROR' ? 'Falla en el Sistema' : 'Consulta o Duda'}\n\n`;

        if (asuntoTexto) {
            mensajeWhatsApp += `*Incidencia:* ${asuntoTexto}\n`;
        }
        if (detalleTexto) {
            mensajeWhatsApp += `*Detalle:* ${detalleTexto}\n\n`;
        }

        mensajeWhatsApp += `_Generado desde la plataforma DOSIER._`;

        const encodedMsg = encodeURIComponent(mensajeWhatsApp);
        const cleanNumber = whatsAppNum.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanNumber}?text=${encodedMsg}`, '_blank');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: { titulo?: string; descripcion?: string; general?: string } = {};

        if (!titulo.trim()) {
            newErrors.titulo = 'Ingresa un título descriptivo para la incidencia.';
        }
        if (!descripcion.trim()) {
            newErrors.descripcion = 'Describe el problema o consulta para poder ayudarte.';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            const formData = new FormData();
            formData.append('Tipo', tipo);
            formData.append('Titulo', titulo.trim());
            formData.append('Descripcion', descripcion.trim());
            formData.append('RutaOrigen', location.pathname);

            const ua = navigator.userAgent;
            let os = 'Desconocido';
            if (/windows/i.test(ua)) os = 'Windows';
            else if (/android/i.test(ua)) os = 'Android';
            else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
            else if (/mac/i.test(ua)) os = 'macOS';
            else if (/linux/i.test(ua)) os = 'Linux';

            let browser = 'Desconocido';
            if (/edg/i.test(ua)) browser = 'Microsoft Edge';
            else if (/chrome|crios/i.test(ua)) browser = 'Google Chrome';
            else if (/firefox|fxios/i.test(ua)) browser = 'Mozilla Firefox';
            else if (/safari/i.test(ua)) browser = 'Apple Safari';
            else if (/opera|opr/i.test(ua)) browser = 'Opera';

            const navConn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;

            const richMetadata = {
                browser,
                os,
                url: window.location.href,
                pathname: location.pathname,
                screen: `${window.screen?.width || window.innerWidth}x${window.screen?.height || window.innerHeight}`,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                devicePixelRatio: window.devicePixelRatio || 1,
                language: navigator.language || 'es-EC',
                isOnline: navigator.onLine,
                connectionType: navConn?.effectiveType || (navigator.onLine ? 'Estable' : 'Offline'),
                deviceMemoryGB: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : undefined,
                hardwareConcurrency: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} núcleos` : undefined,
                userAgent: ua,
                timestamp: new Date().toISOString(),
                userRef: user?.id_referencia || '',
                userName: user?.nombre_completo || '',
                userRole: roleDisplayName || ''
            };

            formData.append('MetadataNavegador', JSON.stringify(richMetadata));

            archivos.forEach(file => {
                formData.append('Archivos', file);
            });

            await sendFeedback(formData);
            window.dispatchEvent(new CustomEvent('dosier-feedback-changed'));
            setIsSuccess(true);
            setTimeout(() => {
                onClose();
                previews.forEach(p => URL.revokeObjectURL(p.url));
                setTitulo('');
                setDescripcion('');
                setArchivos([]);
                setPreviews([]);
                setPreviewModalIndex(null);
                setIsSuccess(false);
                setErrors({});
            }, 2000);
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error al enviar el reporte. Puedes contactar por WhatsApp.';
            setErrors({ general: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getSubmitLabel = () => {
        switch (tipo) {
            case 'ERROR': return 'Reportar Problema';
            case 'DUDA': return 'Reportar Opción Faltante';
            default: return 'Enviar Incidencia';
        }
    };

    const getTitlePlaceholder = () => {
        switch (tipo) {
            case 'ERROR': return 'Ej: La sección de bibliografía no guarda / Error al legalizar PEA...';
            case 'DUDA': return 'Ej: Falta materia en mi distributivo / Falta campo de co-docente...';
            default: return 'Ej: Describe brevemente la incidencia...';
        }
    };

    const getDescPlaceholder = () => {
        switch (tipo) {
            case 'ERROR': return 'Describe qué estabas editando, en qué sección del PEA o pantalla ocurrió y qué error se visualizó...';
            case 'DUDA': return 'Indica qué opción o requerimiento pedagógico consideras que hace falta o debe ajustarse...';
            default: return 'Describe los detalles de la incidencia...';
        }
    };

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Buzón de Incidencias DOSIER"
        >
            {/* Backdrop sólido */}
            <div 
                className="absolute inset-0 bg-black/60 cursor-pointer animate-fade-in"
                onClick={onClose}
            />

            {/* Panel Lateral Derecho (Drawer 100% Sólido) */}
            <div className="relative w-full max-w-lg md:max-w-xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-hidden">
                
                {/* Header Sólido */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[14px] font-semibold text-text-main tracking-tight">
                            Buzón de Incidencias
                        </h2>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Cerrar [ESC]"
                        aria-label="Cerrar panel"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white dark:bg-zinc-950 custom-scrollbar">
                    {/* Banner Informativo */}
                    <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                        <p className="text-[12px] text-text-dim leading-relaxed">
                            <strong className="font-semibold text-text-main">¿Encontraste una incidencia?</strong> Si una sección del PEA no responde, encuentras una inconsistencia o necesitas soporte curricular, repórtalo aquí.
                        </p>
                    </div>

                    {errors.general && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[12px] flex items-center justify-between gap-2 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                <span className="font-medium">{errors.general}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setErrors(prev => ({ ...prev, general: undefined }))}
                                className="text-red-400 hover:text-red-500 p-0.5 cursor-pointer rounded"
                                title="Cerrar aviso"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {isSuccess ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 animate-fade-in">
                            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-emerald-500">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-[14.5px] font-semibold text-text-main">
                                Incidencia enviada exitosamente
                            </h3>
                            <p className="text-[12px] text-text-dim max-w-sm">
                                El equipo técnico revisará el reporte. Podrás dar seguimiento al estado y respuestas desde tu Buzón de Incidencias.
                            </p>
                        </div>
                    ) : (
                        <form id="feedback-drawer-form" onSubmit={handleSubmit} className="space-y-4">
                            {/* Selector de Tipo */}
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-semibold text-text-main">
                                    Tipo de Incidencia
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setTipo('ERROR')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                                            tipo === 'ERROR'
                                                ? 'border-brand bg-brand/5 ring-1 ring-brand text-text-main'
                                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-text-dim'
                                        }`}
                                    >
                                        <Bug className={`w-4 h-4 shrink-0 mt-0.5 ${tipo === 'ERROR' ? 'text-brand' : 'text-text-dim'}`} />
                                        <div>
                                            <p className="text-[12.5px] font-semibold text-text-main">Problema / Falla</p>
                                            <p className="text-[11px] text-text-dim leading-snug">Algo no responde o muestra un error</p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setTipo('DUDA')}
                                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                                            tipo === 'DUDA'
                                                ? 'border-brand bg-brand/5 ring-1 ring-brand text-text-main'
                                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 text-text-dim'
                                        }`}
                                    >
                                        <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${tipo === 'DUDA' ? 'text-brand' : 'text-text-dim'}`} />
                                        <div>
                                            <p className="text-[12.5px] font-semibold text-text-main">Consulta / Opción</p>
                                            <p className="text-[11px] text-text-dim leading-snug">Falta una opción o tienes una duda</p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Título */}
                            <div className="space-y-1.5">
                                <label htmlFor="feedback-titulo" className="text-[12px] font-semibold text-text-main">
                                    Título Breve <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="feedback-titulo"
                                    type="text"
                                    value={titulo}
                                    onChange={(e) => {
                                        setTitulo(e.target.value);
                                        if (errors.titulo) setErrors(prev => ({ ...prev, titulo: undefined }));
                                    }}
                                    placeholder={getTitlePlaceholder()}
                                    maxLength={200}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[13px] text-text-main bg-white dark:bg-zinc-900 outline-none transition-all ${
                                        errors.titulo
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                            : 'border-zinc-200 dark:border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand/20'
                                    }`}
                                />
                                {errors.titulo && (
                                    <p className="text-[11px] text-red-500 font-medium">{errors.titulo}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1.5">
                                <label htmlFor="feedback-descripcion" className="text-[12px] font-semibold text-text-main">
                                    Detalle de la Incidencia <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="feedback-descripcion"
                                    value={descripcion}
                                    onChange={(e) => {
                                        setDescripcion(e.target.value);
                                        if (errors.descripcion) setErrors(prev => ({ ...prev, descripcion: undefined }));
                                    }}
                                    placeholder={getDescPlaceholder()}
                                    rows={4}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-[13px] text-text-main bg-white dark:bg-zinc-900 outline-none transition-all resize-none leading-relaxed ${
                                        errors.descripcion
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                                            : 'border-zinc-200 dark:border-zinc-800 focus:border-brand focus:ring-1 focus:ring-brand/20'
                                    }`}
                                />
                                {errors.descripcion && (
                                    <p className="text-[11px] text-red-500 font-medium">{errors.descripcion}</p>
                                )}
                            </div>

                            {/* Adjuntos Multimedia */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[12px] font-semibold text-text-main">
                                        Capturas o Video (Opcional)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handlePasteFromClipboard}
                                        className="text-[11px] font-medium text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <Clipboard size={12} /> Pegar del portapapeles
                                    </button>
                                </div>

                                {errors.archivos && (
                                    <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-[11.5px] flex items-center justify-between gap-2 animate-fade-in">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                                            <span className="font-medium">{errors.archivos}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setErrors(prev => ({ ...prev, archivos: undefined }))}
                                            className="text-red-400 hover:text-red-500 p-0.5 cursor-pointer rounded"
                                            title="Cerrar aviso"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {archivos.filter(f => f.type.startsWith('image/')).length >= 3 && archivos.filter(f => f.type.startsWith('video/')).length >= 1 ? (
                                    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 bg-zinc-50 dark:bg-zinc-900 text-center">
                                        <p className="text-[12px] font-medium text-text-main">
                                            Límite de adjuntos alcanzado (3 imágenes y 1 video)
                                        </p>
                                        <p className="text-[11px] text-text-dim mt-0.5">
                                            Para adjuntar un archivo diferente, elimina alguno de la lista inferior.
                                        </p>
                                    </div>
                                ) : (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        onContextMenu={(e) => {
                                            e.preventDefault();
                                            setContextMenu({ x: e.clientX, y: e.clientY });
                                        }}
                                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                                        onDragLeave={() => setIsDraggingOver(false)}
                                        onDrop={handleDrop}
                                        className={`border border-dashed rounded-xl transition-all flex flex-col items-center justify-center cursor-pointer text-center select-none ${
                                            previews.length > 0 ? 'py-4 px-3 gap-2' : 'py-8 px-4 gap-2.5'
                                        } ${
                                            isDraggingOver 
                                                ? 'border-brand bg-brand/5 scale-[0.99]' 
                                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-text-dim shrink-0">
                                                <UploadCloud className="w-4 h-4" />
                                            </div>
                                            <p className="text-[13px] font-medium text-text-main">
                                                {archivos.filter(f => f.type.startsWith('image/')).length >= 3
                                                    ? 'Límite de imágenes alcanzado. Clic para adjuntar video (máx 1)'
                                                    : 'Haz clic, arrastra o presiona Ctrl + V para pegar captura'
                                                }
                                            </p>
                                        </div>

                                        {previews.length === 0 && (
                                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-text-dim">
                                                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">PNG</span>
                                                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">JPG</span>
                                                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">WEBP</span>
                                                <span className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">MP4</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2.5">
                                        {previews.map((file, idx) => (
                                            <div 
                                                key={idx}
                                                onClick={() => setPreviewModalIndex(idx)}
                                                className="group border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-lg p-2 bg-zinc-50 dark:bg-zinc-900 flex items-center gap-2 transition-all cursor-pointer select-none"
                                                title="Clic para previsualizar"
                                            >
                                                <div className="w-8 h-8 rounded bg-white dark:bg-zinc-950 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 relative">
                                                    {file.isVideo ? (
                                                        <Video className="w-4 h-4 text-text-dim" />
                                                    ) : (
                                                        <img src={file.url} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <Eye className="w-3.5 h-3.5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-medium text-text-main truncate group-hover:text-brand transition-colors">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-[9.5px] font-mono text-text-dim">
                                                        {file.size} • Ver
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveFile(idx);
                                                    }}
                                                    className="p-1 rounded text-text-dim hover:text-red-500 transition-colors cursor-pointer shrink-0"
                                                    title="Eliminar archivo"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Sólido */}
                {!isSuccess && (
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={handleWhatsAppClick}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11.5px] font-medium transition-all cursor-pointer"
                        >
                            <span>WhatsApp Soporte</span>
                        </button>

                        <div className="w-full sm:w-auto flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-text-main text-[12px] font-medium h-8.5 px-3.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                form="feedback-drawer-form"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center gap-1.5 bg-brand text-white text-[12px] font-medium h-8.5 px-4 rounded-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        <span>Enviando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-3 h-3" />
                                        <span>{getSubmitLabel()}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de Previsualización de Adjuntos */}
            {previewModalIndex !== null && previews[previewModalIndex] && createPortal(
                <div 
                    className="fixed inset-0 z-[100000] flex justify-end"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Previsualización de adjunto"
                >
                    <div 
                        className="absolute inset-0 bg-black/70 cursor-pointer animate-fade-in"
                        onClick={() => setPreviewModalIndex(null)}
                    />
                    <div className="relative w-full max-w-xl h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-slide-in-right overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                            <div>
                                <h3 className="text-[13.5px] font-semibold text-text-main truncate max-w-xs">
                                    {previews[previewModalIndex].name}
                                </h3>
                                <p className="text-[11px] font-mono text-text-dim">
                                    {previews[previewModalIndex].size} • Archivo {previewModalIndex + 1} de {previews.length}
                                </p>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleRemoveFile(previewModalIndex)}
                                    className="p-1.5 rounded-lg text-text-dim hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                    title="Eliminar este archivo"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => setPreviewModalIndex(null)}
                                    className="p-1.5 rounded-lg text-text-dim hover:text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                                    title="Cerrar [ESC]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 flex items-center justify-center bg-zinc-900 overflow-auto">
                            {previews[previewModalIndex].isVideo ? (
                                <video 
                                    src={previews[previewModalIndex].url} 
                                    controls 
                                    autoPlay 
                                    className="max-w-full max-h-full rounded-lg shadow-lg"
                                />
                            ) : (
                                <img 
                                    src={previews[previewModalIndex].url} 
                                    alt={previews[previewModalIndex].name} 
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                />
                            )}
                        </div>

                        {previews.length > 1 && (
                            <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalIndex(prev => prev !== null ? (prev > 0 ? prev - 1 : previews.length - 1) : null)}
                                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[12px] font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                                >
                                    <ChevronLeft size={14} /> Anterior
                                </button>
                                <span className="text-[11px] font-mono text-text-dim">
                                    {previewModalIndex + 1} / {previews.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPreviewModalIndex(prev => prev !== null ? (prev < previews.length - 1 ? prev + 1 : 0) : null)}
                                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-[12px] font-medium text-text-main hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1 cursor-pointer"
                                >
                                    Siguiente <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>,
        document.body
    );
};

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export interface TimedSuccessModalDetail {
    label: string;
    value: string;
}

export interface TimedSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    durationMs?: number;
    title?: string;
    subtitle?: string;
    badgeText?: string;
    details?: TimedSuccessModalDetail[];
    showProgress?: boolean;
    primaryButtonText?: string;
    onPrimaryClick?: () => void;
}

export const TimedSuccessModal: React.FC<TimedSuccessModalProps> = ({
    isOpen,
    onClose,
    durationMs = 5000,
    title = 'Documento firmado exitosamente',
    subtitle = 'Su firma institucional ha sido estampada y certificada en el documento oficial con trazabilidad inmutable.',
    badgeText = 'Firma electrónica certificada',
    details,
    showProgress = true,
    primaryButtonText = 'Entendido',
    onPrimaryClick
}) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!isOpen) {
            setProgress(100);
            return;
        }

        const intervalStepMs = 40;
        const decrement = (intervalStepMs / durationMs) * 100;

        // Temporizador ininterrumpido: avanza continuamente con o sin cursor
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev <= decrement) {
                    clearInterval(interval);
                    onClose();
                    return 0;
                }
                return prev - decrement;
            });
        }, intervalStepMs);

        return () => clearInterval(interval);
    }, [isOpen, durationMs, onClose]);

    // Manejo de teclado (Escape)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleAction = () => {
        if (onPrimaryClick) {
            onPrimaryClick();
        }
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200 select-none">
            {/* Backdrop sólido */}
            <div
                className="absolute inset-0"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Centrado 100% Sólido sin cajas anidadas */}
            <div
                className="relative flex w-full max-w-lg max-h-[90vh] bg-surface border border-border-thin rounded-xl shadow-2xl flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden font-sans"
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Barra Superior de Progreso Temporal (Auto-cierre ininterrumpido) */}
                {showProgress && (
                    <div className="w-full h-1 bg-border-thin overflow-hidden shrink-0">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Cabecera Minimalista */}
                <div className="border-b border-border-thin flex justify-between items-start p-5 sm:p-6 shrink-0 bg-surface">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-4">
                        <h3 className="text-base sm:text-lg font-bold tracking-tight text-text-main font-sans truncate">
                            {title}
                        </h3>
                        <p className="text-xs text-text-dim">
                            {badgeText} — DOSIER
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 hover:bg-surface-hover rounded-xl text-text-dim hover:text-text-main transition-all cursor-pointer shrink-0"
                        title="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cuerpo del Modal: presentación limpia sin líneas divisorias excesivas */}
                <div className="flex-1 p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-5">
                    {/* Mensaje descriptivo */}
                    {subtitle && (
                        <p className="text-xs text-text-dim leading-relaxed">
                            {subtitle}
                        </p>
                    )}

                    {/* Información del Documento y Firma */}
                    {details && details.length > 0 && (
                        <div className="space-y-2.5">
                            <h4 className="text-xs font-semibold text-text-main">
                                Información de firma
                            </h4>
                            <dl className="space-y-2">
                                {details.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-baseline gap-4 text-xs">
                                        <dt className="text-text-dim font-normal">
                                            {item.label}
                                        </dt>
                                        <dd className="font-medium text-text-main text-right truncate font-mono text-[11.5px]">
                                            {item.value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>
                        </div>
                    )}

                    {/* Certificación y Seguridad */}
                    <div className="space-y-2.5">
                        <h4 className="text-xs font-semibold text-text-main">
                            Certificación y seguridad
                        </h4>
                        <dl className="space-y-2">
                            <div className="flex justify-between items-baseline gap-4 text-xs">
                                <dt className="text-text-dim font-normal">
                                    Estado del certificado
                                </dt>
                                <dd className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                    Firmado y certificado
                                </dd>
                            </div>
                            <div className="flex justify-between items-baseline gap-4 text-xs">
                                <dt className="text-text-dim font-normal">
                                    Estándar criptográfico
                                </dt>
                                <dd className="font-mono text-[11.5px] font-medium text-text-main">
                                    PKI X.509 / SHA-256
                                </dd>
                            </div>
                            <div className="flex justify-between items-baseline gap-4 text-xs">
                                <dt className="text-text-dim font-normal">
                                    Trazabilidad CACES
                                </dt>
                                <dd className="font-medium text-text-main">
                                    Inmutable y auditada
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Footer con Acciones */}
                <div className="p-4 sm:p-5 border-t border-border-thin bg-surface shrink-0 flex items-center justify-end gap-3">
                    {onPrimaryClick && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2 px-4 btn-vercel-secondary text-xs font-semibold rounded-xl transition-all cursor-pointer"
                        >
                            Cerrar
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleAction}
                        className="py-2 px-5 btn-vercel-primary text-xs font-semibold rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                        {primaryButtonText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
    FileText,
    Download,
    RefreshCw,
    Printer,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { FullscreenLoader } from '../../../../components/Common/FullscreenLoader';
import { useNotifications } from '../../../../api/NotificationsContext';
import { documentTemplateService } from '../../../../services/documentTemplateService';
import type { DocumentTemplateDto } from '../types';

interface TemplatePreviewModalProps {
    isOpen: boolean;
    template: DocumentTemplateDto | null;
    onClose: () => void;
    /** HTML generado en tiempo real si se previsualiza desde el editor visual */
    generatedHtml?: string;
    /** Tema visual fusionado si se previsualiza desde el editor visual */
    mergedTheme?: any;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
    isOpen,
    template,
    onClose,
    generatedHtml,
    mergedTheme
}) => {
    const { addToast } = useNotifications();
    const [isLoadingPdf, setIsLoadingPdf] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    // Liberar URL previa al desmontar o cambiar plantilla
    const cleanupPdfUrl = useCallback(() => {
        if (pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    }, [pdfUrl]);

    // Cargar o compilar PDF en caliente
    const loadPdfPreview = useCallback(async () => {
        if (!template) return;
        setIsLoadingPdf(true);
        cleanupPdfUrl();

        try {
            let blob: Blob;

            // Si se pasa HTML generado en vivo desde el canvas, compilamos en caliente
            if (generatedHtml) {
                blob = await documentTemplateService.renderCustomPdfBlob(
                    template.code,
                    {
                        htmlContent: generatedHtml,
                        customCss: template.customCss || null,
                        themeConfigJson: mergedTheme ? JSON.stringify(mergedTheme) : null
                    },
                    false,
                    false
                );
            } else {
                // Modo estándar: previsualización del documento oficial almacenado
                blob = await documentTemplateService.renderPdfBlob(template.code, false, false);
            }

            const objectUrl = URL.createObjectURL(blob);
            setPdfUrl(objectUrl);
        } catch (err: any) {
            console.error('Error al generar previsualización del PDF:', err);
            addToast('Error de Previsualización', 'No se pudo generar la vista previa del documento oficial.', 'error');
        } finally {
            setIsLoadingPdf(false);
        }
    }, [template, generatedHtml, mergedTheme, addToast, cleanupPdfUrl]);

    useEffect(() => {
        if (isOpen && template) {
            loadPdfPreview();
        } else {
            cleanupPdfUrl();
        }

        return () => {
            cleanupPdfUrl();
        };
    }, [isOpen, template?.code]);

    // Manejo de tecla Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Descarga directa del archivo PDF oficial
    const handleDownloadPdf = async () => {
        if (!template) return;
        setIsDownloading(true);

        try {
            const fileName = `${(template.name || template.code).replace(/[^a-zA-Z0-9_\-]/g, '_')}_OFICIAL.pdf`;
            let downloadBlob: Blob;

            if (pdfUrl) {
                const res = await fetch(pdfUrl);
                downloadBlob = await res.blob();
            } else {
                if (generatedHtml) {
                    downloadBlob = await documentTemplateService.renderCustomPdfBlob(
                        template.code,
                        {
                            htmlContent: generatedHtml,
                            customCss: template.customCss || null,
                            themeConfigJson: mergedTheme ? JSON.stringify(mergedTheme) : null
                        },
                        false,
                        true
                    );
                } else {
                    downloadBlob = await documentTemplateService.renderPdfBlob(template.code, false, true);
                }
            }

            const link = document.createElement('a');
            const downloadUrl = URL.createObjectURL(downloadBlob);
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(downloadUrl), 500);
            addToast('Documento Descargado', `Se descargó el archivo '${fileName}'.`, 'success');
        } catch (err) {
            console.error('Error al descargar PDF:', err);
            addToast('Error de Descarga', 'No se pudo generar la descarga del PDF.', 'error');
        } finally {
            setIsDownloading(false);
        }
    };

    // Imprimir
    const handlePrint = () => {
        if (pdfUrl) {
            const iframe = document.getElementById('preview-pdf-iframe') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
                iframe.contentWindow.print();
                return;
            }
        }
        window.print();
    };

    if (!isOpen || !template) return null;

    return (
        <div className="fixed inset-0 z-[100] flex justify-end">
            {/* Fondo oscuro sólido sin efecto de desenfoque translúcido */}
            <div
                className="absolute inset-0 bg-black/75 cursor-pointer animate-fade-in"
                onClick={onClose}
            />

            {/* Contenedor lateral con fondo 100% sólido */}
            <div className="relative w-full md:w-[54vw] lg:w-[56vw] xl:w-[58vw] h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-10 animate-slide-in-right overflow-hidden shadow-2xl">
                
                {/* Barra superior de acciones */}
                <div className="relative flex items-center justify-between px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0">
                    <div className="w-20 shrink-0 hidden sm:block" />

                    <div className="absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center truncate">
                        <h2 className="text-xs md:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {template.name}
                        </h2>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 z-10 ml-auto">
                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloading || isLoadingPdf}
                            title="Descargar PDF oficial"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
                        >
                            {isDownloading ? (
                                <RefreshCw className="w-4 h-4 animate-spin" strokeWidth={1.5} />
                            ) : (
                                <Download className="w-4 h-4" strokeWidth={1.5} />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={handlePrint}
                            title="Imprimir documento"
                            className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            <Printer className="w-4 h-4" strokeWidth={1.5} />
                        </button>

                        {pdfUrl && (
                            <a
                                href={pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Abrir en pestaña nueva"
                                className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            >
                                <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                        )}

                        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1.5" />

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1 rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Cerrar panel (Esc)"
                        >
                            <ChevronRight className="w-5 h-5 text-zinc-900 dark:text-zinc-100" strokeWidth={1.75} />
                        </button>
                    </div>
                </div>

                {/* Cuerpo del Visor PDF */}
                <div className="flex-1 relative bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex flex-col">
                    <div className="w-full h-full relative flex items-center justify-center">
                        {isLoadingPdf && (
                            <FullscreenLoader
                                fullscreen={false}
                                message="Generando documento oficial ISTPET..."
                            />
                        )}

                        {pdfUrl ? (
                            <iframe
                                id="preview-pdf-iframe"
                                src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
                                title={`Vista Previa: ${template.name}`}
                                className="w-full h-full border-none bg-zinc-100 dark:bg-zinc-900"
                            />
                        ) : !isLoadingPdf && (
                            <div className="p-8 text-center max-w-sm space-y-3">
                                <FileText className="w-10 h-10 text-zinc-400 dark:text-zinc-600 mx-auto" strokeWidth={1.5} />
                                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                                    No se pudo cargar el visor embebido
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                    Puedes descargar el PDF oficial directamente a tu equipo o reintentar la compilación.
                                </p>
                                <div className="flex justify-center gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={loadPdfPreview}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 cursor-pointer"
                                    >
                                        Reintentar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDownloadPdf}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 cursor-pointer"
                                    >
                                        Descargar PDF
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

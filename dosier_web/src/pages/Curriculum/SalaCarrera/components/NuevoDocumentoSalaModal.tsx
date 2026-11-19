import React, { useState, useMemo, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import type { DocumentTemplateDto } from '../../../../services/documentTemplateService';

interface NuevoDocumentoSalaModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: DocumentTemplateDto[];
    carreraNombre: string;
    periodoActual: string;
    isCreating: boolean;
    onCreate: (payload: { templateCode: string; title: string }) => Promise<void>;
}

export const NuevoDocumentoSalaModal: React.FC<NuevoDocumentoSalaModalProps> = ({
    isOpen,
    onClose,
    templates,
    carreraNombre,
    periodoActual,
    isCreating,
    onCreate,
}) => {
    const activeTemplates = useMemo(() => {
        return templates
            .filter((t) => {
                const active = (t as Record<string, unknown>).is_active ?? t.isActive ?? true;
                return Boolean(active);
            })
            .sort((a, b) => {
                // Priorizar plantillas generales de sala antes que PEA_OFICIAL para no atar la sala al PEA
                const aIsPea = a.code === 'PEA_OFICIAL' ? 1 : 0;
                const bIsPea = b.code === 'PEA_OFICIAL' ? 1 : 0;
                if (aIsPea !== bIsPea) return aIsPea - bIsPea;
                return (a.name || a.code).localeCompare(b.name || b.code);
            });
    }, [templates]);

    const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setErrorMsg(null);
            if (!selectedTemplateCode && activeTemplates.length > 0) {
                setSelectedTemplateCode(activeTemplates[0].code);
            }
            setTitle('');
        }
    }, [isOpen, activeTemplates, selectedTemplateCode]);

    if (!isOpen) return null;

    const templateOptions = activeTemplates.map((t) => ({
        value: t.code,
        label: `${t.name} (${t.code})`,
    }));

    const selectedTemplate = activeTemplates.find((t) => t.code === selectedTemplateCode);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTemplateCode) {
            setErrorMsg('Selecciona una plantilla institucional.');
            return;
        }
        const trimmedTitle = title.trim();
        if (!trimmedTitle) {
            setErrorMsg('Ingresa un título descriptivo para el documento.');
            return;
        }
        setErrorMsg(null);
        try {
            await onCreate({ templateCode: selectedTemplateCode, title: trimmedTitle });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'No se pudo crear el documento compartido.';
            setErrorMsg(msg);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nuevo-doc-sala-title"
        >
            <div className="w-full max-w-lg rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden text-slate-900 dark:text-zinc-100">
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                    <div>
                        <h2 id="nuevo-doc-sala-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                            Nuevo documento compartido
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {carreraNombre} · {periodoActual}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCreating}
                        aria-label="Cerrar modal"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white dark:bg-zinc-950">
                    <div>
                        <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
                            Plantilla institucional
                        </label>
                        {templateOptions.length > 0 ? (
                            <GeistSelect
                                value={selectedTemplateCode}
                                options={templateOptions}
                                onChange={(val) => setSelectedTemplateCode(String(val))}
                                size="md"
                                className="w-full"
                            />
                        ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 py-2">
                                No hay plantillas publicadas disponibles en el catálogo.
                            </p>
                        )}
                        {selectedTemplate?.description && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                                {selectedTemplate.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="doc-sala-titulo"
                            className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5"
                        >
                            Título del documento
                        </label>
                        <input
                            id="doc-sala-titulo"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ej: Acta de reunión de área, Informe de seguimiento, Planificación..."
                            disabled={isCreating}
                            className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>

                    {errorMsg && (
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                            {errorMsg}
                        </p>
                    )}

                    <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 -mx-6 -mb-6 px-6 py-4 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isCreating}
                            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating || templateOptions.length === 0}
                            className="px-4 py-2 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            {isCreating && <Loader2 size={13} className="animate-spin" />}
                            <span>{isCreating ? 'Creando...' : 'Crear y abrir'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

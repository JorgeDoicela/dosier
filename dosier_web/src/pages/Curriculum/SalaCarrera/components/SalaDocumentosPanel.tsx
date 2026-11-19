import React, { useState, useMemo } from 'react';
import { Search, FileDown, Loader2 } from 'lucide-react';
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import type { DocumentInstanceDto } from '../../../../services/documentInstanceService';
import type { DocumentTemplateDto } from '../../../../services/documentTemplateService';

interface SalaDocumentosPanelProps {
    documentos: DocumentInstanceDto[];
    templates: DocumentTemplateDto[];
    isLoading: boolean;
    carreraNombre: string;
    periodoActual: string;
    onOpenDocument: (doc: DocumentInstanceDto) => void;
    onOpenCreateModal: () => void;
    onDownloadPdf: (doc: DocumentInstanceDto) => Promise<void>;
}

const formatFecha = (raw?: string): string => {
    if (!raw) return 'Sin fecha';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return 'Sin fecha';
    return d.toLocaleDateString('es-EC', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const SalaDocumentosPanel: React.FC<SalaDocumentosPanelProps> = ({
    documentos,
    templates,
    isLoading,
    carreraNombre,
    periodoActual,
    onOpenDocument,
    onOpenCreateModal,
    onDownloadPdf,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [templateFilter, setTemplateFilter] = useState<string>('ALL');
    const [downloadingUuid, setDownloadingUuid] = useState<string | null>(null);

    const templateNameMap = useMemo(() => {
        const map = new Map<string, string>();
        templates.forEach((t) => {
            map.set(t.code, t.name || t.code);
        });
        return map;
    }, [templates]);

    const filterOptions = useMemo(() => {
        const codes = new Set<string>();
        documentos.forEach((d) => {
            const code = d.template_code || (d as Record<string, unknown>).templateCode;
            if (typeof code === 'string' && code) codes.add(code);
        });
        const opts = [{ value: 'ALL', label: 'Todas las plantillas' }];
        codes.forEach((code) => {
            opts.push({ value: code, label: templateNameMap.get(code) || code });
        });
        return opts;
    }, [documentos, templateNameMap]);

    const filteredDocs = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return documentos.filter((doc) => {
            const code = String(doc.template_code || (doc as Record<string, unknown>).templateCode || '');
            const title = String(doc.title || 'Documento sin título');
            if (templateFilter !== 'ALL' && code !== templateFilter) return false;
            if (!q) return true;
            const tplName = (templateNameMap.get(code) || code).toLowerCase();
            return title.toLowerCase().includes(q) || code.toLowerCase().includes(q) || tplName.includes(q);
        });
    }, [documentos, searchQuery, templateFilter, templateNameMap]);

    const handlePdfClick = async (doc: DocumentInstanceDto) => {
        setDownloadingUuid(doc.uuid);
        try {
            await onDownloadPdf(doc);
        } finally {
            setDownloadingUuid(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Barra de herramientas */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none"
                        />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por título o plantilla..."
                            aria-label="Buscar documentos compartidos"
                            className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>
                    {filterOptions.length > 1 && (
                        <div className="w-full sm:w-56">
                            <GeistSelect
                                value={templateFilter}
                                options={filterOptions}
                                onChange={(val) => setTemplateFilter(String(val))}
                                size="sm"
                                className="w-full"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={onOpenCreateModal}
                    className="px-4 py-2 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                    Nuevo documento
                </button>
            </div>

            {/* Folio continuo de documentos compartidos */}
            {isLoading ? (
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 flex flex-col items-center justify-center text-slate-500 dark:text-zinc-400">
                    <Loader2 size={24} className="animate-spin text-[#0070f3] mb-2" />
                    <p className="text-xs font-medium">Cargando documentos compartidos de la carrera...</p>
                </div>
            ) : filteredDocs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-10 text-center space-y-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {documentos.length === 0
                            ? 'No hay documentos compartidos en esta sala'
                            : 'No se encontraron documentos con ese criterio'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
                        {documentos.length === 0
                            ? `Crea un documento colaborativo para que todos los docentes de ${carreraNombre} trabajen en conjunto durante el período ${periodoActual}.`
                            : 'Ajusta el texto de búsqueda o el filtro de plantilla.'}
                    </p>
                    {documentos.length === 0 && (
                        <div className="pt-1">
                            <button
                                type="button"
                                onClick={onOpenCreateModal}
                                className="px-4 py-2 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                                Crear primer documento
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredDocs.map((doc) => {
                        const code = String(doc.template_code || (doc as Record<string, unknown>).templateCode || 'DOCUMENTO');
                        const tplLabel = templateNameMap.get(code) || code;
                        const updatedRaw = doc.updated_at || (doc as Record<string, unknown>).updatedAt || doc.created_at || (doc as Record<string, unknown>).createdAt;
                        const isSigned = Boolean(
                            doc.is_signed ??
                            (doc as Record<string, unknown>).isSigned ??
                            doc.final_pdf_path ??
                            (doc as Record<string, unknown>).finalPdfPath
                        );
                        const version = doc.version ?? 1;
                        const isDownloading = downloadingUuid === doc.uuid;

                        return (
                            <div
                                key={doc.uuid}
                                className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors"
                            >
                                <div className="min-w-0 space-y-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <button
                                            type="button"
                                            onClick={() => onOpenDocument(doc)}
                                            className="text-sm font-semibold text-slate-900 dark:text-white hover:text-[#0070f3] dark:hover:text-blue-400 text-left transition-colors cursor-pointer"
                                        >
                                            {doc.title || 'Documento sin título'}
                                        </button>
                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-zinc-300">
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${
                                                    isSigned ? 'bg-emerald-600' : 'bg-[#0070f3]'
                                                }`}
                                            />
                                            {isSigned ? 'Finalizado' : 'Colaboración activa'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                                        <span className="font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                                            {tplLabel}
                                        </span>
                                        <span>·</span>
                                        <span>v{version}</span>
                                        <span>·</span>
                                        <span>Actualizado {formatFecha(typeof updatedRaw === 'string' ? updatedRaw : undefined)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handlePdfClick(doc)}
                                        disabled={isDownloading}
                                        aria-label={`Descargar PDF de ${doc.title || 'documento'}`}
                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                                    >
                                        {isDownloading ? (
                                            <Loader2 size={13} className="animate-spin" />
                                        ) : (
                                            <FileDown size={13} />
                                        )}
                                        <span>PDF</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onOpenDocument(doc)}
                                        className="px-3.5 py-1.5 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-colors cursor-pointer"
                                    >
                                        Abrir
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

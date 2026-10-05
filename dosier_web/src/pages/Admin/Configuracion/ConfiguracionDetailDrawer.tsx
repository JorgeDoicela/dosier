import React from 'react';
import { Calendar, CheckCircle, XCircle, ChevronRight, Edit2 } from 'lucide-react';
import { useConfiguracion } from './useConfiguracion';
import type { PeriodoAcademico, EventoNormativo } from './useConfiguracion';

interface ConfiguracionDetailDrawerProps {
    detailItem: { type: 'periodo' | 'calendario'; data: any; } | null;
    setDetailItem: React.Dispatch<React.SetStateAction<{ type: 'periodo' | 'calendario'; data: any; } | null>>;
    hook: ReturnType<typeof useConfiguracion>;
}

export const ConfiguracionDetailDrawer: React.FC<ConfiguracionDetailDrawerProps> = ({ 
    detailItem, 
    setDetailItem, 
    hook 
}) => {
    if (!detailItem) return null;

    const {
        handleOpenPeriodoModal,
        handleOpenCalendarioModal
    } = hook;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div 
                className="absolute inset-0 cursor-pointer"
                onClick={() => setDetailItem(null)}
            />
            <div className="relative w-full max-w-xl max-h-[90vh] bg-surface border border-border-thin rounded-xl shadow-2xl flex flex-col z-10 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-[#0070f3] dark:text-blue-400 shrink-0" />
                        <div>
                            <h3 className="text-lg font-bold text-text-main uppercase tracking-tight">
                                {detailItem.type === 'periodo' && ((detailItem.data as PeriodoAcademico).detalle || (detailItem.data as PeriodoAcademico).idPeriodo)}
                                {detailItem.type === 'calendario' && (detailItem.data as EventoNormativo).titulo}
                            </h3>
                            <p className="section-label text-text-dim">
                                {detailItem.type === 'periodo' && 'Período Académico'}
                                {detailItem.type === 'calendario' && 'Hito del Calendario'}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setDetailItem(null)} className="text-text-dim hover:text-text-main transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {detailItem.type === 'periodo' && (() => {
                        const p = detailItem.data as PeriodoAcademico;
                        return (
                            <>
                                <div className="bento-card static p-4">
                                    <label className="section-label text-text-dim mb-2">Identificador</label>
                                    <p className="text-sm font-semibold text-text-main font-mono">{p.idPeriodo}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Fecha de Inicio</label>
                                        <p className="text-sm font-semibold text-text-main font-mono">{p.fechaInicial ? p.fechaInicial.split('T')[0] : 'N/A'}</p>
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Fecha de Fin</label>
                                        <p className="text-sm font-semibold text-text-main font-mono">{p.fechaFinal ? p.fechaFinal.split('T')[0] : 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Estado</label>
                                        {p.activo ? (
                                             <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activo
                                             </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Inactivo
                                            </span>
                                        )}
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Cerrado</label>
                                        {p.cerrado ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Cerrado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Abierto
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </>
                        );
                    })()}

                    {detailItem.type === 'calendario' && (() => {
                        const c = detailItem.data as EventoNormativo;
                        return (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Hito Normativo</label>
                                        <p className="text-sm font-bold text-text-main">{c.titulo}</p>
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Estado</label>
                                        {c.activo ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activo
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" /> Inactivo
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Fecha Inicio</label>
                                        <p className="text-sm font-bold text-text-main font-mono">{c.fechaInicio}</p>
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Tipo</label>
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0070f3]">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                                            {c.tipoEvento}
                                        </span>
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Recurrente</label>
                                        <p className="text-sm font-bold text-text-main">{c.recurrenciaAnual ? 'Sí (Anual)' : 'No'}</p>
                                    </div>
                                </div>
                                {c.descripcion && (
                                    <div className="bento-card static p-4 space-y-3">
                                        <label className="section-label text-text-main"><Calendar size={12} /> Descripción</label>
                                        <div className="divider-vercel !my-0" />
                                        <p className="text-sm text-text-main leading-relaxed">{c.descripcion}</p>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>

                <div className="modal-footer">
                    <button onClick={() => setDetailItem(null)} className="btn-vercel-secondary">Cerrar</button>
                    <button 
                        onClick={() => {
                            if (detailItem.type === 'periodo') handleOpenPeriodoModal(detailItem.data as PeriodoAcademico);
                            if (detailItem.type === 'calendario') handleOpenCalendarioModal(detailItem.data as EventoNormativo);
                            setDetailItem(null);
                        }}
                        className="btn-vercel-primary flex items-center gap-2"
                    >
                        <Edit2 size={14} /> Editar
                    </button>
                </div>
            </div>
        </div>
    );
};

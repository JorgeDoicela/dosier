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
        <div className="fixed inset-0 z-[9999] flex justify-end">
            <div 
                className="absolute inset-0 bg-bg-deep/90 backdrop-blur-sm cursor-pointer animate-fade-in"
                onClick={() => setDetailItem(null)}
            />
            <div className="relative w-full max-w-xl h-full bg-surface border-l border-border-thin flex flex-col z-10 animate-fade-up overflow-hidden">
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <div className="icon-circle icon-circle-brand">
                            <Calendar size={20} />
                        </div>
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
                                             <span className="badge-vercel badge-vercel-success"><CheckCircle size={10} /> Activo</span>
                                        ) : (
                                            <span className="badge-vercel badge-vercel-error"><XCircle size={10} /> Inactivo</span>
                                        )}
                                    </div>
                                    <div className="bento-card static p-4">
                                        <label className="section-label text-text-dim mb-2">Cerrado</label>
                                        {p.cerrado ? (
                                            <span className="badge-vercel badge-vercel-error"><XCircle size={10} /> Cerrado</span>
                                        ) : (
                                            <span className="badge-vercel badge-vercel-success"><CheckCircle size={10} /> Abierto</span>
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
                                            <span className="badge-vercel badge-vercel-success"><CheckCircle size={10} /> Activo</span>
                                        ) : (
                                            <span className="badge-vercel badge-vercel-error"><XCircle size={10} /> Inactivo</span>
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
                                        <span className="badge-vercel badge-vercel-brand">{c.tipoEvento}</span>
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

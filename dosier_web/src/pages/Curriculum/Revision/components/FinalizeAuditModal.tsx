import React, { useState } from 'react';
import { Scale, X, Loader2, CheckCircle, RotateCcw, Clock } from 'lucide-react';

interface FinalizeAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    generalFeedback: string;
    setGeneralFeedback: (val: string) => void;
    submitting: boolean;
    onAprobar: () => Promise<boolean>;
    onDevolver: (fechaLimite?: string) => Promise<boolean>;
}

export const FinalizeAuditModal: React.FC<FinalizeAuditModalProps> = ({
    isOpen,
    onClose,
    generalFeedback,
    setGeneralFeedback,
    submitting,
    onAprobar,
    onDevolver
}) => {
    // Calculador de fecha límite por defecto (+10 días)
    const getFutureDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    const [fechaLimite, setFechaLimite] = useState<string>(getFutureDate(10));
    const [selectedDays, setSelectedDays] = useState<number>(10);

    if (!isOpen) return null;

    const handlePresetClick = (days: number) => {
        setSelectedDays(days);
        setFechaLimite(getFutureDate(days));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 animate-fade-in font-sans">
            <div className="w-[520px] max-w-[92%] bg-white dark:bg-zinc-950 border border-slate-200/90 dark:border-zinc-800 rounded-xl shadow-2xl p-5 space-y-4 animate-scale-up">
                <div className="flex items-center justify-between border-b border-border-thin/50 pb-3.5">
                    <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#0070f3]" />
                        <span className="text-[11px] font-semibold text-text-main uppercase tracking-widest font-mono">Dictamen de Revisión Técnica</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-surface-hover border border-border-thin rounded-lg text-text-dim hover:text-text-main transition-all cursor-pointer"
                        title="Cerrar modal"
                    >
                        <X size={12} />
                    </button>
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block ml-0.5">Observaciones Generales de la Auditoría</label>
                    <textarea
                        value={generalFeedback}
                        onChange={(e) => setGeneralFeedback(e.target.value)}
                        placeholder="Escriba la síntesis del informe o instrucciones generales de corrección para el docente..."
                        className="w-full h-28 bg-bg-deep border border-border-thin rounded-xl p-3 text-xs text-text-main placeholder:text-text-dim/60 outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 transition-all resize-none leading-relaxed custom-scrollbar"
                        disabled={submitting}
                    />
                </div>

                {/* Selector de Plazo Límite para Devolución */}
                <div className="p-3.5 bg-bg-deep border border-border-thin/80 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-500" /> Plazo Límite de Subsanación (Docente)
                        </label>
                        <span className="text-xs text-text-dim font-medium">Definido por Coordinación</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {[5, 10, 15].map((days) => (
                            <button
                                key={days}
                                type="button"
                                onClick={() => handlePresetClick(days)}
                                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${selectedDays === days
                                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                    : 'border-border-thin text-text-dim hover:text-text-main hover:bg-surface'
                                    }`}
                            >
                                +{days} días
                            </button>
                        ))}
                        <div className="flex-1 relative">
                            <input
                                type="date"
                                value={fechaLimite}
                                onChange={(e) => {
                                    setFechaLimite(e.target.value);
                                    setSelectedDays(0);
                                }}
                                className="w-full bg-surface border border-border-thin rounded-lg px-2.5 py-1 text-xs text-text-main outline-none focus:border-brand/45 font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-border-thin/50 pt-4">
                    <button
                        onClick={async () => {
                            const success = await onAprobar();
                            if (success) onClose();
                        }}
                        disabled={submitting}
                        className="flex items-center justify-center gap-1.5 bg-[#0070f3] hover:bg-[#0060df] text-white rounded-lg shadow-sm py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer active:scale-95 transition-all"
                    >
                        {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                        Aprobar Requisitos
                    </button>

                    <button
                        onClick={async () => {
                            const success = await onDevolver(fechaLimite);
                            if (success) onClose();
                        }}
                        disabled={submitting}
                        className="flex items-center justify-center gap-1.5 bg-transparent hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 rounded-lg py-2.5 text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer active:scale-95"
                    >
                        {submitting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                        Devolver con Plazo
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import {
    Scale,
    X,
    Loader2,
    CheckCircle2,
    RotateCcw,
    Clock,
    KeyRound,
    FileCheck2,
    AlertTriangle,
    Upload
} from 'lucide-react';
import { useAuth } from '../../../../api/AuthContext';

interface FinalizeAuditModalProps {
    isOpen: boolean;
    onClose: () => void;
    generalFeedback: string;
    setGeneralFeedback: (val: string) => void;
    submitting: boolean;
    onAprobar: (
        motivo: string,
        password?: string,
        tipoFirma?: 'DOSIER' | 'FirmaEC',
        certificadoP12Base64?: string,
        contraseniaP12?: string
    ) => Promise<boolean>;
    onDevolver: (fechaLimite?: string) => Promise<boolean>;
    pendingObservationsCount?: number;
    projectTitle?: string;
}

export const FinalizeAuditModal: React.FC<FinalizeAuditModalProps> = ({
    isOpen,
    onClose,
    generalFeedback,
    setGeneralFeedback,
    submitting,
    onAprobar,
    onDevolver,
    pendingObservationsCount = 0,
    projectTitle
}) => {
    const { isCoordCarrera, isCoordAcad, isVicerrector, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState<'avalar' | 'devolver'>('avalar');

    // Firma digital
    const [password, setPassword] = useState('');
    const [tipoFirma, setTipoFirma] = useState<'DOSIER' | 'FirmaEC'>('DOSIER');
    const [certP12Base64, setCertP12Base64] = useState<string>('');
    const [certP12FileName, setCertP12FileName] = useState<string>('');
    const [passP12, setPassP12] = useState('');
    const [motivoAval, setMotivoAval] = useState(
        isVicerrector
            ? 'Aprobación definitiva y legalización microcurricular para vigencia académica e inspección CACES.'
            : isCoordAcad
                ? 'Aval de consistencia metodológica, cuadre de horas y ponderaciones normativas conforme al modelo educativo.'
                : 'Aval curricular favorable: contenidos mínimos, articulación con el perfil de egreso y pertinencia disciplinar aprobados.'
    );

    // Devolución
    const getFutureDate = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split('T')[0];
    };

    const [fechaLimite, setFechaLimite] = useState<string>(getFutureDate(2));
    const [selectedDays, setSelectedDays] = useState<number>(2);

    if (!isOpen) return null;

    const handlePresetClick = (days: number) => {
        setSelectedDays(days);
        setFechaLimite(getFutureDate(days));
    };

    const handleFileP12Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCertP12FileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
            const resultStr = reader.result as string;
            const base64 = resultStr.includes(',') ? resultStr.split(',')[1] : resultStr;
            setCertP12Base64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleConfirmAval = async () => {
        const success = await onAprobar(
            motivoAval,
            password || undefined,
            tipoFirma,
            certP12Base64 || undefined,
            passP12 || undefined
        );
        if (success) onClose();
    };

    const handleConfirmDevolver = async () => {
        const success = await onDevolver(fechaLimite);
        if (success) onClose();
    };

    const getRoleTitle = () => {
        if (isVicerrector) return 'Vicerrectorado Académico';
        if (isCoordAcad) return 'Coordinación Académica';
        if (isCoordCarrera) return 'Coordinación de Carrera';
        return 'Administrador Curricular';
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 animate-fade-in font-sans p-4">
            <div className="w-[560px] max-w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 space-y-5 animate-scale-up">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                    <div className="flex items-center gap-2">
                        <Scale size={16} className="text-[#0070f3]" />
                        <div>
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                                Dictamen de Revisión Curricular
                            </span>
                            <span className="block text-[10px] text-slate-500 dark:text-zinc-400">
                                Rol actuante: <strong className="text-slate-800 dark:text-zinc-200">{getRoleTitle()}</strong>
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-zinc-100 transition-all cursor-pointer"
                        title="Cerrar modal"
                    >
                        <X size={13} />
                    </button>
                </div>

                {/* Selector de Pestañas (Riel Plano) */}
                <div className="flex border-b border-slate-200 dark:border-zinc-800 -mb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('avalar')}
                        className={`pb-2.5 px-4 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'avalar'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                    >
                        <FileCheck2 size={13} />
                        <span>Emitir Aval Favorable</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('devolver')}
                        className={`pb-2.5 px-4 text-xs font-semibold transition-all cursor-pointer border-b-2 flex items-center gap-1.5 ${
                            activeTab === 'devolver'
                                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}
                    >
                        <RotateCcw size={13} />
                        <span>Devolver con Observaciones</span>
                        {pendingObservationsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-amber-500/15 text-amber-600 font-mono">
                                {pendingObservationsCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* ── PESTAÑA 1: EMITIR AVAL INSTITUCIONAL ── */}
                {activeTab === 'avalar' && (
                    <div className="space-y-4 pt-2">
                        {pendingObservationsCount > 0 && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                    <strong className="font-semibold">Existen {pendingObservationsCount} observación(es) pendientes.</strong>
                                    <p className="text-[11px] mt-0.5 leading-relaxed">
                                        Si emite el aval favorable, se asumirá que los ajustes menores son aceptados tácitamente. Si requiere que el docente corrija el texto, use la opción «Devolver con Observaciones».
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                                Motivo o Consideración del Aval
                            </label>
                            <textarea
                                value={motivoAval}
                                onChange={(e) => setMotivoAval(e.target.value)}
                                className="w-full h-20 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 transition-all resize-none leading-relaxed"
                                disabled={submitting}
                            />
                        </div>

                        {/* Método de Firma Oficial */}
                        <div className="p-3.5 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                                    <KeyRound size={13} className="text-[#0070f3]" />
                                    Firma Digital Oficial (Ley 67)
                                </span>
                                <div className="flex items-center gap-1 text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => setTipoFirma('DOSIER')}
                                        className={`px-2 py-0.5 rounded cursor-pointer ${
                                            tipoFirma === 'DOSIER'
                                                ? 'bg-[#0070f3] text-white font-bold'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                        Contraseña DOSIER
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTipoFirma('FirmaEC')}
                                        className={`px-2 py-0.5 rounded cursor-pointer ${
                                            tipoFirma === 'FirmaEC'
                                                ? 'bg-[#0070f3] text-white font-bold'
                                                : 'text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200'
                                        }`}
                                    >
                                        FirmaEC (.p12)
                                    </button>
                                </div>
                            </div>

                            {tipoFirma === 'DOSIER' ? (
                                <div className="space-y-1">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Ingrese su contraseña de acceso para firmar..."
                                        className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 font-mono"
                                        disabled={submitting}
                                    />
                                    <span className="text-[10px] text-slate-400 block">
                                        Se generará el sello HMAC-SHA256 institucional inalterable y código DFRM.
                                    </span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 dark:border-zinc-700 rounded-lg text-xs text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 cursor-pointer">
                                            <Upload size={13} />
                                            <span className="truncate max-w-[200px]">
                                                {certP12FileName || 'Seleccionar archivo .p12'}
                                            </span>
                                            <input
                                                type="file"
                                                accept=".p12,.pfx"
                                                onChange={handleFileP12Change}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <input
                                        type="password"
                                        value={passP12}
                                        onChange={(e) => setPassP12(e.target.value)}
                                        placeholder="Contraseña del certificado .p12..."
                                        className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-[#0070f3] font-mono"
                                        disabled={submitting}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAval}
                                disabled={submitting || (tipoFirma === 'DOSIER' && !password.trim()) || (tipoFirma === 'FirmaEC' && (!certP12Base64 || !passP12))}
                                className="flex items-center gap-1.5 px-4 py-2 bg-[#0070f3] hover:bg-[#0060df] text-white rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer shadow-sm active:scale-95 transition-all"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                                Firmar y Avalar PEA
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PESTAÑA 2: DEVOLVER CON OBSERVACIONES ── */}
                {activeTab === 'devolver' && (
                    <div className="space-y-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
                                Instrucciones Generales para el Docente Elaborador
                            </label>
                            <textarea
                                value={generalFeedback}
                                onChange={(e) => setGeneralFeedback(e.target.value)}
                                placeholder="Escriba un resumen de las inconsistencias encontradas o indicaciones de subsanación..."
                                className="w-full h-24 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15 transition-all resize-none leading-relaxed"
                                disabled={submitting}
                            />
                        </div>

                        {/* Plazo límite de subsanación */}
                        <div className="p-3 bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-mono text-slate-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock size={13} className="text-amber-500" /> Plazo Límite de Subsanación
                                </label>
                                <span className="text-[10px] text-slate-400 font-mono">Reglamento ISTPET</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {[2, 5, 10].map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        onClick={() => handlePresetClick(days)}
                                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                                            selectedDays === days
                                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400'
                                                : 'border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        +{days} {days === 2 ? 'días (48h)' : 'días'}
                                    </button>
                                ))}
                                <div className="flex-1">
                                    <input
                                        type="date"
                                        value={fechaLimite}
                                        onChange={(e) => {
                                            setFechaLimite(e.target.value);
                                            setSelectedDays(0);
                                        }}
                                        className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 outline-none focus:border-amber-500 font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-zinc-800 pt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={submitting}
                                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 border border-slate-200 dark:border-zinc-800 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDevolver}
                                disabled={submitting}
                                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold uppercase tracking-wider disabled:opacity-40 cursor-pointer shadow-sm active:scale-95 transition-all"
                            >
                                {submitting ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />}
                                Devolver al Docente
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

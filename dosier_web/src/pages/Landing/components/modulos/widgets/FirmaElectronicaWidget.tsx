import React from 'react';
import { Key, Check, RefreshCw } from 'lucide-react';

interface FirmaElectronicaWidgetProps {
    signState: 'idle' | 'scanning' | 'signed';
    signProgress: number;
    signTimestamp: string;
    startSigning: () => void;
    resetSignature: () => void;
}

export const FirmaElectronicaWidget: React.FC<FirmaElectronicaWidgetProps> = ({
    signState,
    signProgress,
    signTimestamp,
    startSigning,
    resetSignature
}) => {
    return (
        <div className="h-full flex flex-col gap-3">

            {/* Header del widget */}
            <div className="flex justify-between items-center border-b border-border-thin/40 pb-2 text-[10px] font-mono text-text-dim">
                <span className="font-semibold text-text-main">// FIRMA DIGITAL DE PLANIFICACIÓN</span>
                <span>MOD-05</span>
            </div>

            {/* Panel interactivo de firma */}
            <div className="flex-1 flex flex-col justify-center font-mono text-[9px]">

                {/* Folio del Documento Digital Interactivo */}
                <div className="bg-surface p-2.5 rounded-lg border border-border-thin text-left font-mono mb-2 shadow-sm">
                    <div className="flex justify-between items-center text-[8.5px] border-b border-border-thin/40 pb-1.5 mb-1.5">
                        <span className="font-bold text-text-main">DOCUMENTO: pea_oficial_2026.pdf</span>
                        <div className="flex items-center gap-1.5 font-mono text-[8px]">
                            <span className={`w-1.5 h-1.5 rounded-full ${signState === 'signed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <span className={signState === 'signed' ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                                {signState === 'signed' ? 'FIRMADO' : 'PENDIENTE'}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1 text-[8px] text-text-dim">
                        <p>ASIGNATURA: Desarrollo de Software - Nivel IV (DOSIER-ISTPET)</p>
                    </div>
                </div>

                {signState === 'idle' && (
                    <div className="space-y-3">
                        <p className="text-[9px] text-text-dim uppercase tracking-wider font-mono">// DISPOSITIVO DE FIRMA LISTO</p>
                        <div className="p-3.5 border border-dashed border-border-thin rounded-lg flex items-center justify-center bg-bg-deep">
                            <span className="text-[9px] text-text-dim/80">Certificado digital p12 cargado.</span>
                        </div>
                        <button
                            onClick={startSigning}
                            className="w-full py-2.5 bg-[#0070f3] hover:bg-[#0060df] text-white rounded-lg font-medium font-sans text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
                        >
                            <Key size={13} strokeWidth={1.5} />
                            Firmar PEA y Sílabo Oficial
                        </button>
                    </div>
                )}

                {signState === 'scanning' && (
                    <div className="space-y-3">
                        <div className="relative h-20 border border-[#0070f3]/20 bg-bg-deep rounded-lg flex flex-col items-center justify-center overflow-hidden">
                            <div className="animate-scan-line" />
                            <Key size={28} className="text-[#0070f3]/60 animate-pulse" strokeWidth={1.5} />
                            <span className="text-[9px] text-[#0070f3] font-semibold mt-2 tracking-widest animate-pulse">GENERANDO FIRMA CRIPTOGRÁFICA...</span>
                        </div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-[9px] text-[#0070f3]/80 font-mono">
                                <span>APLICANDO SELLO CRIPTOGRÁFICO P12</span>
                                <span>{signProgress}%</span>
                            </div>
                            <div className="w-full h-1 bg-border-thin rounded-sm overflow-hidden">
                                <div className="h-full bg-[#0070f3] transition-all duration-75" style={{ width: `${signProgress}%` }} />
                            </div>
                        </div>
                    </div>
                )}

                {signState === 'signed' && (
                    <div className="space-y-3 animate-fade-in text-left">
                        {/* Encabezado del Certificado Digital */}
                        <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Check size={16} strokeWidth={2} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <div>
                                    <p className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 font-sans leading-none">CERTIFICACIÓN VÁLIDA</p>
                                    <p className="text-[8px] text-text-dim mt-0.5 font-mono">Banco Central del Ecuador</p>
                                </div>
                            </div>
                            <button
                                onClick={resetSignature}
                                className="text-text-dim hover:text-text-main text-[8.5px] font-mono border border-border-thin px-2 py-1 rounded cursor-pointer transition-all hover:bg-surface active:scale-95 flex items-center gap-1.5 bg-surface"
                            >
                                <RefreshCw size={10} strokeWidth={1.5} /> REINICIAR
                            </button>
                        </div>

                        {/* Detalles del Firmante Oficial */}
                        <div className="bg-surface/35 border border-border-thin/40 p-3 rounded-lg space-y-2 text-[9px] font-mono">
                            <div className="grid grid-cols-2 gap-2 border-b border-border-thin/20 pb-2">
                                <div>
                                    <span className="text-[8px] text-text-dim block uppercase font-sans">Firmante</span>
                                    <span className="text-text-main font-semibold block mt-0.5">Dr. Jorge Doicela</span>
                                </div>
                                <div>
                                    <span className="text-[8px] text-text-dim block uppercase font-sans">Cargo</span>
                                    <span className="text-text-main font-semibold block mt-0.5">Director I+D</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <div>
                                    <span className="text-[8px] text-text-dim block uppercase font-sans">Fecha de Firma</span>
                                    <span className="text-text-main font-semibold block mt-0.5">{signTimestamp}</span>
                                </div>
                                <div>
                                    <span className="text-[8px] text-text-dim block uppercase font-sans">Entidad</span>
                                    <span className="text-success font-semibold block mt-0.5">FirmaEC (IST)</span>
                                </div>
                            </div>
                            <div className="border-t border-border-thin/20 pt-2 mt-1">
                                <span className="text-[7.5px] text-text-dim block uppercase font-sans">Hash Criptográfico</span>
                                <span className="text-brand font-bold text-[8.5px] block truncate font-mono mt-0.5">
                                    8f3b2a1c9e8d7f6c4b2a3e9c8a7b6c5d4e3f2a1b
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};

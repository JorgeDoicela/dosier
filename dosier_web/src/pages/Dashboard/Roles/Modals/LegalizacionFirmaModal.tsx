import React, { useState } from 'react';
import { Award, QrCode, ShieldCheck, CheckCircle2, X, Clock, FileText, Lock } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tituloDocumento: string;
    carrera: string;
    esMasivo?: boolean;
    cantidadPeas?: number;
    onFirmadoExitoso: () => void;
}

export const LegalizacionFirmaModal: React.FC<Props> = ({
    isOpen,
    onClose,
    tituloDocumento,
    carrera,
    esMasivo = false,
    cantidadPeas = 1,
    onFirmadoExitoso
}) => {
    const { addToast } = useNotifications();
    const [pinSeguridad, setPinSeguridad] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [shaHash] = useState('0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069');

    if (!isOpen) return null;

    const handleFirmar = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSigning(true);
        setTimeout(() => {
            setIsSigning(false);
            if (esMasivo) {
                addToast(
                    'Legalización Curricular en Bloque Concluida',
                    `Se firmaron y legalizaron ${cantidadPeas} PEAs de la carrera ${carrera} con sello criptográfico SHA-256 institucional.`,
                    'success'
                );
            } else {
                addToast(
                    'PEA Legalizado y Publicado',
                    `Se estampó la firma digital de Vicerrectorado Académico en "${tituloDocumento}". Documento inmutable y disponible en portal público con QR.`,
                    'success'
                );
            }
            onFirmadoExitoso();
            onClose();
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
                            <Award className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                {esMasivo ? 'Legalización y Firma Digital Masiva' : 'Legalización en Firme del PEA'}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Vicerrectorado Académico • Despacho Institucional CACES
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleFirmar} className="p-6 space-y-5">
                    <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-white">
                            <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Garantía de Inmutabilidad Curricular
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400">
                            {esMasivo
                                ? `Se estampará la firma de Vicerrectorado en ${cantidadPeas} instrumentos curriculares avalados de la carrera ${carrera}.`
                                : `El instrumento "${tituloDocumento}" ya cuenta con los avales previos de Coordinación de Carrera y Coordinación Académica.`}
                        </p>
                    </div>

                    {/* Previsualización Criptográfica */}
                    <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-white">
                            <span className="flex items-center gap-2">
                                <QrCode className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                                Estampado Criptográfico y Código QR
                            </span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                                SHA-256 VALIDADO
                            </span>
                        </div>
                        <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-900 font-mono text-[10px] text-zinc-500 break-all">
                            {shaHash}
                        </div>
                        <p className="text-[11px] text-zinc-500">
                            Certificado emitido a nombre de: <strong>Msc. Freddy Baño (Vicerrector Académico)</strong>
                        </p>
                    </div>

                    {/* PIN o Confirmación */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            PIN de Seguridad / Autorización Institucional
                        </label>
                        <input
                            type="password"
                            placeholder="Ingrese su clave institucional (ej: 12345)"
                            value={pinSeguridad}
                            onChange={e => setPinSeguridad(e.target.value)}
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                            required
                        />
                        <span className="text-[11px] text-zinc-400 mt-1 block">
                            Simulación: Puede ingresar cualquier valor para ejecutar la acción.
                        </span>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSigning}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSigning ? (
                                <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Estampando Firma Digital...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    {esMasivo ? `Firmar y Legalizar en Bloque (${cantidadPeas})` : 'Legalizar y Publicar'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

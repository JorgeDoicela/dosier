import React from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { PeaBandejaItemDto } from '../../../services/peaService';

interface CancelarColaboracionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    pea: PeaBandejaItemDto | null;
    isCanceling: boolean;
}

export const CancelarColaboracionModal: React.FC<CancelarColaboracionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    pea,
    isCanceling
}) => {
    if (!isOpen || !pea || typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop oscuro sin transparencias translúcidas ni blur que cubre toda la pantalla y el sidebar */}
            <div
                className="fixed inset-0 bg-black/60 transition-opacity"
                onClick={isCanceling ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Contenedor central con fondo 100% sólido */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Cabecera del modal */}
                <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            Retirar Solicitud de Colaboración
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {pea.nombre_asignatura} · Titular: {pea.nombre_docente_elaborador || 'Docente titular'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCanceling}
                        className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cuerpo explicativo claro y directo */}
                <div className="p-6 space-y-4 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <p className="font-semibold text-slate-900 dark:text-white">
                            ¿Deseas cancelar esta solicitud?
                        </p>
                        <p>
                            Se cancelará la solicitud enviada a <strong>{pea.nombre_docente_elaborador || 'el docente titular'}</strong> para colaborar en el PEA de <strong>{pea.nombre_asignatura}</strong>.
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-zinc-400 pl-1">
                            <li>
                                El docente titular ya no tendrá pendiente esta autorización en su plataforma.
                            </li>
                            <li>
                                La materia volverá a quedar disponible por si deseas enviar una nueva solicitud más adelante.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Pie con acciones directas */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isCanceling}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Mantener Solicitud
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isCanceling}
                        className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        {isCanceling ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Retirando...</span>
                            </>
                        ) : (
                            <span>Quitar Solicitud</span>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};


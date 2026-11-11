import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';
import type { PeaBandejaItemDto } from '../../../services/peaService';

interface SolicitarColaboracionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (motivo?: string) => Promise<void>;
    pea: PeaBandejaItemDto | null;
    isRequesting: boolean;
}

export const SolicitarColaboracionModal: React.FC<SolicitarColaboracionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    pea,
    isRequesting
}) => {
    const [motivo, setMotivo] = useState('');

    if (!isOpen || !pea || typeof document === 'undefined') return null;

    const handleConfirm = async () => {
        await onConfirm(motivo.trim() ? motivo.trim() : undefined);
        setMotivo('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop oscuro sólido que cubre toda la pantalla incluyendo el sidebar y topbar */}
            <div
                className="fixed inset-0 bg-black/60 transition-opacity"
                onClick={isRequesting ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Contenedor central del modal con fondo 100% sólido */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Cabecera del modal */}
                <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            Solicitar Colaboración Curricular
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {pea.nombre_asignatura} · Titular: {pea.nombre_docente_elaborador || 'Docente Asignado'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRequesting}
                        className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Contenido explicativo del modal */}
                <div className="p-6 space-y-5 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
                    {/* Explicación de impacto y flujo normativo */}
                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <p className="font-semibold text-slate-900 dark:text-white">
                            ¿Cómo funciona la colaboración?
                        </p>
                        <p>
                            Al confirmar, se enviará una solicitud a <strong>{pea.nombre_docente_elaborador || 'el docente titular'}</strong> para trabajar de forma conjunta en el PEA de <strong>{pea.nombre_asignatura}</strong>.
                        </p>
                        <ul className="list-disc list-inside space-y-1.5 text-slate-500 dark:text-zinc-400 pl-1">
                            <li>El docente titular recibirá una notificación para aceptar o declinar la solicitud.</li>
                            <li>Una vez aceptada, ambos podrán ingresar y editar el documento al mismo tiempo.</li>
                        </ul>
                    </div>

                    {/* Justificación opcional */}
                    <div className="space-y-1.5 pt-1">
                        <label
                            htmlFor="motivo-colaboracion"
                            className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
                        >
                            Mensaje para el docente titular (Opcional)
                        </label>
                        <textarea
                            id="motivo-colaboracion"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej. Coordinar temas de la asignatura, bibliografía o planificación de unidades..."
                            rows={3}
                            disabled={isRequesting}
                            className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0070f3] disabled:opacity-50 resize-none"
                        />
                    </div>
                </div>

                {/* Pie del modal con acciones directas */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isRequesting}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isRequesting}
                        className="bg-[#0070f3] hover:bg-[#0060df] text-white shadow-xs px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                    >
                        {isRequesting ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Enviando Solicitud...</span>
                            </>
                        ) : (
                            <span>Confirmar y Enviar Solicitud</span>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};


import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2 } from 'lucide-react';

interface ConfirmarRespuestaColaboracionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (motivo?: string) => Promise<void>;
    modo: 'aceptar' | 'rechazar';
    solicitanteNombre: string;
    asignaturaNombre: string;
    isProcessing: boolean;
}

export const ConfirmarRespuestaColaboracionModal: React.FC<ConfirmarRespuestaColaboracionModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    modo,
    solicitanteNombre,
    asignaturaNombre,
    isProcessing
}) => {
    const [motivo, setMotivo] = useState('');

    if (!isOpen || typeof document === 'undefined') return null;

    const esAceptar = modo === 'aceptar';

    const handleConfirm = async () => {
        await onConfirm(motivo.trim() ? motivo.trim() : undefined);
        setMotivo('');
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop oscuro sin transparencias translúcidas ni blur que cubre toda la pantalla */}
            <div
                className="fixed inset-0 bg-black/60 transition-opacity"
                onClick={isProcessing ? undefined : onClose}
                aria-hidden="true"
            />

            {/* Contenedor central con fondo 100% sólido */}
            <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                {/* Cabecera del modal */}
                <div className="px-6 py-5 bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex items-start justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                            {esAceptar ? 'Autorizar Colaboración Curricular' : 'Rechazar Solicitud de Colaboración'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                            {asignaturaNombre} · Solicitante: {solicitanteNombre}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                        aria-label="Cerrar modal"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cuerpo explicativo */}
                <div className="p-6 space-y-5 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
                    {/* Explicación de impacto */}
                    <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {esAceptar ? '¿Qué ocurre al autorizar?' : '¿Qué ocurre al rechazar?'}
                        </p>
                        {esAceptar ? (
                            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-zinc-400 pl-1">
                                <li>
                                    <strong>{solicitanteNombre}</strong> tendrá acceso completo para editar las secciones del PEA de esta asignatura.
                                </li>
                                <li>
                                    Podrán redactar en simultáneo y ver los cambios en tiempo real en la plataforma.
                                </li>
                                <li>
                                    Usted mantendrá la titularidad principal de la asignatura en el distributivo oficial.
                                </li>
                            </ul>
                        ) : (
                            <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-zinc-400 pl-1">
                                <li>
                                    <strong>{solicitanteNombre}</strong> no tendrá permisos de edición sobre este instrumento.
                                </li>
                                <li>
                                    Se registrará la declinación formal en el registro de solicitudes del docente.
                                </li>
                            </ul>
                        )}
                    </div>

                    {/* Observación o motivo (opcional al aceptar, recomendado al rechazar) */}
                    <div className="space-y-1.5 pt-1">
                        <label
                            htmlFor="motivo-respuesta"
                            className="block text-xs font-medium text-slate-700 dark:text-zinc-300"
                        >
                            {esAceptar ? 'Mensaje o Indicaciones (Opcional)' : 'Motivo del Rechazo (Opcional)'}
                        </label>
                        <textarea
                            id="motivo-respuesta"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder={
                                esAceptar
                                    ? 'Ej. Coordinar aportes en la unidad 2 y bibliografía complementaria...'
                                    : 'Ej. Asignatura con planificación curricular ya completada...'
                            }
                            rows={3}
                            disabled={isProcessing}
                            className="w-full rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#0070f3] disabled:opacity-50 resize-none"
                        />
                    </div>
                </div>

                {/* Pie con acciones directas */}
                <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isProcessing}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-200/60 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        Cancelar
                    </button>
                    {esAceptar ? (
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="bg-[#0070f3] hover:bg-[#0060df] text-white shadow-xs px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Autorizando...</span>
                                </>
                            ) : (
                                <span>Autorizar Colaboración</span>
                            )}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isProcessing}
                            className="bg-rose-600 hover:bg-rose-700 text-white shadow-xs px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    <span>Rechazando...</span>
                                </>
                            ) : (
                                <span>Confirmar Rechazo</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};


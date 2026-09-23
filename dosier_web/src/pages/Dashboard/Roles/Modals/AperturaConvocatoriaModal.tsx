import React, { useState } from 'react';
import { Calendar, Bell, ShieldCheck, X, CheckCircle2, Clock } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConvocatoriaActivada: () => void;
}

export const AperturaConvocatoriaModal: React.FC<Props> = ({ isOpen, onClose, onConvocatoriaActivada }) => {
    const { addToast } = useNotifications();
    const [periodo, setPeriodo] = useState('2025-A');
    const [fechaLimiteDocentes, setFechaLimiteDocentes] = useState('2025-04-15');
    const [fechaLimiteCarrera, setFechaLimiteCarrera] = useState('2025-04-22');
    const [fechaLimiteAcademica, setFechaLimiteAcademica] = useState('2025-04-30');
    const [notificarEmail, setNotificarEmail] = useState(true);
    const [notificarPush, setNotificarPush] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            addToast(
                'Convocatoria 2025-A Aperturada',
                'Se activó el calendario curricular del PEA y se despacharon notificaciones a los 28 docentes asignados en SIGAFI.',
                'success'
            );
            onConvocatoriaActivada();
            onClose();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                Apertura de Convocatoria Curricular PEA
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Disparador oficial institucional de Coordinación Académica
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

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            Regla de Gobernanza Institucional
                        </div>
                        <p>
                            Al activar la convocatoria, las asignaciones docentes vigentes en SIGAFI se sincronizan automáticamente y se habilitan los tableros de co-redacción para todos los profesores.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Período Académico
                            </label>
                            <input
                                type="text"
                                value={periodo}
                                onChange={e => setPeriodo(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Docentes (Elaboración)
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteDocentes}
                                onChange={e => setFechaLimiteDocentes(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Coordinación de Carrera
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteCarrera}
                                onChange={e => setFechaLimiteCarrera(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Coordinación Académica
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteAcademica}
                                onChange={e => setFechaLimiteAcademica(e.target.value)}
                                className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Canales de Notificación Automatizada:
                        </span>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificarEmail}
                                    onChange={e => setNotificarEmail(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Enviar convocatoria por Correo Electrónico Institucional a los 28 docentes
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificarPush}
                                    onChange={e => setNotificarPush(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Generar alerta prioritaria en la campana de notificaciones de DOSIER
                            </label>
                        </div>
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
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Activando Convocatoria...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Activar Convocatoria y Notificar
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

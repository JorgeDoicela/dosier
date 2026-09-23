import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, X } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onProrrogaConcedida: () => void;
}

export const ProrrogaPlazoModal: React.FC<Props> = ({ isOpen, onClose, onProrrogaConcedida }) => {
    const { addToast } = useNotifications();
    const [carrera, setCarrera] = useState('Todas las Carreras');
    const [diasProrroga, setDiasProrroga] = useState('5');
    const [justificativo, setJustificativo] = useState('Resolución de Coordinación Académica por ajuste de cronograma de matriculación extraordinaria.');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            addToast(
                'Prórroga Curricular Concedida',
                `Se otorgaron ${diasProrroga} días adicionales a ${carrera}. Se actualizaron los plazos en los calendarios docentes.`,
                'success'
            );
            onProrrogaConcedida();
            onClose();
        }, 700);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                Conceder Prórroga / Extensión de Plazo
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Coordinación Académica Institucional
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

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Destinatarios de la Extensión
                        </label>
                        <select
                            value={carrera}
                            onChange={e => setCarrera(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                        >
                            <option value="Todas las Carreras">Todas las Carreras (Institucional)</option>
                            <option value="Desarrollo de Software">Desarrollo de Software</option>
                            <option value="Mecánica Industrial">Mecánica Industrial</option>
                            <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Días Hábiles Adicionales
                        </label>
                        <select
                            value={diasProrroga}
                            onChange={e => setDiasProrroga(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                        >
                            <option value="3">3 Días adicionales</option>
                            <option value="5">5 Días adicionales</option>
                            <option value="7">7 Días adicionales (1 semana)</option>
                            <option value="15">15 Días adicionales</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Motivo / Justificativo Académico
                        </label>
                        <textarea
                            rows={3}
                            value={justificativo}
                            onChange={e => setJustificativo(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                            required
                        />
                    </div>

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
                                    Aplicando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Aplicar Extensión
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

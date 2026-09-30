import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, X, CheckCircle2, Clock } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';
import { docenteAsignaturasService, type PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConvocatoriaActivada: () => void;
}

export const AperturaConvocatoriaModal: React.FC<Props> = ({ isOpen, onClose, onConvocatoriaActivada }) => {
    const { addToast } = useNotifications();
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [periodo, setPeriodo] = useState('');
    const [fechaLimiteDocentes, setFechaLimiteDocentes] = useState('');
    const [fechaLimiteCarrera, setFechaLimiteCarrera] = useState('');
    const [fechaLimiteAcademica, setFechaLimiteAcademica] = useState('');
    const [notificarEmail, setNotificarEmail] = useState(true);
    const [notificarPush, setNotificarPush] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        docenteAsignaturasService.getPeriodosAcademicos().then(list => {
            setPeriodos(list);
            const activo = list.find(p => p.es_activo) || list[0];
            if (activo) {
                setPeriodo(activo.id_periodo);
                if (activo.fecha_final) {
                    setFechaLimiteAcademica(activo.fecha_final.split('T')[0]);
                }
            }
        }).catch(() => {});
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            addToast(
                `Período ${periodo} Activado`,
                'Se activó el calendario curricular del PEA y se habilitó la formulación para los docentes asignados en SIGAFI.',
                'success'
            );
            onConvocatoriaActivada();
            onClose();
        }, 700);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div 
                className="w-full max-w-xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-[#0070f3] dark:text-blue-400 shrink-0" />
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                Apertura de Período Curricular PEA
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Disparador oficial institucional de Coordinación Académica
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-white">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Regla de Gobernanza Institucional
                        </div>
                        <p>
                            Al activar el período académico, las asignaciones docentes vigentes en SIGAFI se sincronizan automáticamente y se habilitan los tableros de formulación del PEA para los profesores correspondientes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Período Académico (SIGAFI)
                            </label>
                            {periodos.length > 0 ? (
                                <select
                                    value={periodo}
                                    onChange={e => setPeriodo(e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                    required
                                >
                                    {periodos.map(p => (
                                        <option key={p.id_periodo} value={p.id_periodo}>
                                            {p.id_periodo} — {p.detalle || 'Período Ordinario'} {p.es_activo ? '(Activo)' : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={periodo}
                                    onChange={e => setPeriodo(e.target.value)}
                                    placeholder="Ej: 2025-A"
                                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                    required
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Docentes (Elaboración)
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteDocentes}
                                onChange={e => setFechaLimiteDocentes(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Coordinación de Carrera
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteCarrera}
                                onChange={e => setFechaLimiteCarrera(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Plazo Coordinación Académica
                            </label>
                            <input
                                type="date"
                                value={fechaLimiteAcademica}
                                onChange={e => setFechaLimiteAcademica(e.target.value)}
                                className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
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
                                Enviar convocatoria por Correo Electrónico Institucional al cuerpo docente asignado
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={notificarPush}
                                    onChange={e => setNotificarPush(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Generar alerta prioritaria en el buzón de notificaciones de DOSIER
                            </label>
                        </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Clock className="w-3.5 h-3.5 animate-spin" />
                                    Activando Convocatoria...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Activar Convocatoria
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

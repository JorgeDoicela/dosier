import React, { useState } from 'react';
import { Bell, AlertTriangle, Send, X, CheckCircle2, User, Clock } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';
import { MOCK_DOCENTES_REZAGADOS } from '../data/mockCurricularData';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tituloContexto?: string;
}

export const RecordatorioDocentesModal: React.FC<Props> = ({
    isOpen,
    onClose,
    tituloContexto = 'Recordatorio Masivo a Docentes Rezagados'
}) => {
    const { addToast } = useNotifications();
    const [mensaje, setMensaje] = useState(
        'Estimado/a docente, le recordamos que el plazo institucional para la entrega y envío a revisión técnica de su PEA vence en 4 días. Por favor complete las secciones pendientes y verifique la sumatoria de horas según el Art. 21 del CES.'
    );
    const [selectedDocentes, setSelectedDocentes] = useState<string[]>(
        MOCK_DOCENTES_REZAGADOS.map(d => d.email)
    );
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const toggleDocente = (email: string) => {
        setSelectedDocentes(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleEnviar = () => {
        if (selectedDocentes.length === 0) {
            addToast('Seleccione al menos un docente', 'Debe marcar al menos un docente de la lista para notificar.', 'warning');
            return;
        }

        setIsSending(true);
        setTimeout(() => {
            setIsSending(false);
            addToast(
                'Recordatorios Enviados con Éxito',
                `Se despachó la alerta prioritaria a ${selectedDocentes.length} docente(s) por correo y sistema.`,
                'success'
            );
            onClose();
        }, 700);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                {tituloContexto}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Notificación de urgencia para cumplimiento de cronograma del PEA
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

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Docentes Detectados con Entregas Pendientes ({MOCK_DOCENTES_REZAGADOS.length})
                            </label>
                            <span className="text-xs text-zinc-500">
                                {selectedDocentes.length} seleccionados
                            </span>
                        </div>
                        <div className="space-y-2">
                            {MOCK_DOCENTES_REZAGADOS.map((d, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => toggleDocente(d.email)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                        selectedDocentes.includes(d.email)
                                            ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-60'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedDocentes.includes(d.email)}
                                            onChange={() => {}}
                                            className="rounded border-zinc-300 dark:border-zinc-700"
                                        />
                                        <div>
                                            <p className="text-xs font-medium text-zinc-900 dark:text-white">
                                                {d.nombre}
                                            </p>
                                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                                {d.asignatura} • {d.carrera}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            {d.estado}
                                        </span>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                            Quedan {d.dias_restantes} días
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Cuerpo del Mensaje de Notificación
                        </label>
                        <textarea
                            rows={4}
                            value={mensaje}
                            onChange={e => setMensaje(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                    <p className="text-xs text-zinc-500">
                        Canal: Correo Institucional + Notificación Push
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleEnviar}
                            disabled={isSending || selectedDocentes.length === 0}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSending ? (
                                <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Despachando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Despachar Recordatorio ({selectedDocentes.length})
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

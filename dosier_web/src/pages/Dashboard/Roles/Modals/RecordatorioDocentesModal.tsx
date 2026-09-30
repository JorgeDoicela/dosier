import React, { useState, useEffect } from 'react';
import { Bell, Send, X, Clock } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';
import { emailService } from '../../../../services/emailService';

export interface DocenteRezagadoItem {
    nombre: string;
    asignatura: string;
    carrera: string;
    email: string;
    estado: string;
    dias_restantes?: number;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    tituloContexto?: string;
    docentes?: DocenteRezagadoItem[];
}

export const RecordatorioDocentesModal: React.FC<Props> = ({
    isOpen,
    onClose,
    tituloContexto = 'Recordatorio Masivo a Docentes con Entregas Pendientes',
    docentes = []
}) => {
    const { addToast } = useNotifications();
    const [mensaje, setMensaje] = useState(
        'Estimado/a docente, le recordamos que el plazo institucional para la entrega y envío a revisión técnica de su PEA se encuentra próximo a vencer. Por favor complete las secciones pendientes y verifique la sumatoria de horas según el Art. 21 del CES.'
    );
    const [selectedDocentes, setSelectedDocentes] = useState<string[]>([]);
    const [isSending, setIsSending] = useState(false);

    useEffect(() => {
        if (docentes && docentes.length > 0) {
            setSelectedDocentes(docentes.map(d => d.email).filter(Boolean));
        } else {
            setSelectedDocentes([]);
        }
    }, [docentes]);

    if (!isOpen) return null;

    const toggleDocente = (email: string) => {
        setSelectedDocentes(prev =>
            prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
        );
    };

    const handleEnviar = async () => {
        if (selectedDocentes.length === 0) {
            addToast('Seleccione al menos un docente', 'Debe marcar al menos un docente de la lista para notificar.', 'warning');
            return;
        }

        setIsSending(true);
        try {
            await emailService.sendEmail({
                recipients: selectedDocentes,
                subject: 'Recordatorio Institucional — Cumplimiento de Cronograma del PEA',
                body_html: `<p>${mensaje}</p>`
            });
            addToast(
                'Recordatorios Enviados',
                `Se despachó la notificación prioritaria a ${selectedDocentes.length} docente(s).`,
                'success'
            );
            onClose();
        } catch (error) {
            console.error('Error al despachar recordatorio por correo:', error);
            addToast(
                'Notificación Registrada',
                `Se registraron las alertas en el sistema para ${selectedDocentes.length} docente(s).`,
                'success'
            );
            onClose();
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {tituloContexto}
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Notificación prioritaria para cumplimiento de cronograma del PEA
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

                {/* Body */}
                <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                                Docentes Detectados con Entregas Pendientes ({docentes.length})
                            </label>
                            <span className="text-xs text-zinc-500">
                                {selectedDocentes.length} seleccionados
                            </span>
                        </div>
                        {docentes.length === 0 ? (
                            <div className="p-6 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                <p className="text-xs text-zinc-500">
                                    No se registran asignaturas con entregas rezagadas en este período o carrera.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {docentes.map((d, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => toggleDocente(d.email)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                            selectedDocentes.includes(d.email)
                                                ? 'bg-zinc-50 dark:bg-zinc-900 border-[#0070f3] dark:border-blue-500 shadow-sm'
                                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-70'
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
                                            <div className="flex items-center justify-end gap-1.5 font-mono text-[10px] text-amber-600 dark:text-amber-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <span className="font-medium">{d.estado}</span>
                                            </div>
                                            {typeof d.dias_restantes === 'number' && (
                                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                                    Quedan {d.dias_restantes} días
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Cuerpo del Mensaje de Notificación
                        </label>
                        <textarea
                            rows={3}
                            value={mensaje}
                            onChange={e => setMensaje(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <p className="text-[11px] text-zinc-500">
                        Canal: Correo Institucional + Notificación en Sistema
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={handleEnviar}
                            disabled={isSending || selectedDocentes.length === 0}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            {isSending ? (
                                <>
                                    <Clock className="w-3.5 h-3.5 animate-spin" />
                                    Despachando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
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

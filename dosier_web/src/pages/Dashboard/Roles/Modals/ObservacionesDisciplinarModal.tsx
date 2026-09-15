import React, { useState } from 'react';
import { AlertTriangle, Send, X, Clock, CheckCircle2, FileEdit } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asignatura: string;
    docente: string;
    onObservacionGuardada: (obs: string, seccion: string) => void;
}

const SECCIONES_PEA = [
    'Sección A: Datos Generales e Institucionales',
    'Sección B: Prerrequisitos y Correquisitos',
    'Sección C: Descripción y Caracterización de la Asignatura',
    'Sección D: Objetivos y Resultados de Aprendizaje',
    'Sección E: Contenidos Temáticos y Distribución de Horas',
    'Sección F: Metodología y Ambientes de Aprendizaje',
    'Sección G: Vinculación con la Sociedad / Prácticas Preprofesionales',
    'Sección H: Políticas y Criterios de Evaluación (Matriz 30 pts)',
    'Sección I: Perfil del Docente de Cátedra',
    'Sección J: Bibliografía Básica y Complementaria (APA 7ma ed.)',
    'Sección K: Firmas de Legalización y Aprobación'
];

export const ObservacionesDisciplinarModal: React.FC<Props> = ({
    isOpen,
    onClose,
    asignatura,
    docente,
    onObservacionGuardada
}) => {
    const { addToast } = useNotifications();
    const [seccion, setSeccion] = useState(SECCIONES_PEA[4]); // Contenidos Temáticos
    const [observacion, setObservacion] = useState(
        'Las horas de prácticas experimentales deben ajustarse a 32 horas exactas para cumplir con la malla curricular aprobada por el CES. Por favor desglosar las actividades de laboratorio.'
    );
    const [plazoHoras, setPlazoHoras] = useState('48');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleEnviar = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            addToast(
                'Observación Registrada y PEA Devuelto',
                `Se notificó a ${docente} para que subsane las observaciones en un plazo de ${plazoHoras} horas.`,
                'warning'
            );
            onObservacionGuardada(observacion, seccion);
            onClose();
        }, 700);
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
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                Solicitar Correcciones Disciplinares
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Devolución formal a Borrador para subsanación del docente
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
                <form onSubmit={handleEnviar} className="p-6 space-y-4">
                    <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                        <span className="font-semibold text-zinc-900 dark:text-white block">
                            {asignatura}
                        </span>
                        <span className="text-zinc-500">
                            Docente responsable: {docente}
                        </span>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Sección Curricular con Observación
                        </label>
                        <select
                            value={seccion}
                            onChange={e => setSeccion(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                        >
                            {SECCIONES_PEA.map((s, idx) => (
                                <option key={idx} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Detalle Técnico de la Observación y Criterio de Subsanación
                        </label>
                        <textarea
                            rows={4}
                            value={observacion}
                            onChange={e => setObservacion(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                            Plazo Máximo para Subsanar
                        </label>
                        <select
                            value={plazoHoras}
                            onChange={e => setPlazoHoras(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                        >
                            <option value="24">24 Horas (Urgente)</option>
                            <option value="48">48 Horas (Estándar)</option>
                            <option value="72">72 Horas (Complejo)</option>
                        </select>
                    </div>

                    {/* Footer */}
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
                            disabled={isSaving}
                            className="px-4 py-2 text-xs font-medium rounded-lg bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Clock className="w-4 h-4 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Devolver PEA con Observaciones
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

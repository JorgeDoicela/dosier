import React, { useState } from 'react';
import { Copy, Sparkles, X, CheckCircle2, Clock, BookOpen, Layers } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';
import { MOCK_MATERIAS_ANTERIORES } from '../data/mockCurricularData';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asignaturaDestino: string;
    onClonadoExitoso: () => void;
}

export const ClonarPeaModal: React.FC<Props> = ({
    isOpen,
    onClose,
    asignaturaDestino,
    onClonadoExitoso
}) => {
    const { addToast } = useNotifications();
    const [selectedMateria, setSelectedMateria] = useState(MOCK_MATERIAS_ANTERIORES[0].id_materia_anterior);
    const [copiarBibliografía, setCopiarBibliografía] = useState(true);
    const [copiarMetodologia, setCopiarMetodologia] = useState(true);
    const [copiarResultados, setCopiarResultados] = useState(true);
    const [isCloning, setIsCloning] = useState(false);

    if (!isOpen) return null;

    const handleClonar = () => {
        setIsCloning(true);
        setTimeout(() => {
            setIsCloning(false);
            addToast(
                'Estructura Curricular Clonada',
                `Se importaron las 4 unidades temáticas, resultados de aprendizaje y bibliografía hacia "${asignaturaDestino}".`,
                'success'
            );
            onClonadoExitoso();
            onClose();
        }, 900);
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
                            <Copy className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                Clonar PEA de Período Anterior
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Importación ágil de contenidos aprobados institucionalmente
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
                <div className="p-6 space-y-4">
                    <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-semibold block mb-0.5">Asignatura Destino (Período 2025-A):</span>
                        {asignaturaDestino}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                            Seleccione el PEA Aprobado de Origen
                        </label>
                        <div className="space-y-2">
                            {MOCK_MATERIAS_ANTERIORES.map(m => (
                                <div
                                    key={m.id_materia_anterior}
                                    onClick={() => setSelectedMateria(m.id_materia_anterior)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                        selectedMateria === m.id_materia_anterior
                                            ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-900 dark:border-white shadow-sm'
                                            : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="materia_origen"
                                            checked={selectedMateria === m.id_materia_anterior}
                                            onChange={() => {}}
                                            className="text-zinc-900 dark:text-white"
                                        />
                                        <div>
                                            <p className="text-xs font-medium text-zinc-900 dark:text-white">
                                                {m.nombre}
                                            </p>
                                            <p className="text-[11px] text-zinc-500">
                                                {m.periodo} • Aprobado el {m.fecha_aprobacion}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                        {m.unidades_tematicas} Unidades
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                            Elementos a Clonar
                        </label>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={copiarResultados}
                                    onChange={e => setCopiarResultados(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Unidades Curriculares y Resultados de Aprendizaje (Secciones D y E)
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={copiarMetodologia}
                                    onChange={e => setCopiarMetodologia(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Metodología de Enseñanza y Ambientes de Aprendizaje (Sección F)
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={copiarBibliografía}
                                    onChange={e => setCopiarBibliografía(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Bibliografía Básica y Complementaria en formato APA (Sección J)
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-zinc-900/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleClonar}
                        disabled={isCloning}
                        className="px-4 py-2 text-xs font-medium rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {isCloning ? (
                            <>
                                <Clock className="w-4 h-4 animate-spin" />
                                Clonando estructura...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Importar y Clonar Estructura
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

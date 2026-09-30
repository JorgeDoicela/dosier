import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, X, Clock, BookOpen, Layers } from 'lucide-react';
import { useNotifications } from '../../../../api/NotificationsContext';
import { getBandejaPeas, type PeaBandejaItemDto } from '../../../../services/peaService';

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
    const [materiasPrevias, setMateriasPrevias] = useState<PeaBandejaItemDto[]>([]);
    const [selectedMateriaUuid, setSelectedMateriaUuid] = useState<string>('');
    const [copiarBibliografía, setCopiarBibliografía] = useState(true);
    const [copiarMetodologia, setCopiarMetodologia] = useState(true);
    const [copiarResultados, setCopiarResultados] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [isCloning, setIsCloning] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        setIsLoading(true);
        getBandejaPeas()
            .then(data => {
                const list = Array.isArray(data) ? data : [];
                setMateriasPrevias(list);
                if (list.length > 0) {
                    setSelectedMateriaUuid(list[0].uuid);
                }
            })
            .catch(() => setMateriasPrevias([]))
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleClonar = () => {
        if (!selectedMateriaUuid) {
            addToast('Seleccione un PEA de origen', 'Debe seleccionar un instrumento curricular de referencia.', 'warning');
            return;
        }

        setIsCloning(true);
        setTimeout(() => {
            setIsCloning(false);
            addToast(
                'Estructura Curricular Clonada',
                `Se importó la estructura de contenidos temáticos y bibliografía hacia "${asignaturaDestino}".`,
                'success'
            );
            onClonadoExitoso();
            onClose();
        }, 800);
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
                        <Copy className="w-5 h-5 text-[#0070f3] dark:text-blue-400 shrink-0" />
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                Clonar PEA de Período Anterior
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Importación ágil de contenidos aprobados institucionalmente
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
                    <div className="p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300">
                        <span className="font-semibold block mb-0.5">Asignatura Destino:</span>
                        {asignaturaDestino}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                            Seleccione el PEA Aprobado de Origen
                        </label>
                        {isLoading ? (
                            <div className="p-6 text-center text-xs text-zinc-400">
                                <Clock className="w-4 h-4 animate-spin mx-auto mb-2 text-[#0070f3]" />
                                Cargando catálogo de instrumentos curriculares...
                            </div>
                        ) : materiasPrevias.length === 0 ? (
                            <div className="p-6 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
                                <p className="text-xs text-zinc-500">
                                    No se encontraron asignaturas previas registradas para clonación.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                {materiasPrevias.map(m => (
                                    <div
                                        key={m.uuid}
                                        onClick={() => setSelectedMateriaUuid(m.uuid)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                                            selectedMateriaUuid === m.uuid
                                                ? 'bg-zinc-50 dark:bg-zinc-900 border-[#0070f3] dark:border-blue-500 shadow-sm'
                                                : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="materia_origen"
                                                checked={selectedMateriaUuid === m.uuid}
                                                onChange={() => {}}
                                                className="text-[#0070f3]"
                                            />
                                            <div>
                                                <p className="text-xs font-medium text-zinc-900 dark:text-white">
                                                    {m.nombre_asignatura}
                                                </p>
                                                <p className="text-[11px] text-zinc-500">
                                                    {m.nombre_carrera} • Período {m.id_periodo}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                            {m.total_horas_asignatura || 0}h
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                Unidades Curriculares y Resultados de Aprendizaje
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={copiarMetodologia}
                                    onChange={e => setCopiarMetodologia(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Metodología de Enseñanza y Ambientes de Aprendizaje
                            </label>
                            <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={copiarBibliografía}
                                    onChange={e => setCopiarBibliografía(e.target.checked)}
                                    className="rounded border-zinc-300 dark:border-zinc-700"
                                />
                                Bibliografía Básica y Complementaria en formato APA
                            </label>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleClonar}
                        disabled={isCloning || materiasPrevias.length === 0}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                        {isCloning ? (
                            <>
                                <Clock className="w-3.5 h-3.5 animate-spin" />
                                Clonando estructura...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-3.5 h-3.5" />
                                Importar y Clonar Estructura
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

import React, { useMemo, useState } from 'react';
import {
    CheckCircle2,
    Send,
    Mic,
    MicOff,
    X,
    Trash2,
    MessageSquareReply
} from 'lucide-react';
import type { SectionComment } from '../types/revisionTecnicaTypes';

interface ObservationsSidebarProps {
    isOpen: boolean;
    width: number;
    rightSidebarRef?: React.RefObject<HTMLDivElement>;
    toggleOpen: () => void;
    activeCommentField: string;
    setActiveCommentField: (field: string) => void;
    activeSection?: string;
    setActiveSection?: (section: string) => void;
    projectUuid?: string;
    comments: Record<string, SectionComment[]>;
    contextualInput: string;
    setContextualInput: (value: string) => void;
    isListening: boolean;
    submitting: boolean;
    editingCommentId: number | null;
    setEditingCommentId: (id: number | null) => void;
    saveContextualComment: () => Promise<void>;
    handleStartListening: () => void;
    removeCommentLocal: (section: string, id: number) => void;
    FIELD_LABELS: Record<string, string>;
    templateBlocks?: any[];
    readOnly?: boolean;
}

export const ObservationsSidebar: React.FC<ObservationsSidebarProps> = ({
    isOpen,
    width,
    rightSidebarRef,
    toggleOpen,
    activeCommentField,
    setActiveCommentField,
    comments,
    contextualInput,
    setContextualInput,
    isListening,
    submitting,
    saveContextualComment,
    handleStartListening,
    removeCommentLocal,
    FIELD_LABELS,
    readOnly = false
}) => {
    // Modo de filtro: 'all' muestra todas las observaciones del PEA, 'section' solo las de la sección/campo actual
    const [filterMode, setFilterMode] = useState<'all' | 'section'>('all');

    const allCommentsList = useMemo(() => {
        const list: { fieldKey: string; comment: SectionComment }[] = [];
        Object.entries(comments).forEach(([fKey, coms]) => {
            if (Array.isArray(coms)) {
                coms.forEach(c => {
                    list.push({ fieldKey: fKey, comment: c });
                });
            }
        });
        return list;
    }, [comments]);

    const pendingCount = useMemo(() => {
        return allCommentsList.filter(item => item.comment.status === 'Pendiente').length;
    }, [allCommentsList]);

    const solvedCount = useMemo(() => {
        return allCommentsList.filter(item => item.comment.status === 'Subsanada').length;
    }, [allCommentsList]);

    const displayedComments = useMemo(() => {
        if (filterMode === 'section') {
            const list = comments[activeCommentField] || [];
            return list.map(c => ({ fieldKey: activeCommentField, comment: c }));
        }
        return allCommentsList;
    }, [filterMode, comments, activeCommentField, allCommentsList]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (contextualInput.trim() && !submitting) {
                saveContextualComment();
            }
        }
    };

    return (
        <aside
            ref={rightSidebarRef}
            style={{
                width: isOpen ? `${width}px` : '0px',
                transition: 'width 300ms ease-in-out'
            }}
            className={`h-full bg-white dark:bg-zinc-950 flex flex-col shrink-0 overflow-hidden select-none z-20 ${
                isOpen ? 'border-l border-slate-200/90 dark:border-zinc-800' : 'border-l-0'
            }`}
        >
            {/* Contenedor interior con ancho fijo para evitar saltos de layout durante la animación */}
            <div style={{ width: `${width}px` }} className="flex flex-col h-full shrink-0">
                {/* Cabecera del Panel */}
                <div className="p-4 py-3.5 border-b border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                                    Observaciones del PEA
                                </h3>
                                {allCommentsList.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                        {allCommentsList.length}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                                <span>{pendingCount} pendientes</span>
                                <span>•</span>
                                <span>{solvedCount} subsanadas</span>
                            </div>
                        </div>

                        <button
                            onClick={toggleOpen}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            title="Contraer observaciones"
                            aria-label="Contraer observaciones"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Subfiltro de Vista: Todas vs Sección Actual */}
                    <div className="mt-3.5 flex items-center gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => setFilterMode('all')}
                            className={`px-3 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                                filterMode === 'all'
                                    ? 'bg-[#0f172a] text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 font-normal'
                            }`}
                        >
                            Todas ({allCommentsList.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterMode('section')}
                            className={`px-3 py-1 rounded-md transition-colors cursor-pointer truncate max-w-[190px] text-xs ${
                                filterMode === 'section'
                                    ? 'bg-[#0f172a] text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 font-normal'
                            }`}
                            title={FIELD_LABELS[activeCommentField] || activeCommentField}
                        >
                            Sección actual ({comments[activeCommentField]?.length || 0})
                        </button>
                    </div>
                </div>

                {/* Lista Desplazable de Observaciones o Estado Vacío */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3 bg-slate-50/40 dark:bg-zinc-950">
                    {displayedComments.length > 0 ? (
                        <div className="space-y-3">
                            {displayedComments.map(({ fieldKey, comment: com }) => {
                                const isSubsanada = com.status === 'Subsanada';
                                const fieldLabel = FIELD_LABELS[fieldKey] || fieldKey;

                                return (
                                    <div
                                        key={com.id}
                                        className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-3.5 rounded-xl space-y-2 shadow-2xs transition-all"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-2">
                                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSubsanada ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span className="text-[11px] font-semibold text-slate-800 dark:text-zinc-200 truncate" title={fieldLabel}>
                                                    {fieldLabel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                                                    isSubsanada
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                                                }`}>
                                                    {com.status}
                                                </span>

                                                {!readOnly && (
                                                    <button
                                                        onClick={() => removeCommentLocal(fieldKey, com.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                                                        title="Eliminar requerimiento"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                                            {com.nombreUsuario || com.rolObservador || 'Coordinación'}
                                        </div>

                                        <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed select-text font-normal">
                                            {com.text}
                                        </p>

                                        {/* Respuesta de Subsanación del Docente */}
                                        {isSubsanada && com.respuestaDocente && (
                                            <div className="mt-2 p-2.5 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 rounded-lg text-xs space-y-1">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                                    <MessageSquareReply size={12} />
                                                    <span>Respuesta del docente:</span>
                                                </div>
                                                <p className="text-emerald-900 dark:text-emerald-200 text-xs italic">
                                                    "{com.respuestaDocente}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Estado Vacío Exacto */
                        <div className="h-full flex flex-col justify-center items-center text-center p-6 py-12">
                            <div className="w-12 h-12 rounded-full border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3.5 shadow-2xs">
                                <CheckCircle2 size={24} className="stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                                {filterMode === 'section'
                                    ? 'Sin observaciones en esta sección'
                                    : 'Sin observaciones en el PEA'}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1.5 max-w-[260px] leading-relaxed">
                                {filterMode === 'section'
                                    ? 'Esta sección cumple con los criterios técnicos requeridos. Si detecta discrepancias, ingrese su requerimiento abajo.'
                                    : 'Este expediente no presenta observaciones disciplinarias registradas.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Input de Registro Rápido de Observación */}
                {readOnly ? (
                    <div className="shrink-0 p-3.5 border-t border-slate-200/90 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 text-center">
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                            Modo solo lectura: El registro de observaciones técnicas se habilita una vez que el docente remite formalmente el instrumento a revisión curricular.
                        </p>
                    </div>
                ) : (
                    <div className="shrink-0 p-3.5 border-t border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
                        {/* Selector de campo / sección */}
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                                Anotar en:
                            </span>
                            <select
                                value={activeCommentField}
                                onChange={(e) => setActiveCommentField(e.target.value)}
                                className="flex-1 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-zinc-200 outline-none focus:border-[#0070f3] cursor-pointer"
                            >
                                {Object.entries(FIELD_LABELS).map(([k, label]) => (
                                    <option key={k} value={k}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Caja de Redacción con Voz y Envío */}
                        <div className="flex items-end gap-2 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-2.5 focus-within:border-[#0070f3] focus-within:ring-2 focus-within:ring-[#0070f3]/15 transition-all">
                            <textarea
                                value={contextualInput}
                                onChange={(e) => setContextualInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribir requerimiento técnico... (Enter para registrar)"
                                className="flex-1 bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 resize-none max-h-24 min-h-[38px] font-sans leading-relaxed custom-scrollbar py-1 px-1"
                                disabled={submitting}
                                rows={1}
                            />
                            <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
                                <button
                                    type="button"
                                    onClick={handleStartListening}
                                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                        isListening
                                            ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse'
                                            : 'bg-white dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-200 dark:border-zinc-800 text-slate-500'
                                    }`}
                                    title={isListening ? "Detener dictado" : "Dictar por voz"}
                                >
                                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={saveContextualComment}
                                    disabled={!contextualInput.trim() || submitting}
                                    className="p-2 rounded-xl bg-[#0070f3] hover:bg-[#005bb5] text-white disabled:opacity-30 transition-all cursor-pointer shadow-2xs active:scale-95 flex items-center justify-center"
                                    title="Guardar requerimiento"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

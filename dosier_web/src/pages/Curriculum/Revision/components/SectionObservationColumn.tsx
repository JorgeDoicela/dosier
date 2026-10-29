import React, { useState, useRef, useEffect } from 'react';
import type { SectionComment } from '../types/revisionTecnicaTypes';
import { ObservationComposer } from './ObservationComposer';
import { Trash2, CheckCircle2 } from 'lucide-react';

interface SectionObservationColumnProps {
    fieldKey: string;
    sectionTitle: string;
    comments: SectionComment[];
    isSelected?: boolean;
    onSelect?: () => void;
    canAudit?: boolean;
    readOnly?: boolean;
    submitting?: boolean;
    isListeningGlobal?: boolean;
    onSaveComment: (sectionKey: string, text: string) => Promise<void>;
    onRemoveComment: (sectionKey: string, id: number) => Promise<void>;
    onStartListening: (onTranscript: (text: string) => void) => void;
}

export const SectionObservationColumn: React.FC<SectionObservationColumnProps> = ({
    fieldKey,
    sectionTitle,
    comments = [],
    isSelected = false,
    onSelect,
    canAudit = false,
    readOnly = false,
    submitting = false,
    isListeningGlobal = false,
    onSaveComment,
    onRemoveComment,
    onStartListening
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isLocalSubmitting, setIsLocalSubmitting] = useState(false);
    const [isListeningLocal, setIsListeningLocal] = useState(false);
    const composerRef = useRef<HTMLTextAreaElement>(null);

    // Al seleccionar la sección desde la izquierda, enfocar automáticamente el campo para escribir
    useEffect(() => {
        if (isSelected && canAudit && !readOnly) {
            composerRef.current?.focus();
        }
    }, [isSelected, canAudit, readOnly]);

    const handleSave = async () => {
        if (!inputValue.trim() || isLocalSubmitting || submitting) return;
        try {
            setIsLocalSubmitting(true);
            await onSaveComment(fieldKey, inputValue);
            setInputValue('');
        } catch (err) {
            console.error('[DOSIER] Error guardando observación de sección:', err);
        } finally {
            setIsLocalSubmitting(false);
        }
    };

    const handleToggleListening = () => {
        if (isListeningLocal) {
            setIsListeningLocal(false);
            return;
        }
        setIsListeningLocal(true);
        onStartListening((transcript: string) => {
            setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
            setIsListeningLocal(false);
        });
    };

    return (
        <div
            onClick={() => {
                onSelect?.();
                composerRef.current?.focus();
            }}
            className="w-full flex flex-col gap-3 select-text min-w-0"
        >
            {/* Listado de Observaciones Existentes si hay registradas */}
            {comments.length > 0 && (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-0.5 min-w-0">
                    {comments.map((obs) => {
                        const isPending = obs.status === 'Pendiente';
                        return (
                            <div
                                key={obs.id || obs.uuid}
                                className={`group/card rounded-xl p-3 border transition-all space-y-2 min-w-0 ${
                                    isPending
                                        ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/60'
                                        : 'bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <span
                                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                                isPending ? 'bg-amber-500' : 'bg-emerald-500'
                                            }`}
                                        />
                                        <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 truncate">
                                            {obs.nombreUsuario || obs.rolObservador || 'Revisor'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {obs.creadoEn && (
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                                {new Date(obs.creadoEn).toLocaleDateString('es-EC', {
                                                    day: '2-digit',
                                                    month: '2-digit'
                                                })}
                                            </span>
                                        )}

                                        {canAudit && !readOnly && (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveComment(fieldKey, obs.id)}
                                                className="opacity-0 group-hover/card:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-all"
                                                title="Eliminar observación"
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <p className="text-xs text-slate-700 dark:text-zinc-300 font-sans leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] select-text">
                                    {obs.text}
                                </p>

                                {obs.respuestaDocente && (
                                    <div className="pt-2 mt-1 border-t border-slate-200/60 dark:border-zinc-800/80 space-y-1">
                                        <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                            <CheckCircle2 size={11} />
                                            Respuesta del docente
                                        </div>
                                        <p className="text-[11px] text-slate-600 dark:text-zinc-400 italic bg-white dark:bg-zinc-950 p-2 rounded-lg border border-slate-100 dark:border-zinc-800 break-words [overflow-wrap:anywhere]">
                                            {obs.respuestaDocente}
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Compositor In-Situ de Observación para esta Sección (Caja Única Directa) */}
            {canAudit && !readOnly && (
                <ObservationComposer
                    id={`composer-textarea-${fieldKey}`}
                    textareaRef={composerRef}
                    value={inputValue}
                    onChange={setInputValue}
                    onFocus={onSelect}
                    onSubmit={handleSave}
                    placeholder={`Observación para ${sectionTitle}...`}
                    isListening={isListeningLocal || isListeningGlobal}
                    onToggleListening={handleToggleListening}
                    submitting={isLocalSubmitting || submitting}
                    submitTooltip={`Guardar observación en ${sectionTitle}`}
                    className={`w-full bg-white dark:bg-zinc-950 rounded-2xl border-2 transition-colors duration-150 ${
                        isSelected
                            ? '!border-[#0070f3] dark:!border-blue-500 shadow-sm'
                            : 'border-slate-200/90 dark:border-zinc-800/90'
                    }`}
                />
            )}
        </div>
    );
};


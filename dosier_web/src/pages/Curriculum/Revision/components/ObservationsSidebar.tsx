import React, { useMemo } from 'react';
import {
    CheckCircle2,
    Trash2,
    MessageSquareReply
} from 'lucide-react';
import type { SectionComment } from '../types/revisionTecnicaTypes';
import { ObservationComposer } from './ObservationComposer';

interface ObservationsSidebarProps {
    activeCommentField?: string;
    setActiveCommentField?: (field: string) => void;
    comments: Record<string, SectionComment[]>;
    contextualInput: string;
    setContextualInput: (value: string) => void;
    isListening: boolean;
    submitting: boolean;
    saveContextualComment: () => Promise<void>;
    handleStartListening: () => void;
    removeCommentLocal: (section: string, id: number) => void;
    FIELD_LABELS?: Record<string, string>;
    projectStatus?: string;
    readOnly?: boolean;
}

/**
 * ══════════════════════════════════════════════════════════════════════════════
 * DOSIER — ObservationsSidebar (Columna 1/3 Integrada Limpia)
 * ══════════════════════════════════════════════════════════════════════════════
 * Panel de observaciones integrado nativamente en proporción de 1/3,
 * con cabecera sobria y redactor directo sin selector de secciones ni campos.
 */
export const ObservationsSidebar: React.FC<ObservationsSidebarProps> = ({
    activeCommentField = '',
    comments,
    contextualInput,
    setContextualInput,
    isListening,
    submitting,
    saveContextualComment,
    handleStartListening,
    removeCommentLocal,
    FIELD_LABELS = {},
    readOnly = false
}) => {
    // Lista completa de todas las observaciones registradas en el expediente
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

    // Separar observaciones generales de las específicas por campo
    const generalComments = useMemo(() => {
        return allCommentsList.filter(
            item => item.fieldKey === 'General' || item.fieldKey.startsWith('General_')
        );
    }, [allCommentsList]);

    const fieldComments = useMemo(() => {
        return allCommentsList.filter(
            item => item.fieldKey !== 'General' && !item.fieldKey.startsWith('General_')
        );
    }, [allCommentsList]);

    return (
        <aside className="w-full h-full bg-white dark:bg-zinc-950 flex flex-col shrink-0 overflow-hidden select-none border-l border-slate-200 dark:border-zinc-800">
            {/* ── CABECERA LIMPIA Y SOBRIA ── */}
            <div className="p-4 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-zinc-100">
                    {pendingCount > 0 ? 'PEA OBSERVADO' : 'OBSERVACIONES DEL PEA'}
                </h3>
            </div>

            {/* ── CUERPO CON OBSERVACIONES Y LÍNEA DE TIEMPO ── */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4 bg-slate-50/40 dark:bg-zinc-950">
                {/* 1. OBSERVACIÓN GENERAL (Si existe en el expediente) */}
                {generalComments.length > 0 && (
                    <div className="space-y-2">
                        {generalComments.map(({ fieldKey, comment: com }) => {
                            const isSubsanada = com.status === 'Subsanada';

                            return (
                                <div
                                    key={com.id}
                                    className={`rounded-xl p-3.5 space-y-2 border transition-all ${
                                        isSubsanada
                                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                                            : 'bg-rose-50/60 dark:bg-rose-950/25 border-rose-200/90 dark:border-rose-900/60 shadow-2xs'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${isSubsanada ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                                            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                                                OBSERVACIÓN GENERAL
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-1.5">
                                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                                                isSubsanada
                                                    ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                                                    : 'bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                                            }`}>
                                                {com.status}
                                            </span>

                                            {!readOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeCommentLocal(fieldKey, com.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                                                    title="Eliminar observación"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-800 dark:text-zinc-100 leading-relaxed font-normal select-text">
                                        {com.text}
                                    </p>

                                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 pt-1 border-t border-rose-100 dark:border-rose-900/40 font-mono">
                                        <span>{com.nombreUsuario || com.rolObservador || 'Revisor'}</span>
                                        {com.creadoEn && <span>{new Date(com.creadoEn).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. CORRECCIONES POR CAMPO */}
                <div className="space-y-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 px-1">
                        Correcciones por campo
                    </div>

                    {fieldComments.length > 0 ? (
                        <div className="space-y-2.5">
                            {fieldComments.map(({ fieldKey, comment: com }) => {
                                const isSubsanada = com.status === 'Subsanada';
                                const fieldLabel = FIELD_LABELS[fieldKey] || fieldKey;

                                return (
                                    <div
                                        key={com.id}
                                        className={`rounded-xl p-3 space-y-2 border transition-all ${
                                            isSubsanada
                                                ? 'bg-white dark:bg-zinc-900 border-emerald-200 dark:border-emerald-900/60'
                                                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 shadow-2xs hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-1.5">
                                            <div className="flex items-center gap-1.5 min-w-0 pr-2">
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${isSubsanada ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <span
                                                    className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-zinc-200 truncate"
                                                    title={fieldLabel}
                                                >
                                                    {fieldLabel}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-medium ${
                                                    isSubsanada
                                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                                                        : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300'
                                                }`}>
                                                    {com.status}
                                                </span>

                                                {!readOnly && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCommentLocal(fieldKey, com.id)}
                                                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                                                        title="Eliminar requerimiento"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed select-text font-normal">
                                            {com.text}
                                        </p>

                                        {/* Subsanación del Docente */}
                                        {isSubsanada && com.respuestaDocente && (
                                            <div className="p-2 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg text-xs space-y-1">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                                                    <MessageSquareReply size={11} />
                                                    <span>Subsanación del docente:</span>
                                                </div>
                                                <p className="text-emerald-900 dark:text-emerald-100 text-xs italic">
                                                    "{com.respuestaDocente}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-zinc-500 pt-1 border-t border-slate-100 dark:border-zinc-800/80 font-mono">
                                            <span>{com.nombreUsuario || com.rolObservador || 'Coordinación'}</span>
                                            {com.creadoEn && (
                                                <span>{new Date(com.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-8 text-center rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                            <div className="w-10 h-10 rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs">
                                <CheckCircle2 size={20} className="stroke-[2.2]" />
                            </div>
                            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Sin observaciones en el PEA
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── PIE DE REDACCIÓN DE OBSERVACIÓN ANCLADO DIRECTO ── */}
            {readOnly ? (
                <div className="shrink-0 p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-center">
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
                        Modo consulta: el registro de observaciones se habilita durante la revisión técnica activa.
                    </p>
                </div>
            ) : (
                <div className="shrink-0 p-3.5 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
                    {activeCommentField && (
                        <div className="flex items-center justify-between text-[11px] px-1 text-slate-600 dark:text-zinc-400 font-medium">
                            <span className="flex items-center gap-1.5 truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0 animate-pulse" />
                                <span className="text-slate-500">Sección:</span>
                                <strong className="text-slate-900 dark:text-white truncate">
                                    {FIELD_LABELS[activeCommentField] || activeCommentField}
                                </strong>
                            </span>
                        </div>
                    )}
                    <ObservationComposer
                        value={contextualInput}
                        onChange={setContextualInput}
                        onSubmit={saveContextualComment}
                        isListening={isListening}
                        onToggleListening={handleStartListening}
                        submitting={submitting}
                        placeholder={
                            activeCommentField && FIELD_LABELS[activeCommentField]
                                ? `Observación para ${FIELD_LABELS[activeCommentField]}... (Enter)`
                                : 'Escribir requerimiento técnico... (Enter para registrar)'
                        }
                    />
                </div>
            )}
        </aside>
    );
};

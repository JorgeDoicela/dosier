import React, { useState, useRef, useEffect } from 'react';
import type { SectionComment } from '../types/revisionTecnicaTypes';
import { ObservationComposer } from './ObservationComposer';
import { Trash2, CheckCircle2, X } from 'lucide-react';

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

const formatRolObservador = (rol?: string, fallback?: string): string => {
    const raw = (rol || fallback || '').trim();
    const roleMap: Record<string, string> = {
        'CoordinadorCarrera': 'Coordinador de Carrera',
        'coordinador_carrera': 'Coordinador de Carrera',
        'DOSIER_COORD_CARRERA': 'Coordinador de Carrera',
        'CoordinadorAcademico': 'Coordinador Académico',
        'coordinador_academico': 'Coordinador Académico',
        'DOSIER_COORD_ACAD': 'Coordinador Académico',
        'Vicerrector': 'Vicerrectorado',
        'vicerrector': 'Vicerrectorado',
        'DOSIER_VICERRECTOR': 'Vicerrectorado',
        'Docente': 'Docente',
        'docente': 'Docente',
        'DOSIER_DOCENTE': 'Docente',
        'Administrador': 'Administrador',
        'admin': 'Administrador',
        'DOSIER_ADMIN': 'Administrador'
    };
    if (raw && roleMap[raw]) return roleMap[raw];
    if (raw) return raw.replace(/([a-z])([A-Z])/g, '$1 $2');
    return 'Coordinador de Carrera';
};

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
    const [activeObsId, setActiveObsId] = useState<string | number | null>(null);
    const composerRef = useRef<HTMLTextAreaElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const pendingDotsRef = useRef<HTMLDivElement>(null);
    const subsanatedDotsRef = useRef<HTMLDivElement>(null);

    const pendingComments = comments.filter(c => c.status === 'Pendiente');
    const subsanatedComments = comments.filter(c => c.status !== 'Pendiente');

    const activeObs = comments.find(c => (c.id ?? c.uuid) === activeObsId) ?? null;
    const isPendingActive = activeObs?.status === 'Pendiente';
    const activePendingIndex = isPendingActive
        ? pendingComments.findIndex(c => (c.id ?? c.uuid) === activeObsId)
        : -1;
    const activeSubsanatedIndex = !isPendingActive && activeObs
        ? subsanatedComments.findIndex(c => (c.id ?? c.uuid) === activeObsId)
        : -1;

    // Control de eventos: cerrar al hacer clic afuera, presionar Escape o hacer scroll en la página principal
    useEffect(() => {
        if (!activeObsId) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setActiveObsId(null);
            }
        };

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node;
            if (
                popoverRef.current &&
                !popoverRef.current.contains(target) &&
                (!pendingDotsRef.current || !pendingDotsRef.current.contains(target)) &&
                (!subsanatedDotsRef.current || !subsanatedDotsRef.current.contains(target))
            ) {
                setActiveObsId(null);
            }
        };

        const handlePageScroll = (e: Event) => {
            if (popoverRef.current && popoverRef.current.contains(e.target as Node)) {
                return;
            }
            setActiveObsId(null);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handlePageScroll, true);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handlePageScroll, true);
        };
    }, [activeObsId]);

    // Al seleccionar la sección desde la izquierda, enfocar automáticamente el campo para escribir
    useEffect(() => {
        if (isSelected && canAudit && !readOnly) {
            composerRef.current?.focus();
        }
    }, [isSelected, canAudit, readOnly]);

    const handleSave = async () => {
        const textToSend = inputValue.trim();
        if (!textToSend || isLocalSubmitting || submitting) return;
        setInputValue('');
        try {
            setIsLocalSubmitting(true);
            await onSaveComment(fieldKey, textToSend);
        } catch (err) {
            console.error('[DOSIER] Error guardando observación de sección:', err);
            setInputValue(textToSend);
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
            className="relative w-full select-text min-w-0"
        >
            {/* Indicadores de Observaciones Actuales (Pendientes) - Arriba del Compositor */}
            {pendingComments.length > 0 && (
                <div ref={pendingDotsRef} className="absolute bottom-full mb-2 left-2 z-20 flex items-center gap-3">
                    {pendingComments.map((obs, idx) => {
                        const obsId = obs.id ?? obs.uuid ?? idx;
                        const isActive = activeObsId === obsId;
                        return (
                            <button
                                key={obsId}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveObsId(prev => prev === obsId ? null : obsId);
                                }}
                                className="group relative flex items-center justify-center p-1 rounded-full hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-hidden"
                                title={`Observación actual (Pendiente) · ${formatRolObservador(obs.rolObservador, obs.nombreUsuario)}`}
                                aria-label={`Ver observación actual ${idx + 1}`}
                            >
                                <span className={`inline-flex rounded-full h-[19px] w-[19px] shadow-sm transition-all ${
                                    isActive
                                        ? 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-700'
                                        : 'bg-amber-500'
                                }`} />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Indicadores de Observaciones Anteriores (Subsanadas) - Debajo del Compositor */}
            {subsanatedComments.length > 0 && (
                <div ref={subsanatedDotsRef} className="absolute top-full mt-2 left-2 z-20 flex items-center gap-3">
                    {subsanatedComments.map((obs, idx) => {
                        const obsId = obs.id ?? obs.uuid ?? idx;
                        const isActive = activeObsId === obsId;
                        return (
                            <button
                                key={obsId}
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveObsId(prev => prev === obsId ? null : obsId);
                                }}
                                className="group relative flex items-center justify-center p-1 rounded-full hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-hidden"
                                title={`Revisión anterior (Subsanada) · ${formatRolObservador(obs.rolObservador, obs.nombreUsuario)}`}
                                aria-label={`Ver observación anterior subsanada ${idx + 1}`}
                            >
                                <span className={`inline-flex rounded-full h-[19px] w-[19px] shadow-sm transition-all ${
                                    isActive
                                        ? 'bg-emerald-600 ring-2 ring-emerald-300 dark:ring-emerald-700'
                                        : 'bg-emerald-500'
                                }`} />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Popover Flotante de la Observación Seleccionada */}
            {activeObs && (
                <div
                    key={`obs-popover-${activeObsId}`}
                    ref={popoverRef}
                    className={`absolute left-0 right-0 z-50 rounded-2xl animate-mac-popover shadow-[0_16px_36px_-10px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.06)] select-text ${
                        isPendingActive
                            ? 'bottom-full mb-11 bg-amber-50 dark:bg-[#1a1610] border border-amber-200 dark:border-amber-900/80'
                            : 'top-full mt-10 bg-emerald-50 dark:bg-[#0f1f17] border border-emerald-200 dark:border-emerald-900/80'
                    }`}
                    style={{
                        transformOrigin: `${21.5 + (isPendingActive ? Math.max(0, activePendingIndex) : Math.max(0, activeSubsanatedIndex)) * 39}px ${isPendingActive ? 'bottom' : 'top'}`
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Flecha apuntando al punto activo de origen (arriba o abajo según corresponda) */}
                    {((isPendingActive && activePendingIndex >= 0) || (!isPendingActive && activeSubsanatedIndex >= 0)) && (
                        <div
                            className={`absolute w-3 h-3 rotate-45 z-10 ${
                                isPendingActive
                                    ? '-bottom-1.5 border-b border-r bg-amber-50 dark:bg-[#1a1610] border-amber-200 dark:border-amber-900/80'
                                    : '-top-1.5 border-t border-l bg-emerald-50 dark:bg-[#0f1f17] border-emerald-200 dark:border-emerald-900/80'
                            }`}
                            style={{
                                left: `${15.5 + (isPendingActive ? activePendingIndex : activeSubsanatedIndex) * 39}px`
                            }}
                            aria-hidden="true"
                        />
                    )}

                    <div className="rounded-2xl overflow-hidden">
                        <div className="max-h-[320px] overflow-y-auto overflow-x-hidden custom-scrollbar overscroll-contain py-3.5 pl-4 pr-2 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                                        {formatRolObservador(activeObs.rolObservador, activeObs.nombreUsuario)}
                                    </span>
                                    <span className="text-slate-300 dark:text-zinc-700 select-none">·</span>
                                    <span className={`text-[11px] font-medium ${
                                        activeObs.status === 'Pendiente'
                                            ? 'text-amber-700 dark:text-amber-400'
                                            : 'text-emerald-700 dark:text-emerald-400'
                                    }`}>
                                        {activeObs.status === 'Pendiente' ? 'Observación actual' : 'Revisión anterior · Subsanada'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {canAudit && !readOnly && activeObs.status === 'Pendiente' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const idToRemove = activeObs.id;
                                                setActiveObsId(null);
                                                onRemoveComment(fieldKey, idToRemove);
                                            }}
                                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors cursor-pointer"
                                            title="Eliminar observación"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setActiveObsId(null)}
                                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded transition-colors cursor-pointer"
                                        title="Cerrar"
                                        aria-label="Cerrar"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 font-sans leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] select-text">
                                {activeObs.text}
                            </p>

                            {activeObs.respuestaDocente && (
                                <div className="pt-2 mt-1 border-t border-slate-100 dark:border-zinc-800/80 space-y-1">
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                                        <CheckCircle2 size={11} />
                                        Respuesta del docente
                                    </div>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 italic break-words [overflow-wrap:anywhere]">
                                        {activeObs.respuestaDocente}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
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


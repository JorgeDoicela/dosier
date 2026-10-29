import React, { useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Loader2 } from 'lucide-react';

export interface ObservationComposerProps {
    /** Valor actual del texto */
    value: string;
    /** Callback al cambiar el texto */
    onChange: (value: string) => void;
    /** Callback al enviar (Enter o clic en Enviar) */
    onSubmit: () => void | Promise<void>;
    /** Placeholder configurable */
    placeholder?: string;
    /** Indica si está activo el dictado por voz */
    isListening?: boolean;
    /** Callback para iniciar/detener dictado por voz */
    onToggleListening?: () => void;
    /** Indica si el formulario está enviando datos */
    submitting?: boolean;
    /** Deshabilita la edición y acciones */
    disabled?: boolean;
    /** Clase CSS adicional para el contenedor principal */
    className?: string;
    /** Enfocar automáticamente el textarea al montar */
    autoFocus?: boolean;
    /** Callback al enfocar el campo de texto */
    onFocus?: () => void;
    /** Altura máxima en píxeles antes de mostrar scroll (por defecto 280px) */
    maxHeight?: number;
    /** Tooltip personalizado para el botón de envío */
    submitTooltip?: string;
    /** Referencia externa opcional al elemento textarea */
    textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
    /** ID del elemento textarea para acceso directo y control de foco */
    id?: string;
}

/**
 * Componente modular de redacción de observaciones y requerimientos técnicos.
 * Incluye soporte para dictado por voz (Speech-to-Text), envío con Enter y diseño
 * compatible con Modern Enterprise Docs (sólido, accesible y con soporte claro/oscuro).
 */
export const ObservationComposer: React.FC<ObservationComposerProps> = ({
    id,
    value,
    onChange,
    onSubmit,
    placeholder = 'Escribir requerimiento técnico... (Enter para registrar)',
    isListening = false,
    onToggleListening,
    submitting = false,
    disabled = false,
    className = '',
    autoFocus = false,
    onFocus,
    maxHeight = 280,
    submitTooltip = 'Guardar requerimiento',
    textareaRef
}) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const activeRef = textareaRef || internalRef;

    // Auto-ajustar altura dinámica del textarea según el contenido con límite controlado
    useEffect(() => {
        const textarea = activeRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';
        const isOverflowing = textarea.scrollHeight > maxHeight;
        textarea.style.height = `${isOverflowing ? maxHeight : textarea.scrollHeight}px`;
        textarea.style.overflowY = isOverflowing ? 'auto' : 'hidden';
    }, [value, activeRef, maxHeight]);

    useEffect(() => {
        if (autoFocus && activeRef.current) {
            activeRef.current.focus();
        }
    }, [autoFocus, activeRef]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim() && !submitting && !disabled) {
                onSubmit();
            }
        }
    };

    const isSubmitDisabled = !value.trim() || submitting || disabled;

    const hasCustomBg = className.includes('bg-');
    const hasCustomBorder = className.includes('border-');

    return (
        <div
            onClick={() => {
                onFocus?.();
                activeRef.current?.focus();
            }}
            className={`flex items-stretch min-h-[52px] rounded-2xl pl-4 pr-0 transition-colors duration-150 cursor-text overflow-hidden ${
                !hasCustomBg ? 'bg-white dark:bg-zinc-950' : ''
            } ${
                !hasCustomBorder ? 'border-2 border-slate-200 dark:border-zinc-800 focus-within:border-[#0070f3] dark:focus-within:border-blue-500' : ''
            } ${
                disabled ? 'opacity-60 pointer-events-none' : ''
            } ${className}`}
        >
            <textarea
                id={id}
                ref={activeRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={onFocus}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={submitting || disabled}
                rows={1}
                className="composer-textarea flex-1 w-full bg-transparent resize-none text-xs sm:text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 font-sans leading-relaxed custom-scrollbar py-3 px-0 disabled:cursor-not-allowed select-text self-center"
                style={{
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    WebkitBoxShadow: 'none',
                    WebkitAppearance: 'none',
                    background: 'transparent',
                    resize: 'none',
                    overflowY: 'hidden',
                    maxHeight: `${maxHeight}px`
                }}
                aria-label="Caja de redacción de observación técnica"
            />

            <div className="flex items-stretch shrink-0 self-stretch" onClick={(e) => e.stopPropagation()}>
                {/* Botón de Dictado por Voz (Sin caja, área vertical completa) */}
                {onToggleListening && (
                    <button
                        type="button"
                        onClick={onToggleListening}
                        disabled={disabled || submitting}
                        className={`px-3 flex items-center justify-center transition-colors cursor-pointer ${
                            isListening
                                ? 'text-rose-600 animate-pulse bg-rose-50 dark:bg-rose-950/40'
                                : 'text-slate-400 hover:text-slate-700 dark:text-zinc-500 dark:hover:text-zinc-200 hover:bg-slate-100/70 dark:hover:bg-zinc-800/70'
                        }`}
                        title={isListening ? 'Detener dictado por voz' : 'Dictar por voz'}
                        aria-label={isListening ? 'Detener dictado por voz' : 'Dictar por voz'}
                    >
                        {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                )}

                {/* Botón de Envío (Sin caja, área vertical completa hasta el borde redondeado) */}
                <button
                    type="button"
                    onClick={() => {
                        if (!isSubmitDisabled) {
                            onSubmit();
                        }
                    }}
                    disabled={isSubmitDisabled}
                    className="px-3.5 flex items-center justify-center transition-colors cursor-pointer text-[#0070f3] hover:text-[#005bb5] dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 disabled:text-slate-300 dark:disabled:text-zinc-700 disabled:hover:bg-transparent disabled:pointer-events-none"
                    title={submitTooltip}
                    aria-label={submitTooltip}
                >
                    {submitting ? (
                        <Loader2 size={15} className="animate-spin text-[#0070f3] dark:text-blue-400" />
                    ) : (
                        <Send size={15} />
                    )}
                </button>
            </div>
        </div>
    );
};


import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
import { Undo2, Redo2, Plus, ListOrdered } from 'lucide-react';

export interface CurriculumOutlineEditorProps {
    value: string;
    onChange: (value: string) => void;
    unitNumber?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

export interface CurriculumOutlineEditorHandle {
    focus: () => void;
    undo: () => void;
    redo: () => void;
}

/**
 * Convierte texto plano multilínea a HTML para el editor.
 * Las líneas de temas principales ("Tema X: ...") se renderizan automáticamente en negrita.
 */
function textToHtml(text: string): string {
    if (!text) return '<div><br></div>';
    const lines = text.split(/\r?\n/);

    return lines
        .map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '<div><br></div>';

            const clean = trimmed.replace(/\*\*/g, '');
            const isTheme = /^(?:tema\s*\d+|unidad\s*\d+)[\s:.\-]/i.test(clean);

            if (isTheme) {
                return `<div><b>${clean}</b></div>`;
            }
            return `<div>${clean}</div>`;
        })
        .join('');
}

/**
 * Convierte el HTML del editor a texto plano limpio para guardar.
 */
function htmlToText(html: string): string {
    if (!html) return '';

    const temp = document.createElement('div');
    temp.innerHTML = html;

    const lines: string[] = [];

    const processNode = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const val = (node.textContent || '').trim();
            if (val) lines.push(val);
            return;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();

            if (tag === 'br') return;

            if (tag === 'div' || tag === 'p' || tag === 'li') {
                const text = (el.innerText || el.textContent || '').replace(/[\r\n]+/g, ' ').trim();
                lines.push(text.replace(/\*\*/g, ''));
                return;
            }

            Array.from(node.childNodes).forEach(processNode);
        }
    };

    Array.from(temp.childNodes).forEach(processNode);

    if (lines.length === 0) {
        return temp.innerText.replace(/\*\*/g, '').trim();
    }

    return lines.join('\n').replace(/\*\*/g, '').trim();
}

/**
 * Función pura de compatibilidad para renumerar secuencialmente temas y subtemas
 */
export function renumberOutlineText(text: string, defaultUnitNum: number = 1): string {
    if (!text) return '';
    const rawLines = text.split(/\r?\n/);
    let currentThemeNum = 0;
    let currentSubNum = 0;

    return rawLines
        .map(line => {
            let clean = line.replace(/\*\*/g, '').trim();
            if (!clean) return '';

            const themeMatch = clean.match(/^(?:tema\s*(\d*)|unidad\s*(\d*))[\s:.\-]+(.*)$/i);
            if (themeMatch) {
                currentThemeNum++;
                currentSubNum = 0;
                let themeTitle = themeMatch[3].trim().replace(/^(\d+(?:\.\d+)+)[\s:.\-]+/, '').trim();
                return `Tema ${currentThemeNum}: ${themeTitle || 'Título'}`;
            }

            const subMatch = clean.match(/^(\d+(?:\.\d+)+)[\s:.\-]+(.*)$/);
            if (subMatch) {
                currentSubNum++;
                const major = currentThemeNum > 0 ? currentThemeNum : defaultUnitNum;
                return `${major}.${currentSubNum} ${subMatch[2].trim()}`;
            }

            const bulletMatch = clean.match(/^[-•*]\s*(.*)$/);
            if (bulletMatch) {
                currentSubNum++;
                const major = currentThemeNum > 0 ? currentThemeNum : defaultUnitNum;
                return `${major}.${currentSubNum} ${bulletMatch[1].trim()}`;
            }

            return clean;
        })
        .join('\n');
}

export const CurriculumOutlineEditor = forwardRef<CurriculumOutlineEditorHandle, CurriculumOutlineEditorProps>(({
    value = '',
    onChange,
    unitNumber = 1,
    placeholder,
    disabled = false,
    className = ''
}, ref) => {
    const editorDivRef = useRef<HTMLDivElement>(null);
    const dynamicPlaceholder = placeholder || `Escriba aquí los temas y subtemas de la Unidad ${unitNumber}...`;

    // Historial para Deshacer (Undo) y Rehacer (Redo)
    const [past, setPast] = useState<string[]>([]);
    const [future, setFuture] = useState<string[]>([]);
    const lastValueRef = useRef(value);

    // Sincronizar HTML cuando value cambie externamente
    useEffect(() => {
        if (!editorDivRef.current) return;
        const currentText = htmlToText(editorDivRef.current.innerHTML);
        if (value.trim() !== currentText.trim()) {
            editorDivRef.current.innerHTML = textToHtml(value);
        }
        lastValueRef.current = value;
    }, [value]);

    const emitChangeWithHistory = (nextText: string) => {
        if (nextText === lastValueRef.current) return;
        setPast(p => [...p.slice(-49), lastValueRef.current]);
        setFuture([]);
        lastValueRef.current = nextText;
        onChange(nextText);
    };

    const handleInput = () => {
        if (!editorDivRef.current) return;
        const text = htmlToText(editorDivRef.current.innerHTML);
        emitChangeWithHistory(text);
    };

    // Deshacer (Ctrl+Z)
    const handleUndo = () => {
        if (past.length === 0 || disabled) return;
        const prev = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        setPast(newPast);
        setFuture(f => [lastValueRef.current, ...f]);
        lastValueRef.current = prev;
        if (editorDivRef.current) {
            editorDivRef.current.innerHTML = textToHtml(prev);
        }
        onChange(prev);
    };

    // Rehacer (Ctrl+Y)
    const handleRedo = () => {
        if (future.length === 0 || disabled) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setPast(p => [...p, lastValueRef.current]);
        setFuture(newFuture);
        lastValueRef.current = next;
        if (editorDivRef.current) {
            editorDivRef.current.innerHTML = textToHtml(next);
        }
        onChange(next);
    };

    useImperativeHandle(ref, () => ({
        focus: () => editorDivRef.current?.focus(),
        undo: handleUndo,
        redo: handleRedo
    }));

    /**
     * Inserta un nuevo Tema Principal formateado automáticamente en negrita
     */
    const handleInsertTheme = () => {
        if (disabled || !editorDivRef.current) return;
        editorDivRef.current.focus();

        const currentText = htmlToText(editorDivRef.current.innerHTML);
        const lines = currentText.split('\n');
        let maxTheme = 0;
        lines.forEach(l => {
            const m = l.match(/^tema\s*(\d+)/i);
            if (m) {
                const n = parseInt(m[1], 10);
                if (n > maxTheme) maxTheme = n;
            }
        });
        const nextTheme = maxTheme > 0 ? maxTheme + 1 : 1;
        const themeHtml = `<div><b>Tema ${nextTheme}: </b>&nbsp;</div>`;
        document.execCommand('insertHTML', false, themeHtml);
        handleInput();
    };

    /**
     * Inserta el siguiente Subtema correlativo (ej. 1.1, 1.2...)
     */
    const handleInsertSubtopic = () => {
        if (disabled || !editorDivRef.current) return;
        editorDivRef.current.focus();

        const currentText = htmlToText(editorDivRef.current.innerHTML);
        const lines = currentText.split('\n');
        let activeMajor = unitNumber;
        let lastMinor = 0;

        lines.forEach(l => {
            const t = l.match(/^tema\s*(\d+)/i);
            if (t) {
                activeMajor = parseInt(t[1], 10);
                lastMinor = 0;
            }
            const s = l.match(/^(\d+)\.(\d+)/);
            if (s) {
                activeMajor = parseInt(s[1], 10);
                lastMinor = parseInt(s[2], 10);
            }
        });

        const nextNum = `${activeMajor}.${lastMinor + 1}`;
        const subHtml = `<div>${nextNum} &nbsp;</div>`;
        document.execCommand('insertHTML', false, subHtml);
        handleInput();
    };

    /**
     * Teclado Inteligente (Enter y Atajos):
     * - Si presiona Enter en un Tema, la siguiente línea se crea lista con el primer subtema (ej. 1.1)
     * - Si presiona Enter en un subtema, la siguiente línea se numera correlativamente (ej. 1.2)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        // Atajos Ctrl+Z / Ctrl+Y
        if ((e.ctrlKey || e.metaKey) && !e.altKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                if (e.shiftKey) handleRedo();
                else handleUndo();
                return;
            }
            if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                handleRedo();
                return;
            }
        }

        // Auto-numeración al presionar ENTER
        if (e.key === 'Enter') {
            const sel = window.getSelection();
            if (!sel || !sel.focusNode) return;

            // Obtener el texto del bloque actual
            let currentLineText = sel.focusNode.textContent || '';
            const clean = currentLineText.trim();

            // 1. Caso: Subtema correlativo (ej. "1.1 Conceptos")
            const subMatch = clean.match(/^(\d+)\.(\d+)([\s:.\-]+)?(.*)$/);
            if (subMatch) {
                const [, major, minor, , content] = subMatch;
                // Si la línea estaba vacía (solo el prefijo "1.2"), salir de la lista
                if (!content.trim()) {
                    e.preventDefault();
                    document.execCommand('insertHTML', false, '<div><br></div>');
                    handleInput();
                    return;
                }

                e.preventDefault();
                const nextMinor = parseInt(minor, 10) + 1;
                document.execCommand('insertHTML', false, `<div>${major}.${nextMinor} &nbsp;</div>`);
                handleInput();
                return;
            }

            // 2. Caso: Tema Principal (ej. "Tema 1: Fundamentos...")
            const themeMatch = clean.match(/^tema\s*(\d+)[\s:.\-]+(.*)$/i);
            if (themeMatch) {
                e.preventDefault();
                const themeNum = themeMatch[1] || String(unitNumber);
                document.execCommand('insertHTML', false, `<div>${themeNum}.1 &nbsp;</div>`);
                handleInput();
                return;
            }
        }
    };

    return (
        <div className={`w-full font-sans rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs ${className}`}>
            {/* Barra de Herramientas Minimalista */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-1.5">
                    {/* Deshacer / Rehacer */}
                    <div className="flex items-center gap-0.5 pr-1.5 border-r border-slate-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={disabled || past.length === 0}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Deshacer (Ctrl+Z)"
                        >
                            <Undo2 size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={disabled || future.length === 0}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200/60 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Rehacer (Ctrl+Y)"
                        >
                            <Redo2 size={13} />
                        </button>
                    </div>

                    {/* Botón Insertar Tema */}
                    <button
                        type="button"
                        onClick={handleInsertTheme}
                        disabled={disabled}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Insertar nuevo Tema Principal"
                    >
                        <Plus size={12} className="text-[#0070f3]" />
                        <span>Tema Principal</span>
                    </button>

                    {/* Botón Insertar Subtema */}
                    <button
                        type="button"
                        onClick={handleInsertSubtopic}
                        disabled={disabled}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        title="Insertar siguiente subtema correlativo"
                    >
                        <ListOrdered size={12} className="text-[#0070f3]" />
                        <span>Subtema ({unitNumber}.x)</span>
                    </button>
                </div>
            </div>

            {/* Documento Fluido sin cuadros ni outlines */}
            <div className="p-4 bg-white dark:bg-zinc-950">
                <div
                    ref={editorDivRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    data-placeholder={dynamicPlaceholder}
                    style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
                    className="w-full bg-transparent text-xs sm:text-sm font-sans text-slate-900 dark:text-zinc-100 leading-relaxed min-h-[140px] empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 dark:empty:before:text-zinc-500 whitespace-pre-wrap select-text cursor-text focus:outline-none focus:ring-0"
                />
            </div>
        </div>
    );
});

CurriculumOutlineEditor.displayName = 'CurriculumOutlineEditor';
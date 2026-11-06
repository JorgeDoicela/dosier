import React, { useState, useEffect, useMemo } from 'react';
import { Tag, Save, Check, RefreshCw, FileText, Info } from 'lucide-react';
import type { DocumentTemplateDto } from '../../types';

interface TemplateFormatPropertiesProps {
    template: DocumentTemplateDto;
    onSavePattern: (pattern: string) => Promise<void>;
}

const PRESET_PATTERNS = [
    { label: 'PEA Oficial por Carrera y Periodo', pattern: 'PEA_{carrera}_{asignatura}_{periodo}' },
    { label: 'Estándar General DOSIER', pattern: '{code}_{carrera}_{asignatura}_{periodo}' },
    { label: 'Prefijo Institucional con Código', pattern: 'DOSIER_{code}_{asignatura}_{periodo}' },
    { label: 'Completo con Docente Elaborador', pattern: '{carrera}_{asignatura}_{docente}_{periodo}' },
    { label: 'Con Fecha de Emisión', pattern: '{code}_{asignatura}_{fecha}' },
];

const AVAILABLE_TOKENS = [
    { token: '{code}', label: 'Código', desc: 'Código del formato (ej: PEA)' },
    { token: '{carrera}', label: 'Carrera', desc: 'Nombre de la carrera' },
    { token: '{asignatura}', label: 'Asignatura', desc: 'Nombre de la materia' },
    { token: '{periodo}', label: 'Periodo', desc: 'Periodo académico (ej: 2026-1)' },
    { token: '{docente}', label: 'Docente', desc: 'Docente elaborador' },
    { token: '{fecha}', label: 'Fecha', desc: 'Fecha actual AAAAMMDD' },
    { token: '{version}', label: 'Versión', desc: 'Versión de la plantilla' },
    { token: '{institucion}', label: 'Institución', desc: 'Siglas ISTPET' },
];

export const TemplateFormatProperties: React.FC<TemplateFormatPropertiesProps> = ({
    template,
    onSavePattern,
}) => {
    const initialPattern = template.filenamePattern || template.filename_pattern || '{code}_{carrera}_{asignatura}_{periodo}';
    const [pattern, setPattern] = useState(initialPattern);
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    useEffect(() => {
        const next = template.filenamePattern || template.filename_pattern || '{code}_{carrera}_{asignatura}_{periodo}';
        setPattern(next);
        setSavedSuccess(false);
    }, [template.code, template.filenamePattern, template.filename_pattern]);

    const handleInsertToken = (token: string) => {
        setPattern((prev) => {
            if (!prev.trim()) return token;
            if (prev.endsWith('_') || prev.endsWith('-')) return `${prev}${token}`;
            return `${prev}_${token}`;
        });
        setSavedSuccess(false);
    };

    const handleApplyPreset = (presetPattern: string) => {
        setPattern(presetPattern);
        setSavedSuccess(false);
    };

    const previewFilename = useMemo(() => {
        if (!pattern.trim()) return 'documento.pdf';

        const codeVal = (template.code || 'PEA').replace(/_OFICIAL$/i, '');
        const sampleValues: Record<string, string> = {
            '{code}': codeVal,
            '{codigo}': codeVal,
            '{carrera}': 'DESARROLLO_DE_SOFTWARE',
            '{asignatura}': 'PROGRAMACION_WEB',
            '{materia}': 'PROGRAMACION_WEB',
            '{periodo}': '2026-1',
            '{docente}': 'CARLOS_VALENCIA',
            '{profesor}': 'CARLOS_VALENCIA',
            '{fecha}': new Date().toISOString().slice(0, 10).replace(/-/g, ''),
            '{version}': `v${template.version || 1}`,
            '{institucion}': 'ISTPET',
        };

        let result = pattern;
        Object.entries(sampleValues).forEach(([token, val]) => {
            const regex = new RegExp(token.replace(/[{}]/g, '\\$&'), 'gi');
            result = result.replace(regex, val);
        });

        // Limpiar tokens residuales y sanitizar
        result = result.replace(/\{[^}]+\}/g, '');
        result = result.replace(/[\\/:*?"<>|]/g, '_');
        result = result.replace(/_+/g, '_');
        result = result.replace(/-+/g, '-');
        result = result.replace(/^[_\-.]+|[_\-.]+$/g, '');

        if (!result) result = `DOSIER_${codeVal}`;
        return result.endsWith('.pdf') ? result : `${result}.pdf`;
    }, [pattern, template.code, template.version]);

    const previewTitle = useMemo(() => {
        return previewFilename.replace(/\.pdf$/i, '').replace(/_/g, ' ').trim();
    }, [previewFilename]);

    const isDirty = pattern !== initialPattern;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;

        setSaving(true);
        try {
            await onSavePattern(pattern.trim());
            setSavedSuccess(true);
            setTimeout(() => setSavedSuccess(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-200">
            {/* Cabecera del Formato */}
            <div className="pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#0070f3]" strokeWidth={1.5} />
                    <h3 className="font-semibold text-xs text-slate-900 dark:text-zinc-100">
                        Nomenclatura del Documento
                    </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Define la estructura automática con la que se nombrará el archivo descargado y el título en el visor PDF oficial.
                </p>
            </div>

            {/* Presets Oficiales */}
            <div className="space-y-2">
                <label className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 block">
                    Plantillas de Nomenclatura Predefinidas
                </label>
                <div className="space-y-1.5">
                    {PRESET_PATTERNS.map((p) => {
                        const isCurrent = pattern === p.pattern;
                        return (
                            <button
                                key={p.pattern}
                                type="button"
                                onClick={() => handleApplyPreset(p.pattern)}
                                className={`w-full text-left p-2 rounded-md border text-xs transition-colors cursor-pointer ${
                                    isCurrent
                                        ? 'border-[#0070f3] bg-blue-50/70 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 font-medium'
                                        : 'border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-300'
                                }`}
                            >
                                <div className="font-medium text-[11px]">{p.label}</div>
                                <code className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono block mt-0.5">
                                    {p.pattern}
                                </code>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Editor de Patrón */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                            Patrón de Nombre Personalizado
                        </label>
                        {isDirty && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                                Cambios sin guardar
                            </span>
                        )}
                    </div>
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => {
                            setPattern(e.target.value);
                            setSavedSuccess(false);
                        }}
                        placeholder="{code}_{carrera}_{asignatura}_{periodo}"
                        className="w-full text-xs font-mono bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-md p-2 text-slate-900 dark:text-zinc-100 focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 transition-all outline-none"
                    />
                </div>

                {/* Etiquetas de Variables Disponibles */}
                <div className="space-y-1.5">
                    <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block">
                        Haz clic en una etiqueta para insertarla:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {AVAILABLE_TOKENS.map((item) => (
                            <button
                                key={item.token}
                                type="button"
                                onClick={() => handleInsertToken(item.token)}
                                title={item.desc}
                                className="px-2 py-1 text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0070f3] dark:hover:text-blue-400 text-slate-700 dark:text-zinc-300 rounded border border-slate-200 dark:border-zinc-700 transition-colors cursor-pointer"
                            >
                                + {item.token}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Vista Previa en Vivo */}
                <div className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2 mt-3">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-zinc-300">
                        <FileText className="w-3.5 h-3.5 text-[#0070f3]" strokeWidth={1.5} />
                        <span className="text-[11px] font-semibold">Previsualización del Archivo Generado</span>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                            Nombre del archivo descargado:
                        </span>
                        <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-950 p-2 rounded border border-slate-200 dark:border-zinc-800 break-all select-all font-semibold">
                            {previewFilename}
                        </div>
                    </div>

                    <div className="space-y-1 pt-1">
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">
                            Título en el visor PDF (Pestaña / Encabezado):
                        </span>
                        <div className="text-xs text-slate-800 dark:text-zinc-200 bg-white dark:bg-zinc-950 p-2 rounded border border-slate-200 dark:border-zinc-800 break-words font-medium">
                            {previewTitle}
                        </div>
                    </div>
                </div>

                {/* Botón de Guardar */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={saving || (!isDirty && !savedSuccess)}
                        className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                            savedSuccess
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#0070f3] hover:bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                                <span>Guardando Nomenclatura...</span>
                            </>
                        ) : savedSuccess ? (
                            <>
                                <Check className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span>¡Nomenclatura Guardada!</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
                                <span>Guardar Nomenclatura</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Aviso informativo de roles */}
            <div className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 flex items-start gap-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-[#0070f3] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                    Configurable exclusivamente por <strong>Vicerrector</strong>, <strong>Coordinador Académico</strong> y <strong>Administrador</strong>. El cambio aplica de inmediato en la siguiente emisión oficial.
                </span>
            </div>
        </div>
    );
};


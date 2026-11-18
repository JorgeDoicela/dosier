/**
 * @file CreateTemplateModal.tsx
 * @description Modal institucional para la creación de nuevas plantillas documentales en DOSIER.
 * 
 * @architecture
 * Diseñado bajo el estándar Modern Enterprise Docs:
 * - Superficies 100% sólidas y opacas, sin transparencias ni efectos translúcidos.
 * - Tipografía Inter sobria, sin emojis ni lenguaje inflado.
 * - Validación estricta de código único de plantilla en mayúsculas y guiones bajos.
 * - Acceso a las categorías normativas del instituto (Curricular, Acreditación, Reportes, Institucional).
 */

import React, { useState } from 'react';
import { X, FileCode2, Plus } from 'lucide-react';
import type { CreateTemplateDto } from '../../../../services/documentTemplateService';

interface CreateTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateTemplateDto) => Promise<void>;
}

export const CreateTemplateModal: React.FC<CreateTemplateModalProps> = ({
    isOpen,
    onClose,
    onSubmit
}) => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<number>(90);
    const [requiresSignature, setRequiresSignature] = useState(true);
    const [requiresLopdp, setRequiresLopdp] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
        setCode(val);
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim() || !name.trim()) {
            setError('El código y el nombre del documento son obligatorios.');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);
            await onSubmit({
                code: code.trim().toUpperCase(),
                name: name.trim(),
                description: description.trim() || undefined,
                category,
                requiresSignature,
                requiresLopdp
            });
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Error al crear la plantilla.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
            <div
                className="w-full max-w-lg rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden flex flex-col animate-fade-in"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Cabecera del modal */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-[#0070f3] dark:text-blue-400">
                            <FileCode2 className="w-4 h-4" strokeWidth={2} />
                        </div>
                        <div>
                            <h2 id="modal-title" className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                Nueva Plantilla Institucional
                            </h2>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Alta de formato documental en el motor oficial de DOSIER
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Cerrar ventana"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Código Único (Identificador Inmutable) <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: GUIA_TALLER_REDES"
                            value={code}
                            onChange={handleCodeChange}
                            maxLength={50}
                            className="w-full px-3 py-2 text-xs font-mono rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                        />
                        <p className="text-[10px] text-zinc-400">
                            Solo mayúsculas, números y guiones bajos. No podrá modificarse luego de crearse.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Nombre Oficial del Documento <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Ej: Guía de Taller de Telecomunicaciones"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={150}
                            className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Descripción y Propósito Normativo
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Describa el objetivo formativo o administrativo de este instrumento institucional..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={350}
                            className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3] resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                            Clasificación Curricular e Institucional
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                        >
                            <option value={90}>Currículo Académico (PEA y Prácticas)</option>
                            <option value={2}>Acreditación y Validación Colegiada (Actas)</option>
                            <option value={63}>Reportes, Analíticas y Seguimiento CACES</option>
                            <option value={1}>Institucional y Portafolio</option>
                        </select>
                    </div>

                    {/* Opciones de gobernanza */}
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={requiresSignature}
                                onChange={(e) => setRequiresSignature(e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-[#0070f3] focus:ring-[#0070f3]"
                            />
                            <span className="text-xs text-zinc-700 dark:text-zinc-300">
                                Requiere firmas de responsabilidad institucional (DFRM / P12)
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={requiresLopdp}
                                onChange={(e) => setRequiresLopdp(e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-[#0070f3] focus:ring-[#0070f3]"
                            />
                            <span className="text-xs text-zinc-700 dark:text-zinc-300">
                                Incluir cláusula de protección de datos (LOPDP) en pie de página
                            </span>
                        </label>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !code.trim() || !name.trim()}
                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#0070f3] hover:bg-blue-600 rounded-md shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{submitting ? 'Creando Plantilla...' : 'Crear Plantilla'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

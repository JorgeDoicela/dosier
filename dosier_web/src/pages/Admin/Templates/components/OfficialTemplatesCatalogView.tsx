/**
 * @file OfficialTemplatesCatalogView.tsx
 * @description Vista institucional del Catálogo de Formatos Oficiales y Plantillas para Docentes y Autoridades ISTPET.
 * 
 * @architecture
 * Diseñado bajo el estándar Geist Editorial:
 * - Bento Grid responsivo con micro-interacciones pulidas.
 * - Filtro dinámico por categorías normativas e input de búsqueda en tiempo real.
 * - Acceso directo a previsualización en alta fidelidad (Web/PDF) y descarga oficial directa.
 * - Badges normativos institucionales (Firma Electrónica, CACES, LOPDP).
 * - Fondos 100% sólidos, cero transparencias ni emojis.
 */

import React, { useState, useMemo } from 'react';
import {
    FileText,
    Award,
    GraduationCap,
    BarChart3,
    Eye,
    Download,
    Search,
    X,
    Copy,
    Check,
    ShieldCheck
} from 'lucide-react';
import { PageHeader } from '../../../../components/Common/PageHeader';
import type { DocumentTemplateDto } from '../types';

interface OfficialTemplatesCatalogViewProps {
    templates: DocumentTemplateDto[];
    loading: boolean;
    onOpenPreview: (tmpl: DocumentTemplateDto) => void;
    onDownloadPdf: (tmpl: DocumentTemplateDto) => void;
}

type TemplateCategoryFilter = 'ALL' | 'CURRICULAR' | 'ACREDITACION' | 'REPORTES';

function getTemplateCategory(code: string): 'CURRICULAR' | 'ACREDITACION' | 'REPORTES' | 'INSTITUCIONAL' {
    const c = (code || '').toUpperCase();
    if (c.includes('PEA') || c.includes('CURRICULUM') || c.includes('ESTUDIO') || c.includes('ASIGNATURA')) return 'CURRICULAR';
    if (c.includes('CACES') || c.includes('ACREDIT') || c.includes('ACTA') || c.includes('CERTIF')) return 'ACREDITACION';
    if (c.startsWith('REPORTE') || c.includes('ANALITICA') || c.includes('SEGUIMIENTO')) return 'REPORTES';
    return 'INSTITUCIONAL';
}

function getCategoryBadge(category: 'CURRICULAR' | 'ACREDITACION' | 'REPORTES' | 'INSTITUCIONAL') {
    switch (category) {
        case 'CURRICULAR':
            return {
                label: 'Gestión Curricular (PEA)',
                icon: GraduationCap,
                textClass: 'text-blue-600 dark:text-blue-400'
            };
        case 'ACREDITACION':
            return {
                label: 'Acreditación & CACES',
                icon: Award,
                textClass: 'text-amber-600 dark:text-amber-400'
            };
        case 'REPORTES':
            return {
                label: 'Reportes & Analíticas',
                icon: BarChart3,
                textClass: 'text-purple-600 dark:text-purple-400'
            };
        default:
            return {
                label: 'Institucional Oficial',
                icon: FileText,
                textClass: 'text-zinc-600 dark:text-zinc-400'
            };
    }
}

function getTemplateDescription(tmpl: DocumentTemplateDto): string {
    const c = (tmpl.code || '').toUpperCase();
    if (c.includes('PEA')) {
        return 'Estructura oficial del Programa de Estudio de la Asignatura en sus 11 bloques normados (datos generales, objetivos, prerrequisitos, RDA, unidades temáticas, metodología, evaluación y firmas de responsabilidad).';
    }
    if (c.includes('ACTA')) {
        return 'Acta formal de revisión, validación y aprobación del PEA entre Docente, Coordinador de Carrera y Vicerrectorado.';
    }
    if (c.includes('REPORTE') || c.includes('CACES')) {
        return 'Matriz estandarizada de seguimiento curricular y evidencias de cumplimiento para procesos de aseguramiento de la calidad CACES.';
    }
    return tmpl.description || 'Estructura documental oficial normada y estandarizada por el Vicerrectorado Académico del ISTPET.';
}

export const OfficialTemplatesCatalogView: React.FC<OfficialTemplatesCatalogViewProps> = ({
    templates,
    loading,
    onOpenPreview,
    onDownloadPdf
}) => {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategoryFilter>('ALL');
    const [copiedTmplCode, setCopiedTmplCode] = useState<string | null>(null);

    const handleCopyTemplatePrompt = async (tmpl: DocumentTemplateDto) => {
        const text = [
            `# FORMATO INSTITUCIONAL OFICIAL: ${tmpl.name}`,
            `• Código Normativo: ${tmpl.code}`,
            `• Versión Aprobada: v${tmpl.version}`,
            `• Marco de Acreditación: CACES / ISTPET`,
            `\n## ALCANCE Y DESCRIPCIÓN:`,
            getTemplateDescription(tmpl),
            `\n## REQUERIMIENTOS:`,
            `• Firma Electrónica: ${tmpl.requiresElectronicSignature ? 'Requerida' : 'No requerida'}`,
            `• Cláusula LOPDP: ${tmpl.requiresLopdpClause ? 'Requerida' : 'No requerida'}`
        ].join('\n');

        try {
            await navigator.clipboard.writeText(text);
            setCopiedTmplCode(tmpl.code);
            setTimeout(() => setCopiedTmplCode(null), 2000);
        } catch (e) {
            console.error('Error al copiar especificación:', e);
        }
    };

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch =
                t.name.toLowerCase().includes(search.toLowerCase()) ||
                t.code.toLowerCase().includes(search.toLowerCase()) ||
                (t.description || '').toLowerCase().includes(search.toLowerCase());

            if (!matchesSearch) return false;

            if (selectedCategory === 'ALL') return true;
            return getTemplateCategory(t.code) === selectedCategory;
        });
    }, [templates, search, selectedCategory]);

    const stats = useMemo(() => {
        const total = templates.length;
        const curricular = templates.filter(t => getTemplateCategory(t.code) === 'CURRICULAR').length;
        const acreditacion = templates.filter(t => getTemplateCategory(t.code) === 'ACREDITACION').length;
        const reportes = templates.filter(t => getTemplateCategory(t.code) === 'REPORTES').length;
        return { total, curricular, acreditacion, reportes };
    }, [templates]);

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex flex-col">
            <PageHeader
                title="Catálogo de Formatos y Plantillas Oficiales"
                description="Repositorio normado de estructuras curriculares, programas de estudio (PEA) e informes acreditados del Instituto Superior Tecnológico 'Mayor Pedro Traversari'."
            />

            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                
                {/* BARRA DE FILTROS Y BÚSQUEDA */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {/* Filtros de categoría */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('ALL')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                                selectedCategory === 'ALL'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Todos ({stats.total})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('CURRICULAR')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                                selectedCategory === 'CURRICULAR'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Curricular & PEA ({stats.curricular})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('ACREDITACION')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                                selectedCategory === 'ACREDITACION'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Acreditación & Actas ({stats.acreditacion})
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedCategory('REPORTES')}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                                selectedCategory === 'REPORTES'
                                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Reportes & Analíticas ({stats.reportes})
                        </button>
                    </div>

                    {/* Input de Búsqueda */}
                    <div className="relative w-full sm:w-72 shrink-0">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Buscar formato o código..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-8 py-1.5 text-xs rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* BENTO GRID DE PLANTILLAS */}
                {loading ? (
                    <div className="py-20 text-center text-sm text-zinc-500 dark:text-zinc-400">
                        Cargando catálogo oficial de documentos...
                    </div>
                ) : filteredTemplates.length === 0 ? (
                    <div className="py-20 text-center p-8 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" strokeWidth={1.5} />
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            No se encontraron plantillas
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            No existen formatos que coincidan con el término de búsqueda o categoría seleccionada.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTemplates.map((tmpl) => {
                            const cat = getTemplateCategory(tmpl.code);
                            const badge = getCategoryBadge(cat);
                            const BadgeIcon = badge.icon;
                            const description = getTemplateDescription(tmpl);

                            return (
                                <div
                                    key={tmpl.code}
                                    className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md transition-all relative overflow-hidden"
                                >
                                    <div>
                                        {/* Cabecera de la Tarjeta */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <BadgeIcon className={`w-4 h-4 ${badge.textClass}`} strokeWidth={1.5} />
                                                <span className={`text-[11px] font-semibold tracking-wide uppercase ${badge.textClass}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50">
                                                v{tmpl.version}
                                            </span>
                                        </div>

                                        {/* Título y Código */}
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {tmpl.name}
                                        </h3>
                                        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-1 uppercase">
                                            Código: {tmpl.code}
                                        </p>

                                        {/* Descripción */}
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed line-clamp-3">
                                            {description}
                                        </p>
                                    </div>

                                    {/* Pie con Metadatos Normativos y Botones de Acción */}
                                    <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6 space-y-4">
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                                            {tmpl.requiresElectronicSignature && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    Firma Electrónica
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                Acreditado CACES
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onOpenPreview(tmpl)}
                                                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-zinc-100 transition-colors cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                Previsualizar
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDownloadPdf(tmpl)}
                                                title="Descargar PDF Oficial"
                                                className="p-2 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 transition-colors cursor-pointer"
                                            >
                                                <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => handleCopyTemplatePrompt(tmpl)}
                                                title="Copiar especificación normativa"
                                                className="p-2 rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                                            >
                                                {copiedTmplCode === tmpl.code ? (
                                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

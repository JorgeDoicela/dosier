import React from 'react';
import { Library, Info, BookOpen, Globe } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface PeaBibliographySectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaBibliographySection: React.FC<PeaBibliographySectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const displayTitle = c.title || 'j) BIBLIOGRAFÍA BÁSICA Y DE CONSULTA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <Library className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Normas APA 7.ª Edición
                </span>
            </div>

            {/* BIBLIOGRAFÍA BÁSICA */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            Bibliografía Básica Institucional (Biblioteca Virtual ISTPET)
                        </span>
                    </div>
                    <span className="text-[10px] text-text-dim font-medium">
                        Textos Guía Obligatorios
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Ingrese los libros de texto base y manuales técnicos de la asignatura vigentes (últimos 5 años preferentemente) citados en formato APA 7ma edición.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="BibliografiaBasica"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="1. Sommerville, I. (2019). Ingeniería del software (10.ª ed.). Pearson Educación.&#10;2. Pressman, R. S., & Maxim, B. R. (2021). Software engineering: a practitioner's approach (9th ed.). McGraw-Hill.&#10;3. ..."
                            className="min-h-[160px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('BibliografiaBasica', html, meta)}
                        />
                    </div>
                </div>
            </div>

            {/* BIBLIOGRAFÍA DE CONSULTA Y RECURSOS DIGITALES */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            Bibliografía de Consulta y Recursos Digitales Especializados
                        </span>
                    </div>
                    <span className="text-[10px] text-text-dim font-medium">
                        Bases de Datos Científicas y Repositorios
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Artículos de revistas indexadas (Scopus, SciELO, Redalyc, Latindex), documentación técnica oficial, repositorios institucionales y recursos educativos abiertos.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="BibliografiaConsulta"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="1. IEEE Computer Society. (2020). Guide to the Software Engineering Body of Knowledge (SWEBOK).&#10;2. Enlaces a documentación técnica, bases de datos o artículos científicos complementarios..."
                            className="min-h-[160px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('BibliografiaConsulta', html, meta)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

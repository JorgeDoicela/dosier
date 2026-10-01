import React from 'react';
import { Info } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaBibliographySectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaBibliographySection: React.FC<PeaBibliographySectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-8 animate-fade-in font-sans">
            {/* BIBLIOGRAFÍA BÁSICA */}
            <div className="space-y-3.5">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    Bibliografía Básica Institucional (Textos Guía)
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Ingrese los libros de texto base y manuales técnicos de la asignatura vigentes (últimos 5 años preferentemente) citados bajo norma <strong className="text-text-main font-semibold">APA 7.ª edición</strong>.
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="BibliografiaBasica"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="1. Sommerville, I. (2019). Ingeniería del software (10.ª ed.). Pearson Educación.&#10;2. Pressman, R. S., & Maxim, B. R. (2021). Software engineering: a practitioner's approach (9th ed.). McGraw-Hill."
                        onChange={(html, meta) => onUpdate('BibliografiaBasica', html, meta)}
                    />
                </div>
            </div>

            {/* BIBLIOGRAFÍA DE CONSULTA */}
            <div className="space-y-3.5 pt-2">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    Bibliografía de Consulta y Recursos Digitales Especializados
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Artículos de revistas indexadas (Scopus, SciELO, Redalyc, Latindex), documentación técnica oficial, repositorios institucionales y recursos educativos abiertos.
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="BibliografiaConsulta"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="1. IEEE Computer Society. (2020). Guide to the Software Engineering Body of Knowledge (SWEBOK).&#10;2. Enlaces a documentación técnica, bases de datos o artículos científicos complementarios..."
                        onChange={(html, meta) => onUpdate('BibliografiaConsulta', html, meta)}
                    />
                </div>
            </div>
        </div>
    );
};


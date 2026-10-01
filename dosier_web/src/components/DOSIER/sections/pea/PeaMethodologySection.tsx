import React from 'react';
import { Info } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaMethodologySectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaMethodologySection: React.FC<PeaMethodologySectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-8 animate-fade-in font-sans">
            {/* ESTRATEGIAS METODOLÓGICAS */}
            <div className="space-y-3.5">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    Estrategias Metodológicas de Enseñanza Activa
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Detalle los métodos didácticos a emplear según el Modelo Educativo del ISTPET: <strong className="text-text-main font-semibold">Aprendizaje Basado en Problemas (ABP), Aprendizaje Orientado a Proyectos (POL), aula invertida, estudios de caso y prácticas colaborativas</strong>.
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="MetodologiaEnsenanza"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="Detalle los métodos didácticos a emplear (ej. Aprendizaje Basado en Problemas - ABP, Aprendizaje Orientado a Proyectos - POL, aula invertida, estudios de caso y prácticas colaborativas)..."
                        onChange={(html, meta) => onUpdate('MetodologiaEnsenanza', html, meta)}
                    />
                </div>
            </div>

            {/* RECURSOS DIDÁCTICOS E INFORMATIZACIÓN */}
            <div className="space-y-3.5 pt-2">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    Recursos Didácticos e Informatización del Aprendizaje
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Indique las herramientas tecnológicas institucionales: <strong className="text-text-main font-semibold">Entorno Virtual de Aprendizaje (EVA - ISTPET), simuladores, repositorios Git, software especializado y guías digitales de la asignatura</strong>.
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="RecursosDidacticos"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="Detalle recursos digitales:&#10;• Entorno Virtual de Aprendizaje (EVA - ISTPET)&#10;• Simuladores de circuitos / entornos de desarrollo IDE&#10;• Diapositivas, lecturas especializadas y guías de laboratorio..."
                        onChange={(html, meta) => onUpdate('RecursosDidacticos', html, meta)}
                    />
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaCompetenciesSectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaCompetenciesSection: React.FC<PeaCompetenciesSectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-8 animate-fade-in font-sans">
            {/* d) RESULTADOS DE APRENDIZAJE DE LA CARRERA */}
            <div className="space-y-3.5">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    d) Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Especifique los resultados de aprendizaje del <strong className="text-text-main font-semibold">perfil de egreso</strong> de la carrera técnica/tecnológica a los cuales tributa directamente la presente asignatura.
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="RdaCarrera"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="1. Aplica principios técnicos para la resolución de problemáticas tecnológicas...&#10;2. Demuestra capacidad de trabajo en equipo multidisciplinario..."
                        onChange={(html, meta) => onUpdate('RdaCarrera', html, meta)}
                    />
                </div>
            </div>

            {/* e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA */}
            <div className="space-y-3.5 pt-2">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    e) Resultados de Aprendizaje de la Asignatura (RDA Específicos)
                </h4>

                <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        Redacte los <strong className="text-text-main font-semibold">resultados de aprendizaje específicos (RDA)</strong> observables y medibles que el estudiante demostrará al culminar la asignatura (mínimo uno por unidad temática).
                    </p>
                </div>

                <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                    <CoWorkEditor
                        field="ResultadosAprendizaje"
                        cowork={cowork}
                        readOnly={readOnly}
                        toolbarMode="apa_full"
                        placeholder="1. Analiza los requerimientos de software aplicando buenas prácticas de ingeniería...&#10;2. Implementa componentes modulares reutilizables con pruebas automatizadas..."
                        onChange={(html, meta) => onUpdate('ResultadosAprendizaje', html, meta)}
                    />
                </div>
            </div>
        </div>
    );
};


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

                <p className="text-xs text-text-dim leading-relaxed">
                    Especifique los resultados de aprendizaje del <strong className="text-text-main font-semibold">perfil de egreso</strong> de la carrera a los cuales tributa directamente la asignatura.
                </p>

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

                <p className="text-xs text-text-dim leading-relaxed">
                    Redacte los <strong className="text-text-main font-semibold">resultados de aprendizaje específicos (RDA)</strong> observables y medibles al culminar la asignatura (mínimo uno por unidad temática).
                </p>

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


import React from 'react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaCareerOutcomesSectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

/**
 * Sección D oficial del PEA:
 * Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta.
 */
export const PeaCareerOutcomesSection: React.FC<PeaCareerOutcomesSectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-4 animate-fade-in font-sans">
            <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    d) Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta
                </h4>

                <p className="text-xs text-text-dim leading-relaxed">
                    Especifique los resultados de aprendizaje del <strong className="text-text-main font-semibold">perfil de egreso</strong> de la carrera a los cuales tributa directamente la asignatura.
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
    );
};

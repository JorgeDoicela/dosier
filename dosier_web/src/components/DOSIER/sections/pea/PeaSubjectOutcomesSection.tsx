import React from 'react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaSubjectOutcomesSectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

/**
 * Sección E oficial del PEA:
 * Resultados de Aprendizaje de la Asignatura (RDA Específicos).
 */
export const PeaSubjectOutcomesSection: React.FC<PeaSubjectOutcomesSectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-4 animate-fade-in font-sans">
            <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-text-main uppercase tracking-wide">
                    e) Resultados de Aprendizaje de la Asignatura:
                </h4>

                <p className="text-xs text-text-dim leading-relaxed">
                    Redacte los <strong className="text-text-main font-semibold">resultados de aprendizaje específicos (RDA)</strong> observables y medibles al culminar la asignatura (mínimo uno por unidad temática).
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
    );
};

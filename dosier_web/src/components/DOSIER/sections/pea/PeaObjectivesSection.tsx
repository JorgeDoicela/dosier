import React from 'react';
import { Info } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';

interface PeaObjectivesSectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaObjectivesSection: React.FC<PeaObjectivesSectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false
}) => {
    return (
        <div className="w-full space-y-5 sm:space-y-6 animate-fade-in font-sans">
            {/* Guía Pedagógica */}
            <p className="text-xs text-text-dim leading-relaxed">
                Estructura formativa recomendada: <strong className="text-text-main font-semibold">Verbo en infinitivo + Objeto de conocimiento + Finalidad formativa + Contexto o método de aplicación</strong>.
            </p>

            {/* Editor de Objetivo directo sobre el lienzo */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-2xs overflow-hidden">
                <CoWorkEditor
                    field="ObjetivoAsignatura"
                    cowork={cowork}
                    readOnly={readOnly}
                    toolbarMode="apa_full"
                    placeholder="Defina el objetivo formativo de la asignatura articulado a las competencias del perfil profesional..."
                    onChange={(html, meta) => onUpdate('ObjetivoAsignatura', html, meta)}
                />
            </div>
        </div>
    );
};

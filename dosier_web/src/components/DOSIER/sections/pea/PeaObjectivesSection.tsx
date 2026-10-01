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
            {/* Aviso Guía Pedagógica */}
            <div className="flex gap-3 p-4 sm:p-5 rounded-xl bg-surface border border-border-thin shadow-2xs text-xs sm:text-sm text-text-dim items-start">
                <Info size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                    Redactar con estructura pedagógica normada: <strong className="text-text-main font-semibold">Verbo en infinitivo + Objeto de conocimiento (¿Qué?) + Finalidad formativa (¿Para qué?) + Contexto o método de aplicación (¿Cómo?)</strong>, articulado al perfil de egreso del ISTPET.
                </p>
            </div>

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

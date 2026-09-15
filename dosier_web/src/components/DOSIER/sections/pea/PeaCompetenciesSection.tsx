import React from 'react';
import { Award, Info, CheckCircle2 } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface PeaCompetenciesSectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaCompetenciesSection: React.FC<PeaCompetenciesSectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const displayTitle = c.title || 'd) RESULTADOS DE APRENDIZAJE DE LA CARRERA Y e) DE LA ASIGNATURA';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <Award className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Alineación Curricular RDA
                </span>
            </div>

            {/* d) RESULTADOS DE APRENDIZAJE DE LA CARRERA */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        d) Resultados de Aprendizaje de la Carrera a los que la Asignatura Aporta
                    </span>
                    <span className="text-[10px] text-text-dim font-medium">
                        Perfil de Egreso Institucional
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Especifique los resultados de aprendizaje del <strong>perfil de egreso</strong> de la carrera técnica/tecnológica a los cuales tributa directamente la presente asignatura.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="RdaCarrera"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="1. Aplica principios técnicos para la resolución de problemáticas tecnológicas...&#10;2. Demuestra capacidad de trabajo en equipo multidisciplinario..."
                            className="min-h-[140px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('RdaCarrera', html, meta)}
                        />
                    </div>
                </div>
            </div>

            {/* e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        e) Resultados de Aprendizaje de la Asignatura (RDA Específicos)
                    </span>
                    <span className="text-[10px] text-text-dim font-medium">
                        Logros Verificables
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Redacte los <strong>resultados de aprendizaje específicos (RDA)</strong> observables y medibles que el estudiante demostrará al culminar la asignatura (mínimo uno por unidad temática).
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="ResultadosAprendizaje"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="1. Analiza los requerimientos de software aplicando buenas prácticas de ingeniería...&#10;2. Implementa componentes modulares reutilizables con pruebas automatizadas..."
                            className="min-h-[160px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('ResultadosAprendizaje', html, meta)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

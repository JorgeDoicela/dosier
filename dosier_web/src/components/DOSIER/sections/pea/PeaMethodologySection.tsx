import React from 'react';
import { BookOpen, Laptop, Info } from 'lucide-react';
import { CoWorkEditor } from '../../../../core/cowork/components/CoWorkEditor';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { resolveHeaderColor, getContrastFg } from '../../../../pages/Admin/Templates/components/properties/SharedColorPicker';

interface PeaMethodologySectionProps {
    formData: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

export const PeaMethodologySection: React.FC<PeaMethodologySectionProps> = ({
    cowork,
    onUpdate,
    readOnly = false,
    config
}) => {
    const c = config || {};
    const displayTitle = c.title || 'g) METODOLOGÍA DE ENSEÑANZA Y RECURSOS DIDÁCTICOS';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');

    return (
        <div className="w-full space-y-6 animate-fade-in font-sans">
            {/* ENCABEZADO DE SECCIÓN */}
            <div
                className="w-full py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs"
                style={{ backgroundColor: headerBg, color: getContrastFg(headerBg) }}
            >
                <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-xs uppercase tracking-wider">{displayTitle}</span>
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest">
                    Modelo Educativo ISTPET
                </span>
            </div>

            {/* ESTRATEGIAS METODOLÓGICAS */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                        Estrategias Metodológicas de Enseñanza Activa
                    </span>
                    <span className="text-[10px] text-text-dim font-medium">
                        Pedagogía Constructivista y Práctica
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <blockquote className="text-xs text-text-dim bg-bg-deep p-3 rounded-lg border-l-2 border-brand italic leading-relaxed">
                        «En la propuesta pedagógica establecida en el Modelo Educativo del ISTPET se tiene la metodología de aprendizaje activo, orientada a la resolución de problemas técnicos y proyectos formativos aplicados.»
                    </blockquote>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="MetodologiaEnsenanza"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="Detalle los métodos didácticos a emplear (ej. Aprendizaje Basado en Problemas - ABP, Aprendizaje Orientado a Proyectos - POL, aula invertida, estudios de caso y prácticas colaborativas)..."
                            className="min-h-[160px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('MetodologiaEnsenanza', html, meta)}
                        />
                    </div>
                </div>
            </div>

            {/* RECURSOS DIDÁCTICOS E INFORMATIZACIÓN */}
            <div className="rounded-xl border border-border-thin bg-surface shadow-xs overflow-hidden">
                <div className="p-4 border-b border-border-thin bg-bg-deep/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-brand" />
                        <span className="font-bold text-xs uppercase tracking-wide text-text-main">
                            Recursos Didácticos e Informatización del Aprendizaje
                        </span>
                    </div>
                    <span className="text-[10px] text-text-dim font-medium">
                        TICs y Entornos Digitales
                    </span>
                </div>

                <div className="p-4 space-y-3">
                    <div className="flex gap-2.5 p-3 rounded-lg bg-bg-deep border border-border-thin text-[11px] text-text-dim items-start">
                        <Info size={15} className="text-brand shrink-0 mt-0.5" />
                        <p className="leading-relaxed">
                            Indique las herramientas tecnológicas institucionales: Entorno Virtual de Aprendizaje (Moodle/Teams), simuladores, repositorios Git, software especializado y guías digitales de cátedra.
                        </p>
                    </div>

                    <div className="rounded-xl border border-border-thin overflow-hidden bg-bg-deep">
                        <CoWorkEditor
                            field="RecursosDidacticos"
                            cowork={cowork}
                            readonly={readOnly}
                            placeholder="Detalle recursos digitales:&#10;• Entorno Virtual de Aprendizaje (EVA - ISTPET)&#10;• Simuladores de circuitos / entornos de desarrollo IDE&#10;• Diapositivas, lecturas especializadas y guías de laboratorio..."
                            className="min-h-[160px] p-3 text-xs"
                            onChange={(html, meta) => onUpdate('RecursosDidacticos', html, meta)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

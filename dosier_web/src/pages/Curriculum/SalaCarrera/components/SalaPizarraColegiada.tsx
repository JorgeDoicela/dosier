import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Cpu, CheckCircle2 } from 'lucide-react';

interface SalaPizarraData {
    acuerdosGenerales: string;
    compromisosCatedra: string;
    recursosLaboratorio: string;
}

interface SalaPizarraColegiadaProps {
    carreraNombre: string;
    periodoActual: string;
    salaEntityUuid: string;
}

export const SalaPizarraColegiada: React.FC<SalaPizarraColegiadaProps> = ({
    carreraNombre,
    periodoActual,
    salaEntityUuid,
}) => {
    const storageKey = `sala_pizarra_${salaEntityUuid}`;

    const [pizarra, setPizarra] = useState<SalaPizarraData>(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) return JSON.parse(saved);
        } catch {}
        return {
            acuerdosGenerales: '',
            compromisosCatedra: '',
            recursosLaboratorio: '',
        };
    });

    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setPizarra(JSON.parse(saved));
            }
        } catch {}
    }, [storageKey]);

    const handleUpdate = (field: keyof SalaPizarraData, value: string) => {
        setPizarra((prev) => {
            const updated = { ...prev, [field]: value };
            try {
                localStorage.setItem(storageKey, JSON.stringify(updated));
                setIsSaved(true);
                setTimeout(() => setIsSaved(false), 2000);
            } catch {}
            return updated;
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-thin pb-4">
                <div>
                    <h2 className="text-sm font-semibold text-text-main">
                        Pizarra Colegiada y Acuerdos de Carrera
                    </h2>
                    <p className="text-xs text-text-dim mt-0.5">
                        Espacio de compromisos conjuntos entre docentes de {carreraNombre} para el período {periodoActual}.
                    </p>
                </div>
                {isSaved && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 size={13} />
                        <span>Guardado en sala</span>
                    </div>
                )}
            </div>

            {/* Tarjeta 1: Acuerdos Generales de Carrera */}
            <div className="rounded-xl border border-border-thin bg-surface p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#0070f3]" />
                    <label
                        htmlFor="acuerdos-generales"
                        className="text-xs font-semibold text-text-main uppercase tracking-wider"
                    >
                        Acuerdos de Reunión de Área y Colegiado
                    </label>
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                    Registra los consensos de las reuniones periódicas: lineamientos metodológicos, fechas clave de evaluaciones parciales y criterios unificados de cátedra.
                </p>
                <textarea
                    id="acuerdos-generales"
                    rows={4}
                    value={pizarra.acuerdosGenerales}
                    onChange={(e) => handleUpdate('acuerdosGenerales', e.target.value)}
                    placeholder="Ej: Se acordó homologar las rúbricas de evaluación formativa del primer parcial y fijar la entrega del avance del proyecto de aula en la semana 7..."
                    className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                />
            </div>

            {/* Tarjeta 2: Articulación de Cátedra y Proyectos */}
            <div className="rounded-xl border border-border-thin bg-surface p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                    <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <label
                        htmlFor="compromisos-catedra"
                        className="text-xs font-semibold text-text-main uppercase tracking-wider"
                    >
                        Articulación Curricular y Proyectos Integradores
                    </label>
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                    Compromisos para articular asignaturas paralelas, proyectos integradores de saberes (PIS) y vinculación con la sociedad.
                </p>
                <textarea
                    id="compromisos-catedra"
                    rows={4}
                    value={pizarra.compromisosCatedra}
                    onChange={(e) => handleUpdate('compromisosCatedra', e.target.value)}
                    placeholder="Ej: La asignatura de Base de Datos y Programación Web compartirán el caso de estudio del proyecto integrador semestral para evitar duplicidad de entregables..."
                    className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                />
            </div>

            {/* Tarjeta 3: Requerimientos de Laboratorio y Tecnología */}
            <div className="rounded-xl border border-border-thin bg-surface p-5 space-y-3 shadow-2xs">
                <div className="flex items-center gap-2">
                    <Cpu size={16} className="text-amber-600 dark:text-amber-400" />
                    <label
                        htmlFor="recursos-lab"
                        className="text-xs font-semibold text-text-main uppercase tracking-wider"
                    >
                        Laboratorios, Software y Recursos Compartidos
                    </label>
                </div>
                <p className="text-xs text-text-dim leading-relaxed">
                    Entornos de desarrollo, imágenes de virtualización, bases de datos locales o requerimientos de infraestructura técnica necesarios para las cátedras.
                </p>
                <textarea
                    id="recursos-lab"
                    rows={4}
                    value={pizarra.recursosLaboratorio}
                    onChange={(e) => handleUpdate('recursosLaboratorio', e.target.value)}
                    placeholder="Ej: Se requiere instalar Docker Engine y VS Code en el Laboratorio 3, y verificar los puertos de MariaDB para las prácticas de redes..."
                    className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                />
            </div>
        </div>
    );
};

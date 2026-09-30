import React, { useState } from 'react';
import type { RolSimulado } from './RoleFlowBanner';
import {
    Calendar,
    Edit3,
    FileSearch,
    ShieldCheck,
    Award,
    ChevronRight,
    ArrowRight,
    Check,
    Layers
} from 'lucide-react';

interface Props {
    onSimularRol?: (rol: RolSimulado) => void;
}

export const PipelineCurricularStepper: React.FC<Props> = ({ onSimularRol }) => {
    const [selectedFase, setSelectedFase] = useState<number>(0);

    const handleSelect = (idx: number) => {
        setSelectedFase(idx);
    };

    const FASES = [
        {
            num: 0,
            paso: '01',
            titulo: 'Apertura y Convocatoria',
            etapa: 'Fase 0',
            rol: 'Coordinación Académica',
            rolEquivalente: 'COORD_ACAD' as RolSimulado,
            autoridad: 'Coordinación Académica Institucional',
            baseLegal: 'Reglamento de Régimen Académico CES — Convocatoria Institucional',
            dependencia: 'Distributivo institucional, mallas curriculares y nómina docente',
            descripcion: 'Coordinación Académica activa el período lectivo, sincroniza el distributivo institucional de asignaturas y habilita los tableros de formulación del PEA para los docentes asignados.',
            entregable: 'Tableros de formulación habilitados y calendario curricular oficial vigente.',
            icon: Calendar
        },
        {
            num: 1,
            paso: '02',
            titulo: 'Co-redacción y Validación',
            etapa: 'Fase 1',
            rol: 'Docente de Asignatura',
            rolEquivalente: 'DOCENTE' as RolSimulado,
            autoridad: 'Docente Titular de la Asignatura',
            baseLegal: 'Art. 21 CES — Distribución Horaria Obligatoria (CD + APE + TA = Total de Malla)',
            dependencia: 'Plantilla PEA oficial en sus 11 secciones normativas',
            descripcion: 'El docente de asignatura diligencia colaborativamente las 11 secciones normativas en tiempo real. Valida que el balance horario coincida con la malla de SIGAFI y emite la firma de elaboración para enviar a revisión.',
            entregable: 'PEA completo con balance de horas normado y firma digital de elaboración.',
            icon: Edit3
        },
        {
            num: 2,
            paso: '03',
            titulo: 'Revisión Disciplinar',
            etapa: 'Fase 2',
            rol: 'Coordinación de Carrera',
            rolEquivalente: 'COORD_CARRERA' as RolSimulado,
            autoridad: 'Coordinador de Carrera',
            baseLegal: 'Estatuto Orgánico ISTPET — Control Disciplinar de Contenidos Mínimos y Pertinencia',
            dependencia: 'PEAs de la carrera en estado "En Revisión de Carrera"',
            descripcion: 'El Coordinador de Carrera audita la pertinencia metodológica, bibliográfica y técnica de las unidades temáticas. Si requiere correcciones, registra observaciones por sección; si cumple, emite el Aval de Carrera.',
            entregable: 'Aval disciplinar de carrera registrado formalmente en la bitácora del PEA.',
            icon: FileSearch
        },
        {
            num: 3,
            paso: '04',
            titulo: 'Auditoría CACES',
            etapa: 'Fase 3',
            rol: 'Coordinación Académica',
            rolEquivalente: 'COORD_ACAD' as RolSimulado,
            autoridad: 'Coordinación Académica Institucional',
            baseLegal: 'Modelo de Evaluación Institucional CACES — Criterio Docencia y Currículo',
            dependencia: 'PEAs con Aval de Carrera emitido en espera de validación institucional',
            descripcion: 'Supervisión transversal del cumplimiento normativo de carga horaria, coherencia de resultados de aprendizaje (RDA) y bibliografía. Otorga el Aval Académico necesario para la firma de legalización.',
            entregable: 'Aval institucional que habilita la fase de firma legal del Vicerrectorado.',
            icon: ShieldCheck
        },
        {
            num: 4,
            paso: '05',
            titulo: 'Firma Legal y Publicación',
            etapa: 'Fase 4',
            rol: 'Vicerrectorado Académico',
            rolEquivalente: 'VICERRECTOR' as RolSimulado,
            autoridad: 'Vicerrectorado Académico',
            baseLegal: 'Ley 67 de Comercio Electrónico y Firmas Digitales del Ecuador',
            dependencia: 'PEAs con doble aval normativo (Carrera + Académica) en bandeja de legalización',
            descripcion: 'Máxima autoridad curricular. Ejecuta la firma digital oficial individual o masiva con certificado DFRM o token PKCS#12, generando el sellado criptográfico SHA-256 y legalización en firme del PEA.',
            entregable: 'PEA oficializado en firme, jurídicamente inmutable y disponible con código QR.',
            icon: Award
        }
    ];

    const currentFase = FASES[selectedFase];

    return (
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 space-y-6">
            
            {/* Encabezado Editorial Formal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-xs font-mono text-slate-500 dark:text-zinc-400 block">
                        Paso {selectedFase + 1} de 5
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Circuito Normativo y Fases del PEA
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Autoridad:</span>
                    <strong className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {currentFase.rol}
                    </strong>
                </div>
            </div>

            {/* Layout Split: Timeline Conector (Izquierda) + Folio Documental (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Timeline Conector Vertical */}
                <div className="lg:col-span-4 relative">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-3 px-2 font-semibold">
                        Fases del Circuito Institucional
                    </span>

                    {/* Línea Vertical Continua */}
                    <div className="absolute left-[26px] top-[38px] bottom-[28px] w-[2px] bg-slate-200 dark:bg-zinc-800" />

                    <div className="flex flex-col gap-2 relative z-10">
                        {FASES.map((fase, idx) => {
                            const isSelected = selectedFase === idx;
                            const isPast = idx < selectedFase;

                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleSelect(idx)}
                                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 cursor-pointer group outline-none focus:outline-none ${
                                        isSelected
                                            ? 'bg-blue-50/70 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-900 shadow-xs'
                                            : 'bg-transparent hover:bg-slate-50 dark:hover:bg-zinc-800 border border-transparent'
                                    }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-all ${
                                        isSelected
                                            ? 'bg-[#0070f3] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs'
                                            : isPast
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 group-hover:border-slate-400 dark:group-hover:border-zinc-500'
                                    }`}>
                                        {isPast ? <Check size={14} className="stroke-[3]" /> : fase.paso}
                                    </div>

                                    <div className="flex-1 min-w-0 pt-0.5">
                                        <div className="flex items-center justify-between">
                                            <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold ${
                                                isSelected ? 'text-[#0070f3] dark:text-blue-400' : 'text-slate-400 dark:text-zinc-500'
                                            }`}>
                                                {fase.etapa}
                                            </span>
                                            <ChevronRight size={14} className={`transition-transform ${
                                                isSelected ? 'text-[#0070f3] dark:text-blue-400 opacity-100 translate-x-0.5' : 'opacity-0 group-hover:opacity-40'
                                            }`} />
                                        </div>
                                        <p className={`text-xs truncate font-semibold mt-0.5 ${
                                            isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-zinc-300'
                                        }`}>
                                            {fase.titulo}
                                        </p>
                                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                                            {fase.rol}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Folio Unificado de Especificación Técnica (Derecha) */}
                <div className="lg:col-span-8 p-6 rounded-xl border border-slate-200/50 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-6">
                    
                    {/* Cabecera del Folio */}
                    <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                            {currentFase.etapa}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                            {currentFase.titulo}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Autoridad Responsable: <strong className="text-slate-800 dark:text-slate-200">{currentFase.autoridad}</strong>
                        </p>
                    </div>

                    {/* Descripción Concisa */}
                    <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {currentFase.descripcion}
                    </p>

                    {/* Especificación de Parámetros */}
                    <div className="border-t border-b border-slate-100 dark:border-zinc-800 py-3 space-y-2.5 text-xs">
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px] shrink-0 w-36">
                                Marco Legal
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200 flex-1">
                                {currentFase.baseLegal}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px] shrink-0 w-36">
                                Dependencia
                            </span>
                            <span className="text-slate-700 dark:text-zinc-300 flex-1">
                                {currentFase.dependencia}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                            <span className="font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[11px] shrink-0 w-36">
                                Entregable
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white flex-1 flex items-center gap-1.5">
                                <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>{currentFase.entregable}</span>
                            </span>
                        </div>
                    </div>

                    {/* Pie de Acción */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Paso {selectedFase + 1} de 5 en el circuito oficial
                        </span>

                        {onSimularRol && (
                            <button
                                onClick={() => onSimularRol(currentFase.rolEquivalente)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer shrink-0"
                            >
                                <span>Acceder a vista de {currentFase.rol}</span>
                                <ArrowRight size={13} className="stroke-[2.5]" />
                            </button>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
};

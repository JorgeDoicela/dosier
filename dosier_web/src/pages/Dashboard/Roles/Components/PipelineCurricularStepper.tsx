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
            actor: 'Msc. Cristian Cobos',
            meta: 'Sincronizar y Notificar Distributivo',
            baseLegal: 'Reglamento de Régimen Académico CES — Convocatoria Institucional',
            entradas: 'Base de datos SIGAFI (MySQL 3306): 42 cátedras y 28 docentes activos',
            descripcion: 'Coordinación Académica sincroniza el distributivo institucional de cátedras, establece el calendario con fechas límites oficiales y emite la notificación masiva a todo el cuerpo docente.',
            botonesClave: ['Aperturar Convocatoria 2025-A', 'Notificar Rezagados', 'Conceder Prórroga'],
            entregable: 'Tableros de trabajo y materias habilitadas en SIGAFI para los docentes.',
            icon: Calendar,
            previewRows: [
                { codigo: 'DS-201', nombre: 'Programación Orientada a Objetos', docente: 'Ing. Edison Pérez', estado: 'Borrador Docente', tipo: 'neutral' },
                { codigo: 'DS-301', nombre: 'Estructura de Datos y Algoritmos', docente: 'Ing. Edison Pérez', estado: 'Revisión de Carrera', tipo: 'neutral' },
                { codigo: 'DS-302', nombre: 'Bases de Datos Relacionales y NoSQL', docente: 'Ing. Wilfrido Trujillo', estado: 'Observaciones Pendientes', tipo: 'warning' }
            ]
        },
        {
            num: 1,
            paso: '02',
            titulo: 'Co-redacción y Validación',
            etapa: 'Fase 1',
            rol: 'Docente de Cátedra',
            rolEquivalente: 'DOCENTE' as RolSimulado,
            actor: 'Ing. Edison Pérez',
            meta: 'Validar Horas Art. 21 y Enviar',
            baseLegal: 'Art. 21 CES — Distribución Horaria Obligatoria (CD + APE + TA = Total)',
            entradas: 'Plantilla PEA institucional con 11 secciones normativas en Yjs',
            descripcion: 'El colectivo docente redacta colaborativamente las 11 secciones normativas con concurrencia Yjs en tiempo real. Valida que la carga horaria cuadre exactamente con la malla y envía a revisión.',
            botonesClave: ['Editar PEA (11 Secc.)', 'Clonar de Semestre Anterior', 'Validador Horas CES', 'Enviar a Carrera'],
            entregable: 'PEA completo con cálculo de horas auditado por motor CACES.',
            icon: Edit3,
            previewRows: [
                { codigo: 'DS-201', nombre: 'Programación Orientada a Objetos', docente: 'Ing. Edison Pérez', estado: 'Borrador', tipo: 'neutral' },
                { codigo: 'DS-301', nombre: 'Estructura de Datos y Algoritmos', docente: 'Ing. Edison Pérez', estado: 'En Revisión Carrera', tipo: 'brand' },
                { codigo: 'DS-501', nombre: 'Desarrollo Web Fullstack y Cloud', docente: 'Ing. Edison Pérez', estado: 'Aval Académico Listo', tipo: 'success' }
            ]
        },
        {
            num: 2,
            paso: '03',
            titulo: 'Revisión Disciplinar',
            etapa: 'Fase 2',
            rol: 'Coordinador de Carrera',
            rolEquivalente: 'COORD_CARRERA' as RolSimulado,
            actor: 'Ing. Wilfrido Trujillo',
            meta: 'Emitir Aval de Carrera',
            baseLegal: 'Estatuto Orgánico ISTPET — Control Disciplinar de Contenidos Mínimos',
            entradas: 'PEAs de la carrera en estado "En Revisión de Carrera"',
            descripcion: 'El Coordinador de Carrera audita la pertinencia metodológica y bibliográfica. Si detecta desvíos, formula observaciones específicas por sección; si cumple, emite el Aval de Carrera.',
            botonesClave: ['Revisar Instrumento', 'Observar (Sección Específica)', 'Emitir Aval de Carrera', 'Notificar Docentes'],
            entregable: 'Aval disciplinar de carrera con trazabilidad en bitácora inmutable.',
            icon: FileSearch,
            previewRows: [
                { codigo: 'DS-301', nombre: 'Estructura de Datos y Algoritmos', docente: 'Ing. Edison Pérez', estado: 'Listo para Revisión', tipo: 'brand' },
                { codigo: 'DS-302', nombre: 'Bases de Datos Relacionales y NoSQL', docente: 'Ing. Wilfrido Trujillo', estado: 'Con Observaciones', tipo: 'warning' },
                { codigo: 'DS-401', nombre: 'Ingeniería de Software y Calidad', docente: 'Ing. Marco Proaño', estado: 'Aval de Carrera Emitido', tipo: 'success' }
            ]
        },
        {
            num: 3,
            paso: '04',
            titulo: 'Auditoría CACES',
            etapa: 'Fase 3',
            rol: 'Coordinación Académica',
            rolEquivalente: 'COORD_ACAD' as RolSimulado,
            actor: 'Msc. Cristian Cobos',
            meta: 'Conceder Aval Académico',
            baseLegal: 'Modelo de Evaluación Institucional CACES — Criterio Docencia y Currículo',
            entradas: 'PEAs con Aval de Carrera emitido en espera de validación institucional',
            descripcion: 'Supervisión global de coherencia entre carreras, cumplimiento normativo de matriz horaria y resultados de aprendizaje (RDA). Otorga el Aval Académico necesario para la firma del Vicerrector.',
            botonesClave: ['Auditar PEA Institucional', 'Emitir Aval Académico', 'Conceder Prórroga', 'Ver Historial CACES'],
            entregable: 'Aval institucional que habilita la fase de legalización y firma digital.',
            icon: ShieldCheck,
            previewRows: [
                { codigo: 'DS-401', nombre: 'Ingeniería de Software y Calidad', docente: 'Ing. Marco Proaño', estado: 'Aval de Carrera Emitido', tipo: 'success' },
                { codigo: 'DS-501', nombre: 'Desarrollo Web Fullstack y Cloud', docente: 'Ing. Edison Pérez', estado: 'Aval Académico Concedido', tipo: 'success' },
                { codigo: 'MI-201', nombre: 'Mecanizado por Arranque de Viruta', docente: 'Ing. Christian Castro', estado: 'Revisión de Carrera', tipo: 'neutral' }
            ]
        },
        {
            num: 4,
            paso: '05',
            titulo: 'Firma Legal y Publicación',
            etapa: 'Fase 4',
            rol: 'Vicerrectorado Académico',
            rolEquivalente: 'VICERRECTOR' as RolSimulado,
            actor: 'Msc. Freddy Baño',
            meta: 'Sello Digital SHA-256 y QR',
            baseLegal: 'Ley de Comercio Electrónico y Firmas Digitales del Ecuador — Acreditación CACES',
            entradas: 'PEAs con doble aval normativo (Carrera + Académico) en cola de despacho',
            descripcion: 'Máxima autoridad curricular. Firma electrónica masiva o individual con certificado digital DFRM/P12, sellado de hash inmutable SHA-256 y publicación automática en catálogo público QR.',
            botonesClave: ['Legalización y Firma Digital Masiva', 'Firmar PEA Individual', 'Descargar Dossier (PDF)', 'QR CACES'],
            entregable: 'PEA oficializado en firme, jurídicamente inmutable y disponible en portal institucional.',
            icon: Award,
            previewRows: [
                { codigo: 'DS-501', nombre: 'Desarrollo Web Fullstack y Cloud', docente: 'Ing. Edison Pérez', estado: 'Listo para Firma Legal', tipo: 'brand' },
                { codigo: 'DS-502', nombre: 'Ciberseguridad y Auditoría de Sistemas', docente: 'Ing. Wilfrido Trujillo', estado: 'Legalizado en Firme', tipo: 'success' },
                { codigo: 'ED-301', nombre: 'Fisiología y Biomecánica del Deporte', docente: 'Lcdo. Wilmer Toapanta', estado: 'En Proceso de Avales', tipo: 'warning' }
            ]
        }
    ];

    const currentFase = FASES[selectedFase];

    return (
        <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs space-y-6">
            
            {/* Encabezado Editorial Formal con Identidad de Marca */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[#0070f3] dark:text-blue-400">
                            <Layers size={14} />
                            <span>Gobernanza Curricular Oficial</span>
                        </div>
                        <span className="text-slate-300 dark:text-zinc-700">•</span>
                        <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                            Paso {selectedFase + 1} de 5
                        </span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Pipeline de Gestión y Circuito Normativo del PEA
                    </h2>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-zinc-400">Responsable:</span>
                    <strong className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {currentFase.rol}
                    </strong>
                </div>
            </div>

            {/* Layout Split: Timeline Conector (Izquierda) + Folio Documental (Derecha) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ─── Timeline Conector Vertical (Stripe / Mintlify Docs Stepper) ─── */}
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
                                    onClick={() => handleSelect(idx)}
                                    className={`w-full text-left p-2.5 rounded-lg transition-all flex items-start gap-3 cursor-pointer group ${
                                        isSelected
                                            ? 'bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/60 shadow-xs'
                                            : 'hover:bg-slate-50 dark:hover:bg-zinc-850/60 border border-transparent'
                                    }`}
                                >
                                    {/* Indicador Numérico / Icono con Estado de Conexión */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-bold transition-all ${
                                        isSelected
                                            ? 'bg-[#0070f3] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs'
                                            : isPast
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-white dark:bg-zinc-900 border-2 border-slate-300 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 group-hover:border-slate-400'
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

                {/* ─── Folio Unificado de Especificación Técnica (Derecha) ─── */}
                <div className="lg:col-span-8 p-6 rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-2xs space-y-6">
                    
                    {/* Cabecera del Folio */}
                    <div className="pb-4 border-b border-slate-100 dark:border-zinc-800">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                            Especificación Técnica • {currentFase.etapa}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                            {currentFase.titulo}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            Autoridad Responsable: <strong className="text-slate-800 dark:text-slate-200">{currentFase.actor}</strong> ({currentFase.rol})
                        </p>
                    </div>

                    {/* Descripción Concisa */}
                    <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {currentFase.descripcion}
                    </p>

                    {/* Especificación de Parámetros (Estilo Mintlify / Stripe Docs) */}
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
                                {currentFase.entradas}
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

                    {/* Pie de Acción: Botón Directo para Simular Pantalla */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs text-slate-500 dark:text-zinc-400">
                            Paso {selectedFase + 1} de 5 en el circuito oficial
                        </span>

                        {onSimularRol && (
                            <button
                                onClick={() => onSimularRol(currentFase.rolEquivalente)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer shrink-0"
                            >
                                <span>Simular pantalla de {currentFase.rol}</span>
                                <ArrowRight size={13} className="stroke-[2.5]" />
                            </button>
                        )}
                    </div>

                </div>

            </div>

        </div>
    );
};

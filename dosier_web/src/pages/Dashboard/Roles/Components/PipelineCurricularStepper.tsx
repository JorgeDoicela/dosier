import React, { useState } from 'react';
import {
    Calendar,
    PenTool,
    CheckCircle2,
    ShieldCheck,
    Award,
    ChevronRight,
    ArrowRight,
    Clock,
    Users,
    FileCheck2,
    AlertCircle,
    Info
} from 'lucide-react';

interface Props {
    faseActiva?: number;
    onSelectFase?: (faseIndex: number) => void;
}

export const PipelineCurricularStepper: React.FC<Props> = ({ faseActiva = 0, onSelectFase }) => {
    const [selectedFase, setSelectedFase] = useState<number>(faseActiva);

    const handleSelect = (idx: number) => {
        setSelectedFase(idx);
        onSelectFase?.(idx);
    };

    const FASES = [
        {
            num: 0,
            titulo: 'Fase 0: Apertura',
            subtitulo: 'Apertura y Convocatoria',
            rol: 'Coordinación Académica',
            actor: 'Msc. Cristian Cobos',
            color: 'blue',
            accionPrincipal: 'Activar Convocatoria y Notificar',
            descripcion: 'Coordinación Académica sincroniza el distributivo SIGAFI, fija el calendario con fechas límites y dispara la notificación masiva a todos los docentes.',
            botonesClave: [
                'Aperturar Convocatoria 2025-A',
                'Recordatorio Masivo a Rezagados',
                'Conceder Prórroga de Plazo'
            ],
            resultado: 'Materias y tableros habilitados para los docentes en SIGAFI.'
        },
        {
            num: 1,
            titulo: 'Fase 1: Formulación',
            subtitulo: 'Co-redacción y Validación',
            rol: 'Docente de Cátedra',
            actor: 'Ing. Edison Pérez',
            color: 'amber',
            accionPrincipal: 'Elaborar y Enviar a Revisión',
            descripcion: 'Los docentes pueden clonar el PEA del período anterior, co-redactar concurrentemente las 11 secciones con Yjs y verificar que las horas cuadren 100% con el Art. 21 CES.',
            botonesClave: [
                'Clonar PEA de Período Anterior',
                'Abrir Co-Redacción (Workspace)',
                'Validador de Horas CES (160h)',
                'Enviar a Revisión de Carrera'
            ],
            resultado: 'Instrumento PEA con semáforo verde enviado a Coordinación.'
        },
        {
            num: 2,
            titulo: 'Fase 2: Aval de Carrera',
            subtitulo: 'Revisión Disciplinar',
            rol: 'Coordinador de Carrera',
            actor: 'Ing. Wilfrido Trujillo (Software)',
            color: 'purple',
            accionPrincipal: 'Emitir Aval de Carrera',
            descripcion: 'El Coordinador supervisa los PEAs de su carrera, verifica pertinencia de contenidos, unidades y bibliografía. Puede devolver con observaciones o emitir el Aval de Carrera.',
            botonesClave: [
                'Revisar Contenidos y Horas',
                'Solicitar Correcciones (48h)',
                'Emitir Aval de Carrera'
            ],
            resultado: 'PEA avalado técnicamente y elevado a Coordinación Académica.'
        },
        {
            num: 3,
            titulo: 'Fase 3: Aval Académico',
            subtitulo: 'Auditoría CACES',
            rol: 'Coordinación Académica',
            actor: 'Msc. Cristian Cobos',
            color: 'emerald',
            accionPrincipal: 'Emitir Aval Institucional',
            descripcion: 'Control de calidad institucional: auditoría automática del régimen académico CES, matriz de 30 pts y bibliografía APA. Emite el segundo aval para elevar a Vicerrectorado.',
            botonesClave: [
                'Auditoría Normativa CACES',
                'Emitir Aval Académico Institucional',
                'Recordatorio a Docentes con Observaciones'
            ],
            resultado: 'Instrumento con doble aval listo para firma legal definitiva.'
        },
        {
            num: 4,
            titulo: 'Fase 4: Legalización',
            subtitulo: 'Firma Legal y Publicación',
            rol: 'Vicerrectorado Académico',
            actor: 'Msc. Freddy Baño',
            color: 'rose',
            accionPrincipal: 'Firma Digital y Publicación QR',
            descripcion: 'Máxima autoridad curricular. Firma individual o en bloque todos los PEAs avalados, sella el hash inmutable SHA-256 y activa el código QR público para acreditación.',
            botonesClave: [
                'Legalización y Firma Digital Masiva',
                'Firmar y Legalizar PEA Individual',
                'Generar Dossier Curricular (PDF)',
                'Publicar Catálogo en Portal QR'
            ],
            resultado: 'PEA legalizado en firme, inmutable y disponible en portal público.'
        }
    ];

    const currentFase = FASES[selectedFase];

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        Circuito Curricular Institucional Oficial
                    </span>
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white mt-0.5">
                        Pipeline de Gestión y Gobernanza del PEA (5 Fases)
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                        Paso {selectedFase + 1} de 5
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {currentFase.rol}
                    </span>
                </div>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {FASES.map((fase, idx) => {
                    const isSelected = selectedFase === idx;
                    return (
                        <button
                            key={idx}
                            onClick={() => handleSelect(idx)}
                            className={`p-3 rounded-lg border text-left transition-all ${
                                isSelected
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-md scale-[1.02]'
                                    : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                    isSelected
                                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black font-semibold'
                                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                }`}>
                                    Fase {fase.num}
                                </span>
                                {idx < 4 && (
                                    <ChevronRight className={`w-3.5 h-3.5 opacity-40 ${isSelected ? 'opacity-90' : ''}`} />
                                )}
                            </div>
                            <p className="text-xs font-semibold truncate">
                                {fase.subtitulo}
                            </p>
                            <p className={`text-[11px] truncate mt-0.5 ${
                                isSelected ? 'text-zinc-300 dark:text-zinc-700' : 'text-zinc-500'
                            }`}>
                                {fase.rol}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Detalle interactivo de la fase seleccionada */}
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500">
                            Responsable Oficial: <strong className="text-zinc-900 dark:text-white">{currentFase.actor}</strong> ({currentFase.rol})
                        </span>
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mt-0.5">
                            {currentFase.titulo} — {currentFase.subtitulo}
                        </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Meta: {currentFase.accionPrincipal}
                    </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {currentFase.descripcion}
                </p>

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                            Herramientas y Botones que tiene este rol en su pantalla:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {currentFase.botonesClave.map((btn, bIdx) => (
                                <span
                                    key={bIdx}
                                    className="px-2 py-0.5 rounded text-[11px] font-medium bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 shadow-2xs"
                                >
                                    {btn}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block mb-1">
                            Resultado Entregable hacia la siguiente fase:
                        </span>
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            {currentFase.resultado}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

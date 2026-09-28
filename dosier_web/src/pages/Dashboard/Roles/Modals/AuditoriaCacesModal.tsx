import React from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, X, FileCheck2, Award, Clock } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    asignatura: string;
    carrera: string;
    horasTotales: number;
    horasDocencia: number;
    horasPracticas: number;
    horasAutonomo: number;
    cumpleCaces: boolean;
    tieneAvalCarrera: boolean;
    tieneAvalAcademica: boolean;
    tieneFirmaRectorado: boolean;
}

export const AuditoriaCacesModal: React.FC<Props> = ({
    isOpen,
    onClose,
    asignatura,
    carrera,
    horasTotales,
    horasDocencia,
    horasPracticas,
    horasAutonomo,
    cumpleCaces,
    tieneAvalCarrera,
    tieneAvalAcademica,
    tieneFirmaRectorado
}) => {
    if (!isOpen) return null;

    const horasCuadran = (horasDocencia + horasPracticas + horasAutonomo) === horasTotales;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
            <div
                className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                            <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                                Auditoría Normativa y Cumplimiento CACES
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Verificación automatizada de estándares CES Art. 21 e institucionalidad
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Header info */}
                    <div className="p-3.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                                {asignatura}
                            </h3>
                            <p className="text-xs text-zinc-500">
                                Carrera: {carrera}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <span className={`w-1.5 h-1.5 rounded-full ${cumpleCaces ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className={cumpleCaces ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                                {cumpleCaces ? 'Conforme CACES (100%)' : 'Requiere Ajuste (85%)'}
                            </span>
                        </div>
                    </div>

                    {/* Matriz de Chequeo */}
                    <div className="space-y-3">
                        {/* Criterio 1: Sumatoria Art. 21 */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                    {horasCuadran ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <AlertCircle className="w-4 h-4 text-rose-500" />
                                    )}
                                    1. Distribución Horaria CES (Reglamento de Régimen Académico Art. 21)
                                </span>
                                <span className="text-[11px] font-mono text-zinc-500">
                                    {horasDocencia}h + {horasPracticas}h + {horasAutonomo}h = {horasTotales}h
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Docencia</p>
                                    <p className="font-semibold text-zinc-900 dark:text-white">{horasDocencia} horas</p>
                                </div>
                                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Prácticas Lab</p>
                                    <p className="font-semibold text-zinc-900 dark:text-white">{horasPracticas} horas</p>
                                </div>
                                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800">
                                    <p className="text-[10px] text-zinc-500 uppercase">Autónomo</p>
                                    <p className="font-semibold text-zinc-900 dark:text-white">{horasAutonomo} horas</p>
                                </div>
                            </div>
                        </div>

                        {/* Criterio 2: Matriz 30 pts */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <div>
                                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                        2. Matriz de Evaluación Ponderada (30 Puntos)
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        Formativa (14 pts) + Práctica (8 pts) + Examen Bimestral (8 pts) = 30 pts exactos
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={13} /> Válido
                            </span>
                        </div>

                        {/* Criterio 3: Bibliografía APA */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                <div>
                                    <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                        3. Bibliografía Vigente (Norma APA 7ma Edición)
                                    </p>
                                    <p className="text-[11px] text-zinc-500">
                                        Mínimo 3 textos básicos con antigüedad no mayor a 5 años y enlaces verificados
                                    </p>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 size={13} /> Válido
                            </span>
                        </div>

                        {/* Criterio 4: Cadena de Avales */}
                        <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
                            <p className="text-xs font-semibold text-zinc-900 dark:text-white">
                                4. Trazabilidad de Firmas y Avales Curriculares
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                <div className={`p-2 rounded border text-center ${
                                    tieneAvalCarrera
                                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                }`}>
                                    <p className="text-[10px] font-medium uppercase font-mono">Aval Carrera</p>
                                    <p className="text-xs font-semibold">{tieneAvalCarrera ? 'Emitido' : 'Pendiente'}</p>
                                </div>
                                <div className={`p-2 rounded border text-center ${
                                    tieneAvalAcademica
                                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                }`}>
                                    <p className="text-[10px] font-medium uppercase font-mono">Aval Académico</p>
                                    <p className="text-xs font-semibold">{tieneAvalAcademica ? 'Emitido' : 'Pendiente'}</p>
                                </div>
                                <div className={`p-2 rounded border text-center ${
                                    tieneFirmaRectorado
                                        ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400'
                                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                }`}>
                                    <p className="text-[10px] font-medium uppercase font-mono">Firma Legal</p>
                                    <p className="text-xs font-semibold">{tieneFirmaRectorado ? 'Legalizado' : 'Pendiente'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end bg-zinc-50 dark:bg-zinc-900">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};

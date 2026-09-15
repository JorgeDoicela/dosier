import React, { useState } from 'react';
import {
    UserCheck,
    Copy,
    PenTool,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ShieldCheck,
    Send,
    BookOpen,
    Layers,
    Sparkles,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useNotifications } from '../../../api/NotificationsContext';
import { MOCK_PEAS, type MockPeaItem } from './data/mockCurricularData';
import { ClonarPeaModal } from './Modals/ClonarPeaModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';

export const DocentePeaDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const [misPeas, setMisPeas] = useState<MockPeaItem[]>(
        MOCK_PEAS.filter(p => p.docente_responsable === 'Ing. Edison Pérez')
    );

    // Modales
    const [clonarModalMateria, setClonarModalMateria] = useState<MockPeaItem | null>(null);
    const [auditoriaPea, setAuditoriaPea] = useState<MockPeaItem | null>(null);

    const handleEnviarRevision = (id: string, nombre: string) => {
        setMisPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    estado_workflow: 'En_Revision_Carrera'
                };
            }
            return p;
        }));
        addToast(
            'PEA Enviado a Revisión de Carrera',
            `El instrumento curricular de "${nombre}" fue enviado al despacho del Coordinador de Carrera. Se congeló la edición concurrente temporalmente.`,
            'success'
        );
    };

    const handleClonadoExitoso = (id: string) => {
        setMisPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    cumple_caces: true
                };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Header del Docente */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Mis Asignaturas Asignadas y Elaboración de PEA
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    Ing. Edison Pérez (Docente Titular)
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Período 2025-A • Formulación colaborativa de las 11 secciones normativas e importación de cátedras previas
                            </p>
                        </div>
                    </div>

                    {/* Botones de acción clave */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => {
                                const borrador = misPeas.find(p => p.estado_workflow === 'Borrador') || misPeas[0];
                                setClonarModalMateria(borrador);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            Clonar PEA Anterior
                        </button>
                        <button
                            onClick={() => {
                                if (misPeas[0]) setAuditoriaPea(misPeas[0]);
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                        >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Validador de Horas CES
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs Docente */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Materias Asignadas</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{misPeas.length}</p>
                    <span className="text-[10px] text-zinc-400">Distributivo SIGAFI</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">En Formulación (Borrador)</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {misPeas.filter(p => p.estado_workflow === 'Borrador').length}
                    </p>
                    <span className="text-[10px] text-amber-600/70">Pendiente de envío</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">En Revisión de Carrera</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {misPeas.filter(p => p.estado_workflow === 'En_Revision_Carrera').length}
                    </p>
                    <span className="text-[10px] text-purple-600/70">En despacho de Coord.</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Días Restantes Entrega</p>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">4 Días</p>
                    <span className="text-[10px] text-rose-600/70">Vence: 15 de Abril</span>
                </div>
            </div>

            {/* Listado de Asignaturas Asignadas */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-zinc-500" />
                        Instrumentos Curriculares a Elaborar (Período 2025-A)
                    </h2>
                    <span className="text-xs text-zinc-500">
                        {misPeas.length} materias activas en su carga horaria
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {misPeas.map(pea => (
                        <div
                            key={pea.id}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="font-mono text-[10px] font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                        {pea.codigo_asignatura}
                                    </span>
                                    {pea.estado_workflow === 'Borrador' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            Borrador (En Edición)
                                        </span>
                                    )}
                                    {pea.estado_workflow === 'En_Revision_Carrera' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            En Revisión Carrera
                                        </span>
                                    )}
                                    {pea.estado_workflow === 'Avalado_Academica' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            Aval Académico Listo
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white leading-snug">
                                    {pea.nombre_asignatura}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {pea.carrera} • {pea.semestre}
                                </p>

                                {/* Distribución horaria */}
                                <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Total Horas Período:</span>
                                        <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                                            {pea.horas_totales}h
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                        <span>Docencia: {pea.horas_docencia}h</span>
                                        <span>Prácticas: {pea.horas_practicas}h</span>
                                        <span>Autónomo: {pea.horas_autonomo}h</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Horas cuadran al 100% con Art. 21 CES
                                    </div>
                                </div>

                                {pea.observacion_pendiente && (
                                    <div className="mt-3 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300">
                                        <p className="font-semibold flex items-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            Observación del Coordinador:
                                        </p>
                                        <p className="mt-0.5 text-[11px]">{pea.observacion_pendiente}</p>
                                    </div>
                                )}
                            </div>

                            {/* Acciones de la Tarjeta */}
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            addToast(
                                                'Entrando al Editor Colaborativo',
                                                `Cargando las 11 secciones del PEA "${pea.nombre_asignatura}" con soporte Yjs y cursores concurrentes.`,
                                                'info'
                                            );
                                        }}
                                        className="flex-1 py-2 px-3 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <PenTool className="w-3.5 h-3.5" />
                                        Editar PEA (11 Secc.)
                                    </button>
                                    <button
                                        onClick={() => setClonarModalMateria(pea)}
                                        className="p-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                        title="Clonar de semestre anterior"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {pea.estado_workflow === 'Borrador' && (
                                    <button
                                        onClick={() => handleEnviarRevision(pea.id, pea.nombre_asignatura)}
                                        className="w-full py-1.5 px-3 text-[11px] font-medium rounded-lg border border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <Send className="w-3 h-3" />
                                        Enviar a Revisión de Carrera
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modales */}
            {clonarModalMateria && (
                <ClonarPeaModal
                    isOpen={!!clonarModalMateria}
                    onClose={() => setClonarModalMateria(null)}
                    asignaturaDestino={clonarModalMateria.nombre_asignatura}
                    onClonadoExitoso={() => handleClonadoExitoso(clonarModalMateria.id)}
                />
            )}

            {auditoriaPea && (
                <AuditoriaCacesModal
                    isOpen={!!auditoriaPea}
                    onClose={() => setAuditoriaPea(null)}
                    asignatura={auditoriaPea.nombre_asignatura}
                    carrera={auditoriaPea.carrera}
                    horasTotales={auditoriaPea.horas_totales}
                    horasDocencia={auditoriaPea.horas_docencia}
                    horasPracticas={auditoriaPea.horas_practicas}
                    horasAutonomo={auditoriaPea.horas_autonomo}
                    cumpleCaces={auditoriaPea.cumple_caces}
                    tieneAvalCarrera={auditoriaPea.tiene_aval_carrera}
                    tieneAvalAcademica={auditoriaPea.tiene_aval_academica}
                    tieneFirmaRectorado={auditoriaPea.tiene_firma_rectorado}
                />
            )}
        </div>
    );
};

import React, { useState } from 'react';
import { useNotifications } from '../../../api/NotificationsContext';
import { MOCK_PEAS, type MockPeaItem } from './data/mockCurricularData';
import { ObservacionesDisciplinarModal } from './Modals/ObservacionesDisciplinarModal';
import { RecordatorioDocentesModal } from './Modals/RecordatorioDocentesModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';

export const CoordCarreraDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const [carreraActiva, setCarreraActiva] = useState('Desarrollo de Software');
    const [peas, setPeas] = useState<MockPeaItem[]>(MOCK_PEAS);
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState('todos');

    // Modales
    const [observacionPea, setObservacionPea] = useState<MockPeaItem | null>(null);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<MockPeaItem | null>(null);

    const peasCarrera = peas.filter(p => {
        const matchesCarrera = p.carrera === carreraActiva;
        const matchesEstado = filterEstado === 'todos' || p.estado_workflow === filterEstado;
        const matchesSearch = search === '' ||
            p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
            p.docente_responsable.toLowerCase().includes(search.toLowerCase());
        return matchesCarrera && matchesEstado && matchesSearch;
    });

    const handleEmitirAvalCarrera = (id: string, nombre: string) => {
        setPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    estado_workflow: 'Avalado_Carrera',
                    tiene_aval_carrera: true
                };
            }
            return p;
        }));
        addToast(
            'Aval de Carrera Emitido',
            `Se aprobó la pertinencia técnica y disciplinar de "${nombre}". Elevado a Coordinación Académica para auditoría CACES.`,
            'success'
        );
    };

    const handleObservacionGuardada = (id: string, obs: string, seccion: string) => {
        setPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    estado_workflow: 'Con_Observaciones',
                    observacion_pendiente: obs,
                    seccion_observada: seccion,
                    dias_restantes: 2
                };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Supervisión Curricular • Coordinación de Carrera
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Coordinación de Carrera
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            Ing. Wilfrido Trujillo
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Supervisión disciplinar de contenidos, revisión de unidades temáticas y emisión del Aval de Carrera.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={carreraActiva}
                        onChange={e => setCarreraActiva(e.target.value)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                    >
                        <option value="Desarrollo de Software">Desarrollo de Software</option>
                        <option value="Mecánica Industrial">Mecánica Industrial</option>
                        <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                    </select>

                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Notificar Docentes
                    </button>
                </div>
            </div>

            {/* Bandeja de Supervisión Disciplinar */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Bandeja de Asignaturas: {carreraActiva}
                    </h2>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar materia o docente..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-52"
                        />

                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="En_Revision_Carrera">En Revisión de Carrera</option>
                            <option value="Con_Observaciones">Con Observaciones</option>
                            <option value="Avalado_Carrera">Avalado por Carrera</option>
                            <option value="Legalizado">Legalizado</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de la Carrera */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-2.5 px-4">Asignatura y Ciclo</th>
                                <th className="py-2.5 px-3">Docente Elaborador</th>
                                <th className="py-2.5 px-3">Distribución Horaria</th>
                                <th className="py-2.5 px-3">Estado Técnico</th>
                                <th className="py-2.5 px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {peasCarrera.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-2.5 px-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                    {p.codigo_asignatura}
                                                </span>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {p.nombre_asignatura}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-zinc-500">
                                                {p.semestre}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {p.docente_responsable}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                        {p.horas_totales}h ({p.horas_docencia}D / {p.horas_practicas}P / {p.horas_autonomo}A)
                                    </td>
                                    <td className="py-2.5 px-3">
                                        {p.estado_workflow === 'Borrador' && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>Docente Elaborando</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'En_Revision_Carrera' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                <span>Listo para Revisión</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Con_Observaciones' && (
                                            <div>
                                                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    <span>Con Observaciones</span>
                                                </div>
                                                {p.seccion_observada && (
                                                    <p className="text-[10.5px] text-zinc-500 mt-0.5 truncate max-w-xs font-mono">
                                                        {p.seccion_observada}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Avalado_Carrera' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                <span>Aval de Carrera Emitido</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Avalado_Academica' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Aval Académico Concedido</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Legalizado' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Legalizado</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                            >
                                                Revisar
                                            </button>

                                            {p.estado_workflow === 'En_Revision_Carrera' && (
                                                <>
                                                    <button
                                                        onClick={() => setObservacionPea(p)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                                                    >
                                                        Observar
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmitirAvalCarrera(p.id, p.nombre_asignatura)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                                    >
                                                        Emitir Aval
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modales */}
            {observacionPea && (
                <ObservacionesDisciplinarModal
                    isOpen={!!observacionPea}
                    onClose={() => setObservacionPea(null)}
                    asignatura={observacionPea.nombre_asignatura}
                    docente={observacionPea.docente_responsable}
                    onObservacionGuardada={(obs, seccion) => {
                        handleObservacionGuardada(observacionPea.id, obs, seccion);
                    }}
                />
            )}

            <RecordatorioDocentesModal
                isOpen={isRecordatorioOpen}
                onClose={() => setIsRecordatorioOpen(false)}
                tituloContexto={`Recordatorio a Docentes de ${carreraActiva}`}
            />

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

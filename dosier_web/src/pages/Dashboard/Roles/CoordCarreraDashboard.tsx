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
        <div className="space-y-5">
            {/* Encabezado Vercel Geist */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Coordinación de Carrera
                        </h1>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            Ing. Wilfrido Trujillo
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Supervisión disciplinar de contenidos, revisión de unidades temáticas y emisión del Aval de Carrera
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        value={carreraActiva}
                        onChange={e => setCarreraActiva(e.target.value)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none"
                    >
                        <option value="Desarrollo de Software">Desarrollo de Software</option>
                        <option value="Mecánica Industrial">Mecánica Industrial</option>
                        <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                    </select>

                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                    >
                        Notificar Docentes
                    </button>
                </div>
            </div>

            {/* Bandeja de Supervisión Disciplinar */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/30">
                    <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Bandeja de Asignaturas: {carreraActiva}
                    </h2>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar materia o docente..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-500 w-52"
                        />

                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-md text-zinc-900 dark:text-white focus:outline-none"
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
                        <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
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
                                <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors">
                                    <td className="py-2.5 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                {p.codigo_asignatura}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {p.nombre_asignatura}
                                                </p>
                                                <p className="text-[11px] text-zinc-500">
                                                    {p.semestre}
                                                </p>
                                            </div>
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
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                                Docente Elaborando
                                            </span>
                                        )}
                                        {p.estado_workflow === 'En_Revision_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium">
                                                Listo para Revisión
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Con_Observaciones' && (
                                            <div>
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium">
                                                    Con Observaciones
                                                </span>
                                                {p.seccion_observada && (
                                                    <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-xs font-mono">
                                                        {p.seccion_observada}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Avalado_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium">
                                                Aval de Carrera Emitido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Avalado_Academica' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-medium">
                                                Aval Académico Concedido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Legalizado' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                                                Legalizado
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                                            >
                                                Revisar
                                            </button>

                                            {p.estado_workflow === 'En_Revision_Carrera' && (
                                                <>
                                                    <button
                                                        onClick={() => setObservacionPea(p)}
                                                        className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
                                                    >
                                                        Observar
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmitirAvalCarrera(p.id, p.nombre_asignatura)}
                                                        className="px-2.5 py-1 text-xs font-medium rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
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

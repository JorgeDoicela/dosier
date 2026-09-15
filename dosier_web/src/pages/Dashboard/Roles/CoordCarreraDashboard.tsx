import React, { useState } from 'react';
import {
    Shield,
    Users,
    FileText,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Search,
    Send,
    Eye,
    MessageSquare,
    BookOpen,
    ArrowRight
} from 'lucide-react';
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
            {/* Header del Rol */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Coordinación de Carrera: {carreraActiva}
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                    Ing. Wilfrido Trujillo
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Supervisión disciplinar de contenidos, revisión de unidades temáticas y emisión del Aval de Carrera
                            </p>
                        </div>
                    </div>

                    {/* Botones de acción clave */}
                    <div className="flex flex-wrap items-center gap-2">
                        <select
                            value={carreraActiva}
                            onChange={e => setCarreraActiva(e.target.value)}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                        >
                            <option value="Desarrollo de Software">Desarrollo de Software</option>
                            <option value="Mecánica Industrial">Mecánica Industrial</option>
                            <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                        </select>

                        <button
                            onClick={() => setIsRecordatorioOpen(true)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Send className="w-3.5 h-3.5" />
                            Notificar Docentes de Carrera
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs de la Carrera */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Materias de la Carrera</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{peasCarrera.length}</p>
                    <span className="text-[10px] text-zinc-400">Malla Vigente</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">En Formulación (Docente)</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                        {peasCarrera.filter(p => p.estado_workflow === 'Borrador').length}
                    </p>
                    <span className="text-[10px] text-amber-600/70">Redacción activa</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-purple-500/30 bg-purple-500/5 shadow-2xs">
                    <p className="text-[11px] font-medium text-purple-700 dark:text-purple-300">Pendientes de su Revisión</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        {peasCarrera.filter(p => p.estado_workflow === 'En_Revision_Carrera').length}
                    </p>
                    <span className="text-[10px] text-purple-600/80 font-semibold">Requiere acción hoy</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Con Observaciones</p>
                    <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                        {peasCarrera.filter(p => p.estado_workflow === 'Con_Observaciones').length}
                    </p>
                    <span className="text-[10px] text-rose-600/70">Subsanación 48h</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Aval de Carrera Emitido</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {peasCarrera.filter(p => p.tiene_aval_carrera).length}
                    </p>
                    <span className="text-[10px] text-blue-600/70">Elevados a Académica</span>
                </div>
            </div>

            {/* Bandeja de Supervisión Disciplinar */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Bandeja Técnica de Asignaturas de {carreraActiva}
                        </h2>
                    </div>

                    {/* Filtros */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar materia o docente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none w-52"
                            />
                        </div>

                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
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
                        <thead className="bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-4">Asignatura y Ciclo</th>
                                <th className="py-3 px-3">Docente Elaborador</th>
                                <th className="py-3 px-3">Distribución Horaria</th>
                                <th className="py-3 px-3">Estado Técnico</th>
                                <th className="py-3 px-4 text-right">Acciones de Coordinador</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:border-zinc-800">
                            {peasCarrera.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                {p.codigo_asignatura}
                                            </span>
                                            <div>
                                                <p className="font-semibold text-zinc-900 dark:text-white">
                                                    {p.nombre_asignatura}
                                                </p>
                                                <p className="text-[11px] text-zinc-500">
                                                    {p.semestre}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {p.docente_responsable}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                        {p.horas_totales}h ({p.horas_docencia}D / {p.horas_practicas}P / {p.horas_autonomo}A)
                                    </td>
                                    <td className="py-3 px-3">
                                        {p.estado_workflow === 'Borrador' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                Docente Elaborando
                                            </span>
                                        )}
                                        {p.estado_workflow === 'En_Revision_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                Listo para su Revisión
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Con_Observaciones' && (
                                            <div>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    Con Observaciones
                                                </span>
                                                {p.seccion_observada && (
                                                    <p className="text-[10px] text-zinc-400 mt-0.5 truncate max-w-xs">
                                                        {p.seccion_observada}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Avalado_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                Aval de Carrera Emitido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Avalado_Academica' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                Aval Académico Concedido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Legalizado' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                                                Legalizado
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2 py-1 text-[11px] font-medium rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
                                                title="Revisar unidades y horas"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Revisar
                                            </button>

                                            {p.estado_workflow === 'En_Revision_Carrera' && (
                                                <>
                                                    <button
                                                        onClick={() => setObservacionPea(p)}
                                                        className="px-2 py-1 text-[11px] font-medium rounded border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 flex items-center gap-1 transition-colors"
                                                        title="Solicitar correcciones al docente"
                                                    >
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Observar
                                                    </button>
                                                    <button
                                                        onClick={() => handleEmitirAvalCarrera(p.id, p.nombre_asignatura)}
                                                        className="px-2.5 py-1 text-[11px] font-medium rounded bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1 transition-colors shadow-2xs"
                                                        title="Emitir Aval de Carrera"
                                                    >
                                                        <CheckCircle2 className="w-3 h-3" />
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

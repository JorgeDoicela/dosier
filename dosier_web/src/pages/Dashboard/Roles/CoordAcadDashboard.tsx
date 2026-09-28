import React, { useState } from 'react';
import { useNotifications } from '../../../api/NotificationsContext';
import { MOCK_PEAS, type MockPeaItem } from './data/mockCurricularData';
import { AperturaConvocatoriaModal } from './Modals/AperturaConvocatoriaModal';
import { RecordatorioDocentesModal } from './Modals/RecordatorioDocentesModal';
import { ProrrogaPlazoModal } from './Modals/ProrrogaPlazoModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';

export const CoordAcadDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const [peas, setPeas] = useState<MockPeaItem[]>(MOCK_PEAS);
    const [selectedCarrera, setSelectedCarrera] = useState<string>('todas');
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    const [search, setSearch] = useState<string>('');

    // Modales
    const [isAperturaOpen, setIsAperturaOpen] = useState(false);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);
    const [isProrrogaOpen, setIsProrrogaOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<MockPeaItem | null>(null);

    const peasFiltrados = peas.filter(p => {
        const matchesCarrera = selectedCarrera === 'todas' || p.carrera === selectedCarrera;
        const matchesEstado = selectedEstado === 'todos' || p.estado_workflow === selectedEstado;
        const matchesSearch = search === '' ||
            p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
            p.docente_responsable.toLowerCase().includes(search.toLowerCase()) ||
            p.codigo_asignatura.toLowerCase().includes(search.toLowerCase());
        return matchesCarrera && matchesEstado && matchesSearch;
    });

    const handleEmitirAvalAcademico = (id: string, nombre: string) => {
        setPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    estado_workflow: 'Avalado_Academica',
                    tiene_aval_academica: true
                };
            }
            return p;
        }));
        addToast(
            'Aval Académico Institucional Emitido',
            `Se aprobó y certificó el cumplimiento normativo CACES para "${nombre}". Despachado a Vicerrectorado para legalización en firme.`,
            'success'
        );
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Gobernanza Curricular • Coordinación Académica
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Coordinación Académica Institucional
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            Msc. Cristian Cobos
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Gobernanza curricular, apertura de convocatorias, auditoría CACES y aval normativo institucional.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsAperturaOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Aperturar Convocatoria 2025-A
                    </button>
                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Notificar Rezagados
                    </button>
                    <button
                        onClick={() => setIsProrrogaOpen(true)}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Conceder Prórroga
                    </button>
                </div>
            </div>

            {/* Matriz de Gestión de PEAs Institucionales */}
            <div className="bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900/40">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Supervisión Curricular Institucional (Período 2025-A)
                    </h2>

                    {/* Filtros */}
                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar asignatura, docente o código..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-56"
                        />

                        <select
                            value={selectedCarrera}
                            onChange={e => setSelectedCarrera(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todas">Todas las Carreras</option>
                            <option value="Desarrollo de Software">Desarrollo de Software</option>
                            <option value="Mecánica Industrial">Mecánica Industrial</option>
                            <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                        </select>

                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="En_Revision_Carrera">En Revisión de Carrera</option>
                            <option value="Con_Observaciones">Con Observaciones</option>
                            <option value="Avalado_Carrera">Avalado por Carrera</option>
                            <option value="Avalado_Academica">Avalado por Académica</option>
                            <option value="Legalizado">Legalizado</option>
                        </select>
                    </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-2.5 px-4">Asignatura y Carrera</th>
                                <th className="py-2.5 px-3">Docente Responsable</th>
                                <th className="py-2.5 px-3">Horas CES Art. 21</th>
                                <th className="py-2.5 px-3">Estado del Circuito</th>
                                <th className="py-2.5 px-3">Plazo</th>
                                <th className="py-2.5 px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {peasFiltrados.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/30 transition-colors">
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
                                                {p.carrera} • {p.semestre}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {p.docente_responsable}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px]">
                                        <span className="text-zinc-800 dark:text-zinc-200">
                                            {p.horas_totales}h ({p.horas_docencia}D / {p.horas_practicas}P / {p.horas_autonomo}A)
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        {p.estado_workflow === 'Borrador' && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>Borrador Docente</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'En_Revision_Carrera' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                <span>Revisión de Carrera</span>
                                            </div>
                                        )}
                                        {p.estado_workflow === 'Con_Observaciones' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                <span>Observaciones Pendientes</span>
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
                                                <span>Legalizado Vicerrectorado</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-3 text-zinc-500 font-mono text-[11px]">
                                        {p.dias_restantes > 0 ? `${p.dias_restantes} días` : 'Finalizado'}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                            >
                                                Auditar
                                            </button>

                                            {p.estado_workflow === 'Avalado_Carrera' && (
                                                <button
                                                    onClick={() => handleEmitirAvalAcademico(p.id, p.nombre_asignatura)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                                >
                                                    Emitir Aval
                                                </button>
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
            <AperturaConvocatoriaModal
                isOpen={isAperturaOpen}
                onClose={() => setIsAperturaOpen(false)}
                onConvocatoriaActivada={() => {}}
            />

            <RecordatorioDocentesModal
                isOpen={isRecordatorioOpen}
                onClose={() => setIsRecordatorioOpen(false)}
                tituloContexto="Recordatorio Masivo Institucional a Docentes Rezagados"
            />

            <ProrrogaPlazoModal
                isOpen={isProrrogaOpen}
                onClose={() => setIsProrrogaOpen(false)}
                onProrrogaConcedida={() => {}}
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

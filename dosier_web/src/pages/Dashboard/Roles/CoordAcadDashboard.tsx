import React, { useState } from 'react';
import {
    GraduationCap,
    Calendar,
    Bell,
    Clock,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Search,
    Filter,
    ArrowRight,
    FileCheck2,
    Eye,
    PlusCircle,
    Send
} from 'lucide-react';
import { useNotifications } from '../../../api/NotificationsContext';
import { MOCK_PEAS, MOCK_CONVOCATORIA_ACTIVA, type MockPeaItem } from './data/mockCurricularData';
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
            {/* Header del Rol */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20 shrink-0">
                            <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Panel de Coordinación Académica Institucional
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                    Msc. Cristian Cobos
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Gobernanza curricular, apertura de convocatorias, auditoría CACES y aval normativo de las 3 carreras
                            </p>
                        </div>
                    </div>

                    {/* Botones de Acción Clave del Coordinador Académico */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsAperturaOpen(true)}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <Calendar className="w-3.5 h-3.5" />
                            Aperturar Convocatoria 2025-A
                        </button>
                        <button
                            onClick={() => setIsRecordatorioOpen(true)}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 flex items-center gap-1.5 transition-colors"
                        >
                            <Bell className="w-3.5 h-3.5" />
                            Recordatorio a Rezagados
                        </button>
                        <button
                            onClick={() => setIsProrrogaOpen(true)}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                        >
                            <Clock className="w-3.5 h-3.5" />
                            Conceder Prórroga
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs Institucionales */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Materias en Período</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">42</p>
                    <span className="text-[10px] text-zinc-400">3 Carreras Técnicas</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">En Borrador (Docente)</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">18</p>
                    <span className="text-[10px] text-amber-600/70">43% del total</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Revisión de Carrera</p>
                    <p className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">12</p>
                    <span className="text-[10px] text-purple-600/70">28% en revisión</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Avalados por Carrera</p>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">8</p>
                    <span className="text-[10px] text-blue-600/70">Listos para Académica</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Legalizados Vicerrector</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">4</p>
                    <span className="text-[10px] text-emerald-600/70">Con QR Oficial</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Conformidad CACES</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">94%</p>
                    <span className="text-[10px] text-emerald-600/70">Semáforo Art. 21</span>
                </div>
            </div>

            {/* Matriz de Gestión de PEAs Institucionales */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Supervisión Curricular Institucional (Período 2025-A)
                        </h2>
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar asignatura, docente o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white w-56"
                            />
                        </div>

                        <select
                            value={selectedCarrera}
                            onChange={e => setSelectedCarrera(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todas">Todas las Carreras</option>
                            <option value="Desarrollo de Software">Desarrollo de Software</option>
                            <option value="Mecánica Industrial">Mecánica Industrial</option>
                            <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                        </select>

                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
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
                        <thead className="bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-4">Asignatura y Carrera</th>
                                <th className="py-3 px-3">Docente Responsable</th>
                                <th className="py-3 px-3">Horas CES Art. 21</th>
                                <th className="py-3 px-3">Estado del Circuito</th>
                                <th className="py-3 px-3">Plazo</th>
                                <th className="py-3 px-4 text-right">Acciones de Académica</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {peasFiltrados.map(p => (
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
                                                    {p.carrera} • {p.semestre}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {p.docente_responsable}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded ${
                                            p.cumple_caces
                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                        }`}>
                                            <CheckCircle2 className="w-3 h-3" />
                                            {p.horas_totales}h ({p.horas_docencia}D/{p.horas_practicas}P/{p.horas_autonomo}A)
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        {p.estado_workflow === 'Borrador' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                                                Borrador Docente
                                            </span>
                                        )}
                                        {p.estado_workflow === 'En_Revision_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                                Revisión de Carrera
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Con_Observaciones' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                Observaciones Pendientes
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Avalado_Carrera' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                Aval de Carrera Emitido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Avalado_Academica' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                Aval Académico Concedido
                                            </span>
                                        )}
                                        {p.estado_workflow === 'Legalizado' && (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                                                Legalizado Vicerrectorado
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-3 text-zinc-500 text-[11px]">
                                        {p.dias_restantes > 0 ? (
                                            <span className={p.dias_restantes <= 4 ? 'text-amber-600 font-semibold' : ''}>
                                                {p.dias_restantes} días
                                            </span>
                                        ) : (
                                            <span className="text-zinc-400">Finalizado</span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2 py-1 text-[11px] font-medium rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
                                                title="Verificar cumplimiento CACES Art. 21"
                                            >
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                Auditar
                                            </button>

                                            {p.estado_workflow === 'Avalado_Carrera' && (
                                                <button
                                                    onClick={() => handleEmitirAvalAcademico(p.id, p.nombre_asignatura)}
                                                    className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition-colors"
                                                    title="Emitir Aval Académico Institucional"
                                                >
                                                    <CheckCircle2 className="w-3 h-3" />
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

            {/* Modales Interactivos */}
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

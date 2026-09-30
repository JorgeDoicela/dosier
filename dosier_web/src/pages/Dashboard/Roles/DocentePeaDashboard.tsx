import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/AuthContext';
import { useNotifications } from '../../../api/NotificationsContext';
import {
    docenteAsignaturasService,
    getPeriodosAcademicos,
    getPeriodoActivo,
    type DocenteAsignaturaDto,
    type PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';
import { crearPeaDesdeAsignacion } from '../../../services/peaService';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import {
    BookOpen,
    Clock,
    FileText,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    PlusCircle,
    Building2,
    RefreshCw,
    Search,
    Loader2
} from 'lucide-react';

export const DocentePeaDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useNotifications();

    const [materias, setMaterias] = useState<DocenteAsignaturaDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [creatingPeaId, setCreatingPeaId] = useState<number | null>(null);

    const cargarDatos = useCallback(async (periodoId?: string) => {
        setLoading(true);
        try {
            let targetPeriodo = periodoId;
            if (!targetPeriodo) {
                const [periodosList, periodoActivo] = await Promise.all([
                    getPeriodosAcademicos(),
                    getPeriodoActivo()
                ]);
                setPeriodos(periodosList);
                targetPeriodo = periodoActivo?.id_periodo || periodosList[0]?.id_periodo || '';
                setSelectedPeriodo(targetPeriodo);
            }

            const data = await docenteAsignaturasService.getMisMaterias(targetPeriodo || undefined);
            setMaterias(data || []);
        } catch (err) {
            console.error('[DOSIER Docente] Error al cargar distributivo:', err);
            addToast('Error de Conexión', 'No se pudieron consultar sus asignaturas asignadas.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleRefrescar = async () => {
        setRefreshing(true);
        try {
            const data = await docenteAsignaturasService.getMisMaterias(selectedPeriodo || undefined);
            setMaterias(data || []);
            addToast('Distributivo Sincronizado', 'Asignaturas y estados del PEA actualizados.', 'info');
        } catch (err) {
            console.error('[DOSIER Docente] Error al refrescar:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handlePeriodoChange = async (val: string | number) => {
        const idStr = String(val);
        setSelectedPeriodo(idStr);
        setRefreshing(true);
        try {
            const data = await docenteAsignaturasService.getMisMaterias(idStr);
            setMaterias(data || []);
        } catch (err) {
            console.error('[DOSIER Docente] Error al cambiar período:', err);
        } finally {
            setRefreshing(false);
        }
    };

    const handleCrearPea = async (asignacion: DocenteAsignaturaDto) => {
        setCreatingPeaId(asignacion.id_asignacion);
        try {
            const nuevoPea = await crearPeaDesdeAsignacion(asignacion.id_asignacion);
            addToast(
                'PEA Inicializado',
                `Se ha creado el Programa de Estudio de la Asignatura para "${asignacion.nombre_asignatura}".`,
                'success'
            );
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
            const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as { id_pea?: number | string }).id_pea);
            navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al inicializar PEA:', err);
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast('Error al Iniciar PEA', msg || 'No se pudo inicializar el PEA.', 'error');
        } finally {
            setCreatingPeaId(null);
        }
    };

    const handleContinuarPea = (asignacion: DocenteAsignaturaDto) => {
        const targetUuid = asignacion.uuid_pea || String(asignacion.id_pea);
        navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
    };

    // Métricas reales
    const totalMaterias = materias.length;
    const materiasBorrador = useMemo(() => materias.filter(m => m.estado_pea === 'Borrador' || m.estado_pea === 'Corregido').length, [materias]);
    const materiasRevision = useMemo(() => materias.filter(m => m.estado_pea === 'EnRevision' || m.estado_pea === 'RevisadoCoord' || m.estado_pea === 'RevisadoAcad').length, [materias]);
    const materiasAprobadas = useMemo(() => materias.filter(m => m.estado_pea === 'Aprobado').length, [materias]);
    const materiasObservadas = useMemo(() => materias.filter(m => m.estado_pea === 'Observado'), [materias]);

    // Filtrado de materias
    const materiasFiltradas = useMemo(() => {
        return materias.filter(m => {
            const q = search.trim().toLowerCase();
            const matchesSearch = !q ||
                m.nombre_asignatura.toLowerCase().includes(q) ||
                (m.codigo_asignatura && m.codigo_asignatura.toLowerCase().includes(q)) ||
                (m.nombre_carrera && m.nombre_carrera.toLowerCase().includes(q));

            const matchesEstado =
                filterEstado === 'todos' ? true :
                filterEstado === 'pendientes' ? ['NoIniciado', 'Borrador', 'Corregido'].includes(m.estado_pea) :
                filterEstado === 'revision' ? ['EnRevision', 'RevisadoCoord', 'RevisadoAcad'].includes(m.estado_pea) :
                filterEstado === 'observados' ? m.estado_pea === 'Observado' :
                filterEstado === 'aprobados' ? m.estado_pea === 'Aprobado' : true;

            return matchesSearch && matchesEstado;
        });
    }, [materias, search, filterEstado]);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-zinc-800">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Mis Asignaturas
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate('/documentacion/mis-proyectos')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                        <span>Vista Folio de Proyectos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Alerta de Observaciones Pendientes de Subsanación */}
            {materiasObservadas.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <span className="font-semibold text-sm block">
                            Atención Requerida: Tiene {materiasObservadas.length} PEA{materiasObservadas.length > 1 ? 's' : ''} con observaciones
                        </span>
                        <p className="text-amber-700 dark:text-amber-300">
                            La Comisión Curricular o Coordinación ha registrado observaciones en: {materiasObservadas.map(m => m.nombre_asignatura).join(', ')}. Ingrese al PEA para subsanar los puntos señalados.
                        </p>
                    </div>
                </div>
            )}

            {/* Fichas Clave-Valor de Métricas Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            Total Cátedras Asignadas
                        </span>
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            {totalMaterias}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-[#0070f3] dark:text-blue-400">
                        <BookOpen className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            En Elaboración (Borrador)
                        </span>
                        <span className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 font-mono">
                            {materiasBorrador}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                        <FileText className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            En Revisión Colegiada
                        </span>
                        <span className="text-2xl font-bold text-[#0070f3] dark:text-blue-400 font-mono">
                            {materiasRevision}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-[#0070f3] dark:text-blue-400">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            PEAs Aprobados
                        </span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {materiasAprobadas}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Listado y Filtros */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                            Cátedras Asignadas en Distributivo Institucional
                        </h2>
                        {refreshing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400" />}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Selector de Período Oficial */}
                        <div className="w-48">
                            <GeistSelect
                                value={selectedPeriodo}
                                onChange={handlePeriodoChange}
                                options={periodos.map(p => ({
                                    value: p.id_periodo,
                                    label: p.periodo
                                }))}
                                placeholder="Período..."
                            />
                        </div>

                        {/* Buscador */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar asignatura o carrera..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-48"
                            />
                        </div>

                        {/* Filtro de Estado */}
                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="pendientes">Pendientes / Borrador</option>
                            <option value="revision">En Revisión</option>
                            <option value="observados">Con Observaciones</option>
                            <option value="aprobados">Aprobados</option>
                        </select>

                        <button
                            onClick={handleRefrescar}
                            disabled={refreshing}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            title="Recargar distributivo"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Tabla de Asignaturas */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                            <p className="text-xs">Consultando asignaciones académicas...</p>
                        </div>
                    ) : materiasFiltradas.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-xs">
                            No se encontraron asignaturas asignadas en el período seleccionado.
                        </div>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-4">Asignatura y Carrera</th>
                                    <th className="py-2.5 px-3">Carga Horaria</th>
                                    <th className="py-2.5 px-3">Nivel y Modalidad</th>
                                    <th className="py-2.5 px-3">Estado del PEA</th>
                                    <th className="py-2.5 px-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                                {materiasFiltradas.map(m => {
                                    const tienePea = Boolean(m.id_pea && m.id_pea > 0);
                                    const isCreating = creatingPeaId === m.id_asignacion;

                                    const handleRowClick = () => {
                                        if (isCreating) return;
                                        if (tienePea) {
                                            handleContinuarPea(m);
                                        } else {
                                            handleCrearPea(m);
                                        }
                                    };

                                    return (
                                        <tr
                                            key={m.id_asignacion}
                                            onClick={handleRowClick}
                                            className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {m.codigo_asignatura && (
                                                            <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                                {m.codigo_asignatura}
                                                            </span>
                                                        )}
                                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                                                            {m.nombre_asignatura}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                                        <Building2 className="w-3 h-3 shrink-0" />
                                                        <span>{m.nombre_carrera}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-3 font-mono">
                                                <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                    {m.horas_totales}h Total
                                                </div>
                                                <div className="text-[10px] text-zinc-500">
                                                    {m.horas_docencia}D / {m.horas_practico_experimental}P / {m.horas_autonomo}A
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                <div className="text-zinc-700 dark:text-zinc-300">
                                                    {m.nombre_nivel} • Paralelo {m.paralelo}
                                                </div>
                                                <div className="text-[11px] text-zinc-500">
                                                    {m.nombre_modalidad || 'Presencial'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-3">
                                                {m.estado_pea === 'Aprobado' ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <span>Aprobado Institucional</span>
                                                    </div>
                                                ) : m.estado_pea === 'Observado' ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                        <span>Con Observaciones</span>
                                                    </div>
                                                ) : m.estado_pea === 'EnRevision' || m.estado_pea === 'RevisadoCoord' || m.estado_pea === 'RevisadoAcad' ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#0070f3] dark:text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                                        <span>En Revisión</span>
                                                    </div>
                                                ) : m.estado_pea === 'Borrador' || m.estado_pea === 'Corregido' ? (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        <span>En Borrador</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                                                        <span>No Iniciado</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {tienePea ? (
                                                        <button
                                                            onClick={() => handleContinuarPea(m)}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                                        >
                                                            <span>{m.estado_pea === 'Aprobado' ? 'Ver PEA' : 'Continuar PEA'}</span>
                                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleCrearPea(m)}
                                                            disabled={isCreating}
                                                            className="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            {isCreating ? (
                                                                <>
                                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    <span>Inicializando...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                                    <span>Elaborar PEA</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocentePeaDashboard;

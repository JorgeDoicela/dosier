import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Award,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    RefreshCw,
    FileText,
    Shield,
    Loader2,
    Building2,
    PlusCircle,
    GraduationCap
} from 'lucide-react';
import { PageHeader } from '../../../components/Common/PageHeader';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { useNotifications } from '../../../api/NotificationsContext';
import {
    getMisMaterias,
    getPeriodoActivo,
    getPeriodosAcademicos
} from '../../../services/docenteAsignaturasService';
import type {
    DocenteAsignaturaDto,
    PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';
import { crearPeaDesdeAsignacion } from '../../../services/peaService';

export const MyProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotifications();

    const [materias, setMaterias] = useState<DocenteAsignaturaDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filtros
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [filterCarrera, setFilterCarrera] = useState<string>('todas');

    // Estado transaccional por asignación
    const [creatingPeaId, setCreatingPeaId] = useState<number | null>(null);

    const cargarPeriodosYDatos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [periodosList, periodoActivo] = await Promise.all([
                getPeriodosAcademicos(),
                getPeriodoActivo()
            ]);

            setPeriodos(periodosList);

            const initialPeriod = periodoActivo?.id_periodo || periodosList[0]?.id_periodo || '';
            setSelectedPeriodo(initialPeriod);

            if (initialPeriod) {
                const misMaterias = await getMisMaterias(initialPeriod);
                setMaterias(misMaterias);
            }
        } catch (err: any) {
            console.error('[DOSIER] Error al cargar períodos y materias:', err);
            setError('No se pudo cargar la información curricular institucional. Verifique la conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPeriodosYDatos();
    }, [cargarPeriodosYDatos]);

    const handlePeriodoChange = async (newPeriodoId: string | number) => {
        const idStr = String(newPeriodoId);
        setSelectedPeriodo(idStr);
        setRefreshing(true);
        setError(null);
        try {
            const misMaterias = await getMisMaterias(idStr);
            setMaterias(misMaterias);
        } catch (err) {
            console.error('[DOSIER] Error al cambiar período:', err);
            setError('Error al actualizar las asignaturas del período seleccionado.');
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

            // Redirigir al workspace con el UUID o ID del PEA oficial
            const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as any).id_pea);
            navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
        } catch (err: any) {
            console.error('[DOSIER] Error al inicializar PEA:', err);
            addToast(
                'Error al Iniciar PEA',
                err.response?.data?.message || 'No se pudo inicializar el PEA desde la asignación institucional.',
                'error'
            );
        } finally {
            setCreatingPeaId(null);
        }
    };

    const handleContinuarPea = (asignacion: DocenteAsignaturaDto) => {
        const targetUuid = asignacion.uuid_pea || String(asignacion.id_pea);
        navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
    };

    // Lista única de carreras para filtro
    const carrerasDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            if (m.nombre_carrera) unique.add(m.nombre_carrera);
        });
        return Array.from(unique).sort();
    }, [materias]);

    // Métricas del Bento Grid
    const metricas = useMemo(() => {
        const total = materias.length;
        const totalHoras = materias.reduce((acc, m) => acc + (m.horas_totales || 0), 0);
        const aprobados = materias.filter(m => m.estado_pea === 'Aprobado').length;
        const enRevision = materias.filter(m => ['EnRevision', 'RevisadoCoord', 'RevisadoAcad'].includes(m.estado_pea)).length;
        const conObservaciones = materias.filter(m => m.estado_pea === 'Observado').length;
        const pendientes = materias.filter(m => ['NoIniciado', 'Borrador', 'Corregido'].includes(m.estado_pea)).length;

        return { total, totalHoras, aprobados, enRevision, conObservaciones, pendientes };
    }, [materias]);

    // Filtrado en vivo
    const materiasFiltradas = useMemo(() => {
        return materias.filter(m => {
            const matchesSearch =
                m.nombre_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.codigo_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.nombre_carrera?.toLowerCase().includes(search.toLowerCase()) ||
                m.paralelo?.toLowerCase().includes(search.toLowerCase());

            const matchesEstado =
                filterEstado === 'todos' ? true :
                filterEstado === 'pendientes' ? ['NoIniciado', 'Borrador', 'Corregido'].includes(m.estado_pea) :
                filterEstado === 'revision' ? ['EnRevision', 'RevisadoCoord', 'RevisadoAcad'].includes(m.estado_pea) :
                filterEstado === 'observados' ? m.estado_pea === 'Observado' :
                filterEstado === 'aprobados' ? m.estado_pea === 'Aprobado' : true;

            const matchesCarrera = filterCarrera === 'todas' || m.nombre_carrera === filterCarrera;

            return matchesSearch && matchesEstado && matchesCarrera;
        });
    }, [materias, search, filterEstado, filterCarrera]);

    const renderEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'NoIniciado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        No Iniciado
                    </span>
                );
            case 'Borrador':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                        <FileText className="w-3 h-3 text-blue-500" />
                        Borrador
                    </span>
                );
            case 'EnRevision':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3 text-amber-500" />
                        En Revisión
                    </span>
                );
            case 'Observado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        Con Observaciones
                    </span>
                );
            case 'Corregido':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        <CheckCircle2 className="w-3 h-3 text-purple-500" />
                        Corregido
                    </span>
                );
            case 'RevisadoCoord':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                        <Award className="w-3 h-3 text-cyan-500" />
                        Aval de Carrera
                    </span>
                );
            case 'RevisadoAcad':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                        <Shield className="w-3 h-3 text-indigo-500" />
                        Aval Académico
                    </span>
                );
            case 'Aprobado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Aprobado Oficial
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                        {estado}
                    </span>
                );
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Cabecera Principal con Selector de Período Oficial */}
            <PageHeader
                title="Mis Instrumentos Curriculares - PEA"
                description="Gestión microcurricular y formulación de Programas de Estudio de la Asignatura según distributivo oficial SIGAFI."
            >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-56">
                        <GeistSelect
                            value={selectedPeriodo}
                            onChange={handlePeriodoChange}
                            placeholder="Seleccione período..."
                            disabled={loading || periodos.length === 0}
                        >
                            {periodos.map(p => (
                                <option key={p.id_periodo} value={p.id_periodo}>
                                    {p.detalle || p.id_periodo} {p.es_activo ? '(Activo)' : ''}
                                </option>
                            ))}
                        </GeistSelect>
                    </div>
                    <button
                        onClick={() => handlePeriodoChange(selectedPeriodo)}
                        disabled={refreshing || loading}
                        className="btn-vercel-secondary inline-flex items-center justify-center p-2 rounded-md transition-colors"
                        title="Actualizar distributivo"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </PageHeader>

            {/* Mensaje de Error si ocurre */}
            {error && (
                <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tablero de Métricas Curriculares (Bento Grid) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <span>Asignaturas Asignadas</span>
                        <BookOpen className="w-4 h-4 text-zinc-400" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {metricas.total}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {metricas.totalHoras} horas académicas en total
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span>PEAs Aprobados</span>
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                        {metricas.aprobados}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Legalizados por Vicerrectorado
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-amber-600 dark:text-amber-400">
                        <span>En Revisión Colegiada</span>
                        <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                        {metricas.enRevision}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        En comisión o coordinación
                    </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium text-blue-600 dark:text-blue-400">
                        <span>Pendientes / Borrador</span>
                        <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                        {metricas.pendientes}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {metricas.conObservaciones > 0 ? `${metricas.conObservaciones} con observaciones` : 'En fase docente'}
                    </p>
                </div>
            </div>

            {/* Barra de Búsqueda y Filtros de Estado */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por asignatura, código, carrera o paralelo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {carrerasDisponibles.length > 1 && (
                        <select
                            value={filterCarrera}
                            onChange={e => setFilterCarrera(e.target.value)}
                            className="text-xs py-2 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        >
                            <option value="todas">Todas las Carreras</option>
                            {carrerasDisponibles.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    )}

                    <div className="inline-flex p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-medium">
                        <button
                            onClick={() => setFilterEstado('todos')}
                            className={`px-3 py-1 rounded-md transition-colors ${filterEstado === 'todos' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setFilterEstado('pendientes')}
                            className={`px-3 py-1 rounded-md transition-colors ${filterEstado === 'pendientes' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Pendientes
                        </button>
                        <button
                            onClick={() => setFilterEstado('revision')}
                            className={`px-3 py-1 rounded-md transition-colors ${filterEstado === 'revision' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Revisión
                        </button>
                        <button
                            onClick={() => setFilterEstado('aprobados')}
                            className={`px-3 py-1 rounded-md transition-colors ${filterEstado === 'aprobados' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}
                        >
                            Aprobados
                        </button>
                    </div>
                </div>
            </div>

            {/* Listado de Asignaturas / Instrumentos PEA */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                    <p className="text-sm">Consultando distributivo académico y estado de PEAs...</p>
                </div>
            ) : materiasFiltradas.length === 0 ? (
                <div className="py-16 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3 bg-white dark:bg-zinc-950">
                    <GraduationCap className="w-10 h-10 mx-auto text-zinc-400" />
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                        No se encontraron asignaturas
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                        {search || filterEstado !== 'todos' || filterCarrera !== 'todas'
                            ? 'No hay materias que coincidan con los filtros aplicados en el período actual.'
                            : 'No existen materias asignadas para su perfil docente en este período lectivo.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {materiasFiltradas.map((materia) => {
                        const tienePea = Boolean(materia.id_pea && materia.id_pea > 0);
                        const isCreating = creatingPeaId === materia.id_asignacion;

                        return (
                            <div
                                key={materia.id_asignacion}
                                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4"
                            >
                                {/* Top: Carrera y Estado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{materia.nombre_carrera}</span>
                                        </div>
                                        <div>{renderEstadoBadge(materia.estado_pea)}</div>
                                    </div>

                                    {/* Título de la Asignatura */}
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                                        {materia.nombre_asignatura}
                                    </h2>

                                    {/* Metadatos Curriculares */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                                        {materia.codigo_asignatura && (
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono">
                                                {materia.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                                            {materia.nombre_nivel}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold">
                                            Paralelo {materia.paralelo}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                                            {materia.nombre_modalidad || 'Presencial'}
                                        </span>
                                    </div>
                                </div>

                                {/* Desglose de Horas Oficiales (RRA Art. 21) */}
                                <div className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 grid grid-cols-4 gap-2 text-center text-xs">
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">CD</span>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{materia.horas_docencia}h</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">APE</span>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{materia.horas_practico_experimental}h</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">TA</span>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{materia.horas_autonomo}h</span>
                                    </div>
                                    <div>
                                        <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Total</span>
                                        <span className="font-bold text-zinc-900 dark:text-zinc-100">{materia.horas_totales}h</span>
                                    </div>
                                </div>

                                {/* Botón de Acción Principal */}
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                                    <div className="text-[11px] text-zinc-400">
                                        {tienePea && materia.version_pea ? `Versión ${materia.version_pea}.0` : 'Sin PEA registrado'}
                                    </div>

                                    {tienePea ? (
                                        <button
                                            onClick={() => handleContinuarPea(materia)}
                                            className="btn-vercel-primary inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
                                        >
                                            <span>{materia.estado_pea === 'Aprobado' ? 'Ver PEA' : 'Continuar PEA'}</span>
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleCrearPea(materia)}
                                            disabled={isCreating}
                                            className="btn-vercel-primary inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all"
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyProjectsPage;

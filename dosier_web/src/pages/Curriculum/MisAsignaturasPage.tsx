import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    Award,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Search,
    FileText,
    Shield,
    Loader2,
    Building2,
    PlusCircle,
    GraduationCap,
    LayoutGrid,
    List,
    Info
} from 'lucide-react';
import { PageHeader } from '../../components/Common/PageHeader';
import { GeistSelect } from '../../components/Common/GeistSelect';
import { useNotifications } from '../../api/NotificationsContext';
import {
    getMisMaterias,
    getPeriodoActivo,
    getPeriodosAcademicos
} from '../../services/docenteAsignaturasService';
import type {
    DocenteAsignaturaDto,
    PeriodoAcademicoDto
} from '../../services/docenteAsignaturasService';
import { crearPeaDesdeAsignacion } from '../../services/peaService';
import { configuracionService } from '../../services/configuracionService';

export const MisAsignaturasPage: React.FC = () => {
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
    const [filterModalidad, setFilterModalidad] = useState<string>('todas');
    const [filterTipo, setFilterTipo] = useState<'todas' | 'curriculares' | 'institucionales'>('todas');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Catálogo de estados dinámicos desde la BD (tabla doc_config_workflow)
    const [workflowEstados, setWorkflowEstados] = useState<Array<{ estado: string; etiqueta?: string; color?: string }>>([]);

    useEffect(() => {
        configuracionService.getWorkflowEstados()
            .then(data => {
                if (Array.isArray(data)) {
                    setWorkflowEstados(data);
                }
            })
            .catch(err => {
                console.warn('[DOSIER] No se pudieron cargar estados del workflow desde BD:', err);
            });
    }, []);

    // Estado transaccional por asignación
    const [creatingPeaId, setCreatingPeaId] = useState<number | null>(null);

    const recargarMaterias = useCallback(async (periodoId: string, silent = false) => {
        if (!periodoId) return;
        if (!silent) setRefreshing(true);
        try {
            const misMaterias = await getMisMaterias(periodoId);
            setMaterias(misMaterias);
            setError(null);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al actualizar materias:', err);
            if (!silent) {
                setError('Error al actualizar las asignaturas del período seleccionado.');
            }
        } finally {
            if (!silent) setRefreshing(false);
        }
    }, []);

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
        } catch (err: unknown) {
            console.error('[DOSIER] Error al cargar períodos y materias:', err);
            setError('No se pudo cargar la información curricular institucional. Verifique la conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPeriodosYDatos();
    }, [cargarPeriodosYDatos]);

    // 1. Sincronización en tiempo real vía eventos de dominio (SignalR WebSockets y workflow transitions)
    useEffect(() => {
        const handleProjectsChanged = () => {
            if (selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        };

        window.addEventListener('dosier-projects-changed', handleProjectsChanged);
        return () => {
            window.removeEventListener('dosier-projects-changed', handleProjectsChanged);
        };
    }, [selectedPeriodo, recargarMaterias]);

    // 2. Revalidación automática al recuperar foco o visibilidad de pestaña (revalidateOnFocus)
    useEffect(() => {
        const handleVisibilityAndFocus = () => {
            if (document.visibilityState === 'visible' && selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        };

        window.addEventListener('focus', handleVisibilityAndFocus);
        document.addEventListener('visibilitychange', handleVisibilityAndFocus);
        return () => {
            window.removeEventListener('focus', handleVisibilityAndFocus);
            document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
        };
    }, [selectedPeriodo, recargarMaterias]);

    // 3. Heartbeat pasivo (revalidación periódica cada 30 segundos mientras la pestaña esté activa)
    useEffect(() => {
        if (!selectedPeriodo) return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                recargarMaterias(selectedPeriodo, true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedPeriodo, recargarMaterias]);

    const handlePeriodoChange = async (newPeriodoId: string | number) => {
        const idStr = String(newPeriodoId);
        setSelectedPeriodo(idStr);
        await recargarMaterias(idStr, false);
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

            // Notificar a todos los escuchas que el estado de los proyectos curriculares ha cambiado
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));

            // Redirigir al workspace con el UUID o ID del PEA oficial
            const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as { id_pea?: number | string }).id_pea);
            navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al inicializar PEA:', err);
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast(
                'Error al Iniciar PEA',
                message || 'No se pudo inicializar el PEA desde la asignación institucional.',
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

    // Diccionario dinámico de etiquetas institucionales con fallback a doc_config_workflow
    const getEstadoLabel = useCallback((estado: string): string => {
        if (!estado) return 'Desconocido';

        // 1. Buscar coincidencia en la tabla doc_config_workflow de la BD
        const dbMatch = workflowEstados.find(
            w => w.estado?.toLowerCase() === estado.toLowerCase()
        );
        if (dbMatch?.etiqueta) return dbMatch.etiqueta;

        // 2. Diccionario normativo institucional oficial
        const labels: Record<string, string> = {
            'NoIniciado': 'No Iniciado',
            'Borrador': 'Borrador',
            'EnRevision': 'En Revisión',
            'Observado': 'Con Observaciones',
            'Corregido': 'Corregido',
            'RevisadoCoord': 'Aval de Carrera',
            'RevisadoAcad': 'Aval Académico',
            'Aprobado': 'Aprobado Oficial',
            'Publicado': 'Publicado',
            'Rechazado': 'Rechazado'
        };
        return labels[estado] || estado;
    }, [workflowEstados]);

    // Lista única de carreras para filtro
    const carrerasDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            if (m.nombre_carrera) unique.add(m.nombre_carrera);
        });
        return Array.from(unique).sort();
    }, [materias]);

    // Lista única de modalidades para filtro
    const modalidadesDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            const mod = m.nombre_modalidad?.trim() || 'Presencial';
            unique.add(mod);
        });
        return Array.from(unique).sort();
    }, [materias]);

    // Lista única y dinámica de estados presentes en las asignaturas asignadas
    const estadosDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            if (m.estado_pea) unique.add(m.estado_pea);
        });
        return Array.from(unique)
            .map(estado => ({
                value: estado,
                label: getEstadoLabel(estado)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [materias, getEstadoLabel]);

    // Resetear filtros si la selección previa ya no existe en el conjunto disponible
    useEffect(() => {
        if (filterCarrera !== 'todas' && !carrerasDisponibles.includes(filterCarrera)) {
            setFilterCarrera('todas');
        }
    }, [carrerasDisponibles, filterCarrera]);

    useEffect(() => {
        if (filterModalidad !== 'todas' && !modalidadesDisponibles.includes(filterModalidad)) {
            setFilterModalidad('todas');
        }
    }, [modalidadesDisponibles, filterModalidad]);

    useEffect(() => {
        if (filterEstado !== 'todos' && !estadosDisponibles.some(e => e.value.toLowerCase() === filterEstado.toLowerCase())) {
            setFilterEstado('todos');
        }
    }, [estadosDisponibles, filterEstado]);

    // Filtrado en vivo
    const materiasFiltradas = useMemo(() => {
        return materias.filter(m => {
            const modNombre = m.nombre_modalidad?.trim() || 'Presencial';
            const estadoLabel = getEstadoLabel(m.estado_pea || '');
            const isExtra = Boolean(m.es_extracurricular || m.estado_pea === 'NoAplica');

            const matchesSearch =
                m.nombre_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.codigo_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.nombre_carrera?.toLowerCase().includes(search.toLowerCase()) ||
                m.paralelo?.toLowerCase().includes(search.toLowerCase()) ||
                modNombre.toLowerCase().includes(search.toLowerCase()) ||
                estadoLabel.toLowerCase().includes(search.toLowerCase());

            const matchesEstado =
                filterEstado === 'todos' ||
                m.estado_pea?.toLowerCase() === filterEstado.toLowerCase();

            const matchesCarrera = filterCarrera === 'todas' || m.nombre_carrera === filterCarrera;

            const matchesModalidad =
                filterModalidad === 'todas' ||
                modNombre.toLowerCase() === filterModalidad.toLowerCase();

            const matchesTipo =
                filterTipo === 'todas' ||
                (filterTipo === 'curriculares' && !isExtra) ||
                (filterTipo === 'institucionales' && isExtra);

            return matchesSearch && matchesEstado && matchesCarrera && matchesModalidad && matchesTipo;
        });
    }, [materias, search, filterEstado, filterCarrera, filterModalidad, filterTipo, getEstadoLabel]);

    const renderEstadoBadge = (estado: string) => {
        const label = getEstadoLabel(estado);
        switch (estado) {
            case 'NoAplica':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                        <Info className="w-3 h-3 text-zinc-400" />
                        Acompañamiento
                    </span>
                );
            case 'NoIniciado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {label}
                    </span>
                );
            case 'Borrador':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                        <FileText className="w-3 h-3 text-blue-500" />
                        {label}
                    </span>
                );
            case 'EnRevision':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        <Clock className="w-3 h-3 text-amber-500" />
                        {label}
                    </span>
                );
            case 'Observado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300">
                        <AlertCircle className="w-3 h-3 text-red-500" />
                        {label}
                    </span>
                );
            case 'Corregido':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                        <CheckCircle2 className="w-3 h-3 text-purple-500" />
                        {label}
                    </span>
                );
            case 'RevisadoCoord':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                        <Award className="w-3 h-3 text-cyan-500" />
                        {label}
                    </span>
                );
            case 'RevisadoAcad':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                        <Shield className="w-3 h-3 text-indigo-500" />
                        {label}
                    </span>
                );
            case 'Aprobado':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        {label}
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                        {label}
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
                    <div className="w-72 sm:w-80">
                        <GeistSelect
                            value={selectedPeriodo}
                            onChange={handlePeriodoChange}
                            placeholder="Seleccione período..."
                            disabled={loading || periodos.length === 0}
                        >
                            {periodos.map(p => {
                                const nombreLimpio = p.detalle?.trim();
                                const etiqueta = nombreLimpio 
                                    ? `${nombreLimpio}${p.es_activo ? ' (Activo)' : ''}`
                                    : `${p.id_periodo}${p.es_activo ? ' (Activo)' : ''}`;
                                return (
                                    <option key={p.id_periodo} value={p.id_periodo}>
                                        {etiqueta}
                                    </option>
                                );
                            })}
                        </GeistSelect>
                    </div>
                </div>
            </PageHeader>

            {/* Mensaje de Error si ocurre */}
            {error && (
                <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

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
                        <div className="w-48 shrink-0">
                            <GeistSelect
                                value={filterCarrera}
                                onChange={val => setFilterCarrera(String(val))}
                                options={[
                                    { value: 'todas', label: 'Todas las Carreras' },
                                    ...carrerasDisponibles.map(c => ({ value: c, label: c }))
                                ]}
                                placeholder="Carrera..."
                            />
                        </div>
                    )}

                    {modalidadesDisponibles.length > 1 && (
                        <div className="w-44 shrink-0">
                            <GeistSelect
                                value={filterModalidad}
                                onChange={val => setFilterModalidad(String(val))}
                                options={[
                                    { value: 'todas', label: 'Todas las Modalidades' },
                                    ...modalidadesDisponibles.map(m => ({ value: m, label: m }))
                                ]}
                                placeholder="Modalidad..."
                            />
                        </div>
                    )}

                    {estadosDisponibles.length > 0 && (
                        <div className="w-44 shrink-0">
                            <GeistSelect
                                value={filterEstado}
                                onChange={val => setFilterEstado(String(val))}
                                options={[
                                    { value: 'todos', label: 'Todos los Estados' },
                                    ...estadosDisponibles
                                ]}
                                placeholder="Estado del PEA..."
                            />
                        </div>
                    )}

                    <div className="w-48 shrink-0">
                        <GeistSelect
                            value={filterTipo}
                            onChange={val => setFilterTipo(val as 'todas' | 'curriculares' | 'institucionales')}
                            options={[
                                { value: 'todas', label: 'Toda la Carga' },
                                { value: 'curriculares', label: 'Curriculares (con PEA)' },
                                { value: 'institucionales', label: 'Acompañamiento' }
                            ]}
                            placeholder="Tipo de carga..."
                        />
                    </div>

                    {(search || filterCarrera !== 'todas' || filterModalidad !== 'todas' || filterEstado !== 'todos' || filterTipo !== 'todas') && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setFilterCarrera('todas');
                                setFilterModalidad('todas');
                                setFilterEstado('todos');
                                setFilterTipo('todas');
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                            title="Restablecer filtros"
                        >
                            Limpiar
                        </button>
                    )}

                    {/* Selector de Modo: Cuadros vs Lista */}
                    <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900 p-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                viewMode === 'grid'
                                    ? 'bg-white dark:bg-zinc-800 text-[#0070f3] dark:text-blue-400 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                            title="Vista en Cuadros"
                        >
                            <LayoutGrid size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-zinc-800 text-[#0070f3] dark:text-blue-400 shadow-xs'
                                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                            title="Vista en Lista"
                        >
                            <List size={14} />
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
                        {search || filterEstado !== 'todos' || filterCarrera !== 'todas' || filterModalidad !== 'todas'
                            ? 'No hay materias que coincidan con los filtros aplicados en el período actual.'
                            : 'No existen materias asignadas para su perfil docente en este período lectivo.'}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {materiasFiltradas.map((materia) => {
                        const tienePea = Boolean(materia.id_pea && materia.id_pea > 0);
                        const isCreating = creatingPeaId === materia.id_asignacion;
                        const isExtra = Boolean(materia.es_extracurricular || materia.estado_pea === 'NoAplica');

                        const handleCardClick = () => {
                            if (isCreating) return;
                            if (isExtra) {
                                addToast(
                                    'Actividad Institucional',
                                    `"${materia.nombre_asignatura}" es una carga de acompañamiento que no requiere formulación de PEA microcurricular.`,
                                    'info'
                                );
                                return;
                            }
                            if (tienePea) {
                                handleContinuarPea(materia);
                            } else {
                                handleCrearPea(materia);
                            }
                        };

                        return (
                            <div
                                key={materia.id_asignacion}
                                role="button"
                                tabIndex={0}
                                onClick={handleCardClick}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleCardClick();
                                    }
                                }}
                                className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950 text-left"
                            >
                                {/* Top: Carrera y Estado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0070f3]" />
                                            <span className="truncate">{materia.nombre_carrera}</span>
                                        </div>
                                        <div>{renderEstadoBadge(materia.estado_pea)}</div>
                                    </div>

                                    {/* Título de la Asignatura */}
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {materia.nombre_asignatura}
                                    </h2>

                                    {/* Metadatos Curriculares */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                                        {materia.codigo_asignatura && (
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                                                {materia.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                            {materia.horas_totales}h ({materia.creditos || Math.round(materia.horas_totales / 48)} Créd.)
                                        </span>
                                        {materia.horas_semanales ? (
                                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-semibold border border-blue-200/50 dark:border-blue-900/50">
                                                {materia.horas_semanales}h/sem
                                            </span>
                                        ) : null}
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                            {materia.nombre_nivel}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-[11px]">
                                            Paralelo {materia.paralelo}
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-[11px]">
                                            {materia.nombre_modalidad || 'Presencial'}
                                        </span>
                                    </div>
                                </div>

                                {/* Botón de Acción Principal */}
                                <div className="pt-2 flex items-center justify-end border-t border-slate-100 dark:border-zinc-900">
                                    {isExtra ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                                            <Info className="w-3.5 h-3.5 text-zinc-400" />
                                            No requiere PEA
                                        </span>
                                    ) : tienePea ? (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleContinuarPea(materia);
                                            }}
                                            className="bg-[#0070f3] group-hover:bg-[#0060df] text-white shadow-xs inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                        >
                                            <span>{materia.estado_pea === 'Aprobado' ? 'Ver PEA' : 'Continuar PEA'}</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCrearPea(materia);
                                            }}
                                            disabled={isCreating}
                                            className="bg-[#0070f3] group-hover:bg-[#0060df] text-white shadow-xs inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
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
            ) : (
                /* ── MODO LISTA TABULAR ── */
                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
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
                                const isExtra = Boolean(m.es_extracurricular || m.estado_pea === 'NoAplica');

                                const handleRowClick = () => {
                                    if (isCreating) return;
                                    if (isExtra) {
                                        addToast(
                                            'Actividad Institucional',
                                            `"${m.nombre_asignatura}" es una carga de acompañamiento que no requiere formulación de PEA microcurricular.`,
                                            'info'
                                        );
                                        return;
                                    }
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
                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                                <span>{m.horas_totales}h Total</span>
                                                {m.horas_semanales ? (
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/50 dark:border-blue-900/50">
                                                        {m.horas_semanales}h/sem
                                                    </span>
                                                ) : null}
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
                                            {renderEstadoBadge(m.estado_pea)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                                                {isExtra ? (
                                                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-slate-200 dark:border-zinc-800 inline-flex items-center gap-1">
                                                        <Info className="w-3 h-3 text-zinc-400" />
                                                        No requiere PEA
                                                    </span>
                                                ) : tienePea ? (
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
                </div>
            )}
        </div>
    );
};

export default MisAsignaturasPage;


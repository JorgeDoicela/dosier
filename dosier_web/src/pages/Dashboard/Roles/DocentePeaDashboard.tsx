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
    AlertCircle,
    ArrowRight,
    PlusCircle,
    Building2,
    RefreshCw,
    Search,
    Loader2,
    LayoutGrid,
    List,
    Clock,
    FileText,
    CheckCircle2,
    Award,
    Shield
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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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

    // Alerta de observaciones
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

    const renderEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'Aprobado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Aprobado Oficial
                    </span>
                );
            case 'Observado':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                        Con Observaciones
                    </span>
                );
            case 'EnRevision':
            case 'RevisadoCoord':
            case 'RevisadoAcad':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/80 text-[#0070f3] dark:text-blue-400">
                        <Clock className="w-3.5 h-3.5 text-[#0070f3]" />
                        En Revisión
                    </span>
                );
            case 'Borrador':
            case 'Corregido':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        En Borrador
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-zinc-400" />
                        No Iniciado
                    </span>
                );
        }
    };

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

            {/* Controles y Filtros de Asignaturas */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        Asignaturas en Distributivo
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-medium border border-slate-200 dark:border-zinc-700">
                        {materiasFiltradas.length}
                    </span>
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
                            className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3] dark:focus:border-blue-500 w-48 shadow-2xs"
                        />
                    </div>

                    {/* Filtro de Estado */}
                    <select
                        value={filterEstado}
                        onChange={e => setFilterEstado(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3] dark:focus:border-blue-500 shadow-2xs cursor-pointer"
                    >
                        <option value="todos">Todos los Estados</option>
                        <option value="pendientes">Pendientes / Borrador</option>
                        <option value="revision">En Revisión</option>
                        <option value="observados">Con Observaciones</option>
                        <option value="aprobados">Aprobados</option>
                    </select>

                    {/* Selector de Modo: Cuadros vs Lista */}
                    <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 p-0.5 shrink-0">
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

                    <button
                        onClick={handleRefrescar}
                        disabled={refreshing}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer shadow-2xs"
                        title="Recargar distributivo"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Contenido: Grid o Tabla */}
            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 space-y-2 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    <p className="text-xs">Consultando asignaciones académicas...</p>
                </div>
            ) : materiasFiltradas.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs rounded-xl border border-slate-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    No se encontraron asignaturas asignadas en el período seleccionado.
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materiasFiltradas.map(materia => {
                            const tienePea = Boolean(materia.id_pea && materia.id_pea > 0);
                            const isCreating = creatingPeaId === materia.id_asignacion;

                            const handleCardClick = () => {
                                if (isCreating) return;
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
                                    onKeyDown={e => {
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
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                            {materia.nombre_asignatura}
                                        </h3>

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
                                        {tienePea ? (
                                            <button
                                                type="button"
                                                onClick={e => {
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
                                                onClick={e => {
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
                    /* ── MODO TABLA / LISTA ── */
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold text-xs">
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
                                                {renderEstadoBadge(m.estado_pea)}
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
                    </div>
                )}
        </div>
    );
};

export default DocentePeaDashboard;


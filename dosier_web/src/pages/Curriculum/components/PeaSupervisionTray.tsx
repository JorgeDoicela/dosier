import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Search,
    RefreshCw,
    AlertCircle,
    UserCheck,
    Filter,
    Eye,
    GraduationCap,
    LayoutGrid,
    List,
    Building2,
    ExternalLink,
    CheckCircle2,
    Info
} from 'lucide-react';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { useAuth } from '../../../api/AuthContext';
import { getBandejaPeas, type PeaBandejaItemDto } from '../../../services/peaService';
import {
    getPeriodosAcademicos,
    getPeriodoActivo,
    type PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';
import {
    normalizePeaStatus,
    isPeaBorrador,
    isPeaEnRevision,
    isPeaAvalado,
    getPeaStatusDescriptor
} from '../utils/peaStatusWorkflow';

export const PeaSupervisionTray: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [selectedCarrera, setSelectedCarrera] = useState<string>('todas');
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    // Tab por defecto: 'por_revisar' para que las autoridades vean directamente su bandeja de trabajo operativo
    const [workflowTab, setWorkflowTab] = useState<'por_revisar' | 'en_redaccion' | 'aprobados' | 'todos'>('por_revisar');
    const [search, setSearch] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Función de recarga de PEAs con soporte silencioso para tiempo real
    const recargarPeas = useCallback(async (periodoId?: string, silent = false) => {
        if (!silent) {
            setLoading(true);
        }
        setError(null);
        try {
            const data = await getBandejaPeas({
                idPeriodo: periodoId || undefined
            });
            setPeas(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('[DOSIER] Error al sincronizar bandeja de PEAs:', err);
            if (!silent) {
                setError('No se pudo cargar la información de supervisión de PEAs. Verifique la conexión con el servidor.');
            }
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, []);

    // Cargar períodos y lista inicial
    const cargarDatos = useCallback(async () => {
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

            await recargarPeas(initialPeriod, false);
        } catch (err: any) {
            console.error('[DOSIER] Error al inicializar bandeja de PEAs:', err);
            setError('No se pudo cargar la información de supervisión de PEAs. Verifique la conexión con el servidor.');
            setLoading(false);
        }
    }, [recargarPeas]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // 1. Sincronización en tiempo real vía eventos de dominio (SignalR WebSockets y transiciones de workflow)
    useEffect(() => {
        const handleProjectsChanged = () => {
            if (selectedPeriodo) {
                recargarPeas(selectedPeriodo, true);
            }
        };

        window.addEventListener('dosier-projects-changed', handleProjectsChanged);
        return () => {
            window.removeEventListener('dosier-projects-changed', handleProjectsChanged);
        };
    }, [selectedPeriodo, recargarPeas]);

    // 2. Revalidación automática al recuperar foco o visibilidad de pestaña (revalidateOnFocus)
    useEffect(() => {
        const handleVisibilityAndFocus = () => {
            if (document.visibilityState === 'visible' && selectedPeriodo) {
                recargarPeas(selectedPeriodo, true);
            }
        };

        window.addEventListener('focus', handleVisibilityAndFocus);
        document.addEventListener('visibilitychange', handleVisibilityAndFocus);
        return () => {
            window.removeEventListener('focus', handleVisibilityAndFocus);
            document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
        };
    }, [selectedPeriodo, recargarPeas]);

    // 3. Heartbeat pasivo (revalidación periódica cada 20 segundos mientras la pestaña esté activa)
    useEffect(() => {
        if (!selectedPeriodo) return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                recargarPeas(selectedPeriodo, true);
            }
        }, 20000);

        return () => clearInterval(interval);
    }, [selectedPeriodo, recargarPeas]);

    const handlePeriodoChange = async (val: string | number) => {
        const idStr = String(val);
        setSelectedPeriodo(idStr);
        await recargarPeas(idStr, false);
    };

    // Cambiar de pestaña y sincronizar coherencia de filtros
    const handleWorkflowTabChange = (tab: 'por_revisar' | 'en_redaccion' | 'aprobados' | 'todos') => {
        setWorkflowTab(tab);
        setSelectedEstado('todos');
    };

    // Carreras únicas encontradas
    const carrerasDisponibles = useMemo(() => {
        const map = new Map<number, string>();
        peas.forEach(p => {
            if (p.id_carrera && p.nombre_carrera) {
                map.set(p.id_carrera, p.nombre_carrera);
            }
        });
        return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
    }, [peas]);

    // Métricas de estado del workflow curricular
    const stats = useMemo(() => {
        const porRevisar = peas.filter(p => isPeaEnRevision(p.estado)).length;
        const enRedaccion = peas.filter(p => isPeaBorrador(p.estado)).length;
        const aprobados = peas.filter(p => isPeaAvalado(p.estado)).length;
        return {
            total: peas.length,
            porRevisar,
            enRedaccion,
            aprobados
        };
    }, [peas]);

    // Filtrado en memoria por búsqueda, carrera y estado
    const filteredPeas = useMemo(() => {
        return peas.filter(p => {
            const query = search.trim().toLowerCase();
            const matchSearch = !query ||
                (p.nombre_asignatura && p.nombre_asignatura.toLowerCase().includes(query)) ||
                (p.codigo_asignatura && p.codigo_asignatura.toLowerCase().includes(query)) ||
                (p.nombre_docente_elaborador && p.nombre_docente_elaborador.toLowerCase().includes(query)) ||
                (p.nombre_carrera && p.nombre_carrera.toLowerCase().includes(query));

            const matchCarrera = selectedCarrera === 'todas' || String(p.id_carrera) === selectedCarrera;

            let matchWorkflow = true;
            if (workflowTab === 'por_revisar') {
                matchWorkflow = isPeaEnRevision(p.estado);
            } else if (workflowTab === 'en_redaccion') {
                matchWorkflow = isPeaBorrador(p.estado);
            } else if (workflowTab === 'aprobados') {
                matchWorkflow = isPeaAvalado(p.estado);
            }

            const matchEstado = selectedEstado === 'todos' || normalizePeaStatus(p.estado) === normalizePeaStatus(selectedEstado);

            return matchSearch && matchCarrera && matchWorkflow && matchEstado;
        });
    }, [peas, search, selectedCarrera, selectedEstado, workflowTab]);

    const handleAbrirPea = (uuid: string) => {
        navigate(`/documentacion/revision-tecnica/${uuid}`);
    };

    const handleAbrirEditor = (uuid: string) => {
        navigate(`/documentacion/workspace/PEA_OFICIAL/${uuid}?edit=pea-oficial`);
    };

    // Verificar si el usuario autenticado tiene permiso de edición directa sobre este PEA
    const puedeEditarDocumento = (p: PeaBandejaItemDto): boolean => {
        if (isAdmin) return true;
        if (user?.id_sigafi && p.id_docente_elaborador && user.id_sigafi === p.id_docente_elaborador) {
            return true;
        }
        return false;
    };

    return (
        <div className="space-y-6">
            {/* ── Riel Plano Continuo de Pestañas de Workflow (Regla 4.1 styles-dosier) ── */}
            <div className="border-b border-slate-200 dark:border-zinc-800 -mb-px">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Bandejas de supervisión del PEA">
                    <button
                        type="button"
                        onClick={() => handleWorkflowTabChange('por_revisar')}
                        className={`pb-2.5 pt-2 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            workflowTab === 'por_revisar'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <span>Por revisar</span>
                        {stats.porRevisar > 0 ? (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                                {stats.porRevisar}
                            </span>
                        ) : (
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                                0
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => handleWorkflowTabChange('en_redaccion')}
                        className={`pb-2.5 pt-2 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            workflowTab === 'en_redaccion'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <span>En redacción docente</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {stats.enRedaccion}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleWorkflowTabChange('aprobados')}
                        className={`pb-2.5 pt-2 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            workflowTab === 'aprobados'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <span>Aprobados con aval</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            {stats.aprobados}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleWorkflowTabChange('todos')}
                        className={`pb-2.5 pt-2 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            workflowTab === 'todos'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <span>Todos</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {stats.total}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Banner explicativo contextual según la pestaña activa */}
            {workflowTab === 'en_redaccion' && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-3">
                    <Info size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                    <span>
                        <strong>Modo de Monitoreo:</strong> Las siguientes asignaturas están en fase de formulación docente (borrador) y aún no han sido remitidas formalmente a la Coordinación. La visualización está habilitada en modo consulta de avance sin emisión de aval.
                    </span>
                </div>
            )}

            {/* ── BARRA DE FILTROS Y CONTROLES ── */}
            <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-3 shadow-xs">
                <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por asignatura, código institucional, docente o carrera..."
                            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-[#0070f3]"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="w-56 shrink-0">
                            <GeistSelect
                                value={selectedPeriodo}
                                onChange={handlePeriodoChange}
                                options={periodos.map(p => ({
                                    value: p.id_periodo,
                                    label: p.detalle || p.id_periodo
                                }))}
                                placeholder="Período Lectivo..."
                            />
                        </div>

                        {/* Selector de Modo de Vista: Cuadros vs Lista */}
                        <div className="flex items-center rounded-lg border border-slate-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900 p-0.5 shrink-0">
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

                <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-100 dark:border-zinc-800 text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                        <Filter size={12} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">Filtros:</span>
                    </div>

                    {/* Filtro de Carrera */}
                    <div className="flex items-center gap-1">
                        <label className="text-zinc-500 dark:text-zinc-400 text-[11px]">Carrera:</label>
                        <select
                            value={selectedCarrera}
                            onChange={e => setSelectedCarrera(e.target.value)}
                            className="py-1 px-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                            <option value="todas">Todas las Carreras</option>
                            {carrerasDisponibles.map(c => (
                                <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Estado Específico */}
                    <div className="flex items-center gap-1">
                        <label className="text-zinc-500 dark:text-zinc-400 text-[11px]">Estado:</label>
                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="py-1 px-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            {workflowTab === 'por_revisar' ? (
                                <>
                                    <option value="EnRevision">En Revisión Técnica</option>
                                    <option value="Observado">Con Observaciones</option>
                                    <option value="Corregido">Corregido</option>
                                </>
                            ) : workflowTab === 'en_redaccion' ? (
                                <>
                                    <option value="Borrador">En Redacción (Borrador)</option>
                                    <option value="NoIniciado">Sin Inicializar</option>
                                </>
                            ) : workflowTab === 'aprobados' ? (
                                <>
                                    <option value="RevisadoCoord">Aval de Carrera</option>
                                    <option value="RevisadoAcad">Aval Académico</option>
                                    <option value="Aprobado">Aprobado / Legalizado</option>
                                </>
                            ) : (
                                <>
                                    <option value="Borrador">Borrador Docente</option>
                                    <option value="EnRevision">En Revisión Técnica</option>
                                    <option value="Observado">Observado</option>
                                    <option value="Corregido">Corregido</option>
                                    <option value="RevisadoCoord">Aval de Carrera</option>
                                    <option value="RevisadoAcad">Aval Académico</option>
                                    <option value="Aprobado">Aprobado / Legalizado</option>
                                </>
                            )}
                        </select>
                    </div>

                    {(search || selectedCarrera !== 'todas' || selectedEstado !== 'todos') && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedCarrera('todas');
                                setSelectedEstado('todos');
                            }}
                            className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer ml-auto"
                        >
                            Restablecer filtros
                        </button>
                    )}
                </div>
            </div>

            {/* ── ESTADOS DE CARGA Y ERROR ── */}
            {error && (
                <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-3">
                    <AlertCircle size={18} className="shrink-0 text-rose-600 dark:text-rose-400" />
                    <span>{error}</span>
                </div>
            )}

            {/* ── BANDEJA DE PEAS (RENDERIZADO DUAL: CUADROS O LISTA) ── */}
            {loading ? (
                <div className="py-16 text-center text-zinc-400 text-xs flex flex-col items-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-[#0070f3]" />
                    <span>Consultando instrumentos curriculares registrados...</span>
                </div>
            ) : filteredPeas.length === 0 ? (
                <div className="bg-white dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-zinc-500 text-xs space-y-2">
                    {workflowTab === 'por_revisar' ? (
                        <>
                            <CheckCircle2 size={30} className="mx-auto text-emerald-500 dark:text-emerald-400" />
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Bandeja de revisión al día</p>
                            <p className="max-w-md mx-auto text-zinc-500 dark:text-zinc-400 text-[11px]">
                                No hay Programas de Estudio pendientes de revisión técnica. Las asignaturas remitidas por los docentes han sido atendidas o no registran requerimientos.
                            </p>
                        </>
                    ) : (
                        <>
                            <BookOpen size={28} className="mx-auto text-zinc-400" />
                            <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">No se encontraron Programas de Estudio (PEA)</p>
                            <p className="max-w-md mx-auto text-zinc-500 dark:text-zinc-400 text-[11px]">
                                No existen instrumentos para los criterios y filtros seleccionados en este período lectivo.
                            </p>
                        </>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS / TARJETAS ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPeas.map(pea => {
                        const descriptor = getPeaStatusDescriptor(pea.estado);
                        const esBorrador = isPeaBorrador(pea.estado);
                        const esEnRevision = isPeaEnRevision(pea.estado);
                        const esAutorOAdmin = puedeEditarDocumento(pea);

                        return (
                            <div
                                key={pea.uuid}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAbrirPea(pea.uuid)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAbrirPea(pea.uuid);
                                    }
                                }}
                                className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                            >
                                {/* Encabezado de la Tarjeta */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0070f3]" />
                                            <span className="truncate">{pea.nombre_carrera}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border ${descriptor.borderClass} ${descriptor.badgeBgClass} ${descriptor.textClass} shrink-0`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass}`} />
                                            {descriptor.label}
                                        </span>
                                    </div>

                                    {/* Nombre de la Asignatura */}
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {pea.nombre_asignatura}
                                    </h3>

                                    {/* Docente Elaborador */}
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                                        <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{pea.nombre_docente_elaborador || 'Docente Responsable'}</span>
                                    </div>

                                    {/* Metadatos Curriculares */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                                        {pea.codigo_asignatura && (
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                                                {pea.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                            {pea.total_horas_asignatura}h ({pea.creditos} Créditos)
                                        </span>
                                        {pea.semestre_nivel && (
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                                {pea.semestre_nivel}
                                            </span>
                                        )}
                                        {pea.total_observaciones_pendientes > 0 && (
                                            <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 font-semibold text-[11px] inline-flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                {pea.total_observaciones_pendientes} Obs.
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Pie de Tarjeta con Acciones Claras e Intencionales */}
                                <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-zinc-900">
                                    {esAutorOAdmin ? (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirEditor(pea.uuid);
                                            }}
                                            className="text-[11px] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1 cursor-pointer font-medium"
                                            title="Editar contenido curricular del PEA"
                                        >
                                            <ExternalLink size={12} />
                                            <span>Editar</span>
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    {esBorrador ? (
                                        /* Borrador no enviado: Botón secundario discreto de consulta */
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 shadow-2xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                            title="Consultar avance de redacción docente (lectura previa a envío formal)"
                                        >
                                            <Eye size={13} className="text-slate-400 dark:text-zinc-500" />
                                            <span>Consultar avance</span>
                                        </button>
                                    ) : esEnRevision ? (
                                        /* Enviado a revisión técnica: Botón primario de dictamen */
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="bg-[#0070f3] hover:bg-[#005bb5] text-white shadow-xs inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                            title="Realizar revisión técnica curricular y dictamen"
                                        >
                                            <Eye size={13} />
                                            <span>Revisión Técnica</span>
                                        </button>
                                    ) : (
                                        /* Con aval o legalizado: Botón de consulta de expediente */
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                                            title="Ver expediente curricular avalado"
                                        >
                                            <CheckCircle2 size={13} />
                                            <span>Ver expediente</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── MODO LISTA TABULAR ── */
                <div className="space-y-2.5">
                    {filteredPeas.map(pea => {
                        const descriptor = getPeaStatusDescriptor(pea.estado);
                        const esBorrador = isPeaBorrador(pea.estado);
                        const esEnRevision = isPeaEnRevision(pea.estado);
                        const esAutorOAdmin = puedeEditarDocumento(pea);

                        return (
                            <div
                                key={pea.uuid}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAbrirPea(pea.uuid)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleAbrirPea(pea.uuid);
                                    }
                                }}
                                className="group bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900/60 hover:border-[#0070f3] dark:hover:border-blue-500 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
                            >
                                {/* Bloque de Asignatura y Carrera */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors tracking-tight truncate">
                                            {pea.nombre_asignatura}
                                        </h3>
                                        {pea.codigo_asignatura && (
                                            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                                                {pea.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md border ${descriptor.borderClass} ${descriptor.badgeBgClass} ${descriptor.textClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass}`} />
                                            {descriptor.label}
                                        </span>
                                        {pea.total_observaciones_pendientes > 0 && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                {pea.total_observaciones_pendientes} Obs. Pendiente{pea.total_observaciones_pendientes > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
                                            <GraduationCap size={13} className="text-[#0070f3]" />
                                            {pea.nombre_carrera}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <UserCheck size={13} />
                                            {pea.nombre_docente_elaborador || 'Docente Responsable'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-mono">
                                            <Clock size={13} />
                                            {pea.total_horas_asignatura}h ({pea.creditos} Créditos)
                                        </span>
                                        {pea.semestre_nivel && (
                                            <>
                                                <span>•</span>
                                                <span>{pea.semestre_nivel}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {esAutorOAdmin && (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirEditor(pea.uuid);
                                            }}
                                            className="h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-md font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                            title="Editar contenido curricular del PEA"
                                        >
                                            <ExternalLink size={12} />
                                            <span>Editar</span>
                                        </button>
                                    )}

                                    {esBorrador ? (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3 flex items-center gap-1.5 text-xs rounded-md font-medium text-slate-700 dark:text-zinc-300 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
                                            title="Consultar avance de redacción docente (lectura previa a envío formal)"
                                        >
                                            <Eye size={13} className="text-slate-400 dark:text-zinc-500" />
                                            <span>Consultar avance</span>
                                        </button>
                                    ) : esEnRevision ? (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3.5 flex items-center gap-1.5 text-xs rounded-md font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer shadow-xs"
                                            title="Realizar revisión técnica curricular"
                                        >
                                            <Eye size={13} />
                                            <span>Revisión Técnica</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3 flex items-center gap-1.5 text-xs rounded-md font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs"
                                            title="Ver expediente curricular avalado"
                                        >
                                            <CheckCircle2 size={13} />
                                            <span>Ver expediente</span>
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

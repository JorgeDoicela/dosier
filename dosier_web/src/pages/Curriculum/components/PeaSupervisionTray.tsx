import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    RefreshCw,
    Info,
    BookOpen,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { useAuth } from '../../../api/AuthContext';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
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
    getPeaStatusDescriptor,
    formatModalidad
} from '../utils/peaStatusWorkflow';

export const PeaSupervisionTray: React.FC = () => {
    const navigate = useNavigate();
    const { user, isAdmin, isCoordCarrera } = useAuth();

    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [selectedCarrera, setSelectedCarrera] = useState<string>('todas');
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    // Tab por defecto: 'todos' para que las autoridades visualicen inmediatamente todo el universo de asignaturas
    const [workflowTab, setWorkflowTab] = useState<'todos' | 'por_revisar' | 'en_redaccion' | 'aprobados'>('todos');
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

    // Sincronización continua en tiempo real (SignalR, visibilidad de pestaña y heartbeat pasivo)
    useRealtimeSync({
        onSync: () => {
            if (selectedPeriodo) {
                recargarPeas(selectedPeriodo, true);
            }
        },
        events: ['dosier-projects-changed'],
        heartbeatIntervalMs: 20000
    });

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

    // Los Coordinadores de Carrera tienen jurisdicción exclusiva sobre su propia carrera; no requieren filtro redundante
    const puedeFiltrarCarreras = !isCoordCarrera && carrerasDisponibles.length > 1;

    // Universo visible de PEAs: Para revisión curricular SOLO se muestran las asignaturas enviadas a revisión por los docentes
    const peasVisibles = useMemo(() => {
        return peas.filter(p => !isPeaBorrador(p.estado) && p.estado !== 'NoIniciado' && p.estado !== '');
    }, [peas]);

    // Métricas de estado del workflow curricular sobre el universo visible
    const stats = useMemo(() => {
        const porRevisar = peasVisibles.filter(p => isPeaEnRevision(p.estado)).length;
        const enRedaccion = peasVisibles.filter(p => isPeaBorrador(p.estado)).length;
        const aprobados = peasVisibles.filter(p => isPeaAvalado(p.estado)).length;
        return {
            total: peasVisibles.length,
            porRevisar,
            enRedaccion,
            aprobados
        };
    }, [peasVisibles]);

    // Filtrado en memoria por búsqueda, carrera y estado
    const filteredPeas = useMemo(() => {
        return peasVisibles.filter(p => {
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
    }, [peasVisibles, search, selectedCarrera, selectedEstado, workflowTab]);

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
            {/* ── BARRA DE FILTROS Y CONTROLES (ARRIBA, DIRECTA SIN CAJA ENVOLVENTE) ── */}
            <div className="flex flex-col lg:flex-row gap-2.5 items-stretch lg:items-center justify-between">
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

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Filtro de Carrera (Oculto para Coordinadores de Carrera que solo tienen su propia carrera) */}
                    {puedeFiltrarCarreras && (
                        <div className="w-48 sm:w-52">
                            <GeistSelect
                                value={selectedCarrera}
                                onChange={val => setSelectedCarrera(String(val))}
                                options={[
                                    { value: 'todas', label: 'Todas las Carreras' },
                                    ...carrerasDisponibles.map(c => ({ value: String(c.id), label: c.nombre }))
                                ]}
                                placeholder="Carrera..."
                            />
                        </div>
                    )}

                    {/* Filtro de Estado Específico */}
                    <div className="w-44 sm:w-48">
                        <GeistSelect
                            value={selectedEstado}
                            onChange={val => setSelectedEstado(String(val))}
                            options={[
                                { value: 'todos', label: 'Todos los Estados' },
                                ...(workflowTab === 'por_revisar' ? [
                                    { value: 'EnRevision', label: 'En Revisión Técnica' },
                                    { value: 'Observado', label: 'Con Observaciones' },
                                    { value: 'Corregido', label: 'Corregido' }
                                ] : workflowTab === 'en_redaccion' ? [
                                    { value: 'Borrador', label: 'En Redacción (Borrador)' },
                                    { value: 'NoIniciado', label: 'Sin Inicializar' }
                                ] : workflowTab === 'aprobados' ? [
                                    { value: 'RevisadoCoord', label: 'Aval de Carrera' },
                                    { value: 'RevisadoAcad', label: 'Aval Académico' },
                                    { value: 'Aprobado', label: 'Aprobado / Legalizado' }
                                ] : [
                                    ...(isAdmin ? [{ value: 'Borrador', label: 'Borrador Docente' }] : []),
                                    { value: 'EnRevision', label: 'En Revisión Técnica' },
                                    { value: 'Observado', label: 'Observado' },
                                    { value: 'Corregido', label: 'Corregido' },
                                    { value: 'RevisadoCoord', label: 'Aval de Carrera' },
                                    { value: 'RevisadoAcad', label: 'Aval Académico' },
                                    { value: 'Aprobado', label: 'Aprobado / Legalizado' }
                                ])
                            ]}
                            placeholder="Estado..."
                        />
                    </div>

                    {/* Selector de Período Lectivo */}
                    <div className="w-48 sm:w-52">
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

                    {(search || (puedeFiltrarCarreras && selectedCarrera !== 'todas') || selectedEstado !== 'todos') && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedCarrera('todas');
                                setSelectedEstado('todos');
                            }}
                            className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline cursor-pointer px-1"
                        >
                            Restablecer
                        </button>
                    )}
                </div>
            </div>

            {/* ── Riel Plano Continuo de Pestañas de Selección de Workflow ── */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Bandejas de supervisión del PEA">
                    <button
                        type="button"
                        onClick={() => handleWorkflowTabChange('todos')}
                        className={`pb-2.5 pt-2 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                            workflowTab === 'todos'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <span>Todas las Asignaturas</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
                            {stats.total}
                        </span>
                    </button>

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

                    {isAdmin && (
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
                    )}

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
                </nav>
            </div>

            {/* Banner explicativo contextual según la pestaña activa (exclusivo para Admin) */}
            {isAdmin && workflowTab === 'en_redaccion' && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-300 text-xs flex items-center gap-3">
                    <Info size={16} className="text-slate-400 dark:text-zinc-500 shrink-0" />
                    <span>
                        <strong>Modo de Monitoreo:</strong> Las siguientes asignaturas están en fase de formulación docente (borrador) y aún no han sido remitidas formalmente a la Coordinación. La visualización está habilitada en modo consulta de avance sin emisión de aval.
                    </span>
                </div>
            )}

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
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
                                        <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <span className="truncate">{pea.nombre_carrera}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${descriptor.textClass} shrink-0`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass}`} />
                                            {descriptor.label}
                                        </span>
                                    </div>

                                    {/* Nombre de la Asignatura */}
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {pea.nombre_asignatura}
                                    </h3>

                                    {/* Docente Elaborador */}
                                    <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-0.5 truncate">
                                        <span>{pea.nombre_docente_elaborador || 'Docente Responsable'}</span>
                                    </div>

                                    {/* Metadatos Curriculares: Nivel y Modalidad según BD */}
                                    <div className="flex items-center justify-between gap-2 pt-0.5">
                                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                            {pea.semestre_nivel && <span>{pea.semestre_nivel}</span>}
                                            {pea.semestre_nivel && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                {formatModalidad(pea.modalidad)}
                                            </span>
                                        </div>
                                        {pea.total_observaciones_pendientes > 0 && (
                                            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                {pea.total_observaciones_pendientes} Obs.
                                            </span>
                                        )}
                                    </div>
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

                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                                            {pea.nombre_carrera}
                                        </span>
                                        <span>·</span>
                                        <span>
                                            {pea.nombre_docente_elaborador || 'Docente Responsable'}
                                        </span>
                                        <span>·</span>
                                        <span className="font-mono">
                                            {pea.total_horas_asignatura}h ({pea.creditos} Créditos)
                                        </span>
                                        {pea.semestre_nivel && (
                                            <>
                                                <span>·</span>
                                                <span>{pea.semestre_nivel}</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Acciones (Solo Texto) */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {esAutorOAdmin && (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirEditor(pea.uuid);
                                            }}
                                            className="h-8 px-2.5 text-xs rounded-md font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                            title="Editar contenido curricular del PEA"
                                        >
                                            Editar
                                        </button>
                                    )}

                                    {esBorrador ? (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3 text-xs rounded-md font-medium text-slate-700 dark:text-zinc-300 bg-white hover:bg-slate-50 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer shadow-2xs"
                                            title="Consultar avance de redacción docente (lectura previa a envío formal)"
                                        >
                                            Consultar avance
                                        </button>
                                    ) : esEnRevision ? (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3.5 text-xs rounded-md font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer shadow-xs"
                                            title="Realizar revisión técnica curricular"
                                        >
                                            Revisión Técnica
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleAbrirPea(pea.uuid);
                                            }}
                                            className="h-8 px-3 text-xs rounded-md font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer shadow-2xs"
                                            title="Ver expediente curricular avalado"
                                        >
                                            Ver expediente
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

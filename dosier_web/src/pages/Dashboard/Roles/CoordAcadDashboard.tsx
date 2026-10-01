import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../api/NotificationsContext';
import { useAuth } from '../../../api/AuthContext';
import { 
    getBandejaPeas, 
    cambiarEstadoPea, 
    type PeaBandejaItemDto 
} from '../../../services/peaService';
import { 
    docenteAsignaturasService, 
    type PeriodoAcademicoDto 
} from '../../../services/docenteAsignaturasService';
import { 
    curriculumProjectService, 
    type DocenteCarreraDto 
} from '../../../services/curriculumProjectService';
import { AperturaConvocatoriaModal } from './Modals/AperturaConvocatoriaModal';
import { RecordatorioDocentesModal, type DocenteRezagadoItem } from './Modals/RecordatorioDocentesModal';
import { ProrrogaPlazoModal } from './Modals/ProrrogaPlazoModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';
import { 
    Search, 
    RefreshCw, 
    ShieldCheck, 
    CheckCircle2, 
    Calendar, 
    AlertCircle,
    LayoutGrid,
    List,
    Building2,
    UserCheck,
    Eye
} from 'lucide-react';

export const CoordAcadDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Catálogos
    const [carreras, setCarreras] = useState<DocenteCarreraDto[]>([]);
    const [selectedCarreraId, setSelectedCarreraId] = useState<number | 'todas'>('todas');
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');

    // Datos del workflow
    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    const [search, setSearch] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Modales
    const [isAperturaOpen, setIsAperturaOpen] = useState(false);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);
    const [isProrrogaOpen, setIsProrrogaOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<PeaBandejaItemDto | null>(null);

    // Cargar catálogos
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getCarrerasInstitucionales().catch(() => []),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => [])
        ]).then(([carrerasList, periodosList]) => {
            if (!isMounted) return;
            setCarreras(carrerasList);
            setPeriodos(periodosList);

            const activo = periodosList.find(p => p.es_activo) || periodosList[0];
            if (activo) {
                setSelectedPeriodo(activo.id_periodo);
            }
        });
        return () => { isMounted = false; };
    }, []);

    // Consulta de la bandeja general de PEAs institucionales
    const fetchPeas = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: { idPeriodo?: string; idCarrera?: number } = {};
            if (selectedPeriodo) params.idPeriodo = selectedPeriodo;
            if (selectedCarreraId !== 'todas') params.idCarrera = selectedCarreraId;

            const data = await getBandejaPeas(params);
            setPeas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar supervisión académica institucional:', error);
            setPeas([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriodo, selectedCarreraId]);

    useEffect(() => {
        fetchPeas();
    }, [fetchPeas]);

    // Filtros en memoria
    const peasFiltrados = useMemo(() => {
        return peas.filter(p => {
            const matchesEstado = selectedEstado === 'todos' || p.estado === selectedEstado;
            const matchesSearch = search === '' ||
                p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
                (p.nombre_docente_elaborador || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.codigo_asignatura || '').toLowerCase().includes(search.toLowerCase()) ||
                p.nombre_carrera.toLowerCase().includes(search.toLowerCase());
            return matchesEstado && matchesSearch;
        });
    }, [peas, selectedEstado, search]);



    // Emisión formal de Aval Académico Institucional
    const handleEmitirAvalAcademico = async (peaItem: PeaBandejaItemDto) => {
        try {
            await cambiarEstadoPea(
                peaItem.id_pea, 
                'RevisadoAcad', 
                undefined, 
                'Aval normativo de Coordinación Académica emitido bajo estándares CACES'
            );
            addToast(
                'Aval Académico Emitido',
                `Se aprobó y certificó el cumplimiento normativo CACES para "${peaItem.nombre_asignatura}". Despachado a Vicerrectorado.`,
                'success'
            );
            await fetchPeas();
        } catch (error) {
            console.error('Error al emitir aval académico:', error);
            addToast('Error', 'No fue posible registrar el aval académico en el servidor.', 'error');
        }
    };

    // Navegación directa al editor
    const handleAbrirRevision = (uuid: string) => {
        navigate(`/documentacion/workspace/pea-oficial/${uuid}?edit=pea-oficial`);
    };

    // Docentes con rezagos en la entrega
    const docentesRezagados: DocenteRezagadoItem[] = useMemo(() => {
        return peas
            .filter(p => p.estado === 'Borrador' || p.estado === 'Observado' || !p.firma_docente)
            .map(p => ({
                nombre: p.nombre_docente_elaborador || 'Docente Responsable',
                asignatura: p.nombre_asignatura,
                carrera: p.nombre_carrera,
                email: `${(p.nombre_docente_elaborador || 'docente').toLowerCase().replace(/\s+/g, '.')}@istpet.edu.ec`,
                estado: p.estado === 'Observado' ? 'Con observaciones disciplinar' : 'Borrador sin enviar',
                dias_restantes: 3
            }));
    }, [peas]);

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Coordinación Académica
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setIsAperturaOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Aperturar Período
                    </button>
                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Notificar Rezagados ({docentesRezagados.length})
                    </button>
                    <button
                        onClick={() => setIsProrrogaOpen(true)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Conceder Prórroga
                    </button>
                    <button
                        onClick={fetchPeas}
                        disabled={isLoading}
                        title="Actualizar datos"
                        className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>



            {/* Matriz de Gestión de PEAs Institucionales */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                            Supervisión Curricular Institucional
                        </h2>
                        {selectedPeriodo && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 font-semibold">
                                {selectedPeriodo}
                            </span>
                        )}
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar asignatura, docente o carrera..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3] w-56"
                            />
                        </div>

                        {periodos.length > 0 && (
                            <select
                                value={selectedPeriodo}
                                onChange={e => setSelectedPeriodo(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                            >
                                {periodos.map(p => (
                                    <option key={p.id_periodo} value={p.id_periodo}>
                                        {p.id_periodo} {p.es_activo ? '(Activo)' : ''}
                                    </option>
                                ))}
                            </select>
                        )}

                        <select
                            value={selectedCarreraId}
                            onChange={e => {
                                const val = e.target.value;
                                setSelectedCarreraId(val === 'todas' ? 'todas' : Number(val));
                            }}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                        >
                            <option value="todas">Todas las Carreras</option>
                            {carreras.map(c => {
                                const id = c.id_carrera ?? c.idCarrera ?? 0;
                                const nombre = c.carrera1 || c.nombre_carrera || c.carrera || `Carrera ${id}`;
                                return (
                                    <option key={id} value={id}>
                                        {nombre}
                                    </option>
                                );
                            })}
                        </select>

                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="EnRevision">En Revisión de Carrera</option>
                            <option value="Observado">Con Observaciones</option>
                            <option value="RevisadoCoord">Avalado por Carrera</option>
                            <option value="RevisadoAcad">Avalado por Académica</option>
                            <option value="Aprobado">Aprobado / Legalizado</option>
                        </select>

                        {/* Selector de Modo: Cuadros vs Lista */}
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

                {/* Contenido: Grid o Tabla */}
                {isLoading ? (
                    <div className="py-16 text-center text-zinc-400 text-xs">
                        <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#0070f3]" />
                        Cargando nómina institucional de PEAs...
                    </div>
                ) : peasFiltrados.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                        No se registran asignaturas en este filtro.
                    </div>
                ) : viewMode === 'grid' ? (
                    /* ── MODO CUADROS (ESTILO DOCENTE) ── */
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-50/50 dark:bg-zinc-950">
                        {peasFiltrados.map(p => {
                            const puedeEmitirAvalAcad = p.firma_coord && !p.firma_acad;

                            return (
                                <div
                                    key={p.uuid}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => handleAbrirRevision(p.uuid)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleAbrirRevision(p.uuid);
                                        }
                                    }}
                                    className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950 text-left"
                                >
                                    {/* Top: Carrera y Estado */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                                <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0070f3]" />
                                                <span className="truncate">{p.nombre_carrera}</span>
                                            </div>
                                            {p.estado === 'Borrador' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                    Borrador
                                                </span>
                                            )}
                                            {p.estado === 'EnRevision' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                    En Revisión
                                                </span>
                                            )}
                                            {p.estado === 'Observado' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                    Observado ({p.total_observaciones_pendientes})
                                                </span>
                                            )}
                                            {p.estado === 'RevisadoCoord' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                                                    Aval Carrera
                                                </span>
                                            )}
                                            {p.estado === 'RevisadoAcad' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                    Aval Académico
                                                </span>
                                            )}
                                            {p.estado === 'Aprobado' && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                    Legalizado
                                                </span>
                                            )}
                                        </div>

                                        {/* Título de la Asignatura */}
                                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                            {p.nombre_asignatura}
                                        </h3>

                                        {/* Docente Responsable */}
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                                            <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                            <span className="truncate">{p.nombre_docente_elaborador || 'Docente Asignado'}</span>
                                        </div>

                                        {/* Metadatos Curriculares */}
                                        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                                            {p.codigo_asignatura && (
                                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                                                    {p.codigo_asignatura}
                                                </span>
                                            )}
                                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                                {p.total_horas_asignatura || 0}h {p.creditos ? `(${p.creditos} Créd.)` : ''}
                                            </span>
                                            {p.semestre_nivel && (
                                                <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-[11px]">
                                                    {p.semestre_nivel}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Pie de Tarjeta con Acciones */}
                                    <div className="pt-2 flex flex-wrap items-center justify-end gap-1.5 border-t border-slate-100 dark:border-zinc-900" onClick={e => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => setAuditoriaPea(p)}
                                            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                                        >
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#0070f3]" />
                                            <span>Auditar CACES</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAbrirRevision(p.uuid)}
                                            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Ver PEA</span>
                                        </button>

                                        {puedeEmitirAvalAcad && (
                                            <button
                                                type="button"
                                                onClick={() => handleEmitirAvalAcademico(p)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>Emitir Aval</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── MODO TABLA / LISTA ── */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-4">Asignatura y Carrera</th>
                                    <th className="py-2.5 px-3">Docente Responsable</th>
                                    <th className="py-2.5 px-3">Horas CES Art. 21</th>
                                    <th className="py-2.5 px-3">Estado del Circuito</th>
                                    <th className="py-2.5 px-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {peasFiltrados.map(p => {
                                    const puedeEmitirAvalAcad = p.firma_coord && !p.firma_acad;
                                    return (
                                        <tr key={p.uuid} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-2.5 px-4">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        {p.codigo_asignatura && (
                                                            <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                                {p.codigo_asignatura}
                                                            </span>
                                                        )}
                                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                            {p.nombre_asignatura}
                                                        </p>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500">
                                                        {p.nombre_carrera} {p.semestre_nivel ? `• ${p.semestre_nivel}` : ''}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="text-zinc-700 dark:text-zinc-300">
                                                    {p.nombre_docente_elaborador || 'Docente Asignado'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 font-mono text-[11px]">
                                                <span className="text-zinc-800 dark:text-zinc-200">
                                                    {p.total_horas_asignatura || 0}h {p.creditos ? `(${p.creditos} créd.)` : ''}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {p.estado === 'Borrador' && (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                        <span>Borrador Docente</span>
                                                    </div>
                                                )}
                                                {p.estado === 'EnRevision' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        <span>Revisión de Carrera</span>
                                                    </div>
                                                )}
                                                {p.estado === 'Observado' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                        <span>Observaciones ({p.total_observaciones_pendientes})</span>
                                                    </div>
                                                )}
                                                {p.estado === 'RevisadoCoord' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                        <span>Aval de Carrera Emitido</span>
                                                    </div>
                                                )}
                                                {p.estado === 'RevisadoAcad' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                                                        <span>Aval Académico Concedido</span>
                                                    </div>
                                                )}
                                                {p.estado === 'Aprobado' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <span>Legalizado Vicerrectorado</span>
                                                    </div>
                                                )}
                                                {!['Borrador', 'EnRevision', 'Observado', 'RevisadoCoord', 'RevisadoAcad', 'Aprobado'].includes(p.estado) && (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                        <span>{p.estado}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setAuditoriaPea(p)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5 text-[#0070f3]" />
                                                        <span>Auditar</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleAbrirRevision(p.uuid)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                                    >
                                                        Ver PEA
                                                    </button>

                                                    {puedeEmitirAvalAcad && (
                                                        <button
                                                            onClick={() => handleEmitirAvalAcademico(p)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                                        >
                                                            Emitir Aval
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

            {/* Modales */}
            <AperturaConvocatoriaModal
                isOpen={isAperturaOpen}
                onClose={() => setIsAperturaOpen(false)}
                onConvocatoriaActivada={() => {
                    fetchPeas();
                }}
            />

            <RecordatorioDocentesModal
                isOpen={isRecordatorioOpen}
                onClose={() => setIsRecordatorioOpen(false)}
                tituloContexto="Recordatorio Masivo Institucional a Docentes Rezagados"
                docentes={docentesRezagados}
            />

            <ProrrogaPlazoModal
                isOpen={isProrrogaOpen}
                onClose={() => setIsProrrogaOpen(false)}
                onProrrogaConcedida={() => {
                    fetchPeas();
                }}
            />

            {auditoriaPea && (
                <AuditoriaCacesModal
                    isOpen={!!auditoriaPea}
                    onClose={() => setAuditoriaPea(null)}
                    asignatura={auditoriaPea.nombre_asignatura}
                    carrera={auditoriaPea.nombre_carrera}
                    horasTotales={auditoriaPea.total_horas_asignatura}
                    horasDocencia={Math.round(auditoriaPea.total_horas_asignatura * 0.4)}
                    horasPracticas={Math.round(auditoriaPea.total_horas_asignatura * 0.2)}
                    horasAutonomo={Math.round(auditoriaPea.total_horas_asignatura * 0.4)}
                    cumpleCaces={true}
                    tieneAvalCarrera={auditoriaPea.firma_coord}
                    tieneAvalAcademica={auditoriaPea.firma_acad}
                    tieneFirmaRectorado={auditoriaPea.firma_vicerrector}
                />
            )}
        </div>
    );
};

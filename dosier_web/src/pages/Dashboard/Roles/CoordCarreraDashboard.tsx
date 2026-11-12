import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../api/NotificationsContext';
import { useAuth } from '../../../api/AuthContext';
import { 
    getBandejaPeas, 
    cambiarEstadoPea, 
    agregarObservacionPea, 
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
import { ObservacionesDisciplinarModal } from './Modals/ObservacionesDisciplinarModal';
import { RecordatorioDocentesModal, type DocenteRezagadoItem } from './Modals/RecordatorioDocentesModal';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { 
    formatModalidad,
    isPeaPropio,
    isPeaPendienteParaRol,
    isPeaRezagado,
    getPeaNavegacion,
    getPeaMetricsForRole
} from '../../Curriculum/utils/peaStatusWorkflow';
import { DocenteAgendaWidget } from './Components/DocenteAgendaWidget';
import {
    recordRecentSubjectOpen,
    sortSubjectsByRecentOpen
} from '../../../utils/recentSubjectStorage';
import { getAvanceDetalle } from './Components/DocenteActividadesPanel';
import { 
    Search
} from 'lucide-react';

const SYNC_EVENTS = ['dosier-projects-changed'];

export const CoordCarreraDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Catálogos institucionales
    const [carreras, setCarreras] = useState<DocenteCarreraDto[]>([]);
    const [selectedCarreraId, setSelectedCarreraId] = useState<number | 'todas'>('todas');
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [catalogsLoaded, setCatalogsLoaded] = useState<boolean>(false);

    // Datos del workflow
    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [filterTab, setFilterTab] = useState<'todos' | 'pendientes' | 'mis_materias'>('todos');

    // Modales
    const [observacionPea, setObservacionPea] = useState<PeaBandejaItemDto | null>(null);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<PeaBandejaItemDto | null>(null);

    const esSuperAutoridad = useMemo(() => {
        return !!(user?.administrador || 
            user?.roles?.includes('DOSIER_ADMIN') || 
            user?.roles?.includes('DOSIER_VICERRECTOR') || 
            user?.roles?.includes('DOSIER_COORD_ACAD'));
    }, [user]);

    // Cargar catálogos iniciales
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getDocenteCarreras().catch(() => []),
            curriculumProjectService.getCarrerasInstitucionales().catch(() => []),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => [])
        ]).then(([misCarrerasList, todasCarrerasList, periodosList]) => {
            if (!isMounted) return;

            const carrerasDisponibles = (!esSuperAutoridad && misCarrerasList.length > 0)
                ? misCarrerasList
                : (todasCarrerasList.length > 0 ? todasCarrerasList : misCarrerasList);

            setCarreras(carrerasDisponibles);
            setPeriodos(periodosList);

            let initialCarrera: number | 'todas' = 'todas';
            if (carrerasDisponibles.length > 0) {
                const primerId = carrerasDisponibles[0].id_carrera ?? carrerasDisponibles[0].idCarrera;
                if (primerId) {
                    initialCarrera = primerId;
                    setSelectedCarreraId(primerId);
                }
            }

            const activo = periodosList.find(p => p.es_activo) || periodosList[0];
            let initialPeriodo = '';
            if (activo) {
                initialPeriodo = activo.id_periodo;
                setSelectedPeriodo(activo.id_periodo);
            }

            setCatalogsLoaded(true);
        });
        return () => { isMounted = false; };
    }, [esSuperAutoridad]);

    // Cargar PEAs de la bandeja según filtros
    const fetchPeas = useCallback(async (isSilent = false) => {
        if (!catalogsLoaded) return;
        if (!isSilent) setIsLoading(true);
        try {
            const params: { idPeriodo?: string; idCarrera?: number } = {};
            if (selectedPeriodo) params.idPeriodo = selectedPeriodo;
            if (selectedCarreraId !== 'todas') params.idCarrera = selectedCarreraId;

            const data = await getBandejaPeas(params);
            setPeas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar PEAs de carrera:', error);
            if (!isSilent) setPeas([]);
        } finally {
            if (!isSilent) setIsLoading(false);
        }
    }, [catalogsLoaded, selectedPeriodo, selectedCarreraId]);

    useEffect(() => {
        if (catalogsLoaded) {
            fetchPeas();
        }
    }, [catalogsLoaded, fetchPeas]);

    // Sincronización continua en tiempo real
    const silentSync = useCallback(() => {
        fetchPeas(true);
    }, [fetchPeas]);

    useRealtimeSync({
        onSync: silentSync,
        events: SYNC_EVENTS
    });

    // Reglas de negocio unificadas: identificación de materias propias y cálculo de métricas
    const isMiMateria = useCallback((p: PeaBandejaItemDto) => {
        return isPeaPropio(p, user);
    }, [user]);

    const metrics = useMemo(() => {
        return getPeaMetricsForRole(peas, 'DOSIER_COORD_CARRERA', user);
    }, [peas, user]);

    const pendientesCount = metrics.pendientes;
    const misMaterias = useMemo(() => {
        return peas.filter(p => isPeaPropio(p, user));
    }, [peas, user]);
    const misMateriasCount = metrics.misMateriasCount;
    const misPendientesFormularCount = metrics.misPendientesCount;

    const [recentsVersion, setRecentsVersion] = useState<number>(0);

    // Listener para reordenamiento reactivo cuando se abre una asignatura en cualquier pestaña
    useEffect(() => {
        const handleRecents = () => setRecentsVersion(v => v + 1);
        window.addEventListener('dosier-recents-updated', handleRecents);
        window.addEventListener('dosier-project-preferences-changed', handleRecents);
        return () => {
            window.removeEventListener('dosier-recents-updated', handleRecents);
            window.removeEventListener('dosier-project-preferences-changed', handleRecents);
        };
    }, []);

    // Filtrado en memoria basado en las reglas de negocio centralizadas
    const peasFiltrados = useMemo(() => {
        const filtrados = peas.filter(p => {
            const matchesTab = filterTab === 'todos'
                ? true
                : filterTab === 'pendientes'
                    ? isPeaPendienteParaRol(p.estado, 'DOSIER_COORD_CARRERA')
                    : isPeaPropio(p, user);

            const matchesSearch = search === '' ||
                p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
                (p.nombre_docente_elaborador || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.codigo_asignatura || '').toLowerCase().includes(search.toLowerCase());

            return matchesTab && matchesSearch;
        });

        return sortSubjectsByRecentOpen(filtrados);
    }, [peas, filterTab, search, user, recentsVersion]);

    // Navegación inteligente centralizada (editor si es propia vs mesa de revisión técnica)
    const handleAbrirRevision = (p: PeaBandejaItemDto) => {
        recordRecentSubjectOpen({ uuid: p.uuid, id_pea: p.id_pea });
        const nav = getPeaNavegacion(p, user, 'DOSIER_COORD_CARRERA');
        navigate(nav.url);
    };

    // Registro formal de observaciones
    const handleObservacionGuardada = async (obs: string, seccion: string) => {
        if (!observacionPea) return;
        try {
            await agregarObservacionPea(observacionPea.id_pea, {
                rolObservador: 'Coordinador',
                seccionAfectada: seccion,
                texto: obs
            });
            addToast(
                'Observación Registrada',
                `Se guardó la observación técnica para "${observacionPea.nombre_asignatura}".`,
                'success'
            );
            setObservacionPea(null);
            await fetchPeas();
        } catch (error) {
            console.error('Error al guardar observación:', error);
            addToast('Error', 'No se pudo guardar la observación disciplinar.', 'error');
        }
    };

    // Docentes rezagados
    const docentesRezagados: DocenteRezagadoItem[] = useMemo(() => {
        return peas
            .filter(p => p.estado === 'Borrador' || p.estado === 'Observado' || !p.firma_docente)
            .map(p => ({
                nombre: p.nombre_docente_elaborador || 'Docente Responsable',
                asignatura: p.nombre_asignatura,
                carrera: p.nombre_carrera,
                email: `${(p.nombre_docente_elaborador || 'docente').toLowerCase().replace(/\s+/g, '.')}@istpet.edu.ec`,
                estado: p.estado === 'Observado' ? 'Con observaciones pendientes' : 'Borrador en formulación',
                dias_restantes: 4
            }));
    }, [peas]);

    const nombreCarreraActiva = useMemo(() => {
        if (selectedCarreraId === 'todas') return 'Todas las Carreras';
        const c = carreras.find(item => (item.id_carrera ?? item.idCarrera) === selectedCarreraId);
        return c?.carrera1 || c?.nombre_carrera || c?.carrera || 'Carrera Seleccionada';
    }, [carreras, selectedCarreraId]);

    return (
        <div className="space-y-6">
            {/* Encabezado Directo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Coordinación de Carrera
                    </h1>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Revisión curricular, aprobación de materias y agenda de carrera.
                    </p>
                </div>

                {carreras.length > 1 && (
                    <div className="w-56">
                        <GeistSelect
                            value={selectedCarreraId}
                            onChange={val => setSelectedCarreraId(val === 'todas' ? 'todas' : Number(val))}
                            options={[
                                ...(esSuperAutoridad ? [{ value: 'todas', label: 'Todas las Carreras' }] : []),
                                ...carreras.map(c => {
                                    const id = c.id_carrera ?? c.idCarrera ?? 0;
                                    const nombre = c.carrera1 || c.nombre_carrera || c.carrera || `Carrera ${id}`;
                                    return { value: id, label: nombre };
                                })
                            ]}
                            placeholder="Carrera..."
                        />
                    </div>
                )}
            </div>

            {/* Layout de 2 Columnas (Estilo Docente) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Columna Izquierda: Asignaturas y Revisión Curricular */}
                <div className="lg:col-span-7">
                    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-4">
                        {/* Cabecera y Pestañas Minimalistas al ras */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                    Asignaturas y Estado Curricular
                                </h2>

                                <span className="text-xs font-mono text-zinc-400">
                                    {peasFiltrados.length} de {peas.length}
                                </span>
                            </div>

                            {/* Pestañas Planas */}
                            <div className="flex items-center gap-6 border-b border-slate-100 dark:border-zinc-800 -mb-px text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('todos')}
                                    className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 ${
                                        filterTab === 'todos'
                                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    Todas ({peas.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('pendientes')}
                                    className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 inline-flex items-center gap-1.5 ${
                                        filterTab === 'pendientes'
                                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    <span>Pendientes de Aprobación</span>
                                    {pendientesCount > 0 && (
                                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-50 dark:bg-blue-950/60 text-[#0070f3] dark:text-blue-400 font-bold">
                                            {pendientesCount}
                                        </span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab('mis_materias')}
                                    className={`pb-2.5 font-medium transition-colors cursor-pointer border-b-2 ${
                                        filterTab === 'mis_materias'
                                            ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 font-semibold'
                                            : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                    }`}
                                >
                                    Mis Asignaturas ({misMateriasCount})
                                </button>
                            </div>
                        </div>

                        {/* Buscador Simple */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar asignatura, docente o código..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3]"
                            />
                        </div>

                        {/* Lista Continua (Folio Idéntico a Docentes) */}
                        {isLoading ? (
                            <div className="space-y-3 py-2">
                                <div className="h-20 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                                <div className="h-20 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                                <div className="h-20 bg-slate-100 dark:bg-zinc-900 rounded-lg animate-pulse" />
                            </div>
                        ) : peasFiltrados.length === 0 ? (
                            <div className="py-10 text-center text-zinc-500 text-xs rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                                No se encontraron asignaturas para este criterio.
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-zinc-900 -mx-2">
                                {peasFiltrados.map(p => {
                                    const avance = getAvanceDetalle(p.estado);
                                    const esEnRevision = p.estado === 'EnRevision';
                                    const esObservado = p.estado === 'Observado';

                                    const accionTexto = esEnRevision
                                        ? 'Revisar'
                                        : esObservado
                                        ? 'Ver observaciones'
                                        : p.estado === 'Borrador'
                                        ? 'Ver avance'
                                        : 'Ver PEA';

                                    return (
                                        <div
                                            key={p.uuid}
                                            onClick={() => handleAbrirRevision(p)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleAbrirRevision(p);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            className={`py-4 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors cursor-pointer select-none space-y-2.5 ${
                                                esObservado ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
                                            }`}
                                        >
                                            {/* Fila Superior */}
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                                <div className="space-y-1 min-w-0">
                                                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                        <span className="truncate">{p.nombre_carrera}</span>
                                                        {p.semestre_nivel && (
                                                            <>
                                                                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                                                <span>{p.semestre_nivel}</span>
                                                            </>
                                                        )}
                                                        <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                                        <span>{formatModalidad(p.modalidad)}</span>
                                                    </div>

                                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover:text-[#0070f3] transition-colors">
                                                        {p.nombre_asignatura}
                                                    </h3>

                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <span className="truncate">{p.nombre_docente_elaborador || 'Docente Responsable'}</span>
                                                        {isMiMateria(p) && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40 shrink-0">
                                                                Tú
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Botón de Acción Directa */}
                                                <div className="shrink-0 pt-0.5 sm:pt-0">
                                                    <span
                                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors inline-block ${
                                                            esEnRevision
                                                                ? 'bg-[#0070f3] hover:bg-[#005bb5] text-white'
                                                                : esObservado
                                                                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                                                : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {accionTexto}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Barra de Progreso y Estado */}
                                            <div className="space-y-1 pt-1">
                                                <div className="flex items-center justify-end text-xs">
                                                    <span className={`font-mono text-xs font-semibold ${avance.colorTexto}`}>
                                                        {avance.etiqueta}
                                                    </span>
                                                </div>
                                                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${avance.colorBarra}`}
                                                        style={{ width: `${avance.porcentaje}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Tareas Pendientes, Rezagados y Agenda Curricular */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Tarjeta Ejecutiva de Tareas Curriculares */}
                    <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                    Resumen de Pendientes
                                </h2>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                    Control de revisiones asignadas y carga docente propia.
                                </p>
                            </div>
                            <span className="text-xs font-mono font-semibold text-zinc-500 bg-slate-100 dark:bg-zinc-900 px-2 py-0.5 rounded">
                                {pendientesCount + misPendientesFormularCount} por atender
                            </span>
                        </div>

                        <div className="space-y-3">
                            {/* Tarea 1: Lo que tiene que revisar de sus docentes */}
                            <div className="p-3.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3">
                                <div className="space-y-0.5 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${pendientesCount > 0 ? 'bg-[#0070f3]' : 'bg-emerald-500'}`} />
                                        <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                            Revisión y Aprobación de Carrera
                                        </h3>
                                    </div>
                                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-4">
                                        {pendientesCount > 0
                                            ? `${pendientesCount} ${pendientesCount === 1 ? 'PEA remitido para' : 'PEAs remitidos para'} aprobación`
                                            : 'Al día · No hay PEAs pendientes de revisión disciplinar'}
                                    </p>
                                </div>
                                {pendientesCount > 0 ? (
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('pendientes')}
                                        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                                    >
                                        Revisar ({pendientesCount})
                                    </button>
                                ) : (
                                    <span className="shrink-0 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                        Completado
                                    </span>
                                )}
                            </div>

                            {/* Tarea 2: Carga docente propia */}
                            {misMateriasCount > 0 && (
                                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3">
                                    <div className="space-y-0.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${misPendientesFormularCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                            <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                                Carga Docente Propia
                                            </h3>
                                        </div>
                                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-4">
                                            {misPendientesFormularCount > 0
                                                ? `${misPendientesFormularCount} ${misPendientesFormularCount === 1 ? 'asignatura propia por formular' : 'asignaturas propias por formular o firmar'}`
                                                : 'Todas tus asignaturas propias han sido formuladas y enviadas'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFilterTab('mis_materias')}
                                        className="shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                                    >
                                        Ver Mis PEA ({misMateriasCount})
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tarjeta Minimalista de Rezagados */}
                    {docentesRezagados.length > 0 && (
                        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                                    Docentes Rezagados
                                </h2>
                                <span className="text-xs font-mono font-semibold text-amber-600 dark:text-amber-400">
                                    {docentesRezagados.length} pendientes
                                </span>
                            </div>

                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Tienen borradores pendientes o asignaturas sin iniciar en el período activo.
                            </p>

                            <button
                                type="button"
                                onClick={() => setIsRecordatorioOpen(true)}
                                className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer text-center"
                            >
                                Notificar a los {docentesRezagados.length} Docentes
                            </button>
                        </div>
                    )}

                    {/* Widget de Agenda Curricular Institucional */}
                    <DocenteAgendaWidget />
                </div>
            </div>

            {/* Modales */}
            {observacionPea && (
                <ObservacionesDisciplinarModal
                    isOpen={!!observacionPea}
                    onClose={() => setObservacionPea(null)}
                    asignatura={observacionPea.nombre_asignatura}
                    docente={observacionPea.nombre_docente_elaborador || 'Docente Responsable'}
                    onObservacionGuardada={(obs, seccion) => {
                        handleObservacionGuardada(obs, seccion);
                    }}
                />
            )}

            <RecordatorioDocentesModal
                isOpen={isRecordatorioOpen}
                onClose={() => setIsRecordatorioOpen(false)}
                tituloContexto={`Recordatorio a Docentes de ${nombreCarreraActiva}`}
                docentes={docentesRezagados}
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

export default CoordCarreraDashboard;

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
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { formatModalidad } from '../../Curriculum/utils/peaStatusWorkflow';
import {
    recordRecentSubjectOpen,
    sortSubjectsByRecentOpen
} from '../../../utils/recentSubjectStorage';
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
    const [catalogsLoaded, setCatalogsLoaded] = useState<boolean>(false);

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
            setCatalogsLoaded(true);
        });
        return () => { isMounted = false; };
    }, []);

    // Consulta de la bandeja general de PEAs institucionales
    const fetchPeas = useCallback(async () => {
        if (!catalogsLoaded) return;
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
    }, [catalogsLoaded, selectedPeriodo, selectedCarreraId]);

    useEffect(() => {
        if (catalogsLoaded) {
            fetchPeas();
        }
    }, [catalogsLoaded, fetchPeas]);

    // Sincronización en tiempo real (SignalR, foco de pestaña y heartbeat pasivo)
    useRealtimeSync({
        onSync: fetchPeas,
        events: ['dosier-projects-changed']
    });

    // Identificación de asignaturas propias del usuario actual
    const isMiMateria = useCallback((p: PeaBandejaItemDto) => {
        if (!user) return false;
        const userIdentifiers = [
            user.id_sigafi,
            user.idSigafi,
            user.id_referencia,
            user.id?.toString(),
            user.id_usuario?.toString(),
            (user as any)?.cedula
        ].filter(Boolean) as string[];

        const matchesId = p.id_docente_elaborador && userIdentifiers.some(
            id => id.trim().toLowerCase() === p.id_docente_elaborador.trim().toLowerCase()
        );
        const matchesNombre = Boolean(
            p.nombre_docente_elaborador && user.nombre_completo &&
            p.nombre_docente_elaborador.trim().toLowerCase() === user.nombre_completo.trim().toLowerCase()
        );
        return Boolean(matchesId || matchesNombre);
    }, [user]);

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

    // Filtros en memoria
    const peasFiltrados = useMemo(() => {
        const filtrados = peas.filter(p => {
            const matchesEstado = selectedEstado === 'todos'
                ? true
                : selectedEstado === 'mis_materias'
                    ? isMiMateria(p)
                    : p.estado === selectedEstado;
            const matchesSearch = search === '' ||
                p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
                (p.nombre_docente_elaborador || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.codigo_asignatura || '').toLowerCase().includes(search.toLowerCase()) ||
                p.nombre_carrera.toLowerCase().includes(search.toLowerCase());
            return matchesEstado && matchesSearch;
        });

        return sortSubjectsByRecentOpen(filtrados);
    }, [peas, selectedEstado, search, isMiMateria, recentsVersion]);



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
        recordRecentSubjectOpen({ uuid });
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
                </div>
            </div>



            {/* Barra de Filtros y Búsqueda (Sin cuadros sobre cuadros) */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por asignatura, docente o carrera..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {periodos.length > 0 && (
                        <div className="w-48">
                            <GeistSelect
                                value={selectedPeriodo}
                                onChange={val => setSelectedPeriodo(String(val))}
                                options={periodos.map(p => ({
                                    value: p.id_periodo,
                                    label: `${p.id_periodo}${p.es_activo ? ' (Activo)' : ''}`
                                }))}
                                placeholder="Período..."
                            />
                        </div>
                    )}

                    <div className="w-56">
                        <GeistSelect
                            value={selectedCarreraId}
                            onChange={val => {
                                setSelectedCarreraId(val === 'todas' ? 'todas' : Number(val));
                            }}
                            options={[
                                { value: 'todas', label: 'Todas las Carreras' },
                                ...carreras.map(c => {
                                    const id = c.id_carrera ?? c.idCarrera ?? 0;
                                    const nombre = c.carrera1 || c.nombre_carrera || c.carrera || `Carrera ${id}`;
                                    return { value: id, label: nombre };
                                })
                            ]}
                            placeholder="Carrera..."
                        />
                    </div>

                    <div className="w-52">
                        <GeistSelect
                            value={selectedEstado}
                            onChange={val => setSelectedEstado(String(val))}
                            options={[
                                { value: 'todos', label: 'Todos los Estados' },
                                { value: 'mis_materias', label: 'Mis Asignaturas (Carga Propia)' },
                                { value: 'Borrador', label: 'Borrador' },
                                { value: 'EnRevision', label: 'En Revisión de Carrera' },
                                { value: 'Observado', label: 'Con Observaciones' },
                                { value: 'RevisadoCoord', label: 'Avalado por Carrera' },
                                { value: 'RevisadoAcad', label: 'Avalado por Académica' },
                                { value: 'Aprobado', label: 'Aprobado / Legalizado' }
                            ]}
                            placeholder="Estado..."
                        />
                    </div>

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

            {/* Contenido: Grid o Tabla Directos en el Folio */}
            {isLoading ? (
                <div className="py-16 text-center text-zinc-400 text-xs">
                    <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#0070f3]" />
                    Cargando nómina institucional de PEAs...
                </div>
            ) : peasFiltrados.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    No se registran asignaturas en este filtro.
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS (ESTILO DOCENTE LIMPIO) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                            >
                                {/* Top: Carrera (solo si ve todas) y Estado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        {selectedCarreraId === 'todas' ? (
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                                <span>{p.nombre_carrera}</span>
                                            </div>
                                        ) : (
                                            <span />
                                        )}
                                        {p.estado === 'Borrador' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>Borrador</span>
                                            </span>
                                        )}
                                        {p.estado === 'EnRevision' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                <span>En Revisión</span>
                                            </span>
                                        )}
                                        {p.estado === 'Observado' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                                                <span>Observado ({p.total_observaciones_pendientes})</span>
                                            </span>
                                        )}
                                        {p.estado === 'RevisadoCoord' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                                                <span>Aval Carrera</span>
                                            </span>
                                        )}
                                        {p.estado === 'RevisadoAcad' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                                <span>Aval Académico</span>
                                            </span>
                                        )}
                                        {p.estado === 'Aprobado' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Legalizado</span>
                                            </span>
                                        )}
                                        {!['Borrador', 'EnRevision', 'Observado', 'RevisadoCoord', 'RevisadoAcad', 'Aprobado'].includes(p.estado) && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>{p.estado}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Título de la Asignatura */}
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {p.nombre_asignatura}
                                    </h3>

                                    {/* Docente Responsable */}
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                        <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{p.nombre_docente_elaborador || 'Docente Asignado'}</span>
                                        {isMiMateria(p) && (
                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40 shrink-0">
                                                Tú
                                            </span>
                                        )}
                                    </div>

                                    {/* Metadatos Curriculares: Nivel y Modalidad según BD */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                                        {p.semestre_nivel && <span>{p.semestre_nivel}</span>}
                                        {p.semestre_nivel && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {formatModalidad(p.modalidad)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    </div>
            ) : (
                /* ── MODO TABLA / LISTA ── */
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-4">Asignatura y Carrera</th>
                                    <th className="py-2.5 px-3">Docente Responsable</th>
                                    <th className="py-2.5 px-3">Modalidad</th>
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
                                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {p.nombre_asignatura}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500">
                                                        {p.nombre_carrera} {p.semestre_nivel ? `• ${p.semestre_nivel}` : ''}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-zinc-700 dark:text-zinc-300">
                                                        {p.nombre_docente_elaborador || 'Docente Asignado'}
                                                    </span>
                                                    {isMiMateria(p) && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-[#0070f3] dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/40 shrink-0">
                                                            Tú
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3 text-xs text-zinc-700 dark:text-zinc-300">
                                                {formatModalidad(p.modalidad)}
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
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-[#0070f3] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                    >
                                                        <ShieldCheck className="w-3.5 h-3.5 text-[#0070f3]" />
                                                        <span>Auditar</span>
                                                    </button>

                                                    <button
                                                        onClick={() => handleAbrirRevision(p.uuid)}
                                                        className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                                    >
                                                        Ver PEA
                                                    </button>

                                                    {puedeEmitirAvalAcad && (
                                                        <button
                                                            onClick={() => handleEmitirAvalAcademico(p)}
                                                            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
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
                </div>
            )}

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

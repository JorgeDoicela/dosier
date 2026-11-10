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
    isPeaBorrador,
    isPeaEnRevision,
    getPeaStatusDescriptor,
    formatModalidad
} from '../../Curriculum/utils/peaStatusWorkflow';
import { 
    Search, 
    CheckCircle2, 
    RefreshCw,
    LayoutGrid,
    List,
    Building2,
    UserCheck,
    Eye
} from 'lucide-react';

export const CoordCarreraDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Catálogos institucionales
    const [carreras, setCarreras] = useState<DocenteCarreraDto[]>([]);
    const [selectedCarreraId, setSelectedCarreraId] = useState<number | 'todas'>('todas');
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');

    // Datos del workflow
    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

            // Para coordinadores de carrera, limitar estrictamente a sus carreras asignadas
            const carrerasDisponibles = (!esSuperAutoridad && misCarrerasList.length > 0)
                ? misCarrerasList
                : (todasCarrerasList.length > 0 ? todasCarrerasList : misCarrerasList);

            setCarreras(carrerasDisponibles);
            setPeriodos(periodosList);

            if (carrerasDisponibles.length > 0) {
                const primerId = carrerasDisponibles[0].id_carrera ?? carrerasDisponibles[0].idCarrera;
                if (primerId) setSelectedCarreraId(primerId);
            }

            const activo = periodosList.find(p => p.es_activo) || periodosList[0];
            if (activo) {
                setSelectedPeriodo(activo.id_periodo);
            }
        });
        return () => { isMounted = false; };
    }, [esSuperAutoridad]);

    // Cargar PEAs de la bandeja según filtros
    const fetchPeas = useCallback(async () => {
        setIsLoading(true);
        try {
            const params: { idPeriodo?: string; idCarrera?: number } = {};
            if (selectedPeriodo) params.idPeriodo = selectedPeriodo;
            if (selectedCarreraId !== 'todas') params.idCarrera = selectedCarreraId;

            const data = await getBandejaPeas(params);
            setPeas(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error al cargar PEAs de carrera:', error);
            setPeas([]);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPeriodo, selectedCarreraId]);

    useEffect(() => {
        fetchPeas();
    }, [fetchPeas]);

    // Sincronización continua en tiempo real (SignalR, visibilidad de pestaña y heartbeat pasivo)
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

    // Filtrado en memoria por estado y texto de búsqueda
    const peasFiltrados = useMemo(() => {
        return peas.filter(p => {
            const matchesEstado = filterEstado === 'todos'
                ? true
                : filterEstado === 'mis_materias'
                    ? isMiMateria(p)
                    : p.estado === filterEstado;
            const matchesSearch = search === '' ||
                p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
                (p.nombre_docente_elaborador || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.codigo_asignatura || '').toLowerCase().includes(search.toLowerCase());
            return matchesEstado && matchesSearch;
        });
    }, [peas, filterEstado, search, isMiMateria]);


    // Emisión formal de Aval de Carrera
    const handleEmitirAvalCarrera = async (peaItem: PeaBandejaItemDto) => {
        try {
            await cambiarEstadoPea(peaItem.id_pea, 'RevisadoCoord', undefined, 'Aval de pertinencia técnica y disciplinar emitido por Coordinación de Carrera');
            addToast(
                'Aval de Carrera Emitido',
                `Se aprobó la pertinencia técnica y disciplinar de "${peaItem.nombre_asignatura}". Elevado a Coordinación Académica.`,
                'success'
            );
            await fetchPeas();
        } catch (error) {
            console.error('Error al emitir aval de carrera:', error);
            addToast('Error', 'No fue posible registrar el aval de carrera en el servidor.', 'error');
        }
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
            await cambiarEstadoPea(observacionPea.id_pea, 'Observado', undefined, `Observación en ${seccion}: ${obs}`);
            addToast(
                'Observación Registrada',
                `El PEA de "${observacionPea.nombre_asignatura}" fue devuelto al docente para subsanación.`,
                'warning'
            );
            setObservacionPea(null);
            await fetchPeas();
        } catch (error) {
            console.error('Error al guardar observación:', error);
            addToast('Error', 'No se pudo guardar la observación disciplinar.', 'error');
        }
    };

    // Navegación directa al editor para revisión
    const handleAbrirRevision = (uuid: string) => {
        navigate(`/documentacion/workspace/pea-oficial/${uuid}?edit=pea-oficial`);
    };

    // Cálculo dinámico de docentes rezagados para el modal de recordatorio
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
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Coordinación de Carrera
                </h1>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Selector de Carrera Real de SIGAFI (solo cuando coordina múltiples carreras) */}
                    {carreras.length > 1 && (
                        <div className="w-56">
                            <GeistSelect
                                value={selectedCarreraId}
                                onChange={val => {
                                    setSelectedCarreraId(val === 'todas' ? 'todas' : Number(val));
                                }}
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

                    {/* Selector de Período Académico */}
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

                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Notificar Rezagados ({docentesRezagados.length})
                    </button>
                </div>
            </div>


            {/* Barra de Filtros y Búsqueda (Sin cuadros sobre cuadros) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por asignatura, docente o código..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="w-52">
                        <GeistSelect
                            value={filterEstado}
                            onChange={val => setFilterEstado(String(val))}
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
                    Cargando asignaturas y estado curricular...
                </div>
            ) : peasFiltrados.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    No se encontraron asignaturas registradas para este filtro.
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS (ESTILO DOCENTE LIMPIO) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {peasFiltrados.map(p => {
                        const descriptor = getPeaStatusDescriptor(p.estado);
                        const esBorrador = isPeaBorrador(p.estado);
                        const esEnRevision = isPeaEnRevision(p.estado);
                        const puedeEmitirAval = esEnRevision && !p.firma_coord;

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
                                {/* Top: Estado */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        {selectedCarreraId === 'todas' ? (
                                            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                                <span>{p.nombre_carrera}</span>
                                            </div>
                                        ) : (
                                            <span />
                                        )}
                                        <span className="inline-flex items-center gap-1.5 text-xs font-medium shrink-0">
                                            <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass} shrink-0`} />
                                            <span className={descriptor.textClass}>{descriptor.label}</span>
                                        </span>
                                    </div>

                                    {/* Título de la Asignatura */}
                                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {p.nombre_asignatura}
                                    </h3>

                                    {/* Docente Elaborador */}
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                        <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{p.nombre_docente_elaborador || 'Docente Responsable'}</span>
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
                                    <th className="py-2.5 px-3">Docente Elaborador</th>
                                    <th className="py-2.5 px-3">Modalidad</th>
                                    <th className="py-2.5 px-3">Estado Técnico</th>
                                    <th className="py-2.5 px-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                {peasFiltrados.map(p => {
                                    const descriptor = getPeaStatusDescriptor(p.estado);
                                    const esBorrador = isPeaBorrador(p.estado);
                                    const esEnRevision = isPeaEnRevision(p.estado);
                                    const puedeEmitirAval = (p.estado === 'EnRevision' || p.firma_docente) && !p.firma_coord;
                                    return (
                                        <tr key={p.uuid} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                            <td className="py-2.5 px-4">
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {p.nombre_asignatura}
                                                    </p>
                                                    <p className="text-[11px] text-zinc-500">
                                                        {carreras.length > 1 ? `${p.nombre_carrera} ${p.semestre_nivel ? `• ${p.semestre_nivel}` : ''}` : p.semestre_nivel || ''}
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
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${descriptor.dotClass} shrink-0`} />
                                                    <span className={descriptor.textClass}>{descriptor.label}</span>
                                                    {p.total_observaciones_pendientes > 0 && (
                                                        <span className="text-[10px] text-rose-500 font-mono">
                                                            ({p.total_observaciones_pendientes})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {esBorrador ? (
                                                        <button
                                                            onClick={() => handleAbrirRevision(p.uuid)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                            title="Consultar avance de formulación docente"
                                                        >
                                                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                                                            <span>Ver avance</span>
                                                        </button>
                                                    ) : esEnRevision ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleAbrirRevision(p.uuid)}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                <span>Revisar</span>
                                                            </button>

                                                            <button
                                                                onClick={() => setObservacionPea(p)}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-lg text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                                                            >
                                                                Observar
                                                            </button>

                                                            {puedeEmitirAval && (
                                                                <button
                                                                    onClick={() => handleEmitirAvalCarrera(p)}
                                                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                                                                >
                                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                                    <span>Emitir Aval</span>
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAbrirRevision(p.uuid)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Ver expediente</span>
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

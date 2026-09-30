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
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';
import { Search, Filter, BookOpen, Clock, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

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

    // Modales
    const [observacionPea, setObservacionPea] = useState<PeaBandejaItemDto | null>(null);
    const [isRecordatorioOpen, setIsRecordatorioOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<PeaBandejaItemDto | null>(null);

    // Cargar catálogos iniciales
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getCarrerasInstitucionales().catch(() => []),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => [])
        ]).then(([carrerasList, periodosList]) => {
            if (!isMounted) return;
            setCarreras(carrerasList);
            setPeriodos(periodosList);

            if (carrerasList.length > 0) {
                const primerId = carrerasList[0].id_carrera ?? carrerasList[0].idCarrera;
                if (primerId) setSelectedCarreraId(primerId);
            }

            const activo = periodosList.find(p => p.es_activo) || periodosList[0];
            if (activo) {
                setSelectedPeriodo(activo.id_periodo);
            }
        });
        return () => { isMounted = false; };
    }, []);

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

    // Filtrado en memoria por estado y texto de búsqueda
    const peasFiltrados = useMemo(() => {
        return peas.filter(p => {
            const matchesEstado = filterEstado === 'todos' || p.estado === filterEstado;
            const matchesSearch = search === '' ||
                p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
                (p.nombre_docente_elaborador || '').toLowerCase().includes(search.toLowerCase()) ||
                (p.codigo_asignatura || '').toLowerCase().includes(search.toLowerCase());
            return matchesEstado && matchesSearch;
        });
    }, [peas, filterEstado, search]);


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
                    {/* Selector de Carrera Real de SIGAFI */}
                    <select
                        value={selectedCarreraId}
                        onChange={e => {
                            const val = e.target.value;
                            setSelectedCarreraId(val === 'todas' ? 'todas' : Number(val));
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
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

                    {/* Selector de Período Académico */}
                    {periodos.length > 0 && (
                        <select
                            value={selectedPeriodo}
                            onChange={e => setSelectedPeriodo(e.target.value)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                        >
                            {periodos.map(p => (
                                <option key={p.id_periodo} value={p.id_periodo}>
                                    {p.id_periodo} {p.es_activo ? '(Activo)' : ''}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => setIsRecordatorioOpen(true)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Notificar Rezagados ({docentesRezagados.length})
                    </button>

                    <button
                        onClick={fetchPeas}
                        disabled={isLoading}
                        title="Actualizar bandeja"
                        className="p-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                        <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>


            {/* Bandeja de Supervisión Disciplinar */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Bandeja de Asignaturas: {nombreCarreraActiva}
                    </h2>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar asignatura o docente..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-7 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#0070f3] w-52"
                            />
                        </div>

                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="EnRevision">En Revisión de Carrera</option>
                            <option value="Observado">Con Observaciones</option>
                            <option value="RevisadoCoord">Avalado por Carrera</option>
                            <option value="RevisadoAcad">Avalado por Académica</option>
                            <option value="Aprobado">Aprobado / Legalizado</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de la Carrera */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-2.5 px-4">Asignatura y Carrera</th>
                                <th className="py-2.5 px-3">Docente Elaborador</th>
                                <th className="py-2.5 px-3">Carga Horaria</th>
                                <th className="py-2.5 px-3">Estado Técnico</th>
                                <th className="py-2.5 px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                                        <RefreshCw size={18} className="animate-spin mx-auto mb-2 text-[#0070f3]" />
                                        Cargando asignaturas y estado curricular...
                                    </td>
                                </tr>
                            ) : peasFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-zinc-400">
                                        No se encontraron asignaturas registradas para este filtro.
                                    </td>
                                </tr>
                            ) : (
                                peasFiltrados.map(p => {
                                    const puedeEmitirAval = (p.estado === 'EnRevision' || p.firma_docente) && !p.firma_coord;
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
                                            <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                                                {p.total_horas_asignatura || 0}h {p.creditos ? `(${p.creditos} créd.)` : ''}
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {p.estado === 'Borrador' && (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                        <span>Docente Elaborando</span>
                                                    </div>
                                                )}
                                                {p.estado === 'EnRevision' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        <span>Listo para Revisión</span>
                                                    </div>
                                                )}
                                                {p.estado === 'Observado' && (
                                                    <div>
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                            <span>Con Observaciones ({p.total_observaciones_pendientes})</span>
                                                        </div>
                                                    </div>
                                                )}
                                                {p.estado === 'RevisadoCoord' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                        <span>Aval de Carrera Emitido</span>
                                                    </div>
                                                )}
                                                {p.estado === 'RevisadoAcad' && (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
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
                                                        onClick={() => handleAbrirRevision(p.uuid)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                                    >
                                                        Revisar
                                                    </button>

                                                    <button
                                                        onClick={() => setObservacionPea(p)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 transition-colors cursor-pointer"
                                                    >
                                                        Observar
                                                    </button>

                                                    {puedeEmitirAval && (
                                                        <button
                                                            onClick={() => handleEmitirAvalCarrera(p)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                                        >
                                                            Emitir Aval
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
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

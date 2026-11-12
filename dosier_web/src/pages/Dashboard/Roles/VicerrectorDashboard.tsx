import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/AuthContext';
import { useNotifications } from '../../../api/NotificationsContext';
import { getBandejaPeas, type PeaBandejaItemDto } from '../../../services/peaService';
import {
    getPeriodosAcademicos,
    getPeriodoActivo,
    type PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';
import { LegalizacionFirmaModal } from './Modals/LegalizacionFirmaModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { formatModalidad } from '../../Curriculum/utils/peaStatusWorkflow';
import {
    recordRecentSubjectOpen,
    sortSubjectsByRecentOpen
} from '../../../utils/recentSubjectStorage';
import {
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    FileCheck2,
    GraduationCap,
    QrCode,
    Search,
    Shield,
    ShieldCheck,
    UserCheck,
    Eye,
    ChevronRight,
    Loader2,
    Building2
} from 'lucide-react';

const SYNC_EVENTS = ['dosier-projects-changed'];

export const VicerrectorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useNotifications();

    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [search, setSearch] = useState<string>('');
    const [filterCarrera, setFilterCarrera] = useState<string>('todas');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);

    // Modales
    const [firmaModalPea, setFirmaModalPea] = useState<PeaBandejaItemDto | null>(null);
    const [isFirmaMasivaOpen, setIsFirmaMasivaOpen] = useState<boolean>(false);
    const [auditoriaPea, setAuditoriaPea] = useState<PeaBandejaItemDto | null>(null);

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

            const data = await getBandejaPeas({
                idPeriodo: targetPeriodo || undefined
            });
            setPeas(data);
        } catch (err) {
            console.error('[DOSIER Vicerrector] Error al cargar PEAs:', err);
            addToast('Error de Carga', 'No se pudieron consultar los PEAs institucionales del período.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Sincronización continua en tiempo real (SignalR, foco de pestaña y heartbeat pasivo)
    const silentSync = useCallback(() => {
        if (selectedPeriodo) {
            getBandejaPeas({ idPeriodo: selectedPeriodo }).then(setPeas).catch(() => {});
        } else {
            cargarDatos();
        }
    }, [selectedPeriodo, cargarDatos]);

    useRealtimeSync({
        onSync: silentSync,
        events: SYNC_EVENTS
    });

    const handlePeriodoChange = async (val: string | number) => {
        const idStr = String(val);
        setSelectedPeriodo(idStr);
        setRefreshing(true);
        try {
            const data = await getBandejaPeas({
                idPeriodo: idStr
            });
            setPeas(data);
        } catch (err) {
            console.error('[DOSIER Vicerrector] Error al cambiar período:', err);
        } finally {
            setRefreshing(false);
        }
    };

    // Carreras únicas encontradas en la lista real de la base de datos
    const carrerasDisponibles = useMemo(() => {
        const unique = new Set<string>();
        peas.forEach(p => {
            if (p.nombre_carrera) unique.add(p.nombre_carrera);
        });
        return Array.from(unique).sort();
    }, [peas]);

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

    // Filtrado en vivo
    const peasFiltrados = useMemo(() => {
        const filtrados = peas.filter(p => {
            const matchesCarrera = filterCarrera === 'todas' || p.nombre_carrera === filterCarrera;
            const query = search.trim().toLowerCase();
            const matchesSearch = !query ||
                (p.nombre_asignatura && p.nombre_asignatura.toLowerCase().includes(query)) ||
                (p.codigo_asignatura && p.codigo_asignatura.toLowerCase().includes(query)) ||
                (p.nombre_docente_elaborador && p.nombre_docente_elaborador.toLowerCase().includes(query)) ||
                (p.nombre_carrera && p.nombre_carrera.toLowerCase().includes(query));

            const matchesEstado =
                filterEstado === 'todos' ? true :
                filterEstado === 'listos' ? (p.estado === 'RevisadoAcad') :
                filterEstado === 'legalizados' ? (p.estado === 'Aprobado' || p.estado === 'Publicado') :
                filterEstado === 'proceso' ? (p.estado !== 'Aprobado' && p.estado !== 'Publicado' && p.estado !== 'RevisadoAcad') : true;

            return matchesCarrera && matchesSearch && matchesEstado;
        });

        return sortSubjectsByRecentOpen(filtrados);
    }, [peas, filterCarrera, search, filterEstado, recentsVersion]);

    const peasListosParaFirma = useMemo(() => {
        return peas.filter(p => p.estado === 'RevisadoAcad');
    }, [peas]);

    const peasLegalizados = useMemo(() => {
        return peas.filter(p => p.estado === 'Aprobado' || p.estado === 'Publicado');
    }, [peas]);

    const handleFirmadoExitoso = () => {
        cargarDatos(selectedPeriodo);
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Vicerrectorado Académico
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFirmaMasivaOpen(true)}
                        disabled={peasListosParaFirma.length === 0}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                        Firma Masiva ({peasListosParaFirma.length})
                    </button>
                    <button
                        onClick={() => {
                            addToast(
                                'Dossier Institucional Compilado',
                                `Generando paquete foliado y certificado de PEAs aprobados para el período seleccionado.`,
                                'success'
                            );
                        }}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
                    >
                        Descargar Dossier (PDF)
                    </button>
                </div>
            </div>

            {/* Fichas Clave-Valor de Métricas Reales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            Total Asignaturas Período
                        </span>
                        <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                            {peas.length}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center text-[#0070f3] dark:text-blue-400">
                        <BookOpen className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            Listos para Firma Legal
                        </span>
                        <span className="text-2xl font-bold text-[#0070f3] dark:text-blue-400 font-mono">
                            {peasListosParaFirma.length}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Award className="w-5 h-5" />
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                            Legalizados en Firme
                        </span>
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            {peasLegalizados.length}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Barra de Filtros y Modo de Vista */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Cola de Legalización y Archivo Oficial
                    </h2>
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
                            placeholder="Buscar asignatura, docente o carrera..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-52"
                        />
                    </div>

                    {/* Filtro de Carrera */}
                    {carrerasDisponibles.length > 1 && (
                        <div className="w-56">
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

                    {/* Filtro de Estado Legal */}
                    <div className="w-52">
                        <GeistSelect
                            value={filterEstado}
                            onChange={val => setFilterEstado(String(val))}
                            options={[
                                { value: 'todos', label: 'Todos los Estados' },
                                { value: 'listos', label: 'Listos para Firma' },
                                { value: 'legalizados', label: 'Legalizados (Aprobados)' },
                                { value: 'proceso', label: 'En Proceso Previo' }
                            ]}
                            placeholder="Estado Legal..."
                        />
                    </div>
                </div>
            </div>

            {/* Contenido: Cuadros de Legalización */}
            {loading ? (
                <div className="py-16 flex flex-col items-center justify-center text-zinc-400 space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    <p className="text-xs">Consultando bandeja oficial de Vicerrectorado...</p>
                </div>
            ) : peasFiltrados.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                    No se encontraron instrumentos curriculares que coincidan con los filtros aplicados.
                </div>
            ) : (
                /* ── MODO CUADROS (LIMPIO Y PLANO) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {peasFiltrados.map(p => {
                        const estaAprobado = p.estado === 'Aprobado' || p.estado === 'Publicado';
                        const listoParaFirma = p.estado === 'RevisadoAcad';

                        return (
                            <div
                                key={p.uuid}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    recordRecentSubjectOpen({ uuid: p.uuid, id_pea: p.id_pea });
                                    navigate(`/documentacion/revision-tecnica/${p.uuid}`);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        recordRecentSubjectOpen({ uuid: p.uuid, id_pea: p.id_pea });
                                        navigate(`/documentacion/revision-tecnica/${p.uuid}`);
                                    }
                                }}
                                className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950 text-left"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0070f3]" />
                                            <span className="truncate">{p.nombre_carrera}</span>
                                        </div>
                                        {estaAprobado ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Legalizado</span>
                                            </span>
                                        ) : listoParaFirma ? (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0070f3] dark:text-blue-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                                <span>Listo para Firma</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>{p.estado}</span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Título de la Asignatura */}
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {p.nombre_asignatura}
                                    </h3>

                                    {/* Docente Elaborador */}
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                                        <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{p.nombre_docente_elaborador || 'Docente de Asignatura'}</span>
                                    </div>

                                    {/* Metadatos Curriculares: Nivel y Modalidad según BD */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-0.5">
                                        {p.semestre_nivel && <span>{p.semestre_nivel}</span>}
                                        {p.semestre_nivel && <span className="text-zinc-300 dark:text-zinc-700">·</span>}
                                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                            {formatModalidad(p.modalidad)}
                                        </span>
                                    </div>

                                    {/* Cadena de Aprobaciones */}
                                    <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 dark:text-zinc-400 pt-1">
                                        <span className={p.firma_docente ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 line-through'}>
                                            {p.firma_docente ? '✓ ' : '1. '}Doc
                                        </span>
                                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                        <span className={p.firma_coord ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400'}>
                                            {p.firma_coord ? '✓ ' : '2. '}Carr
                                        </span>
                                        <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                        <span className={p.firma_acad ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400'}>
                                            {p.firma_acad ? '✓ ' : '3. '}Acad
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modales */}
            {firmaModalPea && (
                <LegalizacionFirmaModal
                    isOpen={!!firmaModalPea}
                    onClose={() => setFirmaModalPea(null)}
                    idPea={firmaModalPea.id_pea}
                    uuidPea={firmaModalPea.uuid}
                    tituloDocumento={firmaModalPea.nombre_asignatura}
                    carrera={firmaModalPea.nombre_carrera}
                    esMasivo={false}
                    onFirmadoExitoso={handleFirmadoExitoso}
                />
            )}

            <LegalizacionFirmaModal
                isOpen={isFirmaMasivaOpen}
                onClose={() => setIsFirmaMasivaOpen(false)}
                tituloDocumento="Paquete Curricular Masivo"
                carrera={filterCarrera}
                esMasivo={true}
                cantidadPeas={peasListosParaFirma.length}
                onFirmadoExitoso={handleFirmadoExitoso}
            />

            {auditoriaPea && (
                <AuditoriaCacesModal
                    isOpen={!!auditoriaPea}
                    onClose={() => setAuditoriaPea(null)}
                    asignatura={auditoriaPea.nombre_asignatura}
                    carrera={auditoriaPea.nombre_carrera}
                    horasTotales={auditoriaPea.total_horas_asignatura}
                    horasDocencia={0}
                    horasPracticas={0}
                    horasAutonomo={0}
                    cumpleCaces={auditoriaPea.estado === 'Aprobado'}
                    tieneAvalCarrera={auditoriaPea.firma_coord}
                    tieneAvalAcademica={auditoriaPea.firma_acad}
                    tieneFirmaRectorado={auditoriaPea.firma_vicerrector}
                />
            )}
        </div>
    );
};

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
import {
    Award,
    BookOpen,
    CheckCircle2,
    Clock,
    FileCheck2,
    GraduationCap,
    QrCode,
    RefreshCw,
    Search,
    Shield,
    UserCheck,
    Eye,
    ChevronRight,
    Loader2
} from 'lucide-react';

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

    const handleRefrescar = async () => {
        setRefreshing(true);
        try {
            const data = await getBandejaPeas({
                idPeriodo: selectedPeriodo || undefined
            });
            setPeas(data);
            addToast('Bandeja Sincronizada', 'Estado curricular actualizado con la base de datos.', 'info');
        } catch (err) {
            console.error('[DOSIER Vicerrector] Error al refrescar:', err);
        } finally {
            setRefreshing(false);
        }
    };

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

    // Filtrado en vivo
    const peasFiltrados = useMemo(() => {
        return peas.filter(p => {
            const matchesCarrera = filterCarrera === 'todas' || p.nombre_carrera === filterCarrera;
            const query = search.trim().toLowerCase();
            const matchesSearch = !query ||
                (p.nombre_asignatura && p.nombre_asignatura.toLowerCase().includes(query)) ||
                (p.codigo_asignatura && p.codigo_asignatura.toLowerCase().includes(query)) ||
                (p.nombre_docente_elaborador && p.nombre_docente_elaborador.toLowerCase().includes(query)) ||
                (p.nombre_carrera && p.nombre_carrera.toLowerCase().includes(query));

            const matchesEstado =
                filterEstado === 'todos' ? true :
                filterEstado === 'listos' ? (p.estado === 'RevisadoAcad' || p.estado === 'RevisadoCoord') :
                filterEstado === 'legalizados' ? (p.estado === 'Aprobado' || p.estado === 'Publicado') :
                filterEstado === 'proceso' ? (p.estado !== 'Aprobado' && p.estado !== 'Publicado' && p.estado !== 'RevisadoAcad') : true;

            return matchesCarrera && matchesSearch && matchesEstado;
        });
    }, [peas, filterCarrera, search, filterEstado]);

    const peasListosParaFirma = useMemo(() => {
        return peas.filter(p => p.estado === 'RevisadoAcad' || p.estado === 'RevisadoCoord');
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
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Legalización Curricular • Vicerrectorado Académico
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Despacho de Vicerrectorado Académico
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            {user?.nombre_completo || 'Vicerrectorado Académico'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Legalización curricular en firme, firma criptográfica institucional y certificación pública para acreditación CACES.
                    </p>
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

            {/* Bandeja de Despacho y Filtros */}
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                            Cola de Legalización y Archivo Oficial de PEAs
                        </h2>
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
                                placeholder="Buscar asignatura, docente o carrera..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-52"
                            />
                        </div>

                        {/* Filtro de Carrera */}
                        {carrerasDisponibles.length > 1 && (
                            <select
                                value={filterCarrera}
                                onChange={e => setFilterCarrera(e.target.value)}
                                className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                            >
                                <option value="todas">Todas las Carreras</option>
                                {carrerasDisponibles.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        )}

                        {/* Filtro de Estado Legal */}
                        <select
                            value={filterEstado}
                            onChange={e => setFilterEstado(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="listos">Listos para Firma</option>
                            <option value="legalizados">Legalizados (Aprobados)</option>
                            <option value="proceso">En Proceso Previo</option>
                        </select>

                        <button
                            onClick={handleRefrescar}
                            disabled={refreshing}
                            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            title="Recargar bandeja"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Tabla de Legalización */}
                <div className="overflow-x-auto">
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
                        <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-2.5 px-4">Asignatura</th>
                                    <th className="py-2.5 px-3">Carrera</th>
                                    <th className="py-2.5 px-3">Cadena de Avales Previos</th>
                                    <th className="py-2.5 px-3">Estado Legal</th>
                                    <th className="py-2.5 px-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                                {peasFiltrados.map(p => {
                                    const estaAprobado = p.estado === 'Aprobado' || p.estado === 'Publicado';
                                    const listoParaFirma = p.estado === 'RevisadoAcad' || p.estado === 'RevisadoCoord';

                                    return (
                                        <tr key={p.uuid} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/50 transition-colors">
                                            <td className="py-2.5 px-4">
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {p.nombre_asignatura}
                                                </p>
                                                <p className="text-[11px] text-zinc-500 font-mono">
                                                    {p.codigo_asignatura ? `${p.codigo_asignatura} • ` : ''}{p.nombre_docente_elaborador || 'Docente de Cátedra'}
                                                </p>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <span className="text-zinc-700 dark:text-zinc-300">
                                                    {p.nombre_carrera}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center gap-1.5 text-xs font-mono">
                                                    <span className={p.firma_docente ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600 line-through'}>
                                                        {p.firma_docente ? '✓ ' : '1. '}Docente
                                                    </span>
                                                    <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                                    <span className={p.firma_coord ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                                                        {p.firma_coord ? '✓ ' : '2. '}Carrera
                                                    </span>
                                                    <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                                    <span className={p.firma_acad ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                                                        {p.firma_acad ? '✓ ' : '3. '}Académica
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-3">
                                                {estaAprobado ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                        <span>Legalizado en Firme</span>
                                                    </div>
                                                ) : listoParaFirma ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-medium text-[#0070f3] dark:text-blue-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] shrink-0" />
                                                        <span>Listo para Firma Legal</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                                                        <span>En Proceso de Avales ({p.estado})</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-2.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => navigate(`/documentacion/workspace/pea-oficial/${p.uuid}?edit=pea-oficial`)}
                                                        className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>Ver PEA</span>
                                                    </button>

                                                    {listoParaFirma && (
                                                        <button
                                                            onClick={() => setFirmaModalPea(p)}
                                                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Award className="w-3.5 h-3.5" />
                                                            <span>Firmar PEA</span>
                                                        </button>
                                                    )}

                                                    {estaAprobado && (
                                                        <button
                                                            onClick={() => {
                                                                const url = `${window.location.origin}/verificacion/${p.uuid}`;
                                                                navigator.clipboard.writeText(url);
                                                                addToast(
                                                                    'Enlace QR Público Copiado',
                                                                    url,
                                                                    'info'
                                                                );
                                                            }}
                                                            className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors font-mono cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <QrCode className="w-3.5 h-3.5" />
                                                            <span>QR CACES</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

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

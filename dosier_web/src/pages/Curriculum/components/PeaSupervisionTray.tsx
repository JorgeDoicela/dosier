import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen,
    Clock,
    Search,
    RefreshCw,
    FileText,
    CheckCircle2,
    AlertCircle,
    Layers,
    UserCheck,
    ChevronRight,
    Filter,
    Shield,
    FileCheck2,
    Eye,
    GraduationCap,
    LayoutGrid,
    List,
    Building2,
    ArrowRight,
    ExternalLink
} from 'lucide-react';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { useNotifications } from '../../../api/NotificationsContext';
import { getBandejaPeas, type PeaBandejaItemDto } from '../../../services/peaService';
import {
    getPeriodosAcademicos,
    getPeriodoActivo,
    type PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';

export const PeaSupervisionTray: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotifications();

    const [peas, setPeas] = useState<PeaBandejaItemDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [selectedCarrera, setSelectedCarrera] = useState<string>('todas');
    const [selectedEstado, setSelectedEstado] = useState<string>('todos');
    const [search, setSearch] = useState<string>('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState<boolean>(true);
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

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

            const data = await getBandejaPeas({
                idPeriodo: initialPeriod || undefined
            });
            setPeas(data);
        } catch (err: any) {
            console.error('[DOSIER] Error al cargar bandeja de PEAs:', err);
            setError('No se pudo cargar la información de supervisión de PEAs. Verifique la conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleRefrescar = async () => {
        setRefreshing(true);
        setError(null);
        try {
            const data = await getBandejaPeas({
                idPeriodo: selectedPeriodo || undefined,
                idCarrera: selectedCarrera !== 'todas' ? Number(selectedCarrera) : undefined,
                estado: selectedEstado !== 'todos' ? selectedEstado : undefined
            });
            setPeas(data);
            addToast('Bandeja Actualizada', 'Se sincronizaron los últimos estados de los PEAs institucionales.', 'info');
        } catch (err: any) {
            console.error('[DOSIER] Error al refrescar PEAs:', err);
            setError('Error al actualizar los instrumentos curriculares.');
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
                idPeriodo: idStr,
                idCarrera: selectedCarrera !== 'todas' ? Number(selectedCarrera) : undefined,
                estado: selectedEstado !== 'todos' ? selectedEstado : undefined
            });
            setPeas(data);
        } catch (err) {
            console.error('[DOSIER] Error al cambiar período:', err);
        } finally {
            setRefreshing(false);
        }
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
            const matchEstado = selectedEstado === 'todos' || p.estado === selectedEstado;

            return matchSearch && matchCarrera && matchEstado;
        });
    }, [peas, search, selectedCarrera, selectedEstado]);

    const getEstadoBadge = (estado: string) => {
        switch (estado) {
            case 'Aprobado':
            case 'Publicado':
                return {
                    label: 'Aprobado Institucional',
                    dotClass: 'bg-emerald-500',
                    textClass: 'text-emerald-600 dark:text-emerald-400',
                    borderClass: 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/80'
                };
            case 'RevisadoAcad':
                return {
                    label: 'Aval Académico',
                    dotClass: 'bg-[#0070f3]',
                    textClass: 'text-[#0070f3] dark:text-blue-400',
                    borderClass: 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/80'
                };
            case 'RevisadoCoord':
                return {
                    label: 'Aval Carrera',
                    dotClass: 'bg-blue-500',
                    textClass: 'text-blue-600 dark:text-blue-400',
                    borderClass: 'border-cyan-200 dark:border-cyan-900/60 bg-cyan-50 dark:bg-cyan-950/80'
                };
            case 'EnRevision':
                return {
                    label: 'En Revisión',
                    dotClass: 'bg-amber-500',
                    textClass: 'text-amber-600 dark:text-amber-400',
                    borderClass: 'border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/80'
                };
            case 'Observado':
                return {
                    label: 'Con Observaciones',
                    dotClass: 'bg-rose-500',
                    textClass: 'text-rose-600 dark:text-rose-400',
                    borderClass: 'border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/80'
                };
            default:
                return {
                    label: 'Borrador Docente',
                    dotClass: 'bg-zinc-400 dark:bg-zinc-500',
                    textClass: 'text-zinc-600 dark:text-zinc-400',
                    borderClass: 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900'
                };
        }
    };

    const handleAbrirPea = (uuid: string) => {
        navigate(`/documentacion/revision-tecnica/${uuid}`);
    };

    const handleAbrirEditor = (uuid: string) => {
        navigate(`/documentacion/workspace/pea-oficial/${uuid}?edit=pea-oficial`);
    };

    return (
        <div className="space-y-6">
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
                                    label: p.periodo
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

                        <button
                            onClick={handleRefrescar}
                            disabled={refreshing}
                            className="h-9 px-3 flex items-center gap-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
                            title="Sincronizar lista"
                        >
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                            <span>Refrescar</span>
                        </button>
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

                    {/* Filtro de Estado */}
                    <div className="flex items-center gap-1">
                        <label className="text-zinc-500 dark:text-zinc-400 text-[11px]">Estado:</label>
                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="py-1 px-2 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                        >
                            <option value="todos">Todos los Estados</option>
                            <option value="Borrador">Borrador</option>
                            <option value="EnRevision">En Revisión</option>
                            <option value="Observado">Observado</option>
                            <option value="RevisadoCoord">Revisado Coord. Carrera</option>
                            <option value="RevisadoAcad">Revisado Coord. Académica</option>
                            <option value="Aprobado">Aprobado / Legalizado</option>
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
                    <BookOpen size={28} className="mx-auto text-zinc-400" />
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">No se encontraron Programas de Estudio (PEA)</p>
                    <p className="max-w-md mx-auto text-zinc-500 dark:text-zinc-400 text-[11px]">
                        No existen instrumentos registrados para el período lectivo y criterios seleccionados. Verifique que los docentes hayan inicializado sus asignaturas desde su panel institucional.
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                /* ── MODO CUADROS / TARJETAS (ESTILO DOCENTE) ── */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPeas.map(pea => {
                        const badge = getEstadoBadge(pea.estado);
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
                                className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950 text-left"
                            >
                                {/* Encabezado de la Tarjeta */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                            <Building2 className="w-3.5 h-3.5 shrink-0 text-[#0070f3]" />
                                            <span className="truncate">{pea.nombre_carrera}</span>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-md border ${badge.borderClass} ${badge.textClass} shrink-0`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Nombre de la Asignatura */}
                                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                        {pea.nombre_asignatura}
                                    </h3>

                                    {/* Docente Elaborador */}
                                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-400 pt-0.5">
                                        <UserCheck className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                                        <span className="truncate">{pea.nombre_docente_elaborador || 'Docente de Asignatura'}</span>
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

                                {/* Pie de Tarjeta con Acción */}
                                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-zinc-900">
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAbrirEditor(pea.uuid);
                                        }}
                                        className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                        title="Abrir en Editor de Documento"
                                    >
                                        <ExternalLink size={12} />
                                        <span>Editor</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleAbrirPea(pea.uuid);
                                        }}
                                        className="bg-[#0070f3] hover:bg-[#0060df] text-white shadow-xs inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                    >
                                        <Eye size={13} />
                                        <span>Revisión Técnica</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* ── MODO LISTA TABULAR ── */
                <div className="space-y-2.5">
                    {filteredPeas.map(pea => {
                        const badge = getEstadoBadge(pea.estado);
                        return (
                            <div
                                key={pea.uuid}
                                className="bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs"
                            >
                                {/* Bloque de Asignatura y Carrera */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
                                            {pea.nombre_asignatura}
                                        </h3>
                                        {pea.codigo_asignatura && (
                                            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                                                {pea.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${badge.textClass}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                                            {badge.label}
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
                                            {pea.nombre_docente_elaborador || 'Docente de Asignatura'}
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
                                    <button
                                        type="button"
                                        onClick={() => handleAbrirEditor(pea.uuid)}
                                        className="h-8 px-2.5 flex items-center gap-1.5 text-xs rounded-md font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                                        title="Abrir en Editor de Documento"
                                    >
                                        <ExternalLink size={12} />
                                        <span>Editor</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleAbrirPea(pea.uuid)}
                                        className="h-8 px-3.5 flex items-center gap-1.5 text-xs rounded-md font-semibold text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer shadow-xs"
                                    >
                                        <Eye size={13} />
                                        <span>Revisión Técnica</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


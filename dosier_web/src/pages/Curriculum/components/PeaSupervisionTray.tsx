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
    GraduationCap
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
                    textClass: 'text-emerald-600 dark:text-emerald-400'
                };
            case 'RevisadoAcad':
                return {
                    label: 'Aval Académico',
                    dotClass: 'bg-[#0070f3]',
                    textClass: 'text-[#0070f3] dark:text-blue-400'
                };
            case 'RevisadoCoord':
                return {
                    label: 'Aval Carrera',
                    dotClass: 'bg-blue-500',
                    textClass: 'text-blue-600 dark:text-blue-400'
                };
            case 'EnRevision':
                return {
                    label: 'En Revisión',
                    dotClass: 'bg-amber-500',
                    textClass: 'text-amber-600 dark:text-amber-400'
                };
            case 'Observado':
                return {
                    label: 'Con Observaciones',
                    dotClass: 'bg-rose-500',
                    textClass: 'text-rose-600 dark:text-rose-400'
                };
            default:
                return {
                    label: 'Borrador Docente',
                    dotClass: 'bg-zinc-400 dark:bg-zinc-500',
                    textClass: 'text-zinc-600 dark:text-zinc-400'
                };
        }
    };

    const handleAbrirPea = (uuid: string) => {
        navigate(`/documentacion/workspace/pea-oficial/${uuid}?edit=pea-oficial`);
    };

    return (
        <div className="space-y-6">
            {/* ── BARRA DE FILTROS Y CONTROLES ── */}
            <div className="bg-surface p-4 rounded-xl border border-border-thin space-y-3">
                <div className="flex flex-col md:flex-row gap-2.5 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por asignatura, código institucional, docente o carrera..."
                            className="input-vercel !pl-10 !rounded-lg !py-2 !text-xs w-full"
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

                        <button
                            onClick={handleRefrescar}
                            disabled={refreshing}
                            className="btn-vercel-secondary h-9 px-3 flex items-center gap-1.5 text-xs rounded-lg shrink-0"
                            title="Sincronizar lista"
                        >
                            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
                            <span>Refrescar</span>
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-border-thin text-xs">
                    <div className="flex items-center gap-1.5 text-text-dim">
                        <Filter size={12} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider">Filtros:</span>
                    </div>

                    {/* Filtro de Carrera */}
                    <div className="flex items-center gap-1">
                        <label className="text-text-dim text-[11px]">Carrera:</label>
                        <select
                            value={selectedCarrera}
                            onChange={e => setSelectedCarrera(e.target.value)}
                            className="input-vercel !py-1 !px-2 !text-xs !rounded-md"
                        >
                            <option value="todas">Todas las Carreras</option>
                            {carrerasDisponibles.map(c => (
                                <option key={c.id} value={String(c.id)}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro de Estado */}
                    <div className="flex items-center gap-1">
                        <label className="text-text-dim text-[11px]">Estado:</label>
                        <select
                            value={selectedEstado}
                            onChange={e => setSelectedEstado(e.target.value)}
                            className="input-vercel !py-1 !px-2 !text-xs !rounded-md"
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
                            className="text-[11px] text-text-dim hover:text-text-main underline cursor-pointer ml-auto"
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

            {/* ── BANDEJA DE PEAS (LISTA TABULAR DE ALTA DENSIDAD) ── */}
            {loading ? (
                <div className="py-16 text-center text-text-dim text-xs flex flex-col items-center gap-2">
                    <RefreshCw size={20} className="animate-spin text-brand" />
                    <span>Consultando instrumentos curriculares registrados...</span>
                </div>
            ) : filteredPeas.length === 0 ? (
                <div className="bg-surface rounded-xl border border-dashed border-border-thin p-12 text-center text-text-dim text-xs space-y-2">
                    <BookOpen size={28} className="mx-auto text-text-dim/60" />
                    <p className="font-semibold text-text-main text-sm">No se encontraron Programas de Estudio (PEA)</p>
                    <p className="max-w-md mx-auto text-text-dim text-[11px]">
                        No existen instrumentos registrados para el período lectivo y criterios seleccionados. Verifique que los docentes hayan inicializado sus asignaturas desde su panel institucional.
                    </p>
                </div>
            ) : (
                <div className="space-y-2.5">
                    {filteredPeas.map(pea => {
                        const badge = getEstadoBadge(pea.estado);
                        return (
                            <div
                                key={pea.uuid}
                                className="bg-surface hover:bg-slate-50 dark:hover:bg-zinc-850/50 p-4 rounded-lg border border-slate-200/90 dark:border-zinc-800 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                                {/* Bloque de Asignatura y Carrera */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="text-sm font-semibold text-text-main tracking-tight truncate">
                                            {pea.nombre_asignatura}
                                        </h3>
                                        {pea.codigo_asignatura && (
                                            <span className="font-mono text-xs text-text-dim">
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

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
                                        <span className="flex items-center gap-1 font-medium text-text-main/80">
                                            <GraduationCap size={13} className="text-[#0070f3]" />
                                            {pea.nombre_carrera}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <UserCheck size={13} />
                                            {pea.nombre_docente_elaborador || 'Docente de Cátedra'}
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

                                {/* Circuito de 4 Firmas (Puntos Discretos, Cero Cápsulas) */}
                                <div className="flex items-center gap-2 shrink-0 bg-slate-50 dark:bg-zinc-900/60 px-3 py-1.5 rounded-md border border-slate-200/90 dark:border-zinc-800 text-xs">
                                    <span className="text-[11px] font-medium text-text-dim uppercase tracking-wider mr-1">Circuito:</span>
                                    
                                    {/* 1. Docente */}
                                    <span
                                        title={pea.firma_docente ? `Elaborado por Docente (${pea.fecha_elaborado || 'Firmado'})` : 'Pendiente firma docente'}
                                        className={`inline-flex items-center gap-1 font-medium ${pea.firma_docente ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-dim/60 line-through'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${pea.firma_docente ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                                        Docente
                                    </span>
                                    <ChevronRight size={11} className="text-text-dim/40" />

                                    {/* 2. Coordinador de Carrera */}
                                    <span
                                        title={pea.firma_coord ? `Revisado por Coordinación de Carrera (${pea.fecha_revisado_coord || 'Firmado'})` : 'Pendiente revisión coordinador'}
                                        className={`inline-flex items-center gap-1 font-medium ${pea.firma_coord ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-dim/60'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${pea.firma_coord ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                                        Coord. Carrera
                                    </span>
                                    <ChevronRight size={11} className="text-text-dim/40" />

                                    {/* 3. Coordinador Académico */}
                                    <span
                                        title={pea.firma_acad ? `Aprobado por Coordinación Académica (${pea.fecha_revisado_acad || 'Firmado'})` : 'Pendiente aval académico'}
                                        className={`inline-flex items-center gap-1 font-medium ${pea.firma_acad ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-dim/60'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${pea.firma_acad ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                                        Coord. Acad.
                                    </span>
                                    <ChevronRight size={11} className="text-text-dim/40" />

                                    {/* 4. Vicerrectorado */}
                                    <span
                                        title={pea.firma_vicerrector ? `Legalizado por Vicerrectorado (${pea.fecha_aprobado || 'Firmado'})` : 'Pendiente legalización vicerrectorado'}
                                        className={`inline-flex items-center gap-1 font-medium ${pea.firma_vicerrector ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-dim/60'}`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${pea.firma_vicerrector ? 'bg-emerald-500' : 'bg-zinc-400 dark:bg-zinc-600'}`} />
                                        Vicerrector
                                    </span>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAbrirPea(pea.uuid)}
                                        className="h-8 px-3.5 flex items-center gap-1.5 text-xs rounded-md font-medium text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer"
                                    >
                                        <Eye size={13} />
                                        <span>Revisar PEA</span>
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

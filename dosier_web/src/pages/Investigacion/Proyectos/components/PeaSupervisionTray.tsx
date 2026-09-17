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
import { GeistSelect } from '../../../../components/Common/GeistSelect';
import { useNotifications } from '../../../../api/NotificationsContext';
import { getBandejaPeas, type PeaBandejaItemDto } from '../../../../services/peaService';
import {
    getPeriodosAcademicos,
    getPeriodoActivo,
    type PeriodoAcademicoDto
} from '../../../../services/docenteAsignaturasService';

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
                    className: 'badge-vercel-success'
                };
            case 'RevisadoAcad':
                return {
                    label: 'Aval Académico',
                    className: 'badge-vercel-info'
                };
            case 'RevisadoCoord':
                return {
                    label: 'Aval Carrera',
                    className: 'badge-vercel-info'
                };
            case 'EnRevision':
                return {
                    label: 'En Revisión',
                    className: 'badge-vercel-warning'
                };
            case 'Observado':
                return {
                    label: 'Con Observaciones',
                    className: 'badge-vercel-error'
                };
            default:
                return {
                    label: 'Borrador Docente',
                    className: 'badge-vercel-neutral'
                };
        }
    };

    const handleAbrirPea = (uuid: string) => {
        navigate(`/documentacion/workspace/pea-oficial/${uuid}?edit=pea-oficial`);
    };

    return (
        <div className="space-y-6">
            {/* ── BARRA DE FILTROS Y CONTROLES ── */}
            <div className="bg-surface p-4 rounded-xl border border-border-thin shadow-2xs space-y-3">
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
                <div className="badge-vercel-error !rounded-xl !p-4 text-sm flex items-center gap-3">
                    <AlertCircle size={18} />
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
                                className="bg-surface hover:bg-surface-hover/50 p-4 rounded-xl border border-border-thin transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                            >
                                {/* Bloque de Asignatura y Carrera */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-sm font-bold text-text-main tracking-tight truncate">
                                            {pea.nombre_asignatura}
                                        </h3>
                                        {pea.codigo_asignatura && (
                                            <span className="font-mono text-[10.5px] px-1.5 py-0.5 bg-bg-deep rounded text-text-dim border border-border-thin">
                                                {pea.codigo_asignatura}
                                            </span>
                                        )}
                                        <span className={badge.className}>
                                            {badge.label}
                                        </span>
                                        {pea.total_observaciones_pendientes > 0 && (
                                            <span className="badge-vercel-error !text-[10px]">
                                                {pea.total_observaciones_pendientes} Obs. Pendiente{pea.total_observaciones_pendientes > 1 ? 's' : ''}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
                                        <span className="flex items-center gap-1 font-medium text-text-main/80">
                                            <GraduationCap size={13} className="text-brand" />
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

                                {/* Circuito de 4 Firmas (Stepper Compacto) */}
                                <div className="flex items-center gap-1.5 shrink-0 bg-bg-deep px-3 py-2 rounded-lg border border-border-thin text-[10.5px]">
                                    <span className="text-[10px] font-semibold text-text-dim uppercase tracking-wider mr-1">Circuito:</span>
                                    
                                    {/* 1. Docente */}
                                    <span
                                        title={pea.firma_docente ? `Elaborado por Docente (${pea.fecha_elaborado || 'Firmado'})` : 'Pendiente firma docente'}
                                        className={`px-2 py-0.5 rounded font-medium ${pea.firma_docente ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-text-dim/60 line-through'}`}
                                    >
                                        Docente
                                    </span>
                                    <ChevronRight size={10} className="text-text-dim/40" />

                                    {/* 2. Coordinador de Carrera */}
                                    <span
                                        title={pea.firma_coord ? `Revisado por Coordinación de Carrera (${pea.fecha_revisado_coord || 'Firmado'})` : 'Pendiente revisión coordinador'}
                                        className={`px-2 py-0.5 rounded font-medium ${pea.firma_coord ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-text-dim/60'}`}
                                    >
                                        Coord. Carrera
                                    </span>
                                    <ChevronRight size={10} className="text-text-dim/40" />

                                    {/* 3. Coordinador Académico */}
                                    <span
                                        title={pea.firma_acad ? `Aprobado por Coordinación Académica (${pea.fecha_revisado_acad || 'Firmado'})` : 'Pendiente aval académico'}
                                        className={`px-2 py-0.5 rounded font-medium ${pea.firma_acad ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-text-dim/60'}`}
                                    >
                                        Coord. Acad.
                                    </span>
                                    <ChevronRight size={10} className="text-text-dim/40" />

                                    {/* 4. Vicerrectorado */}
                                    <span
                                        title={pea.firma_vicerrector ? `Legalizado por Vicerrectorado (${pea.fecha_aprobado || 'Firmado'})` : 'Pendiente legalización vicerrectorado'}
                                        className={`px-2 py-0.5 rounded font-medium ${pea.firma_vicerrector ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-text-dim/60'}`}
                                    >
                                        Vicerrector
                                    </span>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleAbrirPea(pea.uuid)}
                                        className="btn-vercel-primary h-8 px-3.5 flex items-center gap-1.5 text-xs rounded-lg font-semibold cursor-pointer"
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

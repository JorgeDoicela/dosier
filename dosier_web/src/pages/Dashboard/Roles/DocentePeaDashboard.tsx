import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../api/NotificationsContext';
import {
    docenteAsignaturasService,
    getPeriodosAcademicos,
    getPeriodoActivo,
    type DocenteAsignaturaDto,
    type PeriodoAcademicoDto
} from '../../../services/docenteAsignaturasService';
import { crearPeaDesdeAsignacion } from '../../../services/peaService';
import {
    AlertCircle,
    ArrowRight,
    Calendar
} from 'lucide-react';
import { DocenteAgendaWidget } from './Components/DocenteAgendaWidget';
import { DocenteActividadesPanel } from './Components/DocenteActividadesPanel';

export const DocentePeaDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotifications();

    const [materias, setMaterias] = useState<DocenteAsignaturaDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [creatingPeaId, setCreatingPeaId] = useState<number | null>(null);

    const recargarMaterias = useCallback(async (periodoId: string, silent = false) => {
        if (!periodoId) return;
        try {
            const data = await docenteAsignaturasService.getMisMaterias(periodoId);
            setMaterias(data || []);
        } catch (err) {
            console.error('[DOSIER Docente] Error al sincronizar distributivo:', err);
            if (!silent) {
                addToast('Error de Conexión', 'No se pudieron consultar sus asignaturas asignadas.', 'error');
            }
        }
    }, [addToast]);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const [periodosList, periodoActivo] = await Promise.all([
                getPeriodosAcademicos(),
                getPeriodoActivo()
            ]);
            setPeriodos(periodosList);
            const targetPeriodo = periodoActivo?.id_periodo || periodosList[0]?.id_periodo || '';
            setSelectedPeriodo(targetPeriodo);

            if (targetPeriodo) {
                const data = await docenteAsignaturasService.getMisMaterias(targetPeriodo);
                setMaterias(data || []);
            }
        } catch (err) {
            console.error('[DOSIER Docente] Error al cargar distributivo:', err);
            addToast('Error de Conexión', 'No se pudieron consultar sus asignaturas asignadas.', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // 1. Sincronización en tiempo real vía eventos de dominio (SignalR WebSockets y workflow transitions)
    useEffect(() => {
        const handleProjectsChanged = () => {
            if (selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        };

        window.addEventListener('dosier-projects-changed', handleProjectsChanged);
        return () => {
            window.removeEventListener('dosier-projects-changed', handleProjectsChanged);
        };
    }, [selectedPeriodo, recargarMaterias]);

    // 2. Revalidación automática al recuperar foco o visibilidad de pestaña (revalidateOnFocus)
    useEffect(() => {
        const handleVisibilityAndFocus = () => {
            if (document.visibilityState === 'visible' && selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        };

        window.addEventListener('focus', handleVisibilityAndFocus);
        document.addEventListener('visibilitychange', handleVisibilityAndFocus);
        return () => {
            window.removeEventListener('focus', handleVisibilityAndFocus);
            document.removeEventListener('visibilitychange', handleVisibilityAndFocus);
        };
    }, [selectedPeriodo, recargarMaterias]);

    // 3. Heartbeat pasivo (revalidación periódica cada 30 segundos mientras la pestaña esté activa)
    useEffect(() => {
        if (!selectedPeriodo) return;

        const interval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                recargarMaterias(selectedPeriodo, true);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [selectedPeriodo, recargarMaterias]);

    const handleCrearPea = async (asignacion: DocenteAsignaturaDto) => {
        setCreatingPeaId(asignacion.id_asignacion);
        try {
            const nuevoPea = await crearPeaDesdeAsignacion(asignacion.id_asignacion);
            addToast(
                'PEA Inicializado',
                `Se ha creado el Programa de Estudio de la Asignatura para "${asignacion.nombre_asignatura}".`,
                'success'
            );
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
            const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as { id_pea?: number | string }).id_pea);
            navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al inicializar PEA:', err);
            const msg = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast('Error al Iniciar PEA', msg || 'No se pudo inicializar el PEA.', 'error');
        } finally {
            setCreatingPeaId(null);
        }
    };

    const handleContinuarPea = (asignacion: DocenteAsignaturaDto) => {
        const targetUuid = asignacion.uuid_pea || String(asignacion.id_pea);
        navigate(`/documentacion/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
    };

    // Alerta de observaciones de coordinación
    const materiasObservadas = useMemo(
        () => materias.filter(m => m.estado_pea === 'Observado'),
        [materias]
    );

    const periodoActivoNombre = useMemo(() => {
        const found = periodos.find(p => String(p.id_periodo) === String(selectedPeriodo));
        return found?.detalle || found?.id_periodo;
    }, [periodos, selectedPeriodo]);

    return (
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Panel Curricular Docente
                        </h1>
                        {periodoActivoNombre && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
                                {periodoActivoNombre}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Seguimiento de formulación del PEA, avance de cátedras y agenda académica.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => navigate('/calendario')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                        <Calendar className="w-3.5 h-3.5 text-[#0070f3]" />
                        <span>Calendario</span>
                    </button>

                    <button
                        onClick={() => navigate('/documentacion/mis-proyectos')}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                    >
                        <span>Vista Folio de Proyectos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Alerta de Observaciones Pendientes de Subsanación */}
            {materiasObservadas.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <span className="font-semibold text-sm block">
                            Atención Requerida: Tiene {materiasObservadas.length} PEA{materiasObservadas.length > 1 ? 's' : ''} con observaciones
                        </span>
                        <p className="text-amber-700 dark:text-amber-300">
                            La Comisión Curricular o Coordinación ha registrado observaciones en: {materiasObservadas.map(m => m.nombre_asignatura).join(', ')}. Ingrese al PEA para subsanar los puntos señalados.
                        </p>
                    </div>
                </div>
            )}

            {/* Dashboard Ejecutivo y Operativo: Actividades con Avance vs Agenda de Calendario */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                    <DocenteActividadesPanel
                        materias={materias}
                        loading={loading}
                        onIniciarPea={handleCrearPea}
                        onContinuarPea={handleContinuarPea}
                        creatingPeaId={creatingPeaId}
                    />
                </div>
                <div className="lg:col-span-5">
                    <DocenteAgendaWidget />
                </div>
            </div>
        </div>
    );
};

export default DocentePeaDashboard;

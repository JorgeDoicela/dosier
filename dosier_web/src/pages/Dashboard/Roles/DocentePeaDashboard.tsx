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
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';
import { DocenteAgendaWidget } from './Components/DocenteAgendaWidget';
import { DocenteActividadesPanel } from './Components/DocenteActividadesPanel';

const SYNC_EVENTS = ['dosier-projects-changed'];

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

    // Sincronización continua en tiempo real (SignalR, visibilidad de pestaña y heartbeat pasivo)
    useRealtimeSync({
        onSync: () => {
            if (selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        },
        events: SYNC_EVENTS
    });

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

    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Panel Curricular Docente
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Seguimiento de formulación del PEA, avance de materias y agenda académica.
                </p>
            </div>

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

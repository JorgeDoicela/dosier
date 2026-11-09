import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { salaCarreraService, type SalaCarreraEstadoDto } from '../../../services/salaCarreraService';
import { curriculumProjectService, type DocenteCarreraDto } from '../../../services/curriculumProjectService';
import { docenteAsignaturasService, type PeriodoAcademicoDto } from '../../../services/docenteAsignaturasService';
import { AsignaturaCoDesignWorkspace } from './components/AsignaturaCoDesignWorkspace';
import { useNotifications } from '../../../api/NotificationsContext';
import { useAuth } from '../../../api/AuthContext';

export const SalaCarreraPage: React.FC = () => {
    const { user } = useAuth();
    const { idCarrera: idCarreraParam } = useParams<{ idCarrera: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useNotifications();

    const [carrerasDisponibles, setCarrerasDisponibles] = useState<DocenteCarreraDto[]>([]);
    const [periodosDisponibles, setPeriodosDisponibles] = useState<PeriodoAcademicoDto[]>([]);
    const [isResolvingContext, setIsResolvingContext] = useState(true);
    const [estadoSala, setEstadoSala] = useState<SalaCarreraEstadoDto | null>(null);
    const [isLoadingSala, setIsLoadingSala] = useState(true);

    const esAdmin = useMemo(() => {
        return !!(user?.administrador || user?.roles?.includes('DOSIER_ADMIN'));
    }, [user]);

    // Función auxiliar para resolver período activo oficial
    const resolverPeriodoDefecto = (periodos: PeriodoAcademicoDto[]): string => {
        const pActivo = periodos.find((p: any) => 
            p.es_activo === true || p.es_activo === 1 || p.es_activo === '1' ||
            p.esActivo === true || p.esActivo === 1 ||
            p.id_periodo === 'OCT2026'
        );
        return pActivo?.id_periodo || periodos[0]?.id_periodo || 'OCT2026';
    };

    // 1. Cargar contexto institucional docente (carreras asignadas y períodos oficiales)
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getDocenteCarreras().catch(() => []),
            esAdmin ? curriculumProjectService.getCarrerasInstitucionales().catch(() => []) : Promise.resolve([]),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => [])
        ]).then(([misCarrerasList, todasCarrerasList, periodosList]) => {
            if (!isMounted) return;

            const listaCarreras = (misCarrerasList.length > 0)
                ? misCarrerasList
                : (todasCarrerasList.length > 0 ? todasCarrerasList : misCarrerasList);

            setCarrerasDisponibles(listaCarreras);
            setPeriodosDisponibles(periodosList);

            const periodoDefecto = resolverPeriodoDefecto(periodosList);
            const periodoQuery = searchParams.get('periodo') || periodoDefecto;

            // Si se ingresó sin idCarrera en la URL, auto-resolver a la primera carrera del docente
            if (!idCarreraParam && listaCarreras.length > 0) {
                const primerCarreraId = listaCarreras[0].id_carrera ?? listaCarreras[0].idCarrera ?? 9;
                navigate(`/salas-curriculares/${primerCarreraId}?periodo=${encodeURIComponent(periodoQuery)}`, { replace: true });
                return;
            }
        }).finally(() => {
            if (isMounted) setIsResolvingContext(false);
        });

        return () => { isMounted = false; };
    }, [idCarreraParam, esAdmin]);

    // Resolución de carrera y período actual
    const idCarrera = useMemo(() => {
        if (idCarreraParam) return Number(idCarreraParam);
        if (carrerasDisponibles.length > 0) {
            return carrerasDisponibles[0].id_carrera ?? carrerasDisponibles[0].idCarrera ?? 9;
        }
        return 9;
    }, [idCarreraParam, carrerasDisponibles]);

    const periodoActual = useMemo(() => {
        const queryP = searchParams.get('periodo');
        if (queryP) return queryP;
        return resolverPeriodoDefecto(periodosDisponibles);
    }, [searchParams, periodosDisponibles]);

    const idAsignaturaParam = searchParams.get('asignatura');
    const idExpedienteParam = searchParams.get('expediente');

    // 2. Cargar estado de la sala de la carrera
    const cargarEstado = useCallback(async () => {
        if (!idCarrera) return;
        try {
            const data = await salaCarreraService.getEstado(idCarrera, periodoActual);
            setEstadoSala(data);
        } catch (err: any) {
            console.error('Error al cargar estado de la sala:', err);
            addToast('Error de Conexión', err.message || 'No se pudo conectar a la sala de carrera.', 'error');
        } finally {
            setIsLoadingSala(false);
        }
    }, [idCarrera, periodoActual, addToast]);

    useEffect(() => {
        if (!idCarrera) return;
        cargarEstado();
        const timer = setInterval(cargarEstado, 12000);
        return () => clearInterval(timer);
    }, [idCarrera, periodoActual, cargarEstado]);

    // 3. Resolver la asignatura activa (por expediente, por asignatura o la primera)
    const asignaturaActiva = useMemo(() => {
        if (!estadoSala?.asignaturas || estadoSala.asignaturas.length === 0) return null;
        if (idExpedienteParam) {
            const buscada = estadoSala.asignaturas.find(a => 
                (a.idExpediente === Number(idExpedienteParam) || a.id_expediente === Number(idExpedienteParam))
            );
            if (buscada) return buscada;
        }
        if (idAsignaturaParam) {
            const buscada = estadoSala.asignaturas.find(a => 
                (a.idAsignatura === Number(idAsignaturaParam) || a.id_asignatura === Number(idAsignaturaParam))
            );
            if (buscada) return buscada;
        }
        return estadoSala.asignaturas[0];
    }, [idExpedienteParam, idAsignaturaParam, estadoSala?.asignaturas]);

    // 4. Cambiar de asignatura al vuelo en el dropdown
    const handleCambiarAsignatura = (targetId: number, isExpediente: boolean = false) => {
        const params = new URLSearchParams(searchParams);
        if (isExpediente) {
            params.set('expediente', String(targetId));
            params.delete('asignatura');
        } else {
            params.set('asignatura', String(targetId));
            params.delete('expediente');
        }
        setSearchParams(params);
    };

    // 5. Cambiar de carrera
    const handleCambiarCarrera = (nuevaIdCarrera: number) => {
        navigate(`/salas-curriculares/${nuevaIdCarrera}?periodo=${encodeURIComponent(periodoActual)}`);
    };

    // 6. Cambiar de período
    const handleCambiarPeriodo = (nuevoPeriodo: string) => {
        navigate(`/salas-curriculares/${idCarrera}?periodo=${encodeURIComponent(nuevoPeriodo)}`);
    };

    // 7. Volver al tablero general (cero pantallas intermedias)
    const handleVolverAlDashboard = () => {
        navigate('/dashboard');
    };

    if (isResolvingContext || (isLoadingSala && !estadoSala)) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-deep text-text-dim">
                <Loader2 size={36} className="animate-spin text-[#0070f3] mb-3 stroke-[1.75]" />
                <p className="text-xs font-medium">Iniciando Sala Curricular Colegiada...</p>
            </div>
        );
    }

    if (!estadoSala || !asignaturaActiva) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-deep p-6 text-center text-text-dim">
                <p className="text-sm font-semibold text-text-main mb-2">No se detectaron asignaturas para esta carrera</p>
                <p className="text-xs max-w-md mb-4">Verifica la asignación de distributivo y período académico en SIGAFI.</p>
                <button
                    onClick={handleVolverAlDashboard}
                    className="px-4 py-2 bg-[#0070f3] text-white text-xs font-semibold rounded-lg hover:bg-[#005bb5] cursor-pointer"
                >
                    Volver al Tablero
                </button>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // ESPACIO DE CO-DISEÑO CURRICULAR DIRECTO (DOSIERBuilderShell)
    // ─────────────────────────────────────────────────────────────
    return (
        <AsignaturaCoDesignWorkspace
            asignatura={asignaturaActiva}
            asignaturas={estadoSala.asignaturas}
            onCambiarAsignatura={handleCambiarAsignatura}
            idCarrera={idCarrera}
            idPeriodo={periodoActual}
            carreraNombre={estadoSala.nombreCarrera || estadoSala.nombre_carrera || 'Carrera ISTPET'}
            carrerasDisponibles={carrerasDisponibles}
            onCambiarCarrera={handleCambiarCarrera}
            periodosDisponibles={periodosDisponibles}
            onCambiarPeriodo={handleCambiarPeriodo}
            onVolver={handleVolverAlDashboard}
            onBorradorActualizado={cargarEstado}
        />
    );
};

export default SalaCarreraPage;
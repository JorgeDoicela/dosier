import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AlertCircle,
    Search,
    Loader2,
    GraduationCap,
    Users,
    UserCheck,
    Clock,
    UserPlus
} from 'lucide-react';
import { PageHeader } from '../../components/Common/PageHeader';
import { GeistSelect } from '../../components/Common/GeistSelect';
import { useNotifications } from '../../api/NotificationsContext';
import { useAuth } from '../../api/AuthContext';
import {
    getMisMaterias,
    getPeriodoActivo,
    getPeriodosAcademicos
} from '../../services/docenteAsignaturasService';
import type {
    DocenteAsignaturaDto,
    PeriodoAcademicoDto
} from '../../services/docenteAsignaturasService';
import { crearPeaDesdeAsignacion, getPeasOtrosDocentes, solicitarColaboracion, cancelarSolicitudColaboracion } from '../../services/peaService';
import type { PeaBandejaItemDto } from '../../services/peaService';
import { configuracionService } from '../../services/configuracionService';
import { SolicitarColaboracionModal } from './components/SolicitarColaboracionModal';
import { CancelarColaboracionModal } from './components/CancelarColaboracionModal';
import {
    recordRecentSubjectOpen,
    sortSubjectsByRecentOpen
} from '../../utils/recentSubjectStorage';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

const formatModalidad = (mod?: string, idModalidad?: number): string => {
    if (mod && mod.trim()) {
        const clean = mod.trim();
        const lower = clean.toLowerCase();
        if (lower.includes('linea') || lower.includes('línea') || lower.includes('virtual') || lower.includes('online')) {
            return 'En línea';
        }
        if (lower.includes('semipresencial')) {
            return 'Semipresencial';
        }
        if (lower.includes('hibrid') || lower.includes('híbrid')) {
            return 'Híbrida';
        }
        if (lower.includes('presencial')) {
            return 'Presencial';
        }
        return clean;
    }
    if (idModalidad === 2 || idModalidad === 3) {
        return 'En línea';
    }
    return 'Presencial';
};

export const MisAsignaturasPage: React.FC = () => {
    const navigate = useNavigate();
    const { addToast } = useNotifications();
    const { isVicerrector, activeRole, isAdmin } = useAuth();

    const effectiveRole = activeRole || (
        isAdmin ? 'DOSIER_ADMIN' :
        isVicerrector ? 'DOSIER_VICERRECTOR' : ''
    );
    const isVicerrectorMode = effectiveRole === 'DOSIER_VICERRECTOR' || (isVicerrector && effectiveRole !== 'DOSIER_ADMIN');

    useEffect(() => {
        if (isVicerrectorMode) {
            navigate('/documentacion', { replace: true });
        }
    }, [isVicerrectorMode, navigate]);

    const [vistaActiva, setVistaActiva] = useState<'mis_asignaturas' | 'otros_docentes'>('mis_asignaturas');
    const [materias, setMaterias] = useState<DocenteAsignaturaDto[]>([]);
    const [otrosPeas, setOtrosPeas] = useState<PeaBandejaItemDto[]>([]);
    const [periodos, setPeriodos] = useState<PeriodoAcademicoDto[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingOtros, setLoadingOtros] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recentsVersion, setRecentsVersion] = useState(0);

    // Filtros
    const [search, setSearch] = useState('');
    const [filterEstado, setFilterEstado] = useState<string>('todos');
    const [filterCarrera, setFilterCarrera] = useState<string>('todas');
    const [filterModalidad, setFilterModalidad] = useState<string>('todas');
    const [filterDocente, setFilterDocente] = useState<string>('todos');

    // Catálogo de estados dinámicos desde la BD (tabla doc_config_workflow)
    const [workflowEstados, setWorkflowEstados] = useState<Array<{ estado: string; etiqueta?: string; color?: string }>>([]);

    useEffect(() => {
        configuracionService.getWorkflowEstados()
            .then(data => {
                if (Array.isArray(data)) {
                    setWorkflowEstados(data);
                }
            })
            .catch(err => {
                console.warn('[DOSIER] No se pudieron cargar estados del workflow desde BD:', err);
            });
    }, []);

    // Estado transaccional por asignación
    const [creatingPeaId, setCreatingPeaId] = useState<number | null>(null);
    const [requestingColabId, setRequestingColabId] = useState<number | null>(null);
    const [colabModalPea, setColabModalPea] = useState<PeaBandejaItemDto | null>(null);
    const [cancelarModalPea, setCancelarModalPea] = useState<PeaBandejaItemDto | null>(null);
    const [isCanceling, setIsCanceling] = useState<boolean>(false);

    const recargarMaterias = useCallback(async (periodoId: string, silent = false) => {
        if (!periodoId) return;
        if (!silent) setRefreshing(true);
        try {
            const [misMaterias, otros] = await Promise.all([
                getMisMaterias(periodoId).catch(() => []),
                getPeasOtrosDocentes({ idPeriodo: periodoId }).catch(() => [])
            ]);
            setMaterias(misMaterias);
            setOtrosPeas(otros);
            setError(null);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al actualizar materias:', err);
            if (!silent) {
                setError('Error al actualizar las asignaturas del período seleccionado.');
            }
        } finally {
            if (!silent) setRefreshing(false);
        }
    }, []);

    const cargarPeriodosYDatos = useCallback(async () => {
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

            if (initialPeriod) {
                const [misMaterias, otros] = await Promise.all([
                    getMisMaterias(initialPeriod).catch(() => []),
                    getPeasOtrosDocentes({ idPeriodo: initialPeriod }).catch(() => [])
                ]);
                setMaterias(misMaterias);
                setOtrosPeas(otros);
            }
        } catch (err: unknown) {
            console.error('[DOSIER] Error al cargar períodos y materias:', err);
            setError('No se pudo cargar la información curricular institucional. Verifique la conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPeriodosYDatos();
    }, [cargarPeriodosYDatos]);

    // Sincronización continua en tiempo real (SignalR, visibilidad de pestaña y heartbeat pasivo)
    useRealtimeSync({
        onSync: () => {
            if (selectedPeriodo) {
                recargarMaterias(selectedPeriodo, true);
            }
        },
        events: ['dosier-projects-changed']
    });

    // 4. Sincronización del orden de asignaturas recientemente abiertas
    useEffect(() => {
        const handleRecentsChanged = () => {
            setRecentsVersion(v => v + 1);
        };

        window.addEventListener('dosier-recents-updated', handleRecentsChanged);
        window.addEventListener('dosier-project-preferences-changed', handleRecentsChanged);

        return () => {
            window.removeEventListener('dosier-recents-updated', handleRecentsChanged);
            window.removeEventListener('dosier-project-preferences-changed', handleRecentsChanged);
        };
    }, []);

    const handlePeriodoChange = async (newPeriodoId: string | number) => {
        const idStr = String(newPeriodoId);
        setSelectedPeriodo(idStr);
        await recargarMaterias(idStr, false);
    };

    const handleCrearPea = async (asignacion: DocenteAsignaturaDto) => {
        recordRecentSubjectOpen(asignacion);
        setCreatingPeaId(asignacion.id_asignacion);
        try {
            const nuevoPea = await crearPeaDesdeAsignacion(asignacion.id_asignacion);
            if (nuevoPea) {
                recordRecentSubjectOpen({
                    id_asignacion: asignacion.id_asignacion,
                    uuid_pea: nuevoPea.uuid,
                    id_pea: nuevoPea.idPea || (nuevoPea as { id_pea?: number }).id_pea
                });
            }
            addToast(
                'PEA Inicializado',
                `Se ha creado el Programa de Estudio de la Asignatura para "${asignacion.nombre_asignatura}".`,
                'success'
            );

            // Notificar a todos los escuchas que el estado de los proyectos curriculares ha cambiado
            window.dispatchEvent(new CustomEvent('dosier-projects-changed'));

            // Redirigir al workspace con el UUID o ID del PEA oficial preservando la ruta de mis-proyectos
            const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as { id_pea?: number | string }).id_pea);
            navigate(`/documentacion/mis-proyectos/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al inicializar PEA:', err);
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast(
                'Error al Iniciar PEA',
                message || 'No se pudo inicializar el PEA desde la asignación institucional.',
                'error'
            );
        } finally {
            setCreatingPeaId(null);
        }
    };

    const handleContinuarPea = (asignacion: DocenteAsignaturaDto) => {
        recordRecentSubjectOpen(asignacion);
        const targetUuid = asignacion.uuid_pea || String(asignacion.id_pea);
        navigate(`/documentacion/mis-proyectos/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
    };

    const handleSolicitarColaborar = (pea: PeaBandejaItemDto) => {
        setColabModalPea(pea);
    };

    const ejecutarSolicitudColaborar = async (pea: PeaBandejaItemDto, motivo?: string) => {
        if (!pea.id_asignacion) {
            addToast('Error', 'La asignatura no cuenta con un código de asignación válido.', 'error');
            return;
        }

        setRequestingColabId(pea.id_asignacion);
        try {
            const res = await solicitarColaboracion({
                idAsignacion: pea.id_asignacion,
                idPea: pea.id_pea && pea.id_pea > 0 ? pea.id_pea : undefined,
                uuidPea: pea.uuid || undefined,
                motivo
            });

            setOtrosPeas(prev => prev.map(p => {
                if (p.id_asignacion === pea.id_asignacion) {
                    return {
                        ...p,
                        estado_colaboracion: 'Pendiente',
                        uuid_colaboracion: res.uuid
                    };
                }
                return p;
            }));

            addToast(
                'Solicitud Enviada',
                `Se notificó en el sistema y por correo al docente titular (${pea.nombre_docente_elaborador || 'Docente'}) para autorizar su colaboración en "${pea.nombre_asignatura}".`,
                'success'
            );
        } catch (err: unknown) {
            console.error('[DOSIER] Error al solicitar colaboración:', err);
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast(
                'Error al Enviar Solicitud',
                message || 'No se pudo enviar la solicitud de colaboración al docente titular.',
                'error'
            );
        } finally {
            setRequestingColabId(null);
        }
    };

    const handleEjecutarCancelarColaboracion = async () => {
        if (!cancelarModalPea) return;
        const targetId = cancelarModalPea.uuid || String(cancelarModalPea.id_asignacion || cancelarModalPea.id_pea);
        setIsCanceling(true);
        try {
            await cancelarSolicitudColaboracion(targetId);
            setOtrosPeas(prev => prev.map(p => {
                if (p.id_asignacion === cancelarModalPea.id_asignacion) {
                    return {
                        ...p,
                        estado_colaboracion: undefined,
                        uuid_colaboracion: undefined
                    };
                }
                return p;
            }));
            addToast(
                'Solicitud Retirada',
                `Se ha cancelado la solicitud de colaboración para "${cancelarModalPea.nombre_asignatura}".`,
                'info'
            );
            setCancelarModalPea(null);
        } catch (err: unknown) {
            console.error('[DOSIER] Error al cancelar colaboración:', err);
            const message = err && typeof err === 'object' && 'response' in err
                ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
            addToast('Error', message || 'No se pudo retirar la solicitud de colaboración.', 'error');
        } finally {
            setIsCanceling(false);
        }
    };

    const handleColaborarPea = async (pea: PeaBandejaItemDto) => {
        if (pea.id_pea && pea.id_pea > 0 && pea.uuid) {
            recordRecentSubjectOpen({
                id_asignacion: pea.id_asignacion || pea.id_pea,
                uuid_pea: pea.uuid,
                id_pea: pea.id_pea
            });
            navigate(`/documentacion/mis-proyectos/workspace/pea-oficial/${pea.uuid}?edit=pea-oficial`);
            return;
        }

        // Si la materia aún está NoIniciada, instanciar su PEA oficial desde la asignación de SIGAFI
        if (pea.id_asignacion) {
            setCreatingPeaId(pea.id_asignacion);
            try {
                const nuevoPea = await crearPeaDesdeAsignacion(pea.id_asignacion);
                if (nuevoPea) {
                    recordRecentSubjectOpen({
                        id_asignacion: pea.id_asignacion,
                        uuid_pea: nuevoPea.uuid,
                        id_pea: nuevoPea.idPea || (nuevoPea as { id_pea?: number }).id_pea
                    });
                }
                addToast(
                    'PEA Inicializado',
                    `Se ha generado el espacio de trabajo para "${pea.nombre_asignatura}" asignada al docente titular ${pea.nombre_docente_elaborador || ''}.`,
                    'success'
                );
                window.dispatchEvent(new CustomEvent('dosier-projects-changed'));
                const targetUuid = nuevoPea.uuid || String(nuevoPea.idPea || (nuevoPea as { id_pea?: number | string }).id_pea);
                navigate(`/documentacion/mis-proyectos/workspace/pea-oficial/${targetUuid}?edit=pea-oficial`);
            } catch (err: unknown) {
                console.error('[DOSIER] Error al inicializar PEA colegiado:', err);
                const message = err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
                addToast(
                    'Error al Iniciar PEA',
                    message || 'No se pudo inicializar el PEA desde la asignación institucional.',
                    'error'
                );
            } finally {
                setCreatingPeaId(null);
            }
        }
    };

    // Diccionario dinámico de etiquetas institucionales con fallback a doc_config_workflow
    const getEstadoLabel = useCallback((estado: string): string => {
        if (!estado) return 'Desconocido';

        // 1. Buscar coincidencia en la tabla doc_config_workflow de la BD
        const dbMatch = workflowEstados.find(
            w => w.estado?.toLowerCase() === estado.toLowerCase()
        );
        if (dbMatch?.etiqueta) return dbMatch.etiqueta;

        // 2. Diccionario normativo institucional oficial
        const labels: Record<string, string> = {
            'NoIniciado': 'No Iniciado',
            'Borrador': 'Borrador',
            'EnRevision': 'En Revisión',
            'Observado': 'Con Observaciones',
            'Corregido': 'Corregido',
            'RevisadoCoord': 'Aval de Carrera',
            'RevisadoAcad': 'Aval Académico',
            'Aprobado': 'Aprobado Oficial',
            'Publicado': 'Publicado',
            'Rechazado': 'Rechazado'
        };
        return labels[estado] || estado;
    }, [workflowEstados]);

    // Lista única de carreras para filtro combinando materias propias y de otros docentes
    const carrerasDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            if (m.nombre_carrera) unique.add(m.nombre_carrera);
        });
        otrosPeas.forEach(p => {
            if (p.nombre_carrera) unique.add(p.nombre_carrera);
        });
        return Array.from(unique).sort();
    }, [materias, otrosPeas]);

    // Lista única de modalidades normalizadas para filtro
    const modalidadesDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            const mod = formatModalidad(m.nombre_modalidad, m.id_modalidad);
            if (mod) unique.add(mod);
        });
        otrosPeas.forEach(p => {
            const mod = formatModalidad(p.modalidad);
            if (mod) unique.add(mod);
        });
        return Array.from(unique).sort();
    }, [materias, otrosPeas]);

    // Lista única y dinámica de estados presentes
        // Lista única de docentes disponibles para filtro (PEAs de otros docentes)
    const docentesDisponibles = useMemo(() => {
        const unique = new Set<string>();
        otrosPeas.forEach(p => {
            const nom = p.nombre_docente_elaborador?.trim();
            if (nom) unique.add(nom);
        });
        return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }, [otrosPeas]);

    useEffect(() => {
        if (filterDocente !== 'todos' && !docentesDisponibles.includes(filterDocente)) {
            setFilterDocente('todos');
        }
    }, [docentesDisponibles, filterDocente]);

    const estadosDisponibles = useMemo(() => {
        const unique = new Set<string>();
        materias.forEach(m => {
            if (m.estado_pea) unique.add(m.estado_pea);
        });
        otrosPeas.forEach(p => {
            if (p.estado) unique.add(p.estado);
        });
        return Array.from(unique)
            .map(estado => ({
                value: estado,
                label: getEstadoLabel(estado)
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
    }, [materias, otrosPeas, getEstadoLabel]);

    // Resetear filtros si la selección previa ya no existe en el conjunto disponible
    useEffect(() => {
        if (filterCarrera !== 'todas' && !carrerasDisponibles.includes(filterCarrera)) {
            setFilterCarrera('todas');
        }
    }, [carrerasDisponibles, filterCarrera]);

    useEffect(() => {
        if (filterModalidad !== 'todas' && !modalidadesDisponibles.includes(filterModalidad)) {
            setFilterModalidad('todas');
        }
    }, [modalidadesDisponibles, filterModalidad]);

    useEffect(() => {
        if (filterEstado !== 'todos' && !estadosDisponibles.some(e => e.value.toLowerCase() === filterEstado.toLowerCase())) {
            setFilterEstado('todos');
        }
    }, [estadosDisponibles, filterEstado]);

    // Filtrado en vivo y ordenamiento invisible por más recientemente abierto (Mis Asignaturas)
    const materiasFiltradas = useMemo(() => {
        const filtradas = materias.filter(m => {
            const modNombre = formatModalidad(m.nombre_modalidad, m.id_modalidad);
            const estadoLabel = getEstadoLabel(m.estado_pea || '');

            const matchesSearch =
                m.nombre_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.codigo_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                m.nombre_carrera?.toLowerCase().includes(search.toLowerCase()) ||
                m.paralelo?.toLowerCase().includes(search.toLowerCase()) ||
                modNombre.toLowerCase().includes(search.toLowerCase()) ||
                estadoLabel.toLowerCase().includes(search.toLowerCase());

            const matchesEstado =
                filterEstado === 'todos' ||
                m.estado_pea?.toLowerCase() === filterEstado.toLowerCase();

            const matchesCarrera = filterCarrera === 'todas' || m.nombre_carrera === filterCarrera;

            const matchesModalidad =
                filterModalidad === 'todas' ||
                modNombre.toLowerCase() === filterModalidad.toLowerCase();

            const matchesDocente =
                filterDocente === 'todos' ||
                ((m as any).nombre_docente_elaborador || '').trim().toLowerCase() === filterDocente.toLowerCase();

            return matchesSearch && matchesEstado && matchesCarrera && matchesModalidad && matchesDocente;
        });

        // Algoritmo invisible: ubica de primero la materia más recientemente abierta, sea del estado que sea
        return sortSubjectsByRecentOpen(filtradas);
    }, [materias, search, filterEstado, filterCarrera, filterModalidad, getEstadoLabel, recentsVersion]);

    // Filtrado en vivo y ordenamiento invisible para PEAs de otros docentes (para solicitar colaboración)
    const otrosPeasFiltrados = useMemo(() => {
        const filtrados = otrosPeas.filter(p => {
            const modNombre = formatModalidad(p.modalidad);

            const matchesSearch =
                p.nombre_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                p.codigo_asignatura?.toLowerCase().includes(search.toLowerCase()) ||
                p.nombre_carrera?.toLowerCase().includes(search.toLowerCase()) ||
                p.nombre_docente_elaborador?.toLowerCase().includes(search.toLowerCase()) ||
                modNombre.toLowerCase().includes(search.toLowerCase());

            const matchesCarrera = filterCarrera === 'todas' || p.nombre_carrera === filterCarrera;

            const matchesModalidad =
                filterModalidad === 'todas' ||
                modNombre.toLowerCase() === filterModalidad.toLowerCase();

            const matchesDocente =
                filterDocente === 'todos' ||
                (p.nombre_docente_elaborador || '').trim().toLowerCase() === filterDocente.toLowerCase();

            return matchesSearch && matchesCarrera && matchesModalidad && matchesDocente;
        });

        // Ordenamiento invisible por uso reciente
        return sortSubjectsByRecentOpen(filtrados.map(p => ({
            ...p,
            id_asignacion: p.id_asignacion ?? p.id_pea,
            uuid_pea: p.uuid,
            id_pea: p.id_pea
        })));
    }, [otrosPeas, search, filterCarrera, filterModalidad, filterDocente, recentsVersion]);

    const renderEstadoBadge = (estado: string) => {
        const label = getEstadoLabel(estado);
        switch (estado) {
            case 'NoAplica':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span>Acompañamiento</span>
                    </span>
                );
            case 'NoIniciado':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span>{label}</span>
                    </span>
                );
            case 'Borrador':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'EnRevision':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'Observado':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'Corregido':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'RevisadoCoord':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 dark:text-cyan-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'RevisadoAcad':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{label}</span>
                    </span>
                );
            case 'Aprobado':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{label}</span>
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                        <span>{label}</span>
                    </span>
                );
        }
    };

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Cabecera Principal con Selector de Período Oficial y Botón de Alternancia */}
            <PageHeader
                title="Mis Instrumentos Curriculares - PEA"
                description="Gestión microcurricular y formulación de Programas de Estudio de la Asignatura según distributivo oficial SIGAFI."
            >
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-72 sm:w-80">
                        <GeistSelect
                            value={selectedPeriodo}
                            onChange={handlePeriodoChange}
                            placeholder="Seleccione período..."
                            disabled={loading || periodos.length === 0}
                        >
                            {periodos.map(p => {
                                const nombreLimpio = p.detalle?.trim();
                                const etiqueta = nombreLimpio 
                                    ? `${nombreLimpio}${p.es_activo ? ' (Activo)' : ''}`
                                    : `${p.id_periodo}${p.es_activo ? ' (Activo)' : ''}`;
                                return (
                                    <option key={p.id_periodo} value={p.id_periodo}>
                                        {etiqueta}
                                    </option>
                                );
                            })}
                        </GeistSelect>
                    </div>
                </div>
            </PageHeader>

            {/* Pestañas sobre riel plano continuo */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
                    <button
                        type="button"
                        onClick={() => {
                            setVistaActiva('mis_asignaturas');
                            setFilterDocente('todos');
                        }}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            vistaActiva === 'mis_asignaturas'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        <span>Mis Asignaturas</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            vistaActiva === 'mis_asignaturas'
                                ? 'bg-blue-50 text-[#0070f3] dark:bg-blue-950/50 dark:text-blue-400'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                            {materias.length}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setVistaActiva('otros_docentes')}
                        className={`py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                            vistaActiva === 'otros_docentes'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400'
                                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        <Users className="w-3.5 h-3.5" />
                        <span>PEAs de Otros Docentes</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            vistaActiva === 'otros_docentes'
                                ? 'bg-blue-50 text-[#0070f3] dark:bg-blue-950/50 dark:text-blue-400'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                            {otrosPeas.length}
                        </span>
                    </button>
                </nav>
            </div>

            {/* Mensaje de Error si ocurre */}
            {error && (
                <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Barra de Búsqueda y Filtros de Estado */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        placeholder="Buscar por asignatura, código o carrera..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {carrerasDisponibles.length > 1 && (
                        <div className="w-48 shrink-0">
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

                    {modalidadesDisponibles.length > 1 && (
                        <div className="w-44 shrink-0">
                            <GeistSelect
                                value={filterModalidad}
                                onChange={val => setFilterModalidad(String(val))}
                                options={[
                                    { value: 'todas', label: 'Todas las Modalidades' },
                                    ...modalidadesDisponibles.map(m => ({ value: m, label: m }))
                                ]}
                                placeholder="Modalidad..."
                            />
                        </div>
                    )}

                    {vistaActiva === 'otros_docentes' && docentesDisponibles.length > 1 && (
                        <div className="w-56 shrink-0">
                            <GeistSelect
                                value={filterDocente}
                                onChange={val => setFilterDocente(String(val))}
                                options={[
                                    { value: 'todos', label: 'Todos los Docentes' },
                                    ...docentesDisponibles.map(d => ({ value: d, label: d }))
                                ]}
                                placeholder="Docente..."
                            />
                        </div>
                    )}

                    {vistaActiva === 'mis_asignaturas' && estadosDisponibles.length > 0 && (
                        <div className="w-44 shrink-0">
                            <GeistSelect
                                value={filterEstado}
                                onChange={val => setFilterEstado(String(val))}
                                options={[
                                    { value: 'todos', label: 'Todos los Estados' },
                                    ...estadosDisponibles
                                ]}
                                placeholder="Estado del PEA..."
                            />
                        </div>
                    )}

                    {(search || filterCarrera !== 'todas' || filterModalidad !== 'todas' || filterEstado !== 'todos' || (vistaActiva === 'otros_docentes' && filterDocente !== 'todos')) && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setFilterCarrera('todas');
                                setFilterModalidad('todas');
                                setFilterEstado('todos');
                                setFilterDocente('todos');
                            }}
                            className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer shrink-0"
                            title="Restablecer filtros"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Listado de Asignaturas / Instrumentos PEA */}
            {vistaActiva === 'mis_asignaturas' ? (
                loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                        <p className="text-sm">Consultando distributivo académico y estado de PEAs...</p>
                    </div>
                ) : materiasFiltradas.length === 0 ? (
                    <div className="py-16 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3 bg-white dark:bg-zinc-950">
                        <GraduationCap className="w-10 h-10 mx-auto text-zinc-400" />
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            No se encontraron asignaturas
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            {search || filterEstado !== 'todos' || filterCarrera !== 'todas' || filterModalidad !== 'todas' || filterDocente !== 'todos'
                                ? 'No hay materias que coincidan con los filtros aplicados en el período actual.'
                                : 'No existen materias asignadas para su perfil docente en este período lectivo.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {materiasFiltradas.map((materia) => {
                            const tienePea = Boolean(materia.id_pea && materia.id_pea > 0);
                            const isCreating = creatingPeaId === materia.id_asignacion;
                            const isExtra = Boolean(materia.es_extracurricular || materia.estado_pea === 'NoAplica');

                            const handleCardClick = () => {
                                if (isCreating) return;
                                if (isExtra) {
                                    addToast(
                                        'Actividad Institucional',
                                        `"${materia.nombre_asignatura}" es una carga de acompañamiento que no requiere formulación de PEA microcurricular.`,
                                        'info'
                                    );
                                    return;
                                }
                                if (tienePea) {
                                    handleContinuarPea(materia);
                                } else {
                                    handleCrearPea(materia);
                                }
                            };

                            return (
                                <div
                                    key={materia.id_asignacion}
                                    role="button"
                                    tabIndex={0}
                                    onClick={handleCardClick}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleCardClick();
                                        }
                                    }}
                                    className="group rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 hover:border-[#0070f3] dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 dark:focus:ring-offset-zinc-950 text-left"
                                >
                                    {/* Top: Carrera y Estado */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            {carrerasDisponibles.length > 1 ? (
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                                    <span className="truncate">{materia.nombre_carrera}</span>
                                                </div>
                                            ) : <div />}
                                            <div>{renderEstadoBadge(materia.estado_pea)}</div>
                                        </div>

                                        {/* Título de la Asignatura */}
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                                            {materia.nombre_asignatura}
                                        </h2>

                                        {/* Metadatos Curriculares */}
                                        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                            {materia.nombre_nivel && <span>{materia.nombre_nivel}</span>}
                                            {materia.nombre_nivel && (
                                                <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                            )}
                                            <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                {formatModalidad(materia.nombre_modalidad, materia.id_modalidad)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Botón de Acción Principal */}
                                    <div className="pt-2 flex items-center justify-end border-t border-slate-100 dark:border-zinc-900">
                                        <div className="flex items-center gap-2">
                                            {isExtra ? (
                                                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                                                    No requiere PEA
                                                </span>
                                            ) : tienePea ? (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleContinuarPea(materia);
                                                    }}
                                                    className="bg-[#0070f3] group-hover:bg-[#0060df] text-white shadow-xs inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                                                >
                                                    <span>{materia.estado_pea === 'Aprobado' ? 'Ver PEA' : 'Continuar PEA'}</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCrearPea(materia);
                                                    }}
                                                    disabled={isCreating}
                                                    className="bg-[#0070f3] group-hover:bg-[#0060df] text-white shadow-xs inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                                >
                                                    <span>{isCreating ? 'Inicializando...' : 'Elaborar PEA'}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                /* Vista de PEAs de Otros Docentes */
                loadingOtros ? (
                    <div className="py-20 flex flex-col items-center justify-center text-zinc-400 space-y-3">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                        <p className="text-sm">Consultando PEAs formulados por otros docentes...</p>
                    </div>
                ) : otrosPeasFiltrados.length === 0 ? (
                    <div className="py-16 px-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-center space-y-3 bg-white dark:bg-zinc-950">
                        <GraduationCap className="w-10 h-10 mx-auto text-zinc-400" />
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            No se encontraron PEAs de otros docentes
                        </h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md mx-auto">
                            {search || filterEstado !== 'todos' || filterCarrera !== 'todas' || filterModalidad !== 'todas' || filterDocente !== 'todos'
                                ? 'No hay PEAs de otros docentes que coincidan con los filtros aplicados en el período actual.'
                                : 'No existen PEAs formulados por otros docentes en este período académico.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {otrosPeasFiltrados.map((pea) => {
                            const isCreating = creatingPeaId === pea.id_asignacion;
                            const isRequesting = requestingColabId === pea.id_asignacion;
                            const tienePea = Boolean(pea.id_pea && pea.id_pea > 0 && pea.uuid);
                            const estadoColab = pea.estado_colaboracion;

                            const keyIdentifier = (pea.id_pea && pea.id_pea > 0)
                                ? `pea-${pea.id_pea}`
                                : (pea.uuid && pea.uuid.length > 0)
                                    ? `uuid-${pea.uuid}`
                                    : (pea.id_asignacion && pea.id_asignacion > 0)
                                        ? `asig-${pea.id_asignacion}`
                                        : `asig-${pea.id_carrera}-${pea.id_asignatura}-${pea.id_docente_elaborador || 'doc'}-${pea.paralelo || 'U'}`;

                            return (
                                <div
                                    key={keyIdentifier}
                                    className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 flex flex-col justify-between space-y-4 text-left"
                                >
                                    {/* Top: Carrera */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            {carrerasDisponibles.length > 1 && (
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">
                                                    <span className="truncate">{pea.nombre_carrera || 'Carrera Institucional'}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Título de la Asignatura */}
                                        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug line-clamp-2">
                                            {pea.nombre_asignatura}
                                        </h2>

                                        {/* Docente Titular y Metadatos */}
                                        <div className="space-y-1.5 pt-1">
                                            <div className="text-xs text-zinc-600 dark:text-zinc-300 font-medium flex items-center gap-1.5 truncate">
                                                <UserCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                                <span className="text-zinc-400">Titular:</span>
                                                <span className="truncate">{pea.nombre_docente_elaborador || 'Docente Asignado'}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                {pea.ciclo && <span>{pea.ciclo}</span>}
                                                {pea.ciclo && (
                                                    <span className="text-zinc-300 dark:text-zinc-700">·</span>
                                                )}
                                                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                                                    {formatModalidad(pea.modalidad)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Botón de Acción Principal - Solo aquí se ejecutan las acciones */}
                                    <div className="pt-2 flex items-center justify-end border-t border-slate-100 dark:border-zinc-900">
                                        {estadoColab === 'Aprobada' ? (
                                            <button
                                                type="button"
                                                onClick={() => handleColaborarPea(pea)}
                                                disabled={isCreating}
                                                className="bg-[#0070f3] hover:bg-[#0060df] text-white shadow-xs inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                <span>
                                                    {isCreating
                                                        ? 'Inicializando...'
                                                        : tienePea
                                                            ? (pea.estado === 'Aprobado' ? 'Ver PEA' : 'Colaborar / Ver PEA')
                                                            : 'Iniciar y Colaborar'}
                                                </span>
                                            </button>
                                        ) : estadoColab === 'Pendiente' ? (
                                            <div className="flex flex-wrap items-center justify-end gap-2">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                                                    <Clock className="w-3.5 h-3.5 animate-pulse text-amber-500" />
                                                    <span>Solicitud Pendiente</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => setCancelarModalPea(pea)}
                                                    className="text-xs text-slate-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 transition-colors cursor-pointer font-medium"
                                                    title="Retirar o anular la solicitud de colaboración pendiente"
                                                >
                                                    Quitar Solicitud
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSolicitarColaborar(pea)}
                                                disabled={isRequesting}
                                                className="bg-[#0070f3] hover:bg-[#0060df] text-white shadow-xs inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                                            >
                                                {isRequesting ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                )}
                                                <span>
                                                    {isRequesting
                                                        ? 'Enviando...'
                                                        : estadoColab === 'Rechazada'
                                                            ? 'Re-solicitar Colaborar'
                                                            : 'Solicitar Colaborar'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
            {/* Modal central explicativo de solicitud de colaboración */}
            <SolicitarColaboracionModal
                isOpen={colabModalPea !== null}
                onClose={() => setColabModalPea(null)}
                pea={colabModalPea}
                isRequesting={requestingColabId !== null}
                onConfirm={async (motivo) => {
                    if (!colabModalPea) return;
                    await ejecutarSolicitudColaborar(colabModalPea, motivo);
                    setColabModalPea(null);
                }}
            />

            {/* Modal central explicativo para retirar o cancelar solicitud de colaboración */}
            <CancelarColaboracionModal
                isOpen={cancelarModalPea !== null}
                onClose={() => setCancelarModalPea(null)}
                onConfirm={handleEjecutarCancelarColaboracion}
                pea={cancelarModalPea}
                isCanceling={isCanceling}
            />
        </div>
    );
};

export default MisAsignaturasPage;


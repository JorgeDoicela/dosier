import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LayoutGrid } from 'lucide-react';
import DOSIERBuilderShell, { type BuilderSection } from '../../../components/DOSIER/DOSIERBuilderShell';
import { useCoWork, coworkUserFromAuth } from '../../../core/cowork';
import { salaCarreraService, type SalaCarreraEstadoDto } from '../../../services/salaCarreraService';
import { curriculumProjectService, type DocenteCarreraDto } from '../../../services/curriculumProjectService';
import { docenteAsignaturasService, type PeriodoAcademicoDto } from '../../../services/docenteAsignaturasService';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { PerfilEgresoPopover } from './components/PerfilEgresoPopover';
import { MallaDocentesPopover } from './components/MallaDocentesPopover';
import { SalaPizarraCanvas } from './pizarra/SalaPizarraCanvas';
import { useAuth } from '../../../api/AuthContext';

export const SalaCarreraPage: React.FC = () => {
    const { user, isVicerrector, activeRole, isAdmin } = useAuth();
    const { idCarrera: idCarreraParam } = useParams<{ idCarrera: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

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

    const [carrerasDisponibles, setCarrerasDisponibles] = useState<DocenteCarreraDto[]>([]);
    const [periodosDisponibles, setPeriodosDisponibles] = useState<PeriodoAcademicoDto[]>([]);
    const [isResolvingContext, setIsResolvingContext] = useState(true);

    // Estado institucional de la carrera y materias
    const [estadoSala, setEstadoSala] = useState<SalaCarreraEstadoDto | null>(null);

    // Estado local para el formulario colaborativo del shell
    const [shellFormData, setShellFormData] = useState<Record<string, unknown>>({});

    const esAdmin = useMemo(() => {
        return !!(user?.administrador || user?.roles?.includes('DOSIER_ADMIN'));
    }, [user]);

    const resolverPeriodoDefecto = (periodos: PeriodoAcademicoDto[]): string => {
        const pActivo = periodos.find((p) => {
            const raw = p as unknown as Record<string, unknown>;
            const activo = raw.es_activo ?? raw.esActivo;
            return activo === true || activo === 1 || activo === '1' || p.id_periodo === 'OCT2026';
        });
        return pActivo?.id_periodo || periodos[0]?.id_periodo || 'OCT2026';
    };

    const periodoQueryInicial = searchParams.get('periodo');

    // 1. Cargar contexto institucional (carreras y períodos)
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getDocenteCarreras().catch(() => []),
            esAdmin ? curriculumProjectService.getCarrerasInstitucionales().catch(() => []) : Promise.resolve([]),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => []),
        ]).then(([misCarrerasList, todasCarrerasList, periodosList]) => {
            if (!isMounted) return;

            const listaCarreras = (misCarrerasList.length > 0)
                ? misCarrerasList
                : (todasCarrerasList.length > 0 ? todasCarrerasList : misCarrerasList);

            setCarrerasDisponibles(listaCarreras);
            setPeriodosDisponibles(periodosList);

            const periodoDefecto = resolverPeriodoDefecto(periodosList);
            const periodoQuery = periodoQueryInicial || periodoDefecto;

            if (!idCarreraParam && listaCarreras.length > 0) {
                const primerCarreraId = listaCarreras[0].id_carrera ?? listaCarreras[0].idCarrera ?? 9;
                navigate(`/salas-curriculares/${primerCarreraId}?periodo=${encodeURIComponent(periodoQuery)}`, { replace: true });
            }
        }).finally(() => {
            if (isMounted) setIsResolvingContext(false);
        });

        return () => { isMounted = false; };
    }, [idCarreraParam, esAdmin, navigate, periodoQueryInicial]);

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

    const salaEntityUuid = useMemo(() => {
        return `sala_carrera_${idCarrera}_${periodoActual}`;
    }, [idCarrera, periodoActual]);

    const carreraNombre = useMemo(() => {
        if (estadoSala?.nombreCarrera || estadoSala?.nombre_carrera) {
            return estadoSala.nombreCarrera || estadoSala.nombre_carrera || 'Carrera ISTPET';
        }
        const found = carrerasDisponibles.find((c) => (c.id_carrera ?? c.idCarrera) === idCarrera);
        if (found) {
            return found.carrera1 || found.nombre_carrera || found.carrera || `Carrera ${idCarrera}`;
        }
        return `Carrera #${idCarrera}`;
    }, [estadoSala, carrerasDisponibles, idCarrera]);

    // 2. CoWork en tiempo real para todos los docentes de esta carrera y período
    const coworkUser = useMemo(() => coworkUserFromAuth({
        userUuid: user?.id_referencia || String(user?.id || 'docente_anon'),
        nombreCompleto: user?.nombre_completo || 'Docente DOSIER',
        role: user?.role || 'Docente'
    }), [user]);

    const cowork = useCoWork({
        documentId: salaEntityUuid,
        user: coworkUser,
        enabled: Boolean(idCarrera),
        readonly: false
    });

    // 3. Cargar nómina de asignaturas de la carrera
    const cargarEstadoAsignaturas = useCallback(async () => {
        if (!idCarrera) return;
        try {
            const data = await salaCarreraService.getEstado(idCarrera, periodoActual);
            setEstadoSala(data);
        } catch {
            setEstadoSala(null);
        }
    }, [idCarrera, periodoActual]);

    useEffect(() => {
        if (!idCarrera) return;
        cargarEstadoAsignaturas();
        const timer = setInterval(cargarEstadoAsignaturas, 20000);
        return () => clearInterval(timer);
    }, [idCarrera, periodoActual, cargarEstadoAsignaturas]);

    // 4. Navegación entre carreras y períodos
    const handleCambiarCarrera = (nuevaIdCarrera: number) => {
        navigate(`/salas-curriculares/${nuevaIdCarrera}?periodo=${encodeURIComponent(periodoActual)}`);
    };

    const handleCambiarPeriodo = (nuevoPeriodo: string) => {
        navigate(`/salas-curriculares/${idCarrera}?periodo=${encodeURIComponent(nuevoPeriodo)}`);
    };

    const handleVolverAlDashboard = () => {
        navigate('/dashboard');
    };

    // 5. Espacio de trabajo de la Sala de Carrera (Pizarra Interactiva y futuras secciones)
    const sections: BuilderSection[] = useMemo(() => [
        {
            id: 'pizarra',
            label: '1. Pizarra Interactiva',
            icon: <LayoutGrid size={14} />,
            fullBleed: true
        }
    ], []);

    const opcionesCarrera = useMemo(() => {
        return carrerasDisponibles.map((c) => {
            const cId = c.id_carrera ?? c.idCarrera ?? 0;
            const cNom = c.carrera1 || c.nombre_carrera || c.carrera || `Carrera ${cId}`;
            return { value: cId, label: cNom };
        });
    }, [carrerasDisponibles]);

    const opcionesPeriodo = useMemo(() => {
        return periodosDisponibles.map((p) => ({
            value: p.id_periodo,
            label: p.nombre_periodo || p.id_periodo,
        }));
    }, [periodosDisponibles]);

    if (isResolvingContext) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-bg-deep text-text-dim">
                <Loader2 size={32} className="animate-spin text-[#0070f3] mb-3 stroke-[1.75]" />
                <p className="text-xs font-medium">Iniciando Sala Colegiada de Carrera...</p>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // SALA COLEGIADA DE CARRERA: PIZARRA INTERACTIVA DIRECTA
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <DOSIERBuilderShell
                title={carreraNombre}
                subtitle={`Período ${periodoActual} • Espacio colegiado en vivo`}
                templateCode="SALA_CARRERA"
                sections={sections}
                formData={shellFormData}
                setFormData={setShellFormData as React.Dispatch<React.SetStateAction<any>>}
                cowork={cowork}
                onClose={handleVolverAlDashboard}
                canSign={false}
                isCollaborative={true}
                projectStatus="Activo"
                entityUuid={salaEntityUuid}
                documentUuid={salaEntityUuid}
                extraActions={
                    <div className="flex items-center gap-2">
                        {opcionesCarrera.length > 1 && (
                            <div className="w-44">
                                <GeistSelect
                                    value={idCarrera}
                                    options={opcionesCarrera}
                                    onChange={(val) => handleCambiarCarrera(Number(val))}
                                    size="sm"
                                    className="w-full"
                                />
                            </div>
                        )}

                        {opcionesPeriodo.length > 0 && (
                            <div className="w-32">
                                <GeistSelect
                                    value={periodoActual}
                                    options={opcionesPeriodo}
                                    onChange={(val) => handleCambiarPeriodo(String(val))}
                                    size="sm"
                                    className="w-full"
                                />
                            </div>
                        )}

                        <PerfilEgresoPopover
                            carreraNombre={carreraNombre}
                            idCarrera={idCarrera}
                            idMalla={23}
                            periodoActual={periodoActual}
                            periodosDisponibles={periodosDisponibles}
                            onSincronizarPeriodoSala={handleCambiarPeriodo}
                        />

                        <MallaDocentesPopover
                            asignaturas={estadoSala?.asignaturas || []}
                            carreraNombre={carreraNombre}
                            periodoActual={periodoActual}
                            periodosDisponibles={periodosDisponibles}
                            onSincronizarPeriodoSala={handleCambiarPeriodo}
                        />
                    </div>
                }
            >
                {() => (
                    <SalaPizarraCanvas
                        cowork={cowork}
                        userName={coworkUser.name}
                        userColor={coworkUser.color}
                        userRole={coworkUser.role}
                        userInitials={coworkUser.initials}
                        idCarrera={idCarrera}
                        carreraNombre={carreraNombre}
                        periodoActual={periodoActual}
                    />
                )}
            </DOSIERBuilderShell>
        </div>
    );
};

export default SalaCarreraPage;

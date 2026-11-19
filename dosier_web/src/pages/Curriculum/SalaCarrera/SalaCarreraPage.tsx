import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LayoutGrid, GitCompare, GraduationCap } from 'lucide-react';
import DOSIERBuilderShell, { type BuilderSection } from '../../../components/DOSIER/DOSIERBuilderShell';
import { useCoWork, coworkUserFromAuth } from '../../../core/cowork';
import { salaCarreraService, type SalaCarreraEstadoDto } from '../../../services/salaCarreraService';
import { curriculumProjectService, type DocenteCarreraDto } from '../../../services/curriculumProjectService';
import { docenteAsignaturasService, type PeriodoAcademicoDto } from '../../../services/docenteAsignaturasService';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import { PerfilEgresoPopover } from './components/PerfilEgresoPopover';
import { MallaDocentesPopover } from './components/MallaDocentesPopover';
import { SalaPizarraCanvas } from './pizarra/SalaPizarraCanvas';
import { SalaComparadorCurricular } from './components/SalaComparadorCurricular';
import { SalaPerfilEgresoSeccion } from './components/SalaPerfilEgresoSeccion';
import type { PizarraElement } from './pizarra/types';
import { useNotifications } from '../../../api/NotificationsContext';
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

    const { addToast } = useNotifications();

    const handleCrearAcuerdoEnPizarra = useCallback((titulo: string, descripcion: string, categoria = 'Metodología') => {
        if (!cowork?.ydoc) return;
        const yMap = cowork.ydoc.getMap<PizarraElement>('pizarra_elements');
        const id = `el_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const nuevo: PizarraElement = {
            id,
            type: 'card',
            x: 220 + Math.floor(Math.random() * 80),
            y: 220 + Math.floor(Math.random() * 80),
            width: 320,
            height: 220,
            title: titulo,
            content: descripcion,
            color: 'blue',
            category: categoria,
            authorName: coworkUser.name,
            authorColor: coworkUser.color,
            authorInitials: coworkUser.initials,
            updatedAt: Date.now(),
            zIndex: Date.now(),
        };

        cowork.ydoc.transact(() => {
            yMap.set(id, nuevo);
        });

        addToast('Acuerdo enviado a la Pizarra', `Se añadió "${titulo}" al lienzo compartido.`, 'success');
    }, [cowork, coworkUser, addToast]);

    const handleTriggerAiEnSala = useCallback(async (
        _targetSection: string,
        customInstructions: string
    ) => {
        const prompt = customInstructions.toLowerCase();

        // 1. Consulta sobre articulación o comparación
        if (prompt.includes('articul') || prompt.includes('compar') || prompt.includes('solap') || prompt.includes('duplic')) {
            return {
                text: `Orientación de Articulación Curricular para ${carreraNombre}:\n\n` +
                    `1. Articulación Horizontal (Mismo Nivel Semestral):\n` +
                    `• Verifica que los contenidos de talleres prácticos (APE) y proyectos de aula no coincidan en las mismas semanas evaluativas para evitar sobrecarga del estudiante.\n` +
                    `• Se sugiere unificar el software o stack tecnológico institucional entre materias afines.\n\n` +
                    `2. Articulación Vertical (Progresión Temporal):\n` +
                    `• Las asignaturas de ciclos iniciales deben transferir destrezas conceptuales sólidas hacia las de nivel superior.\n` +
                    `• Puedes emplear la sección "2. Comparador Curricular" para cotejar unidades y horas en paralelo.\n\n` +
                    `3. Sugerencia de Acuerdo: Puedes redactar un acuerdo en la Pizarra fijando el stack oficial y semanas de entrega de proyectos.`
            };
        }

        // 2. Consulta sobre perfil de egreso o tributación
        if (prompt.includes('perfil') || prompt.includes('egreso') || prompt.includes('rda') || prompt.includes('competencia')) {
            return {
                text: `Alineación con el Perfil de Egreso de ${carreraNombre}:\n\n` +
                    `• El Perfil de Egreso oficial aprobado por el CES rige las competencias que deben certificar los graduados del ISTPET.\n` +
                    `• Cada cátedra debe tributar con nivel Introductorio, Medio o Avanzado a los Resultados de Aprendizaje (RDA) de la carrera.\n` +
                    `• En la sección "3. Perfil de Egreso y Tributación" puedes revisar el catálogo de RDA y formular acuerdos de refuerzo pedagógico en la Pizarra.`
            };
        }

        // 3. Consulta sobre acuerdos para la pizarra
        if (prompt.includes('acuerdo') || prompt.includes('pizarra') || prompt.includes('suger')) {
            return {
                text: `Acuerdos Recomendados para la Sala Colegiada de ${carreraNombre}:\n\n` +
                    `• Metodología: "Implementación de Aprendizaje Basado en Proyectos (ABP) articulado entre cátedras del mismo semestre".\n` +
                    `• Evaluación: "Distribución escalonada de rúbricas prácticas (APE) para evitar semanas de evaluaciones acumuladas".\n` +
                    `• TIC / Infraestructura: "Uso de entornos Docker y repositorios institucionales GitLab para prácticas de laboratorio".\n\n` +
                    `Tip: En la sección "2. Comparador Curricular" o "3. Perfil de Egreso" puedes hacer clic en "Proponer Acuerdo" para insertarlo directamente en la Pizarra en tiempo real.`
            };
        }

        // 4. Orientación general
        return {
            text: `Asistencia Colegiada para ${carreraNombre} (${periodoActual}):\n\n` +
                `• Nómina activa: ${estadoSala?.asignaturas?.length || 0} asignaturas registradas en el período.\n` +
                `• Herramientas a tu disposición:\n` +
                `  - "1. Pizarra Interactiva": Lienzo colaborativo en tiempo real para plasmar notas y acuerdos.\n` +
                `  - "2. Comparador Curricular": Análisis lado a lado de horas, unidades y resultados de aprendizaje entre materias.\n` +
                `  - "3. Perfil de Egreso y Tributación": Catálogo de competencias CES y matriz de tributación.\n\n` +
                `Puedes preguntarme sobre articulación de contenidos, alineación con RDA o sugerencias de acuerdos docentes.`
        };
    }, [carreraNombre, periodoActual, estadoSala]);

    // 5. Espacio de trabajo de la Sala de Carrera (Pizarra Interactiva y Articulación Curricular)
    const sections: BuilderSection[] = useMemo(() => [
        {
            id: 'pizarra',
            label: '1. Pizarra Interactiva',
            icon: <LayoutGrid size={14} />,
            fullBleed: true
        },
        {
            id: 'comparador',
            label: '2. Comparador Curricular',
            icon: <GitCompare size={14} />,
            fullBleed: false
        },
        {
            id: 'perfil_egreso',
            label: '3. Perfil de Egreso y Tributación',
            icon: <GraduationCap size={14} />,
            fullBleed: false
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
                onTriggerAiGeneration={handleTriggerAiEnSala}
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
                {(activeTab) => (
                    <>
                        {activeTab === 'pizarra' && (
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
                        {activeTab === 'comparador' && (
                            <SalaComparadorCurricular
                                asignaturas={estadoSala?.asignaturas || []}
                                carreraNombre={carreraNombre}
                                idCarrera={idCarrera}
                                periodoActual={periodoActual}
                                onCrearAcuerdoPizarra={handleCrearAcuerdoEnPizarra}
                            />
                        )}
                        {activeTab === 'perfil_egreso' && (
                            <SalaPerfilEgresoSeccion
                                idCarrera={idCarrera}
                                carreraNombre={carreraNombre}
                                idMalla={23}
                                asignaturas={estadoSala?.asignaturas || []}
                                onCrearAcuerdoPizarra={handleCrearAcuerdoEnPizarra}
                            />
                        )}
                    </>
                )}
            </DOSIERBuilderShell>
        </div>
    );
};

export default SalaCarreraPage;

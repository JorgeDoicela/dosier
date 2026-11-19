import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, FileText, Sparkles, Shield, Layers, Plus } from 'lucide-react';
import DOSIERBuilderShell, { type BuilderSection } from '../../../components/DOSIER/DOSIERBuilderShell';
import { useCoWork, coworkUserFromAuth } from '../../../core/cowork';
import { salaCarreraService, type SalaCarreraEstadoDto } from '../../../services/salaCarreraService';
import { curriculumProjectService, type DocenteCarreraDto } from '../../../services/curriculumProjectService';
import { docenteAsignaturasService, type PeriodoAcademicoDto } from '../../../services/docenteAsignaturasService';
import { documentInstanceService, type DocumentInstanceDto } from '../../../services/documentInstanceService';
import { documentTemplateService, type DocumentTemplateDto } from '../../../services/documentTemplateService';
import { GeistSelect } from '../../../components/Common/GeistSelect';
import DocumentEditor from '../Workspace/Wizard/DocumentEditor';
import { PerfilEgresoPopover } from './components/PerfilEgresoPopover';
import { MallaDocentesPopover } from './components/MallaDocentesPopover';
import { SalaDocumentosPanel } from './components/SalaDocumentosPanel';
import { SalaPizarraColegiada } from './components/SalaPizarraColegiada';
import { NuevoDocumentoSalaModal } from './components/NuevoDocumentoSalaModal';
import { useNotifications } from '../../../api/NotificationsContext';
import { useAuth } from '../../../api/AuthContext';

export const SalaCarreraPage: React.FC = () => {
    const { user, isVicerrector, activeRole, isAdmin } = useAuth();
    const { idCarrera: idCarreraParam } = useParams<{ idCarrera: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { addToast } = useNotifications();

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

    // Documentos compartidos de la sala de carrera
    const [documentosSala, setDocumentosSala] = useState<DocumentInstanceDto[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [templates, setTemplates] = useState<DocumentTemplateDto[]>([]);
    const [activeDoc, setActiveDoc] = useState<DocumentInstanceDto | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreatingDoc, setIsCreatingDoc] = useState(false);

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

    // 1. Cargar contexto institucional (carreras, períodos y plantillas)
    useEffect(() => {
        let isMounted = true;
        Promise.all([
            curriculumProjectService.getDocenteCarreras().catch(() => []),
            esAdmin ? curriculumProjectService.getCarrerasInstitucionales().catch(() => []) : Promise.resolve([]),
            docenteAsignaturasService.getPeriodosAcademicos().catch(() => []),
            documentTemplateService.getTemplates().catch(() => []),
        ]).then(([misCarrerasList, todasCarrerasList, periodosList, templatesList]) => {
            if (!isMounted) return;

            const listaCarreras = (misCarrerasList.length > 0)
                ? misCarrerasList
                : (todasCarrerasList.length > 0 ? todasCarrerasList : misCarrerasList);

            setCarrerasDisponibles(listaCarreras);
            setPeriodosDisponibles(periodosList);
            setTemplates(templatesList);

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

    // 3. Cargar documentos compartidos de la sala
    const cargarDocumentosSala = useCallback(async () => {
        if (!idCarrera || !periodoActual) return;
        setIsLoadingDocs(true);
        try {
            const docs = await documentInstanceService.getByEntity(salaEntityUuid);
            setDocumentosSala(Array.isArray(docs) ? docs : []);
        } catch (err) {
            console.error('Error al cargar documentos de sala:', err);
            setDocumentosSala([]);
        } finally {
            setIsLoadingDocs(false);
        }
    }, [idCarrera, periodoActual, salaEntityUuid]);

    useEffect(() => {
        cargarDocumentosSala();
    }, [cargarDocumentosSala]);

    // 4. Cargar nómina de asignaturas de la carrera
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

    // 5. Navegación entre carreras y períodos
    const handleCambiarCarrera = (nuevaIdCarrera: number) => {
        navigate(`/salas-curriculares/${nuevaIdCarrera}?periodo=${encodeURIComponent(periodoActual)}`);
    };

    const handleCambiarPeriodo = (nuevoPeriodo: string) => {
        navigate(`/salas-curriculares/${idCarrera}?periodo=${encodeURIComponent(nuevoPeriodo)}`);
    };

    const handleVolverAlDashboard = () => {
        navigate('/dashboard');
    };

    // 7. Crear nuevo documento compartido
    const handleCreateDocumento = async (payload: { templateCode: string; title: string }) => {
        setIsCreatingDoc(true);
        try {
            const created = await documentInstanceService.createInstance({
                templateCode: payload.templateCode,
                entityUuid: salaEntityUuid,
                title: payload.title,
                entityType: 'SalaCarrera',
            });
            setIsCreateModalOpen(false);
            await cargarDocumentosSala();
            if (created?.uuid) {
                setActiveDoc(created);
            }
            addToast('Documento creado', `"${payload.title}" está listo para edición colaborativa.`, 'success');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'No se pudo crear el documento.';
            addToast('Error al crear documento', msg, 'error');
            throw err;
        } finally {
            setIsCreatingDoc(false);
        }
    };

    // 8. Descargar PDF del documento
    const handleDownloadPdf = async (doc: DocumentInstanceDto) => {
        try {
            const { blob, filename } = await documentInstanceService.getInstancePdfWithFilename(doc.uuid);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `${doc.title || 'documento'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'No se pudo generar el PDF del documento.';
            addToast('Error al exportar PDF', msg, 'error');
        }
    };

    // Secciones de trabajo de la Sala de Carrera (operativas en sidebar)
    const sections: BuilderSection[] = useMemo(() => [
        {
            id: 'documentos',
            label: `1. Documentos de Carrera (${documentosSala.length})`,
            icon: <FileText size={14} />
        },
        {
            id: 'acuerdos',
            label: '2. Acuerdos y Pizarra Colegiada',
            icon: <Sparkles size={14} />
        }
    ], [documentosSala.length]);

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

    // Modo edición colaborativa a pantalla completa de un documento específico de la sala
    if (activeDoc) {
        const docTemplateCode = String(
            activeDoc.template_code || (activeDoc as Record<string, unknown>).templateCode || 'DOCUMENTO'
        );
        return (
            <div className="h-screen w-full bg-bg-deep overflow-hidden">
                <DocumentEditor
                    templateCode={docTemplateCode}
                    entityUuid={salaEntityUuid}
                    initialData={{
                        Uuid: activeDoc.uuid,
                        uuid: activeDoc.uuid,
                        titulo: activeDoc.title,
                        title: activeDoc.title,
                        Carrera: carreraNombre,
                        carrera: carreraNombre,
                        Periodo: periodoActual,
                        periodo: periodoActual,
                    }}
                    isCollaborative={true}
                    canSign={true}
                    onClose={() => {
                        setActiveDoc(null);
                        cargarDocumentosSala();
                    }}
                />
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // SALA COLEGIADA DE CARRERA DIRECTA (DOSIERBuilderShell)
    // ─────────────────────────────────────────────────────────────
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <DOSIERBuilderShell
                title=""
                subtitle={`Período ${periodoActual} • Espacio colaborativo de carrera`}
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
                    <div className="w-full max-w-5xl mx-auto py-4 px-4 space-y-6">
                        {/* Selector Superior de Carrera y Período */}
                        <div className="rounded-xl border border-border-thin bg-surface p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {opcionesCarrera.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono uppercase text-text-dim font-semibold shrink-0">
                                            Carrera:
                                        </span>
                                        <div className="w-56">
                                            <GeistSelect
                                                value={idCarrera}
                                                options={opcionesCarrera}
                                                onChange={(val) => handleCambiarCarrera(Number(val))}
                                                size="sm"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}

                                {opcionesPeriodo.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-mono uppercase text-text-dim font-semibold shrink-0">
                                            Período:
                                        </span>
                                        <div className="w-40">
                                            <GeistSelect
                                                value={periodoActual}
                                                options={opcionesPeriodo}
                                                onChange={(val) => handleCambiarPeriodo(String(val))}
                                                size="sm"
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECCIÓN 1: DOCUMENTOS DE LA CARRERA */}
                        {activeTab === 'documentos' && (
                            <SalaDocumentosPanel
                                documentos={documentosSala}
                                templates={templates}
                                isLoading={isLoadingDocs}
                                carreraNombre={carreraNombre}
                                periodoActual={periodoActual}
                                onOpenDocument={(doc) => setActiveDoc(doc)}
                                onOpenCreateModal={() => setIsCreateModalOpen(true)}
                                onDownloadPdf={handleDownloadPdf}
                            />
                        )}

                        {/* SECCIÓN 2: ACUERDOS Y PIZARRA COLEGIADA */}
                        {activeTab === 'acuerdos' && (
                            <SalaPizarraColegiada
                                carreraNombre={carreraNombre}
                                periodoActual={periodoActual}
                                salaEntityUuid={salaEntityUuid}
                            />
                        )}
                    </div>
                )}
            </DOSIERBuilderShell>

            <NuevoDocumentoSalaModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                templates={templates}
                carreraNombre={carreraNombre}
                periodoActual={periodoActual}
                isCreating={isCreatingDoc}
                onCreate={handleCreateDocumento}
            />
        </div>
    );
};

export default SalaCarreraPage;

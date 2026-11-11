import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Layers, 
    Target, 
    BookOpen, 
    Award, 
    Sparkles, 
    Shield, 
    Plus, 
    Trash2, 
    User,
    ExternalLink
} from 'lucide-react';
import DOSIERBuilderShell, { type BuilderSection } from '../../../../components/DOSIER/DOSIERBuilderShell';
import { useCoWork, coworkUserFromAuth } from '../../../../core/cowork';
import { 
    salaCarreraService, 
    type SalaAsignaturaItemDto, 
    type BorradorPrePeaDto 
} from '../../../../services/salaCarreraService';
import type { PeaUnidadDto, PeaTemaDto, PeaResultadoAprendizajeDto } from '../../../../services/peaService';
import type { DocenteCarreraDto } from '../../../../services/curriculumProjectService';
import type { PeriodoAcademicoDto } from '../../../../services/docenteAsignaturasService';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useAuth } from '../../../../api/AuthContext';
import { CareerProfileSidebar } from './CareerProfileSidebar';
import { GeistSelect } from '../../../../components/Common/GeistSelect';

interface AsignaturaCoDesignWorkspaceProps {
    asignatura: SalaAsignaturaItemDto;
    asignaturas: SalaAsignaturaItemDto[];
    onCambiarAsignatura: (targetId: number, isExpediente?: boolean) => void;
    idCarrera: number;
    idPeriodo: string;
    carreraNombre: string;
    carrerasDisponibles?: DocenteCarreraDto[];
    onCambiarCarrera?: (idCarrera: number) => void;
    periodosDisponibles?: PeriodoAcademicoDto[];
    onCambiarPeriodo?: (idPeriodo: string) => void;
    onVolver: () => void;
    onBorradorActualizado?: () => void;
}

export const AsignaturaCoDesignWorkspace: React.FC<AsignaturaCoDesignWorkspaceProps> = ({
    asignatura,
    asignaturas,
    onCambiarAsignatura,
    idCarrera,
    idPeriodo,
    carreraNombre,
    carrerasDisponibles = [],
    onCambiarCarrera,
    periodosDisponibles = [],
    onCambiarPeriodo,
    onVolver,
    onBorradorActualizado
}) => {
    const { user } = useAuth();
    const { addToast } = useNotifications();

    const idExpediente = asignatura.idExpediente || asignatura.id_expediente || 0;
    const idAsignatura = asignatura.idAsignatura || asignatura.id_asignatura || 0;

    // Estado del borrador colegiado (Pre-PEA)
    const [borrador, setBorrador] = useState<BorradorPrePeaDto>({
        idExpediente,
        idAsignatura,
        nombreAsignatura: asignatura.nombreAsignatura || asignatura.nombre_asignatura || '',
        objetivoAsignatura: '',
        metodologiaEnsenanza: '',
        recursosDidacticos: '',
        evaluacionAprendizaje: '',
        justificacionCambiosMalla: '',
        notasLluviaIdeas: '',
        unidades: [],
        resultadosAprendizaje: []
    });

    const [isApplying, setIsApplying] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Instancia de CoWork para colaboración en tiempo real con presencia y chat nativo de DOSIERBuilderShell
    const coworkUser = useMemo(() => coworkUserFromAuth({
        userUuid: user?.id_referencia || String(user?.id || 'anonymous'),
        nombreCompleto: user?.nombre_completo || 'Docente DOSIER',
        role: user?.role || 'Docente'
    }), [user]);

    const cowork = useCoWork({
        documentId: `asignatura_${idAsignatura}_${idPeriodo}`,
        user: coworkUser,
        enabled: Boolean(idAsignatura),
        readonly: false
    });

    // Cargar borrador persistido desde backend
    useEffect(() => {
        let mounted = true;
        const cargarBorrador = async () => {
            if (!idExpediente) return;
            try {
                const data = await salaCarreraService.getBorrador(idExpediente);
                if (mounted && data) {
                    setBorrador(prev => ({
                        ...prev,
                        ...data,
                        unidades: data.unidades || [],
                        resultadosAprendizaje: data.resultadosAprendizaje || data.resultados_aprendizaje || []
                    }));
                }
            } catch (err) {
                console.error('Error al cargar borrador pre-PEA:', err);
            }
        };

        cargarBorrador();
        return () => { mounted = false; };
    }, [idExpediente]);

    // Guardado persistente
    const handleSaveBorrador = useCallback(async (dataToSave?: any) => {
        if (!idExpediente) return;
        const payload = dataToSave || borrador;
        try {
            const actualizado = await salaCarreraService.guardarBorrador(idExpediente, payload);
            setBorrador(prev => ({ ...prev, ...actualizado }));
            onBorradorActualizado?.();
        } catch (err: any) {
            console.error('Error al guardar acuerdos de sala:', err);
            throw err;
        }
    }, [idExpediente, borrador, onBorradorActualizado]);

    // Inyectar en PEA oficial
    const handleAplicarAlPea = async () => {
        if (!idExpediente) return;
        setIsApplying(true);
        try {
            await handleSaveBorrador();
            await salaCarreraService.aplicarAlPea(idExpediente, asignatura.idPea || asignatura.id_pea);
            setShowConfirmModal(false);
            addToast(
                'Propuesta Aplicada al PEA Oficial',
                'Los acuerdos consensuados fueron transferidos con éxito a las secciones del PEA de la asignatura.',
                'success'
            );
            onBorradorActualizado?.();
        } catch (err: any) {
            addToast('Error al Aplicar', err.message || 'No se pudo transferir el borrador al PEA oficial.', 'error');
        } finally {
            setIsApplying(false);
        }
    };

    // Secciones de trabajo para el BuilderNavigationSidebar
    const sections: BuilderSection[] = useMemo(() => [
        {
            id: 'propuesta',
            label: '1. Propuesta y Ajustes de Malla',
            icon: <Layers size={14} />
        },
        {
            id: 'objetivo',
            label: '2. Objetivo de la Asignatura',
            icon: <Target size={14} />
        },
        {
            id: 'unidades',
            label: `3. Unidades y Contenidos Mínimos (${borrador.unidades?.length || 0})`,
            icon: <BookOpen size={14} />
        },
        {
            id: 'rdas',
            label: `4. Resultados de Aprendizaje (${borrador.resultadosAprendizaje?.length || 0})`,
            icon: <Award size={14} />
        },
        {
            id: 'metodologia',
            label: '5. Metodología y Recursos',
            icon: <Sparkles size={14} />
        },
        {
            id: 'perfil_carrera',
            label: '6. Perfil de Egreso Oficial CES',
            icon: <Shield size={14} />
        }
    ], [borrador.unidades?.length, borrador.resultadosAprendizaje?.length]);

    // Opciones formateadas para GeistSelect (Sistema Oficial DOSIER)
    const opcionesAsignatura = useMemo(() => {
        return asignaturas.map(a => {
            const expId = a.idExpediente || a.id_expediente;
            const aId = a.idAsignatura || a.id_asignatura || 0;
            const val = expId ? `exp_${expId}` : `asig_${aId}`;
            const codigo = a.codigoAsignatura || a.codigo_asignatura;
            const nombre = a.nombreAsignatura || a.nombre_asignatura;
            const nivel = a.nombreNivel || a.nombre_nivel;
            return {
                value: val,
                label: `${codigo ? `${codigo} - ` : ''}${nombre} (${nivel || 'Nivel'})`
            };
        });
    }, [asignaturas]);

    const opcionesCarrera = useMemo(() => {
        return carrerasDisponibles.map(c => {
            const cId = c.id_carrera ?? c.idCarrera ?? 0;
            const cNom = c.carrera1 || c.nombre_carrera || c.carrera || `Carrera ${cId}`;
            return {
                value: cId,
                label: cNom
            };
        });
    }, [carrerasDisponibles]);

    const valorAsignaturaActual = asignatura.idExpediente ? `exp_${asignatura.idExpediente}` : `asig_${idAsignatura}`;

    const handleSelectAsignatura = (val: string | number) => {
        const raw = String(val);
        if (raw.startsWith('exp_')) {
            onCambiarAsignatura(Number(raw.replace('exp_', '')), true);
        } else {
            onCambiarAsignatura(Number(raw.replace('asig_', '')), false);
        }
    };

    // Manejadores de Unidades Curriculares Consensuadas
    const handleAddUnidad = () => {
        const nuevaUnidad: PeaUnidadDto = {
            numeroUnidad: (borrador.unidades?.length || 0) + 1,
            nombreUnidad: `Unidad ${(borrador.unidades?.length || 0) + 1}`,
            totalHorasUnidad: 48,
            horasDocencia: 16,
            horasPracticoExp: 16,
            horasAutonomo: 16,
            orden: (borrador.unidades?.length || 0) + 1,
            temas: []
        };
        setBorrador(prev => ({
            ...prev,
            unidades: [...(prev.unidades || []), nuevaUnidad]
        }));
    };

    const handleRemoveUnidad = (index: number) => {
        setBorrador(prev => ({
            ...prev,
            unidades: (prev.unidades || []).filter((_, i) => i !== index)
        }));
    };

    const handleAddTema = (unidadIndex: number) => {
        const unidad = borrador.unidades?.[unidadIndex];
        if (!unidad) return;
        const nuevoTema: PeaTemaDto = {
            numeroTema: (unidad.temas?.length || 0) + 1,
            tituloTema: 'Nuevo Tema Temático',
            descripcionSubtemas: '',
            orden: (unidad.temas?.length || 0) + 1
        };
        const updatedUnidades = [...(borrador.unidades || [])];
        updatedUnidades[unidadIndex] = {
            ...unidad,
            temas: [...(unidad.temas || []), nuevoTema]
        };
        setBorrador(prev => ({ ...prev, unidades: updatedUnidades }));
    };

    // Manejadores de Resultados de Aprendizaje Consensuados
    const handleAddRda = () => {
        const nuevoRda: PeaResultadoAprendizajeDto = {
            codigoRda: `RDA-${(borrador.resultadosAprendizaje?.length || 0) + 1}`,
            descripcion: '',
            tipoRda: 'Asignatura',
            nivelDesarrollo: 'Medio',
            orden: (borrador.resultadosAprendizaje?.length || 0) + 1
        };
        setBorrador(prev => ({
            ...prev,
            resultadosAprendizaje: [...(prev.resultadosAprendizaje || []), nuevoRda]
        }));
    };

    const handleRemoveRda = (index: number) => {
        setBorrador(prev => ({
            ...prev,
            resultadosAprendizaje: (prev.resultadosAprendizaje || []).filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <DOSIERBuilderShell
                title={`SALA CURRICULAR — ${carreraNombre.toUpperCase()}`}
                subtitle={`${asignatura.codigoAsignatura || 'ASIG'} • ${asignatura.nombreAsignatura} (${asignatura.nombreNivel || 'Nivel'})`}
                templateCode="PEA_OFICIAL"
                sections={sections}
                formData={borrador}
                setFormData={setBorrador as any}
                cowork={cowork}
                onSave={handleSaveBorrador}
                onClose={onVolver}
                canSign={false}
                projectStatus={asignatura.estadoPea || 'Borrador'}
                entityUuid={asignatura.peaUuid || asignatura.expedienteUuid || String(asignatura.idExpediente || '')}
                documentUuid={asignatura.peaUuid || asignatura.expedienteUuid || String(asignatura.idExpediente || '')}
            >
                {(activeTab) => (
                    <div className="w-full max-w-4xl mx-auto py-4 px-4 space-y-6">
                        {/* Selector Superior Integrado de Asignatura y Carrera (Directo en Pantalla) */}
                        <div className="bg-surface rounded-xl border border-border-thin p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap items-center gap-3">
                                {/* Selector de Carrera (si tiene varias) */}
                                {carrerasDisponibles.length > 1 && onCambiarCarrera && (
                                    <div className="flex items-center gap-1.5 min-w-[200px]">
                                        <span className="text-[11px] font-mono uppercase text-text-dim font-semibold shrink-0">Carrera:</span>
                                        <div className="w-48">
                                            <GeistSelect
                                                value={idCarrera}
                                                options={opcionesCarrera}
                                                onChange={(val) => onCambiarCarrera(Number(val))}
                                                size="sm"
                                                className="w-full text-xs font-semibold"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Selector de Asignatura de la Malla (GeistSelect Oficial del Sistema) */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-mono uppercase text-text-dim font-semibold shrink-0">Asignatura:</span>
                                    <div className="w-80 sm:w-96 md:w-[420px]">
                                        <GeistSelect
                                            value={valorAsignaturaActual}
                                            options={opcionesAsignatura}
                                            onChange={handleSelectAsignatura}
                                            size="sm"
                                            className="w-full font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Docente Titular */}
                                <div className="hidden lg:flex items-center gap-1 text-[11px] text-text-dim">
                                    <User size={12} />
                                    <span>Docente: {asignatura.nombreDocenteResponsable || 'Sin asignar'}</span>
                                </div>

                                {/* Badge de Estado Normativo */}
                                {asignatura.estadoPea || asignatura.estado_pea ? (
                                    <span className="hidden xl:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-border-thin bg-surface text-text-main">
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            (asignatura.estadoPea || asignatura.estado_pea)?.toLowerCase().includes('observ')
                                                ? 'bg-rose-500'
                                                : (asignatura.estadoPea || asignatura.estado_pea)?.toLowerCase().includes('aval') || (asignatura.estadoPea || asignatura.estado_pea)?.toLowerCase().includes('aprob')
                                                    ? 'bg-emerald-500'
                                                    : 'bg-[#0070f3]'
                                        }`} />
                                        {asignatura.estadoPea || asignatura.estado_pea}
                                    </span>
                                ) : null}
                            </div>

                            {/* Acciones de Sala, Enlace al PEA y Acta */}
                            <div className="flex items-center gap-2">
                                {(asignatura.peaUuid || asignatura.pea_uuid) && (
                                    <a
                                        href={`/documentacion/workspace/pea-oficial/${asignatura.peaUuid || asignatura.pea_uuid}?edit=pea-oficial`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border-thin bg-surface hover:bg-surface-hover text-text-main transition-colors inline-flex items-center gap-1.5"
                                        title="Abrir el documento PEA oficial en una nueva pestaña"
                                    >
                                        <ExternalLink size={13} className="text-text-dim" />
                                        <span className="hidden sm:inline">PEA Oficial</span>
                                    </a>
                                )}

                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(true)}
                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                    title="Inyecta los acuerdos consensuados en el PEA oficial de la materia"
                                >
                                    <Sparkles size={13} />
                                    <span>Aplicar al PEA Oficial</span>
                                </button>
                            </div>
                        </div>

                        {/* SECCIÓN 1: PROPUESTA Y AJUSTES DE MALLA */}
                        {activeTab === 'propuesta' && (
                            <div className="space-y-6">
                                <div className="bg-surface rounded-xl border border-border-thin p-6 space-y-3 shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                            Lluvia de Ideas y Propuesta de Ajuste de Malla
                                        </label>
                                    </div>
                                    <p className="text-xs text-text-dim">
                                        Registra las observaciones conjuntas del colectivo docente: si se propone actualizar contenidos mínimos, mover la asignatura a otro semestre, modificar horas CD/APE/AA o ajustar prerrequisitos para elevar a la Comisión Académica.
                                    </p>
                                    <textarea
                                        value={borrador.justificacionCambiosMalla || ''}
                                        onChange={(e) => setBorrador(prev => ({ ...prev, justificacionCambiosMalla: e.target.value }))}
                                        rows={5}
                                        placeholder="Ej: Se consensúa recomendar a la Comisión Académica la incorporación de 16 horas adicionales de componente práctico (APE) para proyectos de integración tecnológica..."
                                        className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed"
                                    />
                                </div>

                                <div className="bg-surface rounded-xl border border-border-thin p-6 space-y-3 shadow-xs">
                                    <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                        Notas Colegiadas y Acuerdos Rápidos
                                    </label>
                                    <p className="text-xs text-text-dim">
                                        Compromisos específicos, bibliografía sugerida por el equipo docente, articulación con asignaturas paralelas y acuerdos operativos de la cátedra.
                                    </p>
                                    <textarea
                                        value={borrador.notasLluviaIdeas || ''}
                                        onChange={(e) => setBorrador(prev => ({ ...prev, notasLluviaIdeas: e.target.value }))}
                                        rows={4}
                                        placeholder="Ej: Compromiso docente: homologar herramientas de laboratorio con la materia de Base de Datos y usar repositorios GitLab institucionales..."
                                        className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed"
                                    />
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN 2: OBJETIVO DE LA ASIGNATURA */}
                        {activeTab === 'objetivo' && (
                            <div className="bg-surface rounded-xl border border-border-thin p-6 space-y-3 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                        Objetivo General de la Asignatura (Consensuado en Sala)
                                    </label>
                                    <span className="text-[11px] text-text-dim font-mono">Tributa al Perfil CES</span>
                                </div>
                                <p className="text-xs text-text-dim">
                                    Define el propósito pedagógico fundamental que debe articular esta asignatura para tributar directamente a las competencias del perfil de egreso.
                                </p>
                                <textarea
                                    value={borrador.objetivoAsignatura || ''}
                                    onChange={(e) => setBorrador(prev => ({ ...prev, objetivoAsignatura: e.target.value }))}
                                    rows={5}
                                    placeholder="Ej: Desarrollar competencias sólidas en el diseño e implementación de algoritmos mediante el uso de lenguajes de programación estructurada..."
                                    className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed"
                                />
                            </div>
                        )}

                        {/* SECCIÓN 3: UNIDADES Y CONTENIDOS MÍNIMOS */}
                        {activeTab === 'unidades' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-border-thin">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-main">
                                            Estructura Curricular de Unidades Temáticas
                                        </h3>
                                        <p className="text-xs text-text-dim">
                                            Definición consensuada de los bloques temáticos para evitar vacíos pedagógicos o duplicidad entre asignaturas del mismo nivel.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddUnidad}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <Plus size={13} />
                                        <span>Agregar Unidad</span>
                                    </button>
                                </div>

                                {borrador.unidades && borrador.unidades.length > 0 ? (
                                    <div className="space-y-4">
                                        {borrador.unidades.map((u, uIdx) => (
                                            <div
                                                key={u.numeroUnidad || uIdx}
                                                className="bg-surface rounded-xl border border-border-thin p-5 space-y-4 shadow-xs"
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <span className="font-mono text-xs font-bold text-[#0070f3] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">
                                                            Unidad {u.numeroUnidad || uIdx + 1}
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={u.nombreUnidad}
                                                            onChange={(e) => {
                                                                const updated = [...(borrador.unidades || [])];
                                                                updated[uIdx] = { ...updated[uIdx], nombreUnidad: e.target.value };
                                                                setBorrador(prev => ({ ...prev, unidades: updated }));
                                                            }}
                                                            placeholder="Título de la unidad temática..."
                                                            className="flex-1 bg-transparent border-b border-transparent hover:border-border-thin focus:border-[#0070f3] text-sm font-semibold text-text-main px-1 py-0.5 focus:outline-none"
                                                        />
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveUnidad(uIdx)}
                                                        className="p-1 rounded text-text-dim hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                                        title="Eliminar unidad"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="pl-4 border-l-2 border-border-thin space-y-2">
                                                    <div className="flex items-center justify-between text-xs">
                                                        <span className="text-[11px] font-mono text-text-dim uppercase">
                                                            Temas Mínimos Acordados ({u.temas?.length || 0})
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddTema(uIdx)}
                                                            className="text-[11px] text-[#0070f3] hover:underline cursor-pointer inline-flex items-center gap-1 font-medium"
                                                        >
                                                            <Plus size={11} />
                                                            <span>Agregar Tema</span>
                                                        </button>
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        {u.temas?.map((t, tIdx) => (
                                                            <div key={t.numeroTema || tIdx} className="flex items-center gap-2 text-xs">
                                                                <span className="font-mono text-[10px] text-text-dim">
                                                                    {uIdx + 1}.{t.numeroTema || tIdx + 1}
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={t.tituloTema}
                                                                    onChange={(e) => {
                                                                        const updatedUnidades = [...(borrador.unidades || [])];
                                                                        const updatedTemas = [...(updatedUnidades[uIdx].temas || [])];
                                                                        updatedTemas[tIdx] = { ...updatedTemas[tIdx], tituloTema: e.target.value };
                                                                        updatedUnidades[uIdx] = { ...updatedUnidades[uIdx], temas: updatedTemas };
                                                                        setBorrador(prev => ({ ...prev, unidades: updatedUnidades }));
                                                                    }}
                                                                    placeholder="Descripción del tema..."
                                                                    className="flex-1 bg-bg-deep border border-border-thin rounded px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-[#0070f3]"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-surface rounded-xl border border-dashed border-border-thin text-text-dim">
                                        <BookOpen size={28} className="mx-auto mb-2 text-text-dim stroke-[1.5]" />
                                        <p className="text-xs font-medium">Aún no se han propuesto unidades temáticas en sala.</p>
                                        <button
                                            type="button"
                                            onClick={handleAddUnidad}
                                            className="mt-3 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-all cursor-pointer"
                                        >
                                            Crear Primera Unidad
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECCIÓN 4: RESULTADOS DE APRENDIZAJE (RDA) */}
                        {activeTab === 'rdas' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-border-thin">
                                    <div>
                                        <h3 className="text-sm font-bold text-text-main">
                                            Resultados de Aprendizaje de la Asignatura (RDA)
                                        </h3>
                                        <p className="text-xs text-text-dim">
                                            Formulación de las competencias medibles que alcanzará el estudiante, tributando directamente al perfil de egreso CES.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddRda}
                                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <Plus size={13} />
                                        <span>Agregar RDA</span>
                                    </button>
                                </div>

                                {borrador.resultadosAprendizaje && borrador.resultadosAprendizaje.length > 0 ? (
                                    <div className="space-y-3">
                                        {borrador.resultadosAprendizaje.map((rda, rIdx) => (
                                            <div
                                                key={rda.codigoRda || rIdx}
                                                className="bg-surface rounded-xl border border-border-thin p-4 space-y-3 shadow-xs"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono text-xs font-bold text-[#0070f3]">
                                                        {rda.codigoRda || `RDA-${rIdx + 1}`}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRda(rIdx)}
                                                        className="p-1 rounded text-text-dim hover:text-red-500 transition-colors cursor-pointer"
                                                        title="Eliminar RDA"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>

                                                <textarea
                                                    value={rda.descripcion}
                                                    onChange={(e) => {
                                                        const updated = [...(borrador.resultadosAprendizaje || [])];
                                                        updated[rIdx] = { ...updated[rIdx], descripcion: e.target.value };
                                                        setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
                                                    }}
                                                    rows={2}
                                                    placeholder="Descripción del resultado de aprendizaje..."
                                                    className="w-full bg-bg-deep border border-border-thin rounded-lg p-2.5 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3]"
                                                />

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                    <div>
                                                        <label className="block text-[10px] font-mono uppercase text-text-dim mb-1">
                                                            Nivel de Desarrollo
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={rda.nivelDesarrollo || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(borrador.resultadosAprendizaje || [])];
                                                                updated[rIdx] = { ...updated[rIdx], nivelDesarrollo: e.target.value };
                                                                setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
                                                            }}
                                                            placeholder="Ej: Inicial, Medio, Avanzado"
                                                            className="w-full bg-bg-deep border border-border-thin rounded px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-[#0070f3]"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-mono uppercase text-text-dim mb-1">
                                                            Tipo de RDA
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={rda.tipoRda || ''}
                                                            onChange={(e) => {
                                                                const updated = [...(borrador.resultadosAprendizaje || [])];
                                                                updated[rIdx] = { ...updated[rIdx], tipoRda: e.target.value };
                                                                setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
                                                            }}
                                                            placeholder="Ej: Asignatura, Transversal"
                                                            className="w-full bg-bg-deep border border-border-thin rounded px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-[#0070f3]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center bg-surface rounded-xl border border-dashed border-border-thin text-text-dim">
                                        <Award size={28} className="mx-auto mb-2 text-text-dim stroke-[1.5]" />
                                        <p className="text-xs font-medium">No se han registrado resultados de aprendizaje específicos en sala.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECCIÓN 5: METODOLOGÍA Y RECURSOS */}
                        {activeTab === 'metodologia' && (
                            <div className="space-y-6">
                                <div className="bg-surface rounded-xl border border-border-thin p-6 space-y-3 shadow-xs">
                                    <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                        Metodología de Enseñanza y Aprendizaje
                                    </label>
                                    <p className="text-xs text-text-dim">
                                        Estrategias didácticas recomendadas por la sala de carrera (aprendizaje basado en problemas, clase invertida, talleres de laboratorio).
                                    </p>
                                    <textarea
                                        value={borrador.metodologiaEnsenanza || ''}
                                        onChange={(e) => setBorrador(prev => ({ ...prev, metodologiaEnsenanza: e.target.value }))}
                                        rows={4}
                                        placeholder="Ej: Metodología activa centrada en el estudiante, desarrollo de proyectos por sprints con evaluación continua..."
                                        className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed"
                                    />
                                </div>

                                <div className="bg-surface rounded-xl border border-border-thin p-6 space-y-3 shadow-xs">
                                    <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                        Recursos Didácticos y Tecnológicos Compartidos
                                    </label>
                                    <p className="text-xs text-text-dim">
                                        Software institucional, entornos de laboratorio, plataformas de virtualización y materiales consensuados.
                                    </p>
                                    <textarea
                                        value={borrador.recursosDidacticos || ''}
                                        onChange={(e) => setBorrador(prev => ({ ...prev, recursosDidacticos: e.target.value }))}
                                        rows={4}
                                        placeholder="Ej: Entornos Docker, Visual Studio Code, bases de datos MariaDB en servidores locales y aula virtual institucional..."
                                        className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed"
                                    />
                                </div>
                            </div>
                        )}

                        {/* SECCIÓN 6: PERFIL DE EGRESO OFICIAL CES */}
                        {activeTab === 'perfil_carrera' && (
                            <div className="bg-surface rounded-xl border border-border-thin overflow-hidden shadow-xs">
                                <CareerProfileSidebar
                                    carreraNombre={carreraNombre}
                                    idCarrera={idCarrera}
                                    idMalla={23}
                                    asignaturaSeleccionada={asignatura}
                                />
                            </div>
                        )}
                    </div>
                )}
            </DOSIERBuilderShell>

            {/* Modal de Confirmación para Aplicar al PEA Oficial */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-surface border border-border-thin rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-text-main">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-[#0070f3]" />
                            <h3 className="text-sm font-bold">
                                Volcar Acuerdos de Sala al PEA Oficial
                            </h3>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            Esta acción transferirá e inyectará de forma automática el objetivo general consensuado, las unidades temáticas y los resultados de aprendizaje al PEA oficial de <strong className="text-text-main">{asignatura.nombreAsignatura}</strong>.
                        </p>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-[11px] text-blue-700 dark:text-blue-300">
                            El docente titular podrá revisar el documento en su panel de "Mis Asignaturas" antes de la firma digital institucional.
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-thin">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-thin text-text-dim hover:bg-surface-hover cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleAplicarAlPea}
                                disabled={isApplying}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                {isApplying ? 'Inyectando...' : 'Confirmar e Inyectar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignaturaCoDesignWorkspace;

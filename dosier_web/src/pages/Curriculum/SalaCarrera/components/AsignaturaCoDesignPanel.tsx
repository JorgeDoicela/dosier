import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
    Layers, 
    Target, 
    BookOpen, 
    Award, 
    Sparkles, 
    Plus, 
    Trash2, 
    User,
    ExternalLink
} from 'lucide-react';
import { 
    salaCarreraService, 
    type SalaAsignaturaItemDto, 
    type BorradorPrePeaDto 
} from '../../../../services/salaCarreraService';
import type { PeaUnidadDto, PeaTemaDto, PeaResultadoAprendizajeDto } from '../../../../services/peaService';
import { useNotifications } from '../../../../api/NotificationsContext';
import { GeistSelect } from '../../../../components/Common/GeistSelect';

interface AsignaturaCoDesignPanelProps {
    asignatura: SalaAsignaturaItemDto;
    asignaturas: SalaAsignaturaItemDto[];
    onCambiarAsignatura: (targetId: number, isExpediente?: boolean) => void;
    idCarrera: number;
    idPeriodo: string;
    carreraNombre: string;
    onBorradorActualizado?: () => void;
}

type CoDesignSubTab = 'propuesta' | 'objetivo' | 'unidades' | 'rdas' | 'metodologia';

export const AsignaturaCoDesignPanel: React.FC<AsignaturaCoDesignPanelProps> = ({
    asignatura,
    asignaturas,
    onCambiarAsignatura,
    idCarrera,
    idPeriodo,
    carreraNombre,
    onBorradorActualizado
}) => {
    const { addToast } = useNotifications();
    const [subTab, setSubTab] = useState<CoDesignSubTab>('propuesta');

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
    const handleSaveBorrador = useCallback(async (dataToSave?: Partial<BorradorPrePeaDto>) => {
        if (!idExpediente) return;
        const payload = { ...borrador, ...(dataToSave || {}) };
        try {
            const actualizado = await salaCarreraService.guardarBorrador(idExpediente, payload);
            setBorrador(prev => ({ ...prev, ...actualizado }));
            onBorradorActualizado?.();
        } catch (err: unknown) {
            console.error('Error al guardar acuerdos de sala:', err);
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
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'No se pudo transferir el borrador al PEA oficial.';
            addToast('Error al Aplicar', msg, 'error');
        } finally {
            setIsApplying(false);
        }
    };

    // Opciones formateadas para GeistSelect
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

    const valorAsignaturaActual = asignatura.idExpediente ? `exp_${asignatura.idExpediente}` : `asig_${idAsignatura}`;

    const handleSelectAsignatura = (val: string | number) => {
        const raw = String(val);
        if (raw.startsWith('exp_')) {
            onCambiarAsignatura(Number(raw.replace('exp_', '')), true);
        } else {
            onCambiarAsignatura(Number(raw.replace('asig_', '')), false);
        }
    };

    // Manejadores de Unidades
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
        const updated = [...(borrador.unidades || []), nuevaUnidad];
        setBorrador(prev => ({ ...prev, unidades: updated }));
        handleSaveBorrador({ unidades: updated });
    };

    const handleRemoveUnidad = (index: number) => {
        const updated = (borrador.unidades || []).filter((_, i) => i !== index);
        setBorrador(prev => ({ ...prev, unidades: updated }));
        handleSaveBorrador({ unidades: updated });
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
        handleSaveBorrador({ unidades: updatedUnidades });
    };

    // Manejadores de Resultados de Aprendizaje
    const handleAddRda = () => {
        const nuevoRda: PeaResultadoAprendizajeDto = {
            codigoRda: `RDA-${(borrador.resultadosAprendizaje?.length || 0) + 1}`,
            descripcion: '',
            tipoRda: 'Asignatura',
            nivelDesarrollo: 'Medio',
            orden: (borrador.resultadosAprendizaje?.length || 0) + 1
        };
        const updated = [...(borrador.resultadosAprendizaje || []), nuevoRda];
        setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
        handleSaveBorrador({ resultadosAprendizaje: updated });
    };

    const handleRemoveRda = (index: number) => {
        const updated = (borrador.resultadosAprendizaje || []).filter((_, i) => i !== index);
        setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
        handleSaveBorrador({ resultadosAprendizaje: updated });
    };

    return (
        <div className="space-y-6">
            {/* Cabecera de Selección de Materia Foco */}
            <div className="rounded-xl border border-border-thin bg-surface p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono uppercase text-text-dim font-semibold shrink-0">
                            Asignatura:
                        </span>
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

                    <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-text-dim">
                        <User size={12} />
                        <span>Docente: {asignatura.nombreDocenteResponsable || 'Sin asignar'}</span>
                    </div>

                    {asignatura.estadoPea && (
                        <span className="hidden xl:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border border-border-thin bg-bg-deep text-text-main">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                                asignatura.estadoPea.toLowerCase().includes('observ')
                                    ? 'bg-amber-500'
                                    : asignatura.estadoPea.toLowerCase().includes('aval') || asignatura.estadoPea.toLowerCase().includes('aprob')
                                        ? 'bg-emerald-500'
                                        : 'bg-[#0070f3]'
                            }`} />
                            {asignatura.estadoPea}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {asignatura.peaUuid && (
                        <a
                            href={`/documentacion/workspace/pea-oficial/${asignatura.peaUuid}?edit=pea-oficial`}
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
                        <span>Aplicar al PEA</span>
                    </button>
                </div>
            </div>

            {/* Riel Plano de Sub-Pestañas de Co-Diseño */}
            <div className="border-b border-border-thin">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setSubTab('propuesta')}
                        className={`py-2.5 text-xs border-b-2 transition-colors cursor-pointer shrink-0 ${
                            subTab === 'propuesta'
                                ? 'border-[#0070f3] dark:border-blue-400 font-semibold text-text-main'
                                : 'border-transparent font-medium text-text-dim hover:text-text-main'
                        }`}
                    >
                        Propuesta y Malla
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubTab('objetivo')}
                        className={`py-2.5 text-xs border-b-2 transition-colors cursor-pointer shrink-0 ${
                            subTab === 'objetivo'
                                ? 'border-[#0070f3] dark:border-blue-400 font-semibold text-text-main'
                                : 'border-transparent font-medium text-text-dim hover:text-text-main'
                        }`}
                    >
                        Objetivo General
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubTab('unidades')}
                        className={`py-2.5 text-xs border-b-2 transition-colors cursor-pointer shrink-0 ${
                            subTab === 'unidades'
                                ? 'border-[#0070f3] dark:border-blue-400 font-semibold text-text-main'
                                : 'border-transparent font-medium text-text-dim hover:text-text-main'
                        }`}
                    >
                        Unidades y Temas ({borrador.unidades?.length || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubTab('rdas')}
                        className={`py-2.5 text-xs border-b-2 transition-colors cursor-pointer shrink-0 ${
                            subTab === 'rdas'
                                ? 'border-[#0070f3] dark:border-blue-400 font-semibold text-text-main'
                                : 'border-transparent font-medium text-text-dim hover:text-text-main'
                        }`}
                    >
                        Resultados de Aprendizaje ({borrador.resultadosAprendizaje?.length || 0})
                    </button>
                    <button
                        type="button"
                        onClick={() => setSubTab('metodologia')}
                        className={`py-2.5 text-xs border-b-2 transition-colors cursor-pointer shrink-0 ${
                            subTab === 'metodologia'
                                ? 'border-[#0070f3] dark:border-blue-400 font-semibold text-text-main'
                                : 'border-transparent font-medium text-text-dim hover:text-text-main'
                        }`}
                    >
                        Metodología y Recursos
                    </button>
                </nav>
            </div>

            {/* CONTENIDO 1: PROPUESTA Y AJUSTES DE MALLA */}
            {subTab === 'propuesta' && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-border-thin bg-surface p-6 space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-amber-600 dark:text-amber-400" />
                            <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                                Lluvia de Ideas y Propuesta de Ajuste de Malla
                            </label>
                        </div>
                        <p className="text-xs text-text-dim">
                            Registra observaciones colegiadas para actualizar contenidos mínimos, horas o prerrequisitos de esta asignatura.
                        </p>
                        <textarea
                            value={borrador.justificacionCambiosMalla || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBorrador(prev => ({ ...prev, justificacionCambiosMalla: val }));
                            }}
                            onBlur={() => handleSaveBorrador()}
                            rows={4}
                            placeholder="Ej: Se consensúa recomendar a la Comisión Académica la incorporación de 16 horas adicionales de componente práctico (APE)..."
                            className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                        />
                    </div>

                    <div className="rounded-xl border border-border-thin bg-surface p-6 space-y-3 shadow-2xs">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                            Notas Colegiadas y Acuerdos Específicos
                        </label>
                        <p className="text-xs text-text-dim">
                            Compromisos de cátedra, bibliografía sugerida y articulación con materias paralelas.
                        </p>
                        <textarea
                            value={borrador.notasLluviaIdeas || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBorrador(prev => ({ ...prev, notasLluviaIdeas: val }));
                            }}
                            onBlur={() => handleSaveBorrador()}
                            rows={3}
                            placeholder="Ej: Compromiso docente: homologar herramientas de laboratorio y repositorios institucionales..."
                            className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                        />
                    </div>
                </div>
            )}

            {/* CONTENIDO 2: OBJETIVO DE LA ASIGNATURA */}
            {subTab === 'objetivo' && (
                <div className="rounded-xl border border-border-thin bg-surface p-6 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                            Objetivo General de la Asignatura
                        </label>
                        <span className="text-[11px] text-text-dim font-mono">Tributa al Perfil CES</span>
                    </div>
                    <p className="text-xs text-text-dim">
                        Define el propósito pedagógico fundamental acordado por el equipo docente para esta materia.
                    </p>
                    <textarea
                        value={borrador.objetivoAsignatura || ''}
                        onChange={(e) => {
                            const val = e.target.value;
                            setBorrador(prev => ({ ...prev, objetivoAsignatura: val }));
                        }}
                        onBlur={() => handleSaveBorrador()}
                        rows={4}
                        placeholder="Ej: Desarrollar competencias sólidas en el diseño e implementación de algoritmos mediante el uso de lenguajes de programación estructurada..."
                        className="w-full rounded-lg border border-border-thin bg-bg-deep p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                    />
                </div>
            )}

            {/* CONTENIDO 3: UNIDADES Y TEMAS */}
            {subTab === 'unidades' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                                Unidades Curriculares Consensuadas
                            </h3>
                            <p className="text-xs text-text-dim">Estructura temática y distribución de horas para la asignatura.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddUnidad}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <Plus size={14} />
                            <span>Agregar Unidad</span>
                        </button>
                    </div>

                    {(borrador.unidades || []).map((unidad, uIdx) => (
                        <div key={uIdx} className="rounded-xl border border-border-thin bg-surface p-5 space-y-4 shadow-2xs">
                            <div className="flex items-center justify-between gap-3 border-b border-border-thin pb-3">
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#0070f3] dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                                        {uIdx + 1}
                                    </span>
                                    <input
                                        type="text"
                                        value={unidad.nombreUnidad || ''}
                                        onChange={(e) => {
                                            const updated = [...(borrador.unidades || [])];
                                            updated[uIdx] = { ...updated[uIdx], nombreUnidad: e.target.value };
                                            setBorrador(prev => ({ ...prev, unidades: updated }));
                                        }}
                                        onBlur={() => handleSaveBorrador()}
                                        placeholder="Nombre de la Unidad Temática"
                                        className="w-full font-semibold text-xs text-text-main bg-transparent border-b border-transparent hover:border-border-thin focus:border-[#0070f3] focus:outline-none py-1"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveUnidad(uIdx)}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                    title="Eliminar unidad"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>

                            {/* Temas de la unidad */}
                            <div className="space-y-2 pl-4 border-l-2 border-border-thin">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-mono uppercase text-text-dim font-semibold">
                                        Temas y Contenidos ({unidad.temas?.length || 0})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleAddTema(uIdx)}
                                        className="text-xs text-[#0070f3] hover:underline inline-flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus size={12} />
                                        <span>Agregar Tema</span>
                                    </button>
                                </div>
                                {(unidad.temas || []).map((tema, tIdx) => (
                                    <div key={tIdx} className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-text-dim">{uIdx + 1}.{tIdx + 1}</span>
                                        <input
                                            type="text"
                                            value={tema.tituloTema || ''}
                                            onChange={(e) => {
                                                const updated = [...(borrador.unidades || [])];
                                                const temas = [...(updated[uIdx].temas || [])];
                                                temas[tIdx] = { ...temas[tIdx], tituloTema: e.target.value };
                                                updated[uIdx] = { ...updated[uIdx], temas };
                                                setBorrador(prev => ({ ...prev, unidades: updated }));
                                            }}
                                            onBlur={() => handleSaveBorrador()}
                                            placeholder="Título del tema"
                                            className="w-full bg-bg-deep border border-border-thin rounded px-2.5 py-1 text-xs text-text-main focus:outline-none focus:border-[#0070f3]"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CONTENIDO 4: RESULTADOS DE APRENDIZAJE */}
            {subTab === 'rdas' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-bold text-text-main uppercase tracking-wider">
                                Resultados de Aprendizaje de la Asignatura (RDA)
                            </h3>
                            <p className="text-xs text-text-dim">Capacidades verificables que el estudiante alcanzará.</p>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddRda}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all cursor-pointer inline-flex items-center gap-1.5"
                        >
                            <Plus size={14} />
                            <span>Agregar RDA</span>
                        </button>
                    </div>

                    {(borrador.resultadosAprendizaje || []).map((rda, rIdx) => (
                        <div key={rIdx} className="rounded-xl border border-border-thin bg-surface p-4 space-y-3 shadow-2xs">
                            <div className="flex items-center justify-between gap-3">
                                <span className="font-mono text-xs font-bold text-[#0070f3]">
                                    {rda.codigoRda || `RDA-${rIdx + 1}`}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRda(rIdx)}
                                    className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <textarea
                                value={rda.descripcion || ''}
                                onChange={(e) => {
                                    const updated = [...(borrador.resultadosAprendizaje || [])];
                                    updated[rIdx] = { ...updated[rIdx], descripcion: e.target.value };
                                    setBorrador(prev => ({ ...prev, resultadosAprendizaje: updated }));
                                }}
                                onBlur={() => handleSaveBorrador()}
                                rows={2}
                                placeholder="Describe el resultado de aprendizaje de la asignatura..."
                                className="w-full bg-bg-deep border border-border-thin rounded-lg p-2.5 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] resize-y"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* CONTENIDO 5: METODOLOGÍA Y RECURSOS */}
            {subTab === 'metodologia' && (
                <div className="space-y-6">
                    <div className="rounded-xl border border-border-thin bg-surface p-6 space-y-3 shadow-2xs">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                            Metodología de Enseñanza y Aprendizaje
                        </label>
                        <p className="text-xs text-text-dim">
                            Estrategias didácticas recomendadas para esta asignatura (aprendizaje basado en proyectos, aula invertida, etc.).
                        </p>
                        <textarea
                            value={borrador.metodologiaEnsenanza || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBorrador(prev => ({ ...prev, metodologiaEnsenanza: val }));
                            }}
                            onBlur={() => handleSaveBorrador()}
                            rows={4}
                            placeholder="Ej: Metodología activa centrada en el estudiante, sprints de desarrollo continuo..."
                            className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                        />
                    </div>

                    <div className="rounded-xl border border-border-thin bg-surface p-6 space-y-3 shadow-2xs">
                        <label className="text-xs font-bold text-text-main uppercase tracking-wider">
                            Recursos Didácticos y Tecnológicos
                        </label>
                        <p className="text-xs text-text-dim">
                            Software institucional, entornos de laboratorio y materiales recomendados.
                        </p>
                        <textarea
                            value={borrador.recursosDidacticos || ''}
                            onChange={(e) => {
                                const val = e.target.value;
                                setBorrador(prev => ({ ...prev, recursosDidacticos: val }));
                            }}
                            onBlur={() => handleSaveBorrador()}
                            rows={4}
                            placeholder="Ej: Entornos Docker, Visual Studio Code, bases de datos MariaDB..."
                            className="w-full bg-bg-deep border border-border-thin rounded-lg p-3 text-xs text-text-main placeholder:text-text-dim focus:outline-none focus:border-[#0070f3] leading-relaxed resize-y"
                        />
                    </div>
                </div>
            )}

            {/* Modal de Confirmación para Aplicar al PEA Oficial */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white dark:bg-zinc-950 border border-border-thin rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-text-main">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-[#0070f3]" />
                            <h3 className="text-sm font-bold">
                                Volcar Acuerdos al PEA Oficial
                            </h3>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                            Esta acción transferirá el objetivo general consensuado, las unidades temáticas y los resultados de aprendizaje al PEA oficial de <strong className="text-text-main">{asignatura.nombreAsignatura}</strong>.
                        </p>
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-[11px] text-blue-700 dark:text-blue-300">
                            El docente titular podrá revisar el documento en su panel antes de la firma digital institucional.
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

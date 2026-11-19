import React, { useState, useEffect, useMemo } from 'react';
import { GitCompare, ArrowRightLeft, BookOpen, Clock, Award, CheckCircle2, AlertCircle, Plus } from 'lucide-react';
import type { SalaAsignaturaItemDto } from '../../../../services/salaCarreraService';
import { getPeaByAsignaturaPeriodo, getPeaByUuid, type PeaDto } from '../../../../services/peaService';
import { getTributacionAsignatura, type AsignaturaTributacionDto } from '../../../../services/normativaService';
import { GeistSelect, type GeistSelectOption } from '../../../../components/Common/GeistSelect';

interface SalaComparadorCurricularProps {
    asignaturas: SalaAsignaturaItemDto[];
    carreraNombre: string;
    idCarrera: number;
    periodoActual: string;
    onCrearAcuerdoPizarra?: (titulo: string, descripcion: string, categoria: string) => void;
}

export const SalaComparadorCurricular: React.FC<SalaComparadorCurricularProps> = ({
    asignaturas,
    carreraNombre,
    idCarrera,
    periodoActual,
    onCrearAcuerdoPizarra,
}) => {
    // Selección de asignaturas a comparar
    const [idAsigA, setIdAsigA] = useState<number>(() => {
        return asignaturas[0]?.idAsignatura ?? asignaturas[0]?.id_asignatura ?? 0;
    });

    const [idAsigB, setIdAsigB] = useState<number>(() => {
        return asignaturas[1]?.idAsignatura ?? asignaturas[1]?.id_asignatura ?? (asignaturas[0]?.idAsignatura ?? 0);
    });

    const [peaA, setPeaA] = useState<PeaDto | null>(null);
    const [peaB, setPeaB] = useState<PeaDto | null>(null);
    const [loadingA, setLoadingA] = useState<boolean>(false);
    const [loadingB, setLoadingB] = useState<boolean>(false);

    const [tributacionA, setTributacionA] = useState<AsignaturaTributacionDto[]>([]);
    const [tributacionB, setTributacionB] = useState<AsignaturaTributacionDto[]>([]);

    // Subpestaña de visualización comparativa
    const [vistaActiva, setVistaActiva] = useState<'general' | 'unidades' | 'rda' | 'tributacion'>('general');

    // Estado del diálogo para crear acuerdo desde la comparación
    const [mostrarModalAcuerdo, setMostrarModalAcuerdo] = useState<boolean>(false);
    const [acuerdoTitulo, setAcuerdoTitulo] = useState<string>('');
    const [acuerdoDetalle, setAcuerdoDetalle] = useState<string>('');
    const [acuerdoCategoria, setAcuerdoCategoria] = useState<string>('Metodología');

    // Sincronizar selección inicial cuando cargan las asignaturas
    useEffect(() => {
        if (asignaturas.length > 0) {
            const firstId = asignaturas[0].idAsignatura ?? asignaturas[0].id_asignatura ?? 0;
            const secondId = asignaturas[1]?.idAsignatura ?? asignaturas[1]?.id_asignatura ?? firstId;
            if (!idAsigA) setIdAsigA(firstId);
            if (!idAsigB && asignaturas.length > 1) setIdAsigB(secondId);
        }
    }, [asignaturas, idAsigA, idAsigB]);

    // Opciones para los selectores
    const opcionesAsignaturas: GeistSelectOption[] = useMemo(() => {
        return asignaturas.map((a) => {
            const id = a.idAsignatura ?? a.id_asignatura ?? 0;
            const cod = a.codigoAsignatura ?? a.codigo_asignatura ?? '';
            const nom = a.nombreAsignatura ?? a.nombre_asignatura ?? `Asignatura ${id}`;
            const niv = a.nombreNivel ?? a.nombre_nivel ?? `Nivel ${a.idNivel ?? a.id_nivel ?? '-'}`;
            const doc = a.nombreDocenteResponsable ?? a.nombre_docente_responsable ?? 'Sin docente';
            return {
                value: id,
                label: `${cod ? `${cod} - ` : ''}${nom} (${niv} • ${doc})`,
            };
        });
    }, [asignaturas]);

    const infoAsigA = useMemo(() => {
        return asignaturas.find((a) => (a.idAsignatura ?? a.id_asignatura) === idAsigA) || null;
    }, [asignaturas, idAsigA]);

    const infoAsigB = useMemo(() => {
        return asignaturas.find((a) => (a.idAsignatura ?? a.id_asignatura) === idAsigB) || null;
    }, [asignaturas, idAsigB]);

    // Cargar PEA y tributaciones de Asignatura A
    useEffect(() => {
        let mounted = true;
        if (!idAsigA) {
            setPeaA(null);
            setTributacionA([]);
            return;
        }

        const cargarA = async () => {
            setLoadingA(true);
            try {
                const peaUuid = infoAsigA?.peaUuid ?? infoAsigA?.pea_uuid;
                const promPea = peaUuid
                    ? getPeaByUuid(peaUuid)
                    : getPeaByAsignaturaPeriodo(idAsigA, periodoActual).catch(() => null);

                const promTrib = getTributacionAsignatura(idAsigA, 23).catch(() => []);

                const [resPea, resTrib] = await Promise.all([promPea, promTrib]);
                if (mounted) {
                    setPeaA(resPea);
                    setTributacionA(resTrib);
                }
            } catch {
                if (mounted) {
                    setPeaA(null);
                    setTributacionA([]);
                }
            } finally {
                if (mounted) setLoadingA(false);
            }
        };

        cargarA();
        return () => { mounted = false; };
    }, [idAsigA, infoAsigA, periodoActual]);

    // Cargar PEA y tributaciones de Asignatura B
    useEffect(() => {
        let mounted = true;
        if (!idAsigB) {
            setPeaB(null);
            setTributacionB([]);
            return;
        }

        const cargarB = async () => {
            setLoadingB(true);
            try {
                const peaUuid = infoAsigB?.peaUuid ?? infoAsigB?.pea_uuid;
                const promPea = peaUuid
                    ? getPeaByUuid(peaUuid)
                    : getPeaByAsignaturaPeriodo(idAsigB, periodoActual).catch(() => null);

                const promTrib = getTributacionAsignatura(idAsigB, 23).catch(() => []);

                const [resPea, resTrib] = await Promise.all([promPea, promTrib]);
                if (mounted) {
                    setPeaB(resPea);
                    setTributacionB(resTrib);
                }
            } catch {
                if (mounted) {
                    setPeaB(null);
                    setTributacionB([]);
                }
            } finally {
                if (mounted) setLoadingB(false);
            }
        };

        cargarB();
        return () => { mounted = false; };
    }, [idAsigB, infoAsigB, periodoActual]);

    // Intercambiar asignaturas
    const handleSwap = () => {
        const temp = idAsigA;
        setIdAsigA(idAsigB);
        setIdAsigB(temp);
    };

    // Diagnóstico de Articulación Curricular
    const diagnosticoArticulacion = useMemo(() => {
        const nivelA = infoAsigA?.idNivel ?? infoAsigA?.id_nivel;
        const nivelB = infoAsigB?.idNivel ?? infoAsigB?.id_nivel;

        if (!nivelA || !nivelB) {
            return {
                tipo: 'general',
                badge: 'Articulación General de Cátedra',
                descripcion: 'Revisión analítica de contenidos para armonizar metodologías de aprendizaje y evaluación.',
            };
        }

        if (nivelA === nivelB) {
            return {
                tipo: 'horizontal',
                badge: 'Articulación Horizontal (Mismo Semestre)',
                descripcion: 'Ambas materias se cursan en paralelo. Es indispensable verificar que no existan temas ni evaluaciones superpuestas en las mismas semanas, coordinando talleres de integración.',
            };
        }

        const dif = Math.abs(nivelA - nivelB);
        return {
            tipo: 'vertical',
            badge: `Articulación Vertical (${dif === 1 ? 'Semestres Consecutivos' : `${dif} Semestres de Separación`})`,
            descripcion: 'Asignaturas con progresión formativa temporal. Corroborar que las bases conceptuales y destrezas de la materia previa sustenten adecuadamente los contenidos de la posterior.',
        };
    }, [infoAsigA, infoAsigB]);

    // Manejo de propuesta de acuerdo hacia la pizarra
    const handleAbrirPropuestaAcuerdo = () => {
        const nomA = infoAsigA?.nombreAsignatura ?? infoAsigA?.nombre_asignatura ?? 'Asignatura A';
        const nomB = infoAsigB?.nombreAsignatura ?? infoAsigB?.nombre_asignatura ?? 'Asignatura B';
        setAcuerdoTitulo(`Articulación: ${nomA} y ${nomB}`);
        setAcuerdoDetalle(
            `Acuerdo curricular de ${diagnosticoArticulacion.tipo === 'horizontal' ? 'articulación horizontal' : 'articulación vertical'}: Se acuerda armonizar los contenidos de unidades para evitar redundancias y fortalecer la correlación práctica.`
        );
        setAcuerdoCategoria('Metodología');
        setMostrarModalAcuerdo(true);
    };

    const handleConfirmarAcuerdo = () => {
        if (!acuerdoTitulo.trim() || !onCrearAcuerdoPizarra) return;
        onCrearAcuerdoPizarra(acuerdoTitulo.trim(), acuerdoDetalle.trim(), acuerdoCategoria);
        setMostrarModalAcuerdo(false);
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6 select-none">
            {/* Cabecera Informativa */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#0070f3] font-semibold">
                        Armonización Curricular • {carreraNombre}
                    </span>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                        Comparador Curricular y Articulación Pedagógica
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Analiza lado a lado las unidades temáticas, horas y resultados de aprendizaje entre cátedras del período {periodoActual}.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleAbrirPropuestaAcuerdo}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#0060df] rounded-lg transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                    >
                        <Plus size={14} />
                        <span>Proponer Acuerdo en Pizarra</span>
                    </button>
                </div>
            </div>

            {/* Selectores lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                        Asignatura A (Referencia)
                    </label>
                    <GeistSelect
                        value={idAsigA}
                        options={opcionesAsignaturas}
                        onChange={(val) => setIdAsigA(Number(val))}
                        size="md"
                        className="w-full"
                    />
                </div>

                <div className="flex justify-center pt-2 md:pt-4">
                    <button
                        type="button"
                        onClick={handleSwap}
                        title="Intercambiar asignaturas"
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-[#0070f3] dark:hover:text-blue-400 hover:border-[#0070f3] transition-all cursor-pointer shadow-2xs"
                    >
                        <ArrowRightLeft size={16} />
                    </button>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-zinc-400">
                        Asignatura B (Contraste)
                    </label>
                    <GeistSelect
                        value={idAsigB}
                        options={opcionesAsignaturas}
                        onChange={(val) => setIdAsigB(Number(val))}
                        size="md"
                        className="w-full"
                    />
                </div>
            </div>

            {/* Banner de Diagnóstico de Articulación */}
            <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 flex items-start gap-3">
                <AlertCircle size={18} className="text-[#0070f3] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-[#0070f3] dark:text-blue-400">
                        {diagnosticoArticulacion.badge}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                        {diagnosticoArticulacion.descripcion}
                    </p>
                </div>
            </div>

            {/* Pestañas sobre Riel Plano */}
            <div className="border-b border-slate-200 dark:border-zinc-800">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setVistaActiva('general')}
                        className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                            vistaActiva === 'general'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        Carga Horaria y Docencia
                    </button>
                    <button
                        type="button"
                        onClick={() => setVistaActiva('unidades')}
                        className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                            vistaActiva === 'unidades'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        Unidades y Contenidos
                    </button>
                    <button
                        type="button"
                        onClick={() => setVistaActiva('rda')}
                        className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                            vistaActiva === 'rda'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        Resultados de Aprendizaje (RDA)
                    </button>
                    <button
                        type="button"
                        onClick={() => setVistaActiva('tributacion')}
                        className={`pb-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                            vistaActiva === 'tributacion'
                                ? 'border-[#0070f3] text-[#0070f3] dark:border-blue-400 dark:text-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200'
                        }`}
                    >
                        Aporte al Perfil de Egreso
                    </button>
                </nav>
            </div>

            {/* Contenido de la Comparación */}
            {vistaActiva === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tarjeta Ficha A */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                    {infoAsigA?.codigoAsignatura || infoAsigA?.codigo_asignatura || 'CÓDIGO'}
                                </span>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {infoAsigA?.nombreAsignatura || infoAsigA?.nombre_asignatura || 'Asignatura A'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    {infoAsigA?.nombreNivel || infoAsigA?.nombre_nivel || 'Nivel'}
                                </p>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {peaA?.estadoPea || infoAsigA?.estadoPea || infoAsigA?.estado_pea || 'Borrador'}
                            </span>
                        </div>

                        <dl className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Docente Responsable</dt>
                                <dd className="font-medium text-slate-800 dark:text-zinc-200 truncate" title={infoAsigA?.nombreDocenteResponsable}>
                                    {infoAsigA?.nombreDocenteResponsable || 'No asignado'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Total Horas</dt>
                                <dd className="font-semibold text-slate-900 dark:text-white">
                                    {peaA?.totalHorasAsignatura || 0} h
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Docencia (CD)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaA?.horasContactoDocente || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Prácticas (APE)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaA?.horasPracticoExperimental || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Autónomo (TA)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaA?.horasAutonomas || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Unidades Formadas</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaA?.unidades?.length || 0} unidades</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Tarjeta Ficha B */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-4">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                    {infoAsigB?.codigoAsignatura || infoAsigB?.codigo_asignatura || 'CÓDIGO'}
                                </span>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                    {infoAsigB?.nombreAsignatura || infoAsigB?.nombre_asignatura || 'Asignatura B'}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                    {infoAsigB?.nombreNivel || infoAsigB?.nombre_nivel || 'Nivel'}
                                </p>
                            </div>
                            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {peaB?.estadoPea || infoAsigB?.estadoPea || infoAsigB?.estado_pea || 'Borrador'}
                            </span>
                        </div>

                        <dl className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Docente Responsable</dt>
                                <dd className="font-medium text-slate-800 dark:text-zinc-200 truncate" title={infoAsigB?.nombreDocenteResponsable}>
                                    {infoAsigB?.nombreDocenteResponsable || 'No asignado'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Total Horas</dt>
                                <dd className="font-semibold text-slate-900 dark:text-white">
                                    {peaB?.totalHorasAsignatura || 0} h
                                </dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Docencia (CD)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaB?.horasContactoDocente || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Prácticas (APE)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaB?.horasPracticoExperimental || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Autónomo (TA)</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaB?.horasAutonomas || 0} h</dd>
                            </div>
                            <div>
                                <dt className="text-slate-400 text-[10px] uppercase font-semibold">Unidades Formadas</dt>
                                <dd className="text-slate-700 dark:text-zinc-300">{peaB?.unidades?.length || 0} unidades</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            )}

            {vistaActiva === 'unidades' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Unidades Asignatura A */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Unidades de {infoAsigA?.nombreAsignatura || 'Asignatura A'}
                        </h4>
                        {loadingA ? (
                            <p className="text-xs text-slate-400 py-4 text-center">Cargando unidades temáticas...</p>
                        ) : peaA?.unidades && peaA.unidades.length > 0 ? (
                            <div className="space-y-3">
                                {peaA.unidades.map((u, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                                            <span>Unidad {u.numeroUnidad || idx + 1}: {u.tituloUnidad}</span>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {(u.horasDocencia || 0) + (u.horasPracticas || 0) + (u.horasAutonomas || 0)} h
                                            </span>
                                        </div>
                                        {u.temas && u.temas.length > 0 && (
                                            <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-zinc-400 space-y-0.5 pt-1">
                                                {u.temas.map((t, tidx) => (
                                                    <li key={tidx} className="truncate">{t.nombreTema}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No hay unidades registradas en el PEA de esta materia.</p>
                        )}
                    </div>

                    {/* Unidades Asignatura B */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Unidades de {infoAsigB?.nombreAsignatura || 'Asignatura B'}
                        </h4>
                        {loadingB ? (
                            <p className="text-xs text-slate-400 py-4 text-center">Cargando unidades temáticas...</p>
                        ) : peaB?.unidades && peaB.unidades.length > 0 ? (
                            <div className="space-y-3">
                                {peaB.unidades.map((u, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-zinc-200">
                                            <span>Unidad {u.numeroUnidad || idx + 1}: {u.tituloUnidad}</span>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {(u.horasDocencia || 0) + (u.horasPracticas || 0) + (u.horasAutonomas || 0)} h
                                            </span>
                                        </div>
                                        {u.temas && u.temas.length > 0 && (
                                            <ul className="list-disc list-inside text-[11px] text-slate-600 dark:text-zinc-400 space-y-0.5 pt-1">
                                                {u.temas.map((t, tidx) => (
                                                    <li key={tidx} className="truncate">{t.nombreTema}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No hay unidades registradas en el PEA de esta materia.</p>
                        )}
                    </div>
                </div>
            )}

            {vistaActiva === 'rda' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* RDA Asignatura A */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Resultados de Aprendizaje: {infoAsigA?.nombreAsignatura || 'Asignatura A'}
                        </h4>
                        <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-slate-100 dark:border-zinc-800">
                            {peaA?.resultadosAprendizaje || 'Resultados de aprendizaje de la asignatura no formalizados aún en el PEA.'}
                        </div>
                    </div>

                    {/* RDA Asignatura B */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Resultados de Aprendizaje: {infoAsigB?.nombreAsignatura || 'Asignatura B'}
                        </h4>
                        <div className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-slate-100 dark:border-zinc-800">
                            {peaB?.resultadosAprendizaje || 'Resultados de aprendizaje de la asignatura no formalizados aún en el PEA.'}
                        </div>
                    </div>
                </div>
            )}

            {vistaActiva === 'tributacion' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tributación Asignatura A */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Tributación al Perfil de Egreso: {infoAsigA?.nombreAsignatura || 'Asignatura A'}
                        </h4>
                        {tributacionA.length > 0 ? (
                            <div className="space-y-2">
                                {tributacionA.map((t, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[#0070f3] dark:text-blue-400 font-mono text-[11px]">{t.codigoRda}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                Aporte {t.nivelAporte}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                                            {t.descripcionRda}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No hay registros de tributación curricular configurados para esta materia.</p>
                        )}
                    </div>

                    {/* Tributación Asignatura B */}
                    <div className="p-5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-zinc-800">
                            Tributación al Perfil de Egreso: {infoAsigB?.nombreAsignatura || 'Asignatura B'}
                        </h4>
                        {tributacionB.length > 0 ? (
                            <div className="space-y-2">
                                {tributacionB.map((t, idx) => (
                                    <div key={idx} className="p-3 rounded-lg border border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 text-xs space-y-1">
                                        <div className="flex items-center justify-between font-semibold">
                                            <span className="text-[#0070f3] dark:text-blue-400 font-mono text-[11px]">{t.codigoRda}</span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                                Aporte {t.nivelAporte}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                                            {t.descripcionRda}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 py-6 text-center">No hay registros de tributación curricular configurados para esta materia.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Modal para Proponer Acuerdo en Pizarra */}
            {mostrarModalAcuerdo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 select-none">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 space-y-4 shadow-xl">
                        <div className="space-y-1 border-b border-slate-100 dark:border-zinc-800 pb-3">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0070f3] font-semibold">
                                Nueva Propuesta a Pizarra Compartida
                            </span>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                Crear Acuerdo Curricular
                            </h3>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Título del Acuerdo</label>
                                <input
                                    type="text"
                                    value={acuerdoTitulo}
                                    onChange={(e) => setAcuerdoTitulo(e.target.value)}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Categoría</label>
                                <GeistSelect
                                    value={acuerdoCategoria}
                                    options={[
                                        { value: 'Metodología', label: 'Metodología' },
                                        { value: 'Evaluación', label: 'Evaluación' },
                                        { value: 'Proyectos de Aula', label: 'Proyectos de Aula' },
                                        { value: 'Infraestructura / TIC', label: 'Infraestructura / TIC' },
                                        { value: 'General', label: 'General' },
                                    ]}
                                    onChange={(val) => setAcuerdoCategoria(String(val))}
                                    size="sm"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="font-semibold text-slate-700 dark:text-zinc-300">Detalles consensuados</label>
                                <textarea
                                    value={acuerdoDetalle}
                                    onChange={(e) => setAcuerdoDetalle(e.target.value)}
                                    rows={4}
                                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0070f3] resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
                            <button
                                type="button"
                                onClick={() => setMostrarModalAcuerdo(false)}
                                className="px-3 py-2 text-xs font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmarAcuerdo}
                                disabled={!acuerdoTitulo.trim()}
                                className="px-4 py-2 text-xs font-semibold text-white bg-[#0070f3] hover:bg-[#0060df] disabled:opacity-40 rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                                Insertar en Pizarra
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SalaComparadorCurricular;

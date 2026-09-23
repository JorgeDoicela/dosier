import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../api/AuthContext';
import { useNotifications } from '../../../api/NotificationsContext';
import { docenteAsignaturasService, type DocenteAsignaturaDto } from '../../../services/docenteAsignaturasService';
import { buildWorkspacePath } from '../../../core/documents/templateUrl';
import { MOCK_PEAS, type MockPeaItem } from './data/mockCurricularData';
import { ClonarPeaModal } from './Modals/ClonarPeaModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';
import { BookOpen, RefreshCw, Layers, Clock } from 'lucide-react';

export const DocentePeaDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToast } = useNotifications();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [misPeas, setMisPeas] = useState<MockPeaItem[]>(() =>
        MOCK_PEAS.filter(p => p.docente_responsable === 'Ing. Edison Pérez')
    );
    const [materiasReales, setMateriasReales] = useState<DocenteAsignaturaDto[]>([]);
    const [modoDatos, setModoDatos] = useState<'real' | 'simulado'>('simulado');

    // Modales
    const [clonarModalMateria, setClonarModalMateria] = useState<MockPeaItem | null>(null);
    const [auditoriaPea, setAuditoriaPea] = useState<MockPeaItem | null>(null);

    const cargarMaterias = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await docenteAsignaturasService.getMisMaterias();
            if (data && Array.isArray(data) && data.length > 0) {
                setMateriasReales(data);
                setModoDatos('real');
            } else {
                setModoDatos('simulado');
            }
        } catch {
            // Fallback elegante a datos curriculares institucionales en desarrollo
            setModoDatos('simulado');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMaterias();
    }, [cargarMaterias]);

    const handleEditarPea = (id: string | number, nombre: string, uuidPea?: string) => {
        const targetUuid = uuidPea || String(id);
        addToast(
            'Abriendo Editor PEA',
            `Cargando las 11 secciones normativas de "${nombre}" con soporte colaborativo Yjs.`,
            'info'
        );
        navigate(buildWorkspacePath('PEA_OFICIAL', targetUuid, '', '/documentacion/mis-proyectos'));
    };

    const handleEnviarRevision = (id: string, nombre: string) => {
        setMisPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    estado_workflow: 'En_Revision_Carrera'
                };
            }
            return p;
        }));
        addToast(
            'PEA Enviado a Revisión de Carrera',
            `El instrumento curricular de "${nombre}" fue enviado al despacho del Coordinador de Carrera.`,
            'success'
        );
    };

    const handleClonadoExitoso = (id: string) => {
        setMisPeas(prev => prev.map(p => {
            if (p.id === id) {
                return {
                    ...p,
                    cumple_caces: true
                };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-5">
            {/* Encabezado Vercel Geist */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Mis Asignaturas y Elaboración de PEA
                        </h1>
                        <span className="badge-subtle">
                            {user?.nombre_completo || 'Docente Institucional'}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Período 2025-A • Formulación colaborativa de las 11 secciones normativas e importación de cátedras previas
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const borrador = misPeas.find(p => p.estado_workflow === 'Borrador') || misPeas[0];
                            setClonarModalMateria(borrador);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                    >
                        Clonar PEA Anterior
                    </button>
                    <button
                        onClick={() => {
                            if (misPeas[0]) setAuditoriaPea(misPeas[0]);
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Validador Horas CES
                    </button>
                </div>
            </div>

            {/* Listado de Asignaturas Asignadas */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Instrumentos Curriculares a Elaborar
                    </h2>
                    <span className="text-[11px] text-zinc-500 font-mono">
                        {misPeas.length} asignaturas activas
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {misPeas.map(pea => (
                        <div
                            key={pea.id}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 flex flex-col justify-between space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span className="badge-subtle">
                                        {pea.codigo_asignatura}
                                    </span>
                                    {pea.estado_workflow === 'Borrador' && (
                                        <span className="badge-subtle">
                                            Borrador
                                        </span>
                                    )}
                                    {pea.estado_workflow === 'En_Revision_Carrera' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-medium">
                                            En Revisión Carrera
                                        </span>
                                    )}
                                    {pea.estado_workflow === 'Avalado_Academica' && (
                                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-medium">
                                            Aval Académico Listo
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">
                                    {pea.nombre_asignatura}
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {pea.carrera} • {pea.semestre}
                                </p>

                                {/* Distribución horaria */}
                                <div className="mt-3 p-2.5 rounded-md surface-subtle text-[11px] space-y-1 font-mono">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-500">Carga Horaria Total:</span>
                                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {pea.horas_totales}h
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                        <span>Docencia: {pea.horas_docencia}h</span>
                                        <span>Prácticas: {pea.horas_practicas}h</span>
                                        <span>Autónomo: {pea.horas_autonomo}h</span>
                                    </div>
                                </div>

                                {pea.observacion_pendiente && (
                                    <div className="mt-3 p-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs">
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            Observación del Coordinador:
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-zinc-600 dark:text-zinc-400">{pea.observacion_pendiente}</p>
                                    </div>
                                )}
                            </div>

                            {/* Acciones de la Tarjeta */}
                            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 space-y-2">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEditarPea(pea.id, pea.nombre_asignatura)}
                                        className="flex-1 py-1.5 px-3 text-xs font-medium rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors text-center"
                                    >
                                        Editar PEA (11 Secc.)
                                    </button>
                                    <button
                                        onClick={() => setClonarModalMateria(pea)}
                                        className="px-2.5 py-1.5 text-xs font-medium rounded border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                                        title="Clonar de semestre anterior"
                                    >
                                        Clonar
                                    </button>
                                </div>

                                {pea.estado_workflow === 'Borrador' && (
                                    <button
                                        onClick={() => handleEnviarRevision(pea.id, pea.nombre_asignatura)}
                                        className="w-full py-1 px-3 text-[11px] font-medium rounded border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Enviar a Revisión de Carrera
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modales */}
            {clonarModalMateria && (
                <ClonarPeaModal
                    isOpen={!!clonarModalMateria}
                    onClose={() => setClonarModalMateria(null)}
                    asignaturaDestino={clonarModalMateria.nombre_asignatura}
                    onClonadoExitoso={() => handleClonadoExitoso(clonarModalMateria.id)}
                />
            )}

            {auditoriaPea && (
                <AuditoriaCacesModal
                    isOpen={!!auditoriaPea}
                    onClose={() => setAuditoriaPea(null)}
                    asignatura={auditoriaPea.nombre_asignatura}
                    carrera={auditoriaPea.carrera}
                    horasTotales={auditoriaPea.horas_totales}
                    horasDocencia={auditoriaPea.horas_docencia}
                    horasPracticas={auditoriaPea.horas_practicas}
                    horasAutonomo={auditoriaPea.horas_autonomo}
                    cumpleCaces={auditoriaPea.cumple_caces}
                    tieneAvalCarrera={auditoriaPea.tiene_aval_carrera}
                    tieneAvalAcademica={auditoriaPea.tiene_aval_academica}
                    tieneFirmaRectorado={auditoriaPea.tiene_firma_rectorado}
                />
            )}
        </div>
    );
};

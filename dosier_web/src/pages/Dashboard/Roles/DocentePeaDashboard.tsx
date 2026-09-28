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
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Docencia Curricular • Período 2025-A
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Mis Asignaturas y Elaboración de PEA
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            {user?.nombre_completo || 'Docente Institucional'}
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Formulación colaborativa de las 11 secciones normativas e importación de cátedras previas.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const borrador = misPeas.find(p => p.estado_workflow === 'Borrador') || misPeas[0];
                            setClonarModalMateria(borrador);
                        }}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                    >
                        Clonar PEA Anterior
                    </button>
                    <button
                        onClick={() => {
                            if (misPeas[0]) setAuditoriaPea(misPeas[0]);
                        }}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Validador Horas CES
                    </button>
                </div>
            </div>

            {/* Folio Unificado con Tabla de Asignaturas */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Instrumentos Curriculares a Elaborar
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                        {misPeas.length} asignaturas activas
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-2.5 px-5">Asignatura y Ciclo</th>
                                <th className="py-2.5 px-4">Carga Horaria</th>
                                <th className="py-2.5 px-4">Estado del PEA</th>
                                <th className="py-2.5 px-5 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {misPeas.map(pea => (
                                <tr key={pea.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-3 px-5">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                    {pea.codigo_asignatura}
                                                </span>
                                                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                                    {pea.nombre_asignatura}
                                                </p>
                                            </div>
                                            <p className="text-[11px] text-zinc-500">
                                                {pea.carrera} • {pea.semestre}
                                            </p>
                                            {pea.observacion_pendiente && (
                                                <div className="pt-1 text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                                                    Observación: {pea.observacion_pendiente}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 font-mono">
                                        <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                                            {pea.horas_totales}h Total
                                        </div>
                                        <div className="text-[10.5px] text-zinc-500">
                                            {pea.horas_docencia}D / {pea.horas_practicas}P / {pea.horas_autonomo}A
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        {pea.estado_workflow === 'Borrador' && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 shrink-0" />
                                                <span>Borrador</span>
                                            </div>
                                        )}
                                        {pea.estado_workflow === 'En_Revision_Carrera' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                <span>En Revisión Carrera</span>
                                            </div>
                                        )}
                                        {pea.estado_workflow === 'Avalado_Academica' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Aval Académico Listo</span>
                                            </div>
                                        )}
                                        {pea.estado_workflow === 'Legalizado' && (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Legalizado en Firme</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3 px-5 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => handleEditarPea(pea.id, pea.nombre_asignatura)}
                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                            >
                                                Editar PEA
                                            </button>
                                            <button
                                                onClick={() => setClonarModalMateria(pea)}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                            >
                                                Clonar
                                            </button>
                                            {pea.estado_workflow === 'Borrador' && (
                                                <button
                                                    onClick={() => handleEnviarRevision(pea.id, pea.nombre_asignatura)}
                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-blue-200 dark:border-blue-900/60 text-[#0070f3] dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors cursor-pointer"
                                                >
                                                    Enviar a Revisión
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

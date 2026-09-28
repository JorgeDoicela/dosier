import React, { useState } from 'react';
import { useNotifications } from '../../../api/NotificationsContext';
import { MOCK_PEAS, type MockPeaItem } from './data/mockCurricularData';
import { LegalizacionFirmaModal } from './Modals/LegalizacionFirmaModal';
import { AuditoriaCacesModal } from './Modals/AuditoriaCacesModal';

export const VicerrectorDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const [peas, setPeas] = useState<MockPeaItem[]>(MOCK_PEAS);
    const [search, setSearch] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('todas');

    // Modales
    const [firmaModalPea, setFirmaModalPea] = useState<MockPeaItem | null>(null);
    const [isFirmaMasivaOpen, setIsFirmaMasivaOpen] = useState(false);
    const [auditoriaPea, setAuditoriaPea] = useState<MockPeaItem | null>(null);

    const peasListosParaFirma = peas.filter(p => p.estado_workflow === 'Avalado_Academica');

    const peasFiltrados = peas.filter(p => {
        const matchesCarrera = filterCarrera === 'todas' || p.carrera === filterCarrera;
        const matchesSearch = search === '' ||
            p.nombre_asignatura.toLowerCase().includes(search.toLowerCase()) ||
            p.docente_responsable.toLowerCase().includes(search.toLowerCase());
        return matchesCarrera && matchesSearch;
    });

    const handleFirmadoExitoso = (id?: string) => {
        if (id) {
            setPeas(prev => prev.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        estado_workflow: 'Legalizado',
                        tiene_firma_rectorado: true,
                        qr_hash: `ISTPET-PEA-2025A-${p.codigo_asignatura}-SHA256`
                    };
                }
                return p;
            }));
        } else {
            setPeas(prev => prev.map(p => {
                if (p.estado_workflow === 'Avalado_Academica') {
                    return {
                        ...p,
                        estado_workflow: 'Legalizado',
                        tiene_firma_rectorado: true,
                        qr_hash: `ISTPET-PEA-2025A-${p.codigo_asignatura}-SHA256`
                    };
                }
                return p;
            }));
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Legalización Curricular • Vicerrectorado Académico
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Despacho de Vicerrectorado Académico
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            Msc. Freddy Baño
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Legalización curricular en firme, firma criptográfica institucional y certificación pública CACES.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsFirmaMasivaOpen(true)}
                        disabled={peasListosParaFirma.length === 0}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                    >
                        Firma Masiva ({peasListosParaFirma.length})
                    </button>
                    <button
                        onClick={() => {
                            addToast(
                                'Dossier Institucional Compilado',
                                'Se generó el paquete PDF foliado y certificado con todos los PEAs aprobados del período 2025-A.',
                                'success'
                            );
                        }}
                        className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                        Descargar Dossier (PDF)
                    </button>
                </div>
            </div>

            {/* Bandeja de Despacho y Firma Legal */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-zinc-900">
                    <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Cola de Legalización y Archivo Oficial de PEAs
                    </h2>

                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            placeholder="Buscar asignatura o docente..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="px-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-zinc-400 w-56"
                        />

                        <select
                            value={filterCarrera}
                            onChange={e => setFilterCarrera(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-zinc-900 dark:text-white focus:outline-none"
                        >
                            <option value="todas">Todas las Carreras</option>
                            <option value="Desarrollo de Software">Desarrollo de Software</option>
                            <option value="Mecánica Industrial">Mecánica Industrial</option>
                            <option value="Entrenamiento Deportivo">Entrenamiento Deportivo</option>
                        </select>
                    </div>
                </div>

                {/* Tabla de Legalización */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-2.5 px-4">Asignatura</th>
                                <th className="py-2.5 px-3">Carrera</th>
                                <th className="py-2.5 px-3">Cadena de Avales Previos</th>
                                <th className="py-2.5 px-3">Estado Legal</th>
                                <th className="py-2.5 px-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-sans">
                            {peasFiltrados.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/50 transition-colors">
                                    <td className="py-2.5 px-4">
                                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                                            {p.nombre_asignatura}
                                        </p>
                                        <p className="text-[11px] text-zinc-500 font-mono">
                                            {p.codigo_asignatura} • {p.docente_responsable}
                                        </p>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {p.carrera}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        <div className="flex items-center gap-2 text-xs font-mono">
                                            <span className={p.estado_workflow !== 'Borrador' ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                                                {p.estado_workflow !== 'Borrador' ? '✓ ' : '1. '}Docente
                                            </span>
                                            <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                            <span className={p.tiene_aval_carrera ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                                                {p.tiene_aval_carrera ? '✓ ' : '2. '}Carrera
                                            </span>
                                            <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                            <span className={p.tiene_aval_academica ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'text-zinc-400 dark:text-zinc-600'}>
                                                {p.tiene_aval_academica ? '✓ ' : '3. '}Académica
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 px-3">
                                        {p.estado_workflow === 'Legalizado' ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                <span>Legalizado en Firme</span>
                                            </div>
                                        ) : p.estado_workflow === 'Avalado_Academica' ? (
                                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100 shrink-0" />
                                                <span>Listo para Firma Legal</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 shrink-0" />
                                                <span>En Proceso de Avales</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
                                            >
                                                Ver
                                            </button>

                                            {p.estado_workflow === 'Avalado_Academica' && (
                                                <button
                                                    onClick={() => setFirmaModalPea(p)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] transition-all shadow-xs cursor-pointer"
                                                >
                                                    Firmar PEA
                                                </button>
                                            )}

                                            {p.estado_workflow === 'Legalizado' && (
                                                <button
                                                    onClick={() => {
                                                        addToast(
                                                            'Enlace QR Público Copiado',
                                                            `https://dosier.istpet.edu.ec/verificacion/${p.qr_hash}`,
                                                            'info'
                                                        );
                                                    }}
                                                    className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors font-mono cursor-pointer"
                                                >
                                                    QR CACES
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
            {firmaModalPea && (
                <LegalizacionFirmaModal
                    isOpen={!!firmaModalPea}
                    onClose={() => setFirmaModalPea(null)}
                    tituloDocumento={firmaModalPea.nombre_asignatura}
                    carrera={firmaModalPea.carrera}
                    esMasivo={false}
                    onFirmadoExitoso={() => handleFirmadoExitoso(firmaModalPea.id)}
                />
            )}

            <LegalizacionFirmaModal
                isOpen={isFirmaMasivaOpen}
                onClose={() => setIsFirmaMasivaOpen(false)}
                tituloDocumento="Paquete Curricular Masivo"
                carrera={filterCarrera}
                esMasivo={true}
                cantidadPeas={peasListosParaFirma.length}
                onFirmadoExitoso={() => handleFirmadoExitoso()}
            />

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

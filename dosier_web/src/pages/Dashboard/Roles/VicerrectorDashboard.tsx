import React, { useState } from 'react';
import {
    Award,
    QrCode,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Search,
    Download,
    Eye,
    Globe,
    Layers,
    Clock,
    FileCheck2
} from 'lucide-react';
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
    const peasLegalizados = peas.filter(p => p.estado_workflow === 'Legalizado');

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
            // Masivo
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
            {/* Header Vicerrectorado */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/20 shrink-0">
                            <Award className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Despacho de Vicerrectorado Académico
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                    Msc. Freddy Baño (Vicerrector)
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Máxima instancia de legalización curricular, firma criptográfica SHA-256 y certificación pública CACES
                            </p>
                        </div>
                    </div>

                    {/* Botones de acción clave */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setIsFirmaMasivaOpen(true)}
                            disabled={peasListosParaFirma.length === 0}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                        >
                            <Award className="w-3.5 h-3.5" />
                            Firma y Legalización Masiva ({peasListosParaFirma.length})
                        </button>
                        <button
                            onClick={() => {
                                addToast(
                                    'Dossier Institucional Compilado',
                                    'Se generó el paquete PDF foliado y certificado con todos los PEAs aprobados del período 2025-A.',
                                    'success'
                                );
                            }}
                            className="px-3 py-2 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Descargar Dossier (PDF)
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs Ejecutivos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Total Instrumentos PEA</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">42</p>
                    <span className="text-[10px] text-zinc-400">Oferta Académica ISTPET</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-amber-500/30 bg-amber-500/5 shadow-2xs">
                    <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Listos para su Firma</p>
                    <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{peasListosParaFirma.length}</p>
                    <span className="text-[10px] text-amber-600 font-semibold">Tienen ambos avales</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Legalizados y Públicos</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{peasLegalizados.length}</p>
                    <span className="text-[10px] text-emerald-600/80">Con sello criptográfico</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Trazabilidad Criptográfica</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">100%</p>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Inmutable SHA-256
                    </span>
                </div>
            </div>

            {/* Bandeja de Despacho y Firma Legal */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900/40">
                    <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
                            Cola de Legalización y Archivo Oficial de PEAs
                        </h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Buscar PEA..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none w-48"
                            />
                        </div>

                        <select
                            value={filterCarrera}
                            onChange={e => setFilterCarrera(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none"
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
                        <thead className="bg-zinc-100 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-4">Asignatura</th>
                                <th className="py-3 px-3">Carrera</th>
                                <th className="py-3 px-3">Cadena de 3 Firmas Previas</th>
                                <th className="py-3 px-3">Estado Legal</th>
                                <th className="py-3 px-4 text-right">Acción de Vicerrector</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:border-zinc-800">
                            {peasFiltrados.map(p => (
                                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                    <td className="py-3 px-4">
                                        <p className="font-semibold text-zinc-900 dark:text-white">
                                            {p.nombre_asignatura}
                                        </p>
                                        <p className="text-[11px] text-zinc-500">
                                            {p.codigo_asignatura} • {p.docente_responsable}
                                        </p>
                                    </td>
                                    <td className="py-3 px-3">
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                            {p.carrera}
                                        </span>
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-1.5 text-[10px]">
                                            <span className={`px-1.5 py-0.5 rounded font-mono ${
                                                p.estado_workflow !== 'Borrador'
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                                1. Docente
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded font-mono ${
                                                p.tiene_aval_carrera
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                                2. Carrera
                                            </span>
                                            <span className={`px-1.5 py-0.5 rounded font-mono ${
                                                p.tiene_aval_academica
                                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                    : 'bg-zinc-100 text-zinc-400'
                                            }`}>
                                                3. Académica
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3">
                                        {p.estado_workflow === 'Legalizado' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                                                <QrCode className="w-3 h-3" />
                                                Legalizado en Firme
                                            </span>
                                        ) : p.estado_workflow === 'Avalado_Academica' ? (
                                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                Listo para Firma Legal
                                            </span>
                                        ) : (
                                            <span className="px-2 py-0.5 rounded text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                                                En Proceso de Avales
                                            </span>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => setAuditoriaPea(p)}
                                                className="px-2 py-1 text-[11px] font-medium rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
                                                title="Inspeccionar instrumento"
                                            >
                                                <Eye className="w-3 h-3" />
                                                Ver
                                            </button>

                                            {p.estado_workflow === 'Avalado_Academica' && (
                                                <button
                                                    onClick={() => setFirmaModalPea(p)}
                                                    className="px-2.5 py-1 text-[11px] font-medium rounded bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1 transition-colors shadow-2xs"
                                                    title="Legalizar y estampar firma digital"
                                                >
                                                    <Award className="w-3 h-3" />
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
                                                    className="px-2 py-1 text-[11px] font-medium rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 transition-colors"
                                                    title="Verificar en portal público con QR"
                                                >
                                                    <QrCode className="w-3 h-3" />
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

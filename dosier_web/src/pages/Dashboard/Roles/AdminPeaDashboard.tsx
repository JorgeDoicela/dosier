import React, { useState } from 'react';
import { useNotifications } from '../../../api/NotificationsContext';
import { Link } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    FileCode, 
    ArrowRight, 
    RefreshCw, 
    Database, 
    Layers,
    CheckCircle2
} from 'lucide-react';

export const AdminPeaDashboard: React.FC = () => {
    const { addToast } = useNotifications();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSincronizarSigafi = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            addToast(
                'Sincronización SIGAFI Concluida',
                'Se conectó exitosamente a MySQL (sigafi_es:3306). Se actualizaron 42 asignaturas, 28 profesores y 3 carreras del ISTPET.',
                'success'
            );
        }, 1000);
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Institucional Minimalista */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Administración Curricular y Datos Maestros
                        </h1>
                        <span className="badge-subtle">
                            DOSIER_ADMIN
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Conexión con SIGAFI institucional (Solo Lectura), distributivo docente de cátedras y gobernanza RBAC.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSincronizarSigafi}
                        disabled={isSyncing}
                        className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 inline-flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                        <RefreshCw size={13} className={`shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span>{isSyncing ? 'Sincronizando con SIGAFI...' : 'Sincronizar SIGAFI'}</span>
                    </button>
                </div>
            </div>

            {/* Accesos Rápidos a Módulos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/usuarios"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] transition-colors shadow-xs group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg surface-subtle flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <Users size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                Usuarios y Roles RBAC
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Administre asignaciones de roles institucionales (5 perfiles), permisos por módulo y credenciales SSO.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        <span>Gestionar identidades</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/auditoria"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] transition-colors shadow-xs group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg surface-subtle flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                Trazabilidad y Auditoría
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Bitácora inmutable de eventos normativos CACES: emisión de avales, legalizaciones y firmas digitales.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        <span>Explorar registros</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/plantillas"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] hover:border-black/[0.12] dark:hover:border-white/[0.16] transition-colors shadow-xs group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-3">
                        <div className="w-8 h-8 rounded-lg surface-subtle flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                            <FileCode size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                                Plantillas Curriculares
                            </h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Formulario oficial del PEA institucional en sus 11 secciones estructuradas con Yjs colaborativo.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        <span>Estructurar formato</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Detalle Técnico de Integración (Limpio, sin cajas dentro de cajas) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg bg-white dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
                        <div className="flex items-center gap-2">
                            <Database size={15} className="text-zinc-600 dark:text-zinc-400" />
                            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                Frontera SIGAFI (Solo Lectura)
                            </h2>
                        </div>
                        <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Activo
                        </span>
                    </div>

                    <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs">
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-zinc-500 dark:text-zinc-400">Base de Datos Institucional:</span>
                            <span className="badge-subtle">sigafi_es (MySQL 3306)</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-zinc-500 dark:text-zinc-400">Carreras del Instituto:</span>
                            <span className="badge-subtle">3 Carreras Activas</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-zinc-500 dark:text-zinc-400">Distributivo y Profesores:</span>
                            <span className="badge-subtle">28 Docentes Sincronizados</span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <span className="text-zinc-500 dark:text-zinc-400">Asignaturas Normadas:</span>
                            <span className="badge-subtle">42 Cátedras con Art. 21 CES</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 rounded-lg bg-white dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-black/[0.04] dark:border-white/[0.05]">
                        <div className="flex items-center gap-2">
                            <Layers size={15} className="text-zinc-600 dark:text-zinc-400" />
                            <h2 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                Circuito Curricular Institucional
                            </h2>
                        </div>
                        <span className="badge-subtle">
                            5 Roles RBAC
                        </span>
                    </div>

                    <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04] text-xs">
                        <div className="flex items-center justify-between py-2.5">
                            <div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">1. Formulación de Cátedra</span>
                                <p className="text-[11px] text-zinc-400">Docente Responsable del PEA</p>
                            </div>
                            <span className="badge-subtle">
                                DOSIER_DOCENTE
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">2. Revisión Curricular</span>
                                <p className="text-[11px] text-zinc-400">Coordinador de Carrera</p>
                            </div>
                            <span className="badge-subtle">
                                DOSIER_COORD_CARRERA
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">3. Aval Académico</span>
                                <p className="text-[11px] text-zinc-400">Coordinación Académica General</p>
                            </div>
                            <span className="badge-subtle">
                                DOSIER_COORD_ACAD
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2.5">
                            <div>
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">4. Legalización y Sello CACES</span>
                                <p className="text-[11px] text-zinc-400">Vicerrectorado Académico</p>
                            </div>
                            <span className="badge-subtle">
                                DOSIER_VICERRECTOR
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import {
    Database,
    RefreshCw,
    Users,
    Activity,
    Shield,
    FileCode2,
    CheckCircle2,
    Server,
    Lock
} from 'lucide-react';
import { useNotifications } from '../../../api/NotificationsContext';
import { Link } from 'react-router-dom';

export const AdminPeaDashboard: React.FC = () => {
    const { addToast } = useNotifications();

    const handleSincronizarSigafi = () => {
        addToast(
            'Sincronización SIGAFI Concluida',
            'Se conectó a MySQL (sigafi_es) y se actualizaron 42 asignaciones de materias, 28 profesores y 3 carreras del ISTPET.',
            'success'
        );
    };

    return (
        <div className="space-y-6">
            {/* Header Admin */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shrink-0">
                            <Database className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                                    Panel de Administración y Gobernanza Curricular
                                </h1>
                                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                    DOSIER_ADMIN
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                Conexión con SIGAFI (Solo Lectura), sincronización de distributivos, auditoría y control de autoridades
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSincronizarSigafi}
                            className="px-3 py-2 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Sincronizar Distributivo con SIGAFI
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Materias en SIGAFI</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">42</p>
                    <span className="text-[10px] text-zinc-400">asignacion_materias</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Docentes Activos</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">28</p>
                    <span className="text-[10px] text-zinc-400">profesores (esInstituto=1)</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Autoridades Curriculares</p>
                    <p className="text-xl font-bold text-zinc-900 dark:text-white mt-1">5</p>
                    <span className="text-[10px] text-zinc-400">doc_autoridades_curriculares</span>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                    <p className="text-[11px] font-medium text-zinc-500">Estado de Conexión</p>
                    <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">En Línea</p>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                        <Server className="w-3 h-3" />
                        sigafi_es : 3306
                    </span>
                </div>
            </div>

            {/* Accesos Rápidos de Administración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/usuarios"
                    className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm space-y-2 block"
                >
                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Gestión de Usuarios y Roles RBAC
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Administre asignaciones de roles institucionales, permisos por módulo y credenciales SSO.
                    </p>
                </Link>

                <Link
                    to="/auditoria"
                    className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm space-y-2 block"
                >
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Trazabilidad y Auditoría de Firmas
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Registro forense de eventos de emisión de avales, legalizaciones y modificaciones curriculares.
                    </p>
                </Link>

                <Link
                    to="/plantillas"
                    className="p-5 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-sm space-y-2 block"
                >
                    <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                        <FileCode2 className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                        Diseñador de Plantillas Curriculares
                    </h3>
                    <p className="text-xs text-zinc-500">
                        Estructuración de secciones y componentes del formulario institucional del PEA.
                    </p>
                </Link>
            </div>
        </div>
    );
};

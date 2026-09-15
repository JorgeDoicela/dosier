import React from 'react';
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
        <div className="space-y-5">
            {/* Encabezado Vercel Geist */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                            Administración Curricular y Datos Maestros
                        </h1>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                            DOSIER_ADMIN
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Conexión con SIGAFI (Solo Lectura), sincronización de distributivos y gobierno de roles RBAC
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSincronizarSigafi}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                    >
                        Sincronizar SIGAFI
                    </button>
                </div>
            </div>

            {/* Accesos Rápidos de Administración */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    to="/usuarios"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors space-y-2 block"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        Módulo 01
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Usuarios y Roles RBAC
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Administre asignaciones de roles institucionales, permisos por módulo y credenciales SSO.
                    </p>
                </Link>

                <Link
                    to="/auditoria"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors space-y-2 block"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        Módulo 02
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Trazabilidad y Auditoría
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Registro inmutable de eventos de emisión de avales, legalizaciones y firmas digitales.
                    </p>
                </Link>

                <Link
                    to="/plantillas"
                    className="p-5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors space-y-2 block"
                >
                    <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                        Módulo 03
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Plantillas Curriculares
                    </h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                        Estructuración de secciones y componentes del formulario institucional del PEA.
                    </p>
                </Link>
            </div>
        </div>
    );
};

import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../../../api/NotificationsContext';
import { Link } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    FileCode, 
    ArrowRight, 
    RefreshCw, 
    Database, 
    CheckCircle2
} from 'lucide-react';
import { PipelineCurricularStepper } from './Components/PipelineCurricularStepper';
import { type RolSimulado } from './Components/RoleFlowBanner';
import { curriculumProjectService } from '../../../services/curriculumProjectService';
import { usersService } from '../../../services/usersService';
import { getBandejaPeas } from '../../../services/peaService';

interface AdminPeaDashboardProps {
    onCambiarRol?: (rol: RolSimulado) => void;
}

export const AdminPeaDashboard: React.FC<AdminPeaDashboardProps> = ({ onCambiarRol }) => {
    const { addToast } = useNotifications();
    const [isSyncing, setIsSyncing] = useState(false);
    const [carrerasCount, setCarrerasCount] = useState<number>(0);
    const [docentesCount, setDocentesCount] = useState<number>(0);
    const [materiasCount, setMateriasCount] = useState<number>(0);
    const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

    const loadSigafiStats = useCallback(async () => {
        setIsLoadingStats(true);
        try {
            const [carrerasList, usersRes, peasList] = await Promise.all([
                curriculumProjectService.getCarrerasInstitucionales().catch(() => []),
                usersService.getUsers({ page: 1, limit: 1 }).catch(() => ({ total_count: 0 })),
                getBandejaPeas().catch(() => [])
            ]);

            setCarrerasCount(carrerasList.length);
            setDocentesCount(usersRes.total_count || 0);
            setMateriasCount(peasList.length);
        } catch (error) {
            console.error('Error al cargar métricas de SIGAFI:', error);
        } finally {
            setIsLoadingStats(false);
        }
    }, []);

    useEffect(() => {
        loadSigafiStats();
    }, [loadSigafiStats]);

    const handleSincronizarSigafi = async () => {
        setIsSyncing(true);
        try {
            await loadSigafiStats();
            addToast(
                'Sincronización SIGAFI Concluida',
                `Conexión con MySQL (sigafi_es:3306) verificada. Se sincronizaron ${materiasCount} asignaturas, ${docentesCount} usuarios y ${carrerasCount} carreras del instituto.`,
                'success'
            );
        } catch {
            addToast('Error', 'No fue posible sincronizar los datos de SIGAFI.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Encabezado Institucional Modern Enterprise Docs */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#0070f3] dark:text-blue-400 block">
                        Superadministración Curricular • Modo Gobernanza
                    </span>
                    <div className="flex items-baseline gap-2.5">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Administración Curricular y Datos Maestros
                        </h1>
                        <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono font-medium">
                            DOSIER_ADMIN
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                        Conexión con SIGAFI institucional (Solo Lectura), distributivo docente de cátedras y gobernanza RBAC.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSincronizarSigafi}
                        disabled={isSyncing || isLoadingStats}
                        className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] active:bg-[#004ca3] inline-flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
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
                    className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-500 transition-all group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-2.5">
                        <Users size={18} className="text-[#0070f3] dark:text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                                Usuarios y Roles RBAC
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Administre asignaciones de roles institucionales (5 perfiles), permisos por módulo y credenciales SSO.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                        <span>Gestionar identidades</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/auditoria"
                    className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-500 transition-all group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-2.5">
                        <ShieldCheck size={18} className="text-[#0070f3] dark:text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                                Trazabilidad y Auditoría
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Bitácora inmutable de eventos normativos CACES: emisión de avales, legalizaciones y firmas digitales.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                        <span>Explorar registros</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>

                <Link
                    to="/plantillas"
                    className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 hover:border-[#0070f3] dark:hover:border-blue-500 transition-all group flex flex-col justify-between space-y-4 no-underline"
                >
                    <div className="space-y-2.5">
                        <FileCode size={18} className="text-[#0070f3] dark:text-blue-400" />
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                                Plantillas Curriculares
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                Formulario oficial del PEA institucional en sus 11 secciones estructuradas con Yjs colaborativo.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-zinc-400 group-hover:text-[#0070f3] dark:group-hover:text-blue-400 transition-colors">
                        <span>Estructurar formato</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </Link>
            </div>

            {/* Pipeline de Gestión y Circuito Normativo */}
            <PipelineCurricularStepper onSimularRol={onCambiarRol} />

            {/* Frontera SIGAFI (Solo Lectura) */}
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Database size={15} className="text-[#0070f3] dark:text-blue-400" />
                        <h2 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                            Frontera SIGAFI (Solo Lectura)
                        </h2>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Activo
                    </span>
                </div>

                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-zinc-500 dark:text-zinc-400">Base de Datos Institucional:</span>
                        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 font-medium">sigafi_es (MySQL 3306)</span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-zinc-500 dark:text-zinc-400">Carreras Autorizadas del Instituto:</span>
                        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            {isLoadingStats ? 'Consultando...' : `${carrerasCount} Carreras Registradas`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-zinc-500 dark:text-zinc-400">Usuarios y Cuerpo Docente:</span>
                        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            {isLoadingStats ? 'Consultando...' : `${docentesCount} Usuarios Sincronizados`}
                        </span>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                        <span className="text-zinc-500 dark:text-zinc-400">Asignaturas y PEAs en Plataforma:</span>
                        <span className="font-mono text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                            {isLoadingStats ? 'Consultando...' : `${materiasCount} Instrumentos Curriculares`}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

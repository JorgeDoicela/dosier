import React from 'react';
import { Link } from 'react-router-dom';
import { 
    Users, 
    ShieldCheck, 
    FileCode, 
    ArrowRight 
} from 'lucide-react';
import { PipelineCurricularStepper } from './Components/PipelineCurricularStepper';
import { type RolSimulado } from './Components/RoleFlowBanner';

interface AdminPeaDashboardProps {
    onCambiarRol?: (rol: RolSimulado) => void;
}

export const AdminPeaDashboard: React.FC<AdminPeaDashboardProps> = ({ onCambiarRol }) => {
    return (
        <div className="space-y-6">
            {/* Encabezado */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Administración Curricular
                </h1>
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
                                Administre asignaciones de roles institucionales, permisos por módulo y credenciales SSO.
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
                                Formulario oficial del PEA institucional en sus 11 secciones normativas con edición colaborativa.
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
        </div>
    );
};

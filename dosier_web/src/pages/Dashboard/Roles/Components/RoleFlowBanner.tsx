import React from 'react';
import { Users, GraduationCap, Shield, Award, UserCheck, Eye, Sparkles } from 'lucide-react';

export type RolSimulado = 'DOCENTE' | 'COORD_CARRERA' | 'COORD_ACAD' | 'VICERRECTOR' | 'ADMIN';

interface Props {
    rolActivo: RolSimulado;
    onCambiarRol: (rol: RolSimulado) => void;
    nombreUsuarioReal?: string;
    rolReal?: string;
}

export const RoleFlowBanner: React.FC<Props> = ({
    rolActivo,
    onCambiarRol,
    nombreUsuarioReal,
    rolReal
}) => {
    const ROLES: Array<{
        id: RolSimulado;
        nombre: string;
        cargo: string;
        representante: string;
        color: string;
        icon: React.ElementType;
    }> = [
        {
            id: 'COORD_ACAD',
            nombre: 'Coord. Académica',
            cargo: 'Gobernanza y Convocatoria Institucional',
            representante: 'Msc. Cristian Cobos',
            color: 'blue',
            icon: GraduationCap
        },
        {
            id: 'COORD_CARRERA',
            nombre: 'Coord. Carrera',
            cargo: 'Supervisión Disciplinar y Aval Técnico',
            representante: 'Ing. Wilfrido Trujillo (Software)',
            color: 'purple',
            icon: Shield
        },
        {
            id: 'DOCENTE',
            nombre: 'Docente de Cátedra',
            cargo: 'Formulación Concurrente y Semáforo Horas',
            representante: 'Ing. Edison Pérez',
            color: 'amber',
            icon: UserCheck
        },
        {
            id: 'VICERRECTOR',
            nombre: 'Vicerrectorado',
            cargo: 'Legalización en Firme y Publicación QR',
            representante: 'Msc. Freddy Baño',
            color: 'rose',
            icon: Award
        },
        {
            id: 'ADMIN',
            nombre: 'Administrador',
            cargo: 'Sincronización SIGAFI y Auditoría Forense',
            representante: 'Administrador General',
            color: 'zinc',
            icon: Users
        }
    ];

    return (
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Simulador y Explorador de Roles Curriculares
                    </span>
                    <span className="hidden md:inline text-[11px] text-zinc-500">
                        (Permite alternar entre los 5 perfiles para evaluar la experiencia completa de cada actor)
                    </span>
                </div>
                {nombreUsuarioReal && (
                    <span className="text-[11px] text-zinc-500">
                        Sesión Activa: <strong>{nombreUsuarioReal}</strong> ({rolReal})
                    </span>
                )}
            </div>

            {/* Selector de roles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {ROLES.map(r => {
                    const Icon = r.icon;
                    const isSelected = rolActivo === r.id;
                    return (
                        <button
                            key={r.id}
                            onClick={() => onCambiarRol(r.id)}
                            className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                                isSelected
                                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 border-zinc-900 dark:border-white shadow-sm ring-1 ring-zinc-900 dark:ring-white'
                                    : 'bg-zinc-50 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                            }`}
                        >
                            <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-semibold truncate">
                                    {r.nombre}
                                </span>
                                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white dark:text-zinc-950' : 'text-zinc-400'}`} />
                            </div>
                            <p className={`text-[10px] truncate ${
                                isSelected ? 'text-zinc-300 dark:text-zinc-700 font-medium' : 'text-zinc-500'
                            }`}>
                                {r.representante}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

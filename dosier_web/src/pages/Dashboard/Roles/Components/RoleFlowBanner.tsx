import React from 'react';

export type RolSimulado = 'DOCENTE' | 'COORD_CARRERA' | 'COORD_ACAD' | 'VICERRECTOR' | 'ADMIN';

interface Props {
    rolActivo: RolSimulado;
    onCambiarRol: (rol: RolSimulado) => void;
}

export const RoleFlowBanner: React.FC<Props> = ({
    rolActivo,
    onCambiarRol
}) => {
    const ROLES: Array<{
        id: RolSimulado;
        nombre: string;
    }> = [
        { id: 'DOCENTE', nombre: 'Docente' },
        { id: 'COORD_CARRERA', nombre: 'Coord. Carrera' },
        { id: 'COORD_ACAD', nombre: 'Coord. Académica' },
        { id: 'VICERRECTOR', nombre: 'Vicerrectorado' },
        { id: 'ADMIN', nombre: 'Administrador' }
    ];

    return (
        <div className="border-b border-slate-200 dark:border-zinc-800">
            <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Vista de Rol">
                {ROLES.map(r => {
                    const isSelected = rolActivo === r.id;
                    return (
                        <button
                            key={r.id}
                            type="button"
                            onClick={() => onCambiarRol(r.id)}
                            className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 whitespace-nowrap ${
                                isSelected
                                    ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:border-slate-300 dark:hover:border-zinc-700 font-medium'
                            }`}
                        >
                            {r.nombre}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

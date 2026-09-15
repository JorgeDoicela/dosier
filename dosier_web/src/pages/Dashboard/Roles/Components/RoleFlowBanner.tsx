import React from 'react';

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
        representante: string;
    }> = [
        {
            id: 'COORD_ACAD',
            nombre: 'Coord. Académica',
            representante: 'Msc. Cristian Cobos'
        },
        {
            id: 'COORD_CARRERA',
            nombre: 'Coord. Carrera',
            representante: 'Ing. Wilfrido Trujillo'
        },
        {
            id: 'DOCENTE',
            nombre: 'Docente de Cátedra',
            representante: 'Ing. Edison Pérez'
        },
        {
            id: 'VICERRECTOR',
            nombre: 'Vicerrectorado',
            representante: 'Msc. Freddy Baño'
        },
        {
            id: 'ADMIN',
            nombre: 'Administrador',
            representante: 'Gestión Global'
        }
    ];

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {ROLES.map(r => {
                    const isSelected = rolActivo === r.id;
                    return (
                        <button
                            key={r.id}
                            onClick={() => onCambiarRol(r.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                isSelected
                                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-xs font-semibold'
                                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                            }`}
                        >
                            {r.nombre}
                        </button>
                    );
                })}
            </div>

            {nombreUsuarioReal && (
                <div className="text-[11px] text-zinc-500 font-mono">
                    Sesión: <span className="text-zinc-900 dark:text-zinc-200 font-sans font-medium">{nombreUsuarioReal}</span> ({rolReal})
                </div>
            )}
        </div>
    );
};

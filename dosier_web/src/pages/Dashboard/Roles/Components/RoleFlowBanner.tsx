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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div className="segmented-container">
                {ROLES.map(r => {
                    const isSelected = rolActivo === r.id;
                    return (
                        <button
                            key={r.id}
                            onClick={() => onCambiarRol(r.id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                                isSelected
                                    ? 'segmented-item-active text-zinc-900 dark:text-zinc-100'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 border border-transparent'
                            }`}
                        >
                            {r.nombre}
                        </button>
                    );
                })}
            </div>

            {nombreUsuarioReal && (
                <div className="flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-zinc-400 dark:text-zinc-500">Sesión activa:</span>
                    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">{nombreUsuarioReal}</strong>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <span className="badge-subtle">
                        {rolReal}
                    </span>
                </div>
            )}
        </div>
    );
};

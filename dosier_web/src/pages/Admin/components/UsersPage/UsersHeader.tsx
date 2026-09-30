import React from 'react';
import { Search, X, GraduationCap, Building2 } from 'lucide-react';
import { PageHeader } from '../../../../components/Common/PageHeader';

interface UsersHeaderProps {
    userType: 'DOCENTE' | 'ADMINISTRATIVO';
    setUserType: (type: 'DOCENTE' | 'ADMINISTRATIVO') => void;
    soloConHoras: boolean;
    setSoloConHoras: (val: boolean) => void;
    filtroDocente?: 'CON_DOCENCIA' | 'CON_INVESTIGACION' | 'TODOS';
    setFiltroDocente?: (val: 'CON_DOCENCIA' | 'CON_INVESTIGACION' | 'TODOS') => void;
    departamento: string;
    setDepartamento: (val: string) => void;
    availableDepartments?: string[];
    search: string;
    setSearch: (search: string) => void;
    loading: boolean;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
    userType,
    setUserType,
    soloConHoras,
    setSoloConHoras,
    filtroDocente = soloConHoras ? 'CON_DOCENCIA' : 'TODOS',
    setFiltroDocente,
    departamento,
    setDepartamento,
    availableDepartments = [],
    search,
    setSearch,
    loading,
    searchInputRef
}) => {
    return (
        <div className="space-y-4">
            <PageHeader
                kicker="Administración Central"
                title="Gestión de Personal y Usuarios"
                description="Control de acceso, roles curriculares y claustro docente del ISTPET."
            />

            {/* Riel Plano Continuo Modern Enterprise Docs */}
            <div className="border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <nav className="-mb-px flex items-center gap-6 overflow-x-auto overflow-y-hidden no-scrollbar" aria-label="Tipo de usuario">
                    <button
                        type="button"
                        onClick={() => setUserType('DOCENTE')}
                        className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                            userType === 'DOCENTE'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <GraduationCap size={14} />
                        <span>Docentes</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('ADMINISTRATIVO')}
                        className={`pb-2.5 pt-1 px-0.5 text-xs transition-colors cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
                            userType === 'ADMINISTRATIVO'
                                ? 'border-[#0070f3] text-[#0070f3] dark:text-blue-400 dark:border-blue-400 font-semibold'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-medium'
                        }`}
                    >
                        <Building2 size={14} />
                        <span>Administrativos</span>
                    </button>
                </nav>

                {/* Buscador Integrado */}
                <div className="relative group w-full md:w-80 pb-2.5 md:pb-1">
                    {loading ? (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0070f3] animate-spin">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    ) : (
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 dark:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" size={14} />
                    )}
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={`Buscar en ${userType.toLowerCase()}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                e.currentTarget.blur();
                            }
                        }}
                        className="w-full pl-9 pr-14 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#0070f3] dark:focus:border-blue-400 shadow-2xs transition-colors"
                    />
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                        {search && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    searchInputRef.current?.focus();
                                }}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-0.5 rounded transition-colors cursor-pointer"
                                title="Limpiar búsqueda"
                            >
                                <X size={12} />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 dark:text-zinc-500 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded">
                            /
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Subfiltros Contextuales Sobrios */}
            {userType === 'DOCENTE' && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Asignación:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                if (setFiltroDocente) setFiltroDocente('CON_DOCENCIA');
                                else setSoloConHoras(true);
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer font-medium ${
                                filtroDocente === 'CON_DOCENCIA'
                                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Con carga docente
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (setFiltroDocente) setFiltroDocente('CON_INVESTIGACION');
                                else setSoloConHoras(false);
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer font-medium ${
                                filtroDocente === 'CON_INVESTIGACION'
                                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Con horas de investigación
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                if (setFiltroDocente) setFiltroDocente('TODOS');
                                else setSoloConHoras(false);
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer font-medium ${
                                filtroDocente === 'TODOS'
                                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-2xs'
                                    : 'text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                            }`}
                        >
                            Toda la planta docente
                        </button>
                    </div>
                </div>
            )}

            {userType === 'ADMINISTRATIVO' && (
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-mono uppercase tracking-wider">Departamento:</span>
                        <div className="relative min-w-[260px]">
                            <select
                                value={departamento}
                                onChange={(e) => setDepartamento(e.target.value)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-sans cursor-pointer w-full focus:outline-none focus:border-[#0070f3] dark:focus:border-blue-400 shadow-2xs transition-colors"
                            >
                                <option value="">
                                    Todos los departamentos ({availableDepartments.length > 0 ? `${availableDepartments.length} disponibles` : 'Cargando...'})
                                </option>
                                {availableDepartments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {departamento && (
                            <button
                                type="button"
                                onClick={() => setDepartamento('')}
                                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                title="Restablecer filtro"
                            >
                                <X size={12} /> Limpiar
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

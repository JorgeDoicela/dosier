import React, { useState, useMemo } from 'react';
import { useGobernanzaCarreras } from '../../../hooks/useGobernanzaCarreras';

/**
 * Convierte textos en mayúsculas crudas de SIGAFI a capitalización natural (Title Case),
 * respetando conectores gramaticales en minúscula (de, del, la, y, etc.).
 */
function formatTitleCase(str: string | undefined | null): string {
    if (!str) return '';
    const lowerExceptions = new Set(['de', 'del', 'la', 'las', 'el', 'los', 'y', 'en', 'para', 'por', 'con', 'a']);
    return str
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .map((word, index) => {
            if (!word) return '';
            if (index > 0 && lowerExceptions.has(word)) {
                return word;
            }
            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
}

export const OrganigramaVerticalView: React.FC = () => {
    const {
        data,
        loading,
        error,
        selectedCarreraId,
        setSelectedCarreraId,
        searchFilter,
        setSearchFilter,
        filtroEstado,
        setFiltroEstado,
        carrerasFiltradas,
        carreraSeleccionada,
        metricas,
        refetch
    } = useGobernanzaCarreras();

    // Filtro de búsqueda dentro de la lista de docentes de la carrera activa
    const [filtroDocente, setFiltroDocente] = useState('');

    const docentesFiltrados = useMemo(() => {
        if (!carreraSeleccionada?.docentes) return [];
        const query = filtroDocente.trim().toLowerCase();
        if (!query) return carreraSeleccionada.docentes;

        return carreraSeleccionada.docentes.filter(d =>
            d.nombre_completo.toLowerCase().includes(query) ||
            d.id_profesor.toLowerCase().includes(query) ||
            (d.roles && d.roles.some(r => r.toLowerCase().includes(query)))
        );
    }, [carreraSeleccionada, filtroDocente]);

    if (loading && !data) {
        return (
            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 text-center shadow-2xs space-y-2">
                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
                    Cargando estructura institucional de SIGAFI...
                </p>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 p-6 text-center space-y-3">
                <p className="text-xs text-red-700 dark:text-red-300">
                    {error}
                </p>
                <button
                    type="button"
                    onClick={refetch}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-2xs cursor-pointer"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!data) return null;

    const coordinador = carreraSeleccionada?.coordinador;
    const tieneCoordinador = Boolean(coordinador && coordinador.id_sigafi);

    return (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 space-y-7 shadow-2xs">
            {/* Cabecera Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-zinc-900 pb-5">
                <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                        Estructura de Autoridades y Carreras
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        Supervisión institucional, distribución de carreras y docentes asignados.
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800">
                        Período: <strong className="text-slate-900 dark:text-zinc-100 font-semibold">{data.periodo_activo || 'Activo'}</strong>
                    </span>
                    <span className="text-xs font-mono text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800">
                        Carreras: <strong className="text-slate-900 dark:text-zinc-100 font-semibold">{data.carreras.length}</strong>
                    </span>
                </div>
            </div>

            {/* Autoridades Principales: Panel Compacto Lado a Lado (Gobernanza Superior) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold">
                        Gobernanza Académica Institucional
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/40 overflow-hidden">
                    {/* Vicerrectorado Académico */}
                    <div className="p-4 md:p-5 space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                            Vicerrectorado Académico
                        </span>
                        {data.vicerrector ? (
                            <>
                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-zinc-100">
                                    {formatTitleCase(data.vicerrector.nombre_completo)}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                                    Cédula: {data.vicerrector.id_sigafi} {data.vicerrector.email && `• ${data.vicerrector.email}`}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 pt-1">
                                Autoridad no designada en el sistema
                            </p>
                        )}
                    </div>

                    {/* Coordinación Académica */}
                    <div className="p-4 md:p-5 space-y-1">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                            Coordinación Académica
                        </span>
                        {data.coordinador_academico ? (
                            <>
                                <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-zinc-100">
                                    {formatTitleCase(data.coordinador_academico.nombre_completo)}
                                </h3>
                                <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                                    Cédula: {data.coordinador_academico.id_sigafi} {data.coordinador_academico.email && `• ${data.coordinador_academico.email}`}
                                </p>
                            </>
                        ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 pt-1">
                                Autoridad no designada en el sistema
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Conector Central hacia Carreras */}
            <div className="relative py-1">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                    <span className="bg-white dark:bg-zinc-950 px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Carreras y Docentes
                    </span>
                </div>
            </div>

            {/* 2 Columnas Conectadas (Split Tree-Detail) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Columna Izquierda: Árbol de Carreras (5 columnas en LG, 4 en XL) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-3.5">
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                                Carreras ({data.carreras.length})
                            </span>
                            <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                                {metricas.conCoordinador} con coord. • {metricas.vacantes} sin coord.
                            </span>
                        </div>

                        {/* Buscador de Carreras */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Buscar carrera..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3] focus:ring-1 focus:ring-[#0070f3] transition-all"
                            />
                            {searchFilter && (
                                <button
                                    type="button"
                                    onClick={() => setSearchFilter('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                                    title="Limpiar"
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>

                        {/* Filtros Contextuales Planos */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setFiltroEstado('TODAS')}
                                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer border ${
                                    filtroEstado === 'TODAS'
                                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-slate-900 dark:border-zinc-100 font-semibold shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 font-medium'
                                }`}
                            >
                                Todas ({data.carreras.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFiltroEstado('CON_COORD')}
                                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer border flex items-center gap-1.5 ${
                                    filtroEstado === 'CON_COORD'
                                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-slate-900 dark:border-zinc-100 font-semibold shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 font-medium'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Con coordinador</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFiltroEstado('SIN_COORD')}
                                className={`px-2.5 py-1 text-xs rounded-md transition-colors cursor-pointer border flex items-center gap-1.5 ${
                                    filtroEstado === 'SIN_COORD'
                                        ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-slate-900 dark:border-zinc-100 font-semibold shadow-2xs'
                                        : 'bg-white dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 font-medium'
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                <span>Sin coordinador</span>
                            </button>
                        </div>
                    </div>

                    {/* Árbol Jerárquico de Carreras */}
                    <div className="relative pl-3 border-l-2 border-slate-200 dark:border-zinc-800 space-y-1.5">
                        {carrerasFiltradas.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-zinc-600 italic py-3 pl-2">
                                No se encontraron carreras con el criterio aplicado.
                            </p>
                        ) : (
                            carrerasFiltradas.map((c) => {
                                const isSelected = c.id_carrera === selectedCarreraId;
                                const tieneCoord = Boolean(c.coordinador && c.coordinador.id_sigafi);

                                return (
                                    <div
                                        key={c.id_carrera}
                                        className="relative before:absolute before:-left-3 before:top-1/2 before:-translate-y-1/2 before:w-3 before:h-0.5 before:bg-slate-200 dark:before:bg-zinc-800"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedCarreraId(c.id_carrera);
                                                setFiltroDocente('');
                                            }}
                                            className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                                                isSelected
                                                    ? 'bg-blue-50/70 dark:bg-blue-950/30 border-[#0070f3] dark:border-blue-500 shadow-2xs border-l-4 border-l-[#0070f3]'
                                                    : 'bg-white dark:bg-zinc-900/60 border-slate-200 dark:border-zinc-800/80 hover:border-slate-300 dark:hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="text-xs truncate">
                                                    <span className={isSelected ? 'font-bold text-slate-900 dark:text-zinc-100' : 'font-medium text-slate-800 dark:text-zinc-200'}>
                                                        {formatTitleCase(c.carrera)}
                                                    </span>
                                                </div>
                                                <div className="text-[11px] flex items-center gap-1.5">
                                                    {tieneCoord ? (
                                                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 truncate">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                            <span className="truncate">Coord: {formatTitleCase(c.coordinador?.nombre_completo)}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                            <span>Sin coordinador asignado</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 tabular-nums ${
                                                isSelected
                                                    ? 'bg-blue-100 dark:bg-blue-900/60 text-[#0070f3] dark:text-blue-300 font-semibold'
                                                    : 'text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800'
                                            }`}>
                                                {c.total_docentes} doc.
                                            </span>
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Columna Derecha: Detalle de Carrera y Docentes (7 columnas en LG, 8 en XL) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                    {carreraSeleccionada ? (
                        <>
                            {/* Ficha de la Carrera Seleccionada */}
                            <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40 p-5 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-semibold block">
                                            Carrera seleccionada
                                        </span>
                                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
                                            {formatTitleCase(carreraSeleccionada.carrera)}
                                        </h3>
                                    </div>

                                    {/* Métricas clave-valor sobrias */}
                                    <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 text-xs">
                                        <div className="px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                                            <strong className="text-slate-900 dark:text-zinc-100 font-bold tabular-nums">{carreraSeleccionada.total_docentes}</strong> docentes
                                        </div>
                                        <div className="px-3 py-1 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 font-mono">
                                            <strong className="text-slate-900 dark:text-zinc-100 font-bold tabular-nums">{carreraSeleccionada.total_materias}</strong> materias
                                        </div>
                                    </div>
                                </div>

                                {/* Coordinador de la Carrera */}
                                <div className="pt-2 border-t border-slate-200/70 dark:border-zinc-800/70">
                                    {tieneCoordinador ? (
                                        <div className="bg-white dark:bg-zinc-900 p-3.5 rounded-lg border border-slate-200 dark:border-zinc-800 space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
                                                    Coordinador Titular de Carrera
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                                                {formatTitleCase(coordinador!.nombre_completo)}
                                            </h4>
                                            <p className="text-xs font-mono text-slate-500 dark:text-zinc-400 truncate">
                                                Cédula: {coordinador!.id_sigafi} {coordinador!.email && `• ${coordinador!.email}`}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="bg-amber-50/70 dark:bg-amber-950/20 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs space-y-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                <strong className="font-semibold">Coordinación sin asignar en SIGAFI</strong>
                                            </div>
                                            <p className="text-amber-700 dark:text-amber-400 pl-3">
                                                Esta carrera aún no tiene coordinador formalmente designado para este período.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Docentes Asignados */}
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
                                            Docentes Asignados ({carreraSeleccionada.docentes.length})
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-zinc-400">
                                            Personal académico con materias registradas en la malla activa.
                                        </p>
                                    </div>

                                    {/* Buscador de docentes */}
                                    {carreraSeleccionada.docentes.length > 5 && (
                                        <div className="relative w-full sm:w-56">
                                            <input
                                                type="text"
                                                placeholder="Buscar docente o cédula..."
                                                value={filtroDocente}
                                                onChange={(e) => setFiltroDocente(e.target.value)}
                                                className="w-full px-3 py-1 text-xs rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3] transition-all"
                                            />
                                            {filtroDocente && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFiltroDocente('')}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
                                                >
                                                    Limpiar
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {carreraSeleccionada.docentes.length === 0 ? (
                                    <div className="p-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-zinc-800">
                                        <p className="text-xs font-mono text-slate-400 dark:text-zinc-600">
                                            No hay docentes registrados en la malla de esta carrera para el período activo.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-slate-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-950">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                                        <th className="py-2.5 px-3 font-semibold">Docente</th>
                                                        <th className="py-2.5 px-3 font-semibold w-28">Cédula</th>
                                                        <th className="py-2.5 px-3 font-semibold w-24 text-right">Horas</th>
                                                        <th className="py-2.5 px-3 font-semibold w-24 text-right">Materias</th>
                                                        <th className="py-2.5 px-3 font-semibold w-28">Rol</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/70 text-xs">
                                                    {docentesFiltrados.map((d) => (
                                                        <tr
                                                            key={d.id_profesor}
                                                            className="hover:bg-slate-50/80 dark:hover:bg-zinc-900/50 transition-colors"
                                                        >
                                                            {/* Nombre */}
                                                            <td className="py-2.5 px-3">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-medium text-slate-900 dark:text-zinc-100">
                                                                        {formatTitleCase(d.nombre_completo)}
                                                                    </span>
                                                                    {d.es_coordinador && (
                                                                        <span className="text-[10px] font-mono text-[#0070f3] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1.5 py-0.2 rounded font-semibold shrink-0">
                                                                            Coordinador
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {d.email && (
                                                                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 block truncate">
                                                                        {d.email}
                                                                    </span>
                                                                )}
                                                            </td>

                                                            {/* Cédula */}
                                                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-zinc-400">
                                                                {d.id_profesor}
                                                            </td>

                                                            {/* Horas */}
                                                            <td className="py-2.5 px-3 font-mono text-right">
                                                                <span className="font-semibold text-slate-800 dark:text-zinc-200 tabular-nums">
                                                                    {d.horas_docente}h
                                                                </span>
                                                                <span className="text-slate-400 dark:text-zinc-500 text-[10px] ml-0.5">
                                                                    /sem
                                                                </span>
                                                            </td>

                                                            {/* Materias */}
                                                            <td className="py-2.5 px-3 font-mono text-right text-slate-600 dark:text-zinc-400">
                                                                <span className="font-medium text-slate-800 dark:text-zinc-200 tabular-nums">
                                                                    {d.materias_asignadas}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 ml-1">
                                                                    mat.
                                                                </span>
                                                            </td>

                                                            {/* Rol */}
                                                            <td className="py-2.5 px-3">
                                                                <span className="inline-block text-[11px] font-mono text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                                                                    {d.roles && d.roles.length > 0 ? d.roles[0] : 'Docente'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                            <p className="text-xs text-slate-400 dark:text-zinc-600">
                                Selecciona una carrera de la lista para ver su información y docentes.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { SolicitudRegistroHistorial, SolicitudEstado } from '../types';

interface SolicitudesHistoryTableProps {
    historial: SolicitudRegistroHistorial[];
}

export const SolicitudesHistoryTable: React.FC<SolicitudesHistoryTableProps> = ({ historial }) => {
    const [busqueda, setBusqueda] = useState('');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('todos');

    const registrosFiltrados = historial.filter(item => {
        const matchesBusqueda = 
            item.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.solicitante.toLowerCase().includes(busqueda.toLowerCase()) ||
            (item.carrera && item.carrera.toLowerCase().includes(busqueda.toLowerCase()));

        const matchesEstado = estadoFiltro === 'todos' || item.estado === estadoFiltro;

        return matchesBusqueda && matchesEstado;
    });

    const renderEstado = (estado: SolicitudEstado) => {
        switch (estado) {
            case 'aprobado':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Aprobado</span>
                    </span>
                );
            case 'resuelto':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0070f3] dark:text-blue-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                        <span>Resuelto</span>
                    </span>
                );
            case 'en_revision':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>En revisión</span>
                    </span>
                );
            case 'rechazado':
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <span>Desestimado</span>
                    </span>
                );
            case 'pendiente':
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        <span>Pendiente</span>
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* Barra de Búsqueda y Filtro de Estado */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-zinc-500" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        placeholder="Buscar por código, trámite o solicitante..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#0070f3]/15 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                        Estado:
                    </span>
                    <select
                        value={estadoFiltro}
                        onChange={e => setEstadoFiltro(e.target.value)}
                        className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-[#0070f3]"
                    >
                        <option value="todos">Todos los estados</option>
                        <option value="aprobado">Aprobados</option>
                        <option value="resuelto">Resueltos</option>
                        <option value="en_revision">En revisión</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="rechazado">Desestimados</option>
                    </select>
                </div>
            </div>

            {/* Tabla con Estándar Oficial Modern Enterprise Docs */}
            <div className="overflow-x-auto border border-slate-200/90 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-slate-200/90 dark:border-zinc-800 text-[11px] font-mono text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                            <th className="py-3 px-4 font-mono">Código</th>
                            <th className="py-3 px-4">Trámite Curricular</th>
                            <th className="py-3 px-4">Solicitante</th>
                            <th className="py-3 px-4">Carrera</th>
                            <th className="py-3 px-4 font-mono">Fecha</th>
                            <th className="py-3 px-4 text-right">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 text-xs">
                        {registrosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                                    No se encontraron solicitudes registradas con los criterios seleccionados.
                                </td>
                            </tr>
                        ) : (
                            registrosFiltrados.map(item => (
                                <tr 
                                    key={item.id}
                                    className="hover:bg-slate-50/60 dark:hover:bg-zinc-900/60 transition-colors"
                                >
                                    <td className="py-3 px-4 font-mono font-medium text-slate-900 dark:text-white">
                                        {item.codigo}
                                    </td>
                                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-zinc-200">
                                        <div>{item.titulo}</div>
                                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-normal">
                                            {item.detalle}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                                        <div>{item.solicitante}</div>
                                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                                            {item.rolSolicitante}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-slate-600 dark:text-zinc-300">
                                        {item.carrera || 'Institucional'}
                                    </td>
                                    <td className="py-3 px-4 font-mono text-slate-400 dark:text-zinc-500 text-[11px]">
                                        {item.fecha}
                                    </td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        {renderEstado(item.estado)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

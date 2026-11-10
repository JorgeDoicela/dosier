import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/Common/PageHeader';
import {
    Shield,
    ShieldCheck,
    Search,
    Calendar,
    Filter,
    ChevronLeft,
    ChevronRight,
    Activity,
    MapPin,
    Monitor,
    Download
} from 'lucide-react';
import { useAuditLogs } from './Audit/useAuditLogs';
import { AuditDetailDrawer } from './Audit/AuditDetailDrawer';
import { formatDateSafe, formatActionLabel, getActionBadge, getActionDotClass } from './Audit/auditTypes';
import { GeistSelect } from '../../components/Common/GeistSelect';

const AuditPage: React.FC = () => {
    const {
        logs,
        loading,
        page,
        setPage,
        totalPages,
        totalCount,
        search,
        setSearch,
        modulo,
        setModulo,
        action,
        setAction,
        fromDate,
        setFromDate,
        toDate,
        setToDate,
        selectedLog,
        setSelectedLog,
        isDrawerOpen,
        setIsDrawerOpen,
        snapshotView,
        setSnapshotView,
        fetchLogs,
        handleExport,
    } = useAuditLogs();

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (page === 1) {
            fetchLogs();
        } else {
            setPage(1);
        }
    };

    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto">
                <PageHeader
                    kicker="Seguridad Institucional"
                    icon={Shield}
                    title="Registro de auditoría"
                    description="Registro completo de acciones administrativas y académicas para el cumplimiento de normativas SENESCYT/CACES."
                >
                    <div className="flex items-center gap-3">
                        <Link
                            to="/lopdp"
                            className="btn-vercel-secondary flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <ShieldCheck size={14} className="text-brand" />
                            Panel LOPDP
                        </Link>
                        <button
                            onClick={handleExport}
                            disabled={logs.length === 0}
                            className="btn-vercel-secondary flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <Download size={14} />
                            Exportar Reporte
                        </button>
                    </div>
                </PageHeader>

                <div className="bg-surface p-6 rounded-lg border border-slate-200/90 dark:border-zinc-800 mb-8 animate-fade-up [animation-delay:100ms]">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-text-main transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar por usuario o acción..."
                                className="input-vercel !pl-10 !py-2.5 !text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="w-56">
                            <GeistSelect
                                value={modulo}
                                onChange={(val) => setModulo(String(val))}
                                options={[
                                    { value: '', label: 'Todos los Módulos' },
                                    { value: 'SEGURIDAD', label: 'Seguridad' },
                                    { value: 'USUARIOS', label: 'Usuarios' },
                                    { value: 'PROYECTOS', label: 'Proyectos y Documentos' },
                                    { value: 'INVESTIGACION', label: 'Comités y Grupos Documentales' },
                                    { value: 'CONVOCATORIAS', label: 'Convocatorias' }
                                ]}
                                placeholder="Módulo..."
                            />
                        </div>

                        <div className="w-64">
                            <GeistSelect
                                value={action}
                                onChange={(val) => setAction(String(val))}
                                options={[
                                    { value: '', label: 'Todas las Acciones' },
                                    { value: 'ASIGNAR_ROL', label: 'Asignar Rol' },
                                    { value: 'REVOCAR_ROL', label: 'Revocar Rol' },
                                    { value: 'ACTUALIZAR_METADATA', label: 'Actualizar datos del documento' },
                                    { value: 'LOGIN', label: 'Inicio de Sesión' },
                                    { value: 'CREAR_GRUPO', label: 'Crear Grupo' },
                                    { value: 'EDITAR_GRUPO', label: 'Editar Grupo' },
                                    { value: 'APROBAR_GRUPO', label: 'Aprobar Grupo' },
                                    { value: 'RECHAZAR_GRUPO', label: 'Rechazar Grupo' },
                                    { value: 'DESACTIVAR_GRUPO', label: 'Desactivar Grupo' },
                                    { value: 'AGREGAR_MIEMBRO_GRUPO', label: 'Agregar Miembro' },
                                    { value: 'REMOVER_MIEMBRO_GRUPO', label: 'Remover Miembro' },
                                    { value: 'CREAR_PROYECTO', label: 'Crear Proyecto' },
                                    { value: 'ACTUALIZAR_PROYECTO', label: 'Actualizar Proyecto' },
                                    { value: 'ELIMINAR_PROYECTO', label: 'Eliminar Proyecto' },
                                    { value: 'TRANSICIONAR_PROYECTO', label: 'Transicionar Proyecto' },
                                    { value: 'ASIGNAR_REVISOR', label: 'Asignar Revisor' },
                                    { value: 'EVALUAR_PROYECTO', label: 'Evaluar Proyecto' },
                                    { value: 'ACTUALIZAR_EQUIPO_PROYECTO', label: 'Actualizar Equipo' },
                                    { value: 'TRANSFERIR_DIRECCION', label: 'Transferir Dirección' },
                                    { value: 'CREAR_CONVOCATORIA', label: 'Crear Convocatoria' },
                                    { value: 'EDITAR_CONVOCATORIA', label: 'Editar Convocatoria' },
                                    { value: 'CAMBIAR_ESTADO_CONVOCATORIA', label: 'Cambiar Estado Convocatoria' },
                                    { value: 'ELIMINAR_CONVOCATORIA', label: 'Eliminar Convocatoria' }
                                ]}
                                placeholder="Acción..."
                            />
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-text-main transition-colors" />
                            <input
                                type="date"
                                className="input-vercel !pl-10 !py-2.5 !text-sm text-text-dim focus:text-text-main"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                            />
                        </div>

                        <div className="relative group">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-text-main transition-colors" />
                            <input
                                type="date"
                                className="input-vercel !pl-10 !py-2.5 !text-sm text-text-dim focus:text-text-main"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="h-10 px-4 rounded-md font-medium text-xs text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Filter size={14} />
                            Aplicar Filtros
                        </button>
                    </form>
                </div>

                <div className="bg-surface rounded-lg border border-slate-200/90 dark:border-zinc-800 overflow-hidden mb-8 animate-fade-up [animation-delay:200ms]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/90 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs font-mono text-text-dim tracking-wider uppercase">
                                    <th className="py-3 px-6">Fecha / Hora</th>
                                    <th className="py-3 px-6">Usuario / Rol</th>
                                    <th className="py-3 px-6">Acción</th>
                                    <th className="py-3 px-6">Módulo / Objeto</th>
                                    <th className="py-3 px-6">Origen / Red</th>
                                    <th className="py-3 px-6 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/90 dark:border-zinc-800 text-xs">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-text-dim font-mono">
                                            Cargando registros de auditoría...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-text-dim font-mono">
                                            No se encontraron eventos registrados con los criterios seleccionados.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const actionDot = getActionDotClass(log.action);
                                        return (
                                            <tr
                                                key={log.id_audit}
                                                className="hover:bg-slate-50 dark:hover:bg-zinc-850/50 transition-colors group cursor-pointer"
                                                onClick={() => {
                                                    setSelectedLog(log);
                                                    setIsDrawerOpen(true);
                                                }}
                                            >
                                                <td className="py-4 px-6 font-mono text-text-dim whitespace-nowrap">
                                                    {formatDateSafe(log.date, "dd/MM/yyyy HH:mm:ss")}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-semibold text-text-main group-hover:text-[#0070f3] transition-colors">
                                                        {log.admin_name || 'Sistema / Automático'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1.5 text-xs font-mono font-medium ${actionDot.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${actionDot.dot}`} />
                                                        {formatActionLabel(log.action)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-medium text-text-main">{log.modulo || 'GENERAL'}</div>
                                                    <div className="text-xs text-text-dim font-mono truncate max-w-xs">{log.target_name || 'Global'}</div>
                                                </td>
                                                <td className="py-4 px-6 font-mono text-xs text-text-dim">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-text-dim/60" />
                                                        <span>{log.ip_address || '127.0.0.1'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-text-dim/60 truncate max-w-[150px]">
                                                        <Monitor size={10} />
                                                        <span className="truncate">{log.user_agent || 'Navegador Web'}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right font-mono">
                                                    <span className="text-[#0070f3] hover:underline font-medium text-xs">
                                                        Ver Detalle &rarr;
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    <div className="p-4 border-t border-border-thin bg-bg-deep/30 flex items-center justify-between text-xs font-mono text-text-dim">
                        <div>
                            Mostrando página <span className="text-text-main font-bold">{page}</span> de <span className="text-text-main font-bold">{totalPages || 1}</span> ({totalCount} registros totales)
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="btn-vercel-secondary !py-1.5 !px-3 disabled:opacity-40 cursor-pointer"
                            >
                                <ChevronLeft size={14} /> Anterior
                            </button>
                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((p) => p + 1)}
                                className="btn-vercel-secondary !py-1.5 !px-3 disabled:opacity-40 cursor-pointer"
                            >
                                Siguiente <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <AuditDetailDrawer
                log={selectedLog}
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                snapshotView={snapshotView}
                setSnapshotView={setSnapshotView}
            />
        </main>
    );
};

export default AuditPage;

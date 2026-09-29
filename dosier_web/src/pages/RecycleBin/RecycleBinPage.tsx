import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, FileText, RefreshCw, Trash } from 'lucide-react';
import { PageHeader } from '../../components/Common/PageHeader';
import { recycleBinService, type DeletedProjectDto } from '../../services/recycleBinService';
import { useAuth } from '../../api/AuthContext';
import { useConfirm } from '../../api/ConfirmContext';
import { useNotifications } from '../../api/NotificationsContext';

type DeletedItem = DeletedProjectDto;

const RecycleBinPage: React.FC = () => {
    const { isAdmin } = useAuth();
    const confirm = useConfirm();
    const { addToast } = useNotifications();
    const [items, setItems] = useState<DeletedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'projects'>('projects');

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await recycleBinService.getDeletedProjects();
            setItems(data);
        } catch (error) {
            console.error('Error fetching deleted projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [isAdmin]);

    const handleRestore = async (uuid: string, title: string) => {
        if (!await confirm({
            title: "Restaurar Proyecto",
            message: `¿Está seguro de restaurar el proyecto "${title}"?`,
            confirmText: "Restaurar",
            cancelText: "Cancelar",
            variant: "warning"
        })) return;

        try {
            setActionLoading(uuid);
            await recycleBinService.restoreProject(uuid);
            setItems(items.filter(item => item.uuid !== uuid));
            addToast('Restauración Exitosa', `El proyecto "${title}" ha sido restaurado con éxito.`, 'success');
        } catch (error: any) {
            console.error('Error restoring item:', error);
            addToast('Error al Restaurar', error.response?.data?.message || 'No se pudo restaurar el elemento en este momento.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handlePurge = async (uuid: string, title: string) => {
        const warningMessage = `¿Está seguro de ELIMINAR PERMANENTEMENTE el proyecto "${title}"? Esta acción es irreversible e incluye los componentes y todos los datos asociados.`;

        if (!await confirm({
            title: "Eliminación Permanente",
            message: warningMessage,
            confirmText: "Eliminar Definitivamente",
            cancelText: "Cancelar",
            variant: "destructive"
        })) return;

        try {
            setActionLoading(uuid);
            await recycleBinService.purgeProject(uuid);
            setItems(items.filter(item => item.uuid !== uuid));
            addToast('Eliminado Definitivamente', `El proyecto "${title}" ha sido purgado permanentemente del sistema.`, 'success');
        } catch (error: any) {
            console.error('Error purging item:', error);
            addToast('Error al Eliminar', error.response?.data?.message || 'No se pudo eliminar el elemento de forma permanente.', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const tabs = [
        { id: 'projects', name: 'Proyectos y Documentos', icon: FileText, adminOnly: false }
    ];

    return (
        <main className="flex-1 bg-[#f8fafc] dark:bg-[#0b0d11] p-6 md:p-8 overflow-y-auto space-y-6">
            <PageHeader
                kicker="Mantenimiento del Sistema"
                icon={Trash2}
                title="Papelera de Reciclaje"
                description="Restaura elementos eliminados temporalmente o elimínalos de forma permanente de la base de datos."
            />

            {/* Tabs */}
            <div className="flex border-b border-slate-200/90 dark:border-zinc-800">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium text-xs transition-colors cursor-pointer ${
                                isActive
                                    ? 'border-[#0070f3] text-[#0070f3]'
                                    : 'border-transparent text-text-dim hover:text-text-main'
                            }`}
                        >
                            <Icon size={14} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Content list */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw size={24} className="animate-spin text-[#0070f3]" />
                    <span className="text-xs text-text-dim font-medium">Cargando elementos...</span>
                </div>
            ) : items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-slate-200/90 dark:border-zinc-800 rounded-lg bg-surface">
                    <Trash size={28} className="text-text-dim/40 mb-2" />
                    <h3 className="text-sm font-semibold text-text-main">La papelera está vacía</h3>
                    <p className="text-xs text-text-dim mt-1 text-center max-w-sm">
                        No hay proyectos eliminados en este momento.
                    </p>
                </div>
            ) : (
                <div className="border border-slate-200/90 dark:border-zinc-800 rounded-lg overflow-hidden bg-surface">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/90 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs font-mono text-text-dim tracking-wider uppercase">
                                    <th className="px-6 py-3">Título / Nombre</th>
                                    <th className="px-6 py-3">Código / Estado</th>
                                    <th className="px-6 py-3">Fecha de Eliminación</th>
                                    <th className="px-6 py-3">Eliminado Por</th>
                                    <th className="px-6 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/90 dark:divide-zinc-800 text-xs text-text-main">
                                {items.map((item) => {
                                    const title = item.titulo || item.nombre || 'Sin título';
                                    const code = item.codigoInstitucional || item.siglas || '-';
                                    const isPendingAction = actionLoading === item.uuid;

                                    return (
                                        <tr key={item.uuid} className="hover:bg-black/1 dark:hover:bg-white/1 transition-colors">
                                            <td className="px-6 py-4 font-medium max-w-md">
                                                <div className="truncate" title={title}>{title}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-mono text-xs text-text-dim">{code}</span>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 w-fit font-medium">
                                                        {item.estado}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-dim text-xs">
                                                {formatDate(item.fechaEliminacion)}
                                            </td>
                                            <td className="px-6 py-4 text-text-dim text-xs">
                                                {item.eliminadoPor}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleRestore(item.uuid, title)}
                                                        disabled={isPendingAction}
                                                        className="p-2 text-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Restaurar"
                                                    >
                                                        <RotateCcw size={16} className={isPendingAction ? 'animate-spin' : ''} />
                                                    </button>
                                                    <button
                                                        onClick={() => handlePurge(item.uuid, title)}
                                                        disabled={isPendingAction}
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                                        title="Eliminar permanentemente"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
};

export default RecycleBinPage;

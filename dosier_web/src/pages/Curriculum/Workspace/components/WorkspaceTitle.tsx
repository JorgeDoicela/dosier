import React, { useState } from 'react';
import { FileSignature, Sparkles, Layers, Download } from 'lucide-react';
import { useWorkflowStates } from '../../../../hooks/useWorkflowStates';
import { salaCarreraService } from '../../../../services/salaCarreraService';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useConfirm } from '../../../../api/ConfirmContext';

interface WorkspaceTitleProps {
    currentProject: {
        title: string;
        status: string;
        uuid: string;
        id: string;
        isPea?: boolean;
        peaData?: any;
    };
    user: any;
    templateCode: string;
    setActiveDocument: (doc: string) => void;
}

export const WorkspaceTitle: React.FC<WorkspaceTitleProps> = ({
    currentProject,
    templateCode,
    setActiveDocument
}) => {
    const { getEstadoConfig } = useWorkflowStates();
    const { addToast } = useNotifications();
    const confirm = useConfirm();
    const [isImporting, setIsImporting] = useState(false);

    const cfg = getEstadoConfig(currentProject.status);

    const idExpediente = currentProject.peaData?.id_expediente ?? currentProject.peaData?.idExpediente;
    const idPea = currentProject.peaData?.id_pea ?? currentProject.peaData?.idPea;

    const handleImportarAcuerdosSala = async () => {
        if (!idExpediente) {
            addToast({
                type: 'warning',
                title: 'Expediente no vinculado',
                message: 'Este PEA no tiene expediente curricular asociado para consultar la sala.'
            });
            return;
        }

        const confirmado = await confirm({
            title: 'Importar Acuerdos de Sala Curricular',
            message: '¿Deseas volcar los contenidos, unidades, metodología y resultados de aprendizaje acordados con la Coordinación de Carrera en la Sala Colegiada? Esto sobreescribirá los campos de borrador actuales.',
            confirmText: 'Sí, importar al PEA',
            cancelText: 'Cancelar',
            type: 'info'
        });

        if (!confirmado) return;

        setIsImporting(true);
        try {
            const resp = await salaCarreraService.aplicarAlPea(idExpediente, idPea);
            addToast({
                type: 'success',
                title: 'Acuerdos Importados con Éxito',
                message: resp.message || 'Se ha actualizado el borrador del PEA con los acuerdos de la Sala Curricular.'
            });
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } catch (err: any) {
            addToast({
                type: 'error',
                title: 'Error al Importar',
                message: err.message || 'No se pudo importar el borrador de la sala curricular.'
            });
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <>
            {/* ── Page Title ── */}
            <header className="mb-6 md:mb-8 animate-fade-in">
                <div className="space-y-3 max-w-4xl">
                    <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight leading-snug break-words">
                        {currentProject.title?.trim() || '(Sin título)'}
                    </h1>

                    {/* Metadatos y Badges en una sola línea ordenada */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        {((currentProject as any).codigo_institucional || (currentProject as any).codigo) && (
                            <span className="text-[11px] font-mono text-text-dim font-medium">
                                {(currentProject as any).codigo_institucional || (currentProject as any).codigo}
                            </span>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] font-medium" style={cfg.style}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} style={cfg.dotStyle} />
                            <span>{cfg.label}</span>
                        </div>
                        {(currentProject as any).linea && (
                            <span className="text-[11px] text-text-dim truncate max-w-[280px]" title={(currentProject as any).linea}>
                                {(currentProject as any).linea}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            {/* Banner de Sincronización Previa con la Sala Curricular de Carrera */}
            {currentProject.isPea && currentProject.status === 'Borrador' && idExpediente && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <Sparkles size={18} className="text-[#0070f3] dark:text-blue-400 shrink-0 mt-0.5 stroke-[1.75]" />
                        <div>
                            <h4 className="text-xs font-semibold text-slate-900 dark:text-white">
                                Acuerdos de Armonización Curricular Disponibles
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-0.5 leading-relaxed">
                                Puedes cargar con un solo clic los acuerdos colegiados de objetivos, unidades y metodología consensuados en la Sala Curricular de Carrera previa a la redacción oficial.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleImportarAcuerdosSala}
                        disabled={isImporting}
                        className="px-3.5 py-2 rounded-lg bg-[#0070f3] hover:bg-[#005bb5] text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-40"
                    >
                        <Download size={13} />
                        <span>{isImporting ? 'Sincronizando...' : 'Cargar desde Sala Curricular'}</span>
                    </button>
                </div>
            )}

            {templateCode && templateCode !== 'PEA_OFICIAL' && (
                <div className="mb-8 p-6 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
                    <div className="flex items-start gap-4">
                        <FileSignature size={22} className="text-[#0070f3] dark:text-blue-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-xs font-semibold text-text-main uppercase tracking-widest">
                                Documento en Edición
                            </h3>
                            <p className="text-xs text-text-dim mt-1.5 leading-relaxed">
                                Estás en el espacio de trabajo de este instrumento curricular. Puedes continuar completando los campos colaborativos del documento o revisar el estado institucional abajo.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setActiveDocument(templateCode)}
                        className="px-5 py-2.5 rounded-lg bg-[#0070f3] hover:bg-[#0060df] text-white text-xs font-semibold tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full md:w-auto shrink-0"
                    >
                        <FileSignature size={14} />
                        <span>Continuar Editando</span>
                    </button>
                </div>
            )}
        </>
    );
};

export default WorkspaceTitle;

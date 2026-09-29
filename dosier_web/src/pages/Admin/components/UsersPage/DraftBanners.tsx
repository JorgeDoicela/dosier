import React from 'react';
import { FileText } from 'lucide-react';
import type { PendingUserDraft } from '../../hooks/useUsersPage';

interface DraftBannersProps {
    pendingUserDraft: PendingUserDraft | null;
    handleRestoreUserDraft: () => void;
    handleDiscardUserDraft: () => void;
}

export const DraftBanners: React.FC<DraftBannersProps> = ({
    pendingUserDraft,
    handleRestoreUserDraft,
    handleDiscardUserDraft
}) => {
    if (!pendingUserDraft) return null;

    return (
        <div className="bg-surface p-4 rounded-lg border border-slate-200/90 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-up mb-8">
            <div className="flex items-center gap-3.5">
                <FileText size={20} className="text-[#0070f3] shrink-0" />
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-text-main">Perfil en borrador</h4>
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            No guardado
                        </span>
                    </div>
                    <p className="text-xs text-text-dim">
                        Tienes cambios sin guardar en el perfil de <span className="text-text-main font-medium">"{pendingUserDraft.userName}"</span>.
                    </p>
                    <p className="text-[10px] text-text-dim/60 font-mono">
                        Guardado automáticamente el {new Date(pendingUserDraft.timestamp).toLocaleDateString()} a las {new Date(pendingUserDraft.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 w-full md:w-auto shrink-0">
                <button
                    onClick={handleRestoreUserDraft}
                    className="h-8 px-3.5 text-xs rounded-md font-medium text-white bg-[#0070f3] hover:bg-[#005bb5] transition-colors cursor-pointer"
                >
                    Restaurar perfil
                </button>
                <button
                    onClick={handleDiscardUserDraft}
                    className="h-8 px-3.5 text-xs rounded-md font-medium text-text-main bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                >
                    Descartar
                </button>
            </div>
        </div>
    );
};


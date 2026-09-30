import React, { useContext } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { SectionGuardContext, SectionLockContext } from '../../core/documents/context/DocumentDataContext';
import { useAuth } from '../../api/AuthContext';

interface SectionBlockGuardProps {
    id: string;
    title: string;
    children: React.ReactNode;
    showInlineLock?: boolean;
}

export const SectionBlockGuard: React.FC<SectionBlockGuardProps> = ({
    id,
    title,
    children,
    showInlineLock = false
}) => {
    const { isAdmin } = useAuth();
    const lockContext = useContext(SectionLockContext);
    
    // Safety fallback if context is not loaded
    if (!lockContext) {
        return <>{children}</>;
    }

    const { formData, readOnly, isDirectorOrAdmin, onUpdateField } = lockContext;

    const isBlocked = formData?.BlockedSections?.[id] === true;
    const isReadOnlyForUser = readOnly || (isBlocked && !isDirectorOrAdmin);

    const handleToggleLock = () => {
        if (onUpdateField) {
            const currentBlocked = formData?.BlockedSections || {};
            const nextBlocked = {
                ...currentBlocked,
                [id]: !isBlocked
            };
            onUpdateField('BlockedSections', nextBlocked);
        }
    };

    const shouldShowLock = React.useMemo(() => {
        if (isBlocked) return true;
        if (isAdmin) return true;
        if (isDirectorOrAdmin) {
            const hasMultipleResearchers = Array.isArray(formData?.Investigadores) && formData.Investigadores.length > 1;
            return hasMultipleResearchers;
        }
        return false;
    }, [isBlocked, isAdmin, isDirectorOrAdmin, formData?.Investigadores]);

    return (
        <SectionGuardContext.Provider value={{ 
            readOnly: isReadOnlyForUser,
            id,
            title,
            isBlocked,
            handleToggleLock
        }}>
            {showInlineLock && !readOnly && shouldShowLock && (
                <div className="flex justify-end mb-2 select-none">
                    <div className="flex items-center gap-2 bg-surface/50 border border-border-thin px-3 py-1 rounded-full animate-fade-in text-[9px] font-bold uppercase tracking-wider">
                        {isBlocked ? (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <Lock size={11} className="text-amber-500 animate-pulse" />
                                    <span className="text-amber-500">Bloqueado</span>
                                </div>
                                {isDirectorOrAdmin && (
                                    <button
                                        onClick={handleToggleLock}
                                        className="ml-1.5 px-2 py-0.5 bg-[#0070f3] hover:bg-[#005bb5] text-white transition-all rounded-md font-medium text-xs cursor-pointer shadow-2xs"
                                    >
                                        Desbloquear
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <Unlock size={12} className="text-text-dim" />
                                    <span className="text-text-dim">Abierto</span>
                                </div>
                                {isDirectorOrAdmin && (
                                    <button
                                        onClick={handleToggleLock}
                                        className="ml-1.5 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition-all rounded-md font-medium text-xs cursor-pointer"
                                    >
                                        Bloquear
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
            {children}
        </SectionGuardContext.Provider>
    );
};

export default SectionBlockGuard;

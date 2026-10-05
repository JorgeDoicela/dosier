import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmOptions {
    title?: string;
    message: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'destructive' | 'warning';
    position?: 'center' | 'right';
    icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({ message: '' });
    const resolveRef = useRef<(value: boolean) => void>(() => {});

    const confirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts);
        setIsOpen(true);
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
        });
    }, []);

    const handleCancel = useCallback(() => {
        setIsOpen(false);
        resolveRef.current(false);
    }, []);

    const handleConfirm = useCallback(() => {
        setIsOpen(false);
        resolveRef.current(true);
    }, []);

    // Esc listener to close modal on Escape key press
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleCancel]);

    // Determine confirm button class based on variant
    const getConfirmBtnClass = () => {
        const base = 'btn-vercel-primary transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-widest';
        if (options.variant === 'destructive') {
            return `${base} !bg-red-600 hover:!bg-red-700 !border-red-600 !text-white`;
        }
        if (options.variant === 'warning') {
            return `${base} !bg-amber-500 hover:!bg-amber-600 !border-amber-500 !text-white`;
        }
        return base;
    };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            handleCancel();
                        }
                    }}
                >
                    <div className="absolute inset-0 bg-black/60 animate-fade-in" />

                    <div className="modal-card max-w-md w-full animate-scale-up relative z-10 bg-surface border border-border-thin rounded-xl shadow-2xl overflow-hidden">
                        <div className="modal-header border-b border-border-thin flex justify-between items-center py-4 px-6 bg-surface">
                            <div className="flex items-center gap-2.5">
                                {options.icon ? (
                                    <options.icon 
                                        size={18} 
                                        className={
                                            options.variant === 'destructive' 
                                                ? 'text-red-500 shrink-0' 
                                                : options.variant === 'warning' 
                                                ? 'text-amber-500 shrink-0' 
                                                : 'text-[#0070f3] shrink-0'
                                        } 
                                    />
                                ) : (
                                    <>
                                        {options.variant === 'destructive' && (
                                            <AlertTriangle size={18} className="text-red-500 shrink-0" />
                                        )}
                                        {options.variant === 'warning' && (
                                            <AlertTriangle size={18} className="text-amber-500 shrink-0" />
                                        )}
                                    </>
                                )}
                                <h3 className="font-bold text-text-main text-xs uppercase tracking-widest">
                                    {options.title || 'Confirmación'}
                                </h3>
                            </div>
                            <button 
                                onClick={handleCancel} 
                                className="text-text-dim hover:text-text-main p-1.5 transition-colors rounded-lg hover:bg-surface-hover cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="modal-body p-6">
                            {typeof options.message === 'string' ? (
                                <p className="text-xs text-text-dim leading-relaxed font-medium whitespace-pre-wrap">
                                    {options.message}
                                </p>
                            ) : (
                                options.message
                            )}
                        </div>
                        <div className="modal-footer border-t border-border-thin py-4 px-6 flex justify-end gap-2.5 bg-surface">
                            <button 
                                onClick={handleCancel} 
                                className="btn-vercel-secondary transition-all active:scale-[0.98] font-bold text-xs uppercase tracking-widest cursor-pointer"
                            >
                                {options.cancelText || 'Cancelar'}
                            </button>
                            <button 
                                onClick={handleConfirm} 
                                className={getConfirmBtnClass()}
                            >
                                {options.confirmText || 'Aceptar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
};

export const useConfirm = () => {
    const context = useContext(ConfirmContext);
    if (context === undefined) {
        throw new Error('useConfirm must be used within a ConfirmProvider');
    }
    return context.confirm;
};

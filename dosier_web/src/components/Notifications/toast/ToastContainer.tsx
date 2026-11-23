import React from 'react';
import type { Toast } from './types';
import type { ToastCommitController } from './commitController';
import { ToastErrorBoundary } from './ToastErrorBoundary';
import { ToastItem } from './ToastItem';

export interface ToastEntry {
    toast: Toast;
    commitController: ToastCommitController;
}

interface ToastContainerProps {
    entries: ToastEntry[];
    onDismiss: (id: string, reason: 'expire' | 'dismiss' | 'undo' | 'navigate') => void;
    navigate: (url: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
    entries,
    onDismiss,
    navigate,
}) => {
    if (entries.length === 0) return null;

    return (
        <section
            className="toast-container-vercel"
            aria-label="Notificaciones del sistema"
        >
            {entries.map(({ toast, commitController }) => (
                <ToastErrorBoundary key={toast.id}>
                    <ToastItem
                        toast={toast}
                        commitController={commitController}
                        onDismiss={onDismiss}
                        navigate={navigate}
                    />
                </ToastErrorBoundary>
            ))}
        </section>
    );
};

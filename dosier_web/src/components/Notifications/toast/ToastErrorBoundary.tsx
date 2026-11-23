import React from 'react';

interface ToastErrorBoundaryProps {
    children: React.ReactNode;
}

interface ToastErrorBoundaryState {
    hasError: boolean;
}

export class ToastErrorBoundary extends React.Component<
    ToastErrorBoundaryProps,
    ToastErrorBoundaryState
> {
    constructor(props: ToastErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ToastErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.warn(
            '[ToastErrorBoundary] Error al renderizar notificación flotante (contenido aislado):',
            error,
            errorInfo
        );
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../../../api/NotificationsContext';
import { useConfirm } from '../../../../api/ConfirmContext';
import { useRevisionTecnicaLayout } from './useRevisionTecnicaLayout';
import { useRevisionTecnicaComments } from './useRevisionTecnicaComments';
import { useRevisionTecnicaData } from './useRevisionTecnicaData';

export const useRevisionTecnica = () => {
    const { projectUuid } = useParams<{ projectUuid: string }>();
    const navigate = useNavigate();
    const { addToast } = useNotifications();
    const confirm = useConfirm();

    const layout = useRevisionTecnicaLayout();
    const commentsState = useRevisionTecnicaComments({
        projectUuid,
        activeCommentField: layout.activeCommentField,
        addToast
    });
    const data = useRevisionTecnicaData({
        projectUuid,
        navigate,
        addToast,
        confirm,
        comments: commentsState.comments,
        setComments: commentsState.setComments,
        activeCommentField: layout.activeCommentField,
        setContextualInput: commentsState.setContextualInput
    });

    // Sincronizar activeSection si la sección por defecto (ej. identificacion) fue eliminada en el editor de plantillas
    useEffect(() => {
        if (data.templateSections && data.templateSections.length > 0) {
            const hasCurrent = data.templateSections.some(s => s.id === layout.activeSection);
            if (!hasCurrent) {
                layout.setActiveSection(data.templateSections[0].id);
            }
        }
    }, [data.templateSections, layout.activeSection]);

    // Auto-Scroll suave a la tarjeta seleccionada en el visor interactivo
    useEffect(() => {
        if (!layout.activeCommentField || layout.viewMode === 'pdf') return;
        const targetElement = document.getElementById(`field-card-${layout.activeCommentField}`);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [layout.activeCommentField, layout.viewMode]);

    const getSafeArray = (value: any): any[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                if (Array.isArray(parsed)) return parsed;
            } catch {}
        }
        return [];
    };

    const getFieldCardClasses = (fieldKey: string, extraClasses: string = 'space-y-1') => {
        const isActive = layout.activeCommentField === fieldKey && layout.isRightSidebarOpen;
        const borderClass = 'border-slate-200/90 dark:border-zinc-800 bg-surface';
        const activeClass = isActive
            ? '!border-[#0070f3] ring-1 ring-[#0070f3]/20 shadow-sm'
            : '';

        return `p-4 rounded-lg border ${extraClasses} relative cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-850/50 transition-colors ${borderClass} ${activeClass}`;
    };

    const renderFieldStatusBadge = (fieldKey: string) => {
        const fieldComments = commentsState.comments[fieldKey];
        if (fieldComments && fieldComments.length > 0) {
            return React.createElement(
                'span',
                { className: 'inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400' },
                React.createElement('span', { className: 'w-1.5 h-1.5 rounded-full bg-amber-500' }),
                `Con Observaciones (${fieldComments.length})`
            );
        }
        return null;
    };

    const handleNavigateBack = () => {
        if (commentsState.contextualInput.trim()) {
            if (!window.confirm('Tiene una observación en borrador sin enviar en el panel lateral. ¿Desea salir sin guardar?')) {
                return;
            }
        }
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/documentacion/proyectos?tab=supervision-pea', { replace: true });
        }
    };

    return {
        projectUuid,
        navigate,
        layout,
        commentsState,
        data,
        getSafeArray,
        getFieldCardClasses,
        renderFieldStatusBadge,
        handleNavigateBack
    };
};

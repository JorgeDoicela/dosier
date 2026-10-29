import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSmartHeader } from './useSmartHeader';

export const useRevisionTecnicaLayout = () => {
    const [viewMode, setViewMode] = useState<'interactive' | 'pdf' | 'history'>('interactive');
    const [activeSection, setActiveSection] = useState<string>('pea_general_section');
    const [activeCommentField, setActiveCommentField] = useState<string>('NombreAsignatura');
    const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
    const [generalFeedback, setGeneralFeedback] = useState('');

    // Hook desacoplado de Smart Header
    const smartHeader = useSmartHeader({ threshold: 10, topOffset: 60 });

    useEffect(() => {
        smartHeader.resetHeader();
    }, [viewMode, isFinalizeModalOpen]);

    const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(() => {
        const saved = localStorage.getItem('rev_left_sidebar_width');
        const parsed = saved ? parseInt(saved, 10) : 280;
        const normalized = (parsed < 260 || parsed > 500) ? 280 : parsed;
        if (saved !== String(normalized)) {
            localStorage.setItem('rev_left_sidebar_width', String(normalized));
        }
        return normalized;
    });
    const [isLeftSidebarOpen, setIsLeftSidebarOpenState] = useState<boolean>(() => {
        return localStorage.getItem('rev_left_sidebar_open') !== 'false';
    });

    const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(() => {
        const saved = localStorage.getItem('rev_right_sidebar_width');
        return saved ? parseInt(saved, 10) : 380;
    });
    const [isRightSidebarOpen, setIsRightSidebarOpenState] = useState<boolean>(() => {
        return localStorage.getItem('rev_right_sidebar_open') === 'true';
    });

    const leftSidebarRef = useRef<HTMLDivElement>(null);
    const rightSidebarRef = useRef<HTMLDivElement>(null);
    const isDraggingLeftRef = useRef(false);
    const isDraggingRightRef = useRef(false);

    // Auditoría floating button drag state
    const [auditoriaButtonTop, setAuditoriaButtonTop] = useState<number>(() => {
        const saved = localStorage.getItem('rev_auditoria_button_top');
        return saved ? parseInt(saved, 10) : 180;
    });
    const [auditoriaButtonLeft, setAuditoriaButtonLeft] = useState<number | null>(null);
    const [isDraggingButton, setIsDraggingButton] = useState(false);

    // Secciones floating button drag state
    const [seccionesButtonTop, setSeccionesButtonTop] = useState<number>(() => {
        const saved = localStorage.getItem('rev_secciones_button_top');
        return saved ? parseInt(saved, 10) : 180;
    });
    const [seccionesButtonLeft, setSeccionesButtonLeft] = useState<number | null>(null);
    const [isDraggingSeccionesButton, setIsDraggingSeccionesButton] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            if (window.innerWidth < 1100) {
                setIsLeftSidebarOpenState(false);
                localStorage.setItem('rev_left_sidebar_open', 'false');
            }
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleLeftSidebar = useCallback((open?: boolean) => {
        setIsLeftSidebarOpenState(prev => {
            const nextState = open !== undefined ? open : !prev;
            localStorage.setItem('rev_left_sidebar_open', String(nextState));
            if (nextState) {
                const widthToUse = Math.max(200, Math.min(500, leftSidebarWidth));
                if (leftSidebarRef.current) {
                    leftSidebarRef.current.style.width = `${widthToUse}px`;
                    leftSidebarRef.current.style.transition = 'width 300ms ease-in-out';
                }
            } else if (leftSidebarRef.current) {
                leftSidebarRef.current.style.width = '0px';
                leftSidebarRef.current.style.transition = 'width 300ms ease-in-out';
            }
            return nextState;
        });
    }, [leftSidebarWidth]);

    const toggleRightSidebar = useCallback((open?: boolean) => {
        setIsRightSidebarOpenState(prev => {
            const nextState = open !== undefined ? open : !prev;
            localStorage.setItem('rev_right_sidebar_open', String(nextState));
            if (nextState) {
                const widthToUse = Math.max(320, Math.min(650, rightSidebarWidth));
                if (rightSidebarRef.current) {
                    rightSidebarRef.current.style.width = `${widthToUse}px`;
                    rightSidebarRef.current.style.transition = 'width 300ms ease-in-out';
                }
            } else if (rightSidebarRef.current) {
                rightSidebarRef.current.style.width = '0px';
                rightSidebarRef.current.style.transition = 'width 300ms ease-in-out';
            }
            return nextState;
        });
    }, [rightSidebarWidth]);

    // ── Redimensionado con zona de colapso automático idéntico a DOSIERBuilderShell ──
    const startDraggingLeft = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        isDraggingLeftRef.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';

        if (leftSidebarRef.current) {
            leftSidebarRef.current.style.transition = 'none';
        }

        const startWidth = leftSidebarWidth;
        const startX = mouseDownEvent.clientX;
        let maxDelta = 0;

        const doDrag = (mouseMoveEvent: MouseEvent) => {
            const deltaX = mouseMoveEvent.clientX - startX;
            maxDelta = Math.max(maxDelta, Math.abs(deltaX));

            // Permite bajar a 0 para que el usuario sienta el límite de colapso
            const newWidth = Math.max(0, Math.min(500, startWidth + deltaX));
            if (leftSidebarRef.current) {
                leftSidebarRef.current.style.width = `${newWidth}px`;
            }
        };

        const stopDrag = () => {
            isDraggingLeftRef.current = false;
            document.body.style.removeProperty('user-select');
            document.body.style.removeProperty('cursor');
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);

            const currentWidth = leftSidebarRef.current
                ? parseInt(leftSidebarRef.current.style.width, 10)
                : startWidth;

            const clicked = maxDelta <= 4;
            const releasedInCollapseZone = maxDelta > 4 && currentWidth < 140;
            const shouldCollapse = clicked || releasedInCollapseZone;

            if (leftSidebarRef.current) {
                leftSidebarRef.current.style.transition = 'width 300ms ease-in-out';
            }

            if (shouldCollapse) {
                toggleLeftSidebar(false);
            } else {
                const finalWidth = Math.max(200, Math.min(500, currentWidth));
                setLeftSidebarWidth(finalWidth);
                localStorage.setItem('rev_left_sidebar_width', String(finalWidth));
                if (leftSidebarRef.current) {
                    leftSidebarRef.current.style.width = `${finalWidth}px`;
                }
            }
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }, [leftSidebarWidth, toggleLeftSidebar]);

    const startDraggingRight = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        isDraggingRightRef.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';

        if (rightSidebarRef.current) {
            rightSidebarRef.current.style.transition = 'none';
        }

        const startWidth = rightSidebarWidth;
        const startX = mouseDownEvent.clientX;
        let maxDelta = 0;

        const doDrag = (mouseMoveEvent: MouseEvent) => {
            const deltaX = startX - mouseMoveEvent.clientX;
            maxDelta = Math.max(maxDelta, Math.abs(deltaX));

            // Permite bajar a 0 para que el usuario sienta el límite de colapso
            const newWidth = Math.max(0, Math.min(700, startWidth + deltaX));
            if (rightSidebarRef.current) {
                rightSidebarRef.current.style.width = `${newWidth}px`;
            }
        };

        const stopDrag = () => {
            isDraggingRightRef.current = false;
            document.body.style.removeProperty('user-select');
            document.body.style.removeProperty('cursor');
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopDrag);

            const currentWidth = rightSidebarRef.current
                ? parseInt(rightSidebarRef.current.style.width, 10)
                : startWidth;

            const clicked = maxDelta <= 4;
            const releasedInCollapseZone = maxDelta > 4 && currentWidth < 220;
            const shouldCollapse = clicked || releasedInCollapseZone;

            if (rightSidebarRef.current) {
                rightSidebarRef.current.style.transition = 'width 300ms ease-in-out';
            }

            if (shouldCollapse) {
                toggleRightSidebar(false);
            } else {
                const finalWidth = Math.max(300, Math.min(700, currentWidth));
                setRightSidebarWidth(finalWidth);
                localStorage.setItem('rev_right_sidebar_width', String(finalWidth));
                if (rightSidebarRef.current) {
                    rightSidebarRef.current.style.width = `${finalWidth}px`;
                }
            }
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
    }, [rightSidebarWidth, toggleRightSidebar]);

    // ── Drag & Drop de Pestañas Flotantes (Nav y Auditoría) ──
    const handleButtonDragStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingButton(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startTop = auditoriaButtonTop;
        const buttonWidth = 34;
        const initialX = window.innerWidth - buttonWidth;
        let hasMoved = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                hasMoved = true;
            }

            let newX = initialX + deltaX;
            newX = Math.max(window.innerWidth / 2, Math.min(window.innerWidth - buttonWidth, newX));

            let newTop = startTop + deltaY;
            newTop = Math.max(70, Math.min(window.innerHeight - 150, newTop));

            setAuditoriaButtonLeft(newX);
            setAuditoriaButtonTop(newTop);
        };

        const handleMouseUp = (mouseUpEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setIsDraggingButton(false);

            if (hasMoved) {
                setAuditoriaButtonLeft(null);

                const finalY = startTop + (mouseUpEvent.clientY - startY);
                const boundedY = Math.max(70, Math.min(window.innerHeight - 150, finalY));
                setAuditoriaButtonTop(boundedY);
                localStorage.setItem('rev_auditoria_button_top', boundedY.toString());
            } else {
                setAuditoriaButtonLeft(null);
                toggleRightSidebar(true);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleSeccionesButtonDragStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDraggingSeccionesButton(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startTop = seccionesButtonTop;
        const buttonWidth = 36;
        const initialX = 0;
        let hasMoved = false;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaY = moveEvent.clientY - startY;

            if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
                hasMoved = true;
            }

            let newX = initialX + deltaX;
            newX = Math.max(0, Math.min(window.innerWidth / 2 - buttonWidth, newX));

            let newTop = startTop + deltaY;
            newTop = Math.max(70, Math.min(window.innerHeight - 150, newTop));

            setSeccionesButtonLeft(newX);
            setSeccionesButtonTop(newTop);
        };

        const handleMouseUp = (mouseUpEvent: MouseEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            setIsDraggingSeccionesButton(false);

            if (hasMoved) {
                setSeccionesButtonLeft(null);

                const finalY = startTop + (mouseUpEvent.clientY - startY);
                const boundedY = Math.max(70, Math.min(window.innerHeight - 150, finalY));
                setSeccionesButtonTop(boundedY);
                localStorage.setItem('rev_secciones_button_top', boundedY.toString());
            } else {
                setSeccionesButtonLeft(null);
                toggleLeftSidebar(true);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return {
        viewMode,
        setViewMode,
        activeSection,
        setActiveSection,
        activeCommentField,
        setActiveCommentField,
        isFinalizeModalOpen,
        setIsFinalizeModalOpen,
        generalFeedback,
        setGeneralFeedback,
        isDraggingLeft: isDraggingLeftRef.current,
        isDraggingRight: isDraggingRightRef.current,
        leftSidebarWidth,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen: toggleLeftSidebar,
        rightSidebarWidth,
        isRightSidebarOpen,
        setIsRightSidebarOpen: toggleRightSidebar,
        leftSidebarRef,
        rightSidebarRef,
        auditoriaButtonTop,
        auditoriaButtonLeft,
        isDraggingButton,
        seccionesButtonTop,
        seccionesButtonLeft,
        isDraggingSeccionesButton,
        startDraggingLeft,
        startDraggingRight,
        handleButtonDragStart,
        handleSeccionesButtonDragStart,
        isHeaderVisible: smartHeader.isHeaderVisible,
        setIsHeaderVisible: smartHeader.setIsHeaderVisible,
        handleHeaderScroll: smartHeader.handleScroll,
        resetHeader: smartHeader.resetHeader
    };
};

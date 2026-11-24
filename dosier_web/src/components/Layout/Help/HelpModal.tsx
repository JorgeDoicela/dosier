import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    X, Award, Zap, ChevronLeft, ChevronRight, Check, GripHorizontal
} from 'lucide-react';
import type { HelpConfig, DosierRole } from './types';
import { HELP_MAP, DEFAULT_CONFIG, normalizePathname } from './configs';
import { useAuth } from '../../../api/AuthContext';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
    pathname: string;
}

interface LayoutMockupProps {
    highlight: 'sidebar' | 'topbar' | 'content-top' | 'content-bottom' | 'all' | 'none';
    stepTitle: string;
    config: HelpConfig;
}

const LayoutMockup: React.FC<LayoutMockupProps> = ({ highlight, stepTitle, config }) => {
    const getPointerStyle = () => {
        switch (highlight) {
            case 'sidebar':
                return { left: '12%', top: '55%' };
            case 'topbar':
                return { left: '60%', top: '15%' };
            case 'content-top':
                return { left: '55%', top: '35%' };
            case 'content-bottom':
                return { left: '55%', top: '65%' };
            case 'all':
                return { left: '50%', top: '50%' };
            default:
                return null;
        }
    };

    const pointerPos = getPointerStyle();

    const renderContentMockup = () => {
        const isHighlightTop = highlight === 'content-top';
        const isHighlightBottom = highlight === 'content-bottom';
        const highlightTopClass = isHighlightTop
            ? 'border-[#0070f3] bg-[#0070f3]/10 shadow-[0_0_10px_rgba(0,112,243,0.18)]'
            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950';
        const highlightBottomClass = isHighlightBottom
            ? 'border-[#0070f3] bg-[#0070f3]/10 shadow-[0_0_10px_rgba(0,112,243,0.18)] border-2'
            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950';

        const MockupComp = config.Mockup || DEFAULT_CONFIG.Mockup;
        if (MockupComp) {
            return <MockupComp highlightTopClass={highlightTopClass} highlightBottomClass={highlightBottomClass} />;
        }
        return null;
    };

    return (
        <div className="relative w-full max-w-[420px] aspect-[16/10] bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-2.5 shadow-inner select-none transition-all duration-300">
            <div className={`w-full h-full flex flex-col gap-1.5 rounded-lg overflow-hidden p-1.5 transition-all duration-300 ${
                highlight === 'all'
                    ? 'border-2 border-[#0070f3] bg-white dark:bg-zinc-950'
                    : 'border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
            }`}>
                {/* Simulated TopBar */}
                <div className={`h-8 border rounded-md px-2 flex items-center justify-between transition-all duration-300 ${
                    highlight === 'topbar'
                        ? 'border-[#0070f3] bg-[#0070f3]/10 shadow-[0_0_10px_rgba(0,112,243,0.18)]'
                        : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
                }`}>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                        <div className="w-12 h-2 rounded bg-slate-200 dark:bg-zinc-700" />
                    </div>
                    <div className="w-20 h-2 bg-slate-200 dark:bg-zinc-700 rounded hidden xs:block" />
                    <div className="flex items-center gap-1.5">
                        <div className="w-8 h-3 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700" />
                        <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-zinc-700" />
                    </div>
                </div>

                {/* Simulated Body Grid */}
                <div className="flex-1 flex gap-1.5 min-h-0">
                    {/* Simulated Sidebar */}
                    <div className={`w-[22%] rounded-md border p-1.5 flex flex-col justify-between transition-all duration-300 ${
                        highlight === 'sidebar'
                            ? 'border-[#0070f3] bg-[#0070f3]/10 shadow-[0_0_10px_rgba(0,112,243,0.18)]'
                            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950'
                    }`}>
                        <div className="space-y-1.5">
                            <div className="w-8 h-2.5 bg-slate-300 dark:bg-zinc-600 rounded-sm mx-auto mb-2" />
                            <div className={`w-full h-2 rounded-sm ${highlight === 'sidebar' ? 'bg-[#0070f3]' : 'bg-slate-200 dark:bg-zinc-700'}`} />
                            <div className="w-4/5 h-2 bg-slate-100 dark:bg-zinc-800 rounded-sm" />
                            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-sm" />
                            <div className="w-3/5 h-2 bg-slate-100 dark:bg-zinc-800 rounded-sm" />
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-zinc-800 rounded-sm" />
                    </div>

                    {/* Simulated Main Content Workspace */}
                    <div className="flex-1 flex flex-col gap-1.5 min-h-0">
                        {renderContentMockup()}
                    </div>
                </div>
            </div>

            {/* Dynamic Animated Pointer */}
            {pointerPos && (
                <div
                    style={{ left: pointerPos.left, top: pointerPos.top }}
                    className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 ease-out"
                >
                    <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#0070f3] opacity-60" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0070f3] border-2 border-white shadow-md" />
                    </div>
                    <div className="mt-1 bg-zinc-950 text-[10px] font-mono font-semibold tracking-wide text-white px-2 py-0.5 rounded shadow-lg border border-zinc-700 whitespace-nowrap animate-fade-in">
                        {stepTitle}
                    </div>
                </div>
            )}
        </div>
    );
};

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, pathname }) => {
    const {
        isAdmin,
        isDocente,
        isCoordCarrera,
        isCoordAcad,
        isVicerrector,
        activeRole,
        roleDisplayName
    } = useAuth();

    const normalizedPathname = normalizePathname(pathname);
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState<'next' | 'prev'>('next');

    // Estado para ventana movible (arrastrable desde la cabecera)
    const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<{
        pointerX: number;
        pointerY: number;
        startX: number;
        startY: number;
    } | null>(null);

    const primaryRole = useMemo<DosierRole>(() => {
        if (activeRole === 'DOSIER_ADMIN') return 'admin';
        if (activeRole === 'DOSIER_VICERRECTOR') return 'vicerrector';
        if (activeRole === 'DOSIER_COORD_ACAD') return 'coord_acad';
        if (activeRole === 'DOSIER_COORD_CARRERA') return 'coord_carrera';
        if (activeRole === 'DOSIER_DOCENTE') return 'docente';

        if (isAdmin) return 'admin';
        if (isVicerrector) return 'vicerrector';
        if (isCoordAcad) return 'coord_acad';
        if (isCoordCarrera) return 'coord_carrera';
        if (isDocente) return 'docente';
        return 'todos';
    }, [activeRole, isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente]);

    const activeRoles = useMemo<DosierRole[]>(() => {
        const list: DosierRole[] = ['todos', primaryRole];
        if (isAdmin && !list.includes('admin')) list.push('admin');
        if (isVicerrector && !list.includes('vicerrector')) list.push('vicerrector');
        if (isCoordAcad && !list.includes('coord_acad')) list.push('coord_acad');
        if (isCoordCarrera && !list.includes('coord_carrera')) list.push('coord_carrera');
        if (isDocente && !list.includes('docente')) list.push('docente');
        return list;
    }, [primaryRole, isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, isDocente]);

    const config = useMemo<HelpConfig>(() => {
        const rawConfig = HELP_MAP[normalizedPathname] || DEFAULT_CONFIG;
        const override = rawConfig.roleOverrides?.[primaryRole];

        const filteredSteps = rawConfig.steps.filter(step => {
            if (!step.roles || step.roles.length === 0 || step.roles.includes('todos')) return true;
            return step.roles.some(r => activeRoles.includes(r));
        });

        const filteredTips = (rawConfig.tips || []).filter(tip => {
            if (typeof tip === 'string') return true;
            if (!tip.roles || tip.roles.length === 0 || tip.roles.includes('todos')) return true;
            return tip.roles.some(r => activeRoles.includes(r));
        });

        return {
            ...rawConfig,
            title: override?.title || rawConfig.title,
            summary: override?.summary || rawConfig.summary,
            description: override?.description || rawConfig.description,
            compliance: override?.compliance || rawConfig.compliance,
            steps: filteredSteps.length > 0 ? filteredSteps : rawConfig.steps,
            tips: filteredTips.length > 0 ? filteredTips : rawConfig.tips
        };
    }, [normalizedPathname, primaryRole, activeRoles]);

    const totalSteps = config.steps.length + 2;

    useEffect(() => {
        if (isOpen) {
            setCurrentStep(0);
            setDirection('next');
            setOffset({ x: 0, y: 0 });
        }
    }, [normalizedPathname, isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (currentStep < totalSteps - 1) {
                    setDirection('next');
                    setCurrentStep(prev => prev + 1);
                }
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (currentStep > 0) {
                    setDirection('prev');
                    setCurrentStep(prev => prev - 1);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentStep, totalSteps, onClose]);

    const handleHeaderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        dragStartRef.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            startX: offset.x,
            startY: offset.y
        };
        setIsDragging(true);
    }, [offset.x, offset.y]);

    useEffect(() => {
        if (!isDragging) return;

        const handlePointerMove = (e: PointerEvent) => {
            if (!dragStartRef.current) return;
            const dx = e.clientX - dragStartRef.current.pointerX;
            const dy = e.clientY - dragStartRef.current.pointerY;

            const modalEl = modalRef.current;
            const maxOffsetX = modalEl
                ? Math.max(80, (window.innerWidth - modalEl.offsetWidth) / 2 + modalEl.offsetWidth * 0.25)
                : 300;
            const maxOffsetY = modalEl
                ? Math.max(60, (window.innerHeight - modalEl.offsetHeight) / 2 + modalEl.offsetHeight * 0.2)
                : 200;

            const nextX = Math.min(maxOffsetX, Math.max(-maxOffsetX, dragStartRef.current.startX + dx));
            const nextY = Math.min(maxOffsetY, Math.max(-maxOffsetY, dragStartRef.current.startY + dy));
            setOffset({ x: nextX, y: nextY });
        };

        const handlePointerUp = () => {
            setIsDragging(false);
            dragStartRef.current = null;
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isDragging]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setDirection('next');
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setDirection('prev');
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleDotClick = (index: number) => {
        setDirection(index > currentStep ? 'next' : 'prev');
        setCurrentStep(index);
    };

    const getActiveHighlight = () => {
        if (currentStep === 0) return 'all';
        if (currentStep === totalSteps - 1) return 'none';
        const stepIdx = currentStep - 1;
        return config.steps[stepIdx]?.highlight || 'none';
    };

    const getActiveStepLabel = () => {
        if (currentStep === 0) return 'Visión General';
        if (currentStep === totalSteps - 1) return 'Normativa CACES';
        const stepIdx = currentStep - 1;
        return config.steps[stepIdx]?.title || 'Paso';
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Guía Interactiva: ${config.title}`}
        >
            {/* Overlay Sólido */}
            <div
                className="absolute inset-0 bg-black/55 dark:bg-black/75 cursor-pointer animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Dialog Card (Movible desde cabecera) */}
            <div
                ref={modalRef}
                style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
                className={`relative w-full max-w-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl flex flex-col z-10 overflow-hidden max-h-[90vh] ${
                    isDragging ? 'transition-none' : 'transition-transform duration-150 ease-out animate-scale-up'
                }`}
            >
                {/* Header Movible */}
                <div
                    onPointerDown={handleHeaderPointerDown}
                    onDoubleClick={() => setOffset({ x: 0, y: 0 })}
                    className={`flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0 select-none ${
                        isDragging ? 'cursor-grabbing' : 'cursor-grab'
                    }`}
                    title="Arrastra para mover la guía (doble clic para centrar)"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[#0070f3] shrink-0">
                            {config.icon}
                        </span>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                    DOSIER
                                </span>
                                <span className="text-slate-400 dark:text-zinc-600">/</span>
                                <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                                    Guía del Módulo
                                </span>
                                {roleDisplayName && (
                                    <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                                        ({roleDisplayName})
                                    </span>
                                )}
                            </div>
                            <h3 className="text-xs font-semibold tracking-tight text-slate-900 dark:text-zinc-100 font-sans">
                                {config.title}
                            </h3>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <GripHorizontal size={15} className="text-slate-400 dark:text-zinc-500 hidden sm:block" aria-hidden="true" />
                        <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={onClose}
                            className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/70 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Cerrar Guía"
                            aria-label="Cerrar Guía"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Two-Column Body Grid */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative min-h-[380px] flex flex-col md:flex-row border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                    {/* Left Column: Explanations & Text Wizard */}
                    <div className="w-full md:w-[45%] p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                        <div
                            key={`${normalizedPathname}-${currentStep}`}
                            className={`flex-1 flex flex-col justify-center ${
                                direction === 'next' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left'
                            }`}
                        >
                            {currentStep === 0 && (
                                <div className="space-y-3.5 py-1">
                                    <div className="text-[#0070f3]">
                                        {config.icon}
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                                            Introducción
                                        </span>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                                            {config.title}
                                        </h4>
                                    </div>
                                    <p className="text-xs font-medium text-slate-800 dark:text-zinc-200 leading-snug">
                                        {config.summary}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        {config.description}
                                    </p>
                                </div>
                            )}

                            {currentStep > 0 && currentStep <= config.steps.length && (() => {
                                const stepIdx = currentStep - 1;
                                const step = config.steps[stepIdx];
                                return (
                                    <div className="space-y-3.5 py-1">
                                        <div className="w-7 h-7 rounded-full bg-[#0070f3] text-white flex items-center justify-center text-xs font-mono font-semibold">
                                            {currentStep}
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                                                Paso {currentStep} de {config.steps.length}
                                            </span>
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                                                {step.title}
                                            </h4>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                );
                            })()}

                            {currentStep === totalSteps - 1 && (
                                <div className="space-y-4 py-1">
                                    <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-start gap-2.5">
                                        <Award size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                        <div className="space-y-0.5">
                                            <h5 className="text-xs font-semibold text-slate-900 dark:text-zinc-100">
                                                Cumplimiento CACES
                                            </h5>
                                            <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                {config.compliance}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h5 className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-200 dark:border-zinc-800 pb-1">
                                            Recomendaciones Operativas
                                        </h5>
                                        <ul className="space-y-1.5">
                                            {config.tips.map((tip, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                    <Zap size={12} className="text-amber-500 shrink-0 mt-0.5" />
                                                    <span>{typeof tip === 'string' ? tip : tip.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Interactive UI Mockup Simulator */}
                    <div className="w-full md:w-[55%] p-6 bg-zinc-50 dark:bg-zinc-900 flex flex-col justify-center items-center select-none">
                        <LayoutMockup
                            highlight={getActiveHighlight()}
                            stepTitle={getActiveStepLabel()}
                            config={config}
                        />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-3.5 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                            currentStep === 0 ? 'opacity-30 pointer-events-none' : ''
                        }`}
                        title="Paso Anterior"
                    >
                        <ChevronLeft size={14} />
                        <span>Atrás</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                        {Array.from({ length: totalSteps }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleDotClick(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === currentStep
                                        ? 'w-5 bg-[#0070f3]'
                                        : 'w-1.5 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
                                }`}
                                title={`Ir a la diapositiva ${idx + 1}`}
                                aria-label={`Paso ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {currentStep === totalSteps - 1 ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                            title="Finalizar Guía"
                        >
                            <span>Entendido</span>
                            <Check size={14} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                            title="Siguiente Paso"
                        >
                            <span>Siguiente</span>
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
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
    stepLabel: string;
    config: HelpConfig;
}

const LayoutMockup: React.FC<LayoutMockupProps> = ({ highlight, stepLabel, config }) => {
    const isDimmed = (zone: 'sidebar' | 'topbar' | 'content-top' | 'content-bottom') => {
        if (highlight === 'all' || highlight === 'none') return false;
        return highlight !== zone;
    };

    const getPointerPos = () => {
        switch (highlight) {
            case 'sidebar':
                return { left: '22%', top: '38%' };
            case 'topbar':
                return { left: '60%', top: '19%' };
            case 'content-top':
                return { left: '61%', top: '33%' };
            case 'content-bottom':
                return { left: '61%', top: '53%' };
            default:
                return null;
        }
    };

    const pointerPos = getPointerPos();

    const highlightTopClass = highlight === 'content-top'
        ? 'border-[#0070f3] bg-blue-50/50 dark:bg-blue-950/30'
        : `border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${isDimmed('content-top') ? 'opacity-40' : ''}`;

    const highlightBottomClass = highlight === 'content-bottom'
        ? 'border-[#0070f3] bg-blue-50/50 dark:bg-blue-950/30'
        : `border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 ${isDimmed('content-bottom') ? 'opacity-40' : ''}`;

    const MockupComp = config.Mockup || DEFAULT_CONFIG.Mockup;

    return (
        <div className="w-full max-w-[500px] space-y-3 select-none">
            <div
                data-testid="help-mockup-frame"
                className={`relative w-full aspect-[16/10] bg-white dark:bg-zinc-950 border rounded-xl p-3 shadow-xs transition-colors duration-300 ${
                    highlight === 'all'
                        ? 'border-[#0070f3]'
                        : 'border-slate-200 dark:border-zinc-800'
                }`}
            >
                <div className="w-full h-full flex flex-col gap-1.5">
                    {/* Simulated TopBar (100% sin palabras) */}
                    <div className={`h-7 border rounded-md px-2 flex items-center justify-between transition-all duration-300 ${
                        highlight === 'topbar'
                            ? 'border-[#0070f3] bg-blue-50/50 dark:bg-blue-950/30'
                            : `border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 ${isDimmed('topbar') ? 'opacity-40' : ''}`
                    }`}>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-xs bg-[#0070f3]" />
                            <span className="w-8 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
                        </div>
                        <div className="w-24 h-3.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full border border-slate-400 dark:border-zinc-500" />
                            <span className="w-10 h-1 rounded-full bg-slate-200 dark:bg-zinc-700" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="relative w-3 h-3 rounded-full bg-slate-200 dark:bg-zinc-700">
                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#0070f3]" />
                            </span>
                            <span className="w-3.5 h-3.5 rounded-full bg-[#0070f3]/20 border border-[#0070f3]/40" />
                        </div>
                    </div>

                    {/* Simulated Body Grid */}
                    <div className="flex-1 flex gap-1.5 min-h-0">
                        {/* Simulated Sidebar (100% sin palabras) */}
                        <div className={`w-[22%] rounded-md border p-1.5 flex flex-col justify-between transition-all duration-300 ${
                            highlight === 'sidebar'
                                ? 'border-[#0070f3] bg-blue-50/50 dark:bg-blue-950/30'
                                : `border-slate-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 ${isDimmed('sidebar') ? 'opacity-40' : ''}`
                        }`}>
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-xs bg-[#0070f3] shrink-0" />
                                    <span className="flex-1 h-1.5 rounded-full bg-[#0070f3]" />
                                </div>
                                {[1, 2, 3, 4].map((item) => (
                                    <div key={item} className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-xs bg-slate-300 dark:bg-zinc-700 shrink-0" />
                                        <span className={`h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800 ${item % 2 === 0 ? 'w-3/4' : 'w-full'}`} />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 pt-1 border-t border-slate-200/70 dark:border-zinc-800">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700 shrink-0" />
                                <span className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-zinc-800" />
                            </div>
                        </div>

                        {/* Simulated Main Content Workspace */}
                        <div className="flex-1 flex flex-col gap-1.5 min-h-0 min-w-0">
                            {MockupComp ? (
                                <MockupComp
                                    highlightTopClass={highlightTopClass}
                                    highlightBottomClass={highlightBottomClass}
                                />
                            ) : null}
                        </div>
                    </div>
                </div>

                {/* Spotlight Pointer */}
                {pointerPos && (
                    <div
                        style={{ left: pointerPos.left, top: pointerPos.top }}
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500 ease-out"
                    >
                        <div className="relative flex items-center justify-center">
                            <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-[#0070f3] opacity-50" />
                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0070f3] border-2 border-white shadow-md" />
                        </div>
                    </div>
                )}
            </div>

            {/* Clean Visual Caption */}
            <div className="flex items-center justify-center text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-medium text-slate-700 dark:text-zinc-300 truncate">
                    {stepLabel}
                </span>
            </div>
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
            } else if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
                e.preventDefault();
                setCurrentStep(prev => prev + 1);
            } else if (e.key === 'ArrowLeft' && currentStep > 0) {
                e.preventDefault();
                setCurrentStep(prev => prev - 1);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentStep, totalSteps, onClose]);

    if (!isOpen) return null;

    const getActiveHighlight = () => {
        if (currentStep === 0) return 'all';
        if (currentStep === totalSteps - 1) return 'none';
        return config.steps[currentStep - 1]?.highlight || 'none';
    };

    const getActiveStepLabel = () => {
        if (currentStep === 0) return 'Vista general del módulo';
        if (currentStep === totalSteps - 1) return 'Recomendaciones y normativa';
        return config.steps[currentStep - 1]?.title || 'Detalle';
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Guía: ${config.title}`}
        >
            <div
                className="absolute inset-0 bg-black/55 dark:bg-black/75 cursor-pointer"
                onClick={onClose}
            />

            <div className="relative w-full max-w-4xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl flex flex-col z-10 overflow-hidden max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between gap-4 px-7 pt-6 pb-2 bg-white dark:bg-zinc-950 shrink-0">
                    <div className="min-w-0">
                        <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-zinc-100 leading-snug">
                            {config.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                            {roleDisplayName ? `Guía · ${roleDisplayName}` : 'Guía del módulo'}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-md text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
                        title="Cerrar Guía"
                        aria-label="Cerrar Guía"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Cuerpo paginado para lectura dosificada */}
                <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[380px] flex flex-col md:flex-row bg-white dark:bg-zinc-950">
                    <div className="w-full md:w-[42%] p-7 flex flex-col justify-center bg-white dark:bg-zinc-950">
                        {currentStep === 0 && (
                            <div className="space-y-3.5">
                                <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 leading-relaxed">
                                    {config.summary}
                                </p>
                                <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                                    {config.description}
                                </p>
                            </div>
                        )}

                        {currentStep > 0 && currentStep <= config.steps.length && (() => {
                            const step = config.steps[currentStep - 1];
                            return (
                                <div className="space-y-3">
                                    <h4 className="text-base font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">
                                        {step.title}
                                    </h4>
                                    <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                                        {step.description}
                                    </p>
                                </div>
                            );
                        })()}

                        {currentStep === totalSteps - 1 && (
                            <div className="space-y-4">
                                {config.tips.length > 0 && (
                                    <div className="space-y-2.5">
                                        <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                                            Recomendaciones
                                        </span>
                                        <ul className="space-y-2">
                                            {config.tips.map((tip, idx) => (
                                                <li key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070f3] mt-2 shrink-0" />
                                                    <span>{typeof tip === 'string' ? tip : tip.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {config.compliance && (
                                    <div className="flex items-start gap-2 pt-1 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                        <span>{config.compliance}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-full md:w-[58%] p-7 bg-white dark:bg-zinc-950 flex flex-col justify-center items-center">
                        <LayoutMockup
                            highlight={getActiveHighlight()}
                            stepLabel={getActiveStepLabel()}
                            config={config}
                        />
                    </div>
                </div>

                {/* Footer con Atrás / Siguiente */}
                <div className="px-7 py-5 bg-white dark:bg-zinc-950 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                        disabled={currentStep === 0}
                        className={`px-4 py-2 text-xs font-medium rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
                            currentStep === 0 ? 'opacity-30 pointer-events-none' : ''
                        }`}
                    >
                        Atrás
                    </button>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalSteps }).map((_, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setCurrentStep(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                    idx === currentStep
                                        ? 'w-6 bg-[#0070f3]'
                                        : 'w-1.5 bg-slate-300 dark:bg-zinc-700 hover:bg-slate-400 dark:hover:bg-zinc-600'
                                }`}
                                aria-label={`Página ${idx + 1}`}
                            />
                        ))}
                    </div>

                    {currentStep === totalSteps - 1 ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                        >
                            Entendido
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCurrentStep(prev => prev + 1)}
                            className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#0070f3] text-white hover:bg-[#005bb5] transition-colors cursor-pointer"
                        >
                            Siguiente
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { ArrowLeft, ArrowRight, FileCheck } from 'lucide-react';
import type { BuilderSection } from '../hooks/useBuilderLayout';

export interface BuilderSectionFooterNavProps {
    sections: BuilderSection[];
    activeTab: string;
    setActiveTab: (tabId: string) => void;
    canSign?: boolean;
    readOnly?: boolean;
    onNavigate?: () => void;
}

export const BuilderSectionFooterNav: React.FC<BuilderSectionFooterNavProps> = ({
    sections,
    activeTab,
    setActiveTab,
    onNavigate
}) => {
    if (!sections || sections.length === 0 || activeTab === 'output') {
        return null;
    }

    const currentIndex = sections.findIndex(s => s.id === activeTab);
    if (currentIndex === -1) {
        return null;
    }

    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < sections.length - 1;
    const isLastSection = currentIndex === sections.length - 1;

    const previousSection = hasPrevious ? sections[currentIndex - 1] : null;
    const nextSection = hasNext ? sections[currentIndex + 1] : null;

    const handlePrevious = () => {
        if (previousSection) {
            setActiveTab(previousSection.id);
            onNavigate?.();
        }
    };

    const handleNext = () => {
        if (nextSection) {
            setActiveTab(nextSection.id);
            onNavigate?.();
        } else if (isLastSection) {
            setActiveTab('output');
            onNavigate?.();
        }
    };

    return (
        <nav
            aria-label="Navegación de secciones"
            className="mt-8 flex items-center justify-between gap-4 select-none"
        >
            {hasPrevious ? (
                <button
                    type="button"
                    onClick={handlePrevious}
                    className="btn-vercel-secondary flex items-center gap-2 text-xs cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    <span>Anterior</span>
                </button>
            ) : (
                <div />
            )}

            {hasNext ? (
                <button
                    type="button"
                    onClick={handleNext}
                    className="btn-vercel-primary flex items-center gap-2 text-xs ml-auto cursor-pointer"
                >
                    <span>Siguiente</span>
                    <ArrowRight size={14} />
                </button>
            ) : isLastSection ? (
                <button
                    type="button"
                    onClick={handleNext}
                    className="btn-vercel-primary flex items-center gap-2 text-xs ml-auto cursor-pointer"
                >
                    <FileCheck size={14} />
                    <span>Finalizar y Firmar</span>
                    <ArrowRight size={14} />
                </button>
            ) : null}
        </nav>
    );
};

export default BuilderSectionFooterNav;

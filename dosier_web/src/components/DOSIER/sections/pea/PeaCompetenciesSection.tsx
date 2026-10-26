import React from 'react';
import type { CoWorkHandle } from '../../../../core/cowork/types';
import { PeaCareerOutcomesSection } from './PeaCareerOutcomesSection';
import { PeaSubjectOutcomesSection } from './PeaSubjectOutcomesSection';

interface PeaCompetenciesSectionProps {
    formData?: any;
    cowork: CoWorkHandle;
    onUpdate: (field: string, value: any, meta?: { source?: 'local' | 'remote' }) => void;
    readOnly?: boolean;
    config?: any;
}

/**
 * Componente retrocompatible que agrupa D y E cuando se invoca la sección compuesta heredada.
 */
export const PeaCompetenciesSection: React.FC<PeaCompetenciesSectionProps> = (props) => {
    return (
        <div className="w-full space-y-8 animate-fade-in font-sans">
            <PeaCareerOutcomesSection {...props} />
            <div className="pt-2">
                <PeaSubjectOutcomesSection {...props} />
            </div>
        </div>
    );
};



/**
 * @file RenderPeaLegacy.tsx
 * @description Renderizadores retrocompatibles para bloques PEA compuestos heredados:
 * - pea_characterization_section (b + c)
 * - pea_competencies_rda_section (d + e)
 */

import React from 'react';
import type { PeaBlockProps } from './types';
import {
    RenderPeaObjectiveSection,
    RenderPeaCareerOutcomesSection,
    RenderPeaSubjectOutcomesSection
} from './RenderPeaObjectives';
import { RenderPeaPrerequisitesSection } from './RenderPeaPrerequisites';

/** [LEGACY] b) Objetivo y c) Prerrequisitos */
export const RenderPeaCharacterizationSection: React.FC<PeaBlockProps> = (props) => {
    return (
        <div className="w-full space-y-3">
            <RenderPeaObjectiveSection {...props} />
            <RenderPeaPrerequisitesSection {...props} />
        </div>
    );
};

/** [LEGACY] d) Resultados de Carrera y e) Resultados de Asignatura */
export const RenderPeaCompetenciesRdaSection: React.FC<PeaBlockProps> = (props) => {
    return (
        <div className="w-full space-y-3">
            <RenderPeaCareerOutcomesSection {...props} />
            <RenderPeaSubjectOutcomesSection {...props} />
        </div>
    );
};

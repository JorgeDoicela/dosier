/**
 * @file RenderPeaSections.tsx
 * @description Suite modular de renderizadores interactivos para el Programa de Estudio de la Asignatura (PEA).
 * Estructura oficial normalizada del ISTPET (Secciones a hasta k).
 *
 * @architecture
 * Implementa el patrón Component Barrel. Cada sección del PEA está modularizada en `./pea/`
 * garantizando la regla de umbral de 700 líneas por archivo y preservando el 100% de la editabilidad
 * in-situ, reactividad y expansión vertical en el lienzo.
 */

export * from './pea/types';
export { RenderPeaGeneralSection } from './pea/RenderPeaGeneral';
export {
    RenderPeaObjectiveSection,
    RenderPeaCareerOutcomesSection,
    RenderPeaSubjectOutcomesSection,
} from './pea/RenderPeaObjectives';
export { RenderPeaPrerequisitesSection } from './pea/RenderPeaPrerequisites';
export { RenderPeaContentsSection } from './pea/RenderPeaContents';
export { RenderPeaMethodologySection } from './pea/RenderPeaMethodology';
export { RenderPeaResourcesSection } from './pea/RenderPeaResources';
export { RenderPeaEvaluationSection } from './pea/RenderPeaEvaluation';
export { RenderPeaBibliographySection } from './pea/RenderPeaBibliography';
export { RenderPeaSignaturesSection } from './pea/RenderPeaSignatures';
export {
    RenderPeaCharacterizationSection,
    RenderPeaCompetenciesRdaSection,
} from './pea/RenderPeaLegacy';

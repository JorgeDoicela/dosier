import type { DocumentBlock } from '../types';
import { BASE_STYLES, renderSection } from './htmlGenerators/generatorStyles';
import { generateCoverHtml } from './htmlGenerators/coverGenerator';
import {
    generateAdvancedTableHtml,
    generateMultiSectionTableHtml,
    generateResearchersTableHtml,
} from './htmlGenerators/tableGenerator';
import {
    generateProjectGeneralHtml,
    generateProjectTechnicalHtml,
    generateImpactsHtml,
} from './htmlGenerators/sectionsGenerator';
import { generateGanttHtml } from './htmlGenerators/ganttGenerator';
import {
    generateTitleHtml,
    generateRichTextHtml,
    generateTwoColumnHtml,
    generateSignaturesHtml,
    generatePageBreakHtml,
} from './htmlGenerators/miscGenerators';
import {
    generatePeaGeneralHtml,
    generatePeaObjectiveHtml,
    generatePeaPrerequisitesHtml,
    generatePeaCareerOutcomesHtml,
    generatePeaSubjectOutcomesHtml,
    generatePeaCharacterizationHtml,
    generatePeaCompetenciesRdaHtml,
    generatePeaContentsHtml,
    generatePeaMethodologyHtml,
    generatePeaResourcesHtml,
    generatePeaEvaluationHtml,
    generatePeaBibliographyHtml,
    generatePeaSignaturesHtml,
} from './htmlGenerators/peaGenerators';

export { renderSection };

/**
 * FACHADA PRINCIPAL (FACADE PATTERN):
 * Genera el documento HTML completo delegando el renderizado de cada bloque
 * a su estrategia correspondiente.
 */
export const generateHtmlFromBlocks = (blockList: DocumentBlock[], themeConfig?: any): string => {
    let html = `${BASE_STYLES}\n<div class="doc-container">`;

    for (const block of blockList) {
        if (!block.isActive) continue;

        switch (block.type) {
            case 'cover':
                html += generateCoverHtml(block, themeConfig);
                break;
            case 'title':
                html += generateTitleHtml(block);
                break;
            case 'rich_text':
                html += generateRichTextHtml(block);
                break;
            case 'advanced_table':
                html += generateAdvancedTableHtml(block);
                break;
            case 'multi_section_table':
                html += generateMultiSectionTableHtml(block);
                break;
            case 'two_column':
                html += generateTwoColumnHtml(block);
                break;
            case 'page_break':
                html += generatePageBreakHtml();
                break;
            case 'gantt':
                html += generateGanttHtml(block);
                break;
            case 'researchers_table':
                html += generateResearchersTableHtml(block);
                break;
            case 'signatures':
                html += generateSignaturesHtml(block);
                break;
            case 'project_general_section':
                html += generateProjectGeneralHtml(block);
                break;
            case 'project_technical_section':
                html += generateProjectTechnicalHtml(block);
                break;
            case 'impacts':
                html += generateImpactsHtml(block);
                break;
            // ── BLOQUES CURRICULARES OFICIALES PEA (SECCIONES A a K) ──
            case 'pea_general_section':
                html += generatePeaGeneralHtml(block);
                break;
            case 'pea_objective_section':
                html += generatePeaObjectiveHtml(block);
                break;
            case 'pea_prerequisites_section':
                html += generatePeaPrerequisitesHtml(block);
                break;
            case 'pea_career_outcomes_section':
                html += generatePeaCareerOutcomesHtml(block);
                break;
            case 'pea_subject_outcomes_section':
                html += generatePeaSubjectOutcomesHtml(block);
                break;
            case 'pea_characterization_section':
                html += generatePeaCharacterizationHtml(block);
                break;
            case 'pea_competencies_rda_section':
                html += generatePeaCompetenciesRdaHtml(block);
                break;
            case 'pea_contents_section':
                html += generatePeaContentsHtml(block);
                break;
            case 'pea_methodology_section':
                html += generatePeaMethodologyHtml(block);
                break;
            case 'pea_resources_section':
                html += generatePeaResourcesHtml(block);
                break;
            case 'pea_evaluation_section':
                html += generatePeaEvaluationHtml(block);
                break;
            case 'pea_bibliography_section':
                html += generatePeaBibliographyHtml(block);
                break;
            case 'pea_signatures_section':
                html += generatePeaSignaturesHtml(block);
                break;
            default:
                break;
        }
    }

    html += '\n</div>';
    return html.trim();
};

export const generateFullHtml = generateHtmlFromBlocks;

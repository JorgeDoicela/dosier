/**
 * @file peaGenerators.ts
 * @description Generadores de HTML semántico con variables Scriban para los bloques del PEA oficial (ISTPET).
 */

import type { DocumentBlock } from '../../types';
import { resolveHeaderColor, getContrastFg } from '../../components/properties/SharedColorPicker';

/** a) Datos Generales de la Asignatura + Cabecera Oficial */
export const generatePeaGeneralHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const title = c.title || block.title || 'a) DATOS GENERALES DE LA ASIGNATURA:';
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    let headerHtml = '';
    if (c.showHeader !== false) {
        const instName = c.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO "MAYOR PEDRO TRAVERSARI"';
        const instAddr = c.institutionAddress || 'MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)';
        const docTitle = c.documentTitle || 'PROGRAMA DE ESTUDIO DE LA ASIGNATURA';

        headerHtml = `
  <table style="width: 100%; border-collapse: collapse; ${borderCss} margin-bottom: 0; background: #ffffff;">
    <tr>
      <td style="width: 28%; ${borderCss} padding: 8px; text-align: center; vertical-align: middle;">
        <div style="font-weight: 900; font-size: 16pt; color: #1e2a4a; line-height: 1;">IST</div>
        <div style="font-size: 7pt; font-weight: bold; color: #334155; line-height: 1.1; text-transform: uppercase;">
          TECNOLÓGICO<br/>TRAVERSARI
        </div>
      </td>
      <td style="padding: 6px 10px; text-align: center; vertical-align: middle;">
        <div style="font-size: 9.5pt; font-weight: bold; text-transform: uppercase; color: #000000;">${instName}</div>
        <div style="font-size: 7.5pt; font-weight: 600; text-transform: uppercase; color: #1e293b; margin-top: 2px;">${instAddr}</div>
        <div style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase; color: #000000; margin-top: 4px;">${docTitle}</div>
      </td>
    </tr>
  </table>`;
    }

    return `
<div class="pea-section-general" style="margin-bottom: 8px; font-family: inherit;">
  ${headerHtml}
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss} border-top: none;">
    ${title}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <tbody>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; width: 42%;">${c.customLabel_showAsignatura || 'Nombre de la asignatura:'}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default nombre_asignatura asignatura}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showCodigoCarrera || 'Código de carrera:'}</td>
        <td style="${borderCss} padding: 4px 6px; font-family: monospace;">{{default codigo_carrera ""}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showCarrera || 'Carrera:'}</td>
        <td style="${borderCss} padding: 4px 6px; text-transform: uppercase;">{{default carrera ""}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showModalidad || 'Modalidad de estudio:'}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default modalidad "Presencial"}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showUnidadOrganizacion || 'Unidad de Organización Curricular:'}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default unidad_organizacion "Unidad Profesional"}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showPeriodo || 'Periodo académico:'}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default periodo ""}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showSemestre || 'Semestre:'}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default semestre ""}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showTotalHoras || 'Número de horas de la asignatura:'}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default total_horas_asignatura 0}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">${c.customLabel_showCreditos || 'Número de créditos:'}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default creditos 0}}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; vertical-align: top;">
          ${c.customLabel_showOrganizacionAprendizaje || 'Organización de aprendizajes por modalidad, número de horas destinadas a cada componente'}
        </td>
        <td style="padding: 0; vertical-align: top;">
          <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
            <tr>
              <td style="${borderCss} border-left: none; border-top: none; padding: 4px 6px; width: 65%;">Total horas de contacto docente:</td>
              <td style="${borderCss} border-left: none; border-top: none; border-right: none; padding: 4px 6px; font-weight: bold;">{{default horas_contacto_docente 0}}</td>
            </tr>
            <tr>
              <td style="${borderCss} border-left: none; border-top: none; padding: 4px 6px;">Total horas de aprendizaje experimental:</td>
              <td style="${borderCss} border-left: none; border-top: none; border-right: none; padding: 4px 6px; font-weight: bold;">{{default horas_practico_experimental 0}}</td>
            </tr>
            <tr>
              <td style="${borderCss} border-left: none; border-top: none; border-bottom: none; padding: 4px 6px;">Total horas de practico autónomo:</td>
              <td style="border: none; padding: 4px 6px; font-weight: bold;">{{default horas_autonomo 0}}</td>
            </tr>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</div>`;
};

/** b) Objetivo de la Asignatura (Bloque Atómico) */
export const generatePeaObjectiveHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-objective" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.objetivoLabel || 'b) OBJETIVO DE LA ASIGNATURA'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt;">
    {{default objetivo_asignatura ""}}
  </div>
</div>`;
};

/** c) Prerrequisitos (Bloque Atómico) */
export const generatePeaPrerequisitesHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-prerequisites" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.prerrequisitosLabel || 'c) PRERREQUISITOS:'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <thead>
      <tr style="background: #f8fafc; font-weight: bold;">
        <th style="${borderCss} padding: 4px 6px; width: 50%; text-align: left;">${c.prerrequisitosColAsignatura || 'Asignatura'}</th>
        <th style="${borderCss} padding: 4px 6px; width: 50%; text-align: left;">${c.prerrequisitosColObservacion || 'Observación'}</th>
      </tr>
    </thead>
    <tbody>
      {{#each prerrequisitos}}
      <tr>
        <td style="${borderCss} padding: 4px 6px;">{{this.asignatura}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{this.observacion}}</td>
      </tr>
      {{/each}}
      {{#unless prerrequisitos}}
      <tr>
        <td style="${borderCss} padding: 4px 6px; color: #64748b; font-style: italic;">[Sin prerrequisitos registrados]</td>
        <td style="${borderCss} padding: 4px 6px; color: #64748b; font-style: italic;">Aprobada</td>
      </tr>
      {{/unless}}
    </tbody>
  </table>
</div>`;
};

/** d) Resultados de Aprendizaje de la Carrera (Bloque Atómico) */
export const generatePeaCareerOutcomesHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-career-outcomes" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.rdaCarreraLabel || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt;">
    {{default resultados_carrera ""}}
  </div>
</div>`;
};

/** e) Resultados de Aprendizaje de la Asignatura (Bloque Atómico) */
export const generatePeaSubjectOutcomesHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-subject-outcomes" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.rdaAsignaturaLabel || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt;">
    {{default resultados_asignatura ""}}
  </div>
</div>`;
};

/** [Legacy] b) Objetivo y c) Prerrequisitos */
export const generatePeaCharacterizationHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-characterization" style="margin-bottom: 8px; font-family: inherit;">
  <!-- b) OBJETIVO -->
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.objetivoLabel || 'b) OBJETIVO DE LA ASIGNATURA'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt; margin-bottom: 8px;">
    {{default objetivo_asignatura ""}}
  </div>

  <!-- c) PRERREQUISITOS -->
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.prerrequisitosLabel || 'c) PRERREQUISITOS:'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <thead>
      <tr style="background: #f8fafc; font-weight: bold;">
        <th style="${borderCss} padding: 4px 6px; width: 50%; text-align: left;">${c.prerrequisitosColAsignatura || 'Asignatura'}</th>
        <th style="${borderCss} padding: 4px 6px; width: 50%; text-align: left;">${c.prerrequisitosColObservacion || 'Observación'}</th>
      </tr>
    </thead>
    <tbody>
      {{#each prerrequisitos}}
      <tr>
        <td style="${borderCss} padding: 4px 6px;">{{this.asignatura}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{this.observacion}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>`;
};

/** [Legacy] d) RDAs Carrera y e) RDAs Asignatura */
export const generatePeaCompetenciesRdaHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-rdas" style="margin-bottom: 8px; font-family: inherit;">
  <!-- d) RDAS CARRERA -->
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.rdaCarreraLabel || 'd)RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt; margin-bottom: 8px;">
    {{default resultados_carrera ""}}
  </div>

  <!-- e) RDAS ASIGNATURA -->
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.rdaAsignaturaLabel || 'e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:'}
  </div>
  <div style="${borderCss} border-top: none; padding: 6px 8px; min-height: 48px; background: #ffffff; font-size: 8pt;">
    {{default resultados_asignatura ""}}
  </div>
</div>`;
};

/** f) Contenidos de Enseñanza */
export const generatePeaContentsHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const subHeaderBg = c.subHeaderColor || '#bdd7ee';
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-contents" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'f) CONTENIDOS DE ENSEÑANZA:'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <thead>
      <tr style="background-color: ${headerBg}; color: ${fg}; font-weight: bold; text-align: center;">
        <th style="${borderCss} padding: 4px; width: 6%;">No</th>
        <th style="${borderCss} padding: 4px;">UNIDADES DE ESTUDIO Y SUS CONTENIDOS</th>
      </tr>
    </thead>
    <tbody>
      {{#each unidades}}
      <tr style="page-break-inside: avoid;">
        <td style="${borderCss} padding: 8px 4px; text-align: center; font-weight: bold; font-size: 11pt; vertical-align: middle;">
          {{this.numero}}
        </td>
        <td style="padding: 0; vertical-align: top;">
          <div style="background-color: ${subHeaderBg}; color: #000000; padding: 4px 8px; font-weight: bold; display: flex; justify-content: space-between; border-bottom: 1px solid #000000;">
            <span>UNIDAD {{this.numero}}: {{this.nombre}}</span>
            <span>Total de horas por unidad: {{this.total_horas}}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 7.5pt; background-color: ${subHeaderBg}; border-bottom: 1px solid #000000;">
            <tr>
              <td style="${borderCss} border-left: none; border-top: none; padding: 3px 6px; width: 33.3%;">Horas contacto con el docente: <strong>{{this.horas_cd}}</strong></td>
              <td style="${borderCss} border-top: none; padding: 3px 6px; width: 33.3%;">Horas Práctico-experimental: <strong>{{this.horas_ape}}</strong></td>
              <td style="${borderCss} border-right: none; border-top: none; padding: 3px 6px; width: 33.3%;">Horas de aprendizaje autónomo: <strong>{{this.horas_ta}}</strong></td>
            </tr>
          </table>
          <div style="padding: 6px 8px; font-size: 8pt; min-height: 40px; background: #ffffff;">
            {{this.contenidos}}
          </div>
        </td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>`;
};

/** g) Metodología de Enseñanza */
export const generatePeaMethodologyHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-methodology" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'g) METODOLOGÍA DE ENSEÑANZA'}
  </div>
  <div style="${borderCss} border-top: none; background: #ffffff;">
    <div style="background: #e2e8f0; padding: 3px 8px; font-weight: bold; font-size: 8pt; border-bottom: 1px solid #000000;">
      ${c.estrategiasLabel || 'ESTRATEGIAS METODOLÓGICAS'}
    </div>
    <div style="padding: 6px 8px; min-height: 40px; font-size: 8pt; border-bottom: 1px solid #000000;">
      {{default metodologia_propuesta metodologia}}
    </div>
    <div style="background: #e2e8f0; padding: 3px 8px; font-weight: bold; font-size: 8pt; border-bottom: 1px solid #000000;">
      ${c.recursosLabel || 'RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE'}
    </div>
    <div style="padding: 6px 8px; min-height: 40px; font-size: 8pt;">
      {{default recursos_didacticos ""}}
    </div>
  </div>
</div>`;
};

/** h) Actividades Prácticas */
export const generatePeaResourcesHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-practicas" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'h) ACTIVIDADES PRÁCTICAS'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <thead>
      <tr style="background: #f8fafc; font-weight: bold;">
        <th style="${borderCss} padding: 4px 6px; width: 20%; text-align: center;">${c.colUnidadLabel || 'Unidad'}</th>
        <th style="${borderCss} padding: 4px 6px; text-align: left;">${c.colPracticaLabel || 'Nombre de la práctica y caracterización de la actividad'}</th>
      </tr>
    </thead>
    <tbody>
      {{#each actividades_practicas}}
      <tr>
        <td style="${borderCss} padding: 4px 6px; text-align: center; font-weight: bold;">{{this.unidad}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{this.nombre_caracterizacion}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</div>`;
};

/** i) Evaluación del Aprendizaje */
export const generatePeaEvaluationHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const tableHeaderBg = c.tableHeaderBg || '#bdd7ee';
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-evaluation" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'i) EVALUACIÓN DEL APRENDIZAJE'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff;">
    <thead>
      <tr style="background-color: ${tableHeaderBg}; color: #000000; font-weight: bold; text-align: center;">
        <th style="${borderCss} padding: 4px 6px; width: 22%; text-align: left;">${c.colNotasLabel || 'Notas'}</th>
        <th style="${borderCss} padding: 4px 6px; width: 58%;">${c.colTipoLabel || 'TIPO DE EVALUACIÓN'}</th>
        <th style="${borderCss} padding: 4px 6px; width: 20%;">${c.colCalifLabel || 'CALIFICACION'}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="${borderCss} padding: 5px 6px; font-weight: bold;">NOTA PARCIAL 1</td>
        <td style="${borderCss} padding: 5px 6px;">${c.parcial1Desc || 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)'}</td>
        <td style="${borderCss} padding: 5px 6px; text-align: center; font-weight: bold;">${c.parcial1Nota || '10,00'}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 5px 6px; font-weight: bold;">NOTA PARCIAL 2</td>
        <td style="${borderCss} padding: 5px 6px;">${c.parcial2Desc || 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)'}</td>
        <td style="${borderCss} padding: 5px 6px; text-align: center; font-weight: bold;">${c.parcial2Nota || '10,00'}</td>
      </tr>
      <tr>
        <td style="${borderCss} padding: 5px 6px; font-weight: bold;">EVALUACIÓN FINAL</td>
        <td style="${borderCss} padding: 5px 6px;">${c.finalDesc || 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)'}</td>
        <td style="${borderCss} padding: 5px 6px; text-align: center; font-weight: bold;">${c.finalNota || '10,00'}</td>
      </tr>
    </tbody>
  </table>
</div>`;
};

/** j) Bibliografía */
export const generatePeaBibliographyHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-bibliography" style="margin-bottom: 8px; font-family: inherit;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'j) BIBLIOGRAFÍA'}
  </div>
  <div style="${borderCss} border-top: none; background: #ffffff;">
    <div style="background: #e2e8f0; padding: 3px 8px; font-weight: bold; font-size: 8pt; border-bottom: 1px solid #000000; text-align: center;">
      ${c.basicaLabel || 'Bibliografía básica'}
    </div>
    <div style="padding: 6px 8px; min-height: 40px; font-size: 8pt; border-bottom: 1px solid #000000;">
      {{default bibliografia_basica ""}}
    </div>
    <div style="background: #e2e8f0; padding: 3px 8px; font-weight: bold; font-size: 8pt; border-bottom: 1px solid #000000; text-align: center;">
      ${c.consultaLabel || 'Bibliografía de consulta'}
    </div>
    <div style="padding: 6px 8px; min-height: 40px; font-size: 8pt;">
      {{default bibliografia_consulta ""}}
    </div>
  </div>
</div>`;
};

/** k) Firmas de Responsabilidad */
export const generatePeaSignaturesHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const headerBg = resolveHeaderColor(c.headerColor || '#1e2a4a');
    const fg = getContrastFg(headerBg);
    const borderCss = 'border: 1px solid #000000;';

    return `
<div class="pea-section-signatures" style="margin-top: 12px; font-family: inherit; page-break-inside: avoid;">
  <div style="background-color: ${headerBg}; color: ${fg}; padding: 4px 8px; font-weight: bold; font-size: 8.5pt; text-transform: uppercase; ${borderCss}">
    ${c.title || 'k) FIRMAS DE RESPONSABILIDAD'}
  </div>
  <table style="width: 100%; border-collapse: collapse; ${borderCss} border-top: none; font-size: 8pt; background: #ffffff; text-align: center;">
    <thead>
      <tr style="background: #f8fafc; font-weight: bold;">
        <th style="${borderCss} padding: 4px 6px; width: 20%; text-align: left;">DESCRIPCIÓN</th>
        <th style="${borderCss} padding: 4px 6px; width: 20%;">ELABORADO</th>
        <th style="${borderCss} padding: 4px 6px; width: 20%;">REVISADO</th>
        <th style="${borderCss} padding: 4px 6px; width: 20%;">REVISADO</th>
        <th style="${borderCss} padding: 4px 6px; width: 20%;">APROBADO</th>
      </tr>
    </thead>
    <tbody>
      <!-- FIRMA -->
      <tr style="height: 55px;">
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; text-align: left; vertical-align: middle;">FIRMA</td>
        <td style="${borderCss} padding: 4px 6px; vertical-align: bottom;">{{default firma_docente_base64 ""}}</td>
        <td style="${borderCss} padding: 4px 6px; vertical-align: bottom;">{{default firma_coordinador_carrera_base64 ""}}</td>
        <td style="${borderCss} padding: 4px 6px; vertical-align: bottom;">{{default firma_coordinador_academico_base64 ""}}</td>
        <td style="${borderCss} padding: 4px 6px; vertical-align: bottom;">{{default firma_vicerrector_base64 ""}}</td>
      </tr>
      <!-- NOMBRE -->
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; text-align: left;">NOMBRE</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default docente_elaborador "${c.nombreElaborado || ''}"}}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default coordinador_carrera "${c.nombreRevisado1 || ''}"}}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default coordinador_academico "${c.nombreRevisado2 || ''}"}}</td>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold;">{{default vicerrector "${c.nombreAprobado || ''}"}}</td>
      </tr>
      <!-- CARGO -->
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; text-align: left;">CARGO</td>
        <td style="${borderCss} padding: 4px 6px;">${c.cargoElaborado || 'Docente'}</td>
        <td style="${borderCss} padding: 4px 6px;">${c.cargoRevisado1 || 'Coordinador de Carrera'}</td>
        <td style="${borderCss} padding: 4px 6px;">${c.cargoRevisado2 || 'Coordinador Académico'}</td>
        <td style="${borderCss} padding: 4px 6px;">${c.cargoAprobado || 'Vicerrectorado'}</td>
      </tr>
      <!-- FECHA -->
      <tr>
        <td style="${borderCss} padding: 4px 6px; font-weight: bold; text-align: left;">FECHA</td>
        <td style="${borderCss} padding: 4px 6px;">{{default fecha_elaborado ""}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default fecha_revisado_carrera ""}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default fecha_revisado_academico ""}}</td>
        <td style="${borderCss} padding: 4px 6px;">{{default fecha_aprobado ""}}</td>
      </tr>
    </tbody>
  </table>
</div>`;
};

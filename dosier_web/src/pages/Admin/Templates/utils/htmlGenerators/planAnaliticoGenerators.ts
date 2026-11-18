/**
 * @file planAnaliticoGenerators.ts
 * @description Generadores HTML para los bloques del Formato Plan Analítico 2026.
 * Produce HTML compatible con iText 9 / Puppeteer para compilación a PDF de alta fidelidad.
 */

import type { DocumentBlock } from '../../types';

function cleanVal(v: string | undefined): string {
    if (!v) return '';
    if (/^{{\s*[\w_]+\s*}}$/i.test(v.trim())) return '';
    return v;
}

export function generatePlanAnaliticoGeneralHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const rawDocTitle = c.documentTitle || 'PLAN ANALÍTICO DE LA ASIGNATURA: NOMBRE DE LA ASIGNATURA';
    const docTitle = rawDocTitle.replace(/{{\s*[\w_]+\s*}}/gi, 'NOMBRE DE LA ASIGNATURA');
    const secTitle = c.sectionTitle || block.title || '1.  DATOS INFORMATIVOS';
    const headerText = c.headerText || 'Información General';
    const headerColor = c.headerColor || '#1e2a4a';
    const fields = c.fields && Array.isArray(c.fields) && c.fields.length >= 10 ? c.fields : [
        { label: 'Código de Carrera:', value: '' },
        { label: 'Asignatura:', value: '' },
        { label: 'Carrera', value: '' },
        { label: 'Periodo Académico:', value: '' },
        { label: 'Modalidad:', value: '' },
        { label: 'Nivel:', value: '' },
        { label: 'Créditos:', value: '' },
        { label: 'Profesor Responsable de la Asignatura:', value: '' },
        { label: 'Horario de tutoría académica:', value: '' },
        { label: 'E-mail del docente', value: '' }
    ];

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 16px;">
            <h2 style="font-size: 13pt; font-weight: bold; color: #334155; text-transform: uppercase; margin: 0;">${docTitle}</h2>
        </div>
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff;">
                    <th colspan="4" style="padding: 6px 10px; text-align: left; font-weight: bold; font-size: 10pt; border-bottom: 1.5px solid #000;">${headerText}</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-top: 1px solid #000;">
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[0]?.label || 'Código de Carrera:'}</td>
                    <td style="width: 30%; padding: 5px 8px; border-right: 1px solid #000;">${cleanVal(fields[0]?.value)}</td>
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[1]?.label || 'Asignatura:'}</td>
                    <td style="width: 30%; padding: 5px 8px;">${cleanVal(fields[1]?.value)}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[2]?.label || 'Carrera'}</td>
                    <td style="width: 30%; padding: 5px 8px; border-right: 1px solid #000;">${cleanVal(fields[2]?.value)}</td>
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[3]?.label || 'Periodo Académico:'}</td>
                    <td style="width: 30%; padding: 5px 8px;">${cleanVal(fields[3]?.value)}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[4]?.label || 'Modalidad:'}</td>
                    <td style="width: 30%; padding: 5px 8px; border-right: 1px solid #000;">${cleanVal(fields[4]?.value)}</td>
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[5]?.label || 'Nivel:'}</td>
                    <td style="width: 30%; padding: 5px 8px;">${cleanVal(fields[5]?.value)}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[6]?.label || 'Créditos:'}</td>
                    <td style="width: 30%; padding: 5px 8px; border-right: 1px solid #000;">${cleanVal(fields[6]?.value)}</td>
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[7]?.label || 'Profesor Responsable de la Asignatura:'}</td>
                    <td style="width: 30%; padding: 5px 8px;">${cleanVal(fields[7]?.value)}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[8]?.label || 'Horario de tutoría académica:'}</td>
                    <td style="width: 30%; padding: 5px 8px; border-right: 1px solid #000;">${cleanVal(fields[8]?.value)}</td>
                    <td style="width: 20%; padding: 5px 8px; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${fields[9]?.label || 'E-mail del docente'}</td>
                    <td style="width: 30%; padding: 5px 8px;">${cleanVal(fields[9]?.value)}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
}

export function generatePlanAnaliticoObjectiveHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '2.  OBJETIVO GENERAL';
    const rawHtml = c.html || '';
    const textHtml = (!rawHtml || rawHtml.includes('{{objetivo_general}}'))
        ? '<p>Desarrollar competencias profesionales y destrezas técnicas en el estudiantado mediante la aplicación de metodologías activas, prácticas experimentales e investigación aplicada alineadas a las necesidades del entorno productivo y los lineamientos del ISTPET.</p>'
        : rawHtml;

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <div style="font-size: 9.5pt; line-height: 1.6; text-align: justify; color: #1e293b;">
            ${textHtml}
        </div>
    </div>`;
}

export function generatePlanAnaliticoOutcomesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '3.  RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA';
    const headerColor = c.headerColor || '#1e2a4a';
    const outcomes = c.outcomes && Array.isArray(c.outcomes) ? c.outcomes : [];

    const rowsHtml = outcomes.map((item: any, idx: number) => `
        <tr style="border-top: 1px solid #000;">
            <td style="width: 8%; padding: 6px 8px; text-align: center; font-weight: bold; border-right: 1px solid #000; vertical-align: middle;">${item.id || idx + 1}</td>
            <td style="width: 62%; padding: 6px 10px; border-right: 1px solid #000; vertical-align: middle; line-height: 1.4;">${item.description || ''}</td>
            <td style="width: 30%; padding: 6px 8px; text-align: center; vertical-align: middle; font-weight: 600;">${item.level || 'Medio'}</td>
        </tr>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff;">
                    <th rowspan="2" style="width: 8%; padding: 6px 4px; text-align: center; font-weight: bold; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle;">ID</th>
                    <th rowspan="2" style="width: 62%; padding: 6px 10px; text-align: left; font-weight: bold; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle;">Al finalizar el curso, el/la estudiante estará en capacidad de</th>
                    <th style="width: 30%; padding: 6px 8px; text-align: center; font-weight: bold; border-bottom: 1px solid #000; vertical-align: middle;">Nivel de desarrollo de los resultados de aprendizaje</th>
                </tr>
                <tr style="background-color: ${headerColor}; color: #ffffff;">
                    <th style="padding: 4px 8px; text-align: center; font-weight: 600; font-size: 8.5pt; border-bottom: 1.5px solid #000; vertical-align: middle;">Inicial / Medio / Alto</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    </div>`;
}

export function generatePlanAnaliticoMatrixHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '4.  METODOLOGÍA, CONTENIDOS, RESULTADOS DE APRENDIZAJE';
    const headerColor = c.headerColor || '#1e2a4a';
    const weeksLabel = c.weeksLabel || '19 SEMANAS';
    const hours = c.hours || { docenciaHoras: '64', practicoHoras: '32', autonomoHoras: '64', totalHoras: '160' };
    const units = c.units && Array.isArray(c.units) && c.units.length > 0 ? c.units : [];

    let unitsHtml = '';
    for (const unit of units) {
        unitsHtml += `
        <tr style="background-color: #f1f5f9; font-weight: bold; font-size: 8.5pt; border-top: 1.5px solid #000; page-break-inside: avoid;">
            <td style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: left;">${unit.unitTitle}</td>
            <td style="padding: 5px 4px; border-right: 1px solid #000; border-bottom: 1px solid #000; background-color: #f1f5f9;"></td>
            <td colspan="4" style="padding: 5px 8px; border-right: 1px solid #000; border-bottom: 1px solid #000; text-align: center;">${unit.sectionTitle}</td>
            <td style="padding: 5px 4px; border-right: 1px solid #000; border-bottom: 1px solid #000; background-color: #f1f5f9;"></td>
            <td style="padding: 5px 4px; border-bottom: 1px solid #000; background-color: #f1f5f9;"></td>
        </tr>`;

        for (const row of (unit.rows || [])) {
            const isEval = row.isEvaluation;
            unitsHtml += `
            <tr style="border-top: 1px solid #000; font-size: 8pt; page-break-inside: avoid; ${isEval ? 'background-color: #fffbeb; font-weight: bold;' : ''}">
                <td style="width: 26%; padding: 5px 6px; border-right: 1px solid #000; vertical-align: middle;">${row.tema || ''}</td>
                <td style="width: 5%; padding: 5px 2px; border-right: 1px solid #000; text-align: center; vertical-align: middle; font-weight: bold;">${row.semana || ''}</td>
                <td style="width: 17%; padding: 5px 6px; border-right: 1px solid #000; vertical-align: middle; line-height: 1.3;">${row.docencia || ''}</td>
                <td style="width: 16%; padding: 5px 6px; border-right: 1px solid #000; vertical-align: middle; line-height: 1.3;">${row.practico || ''}</td>
                <td style="width: 17%; padding: 5px 6px; border-right: 1px solid #000; vertical-align: middle; line-height: 1.3; ${isEval ? 'text-align: center; font-weight: bold;' : ''}">${row.autonomo || ''}</td>
                <td style="width: 7%; padding: 5px 4px; border-right: 1px solid #000; text-align: center; vertical-align: middle;"></td>
                <td style="width: 6%; padding: 5px 4px; border-right: 1px solid #000; text-align: center; vertical-align: middle; font-weight: bold; color: #1e40af;">${row.rdaId || ''}</td>
                <td style="width: 6%; padding: 5px 4px; text-align: center; vertical-align: middle; font-weight: bold;">${row.calificacion || ''}</td>
            </tr>`;
        }
    }

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; page-break-inside: auto;">
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 8.5pt;">
            <thead style="display: table-header-group;">
                <tr style="background-color: ${headerColor}; color: #ffffff; text-align: center;">
                    <th rowspan="3" style="width: 26%; padding: 6px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold;">CONTENIDOS<br/>(UNIDADES Y TEMAS)</th>
                    <th rowspan="3" style="width: 5%; padding: 4px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold; font-size: 8pt;"><div style="transform: rotate(-90deg); white-space: nowrap;">${weeksLabel}</div></th>
                    <th colspan="3" style="width: 50%; padding: 6px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold;">ORGANIZACIÓN DEL APRENDIZAJE</th>
                    <th style="width: 7%; padding: 4px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold; font-size: 8pt;">TOTAL<br/>100%</th>
                    <th rowspan="3" style="width: 6%; padding: 4px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold; font-size: 7.5pt;"><div style="transform: rotate(-90deg); white-space: nowrap;">ID RDAs</div></th>
                    <th rowspan="3" style="width: 6%; padding: 4px; border-bottom: 1.5px solid #000; vertical-align: middle; font-weight: bold; font-size: 7.5pt;"><div style="transform: rotate(-90deg); white-space: nowrap;">CALIFICACIÓN</div></th>
                </tr>
                <tr style="background-color: ${headerColor}; color: #ffffff; text-align: center; font-size: 8pt;">
                    <th style="width: 17%; padding: 4px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle;">DOCENCIA<br/><span style="font-size: 7pt; font-weight: normal; color: #dbeafe;">Descripción de la Metodología a aplicar</span></th>
                    <th style="width: 16%; padding: 4px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle;">PRÁCTICO EXPERIMENTAL<br/><span style="font-size: 7pt; font-weight: normal; color: #dbeafe;">Descripción de la práctica</span></th>
                    <th style="width: 17%; padding: 4px 6px; border-right: 1px solid #000; border-bottom: 1px solid #000; vertical-align: middle;">ACTIVIDADES AUTÓNOMAS<br/><span style="font-size: 7pt; font-weight: normal; color: #dbeafe;">Tareas o actividades a evaluar</span></th>
                    <th style="padding: 4px; border-right: 1px solid #000; border-bottom: 1px solid #000; background-color: #cbd5e1; color: #000; font-size: 8pt;">HORAS</th>
                </tr>
                <tr style="background-color: #f1f5f9; color: #000000; text-align: center; font-size: 8pt;">
                    <td style="padding: 3px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; font-family: monospace;">${hours.docenciaHoras} hrs</td>
                    <td style="padding: 3px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; font-family: monospace;">${hours.practicoHoras} hrs</td>
                    <td style="padding: 3px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; font-family: monospace;">${hours.autonomoHoras} hrs</td>
                    <td style="padding: 3px; border-right: 1px solid #000; border-bottom: 1.5px solid #000; font-weight: bold; font-size: 7pt; background-color: #e2e8f0;">HORAS<br/>SEMANA</td>
                </tr>
            </thead>
            <tbody>
                ${unitsHtml}
            </tbody>
        </table>
    </div>`;
}

export function generatePlanAnaliticoResourcesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '5.  RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE';
    const adaptacionCurricular = c.adaptacionCurricular || 'no_aplica';
    const textHtml = c.html || '<p>Entorno virtual institucional, laboratorios especializados y software educativo.</p>';

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <div style="margin-bottom: 12px;">
            <div style="font-weight: bold; font-size: 9.5pt; margin-bottom: 4px; color: #000000;">Adaptación Curricular</div>
            <table style="border-collapse: collapse; border: 1.5px solid #000; font-size: 8.5pt;">
                <tr>
                    <td style="padding: 3px 8px; border-right: 1px solid #000; font-weight: bold;">Aplica</td>
                    <td style="width: 24px; text-align: center; border-right: 1.5px solid #000; font-weight: bold;">${adaptacionCurricular === 'aplica' ? 'X' : ''}</td>
                    <td style="padding: 3px 8px; border-right: 1px solid #000; font-weight: bold;">No aplica</td>
                    <td style="width: 24px; text-align: center; font-weight: bold;">${adaptacionCurricular === 'no_aplica' ? 'X' : ''}</td>
                </tr>
            </table>
        </div>
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <div style="font-size: 9.5pt; line-height: 1.6; text-align: justify; color: #1e293b;">
            ${textHtml}
        </div>
    </div>`;
}

export function generatePlanAnaliticoEvaluationHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '6.  EVALUACIÓN';
    const headerColor = c.headerColor || '#1e2a4a';
    const items = c.items && Array.isArray(c.items) && c.items.length > 0 ? c.items : [
        { notaLabel: 'NOTA PARCIAL 1', tipoEvaluacion: 'ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)', calificacion: '10.00' },
        { notaLabel: 'NOTA PARCIAL 2', tipoEvaluacion: 'EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)', calificacion: '10.00' },
        { notaLabel: 'NOTA EXAMEN FINAL', tipoEvaluacion: 'EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)', calificacion: '10.00' }
    ];

    const rowsHtml = items.map((item: any) => `
        <tr style="border-top: 1px solid #000; font-size: 8.5pt;">
            <td style="width: 28%; padding: 6px 8px; border-right: 1px solid #000; font-weight: bold; vertical-align: middle;">${item.notaLabel}</td>
            <td style="width: 52%; padding: 6px 10px; border-right: 1px solid #000; vertical-align: middle; line-height: 1.4;">${item.tipoEvaluacion}</td>
            <td style="width: 20%; padding: 6px 8px; text-align: center; vertical-align: middle; font-family: monospace; font-weight: bold;">${item.calificacion}</td>
        </tr>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 9pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff; text-align: center;">
                    <th style="width: 28%; padding: 6px 8px; border-right: 1px solid #000; font-weight: bold;">NOTAS</th>
                    <th style="width: 52%; padding: 6px 10px; border-right: 1px solid #000; font-weight: bold;">TIPO DE EVALUACIÓN</th>
                    <th style="width: 20%; padding: 6px 8px; font-weight: bold;">CALIFICACIÓN</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    </div>`;
}

export function generatePlanAnaliticoSignaturesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.title || block.title || '7.  FIRMAS DE RESPONSABILIDAD';
    const headerColor = c.headerColor || '#1e2a4a';
    const signatureBoxHeight = c.signatureBoxHeight || 80;
    const rawSignatories = c.signatories && Array.isArray(c.signatories) && c.signatories.length === 3 ? c.signatories : [
        { header: 'ELABORADO', nombre: '', cargo: 'Docente', fecha: '' },
        { header: 'REVISADO', nombre: '', cargo: 'Coordinador de Carrera', fecha: '' },
        { header: 'APROBADO', nombre: '', cargo: 'Coordinador Académico', fecha: '' }
    ];

    const signatories = rawSignatories.map((s: any) => ({
        ...s,
        nombre: cleanVal(s.nombre),
        fecha: cleanVal(s.fecha)
    }));

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; page-break-inside: avoid;">
        <div style="margin-bottom: 10px;">
            <h3 style="font-size: 11pt; font-weight: bold; font-style: italic; color: #1e40af; margin: 0;">${secTitle}</h3>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 8.5pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff; text-align: center;">
                    <th style="width: 18%; padding: 6px; border-right: 1px solid #000; font-weight: bold;">DESCRIPCIÓN</th>
                    <th style="width: 27%; padding: 6px; border-right: 1px solid #000; font-weight: bold;">${signatories[0].header}</th>
                    <th style="width: 27%; padding: 6px; border-right: 1px solid #000; font-weight: bold;">${signatories[1].header}</th>
                    <th style="width: 28%; padding: 6px; font-weight: bold;">${signatories[2].header}</th>
                </tr>
            </thead>
            <tbody>
                <tr style="border-top: 1px solid #000;">
                    <td style="padding: 6px; border-right: 1px solid #000; font-weight: bold; background-color: #f8fafc; vertical-align: middle;">FIRMA</td>
                    <td style="height: ${signatureBoxHeight}px; border-right: 1px solid #000; vertical-align: middle; text-align: center;"></td>
                    <td style="height: ${signatureBoxHeight}px; border-right: 1px solid #000; vertical-align: middle; text-align: center;"></td>
                    <td style="height: ${signatureBoxHeight}px; vertical-align: middle; text-align: center;"></td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="padding: 6px; border-right: 1px solid #000; font-weight: bold; background-color: #f8fafc; vertical-align: middle;">NOMBRE</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; font-weight: 600; vertical-align: middle;">${signatories[0].nombre}</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; font-weight: 600; vertical-align: middle;">${signatories[1].nombre}</td>
                    <td style="padding: 6px; text-align: center; font-weight: 600; vertical-align: middle;">${signatories[2].nombre}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="padding: 6px; border-right: 1px solid #000; font-weight: bold; background-color: #f8fafc; vertical-align: middle;">CARGO</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; vertical-align: middle;">${signatories[0].cargo}</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; vertical-align: middle;">${signatories[1].cargo}</td>
                    <td style="padding: 6px; text-align: center; vertical-align: middle;">${signatories[2].cargo}</td>
                </tr>
                <tr style="border-top: 1px solid #000;">
                    <td style="padding: 6px; border-right: 1px solid #000; font-weight: bold; background-color: #f8fafc; vertical-align: middle;">FECHA</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; vertical-align: middle; color: #475569;">${signatories[0].fecha}</td>
                    <td style="padding: 6px; border-right: 1px solid #000; text-align: center; vertical-align: middle; color: #475569;">${signatories[1].fecha}</td>
                    <td style="padding: 6px; text-align: center; vertical-align: middle; color: #475569;">${signatories[2].fecha}</td>
                </tr>
            </tbody>
        </table>
    </div>`;
}

/**
 * @file tutoriasGenerators.ts
 * @description Generadores HTML para el Formato de Seguimiento de Tutorías Académicas 2026.
 * Produce HTML compatible con iText 9 / Puppeteer para compilación a PDF en orientación horizontal (Landscape A4).
 */

import type { DocumentBlock, TutoriaRowItem } from '../../types';

function cleanVal(v: string | undefined): string {
    if (!v) return '';
    if (/^{{\s*[\w_]+\s*}}$/i.test(v.trim())) return '';
    return v;
}

export function generateTutoriasHeaderHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const instName = c.institutionName || 'INSTITUTO SUPERIOR TECNOLÓGICO MAYOR PEDRO TRAVERSARI';
    const docTitle = c.documentTitle || 'SEGUIMIENTO DE TUTORÍAS ACADÉMICAS';
    const periodo = c.periodoAcademico || 'PERIODO ACADEMICO ABRIL - SEPTIEMBRE 2026';
    const docente = cleanVal(c.docenteNombre);
    const horario = cleanVal(c.horarioTutoria);
    const headerColor = c.headerColor || '#1e2a4a';

    return `
    <div class="tutorias-header" style="margin-bottom: 16px; font-family: 'Inter', Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #047857; padding-bottom: 8px; margin-bottom: 12px;">
            <tr>
                <td style="width: 20%; vertical-align: middle;">
                    <div style="font-weight: 900; font-size: 13pt; color: #1e2a4a; line-height: 1.1;">
                        IST <span style="color: #b8912e;">TECNOLÓGICO</span><br/>
                        PET <span style="color: #b8912e;">TRAVERSARI</span>
                    </div>
                </td>
                <td style="width: 80%; text-align: center; vertical-align: middle;">
                    <div style="font-size: 10pt; font-weight: bold; color: #1e2a4a; text-transform: uppercase;">${instName}</div>
                    <div style="font-size: 12pt; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-top: 2px;">${docTitle}</div>
                    <div style="font-size: 9.5pt; font-weight: bold; color: #dc2626; text-transform: uppercase; margin-top: 2px;">${periodo}</div>
                </td>
            </tr>
        </table>

        <table style="width: 480px; border-collapse: collapse; border: 1.5px solid #000; font-size: 8.5pt;">
            <tr style="border-bottom: 1px solid #000;">
                <td style="width: 150px; background-color: ${headerColor}; color: #ffffff; padding: 4px 8px; font-weight: bold;">DOCENTE:</td>
                <td style="padding: 4px 8px; font-weight: 600; color: #000000;">${docente}</td>
            </tr>
            <tr>
                <td style="width: 150px; background-color: ${headerColor}; color: #ffffff; padding: 4px 8px; font-weight: bold;">HORARIO DE TUTORÍA:</td>
                <td style="padding: 4px 8px; color: #000000;">${horario}</td>
            </tr>
        </table>
    </div>`;
}

export function generateTutoriasMatrixHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const headerColor = c.headerColor || '#1e2a4a';
    const rows: TutoriaRowItem[] = c.tutoriaRows && Array.isArray(c.tutoriaRows) && c.tutoriaRows.length > 0
        ? c.tutoriaRows
        : Array.from({ length: 7 }, (_, i) => ({
            id: `row-${i + 1}`,
            num: i + 1,
            fecha: '',
            semana: '',
            estudiantesConvocados: '',
            nivel: '',
            asignatura: '',
            carrera: '',
            modalidadTutoria: '',
            tipoTutoria: '',
            razonTutoria: '',
            observaciones: '',
            formaConvocatoria: ''
        }));

    const rowsHtml = rows.map((r, idx) => `
        <tr style="border-top: 1px solid #000;">
            <td style="padding: 4px; text-align: center; font-weight: bold; border-right: 1px solid #000; background-color: #f8fafc;">${r.num || idx + 1}</td>
            <td style="padding: 4px; text-align: center; border-right: 1px solid #000;">${cleanVal(r.fecha)}</td>
            <td style="padding: 4px; text-align: center; border-right: 1px solid #000;">${cleanVal(String(r.semana || ''))}</td>
            <td style="padding: 4px 6px; border-right: 1px solid #000; font-weight: 600;">${cleanVal(r.estudiantesConvocados)}</td>
            <td style="padding: 4px; text-align: center; border-right: 1px solid #000;">${cleanVal(r.nivel)}</td>
            <td style="padding: 4px 6px; border-right: 1px solid #000;">${cleanVal(r.asignatura)}</td>
            <td style="padding: 4px 6px; border-right: 1px solid #000;">${cleanVal(r.carrera)}</td>
            <td style="padding: 4px; text-align: center; border-right: 1px solid #000;">${cleanVal(r.modalidadTutoria)}</td>
            <td style="padding: 4px; text-align: center; border-right: 1px solid #000;">${cleanVal(r.tipoTutoria)}</td>
            <td style="padding: 4px 6px; border-right: 1px solid #000;">${cleanVal(r.razonTutoria)}</td>
            <td style="padding: 4px 6px; border-right: 1px solid #000;">${cleanVal(r.observaciones)}</td>
            <td style="padding: 4px 6px;">${cleanVal(r.formaConvocatoria)}</td>
        </tr>
    `).join('');

    return `
    <div class="tutorias-matrix" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif;">
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000; font-size: 7.5pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff; text-align: center; font-weight: bold;">
                    <th style="width: 3%; padding: 5px 2px; border-right: 1px solid #000;">Nº</th>
                    <th style="width: 6%; padding: 5px 2px; border-right: 1px solid #000;">Fecha</th>
                    <th style="width: 5%; padding: 5px 2px; border-right: 1px solid #000;">Semana</th>
                    <th style="width: 17%; padding: 5px 4px; border-right: 1px solid #000;">NOMBRES Y APELLIDOS<br/>ESTUDIANTES CONVOCADOS</th>
                    <th style="width: 5%; padding: 5px 2px; border-right: 1px solid #000;">NIVEL</th>
                    <th style="width: 12%; padding: 5px 4px; border-right: 1px solid #000;">ASIGNATURA</th>
                    <th style="width: 10%; padding: 5px 4px; border-right: 1px solid #000;">CARRERA</th>
                    <th style="width: 8%; padding: 5px 2px; border-right: 1px solid #000;">MODALIDAD DE TUTORIA</th>
                    <th style="width: 7%; padding: 5px 2px; border-right: 1px solid #000;">TIPOS DE TUTORIA</th>
                    <th style="width: 10%; padding: 5px 4px; border-right: 1px solid #000;">RAZÓN DE TUTORÍA</th>
                    <th style="width: 10%; padding: 5px 4px; border-right: 1px solid #000;">OBSERVACIONES</th>
                    <th style="width: 7%; padding: 5px 4px;">FORMA DE CONVOCATORIA</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    </div>`;
}

export function generateTutoriasSignaturesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const docenteCargo = c.docenteCargo || 'DOCENTE:';
    const docenteNombre = cleanVal(c.docenteNombre);
    const coordCargo = c.coordinadorCargo || 'REVISADO: COORDINADOR DE CARRERA';
    const coordNombre = cleanVal(c.coordinadorNombre);

    return `
    <div class="tutorias-signatures" style="margin-top: 36px; font-family: 'Inter', Arial, sans-serif; page-break-inside: avoid;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="width: 45%; text-align: center; vertical-align: bottom;">
                    <div style="width: 260px; margin: 0 auto; border-top: 1.5px solid #000; padding-top: 4px;">
                        <div style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase;">${docenteCargo}</div>
                        ${docenteNombre ? `<div style="font-size: 8pt; font-weight: 600; margin-top: 2px;">${docenteNombre}</div>` : ''}
                    </div>
                </td>
                <td style="width: 10%;"></td>
                <td style="width: 45%; text-align: center; vertical-align: bottom;">
                    <div style="width: 290px; margin: 0 auto; border-top: 1.5px solid #000; padding-top: 4px;">
                        <div style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase;">${coordCargo}</div>
                        ${coordNombre ? `<div style="font-size: 8pt; font-weight: 600; margin-top: 2px;">${coordNombre}</div>` : ''}
                    </div>
                </td>
            </tr>
        </table>
    </div>`;
}

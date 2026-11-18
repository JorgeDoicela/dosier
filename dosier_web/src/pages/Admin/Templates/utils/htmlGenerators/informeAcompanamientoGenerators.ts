/**
 * @file informeAcompanamientoGenerators.ts
 * @description Generadores HTML para los bloques del Formato Informe de Acompañamiento Académico de Carrera 2026.
 * Produce HTML compatible con iText 9 / Puppeteer para compilación a PDF de alta fidelidad.
 */

import type {
    DocumentBlock,
    DocenteTutorRowItem,
    DocenteAporteRowItem,
    ReunionCarreraConfig,
    ActividadCoordinadorRowItem,
    EstudianteNivelRowItem,
    GestionDocenteRowItem,
    AcompanamientoObservacionRowItem,
    ConclusionRecomendacionItem,
    FirmaTutorNivelItem,
    FirmaAutoridadItem
} from '../../types';

function cleanVal(v: string | undefined): string {
    if (!v) return '';
    if (/^{{\s*[\w_]+\s*}}$/i.test(v.trim())) return '';
    return v;
}

/**
 * 1. DATOS INFORMATIVOS
 */
export function generateInformeAcompDatosInformativosHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const titulo = c.informeTitulo || 'INFORME DE ACOMPAÑAMIENTO ACADÉMICO DE CARRERA';
    const secTitle = c.sectionTitle || block.title || '1.  Datos informativos:';
    const coordinador = cleanVal(c.informeCoordinador);
    const carrera = cleanVal(c.informeCarrera);
    const periodo = cleanVal(c.informePeriodo);
    const parcial = cleanVal(c.informeParcial) || 'Parcial 1/ Modular';
    const reportaA = cleanVal(c.informeReportaA) || 'UNIDAD ACADÉMICA';
    const fecha = cleanVal(c.informeFechaPresentacion);

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 10pt; color: #0f172a;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 12pt; font-weight: bold; text-transform: uppercase; margin: 0; color: #000000; letter-spacing: 0.5px;">${titulo}</h1>
        </div>
        <div style="margin-bottom: 12px;">
            <h2 style="font-size: 10.5pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>
        <ul style="list-style-type: disc; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li><strong>Nombre del coordinador:</strong> ${coordinador || '_______________________________________'}</li>
            <li><strong>Carrera:</strong> ${carrera || '_______________________________________'}</li>
            <li><strong>Periodo académico:</strong> ${periodo || '_______________________________________'}</li>
            <li><strong>Parcial:</strong> <span style="color: #dc2626; font-weight: bold;">${parcial}</span></li>
            <li><strong>Reporta a:</strong> <span style="text-transform: uppercase; font-weight: bold;">${reportaA}</span></li>
            <li><strong>Fecha de presentación del informe:</strong> ${fecha || '_______________________________________'}</li>
        </ul>
    </div>
    `;
}

/**
 * 2. NÓMINA DE DOCENTES TUTORES
 */
export function generateInformeAcompNominaTutoresHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.sectionTitle || block.title || '2.  Nómina de docentes tutores:';
    const rows: DocenteTutorRowItem[] = Array.isArray(c.tutoresRows) && c.tutoresRows.length > 0
        ? c.tutoresRows
        : [
            { id: '1', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
            { id: '2', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
            { id: '3', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
            { id: '4', tutor: '', nivel: '', actividad: '', medioVerificacion: '' },
            { id: '5', tutor: '', nivel: '', actividad: '', medioVerificacion: '' }
        ];

    const rowsHtml = rows.map((r) => `
        <tr style="border-top: 1px solid #000000;">
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 30%;">${cleanVal(r.tutor)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; text-align: center; width: 15%;">${cleanVal(r.nivel)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 30%;">${cleanVal(r.actividad)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 25%;">${cleanVal(r.medioVerificacion)}</td>
        </tr>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 9.5pt; color: #0f172a;">
        <div style="margin-bottom: 10px;">
            <h2 style="font-size: 10.5pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 9pt;">
            <thead>
                <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Tutor</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; font-weight: bold;">Nivel</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Actividad</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Medio de verificación</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    </div>
    `;
}

/**
 * 3. NÓMINA DE DOCENTES QUE APORTAN A LA CARRERA
 */
export function generateInformeAcompNominaDocentesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.sectionTitle || block.title || '3.  Nómina de docentes que aportan a la carrera:';
    const rows: DocenteAporteRowItem[] = Array.isArray(c.docentesAporteRows) && c.docentesAporteRows.length > 0
        ? c.docentesAporteRows
        : [
            { id: '1', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
            { id: '2', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
            { id: '3', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' },
            { id: '4', nomina: '', asignaturas: '', nivel: '', jornadaTrabajo: '', accionesMejora: '', accionesCorrectivas: '' }
        ];

    const rowsHtml = rows.map((r) => `
        <tr style="border-top: 1px solid #000000;">
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 18%; font-weight: 500;">${cleanVal(r.nomina)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 20%;">${cleanVal(r.asignaturas)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; text-align: center; width: 10%;">${cleanVal(r.nivel)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; text-align: center; width: 14%;">${cleanVal(r.jornadaTrabajo)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 19%;">${cleanVal(r.accionesMejora)}</td>
            <td style="border: 1px solid #000000; padding: 6px 8px; vertical-align: top; width: 19%;">${cleanVal(r.accionesCorrectivas)}</td>
        </tr>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 9pt; color: #0f172a;">
        <div style="margin-bottom: 10px;">
            <h2 style="font-size: 10.5pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt;">
            <thead>
                <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Nómina</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Asignaturas</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; font-weight: bold;">Nivel</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; font-weight: bold;">Jornada de trabajo</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Acciones de mejora (dentro del periodo)</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; font-weight: bold;">Acciones correctivas (final del periodo)</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    </div>
    `;
}

/**
 * 4. GESTIÓN ACADÉMICA DE LA CARRERA (5 Sub-Secciones)
 */
export function generateInformeAcompGestionAcademicaHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.sectionTitle || block.title || '4.  Gestión Académica de la carrera';

    // 4.1 Reuniones
    const reuniones: ReunionCarreraConfig = c.reuniones || {};

    // 4.2 Actividades
    const actividades: ActividadCoordinadorRowItem[] = Array.isArray(c.actividadesCoordinador) && c.actividadesCoordinador.length > 0
        ? c.actividadesCoordinador
        : [
            { id: '1', actividad: '', productoEsperado: '', estado: '' },
            { id: '2', actividad: '', productoEsperado: '', estado: '' }
        ];

    const actividadesHtml = actividades.map((a) => `
        <tr style="border-top: 1px solid #000000;">
            <td style="border: 1px solid #000000; padding: 5px 8px; width: 40%;">${cleanVal(a.actividad)}</td>
            <td style="border: 1px solid #000000; padding: 5px 8px; width: 40%;">${cleanVal(a.productoEsperado)}</td>
            <td style="border: 1px solid #000000; padding: 5px 8px; text-align: center; width: 20%;">${cleanVal(a.estado)}</td>
        </tr>
    `).join('');

    // 4.3 Estudiantes
    const estudiantes: EstudianteNivelRowItem[] = Array.isArray(c.estudiantesNivel) && c.estudiantesNivel.length > 0
        ? c.estudiantesNivel
        : [
            { id: '1', nivel: '1º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' },
            { id: '2', nivel: '2º Nivel', matriculados: '', retirados: '', problemasAsistencia: '', problemasRendimiento: '', noRindieronExamen: '', bienestarInstitucional: '', becados: '' }
        ];

    const estudiantesHtml = estudiantes.map((e) => `
        <tr style="border-top: 1px solid #000000; text-align: center;">
            <td style="border: 1px solid #000000; padding: 4px 6px; font-weight: bold; width: 12%;">${cleanVal(e.nivel)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 13%;">${cleanVal(String(e.matriculados ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 13%;">${cleanVal(String(e.retirados ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 12%;">${cleanVal(String(e.problemasAsistencia ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 12%;">${cleanVal(String(e.problemasRendimiento ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 13%;">${cleanVal(String(e.noRindieronExamen ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 13%;">${cleanVal(String(e.bienestarInstitucional ?? ''))}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 12%;">${cleanVal(String(e.becados ?? ''))}</td>
        </tr>
    `).join('');

    // 4.4 Gestión docente
    const docentes: GestionDocenteRowItem[] = Array.isArray(c.gestionDocentes) && c.gestionDocentes.length > 0
        ? c.gestionDocentes
        : [
            { id: '1', docente: '', horasContacto: '', evaPermanente: '', horasTutoria: '', estudiantesTutoria: '', horasVinculacion: '', horasInvestigacion: '', horasPracticas: '', horasTitulacion: '', asignaturas: '', estudiantesProblemasRendimiento: '' }
        ];

    const docentesHtml = docentes.map((d) => `
        <tr style="border-top: 1px solid #000000; vertical-align: top;">
            <td style="border: 1px solid #000000; padding: 4px 6px; font-weight: bold; width: 14%;">${cleanVal(d.docente)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasContacto)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 9%;">${cleanVal(d.evaPermanente)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasTutoria)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.estudiantesTutoria)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasVinculacion)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasInvestigacion)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasPracticas)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.horasTitulacion)}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; width: 13%;">${cleanVal(d.asignaturas).replace(/\n/g, '<br/>')}</td>
            <td style="border: 1px solid #000000; padding: 4px 6px; text-align: center; width: 8%;">${cleanVal(d.estudiantesProblemasRendimiento).replace(/\n/g, '<br/>')}</td>
        </tr>
    `).join('');

    // 4.5 Observaciones
    const observaciones: AcompanamientoObservacionRowItem[] = Array.isArray(c.observaciones) && c.observaciones.length > 0
        ? c.observaciones
        : [
            { id: '1', estudiante: '', nivel: '1º', resultado: '' }
        ];

    const observacionesHtml = observaciones.map((o) => `
        <tr style="border-top: 1px solid #000000;">
            <td style="border: 1px solid #000000; padding: 5px 8px; width: 35%;">${cleanVal(o.estudiante)}</td>
            <td style="border: 1px solid #000000; padding: 5px 8px; text-align: center; width: 15%;">${cleanVal(o.nivel)}</td>
            <td style="border: 1px solid #000000; padding: 5px 8px; width: 50%;">${cleanVal(o.resultado)}</td>
        </tr>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 9pt; color: #0f172a;">
        <div style="margin-bottom: 12px; border-bottom: 1px solid #000000; padding-bottom: 4px;">
            <h2 style="font-size: 11pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>

        <!-- 4.1 Reuniones de carrera -->
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 9.5pt; font-weight: bold; font-style: italic; margin: 0 0 6px 0; color: #000000;">4.1.  Reuniones de carrera</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt;">
                <tbody>
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="width: 45%; padding: 6px 8px; font-weight: bold; border-right: 1px solid #000000; background-color: #f8fafc;">Horario de reunión de la carrera:</td>
                        <td style="padding: 6px 8px;">${cleanVal(reuniones.horarioReunion)}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="width: 45%; padding: 6px 8px; font-weight: bold; border-right: 1px solid #000000; background-color: #f8fafc;">Numero de reuniones de carrera realizadas en este parcial o módulo:</td>
                        <td style="padding: 6px 8px;">${cleanVal(String(reuniones.numeroReuniones ?? ''))}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #000000;">
                        <td style="width: 45%; padding: 6px 8px; font-weight: bold; border-right: 1px solid #000000; background-color: #f8fafc; vertical-align: top;">Principales aspectos tratados en las reuniones:</td>
                        <td style="padding: 6px 8px;">${cleanVal(reuniones.principalesAspectos).replace(/\n/g, '<br/>')}</td>
                    </tr>
                    <tr>
                        <td style="width: 45%; padding: 6px 8px; font-weight: bold; border-right: 1px solid #000000; background-color: #f8fafc; vertical-align: top;">Principales acuerdos o consensos:</td>
                        <td style="padding: 6px 8px;">${cleanVal(reuniones.principalesAcuerdos).replace(/\n/g, '<br/>')}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 4.2 Actividades realizadas por el coordinador de la carrera -->
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 9.5pt; font-weight: bold; font-style: italic; margin: 0 0 6px 0; color: #000000;">4.2.  Actividades realizadas por el coordinador de la carrera</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt;">
                <thead>
                    <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; font-weight: bold;">Actividad</th>
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; font-weight: bold;">Producto esperado o evidencia</th>
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: center; font-weight: bold;">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${actividadesHtml}
                </tbody>
            </table>
        </div>

        <!-- 4.3 Estudiantes -->
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 9.5pt; font-weight: bold; font-style: italic; margin: 0 0 6px 0; color: #000000;">4.3.  Estudiantes</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8pt;">
                <thead>
                    <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Nivel</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes matriculados</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes retirados o que desertaron oficialmente</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes con problemas de asistencia</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes con problemas de rendimiento</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes que no rindieron el examen parcial</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de casos con acompañamiento de Bienestar Institucional</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes becados</th>
                    </tr>
                </thead>
                <tbody>
                    ${estudiantesHtml}
                </tbody>
            </table>
        </div>

        <!-- 4.4 Gestión docente -->
        <div style="margin-bottom: 16px;">
            <h3 style="font-size: 9.5pt; font-weight: bold; font-style: italic; margin: 0 0 6px 0; color: #000000;">4.4.  Gestión docente</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 7.5pt;">
                <thead>
                    <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: left; font-weight: bold;">Nómina de docentes</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de contacto con el docente</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumple e manera permanente con los indicadores de gestión docente del EVA</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de tutoría académica</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Total de estudiantes atendidos en tutoría académica</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de vinculación</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de Investigación</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de prácticas-pre profesionales</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Cumplimiento de horas de tutorías de titulación.</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: left; font-weight: bold;">Asignaturas que imparte</th>
                        <th style="border: 1px solid #000000; padding: 4px 6px; text-align: center; font-weight: bold;">Número de estudiantes que presentan problemas de rendimiento en la Asignatura</th>
                    </tr>
                </thead>
                <tbody>
                    ${docentesHtml}
                </tbody>
            </table>
        </div>

        <!-- 4.5 Observaciones -->
        <div>
            <h3 style="font-size: 9.5pt; font-weight: bold; font-style: italic; margin: 0 0 6px 0; color: #000000;">4.5.  Observaciones:</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt;">
                <thead>
                    <tr style="background-color: #ffffff; color: #000000; border-bottom: 1.5px solid #000000;">
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; font-weight: bold;">Estudiante</th>
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: center; font-weight: bold;">Nivel</th>
                        <th style="border: 1px solid #000000; padding: 5px 8px; text-align: left; font-weight: bold;">Resultado del acompañamiento</th>
                    </tr>
                </thead>
                <tbody>
                    ${observacionesHtml}
                </tbody>
            </table>
        </div>
    </div>
    `;
}

/**
 * 5. CONCLUSIONES Y RECOMENDACIONES
 */
export function generateInformeAcompConclusionesHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.sectionTitle || block.title || '5.  Conclusiones y Recomendaciones';
    const bannerText = c.bannerText || 'CONCLUSIÓN Y RECOMENDACIÓN POR CADA UNO DE LOS PUNTOS TRATADOS.';
    const items: ConclusionRecomendacionItem[] = Array.isArray(c.items) && c.items.length > 0
        ? c.items
        : [
            { id: '1', punto: '1. Sobre la coordinación y datos informativos', conclusion: '', recomendacion: '' },
            { id: '2', punto: '2. Sobre la nómina de docentes tutores y medios de verificación', conclusion: '', recomendacion: '' },
            { id: '3', punto: '3. Sobre los docentes que aportan a la carrera y acciones de mejora', conclusion: '', recomendacion: '' },
            { id: '4', punto: '4. Sobre la gestión académica, reuniones, rendimiento estudiantil y EVA', conclusion: '', recomendacion: '' }
        ];

    const itemsHtml = items.map((it) => `
        <div style="border: 1px solid #000000; padding: 8px 12px; margin-bottom: 12px; background-color: #ffffff; page-break-inside: avoid;">
            <div style="font-weight: bold; font-size: 9pt; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
                ${cleanVal(it.punto)}
            </div>
            <div style="margin-bottom: 6px;">
                <span style="font-weight: bold; font-size: 8.5pt; color: #334155;">Conclusión: </span>
                <span style="font-size: 8.5pt;">${cleanVal(it.conclusion).replace(/\n/g, '<br/>')}</span>
            </div>
            <div>
                <span style="font-weight: bold; font-size: 8.5pt; color: #1e40af;">Recomendación: </span>
                <span style="font-size: 8.5pt;">${cleanVal(it.recomendacion).replace(/\n/g, '<br/>')}</span>
            </div>
        </div>
    `).join('');

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 9pt; color: #0f172a;">
        <div style="margin-bottom: 8px;">
            <h2 style="font-size: 11pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>
        <div style="margin-bottom: 14px;">
            <span style="background-color: #ffff00; color: #000000; font-weight: bold; font-size: 8.5pt; padding: 2px 6px; border: 1px solid #facc15; display: inline-block;">
                ${bannerText}
            </span>
        </div>
        <div>
            ${itemsHtml}
        </div>
    </div>
    `;
}

/**
 * 6. FIRMAS DE RESPONSABILIDAD
 */
export function generateInformeAcompFirmasHtml(block: DocumentBlock): string {
    const c = block.config || {};
    const secTitle = c.sectionTitle || block.title || '6.  Firmas de responsabilidad.';
    const headerColor = c.headerColor || '#1e2a4a';

    const tutores: FirmaTutorNivelItem[] = Array.isArray(c.firmasTutores) && c.firmasTutores.length > 0
        ? c.firmasTutores
        : [
            { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Primer Nivel', fecha: '' },
            { id: '2', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Segundo Nivel', fecha: '' },
            { id: '3', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Tercer Nivel', fecha: '' },
            { id: '4', label: 'ELABORADO', nombre: '', cargo: 'Tutor de Cuarto Nivel', fecha: '' }
        ];

    const autoridades: FirmaAutoridadItem[] = Array.isArray(c.firmasAutoridades) && c.firmasAutoridades.length > 0
        ? c.firmasAutoridades
        : [
            { id: '1', label: 'ELABORADO', nombre: '', cargo: 'Coordinador de Carrera', fecha: '' },
            { id: '2', label: '', nombre: '', cargo: 'Bienestar Institucional', fecha: '' },
            { id: '3', label: 'APROBADO', nombre: '', cargo: 'Coordinador Académico', fecha: '' }
        ];

    return `
    <div class="section-container" style="margin-bottom: 24px; font-family: 'Inter', Arial, sans-serif; font-size: 9pt; color: #0f172a; page-break-inside: avoid;">
        <div style="margin-bottom: 12px;">
            <h2 style="font-size: 11pt; font-weight: bold; margin: 0; color: #000000;">${secTitle}</h2>
        </div>

        <!-- Tabla 1: Tutores de Nivel -->
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt; margin-bottom: 18px;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff;">
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; width: 20%; font-weight: bold;">DESCRIPCIÓN</th>
                    ${tutores.map(t => `<th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; width: 20%; font-weight: bold;">${t.label || 'ELABORADO'}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc; height: 60px; vertical-align: top;">FIRMA</td>
                    ${tutores.map(() => `<td style="border: 1px solid #000000; padding: 6px 8px; height: 60px; text-align: center; vertical-align: bottom;"><div style="border-bottom: 1px dashed #cbd5e1; width: 80%; margin: 0 auto 4px auto;"></div></td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">NOMBRE</td>
                    ${tutores.map(t => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center;">${cleanVal(t.nombre)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">CARGO</td>
                    ${tutores.map(t => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center; font-weight: 500;">${cleanVal(t.cargo)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">FECHA</td>
                    ${tutores.map(t => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center;">${cleanVal(t.fecha)}</td>`).join('')}
                </tr>
            </tbody>
        </table>

        <!-- Tabla 2: Autoridades -->
        <table style="width: 100%; border-collapse: collapse; border: 1.5px solid #000000; font-size: 8.5pt;">
            <thead>
                <tr style="background-color: ${headerColor}; color: #ffffff;">
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: left; width: 20%; font-weight: bold;">DESCRIPCIÓN</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; width: 26.6%; font-weight: bold;">ELABORADO</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; width: 26.6%; font-weight: bold;">${autoridades[1]?.label || ''}</th>
                    <th style="border: 1px solid #000000; padding: 6px 8px; text-align: center; width: 26.6%; font-weight: bold;">APROBADO</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc; height: 60px; vertical-align: top;">FIRMA</td>
                    ${autoridades.map(() => `<td style="border: 1px solid #000000; padding: 6px 8px; height: 60px; text-align: center; vertical-align: bottom;"><div style="border-bottom: 1px dashed #cbd5e1; width: 80%; margin: 0 auto 4px auto;"></div></td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">NOMBRE</td>
                    ${autoridades.map(a => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center;">${cleanVal(a.nombre)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">CARGO</td>
                    ${autoridades.map(a => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center; font-weight: 500;">${cleanVal(a.cargo)}</td>`).join('')}
                </tr>
                <tr>
                    <td style="border: 1px solid #000000; padding: 6px 8px; font-weight: bold; background-color: #f8fafc;">FECHA</td>
                    ${autoridades.map(a => `<td style="border: 1px solid #000000; padding: 6px 8px; text-align: center;">${cleanVal(a.fecha)}</td>`).join('')}
                </tr>
            </tbody>
        </table>
    </div>
    `;
}


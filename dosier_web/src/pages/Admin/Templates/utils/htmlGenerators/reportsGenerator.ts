import type { DocumentBlock } from '../../types';
import { COLORS, headerBg } from './generatorStyles';

/**
 * Genera el HTML del Informe de Avances (Bloque: project_progress_report)
 */
export const generateProjectProgressHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const parts: string[] = [];

    if (c.showEvidencias !== false) {
        parts.push(`
    <div style="margin-bottom: 15px;">
      <strong style="font-size: 8.5pt; color: ${COLORS.gray}; display: block; margin-bottom: 4px;">Bitácora Científica & Conclusiones Parciales:</strong>
      <div style="font-size: 9pt; line-height: 1.5; color: #1e293b;">{{default conclusiones_parciales "Sin registros de bitácora."}}</div>
    </div>`);
    }

    if (c.showHitosCompletados !== false) {
        parts.push(`
    <p style="font-weight: bold; font-size: 8.5pt; color: ${COLORS.gray}; margin: 15px 0 4px;">Hitos & Entregables Completados</p>
    <table class="info-table">
      <thead>
        <tr>
          <th style="${headerBg('blue')}">Actividad / Hito</th>
          <th style="${headerBg('blue')} width: 80px; text-align: center;">% Avance</th>
          <th style="${headerBg('blue')} width: 90px; text-align: center;">Completado</th>
        </tr>
      </thead>
      <tbody>
        {{#each hitos_completados}}
        <tr>
          <td>{{this.actividad}}</td>
          <td style="text-align: center; font-weight: bold;">{{this.avance}} %</td>
          <td style="text-align: center; font-weight: bold; color: #10b981;">{{#if this.hito_completado}}SÍ{{else}}NO{{/if}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>`);
    }

    if (parts.length === 0) return '';

    return `
  <!-- BLOQUE: INFORME DE AVANCES -->
  <div style="margin-top: 20px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: ${COLORS.blue}; margin-bottom: 8px;">Informe Parcial de Avances & Resultados</p>
    ${parts.join('')}
  </div>`;
};

/**
 * Genera el HTML Handlebars para la Matriz de Actividades de Avance (Bloque: progress_activity_section)
 */
export const generateProgressActivityHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const variant = c.activityVariant || 'ejecutadas';
    const customTitle = c.activityTableTitle;

    if (variant === 'no_previstas') {
        const title = customTitle || 'ACTIVIDADES NO PREVISTAS INICIALMENTE QUE HAN SIDO REALIZADAS DURANTE LA EJECUCIÓN DEL PROYECTO';
        return `
  <!-- BLOQUE: MATRIZ DE ACTIVIDADES NO PREVISTAS -->
  <div style="margin-top: 20px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: ${COLORS.blue}; margin-bottom: 8px;">${title}</p>
    {{#each ActividadesNoPrevistas}}
    <table class="info-table" style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 15px;">
      <tbody>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; width: 35%; padding: 5px 8px; border: 1px solid #334155;">NÚMERO DE ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">{{default this.NumeroActividad this.numero_actividad ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">OBJETIVO DEL PROYECTO DE INVESTIGACIÓN</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ObjetivoAsociado this.objetivo_asociado ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">ACTIVIDAD EJECUTADA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ActividadesEjecutadas this.actividades_ejecutadas ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">RESULTADOS OBTENIDOS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ResultadosObtenidos this.resultados_obtenidos ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PORCENTAJE DE AVANCE (%)</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold;">{{default this.PorcentajeAvance this.porcentaje_avance "100"}}%</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PARTICIPANTES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.Participantes this.participantes "Director del Proyecto, Investigadores"}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA DE INICIO DE LA ACTIVIDAD NO PREVISTA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaInicio this.fecha_inicio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA FIN DE LA ACTIVIDAD NO PREVISTA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaFin this.fecha_fin ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; vertical-align: top;">OBSERVACIONES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; min-height: 40px; vertical-align: top;">{{default this.Observaciones this.observaciones ""}}</td>
        </tr>
      </tbody>
    </table>
    {{/each}}
  </div>`;
    }

    if (variant === 'obstaculos') {
        const title = customTitle || 'OBSTÁCULOS QUE SE HAN PRESENTADO PARA LA EJECUCIÓN DEL PROYECTO';
        return `
  <!-- BLOQUE: MATRIZ DE OBSTÁCULOS -->
  <div style="margin-top: 20px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: ${COLORS.blue}; margin-bottom: 8px;">${title}</p>
    {{#each Obstaculos}}
    <table class="info-table" style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 15px;">
      <tbody>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; width: 35%; padding: 5px 8px; border: 1px solid #334155;">NÚMERO DE ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">{{default this.NumeroActividad this.numero_actividad ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">OBJETIVO DEL PROYECTO DE INVESTIGACIÓN</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ObjetivoAsociado this.objetivo_asociado ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">LIMITACIÓN</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.Limitacion this.limitacion ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">ACTIVIDAD CORRECTIVA DESARROLLADA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ActividadesEjecutadas this.actividades_ejecutadas ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">RESULTADOS OBTENIDOS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ResultadosObtenidos this.resultados_obtenidos ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PORCENTAJE DE AVANCE (%)</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold;">{{default this.PorcentajeAvance this.porcentaje_avance "100"}}%</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PARTICIPANTES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.Participantes this.participantes "Director del Proyecto, Investigadores"}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA DE INICIO DE LA ACTIVIDAD CORRECTIVA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaInicio this.fecha_inicio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA FIN DE LA ACTIVIDAD CORRECTIVA</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaFin this.fecha_fin ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; vertical-align: top;">OBSERVACIONES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; min-height: 40px; vertical-align: top;">{{default this.Observaciones this.observaciones ""}}</td>
        </tr>
      </tbody>
    </table>
    {{/each}}
  </div>`;
    }

    // Default: ejecutadas
    const title = customTitle || '2. MATRIZ DE ACTIVIDADES EJECUTADAS';
    return `
  <!-- BLOQUE: MATRIZ DE ACTIVIDADES EJECUTADAS -->
  <div style="margin-top: 20px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: ${COLORS.blue}; margin-bottom: 8px;">${title}</p>
    {{#each ActividadesEjecutadas}}
    <table class="info-table" style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 15px;">
      <tbody>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; width: 32%; padding: 5px 8px; border: 1px solid #334155;">NÚMERO DE ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">{{default this.NumeroActividad this.numero_actividad ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">ACTIVIDADES EJECUTADAS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ActividadesEjecutadas this.actividades_ejecutadas ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">RESULTADOS OBTENIDOS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.ResultadosObtenidos this.resultados_obtenidos ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PORCENTAJE DE AVANCE (%)</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold;">{{default this.PorcentajeAvance this.porcentaje_avance "100"}}%</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PARTICIPANTES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.Participantes this.participantes "Director del Proyecto e Investigadores"}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA DE INICIO DE LA ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaInicio this.fecha_inicio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA FIN DE LA ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default this.FechaFin this.fecha_fin ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; vertical-align: top;">OBSERVACIONES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; min-height: 40px; vertical-align: top;">{{default this.Observaciones this.observaciones ""}}</td>
        </tr>
      </tbody>
    </table>
    {{/each}}
  </div>`;
};

/**
 * Genera el HTML Handlebars para el Estado de Ejecución del Proyecto (Bloque: progress_status_section)
 */
export const generateProgressStatusHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const title = c.statusTableTitle || 'ESTADO DE EJECUCIÓN DEL PROYECTO';
    return `
  <!-- BLOQUE: ESTADO DE EJECUCIÓN -->
  <div style="margin-top: 25px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 10pt; text-transform: uppercase; text-align: center; color: #000000; margin-bottom: 12px;">${title}</p>
    <p style="font-size: 8.5pt; font-weight: bold; text-transform: uppercase; margin-bottom: 6px; color: #000000;">MARQUE CON UNA (X) EL ESTADO ACTUAL DEL PROYECTO DE INVESTIGACIÓN:</p>
    
    <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8.5pt; margin-bottom: 0px;">
      <thead>
        <tr style="background-color: #1e2a4a; color: white; font-weight: bold;">
          <th style="width: 20%; padding: 6px 4px; border: 1px solid #000000; text-transform: uppercase;">INICIADO</th>
          <th style="width: 20%; padding: 6px 4px; border: 1px solid #000000; text-transform: uppercase;">EN AVANCE</th>
          <th style="width: 20%; padding: 6px 4px; border: 1px solid #000000; text-transform: uppercase;">SUSPENDIDO</th>
          <th style="width: 20%; padding: 6px 4px; border: 1px solid #000000; text-transform: uppercase;">POR FINALIZAR</th>
          <th style="width: 20%; padding: 6px 4px; border: 1px solid #000000; text-transform: uppercase;">FINALIZADO</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px 4px; border: 1px solid #000000; font-weight: bold; font-size: 10pt;">{{#if_eq EstadoEjecucion "INICIADO"}}(X){{else}}{{#if_eq estado_ejecucion "INICIADO"}}(X){{/if_eq}}{{/if_eq}}</td>
          <td style="padding: 8px 4px; border: 1px solid #000000; font-weight: bold; font-size: 10pt;">{{#if_eq EstadoEjecucion "EN AVANCE"}}(X){{else}}{{#if_eq estado_ejecucion "EN AVANCE"}}(X){{else}}{{#unless EstadoEjecucion}}{{#unless estado_ejecucion}}(X){{/unless}}{{/unless}}{{/if_eq}}{{/if_eq}}</td>
          <td style="padding: 8px 4px; border: 1px solid #000000; font-weight: bold; font-size: 10pt;">{{#if_eq EstadoEjecucion "SUSPENDIDO"}}(X){{else}}{{#if_eq estado_ejecucion "SUSPENDIDO"}}(X){{/if_eq}}{{/if_eq}}</td>
          <td style="padding: 8px 4px; border: 1px solid #000000; font-weight: bold; font-size: 10pt;">{{#if_eq EstadoEjecucion "POR FINALIZAR"}}(X){{else}}{{#if_eq estado_ejecucion "POR FINALIZAR"}}(X){{/if_eq}}{{/if_eq}}</td>
          <td style="padding: 8px 4px; border: 1px solid #000000; font-weight: bold; font-size: 10pt;">{{#if_eq EstadoEjecucion "FINALIZADO"}}(X){{else}}{{#if_eq estado_ejecucion "FINALIZADO"}}(X){{/if_eq}}{{/if_eq}}</td>
        </tr>
        <tr style="background-color: #1e2a4a; color: white; font-weight: bold; text-align: left;">
          <td colspan="5" style="padding: 6px 8px; border: 1px solid #000000; font-size: 8.5pt; text-transform: uppercase;">
            EXPLIQUE BREVEMENTE LA FASE DE EJECUCIÓN EN QUE SE ENCUENTRA SU PROYECTO:
          </td>
        </tr>
        <tr style="text-align: left;">
          <td colspan="5" style="padding: 8px; border: 1px solid #000000; font-size: 8.5pt; min-height: 50px; vertical-align: top; color: #000000;">
            {{{default DescripcionFaseActual descripcion_fase_actual ""}}}
          </td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 18px;">
      <p style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 6px; color: #000000;">OBSERVACIONES GENERALES DEL DIRECTOR DEL PROYECTO:</p>
      <div style="padding: 8px; border: 1px solid #000000; font-size: 8.5pt; min-height: 50px; color: #000000;">
        {{{default ObservacionesDirector observaciones_director ""}}}
      </div>
    </div>

    <div style="margin-top: 18px;">
      <p style="font-weight: bold; font-size: 8.5pt; text-transform: uppercase; margin-bottom: 6px; color: #000000;">OBSERVACIONES GENERALES DEL COORDINADOR DE LA UNIDAD DE INVESTIGACIÓN:</p>
      <div style="padding: 8px; border: 1px solid #000000; font-size: 8.5pt; min-height: 45px; color: #000000;">
        {{{default ObservacionesCoordinador observaciones_coordinador ""}}}
      </div>
    </div>
  </div>`;
};

/**
 * Genera el HTML Handlebars para los Datos Generales del Proyecto (Bloque: progress_header_section)
 */
export const generateProgressHeaderHtml = (block: DocumentBlock): string => {
    const c: any = block.config || {};
    const title = c.headerTitle || '1. DATOS GENERALES DEL PROYECTO';
    return `
  <!-- BLOQUE: DATOS GENERALES DEL PROYECTO (ENCABEZADO INFORME AVANCE) -->
  <div style="margin-top: 15px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: ${COLORS.blue}; margin-bottom: 6px;">${title}</p>
    <table class="info-table" style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
      <tbody>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; width: 32%; padding: 5px 8px; border: 1px solid #334155;">NOMBRE DEL PROYECTO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;" colspan="3">{{default NombreProyecto Titulo title ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PROGRAMA:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default Programa ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">GRUPO DE INVESTIGACIÓN:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default GrupoInvestigacion GrupoInvestigacionNombre ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">DOMINIO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default Dominio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">LÍNEA DE INVESTIGACIÓN:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default LineaInvestigacion ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">SUBLÍNEA DE INVESTIGACIÓN:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default SublineaInvestigacion ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">CAMPO AMPLIO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default CampoAmplio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">CAMPO ESPECÍFICO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default CampoEspecifico ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">CAMPO DETALLADO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default CampoDetallado ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">CARRERA:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default Carrera ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">TIPO DE INVESTIGACIÓN:</td>
          <td style="padding: 0; border: 1px solid #cbd5e1;" colspan="3">
            <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 8pt;">
              <tr>
                <td style="width: 25%; padding: 4px; font-weight: bold;">BÁSICA</td>
                <td style="width: 8%; border-right: 1px solid #cbd5e1;">[ &nbsp; ]</td>
                <td style="width: 25%; padding: 4px; font-weight: bold;">APLICADA</td>
                <td style="width: 8%; border-right: 1px solid #cbd5e1;">[ X ]</td>
                <td style="width: 26%; padding: 4px; font-weight: bold;">DESARROLLO EXPERIMENTAL</td>
                <td style="width: 8%;">[ &nbsp; ]</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PERIODO ACADÉMICO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default Periodo PeriodoConvocatoria ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">DIRECTOR DEL PROYECTO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e293b;" colspan="3">{{default DirectorProyecto NombreDirectorFirma ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">INVESTIGADORES:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;" colspan="3">{{default InvestigadoresTexto ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; width: 32%;">FECHA INICIO DEL PROYECTO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 18%;">{{default FechaInicio ""}}</td>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; width: 32%;">FECHA FIN PREVISTA DEL PROYECTO:</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; width: 18%;">{{default FechaFin ""}}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- BLOQUE: 2. MATRIZ DE ACTIVIDADES EJECUTADAS -->
  {{#if ActividadesEjecutadas}}
  <div style="margin-top: 25px; page-break-inside: avoid;">
    <p style="font-weight: bold; font-size: 9.5pt; text-transform: uppercase; color: {{ theme.colors.primary }}; margin-bottom: 6px;">2. MATRIZ DE ACTIVIDADES EJECUTADAS</p>
    {{#each ActividadesEjecutadas}}
    <table class="info-table" style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 15px;">
      <tbody>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; width: 32%; padding: 5px 8px; border: 1px solid #334155;">NÚMERO DE ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #0f172a;">{{default NumeroActividad ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">ACTIVIDADES EJECUTADAS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default ActividadesEjecutadas ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">RESULTADOS OBTENIDOS</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default ResultadosObtenidos ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PORCENTAJE DE AVANCE (%)</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; font-weight: bold;">{{default PorcentajeAvance "100"}}%</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">PARTICIPANTES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default Participantes "Director del Proyecto e Investigadores"}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA DE INICIO DE LA ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default FechaInicio ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #1e293b; color: white; font-weight: bold; padding: 5px 8px; border: 1px solid #334155;">FECHA FIN DE LA ACTIVIDAD</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1;">{{default FechaFin ""}}</td>
        </tr>
        <tr>
          <td style="background-color: #b8860b; color: black; font-weight: bold; padding: 5px 8px; border: 1px solid #996515; vertical-align: top;">OBSERVACIONES</td>
          <td style="padding: 5px 8px; border: 1px solid #cbd5e1; min-height: 40px; vertical-align: top;">{{default Observaciones ""}}</td>
        </tr>
      </tbody>
    </table>
    {{/each}}
  </div>
  {{/if}}
</div>`;
};

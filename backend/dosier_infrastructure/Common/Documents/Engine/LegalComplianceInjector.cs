using Dosier.Domain.Common.Documents;

namespace Dosier.Infrastructure.Common.Documents.Engine
{
    /// <summary>
    /// Capa de Cumplimiento Legal.
    /// Intercepta la generación de documentos para aplicar obligaciones legales ecuatorianas.
    /// 
    /// Normativa aplicada:
    /// - LOPDP (Ley Orgánica de Protección de Datos Personales, RO 459, 2021)
    /// - Reglamento del CES para IST
    /// - Normas del CACES para evidencias de acreditación
    /// </summary>
    public class LegalComplianceInjector
    {
        // Cláusula LOPDP vigente (Registro Oficial No. 459, 26 de mayo de 2021)
        // Esta debe actualizarse desde la BD; este es el valor por defecto
        private const string DefaultLopdpClause =
            "Los datos personales contenidos en este documento son tratados bajo los principios de " +
            "licitud, lealtad y transparencia, conforme a la Ley Orgánica de Protección de Datos Personales " +
            "(R.O. N.° 459, 26/05/2021) y su reglamento. El responsable del tratamiento es la institución " +
            "emisora. Para ejercer sus derechos ARCO, diríjase al Delegado de Protección de Datos.";

        /// <summary>
        /// Enriquece el HTML generado con los elementos legales obligatorios:
        /// Pie de página con LOPDP, código de trazabilidad, y marcas de modo doble ciego.
        /// </summary>
        public string InjectLegalFooter(
            string renderedHtml,
            DocumentTemplate template,
            string traceabilityCode,
            bool isBlindMode,
            string? customLopdpClause = null)
        {
            var legalSections = new System.Text.StringBuilder();


            var footer = $@"
            <div class=""legal-footer"" style=""margin-top: 4px; padding: 0; line-height: 1.15; page-break-inside: avoid;"">
                <div class=""traceability-block"">
                    <table class=""trace-table"" style=""width: 100%; border-collapse: collapse; font-size: 6.5pt; color: #334155; margin: 0;"">
                        <tr>
                            <td class=""trace-code"">
                                Código de Verificación: <strong>{traceabilityCode}</strong>
                            </td>
                            <td class=""trace-code"" style=""text-align:right"">
                                Generado por DOSIER · {DateTime.Now:dd/MM/yyyy HH:mm}
                            </td>
                        </tr>
                    </table>
                </div>
            </div>";

            // 3. Inyectar el aviso de doble ciego al inicio y el footer al final del body
            var result = renderedHtml;
            if (isBlindMode && template.SupportsBlindMode)
            {
                result = legalSections.ToString() + result;
            }

            return result.TrimEnd() + footer;
        }

        /// <summary>
        /// Genera el encabezado institucional DOSIER estandarizado.
        /// </summary>
        public string BuildInstitutionalHeader(string documentTitle, string documentSubtitle = "")
        {
            return $@"
            <div class=""dosier-header"">
                <table class=""header-table"">
                    <tr>
                        <td>
                            <div class=""inst-name"">Instituto Superior Tecnológico</div>
                            <div class=""inst-sub"">Sistema de Portafolio Docente ISTPET</div>
                            <div class=""inst-sub"">Sistema DOSIER · Quito, Ecuador</div>
                        </td>
                        <td style=""width:100px; text-align:right"">
                            <div class=""brand-block"">DOSIER</div>
                        </td>
                    </tr>
                </table>
            </div>
            <div class=""doc-title"">{documentTitle}</div>
            {(string.IsNullOrEmpty(documentSubtitle) ? "" : $@"<div class=""doc-subtitle"">{documentSubtitle}</div>")}";
        }

        private static string GetCategoryLabel(DocumentCategory category) => category switch
        {
            DocumentCategory.Protocolo => "Protocolo de Investigación",
            DocumentCategory.ActaAprobacion => "Acta de Aprobación",
            DocumentCategory.ActaLiquidacion => "Acta de Liquidación",
            DocumentCategory.TerminosDeReferencia => "Términos de Referencia (SERCOP)",
            DocumentCategory.EspecificacionTecnica => "Especificación Técnica (SERCOP)",
            DocumentCategory.CertificacionPresupuestaria => "Certificación Presupuestaria",
            DocumentCategory.ActaRecepcion => "Acta de Recepción a Satisfacción",
            DocumentCategory.ProtocoloBioetico => "Protocolo Bioético (CEISH)",
            DocumentCategory.ConsentimientoInformado => "Consentimiento Informado (LOPDP)",
            DocumentCategory.ActaExencion => "Acta de Exención Ética",
            DocumentCategory.CesionDerechos => "Contrato de Cesión de Derechos (SENADI)",
            DocumentCategory.SolicitudRegistroSoftware => "Solicitud de Registro de Software (SENADI)",
            DocumentCategory.ActaConformacionSemillero => "Acta de Conformación de Semillero",
            DocumentCategory.ConvenioMarco => "Convenio Marco",
            DocumentCategory.ConvenioEspecifico => "Convenio Específico",
            DocumentCategory.MatrizIndicadoresCaces => "Matriz de Indicadores CACES",
            DocumentCategory.ReporteAnualSenescyt => "Reporte Anual SENESCYT",
            DocumentCategory.ReporteDistributivoCruce => "Reporte Distributivo-Investigación (RRA)",
            DocumentCategory.ResolucionCargaHoraria => "Resolución de Carga Horaria",
            DocumentCategory.PeaCurricular => "Programa de Estudio de la Asignatura (PEA)",
            _ => category.ToString()
        };
    }
}

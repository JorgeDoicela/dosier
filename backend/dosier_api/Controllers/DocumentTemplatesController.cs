using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using Dosier.Infrastructure.Common.Documents.Engine;
using Dosier.Infrastructure.Common.Documents.Templates.Investigacion;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace dosier_api.Controllers
{
    /// <summary>
    /// Endpoints de administración del Motor de Documentos DOSIER.
    /// Permiten actualizar plantillas en base de datos sin recompilación.
    /// IMPORTANTE: Proteger con autorización de rol "Admin" en producción.
    /// </summary>
    [ApiController]
    [Route("api/admin/templates")]
    public class DocumentTemplatesController : ControllerBase
    {
        private readonly IDocumentEngine _documentEngine;
        private readonly IDocumentTemplateAdminService _templateAdminService;
        private readonly IHostEnvironment _environment;

        public DocumentTemplatesController(
            IDocumentEngine documentEngine,
            IDocumentTemplateAdminService templateAdminService,
            IHostEnvironment environment)
        {
            _documentEngine = documentEngine;
            _templateAdminService = templateAdminService;
            _environment = environment;
        }

        /// <summary>
        /// Lista todas las plantillas activas registradas en el motor.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
            var customOrder = await _templateAdminService.GetCustomTemplateOrderAsync(ct);

            var orderedTemplates = templates.ToList();
            if (customOrder != null && customOrder.Any())
            {
                orderedTemplates = templates
                    .OrderBy(t =>
                    {
                        var idx = customOrder.IndexOf(t.Code);
                        return idx >= 0 ? idx : int.MaxValue;
                    })
                    .ThenBy(t => t.Category)
                    .ToList();
            }

            return Ok(orderedTemplates.Select(t => new
            {
                t.Id,
                t.Code,
                t.Name,
                t.Description,
                t.Category,
                t.Version,
                t.IsActive,
                t.RequiresLopdpClause,
                t.SupportsBlindMode,
                RequiresElectronicSignature = t.RequiresElectronicSignature,
                SignatureType = t.SignatureType,
                t.ThemeConfigJson,
                t.UpdatedAt,
                t.UpdatedBy
            }));
        }

        /// <summary>
        /// Obtiene el detalle de una plantilla por su código único.
        /// </summary>
        [HttpGet("{code}")]
        public async Task<IActionResult> GetByCode(string code, CancellationToken ct)
        {
            var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
            var template = templates.FirstOrDefault(t => t.Code == code);

            if (template == null)
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });

            var fileLoader = new TemplateFileLoader(_environment);
            var fileHtml = await fileLoader.LoadAsync(template.Code);
            var fileCss = await fileLoader.LoadCssAsync(template.Code);

            var effectiveHtml = !string.IsNullOrWhiteSpace(fileHtml) && (string.IsNullOrWhiteSpace(template.HtmlContent) || template.HtmlContent.StartsWith("<!-- Cargado desde") || template.Version < 400)
                ? fileHtml
                : (!string.IsNullOrWhiteSpace(template.HtmlContent) ? template.HtmlContent : fileHtml);

            var effectiveCss = !string.IsNullOrWhiteSpace(fileCss) && string.IsNullOrWhiteSpace(template.CustomCss)
                ? fileCss
                : template.CustomCss;

            return Ok(new
            {
                template.Id,
                template.Code,
                template.Name,
                template.Description,
                template.Category,
                template.Version,
                template.IsActive,
                template.RequiresLopdpClause,
                template.SupportsBlindMode,
                RequiresElectronicSignature = template.RequiresElectronicSignature,
                SignatureType = template.SignatureType,
                template.CollaborativeFieldsJson,
                template.ThemeConfigJson,
                HtmlContent = effectiveHtml,
                CustomCss = effectiveCss,
                template.UpdatedAt
            });
        }

        /// <summary>
        /// Actualiza el HTML de una plantilla existente en base de datos.
        /// El cambio aplica inmediatamente en el siguiente documento generado.
        /// </summary>
        [HttpPut("{code}")]
        public async Task<IActionResult> Update(string code, [FromBody] UpdateTemplateRequest request, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _templateAdminService.PublishTemplateAsync(
                    code,
                    request.HtmlContent,
                    request.CustomCss,
                    request.CollaborativeFieldsJson,
                    request.ThemeConfigJson,
                    updatedBy,
                    ct);

                return Ok(new { message = $"Plantilla '{code}' actualizada correctamente." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// [DEPRECADO] Las plantillas ahora se cargan desde archivos .html físicos (TemplateFileLoader).
        /// </summary>
        [HttpPost("migrate-protocolo-investigacion")]
        public IActionResult MigrateProtocolo()
        {
            return Ok(new
            {
                message = "Las plantillas ahora se cargan automáticamente desde archivos .html físicos. No se requiere migración manual.",
                templateCode = ProyectoInvestigacionTemplate.CODE,
                htmlFile = "Templates/Investigacion/ProyectoInvestigacion.html",
                info = "Edita el archivo .html y genera el documento. El cambio aplica sin recompilar."
            });
        }

        /// <summary>
        /// Restablece una plantilla en la BD a sus archivos físicos oficiales (HTML y CSS).
        /// </summary>
        [HttpPost("{code}/reset-to-default")]
        public async Task<IActionResult> ResetToDefault(string code, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _documentEngine.ResetTemplateToDefaultAsync(code, updatedBy, ct);
                return Ok(new { message = $"Plantilla '{code}' restablecida exitosamente a sus archivos por defecto de fábrica." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// Actualiza la configuración de firmas de una plantilla.
        /// </summary>
        [HttpPut("{code}/signature-config")]
        public async Task<IActionResult> UpdateSignatureConfig(string code, [FromBody] UpdateSignatureConfigRequest request, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _documentEngine.UpdateSignatureConfigAsync(code, request.RequiresSignature, request.SignatureType, updatedBy, ct);
                return Ok(new { message = $"Configuración de firmas para plantilla '{code}' actualizada correctamente." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// Obtiene el conteo de documentos activos asociados a una plantilla.
        /// </summary>
        [HttpGet("{code}/usage-count")]
        public async Task<IActionResult> GetUsageCount(string code, CancellationToken ct)
        {
            var count = await _templateAdminService.GetUsageCountAsync(code, ct);
            return Ok(new { count });
        }

        /// <summary>
        /// Obtiene el tema visual global de la institución.
        /// </summary>
        [HttpGet("global-theme")]
        public async Task<IActionResult> GetGlobalTheme(CancellationToken ct)
        {
            var configValue = await _templateAdminService.GetGlobalThemeConfigAsync(ct);

            if (string.IsNullOrEmpty(configValue))
            {
                var fallbackTheme = new
                {
                    colors = new
                    {
                        primary = "#222c57",
                        secondary = "#c4a857",
                        text = "#1a1a1a",
                        tableHeaderBg = "#222c57",
                        tableHeaderColor = "#ffffff",
                        accent = "#9ad3de"
                    },
                    typography = new
                    {
                        fontFamily = "'Calibri', 'Open Sans', Arial, sans-serif",
                        baseSize = "10pt",
                        lineHeight = "1.4"
                    },
                    layout = new
                    {
                        marginTop = "3cm",
                        marginBottom = "2cm",
                        marginLeft = "2cm",
                        marginRight = "2cm",
                        landscapeMarginTop = "1.8cm",
                        landscapeMarginLeft = "1.2cm"
                    },
                    brand = new
                    {
                        showCoverPage = true,
                        logoScale = "100%"
                    }
                };
                return Ok(new { themeConfigJson = JsonSerializer.Serialize(fallbackTheme) });
            }

            return Ok(new { themeConfigJson = configValue });
        }

        /// <summary>
        /// Actualiza el tema visual global de la institución.
        /// </summary>
        [HttpPut("global-theme")]
        public async Task<IActionResult> UpdateGlobalTheme([FromBody] UpdateGlobalThemeRequest request, CancellationToken ct)
        {
            await _templateAdminService.SaveGlobalThemeConfigAsync(request.ThemeConfigJson ?? string.Empty, ct);
            return Ok(new { message = "Tema global institucional actualizado correctamente." });
        }

        /// <summary>
        /// Actualiza el orden de las plantillas en el catálogo.
        /// </summary>
        [HttpPut("order")]
        public async Task<IActionResult> UpdateOrder([FromBody] UpdateTemplatesOrderRequest request, CancellationToken ct)
        {
            if (request == null || request.Codes == null)
                return BadRequest(new { error = "El cuerpo de la solicitud no puede estar vacío." });

            await _templateAdminService.SaveTemplateOrderAsync(request.Codes, ct);
            return Ok(new { message = "Orden de plantillas guardado correctamente." });
        }
    }

    public class UpdateTemplateRequest
    {
        [JsonPropertyName("htmlContent")]
        public string HtmlContent { get; set; } = string.Empty;

        [JsonPropertyName("customCss")]
        public string? CustomCss { get; set; }

        [JsonPropertyName("collaborativeFieldsJson")]
        public string? CollaborativeFieldsJson { get; set; }

        [JsonPropertyName("themeConfigJson")]
        public string? ThemeConfigJson { get; set; }
    }

    public class UpdateSignatureConfigRequest
    {
        [JsonPropertyName("requiresSignature")]
        public bool RequiresSignature { get; set; }

        [JsonPropertyName("signatureType")]
        public string SignatureType { get; set; } = string.Empty;
    }

    public class UpdateGlobalThemeRequest
    {
        [JsonPropertyName("themeConfigJson")]
        public string? ThemeConfigJson { get; set; }
    }

    public class UpdateTemplatesOrderRequest
    {
        [JsonPropertyName("codes")]
        public List<string> Codes { get; set; } = new();
    }
}

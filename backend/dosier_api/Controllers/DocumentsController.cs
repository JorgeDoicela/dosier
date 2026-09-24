using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using Dosier.Domain.Common.Documents;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Authorization;

namespace dosier_api.Controllers
{
    /// <summary>
    /// NÚCLEO DOSIER BUILDER - CONTROLADOR UNIVERSAL DE DOCUMENTACIÓN
    /// -------------------------------------------------------------------------
    /// ARQUITECTURA PROFESIONAL: Este controlador implementa el patrón "Agnostic Document Engine".
    /// No debe contener lógica de negocio específica de ninguna entidad (Proyectos, Actas, etc).
    /// 
    /// GUÍA PARA FUTUROS DOCUMENTOS:
    /// 1. Crear la plantilla HTML en BD (vía Seed o UI Administrativa).
    /// 2. Definir el DTO de datos en el Frontend.
    /// 3. Invocar este endpoint 'render' pasando el TemplateCode.
    /// 4. El motor Scriban inyectará las propiedades del JSON directamente en el HTML.
    /// </summary>
    [ApiController]
    [Route("api/documents")]
    public class DocumentsController : ControllerBase
    {
        private readonly IDocumentEngine _documentEngine;
        private readonly ILogger<DocumentsController> _logger;

        public DocumentsController(IDocumentEngine documentEngine, ILogger<DocumentsController> logger)
        {
            _documentEngine = documentEngine;
            _logger = logger;
        }

        /// <summary>
        /// RENDERIZADO UNIVERSAL (Punto de entrada único para digitalización masiva)
        /// -------------------------------------------------------------------------
        /// Recibe cualquier objeto JSON y lo plasma en el PDF oficial del ISTPET.
        /// Soporta: Modo Borrador (Marca de agua) y Modo Doble Ciego (Anonimización).
        /// </summary>
        [HttpPost("render")]
        public async Task<IActionResult> Render([FromBody] JsonElement rawData, [FromQuery] string templateCode, [FromQuery] bool isDraft = true, [FromQuery] bool isBlind = false)
        {
            try 
            {
                _logger.LogInformation("[DOSIER CORE] Solicitud de renderizado universal para plantilla: {Code}", templateCode);

                // IMPORTANTE: Scriban procesa mejor objetos anónimos o Dictionaries. 
                // JsonSerializer deserializa el rawText a una estructura dinámica compatible.
                var data = JsonSerializer.Deserialize<object>(rawData.GetRawText()) ?? new { };

                var request = new DocumentRequest
                {
                    TemplateCode = templateCode,
                    Data = data,
                    IsDraftMode = isDraft,
                    IsBlindMode = isBlind,
                    RequestedBy = User.Identity?.Name ?? "Sistema DOSIER (Universal Render)"
                };

                var result = await _documentEngine.GenerateAsync(request);

                return File(result.PdfBytes, "application/pdf", result.FileName);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[DOSIER CORE] Error crítico en renderizado universal");
                return BadRequest(new { error = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene la lista de plantillas disponibles en el catálogo institucional.
        /// </summary>
        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _documentEngine.GetAvailableTemplatesAsync();
            return Ok(templates);
        }

        /// <summary>
        /// VALIDADOR PÚBLICO DE TRAZABILIDAD E INTEGRIDAD DE DOCUMENTOS (CACES Compliance)
        /// -------------------------------------------------------------------------
        /// Permite a cualquier persona u organismo externo (CACES) verificar la validez 
        /// y autenticidad de un documento mediante su código de trazabilidad único.
        /// </summary>
        [HttpGet("verify/{code}")]
        [AllowAnonymous]
        public async Task<IActionResult> Verify(
            string code, 
            [FromServices] IDocumentVerificationService verificationService,
            System.Threading.CancellationToken ct)
        {
            _logger.LogInformation("[DOSIER CORE] Solicitud de verificación pública de trazabilidad para código: {Code}", code);

            if (string.IsNullOrWhiteSpace(code))
            {
                return BadRequest(new { error = "El código de verificación es requerido." });
            }

            var result = await verificationService.VerifyDocumentByCodeAsync(code, ct);
            if (result == null)
            {
                return NotFound(new { error = "El código de trazabilidad o firma no es válido, o el documento no ha sido emitido oficialmente." });
            }

            return Ok(result);
        }
    }
}

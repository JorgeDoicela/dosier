using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Common.Notifications;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/Admin/email-engine")]
    [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR,DOSIER_COORD_CARRERA")]
    public class EmailEngineController : ControllerBase
    {
        private readonly IEmailEngineService _emailEngineService;

        public EmailEngineController(IEmailEngineService emailEngineService)
        {
            _emailEngineService = emailEngineService;
        }

        private EmailActorContext BuildActorContext()
        {
            int? userId = null;
            var rawId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            if (int.TryParse(rawId, out var parsedId))
                userId = parsedId;

            var identifier = User.FindFirstValue("id_sigafi")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub")
                ?? User.FindFirstValue(ClaimTypes.Email);

            var roles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                .Select(c => c.Value)
                .Where(v => !string.IsNullOrWhiteSpace(v))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            return new EmailActorContext
            {
                UserId = userId,
                Identifier = identifier,
                Roles = roles
            };
        }

        [HttpGet("scope")]
        public async Task<IActionResult> GetScope()
        {
            var scope = await _emailEngineService.GetScopeAsync(BuildActorContext());
            return Ok(scope);
        }

        [HttpGet("recipients")]
        public async Task<IActionResult> SearchRecipients(
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] int? carreraId = null,
            [FromQuery] int limit = 50)
        {
            var recipients = await _emailEngineService.SearchRecipientsAsync(
                BuildActorContext(),
                search,
                type,
                carreraId,
                limit);
            return Ok(recipients);
        }

        [HttpPost("audience/preview")]
        public async Task<IActionResult> PreviewAudience([FromBody] EmailAudiencePreviewRequest request)
        {
            request.TargetCarreraIds ??= new List<int>();
            request.TargetModalidadIds ??= new List<int>();

            try
            {
                var preview = await _emailEngineService.PreviewAudienceAsync(request, BuildActorContext());
                return Ok(preview);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("templates")]
        public async Task<IActionResult> GetTemplates()
        {
            var templates = await _emailEngineService.GetTemplatesAsync();
            return Ok(templates);
        }

        [HttpGet("templates/{id}")]
        public async Task<IActionResult> GetTemplateById(int id)
        {
            var template = await _emailEngineService.GetTemplateByIdAsync(id);
            if (template == null) return NotFound("Plantilla no encontrada");
            return Ok(template);
        }

        [HttpPost("templates")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
        public async Task<IActionResult> CreateTemplate([FromBody] EmailTemplateDto template)
        {
            var created = await _emailEngineService.CreateTemplateAsync(template);
            return CreatedAtAction(nameof(GetTemplateById), new { id = created.IdEmailTemplate }, created);
        }

        [HttpPut("templates/{id}")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] EmailTemplateDto template)
        {
            if (id != template.IdEmailTemplate) return BadRequest("ID no coincide");
            var updated = await _emailEngineService.UpdateTemplateAsync(template);
            return Ok(updated);
        }

        [HttpDelete("templates/{id}")]
        [Authorize(Roles = "DOSIER_ADMIN")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            await _emailEngineService.DeleteTemplateAsync(id);
            return NoContent();
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int limit = 50)
        {
            var history = await _emailEngineService.GetEmailHistoryAsync(limit, BuildActorContext());
            return Ok(history);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailSendRequest request)
        {
            request.DestinatariosEmails ??= new List<string>();
            request.DestinatariosUserIds ??= new List<int>();
            request.TargetCarreraIds ??= new List<int>();
            request.TargetModalidadIds ??= new List<int>();
            request.Attachments ??= new List<EmailAttachmentDto>();
            request.TemplateData ??= new Dictionary<string, string>();

            var hasExplicitEmails = request.DestinatariosEmails.Any(e => !string.IsNullOrWhiteSpace(e));
            var hasGroupFilters = !string.IsNullOrEmpty(request.TargetRole)
                || request.TargetCarreraId.HasValue
                || request.TargetCarreraIds.Any(x => x > 0)
                || request.TargetModalidadIds.Any(x => x > 0)
                || !string.IsNullOrWhiteSpace(request.TargetPeaEstado);
            var hasUserIds = request.DestinatariosUserIds.Any();

            if (!hasExplicitEmails && !hasGroupFilters && !hasUserIds)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Debe indicar al menos un destinatario (persona específica o criterio de grupo: modalidad, carrera, rol o estado PEA)."
                });
            }

            if (string.IsNullOrWhiteSpace(request.TemplateCodigo) && string.IsNullOrWhiteSpace(request.CustomBody))
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Debe proporcionar una plantilla (TemplateCodigo) o un cuerpo de mensaje personalizado (CustomBody)."
                });
            }

            try
            {
                var success = await _emailEngineService.SendTemplatedEmailAsync(request, BuildActorContext());
                if (success)
                {
                    return Ok(new { success = true, message = "Correos despachados correctamente." });
                }
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(403, new { success = false, message = ex.Message });
            }

            if (!hasExplicitEmails && !hasUserIds && hasGroupFilters)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se encontraron usuarios activos con correo institucional para los criterios de grupo seleccionados."
                });
            }

            if (hasExplicitEmails || hasUserIds)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se encontraron destinatarios válidos. Verifique que los correos estén bien escritos."
                });
            }

            return StatusCode(500, new { success = false, message = "Hubo un error al despachar algunos correos." });
        }
    }
}

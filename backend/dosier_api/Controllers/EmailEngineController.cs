using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Common.Notifications;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/Admin/email-engine")]
    [Authorize]
    public class EmailEngineController : ControllerBase
    {
        private readonly IEmailEngineService _emailEngineService;

        public EmailEngineController(IEmailEngineService emailEngineService)
        {
            _emailEngineService = emailEngineService;
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
        public async Task<IActionResult> CreateTemplate([FromBody] EmailTemplateDto template)
        {
            var created = await _emailEngineService.CreateTemplateAsync(template);
            return CreatedAtAction(nameof(GetTemplateById), new { id = created.IdEmailTemplate }, created);
        }

        [HttpPut("templates/{id}")]
        public async Task<IActionResult> UpdateTemplate(int id, [FromBody] EmailTemplateDto template)
        {
            if (id != template.IdEmailTemplate) return BadRequest("ID no coincide");
            var updated = await _emailEngineService.UpdateTemplateAsync(template);
            return Ok(updated);
        }

        [HttpDelete("templates/{id}")]
        public async Task<IActionResult> DeleteTemplate(int id)
        {
            await _emailEngineService.DeleteTemplateAsync(id);
            return NoContent();
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetHistory([FromQuery] int limit = 50)
        {
            var history = await _emailEngineService.GetEmailHistoryAsync(limit);
            return Ok(history);
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailSendRequest request)
        {
            request.DestinatariosEmails ??= new List<string>();
            request.DestinatariosUserIds ??= new List<int>();
            request.Attachments ??= new List<EmailAttachmentDto>();
            request.TemplateData ??= new Dictionary<string, string>();

            var hasExplicitEmails = request.DestinatariosEmails.Any(e => !string.IsNullOrWhiteSpace(e));
            var hasRoleOrCarrera = !string.IsNullOrEmpty(request.TargetRole) || request.TargetCarreraId.HasValue;
            var hasUserIds = request.DestinatariosUserIds.Any();

            if (!hasExplicitEmails && !hasRoleOrCarrera && !hasUserIds)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Debe indicar al menos un destinatario (correo manual, rol, carrera o usuario)."
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

            var success = await _emailEngineService.SendTemplatedEmailAsync(request);
            if (success)
            {
                return Ok(new { success = true, message = "Correos despachados correctamente." });
            }

            if (!hasExplicitEmails && !hasUserIds && hasRoleOrCarrera)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "No se encontraron usuarios activos con correo institucional para el rol o carrera seleccionados."
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

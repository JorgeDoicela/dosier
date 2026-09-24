using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Research;
using Dosier.Application.Research;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecycleBinController : ControllerBase
    {
        private readonly IRecycleBinService _recycleBinService;
        private readonly IProjectOrchestrator _projectOrchestrator;

        public RecycleBinController(
            IRecycleBinService recycleBinService,
            IProjectOrchestrator projectOrchestrator)
        {
            _recycleBinService = recycleBinService;
            _projectOrchestrator = projectOrchestrator;
        }

        private bool IsAdmin()
        {
            return User.IsInRole("DOSIER_ADMIN");
        }

        [HttpGet("projects")]
        public async Task<IActionResult> GetDeletedProjects()
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdRef)) return Unauthorized();

            var projects = await _recycleBinService.GetDeletedProjectsAsync(userIdRef, IsAdmin());
            if (projects == null) return Unauthorized();

            return Ok(projects);
        }

        [HttpPost("restore/{entityType}/{uuid}")]
        public async Task<IActionResult> Restore(string entityType, string uuid)
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            bool success = false;

            if (entityType.Equals("project", StringComparison.OrdinalIgnoreCase))
            {
                var result = await _projectOrchestrator.RestoreProjectAsync(uuid, userIdRef);
                success = result.Success;
            }
            else
            {
                return BadRequest(new { message = "Tipo de entidad inválido." });
            }

            if (!success) return BadRequest(new { message = "No se pudo restaurar el elemento." });
            return Ok(new { success = true, message = "Elemento restaurado con éxito." });
        }

        [HttpDelete("purge/{entityType}/{uuid}")]
        public async Task<IActionResult> Purge(string entityType, string uuid)
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            bool success = false;
            string message = string.Empty;

            if (entityType.Equals("project", StringComparison.OrdinalIgnoreCase))
            {
                var result = await _projectOrchestrator.PurgeProjectAsync(uuid, userIdRef);
                success = result.Success;
                message = result.Message ?? string.Empty;
            }
            else
            {
                return BadRequest(new { message = "Tipo de entidad inválido." });
            }

            if (!success) return BadRequest(new { message = !string.IsNullOrEmpty(message) ? message : "No se pudo eliminar permanentemente el elemento." });
            return Ok(new { success = true, message = "Elemento eliminado permanentemente." });
        }
    }
}

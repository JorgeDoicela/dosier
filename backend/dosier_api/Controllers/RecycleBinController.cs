using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Common.Interfaces;
using dosier_infrastructure.Common;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecycleBinController : ControllerBase
    {
        private readonly IRecycleBinService _recycleBinService;

        public RecycleBinController(IRecycleBinService recycleBinService)
        {
            _recycleBinService = recycleBinService;
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

            var projects = await _recycleBinService.GetDeletedItemsAsync(userIdRef, IsAdmin());
            if (projects == null) return Unauthorized();

            return Ok(projects);
        }

        [HttpPost("restore/{entityType}/{uuid}")]
        public async Task<IActionResult> Restore(string entityType, string uuid)
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdRef)) return Unauthorized();

            if (_recycleBinService is RecycleBinService service)
            {
                var success = await service.RestoreItemAsync(uuid, userIdRef);
                if (!success) return BadRequest(new { message = "No se pudo restaurar el elemento." });
                return Ok(new { success = true, message = "Elemento curricular restaurado con éxito." });
            }

            return BadRequest(new { message = "Operación no soportada." });
        }

        [HttpDelete("purge/{entityType}/{uuid}")]
        public async Task<IActionResult> Purge(string entityType, string uuid)
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdRef)) return Unauthorized();

            if (_recycleBinService is RecycleBinService service)
            {
                var success = await service.PurgeItemAsync(uuid, userIdRef);
                if (!success) return BadRequest(new { message = "No se pudo eliminar permanentemente el elemento." });
                return Ok(new { success = true, message = "Elemento eliminado permanentemente." });
            }

            return BadRequest(new { message = "Operación no soportada." });
        }
    }
}

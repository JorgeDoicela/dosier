using dosier_application.Research;
using dosier_application.Research.Dtos;
using Dosier.Application.Research;
using dosier_infrastructure.data.models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RecycleBinController : ControllerBase
    {
        private readonly DosierContext _context;
        private readonly IProjectOrchestrator _projectOrchestrator;

        public RecycleBinController(
            DosierContext context,
            IProjectOrchestrator projectOrchestrator)
        {
            _context = context;
            _projectOrchestrator = projectOrchestrator;
        }

        private async Task<int?> GetInternalUserIdAsync()
        {
            var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdRef)) return null;
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdSigafi == userIdRef);
            return user?.IdUsuario;
        }

        private bool IsAdmin()
        {
            return User.IsInRole("DOSIER_ADMIN");
        }

        private static string CleanDeletedSuffix(string? code)
        {
            if (string.IsNullOrWhiteSpace(code)) return "";
            var idx = code.IndexOf("_del_");
            return idx > 0 ? code.Substring(0, idx) : code;
        }

        [HttpGet("projects")]
        public async Task<IActionResult> GetDeletedProjects()
        {
            int? currentUserId = await GetInternalUserIdAsync();
            if (currentUserId == null) return Unauthorized();

            bool isAdmin = IsAdmin();

            // Consultar omitiendo filtros globales (IgnoreQueryFilters) para ver eliminados
            var projectsQuery = _context.DocProyectos
                .IgnoreQueryFilters()
                .Where(p => p.Eliminado == true);

            if (!isAdmin)
            {
                // Un docente solo ve los proyectos que él mismo envió a la papelera
                projectsQuery = projectsQuery.Where(p => p.EliminadoPorUsuarioId == currentUserId);
            }

            var rawProjects = await projectsQuery
                .Select(p => new
                {
                    p.Uuid,
                    p.Titulo,
                    RawCodigoInstitucional = p.CodigoInstitucional,
                    p.Estado,
                    p.FechaEliminacion,
                    EliminadoPor = p.EliminadoPorUsuarioId != null
                        ? _context.Users.Where(u => u.IdUsuario == p.EliminadoPorUsuarioId).Select(u => u.Nombre).FirstOrDefault()
                        : "Desconocido"
                })
                .ToListAsync();

            var projects = rawProjects.Select(p => new
            {
                p.Uuid,
                p.Titulo,
                CodigoInstitucional = CleanDeletedSuffix(p.RawCodigoInstitucional),
                p.Estado,
                p.FechaEliminacion,
                p.EliminadoPor
            });

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

using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/pea")]
    [Authorize]
    public class PeaController : ControllerBase
    {
        private readonly IPeaService _peaService;

        public PeaController(IPeaService peaService)
        {
            _peaService = peaService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pea = await _peaService.GetByIdAsync(id);
            if (pea == null) return NotFound($"No se encontró el PEA con id {id}");
            return Ok(pea);
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> GetByAsignaturaPeriodo([FromQuery] int idAsignatura, [FromQuery] string idPeriodo)
        {
            var pea = await _peaService.GetByAsignaturaPeriodoAsync(idAsignatura, idPeriodo);
            if (pea == null) return NotFound("No existe un PEA registrado para esta asignatura y período.");
            return Ok(pea);
        }

        [HttpPost]
        public async Task<IActionResult> Guardar([FromBody] PeaDto dto)
        {
            if (dto == null) return BadRequest("El cuerpo del PEA no puede ser nulo.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var result = await _peaService.GuardarPeaAsync(dto, userId);
            return Ok(result);
        }

        [HttpPost("desde-asignacion/{idAsignacion:int}")]
        public async Task<IActionResult> CrearDesdeAsignacion(int idAsignacion)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "No se pudo identificar al docente autenticado." });

            var result = await _peaService.CrearDesdeAsignacionAsync(idAsignacion, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.IdPea }, result);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _peaService.CambiarEstadoAsync(id, req.NuevoEstado, req.Firma, userId, req.Motivo);
            if (!ok) return NotFound("No se pudo actualizar el estado del PEA.");
            return Ok(new { success = true });
        }

        [HttpPost("{id}/clonar")]
        public async Task<IActionResult> Clonar(int id, [FromQuery] string nuevoPeriodo)
        {
            if (string.IsNullOrEmpty(nuevoPeriodo)) return BadRequest("Debe especificar el nuevo período académico.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var clonado = await _peaService.ClonarPeaPeriodoAsync(id, nuevoPeriodo, userId);
            return Ok(clonado);
        }

        // =====================================================================
        // ENDPOINTS DE OBSERVACIONES Y WORKFLOW COLEGIADO
        // =====================================================================

        [HttpGet("{id:int}/observaciones")]
        public async Task<IActionResult> GetObservaciones(int id)
        {
            var list = await _peaService.GetObservacionesByPeaAsync(id);
            return Ok(list);
        }

        [HttpPost("{id:int}/observaciones")]
        public async Task<IActionResult> AgregarObservacion(int id, [FromBody] AgregarObservacionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Texto)) return BadRequest("El texto de la observación no puede estar vacío.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var obs = await _peaService.AgregarObservacionAsync(id, req.RolObservador ?? "CoordinadorCarrera", req.SeccionAfectada ?? "General", req.Texto, idUserInt);
            return Ok(obs);
        }

        [HttpPatch("observaciones/{idObs:int}/subsanar")]
        public async Task<IActionResult> SubsanarObservacion(int idObs, [FromBody] SubsanarObservacionRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var ok = await _peaService.SubsanarObservacionAsync(idObs, req.RespuestaDocente, idUserInt);
            if (!ok) return NotFound("No se encontró la observación.");
            return Ok(new { success = true });
        }

        [HttpGet("{id:int}/trazabilidad")]
        public async Task<IActionResult> GetTrazabilidad(int id)
        {
            var list = await _peaService.GetTrazabilidadByPeaAsync(id);
            return Ok(list);
        }
    }

    public class CambiarEstadoRequest
    {
        public string NuevoEstado { get; set; } = string.Empty;
        public string? Firma { get; set; }
        public string? Motivo { get; set; }
    }

    public class AgregarObservacionRequest
    {
        public string? RolObservador { get; set; }
        public string? SeccionAfectada { get; set; }
        public string Texto { get; set; } = string.Empty;
    }

    public class SubsanarObservacionRequest
    {
        public string RespuestaDocente { get; set; } = string.Empty;
    }
}

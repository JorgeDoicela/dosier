using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/guia-ape")]
    [Authorize]
    public class GuiaApeController : ControllerBase
    {
        private readonly IGuiaApeService _guiaApeService;

        public GuiaApeController(IGuiaApeService guiaApeService)
        {
            _guiaApeService = guiaApeService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var guia = await _guiaApeService.GetByIdAsync(id);
            if (guia == null) return NotFound($"No se encontró la Guía APE con id {id}");
            return Ok(guia);
        }

        [HttpGet("by-pea/{peaId}")]
        public async Task<IActionResult> GetByPeaId(int peaId)
        {
            var guias = await _guiaApeService.GetGuiasByPeaIdAsync(peaId);
            return Ok(guias);
        }

        [HttpPost("from-pea/{peaId}/practica/{practicaId}")]
        public async Task<IActionResult> GenerarDesdePracticaPea(int peaId, int practicaId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var guia = await _guiaApeService.GenerarGuiaDesdePracticaPeaAsync(peaId, practicaId, userId);
            return Ok(guia);
        }

        [HttpPost]
        public async Task<IActionResult> Guardar([FromBody] GuiaApeDto dto)
        {
            if (dto == null) return BadRequest("El cuerpo de la Guía APE no puede ser nulo.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var result = await _guiaApeService.GuardarGuiaApeAsync(dto, userId);
            return Ok(result);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _guiaApeService.CambiarEstadoAsync(id, req.NuevoEstado, req.Firma, userId);
            if (!ok) return NotFound("No se pudo actualizar el estado de la Guía APE.");
            return Ok(new { success = true });
        }
    }
}

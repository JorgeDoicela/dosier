using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/guia-estudio")]
    [Authorize]
    public class GuiaEstudioController : ControllerBase
    {
        private readonly IGuiaEstudioService _guiaEstudioService;

        public GuiaEstudioController(IGuiaEstudioService guiaEstudioService)
        {
            _guiaEstudioService = guiaEstudioService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var guia = await _guiaEstudioService.GetByIdAsync(id);
            if (guia == null) return NotFound($"No se encontró la Guía de Estudio con id {id}");
            return Ok(guia);
        }

        [HttpGet("by-pea/{peaId}")]
        public async Task<IActionResult> GetByPeaId(int peaId)
        {
            var guia = await _guiaEstudioService.GetByPeaIdAsync(peaId);
            if (guia == null) return NotFound($"No existe una Guía de Estudio para el PEA {peaId}");
            return Ok(guia);
        }

        [HttpPost("from-pea/{peaId}")]
        public async Task<IActionResult> GenerarDesdePea(int peaId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var guia = await _guiaEstudioService.GenerarGuiaEstudioDesdePeaAsync(peaId, userId);
            return Ok(guia);
        }

        [HttpPost]
        public async Task<IActionResult> Guardar([FromBody] GuiaEstudioDto dto)
        {
            if (dto == null) return BadRequest("El cuerpo de la Guía de Estudio no puede ser nulo.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var result = await _guiaEstudioService.GuardarGuiaEstudioAsync(dto, userId);
            return Ok(result);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _guiaEstudioService.CambiarEstadoAsync(id, req.NuevoEstado, req.Firma, userId);
            if (!ok) return NotFound("No se pudo actualizar el estado de la Guía de Estudio.");
            return Ok(new { success = true });
        }
    }
}

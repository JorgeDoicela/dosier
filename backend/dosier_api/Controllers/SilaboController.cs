using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/silabo")]
    [Authorize]
    public class SilaboController : ControllerBase
    {
        private readonly ISilaboService _silaboService;

        public SilaboController(ISilaboService silaboService)
        {
            _silaboService = silaboService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var silabo = await _silaboService.GetByIdAsync(id);
            if (silabo == null) return NotFound($"No se encontró el Sílabo con id {id}");
            return Ok(silabo);
        }

        [HttpGet("by-pea/{peaId}")]
        public async Task<IActionResult> GetByPeaId(int peaId)
        {
            var silabo = await _silaboService.GetByPeaIdAsync(peaId);
            if (silabo == null) return NotFound($"No existe un Sílabo para el PEA {peaId}");
            return Ok(silabo);
        }

        [HttpPost("from-pea/{peaId}")]
        public async Task<IActionResult> GenerarDesdePea(int peaId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var silabo = await _silaboService.GenerarSilaboDesdePeaAsync(peaId, userId);
            return Ok(silabo);
        }

        [HttpPost]
        public async Task<IActionResult> Guardar([FromBody] SilaboDto dto)
        {
            if (dto == null) return BadRequest("El cuerpo del Sílabo no puede ser nulo.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var result = await _silaboService.GuardarSilaboAsync(dto, userId);
            return Ok(result);
        }

        [HttpPatch("{id}/estado")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _silaboService.CambiarEstadoAsync(id, req.NuevoEstado, req.Firma, userId);
            if (!ok) return NotFound("No se pudo actualizar el estado del Sílabo.");
            return Ok(new { success = true });
        }
    }
}

using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Common.Dtos;
using dosier_application.Common.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/catalogs")]
    public class CatalogsController : ControllerBase
    {
        private readonly ICatalogsService _catalogsService;

        public CatalogsController(ICatalogsService catalogsService)
        {
            _catalogsService = catalogsService;
        }

        [HttpGet("config-general")]
        public async Task<IActionResult> GetConfigGeneral([FromQuery] string? prefix = null)
        {
            var data = await _catalogsService.GetConfigGeneralAsync(prefix);
            return Ok(data);
        }

        [HttpGet("carreras")]
        public async Task<IActionResult> GetCarreras()
        {
            var data = await _catalogsService.GetCarrerasAsync();
            return Ok(data);
        }

        /// <summary>
        /// Devuelve las carreras vinculadas al usuario autenticado en el periodo académico activo.
        /// </summary>
        [HttpGet("mi-carrera")]
        [Authorize]
        public async Task<IActionResult> GetMiCarrera()
        {
            var idReferencia = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrWhiteSpace(idReferencia))
                return Unauthorized();

            var careers = await _catalogsService.GetMiCarreraAsync(idReferencia);
            return Ok(careers);
        }

        // --- CRUD Periodos Académicos ---
        [HttpGet("periodos")]
        public async Task<IActionResult> GetPeriodos()
        {
            var data = await _catalogsService.GetPeriodosAsync();
            return Ok(data);
        }

        [HttpPost("periodos")]
        public async Task<IActionResult> CreatePeriodo([FromBody] PeriodoMutationDto model)
        {
            var result = await _catalogsService.CreatePeriodoAsync(model);
            return Created($"/api/catalogs/periodos/{result.IdPeriodo}", result);
        }

        [HttpPut("periodos/{id}")]
        public async Task<IActionResult> UpdatePeriodo(string id, [FromBody] PeriodoMutationDto model)
        {
            var result = await _catalogsService.UpdatePeriodoAsync(id, model);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("periodos/{id}")]
        public async Task<IActionResult> TogglePeriodo(string id)
        {
            var result = await _catalogsService.TogglePeriodoAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpGet("workflow/estados")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEstadosConfig()
        {
            var estados = await _catalogsService.GetEstadosConfigAsync();
            return Ok(estados);
        }
    }
}

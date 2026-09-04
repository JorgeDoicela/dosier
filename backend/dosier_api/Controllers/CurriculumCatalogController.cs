using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/curriculum")]
    [Authorize]
    public class CurriculumCatalogController : ControllerBase
    {
        private readonly ICurriculumCatalogService _catalogService;

        public CurriculumCatalogController(ICurriculumCatalogService catalogService)
        {
            _catalogService = catalogService;
        }

        [HttpGet("carreras")]
        public async Task<IActionResult> GetCarreras([FromQuery] string? idProfesor, [FromQuery] string? idPeriodo)
        {
            var result = await _catalogService.GetCarrerasDocenteAsync(idProfesor, idPeriodo);
            return Ok(result);
        }

        [HttpGet("asignaturas")]
        public async Task<IActionResult> GetAsignaturas([FromQuery] int idCarrera, [FromQuery] string? idProfesor, [FromQuery] string? idPeriodo)
        {
            if (idCarrera <= 0) return BadRequest("Debe especificar un idCarrera válido.");
            var result = await _catalogService.GetAsignaturasMallaAsync(idCarrera, idProfesor, idPeriodo);
            return Ok(result);
        }

        [HttpGet("periodos")]
        public async Task<IActionResult> GetPeriodos()
        {
            var result = await _catalogService.GetPeriodosAcademicosAsync();
            return Ok(result);
        }
    }
}

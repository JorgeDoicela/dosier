using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/expedientes-curriculares")]
    [Authorize]
    public class ExpedientesController : ControllerBase
    {
        private readonly IExpedienteCurricularService _expedienteService;

        public ExpedientesController(IExpedienteCurricularService expedienteService)
        {
            _expedienteService = expedienteService;
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var exp = await _expedienteService.GetByIdAsync(id);
            if (exp == null) return NotFound($"No se encontró el expediente curricular con ID {id}.");
            return Ok(exp);
        }

        [HttpGet("{id:int}/detalle")]
        public async Task<IActionResult> GetDetalle(int id)
        {
            var detalle = await _expedienteService.GetDetalleByIdAsync(id);
            if (detalle == null) return NotFound($"No se encontró el expediente curricular con ID {id}.");
            return Ok(detalle);
        }

        [HttpGet("asignacion/{idAsignacion:int}")]
        public async Task<IActionResult> GetByAsignacion(int idAsignacion)
        {
            var exp = await _expedienteService.GetByAsignacionAsync(idAsignacion);
            if (exp == null) return NotFound($"No existe expediente curricular para la asignación {idAsignacion}.");
            return Ok(exp);
        }

        [HttpGet("periodo/{idPeriodo}")]
        public async Task<IActionResult> ListarPorPeriodo(string idPeriodo, [FromQuery] int? idCarrera)
        {
            var list = await _expedienteService.ListarExpedientesPeriodoAsync(idPeriodo, idCarrera);
            return Ok(list);
        }

        [HttpPost("asegurar/asignacion/{idAsignacion:int}")]
        public async Task<IActionResult> AsegurarExpediente(int idAsignacion)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var exp = await _expedienteService.ObtenerOCrearExpedienteAsync(idAsignacion, userId);
            return Ok(exp);
        }
    }
}

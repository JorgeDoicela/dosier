using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Interfaces;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/normativas")]
    [Authorize]
    public class NormativasController : ControllerBase
    {
        private readonly INormativaService _normativaService;
        private readonly IPerfilEgresoService _perfilEgresoService;

        public NormativasController(
            INormativaService normativaService,
            IPerfilEgresoService perfilEgresoService)
        {
            _normativaService = normativaService;
            _perfilEgresoService = perfilEgresoService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNormativas([FromQuery] string? organismo)
        {
            var list = await _normativaService.GetNormativasVigentesAsync(organismo);
            return Ok(list);
        }

        [HttpGet("checklist")]
        public async Task<IActionResult> GetChecklist([FromQuery] string? organismo)
        {
            var list = await _normativaService.GetChecklistCurricularAsync(organismo);
            return Ok(list);
        }

        [HttpGet("modelo-educativo")]
        public async Task<IActionResult> GetModeloEducativo()
        {
            var modelo = await _normativaService.GetModeloEducativoVigenteAsync();
            if (modelo == null) return NotFound("No se encontró un modelo educativo institucional activo.");
            return Ok(modelo);
        }

        [HttpGet("perfil-egreso")]
        public async Task<IActionResult> GetPerfilEgreso([FromQuery] int idCarrera, [FromQuery] int idMalla)
        {
            var perfil = await _perfilEgresoService.GetPerfilByCarreraMallaAsync(idCarrera, idMalla);
            if (perfil == null) return NotFound("No se encontró perfil de egreso para la carrera y malla especificadas.");
            return Ok(perfil);
        }

        [HttpGet("tributacion-asignatura")]
        public async Task<IActionResult> GetTributacion([FromQuery] int idAsignatura, [FromQuery] int idMalla)
        {
            var list = await _perfilEgresoService.GetTributacionAsignaturaAsync(idAsignatura, idMalla);
            return Ok(list);
        }

        [HttpGet("proyecto-curricular")]
        public async Task<IActionResult> GetProyectoCurricular([FromQuery] int idCarrera, [FromQuery] int idMalla)
        {
            var proy = await _perfilEgresoService.GetProyectoCurricularAsync(idCarrera, idMalla);
            if (proy == null) return NotFound("No se encontró resolución de carrera CES registrada.");
            return Ok(proy);
        }
    }
}

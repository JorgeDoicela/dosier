using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Academico;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/docente-asignaturas")]
[Authorize]
public class DocenteAsignaturasController : ControllerBase
{
    private readonly IAsignaturasDocenteService _service;
    private readonly IAcademicContextResolver _contextResolver;

    public DocenteAsignaturasController(
        IAsignaturasDocenteService service,
        IAcademicContextResolver contextResolver)
    {
        _service = service;
        _contextResolver = contextResolver;
    }

    /// <summary>
    /// Resuelve el contexto curricular oficial de una asignacion docente.
    /// Este contexto es compartido por PEA, silabo y guias y sus datos son de solo lectura.
    /// </summary>
    [HttpGet("contexto/{idAsignacion:int}")]
    public async Task<IActionResult> GetContextoAcademico(int idAsignacion, CancellationToken cancellationToken)
    {
        var idProfesor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(idProfesor))
            return Unauthorized(new { message = "No se pudo identificar la cedula del docente en el token." });

        var context = await _contextResolver.ResolveByAssignmentAsync(
            idAsignacion,
            idProfesor,
            cancellationToken);

        if (context == null)
            return NotFound(new { message = "No se encontro una asignacion institucional valida para el docente." });

        return Ok(context);
    }

    /// <summary>
    /// Obtiene el período académico activo del instituto.
    /// </summary>
    [HttpGet("periodo-activo")]
    public async Task<IActionResult> GetPeriodoActivo()
    {
        var periodo = await _service.GetPeriodoActivoAsync();
        if (periodo == null)
            return NotFound(new { message = "No se encontró ningún período activo." });

        return Ok(periodo);
    }

    /// <summary>
    /// Obtiene la lista de todos los períodos disponibles en el instituto.
    /// </summary>
    [HttpGet("periodos")]
    public async Task<IActionResult> GetPeriodos()
    {
        var periodos = await _service.GetPeriodosDisponiblesAsync();
        return Ok(periodos);
    }

    /// <summary>
    /// Obtiene todas las asignaturas asignadas al docente autenticado en el período indicado (o en el activo).
    /// </summary>
    [HttpGet("mis-materias")]
    public async Task<IActionResult> GetMisMaterias([FromQuery] string? periodoId = null)
    {
        var idProfesor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                         ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(idProfesor))
            return Unauthorized(new { message = "No se pudo identificar la cédula del docente en el token." });

        var asignaturas = await _service.GetMisAsignaturasAsync(idProfesor, periodoId);
        return Ok(asignaturas);
    }

    /// <summary>
    /// Obtiene el detalle curricular oficial (horas, créditos, malla, prerrequisitos) de una asignatura y carrera.
    /// </summary>
    [HttpGet("curriculo/{idAsignatura:int}/{idCarrera:int}")]
    public async Task<IActionResult> GetCurriculoAsignatura(int idAsignatura, int idCarrera)
    {
        var curriculo = await _service.GetCurriculoAsignaturaAsync(idAsignatura, idCarrera);
        if (curriculo == null)
            return NotFound(new { message = "No se encontró información curricular para la asignatura y carrera especificadas." });

        return Ok(curriculo);
    }
}

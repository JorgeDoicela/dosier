using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using dosier_application.Academico;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/docente-asignaturas")]
[Authorize]
public class DocenteAsignaturasController : ControllerBase
{
    private readonly IAsignaturasDocenteService _service;
    private readonly IAcademicContextResolver _contextResolver;
    private readonly ILogger<DocenteAsignaturasController> _logger;

    public DocenteAsignaturasController(
        IAsignaturasDocenteService service,
        IAcademicContextResolver contextResolver,
        ILogger<DocenteAsignaturasController> logger)
    {
        _service = service;
        _contextResolver = contextResolver;
        _logger = logger;
    }

    /// <summary>
    /// Resuelve el contexto curricular oficial de una asignacion docente.
    /// Este contexto es utilizado por el PEA y sus datos son de solo lectura.
    /// </summary>
    [HttpGet("contexto/{idAsignacion:int}")]
    public async Task<IActionResult> GetContextoAcademico(int idAsignacion, CancellationToken cancellationToken)
    {
        var idProfesor = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(idProfesor))
            return Unauthorized(new { message = "No se pudo identificar la cedula del docente en el token." });

        try
        {
            var context = await _contextResolver.ResolveByAssignmentAsync(
                idAsignacion,
                idProfesor,
                cancellationToken);

            if (context == null)
                return NotFound(new { message = "No se encontro una asignacion institucional valida para el docente." });

            return Ok(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al resolver contexto academico para asignacion {IdAsignacion} y profesor {IdProfesor}", idAsignacion, idProfesor);
            return StatusCode(500, new { message = "Error al resolver el contexto curricular oficial", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el período académico activo del instituto.
    /// </summary>
    [HttpGet("periodo-activo")]
    public async Task<IActionResult> GetPeriodoActivo()
    {
        try
        {
            var periodo = await _service.GetPeriodoActivoAsync();
            if (periodo == null)
                return NotFound(new { message = "No se encontró ningún período activo." });

            return Ok(periodo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener periodo activo");
            return StatusCode(500, new { message = "Error interno al consultar el periodo activo", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene la lista de todos los períodos disponibles en el instituto.
    /// </summary>
    [HttpGet("periodos")]
    public async Task<IActionResult> GetPeriodos()
    {
        try
        {
            var periodos = await _service.GetPeriodosDisponiblesAsync();
            return Ok(periodos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener lista de periodos");
            return StatusCode(500, new { message = "Error interno al consultar la lista de periodos", error = ex.Message });
        }
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

        try
        {
            var asignaturas = await _service.GetMisAsignaturasAsync(idProfesor, periodoId);
            return Ok(asignaturas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener mis materias para profesor {IdProfesor} en periodo {PeriodoId}", idProfesor, periodoId);
            return StatusCode(500, new { message = "Error interno al consultar materias del docente", error = ex.Message });
        }
    }

    /// <summary>
    /// Obtiene el detalle curricular oficial (horas, créditos, malla, prerrequisitos) de una asignatura y carrera.
    /// </summary>
    [HttpGet("curriculo/{idAsignatura:int}/{idCarrera:int}")]
    public async Task<IActionResult> GetCurriculoAsignatura(int idAsignatura, int idCarrera)
    {
        try
        {
            var curriculo = await _service.GetCurriculoAsignaturaAsync(idAsignatura, idCarrera);
            if (curriculo == null)
                return NotFound(new { message = "No se encontró información curricular para la asignatura y carrera especificadas." });

            return Ok(curriculo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener curriculo para asignatura {IdAsignatura} y carrera {IdCarrera}", idAsignatura, idCarrera);
            return StatusCode(500, new { message = "Error interno al consultar el curriculo de la asignatura", error = ex.Message });
        }
    }
}

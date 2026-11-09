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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub") ?? "0";
            var exp = await _expedienteService.ObtenerOCrearExpedienteAsync(idAsignacion, userId);
            return Ok(exp);
        }

        // =====================================================================
        // ENDPOINTS DE SALAS CURRICULARES COLEGIADAS POR CARRERA Y PRE-PEA
        // =====================================================================

        /// <summary>
        /// Obtiene el estado actual de la sala curricular de la carrera para el período indicado.
        /// </summary>
        [HttpGet("sala-carrera/{idCarrera:int}/{idPeriodo}")]
        public async Task<IActionResult> GetEstadoSalaCarrera(int idCarrera, string idPeriodo)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id_sigafi") ?? "0";
            var estado = await _expedienteService.GetEstadoSalaCarreraAsync(idCarrera, idPeriodo, userId);
            return Ok(estado);
        }

        /// <summary>
        /// Abre o cierra la sesión colegiada en tiempo real de la sala de carrera (Coordinadores o Administradores).
        /// </summary>
        [HttpPost("sala-carrera/{idCarrera:int}/{idPeriodo}/conmutar")]
        public async Task<IActionResult> ConmutarSalaCarrera(int idCarrera, string idPeriodo, [FromBody] ConmutarSalaCarreraRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id_sigafi") ?? "0";
            var resultado = await _expedienteService.ConmutarEstadoSalaCarreraAsync(idCarrera, idPeriodo, request.Activar, request.TemaPrincipal, userId);
            return Ok(new { success = resultado, activa = request.Activar });
        }

        /// <summary>
        /// Obtiene el borrador pre-PEA y acuerdos registrados para una asignatura en su expediente.
        /// </summary>
        [HttpGet("{idExpediente:int}/borrador-pre-pea")]
        public async Task<IActionResult> GetBorradorPrePea(int idExpediente)
        {
            var borrador = await _expedienteService.GetBorradorPrePeaAsync(idExpediente);
            if (borrador == null) return NotFound("Expediente no encontrado.");
            return Ok(borrador);
        }

        /// <summary>
        /// Guarda o actualiza los acuerdos y borrador pre-PEA formulados en la sala de carrera.
        /// </summary>
        [HttpPut("{idExpediente:int}/borrador-pre-pea")]
        public async Task<IActionResult> GuardarBorradorPrePea(int idExpediente, [FromBody] GuardarBorradorPrePeaRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id_sigafi") ?? "0";
            var borradorActualizado = await _expedienteService.GuardarBorradorPrePeaAsync(idExpediente, request.Borrador, userId);
            return Ok(borradorActualizado);
        }

        /// <summary>
        /// Inyecta los acuerdos y borrador pre-PEA directamente en el PEA oficial de la asignatura.
        /// </summary>
        [HttpPost("{idExpediente:int}/aplicar-borrador-pea")]
        public async Task<IActionResult> AplicarBorradorASalaPea(int idExpediente, [FromQuery] int? idPea)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id_sigafi") ?? "0";
            try
            {
                var peaActualizado = await _expedienteService.AplicarBorradorASalaPeaAsync(idExpediente, idPea, userId);
                return Ok(new { success = true, pea = peaActualizado, message = "Borrador de la Sala Curricular aplicado con éxito al PEA oficial." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Genera el acta o minuta oficial de acuerdos de armonización curricular de la carrera en formato PDF.
        /// </summary>
        [HttpPost("sala-carrera/{idCarrera:int}/{idPeriodo}/generar-acta")]
        public async Task<IActionResult> GenerarActaCarrera(int idCarrera, string idPeriodo)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("id_sigafi") ?? "0";
            try
            {
                var (pdfBytes, fileName, traceabilityCode) = await _expedienteService.GenerarActaAcuerdosCarreraAsync(idCarrera, idPeriodo, userId);
                Response.Headers.Append("X-Traceability-Code", traceabilityCode);
                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error al compilar el acta institucional en PDF", detail = ex.Message });
            }
        }
    }
}

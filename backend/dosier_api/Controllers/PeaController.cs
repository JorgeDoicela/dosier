using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;

using Microsoft.Extensions.Logging;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/pea")]
    [Authorize]
    public class PeaController : ControllerBase
    {
        private readonly IPeaService _peaService;
        private readonly IPeaAiAssistantService _peaAiService;
        private readonly IPeaDocumentExtractorService _peaExtractorService;
        private readonly ILogger<PeaController> _logger;

        public PeaController(
            IPeaService peaService,
            IPeaAiAssistantService peaAiService,
            IPeaDocumentExtractorService peaExtractorService,
            ILogger<PeaController> logger)
        {
            _peaService = peaService;
            _peaAiService = peaAiService;
            _peaExtractorService = peaExtractorService;
            _logger = logger;
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var pea = await _peaService.GetByIdAsync(id);
            if (pea == null) return NotFound($"No se encontró el PEA con id {id}");
            return Ok(pea);
        }

        [HttpGet("uuid/{uuid}")]
        [HttpGet("{uuid:guid}")]
        public async Task<IActionResult> GetByUuid(string uuid)
        {
            var pea = await _peaService.GetByUuidAsync(uuid);
            if (pea == null) return NotFound($"No se encontró el PEA con UUID {uuid}");
            return Ok(pea);
        }

        [HttpGet("buscar")]
        public async Task<IActionResult> GetByAsignaturaPeriodo([FromQuery] int idAsignatura, [FromQuery] string idPeriodo)
        {
            var pea = await _peaService.GetByAsignaturaPeriodoAsync(idAsignatura, idPeriodo);
            if (pea == null) return NotFound("No existe un PEA registrado para esta asignatura y período.");
            return Ok(pea);
        }

        [HttpGet("bandeja")]
        public async Task<IActionResult> GetBandeja(
            [FromQuery] string? idPeriodo = null,
            [FromQuery] int? idCarrera = null,
            [FromQuery] string? estado = null,
            CancellationToken cancellationToken = default)
        {
            var userIdStr = User.FindFirstValue("id_usuario");
            int idUsuario = 0;
            if (!string.IsNullOrEmpty(userIdStr) && int.TryParse(userIdStr, out int parsedId))
            {
                idUsuario = parsedId;
            }

            var identifier = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");

            var lista = await _peaService.ListarBandejaAsync(idPeriodo, idCarrera, estado, idUsuario, identifier, cancellationToken);
            return Ok(lista);
        }


        [HttpPost]
        public async Task<IActionResult> Guardar([FromBody] PeaDto dto)
        {
            if (dto == null) return BadRequest("El cuerpo del PEA no puede ser nulo.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var result = await _peaService.GuardarPeaAsync(dto, userId);
            return Ok(result);
        }

        [HttpPost("desde-asignacion/{idAsignacion:int}")]
        public async Task<IActionResult> CrearDesdeAsignacion(int idAsignacion)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            if (string.IsNullOrWhiteSpace(userId))
                return Unauthorized(new { message = "No se pudo identificar al docente autenticado." });

            var result = await _peaService.CrearDesdeAsignacionAsync(idAsignacion, userId);
            return CreatedAtAction(nameof(GetById), new { id = result.IdPea }, result);
        }

        [HttpPatch("{id:int}/estado")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR,DOSIER_DOCENTE")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoRequest req)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _peaService.CambiarEstadoAsync(id, req.NuevoEstado, req.Firma, userId, req.Motivo);
            if (!ok) return NotFound("No se pudo actualizar el estado del PEA.");
            return Ok(new { success = true });
        }

        [HttpPatch("uuid/{uuid}/estado")]
        [HttpPatch("{uuid:guid}/estado")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR,DOSIER_DOCENTE")]
        public async Task<IActionResult> CambiarEstadoByUuid(string uuid, [FromBody] CambiarEstadoRequest req)
        {
            var pea = await _peaService.GetByUuidAsync(uuid);
            if (pea == null) return NotFound($"No se encontró el PEA con UUID {uuid}");

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var ok = await _peaService.CambiarEstadoAsync(pea.IdPea, req.NuevoEstado, req.Firma, userId, req.Motivo);
            if (!ok) return NotFound("No se pudo actualizar el estado del PEA.");
            return Ok(new { success = true });
        }

        /// <summary>
        /// Firma electrónica oficial del PEA (Ley 67 Ecuador).
        /// Conecta con el subsistema criptográfico transversal (HMAC-SHA256 y FirmaEC P12).
        /// Valida roles y pertenencia institucional de forma estricta por etapa.
        /// </summary>
        [HttpPost("{id:int}/firmar")]
        public async Task<IActionResult> Firmar(int id, [FromBody] FirmarPeaDto dto)
        {
            var userIdStr = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int idUsuario))
                return Unauthorized(new { message = "Sesión inválida o identificador de usuario no encontrado." });

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var userAgent = Request.Headers["User-Agent"].ToString();

            var resultado = await _peaService.FirmarPeaAsync(id, idUsuario, dto, ip, userAgent);
            return Ok(resultado);
        }

        [HttpPost("uuid/{uuid}/firmar")]
        [HttpPost("{uuid:guid}/firmar")]
        public async Task<IActionResult> FirmarByUuid(string uuid, [FromBody] FirmarPeaDto dto)
        {
            var pea = await _peaService.GetByUuidAsync(uuid);
            if (pea == null) return NotFound($"No se encontró el PEA con UUID {uuid}");

            var userIdStr = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier) 
                ?? User.FindFirstValue("sub");

            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int idUsuario))
                return Unauthorized(new { message = "Sesión inválida o identificador de usuario no encontrado." });

            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
            var userAgent = Request.Headers["User-Agent"].ToString();

            var resultado = await _peaService.FirmarPeaAsync(pea.IdPea, idUsuario, dto, ip, userAgent);
            return Ok(resultado);
        }

        [HttpPost("{id}/clonar")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_DOCENTE,DOSIER_COORD_CARRERA")]
        public async Task<IActionResult> Clonar(int id, [FromQuery] string nuevoPeriodo)
        {
            if (string.IsNullOrEmpty(nuevoPeriodo)) return BadRequest("Debe especificar el nuevo período académico.");
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
            var clonado = await _peaService.ClonarPeaPeriodoAsync(id, nuevoPeriodo, userId);
            return Ok(clonado);
        }

        // =====================================================================
        // ENDPOINTS DE OBSERVACIONES Y WORKFLOW COLEGIADO
        // =====================================================================

        [HttpGet("{id:int}/observaciones")]
        public async Task<IActionResult> GetObservaciones(int id)
        {
            var list = await _peaService.GetObservacionesByPeaAsync(id);
            return Ok(list);
        }

        [HttpGet("uuid/{uuid}/observaciones")]
        [HttpGet("{uuid:guid}/observaciones")]
        public async Task<IActionResult> GetObservacionesByUuid(string uuid)
        {
            var pea = await _peaService.GetByUuidAsync(uuid);
            if (pea == null) return NotFound($"No se encontró el PEA con UUID {uuid}");
            var list = await _peaService.GetObservacionesByPeaAsync(pea.IdPea);
            return Ok(list);
        }

        [HttpPost("{id:int}/observaciones")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
        public async Task<IActionResult> AgregarObservacion(int id, [FromBody] AgregarObservacionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Texto)) return BadRequest("El texto de la observación no puede estar vacío.");
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var obs = await _peaService.AgregarObservacionAsync(id, req.RolObservador ?? "CoordinadorCarrera", req.SeccionAfectada ?? "General", req.Texto, idUserInt);
            return Ok(obs);
        }

        [HttpPost("uuid/{uuid}/observaciones")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
        public async Task<IActionResult> AgregarObservacionByUuid(string uuid, [FromBody] AgregarObservacionRequest req)
        {
            if (string.IsNullOrWhiteSpace(req.Texto)) return BadRequest("El texto de la observación no puede estar vacío.");

            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var obs = await _peaService.AgregarObservacionByUuidAsync(uuid, req.RolObservador ?? "CoordinadorCarrera", req.SeccionAfectada ?? "General", req.Texto, idUserInt);
            return Ok(obs);
        }

        [HttpPatch("observaciones/{idObs:int}/subsanar")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_DOCENTE")]
        public async Task<IActionResult> SubsanarObservacion(int idObs, [FromBody] SubsanarObservacionRequest req)
        {
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var ok = await _peaService.SubsanarObservacionAsync(idObs, req.RespuestaDocente, idUserInt);
            if (!ok) return NotFound("No se encontró la observación.");
            return Ok(new { success = true });
        }

        [HttpDelete("observaciones/{idObs:int}")]
        [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
        public async Task<IActionResult> EliminarObservacion(int idObs)
        {
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int? idUserInt = int.TryParse(userId, out int u) ? u : null;

            var ok = await _peaService.EliminarObservacionAsync(idObs, idUserInt);
            if (!ok) return NotFound("No se encontró la observación a eliminar.");
            return Ok(new { success = true });
        }

        [HttpGet("{id:int}/trazabilidad")]
        public async Task<IActionResult> GetTrazabilidad(int id)
        {
            var list = await _peaService.GetTrazabilidadByPeaAsync(id);
            return Ok(list);
        }

        [HttpGet("uuid/{uuid}/trazabilidad")]
        [HttpGet("{uuid:guid}/trazabilidad")]
        public async Task<IActionResult> GetTrazabilidadByUuid(string uuid)
        {
            var pea = await _peaService.GetByUuidAsync(uuid);
            if (pea == null) return NotFound($"No se encontró el PEA con UUID {uuid}");
            var list = await _peaService.GetTrazabilidadByPeaAsync(pea.IdPea);
            return Ok(list);
        }

        [HttpGet("ai/config")]
        public async Task<IActionResult> GetAiConfig(CancellationToken ct)
        {
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int idUserInt = int.TryParse(userId, out int u) ? u : 0;

            var status = await _peaAiService.GetConfigStatusAsync(idUserInt, ct);
            return Ok(status);
        }

        [HttpPost("ai/config")]
        public async Task<IActionResult> SaveAiConfig([FromBody] SavePeaAiConfigRequestDto req, CancellationToken ct)
        {
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int idUserInt = int.TryParse(userId, out int u) ? u : 0;
            if (idUserInt <= 0)
            {
                return Unauthorized(new { message = "Usuario no identificado." });
            }

            bool isAdmin = User.IsInRole("DOSIER_ADMIN") || User.HasClaim("es_admin", "true");
            var status = await _peaAiService.SaveConfigAsync(idUserInt, isAdmin, req, ct);
            return Ok(status);
        }

        [HttpPost("uuid/{uuid}/ai/generar")]
        [HttpPost("{uuid}/ai/generar")]
        public async Task<IActionResult> GenerarBorradorAi(
            string uuid,
            [FromBody] GeneratePeaDraftRequestDto req,
            CancellationToken ct)
        {
            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int idUserInt = int.TryParse(userId, out int u) ? u : 0;

            try
            {
                var draft = await _peaAiService.GenerateDraftAsync(uuid, idUserInt, req ?? new GeneratePeaDraftRequestDto(), ct);
                return Ok(draft);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("uuid/{uuid}/importar-documento")]
        [HttpPost("{uuid}/importar-documento")]
        [HttpPost("uuid/{uuid}/ai/importar-archivo")]
        [HttpPost("{uuid}/ai/importar-archivo")]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(15 * 1024 * 1024)]
        public async Task<IActionResult> ImportarDocumentoPea(
            string uuid,
            IFormFile? file,
            [FromForm(Name = "custom_instructions")] string? customInstructions,
            [FromForm(Name = "provider")] string? provider,
            [FromForm(Name = "model")] string? model,
            [FromForm(Name = "base_url_override")] string? baseUrlOverride,
            [FromForm(Name = "api_key_override")] string? apiKeyOverride,
            [FromForm(Name = "current_horas_cd")] int? currentHorasCd,
            [FromForm(Name = "current_horas_ape")] int? currentHorasApe,
            [FromForm(Name = "current_horas_ta")] int? currentHorasTa,
            [FromForm(Name = "current_total_horas")] int? currentTotalHoras,
            CancellationToken ct)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "Debe seleccionar un archivo digital (.pdf o .docx) válido." });
            }

            if (file.Length > 15 * 1024 * 1024)
            {
                return BadRequest(new { message = "El archivo supera el tamaño máximo permitido de 15 MB." });
            }

            var userId = User.FindFirstValue("id_usuario")
                ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("sub");
            int idUserInt = int.TryParse(userId, out int u) ? u : 0;

            try
            {
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms, ct);

                var importRequest = new ImportPeaDocumentRequestDto
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType ?? string.Empty,
                    FileBytes = ms.ToArray(),
                    CustomInstructions = customInstructions,
                    Provider = provider,
                    Model = model,
                    BaseUrlOverride = baseUrlOverride,
                    ApiKeyOverride = apiKeyOverride,
                    CurrentHorasCD = currentHorasCd,
                    CurrentHorasAPE = currentHorasApe,
                    CurrentHorasTA = currentHorasTa,
                    CurrentTotalHoras = currentTotalHoras
                };

                var draft = await _peaExtractorService.ExtractAndMapDocumentAsync(uuid, idUserInt, importRequest, ct);
                return Ok(draft);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    public class CambiarEstadoRequest
    {
        public string NuevoEstado { get; set; } = string.Empty;
        public string? Firma { get; set; }
        public string? Motivo { get; set; }
    }

    public class AgregarObservacionRequest
    {
        public string? RolObservador { get; set; }
        public string? SeccionAfectada { get; set; }
        public string Texto { get; set; } = string.Empty;
    }

    public class SubsanarObservacionRequest
    {
        public string RespuestaDocente { get; set; } = string.Empty;
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Feedback;
using dosier_application.Feedback.DTOs;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FeedbackController : ControllerBase
{
    private readonly IFeedbackService _feedbackService;

    public FeedbackController(IFeedbackService feedbackService)
    {
        _feedbackService = feedbackService;
    }

    /// <summary>
    /// Obtiene la configuración de soporte y límites de subida (WhatsApp y tamaños permitidos).
    /// </summary>
    [HttpGet("config")]
    [AllowAnonymous]
    public IActionResult GetConfig()
    {
        var config = _feedbackService.GetSupportConfig();
        return Ok(config);
    }

    /// <summary>
    /// Sirve los archivos multimedia adjuntos de los reportes de feedback.
    /// </summary>
    [HttpGet("attachments/{yearMonth}/{fileName}")]
    [AllowAnonymous]
    public IActionResult GetAttachment(string yearMonth, string fileName)
    {
        var safeYearMonth = Path.GetFileName(yearMonth);
        var safeFileName = Path.GetFileName(fileName);

        var candidatePaths = new[]
        {
            Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "feedback", safeYearMonth, safeFileName),
            Path.Combine(Directory.GetCurrentDirectory(), "uploads", "feedback", safeYearMonth, safeFileName),
            Path.Combine(Directory.GetCurrentDirectory(), "backend", "dosier_api", "uploads", "feedback", safeYearMonth, safeFileName),
            Path.Combine(Directory.GetCurrentDirectory(), "backend", "dosier_api", "wwwroot", "uploads", "feedback", safeYearMonth, safeFileName),
            Path.Combine(AppContext.BaseDirectory, "uploads", "feedback", safeYearMonth, safeFileName),
            Path.Combine(AppContext.BaseDirectory, "wwwroot", "uploads", "feedback", safeYearMonth, safeFileName)
        };

        string? finalPath = candidatePaths.FirstOrDefault(p => System.IO.File.Exists(p));
        var ext = Path.GetExtension(safeFileName).ToLowerInvariant();
        var isImage = ext is ".png" or ".jpg" or ".jpeg" or ".webp";

        if (finalPath == null)
        {
            if (isImage)
            {
                // Responder con SVG institucional de fallback para evitar 404 en consola y miniaturas rotas
                string svg = @"<svg xmlns=""http://www.w3.org/2000/svg"" width=""320"" height=""180"" viewBox=""0 0 320 180"" fill=""none"">
                    <rect width=""320"" height=""180"" rx=""8"" fill=""#f8fafc""/>
                    <rect x=""1"" y=""1"" width=""318"" height=""178"" rx=""7"" stroke=""#e2e8f0""/>
                    <path d=""M148 76l-8 12h32l-10-15-7 10-7-7z"" fill=""#94a3b8""/>
                    <circle cx=""168"" cy=""66"" r=""4"" fill=""#94a3b8""/>
                    <text x=""160"" y=""112"" text-anchor=""middle"" font-family=""system-ui, -apple-system, sans-serif"" font-size=""11"" font-weight=""500"" fill=""#64748b"">Adjunto no disponible</text>
                    <text x=""160"" y=""128"" text-anchor=""middle"" font-family=""system-ui, -apple-system, sans-serif"" font-size=""9"" fill=""#94a3b8"">Archivo no sincronizado en almacenamiento local</text>
                </svg>";
                return Content(svg, "image/svg+xml");
            }
            return NotFound(new { message = "Archivo adjunto no encontrado." });
        }

        var contentType = ext switch
        {
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".webp" => "image/webp",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            _ => "application/octet-stream"
        };

        return PhysicalFile(Path.GetFullPath(finalPath), contentType, enableRangeProcessing: true);
    }

    /// <summary>
    /// Envía una nueva sugerencia, reporte de error o consulta con adjuntos multimedia opcionales.
    /// </summary>
    [HttpPost]
    [RequestSizeLimit(35 * 1024 * 1024)] // 35 MB máximo para el payload multipart completo
    public async Task<IActionResult> CreateFeedback([FromForm] CreateFeedbackApiRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Titulo) || string.IsNullOrWhiteSpace(request.Descripcion))
        {
            return BadRequest(new { message = "El título y la descripción son obligatorios." });
        }

        int? idUsuario = null;
        if (int.TryParse(User.FindFirst("id_usuario")?.Value, out var parsedId))
        {
            idUsuario = parsedId;
        }

        var cedula = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var nombre = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("nombre")?.Value ?? "Usuario DOSIER";
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var rolPrincipal = roles.FirstOrDefault() ?? "DOSIER_DOCENTE";

        var uploadedFiles = request.Archivos?.Select(f => new FeedbackUploadedFile
        {
            FileName = f.FileName,
            ContentType = f.ContentType,
            Length = f.Length,
            Stream = f.OpenReadStream()
        }).ToList();

        var dto = new CreateFeedbackDto
        {
            Tipo = request.Tipo,
            Titulo = request.Titulo,
            Descripcion = request.Descripcion,
            RutaOrigen = request.RutaOrigen,
            MetadataNavegador = request.MetadataNavegador,
            Archivos = uploadedFiles
        };

        try
        {
            var resultado = await _feedbackService.CreateFeedbackAsync(dto, idUsuario, cedula, nombre, rolPrincipal);
            return Ok(resultado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al procesar el reporte de sugerencia.", detalle = ex.Message });
        }
    }

    /// <summary>
    /// Consulta los reportes y sugerencias registrados por el usuario autenticado.
    /// </summary>
    [HttpGet("my")]
    [Authorize]
    public async Task<IActionResult> GetMyFeedback()
    {
        int? idUsuario = null;
        if (int.TryParse(User.FindFirst("id_usuario")?.Value, out var parsedId))
        {
            idUsuario = parsedId;
        }

        var cedula = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var reportes = await _feedbackService.GetMyFeedbackAsync(idUsuario, cedula);
        return Ok(reportes);
    }

    /// <summary>
    /// Consulta todos los reportes y sugerencias recibidos (Exclusivo Administradores).
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAllFeedback([FromQuery] string? tipo, [FromQuery] string? estado)
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var isAdmin = roles.Contains("DOSIER_ADMIN") || roles.Contains("ADMINISTRADOR") || User.FindFirst("es_super_admin")?.Value == "true";

        if (!isAdmin)
        {
            return Forbid();
        }

        var reportes = await _feedbackService.GetAllFeedbackAsync(tipo, estado);
        return Ok(reportes);
    }

    /// <summary>
    /// Actualiza el estado y resolución de un reporte de sugerencia (Exclusivo Administradores).
    /// </summary>
    [HttpPatch("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateFeedbackStatusDto dto)
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var isAdmin = roles.Contains("DOSIER_ADMIN") || roles.Contains("ADMINISTRADOR") || User.FindFirst("es_super_admin")?.Value == "true";

        if (!isAdmin)
        {
            return Forbid();
        }

        if (string.IsNullOrWhiteSpace(dto.Estado))
        {
            return BadRequest(new { message = "El estado es obligatorio." });
        }

        var resultado = await _feedbackService.UpdateStatusAsync(id, dto);
        if (resultado == null)
        {
            return NotFound(new { message = "Reporte de sugerencia no encontrado." });
        }

        return Ok(resultado);
    }

    /// <summary>
    /// Edita el contenido (título, descripción, tipo) de un reporte propio mientras esté pendiente.
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateUserFeedback(int id, [FromBody] UpdateUserFeedbackDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Titulo) || string.IsNullOrWhiteSpace(dto.Descripcion))
        {
            return BadRequest(new { message = "El título y la descripción son obligatorios." });
        }

        int? idUsuario = null;
        if (int.TryParse(User.FindFirst("id_usuario")?.Value, out var parsedId))
        {
            idUsuario = parsedId;
        }

        var cedula = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var isAdmin = roles.Contains("DOSIER_ADMIN") || roles.Contains("ADMINISTRADOR") || User.FindFirst("es_super_admin")?.Value == "true";

        try
        {
            var resultado = await _feedbackService.UpdateUserFeedbackAsync(id, dto, idUsuario, cedula, isAdmin);
            if (resultado == null)
            {
                return NotFound(new { message = "Reporte no encontrado." });
            }
            return Ok(resultado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Agrega un mensaje o respuesta al hilo de conversación del reporte.
    /// </summary>
    [HttpPost("{id}/messages")]
    [Authorize]
    public async Task<IActionResult> AddMessage(int id, [FromBody] CreateFeedbackMensajeDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Mensaje))
        {
            return BadRequest(new { message = "El mensaje no puede estar vacío." });
        }

        int? idUsuario = null;
        if (int.TryParse(User.FindFirst("id_usuario")?.Value, out var parsedId))
        {
            idUsuario = parsedId;
        }

        var cedula = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var nombre = User.FindFirst(ClaimTypes.Name)?.Value ?? User.FindFirst("nombre")?.Value ?? "Usuario";
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var isAdmin = roles.Contains("DOSIER_ADMIN") || roles.Contains("ADMINISTRADOR") || User.FindFirst("es_super_admin")?.Value == "true";
        var rolPrincipal = roles.FirstOrDefault() ?? "DOSIER_DOCENTE";

        try
        {
            var resultado = await _feedbackService.AddMessageAsync(id, dto, idUsuario, cedula, nombre, rolPrincipal, isAdmin);
            if (resultado == null)
            {
                return NotFound(new { message = "Reporte no encontrado." });
            }
            return Ok(resultado);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Elimina un reporte propio mientras esté en espera, o cualquier reporte si es Administrador.
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteFeedback(int id)
    {
        int? idUsuario = null;
        if (int.TryParse(User.FindFirst("id_usuario")?.Value, out var parsedId))
        {
            idUsuario = parsedId;
        }

        var cedula = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).Union(User.FindAll("roles").Select(c => c.Value)).Distinct().ToList();
        var isAdmin = roles.Contains("DOSIER_ADMIN") || roles.Contains("ADMINISTRADOR") || User.FindFirst("es_super_admin")?.Value == "true";

        try
        {
            var ok = await _feedbackService.DeleteFeedbackAsync(id, idUsuario, cedula, isAdmin);
            if (!ok)
            {
                return NotFound(new { message = "Reporte no encontrado." });
            }
            return Ok(new { message = "Reporte eliminado exitosamente." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

public class CreateFeedbackApiRequest
{
    public string Tipo { get; set; } = "SUGERENCIA";
    public string Titulo { get; set; } = null!;
    public string Descripcion { get; set; } = null!;
    public string? RutaOrigen { get; set; }
    public string? MetadataNavegador { get; set; }
    public List<IFormFile>? Archivos { get; set; }
}

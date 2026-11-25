using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Help;
using dosier_application.Help.DTOs;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/help/videos")]
public sealed class HelpVideosController : ControllerBase
{
    private readonly IHelpVideosService _helpVideosService;

    public HelpVideosController(IHelpVideosService helpVideosService)
    {
        _helpVideosService = helpVideosService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetByRoute([FromQuery] string routeKey, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(routeKey))
            return BadRequest(new { message = "El parámetro routeKey es obligatorio." });

        var callerRoles = ExtractNormalizedRoles();
        var videos = await _helpVideosService.GetVideosByRouteAsync(routeKey, callerRoles, ct);
        return Ok(videos);
    }

    [HttpGet("admin")]
    [Authorize]
    public async Task<IActionResult> GetAllAdmin(CancellationToken ct)
    {
        if (!IsCallerAdmin())
            return Forbid();

        var videos = await _helpVideosService.GetAllVideosAsync(ct);
        return Ok(videos);
    }

    [HttpGet("media/{fileName}")]
    [AllowAnonymous]
    public IActionResult GetMedia(string fileName)
    {
        var path = _helpVideosService.ResolveUploadedVideoPath(fileName);
        if (path == null)
            return NotFound(new { message = "Video no encontrado." });

        var ext = Path.GetExtension(path).ToLowerInvariant();
        var contentType = ext switch
        {
            ".mp4" or ".m4v" => "video/mp4",
            ".webm" => "video/webm",
            ".ogg" => "video/ogg",
            ".mov" => "video/quicktime",
            _ => "application/octet-stream"
        };

        Response.Headers.CacheControl = "public, max-age=86400";
        return PhysicalFile(path, contentType, enableRangeProcessing: true);
    }

    [HttpPost]
    [Authorize]
    [RequestSizeLimit(85 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 85 * 1024 * 1024)]
    public async Task<IActionResult> Create([FromForm] CreateHelpVideoFormRequest form, CancellationToken ct)
    {
        if (!IsCallerAdmin())
            return Forbid();

        var roles = ParseRoles(form.Roles);
        HelpVideoUploadedFile? uploaded = null;
        Stream? stream = null;

        try
        {
            if (form.Archivo != null && form.Archivo.Length > 0)
            {
                stream = form.Archivo.OpenReadStream();
                uploaded = new HelpVideoUploadedFile
                {
                    FileName = form.Archivo.FileName,
                    ContentType = form.Archivo.ContentType,
                    Length = form.Archivo.Length,
                    Stream = stream
                };
            }

            var created = await _helpVideosService.AddVideoAsync(new CreateHelpVideoRequest
            {
                RouteKey = form.RouteKey ?? string.Empty,
                Title = form.Title ?? string.Empty,
                Description = form.Description,
                Duration = form.Duration,
                Url = form.Url,
                Roles = roles,
                Archivo = uploaded
            }, ct);

            return Created(string.Empty, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        finally
        {
            if (stream != null)
            {
                await stream.DisposeAsync();
            }
        }
    }

    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> Update(
        string id,
        [FromQuery] string routeKey,
        [FromBody] UpdateHelpVideoRequest request,
        CancellationToken ct)
    {
        if (!IsCallerAdmin())
            return Forbid();

        if (string.IsNullOrWhiteSpace(routeKey))
            return BadRequest(new { message = "El parámetro routeKey es obligatorio." });

        try
        {
            var updated = await _helpVideosService.UpdateVideoAsync(routeKey, id, request, ct);
            if (updated == null)
                return NotFound(new { message = "Video no encontrado." });

            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("reorder")]
    [Authorize]
    public async Task<IActionResult> Reorder(
        [FromBody] ReorderHelpVideosRequest request,
        CancellationToken ct)
    {
        if (!IsCallerAdmin())
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.RouteKey))
            return BadRequest(new { message = "El campo route_key es obligatorio." });

        var reordered = await _helpVideosService.ReorderVideosAsync(
            request.RouteKey,
            request.OrderedIds ?? new List<string>(),
            ct);
        return Ok(reordered);
    }

    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> Delete(string id, [FromQuery] string routeKey, CancellationToken ct)
    {
        if (!IsCallerAdmin())
            return Forbid();

        if (string.IsNullOrWhiteSpace(routeKey))
            return BadRequest(new { message = "El parámetro routeKey es obligatorio." });

        var deleted = await _helpVideosService.DeleteVideoAsync(routeKey, id, ct);
        if (!deleted)
            return NotFound(new { message = "Video no encontrado." });

        return NoContent();
    }

    private bool IsCallerAdmin()
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
            .Union(User.FindAll("roles").Select(c => c.Value));

        return roles.Any(r =>
            r.Equals("DOSIER_ADMIN", StringComparison.OrdinalIgnoreCase) ||
            r.Equals("ADMINISTRADOR", StringComparison.OrdinalIgnoreCase)) ||
            string.Equals(User.FindFirst("es_super_admin")?.Value, "true", StringComparison.OrdinalIgnoreCase);
    }

    private List<string> ExtractNormalizedRoles()
    {
        var rawRoles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
            .Union(User.FindAll("roles").Select(c => c.Value))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var mapped = new List<string>(rawRoles);
        foreach (var r in rawRoles)
        {
            var upper = r.Trim().ToUpperInvariant();
            if (upper == "DOSIER_ADMIN" || upper == "ADMINISTRADOR") mapped.Add("admin");
            else if (upper == "DOSIER_DOCENTE") mapped.Add("docente");
            else if (upper == "DOSIER_COORD_CARRERA") mapped.Add("coord_carrera");
            else if (upper == "DOSIER_COORD_ACAD") mapped.Add("coord_acad");
            else if (upper == "DOSIER_VICERRECTOR") mapped.Add("vicerrector");
        }

        if (string.Equals(User.FindFirst("es_super_admin")?.Value, "true", StringComparison.OrdinalIgnoreCase))
        {
            mapped.Add("admin");
        }

        return mapped.Distinct(StringComparer.OrdinalIgnoreCase).ToList();
    }

    private static List<string> ParseRoles(string? rawRoles)
    {
        if (string.IsNullOrWhiteSpace(rawRoles))
            return new List<string>();

        return rawRoles
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }
}

public sealed class CreateHelpVideoFormRequest
{
    [FromForm(Name = "route_key")]
    public string? RouteKey { get; set; }

    [FromForm(Name = "title")]
    public string? Title { get; set; }

    [FromForm(Name = "description")]
    public string? Description { get; set; }

    [FromForm(Name = "duration")]
    public string? Duration { get; set; }

    [FromForm(Name = "url")]
    public string? Url { get; set; }

    [FromForm(Name = "roles")]
    public string? Roles { get; set; }

    [FromForm(Name = "archivo")]
    public IFormFile? Archivo { get; set; }
}

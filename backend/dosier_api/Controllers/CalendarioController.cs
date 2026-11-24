using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using dosier_application.Calendario;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CalendarioController : ControllerBase
{
    private readonly ICalendarioService _calendarioService;

    public CalendarioController(ICalendarioService calendarioService)
    {
        _calendarioService = calendarioService;
    }

    private async Task<int?> GetCurrentUserIdAsync()
    {
        var idReferencia = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(idReferencia)) return null;
        return await _calendarioService.ResolveUserIdBySigafiAsync(idReferencia);
    }

    private string ResolvePrimaryRole()
    {
        var roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value)
            .Union(User.FindAll("roles").Select(c => c.Value))
            .Distinct().ToList();

        return roles.Contains("DOSIER_ADMIN") ? "DOSIER_ADMIN"
             : roles.Contains("DOSIER_VICERRECTOR") ? "DOSIER_VICERRECTOR"
             : roles.Contains("DOSIER_COORD_ACAD") ? "DOSIER_COORD_ACAD"
             : roles.Contains("DOSIER_COORD_CARRERA") ? "DOSIER_COORD_CARRERA"
             : "DOSIER_DOCENTE";
    }

    // ── GET /api/calendario/carreras ─────────────────────────────────────────
    [HttpGet("carreras")]
    public async Task<IActionResult> GetCarrerasUsuario()
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var carreras = await _calendarioService.GetCarrerasUsuarioAsync(idUsuario.Value, ResolvePrimaryRole());
        return Ok(carreras);
    }

    // ── GET /api/calendario/eventos?desde=2025-09-01&hasta=2025-09-30&idCarrera=1 ──
    [HttpGet("eventos")]
    public async Task<IActionResult> GetEventos([FromQuery] DateOnly desde, [FromQuery] DateOnly hasta, [FromQuery] int? idCarrera = null)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var eventos = await _calendarioService.GetEventosAsync(desde, hasta, ResolvePrimaryRole(), idUsuario.Value, idCarrera);
        return Ok(eventos);
    }

    // ── CRUD Eventos de Usuario (Tareas y Eventos personales/carrera/instituto) ──

    [HttpPost("usuario/eventos")]
    public async Task<IActionResult> CreateUsuarioEvento([FromBody] EventoNormativoDto dto)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var (uuid, forbidden) = await _calendarioService.CreateUsuarioEventoAsync(dto, idUsuario.Value, ResolvePrimaryRole());
        if (forbidden || string.IsNullOrEmpty(uuid)) return Forbid();

        return Created("", new { uuid });
    }

    // Obtener las notas adhesivas sin programar del usuario
    [HttpGet("usuario/notas")]
    public async Task<IActionResult> GetStickyNotes()
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var notas = await _calendarioService.GetStickyNotesAsync(idUsuario.Value);
        return Ok(notas);
    }

    // Actualizar un evento de usuario
    [HttpPut("usuario/eventos/{uuid}")]
    public async Task<IActionResult> UpdateUsuarioEvento(string uuid, [FromBody] EventoNormativoDto dto)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var result = await _calendarioService.UpdateUsuarioEventoAsync(uuid, dto, idUsuario.Value, ResolvePrimaryRole());
        if (result == null) return NotFound();
        if (result == false) return Forbid();

        return Ok(new { message = "Evento de usuario actualizado." });
    }

    // Eliminar un evento de usuario
    [HttpDelete("usuario/eventos/{uuid}")]
    public async Task<IActionResult> DeleteUsuarioEvento(string uuid)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var result = await _calendarioService.DeleteUsuarioEventoAsync(uuid, idUsuario.Value, ResolvePrimaryRole());
        if (result == null) return NotFound();
        if (result == false) return Forbid();

        return Ok(new { message = "Evento de usuario eliminado." });
    }

    // Devolver una tarjeta Kanban a la bandeja Inbox (limpia fecha e estado)
    [HttpPatch("usuario/eventos/{uuid}/inbox")]
    public async Task<IActionResult> DevolverAInbox(string uuid)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var result = await _calendarioService.DevolverAInboxAsync(uuid, idUsuario.Value);
        if (!result) return NotFound(new { message = "Nota no encontrada o no pertenece al usuario." });
        return Ok(new { message = "Evento devuelto a la bandeja Inbox." });
    }

    // Reordenar notas en la bandeja Inbox
    [HttpPatch("usuario/notas/reordenar")]
    public async Task<IActionResult> ReordenarBandeja([FromBody] List<ReordenarBandejaItem> items)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        await _calendarioService.ReordenarBandejaAsync(items, idUsuario.Value);
        return Ok(new { message = "Bandeja reordenada." });
    }

    // ── CRUD Normativos (Administradores y Autoridades Institucionales) ──────
    [HttpGet("normativos")]
    [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
    public async Task<IActionResult> GetNormativos()
    {
        var result = await _calendarioService.GetNormativosAsync();
        return Ok(result);
    }

    // ── POST /api/calendario/normativos ──────────────────────────────────────
    [HttpPost("normativos")]
    [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
    public async Task<IActionResult> CreateNormativo([FromBody] EventoNormativoDto dto)
    {
        var idUsuario = await GetCurrentUserIdAsync();
        if (idUsuario == null) return Unauthorized();

        var uuid = await _calendarioService.CreateNormativoAsync(dto, idUsuario.Value);
        return CreatedAtAction(nameof(GetNormativos), new { }, new { uuid });
    }

    // ── PUT /api/calendario/normativos/{uuid} ────────────────────────────────
    [HttpPut("normativos/{uuid}")]
    [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
    public async Task<IActionResult> UpdateNormativo(string uuid, [FromBody] EventoNormativoDto dto)
    {
        var result = await _calendarioService.UpdateNormativoAsync(uuid, dto);
        if (!result) return NotFound();
        return Ok(new { message = "Hito normativo actualizado." });
    }

    // ── DELETE /api/calendario/normativos/{uuid} ─────────────────────────────
    [HttpDelete("normativos/{uuid}")]
    [Authorize(Roles = "DOSIER_ADMIN,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR")]
    public async Task<IActionResult> DeleteNormativo(string uuid)
    {
        var result = await _calendarioService.DeleteNormativoAsync(uuid);
        if (!result) return NotFound();
        return Ok(new { message = "Hito normativo eliminado." });
    }
}

using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Security;
using dosier_application.Security.DTOs;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/lopdp")]
[Authorize]
public class LopdpController : ControllerBase
{
    private readonly ILopdpService _lopdpService;

    public LopdpController(ILopdpService lopdpService)
    {
        _lopdpService = lopdpService;
    }

    private async Task<int?> GetUserIdAsync()
    {
        var idReferencia = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(idReferencia)) return null;
        return await _lopdpService.ResolveUserIdBySigafiAsync(idReferencia);
    }

    /// <summary>
    /// Registra el consentimiento del usuario para una política de privacidad o firma digital.
    /// </summary>
    [HttpPost("consentimiento")]
    public async Task<IActionResult> RegistrarConsentimiento([FromBody] RegistrarConsentimientoRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.VersionPolitica))
        {
            return BadRequest(new { error = "La versión de la política es requerida." });
        }

        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var ip = HttpContext.Connection?.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        await _lopdpService.RegistrarConsentimientoAsync(userId.Value, request.VersionPolitica, ip, userAgent);

        return Ok(new { message = "Consentimiento registrado exitosamente." });
    }

    /// <summary>
    /// Devuelve todos los consentimientos registrados en el sistema (Solo para administradores/directores).
    /// </summary>
    [HttpGet("consentimientos")]
    [Authorize(Roles = "DOSIER_ADMIN")]
    public async Task<IActionResult> GetAllConsentimientos()
    {
        var consentimientos = await _lopdpService.GetAllConsentimientosAsync();
        return Ok(consentimientos);
    }

    /// <summary>
    /// Devuelve el perfil LOPDP del usuario autenticado (incluyendo metadatos científicos e información de consentimiento).
    /// </summary>
    [HttpGet("perfil")]
    public async Task<IActionResult> GetPerfil()
    {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var perfil = await _lopdpService.GetPerfilAsync(userId.Value);
        return Ok(perfil);
    }

    /// <summary>
    /// Actualiza la información de perfil científico LOPDP del usuario autenticado.
    /// </summary>
    [HttpPut("perfil")]
    public async Task<IActionResult> UpdatePerfil([FromBody] ActualizarPerfilRequest request)
    {
        if (request == null) return BadRequest("Datos nulos");

        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        await _lopdpService.UpdatePerfilAsync(userId.Value, request);
        return Ok(new { message = "Perfil actualizado exitosamente." });
    }

    /// <summary>
    /// Revoca el consentimiento del usuario para la política de privacidad y firma digital.
    /// </summary>
    [HttpPost("revocar")]
    public async Task<IActionResult> RevocarConsentimiento()
    {
        var userId = await GetUserIdAsync();
        if (userId == null) return Unauthorized();

        var ip = HttpContext.Connection?.RemoteIpAddress?.ToString();
        var userAgent = Request.Headers["User-Agent"].ToString();

        await _lopdpService.RevocarConsentimientoAsync(userId.Value, ip, userAgent);

        return Ok(new { message = "Consentimiento revocado exitosamente." });
    }
}

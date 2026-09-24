using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using dosier_application.Security;
using dosier_application.Security.DTOs;
using dosier_domain.Identity.Enums;
using dosier_api.Services;

namespace dosier_api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "DOSIER_ADMIN")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;
    private readonly IBackupAdminService _backupAdminService;
    private readonly BackupBackgroundService _backupService;

    public AdminController(
        IAdminService adminService,
        IBackupAdminService backupAdminService,
        BackupBackgroundService backupService)
    {
        _adminService = adminService;
        _backupAdminService = backupAdminService;
        _backupService = backupService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search, 
        [FromQuery] string type = "DOCENTE", 
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 10,
        [FromQuery] string? carrera = null,
        [FromQuery] bool soloConHoras = false,
        [FromQuery] string estadoEstudiante = "ACTIVO",
        [FromQuery] string origenEstudiante = "INSTITUTO",
        [FromQuery] string? departamento = null)
    {
        var result = await _adminService.GetUsersAsync(
            search, 
            type, 
            page, 
            pageSize, 
            carrera, 
            soloConHoras, 
            estadoEstudiante, 
            origenEstudiante,
            departamento);
        return Ok(result);
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles()
    {
        var roles = await _adminService.GetAvailableRolesAsync();
        return Ok(roles);
    }

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var departments = await _adminService.GetDepartmentsAsync();
        return Ok(departments);
    }

    [HttpGet("users/{userUuid}/metadata")]
    [HttpGet("metadata/{userUuid}")]
    public async Task<IActionResult> GetUserMetadata(string userUuid)
    {
        var metadata = await _adminService.GetUserMetadataAsync(userUuid);
        if (metadata == null) return NotFound("Metadatos no encontrados");
        return Ok(metadata);
    }

    [HttpPut("users/{userUuid}/metadata")]
    [HttpPut("metadata/{userUuid}")]
    public async Task<IActionResult> UpdateUserMetadata(string userUuid, [FromBody] UserMetadataDto dto)
    {
        var result = await _adminService.UpdateUserMetadataAsync(userUuid, dto);
        if (!result) return BadRequest("No se pudo actualizar los metadatos");
        return Ok(new { message = "Metadatos actualizados con éxito" });
    }

    [HttpPost("users/{idUsuario}/roles/{roleCode}")]
    public async Task<IActionResult> AssignRole(string idUsuario, string roleCode, [FromQuery] string userType = "DOCENTE")
    {
        var result = await _adminService.AssignRoleAsync(idUsuario, roleCode, userType);
        if (!result) return BadRequest("No se pudo asignar el rol");
        return Ok(new { message = "Rol asignado con éxito" });
    }

    [HttpPost("roles/assign")]
    public async Task<IActionResult> AssignRoleLegacy([FromBody] RoleActionRequest request)
    {
        var roleIdentifier = !string.IsNullOrEmpty(request.RoleCode) ? request.RoleCode : request.RoleName;
        if (string.IsNullOrEmpty(request.IdUsuario) || string.IsNullOrEmpty(roleIdentifier))
        {
            return BadRequest(new { message = "Datos incompletos" });
        }
        var result = await _adminService.AssignRoleAsync(request.IdUsuario, roleIdentifier, request.UserType);
        if (!result) return BadRequest("No se pudo asignar el rol");
        return Ok(new { message = "Rol asignado con éxito" });
    }

    [HttpDelete("users/{idUsuario}/roles/{roleCode}")]
    public async Task<IActionResult> RevokeRole(string idUsuario, string roleCode, [FromQuery] string userType = "DOCENTE")
    {
        var result = await _adminService.RevokeRoleAsync(idUsuario, roleCode, userType);
        if (!result) return BadRequest("No se pudo revocar el rol");
        return Ok(new { message = "Rol revocado con éxito" });
    }

    [HttpPost("roles/revoke")]
    public async Task<IActionResult> RevokeRoleLegacy([FromBody] RoleActionRequest request)
    {
        var roleIdentifier = !string.IsNullOrEmpty(request.RoleCode) ? request.RoleCode : request.RoleName;
        if (string.IsNullOrEmpty(request.IdUsuario) || string.IsNullOrEmpty(roleIdentifier))
        {
            return BadRequest(new { message = "Datos incompletos" });
        }
        var result = await _adminService.RevokeRoleAsync(request.IdUsuario, roleIdentifier, request.UserType);
        if (!result) return BadRequest("No se pudo revocar el rol");
        return Ok(new { message = "Rol revocado con éxito" });
    }

    [HttpPost("users/external")]
    [HttpPost("external")]
    public async Task<IActionResult> RegisterExternalUser([FromBody] ExternalUserDto dto)
    {
        var result = await _adminService.RegisterExternalUserAsync(dto);
        if (!result) return BadRequest("No se pudo registrar el usuario externo");
        return Ok(new { message = "Usuario externo registrado con éxito" });
    }

    [HttpGet("audit-logs/recent")]
    [HttpGet("audit")]
    public async Task<IActionResult> GetRecentAuditLogs()
    {
        var logs = await _adminService.GetRecentAuditLogsAsync();
        return Ok(logs);
    }

    [HttpGet("audit-logs")]
    [HttpGet("audit/advanced")]
    public async Task<IActionResult> GetAuditLogsPaged(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? action,
        [FromQuery] string? modulo,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var logs = await _adminService.GetAuditLogsPagedAsync(from, to, action, modulo, search, page, pageSize);
        return Ok(logs);
    }

    /// <summary>
    /// Lista el historial de copias de seguridad del sistema (Solo administradores).
    /// </summary>
    [HttpGet("backups")]
    public async Task<IActionResult> GetBackupLogs()
    {
        var logs = await _backupAdminService.GetBackupLogsAsync();
        return Ok(logs);
    }

    /// <summary>
    /// Obtiene información física del volumen de almacenamiento del servidor (Disco).
    /// </summary>
    [HttpGet("backups/disk-info")]
    public IActionResult GetDiskInfo()
    {
        try
        {
            var diskInfo = _backupAdminService.GetDiskInfo();
            return Ok(diskInfo);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error al consultar la información del disco del servidor.", detalles = ex.Message });
        }
    }

    /// <summary>
    /// Desencadena manualmente una copia de seguridad local (Base de datos + Archivos).
    /// </summary>
    [HttpPost("backups/trigger")]
    public IActionResult TriggerBackup()
    {
        try
        {
            // Ejecutar el respaldo de forma asíncrona en segundo plano para no bloquear la respuesta HTTP
            _ = Task.Run(async () => 
            {
                await _backupService.RunBackupAndRetentionAsync(CancellationToken.None);
            });

            return Ok(new { message = "Proceso de copia de seguridad iniciado en segundo plano." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "No se pudo iniciar el respaldo.", detalles = ex.Message });
        }
    }

    /// <summary>
    /// Descarga un archivo de copia de seguridad por su UUID de auditoría (Solo administradores).
    /// </summary>
    [HttpGet("backups/download/{uuid}")]
    public async Task<IActionResult> DownloadBackup(Guid uuid)
    {
        try
        {
            var (filePath, fileName) = await _backupAdminService.GetBackupFileForDownloadAsync(uuid);
            if (string.IsNullOrEmpty(filePath) || string.IsNullOrEmpty(fileName))
            {
                return NotFound(new { message = fileName != null
                    ? "El archivo físico de respaldo ya no existe o fue depurado por la política de retención (30 días)."
                    : "Registro de copia de seguridad no encontrado." });
            }

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var contentType = "application/zip";
            if (fileName.EndsWith(".sql.gz", StringComparison.OrdinalIgnoreCase) || fileName.EndsWith(".tar.gz", StringComparison.OrdinalIgnoreCase))
            {
                contentType = "application/gzip";
            }
            else if (fileName.EndsWith(".sql", StringComparison.OrdinalIgnoreCase))
            {
                contentType = "application/sql";
            }

            return File(fileBytes, contentType, fileName);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al descargar el archivo de respaldo.", detalles = ex.Message });
        }
    }

    /// <summary>
    /// Re-verifica en vivo la integridad del hash SHA-256 de un archivo de respaldo.
    /// </summary>
    [HttpPost("backups/verify/{uuid}")]
    public async Task<IActionResult> VerifyBackupIntegrity(Guid uuid)
    {
        try
        {
            var result = await _backupAdminService.VerifyBackupIntegrityAsync(uuid);
            if (!result.Success && result.Message == "Registro de respaldo no encontrado.")
            {
                return NotFound(new { success = false, message = result.Message });
            }

            return Ok(new
            {
                success = result.Success,
                isMatch = result.IsMatch,
                currentHash = result.CurrentHash,
                recordedHash = result.RecordedHash,
                message = result.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al verificar la integridad del archivo.", detalles = ex.Message });
        }
    }

    /// <summary>
    /// Elimina de forma permanente el archivo físico de un respaldo y actualiza su estado.
    /// </summary>
    [HttpDelete("backups/{uuid}")]
    public async Task<IActionResult> PurgeBackupFile(Guid uuid)
    {
        try
        {
            var purged = await _backupAdminService.PurgeBackupAsync(uuid);
            if (!purged)
            {
                return NotFound(new { success = false, message = "Registro de respaldo no encontrado." });
            }

            return Ok(new { success = true, message = "El registro y el archivo físico de respaldo han sido eliminados de forma permanente de la base de datos y del disco." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Error al eliminar el respaldo.", detalles = ex.Message });
        }
    }
}

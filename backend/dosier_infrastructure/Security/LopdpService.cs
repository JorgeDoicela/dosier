using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Security;
using dosier_application.Security.DTOs;
using dosier_infrastructure.data.models;
using dosier_application.Common.Notifications;

namespace dosier_infrastructure.Security;

public class LopdpService : ILopdpService
{
    private readonly DosierContext _context;
    private readonly ILogger<LopdpService> _logger;
    private readonly INotificationService _notificationService;
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(1, 1);

    public LopdpService(DosierContext context, INotificationService notificationService, ILogger<LopdpService> logger)
    {
        _context = context;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<TerminoVigenteDto?> GetTerminoVigenteAsync()
    {
        try
        {
            var termino = await _context.PdTerminosCondiciones
                .AsNoTracking()
                .Where(t => t.EsVigente == 1)
                .OrderByDescending(t => t.IdTermino)
                .FirstOrDefaultAsync();

            if (termino == null)
            {
                termino = await _context.PdTerminosCondiciones
                    .AsNoTracking()
                    .OrderByDescending(t => t.IdTermino)
                    .FirstOrDefaultAsync();
            }

            if (termino == null) return null;

            return new TerminoVigenteDto
            {
                IdTermino = termino.IdTermino,
                VersionTermino = termino.VersionTermino ?? "1.0",
                Contenido = termino.Contenido,
                FechaPublicacion = termino.FechaPublicacion,
                EsVigente = termino.EsVigente == 1
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener término vigente de LOPDP desde pd_terminos_condiciones");
            return null;
        }
    }

    public async Task RegistrarConsentimientoAsync(int idUsuario, string versionPolitica, string? ip, string? userAgent)
    {
        await _semaphore.WaitAsync();
        try
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);
            var idSigafi = user?.IdSigafi ?? idUsuario.ToString();

            // 1. Obtener término vigente de SIGAFI (pd_terminos_condiciones)
            var termino = await _context.PdTerminosCondiciones
                .AsNoTracking()
                .Where(t => t.EsVigente == 1)
                .OrderByDescending(t => t.IdTermino)
                .FirstOrDefaultAsync();
            var idTermino = termino?.IdTermino ?? 1;

            // 2. Registrar en la tabla oficial unificada de SIGAFI (pd_aceptaciones_usuarios)
            var yaAceptoEnSigafi = await _context.PdAceptacionesUsuarios
                .AnyAsync(a => a.IdUsuario == idSigafi && a.IdTermino == idTermino && a.Sistema == "DOSIER");

            if (!yaAceptoEnSigafi)
            {
                var aceptacionSigafi = new PdAceptacionUsuario
                {
                    IdUsuario = idSigafi,
                    IdTermino = idTermino,
                    Sistema = "DOSIER",
                    FechaRegistro = DateTime.Now,
                    IpOrigen = ip,
                    Dispositivo = userAgent != null && userAgent.Length > 200 ? userAgent[..200] : userAgent
                };
                _context.PdAceptacionesUsuarios.Add(aceptacionSigafi);
            }

            // 3. Si es consentimiento general o firma, actualizar metadata de usuario
            if (versionPolitica.Equals("LOPDP_GENERAL", StringComparison.OrdinalIgnoreCase) ||
                versionPolitica.Equals("FIRMA_ELECTRONICA", StringComparison.OrdinalIgnoreCase) ||
                versionPolitica.Equals("FIRMA", StringComparison.OrdinalIgnoreCase))
            {
                var metadata = await _context.DocUsuariosMetadata.FirstOrDefaultAsync(m => m.IdUsuario == idUsuario);
                if (metadata == null)
                {
                    metadata = new DocUsuarioMetadata
                    {
                        IdUsuario = idUsuario,
                        Uuid = Guid.NewGuid(),
                        Version = 1
                    };
                    _context.DocUsuariosMetadata.Add(metadata);
                }

                metadata.AceptoTerminosFirma = true;
                metadata.FechaConsentimientoFirma = DateTime.Now;
                metadata.Version++;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Consentimiento LOPDP registrado exitosamente para Usuario={IdUsuario} (Cédula={Cedula}) en pd_aceptaciones_usuarios", idUsuario, idSigafi);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registrando consentimiento LOPDP para Usuario={IdUsuario}", idUsuario);
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<List<ConsentimientoResponse>> GetAllConsentimientosAsync()
    {
        try
        {
            var usersMap = await _context.Users.AsNoTracking()
                .Select(u => new { u.IdUsuario, u.IdSigafi, u.Nombre })
                .ToDictionaryAsync(u => u.IdSigafi, u => new { u.IdUsuario, u.Nombre });

            var query = await _context.PdAceptacionesUsuarios
                .OrderByDescending(a => a.FechaRegistro)
                .Take(500)
                .ToListAsync();

            return query.Select(a =>
            {
                var userInfo = a.IdUsuario != null && usersMap.TryGetValue(a.IdUsuario, out var u) ? u : null;
                return new ConsentimientoResponse
                {
                    IdConsentimiento = a.IdAceptacionUsuario,
                    Uuid = Guid.Empty,
                    IdUsuario = userInfo?.IdUsuario ?? 0,
                    NombreUsuario = userInfo?.Nombre ?? a.IdUsuario ?? "Sin identificar",
                    VersionPolitica = a.Sistema ?? "SIGAFI",
                    Canal = a.Sistema ?? "Web",
                    FechaConsentimiento = a.FechaRegistro ?? DateTime.Now,
                    IpDireccion = a.IpOrigen,
                    UserAgent = a.Dispositivo,
                    Estado = "Otorgado"
                };
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener consentimientos desde pd_aceptaciones_usuarios");
            throw;
        }
    }

    public async Task AuditoriaAccesoDatosAsync(int? idUsuarioActor, int idUsuarioAfectado, string tablaAfectada, string? columnaAfectada, string operacion, string? motivo, string? ip, string? userAgent)
    {
        try
        {
            var auditoria = new DocLopdpAuditoriaDatos
            {
                IdUsuarioActor = idUsuarioActor,
                IdUsuarioAfectado = idUsuarioAfectado,
                TablaAfectada = tablaAfectada,
                ColumnaAfectada = columnaAfectada,
                Operacion = operacion,
                Motivo = motivo,
                IpDireccion = ip,
                UserAgent = userAgent,
                FechaAcceso = DateTime.Now
            };

            _context.DocLopdpAuditoriaDatos.Add(auditoria);
            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogCritical(ex, "CONTINGENCIA_LOPDP: Fallo en base de datos al registrar auditoría de datos sensibles. " +
                "Actor={Actor}, Afectado={Afectado}, Tabla={Tabla}, Columna={Columna}, Operacion={Operacion}, Motivo={Motivo}, IP={IP}, UserAgent={UA}, Timestamp={Timestamp}",
                idUsuarioActor, idUsuarioAfectado, tablaAfectada, columnaAfectada, operacion, motivo, ip, userAgent, DateTime.UtcNow.ToString("O"));
        }
    }

    public async Task<PerfilLopdpDto?> GetPerfilAsync(int idUsuario)
    {
        try
        {
            var meta = await _context.DocUsuariosMetadata.FirstOrDefaultAsync(m => m.IdUsuario == idUsuario);
            if (meta == null)
            {
                meta = new DocUsuarioMetadata
                {
                    IdUsuario = idUsuario,
                    Uuid = Guid.NewGuid(),
                    Version = 1
                };
                _context.DocUsuariosMetadata.Add(meta);
                await _context.SaveChangesAsync();
            }

            return new PerfilLopdpDto
            {
                AceptoTerminosFirma = meta.AceptoTerminosFirma,
                FechaConsentimientoFirma = meta.FechaConsentimientoFirma,
                HasP12Certificate = false
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al obtener perfil LOPDP para Usuario={IdUsuario}", idUsuario);
            throw;
        }
    }

    public async Task UpdatePerfilAsync(int idUsuario, ActualizarPerfilRequest request)
    {
        try
        {
            var meta = await _context.DocUsuariosMetadata.FirstOrDefaultAsync(m => m.IdUsuario == idUsuario);
            if (meta == null)
            {
                meta = new DocUsuarioMetadata
                {
                    IdUsuario = idUsuario,
                    Uuid = Guid.NewGuid(),
                    Version = 1
                };
                _context.DocUsuariosMetadata.Add(meta);
            }

            if (request.AceptoTerminosFirma.HasValue)
            {
                meta.AceptoTerminosFirma = request.AceptoTerminosFirma.Value;
                if (meta.AceptoTerminosFirma && !meta.FechaConsentimientoFirma.HasValue)
                {
                    meta.FechaConsentimientoFirma = DateTime.UtcNow;
                }
            }
            meta.Version++;

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al actualizar perfil LOPDP para Usuario={IdUsuario}", idUsuario);
            throw;
        }
    }

    public async Task RevocarConsentimientoAsync(int idUsuario, string? ip, string? userAgent)
    {
        await _semaphore.WaitAsync();
        try
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);
            if (user != null && !string.IsNullOrEmpty(user.IdSigafi))
            {
                // Remover aceptaciones de DOSIER en pd_aceptaciones_usuarios
                var aceptaciones = await _context.PdAceptacionesUsuarios
                    .Where(a => a.IdUsuario == user.IdSigafi && a.Sistema == "DOSIER")
                    .ToListAsync();
                _context.PdAceptacionesUsuarios.RemoveRange(aceptaciones);
            }

            var metadata = await _context.DocUsuariosMetadata.FirstOrDefaultAsync(m => m.IdUsuario == idUsuario);
            if (metadata != null)
            {
                metadata.AceptoTerminosFirma = false;
                metadata.FechaConsentimientoFirma = null;
                metadata.Version++;
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Evidencia de revocación LOPDP registrada para el Usuario={IdUsuario}", idUsuario);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error al registrar revocación LOPDP para el Usuario={IdUsuario}", idUsuario);
            throw;
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public async Task<int?> ResolveUserIdBySigafiAsync(string idSigafi)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == idSigafi);
        return user?.IdUsuario;
    }
}

using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Calendario;
using dosier_application.Common.Notifications;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.Calendario;

public class CalendarioService : ICalendarioService
{
    private readonly DosierContext _context;
    private readonly IEmailEngineService _emailEngine;
    private readonly ILogger<CalendarioService> _logger;

    public CalendarioService(
        DosierContext context,
        IEmailEngineService emailEngine,
        ILogger<CalendarioService> logger)
    {
        _context = context;
        _emailEngine = emailEngine;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTOS — Agregación Fuertemente Tipada con EF Core (PEA y Normativos)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<CalendarioEventoDto>> GetEventosAsync(
        DateOnly desde, DateOnly hasta, string rolUsuario, int idUsuario)
    {
        var resultado = new List<CalendarioEventoDto>();

        // 1. INSTRUMENTOS CURRICULARES (PEA) Y SUS HITOS DE CICLO DE VIDA
        var peasQuery = _context.Set<DocPea>()
            .AsNoTracking()
            .Where(p => p.Activo);

        var peas = await peasQuery
            .Select(p => new
            {
                p.IdPea,
                p.Uuid,
                p.IdAsignatura,
                p.Estado,
                p.FechaModificacion
            })
            .ToListAsync();

        foreach (var p in peas)
        {
            var fecha = DateOnly.FromDateTime(p.FechaModificacion);
            if (fecha >= desde && fecha <= hasta)
            {
                resultado.Add(new CalendarioEventoDto(
                    $"PEA-{p.IdPea}",
                    p.Uuid,
                    $"PEA: Asignatura #{p.IdAsignatura}",
                    $"Instrumento Curricular PEA en estado {p.Estado}.",
                    "Curricular",
                    "PEA",
                    fecha,
                    null,
                    true,
                    p.Estado == "Aprobado" ? "#10B981" : (p.Estado == "Observado" ? "#F59E0B" : "#3B82F6"),
                    p.IdPea,
                    p.Uuid,
                    "PEA_OFICIAL",
                    $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}",
                    "DOSIER_DOCENTE,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR",
                    false,
                    "Alta",
                    p.Estado,
                    null,
                    null,
                    false
                ));
            }
        }

        // 2. HITOS NORMATIVOS Y PERSONALES (doc_calendario_eventos_normativos)
        var normativos = await _context.Set<DocCalendarioEventoNormativo>()
            .AsNoTracking()
            .Where(e => e.Activo)
            .ToListAsync();

        foreach (var norm in normativos)
        {
            if (!norm.FechaInicio.HasValue) continue;

            // Filtro de roles visibles
            if (!string.IsNullOrEmpty(norm.RolesVisibles) &&
                !norm.RolesVisibles.Split(',').Select(r => r.Trim()).Contains(rolUsuario)) continue;

            // Filtro de privacidad
            if (norm.EsPrivado && norm.CreadoPor != idUsuario) continue;

            if (norm.RecurrenciaAnual)
            {
                int añoDesde = desde.Year;
                int añoHasta = hasta.Year;
                for (int año = añoDesde; año <= añoHasta; año++)
                {
                    if (norm.RecurrenciaHasta.HasValue && año > norm.RecurrenciaHasta.Value.Year) break;
                    var fechaOcurrencia = new DateOnly(año, norm.FechaInicio.Value.Month, norm.FechaInicio.Value.Day);
                    if (fechaOcurrencia < desde || fechaOcurrencia > hasta) continue;

                    var idCompuesto = $"NORM-{norm.IdEvento}-{año}";
                    resultado.Add(new CalendarioEventoDto(
                        idCompuesto, norm.Uuid, norm.Titulo, norm.Descripcion,
                        "Normativo", norm.TipoEvento,
                        fechaOcurrencia, norm.FechaFin.HasValue
                            ? new DateOnly(año, norm.FechaFin.Value.Month, norm.FechaFin.Value.Day)
                            : null,
                        norm.EsTodoElDia, norm.ColorHex,
                        norm.IdEvento, norm.Uuid, "CALENDARIO_NORMATIVO",
                        norm.UrlAccion, norm.RolesVisibles,
                        norm.EsPrivado, norm.Prioridad, norm.Estado, norm.CreadoPor,
                        norm.AlertaDias, norm.RecurrenciaAnual
                    ));
                }
            }
            else
            {
                var fInicio = norm.FechaInicio.Value;
                var fFin = norm.FechaFin ?? fInicio;
                if (fInicio <= hasta && fFin >= desde)
                {
                    var categoriaGlobal = (norm.TipoEvento is "Normativo" or "Academico" or "Institucional" or "Feriado") ? "Normativo" : "Personal";
                    resultado.Add(new CalendarioEventoDto(
                        $"NORM-{norm.IdEvento}", norm.Uuid, norm.Titulo, norm.Descripcion,
                        categoriaGlobal, norm.TipoEvento,
                        fInicio, norm.FechaFin,
                        norm.EsTodoElDia, norm.ColorHex,
                        norm.IdEvento, norm.Uuid, "CALENDARIO_NORMATIVO",
                        norm.UrlAccion, norm.RolesVisibles,
                        norm.EsPrivado, norm.Prioridad, norm.Estado, norm.CreadoPor,
                        norm.AlertaDias, norm.RecurrenciaAnual
                    ));
                }
            }
        }

        return resultado.OrderBy(e => e.FechaInicio);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // iCAL FEED — RFC 5545
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<string?> GenerarIcalFeedAsync(string token)
    {
        var record = await _context.Set<DocIcalToken>()
            .FirstOrDefaultAsync(t => t.Token == token && t.Activo);
        if (record == null) return null;

        record.FechaUltimoUso = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var usuario = await _context.Users.FindAsync(record.IdUsuario);
        var rol = "DOSIER_DOCENTE";
        if (usuario != null)
        {
            var userRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == usuario.IdUsuario && (ur.EsActivo ?? true))
                .FirstOrDefaultAsync();
            if (userRole?.Role != null)
            {
                rol = userRole.Role.CodigoRol;
            }
        }

        var desde = DateOnly.FromDateTime(DateTime.Today.AddMonths(-1));
        var hasta = DateOnly.FromDateTime(DateTime.Today.AddMonths(6));
        var eventos = await GetEventosAsync(desde, hasta, rol, record.IdUsuario);

        var sb = new StringBuilder();
        sb.AppendLine("BEGIN:VCALENDAR");
        sb.AppendLine("VERSION:2.0");
        sb.AppendLine("PRODID:-//DOSIER//IST Traversari//ES");
        sb.AppendLine("CALSCALE:GREGORIAN");
        sb.AppendLine("METHOD:PUBLISH");
        sb.AppendLine("X-WR-CALNAME:DOSIER — Calendario Curricular Institucional");
        sb.AppendLine("X-WR-TIMEZONE:America/Guayaquil");

        foreach (var ev in eventos)
        {
            sb.AppendLine("BEGIN:VEVENT");
            sb.AppendLine($"UID:{ev.IdEventoCalendario}@dosier.isttraversari.edu.ec");
            sb.AppendLine($"DTSTART;VALUE=DATE:{ev.FechaInicio:yyyyMMdd}");
            if (ev.FechaFin.HasValue)
                sb.AppendLine($"DTEND;VALUE=DATE:{ev.FechaFin.Value.AddDays(1):yyyyMMdd}");
            else
                sb.AppendLine($"DTEND;VALUE=DATE:{ev.FechaInicio.AddDays(1):yyyyMMdd}");
            sb.AppendLine($"SUMMARY:{EscapeIcal(ev.Titulo)}");
            if (!string.IsNullOrEmpty(ev.Descripcion))
                sb.AppendLine($"DESCRIPTION:{EscapeIcal(ev.Descripcion)}");
            if (!string.IsNullOrEmpty(ev.UrlAccion))
                sb.AppendLine($"URL:https://dosier.isttraversari.edu.ec{ev.UrlAccion}");
            sb.AppendLine($"CATEGORIES:{ev.CategoriaGlobal}");
            sb.AppendLine("END:VEVENT");
        }

        sb.AppendLine("END:VCALENDAR");
        return sb.ToString();
    }

    public async Task<string> GenerarORegenerarTokenIcalAsync(int idUsuario)
    {
        var existing = await _context.Set<DocIcalToken>()
            .FirstOrDefaultAsync(t => t.IdUsuario == idUsuario);

        var nuevoToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32)).ToLower();

        if (existing != null)
        {
            existing.Token = nuevoToken;
            existing.FechaGenerado = DateTime.UtcNow;
            existing.Activo = true;
        }
        else
        {
            _context.Set<DocIcalToken>().Add(new DocIcalToken
            {
                Uuid = Guid.NewGuid().ToString(),
                IdUsuario = idUsuario,
                Token = nuevoToken,
                Activo = true,
                FechaGenerado = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return nuevoToken;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CRUD Normativos
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<EventoNormativoDto>> GetNormativosAsync()
    {
        return await _context.Set<DocCalendarioEventoNormativo>()
            .OrderBy(e => e.FechaInicio)
            .Select(e => ToDto(e))
            .ToListAsync();
    }

    public async Task<string> CreateNormativoAsync(EventoNormativoDto dto, int idUsuarioAdmin)
    {
        var uuid = Guid.NewGuid().ToString();
        var entity = new DocCalendarioEventoNormativo
        {
            Uuid = uuid,
            Titulo = dto.Titulo,
            Descripcion = dto.Descripcion,
            TipoEvento = dto.TipoEvento,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin,
            EsTodoElDia = dto.EsTodoElDia,
            RecurrenciaAnual = dto.RecurrenciaAnual,
            RecurrenciaHasta = dto.RecurrenciaHasta,
            RolesVisibles = dto.RolesVisibles,
            ModuloOrigen = dto.ModuloOrigen,
            UrlAccion = dto.UrlAccion,
            ColorHex = dto.ColorHex ?? "#6B7280",
            AlertaDias = dto.AlertaDias,
            Activo = dto.Activo,
            EsPrivado = dto.EsPrivado,
            Prioridad = dto.Prioridad,
            Estado = dto.Estado,
            CreadoPor = idUsuarioAdmin,
            NotaDetalle = dto.NotaDetalle,
            OrdenBandeja = dto.OrdenBandeja
        };
        _context.Set<DocCalendarioEventoNormativo>().Add(entity);
        await _context.SaveChangesAsync();
        return uuid;
    }

    public async Task<bool> UpdateNormativoAsync(string uuid, EventoNormativoDto dto)
    {
        var entity = await _context.Set<DocCalendarioEventoNormativo>()
            .FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (entity == null) return false;

        entity.Titulo = dto.Titulo;
        entity.Descripcion = dto.Descripcion;
        entity.TipoEvento = dto.TipoEvento;
        entity.FechaInicio = dto.FechaInicio;
        entity.FechaFin = dto.FechaFin;
        entity.EsTodoElDia = dto.EsTodoElDia;
        entity.RecurrenciaAnual = dto.RecurrenciaAnual;
        entity.RecurrenciaHasta = dto.RecurrenciaHasta;
        entity.RolesVisibles = dto.RolesVisibles;
        entity.ModuloOrigen = dto.ModuloOrigen;
        entity.UrlAccion = dto.UrlAccion;
        entity.ColorHex = dto.ColorHex ?? "#6B7280";
        entity.AlertaDias = dto.AlertaDias;
        entity.Activo = dto.Activo;
        entity.EsPrivado = dto.EsPrivado;
        entity.Prioridad = dto.Prioridad;
        entity.Estado = dto.Estado;
        entity.NotaDetalle = dto.NotaDetalle;
        entity.OrdenBandeja = dto.OrdenBandeja;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteNormativoAsync(string uuid)
    {
        var entity = await _context.Set<DocCalendarioEventoNormativo>()
            .FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (entity == null) return false;
        _context.Set<DocCalendarioEventoNormativo>().Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ALERTAS DIARIAS
    // ─────────────────────────────────────────────────────────────────────────
    public async Task ProcesarAlertasDiariasAsync()
    {
        _logger.LogInformation("[Calendario] Procesando alertas diarias...");

        var usuarios = await _context.Users
            .Where(u => u.Activo)
            .ToListAsync();

        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var eventos = await _context.Set<DocCalendarioEventoNormativo>()
            .Where(e => e.Activo && e.AlertaDias.HasValue && e.AlertaDias.Value >= 0)
            .ToListAsync();

        foreach (var usuario in usuarios)
        {
            var userRole = await _context.UserRoles
                .Include(ur => ur.Role)
                .Where(ur => ur.IdUsuario == usuario.IdUsuario && (ur.EsActivo ?? true))
                .FirstOrDefaultAsync();
            var rol = userRole?.Role?.CodigoRol ?? "DOSIER_DOCENTE";

            try
            {
                foreach (var evento in eventos)
                {
                    if (!evento.FechaInicio.HasValue) continue;

                    if (evento.EsPrivado && evento.CreadoPor != usuario.IdUsuario) continue;

                    if (!evento.EsPrivado &&
                        !string.IsNullOrEmpty(evento.RolesVisibles) &&
                        !evento.RolesVisibles.Split(',').Select(r => r.Trim()).Contains(rol)) continue;

                    DateOnly fechaInicioOcurrencia = evento.FechaInicio.Value;
                    if (evento.RecurrenciaAnual)
                    {
                        if (evento.RecurrenciaHasta.HasValue && hoy.Year > evento.RecurrenciaHasta.Value.Year) continue;
                        fechaInicioOcurrencia = new DateOnly(hoy.Year, evento.FechaInicio.Value.Month, evento.FechaInicio.Value.Day);
                    }

                    if (fechaInicioOcurrencia < hoy) continue;

                    var fechaAlerta = fechaInicioOcurrencia.AddDays(-(evento.AlertaDias ?? 0));
                    if (fechaAlerta > hoy) continue;

                    var idCompuesto = $"NORM-{evento.IdEvento}";

                    var yaEnviada = await _context.Set<DocCalendarioAlertaEnviada>()
                        .AnyAsync(a =>
                            a.IdEventoCalendario == idCompuesto &&
                            a.IdUsuario == usuario.IdUsuario &&
                            a.FechaEvento == evento.FechaInicio.Value);

                    if (yaEnviada) continue;

                    try
                    {
                        var diasRestantes = evento.FechaInicio.Value.DayNumber - hoy.DayNumber;
                        var sendRequest = new EmailSendRequest
                        {
                            TemplateCodigo = "CALENDARIO_ALERTA_EVENTO",
                            DestinatariosEmails = new List<string> { usuario.EmailInstitucional ?? "" },
                            TemplateData = new Dictionary<string, string>
                            {
                                ["[[titulo_evento]]"]      = evento.Titulo,
                                ["[[dias_restantes]]"]     = diasRestantes.ToString(),
                                ["[[fecha_evento]]"]       = evento.FechaInicio.Value.ToString("dd 'de' MMMM 'de' yyyy"),
                                ["[[descripcion_evento]]"] = evento.Descripcion ?? "",
                                ["[[url_accion]]"]         = evento.UrlAccion ?? "/calendario",
                                ["[[nombre_usuario]]"]     = usuario.Nombre ?? usuario.EmailInstitucional ?? ""
                            }
                        };

                        await _emailEngine.SendTemplatedEmailAsync(sendRequest);

                        _context.Set<DocCalendarioAlertaEnviada>().Add(new DocCalendarioAlertaEnviada
                        {
                            IdEventoCalendario = idCompuesto,
                            IdUsuario          = usuario.IdUsuario,
                            FechaEvento        = evento.FechaInicio.Value,
                            FechaEnvio         = DateTime.UtcNow
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "[Calendario] Error al enviar alerta al usuario {Id}", usuario.IdUsuario);
                    }
                }

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[Calendario] Error procesando usuario {Id}", usuario.IdUsuario);
            }
        }

        _logger.LogInformation("[Calendario] Alertas diarias procesadas.");
    }

    public async Task<IEnumerable<EventoNormativoDto>> GetStickyNotesAsync(int idUsuario)
    {
        return await _context.Set<DocCalendarioEventoNormativo>()
            .Where(e => e.CreadoPor == idUsuario && e.FechaInicio == null && e.Activo)
            .OrderBy(e => e.OrdenBandeja == null ? 1 : 0)
            .ThenBy(e => e.OrdenBandeja)
            .ThenByDescending(e => e.FechaRegistro)
            .Select(e => ToDto(e))
            .ToListAsync();
    }

    public async Task<bool> DevolverAInboxAsync(string uuid, int idUsuario)
    {
        var entity = await _context.Set<DocCalendarioEventoNormativo>()
            .FirstOrDefaultAsync(e => e.Uuid == uuid && e.CreadoPor == idUsuario);
        if (entity == null) return false;

        entity.FechaInicio = null;
        entity.FechaFin = null;
        entity.Estado = "Inbox";
        entity.OrdenBandeja = null;

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task ReordenarBandejaAsync(IEnumerable<ReordenarBandejaItem> items, int idUsuario)
    {
        var uuids = items.Select(i => i.Uuid).ToList();
        var entities = await _context.Set<DocCalendarioEventoNormativo>()
            .Where(e => uuids.Contains(e.Uuid) && e.CreadoPor == idUsuario && e.FechaInicio == null)
            .ToListAsync();

        foreach (var item in items)
        {
            var entity = entities.FirstOrDefault(e => e.Uuid == item.Uuid);
            if (entity != null)
                entity.OrdenBandeja = item.Orden;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int?> ResolveUserIdBySigafiAsync(string idSigafi)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == idSigafi);
        return user?.IdUsuario;
    }

    public async Task<bool?> UpdateUsuarioEventoAsync(string uuid, EventoNormativoDto dto, int idUsuario)
    {
        var existing = await _context.Set<DocCalendarioEventoNormativo>().FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (existing == null) return null;
        if (existing.CreadoPor != idUsuario) return false;

        return await UpdateNormativoAsync(uuid, dto);
    }

    public async Task<bool?> DeleteUsuarioEventoAsync(string uuid, int idUsuario)
    {
        var existing = await _context.Set<DocCalendarioEventoNormativo>().FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (existing == null) return null;
        if (existing.CreadoPor != idUsuario) return false;

        return await DeleteNormativoAsync(uuid);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────
    private static EventoNormativoDto ToDto(DocCalendarioEventoNormativo e) => new(
        e.Uuid, e.Titulo, e.Descripcion, e.TipoEvento,
        e.FechaInicio, e.FechaFin, e.EsTodoElDia,
        e.RecurrenciaAnual, e.RecurrenciaHasta,
        e.RolesVisibles, e.ModuloOrigen, e.UrlAccion,
        e.ColorHex, e.AlertaDias, e.Activo,
        e.EsPrivado, e.Prioridad, e.Estado,
        e.NotaDetalle, e.OrdenBandeja
    );

    private static string EscapeIcal(string s) =>
        s.Replace("\\", "\\\\").Replace(";", "\\;").Replace(",", "\\,").Replace("\n", "\\n");
}

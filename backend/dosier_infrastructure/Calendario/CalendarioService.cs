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
    // ─────────────────────────────────────────────────────────────────────────
    // EVENTOS — Agregación Fuertemente Tipada con EF Core (PEA y Normativos)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<CalendarioEventoDto>> GetEventosAsync(
        DateOnly desde, DateOnly hasta, string rolUsuario, int idUsuario)
    {
        var resultado = new List<CalendarioEventoDto>();

        // 0. RESOLUCIÓN DE IDENTIDAD Y ROLES ACTIVOS
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);
        var userRoles = await _context.UserRoles.AsNoTracking()
            .Where(ur => ur.IdUsuario == idUsuario && (ur.EsActivo ?? true) && ur.Role != null)
            .Select(ur => ur.Role.CodigoRol)
            .ToListAsync();

        if (!string.IsNullOrEmpty(rolUsuario) && !userRoles.Contains(rolUsuario))
        {
            userRoles.Add(rolUsuario);
        }

        bool isAdmin = (user != null && user.Administrador) || userRoles.Contains("DOSIER_ADMIN");
        bool isVicerrector = userRoles.Contains("DOSIER_VICERRECTOR");
        bool isCoordAcad = userRoles.Contains("DOSIER_COORD_ACAD");
        bool isCoordCarrera = userRoles.Contains("DOSIER_COORD_CARRERA");

        // 1. INSTRUMENTOS CURRICULARES (PEA) Y SUS HITOS DE CICLO DE VIDA
        var peasQuery = _context.DocPeas.AsNoTracking().Where(p => p.Activo);

        if (!isAdmin && !isVicerrector && !isCoordAcad && !isCoordCarrera)
        {
            // Docente exclusivo: solo ve los PEAs que elabora
            if (user != null && !string.IsNullOrEmpty(user.IdSigafi))
            {
                peasQuery = peasQuery.Where(p => p.IdDocenteElaborador == user.IdSigafi);
            }
        }
        else if (isCoordCarrera && !isAdmin && !isVicerrector && !isCoordAcad && user != null && !string.IsNullOrEmpty(user.IdSigafi))
        {
            // Coordinador de carrera: supervisa las carreras que coordina o sus materias formuladas
            var carrerasCoordinadas = await _context.DocAutoridadesCurriculares.AsNoTracking()
                .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                .Select(a => a.IdCarrera!.Value)
                .ToListAsync();

            if (carrerasCoordinadas.Any())
            {
                peasQuery = peasQuery.Where(p => carrerasCoordinadas.Contains(p.IdCarrera) || p.IdDocenteElaborador == user.IdSigafi);
            }
            else
            {
                peasQuery = peasQuery.Where(p => p.IdDocenteElaborador == user.IdSigafi);
            }
        }
        // Admin, Vicerrector y CoordAcad supervisan todos los PEAs institucionales

        var rawPeas = await peasQuery
            .Select(p => new
            {
                p.IdPea,
                p.Uuid,
                p.IdAsignatura,
                p.IdCarrera,
                p.IdPeriodo,
                p.IdDocenteElaborador,
                p.Paralelo,
                p.SemestreNivel,
                p.Estado,
                p.FechaCreacion,
                p.FechaModificacion,
                p.FechaElaborado,
                p.FechaRevisadoCoord,
                p.FechaRevisadoAcad,
                p.FechaAprobado
            })
            .ToListAsync();

        if (rawPeas.Any())
        {
            var carreraIds = rawPeas.Select(p => p.IdCarrera).Distinct().ToList();
            var asignaturaIds = rawPeas.Select(p => p.IdAsignatura).Distinct().ToList();
            var docenteIds = rawPeas.Where(p => !string.IsNullOrEmpty(p.IdDocenteElaborador))
                                    .Select(p => p.IdDocenteElaborador!)
                                    .Distinct().ToList();

            var carrerasList = await _context.Carreras.AsNoTracking()
                .Where(c => carreraIds.Contains(c.IdCarrera))
                .Select(c => new { c.IdCarrera, c.Carrera1 })
                .ToListAsync();
            var carrerasMap = carrerasList
                .GroupBy(c => c.IdCarrera)
                .ToDictionary(g => g.Key, g => g.First().Carrera1);

            var asignaturasList = await _context.Asignaturas.AsNoTracking()
                .Where(a => asignaturaIds.Contains(a.IdAsignatura))
                .Select(a => new { a.IdAsignatura, a.Asignatura1, a.Codigo })
                .ToListAsync();
            var asignaturasMap = asignaturasList
                .GroupBy(a => a.IdAsignatura)
                .ToDictionary(g => g.Key, g => new { Nombre = g.First().Asignatura1, Codigo = g.First().Codigo });

            var profesoresList = await _context.Profesores.AsNoTracking()
                .Where(pr => docenteIds.Contains(pr.IdProfesor))
                .Select(pr => new { pr.IdProfesor, pr.Nombres, pr.Apellidos })
                .ToListAsync();
            var profesoresMap = profesoresList
                .GroupBy(pr => pr.IdProfesor)
                .ToDictionary(g => g.Key, g => $"{g.First().Nombres} {g.First().Apellidos}".Trim());

            foreach (var p in rawPeas)
            {
                var nombreAsignatura = asignaturasMap.TryGetValue(p.IdAsignatura, out var asig) && !string.IsNullOrWhiteSpace(asig.Nombre)
                    ? asig.Nombre
                    : $"Asignatura #{p.IdAsignatura}";
                var codigoAsignatura = asig?.Codigo ?? "";
                var nombreCarrera = carrerasMap.TryGetValue(p.IdCarrera, out var carr) && !string.IsNullOrWhiteSpace(carr)
                    ? carr
                    : "Carrera Institucional";
                var nombreDocente = (!string.IsNullOrEmpty(p.IdDocenteElaborador) && profesoresMap.TryGetValue(p.IdDocenteElaborador, out var prof))
                    ? prof
                    : "Docente de Asignatura";

                DateOnly fechaEvento;
                string titulo;
                string descripcion;
                string categoriaGlobal;
                string subcategoria;
                string colorHex;
                string prioridad;
                string estadoKanban;
                string urlAccion;

                switch (p.Estado)
                {
                    case "Observado":
                        fechaEvento = DateOnly.FromDateTime(p.FechaModificacion);
                        titulo = $"Observaciones PEA: {nombreAsignatura}";
                        descripcion = $"Corrección disciplinar requerida para {nombreAsignatura} ({nombreCarrera}). Docente: {nombreDocente}.";
                        categoriaGlobal = "Revision";
                        subcategoria = "Revision";
                        colorHex = "#EF4444";
                        prioridad = "Alta";
                        estadoKanban = "Pendiente";
                        urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        break;

                    case "EnRevision":
                        fechaEvento = p.FechaElaborado.HasValue ? DateOnly.FromDateTime(p.FechaElaborado.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        if (isCoordCarrera)
                        {
                            titulo = $"Revisión Disciplinar: {nombreAsignatura}";
                            descripcion = $"Pendiente de validación de contenidos mínimos de {nombreCarrera}. Formulado por {nombreDocente}.";
                            categoriaGlobal = "Revision";
                            subcategoria = "Revision";
                            colorHex = "#8B5CF6";
                            prioridad = "Alta";
                            estadoKanban = "Pendiente";
                            urlAccion = "/coordinacion-carrera";
                        }
                        else
                        {
                            titulo = $"PEA en Revisión: {nombreAsignatura}";
                            descripcion = $"Instrumento curricular remitido a Coordinación de Carrera para aval disciplinar.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "EntregaPea";
                            colorHex = "#8B5CF6";
                            prioridad = "Media";
                            estadoKanban = "Pendiente";
                            urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        }
                        break;

                    case "RevisadoCoord":
                        fechaEvento = p.FechaRevisadoCoord.HasValue ? DateOnly.FromDateTime(p.FechaRevisadoCoord.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        if (isCoordAcad)
                        {
                            titulo = $"Validación Académica: {nombreAsignatura}";
                            descripcion = $"Aval de carrera emitido. Pendiente de control de coherencia institucional por Coordinación Académica.";
                            categoriaGlobal = "Revision";
                            subcategoria = "Revision";
                            colorHex = "#3B82F6";
                            prioridad = "Alta";
                            estadoKanban = "Pendiente";
                            urlAccion = "/coordinacion-academica";
                        }
                        else
                        {
                            titulo = $"Aval de Carrera Concedido: {nombreAsignatura}";
                            descripcion = $"Avalado por coordinación de carrera, en trámite de validación institucional.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "Revision";
                            colorHex = "#3B82F6";
                            prioridad = "Media";
                            estadoKanban = "EnProgreso";
                            urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        }
                        break;

                    case "RevisadoAcad":
                        fechaEvento = p.FechaRevisadoAcad.HasValue ? DateOnly.FromDateTime(p.FechaRevisadoAcad.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        if (isVicerrector)
                        {
                            titulo = $"Firma Vicerrectoral: {nombreAsignatura}";
                            descripcion = $"Validación curricular completa. Pendiente de firma y legalización final (DFRM / FirmaEC).";
                            categoriaGlobal = "Firmas";
                            subcategoria = "Firmas";
                            colorHex = "#10B981";
                            prioridad = "Alta";
                            estadoKanban = "Pendiente";
                            urlAccion = "/vicerrectoria";
                        }
                        else
                        {
                            titulo = $"Validación Académica Completada: {nombreAsignatura}";
                            descripcion = $"Validado por Coordinación Académica, en proceso de firma vicerrectoral.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "Firmas";
                            colorHex = "#3B82F6";
                            prioridad = "Baja";
                            estadoKanban = "EnProgreso";
                            urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        }
                        break;

                    case "Aprobado":
                        fechaEvento = p.FechaAprobado.HasValue ? DateOnly.FromDateTime(p.FechaAprobado.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        titulo = $"PEA Aprobado: {nombreAsignatura}";
                        descripcion = $"Instrumento curricular legalizado y oficializado para el período. Docente: {nombreDocente}.";
                        categoriaGlobal = "Curricular";
                        subcategoria = "Firmas";
                        colorHex = "#10B981";
                        prioridad = "Baja";
                        estadoKanban = "Completado";
                        urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        break;

                    default: // Borrador
                        fechaEvento = DateOnly.FromDateTime(p.FechaModificacion);
                        titulo = $"Elaboración PEA: {nombreAsignatura}";
                        descripcion = $"Instrumento curricular de {nombreAsignatura} ({nombreCarrera}) en formulación.";
                        categoriaGlobal = "Curricular";
                        subcategoria = "EntregaPea";
                        colorHex = "#F59E0B";
                        prioridad = "Media";
                        estadoKanban = "EnProgreso";
                        urlAccion = $"/curriculum/workspace/PEA_OFICIAL/{p.Uuid}";
                        break;
                }

                if (fechaEvento >= desde && fechaEvento <= hasta)
                {
                    resultado.Add(new CalendarioEventoDto(
                        $"PEA-{p.IdPea}",
                        p.Uuid,
                        titulo,
                        descripcion,
                        categoriaGlobal,
                        subcategoria,
                        fechaEvento,
                        null,
                        true,
                        colorHex,
                        p.IdPea,
                        p.Uuid,
                        "PEA",
                        urlAccion,
                        "DOSIER_DOCENTE,DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD,DOSIER_VICERRECTOR,DOSIER_ADMIN",
                        false,
                        prioridad,
                        estadoKanban,
                        null,
                        null,
                        false
                    ));
                }
            }
        }

        // 2. HITOS DE PERÍODOS ACADÉMICOS INSTITUCIONALES
        var periodos = await _context.Periodos.AsNoTracking()
            .Where(pr => pr.Activo == true || pr.Periodoactivoinstituto == 1)
            .ToListAsync();

        foreach (var per in periodos)
        {
            if (per.FechaInicial.HasValue && per.FechaInicial.Value >= desde && per.FechaInicial.Value <= hasta)
            {
                resultado.Add(new CalendarioEventoDto(
                    $"PER-INI-{per.IdPeriodo}",
                    Guid.NewGuid().ToString(),
                    $"Inicio Período Académico: {per.Detalle}",
                    $"Apertura del período lectivo institucional {per.Detalle}.",
                    "Normativo",
                    "PeriodoAcademico",
                    per.FechaInicial.Value,
                    null,
                    true,
                    "#1E3A8A",
                    null,
                    null,
                    "PERIODO",
                    null,
                    null,
                    false,
                    "Alta",
                    "Pendiente",
                    null,
                    null,
                    false
                ));
            }

            if (per.FechaFinal.HasValue && per.FechaFinal.Value >= desde && per.FechaFinal.Value <= hasta)
            {
                resultado.Add(new CalendarioEventoDto(
                    $"PER-FIN-{per.IdPeriodo}",
                    Guid.NewGuid().ToString(),
                    $"Cierre Período Académico: {per.Detalle}",
                    $"Finalización del ciclo lectivo y cierre de actas institucionales.",
                    "Normativo",
                    "PeriodoAcademico",
                    per.FechaFinal.Value,
                    null,
                    true,
                    "#1E3A8A",
                    null,
                    null,
                    "PERIODO",
                    null,
                    null,
                    false,
                    "Alta",
                    "Pendiente",
                    null,
                    null,
                    false
                ));
            }
        }

        // 3. HITOS NORMATIVOS Y PERSONALES (doc_calendario_eventos_normativos)
        var normativos = await _context.Set<DocCalendarioEventoNormativo>()
            .AsNoTracking()
            .Where(e => e.Activo)
            .ToListAsync();

        foreach (var norm in normativos)
        {
            if (!norm.FechaInicio.HasValue) continue;

            // Filtro de roles visibles
            if (!string.IsNullOrEmpty(norm.RolesVisibles))
            {
                var targetRoles = norm.RolesVisibles
                    .Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(r => r.Trim())
                    .ToList();

                if (!userRoles.Any(ur => targetRoles.Contains(ur)))
                {
                    continue;
                }
            }

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

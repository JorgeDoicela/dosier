using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Academico;
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
    private readonly IPeriodoInstitucionalResolver _periodoResolver;
    private readonly ILogger<CalendarioService> _logger;

    public CalendarioService(
        DosierContext context,
        IEmailEngineService emailEngine,
        IPeriodoInstitucionalResolver periodoResolver,
        ILogger<CalendarioService> logger)
    {
        _context = context;
        _emailEngine = emailEngine;
        _periodoResolver = periodoResolver;
        _logger = logger;
    }

    // ─────────────────────────────────────────────────────────────────────────
    private sealed record UserCalendarScope(
        User? User,
        List<string> Roles,
        bool IsAdmin,
        bool IsVicerrector,
        bool IsCoordAcad,
        bool IsCoordCarrera,
        List<int> CarrerasCoordinadas,
        HashSet<int> CarreraIds
    );

    private async Task<UserCalendarScope> ResolveUserScopeAsync(int idUsuario, string rolUsuario)
    {
        var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);
        var userRoles = await _context.UserRoles.AsNoTracking()
            .Where(ur => ur.IdUsuario == idUsuario && (ur.EsActivo ?? true) && ur.Role != null)
            .Select(ur => ur.Role.CodigoRol)
            .ToListAsync();

        if (!string.IsNullOrEmpty(rolUsuario) && !userRoles.Contains(rolUsuario))
            userRoles.Add(rolUsuario);

        bool isAdmin = (user != null && user.Administrador) || userRoles.Contains("DOSIER_ADMIN");
        bool isVicerrector = userRoles.Contains("DOSIER_VICERRECTOR");
        bool isCoordAcad = userRoles.Contains("DOSIER_COORD_ACAD");
        bool isCoordCarrera = userRoles.Contains("DOSIER_COORD_CARRERA");

        var carrerasCoordinadas = new List<int>();
        var carreraIds = new HashSet<int>();

        if (isAdmin || isVicerrector || isCoordAcad)
        {
            var todasInstituto = await _context.Carreras.AsNoTracking()
                .Where(c => c.EsInstituto == 1)
                .Select(c => c.IdCarrera)
                .ToListAsync();
            foreach (var id in todasInstituto) carreraIds.Add(id);
        }
        else if (user != null && !string.IsNullOrEmpty(user.IdSigafi))
        {
            var idPeriodoActivo = await _periodoResolver.GetIdPeriodoActivoAsync();
            bool hasPeriodoActivo = !string.IsNullOrWhiteSpace(idPeriodoActivo);

            if (isCoordCarrera)
            {
                carrerasCoordinadas = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                    .Select(a => a.IdCarrera!.Value)
                    .ToListAsync();
                foreach (var id in carrerasCoordinadas) carreraIds.Add(id);
            }

            // Carreras donde el docente tiene carga asignada en el período activo de SIGAFI (solo lectura)
            var carrerasProfPeriodo = await _context.ProfesoresCarrerasPeriodos.AsNoTracking()
                .Where(pc => pc.IdProfesor == user.IdSigafi
                    && pc.IdCarrera != null
                    && pc.EsActivo == 1
                    && (!hasPeriodoActivo || pc.IdPeriodo == idPeriodoActivo))
                .Select(pc => pc.IdCarrera!.Value)
                .Distinct()
                .ToListAsync();
            foreach (var id in carrerasProfPeriodo) carreraIds.Add(id);

            var nivelIds = await _context.AsignacionesProfesores.AsNoTracking()
                .Where(am => am.IdProfesor == user.IdSigafi
                    && am.Activo == 1
                    && (!hasPeriodoActivo || am.IdPeriodo == idPeriodoActivo))
                .Select(am => am.IdNivel)
                .Distinct()
                .ToListAsync();

            if (nivelIds.Any())
            {
                var carrerasAsignadas = await _context.Cursos.AsNoTracking()
                    .Where(c => nivelIds.Contains(c.IdNivel))
                    .Select(c => c.IdCarrera)
                    .Distinct()
                    .ToListAsync();
                foreach (var id in carrerasAsignadas) carreraIds.Add(id);
            }

            // Carreras donde tiene PEAs elaborados en el período activo
            var carrerasPeas = await _context.DocPeas.AsNoTracking()
                .Where(p => p.Activo
                    && p.IdDocenteElaborador == user.IdSigafi
                    && (!hasPeriodoActivo || p.IdPeriodo == idPeriodoActivo))
                .Select(p => p.IdCarrera)
                .Distinct()
                .ToListAsync();
            foreach (var id in carrerasPeas) carreraIds.Add(id);

            // Filtrar solo carreras pertenecientes al instituto (esInstituto == 1)
            if (carreraIds.Any())
            {
                var validas = await _context.Carreras.AsNoTracking()
                    .Where(c => carreraIds.Contains(c.IdCarrera) && c.EsInstituto == 1)
                    .Select(c => c.IdCarrera)
                    .ToListAsync();
                carreraIds = validas.ToHashSet();
            }
        }

        return new UserCalendarScope(user, userRoles, isAdmin, isVicerrector, isCoordAcad, isCoordCarrera, carrerasCoordinadas, carreraIds);
    }

    public async Task<IEnumerable<CalendarioCarreraDto>> GetCarrerasUsuarioAsync(int idUsuario, string rolUsuario)
    {
        var scope = await ResolveUserScopeAsync(idUsuario, rolUsuario);
        if (!scope.CarreraIds.Any()) return Enumerable.Empty<CalendarioCarreraDto>();

        var carreras = await _context.Carreras.AsNoTracking()
            .Where(c => scope.CarreraIds.Contains(c.IdCarrera) && c.EsInstituto == 1)
            .Select(c => new { c.IdCarrera, c.Carrera1 })
            .ToListAsync();

        return carreras
            .GroupBy(c => c.IdCarrera)
            .Select(g => new CalendarioCarreraDto(g.Key, g.First().Carrera1 ?? $"Carrera #{g.Key}"))
            .OrderBy(c => c.Nombre)
            .ToList();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTOS — Agregación Fuertemente Tipada con EF Core (PEA y Normativos)
    // ─────────────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<CalendarioEventoDto>> GetEventosAsync(
        DateOnly desde, DateOnly hasta, string rolUsuario, int idUsuario, int? idCarreraFiltro = null)
    {
        var resultado = new List<CalendarioEventoDto>();

        // 0. RESOLUCIÓN DE IDENTIDAD, ROLES Y CARRERAS DEL USUARIO
        var scope = await ResolveUserScopeAsync(idUsuario, rolUsuario);
        var user = scope.User;
        var userRoles = scope.Roles;
        bool isAdmin = scope.IsAdmin;
        bool isVicerrector = scope.IsVicerrector;
        bool isCoordAcad = scope.IsCoordAcad;
        bool isCoordCarrera = scope.IsCoordCarrera;
        bool isAutoridadSuperior = isAdmin || isVicerrector || isCoordAcad;

        // 1. INSTRUMENTOS CURRICULARES (PEA) — Unificado por carrera para que toda la carrera vea el mismo cronograma
        var peasQuery = _context.DocPeas.AsNoTracking().Where(p => p.Activo);

        if (idCarreraFiltro.HasValue)
        {
            if (!isAutoridadSuperior && !scope.CarreraIds.Contains(idCarreraFiltro.Value))
            {
                peasQuery = peasQuery.Where(_ => false);
            }
            else
            {
                peasQuery = peasQuery.Where(p => p.IdCarrera == idCarreraFiltro.Value);
            }
        }
        else if (!isAutoridadSuperior)
        {
            if (scope.CarreraIds.Any() || (user != null && !string.IsNullOrEmpty(user.IdSigafi)))
            {
                var idSigafi = user?.IdSigafi ?? "";
                peasQuery = peasQuery.Where(p =>
                    scope.CarreraIds.Contains(p.IdCarrera) ||
                    (!string.IsNullOrEmpty(idSigafi) && p.IdDocenteElaborador == idSigafi));
            }
            else
            {
                peasQuery = peasQuery.Where(_ => false);
            }
        }

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
                p.FechaAprobado,
                UltimoMotivoObservado = p.Trazabilidades
                    .Where(t => t.EstadoNuevo == "Observado")
                    .OrderByDescending(t => t.FechaTransicion)
                    .Select(t => t.Motivo)
                    .FirstOrDefault()
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

                var esPropio = user != null && !string.IsNullOrEmpty(user.IdSigafi) &&
                    string.Equals(p.IdDocenteElaborador, user.IdSigafi, StringComparison.OrdinalIgnoreCase);
                var workspaceUrl = esPropio
                    ? $"/documentacion/mis-proyectos/workspace/pea-oficial/{p.Uuid}?edit=pea-oficial"
                    : $"/documentacion/workspace/pea-oficial/{p.Uuid}?edit=pea-oficial";
                var revisionUrl = $"/documentacion/revision-tecnica/{p.Uuid}";

                switch (p.Estado)
                {
                    case "Observado":
                        fechaEvento = DateOnly.FromDateTime(p.FechaModificacion);
                        if (!string.IsNullOrWhiteSpace(p.UltimoMotivoObservado))
                        {
                            var match = System.Text.RegularExpressions.Regex.Match(p.UltimoMotivoObservado, @"\b(\d{4}-\d{2}-\d{2})\b");
                            if (match.Success && DateOnly.TryParse(match.Groups[1].Value, out var fechaParsed))
                            {
                                fechaEvento = fechaParsed;
                            }
                        }
                        titulo = $"Límite Subsanación PEA: {nombreAsignatura}";
                        descripcion = $"Plazo límite de entrega de correcciones para {nombreAsignatura} ({nombreCarrera}). Docente: {nombreDocente}.";
                        categoriaGlobal = "Revision";
                        subcategoria = "Revision";
                        colorHex = "#EF4444";
                        prioridad = "Alta";
                        estadoKanban = "Pendiente";
                        urlAccion = workspaceUrl;
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
                            urlAccion = revisionUrl;
                        }
                        else
                        {
                            titulo = $"PEA en Revisión: {nombreAsignatura}";
                            descripcion = $"Instrumento curricular remitido a Coordinación de Carrera para revisión disciplinar.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "EntregaPea";
                            colorHex = "#8B5CF6";
                            prioridad = "Media";
                            estadoKanban = "Pendiente";
                            urlAccion = workspaceUrl;
                        }
                        break;

                    case "Corregido":
                        fechaEvento = p.FechaElaborado.HasValue ? DateOnly.FromDateTime(p.FechaElaborado.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        if (isCoordCarrera)
                        {
                            titulo = $"Revisión Disciplinar (Corregido): {nombreAsignatura}";
                            descripcion = $"Observaciones subsanadas por {nombreDocente} ({nombreCarrera}). Pendiente de segunda revisión.";
                            categoriaGlobal = "Revision";
                            subcategoria = "Revision";
                            colorHex = "#8B5CF6";
                            prioridad = "Alta";
                            estadoKanban = "Pendiente";
                            urlAccion = revisionUrl;
                        }
                        else
                        {
                            titulo = $"PEA Corregido: {nombreAsignatura}";
                            descripcion = $"Correcciones remitidas a Coordinación de Carrera para segunda revisión.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "Revision";
                            colorHex = "#8B5CF6";
                            prioridad = "Media";
                            estadoKanban = "EnProgreso";
                            urlAccion = workspaceUrl;
                        }
                        break;

                    case "RevisadoCoord":
                        fechaEvento = p.FechaRevisadoCoord.HasValue ? DateOnly.FromDateTime(p.FechaRevisadoCoord.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        if (isCoordAcad)
                        {
                            titulo = $"Validación Académica: {nombreAsignatura}";
                            descripcion = $"Aprobación de carrera emitida. Pendiente de control de coherencia institucional por Coordinación Académica.";
                            categoriaGlobal = "Revision";
                            subcategoria = "Revision";
                            colorHex = "#3B82F6";
                            prioridad = "Alta";
                            estadoKanban = "Pendiente";
                            urlAccion = revisionUrl;
                        }
                        else
                        {
                            titulo = $"Aprobación de Carrera Concedida: {nombreAsignatura}";
                            descripcion = $"Aprobado por coordinación de carrera, en trámite de validación institucional.";
                            categoriaGlobal = "Curricular";
                            subcategoria = "Revision";
                            colorHex = "#3B82F6";
                            prioridad = "Media";
                            estadoKanban = "EnProgreso";
                            urlAccion = workspaceUrl;
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
                            urlAccion = revisionUrl;
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
                            urlAccion = workspaceUrl;
                        }
                        break;

                    case "Aprobado":
                    case "Publicado":
                        fechaEvento = p.FechaAprobado.HasValue ? DateOnly.FromDateTime(p.FechaAprobado.Value) : DateOnly.FromDateTime(p.FechaModificacion);
                        titulo = $"PEA Aprobado: {nombreAsignatura}";
                        descripcion = $"Instrumento curricular legalizado y oficializado para el período. Docente: {nombreDocente}.";
                        categoriaGlobal = "Curricular";
                        subcategoria = "Firmas";
                        colorHex = "#10B981";
                        prioridad = "Baja";
                        estadoKanban = "Completado";
                        urlAccion = workspaceUrl;
                        break;

                    default: // Borrador / NoIniciado
                        fechaEvento = DateOnly.FromDateTime(p.FechaModificacion);
                        titulo = $"Elaboración PEA: {nombreAsignatura}";
                        descripcion = $"Instrumento curricular de {nombreAsignatura} ({nombreCarrera}) en formulación.";
                        categoriaGlobal = "Curricular";
                        subcategoria = "EntregaPea";
                        colorHex = "#F59E0B";
                        prioridad = "Media";
                        estadoKanban = "EnProgreso";
                        urlAccion = workspaceUrl;
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
                        false,
                        p.IdCarrera,
                        nombreCarrera,
                        nombreDocente
                    ));
                }
            }
        }

        // 2. HITOS DE PERÍODOS ACADÉMICOS INSTITUCIONALES (Exclusivo Instituto ISTPET, descartando Conducción)
        var periodos = await _context.Periodos.AsNoTracking()
            .Where(pr => (pr.EsConduccion == 0 || pr.EsConduccion == null) && (pr.EsInstituto == 1 || pr.Periodoactivoinstituto == 1))
            .ToListAsync();

        foreach (var per in periodos)
        {
            if (per.FechaInicial.HasValue && per.FechaInicial.Value >= desde && per.FechaInicial.Value <= hasta)
            {
                resultado.Add(new CalendarioEventoDto(
                    $"PER-INI-{per.IdPeriodo}",
                    $"00000000-0000-0000-0001-{per.IdPeriodo:D12}",
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
                    $"00000000-0000-0000-0002-{per.IdPeriodo:D12}",
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

        // 3. HITOS NORMATIVOS, DE CARRERA Y PERSONALES (doc_calendario_eventos_normativos)
        var normativos = await _context.Set<DocCalendarioEventoNormativo>()
            .AsNoTracking()
            .Where(e => e.Activo)
            .ToListAsync();

        var normCarreraIds = normativos
            .Where(n => n.IdCarrera.HasValue)
            .Select(n => n.IdCarrera!.Value)
            .Distinct()
            .ToList();

        var normCarrerasMap = normCarreraIds.Any()
            ? (await _context.Carreras.AsNoTracking()
                .Where(c => normCarreraIds.Contains(c.IdCarrera))
                .Select(c => new { c.IdCarrera, c.Carrera1 })
                .ToListAsync())
                .GroupBy(c => c.IdCarrera)
                .ToDictionary(g => g.Key, g => g.First().Carrera1 ?? $"Carrera #{g.Key}")
            : new Dictionary<int, string>();

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

            // Filtro de privacidad y alcance por carrera
            if (norm.EsPrivado)
            {
                if (norm.CreadoPor != idUsuario) continue;
                if (idCarreraFiltro.HasValue && norm.IdCarrera.HasValue && norm.IdCarrera.Value != idCarreraFiltro.Value) continue;
            }
            else if (norm.IdCarrera.HasValue)
            {
                // Evento compartido de carrera
                if (!isAutoridadSuperior && !scope.CarreraIds.Contains(norm.IdCarrera.Value)) continue;
                if (idCarreraFiltro.HasValue && norm.IdCarrera.Value != idCarreraFiltro.Value) continue;
            }
            // Si !norm.EsPrivado && !norm.IdCarrera.HasValue -> Evento institucional visible para todos

            var nombreCarreraNorm = norm.IdCarrera.HasValue && normCarrerasMap.TryGetValue(norm.IdCarrera.Value, out var nc)
                ? nc
                : null;
            var categoriaGlobal = ResolveCategoriaGlobal(norm);
            var puedeGestionar = norm.CreadoPor == idUsuario ||
                (!norm.EsPrivado && (isAutoridadSuperior ||
                    (norm.IdCarrera.HasValue && scope.CarreraIds.Contains(norm.IdCarrera.Value))));

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
                        categoriaGlobal, norm.TipoEvento,
                        fechaOcurrencia, norm.FechaFin.HasValue
                            ? new DateOnly(año, norm.FechaFin.Value.Month, norm.FechaFin.Value.Day)
                            : null,
                        norm.EsTodoElDia, norm.ColorHex,
                        norm.IdEvento, norm.Uuid, "CALENDARIO_NORMATIVO",
                        norm.UrlAccion, norm.RolesVisibles,
                        norm.EsPrivado, norm.Prioridad, norm.Estado, norm.CreadoPor,
                        norm.AlertaDias, norm.RecurrenciaAnual,
                        norm.IdCarrera, nombreCarreraNorm, null, puedeGestionar
                    ));
                }
            }
            else
            {
                var fInicio = norm.FechaInicio.Value;
                var fFin = norm.FechaFin ?? fInicio;
                if (fInicio <= hasta && fFin >= desde)
                {
                    resultado.Add(new CalendarioEventoDto(
                        $"NORM-{norm.IdEvento}", norm.Uuid, norm.Titulo, norm.Descripcion,
                        categoriaGlobal, norm.TipoEvento,
                        fInicio, norm.FechaFin,
                        norm.EsTodoElDia, norm.ColorHex,
                        norm.IdEvento, norm.Uuid, "CALENDARIO_NORMATIVO",
                        norm.UrlAccion, norm.RolesVisibles,
                        norm.EsPrivado, norm.Prioridad, norm.Estado, norm.CreadoPor,
                        norm.AlertaDias, norm.RecurrenciaAnual,
                        norm.IdCarrera, nombreCarreraNorm, null, puedeGestionar
                    ));
                }
            }
        }

        return resultado.OrderBy(e => e.FechaInicio);
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
            IdCarrera = dto.IdCarrera,
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
        entity.IdCarrera = dto.IdCarrera;
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
            try
            {
                var userScope = await ResolveUserScopeAsync(usuario.IdUsuario, "");
                var rolesEfectivos = userScope.Roles.Count > 0
                    ? userScope.Roles
                    : new List<string> { "DOSIER_DOCENTE" };
                bool isAutoridadSuperior = userScope.IsAdmin || userScope.IsVicerrector || userScope.IsCoordAcad;

                foreach (var evento in eventos)
                {
                    if (!evento.FechaInicio.HasValue) continue;

                    if (evento.EsPrivado && evento.CreadoPor != usuario.IdUsuario) continue;

                    if (!evento.EsPrivado && !string.IsNullOrEmpty(evento.RolesVisibles))
                    {
                        var targetRoles = evento.RolesVisibles
                            .Split(',', StringSplitOptions.RemoveEmptyEntries)
                            .Select(r => r.Trim())
                            .ToList();
                        if (!rolesEfectivos.Any(r => targetRoles.Contains(r))) continue;
                    }

                    if (!evento.EsPrivado && evento.IdCarrera.HasValue)
                    {
                        if (!isAutoridadSuperior && !userScope.CarreraIds.Contains(evento.IdCarrera.Value))
                            continue;
                    }

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
                            a.FechaEvento == fechaInicioOcurrencia);

                    if (yaEnviada) continue;

                    try
                    {
                        var diasRestantes = fechaInicioOcurrencia.DayNumber - hoy.DayNumber;
                        var sendRequest = new EmailSendRequest
                        {
                            TemplateCodigo = "CALENDARIO_ALERTA_EVENTO",
                            DestinatariosEmails = new List<string> { usuario.EmailInstitucional ?? "" },
                            TemplateData = new Dictionary<string, string>
                            {
                                ["[[titulo_evento]]"]      = evento.Titulo,
                                ["[[dias_restantes]]"]     = diasRestantes.ToString(),
                                ["[[fecha_evento]]"]       = fechaInicioOcurrencia.ToString("dd 'de' MMMM 'de' yyyy"),
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
                            FechaEvento        = fechaInicioOcurrencia,
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

    private static string ResolveCategoriaGlobal(DocCalendarioEventoNormativo norm)
    {
        if (norm.EsPrivado) return "Personal";
        if (norm.IdCarrera.HasValue) return "Carrera";
        return (norm.TipoEvento is "Normativo" or "Academico" or "Institucional" or "Feriado")
            ? "Normativo"
            : "Personal";
    }

    private static EventoNormativoDto NormalizeEventoDto(EventoNormativoDto dto)
    {
        var fechaFin = (dto.FechaInicio.HasValue && dto.FechaFin.HasValue && dto.FechaFin.Value < dto.FechaInicio.Value)
            ? dto.FechaInicio
            : dto.FechaFin;
        var idCarrera = dto.EsPrivado ? null : dto.IdCarrera;
        return dto with { FechaFin = fechaFin, IdCarrera = idCarrera };
    }

    private async Task<bool> CanPublishWithScopeAsync(EventoNormativoDto dto, int idUsuario, string rolUsuario)
    {
        if (dto.EsPrivado) return true;

        var scope = await ResolveUserScopeAsync(idUsuario, rolUsuario);
        bool isAutoridadSuperior = scope.IsAdmin || scope.IsVicerrector || scope.IsCoordAcad;

        if (!dto.IdCarrera.HasValue)
        {
            // Evento para todo el instituto: solo autoridades superiores / admin
            return isAutoridadSuperior;
        }

        // Evento para toda la carrera: docentes y coordinadores dentro de sus carreras asignadas, o autoridades superiores
        return isAutoridadSuperior || scope.CarreraIds.Contains(dto.IdCarrera.Value);
    }

    public async Task<(string? Uuid, bool Forbidden)> CreateUsuarioEventoAsync(EventoNormativoDto dto, int idUsuario, string rolUsuario)
    {
        var normalized = NormalizeEventoDto(dto);
        if (!await CanPublishWithScopeAsync(normalized, idUsuario, rolUsuario))
            return (null, true);

        var uuid = await CreateNormativoAsync(normalized, idUsuario);
        return (uuid, false);
    }

    private async Task<bool> CanManageEventoAsync(DocCalendarioEventoNormativo existing, int idUsuario, string rolUsuario)
    {
        if (existing.CreadoPor == idUsuario) return true;
        if (existing.EsPrivado) return false;

        var scope = await ResolveUserScopeAsync(idUsuario, rolUsuario);
        if (scope.IsAdmin || scope.IsVicerrector || scope.IsCoordAcad) return true;
        if (existing.IdCarrera.HasValue && scope.CarreraIds.Contains(existing.IdCarrera.Value))
            return true;

        return false;
    }

    public async Task<bool?> UpdateUsuarioEventoAsync(string uuid, EventoNormativoDto dto, int idUsuario, string rolUsuario = "")
    {
        var existing = await _context.Set<DocCalendarioEventoNormativo>().FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (existing == null) return null;
        if (!await CanManageEventoAsync(existing, idUsuario, rolUsuario)) return false;

        var normalized = NormalizeEventoDto(dto);
        if (!await CanPublishWithScopeAsync(normalized, idUsuario, rolUsuario)) return false;

        return await UpdateNormativoAsync(uuid, normalized);
    }

    public async Task<bool?> DeleteUsuarioEventoAsync(string uuid, int idUsuario, string rolUsuario = "")
    {
        var existing = await _context.Set<DocCalendarioEventoNormativo>().FirstOrDefaultAsync(e => e.Uuid == uuid);
        if (existing == null) return null;
        if (!await CanManageEventoAsync(existing, idUsuario, rolUsuario)) return false;

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
        e.NotaDetalle, e.OrdenBandeja, e.IdCarrera
    );
}

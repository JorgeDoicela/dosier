using dosier_application.Academico;
using dosier_application.Academico.Dtos;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace dosier_infrastructure.Academico;

public class AcademicContextResolver : IAcademicContextResolver
{
    private readonly DosierContext _context;
    private readonly ILogger<AcademicContextResolver> _logger;

    public AcademicContextResolver(DosierContext context, ILogger<AcademicContextResolver> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AcademicContextDto?> ResolveByAssignmentAsync(
        int idAsignacion,
        string? expectedProfessorId = null,
        CancellationToken cancellationToken = default)
    {
        var assignment = await _context.AsignacionesProfesores
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.IdAsignacion == idAsignacion && a.Activo == 1, cancellationToken);

        if (assignment == null ||
            (!string.IsNullOrWhiteSpace(expectedProfessorId) && assignment.IdProfesor != expectedProfessorId))
        {
            return null;
        }

        var course = await _context.Cursos.AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdNivel == assignment.IdNivel, cancellationToken);
        if (course == null) return null;

        var career = await _context.Carreras.AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdCarrera == course.IdCarrera && c.EsInstituto == 1, cancellationToken);
        if (career == null) return null;

        var mappedGridId = await (
            from mp in _context.MallasPeriodos.AsNoTracking()
            join m in _context.Mallas.AsNoTracking() on mp.IdMalla equals m.IdMalla
            where mp.IdPeriodo == assignment.IdPeriodo
                  && mp.IdNivel == assignment.IdNivel
                  && m.IdCarrera == career.IdCarrera
            select (int?)m.IdMalla)
            .FirstOrDefaultAsync(cancellationToken);

        var source = "mallas_periodos";
        var gridId = mappedGridId;
        var warnings = new List<string>();

        if (gridId == null)
        {
            source = "malla_activa_fallback";
            gridId = await _context.Mallas.AsNoTracking()
                .Where(m => m.IdCarrera == career.IdCarrera && m.Activa == true)
                .OrderByDescending(m => m.IdMalla)
                .Select(m => (int?)m.IdMalla)
                .FirstOrDefaultAsync(cancellationToken);
            warnings.Add("SIGAFI no tiene una malla asociada al periodo y nivel; se uso la malla activa de la carrera.");
        }

        if (gridId == null) return null;

        var grid = await _context.Mallas.AsNoTracking()
            .FirstAsync(m => m.IdMalla == gridId.Value, cancellationToken);
        var detail = await _context.DetalleMallas.AsNoTracking()
            .FirstOrDefaultAsync(d => d.IdMalla == grid.IdMalla
                                      && d.IdAsignatura == assignment.IdAsignatura
                                      && d.Anulada != true,
                cancellationToken);

        // Fallback resiliente: Si la asignatura no se encuentra en la malla activa/seleccionada,
        // buscarla en cualquier malla histórica de la carrera que cubra la materia
        if (detail == null)
        {
            var alternativeGridDetail = await (
                from d in _context.DetalleMallas.AsNoTracking()
                join m in _context.Mallas.AsNoTracking() on d.IdMalla equals m.IdMalla
                where m.IdCarrera == career.IdCarrera
                      && d.IdAsignatura == assignment.IdAsignatura
                      && d.Anulada != true
                orderby (d.IdNivel == assignment.IdNivel ? 1 : 0) descending, m.Activa descending, m.Vigencia descending, m.IdMalla descending
                select new { Detail = d, Grid = m })
                .FirstOrDefaultAsync(cancellationToken);

            if (alternativeGridDetail != null)
            {
                detail = alternativeGridDetail.Detail;
                grid = alternativeGridDetail.Grid;
                gridId = grid.IdMalla;
                source = "malla_historica_fallback";
                warnings.Add($"SIGAFI no tiene esta asignatura en la malla activa actual. Se vinculó automáticamente a la versión de malla '{grid.Descripcion ?? grid.IdMalla.ToString()}'.");
            }
        }

        if (detail == null)
        {
            // Si es actividad de acompañamiento o extracurricular (ej. PAIT, Clubes), proveer contexto seguro
            var isExtra = (assignment.ExtraCurricular == 1);
            if (isExtra)
            {
                var extraSubject = await _context.Asignaturas.AsNoTracking()
                    .FirstOrDefaultAsync(a => a.IdAsignatura == assignment.IdAsignatura, cancellationToken);
                var extraModality = await _context.Modalidades.AsNoTracking()
                    .FirstOrDefaultAsync(m => m.IdModalidad == assignment.IdModalidad, cancellationToken);
                var extraSection = await _context.Secciones.AsNoTracking()
                    .FirstOrDefaultAsync(s => s.IdSeccion == assignment.IdSeccion, cancellationToken);
                var extraPeriod = await _context.Periodos.AsNoTracking()
                    .FirstOrDefaultAsync(p => p.IdPeriodo == assignment.IdPeriodo, cancellationToken);

                return new AcademicContextDto
                {
                    IdAsignacion = assignment.IdAsignacion,
                    IdProfesor = assignment.IdProfesor,
                    IdPeriodo = assignment.IdPeriodo,
                    NombrePeriodo = !string.IsNullOrWhiteSpace(extraPeriod?.Detalle) ? extraPeriod.Detalle : assignment.IdPeriodo,
                    IdCarrera = career.IdCarrera,
                    NombreCarrera = career.Carrera1,
                    CodigoCarrera = !string.IsNullOrWhiteSpace(career.AliasCarrera) ? career.AliasCarrera : career.CodigoCases,
                    IdMalla = 0,
                    DescripcionMalla = "Actividad Institucional",
                    IdDetalleMalla = 0,
                    IdAsignatura = extraSubject?.IdAsignatura ?? assignment.IdAsignatura,
                    CodigoAsignatura = extraSubject?.Codigo,
                    NombreAsignatura = extraSubject?.Asignatura1 ?? "Actividad Institucional",
                    IdNivel = assignment.IdNivel,
                    NombreNivel = course.Nivel,
                    IdModalidad = assignment.IdModalidad,
                    NombreModalidad = extraModality?.ModalidadImpresion ?? extraModality?.Modalidad1,
                    IdSeccion = assignment.IdSeccion,
                    NombreSeccion = extraSection?.Nombre,
                    Paralelo = assignment.Paralelo,
                    HorasTotales = (int)(assignment.NumeroHoras ?? 0),
                    HorasDocencia = assignment.NumeroHoras ?? 0,
                    HorasPracticoExperimental = assignment.HorasPracticoExperimental ?? 0,
                    HorasAutonomo = 0,
                    Creditos = 0,
                    HorasSemanales = assignment.NumeroHoras,
                    EsExtracurricular = true,
                    UnidadOrganizacionCurricular = "Acompañamiento",
                    ModalidadAutorizada = true,
                    FuenteMalla = "actividad_extracurricular",
                    Advertencias = new List<string> { "Actividad de acompañamiento institucional; no requiere formulación de PEA microcurricular." }
                };
            }

            return null;
        }

        var subject = await _context.Asignaturas.AsNoTracking()
            .FirstOrDefaultAsync(a => a.IdAsignatura == assignment.IdAsignatura, cancellationToken);
        if (subject == null) return null;

        var modality = await _context.Modalidades.AsNoTracking()
            .FirstOrDefaultAsync(m => m.IdModalidad == assignment.IdModalidad, cancellationToken);
        var section = await _context.Secciones.AsNoTracking()
            .FirstOrDefaultAsync(s => s.IdSeccion == assignment.IdSeccion, cancellationToken);
        var subjectType = await _context.TiposAsignatura.AsNoTracking()
            .FirstOrDefaultAsync(t => t.IdTipoAsignatura == detail.IdTipoAsignatura, cancellationToken);

        var configuredModalities = await _context.ModalidadesCarreras.AsNoTracking()
            .Where(mc => mc.IdCarrera == career.IdCarrera && mc.EsActivo == 1)
            .Select(mc => mc.IdModalidad)
            .ToListAsync(cancellationToken);
        var modalityAuthorized = configuredModalities.Count == 0 || configuredModalities.Contains(assignment.IdModalidad);
        if (!modalityAuthorized)
            warnings.Add("La modalidad de la asignacion no figura como activa para la carrera en SIGAFI.");

        var prerequisiteEntities = await _context.Prerequisitos.AsNoTracking()
            .Where(p => p.IdDetalleMalla == detail.IdDetalleMalla && p.Activa == 1)
            .ToListAsync(cancellationToken);
        var prerequisiteIds = prerequisiteEntities.Select(p => p.IdAsignatura).Distinct().ToList();
        var prerequisites = await _context.Asignaturas.AsNoTracking()
            .Where(a => prerequisiteIds.Contains(a.IdAsignatura))
            .Select(a => new PrerrequisitoItemDto
            {
                IdAsignatura = a.IdAsignatura,
                Codigo = a.Codigo,
                Asignatura = a.Asignatura1
            })
            .ToListAsync(cancellationToken);

        var totalHours = detail.Horas ?? 0;
        var credits = detail.Creditos ?? 0;
        if (totalHours <= 0 && credits > 0)
        {
            totalHours = credits * 48;
            warnings.Add($"SIGAFI no registraba horas totales; se pre-cargaron {totalHours} horas normativas según {credits} créditos (48h/crédito).");
        }

        var teachingHours = (decimal)(detail.HorasDocente ?? 0);
        var practicalHours = detail.HorasPracticoExperimental ?? 0m;

        // Distribución inteligente y normativa CACES/CES alineada con la carga semanal del distributivo institucional (16 semanas de clase)
        if (totalHours > 0 && teachingHours <= 0m && practicalHours <= 0m)
        {
            var weeklyHours = assignment.NumeroHoras ?? 0m;
            if (weeklyHours > 0m && (weeklyHours * 16m) < totalHours)
            {
                teachingHours = weeklyHours * 16m;
                var remaining = totalHours - teachingHours;
                practicalHours = Math.Floor(remaining / 2m);
            }
            else
            {
                var third = Math.Floor((decimal)totalHours / 3m);
                teachingHours = third;
                practicalHours = third;
            }
        }
        var autonomousHours = Math.Max(0m, (decimal)totalHours - teachingHours - practicalHours);

        var period = await _context.Periodos.AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdPeriodo == assignment.IdPeriodo, cancellationToken);

        _logger.LogDebug(
            "Contexto academico resuelto para asignacion {AssignmentId} mediante {GridSource}",
            idAsignacion,
            source);

        return new AcademicContextDto
        {
            IdAsignacion = assignment.IdAsignacion,
            IdProfesor = assignment.IdProfesor,
            IdPeriodo = assignment.IdPeriodo,
            NombrePeriodo = !string.IsNullOrWhiteSpace(period?.Detalle) ? period.Detalle : assignment.IdPeriodo,
            IdCarrera = career.IdCarrera,
            NombreCarrera = career.Carrera1,
            CodigoCarrera = !string.IsNullOrWhiteSpace(career.AliasCarrera) ? career.AliasCarrera : career.CodigoCases,
            IdMalla = grid.IdMalla,
            DescripcionMalla = grid.Descripcion,
            IdDetalleMalla = detail.IdDetalleMalla,
            IdAsignatura = subject.IdAsignatura,
            CodigoAsignatura = subject.Codigo,
            NombreAsignatura = subject.Asignatura1,
            IdNivel = assignment.IdNivel,
            NombreNivel = course.Nivel,
            IdModalidad = assignment.IdModalidad,
            NombreModalidad = modality?.ModalidadImpresion ?? modality?.Modalidad1,
            IdSeccion = assignment.IdSeccion,
            NombreSeccion = section?.Nombre,
            Paralelo = assignment.Paralelo,
            HorasTotales = totalHours,
            HorasDocencia = teachingHours,
            HorasPracticoExperimental = practicalHours,
            HorasAutonomo = autonomousHours,
            Creditos = credits,
            HorasSemanales = assignment.NumeroHoras,
            EsExtracurricular = (subject.ExtraCurricular == 1) || (assignment.ExtraCurricular == 1),
            UnidadOrganizacionCurricular = NormalizarUnidadOrganizacion(subjectType?.TipoAsignatura1),
            ModalidadAutorizada = modalityAuthorized,
            FuenteMalla = source,
            Prerrequisitos = prerequisites,
            Advertencias = warnings
        };
    }

    public static string NormalizarUnidadOrganizacion(string? tipoAsignatura)
    {
        if (string.IsNullOrWhiteSpace(tipoAsignatura)) return "Unidad Profesional";
        var upper = tipoAsignatura.Trim().ToUpperInvariant();
        return upper switch
        {
            "BASICA" or "BÁSICA" or "UNIDAD BASICA" or "UNIDAD BÁSICA" => "Unidad Básica",
            "PROFESIONAL" or "UNIDAD PROFESIONAL" => "Unidad Profesional",
            "TITULACION" or "TITULACIÓN" or "INTEGRACION" or "INTEGRACIÓN" or "UNIDAD DE INTEGRACION CURRICULAR" or "UNIDAD DE INTEGRACIÓN CURRICULAR" => "Unidad de Integración Curricular",
            "TRONCO COMUN" or "TRONCO COMÚN" => "Unidad Básica",
            _ => tipoAsignatura
        };
    }
}

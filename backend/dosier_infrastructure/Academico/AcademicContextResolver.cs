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
        if (detail == null) return null;

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
        var teachingHours = (decimal)(detail.HorasDocente ?? 0);
        var practicalHours = detail.HorasPracticoExperimental ?? 0m;
        var autonomousHours = Math.Max(0m, totalHours - teachingHours - practicalHours);

        _logger.LogDebug(
            "Contexto academico resuelto para asignacion {AssignmentId} mediante {GridSource}",
            idAsignacion,
            source);

        return new AcademicContextDto
        {
            IdAsignacion = assignment.IdAsignacion,
            IdProfesor = assignment.IdProfesor,
            IdPeriodo = assignment.IdPeriodo,
            IdCarrera = career.IdCarrera,
            NombreCarrera = career.Carrera1,
            CodigoCarrera = career.CodigoCases,
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
            Creditos = detail.Creditos ?? 0,
            UnidadOrganizacionCurricular = subjectType?.TipoAsignatura1,
            ModalidadAutorizada = modalityAuthorized,
            FuenteMalla = source,
            Prerrequisitos = prerequisites,
            Advertencias = warnings
        };
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Academico;
using dosier_application.Academico.Dtos;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Academico;

public class AsignaturasDocenteService : IAsignaturasDocenteService
{
    private readonly DosierContext _context;

    public AsignaturasDocenteService(DosierContext context)
    {
        _context = context;
    }

    public async Task<PeriodoAcademicoDto?> GetPeriodoActivoAsync()
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var periodo = await _context.Periodos
            .AsNoTracking()
            .OrderByDescending(p => p.Periodoactivoinstituto == 1)
            .ThenByDescending(p => p.Activo == true)
            .ThenByDescending(p => p.FechaInicial <= today && p.FechaFinal >= today)
            .ThenByDescending(p => p.FechaInicial)
            .FirstOrDefaultAsync();

        if (periodo == null) return null;

        return new PeriodoAcademicoDto
        {
            IdPeriodo = periodo.IdPeriodo,
            Detalle = periodo.Detalle,
            FechaInicial = periodo.FechaInicial,
            FechaFinal = periodo.FechaFinal,
            EsActivo = (periodo.Periodoactivoinstituto == 1 || periodo.Activo == true)
        };
    }

    public async Task<List<PeriodoAcademicoDto>> GetPeriodosDisponiblesAsync()
    {
        return await _context.Periodos
            .AsNoTracking()
            .OrderByDescending(p => p.FechaInicial)
            .Select(p => new PeriodoAcademicoDto
            {
                IdPeriodo = p.IdPeriodo,
                Detalle = p.Detalle,
                FechaInicial = p.FechaInicial,
                FechaFinal = p.FechaFinal,
                EsActivo = (p.Periodoactivoinstituto == 1 || p.Activo == true)
            })
            .ToListAsync();
    }

    public async Task<List<DocenteAsignaturaDto>> GetMisAsignaturasAsync(string idProfesor, string? idPeriodo = null)
    {
        if (string.IsNullOrWhiteSpace(idPeriodo))
        {
            var periodoActivo = await GetPeriodoActivoAsync();
            idPeriodo = periodoActivo?.IdPeriodo;
        }

        if (string.IsNullOrWhiteSpace(idPeriodo))
            return new List<DocenteAsignaturaDto>();

        // 1. Obtener asignaciones del docente para el período
        var asignaciones = await _context.AsignacionesProfesores
            .AsNoTracking()
            .Where(a => a.IdProfesor == idProfesor && a.IdPeriodo == idPeriodo && a.Activo == 1)
            .ToListAsync();

        if (!asignaciones.Any())
            return new List<DocenteAsignaturaDto>();

        var asignaturaIds = asignaciones.Select(a => a.IdAsignatura).Distinct().ToList();
        var nivelIds = asignaciones.Select(a => a.IdNivel).Distinct().ToList();
        var modalidadIds = asignaciones.Select(a => a.IdModalidad).Distinct().ToList();

        var asignaturasMap = await _context.Asignaturas.AsNoTracking()
            .Where(a => asignaturaIds.Contains(a.IdAsignatura))
            .ToDictionaryAsync(a => a.IdAsignatura);
        var cursosMap = await _context.Cursos.AsNoTracking()
            .Where(c => nivelIds.Contains(c.IdNivel))
            .ToDictionaryAsync(c => c.IdNivel);
        var carreraIds = cursosMap.Values.Select(c => c.IdCarrera).Distinct().ToList();
        var carrerasMap = await _context.Carreras.AsNoTracking()
            .Where(c => carreraIds.Contains(c.IdCarrera) && c.EsInstituto == 1)
            .ToDictionaryAsync(c => c.IdCarrera);
        var modalidadesMap = await _context.Modalidades.AsNoTracking()
            .Where(m => modalidadIds.Contains(m.IdModalidad))
            .ToDictionaryAsync(m => m.IdModalidad);

        var mallasPeriodo = await (
            from mp in _context.MallasPeriodos.AsNoTracking()
            join m in _context.Mallas.AsNoTracking() on mp.IdMalla equals m.IdMalla
            where mp.IdPeriodo == idPeriodo
                  && nivelIds.Contains(mp.IdNivel)
                  && carreraIds.Contains(m.IdCarrera)
            select new { mp.IdNivel, mp.IdMalla, m.IdCarrera })
            .ToListAsync();
        var mallasActivas = await _context.Mallas.AsNoTracking()
            .Where(m => carreraIds.Contains(m.IdCarrera) && m.Activa == true)
            .ToListAsync();
        var mallaIds = mallasPeriodo.Select(m => m.IdMalla)
            .Concat(mallasActivas.Select(m => m.IdMalla))
            .Distinct()
            .ToList();
        var mallasRelevantes = await _context.Mallas.AsNoTracking()
            .Where(m => mallaIds.Contains(m.IdMalla))
            .ToListAsync();
        var detallesMalla = await _context.DetalleMallas.AsNoTracking()
            .Where(d => mallaIds.Contains(d.IdMalla)
                        && asignaturaIds.Contains(d.IdAsignatura)
                        && d.Anulada != true)
            .ToListAsync();
        var tiposAsignaturaIds = detallesMalla.Select(d => d.IdTipoAsignatura).Distinct().ToList();
        var tiposAsignaturaMap = await _context.TiposAsignatura.AsNoTracking()
            .Where(t => tiposAsignaturaIds.Contains(t.IdTipoAsignatura))
            .ToDictionaryAsync(t => t.IdTipoAsignatura);
        var detalleIds = detallesMalla.Select(d => d.IdDetalleMalla).ToList();
        var prerequisitos = await _context.Prerequisitos.AsNoTracking()
            .Where(p => detalleIds.Contains(p.IdDetalleMalla) && p.Activa == 1)
            .ToListAsync();
        var prerequisitoIds = prerequisitos.Select(p => p.IdAsignatura).Distinct().ToList();
        var prerequisitoNombres = await _context.Asignaturas.AsNoTracking()
            .Where(a => prerequisitoIds.Contains(a.IdAsignatura))
            .ToDictionaryAsync(a => a.IdAsignatura, a => a.Asignatura1 ?? a.Codigo ?? string.Empty);

        var periodo = await _context.Periodos.AsNoTracking().FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);
        var result = new List<DocenteAsignaturaDto>();

        foreach (var asig in asignaciones)
        {
            if (!cursosMap.TryGetValue(asig.IdNivel, out var curso)
                || !carrerasMap.TryGetValue(curso.IdCarrera, out var carrera)
                || !asignaturasMap.TryGetValue(asig.IdAsignatura, out var asignatura))
                continue;

            modalidadesMap.TryGetValue(asig.IdModalidad, out var modalidad);
            var mallaPeriodo = mallasPeriodo.FirstOrDefault(m =>
                m.IdNivel == asig.IdNivel && m.IdCarrera == carrera.IdCarrera);
            var malla = mallaPeriodo == null
                ? mallasActivas.FirstOrDefault(m => m.IdCarrera == carrera.IdCarrera)
                : mallasRelevantes.FirstOrDefault(m => m.IdMalla == mallaPeriodo.IdMalla);
            if (malla == null)
                continue;

            var detalle = detallesMalla.FirstOrDefault(d =>
                d.IdMalla == malla.IdMalla && d.IdAsignatura == asig.IdAsignatura);
            if (detalle == null)
                continue;

            tiposAsignaturaMap.TryGetValue(detalle.IdTipoAsignatura, out var tipoAsignatura);
            var horasTotales = detalle.Horas ?? 0;
            var horasDocencia = (decimal)(detalle.HorasDocente ?? 0);
            var horasApe = detalle.HorasPracticoExperimental ?? 0m;
            var prereqList = prerequisitos
                .Where(p => p.IdDetalleMalla == detalle.IdDetalleMalla)
                .Select(p => prerequisitoNombres.GetValueOrDefault(p.IdAsignatura))
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Cast<string>()
                .ToList();
            var source = mallaPeriodo == null ? "malla_activa_fallback" : "mallas_periodos";
            var warnings = mallaPeriodo == null
                ? new List<string> { "SIGAFI no tiene una malla asociada al periodo y nivel; se uso la malla activa de la carrera." }
                : new List<string>();

            result.Add(new DocenteAsignaturaDto
            {
                IdAsignacion = asig.IdAsignacion,
                IdAsignatura = asignatura.IdAsignatura,
                CodigoAsignatura = asignatura.Codigo,
                NombreAsignatura = asignatura.Asignatura1,

                IdCarrera = carrera.IdCarrera,
                CodigoCarrera = carrera.CodigoCases,
                NombreCarrera = carrera.Carrera1,
                AliasCarrera = carrera.AliasCarrera,

                IdPeriodo = asig.IdPeriodo,
                DetallePeriodo = periodo?.Detalle,

                IdModalidad = asig.IdModalidad,
                NombreModalidad = modalidad?.ModalidadImpresion ?? modalidad?.Modalidad1,

                IdNivel = asig.IdNivel,
                NombreNivel = curso.Nivel ?? $"Nivel {asig.IdNivel}",
                Paralelo = asig.Paralelo,

                IdMalla = malla.IdMalla,
                IdDetalleMalla = detalle.IdDetalleMalla,
                FuenteMalla = source,

                HorasTotales = horasTotales,
                HorasDocencia = horasDocencia,
                HorasPracticoExperimental = horasApe,
                HorasAutonomo = Math.Max(0m, horasTotales - horasDocencia - horasApe),
                Creditos = detalle.Creditos ?? 0,
                UnidadOrganizacionCurricular = tipoAsignatura?.TipoAsignatura1,

                Prerrequisitos = prereqList,
                AdvertenciasContexto = warnings,

                // Estados iniciales para la tesis
                EstadoPea = "NoIniciado",
                EstadoSilabo = "NoIniciado",
                TotalGuiasApe = 0,
                EstadoGuiaEstudio = "NoIniciado"
            });
        }

        return result.OrderBy(r => r.NombreCarrera).ThenBy(r => r.NombreNivel).ThenBy(r => r.NombreAsignatura).ToList();
    }

    public async Task<CurriculoAsignaturaDetalleDto?> GetCurriculoAsignaturaAsync(int idAsignatura, int idCarrera)
    {
        var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == idAsignatura);
        if (asignatura == null) return null;

        var carrera = await _context.Carreras.AsNoTracking()
            .FirstOrDefaultAsync(c => c.IdCarrera == idCarrera && c.EsInstituto == 1);
        if (carrera == null) return null;
        var mallaActiva = await _context.Mallas.AsNoTracking().FirstOrDefaultAsync(m => m.IdCarrera == idCarrera && m.Activa == true);

        DetalleMalla? detalle = null;
        if (mallaActiva != null)
        {
            detalle = await _context.DetalleMallas
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.IdMalla == mallaActiva.IdMalla && d.IdAsignatura == idAsignatura && d.Anulada != true);
        }

        Curso? curso = null;
        if (detalle != null)
        {
            curso = await _context.Cursos.AsNoTracking().FirstOrDefaultAsync(c => c.IdNivel == detalle.IdNivel);
        }

        TipoAsignatura? tipoAsig = null;
        if (detalle != null)
        {
            tipoAsig = await _context.TiposAsignatura.AsNoTracking().FirstOrDefaultAsync(t => t.IdTipoAsignatura == detalle.IdTipoAsignatura);
        }

        var prerequisitosItems = new List<PrerrequisitoItemDto>();
        if (detalle != null)
        {
            var prereqEntities = await _context.Prerequisitos
                .AsNoTracking()
                .Where(p => p.IdDetalleMalla == detalle.IdDetalleMalla && p.Activa == 1)
                .ToListAsync();

            var prereqAsigIds = prereqEntities.Select(p => p.IdAsignatura).ToList();
            var prereqAsignaturas = await _context.Asignaturas
                .AsNoTracking()
                .Where(a => prereqAsigIds.Contains(a.IdAsignatura))
                .ToListAsync();

            prerequisitosItems = prereqAsignaturas.Select(a => new PrerrequisitoItemDto
            {
                IdAsignatura = a.IdAsignatura,
                Codigo = a.Codigo,
                Asignatura = a.Asignatura1
            }).ToList();
        }

        var horasTotales = detalle?.Horas ?? 0;
        var horasDocencia = (decimal)(detalle?.HorasDocente ?? 0);
        var horasApe = detalle?.HorasPracticoExperimental ?? 0m;
        var horasAutonomo = Math.Max(0m, (decimal)horasTotales - (horasDocencia + horasApe));

        return new CurriculoAsignaturaDetalleDto
        {
            IdAsignatura = asignatura.IdAsignatura,
            CodigoAsignatura = asignatura.Codigo,
            NombreAsignatura = asignatura.Asignatura1,

            IdCarrera = idCarrera,
            NombreCarrera = carrera?.Carrera1,
            CodigoCases = carrera?.CodigoCases,

            IdNivel = detalle?.IdNivel ?? 0,
            Nivel = curso?.Nivel,

            HorasTotales = horasTotales,
            HorasDocencia = horasDocencia,
            HorasPracticoExperimental = horasApe,
            HorasAutonomo = horasAutonomo,
            Creditos = detalle?.Creditos ?? 0,
            UnidadOrganizacionCurricular = tipoAsig?.TipoAsignatura1,
            DescripcionMalla = mallaActiva?.Descripcion,

            Prerrequisitos = prerequisitosItems
        };
    }
}

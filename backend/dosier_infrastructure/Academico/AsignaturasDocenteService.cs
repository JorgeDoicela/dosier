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
    private readonly IPeriodoInstitucionalResolver _periodoResolver;

    public AsignaturasDocenteService(DosierContext context, IPeriodoInstitucionalResolver periodoResolver)
    {
        _context = context;
        _periodoResolver = periodoResolver;
    }

    public Task<PeriodoAcademicoDto?> GetPeriodoActivoAsync()
    {
        return _periodoResolver.GetPeriodoActivoAsync();
    }

    public Task<List<PeriodoAcademicoDto>> GetPeriodosDisponiblesAsync()
    {
        return _periodoResolver.GetPeriodosInstitucionalesAsync();
    }

    public async Task<List<DocenteAsignaturaDto>> GetMisAsignaturasAsync(string idProfesor, string? idPeriodo = null)
    {
        if (string.IsNullOrWhiteSpace(idPeriodo))
        {
            idPeriodo = await _periodoResolver.GetIdPeriodoActivoAsync();
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

        var asignaturasList = await _context.Asignaturas.AsNoTracking()
            .Where(a => asignaturaIds.Contains(a.IdAsignatura))
            .ToListAsync();
        var asignaturasMap = asignaturasList
            .GroupBy(a => a.IdAsignatura)
            .ToDictionary(g => g.Key, g => g.First());

        var cursosList = await _context.Cursos.AsNoTracking()
            .Where(c => nivelIds.Contains(c.IdNivel))
            .ToListAsync();
        var cursosMap = cursosList
            .GroupBy(c => c.IdNivel)
            .ToDictionary(g => g.Key, g => g.First());

        var carreraIds = cursosMap.Values.Select(c => c.IdCarrera).Distinct().ToList();
        var carrerasList = await _context.Carreras.AsNoTracking()
            .Where(c => carreraIds.Contains(c.IdCarrera) && c.EsInstituto == 1)
            .ToListAsync();
        var carrerasMap = carrerasList
            .GroupBy(c => c.IdCarrera)
            .ToDictionary(g => g.Key, g => g.First());

        var modalidadesList = await _context.Modalidades.AsNoTracking()
            .Where(m => modalidadIds.Contains(m.IdModalidad))
            .ToListAsync();
        var modalidadesMap = modalidadesList
            .GroupBy(m => m.IdModalidad)
            .ToDictionary(g => g.Key, g => g.First());

        var mallasPeriodo = await (
            from mp in _context.MallasPeriodos.AsNoTracking()
            join m in _context.Mallas.AsNoTracking() on mp.IdMalla equals m.IdMalla
            where mp.IdPeriodo == idPeriodo
                  && nivelIds.Contains(mp.IdNivel)
                  && carreraIds.Contains(m.IdCarrera)
            select new { mp.IdNivel, mp.IdMalla, m.IdCarrera })
            .ToListAsync();
        var mallasDeCarreras = await _context.Mallas.AsNoTracking()
            .Where(m => carreraIds.Contains(m.IdCarrera))
            .ToListAsync();
        var mallasActivas = mallasDeCarreras.Where(m => m.Activa == true).ToList();
        var mallaIds = mallasDeCarreras.Select(m => m.IdMalla).Distinct().ToList();
        var mallasRelevantes = mallasDeCarreras;
        var detallesMalla = await _context.DetalleMallas.AsNoTracking()
            .Where(d => mallaIds.Contains(d.IdMalla)
                        && asignaturaIds.Contains(d.IdAsignatura)
                        && d.Anulada != true)
            .ToListAsync();
        var tiposAsignaturaIds = detallesMalla.Select(d => d.IdTipoAsignatura).Distinct().ToList();
        var tiposAsignaturaList = await _context.TiposAsignatura.AsNoTracking()
            .Where(t => tiposAsignaturaIds.Contains(t.IdTipoAsignatura))
            .ToListAsync();
        var tiposAsignaturaMap = tiposAsignaturaList
            .GroupBy(t => t.IdTipoAsignatura)
            .ToDictionary(g => g.Key, g => g.First());

        var detalleIds = detallesMalla.Select(d => d.IdDetalleMalla).ToList();
        var prerequisitos = await _context.Prerequisitos.AsNoTracking()
            .Where(p => detalleIds.Contains(p.IdDetalleMalla) && p.Activa == 1)
            .ToListAsync();
        var prerequisitoIds = prerequisitos.Select(p => p.IdAsignatura).Distinct().ToList();
        var prerequisitoList = await _context.Asignaturas.AsNoTracking()
            .Where(a => prerequisitoIds.Contains(a.IdAsignatura))
            .ToListAsync();
        var prerequisitoNombres = prerequisitoList
            .GroupBy(a => a.IdAsignatura)
            .ToDictionary(g => g.Key, g => g.First().Asignatura1 ?? g.First().Codigo ?? string.Empty);

        var periodo = await _context.Periodos.AsNoTracking().FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);

        // Consultar estado real de PEAs existentes para estas asignaciones
        var asignacionIds = asignaciones.Select(a => a.IdAsignacion).ToList();
        var peasList = await _context.DocPeas.AsNoTracking()
            .Where(p => p.IdAsignacion.HasValue && asignacionIds.Contains(p.IdAsignacion.Value) && p.Activo)
            .ToListAsync();
        var peasExistentes = peasList
            .GroupBy(p => p.IdAsignacion!.Value)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(p => p.Version).First());

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

            dosier_infrastructure.data.models.DetalleMalla? detalle = null;
            if (malla != null)
            {
                detalle = detallesMalla.FirstOrDefault(d =>
                    d.IdMalla == malla.IdMalla && d.IdAsignatura == asig.IdAsignatura);
            }

            // Fallback resiliente a cualquier malla histórica de la carrera que cubra la materia
            if (detalle == null)
            {
                var alternative = (from d in detallesMalla
                                   join m in mallasDeCarreras on d.IdMalla equals m.IdMalla
                                   where m.IdCarrera == carrera.IdCarrera
                                         && d.IdAsignatura == asig.IdAsignatura
                                   orderby (d.IdNivel == asig.IdNivel ? 1 : 0) descending, m.Activa descending, m.Vigencia descending, m.IdMalla descending
                                   select new { Detail = d, Grid = m }).FirstOrDefault();

                if (alternative != null)
                {
                    detalle = alternative.Detail;
                    malla = alternative.Grid;
                }
            }

            // Si es actividad de acompañamiento o extracurricular (ej. PAIT, Clubes), proveer contexto seguro sin descartar
            var isExtra = (asignatura.ExtraCurricular == 1) || (asig.ExtraCurricular == 1) || (detalle == null);
            if (isExtra && detalle == null)
            {
                result.Add(new DocenteAsignaturaDto
                {
                    IdAsignacion = asig.IdAsignacion,
                    IdAsignatura = asignatura.IdAsignatura,
                    CodigoAsignatura = asignatura.Codigo,
                    NombreAsignatura = asignatura.Asignatura1,

                    IdCarrera = carrera.IdCarrera,
                    CodigoCarrera = !string.IsNullOrWhiteSpace(carrera.AliasCarrera) ? carrera.AliasCarrera : carrera.CodigoCases,
                    NombreCarrera = carrera.Carrera1,
                    AliasCarrera = carrera.AliasCarrera,

                    IdPeriodo = asig.IdPeriodo,
                    DetallePeriodo = periodo?.Detalle,

                    IdModalidad = asig.IdModalidad,
                    NombreModalidad = modalidad?.ModalidadImpresion ?? modalidad?.Modalidad1,

                    IdNivel = asig.IdNivel,
                    NombreNivel = curso.Nivel ?? $"Nivel {asig.IdNivel}",
                    Paralelo = asig.Paralelo,

                    IdMalla = 0,
                    IdDetalleMalla = 0,
                    FuenteMalla = "actividad_institucional",

                    HorasTotales = (int)(asig.NumeroHoras ?? 0),
                    HorasDocencia = asig.NumeroHoras ?? 0,
                    HorasPracticoExperimental = asig.HorasPracticoExperimental ?? 0,
                    HorasAutonomo = 0,
                    Creditos = 0,
                    HorasSemanales = asig.NumeroHoras,
                    EsExtracurricular = true,
                    UnidadOrganizacionCurricular = "Acompañamiento",

                    Prerrequisitos = new List<string>(),
                    AdvertenciasContexto = new List<string> { "Actividad de acompañamiento institucional; no requiere formulación de PEA microcurricular." },

                    EstadoPea = "NoAplica",
                    IdPea = null,
                    UuidPea = null,
                    VersionPea = null
                });
                continue;
            }

            if (malla == null || detalle == null)
                continue;

            tiposAsignaturaMap.TryGetValue(detalle.IdTipoAsignatura, out var tipoAsignatura);
            var horasTotales = detalle.Horas ?? 0;
            var creditos = detalle.Creditos ?? 0;
            if (horasTotales <= 0 && creditos > 0)
            {
                horasTotales = creditos * 48;
            }
            var horasDocencia = (decimal)(detalle.HorasDocente ?? 0);
            var horasApe = detalle.HorasPracticoExperimental ?? 0m;
            if (horasTotales > 0 && horasDocencia <= 0m && horasApe <= 0m)
            {
                var weeklyHours = asig.NumeroHoras ?? 0m;
                if (weeklyHours > 0m && (weeklyHours * 16m) < horasTotales)
                {
                    horasDocencia = weeklyHours * 16m;
                    var remaining = horasTotales - horasDocencia;
                    horasApe = Math.Floor(remaining / 2m);
                }
                else
                {
                    var third = Math.Floor((decimal)horasTotales / 3m);
                    horasDocencia = third;
                    horasApe = third;
                }
            }
            var prereqList = prerequisitos
                .Where(p => p.IdDetalleMalla == detalle.IdDetalleMalla)
                .Select(p => prerequisitoNombres.GetValueOrDefault(p.IdAsignatura))
                .Where(p => !string.IsNullOrWhiteSpace(p))
                .Cast<string>()
                .ToList();
            var source = mallaPeriodo == null ? (malla.Activa == true ? "malla_activa_fallback" : "malla_historica_fallback") : "mallas_periodos";
            var warnings = mallaPeriodo == null
                ? new List<string> { $"SIGAFI no tiene una malla asociada al periodo y nivel; se vinculó a '{malla.Descripcion ?? malla.IdMalla.ToString()}'." }
                : new List<string>();

            peasExistentes.TryGetValue(asig.IdAsignacion, out var peaExistente);

            result.Add(new DocenteAsignaturaDto
            {
                IdAsignacion = asig.IdAsignacion,
                IdAsignatura = asignatura.IdAsignatura,
                CodigoAsignatura = asignatura.Codigo,
                NombreAsignatura = asignatura.Asignatura1,

                IdCarrera = carrera.IdCarrera,
                CodigoCarrera = !string.IsNullOrWhiteSpace(carrera.AliasCarrera) ? carrera.AliasCarrera : carrera.CodigoCases,
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
                Creditos = creditos,
                HorasSemanales = asig.NumeroHoras,
                EsExtracurricular = (asignatura.ExtraCurricular == 1) || (asig.ExtraCurricular == 1),
                UnidadOrganizacionCurricular = AcademicContextResolver.NormalizarUnidadOrganizacion(tipoAsignatura?.TipoAsignatura1),

                Prerrequisitos = prereqList,
                AdvertenciasContexto = warnings,

                // Estado oficial del PEA vinculado a la asignación
                EstadoPea = peaExistente?.Estado ?? "NoIniciado",
                IdPea = peaExistente?.IdPea,
                UuidPea = peaExistente?.Uuid,
                VersionPea = peaExistente?.Version
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
        if (horasTotales > 0 && horasDocencia <= 0m && horasApe <= 0m)
        {
            var third = Math.Floor((decimal)horasTotales / 3m);
            horasDocencia = third;
            horasApe = third;
        }
        var horasAutonomo = Math.Max(0m, (decimal)horasTotales - (horasDocencia + horasApe));

        return new CurriculoAsignaturaDetalleDto
        {
            IdAsignatura = asignatura.IdAsignatura,
            CodigoAsignatura = asignatura.Codigo,
            NombreAsignatura = asignatura.Asignatura1,

            IdCarrera = idCarrera,
            NombreCarrera = carrera?.Carrera1,
            CodigoCases = !string.IsNullOrWhiteSpace(carrera?.CodigoCases) ? carrera.CodigoCases : carrera?.AliasCarrera,

            IdNivel = detalle?.IdNivel ?? 0,
            Nivel = curso?.Nivel,

            HorasTotales = horasTotales,
            HorasDocencia = horasDocencia,
            HorasPracticoExperimental = horasApe,
            HorasAutonomo = horasAutonomo,
            Creditos = detalle?.Creditos ?? 0,
            UnidadOrganizacionCurricular = AcademicContextResolver.NormalizarUnidadOrganizacion(tipoAsig?.TipoAsignatura1),
            DescripcionMalla = mallaActiva?.Descripcion,

            Prerrequisitos = prerequisitosItems
        };
    }
}

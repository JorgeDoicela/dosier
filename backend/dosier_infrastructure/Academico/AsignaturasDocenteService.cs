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

        // 2. Extraer IDs para consultas en lote (Batch lookup)
        var asignaturaIds = asignaciones.Select(a => a.IdAsignatura).Distinct().ToList();
        var nivelIds = asignaciones.Select(a => a.IdNivel).Distinct().ToList();
        var modalidadIds = asignaciones.Select(a => a.IdModalidad).Distinct().ToList();

        var asignaturasMap = await _context.Asignaturas
            .AsNoTracking()
            .Where(a => asignaturaIds.Contains(a.IdAsignatura))
            .ToDictionaryAsync(a => a.IdAsignatura);

        var cursosMap = await _context.Cursos
            .AsNoTracking()
            .Where(c => nivelIds.Contains(c.IdNivel))
            .ToDictionaryAsync(c => c.IdNivel);

        var carreraIds = cursosMap.Values.Select(c => c.IdCarrera).Distinct().ToList();
        var carrerasMap = await _context.Carreras
            .AsNoTracking()
            .Where(c => carreraIds.Contains(c.IdCarrera))
            .ToDictionaryAsync(c => c.IdCarrera);

        var modalidadesMap = await _context.Modalidades
            .AsNoTracking()
            .Where(m => modalidadIds.Contains(m.IdModalidad))
            .ToDictionaryAsync(m => m.IdModalidad);

        var periodo = await _context.Periodos.AsNoTracking().FirstOrDefaultAsync(p => p.IdPeriodo == idPeriodo);

        // 3. Mallas y detalles curriculares
        var mallasActivas = await _context.Mallas
            .AsNoTracking()
            .Where(m => carreraIds.Contains(m.IdCarrera) && m.Activa == true)
            .ToListAsync();
        var mallaIds = mallasActivas.Select(m => m.IdMalla).ToList();

        var detallesMalla = await _context.DetalleMallas
            .AsNoTracking()
            .Where(d => mallaIds.Contains(d.IdMalla) && asignaturaIds.Contains(d.IdAsignatura) && d.Anulada != true)
            .ToListAsync();

        var tipoAsignaturaIds = detallesMalla.Select(d => d.IdTipoAsignatura).Distinct().ToList();
        var tiposAsignaturaMap = await _context.TiposAsignatura
            .AsNoTracking()
            .Where(t => tipoAsignaturaIds.Contains(t.IdTipoAsignatura))
            .ToDictionaryAsync(t => t.IdTipoAsignatura);

        // Prerrequisitos de los detalles encontrados
        var detalleMallaIds = detallesMalla.Select(d => d.IdDetalleMalla).ToList();
        var prerequisitos = await _context.Prerequisitos
            .AsNoTracking()
            .Where(p => detalleMallaIds.Contains(p.IdDetalleMalla) && p.Activa == 1)
            .ToListAsync();

        var prerequisitoAsignaturaIds = prerequisitos.Select(p => p.IdAsignatura).Distinct().ToList();
        var prerequisitoNombresMap = await _context.Asignaturas
            .AsNoTracking()
            .Where(a => prerequisitoAsignaturaIds.Contains(a.IdAsignatura))
            .ToDictionaryAsync(a => a.IdAsignatura, a => a.Asignatura1 ?? a.Codigo ?? "");

        // 4. Mapear resultados finales
        var result = new List<DocenteAsignaturaDto>();

        foreach (var asig in asignaciones)
        {
            asignaturasMap.TryGetValue(asig.IdAsignatura, out var objAsignatura);
            cursosMap.TryGetValue(asig.IdNivel, out var objCurso);
            
            Carrera? objCarrera = null;
            if (objCurso != null)
                carrerasMap.TryGetValue(objCurso.IdCarrera, out objCarrera);

            modalidadesMap.TryGetValue(asig.IdModalidad, out var objModalidad);

            // Buscar detalle curricular en la malla activa de la carrera
            var idCarreraActual = objCurso?.IdCarrera ?? 0;
            var mallaActiva = mallasActivas.FirstOrDefault(m => m.IdCarrera == idCarreraActual);
            var detalle = detallesMalla.FirstOrDefault(d => d.IdAsignatura == asig.IdAsignatura && (mallaActiva == null || d.IdMalla == mallaActiva.IdMalla));

            var horasTotales = detalle?.Horas ?? (int)(asig.NumeroHoras ?? 0);
            var horasDocencia = (decimal)(detalle?.HorasDocente ?? (int)(asig.NumeroHoras ?? 0));
            var horasApe = detalle?.HorasPracticoExperimental ?? asig.HorasPracticoExperimental ?? 0m;
            var horasAutonomo = Math.Max(0m, (decimal)horasTotales - (horasDocencia + horasApe));
            var creditos = detalle?.Creditos ?? 0;

            string? unidadOrg = null;
            if (detalle != null && tiposAsignaturaMap.TryGetValue(detalle.IdTipoAsignatura, out var objTipo))
            {
                unidadOrg = objTipo.TipoAsignatura1;
            }

            var prereqList = new List<string>();
            if (detalle != null)
            {
                var prereqIds = prerequisitos.Where(p => p.IdDetalleMalla == detalle.IdDetalleMalla).Select(p => p.IdAsignatura);
                foreach (var pId in prereqIds)
                {
                    if (prerequisitoNombresMap.TryGetValue(pId, out var nom))
                        prereqList.Add(nom);
                }
            }

            result.Add(new DocenteAsignaturaDto
            {
                IdAsignacion = asig.IdAsignacion,
                IdAsignatura = asig.IdAsignatura,
                CodigoAsignatura = objAsignatura?.Codigo,
                NombreAsignatura = objAsignatura?.Asignatura1,

                IdCarrera = idCarreraActual,
                CodigoCarrera = objCarrera?.CodigoCases,
                NombreCarrera = objCarrera?.Carrera1,
                AliasCarrera = objCarrera?.AliasCarrera,

                IdPeriodo = asig.IdPeriodo,
                DetallePeriodo = periodo?.Detalle,

                IdModalidad = asig.IdModalidad,
                NombreModalidad = objModalidad?.ModalidadImpresion ?? objModalidad?.Modalidad1,

                IdNivel = asig.IdNivel,
                NombreNivel = objCurso?.Nivel ?? $"Nivel {asig.IdNivel}",
                Paralelo = asig.Paralelo,

                HorasTotales = horasTotales,
                HorasDocencia = horasDocencia,
                HorasPracticoExperimental = horasApe,
                HorasAutonomo = horasAutonomo,
                Creditos = creditos,
                UnidadOrganizacionCurricular = unidadOrg,

                Prerrequisitos = prereqList,

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

        var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == idCarrera);
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

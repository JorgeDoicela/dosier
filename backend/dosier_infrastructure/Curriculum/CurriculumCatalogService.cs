using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Curriculum
{
    public class CurriculumCatalogService : ICurriculumCatalogService
    {
        private readonly DosierContext _context;

        public CurriculumCatalogService(DosierContext context)
        {
            _context = context;
        }

        public async Task<List<PeriodoAcademicoDto>> GetPeriodosAcademicosAsync()
        {
            var periodos = await _context.Periodos
                .AsNoTracking()
                .OrderByDescending(p => p.Periodoactivoinstituto == 1)
                .ThenByDescending(p => p.Activo == true)
                .ThenByDescending(p => p.FechaInicial)
                .Take(10)
                .ToListAsync();

            return periodos.Select(p => new PeriodoAcademicoDto
            {
                IdPeriodo = p.IdPeriodo,
                Detalle = p.Detalle ?? p.IdPeriodo,
                Activo = p.Periodoactivoinstituto == 1 || p.Activo == true,
                FechaInicial = p.FechaInicial?.ToString("yyyy-MM-dd"),
                FechaFinal = p.FechaFinal?.ToString("yyyy-MM-dd")
            }).ToList();
        }

        public async Task<List<CarreraDocenteDto>> GetCarrerasDocenteAsync(string? idProfesor, string? idPeriodo)
        {
            string periodoActivo = idPeriodo ?? await ObtenerPeriodoActivoAsync();

            var queryCarreras = _context.Carreras.AsNoTracking()
                .Where(c => c.EsInstituto == 1 && (c.Activa == true || c.Activa == null));

            if (!string.IsNullOrEmpty(idProfesor))
            {
                var carrerasProfesor = await _context.ProfesoresCarrerasPeriodos
                    .AsNoTracking()
                    .Where(pc => pc.IdProfesor == idProfesor && pc.IdPeriodo == periodoActivo && pc.EsActivo == 1)
                    .Select(pc => pc.IdCarrera)
                    .Distinct()
                    .ToListAsync();

                if (carrerasProfesor.Any())
                {
                    queryCarreras = queryCarreras.Where(c => carrerasProfesor.Contains(c.IdCarrera));
                }
            }

            var carreras = await queryCarreras.ToListAsync();

            var resultado = new List<CarreraDocenteDto>();
            foreach (var c in carreras)
            {
                var totalAsignaturas = await (
                    from m in _context.Mallas.AsNoTracking()
                    join dm in _context.DetalleMallas.AsNoTracking() on m.IdMalla equals dm.IdMalla
                    where m.IdCarrera == c.IdCarrera && (m.Activa == true || m.Activa == null) && (dm.Anulada == false || dm.Anulada == null)
                    select dm.IdAsignatura
                ).Distinct().CountAsync();

                resultado.Add(new CarreraDocenteDto
                {
                    IdCarrera = c.IdCarrera,
                    NombreCarrera = c.Carrera1 ?? "Carrera sin nombre",
                    AliasCarrera = c.AliasCarrera,
                    CodigoCarrera = c.CodigoCases,
                    TotalAsignaturas = totalAsignaturas
                });
            }

            return resultado;
        }

        public async Task<List<DocenteAsignaturaMallaDto>> GetAsignaturasMallaAsync(int idCarrera, string? idProfesor, string? idPeriodo)
        {
            string periodoActivo = idPeriodo ?? await ObtenerPeriodoActivoAsync();

            var carreraObj = await _context.Carreras.AsNoTracking()
                .FirstOrDefaultAsync(c => c.IdCarrera == idCarrera && c.EsInstituto == 1);
            if (carreraObj == null)
                return new List<DocenteAsignaturaMallaDto>();
            string nombreCarrera = carreraObj?.Carrera1 ?? "Carrera";

            var mallaActiva = await _context.Mallas
                .AsNoTracking()
                .Where(m => m.IdCarrera == idCarrera && (m.Activa == true || m.Activa == null))
                .OrderByDescending(m => m.IdMalla)
                .FirstOrDefaultAsync();

            if (mallaActiva == null)
                return new List<DocenteAsignaturaMallaDto>();

            var detallesMalla = await (
                from dm in _context.DetalleMallas.AsNoTracking()
                join a in _context.Asignaturas.AsNoTracking() on dm.IdAsignatura equals a.IdAsignatura
                where dm.IdMalla == mallaActiva.IdMalla && (dm.Anulada == false || dm.Anulada == null)
                select new
                {
                    dm.IdDetalleMalla,
                    dm.IdAsignatura,
                    CodigoAsignatura = a.Codigo,
                    NombreAsignatura = a.Asignatura1 ?? "Asignatura",
                    Semestre = dm.IdNivel.ToString(),
                    Creditos = (decimal)(dm.Creditos ?? 0),
                    TotalHoras = dm.Horas ?? 0,
                    HorasDocencia = dm.HorasDocente ?? 0,
                    HorasPracticas = (int)(dm.HorasPracticoExperimental ?? 0),
                    HorasAutonomas = (dm.Horas ?? 0) - (dm.HorasDocente ?? 0) - (int)(dm.HorasPracticoExperimental ?? 0)
                }
            ).ToListAsync();

            var idsDetalleMalla = detallesMalla.Select(d => d.IdDetalleMalla).ToList();
            var prerequisitosRaw = await (
                from p in _context.Prerequisitos.AsNoTracking()
                join a in _context.Asignaturas.AsNoTracking() on p.IdAsignatura equals a.IdAsignatura
                where idsDetalleMalla.Contains(p.IdDetalleMalla)
                select new
                {
                    p.IdDetalleMalla,
                    NombrePrerequisito = a.Asignatura1 ?? ""
                }
            ).ToListAsync();

            var prerequisitosPorDetalle = prerequisitosRaw
                .GroupBy(p => p.IdDetalleMalla)
                .ToDictionary(g => g.Key, g => g.Select(x => x.NombrePrerequisito).ToList());

            // Cruzar con los 4 documentos existentes en DOSIER
            var peasExistentes = await _context.DocPeas
                .AsNoTracking()
                .Where(p => p.IdCarrera == idCarrera && p.IdPeriodo == periodoActivo && p.Activo)
                .ToListAsync();

            var resultado = new List<DocenteAsignaturaMallaDto>();
            foreach (var dm in detallesMalla)
            {
                var pea = peasExistentes.FirstOrDefault(p => p.IdAsignatura == dm.IdAsignatura);
                prerequisitosPorDetalle.TryGetValue(dm.IdDetalleMalla, out var prereqs);

                resultado.Add(new DocenteAsignaturaMallaDto
                {
                    IdAsignatura = dm.IdAsignatura,
                    CodigoAsignatura = dm.CodigoAsignatura,
                    NombreAsignatura = dm.NombreAsignatura,
                    IdCarrera = idCarrera,
                    NombreCarrera = nombreCarrera,
                    Semestre = dm.Semestre,
                    TotalHoras = dm.TotalHoras,
                    Creditos = dm.Creditos,
                    HorasDocencia = dm.HorasDocencia,
                    HorasPracticas = dm.HorasPracticas,
                    HorasAutonomas = Math.Max(0, dm.HorasAutonomas),
                    Prerrequisitos = prereqs ?? new List<string>(),
                    IdPeaExistente = pea?.IdPea,
                    PeaEstado = pea?.Estado
                });
            }

            return resultado.OrderBy(r => r.Semestre).ThenBy(r => r.NombreAsignatura).ToList();
        }

        private async Task<string> ObtenerPeriodoActivoAsync()
        {
            var periodo = await _context.Periodos
                .AsNoTracking()
                .OrderByDescending(p => p.Periodoactivoinstituto == 1)
                .ThenByDescending(p => p.Activo == true)
                .ThenByDescending(p => p.FechaInicial)
                .FirstOrDefaultAsync();

            return periodo?.IdPeriodo ?? "2026-1";
        }
    }
}

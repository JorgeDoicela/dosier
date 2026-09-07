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
    public class PerfilEgresoService : IPerfilEgresoService
    {
        private readonly DosierContext _context;

        public PerfilEgresoService(DosierContext context)
        {
            _context = context;
        }

        public async Task<PerfilEgresoDto?> GetPerfilByCarreraMallaAsync(int idCarrera, int idMalla)
        {
            var perfil = await _context.DocPerfilesEgreso
                .AsNoTracking()
                .Include(p => p.Resultados.OrderBy(r => r.Orden))
                .Where(p => p.IdCarrera == idCarrera && p.IdMalla == idMalla && p.Activo)
                .OrderByDescending(p => p.Version)
                .FirstOrDefaultAsync();

            if (perfil == null)
            {
                // Fallback por carrera si la malla no coincide exactamente
                perfil = await _context.DocPerfilesEgreso
                    .AsNoTracking()
                    .Include(p => p.Resultados.OrderBy(r => r.Orden))
                    .Where(p => p.IdCarrera == idCarrera && p.Activo)
                    .OrderByDescending(p => p.Version)
                    .FirstOrDefaultAsync();
            }

            if (perfil == null) return null;

            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == perfil.IdCarrera);

            return new PerfilEgresoDto
            {
                IdPerfilEgreso = perfil.IdPerfilEgreso,
                Uuid = perfil.Uuid,
                IdCarrera = perfil.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdMalla = perfil.IdMalla,
                Version = perfil.Version,
                DescripcionGeneral = perfil.DescripcionGeneral,
                Activo = perfil.Activo,
                Resultados = perfil.Resultados.Select(r => new PerfilEgresoResultadoDto
                {
                    IdResultadoPerfil = r.IdResultadoPerfil,
                    Uuid = r.Uuid,
                    IdPerfilEgreso = r.IdPerfilEgreso,
                    Codigo = r.Codigo,
                    Descripcion = r.Descripcion,
                    Orden = r.Orden
                }).ToList()
            };
        }

        public async Task<List<PerfilEgresoResultadoDto>> GetResultadosAprendizajeCarreraAsync(int idCarrera, int idMalla)
        {
            var perfil = await GetPerfilByCarreraMallaAsync(idCarrera, idMalla);
            return perfil?.Resultados ?? new List<PerfilEgresoResultadoDto>();
        }

        public async Task<List<AsignaturaResultadoPerfilDto>> GetTributacionAsignaturaAsync(int idAsignatura, int idMalla)
        {
            var tributaciones = await _context.DocAsignaturasResultadosPerfil
                .AsNoTracking()
                .Include(t => t.ResultadoPerfil)
                .Where(t => t.IdAsignatura == idAsignatura && t.IdMalla == idMalla)
                .ToListAsync();

            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == idAsignatura);

            return tributaciones.Select(t => new AsignaturaResultadoPerfilDto
            {
                IdRelacion = t.IdRelacion,
                IdAsignatura = t.IdAsignatura,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura",
                IdMalla = t.IdMalla,
                IdResultadoPerfil = t.IdResultadoPerfil,
                CodigoRdaPerfil = t.ResultadoPerfil?.Codigo ?? string.Empty,
                DescripcionRdaPerfil = t.ResultadoPerfil?.Descripcion ?? string.Empty,
                NivelAporte = t.NivelAporte
            }).ToList();
        }

        public async Task<ProyectoCurricularDto?> GetProyectoCurricularAsync(int idCarrera, int idMalla)
        {
            var proyecto = await _context.DocProyectosCurriculares
                .AsNoTracking()
                .Where(p => p.IdCarrera == idCarrera && p.IdMalla == idMalla && p.Activo)
                .OrderByDescending(p => p.Version)
                .FirstOrDefaultAsync();

            if (proyecto == null)
            {
                proyecto = await _context.DocProyectosCurriculares
                    .AsNoTracking()
                    .Where(p => p.IdCarrera == idCarrera && p.Activo)
                    .OrderByDescending(p => p.Version)
                    .FirstOrDefaultAsync();
            }

            if (proyecto == null) return null;

            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == proyecto.IdCarrera);

            return new ProyectoCurricularDto
            {
                IdProyectoCurricular = proyecto.IdProyectoCurricular,
                Uuid = proyecto.Uuid,
                IdCarrera = proyecto.IdCarrera,
                NombreCarrera = carrera?.Carrera1 ?? "Carrera",
                IdMalla = proyecto.IdMalla,
                CodigoResolucionCes = proyecto.CodigoResolucionCes,
                NombreProyecto = proyecto.NombreProyecto,
                Version = proyecto.Version,
                FechaAprobacion = proyecto.FechaAprobacion,
                Activo = proyecto.Activo
            };
        }
    }
}

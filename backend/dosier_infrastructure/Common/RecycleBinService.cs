using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Common.Interfaces;
using dosier_infrastructure.data.models;
using dosier_domain.Curriculum.Entities;

namespace dosier_infrastructure.Common
{
    public class RecycleBinService : IRecycleBinService
    {
        private readonly DosierContext _context;

        public RecycleBinService(DosierContext context)
        {
            _context = context;
        }

        public async Task<List<DeletedItemDto>?> GetDeletedItemsAsync(string userIdRef, bool isAdmin)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == userIdRef);
            if (user == null) return null;

            var result = new List<DeletedItemDto>();

            // 1. PEAs archivados o eliminados
            var peasQuery = _context.Set<DocPea>()
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(p => !p.Activo);

            if (!isAdmin)
            {
                peasQuery = peasQuery.Where(p => p.IdDocenteElaborador == user.IdSigafi);
            }

            var peas = await peasQuery
                .Select(p => new DeletedItemDto
                {
                    Uuid = p.Uuid,
                    Titulo = $"PEA: Asignatura #{p.IdAsignatura}",
                    CodigoInstitucional = $"ASIG-{p.IdAsignatura}",
                    Estado = p.Estado,
                    FechaEliminacion = p.FechaModificacion,
                    EliminadoPor = "Docente / Sistema"
                })
                .ToListAsync();

            result.AddRange(peas);

            // 2. Proyectos históricos archivados si existieran
            var projectsQuery = _context.DocProyectos
                .IgnoreQueryFilters()
                .AsNoTracking()
                .Where(p => p.Eliminado == true);

            if (!isAdmin)
            {
                projectsQuery = projectsQuery.Where(p => p.EliminadoPorUsuarioId == user.IdUsuario);
            }

            var rawProjects = await projectsQuery
                .Select(p => new
                {
                    p.Uuid,
                    p.Titulo,
                    RawCodigoInstitucional = p.CodigoInstitucional,
                    p.Estado,
                    p.FechaEliminacion,
                    EliminadoPor = p.EliminadoPorUsuarioId != null
                        ? _context.Users.Where(u => u.IdUsuario == p.EliminadoPorUsuarioId).Select(u => u.Nombre).FirstOrDefault()
                        : "Desconocido"
                })
                .ToListAsync();

            var projects = rawProjects.Select(p => new DeletedItemDto
            {
                Uuid = p.Uuid,
                Titulo = p.Titulo,
                CodigoInstitucional = CleanDeletedSuffix(p.RawCodigoInstitucional),
                Estado = p.Estado,
                FechaEliminacion = p.FechaEliminacion,
                EliminadoPor = p.EliminadoPor ?? "Desconocido"
            }).ToList();

            result.AddRange(projects);

            return result;
        }

        public async Task<bool> RestoreItemAsync(string uuid, string userIdRef)
        {
            var pea = await _context.Set<DocPea>().IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Uuid == uuid);
            if (pea != null)
            {
                pea.Activo = true;
                await _context.SaveChangesAsync();
                return true;
            }

            var proy = await _context.DocProyectos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Uuid == uuid);
            if (proy != null)
            {
                proy.Eliminado = false;
                proy.FechaEliminacion = null;
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> PurgeItemAsync(string uuid, string userIdRef)
        {
            var pea = await _context.Set<DocPea>().IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Uuid == uuid);
            if (pea != null)
            {
                _context.Set<DocPea>().Remove(pea);
                await _context.SaveChangesAsync();
                return true;
            }

            var proy = await _context.DocProyectos.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Uuid == uuid);
            if (proy != null)
            {
                _context.DocProyectos.Remove(proy);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }

        private static string CleanDeletedSuffix(string? code)
        {
            if (string.IsNullOrWhiteSpace(code)) return "";
            var idx = code.IndexOf("_del_", StringComparison.Ordinal);
            return idx > 0 ? code.Substring(0, idx) : code;
        }
    }
}

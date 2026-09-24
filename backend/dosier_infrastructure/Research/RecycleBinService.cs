using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Research;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Research
{
    public class RecycleBinService : IRecycleBinService
    {
        private readonly DosierContext _context;

        public RecycleBinService(DosierContext context)
        {
            _context = context;
        }

        public async Task<List<DeletedProjectDto>?> GetDeletedProjectsAsync(string userIdRef, bool isAdmin)
        {
            var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.IdSigafi == userIdRef);
            if (user == null) return null;

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

            return rawProjects.Select(p => new DeletedProjectDto
            {
                Uuid = p.Uuid,
                Titulo = p.Titulo,
                CodigoInstitucional = CleanDeletedSuffix(p.RawCodigoInstitucional),
                Estado = p.Estado,
                FechaEliminacion = p.FechaEliminacion,
                EliminadoPor = p.EliminadoPor ?? "Desconocido"
            }).ToList();
        }

        private static string CleanDeletedSuffix(string? code)
        {
            if (string.IsNullOrWhiteSpace(code)) return "";
            var idx = code.IndexOf("_del_", StringComparison.Ordinal);
            return idx > 0 ? code.Substring(0, idx) : code;
        }
    }
}

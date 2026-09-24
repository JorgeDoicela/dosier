using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Common.Interfaces;
using dosier_infrastructure.data.models;
using dosier_domain.Curriculum.Entities;
using Dosier.Domain.Common.Documents;

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

            // 2. Documentos curriculares complementarios archivados
            var docsQuery = _context.DocumentInstances
                .AsNoTracking()
                .Where(d => d.State == DocumentState.Archived);

            if (!isAdmin)
            {
                docsQuery = docsQuery.Where(d => d.CreatedBy == user.IdSigafi);
            }

            var docs = await docsQuery
                .Select(d => new DeletedItemDto
                {
                    Uuid = d.Uuid,
                    Titulo = d.Title ?? $"Documento {d.TemplateCode}",
                    CodigoInstitucional = d.TemplateCode,
                    Estado = d.State.ToString(),
                    FechaEliminacion = d.UpdatedAt,
                    EliminadoPor = d.CreatedBy
                })
                .ToListAsync();

            result.AddRange(docs);

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

            var doc = await _context.DocumentInstances.FirstOrDefaultAsync(d => d.Uuid == uuid);
            if (doc != null && doc.State == DocumentState.Archived)
            {
                doc.TransitionTo(DocumentState.Draft);
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

            var doc = await _context.DocumentInstances.FirstOrDefaultAsync(d => d.Uuid == uuid);
            if (doc != null)
            {
                _context.DocumentInstances.Remove(doc);
                await _context.SaveChangesAsync();
                return true;
            }

            return false;
        }
    }
}

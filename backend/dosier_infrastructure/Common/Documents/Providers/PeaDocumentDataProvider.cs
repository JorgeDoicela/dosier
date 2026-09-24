using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Dosier.Application.Common.Documents;
using dosier_infrastructure.data.models;
using dosier_domain.Curriculum.Entities;

namespace Dosier.Infrastructure.Common.Documents.Providers
{
    public class PeaDocumentDataProvider : IDocumentDataProvider
    {
        private readonly DosierContext _db;

        public PeaDocumentDataProvider(DosierContext db)
        {
            _db = db;
        }

        public bool CanHandle(string entityType) =>
            entityType.Equals("PEA", StringComparison.OrdinalIgnoreCase) ||
            entityType.Equals("PEA_OFICIAL", StringComparison.OrdinalIgnoreCase) ||
            entityType.Equals("PeaCurricular", StringComparison.OrdinalIgnoreCase);

        public async Task<object> GetDocumentDataAsync(string entityUuid, CancellationToken ct = default)
        {
            var pea = await _db.Set<DocPea>()
                .Include(p => p.Unidades)
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.Uuid == entityUuid, ct);

            if (pea == null)
            {
                throw new System.Collections.Generic.KeyNotFoundException($"Instrumento Curricular PEA no encontrado: {entityUuid}");
            }

            return new
            {
                pea.IdPea,
                pea.Uuid,
                pea.IdAsignacion,
                pea.IdAsignatura,
                pea.Version,
                pea.Estado,
                pea.HorasContactoDocente,
                pea.HorasPracticoExperimental,
                pea.HorasAutonomo,
                pea.TotalHorasAsignatura,
                pea.Unidades,
                pea.SnapshotCurricularJson
            };
        }
    }
}

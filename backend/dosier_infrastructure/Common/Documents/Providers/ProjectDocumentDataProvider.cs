using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using Dosier.Application.Research;

namespace Dosier.Infrastructure.Common.Documents.Providers
{
    public class ProjectDocumentDataProvider : IDocumentDataProvider
    {
        private readonly IProjectOrchestrator _projectOrchestrator;

        public ProjectDocumentDataProvider(IProjectOrchestrator projectOrchestrator)
        {
            _projectOrchestrator = projectOrchestrator;
        }

        public bool CanHandle(string entityType) => entityType == "Proyecto";

        public async Task<object> GetDocumentDataAsync(string entityUuid, CancellationToken ct = default)
        {
            var projectDto = await _projectOrchestrator.GetProjectDetailAsync(entityUuid);
            if (projectDto == null)
            {
                throw new System.Collections.Generic.KeyNotFoundException($"Proyecto no encontrado: {entityUuid}");
            }
            return projectDto;
        }
    }
}

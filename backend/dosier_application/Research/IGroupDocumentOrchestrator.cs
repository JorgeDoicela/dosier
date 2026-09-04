using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;

namespace dosier_application.Research
{
    public interface IGroupDocumentOrchestrator
    {
        Task<DocumentResult> GenerateProposalDocumentAsync(string groupUuid, string? requestedBy = null, bool isDraft = false, CancellationToken ct = default);
        Task<object> BuildGroupDocumentDataAsync(string groupUuid, CancellationToken ct = default);
    }
}

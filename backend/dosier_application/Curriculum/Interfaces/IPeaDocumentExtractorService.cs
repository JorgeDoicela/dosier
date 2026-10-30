using System.Threading;
using System.Threading.Tasks;
using dosier_application.Curriculum.Dtos;

namespace dosier_application.Curriculum.Interfaces
{
    public interface IPeaDocumentExtractorService
    {
        Task<PeaStructuredDraftDto> ExtractAndMapDocumentAsync(
            string peaUuid,
            int idUsuario,
            ImportPeaDocumentRequestDto request,
            CancellationToken ct = default);
    }
}

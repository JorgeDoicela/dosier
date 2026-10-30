using System.Threading;
using System.Threading.Tasks;
using dosier_application.Curriculum.Dtos;

namespace dosier_application.Curriculum.Interfaces
{
    public interface IPeaAiAssistantService
    {
        Task<PeaAiConfigStatusDto> GetConfigStatusAsync(int idUsuario, CancellationToken ct = default);
        Task<PeaAiConfigStatusDto> SaveConfigAsync(int idUsuario, bool isAdmin, SavePeaAiConfigRequestDto request, CancellationToken ct = default);
        Task<PeaStructuredDraftDto> GenerateDraftAsync(string peaUuid, int idUsuario, GeneratePeaDraftRequestDto request, CancellationToken ct = default);
    }
}


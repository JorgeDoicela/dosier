using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using dosier_application.Help.DTOs;

namespace dosier_application.Help;

public interface IHelpVideosService
{
    Task<IReadOnlyList<HelpVideoDto>> GetVideosByRouteAsync(
        string routeKey,
        IReadOnlyCollection<string>? callerRoles = null,
        CancellationToken ct = default);

    Task<IReadOnlyList<HelpVideoDto>> GetAllVideosAsync(CancellationToken ct = default);

    Task<HelpVideoDto> AddVideoAsync(
        CreateHelpVideoRequest request,
        CancellationToken ct = default);

    Task<HelpVideoDto?> UpdateVideoAsync(
        string routeKey,
        string videoId,
        UpdateHelpVideoRequest request,
        CancellationToken ct = default);

    Task<IReadOnlyList<HelpVideoDto>> ReorderVideosAsync(
        string routeKey,
        IReadOnlyList<string> orderedIds,
        CancellationToken ct = default);

    Task<bool> DeleteVideoAsync(
        string routeKey,
        string videoId,
        CancellationToken ct = default);

    string? ResolveUploadedVideoPath(string fileName);
}

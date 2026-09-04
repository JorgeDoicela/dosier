using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace Dosier.Application.Research
{
    public interface IProjectWizardService
    {
        Task<SyncResult> SyncProjectWizardDataAsync(ProyectoDto dto, string? creatorUserIdRef = null);
        Task<SyncResult> DeleteProjectAsync(string uuid, string? userIdRef);
        Task<SyncResult> PurgeProjectAsync(string uuid, string? userIdRef);
        Task<SyncResult> RestoreProjectAsync(string uuid, string? userIdRef);
    }
}

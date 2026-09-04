using System.Threading.Tasks;
using Dosier.Application.Research;
using Dosier.Application.Research.Dtos;
using dosier_application.Security;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectWizardCoreSubservice
    {
        Task<(DocProyecto? Project, SyncResult? Error, string? BeforeJson)> ResolveOrCreateProjectCoreAsync(ProyectoDto dto);
        Task<SyncResult> DeleteProjectAsync(string uuid, string? userIdRef);
        Task<SyncResult> RestoreProjectAsync(string uuid, string? userIdRef);
        Task<SyncResult> PurgeProjectAsync(string uuid, string? userIdRef);
        Task SaveChangesWithConcurrencyResolutionAsync();
        Task<bool> IsOversightUserAsync(int idUsuario);
    }
}

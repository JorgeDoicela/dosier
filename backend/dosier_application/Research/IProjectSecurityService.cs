using System.Threading.Tasks;

namespace Dosier.Application.Research
{
    public interface IProjectSecurityService
    {
        Task<bool> UserCanModifyProjectAsync(string projectUuid, string userSigafiId);
        Task<bool> UserCanViewProjectAsync(string projectUuid, string userSigafiId);
        Task<bool> IsSystemAdminAsync(string userSigafiId);
        Task<bool> IsProjectDirectorAsync(string projectUuid, string userSigafiId);
        Task<bool> UserCanRequestTeamChangeAsync(string projectUuid, string userSigafiId);
        Task<int?> GetUserInternalIdBySigafiIdAsync(string sigafiId);
    }
}

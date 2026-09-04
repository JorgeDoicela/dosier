using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectDashboardSubservice
    {
        Task<DashboardStatsDto> GetDashboardStatsAsync(string userIdReferencia, bool isAdmin);
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace Dosier.Application.Research
{
    public interface IProjectTeamSyncService
    {
        Task SyncInvestigadoresAsync(int projectId, List<InvestigadorDto>? investigadores, bool isFromWizard = false);
        Task<List<InvestigadorDto>> BuildProjectInvestigadoresFromGroupAsync(int groupId, int projectId, List<InvestigadorDto>? incomingInvestigadores = null);
        Task SyncProjectCarrerasAsync(int projectId, int? idCarreraPrincipal, List<InvestigadorDto>? investigadores);
        Task<int> GetResearchSubcatIdAsync();
        Task<List<string>> GetEstadosConCargaHorariaAsync();
    }
}

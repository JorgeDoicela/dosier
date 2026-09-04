using System.Threading.Tasks;
using Dosier.Application.Research;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectWizardClassificationSubservice
    {
        Task<SyncResult?> SyncResearchGroupAndAssociativeAsync(DocProyecto project, ProyectoDto dto);
        Task<SyncResult?> SyncConvocatoriaAndObjectivesPndAsync(DocProyecto project, ProyectoDto dto);
        Task SyncProgramAndTypesAsync(DocProyecto project, ProyectoDto dto);
        Task SyncAcademicDomainAndCareersAsync(DocProyecto project, ProyectoDto dto);
        Task SyncGroupMembersAndCreatorAsync(DocProyecto project, ProyectoDto dto, string? creatorUserIdRef, bool isOversightUser);
    }
}

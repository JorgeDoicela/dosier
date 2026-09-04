using System.Collections.Generic;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectWizardComponentsSubservice
    {
        Task<List<int>> SyncObjetivosAsync(int projectId, string? objetivoGeneral, List<string>? objetivos);
        Task SyncProductosAsync(int projectId, List<ProductoEsperadoDto>? productos);
        Task SyncCronogramaAsync(int projectId, List<int> objetivosCreadosIds, List<ActividadCronogramaDto>? cronograma);
        Task SyncBibliografiaAsync(int projectId, List<string>? biblio);
    }
}

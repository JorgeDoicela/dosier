using System.Collections.Generic;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectActivitySubservice
    {
        Task<List<ProyectoActividadDto>> GetProjectActivityAsync(string projectUuid, int maxItems = 20);
    }
}

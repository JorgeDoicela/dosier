using System.Collections.Generic;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectLookupSubservice
    {
        Task<string?> ResolveCanonicalUuidAsync(string identifier);
        Task<List<ProyectoResumenDto>> GetAllProjectsAsync();
        Task<List<ProyectoResumenDto>> GetMyProjectsAsync(string userIdReferencia);
    }
}

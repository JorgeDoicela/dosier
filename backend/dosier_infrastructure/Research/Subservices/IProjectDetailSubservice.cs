using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace dosier_infrastructure.Research.Subservices
{
    public interface IProjectDetailSubservice
    {
        Task<ProyectoDto?> GetProjectDetailAsync(string uuid);
    }
}

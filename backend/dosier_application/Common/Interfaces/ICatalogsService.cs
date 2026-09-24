using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Common.Dtos;

namespace dosier_application.Common.Interfaces
{
    public interface ICatalogsService
    {
        Task<List<ConfigGeneralDto>> GetConfigGeneralAsync(string? prefix = null);
        Task<List<CarreraCatalogoDto>> GetCarrerasAsync();
        Task<List<CarreraCatalogoDto>> GetMiCarreraAsync(string idReferencia);
        Task<List<PeriodoCatalogoDto>> GetPeriodosAsync();
        Task<PeriodoCatalogoDto> CreatePeriodoAsync(PeriodoMutationDto model);
        Task<PeriodoCatalogoDto?> UpdatePeriodoAsync(string id, PeriodoMutationDto model);
        Task<PeriodoCatalogoDto?> TogglePeriodoAsync(string id);
        Task<List<WorkflowEstadoConfigDto>> GetEstadosConfigAsync();
    }
}

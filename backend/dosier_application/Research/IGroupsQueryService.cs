using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Research.Dtos;

namespace dosier_application.Research
{
    public interface IGroupsQueryService
    {
        Task<IEnumerable<GroupDto>> GetAllAsync(string? search = null, string? userSigafiId = null, bool isAdmin = false, string? memberCedula = null);
        Task<GroupDto?> GetByUuidAsync(string uuid);
        Task<IEnumerable<GroupDto>> GetPublicGroupsAsync(string? search = null);
        Task<GroupDto?> GetPublicGroupByUuidAsync(string uuid);
    }
}

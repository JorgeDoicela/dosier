using System.Threading.Tasks;
using dosier_application.Collaboration.Dtos;

namespace dosier_application.Collaboration.Interfaces
{
    public interface ICollaborationService
    {
        Task<PulseResponseDto> GetPulseAsync(string instanceUuid);
        Task<CommentOpResult> PostCommentAsync(CreateCommentRequest request, string userUuid, string userName);
        Task<CommentOpResult> UpdateCommentAsync(int id, UpdateCommentRequest request, string userUuid, bool isAdmin);
        Task<CommentOpResult> DeleteCommentAsync(int id, string userUuid, bool isAdmin);
    }
}

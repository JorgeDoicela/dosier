using System.Security.Claims;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;
using Dosier.Application.Common.Documents;

namespace Dosier.Application.Research
{
    public interface IProjectSigningService
    {
        Task<DocumentResult> GeneratePdfAsync(ProyectoDto dto, bool isDraft, bool isBlind, string? requestedBy);
        Task<ProjectSignResult> SignDocumentAsync(byte[]? certificateBytes, string? password, string projectUuid, ClaimsPrincipal user, string? ipAddress, string? userAgent);
    }

    public class ProjectSignResult
    {
        public bool Success { get; set; }
        public byte[]? PdfBytes { get; set; }
        public string? FileName { get; set; }
        public string? ErrorMessage { get; set; }
        public int StatusCode { get; set; } = 400;
    }
}

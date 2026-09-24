using System.Threading.Tasks;

namespace dosier_application.Common.Interfaces
{
    public interface IReportsService
    {
        Task<byte[]> GenerateAnalyticsReportPdfAsync(string? period, string? carrera, string userIdRef, bool isAdmin, string userName);
    }
}

using System.Threading.Tasks;

namespace dosier_application.Research
{
    public interface IReportsService
    {
        Task<byte[]> GenerateAnalyticsReportPdfAsync(string? period, string? carrera, string userIdRef, bool isAdmin, string userName);
    }
}

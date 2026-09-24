using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Dosier.Application.Common.Documents
{
    public interface IDocumentTemplateAdminService
    {
        Task<List<string>?> GetCustomTemplateOrderAsync(CancellationToken ct = default);
        Task SaveTemplateOrderAsync(List<string> codes, CancellationToken ct = default);
        Task<string?> GetGlobalThemeConfigAsync(CancellationToken ct = default);
        Task SaveGlobalThemeConfigAsync(string themeConfigJson, CancellationToken ct = default);
        Task<int> GetUsageCountAsync(string templateCode, CancellationToken ct = default);
        Task PublishTemplateAsync(string code, string htmlContent, string? customCss, string? collaborativeFieldsJson, string? themeConfigJson, string updatedBy, CancellationToken ct = default);
    }
}

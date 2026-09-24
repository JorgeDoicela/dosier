using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using dosier_infrastructure.Collaboration;
using dosier_infrastructure.data.models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Dosier.Infrastructure.Common.Documents
{
    public class DocumentTemplateAdminService : IDocumentTemplateAdminService
    {
        private readonly DosierContext _db;
        private readonly IDocumentEngine _documentEngine;
        private readonly IHubContext<CollaborationHub> _hubContext;

        public DocumentTemplateAdminService(
            DosierContext db,
            IDocumentEngine documentEngine,
            IHubContext<CollaborationHub> hubContext)
        {
            _db = db;
            _documentEngine = documentEngine;
            _hubContext = hubContext;
        }

        public async Task<List<string>?> GetCustomTemplateOrderAsync(CancellationToken ct = default)
        {
            var config = await _db.DocConfigsGenerales
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Clave == "Templates.OrderConfigJson", ct);

            if (config != null && !string.IsNullOrEmpty(config.Valor))
            {
                try
                {
                    return JsonSerializer.Deserialize<List<string>>(config.Valor);
                }
                catch
                {
                    return null;
                }
            }

            return null;
        }

        public async Task SaveTemplateOrderAsync(List<string> codes, CancellationToken ct = default)
        {
            var config = await _db.DocConfigsGenerales
                .FirstOrDefaultAsync(c => c.Clave == "Templates.OrderConfigJson", ct);

            var jsonValue = JsonSerializer.Serialize(codes);

            if (config == null)
            {
                config = new DocConfigGeneral
                {
                    Clave = "Templates.OrderConfigJson",
                    Valor = jsonValue,
                    Descripcion = "Arreglo ordenado JSON con los códigos de las plantillas para visualización en el catálogo."
                };
                _db.DocConfigsGenerales.Add(config);
            }
            else
            {
                config.Valor = jsonValue;
            }

            await _db.SaveChangesAsync(ct);
        }

        public async Task<string?> GetGlobalThemeConfigAsync(CancellationToken ct = default)
        {
            var config = await _db.DocConfigsGenerales
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Clave == "Theme.GlobalConfigJson", ct);

            return config?.Valor;
        }

        public async Task SaveGlobalThemeConfigAsync(string themeConfigJson, CancellationToken ct = default)
        {
            var config = await _db.DocConfigsGenerales
                .FirstOrDefaultAsync(c => c.Clave == "Theme.GlobalConfigJson", ct);

            if (config == null)
            {
                config = new DocConfigGeneral
                {
                    Clave = "Theme.GlobalConfigJson",
                    Valor = themeConfigJson ?? string.Empty,
                    Descripcion = "Diseño y branding global institucional (colores, márgenes, tipografía)."
                };
                _db.DocConfigsGenerales.Add(config);
            }
            else
            {
                config.Valor = themeConfigJson ?? string.Empty;
            }

            await _db.SaveChangesAsync(ct);
        }

        public async Task<int> GetUsageCountAsync(string templateCode, CancellationToken ct = default)
        {
            return await _db.DocumentInstances
                .CountAsync(i => i.TemplateCode == templateCode && (int)i.State < 3, ct);
        }

        public async Task PublishTemplateAsync(string code, string htmlContent, string? customCss, string? collaborativeFieldsJson, string? themeConfigJson, string updatedBy, CancellationToken ct = default)
        {
            await _documentEngine.UpdateTemplateAsync(code, htmlContent, customCss, collaborativeFieldsJson, themeConfigJson, updatedBy, ct);

            await _hubContext.Clients.All.SendAsync("TemplatePublished", new
            {
                template_code = code,
                templateCode = code,
                updated_by = updatedBy,
                timestamp = DateTime.UtcNow
            }, ct);
        }
    }
}

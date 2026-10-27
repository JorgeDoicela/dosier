using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;
using Dosier.Domain.Common.Documents;

namespace Dosier.Infrastructure.Common.Documents
{
    /// <summary>
    /// Implementación Realista del Orquestador de Datos.
    /// Resuelve el problema de la "Ceguera de Datos" del Builder.
    /// </summary>
    public class DocumentDataOrchestrator : IDocumentDataOrchestrator
    {
        private readonly DosierContext _db;
        private readonly IEnumerable<IDocumentDataProvider> _providers;

        public DocumentDataOrchestrator(DosierContext db, IEnumerable<IDocumentDataProvider> providers)
        {
            _db = db;
            _providers = providers;
        }

        public async Task<DocumentRequest> PrepareRequestAsync(string documentInstanceUuid, string requestedBy, bool? forceDraftMode = null, CancellationToken ct = default)
        {
            // 1. Obtener la instancia del documento
            var instance = await _db.DocumentInstances
                .FirstOrDefaultAsync(i => i.Uuid == documentInstanceUuid, ct)
                ?? throw new KeyNotFoundException($"No se encontró la instancia: {documentInstanceUuid}");

            // 2. Identificar el tipo de entidad desde la instancia (Resiliencia)
            string entityType = instance.EntityType;

            // 3. Buscar el proveedor adecuado
            var provider = _providers.FirstOrDefault(p => p.CanHandle(entityType))
                ?? throw new InvalidOperationException($"No hay un proveedor de datos para el tipo: {entityType}");

            // 4. Base de datos estructurada a partir del snapshot persistido en la instancia
            var masterDict = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

            if (!string.IsNullOrWhiteSpace(instance.DataSnapshotJson))
            {
                try
                {
                    var snap = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(instance.DataSnapshotJson);
                    if (snap != null)
                    {
                        foreach (var kv in snap)
                        {
                            masterDict[kv.Key] = kv.Value;
                        }
                    }
                }
                catch { }
            }

            // 5. Complementar con datos del proveedor de entidad
            try
            {
                var entityData = await provider.GetDocumentDataAsync(instance.EntityUuid, ct);
                if (entityData != null)
                {
                    var rawEntity = System.Text.Json.JsonSerializer.Serialize(entityData);
                    var entityDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(rawEntity);
                    if (entityDict != null)
                    {
                        foreach (var kv in entityDict)
                        {
                            if (!masterDict.ContainsKey(kv.Key) || masterDict[kv.Key] == null || string.IsNullOrWhiteSpace(masterDict[kv.Key]?.ToString()))
                            {
                                masterDict[kv.Key] = kv.Value;
                            }
                        }
                    }
                }
            }
            catch { }

            // 6. Obtener contenido colaborativo (CoWork) vinculado a esta INSTANCIA y ENTIDAD
            var coworkDocs = await _db.DocCoworkDocumentos
                .Where(d => d.EntidadUuid == instance.Uuid || d.EntidadUuid == instance.EntityUuid)
                .ToListAsync(ct);

            var collaborativeContent = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var d in coworkDocs)
            {
                if (!string.IsNullOrEmpty(d.CampoNombre))
                {
                    collaborativeContent[d.CampoNombre] = d.ContentHtml ?? string.Empty;
                    if (!string.IsNullOrWhiteSpace(d.ContentHtml))
                    {
                        masterDict[d.CampoNombre] = d.ContentHtml;
                    }
                }
            }

            // 7. Metadatos de la instancia
            masterDict["Uuid"] = instance.Uuid;
            masterDict["uuid"] = instance.Uuid;
            masterDict["EntityUuid"] = instance.EntityUuid;
            masterDict["entityUuid"] = instance.EntityUuid;
            masterDict["TemplateCode"] = instance.TemplateCode;
            masterDict["Titulo"] = instance.Title;
            masterDict["ContenidoColaborativo"] = collaborativeContent;
            masterDict["Emision"] = new
            {
                Fecha = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
                Usuario = requestedBy,
                TraceCode = instance.TraceabilityCode ?? "OFICIAL"
            };

            // 8. Devolver Request con bandera de Draft Mode si no ha sido finalizado (o forzado vía parámetro)
            return new DocumentRequest
            {
                TemplateCode = instance.TemplateCode,
                Data = masterDict,
                EntityUuid = instance.EntityUuid,
                RequestedBy = requestedBy,
                IsDraftMode = forceDraftMode ?? (instance.State != DocumentState.Signed),
                IsBlindMode = false
            };
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using Dosier.Domain.Common.Documents;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Dosier.Infrastructure.Common.Documents
{
    public class DocumentVerificationService : IDocumentVerificationService
    {
        private readonly DosierContext _context;
        private readonly IDocumentAuditRepository _auditRepository;
        private readonly IDocumentTemplateRepository _templateRepository;
        private readonly ILogger<DocumentVerificationService> _logger;

        public DocumentVerificationService(
            DosierContext context,
            IDocumentAuditRepository auditRepository,
            IDocumentTemplateRepository templateRepository,
            ILogger<DocumentVerificationService> logger)
        {
            _context = context;
            _auditRepository = auditRepository;
            _templateRepository = templateRepository;
            _logger = logger;
        }

        public async Task<DocumentVerificationResultDto?> VerifyDocumentByCodeAsync(string code, CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(code)) return null;

            code = code.Trim();

            // 1. Intentar buscar por código de trazabilidad del documento original
            var auditEntry = await _auditRepository.FindByTraceabilityCodeAsync(code, ct);

            // 1.1 Si no está en auditEntry, buscar en instancias de documentos emitidos (Certificados / DocumentInstances)
            DocumentInstance? docInstance = null;
            if (auditEntry == null)
            {
                docInstance = await _context.DocumentInstances.AsNoTracking()
                    .FirstOrDefaultAsync(d => d.TraceabilityCode == code || d.Uuid == code, ct);
            }

            // 2. Si no se encuentra, intentar buscar por un código de firma (DFRM-*)
            DocDocumentoFirma? firmaBusqueda = null;
            if (auditEntry == null && docInstance == null)
            {
                firmaBusqueda = await _context.DocDocumentoFirmas.AsNoTracking()
                    .FirstOrDefaultAsync(f => f.FirmaCode == code, ct);

                if (firmaBusqueda != null && !string.IsNullOrWhiteSpace(firmaBusqueda.DocumentoUuid))
                {
                    auditEntry = await _context.DocumentAuditEntries.AsNoTracking()
                        .FirstOrDefaultAsync(e => e.EntityUuid == firmaBusqueda.DocumentoUuid, ct);
                }
            }

            if (auditEntry == null && docInstance == null && firmaBusqueda == null)
            {
                return null;
            }

            string templateName = "Documento Oficial DOSIER";
            string templateCodeFound = auditEntry?.TemplateCode ?? docInstance?.TemplateCode ?? "DFRM-VERIFY";

            try
            {
                var template = await _templateRepository.FindByCodeAsync(templateCodeFound, ct);
                if (template != null)
                {
                    templateName = template.Name;
                }
                else if (docInstance != null && !string.IsNullOrWhiteSpace(docInstance.Title))
                {
                    templateName = docInstance.Title;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[DOSIER CORE] No se pudo obtener el nombre de la plantilla {Code}", templateCodeFound);
            }

            // 3. Obtener todas las firmas asociadas a este documento ordenadas por fecha (cascada de firmas)
            var firmasDb = new List<DocDocumentoFirma>();
            string docUuidToSearch = auditEntry?.EntityUuid ?? firmaBusqueda?.DocumentoUuid ?? "";

            if (!string.IsNullOrWhiteSpace(docUuidToSearch))
            {
                firmasDb = await _context.DocDocumentoFirmas.AsNoTracking()
                    .Where(f => f.DocumentoUuid == docUuidToSearch)
                    .OrderBy(f => f.FechaFirma)
                    .ToListAsync(ct);
            }

            if (firmasDb.Count == 0 && firmaBusqueda != null)
            {
                firmasDb.Add(firmaBusqueda);
            }

            var firmasList = firmasDb.Select(f =>
            {
                string firmanteNombre = f.FirmanteId;
                try
                {
                    using var doc = JsonDocument.Parse(f.FirmaMetadata ?? "{}");
                    firmanteNombre = doc.RootElement.TryGetProperty("nombre", out var n)
                        ? n.GetString() ?? f.FirmanteId
                        : f.FirmanteId;
                }
                catch { }

                return new DocumentVerificationSignatureDto
                {
                    FirmaCode = f.FirmaCode ?? string.Empty,
                    FirmanteNombre = firmanteNombre ?? string.Empty,
                    FirmanteRol = f.FirmanteRol ?? string.Empty,
                    FechaFirma = f.FechaFirma,
                    DocHash = f.DocHash ?? string.Empty,
                    EsValida = f.EsValida,
                    RevocadaEn = f.RevocadaEn,
                    MotivoRevocacion = f.MotivoRevocacion
                };
            }).ToList();

            string generatedBy = auditEntry?.GeneratedBy ?? docInstance?.CreatedBy ?? "Sistema DOSIER";
            if (auditEntry == null && docInstance != null && !string.IsNullOrEmpty(docInstance.DataSnapshotJson))
            {
                try
                {
                    using var snap = JsonDocument.Parse(docInstance.DataSnapshotJson);
                    if (snap.RootElement.TryGetProperty("RecipientName", out var rn) && !string.IsNullOrWhiteSpace(rn.GetString()))
                    {
                        generatedBy = rn.GetString()!;
                    }
                }
                catch { }
            }
            else if (auditEntry == null && firmaBusqueda != null && firmasList.Count > 0)
            {
                generatedBy = firmasList[0].FirmanteNombre;
            }

            return new DocumentVerificationResultDto
            {
                TemplateCode = templateCodeFound,
                TemplateName = templateName,
                TemplateVersion = auditEntry != null ? auditEntry.TemplateVersion.ToString() : (docInstance?.TemplateVersion.ToString() ?? "1.0"),
                Category = auditEntry != null ? auditEntry.Category.ToString() : "DocumentVerification",
                GeneratedBy = generatedBy,
                GeneratedAt = auditEntry?.GeneratedAt ?? docInstance?.CreatedAt ?? firmaBusqueda?.FechaFirma ?? DateTime.UtcNow,
                FileHash = auditEntry?.FileHash ?? docInstance?.FileHash ?? firmaBusqueda?.DocHash ?? "N/A",
                FileName = auditEntry?.FileName ?? (docInstance != null ? $"Certificado_{docInstance.TraceabilityCode ?? docInstance.Uuid}.pdf" : $"Firma_{firmaBusqueda?.FirmaCode}.pdf"),
                Signatures = firmasList
            };
        }
    }
}

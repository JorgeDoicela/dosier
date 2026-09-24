using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Dosier.Application.Common.Documents
{
    public class DocumentVerificationSignatureDto
    {
        public string FirmaCode { get; set; } = string.Empty;
        public string FirmanteNombre { get; set; } = string.Empty;
        public string FirmanteRol { get; set; } = string.Empty;
        public DateTime FechaFirma { get; set; }
        public string DocHash { get; set; } = string.Empty;
        public bool EsValida { get; set; }
        public DateTime? RevocadaEn { get; set; }
        public string? MotivoRevocacion { get; set; }
    }

    public class DocumentVerificationResultDto
    {
        public string TemplateCode { get; set; } = string.Empty;
        public string TemplateName { get; set; } = string.Empty;
        public string TemplateVersion { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string GeneratedBy { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public string FileHash { get; set; } = string.Empty;
        public string FileName { get; set; } = string.Empty;
        public List<DocumentVerificationSignatureDto> Signatures { get; set; } = new();
    }

    public interface IDocumentVerificationService
    {
        Task<DocumentVerificationResultDto?> VerifyDocumentByCodeAsync(string code, CancellationToken ct = default);
    }
}

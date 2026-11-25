using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dosier_application.Common.Notifications
{
    public interface IEmailEngineService
    {
        Task<IEnumerable<EmailTemplateDto>> GetTemplatesAsync();
        Task<EmailTemplateDto?> GetTemplateByIdAsync(int id);
        Task<EmailTemplateDto?> GetTemplateByCodigoAsync(string codigo);
        Task<EmailTemplateDto> CreateTemplateAsync(EmailTemplateDto template);
        Task<EmailTemplateDto> UpdateTemplateAsync(EmailTemplateDto template);
        Task DeleteTemplateAsync(int id);
        Task<IEnumerable<EmailHistorialDto>> GetEmailHistoryAsync(int limit = 100);
        Task<IEnumerable<EmailHistorialDto>> GetEmailHistoryAsync(int limit, EmailActorContext? actor);
        Task<bool> SendTemplatedEmailAsync(EmailSendRequest request);
        Task<bool> SendTemplatedEmailAsync(EmailSendRequest request, EmailActorContext? actor);
        Task<EmailEngineScopeDto> GetScopeAsync(EmailActorContext actor);
        Task<IEnumerable<EmailRecipientOptionDto>> SearchRecipientsAsync(
            EmailActorContext actor,
            string? search = null,
            string? type = null,
            int? carreraId = null,
            int limit = 50);
        Task<EmailAudiencePreviewDto> PreviewAudienceAsync(
            EmailAudiencePreviewRequest request,
            EmailActorContext actor);
    }

    /// <summary>
    /// Contexto del actor autenticado para aplicar restricciones RBAC y alcance por carrera en el motor de correos.
    /// Si es null, la operación proviene de un proceso interno del sistema (ej. cron de calendario o recuperación de contraseña).
    /// </summary>
    public class EmailActorContext
    {
        public int? UserId { get; set; }
        public string? Identifier { get; set; }
        public List<string> Roles { get; set; } = new();
    }

    public class EmailEngineScopeDto
    {
        public string PrimaryRole { get; set; } = string.Empty;
        public bool IsGlobalScope { get; set; }
        public bool CanManageTemplates { get; set; }
        public bool CanDeleteTemplates { get; set; }
        public bool CanViewAllHistory { get; set; }
        public List<string> AllowedBroadcastRoles { get; set; } = new();
        public List<int> AllowedCarreraIds { get; set; } = new();
        public List<EmailScopeCarreraDto> AllowedCarreras { get; set; } = new();
        public List<EmailScopeModalidadDto> AvailableModalidades { get; set; } = new();
    }

    public class EmailScopeCarreraDto
    {
        public int IdCarrera { get; set; }
        public string Carrera1 { get; set; } = string.Empty;
        public string? AliasCarrera { get; set; }
        public List<int> ModalidadIds { get; set; } = new();
    }

    public class EmailScopeModalidadDto
    {
        public int IdModalidad { get; set; }
        public string Nombre { get; set; } = string.Empty;
        public List<int> CarreraIds { get; set; } = new();
    }

    public class EmailAudiencePreviewRequest
    {
        public string? TargetRole { get; set; }
        public int? TargetCarreraId { get; set; }
        public List<int> TargetCarreraIds { get; set; } = new();
        public List<int> TargetModalidadIds { get; set; } = new();
        public string? TargetPeaEstado { get; set; }
        public string? TargetPeriodoId { get; set; }
    }

    public class EmailAudiencePreviewDto
    {
        public int TotalRecipients { get; set; }
        public List<EmailRecipientOptionDto> Sample { get; set; } = new();
    }

    public class EmailRecipientOptionDto
    {
        public int IdUsuario { get; set; }
        public string NombreCompleto { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Tipo { get; set; } = "DOCENTE";
        public string? Carrera { get; set; }
    }

    public class EmailTemplateDto
    {
        public int IdEmailTemplate { get; set; }
        public string Uuid { get; set; } = null!;
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }
        public string Asunto { get; set; } = null!;
        public string CuerpoHtml { get; set; } = null!;
        public bool Activo { get; set; } = true;
        public DateTime FechaCreado { get; set; }
        public DateTime FechaActualizado { get; set; }
    }

    public class EmailHistorialDto
    {
        public int IdEmailHistorial { get; set; }
        public string Uuid { get; set; } = null!;
        public string Destinatario { get; set; } = null!;
        public int? IdUsuarioDestinatario { get; set; }
        public string? NombreDestinatario { get; set; }
        public string Asunto { get; set; } = null!;
        public string Cuerpo { get; set; } = null!;
        public string Estado { get; set; } = "Pendiente";
        public string? ErrorMensaje { get; set; }
        public DateTime FechaEnvio { get; set; }
        public string? AdjuntosJson { get; set; }
        public string? MetadataJson { get; set; }
    }

    public class EmailSendRequest
    {
        public string? TemplateCodigo { get; set; }
        public List<string> DestinatariosEmails { get; set; } = new List<string>();
        public List<int> DestinatariosUserIds { get; set; } = new List<int>();
        public string? TargetRole { get; set; }
        public int? TargetCarreraId { get; set; }
        public List<int> TargetCarreraIds { get; set; } = new List<int>();
        public List<int> TargetModalidadIds { get; set; } = new List<int>();
        public string? TargetPeaEstado { get; set; }
        public string? TargetPeriodoId { get; set; }

        public string? CustomSubject { get; set; }
        public string? CustomBody { get; set; }

        public Dictionary<string, string> TemplateData { get; set; } = new Dictionary<string, string>();
        public List<EmailAttachmentDto> Attachments { get; set; } = new List<EmailAttachmentDto>();

        public string? EntityUuid { get; set; }
        public string? EntityType { get; set; }

        public string? CertificateBase64 { get; set; }
        public string? SignaturePassword { get; set; }
    }

    public class EmailAttachmentDto
    {
        public string NombreArchivo { get; set; } = null!;
        public string? RutaArchivo { get; set; }
        public string? Base64Content { get; set; }
        public string? ContentType { get; set; }
    }
}

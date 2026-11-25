using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Common.Notifications;

namespace dosier_infrastructure.Common.Notifications
{
    public interface IEmailSenderSubservice
    {
        Task<bool> SendTemplatedEmailAsync(EmailSendRequest request, EmailActorContext? actor = null);
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
}

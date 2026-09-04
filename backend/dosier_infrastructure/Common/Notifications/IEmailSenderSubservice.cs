using System.Threading.Tasks;
using dosier_application.Common.Notifications;

namespace dosier_infrastructure.Common.Notifications
{
    public interface IEmailSenderSubservice
    {
        Task<bool> SendTemplatedEmailAsync(EmailSendRequest request);
    }
}

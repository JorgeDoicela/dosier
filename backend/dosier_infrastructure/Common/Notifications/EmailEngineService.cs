using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Common.Notifications;

namespace dosier_infrastructure.Common.Notifications
{
    public class EmailEngineService : IEmailEngineService
    {
        private readonly IEmailTemplateService _templateService;
        private readonly IEmailSenderSubservice _senderSubservice;

        public EmailEngineService(
            IEmailTemplateService templateService,
            IEmailSenderSubservice senderSubservice)
        {
            _templateService = templateService;
            _senderSubservice = senderSubservice;
        }

        public Task<IEnumerable<EmailTemplateDto>> GetTemplatesAsync() => 
            _templateService.GetTemplatesAsync();

        public Task<EmailTemplateDto?> GetTemplateByIdAsync(int id) => 
            _templateService.GetTemplateByIdAsync(id);

        public Task<EmailTemplateDto?> GetTemplateByCodigoAsync(string codigo) => 
            _templateService.GetTemplateByCodigoAsync(codigo);

        public Task<EmailTemplateDto> CreateTemplateAsync(EmailTemplateDto dto) => 
            _templateService.CreateTemplateAsync(dto);

        public Task<EmailTemplateDto> UpdateTemplateAsync(EmailTemplateDto dto) => 
            _templateService.UpdateTemplateAsync(dto);

        public Task DeleteTemplateAsync(int id) => 
            _templateService.DeleteTemplateAsync(id);

        public Task<IEnumerable<EmailHistorialDto>> GetEmailHistoryAsync(int limit = 100) => 
            _templateService.GetEmailHistoryAsync(limit);

        public Task<bool> SendTemplatedEmailAsync(EmailSendRequest request) => 
            _senderSubservice.SendTemplatedEmailAsync(request);
    }
}

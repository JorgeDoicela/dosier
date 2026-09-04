using System;
using System.IO;
using System.Net;
using System.Net.Mail;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_application.Common;
using dosier_application.Common.Notifications;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Common.Notifications
{
    /// <summary>
    /// DRIVER DE NOTIFICACIÓN VÍA CORREO ELECTRÓNICO (SMTP) - DOSIER
    /// Esta clase se encarga de renderizar plantillas de correo electrónico desacopladas (HTML)
    /// utilizando el motor Handlebars.Net y despacharlas mediante el canal SMTP institucional.
    /// </summary>
    public class EmailDriver : INotificationDriver
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailDriver> _logger;
        private readonly EmailMasterLayoutRenderer _layoutRenderer;
        private readonly DosierContext _context;
        private readonly IAppUrlService _appUrlService;

        public string Name => "Email";

        public EmailDriver(
            IConfiguration configuration,
            ILogger<EmailDriver> logger,
            EmailMasterLayoutRenderer layoutRenderer,
            DosierContext context,
            IAppUrlService appUrlService)
        {
            _configuration = configuration;
            _logger = logger;
            _layoutRenderer = layoutRenderer;
            _context = context;
            _appUrlService = appUrlService;
        }

        public async Task SendAsync(string recipient, string title, string body, string? url = null, string? recipientName = null, Dictionary<string, string>? extraData = null)
        {
            if (extraData != null && extraData.TryGetValue("SkipEmail", out var skip) && skip.Equals("true", StringComparison.OrdinalIgnoreCase))
            {
                return;
            }

            var absoluteUrl = url != null 
                ? (url.StartsWith("http", StringComparison.OrdinalIgnoreCase) 
                    ? url 
                    : _appUrlService.BuildFrontendUrl(url)) 
                : null;
            var name = recipientName ?? "Investigador";

            try
            {
                var htmlBody = await _layoutRenderer.RenderAsync(title, name, body, absoluteUrl, extraData);

                int? targetUserId = null;
                if (extraData != null && extraData.TryGetValue("UserId", out var uidStr) && int.TryParse(uidStr, out var uid))
                {
                    targetUserId = uid;
                }
                else
                {
                    var user = await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.EmailInstitucional == recipient);
                    targetUserId = user?.IdUsuario;
                }

                // Encolamos el correo en doc_email_historial para que el servicio EmailBackgroundProcessorService lo despache de forma asíncrona.
                var emailHistorial = new DocEmailHistorial
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Destinatario = recipient,
                    IdUsuarioDestinatario = targetUserId,
                    Asunto = title,
                    Cuerpo = htmlBody,
                    Estado = "Pendiente",
                    FechaEnvio = DateTime.UtcNow
                };

                _context.DocEmailHistorials.Add(emailHistorial);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Notificación por correo encolada en doc_email_historial para {Recipient} con asunto '{Title}'", recipient, title);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al encolar notificación de email para {Recipient}", recipient);
                throw;
            }
        }
    }
}

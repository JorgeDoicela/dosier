using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using dosier_application.Common.Notifications;
using Dosier.Application.Research.Dtos;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;
using Dosier.Application.Common.Documents;
using Dosier.Application.Research;

namespace dosier_infrastructure.Common.Notifications
{
    public class EmailSenderSubservice : IEmailSenderSubservice
    {
        private readonly DosierContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailSenderSubservice> _logger;
        private readonly IDocumentEngine _documentEngine;
        private readonly IProjectOrchestrator _projectOrchestrator;
        private readonly dosier_infrastructure.Security.IFirmaElectronicaService _firmaElectronicaService;
        private readonly EmailMasterLayoutRenderer _layoutRenderer;
        private readonly IEmailTemplateService _templateService;
        private readonly dosier_application.Common.IAppUrlService _appUrlService;

        public EmailSenderSubservice(
            DosierContext context,
            IConfiguration configuration,
            ILogger<EmailSenderSubservice> logger,
            IDocumentEngine documentEngine,
            IProjectOrchestrator projectOrchestrator,
            dosier_infrastructure.Security.IFirmaElectronicaService firmaElectronicaService,
            EmailMasterLayoutRenderer layoutRenderer,
            IEmailTemplateService templateService,
            dosier_application.Common.IAppUrlService appUrlService)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _documentEngine = documentEngine;
            _projectOrchestrator = projectOrchestrator;
            _firmaElectronicaService = firmaElectronicaService;
            _layoutRenderer = layoutRenderer;
            _templateService = templateService;
            _appUrlService = appUrlService;
        }

        public async Task<bool> SendTemplatedEmailAsync(EmailSendRequest request)
        {
            _logger.LogInformation("Iniciando envío de correo dinámico por el motor de email (Sender Subservice)...");

            // 1. Obtener destinatarios
            var recipientEmails = new List<(string Email, int? UserId, string Name)>();

            // Destinatarios explícitos por correo (externos o institucionales)
            foreach (var rawEmail in request.DestinatariosEmails ?? Enumerable.Empty<string>())
            {
                var email = rawEmail?.Trim();
                if (string.IsNullOrEmpty(email) || !email.Contains('@')) continue;

                var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailInstitucional == email);
                var displayName = user?.Nombre;
                if (string.IsNullOrWhiteSpace(displayName))
                {
                    var localPart = email.Split('@')[0];
                    if (!string.IsNullOrEmpty(localPart))
                    {
                        displayName = char.ToUpper(localPart[0]) + (localPart.Length > 1 ? localPart[1..] : "");
                    }
                    else
                    {
                        displayName = "Usuario";
                    }
                }
                recipientEmails.Add((email, user?.IdUsuario, displayName));
            }

            // Destinatarios por IdUsuario (correo en usuario, profesor o alumno vinculado)
            foreach (var userId in request.DestinatariosUserIds ?? Enumerable.Empty<int>())
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) continue;
                var (email, name) = await ResolveRecipientFromUserAsync(user);
                if (!string.IsNullOrEmpty(email))
                    recipientEmails.Add((email, user.IdUsuario, name));
            }

            // Destinatarios por Rol y Carrera
            if (!string.IsNullOrEmpty(request.TargetRole) || request.TargetCarreraId.HasValue)
            {
                IQueryable<User> usersQuery = _context.Users.Where(u => u.Activo);

                if (!string.IsNullOrEmpty(request.TargetRole))
                {
                    var roleCodes = new List<string> { request.TargetRole, $"DOSIER_{request.TargetRole}" };
                    usersQuery = _context.UserRoles
                        .Include(ur => ur.User)
                        .Include(ur => ur.Role)
                        .Where(ur => roleCodes.Contains(ur.Role.CodigoRol) && (ur.EsActivo ?? true))
                        .Select(ur => ur.User)
                        .Where(u => u != null && u.Activo);
                }

                if (request.TargetCarreraId.HasValue)
                {
                    // 1. Docentes asociados a proyectos de la carrera
                    var userIdsInCarrera = await _context.DocProyectoParticipantes
                        .Include(pp => pp.IdProyectoNavigation)
                        .ThenInclude(p => p!.DocProyectosCarreras)
                        .Where(pp => pp.TipoParticipante == "Docente" && pp.IdProyectoNavigation!.DocProyectosCarreras.Any(pc => pc.IdCarrera == request.TargetCarreraId.Value))
                        .Select(pp => pp.IdUsuario)
                        .Distinct()
                        .ToListAsync();

                    // 2. Docentes asociados a la carrera directamente en SIGAFI
                    var sigafiProfesorIds = await _context.ProfesoresCarrerasPeriodos
                        .Where(pcp => pcp.IdCarrera == request.TargetCarreraId.Value && (pcp.EsActivo ?? 1) == 1)
                        .Select(pcp => pcp.IdProfesor)
                        .Distinct()
                        .ToListAsync();

                    var sigafiUserIds = await _context.Users
                        .Where(u => u.Activo && u.TablaSigafi == "profesor" && sigafiProfesorIds.Contains(u.IdSigafi))
                        .Select(u => u.IdUsuario)
                        .ToListAsync();

                    // Combinar destinatarios de proyectos y de carrera directamente
                    var allTargetUserIds = userIdsInCarrera.Union(sigafiUserIds).Distinct().ToList();

                    usersQuery = usersQuery.Where(u => allTargetUserIds.Contains(u.IdUsuario));
                }

                var list = await usersQuery.ToListAsync();
                foreach (var u in list)
                {
                    var (email, name) = await ResolveRecipientFromUserAsync(u);
                    if (!string.IsNullOrEmpty(email))
                        recipientEmails.Add((email, u.IdUsuario, name));
                }
            }

            // Eliminar duplicados
            recipientEmails = recipientEmails.GroupBy(r => r.Email.ToLower().Trim()).Select(g => g.First()).ToList();

            if (!recipientEmails.Any())
            {
                _logger.LogWarning("No se encontraron destinatarios válidos para el envío de correo.");
                return false;
            }

            // 2. Obtener plantilla o usar cuerpo personalizado
            string subjectTemplate = request.CustomSubject ?? "Notificación DOSIER";
            string bodyTemplate = request.CustomBody ?? "";

            if (!string.IsNullOrEmpty(request.TemplateCodigo))
            {
                var template = await _templateService.GetTemplateByCodigoAsync(request.TemplateCodigo);
                if (template != null)
                {
                    subjectTemplate = request.CustomSubject ?? template.Asunto;
                    bodyTemplate = request.CustomBody ?? template.CuerpoHtml;
                }
                else
                {
                    _logger.LogWarning("Plantilla '{TemplateCodigo}' no encontrada. Usando valores custom/default.", request.TemplateCodigo);
                }
            }

            // 3. Configurar SMTP
            var host = _configuration["Email:Host"];
            var isMock = string.IsNullOrEmpty(host);

            var port = int.Parse(_configuration["Email:Port"] ?? "587");
            var smtpUser = _configuration["Email:Username"];
            var smtpPass = _configuration["Email:Password"];
            var fromEmail = _configuration["Email:FromEmail"] ?? _configuration["Email:Username"] ?? "no-reply@dosier.local";
            var fromName = _configuration["Email:FromName"] ?? "DOSIER Notificaciones";

            var frontendUrl = _appUrlService.GetFrontendUrl();

            // 3.5. Cargar variables de contexto dinámico (una sola vez por envío)
            var contextReplacements = new Dictionary<string, string>();
            if (!string.IsNullOrEmpty(request.EntityType) && !string.IsNullOrEmpty(request.EntityUuid))
            {
                try
                {
                    if (request.EntityType.Equals("Proyecto", StringComparison.OrdinalIgnoreCase))
                    {
                        var proj = await _context.DocProyectos
                            .Include(p => p.DocProyectoParticipantes)
                            .ThenInclude(pp => pp.IdUsuarioNavigation)
                            .FirstOrDefaultAsync(p => p.Uuid == request.EntityUuid);
                        if (proj != null)
                        {
                            var dir = proj.DocProyectoParticipantes.FirstOrDefault(pp => pp.EsDirector == true && pp.Activo != false && pp.TipoParticipante == "Docente")?.IdUsuarioNavigation;
                            
                            string desc = "";
                            if (!string.IsNullOrEmpty(proj.MetadataCacesJson))
                            {
                                try
                                {
                                    using var doc = System.Text.Json.JsonDocument.Parse(proj.MetadataCacesJson);
                                    if (doc.RootElement.TryGetProperty("descripcionProyecto", out var el) || doc.RootElement.TryGetProperty("DescripcionProyecto", out el))
                                    {
                                        desc = el.GetString() ?? "";
                                    }
                                }
                                catch {}
                            }

                            contextReplacements["[[proyecto_titulo]]"] = proj.Titulo ?? "";
                            contextReplacements["[[proyecto_codigo]]"] = proj.CodigoInstitucional ?? "";
                            contextReplacements["[[proyecto_descripcion]]"] = desc;
                            contextReplacements["[[proyecto_estado]]"] = proj.Estado ?? "";
                            contextReplacements["[[proyecto_director]]"] = dir?.Nombre ?? "Sin asignar";
                            contextReplacements["[[proyecto_director_email]]"] = dir?.EmailInstitucional ?? "";
                            contextReplacements["[[linea_investigacion]]"] = "General";
                            contextReplacements["[[proyecto_sublinea]]"] = "No asignada";
                            contextReplacements["[[proyecto_workspace_url]]"] = _appUrlService.BuildFrontendUrl($"/investigacion/workspace/protocolo-investigacion/{proj.Uuid}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error al cargar variables de contexto dinámico para '{EntityType}' con UUID '{EntityUuid}'", request.EntityType, request.EntityUuid);
                }
            }

            foreach (var recipient in recipientEmails)
            {
                // Inyectar variables específicas del destinatario y del contexto
                var replacements = new Dictionary<string, string>(request.TemplateData);
                foreach (var kvp in contextReplacements)
                {
                    replacements[kvp.Key] = kvp.Value;
                }
                
                replacements["[[destinatario_nombre]]"] = recipient.Name;
                replacements["[[destinatario_email]]"] = recipient.Email;
                replacements["[[anio_actual]]"] = DateTime.UtcNow.Year.ToString();
                replacements["[[institucion_nombre]]"] = "Instituto Superior Tecnológico Traversari";
                replacements["[[sistema_url]]"] = frontendUrl;

                // Reemplazar tokens en asunto y cuerpo
                var finalSubject = ReplaceTokens(subjectTemplate, replacements);
                var tokenizedBody = ReplaceTokens(bodyTemplate, replacements);

                var actionUrl = EmailMasterLayoutRenderer.ResolveActionUrl(replacements, tokenizedBody, frontendUrl);
                var extraDataForLayout = BuildExtraDataForLayout(replacements);

                var finalBody = await _layoutRenderer.RenderAsync(
                    finalSubject,
                    recipient.Name,
                    tokenizedBody,
                    actionUrl,
                    extraDataForLayout);

                var historyEntry = new DocEmailHistorial
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Destinatario = recipient.Email,
                    IdUsuarioDestinatario = recipient.UserId,
                    Asunto = finalSubject,
                    Cuerpo = finalBody,
                    Estado = "Pendiente",
                    FechaEnvio = DateTime.UtcNow,
                    MetadataJson = JsonSerializer.Serialize(new
                    {
                        entityUuid = request.EntityUuid,
                        entityType = request.EntityType,
                        templateCodigo = request.TemplateCodigo
                    })
                };

                // Procesar adjuntos
                var attachmentsMeta = new List<object>();
                var storagePath = _configuration["Storage:BasePath"] ?? Path.Combine(AppContext.BaseDirectory, "dosier_data");
                var emailAttachmentsDir = Path.Combine(storagePath, "email_attachments");

                foreach (var adj in request.Attachments ?? Enumerable.Empty<EmailAttachmentDto>())
                {
                    if (!string.IsNullOrEmpty(adj.Base64Content))
                    {
                        try
                        {
                            if (!Directory.Exists(emailAttachmentsDir)) Directory.CreateDirectory(emailAttachmentsDir);
                            var fileUuid = Guid.NewGuid().ToString();
                            var extension = Path.GetExtension(adj.NombreArchivo) ?? ".dat";
                            var physicalFileName = $"{fileUuid}{extension}";
                            var fullPath = Path.Combine(emailAttachmentsDir, physicalFileName);
                            var bytes = Convert.FromBase64String(adj.Base64Content);
                            await File.WriteAllBytesAsync(fullPath, bytes);

                            var relativePath = Path.Combine("email_attachments", physicalFileName).Replace("\\", "/");
                            attachmentsMeta.Add(new { nombre = adj.NombreArchivo, ruta = relativePath });
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error al guardar adjunto Base64 en disco para el correo.");
                        }
                    }
                    else if (!string.IsNullOrEmpty(adj.RutaArchivo))
                    {
                        attachmentsMeta.Add(new { nombre = adj.NombreArchivo, ruta = adj.RutaArchivo });
                    }
                }

                historyEntry.AdjuntosJson = JsonSerializer.Serialize(attachmentsMeta);
                _context.DocEmailHistorials.Add(historyEntry);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private string ReplaceTokens(string template, Dictionary<string, string> replacements)
        {
            if (string.IsNullOrEmpty(template)) return "";
            var result = template;
            foreach (var kvp in replacements)
            {
                result = result.Replace(kvp.Key, kvp.Value ?? "");
            }
            return result;
        }

        private static Dictionary<string, string>? BuildExtraDataForLayout(Dictionary<string, string> replacements)
        {
            var skip = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "[[destinatario_nombre]]", "[[destinatario_email]]", "[[anio_actual]]",
                "[[institucion_nombre]]", "[[sistema_url]]"
            };

            var rows = new Dictionary<string, string>();
            foreach (var kvp in replacements)
            {
                if (skip.Contains(kvp.Key)) continue;
                if (string.IsNullOrWhiteSpace(kvp.Value)) continue;
                if (kvp.Key.Contains("url", StringComparison.OrdinalIgnoreCase) && kvp.Value.StartsWith("http")) continue;

                var label = kvp.Key.Replace("[[", "").Replace("]]", "").Replace("_", " ");
                label = char.ToUpper(label[0]) + label[1..];
                rows[label] = kvp.Value;
            }

            return rows.Count > 0 ? rows : null;
        }

        private async Task<(string? Email, string Name)> ResolveRecipientFromUserAsync(User user)
        {
            var name = user.Nombre ?? "Investigador/a";
            var email = user.EmailInstitucional?.Trim();
            if (!string.IsNullOrEmpty(email) && email.Contains('@'))
                return (email, name);

            var sigafiId = user.IdSigafi?.Trim() ?? "";
            if (user.TablaSigafi == "profesor" && !string.IsNullOrEmpty(sigafiId))
            {
                var p = await _context.Profesores.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.IdProfesor.Trim() == sigafiId);
                if (p != null)
                {
                    email = (p.EmailInstitucional ?? p.Email)?.Trim();
                    var profName = $"{p.PrimerNombre} {p.PrimerApellido}".Replace("  ", " ").Trim();
                    if (!string.IsNullOrWhiteSpace(profName)) name = profName;
                }
            }
            else if (user.TablaSigafi == "alumno" && !string.IsNullOrEmpty(sigafiId))
            {
                var a = await _context.Alumnos.AsNoTracking()
                    .FirstOrDefaultAsync(x => x.IdAlumno.Trim() == sigafiId);
                if (a != null)
                {
                    email = (a.EmailInstitucional ?? a.Email)?.Trim();
                    var alumName = $"{a.PrimerNombre} {a.ApellidoPaterno}".Replace("  ", " ").Trim();
                    if (!string.IsNullOrWhiteSpace(alumName)) name = alumName;
                }
            }
            else if (user.TablaSigafi == "otros" && sigafiId.Contains('@'))
            {
                email = sigafiId;
            }

            if (!string.IsNullOrEmpty(email) && email.Contains('@'))
                return (email, name);

            return (null, name);
        }
    }
}

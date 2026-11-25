using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using dosier_application.Common;
using dosier_application.Common.Notifications;
using dosier_application.Curriculum.Interfaces;
using dosier_domain.Curriculum.Entities;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.data.models;
using Dosier.Application.Common.Documents;

namespace dosier_infrastructure.Common.Notifications
{
    public class EmailSenderSubservice : IEmailSenderSubservice
    {
        private readonly DosierContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailSenderSubservice> _logger;
        private readonly IDocumentEngine _documentEngine;
        private readonly dosier_infrastructure.Security.IFirmaElectronicaService _firmaElectronicaService;
        private readonly EmailMasterLayoutRenderer _layoutRenderer;
        private readonly IEmailTemplateService _templateService;
        private readonly IAppUrlService _appUrlService;
        private readonly IServiceProvider _serviceProvider;

        private static readonly Dictionary<string, string> ExtraDataLabels = new(StringComparer.OrdinalIgnoreCase)
        {
            ["[[pea_asignatura]]"] = "Asignatura",
            ["[[pea_codigo]]"] = "Código PEA",
            ["[[pea_carrera]]"] = "Carrera",
            ["[[pea_periodo]]"] = "Período académico",
            ["[[pea_nivel]]"] = "Semestre / Nivel",
            ["[[pea_modalidad]]"] = "Modalidad",
            ["[[pea_estado]]"] = "Estado del PEA",
            ["[[pea_docente]]"] = "Docente elaborador",
            ["[[pea_docente_email]]"] = "Correo del docente",
            ["[[pea_horas_totales]]"] = "Horas totales",
            ["[[pea_creditos]]"] = "Créditos",
            ["[[periodo_codigo]]"] = "Código de período",
            ["[[periodo_nombre]]"] = "Período académico",
            ["[[periodo_fecha_inicio]]"] = "Fecha de inicio",
            ["[[periodo_fecha_fin]]"] = "Fecha de cierre",
            ["[[periodo_estado]]"] = "Estado del período",
            ["[[titulo_evento]]"] = "Evento curricular",
            ["[[fecha_evento]]"] = "Fecha programada",
            ["[[dias_restantes]]"] = "Días restantes",
            ["[[fecha_limite]]"] = "Fecha límite",
            ["[[observacion_resumen]]"] = "Observaciones"
        };

        public EmailSenderSubservice(
            DosierContext context,
            IConfiguration configuration,
            ILogger<EmailSenderSubservice> logger,
            IDocumentEngine documentEngine,
            dosier_infrastructure.Security.IFirmaElectronicaService firmaElectronicaService,
            EmailMasterLayoutRenderer layoutRenderer,
            IEmailTemplateService templateService,
            IAppUrlService appUrlService,
            IServiceProvider serviceProvider)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
            _documentEngine = documentEngine;
            _firmaElectronicaService = firmaElectronicaService;
            _layoutRenderer = layoutRenderer;
            _templateService = templateService;
            _appUrlService = appUrlService;
            _serviceProvider = serviceProvider;
        }

        private static readonly string[] AllBroadcastRoles =
        {
            "DOSIER_DOCENTE",
            "DOSIER_COORD_CARRERA",
            "DOSIER_COORD_ACAD",
            "DOSIER_VICERRECTOR",
            "DOSIER_ADMIN"
        };

        public async Task<EmailEngineScopeDto> GetScopeAsync(EmailActorContext actor)
        {
            var roles = (actor.Roles ?? new List<string>())
                .Where(r => !string.IsNullOrWhiteSpace(r))
                .Select(r => r.Trim().ToUpperInvariant())
                .Distinct()
                .ToList();

            User? dbUser = null;
            if (actor.UserId.HasValue && actor.UserId.Value > 0)
            {
                dbUser = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdUsuario == actor.UserId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(actor.Identifier))
            {
                var idTrim = actor.Identifier.Trim();
                dbUser = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdSigafi == idTrim || u.EmailInstitucional == idTrim);
            }

            if (dbUser != null && dbUser.Administrador && !roles.Contains("DOSIER_ADMIN"))
            {
                roles.Add("DOSIER_ADMIN");
            }

            bool isAdmin = roles.Contains("DOSIER_ADMIN");
            bool isVicerrector = roles.Contains("DOSIER_VICERRECTOR");
            bool isCoordAcad = roles.Contains("DOSIER_COORD_ACAD");
            bool isGlobal = isAdmin || isVicerrector || isCoordAcad;

            string primaryRole = isAdmin ? "DOSIER_ADMIN"
                : isVicerrector ? "DOSIER_VICERRECTOR"
                : isCoordAcad ? "DOSIER_COORD_ACAD"
                : roles.Contains("DOSIER_COORD_CARRERA") ? "DOSIER_COORD_CARRERA"
                : roles.FirstOrDefault() ?? "DOSIER_DOCENTE";

            if (isGlobal)
            {
                var todasCarreras = await _context.Carreras.AsNoTracking()
                    .Where(c => c.EsInstituto == 1)
                    .OrderBy(c => c.Carrera1)
                    .Select(c => new EmailScopeCarreraDto
                    {
                        IdCarrera = c.IdCarrera,
                        Carrera1 = c.Carrera1 ?? string.Empty,
                        AliasCarrera = c.AliasCarrera
                    })
                    .ToListAsync();

                var modalidadesGlobal = await ResolveModalidadesForCarrerasAsync(todasCarreras);

                return new EmailEngineScopeDto
                {
                    PrimaryRole = primaryRole,
                    IsGlobalScope = true,
                    CanManageTemplates = true,
                    CanDeleteTemplates = isAdmin,
                    CanViewAllHistory = true,
                    AllowedBroadcastRoles = AllBroadcastRoles.ToList(),
                    AllowedCarreraIds = todasCarreras.Select(c => c.IdCarrera).ToList(),
                    AllowedCarreras = todasCarreras,
                    AvailableModalidades = modalidadesGlobal
                };
            }

            // Alcance restringido para Coordinador de Carrera: únicamente sus carreras coordinadas
            var allowedIds = new HashSet<int>();
            var idSigafi = dbUser?.IdSigafi?.Trim() ?? actor.Identifier?.Trim() ?? string.Empty;

            if (!string.IsNullOrWhiteSpace(idSigafi))
            {
                var coordCarreras = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdSigafi == idSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                    .Select(a => a.IdCarrera!.Value)
                    .Distinct()
                    .ToListAsync();
                foreach (var cid in coordCarreras) allowedIds.Add(cid);

                // Fallback si no tiene registro explícito en doc_autoridades_curriculares
                if (allowedIds.Count == 0)
                {
                    var profCarreras = await _context.ProfesoresCarrerasPeriodos.AsNoTracking()
                        .Where(pcp => pcp.IdProfesor == idSigafi && (pcp.EsActivo ?? 1) == 1 && pcp.IdCarrera != null)
                        .Select(pcp => pcp.IdCarrera!.Value)
                        .Distinct()
                        .ToListAsync();
                    foreach (var cid in profCarreras) allowedIds.Add(cid);
                }
            }

            var allowedCarrerasList = allowedIds.Count > 0
                ? await _context.Carreras.AsNoTracking()
                    .Where(c => c.EsInstituto == 1 && allowedIds.Contains(c.IdCarrera))
                    .OrderBy(c => c.Carrera1)
                    .Select(c => new EmailScopeCarreraDto
                    {
                        IdCarrera = c.IdCarrera,
                        Carrera1 = c.Carrera1 ?? string.Empty,
                        AliasCarrera = c.AliasCarrera
                    })
                    .ToListAsync()
                : new List<EmailScopeCarreraDto>();

            var modalidadesScoped = await ResolveModalidadesForCarrerasAsync(allowedCarrerasList);

            return new EmailEngineScopeDto
            {
                PrimaryRole = primaryRole,
                IsGlobalScope = false,
                CanManageTemplates = false,
                CanDeleteTemplates = false,
                CanViewAllHistory = false,
                AllowedBroadcastRoles = new List<string> { "DOSIER_DOCENTE" },
                AllowedCarreraIds = allowedCarrerasList.Select(c => c.IdCarrera).ToList(),
                AllowedCarreras = allowedCarrerasList,
                AvailableModalidades = modalidadesScoped
            };
        }

        private async Task<List<EmailScopeModalidadDto>> ResolveModalidadesForCarrerasAsync(List<EmailScopeCarreraDto> carreras)
        {
            if (!carreras.Any()) return new List<EmailScopeModalidadDto>();

            var carreraIdSet = carreras.Select(c => c.IdCarrera).ToHashSet();

            var modalidades = await _context.Modalidades.AsNoTracking()
                .OrderBy(m => m.Modalidad1)
                .ToListAsync();

            var modCarreras = await _context.ModalidadesCarreras.AsNoTracking()
                .Where(mc => carreraIdSet.Contains(mc.IdCarrera) && (mc.EsActivo == null || mc.EsActivo == 1))
                .ToListAsync();

            // Mapa modalidad -> conjunto de carreras
            var modToCarreras = new Dictionary<int, HashSet<int>>();
            foreach (var mc in modCarreras)
            {
                if (!modToCarreras.TryGetValue(mc.IdModalidad, out var set))
                {
                    set = new HashSet<int>();
                    modToCarreras[mc.IdModalidad] = set;
                }
                set.Add(mc.IdCarrera);
            }

            // Enriquecer desde asignaciones activas + cursos por si alguna modalidad solo existe en distributivo
            var cursosMap = await _context.Cursos.AsNoTracking()
                .Where(c => carreraIdSet.Contains(c.IdCarrera))
                .Select(c => new { c.IdNivel, c.IdCarrera })
                .ToListAsync();
            var nivelToCarrera = cursosMap
                .GroupBy(x => x.IdNivel)
                .ToDictionary(g => g.Key, g => g.First().IdCarrera);

            if (nivelToCarrera.Any())
            {
                var nivelIds = nivelToCarrera.Keys.ToList();
                var asigMods = await _context.AsignacionesProfesores.AsNoTracking()
                    .Where(a => a.Activo == 1 && nivelIds.Contains(a.IdNivel))
                    .Select(a => new { a.IdModalidad, a.IdNivel })
                    .Distinct()
                    .ToListAsync();

                foreach (var am in asigMods)
                {
                    if (nivelToCarrera.TryGetValue(am.IdNivel, out var cid))
                    {
                        if (!modToCarreras.TryGetValue(am.IdModalidad, out var set))
                        {
                            set = new HashSet<int>();
                            modToCarreras[am.IdModalidad] = set;
                        }
                        set.Add(cid);
                    }
                }
            }

            // Poblar ModalidadIds en cada carrera del DTO
            foreach (var c in carreras)
            {
                c.ModalidadIds = modToCarreras
                    .Where(kvp => kvp.Value.Contains(c.IdCarrera))
                    .Select(kvp => kvp.Key)
                    .OrderBy(id => id)
                    .ToList();
            }

            var result = new List<EmailScopeModalidadDto>();
            foreach (var m in modalidades)
            {
                var nombre = (m.ModalidadImpresion ?? m.Modalidad1 ?? string.Empty).Trim();
                if (string.IsNullOrWhiteSpace(nombre)) continue;

                var cIds = modToCarreras.TryGetValue(m.IdModalidad, out var set)
                    ? set.OrderBy(id => id).ToList()
                    : new List<int>();

                if (cIds.Any())
                {
                    result.Add(new EmailScopeModalidadDto
                    {
                        IdModalidad = m.IdModalidad,
                        Nombre = nombre,
                        CarreraIds = cIds
                    });
                }
            }

            return result;
        }

        public async Task<EmailAudiencePreviewDto> PreviewAudienceAsync(
            EmailAudiencePreviewRequest request,
            EmailActorContext actor)
        {
            var scope = await GetScopeAsync(actor);
            var syntheticSend = new EmailSendRequest
            {
                TargetRole = request.TargetRole,
                TargetCarreraId = request.TargetCarreraId,
                TargetCarreraIds = request.TargetCarreraIds ?? new List<int>(),
                TargetModalidadIds = request.TargetModalidadIds ?? new List<int>(),
                TargetPeaEstado = request.TargetPeaEstado,
                TargetPeriodoId = request.TargetPeriodoId
            };

            await ValidateRequestAgainstScopeAsync(syntheticSend, scope);
            var recipients = await ResolveGroupRecipientsAsync(syntheticSend, scope);

            return new EmailAudiencePreviewDto
            {
                TotalRecipients = recipients.Count,
                Sample = recipients
                    .Take(10)
                    .Select(r => new EmailRecipientOptionDto
                    {
                        IdUsuario = r.UserId ?? 0,
                        NombreCompleto = r.Name,
                        Email = r.Email,
                        Tipo = "DOCENTE"
                    })
                    .ToList()
            };
        }

        public async Task<IEnumerable<EmailRecipientOptionDto>> SearchRecipientsAsync(
            EmailActorContext actor,
            string? search = null,
            string? type = null,
            int? carreraId = null,
            int limit = 50)
        {
            var scope = await GetScopeAsync(actor);
            int effectiveLimit = Math.Clamp(limit, 1, 100);

            var usersQuery = _context.Users.AsNoTracking()
                .Where(u => u.Activo && u.TablaSigafi != "alumno");

            if (!scope.IsGlobalScope)
            {
                if (!scope.AllowedCarreraIds.Any())
                    return Enumerable.Empty<EmailRecipientOptionDto>();

                var targetCarreraIds = carreraId.HasValue
                    ? (scope.AllowedCarreraIds.Contains(carreraId.Value) ? new List<int> { carreraId.Value } : new List<int>())
                    : scope.AllowedCarreraIds;

                if (!targetCarreraIds.Any())
                    return Enumerable.Empty<EmailRecipientOptionDto>();

                var scopedUserIds = await ResolveUserIdsForCarrerasAsync(targetCarreraIds);
                if (!scopedUserIds.Any())
                    return Enumerable.Empty<EmailRecipientOptionDto>();

                usersQuery = usersQuery.Where(u => scopedUserIds.Contains(u.IdUsuario));
            }
            else if (carreraId.HasValue)
            {
                var scopedUserIds = await ResolveUserIdsForCarrerasAsync(new List<int> { carreraId.Value });
                if (!scopedUserIds.Any())
                    return Enumerable.Empty<EmailRecipientOptionDto>();

                usersQuery = usersQuery.Where(u => scopedUserIds.Contains(u.IdUsuario));
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                var normType = type.Trim().ToUpperInvariant();
                if (normType == "DOCENTE")
                {
                    usersQuery = usersQuery.Where(u => u.TablaSigafi == "profesor");
                }
                else if (normType == "ADMINISTRATIVO")
                {
                    usersQuery = usersQuery.Where(u => u.Administrador || u.TablaSigafi != "profesor");
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLowerInvariant();
                usersQuery = usersQuery.Where(u =>
                    (u.Nombre != null && u.Nombre.ToLower().Contains(term)) ||
                    (u.EmailInstitucional != null && u.EmailInstitucional.ToLower().Contains(term)) ||
                    (u.IdSigafi != null && u.IdSigafi.ToLower().Contains(term)));
            }

            var candidates = await usersQuery
                .OrderBy(u => u.Nombre)
                .Take(effectiveLimit)
                .ToListAsync();

            var results = new List<EmailRecipientOptionDto>();
            foreach (var u in candidates)
            {
                var (email, name) = await ResolveRecipientFromUserAsync(u);
                results.Add(new EmailRecipientOptionDto
                {
                    IdUsuario = u.IdUsuario,
                    NombreCompleto = name,
                    Email = email ?? string.Empty,
                    Tipo = u.TablaSigafi == "profesor" ? "DOCENTE" : "ADMINISTRATIVO"
                });
            }

            return results;
        }

        private async Task<HashSet<int>> ResolveUserIdsForCarrerasAsync(IEnumerable<int> carreraIds)
        {
            var carreraIdList = carreraIds.Distinct().ToList();
            if (!carreraIdList.Any()) return new HashSet<int>();

            var sigafiIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            var profCarreraIds = await _context.ProfesoresCarrerasPeriodos.AsNoTracking()
                .Where(pcp => pcp.IdCarrera != null && carreraIdList.Contains(pcp.IdCarrera.Value) && (pcp.EsActivo ?? 1) == 1)
                .Select(pcp => pcp.IdProfesor)
                .Distinct()
                .ToListAsync();
            foreach (var id in profCarreraIds.Where(x => !string.IsNullOrWhiteSpace(x)))
                sigafiIds.Add(id.Trim());

            var nivelesCarrera = await _context.Cursos.AsNoTracking()
                .Where(c => carreraIdList.Contains(c.IdCarrera))
                .Select(c => c.IdNivel)
                .Distinct()
                .ToListAsync();

            if (nivelesCarrera.Any())
            {
                var profAsignacionIds = await _context.AsignacionesProfesores.AsNoTracking()
                    .Where(am => am.Activo == 1 && nivelesCarrera.Contains(am.IdNivel))
                    .Select(am => am.IdProfesor)
                    .Distinct()
                    .ToListAsync();
                foreach (var id in profAsignacionIds.Where(x => !string.IsNullOrWhiteSpace(x)))
                    sigafiIds.Add(id.Trim());
            }

            var autoridadesIds = await _context.DocAutoridadesCurriculares.AsNoTracking()
                .Where(a => a.IdCarrera != null && carreraIdList.Contains(a.IdCarrera.Value) && a.EsActivo)
                .Select(a => a.IdSigafi)
                .Distinct()
                .ToListAsync();
            foreach (var id in autoridadesIds.Where(x => !string.IsNullOrWhiteSpace(x)))
                sigafiIds.Add(id.Trim());

            if (!sigafiIds.Any()) return new HashSet<int>();

            var sigafiList = sigafiIds.ToList();
            var userIds = await _context.Users.AsNoTracking()
                .Where(u => u.Activo && sigafiList.Contains(u.IdSigafi))
                .Select(u => u.IdUsuario)
                .ToListAsync();

            return userIds.ToHashSet();
        }

        public async Task<bool> SendTemplatedEmailAsync(EmailSendRequest request, EmailActorContext? actor = null)
        {
            _logger.LogInformation("Iniciando envío de correo dinámico por el motor de email DOSIER...");

            EmailEngineScopeDto? actorScope = null;
            if (actor != null)
            {
                actorScope = await GetScopeAsync(actor);
                await ValidateRequestAgainstScopeAsync(request, actorScope);
            }

            // 1. Obtener destinatarios
            var recipientEmails = await ResolveRecipientsAsync(request, actorScope);
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
                    subjectTemplate = string.IsNullOrWhiteSpace(request.CustomSubject) ? template.Asunto : request.CustomSubject;
                    bodyTemplate = string.IsNullOrWhiteSpace(request.CustomBody) ? template.CuerpoHtml : request.CustomBody;
                }
                else
                {
                    _logger.LogWarning("Plantilla '{TemplateCodigo}' no encontrada. Usando valores custom/default.", request.TemplateCodigo);
                }
            }

            var frontendUrl = _appUrlService.GetFrontendUrl();

            // 3. Cargar variables de contexto dinámico curricular (una sola vez por envío)
            var contextReplacements = await LoadDynamicContextReplacementsAsync(request);

            // 4. Preparar adjuntos físicos (manuales + autogenerados del sistema como SYSTEM:PEA_OFICIAL) una sola vez por lote
            var sharedAttachmentsMeta = await PrepareAttachmentsAsync(request);
            var serializedAttachments = JsonSerializer.Serialize(sharedAttachmentsMeta);

            // 5. Encolar correo personalizado por destinatario en doc_email_historial (Outbox)
            foreach (var recipient in recipientEmails)
            {
                var replacements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);

                foreach (var kvp in contextReplacements)
                {
                    replacements[kvp.Key] = kvp.Value;
                }

                // Los valores enviados explícitamente desde el formulario tienen prioridad sobre los automáticos si no están vacíos
                if (request.TemplateData != null)
                {
                    foreach (var kvp in request.TemplateData)
                    {
                        if (!string.IsNullOrWhiteSpace(kvp.Value))
                        {
                            replacements[kvp.Key] = kvp.Value;
                        }
                    }
                }

                replacements["[[destinatario_nombre]]"] = recipient.Name;
                replacements["[[destinatario_email]]"] = recipient.Email;
                replacements["[[anio_actual]]"] = DateTime.UtcNow.Year.ToString();
                replacements["[[institucion_nombre]]"] = "Instituto Superior Tecnológico Traversari";
                replacements["[[sistema_url]]"] = frontendUrl;

                // Limpiar [[mensaje_adicional]] si no fue proporcionado
                if (!replacements.ContainsKey("[[mensaje_adicional]]"))
                {
                    replacements["[[mensaje_adicional]]"] = "";
                }

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
                    AdjuntosJson = serializedAttachments,
                    MetadataJson = JsonSerializer.Serialize(new
                    {
                        entityUuid = request.EntityUuid,
                        entityType = request.EntityType,
                        templateCodigo = request.TemplateCodigo,
                        senderUserId = actor?.UserId,
                        senderRole = actorScope?.PrimaryRole
                    })
                };

                _context.DocEmailHistorials.Add(historyEntry);
            }

            await _context.SaveChangesAsync();
            return true;
        }

        private static List<int> GetNormalizedTargetCarreraIds(EmailSendRequest request)
        {
            var ids = new HashSet<int>();
            if (request.TargetCarreraId.HasValue && request.TargetCarreraId.Value > 0)
                ids.Add(request.TargetCarreraId.Value);
            if (request.TargetCarreraIds != null)
            {
                foreach (var id in request.TargetCarreraIds.Where(x => x > 0))
                    ids.Add(id);
            }
            return ids.ToList();
        }

        private static List<int> GetNormalizedTargetModalidadIds(EmailSendRequest request)
        {
            return (request.TargetModalidadIds ?? new List<int>())
                .Where(x => x > 0)
                .Distinct()
                .ToList();
        }

        private static bool HasGroupCriteria(EmailSendRequest request)
        {
            return !string.IsNullOrWhiteSpace(request.TargetRole)
                || request.TargetCarreraId.HasValue
                || (request.TargetCarreraIds != null && request.TargetCarreraIds.Any(x => x > 0))
                || (request.TargetModalidadIds != null && request.TargetModalidadIds.Any(x => x > 0))
                || !string.IsNullOrWhiteSpace(request.TargetPeaEstado);
        }

        private async Task ValidateRequestAgainstScopeAsync(EmailSendRequest request, EmailEngineScopeDto scope)
        {
            if (scope.IsGlobalScope) return;

            if (!scope.AllowedCarreraIds.Any())
            {
                throw new UnauthorizedAccessException("No tiene carreras activas asignadas a su coordinación para enviar correos.");
            }

            // 1. Validar rol objetivo en difusión/grupos
            if (!string.IsNullOrWhiteSpace(request.TargetRole))
            {
                var normalizedRole = request.TargetRole.Trim().ToUpperInvariant();
                if (!normalizedRole.StartsWith("DOSIER_")) normalizedRole = $"DOSIER_{normalizedRole}";
                if (!scope.AllowedBroadcastRoles.Contains(normalizedRole, StringComparer.OrdinalIgnoreCase))
                {
                    throw new UnauthorizedAccessException("Su rol de Coordinación de Carrera solo permite difundir correos a Docentes de su carrera.");
                }
            }

            // 2. Validar carreras objetivo en difusión/grupos
            var requestedCarreras = GetNormalizedTargetCarreraIds(request);
            if (requestedCarreras.Any(cid => !scope.AllowedCarreraIds.Contains(cid)))
            {
                throw new UnauthorizedAccessException("No tiene permisos para enviar correos masivos a una carrera que no coordina.");
            }

            bool hasGroup = HasGroupCriteria(request);
            if (hasGroup && !requestedCarreras.Any())
            {
                request.TargetCarreraIds = scope.AllowedCarreraIds.ToList();
            }

            // 3. Validar contexto PEA vinculado
            if (!string.IsNullOrWhiteSpace(request.EntityUuid) &&
                !string.IsNullOrWhiteSpace(request.EntityType) &&
                (request.EntityType.Equals("PEA", StringComparison.OrdinalIgnoreCase) ||
                 request.EntityType.Equals("Proyecto", StringComparison.OrdinalIgnoreCase)))
            {
                var pea = await _context.Set<DocPea>().AsNoTracking()
                    .FirstOrDefaultAsync(p => p.Uuid == request.EntityUuid);
                if (pea != null && !scope.AllowedCarreraIds.Contains(pea.IdCarrera))
                {
                    throw new UnauthorizedAccessException("No tiene permisos para vincular o adjuntar un PEA que pertenece a otra carrera.");
                }
            }
        }

        private async Task<List<(string Email, int? UserId, string Name)>> ResolveGroupRecipientsAsync(
            EmailSendRequest request,
            EmailEngineScopeDto? actorScope = null)
        {
            if (!HasGroupCriteria(request))
            {
                return new List<(string Email, int? UserId, string Name)>();
            }

            IQueryable<User> usersQuery = _context.Users.AsNoTracking()
                .Where(u => u.Activo && u.TablaSigafi != "alumno");

            // 1. Filtro por Rol
            if (!string.IsNullOrWhiteSpace(request.TargetRole))
            {
                var normalizedRole = request.TargetRole.Trim();
                var roleCodes = normalizedRole.StartsWith("DOSIER_", StringComparison.OrdinalIgnoreCase)
                    ? new List<string> { normalizedRole }
                    : new List<string> { normalizedRole, $"DOSIER_{normalizedRole}" };

                usersQuery = _context.UserRoles.AsNoTracking()
                    .Include(ur => ur.User)
                    .Include(ur => ur.Role)
                    .Where(ur => roleCodes.Contains(ur.Role.CodigoRol) && (ur.EsActivo ?? true))
                    .Select(ur => ur.User)
                    .Where(u => u != null && u.Activo && u.TablaSigafi != "alumno");
            }

            var targetCarreras = GetNormalizedTargetCarreraIds(request);
            var targetModalidades = GetNormalizedTargetModalidadIds(request);

            // Restringir siempre al scope si no es global
            if (actorScope != null && !actorScope.IsGlobalScope)
            {
                targetCarreras = targetCarreras.Any()
                    ? targetCarreras.Intersect(actorScope.AllowedCarreraIds).ToList()
                    : actorScope.AllowedCarreraIds.ToList();
            }

            // 2. Filtro por Modalidad y/o Carreras
            if (targetModalidades.Any())
            {
                var userIdsByModalidad = await ResolveUserIdsForModalidadesAndCarrerasAsync(targetModalidades, targetCarreras);
                if (!userIdsByModalidad.Any())
                    return new List<(string Email, int? UserId, string Name)>();

                usersQuery = usersQuery.Where(u => userIdsByModalidad.Contains(u.IdUsuario));
            }
            else if (targetCarreras.Any())
            {
                var carreraUserIds = await ResolveUserIdsForCarrerasAsync(targetCarreras);
                if (!carreraUserIds.Any())
                    return new List<(string Email, int? UserId, string Name)>();

                usersQuery = usersQuery.Where(u => carreraUserIds.Contains(u.IdUsuario));
            }

            // 3. Filtro por Estado de PEA (Borrador, Observado, EnRevision, RevisadoCoord, RevisadoAcad, Aprobado)
            if (!string.IsNullOrWhiteSpace(request.TargetPeaEstado))
            {
                var estado = request.TargetPeaEstado.Trim();
                var peaQuery = _context.Set<DocPea>().AsNoTracking()
                    .Where(p => p.Activo && p.Estado == estado);

                if (targetCarreras.Any())
                {
                    peaQuery = peaQuery.Where(p => targetCarreras.Contains(p.IdCarrera));
                }
                if (targetModalidades.Any())
                {
                    peaQuery = peaQuery.Where(p => p.IdModalidad.HasValue && targetModalidades.Contains(p.IdModalidad.Value));
                }
                if (!string.IsNullOrWhiteSpace(request.TargetPeriodoId))
                {
                    var periodoId = request.TargetPeriodoId.Trim();
                    peaQuery = peaQuery.Where(p => p.IdPeriodo == periodoId);
                }

                var peasMatch = await peaQuery
                    .Select(p => new { p.IdDocenteElaborador, p.IdDocenteColaborador, p.EstadoColaboracion })
                    .ToListAsync();

                var docenteRefs = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                foreach (var p in peasMatch)
                {
                    if (!string.IsNullOrWhiteSpace(p.IdDocenteElaborador))
                        docenteRefs.Add(p.IdDocenteElaborador.Trim());
                    if (!string.IsNullOrWhiteSpace(p.IdDocenteColaborador) &&
                        string.Equals(p.EstadoColaboracion, "Aprobada", StringComparison.OrdinalIgnoreCase))
                        docenteRefs.Add(p.IdDocenteColaborador.Trim());
                }

                if (!docenteRefs.Any())
                    return new List<(string Email, int? UserId, string Name)>();

                var refList = docenteRefs.ToList();
                var intRefs = refList.Select(r => int.TryParse(r, out var n) ? n : -1).Where(n => n > 0).ToList();

                usersQuery = usersQuery.Where(u => refList.Contains(u.IdSigafi) || intRefs.Contains(u.IdUsuario));
            }

            var list = await usersQuery.OrderBy(u => u.Nombre).ToListAsync();
            var resolved = new List<(string Email, int? UserId, string Name)>();
            foreach (var u in list)
            {
                var (email, name) = await ResolveRecipientFromUserAsync(u);
                if (!string.IsNullOrEmpty(email))
                    resolved.Add((email, u.IdUsuario, name));
            }

            return resolved
                .GroupBy(r => r.Email.ToLowerInvariant().Trim())
                .Select(g => g.First())
                .ToList();
        }

        private async Task<HashSet<int>> ResolveUserIdsForModalidadesAndCarrerasAsync(
            List<int> modalidadIds,
            List<int> filterCarreraIds)
        {
            var sigafiIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            // 1. Carreras institucionales asociadas a esas modalidades en SIGAFI (modalidades_carreras)
            var modCarrerasQuery = _context.ModalidadesCarreras.AsNoTracking()
                .Where(mc => modalidadIds.Contains(mc.IdModalidad) && (mc.EsActivo == null || mc.EsActivo == 1));

            if (filterCarreraIds.Any())
            {
                modCarrerasQuery = modCarrerasQuery.Where(mc => filterCarreraIds.Contains(mc.IdCarrera));
            }

            var carrerasDeModalidad = await modCarrerasQuery
                .Select(mc => mc.IdCarrera)
                .Distinct()
                .ToListAsync();

            // 2. Docentes con asignaciones activas directamente en esas modalidades (asignaciones_profesores)
            var asigQuery = _context.AsignacionesProfesores.AsNoTracking()
                .Where(a => a.Activo == 1 && modalidadIds.Contains(a.IdModalidad));

            if (filterCarreraIds.Any())
            {
                var nivelesPermitidos = await _context.Cursos.AsNoTracking()
                    .Where(c => filterCarreraIds.Contains(c.IdCarrera))
                    .Select(c => c.IdNivel)
                    .Distinct()
                    .ToListAsync();
                asigQuery = asigQuery.Where(a => nivelesPermitidos.Contains(a.IdNivel));
            }

            var profsPorModalidad = await asigQuery
                .Select(a => a.IdProfesor)
                .Distinct()
                .ToListAsync();
            foreach (var id in profsPorModalidad.Where(x => !string.IsNullOrWhiteSpace(x)))
                sigafiIds.Add(id.Trim());

            // 3. Docentes y autoridades pertenecientes a las carreras habilitadas en esas modalidades
            var userIds = new HashSet<int>();
            if (carrerasDeModalidad.Any())
            {
                var byCarrera = await ResolveUserIdsForCarrerasAsync(carrerasDeModalidad);
                foreach (var uid in byCarrera) userIds.Add(uid);
            }

            if (sigafiIds.Any())
            {
                var sigafiList = sigafiIds.ToList();
                var bySigafi = await _context.Users.AsNoTracking()
                    .Where(u => u.Activo && sigafiList.Contains(u.IdSigafi))
                    .Select(u => u.IdUsuario)
                    .ToListAsync();
                foreach (var uid in bySigafi) userIds.Add(uid);
            }

            return userIds;
        }

        private async Task<List<(string Email, int? UserId, string Name)>> ResolveRecipientsAsync(
            EmailSendRequest request,
            EmailEngineScopeDto? actorScope = null)
        {
            var recipientEmails = new List<(string Email, int? UserId, string Name)>();
            HashSet<int>? allowedUserIds = null;

            if (actorScope != null && !actorScope.IsGlobalScope)
            {
                allowedUserIds = await ResolveUserIdsForCarrerasAsync(actorScope.AllowedCarreraIds);
            }

            // Destinatarios explícitos por correo
            foreach (var rawEmail in request.DestinatariosEmails ?? Enumerable.Empty<string>())
            {
                var email = rawEmail?.Trim();
                if (string.IsNullOrEmpty(email) || !email.Contains('@')) continue;

                var user = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.EmailInstitucional == email);

                if (allowedUserIds != null && (user == null || !allowedUserIds.Contains(user.IdUsuario)))
                {
                    throw new UnauthorizedAccessException($"El destinatario '{email}' no pertenece a las carreras bajo su coordinación.");
                }

                var displayName = user?.Nombre;
                if (string.IsNullOrWhiteSpace(displayName))
                {
                    var localPart = email.Split('@')[0];
                    displayName = !string.IsNullOrEmpty(localPart)
                        ? char.ToUpper(localPart[0]) + (localPart.Length > 1 ? localPart[1..] : "")
                        : "Docente";
                }
                recipientEmails.Add((email, user?.IdUsuario, displayName));
            }

            // Destinatarios por IdUsuario
            foreach (var userId in request.DestinatariosUserIds ?? Enumerable.Empty<int>())
            {
                if (allowedUserIds != null && !allowedUserIds.Contains(userId))
                {
                    throw new UnauthorizedAccessException("Uno o más destinatarios seleccionados no pertenecen a las carreras bajo su coordinación.");
                }

                var user = await _context.Users.AsNoTracking()
                    .FirstOrDefaultAsync(u => u.IdUsuario == userId);
                if (user == null) continue;
                var (email, name) = await ResolveRecipientFromUserAsync(user);
                if (!string.IsNullOrEmpty(email))
                    recipientEmails.Add((email, user.IdUsuario, name));
            }

            // Destinatarios por Grupo (Modalidad, Carreras múltiples, Rol, Estado PEA)
            if (HasGroupCriteria(request))
            {
                var groupRecipients = await ResolveGroupRecipientsAsync(request, actorScope);
                recipientEmails.AddRange(groupRecipients);
            }

            return recipientEmails
                .GroupBy(r => r.Email.ToLowerInvariant().Trim())
                .Select(g => g.First())
                .ToList();
        }

        private async Task<Dictionary<string, string>> LoadDynamicContextReplacementsAsync(EmailSendRequest request)
        {
            var contextReplacements = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            if (string.IsNullOrWhiteSpace(request.EntityType) || string.IsNullOrWhiteSpace(request.EntityUuid))
            {
                return contextReplacements;
            }

            try
            {
                if (request.EntityType.Equals("PEA", StringComparison.OrdinalIgnoreCase) ||
                    request.EntityType.Equals("Proyecto", StringComparison.OrdinalIgnoreCase))
                {
                    var pea = await _context.Set<DocPea>().AsNoTracking()
                        .FirstOrDefaultAsync(p => p.Uuid == request.EntityUuid);

                    if (pea != null)
                    {
                        var asignatura = await _context.Asignaturas.AsNoTracking()
                            .FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura);
                        var carrera = await _context.Carreras.AsNoTracking()
                            .FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera);
                        var periodo = await _context.Periodos.AsNoTracking()
                            .FirstOrDefaultAsync(p => p.IdPeriodo == pea.IdPeriodo);

                        string nombreAsignatura = asignatura?.Asignatura1?.Trim() ?? $"Asignatura #{pea.IdAsignatura}";
                        string codigoAsignatura = asignatura?.Codigo?.Trim() ?? $"PEA-{pea.IdAsignatura}";
                        string nombreCarrera = carrera?.Carrera1?.Trim() ?? "Carrera Institucional";
                        string nombrePeriodo = !string.IsNullOrWhiteSpace(periodo?.Detalle)
                            ? periodo.Detalle.Trim()
                            : pea.IdPeriodo;

                        string nombreDocente = "Docente Elaborador";
                        string emailDocente = "";
                        if (!string.IsNullOrWhiteSpace(pea.IdDocenteElaborador))
                        {
                            var docenteUser = await _context.Users.AsNoTracking()
                                .FirstOrDefaultAsync(u => u.IdSigafi == pea.IdDocenteElaborador || u.IdUsuario.ToString() == pea.IdDocenteElaborador);
                            if (docenteUser != null)
                            {
                                var resolvedDoc = await ResolveRecipientFromUserAsync(docenteUser);
                                nombreDocente = resolvedDoc.Name;
                                emailDocente = resolvedDoc.Email ?? "";
                            }
                            else
                            {
                                var prof = await _context.Profesores.AsNoTracking()
                                    .FirstOrDefaultAsync(p => p.IdProfesor == pea.IdDocenteElaborador);
                                if (prof != null)
                                {
                                    nombreDocente = $"{prof.PrimerNombre} {prof.PrimerApellido}".Replace("  ", " ").Trim();
                                    emailDocente = (prof.EmailInstitucional ?? prof.Email ?? "").Trim();
                                }
                            }
                        }

                        var workspaceUrl = _appUrlService.BuildFrontendUrl($"/documentacion/workspace/PEA_OFICIAL/{pea.Uuid}");
                        var revisionUrl = _appUrlService.BuildFrontendUrl($"/documentacion/revision-tecnica/{pea.Uuid}");

                        contextReplacements["[[pea_asignatura]]"] = nombreAsignatura;
                        contextReplacements["[[pea_codigo]]"] = codigoAsignatura;
                        contextReplacements["[[pea_carrera]]"] = nombreCarrera;
                        contextReplacements["[[pea_periodo]]"] = nombrePeriodo;
                        contextReplacements["[[pea_nivel]]"] = pea.SemestreNivel ?? "No especificado";
                        contextReplacements["[[pea_modalidad]]"] = pea.Modalidad ?? "Presencial";
                        contextReplacements["[[pea_estado]]"] = pea.Estado;
                        contextReplacements["[[pea_docente]]"] = nombreDocente;
                        contextReplacements["[[pea_docente_email]]"] = emailDocente;
                        contextReplacements["[[pea_horas_totales]]"] = pea.TotalHorasAsignatura.ToString("0.##", CultureInfo.InvariantCulture);
                        contextReplacements["[[pea_creditos]]"] = pea.Creditos.ToString("0.##", CultureInfo.InvariantCulture);
                        contextReplacements["[[pea_workspace_url]]"] = workspaceUrl;
                        contextReplacements["[[pea_revision_url]]"] = revisionUrl;
                    }
                }
                else if (request.EntityType.Equals("Periodo", StringComparison.OrdinalIgnoreCase))
                {
                    var periodo = await _context.Periodos.AsNoTracking()
                        .FirstOrDefaultAsync(p => p.IdPeriodo == request.EntityUuid);

                    if (periodo != null)
                    {
                        var cultureEs = CultureInfo.GetCultureInfo("es-EC");
                        contextReplacements["[[periodo_codigo]]"] = periodo.IdPeriodo;
                        contextReplacements["[[periodo_nombre]]"] = !string.IsNullOrWhiteSpace(periodo.Detalle)
                            ? periodo.Detalle.Trim()
                            : periodo.IdPeriodo;
                        contextReplacements["[[periodo_fecha_inicio]]"] = periodo.FechaInicial.HasValue
                            ? periodo.FechaInicial.Value.ToString("dd 'de' MMMM 'de' yyyy", cultureEs)
                            : "Por definir";
                        contextReplacements["[[periodo_fecha_fin]]"] = periodo.FechaFinal.HasValue
                            ? periodo.FechaFinal.Value.ToString("dd 'de' MMMM 'de' yyyy", cultureEs)
                            : "Por definir";
                        contextReplacements["[[periodo_estado]]"] = (periodo.Activo == true && periodo.Cerrado != true)
                            ? "Activo"
                            : "Cerrado / Inactivo";
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al cargar variables de contexto dinámico para '{EntityType}' con identificador '{EntityUuid}'",
                    request.EntityType, request.EntityUuid);
            }

            return contextReplacements;
        }

        private async Task<List<object>> PrepareAttachmentsAsync(EmailSendRequest request)
        {
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
                else if (!string.IsNullOrEmpty(adj.RutaArchivo) &&
                         adj.RutaArchivo.StartsWith("SYSTEM:", StringComparison.OrdinalIgnoreCase))
                {
                    var templateCode = adj.RutaArchivo.Substring("SYSTEM:".Length).Trim();
                    var generatedMeta = await GenerateSystemPdfAttachmentAsync(templateCode, request, emailAttachmentsDir);
                    if (generatedMeta != null)
                    {
                        attachmentsMeta.Add(generatedMeta);
                    }
                }
                else if (!string.IsNullOrEmpty(adj.RutaArchivo))
                {
                    attachmentsMeta.Add(new { nombre = adj.NombreArchivo, ruta = adj.RutaArchivo });
                }
            }

            return attachmentsMeta;
        }

        private async Task<object?> GenerateSystemPdfAttachmentAsync(
            string templateCode,
            EmailSendRequest request,
            string emailAttachmentsDir)
        {
            if (string.IsNullOrWhiteSpace(request.EntityUuid))
            {
                _logger.LogWarning("Se solicitó adjunto del sistema '{TemplateCode}' sin EntityUuid vinculado.", templateCode);
                return null;
            }

            try
            {
                object? documentData = null;
                string suggestedName = $"{templateCode.ToLowerInvariant()}_oficial.pdf";

                if (templateCode.Equals("PEA_OFICIAL", StringComparison.OrdinalIgnoreCase))
                {
                    var peaService = _serviceProvider.GetService<IPeaService>();
                    if (peaService != null)
                    {
                        var peaDto = await peaService.GetByUuidAsync(request.EntityUuid);
                        if (peaDto != null)
                        {
                            documentData = peaDto;
                            var safeCode = SanitizeFileNameSegment(peaDto.CodigoAsignatura ?? peaDto.NombreAsignatura ?? "PEA");
                            suggestedName = $"PEA_{safeCode}.pdf";
                        }
                    }
                }

                if (documentData == null)
                {
                    _logger.LogWarning("No se encontró entidad '{EntityUuid}' para generar adjunto del sistema '{TemplateCode}'.",
                        request.EntityUuid, templateCode);
                    return null;
                }

                var docResult = await _documentEngine.GenerateAsync(new DocumentRequest
                {
                    TemplateCode = templateCode,
                    Data = documentData,
                    IsDraftMode = false,
                    RequestedBy = "Motor de Correos DOSIER",
                    EntityUuid = request.EntityUuid
                });

                var pdfBytes = docResult.PdfBytes;

                // Si se proveyó certificado PKCS#12 (.p12) y clave, firmar el PDF antes de adjuntarlo
                if (!string.IsNullOrWhiteSpace(request.CertificateBase64) && !string.IsNullOrWhiteSpace(request.SignaturePassword))
                {
                    var certBytes = Convert.FromBase64String(request.CertificateBase64);
                    pdfBytes = _firmaElectronicaService.SignPdf(
                        pdfBytes,
                        certBytes,
                        request.SignaturePassword,
                        "Envío Oficial Curricular — DOSIER ISTPET");
                }

                if (!Directory.Exists(emailAttachmentsDir)) Directory.CreateDirectory(emailAttachmentsDir);
                var physicalFileName = $"{Guid.NewGuid()}.pdf";
                var fullPath = Path.Combine(emailAttachmentsDir, physicalFileName);
                await File.WriteAllBytesAsync(fullPath, pdfBytes);

                var relativePath = Path.Combine("email_attachments", physicalFileName).Replace("\\", "/");
                _logger.LogInformation("Adjunto PDF autogenerado '{FileName}' guardado en '{Path}'.", suggestedName, relativePath);
                return new { nombre = suggestedName, ruta = relativePath };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al autogenerar adjunto PDF del sistema '{TemplateCode}' para '{EntityUuid}'.",
                    templateCode, request.EntityUuid);
                return null;
            }
        }

        private static string SanitizeFileNameSegment(string input)
        {
            var cleaned = new string(input.Where(c => char.IsLetterOrDigit(c) || c == '-' || c == '_').ToArray());
            return string.IsNullOrWhiteSpace(cleaned) ? "OFICIAL" : cleaned[..Math.Min(cleaned.Length, 40)];
        }

        private static string ReplaceTokens(string template, Dictionary<string, string> replacements)
        {
            if (string.IsNullOrEmpty(template)) return "";
            var result = template;
            foreach (var kvp in replacements)
            {
                result = result.Replace(kvp.Key, kvp.Value ?? "", StringComparison.OrdinalIgnoreCase);
            }
            return result;
        }

        private static Dictionary<string, string>? BuildExtraDataForLayout(Dictionary<string, string> replacements)
        {
            var skip = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                "[[destinatario_nombre]]", "[[destinatario_email]]", "[[anio_actual]]",
                "[[institucion_nombre]]", "[[sistema_url]]", "[[mensaje_adicional]]",
                "[[nombre_usuario]]", "[[descripcion_evento]]"
            };

            var rows = new Dictionary<string, string>();
            foreach (var kvp in replacements)
            {
                if (skip.Contains(kvp.Key)) continue;
                if (string.IsNullOrWhiteSpace(kvp.Value)) continue;
                if (kvp.Key.Contains("url", StringComparison.OrdinalIgnoreCase) && kvp.Value.StartsWith("http", StringComparison.OrdinalIgnoreCase)) continue;

                string label;
                if (ExtraDataLabels.TryGetValue(kvp.Key, out var mappedLabel))
                {
                    label = mappedLabel;
                }
                else
                {
                    label = kvp.Key.Replace("[[", "").Replace("]]", "").Replace("_", " ").Trim();
                    if (label.Length > 0)
                        label = char.ToUpper(label[0]) + label[1..];
                }

                if (!string.IsNullOrWhiteSpace(label))
                {
                    rows[label] = kvp.Value;
                }
            }

            return rows.Count > 0 ? rows : null;
        }

        private async Task<(string? Email, string Name)> ResolveRecipientFromUserAsync(User user)
        {
            var name = user.Nombre ?? "Docente";
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

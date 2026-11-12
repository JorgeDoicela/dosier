using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using System.Xml.Linq;
using dosier_application.Curriculum.Dtos;
using dosier_application.Curriculum.Interfaces;
using dosier_infrastructure.data.models;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas.Parser;
using iText.Kernel.Pdf.Canvas.Parser.Listener;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace dosier_infrastructure.Curriculum
{
    public class PeaAiAssistantService : IPeaAiAssistantService
    {
        private const string ProtectorPurpose = "Dosier.PeaAiAssistant.ApiKey.v1";
        private const string GlobalKeyClave = "AI_ASSISTANT_API_KEY";
        private const string GlobalProviderClave = "AI_ASSISTANT_PROVIDER";
        private const string GlobalModelClave = "AI_ASSISTANT_MODEL";
        private const string GlobalBaseUrlClave = "AI_ASSISTANT_BASE_URL";
        private const string GlobalReasoningEffortClave = "AI_ASSISTANT_REASONING_EFFORT";

        private readonly DosierContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IDataProtector _protector;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PeaAiAssistantService> _logger;

        public PeaAiAssistantService(
            DosierContext context,
            IHttpClientFactory httpClientFactory,
            IDataProtectionProvider dataProtectionProvider,
            IConfiguration configuration,
            ILogger<PeaAiAssistantService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _protector = dataProtectionProvider.CreateProtector(ProtectorPurpose);
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<PeaAiConfigStatusDto> GetConfigStatusAsync(int idUsuario, CancellationToken ct = default)
        {
            var (userKey, userProvider, userModel, userBaseUrl, userEffort) = await GetUserConfigAsync(idUsuario, ct);
            var (globalKey, globalProvider, globalModel, globalBaseUrl, globalEffort) = await GetGlobalConfigAsync(ct);

            string? envKey = _configuration["AiAssistant:ApiKey"]
                ?? _configuration["DeepSeek:ApiKey"]
                ?? _configuration["Gemini:ApiKey"]
                ?? _configuration["OpenAI:ApiKey"];
            string? effectiveKey = !string.IsNullOrWhiteSpace(userKey) ? userKey : (!string.IsNullOrWhiteSpace(globalKey) ? globalKey : envKey);
            string effectiveProvider = !string.IsNullOrWhiteSpace(userProvider)
                ? userProvider!
                : (!string.IsNullOrWhiteSpace(globalProvider) ? globalProvider! : (_configuration["AiAssistant:Provider"] ?? "deepseek"));

            string normalizedProvider = NormalizeProvider(effectiveProvider);
            string defaultModel = GetDefaultModelForProvider(normalizedProvider);
            string defaultBaseUrl = GetDefaultBaseUrlForProvider(normalizedProvider);

            string effectiveModel = !string.IsNullOrWhiteSpace(userModel)
                ? userModel!
                : (!string.IsNullOrWhiteSpace(globalModel) ? globalModel! : (_configuration["AiAssistant:Model"] ?? defaultModel));

            string? candidateBaseUrl = !string.IsNullOrWhiteSpace(userBaseUrl)
                ? userBaseUrl
                : (!string.IsNullOrWhiteSpace(globalBaseUrl) ? globalBaseUrl : _configuration["AiAssistant:BaseUrl"]);

            string effectiveBaseUrl = ResolveEffectiveBaseUrl(normalizedProvider, candidateBaseUrl, defaultBaseUrl);

            string effectiveEffort = !string.IsNullOrWhiteSpace(userEffort)
                ? userEffort!
                : (!string.IsNullOrWhiteSpace(globalEffort) ? globalEffort! : (_configuration["AiAssistant:ReasoningEffort"] ?? "medium"));

            bool isReady = !string.IsNullOrWhiteSpace(effectiveKey) || normalizedProvider.Equals("ollama", StringComparison.OrdinalIgnoreCase);

            return new PeaAiConfigStatusDto
            {
                HasUserApiKey = !string.IsNullOrWhiteSpace(userKey),
                HasGlobalApiKey = !string.IsNullOrWhiteSpace(globalKey) || !string.IsNullOrWhiteSpace(envKey),
                ActiveProvider = normalizedProvider,
                ActiveModel = effectiveModel,
                ActiveBaseUrl = effectiveBaseUrl,
                ActiveReasoningEffort = effectiveEffort,
                MaskedApiKey = MaskApiKey(effectiveKey),
                IsReady = isReady
            };
        }

        public async Task<PeaAiConfigStatusDto> SaveConfigAsync(
            int idUsuario,
            bool isAdmin,
            SavePeaAiConfigRequestDto request,
            CancellationToken ct = default)
        {
            string provider = NormalizeProvider(request.Provider);
            string defaultModel = GetDefaultModelForProvider(provider);
            string defaultBaseUrl = GetDefaultBaseUrlForProvider(provider);

            string model = string.IsNullOrWhiteSpace(request.Model) ? defaultModel : request.Model.Trim();
            string baseUrl = string.IsNullOrWhiteSpace(request.BaseUrl) ? defaultBaseUrl : request.BaseUrl.Trim();
            bool isGlobalScope = string.Equals(request.Scope, "global", StringComparison.OrdinalIgnoreCase);

            if (isGlobalScope)
            {
                if (!isAdmin)
                {
                    throw new UnauthorizedAccessException("Solo el administrador institucional puede modificar la configuración global de IA.");
                }

                await UpsertGlobalConfigAsync(GlobalProviderClave, provider, "Proveedor global de IA para asistencia curricular", ct);
                await UpsertGlobalConfigAsync(GlobalModelClave, model, "Modelo global de IA para asistencia curricular", ct);
                await UpsertGlobalConfigAsync(GlobalBaseUrlClave, baseUrl, "URL base del endpoint global de IA", ct);

                if (!string.IsNullOrWhiteSpace(request.ReasoningEffort))
                {
                    await UpsertGlobalConfigAsync(GlobalReasoningEffortClave, request.ReasoningEffort.Trim().ToLowerInvariant(), "Nivel de esfuerzo de razonamiento para modelos de IA compatibles (low, medium, high)", ct);
                }

                if (request.ApiKey != null)
                {
                    string trimmed = request.ApiKey.Trim();
                    string encrypted = string.IsNullOrEmpty(trimmed) ? string.Empty : _protector.Protect(trimmed);
                    await UpsertGlobalConfigAsync(GlobalKeyClave, encrypted, "API Key cifrada institucional de IA", ct);
                }

                await _context.SaveChangesAsync(ct);
            }
            else
            {
                var meta = await _context.DocUsuariosMetadata.FirstOrDefaultAsync(m => m.IdUsuario == idUsuario, ct);
                Dictionary<string, object?> dict = new();

                if (meta != null && !string.IsNullOrWhiteSpace(meta.Configuracion))
                {
                    try
                    {
                        dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(meta.Configuracion) ?? new();
                    }
                    catch
                    {
                        dict = new();
                    }
                }

                dict["ai_provider"] = provider;
                dict["ai_model"] = model;
                dict["ai_base_url"] = baseUrl;

                if (!string.IsNullOrWhiteSpace(request.ReasoningEffort))
                {
                    dict["ai_reasoning_effort"] = request.ReasoningEffort.Trim().ToLowerInvariant();
                }

                if (request.ApiKey != null)
                {
                    string trimmed = request.ApiKey.Trim();
                    dict["ai_api_key_protected"] = string.IsNullOrEmpty(trimmed) ? null : _protector.Protect(trimmed);
                }

                string serialized = JsonSerializer.Serialize(dict);

                if (meta == null)
                {
                    meta = new DocUsuarioMetadata
                    {
                        Uuid = Guid.NewGuid(),
                        IdUsuario = idUsuario,
                        Configuracion = serialized,
                        FechaRegistro = DateTime.UtcNow
                    };
                    _context.DocUsuariosMetadata.Add(meta);
                }
                else
                {
                    meta.Configuracion = serialized;
                }

                await _context.SaveChangesAsync(ct);
            }

            return await GetConfigStatusAsync(idUsuario, ct);
        }

        public async Task<PeaStructuredDraftDto> GenerateDraftAsync(
            string peaUuid,
            int idUsuario,
            GeneratePeaDraftRequestDto request,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(peaUuid))
            {
                throw new ArgumentException("Se requiere el identificador UUID del PEA o de la instancia documental.");
            }

            // 1. Resolver API Key, Proveedor, Modelo, BaseUrl y Esfuerzo de Razonamiento
            var (userKey, userProvider, userModel, userBaseUrl, userEffort) = await GetUserConfigAsync(idUsuario, ct);
            var (globalKey, globalProvider, globalModel, globalBaseUrl, globalEffort) = await GetGlobalConfigAsync(ct);
            string? envKey = _configuration["AiAssistant:ApiKey"]
                ?? _configuration["DeepSeek:ApiKey"]
                ?? _configuration["Gemini:ApiKey"]
                ?? _configuration["OpenAI:ApiKey"];

            string? apiKey = !string.IsNullOrWhiteSpace(request.ApiKeyOverride)
                ? request.ApiKeyOverride.Trim()
                : (!string.IsNullOrWhiteSpace(userKey) ? userKey : (!string.IsNullOrWhiteSpace(globalKey) ? globalKey : envKey));

            string provider = NormalizeProvider(
                !string.IsNullOrWhiteSpace(request.Provider) ? request.Provider :
                (!string.IsNullOrWhiteSpace(userProvider) ? userProvider :
                (!string.IsNullOrWhiteSpace(globalProvider) ? globalProvider : (_configuration["AiAssistant:Provider"] ?? "deepseek"))));

            if (string.IsNullOrWhiteSpace(apiKey) && !provider.Equals("ollama", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("No existe una API Key configurada para el asistente de IA. Configure su API Key antes de continuar.");
            }

            string defaultModel = GetDefaultModelForProvider(provider);
            string defaultBaseUrl = GetDefaultBaseUrlForProvider(provider);

            string model = !string.IsNullOrWhiteSpace(request.Model) ? request.Model.Trim() :
                           (!string.IsNullOrWhiteSpace(userModel) ? userModel! :
                           (!string.IsNullOrWhiteSpace(globalModel) ? globalModel! : (_configuration["AiAssistant:Model"] ?? defaultModel)));

            string? candidateBaseUrl = !string.IsNullOrWhiteSpace(request.BaseUrlOverride) ? request.BaseUrlOverride.Trim() :
                                       (!string.IsNullOrWhiteSpace(userBaseUrl) ? userBaseUrl :
                                       (!string.IsNullOrWhiteSpace(globalBaseUrl) ? globalBaseUrl :
                                       _configuration["AiAssistant:BaseUrl"]));

            string baseUrl = ResolveEffectiveBaseUrl(provider, candidateBaseUrl, defaultBaseUrl);

            string effectiveEffort = !string.IsNullOrWhiteSpace(request.ReasoningEffort)
                ? request.ReasoningEffort.Trim().ToLowerInvariant()
                : (!string.IsNullOrWhiteSpace(userEffort) ? userEffort! : (!string.IsNullOrWhiteSpace(globalEffort) ? globalEffort! : (_configuration["AiAssistant:ReasoningEffort"] ?? "medium")));

            // 2. Resolver Entidad PEA y su Contexto Institucional SIGAFI + Gobernanza
            var contextData = await ResolveAcademicContextAsync(peaUuid, request, ct);

            // 3. Resolver alcance de secciones solicitadas (única, múltiple o todo el PEA)
            var requestedSections = new List<string>();
            if (request.TargetSections != null && request.TargetSections.Count > 0)
            {
                requestedSections = request.TargetSections
                    .Select(s => s.Trim().ToLowerInvariant())
                    .Where(s => !string.IsNullOrWhiteSpace(s))
                    .Distinct()
                    .ToList();
            }
            else if (!string.IsNullOrWhiteSpace(request.TargetSection))
            {
                requestedSections = request.TargetSection
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(s => s.ToLowerInvariant())
                    .Distinct()
                    .ToList();
            }

            bool isAllSections = requestedSections.Count == 0 || requestedSections.Contains("all") || requestedSections.Count >= 9;
            string effectiveTargetSection = isAllSections ? "all" : string.Join(",", requestedSections);

            string systemPrompt = BuildSystemPrompt(contextData, requestedSections, isAllSections);
            string userPrompt = BuildUserPrompt(contextData, request, requestedSections, isAllSections);

            // 4. Invocar al proveedor LLM con Structured JSON (Gemini nativo, Anthropic nativo u OpenAI-Compatible universal)
            string rawJson;
            if (provider == "gemini" && string.IsNullOrWhiteSpace(request.BaseUrlOverride))
            {
                rawJson = await CallGeminiAsync(apiKey ?? string.Empty, model, systemPrompt, userPrompt, request.ConversationHistory, ct);
            }
            else if (provider == "anthropic" && (string.IsNullOrWhiteSpace(baseUrl) || baseUrl.Contains("api.anthropic.com/v1/messages", StringComparison.OrdinalIgnoreCase)))
            {
                rawJson = await CallAnthropicAsync(apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, request.ConversationHistory, ct);
            }
            else
            {
                rawJson = await CallOpenAiCompatibleAsync(provider, apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, effectiveEffort, request.ConversationHistory, ct);
            }

            // 5. Parsear, normalizar y cuadrar horas contra SIGAFI
            var draft = ParseAndNormalizeDraft(rawJson, contextData, provider, model, requestedSections, isAllSections, request);
            return draft;
        }

        private async Task<AcademicPromptContext> ResolveAcademicContextAsync(
            string uuidOrEntityUuid,
            GeneratePeaDraftRequestDto request,
            CancellationToken ct)
        {
            var pea = await _context.DocPeas
                .AsNoTracking()
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Evaluaciones)
                .Include(p => p.Bibliografias)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.Prerrequisitos)
                .FirstOrDefaultAsync(p => p.Uuid == uuidOrEntityUuid && p.Activo, ct);

            if (pea == null)
            {
                var docInstance = await _context.DocumentInstances
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Uuid == uuidOrEntityUuid, ct);

                if (docInstance != null && !string.IsNullOrWhiteSpace(docInstance.EntityUuid))
                {
                    pea = await _context.DocPeas
                        .AsNoTracking()
                        .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                        .Include(p => p.ActividadesPracticas)
                        .Include(p => p.Evaluaciones)
                        .Include(p => p.Bibliografias)
                        .Include(p => p.ResultadosAprendizaje)
                        .Include(p => p.Prerrequisitos)
                        .FirstOrDefaultAsync(p => p.Uuid == docInstance.EntityUuid && p.Activo, ct);
                }
            }

            if (pea == null)
            {
                throw new KeyNotFoundException($"No se encontró un PEA activo asociado al identificador {uuidOrEntityUuid}.");
            }

            var carrera = await _context.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera, ct);
            var asignatura = await _context.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura, ct);

            string? semestreNivel = pea.SemestreNivel;
            if (string.IsNullOrWhiteSpace(semestreNivel) && pea.IdNivel.HasValue)
            {
                var curso = await _context.Cursos.AsNoTracking().FirstOrDefaultAsync(c => c.IdNivel == pea.IdNivel, ct);
                semestreNivel = curso?.Nivel;
            }

            string modalidad = !string.IsNullOrWhiteSpace(pea.Modalidad) ? pea.Modalidad : "Presencial";
            string unidadOrg = !string.IsNullOrWhiteSpace(pea.UnidadOrganizacion) ? pea.UnidadOrganizacion : "Unidad Profesional";

            decimal totalHoras = pea.TotalHorasAsignatura;
            decimal horasCd = pea.HorasContactoDocente;
            decimal horasApe = pea.HorasPracticoExperimental;
            decimal horasTa = pea.HorasAutonomo;

            if (totalHoras <= 0 && pea.IdDetalleMalla.HasValue)
            {
                var detalle = await _context.DetalleMallas.AsNoTracking().FirstOrDefaultAsync(d => d.IdDetalleMalla == pea.IdDetalleMalla, ct);
                if (detalle != null)
                {
                    totalHoras = detalle.Horas ?? 0m;
                    horasCd = detalle.HorasDocente ?? 0m;
                    horasApe = detalle.HorasPracticoExperimental ?? 0m;
                    horasTa = Math.Max(0m, totalHoras - horasCd - horasApe);
                }
            }

            if (request.CurrentTotalHoras.HasValue && request.CurrentTotalHoras.Value > 0 && totalHoras <= 0)
            {
                totalHoras = request.CurrentTotalHoras.Value;
            }

            // Si el docente ya configuró en el editor una distribución explícita (CD > 0 o APE > 0) que cuadra con el total, respetarla
            if (request.CurrentHorasCD.HasValue && request.CurrentHorasAPE.HasValue && request.CurrentHorasTA.HasValue)
            {
                decimal reqCd = Math.Max(0m, request.CurrentHorasCD.Value);
                decimal reqApe = Math.Max(0m, request.CurrentHorasAPE.Value);
                decimal reqTa = Math.Max(0m, request.CurrentHorasTA.Value);
                if ((reqCd > 0 || reqApe > 0) && totalHoras > 0 && Math.Abs((reqCd + reqApe + reqTa) - totalHoras) < 0.01m)
                {
                    horasCd = reqCd;
                    horasApe = reqApe;
                    horasTa = reqTa;
                }
            }

            if (totalHoras <= 0)
            {
                horasCd = horasCd > 0 ? horasCd : 48m;
                horasApe = horasApe > 0 ? horasApe : 48m;
                horasTa = horasTa > 0 ? horasTa : 48m;
                totalHoras = horasCd + horasApe + horasTa;
            }
            else if (horasCd <= 0 || horasApe <= 0)
            {
                // En SIGAFI detallemallas muchas asignaturas solo registran el Total de Horas (ej. 144) con HorasDocente=0 y HorasAPE=0,
                // lo que dejaba 0 CD / 0 APE / 144 TA. Distribuimos equitativamente en los 3 componentes normativos (CD, APE, TA).
                decimal baseThird = Math.Floor((totalHoras / 3m) * 100m) / 100m;
                horasCd = baseThird;
                horasApe = baseThird;
                horasTa = totalHoras - horasCd - horasApe;
            }
            else if (Math.Abs((horasCd + horasApe + horasTa) - totalHoras) >= 0.01m)
            {
                horasTa = Math.Max(0m, totalHoras - horasCd - horasApe);
            }

            // Cargar prerrequisitos oficiales de la malla curricular en SIGAFI si existen
            var sigafiPrerrequisitos = new List<string>();
            if (pea.IdDetalleMalla.HasValue)
            {
                var prereqIds = await _context.Prerequisitos
                    .AsNoTracking()
                    .Where(p => p.IdDetalleMalla == pea.IdDetalleMalla.Value && p.Activa == 1)
                    .Select(p => p.IdAsignatura)
                    .Distinct()
                    .ToListAsync(ct);

                if (prereqIds.Count > 0)
                {
                    sigafiPrerrequisitos = await _context.Asignaturas
                        .AsNoTracking()
                        .Where(a => prereqIds.Contains(a.IdAsignatura) && a.Asignatura1 != null)
                        .Select(a => a.Asignatura1!)
                        .ToListAsync(ct);
                }
            }

            // Cargar RDAs oficiales del Perfil de Egreso de la carrera si existen
            var rdasPerfil = await _context.DocPerfilesEgreso
                .AsNoTracking()
                .Where(pe => pe.IdCarrera == pea.IdCarrera && pe.Activo)
                .SelectMany(pe => pe.Resultados)
                .OrderBy(r => r.Orden)
                .Select(r => $"{r.Codigo}: {r.Descripcion}")
                .ToListAsync(ct);

            var modeloEducativo = await _context.DocModelosEducativos
                .AsNoTracking()
                .Where(m => m.Activo)
                .OrderByDescending(m => m.FechaVigenciaDesde)
                .Select(m => m.Descripcion)
                .FirstOrDefaultAsync(ct);

            string rdaCarreraDb = string.Join("\n\n", pea.ResultadosAprendizaje
                .Where(r => string.Equals(r.TipoRda, "Carrera", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(r.Descripcion))
                .OrderBy(r => r.Orden)
                .Select(r => r.Descripcion!.Trim()));

            string rdaAsigDb = string.Join("\n", pea.ResultadosAprendizaje
                .Where(r => !string.Equals(r.TipoRda, "Carrera", StringComparison.OrdinalIgnoreCase) && !string.IsNullOrWhiteSpace(r.Descripcion))
                .OrderBy(r => r.Orden)
                .Select(r => r.Descripcion!.Trim())
                .Where(d => !System.Text.RegularExpressions.Regex.IsMatch(d, @"^rda\s*[-#]?\s*\d*\s*:?$", System.Text.RegularExpressions.RegexOptions.IgnoreCase)));

            return new AcademicPromptContext
            {
                PeaUuid = pea.Uuid,
                NombreAsignatura = asignatura?.Asignatura1 ?? "Asignatura Curricular",
                CodigoAsignatura = asignatura?.Codigo ?? "S/C",
                NombreCarrera = carrera?.Carrera1 ?? "Tecnología Superior ISTPET",
                SemestreNivel = semestreNivel ?? "Nivel Curricular",
                Modalidad = modalidad,
                UnidadOrganizacion = unidadOrg,
                HorasCD = horasCd,
                HorasAPE = horasApe,
                HorasTA = horasTa,
                TotalHoras = totalHoras,
                SigafiPrerequisites = sigafiPrerrequisitos,
                RdasPerfilEgreso = rdasPerfil,
                ModeloEducativoResumen = modeloEducativo,
                ExistingObjetivo = pea.ObjetivoAsignatura,
                ExistingRdaCarrera = rdaCarreraDb,
                ExistingResultadosAprendizaje = rdaAsigDb,
                ExistingMetodologia = pea.MetodologiaEnsenanza,
                ExistingRecursos = pea.RecursosDidacticos,
                ExistingPrerequisites = pea.Prerrequisitos.Select(p => new PeaDraftPrerrequisitoDto
                {
                    Asignatura = p.NombreAsignatura ?? string.Empty,
                    Observacion = p.Observacion ?? string.Empty
                }).ToList(),
                ExistingUnits = pea.Unidades.OrderBy(u => u.Orden).Select(u => new PeaDraftUnidadDto
                {
                    Num = u.NumeroUnidad,
                    Titulo = u.NombreUnidad,
                    Contenidos = string.Join("\n", u.Temas.OrderBy(t => t.Orden).Select(t => t.DescripcionSubtemas)),
                    HorasCD = u.HorasDocencia,
                    HorasAPE = u.HorasPracticoExp,
                    HorasTA = u.HorasAutonomo
                }).ToList(),
                ExistingPractices = pea.ActividadesPracticas.OrderBy(p => p.Orden).Select(p => new PeaDraftActividadPracticaDto
                {
                    Unidad = p.NumeroPractica,
                    Nombre = p.NombrePractica ?? string.Empty,
                    Caracterizacion = p.Caracterizacion ?? string.Empty,
                    Horas = p.DuracionHoras
                }).ToList(),
                ExistingEvaluations = pea.Evaluaciones.Select(e => new PeaDraftEvaluacionDto
                {
                    Nota = e.Denominacion ?? string.Empty,
                    Tipo = e.TipoEvaluacion ?? string.Empty,
                    Calificacion = e.CalificacionMaxima
                }).ToList(),
                ExistingBibliographies = pea.Bibliografias.OrderBy(b => b.Orden).Select(b => new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = b.TipoBibliografia ?? "Basica",
                    Autor = b.Autor ?? string.Empty,
                    TituloLibro = b.TituloLibro ?? string.Empty,
                    EditorialCiudad = b.EditorialCiudad ?? string.Empty,
                    CitaCompletaApa = b.CitaCompletaApa ?? string.Empty
                }).ToList()
            };
        }

        private static string GetFriendlySectionName(string? secId) => (secId ?? string.Empty).Trim().ToLowerInvariant() switch
        {
            "pea_objectives_section" => "2. Objetivo de la Asignatura",
            "pea_prerequisites_section" => "3. Prerrequisitos Curriculares",
            "pea_career_outcomes_section" => "4. RDA de Carrera (Perfil de Egreso)",
            "pea_subject_outcomes_section" => "5. RDA de la Asignatura",
            "pea_contents_section" => "6. Contenidos de Enseñanza (Unidades)",
            "pea_methodology_section" => "7. Metodología y Recursos Didácticos",
            "pea_resources_section" => "8. Actividades Prácticas y Experimentales",
            "pea_evaluation_section" => "9. Sistema de Evaluación Curricular",
            "pea_bibliography_section" => "10. Bibliografía APA 7ma",
            _ => secId ?? string.Empty
        };

        private static string BuildSystemPrompt(AcademicPromptContext ctx, List<string> requestedSections, bool isAllSections)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Eres un especialista senior en diseño curricular de Educación Superior Tecnológica del Ecuador (normativa CES, CACES e ISTPET).");
            sb.AppendLine("Tu tarea es estructurar con rigor técnico y académico el Programa de Estudio de la Asignatura (PEA).");
            sb.AppendLine("Debes responder EXCLUSIVAMENTE con un objeto JSON válido que cumpla exactamente la estructura solicitada, sin bloques markdown adicionales ni texto fuera del JSON.");
            sb.AppendLine();
            sb.AppendLine("CONTEXTO DE REFERENCIA DE SIGAFI (SOLO LECTURA — NO MODIFICAR NI REPETIR COMO FICHA EN LOS TEXTOS):");
            sb.AppendLine($"- Carrera: {ctx.NombreCarrera}");
            sb.AppendLine($"- Asignatura: {ctx.NombreAsignatura} ({ctx.CodigoAsignatura})");
            sb.AppendLine($"- Nivel / Semestre: {ctx.SemestreNivel}");
            sb.AppendLine($"- Unidad de Organización Curricular: {ctx.UnidadOrganizacion}");
            sb.AppendLine($"- Modalidad: {ctx.Modalidad}");
            sb.AppendLine($"- Horas Contacto Docente (CD) a distribuir: {ctx.HorasCD}");
            sb.AppendLine($"- Horas Práctico-Experimental (APE) a distribuir: {ctx.HorasAPE}");
            sb.AppendLine($"- Horas Aprendizaje Autónomo (TA) a distribuir: {ctx.HorasTA}");
            sb.AppendLine($"- TOTAL HORAS ASIGNATURA: {ctx.TotalHoras}");

            if (ctx.SigafiPrerequisites.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("PRERREQUISITOS OFICIALES EN MALLA SIGAFI:");
                foreach (var p in ctx.SigafiPrerequisites)
                {
                    sb.AppendLine($"- {p}");
                }
            }

            if (ctx.RdasPerfilEgreso.Count > 0)
            {
                sb.AppendLine();
                sb.AppendLine("RESULTADOS DE APRENDIZAJE DEL PERFIL DE EGRESO DE LA CARRERA:");
                foreach (var rda in ctx.RdasPerfilEgreso.Take(8))
                {
                    sb.AppendLine($"- {rda}");
                }
            }

            if (!string.IsNullOrWhiteSpace(ctx.ModeloEducativoResumen))
            {
                sb.AppendLine();
                sb.AppendLine($"MODELO EDUCATIVO INSTITUCIONAL: {ctx.ModeloEducativoResumen}");
            }

            sb.AppendLine();
            sb.AppendLine("REGLAS OBLIGATORIAS DE FORMATO Y CALIDAD:");
            sb.AppendLine("1. DATOS GENERALES DE SOLO CONTEXTO: Los campos de la Sección 1 (nombre de asignatura, código, carrera, modalidad, unidad de organización curricular, periodo académico, semestre, total de horas y créditos) están BLOQUEADOS en SIGAFI. Úsalos EXCLUSIVAMENTE como contexto pedagógico orientativo. Queda estrictamente PROHIBIDO generar contenido para estos campos, modificarlos, o redactar encabezados o tablas de datos generales dentro de las demás secciones.");
            sb.AppendLine("2. Los campos 'objetivo_asignatura', 'rda_carrera', 'resultados_aprendizaje', 'metodologia_ensenanza', 'recursos_didacticos', 'bibliografia_basica' y 'bibliografia_consulta' deben entregarse en HTML semántico limpio (<p>, <ul>, <li>, <strong>). Queda estrictamente PROHIBIDO duplicar o incluir el encabezado/título de la sección dentro del texto (ej. en 'recursos_didacticos' no escribas 'RECURSOS DIDÁCTICOS:', en 'metodologia_ensenanza' no escribas 'ESTRATEGIAS METODOLÓGICAS:'); redacta directamente el contenido pedagógico.");
            sb.AppendLine("3. En 'prerrequisitos':");
            sb.AppendLine("   - PRIORIDAD DEL DOCENTE: Si el docente solicita o instruye sobre prerrequisitos (ej. 'si quiero un prerrequisito', 'agrega prerrequisito', o especifica una materia previa), estás OBLIGADO a formular de forma profesional la o las asignaturas formativas o propedéuticas idóneas y coherentes con la carrera (ej. para software: 'Lógica Computacional y Algoritmos', 'Fundamentos de Programación'; para gastronomía: 'Bases Culinarias y Bioseguridad', etc.) con su debida observación pedagógica. En este caso queda TERMINANTEMENTE PROHIBIDO responder con 'No registra prerrequisitos'.");
            sb.AppendLine("   - MALLA OFICIAL: Si la asignatura tiene materias previas registradas en la malla SIGAFI, incorpóralas.");
            sb.AppendLine("   - NIVEL INICIAL SIN SOLICITUD: ÚNICAMENTE cuando la asignatura sea de primer semestre, no tenga materias previas en la malla SIGAFI Y el docente NO haya solicitado ni mencionado prerrequisitos en sus instrucciones ni en la conversación, genera un único elemento con 'asignatura': 'No registra prerrequisitos (Nivel inicial)' y 'observacion': 'Asignatura correspondiente al primer período académico sin prerrequisito formal en malla'. NUNCA generes elementos con cadenas vacías.");
            sb.AppendLine("4. En 'unidades', genera unidades temáticas coherentes (por defecto 4, a menos que el docente solicite expresamente otra cantidad en sus instrucciones). En 'titulo' escribe SOLO el nombre temático de la unidad (sin el prefijo 'Unidad 1:'). La suma de 'horas_cd' de todas las unidades DEBE ser exactamente " + ctx.HorasCD + " (> 0 en cada unidad). La suma de 'horas_ape' DEBE ser exactamente " + ctx.HorasAPE + " (> 0 en cada unidad). La suma de 'horas_ta' DEBE ser exactamente " + ctx.HorasTA + " (> 0 en cada unidad). NUNCA dejes componentes de horas en cero.");
            sb.AppendLine("5. En cada unidad, el campo 'contenidos' debe listar los temas y subtemas numerados separados por saltos de línea (ej: '1.1 Conceptos fundamentales\\n1.2 Técnicas aplicadas\\n1.3 Procesos experimentales').");
            sb.AppendLine("6. En 'actividades_practicas', genera al menos 1 práctica experimental por cada unidad temática, especificando unidad (número), nombre descriptivo de la práctica, horas, escenario (taller/laboratorio/cocina experimental) y producto verificable.");
            sb.AppendLine("7. En 'evaluaciones', incluye los 4 componentes normativos sobre 10 puntos (Gestión Formativa / Docencia, Gestión Práctica y Experimental, Trabajo Autónomo, Evaluación Sumativa).");
            sb.AppendLine("8. En 'bibliografias', incluye al menos 3 obras de tipo 'Basica' y 3 de tipo 'Consulta' reales y vigentes en formato APA 7ma edición.");
            
            if (isAllSections)
            {
                sb.AppendLine("9. ALCANCE: Todo el PEA oficial (secciones 2 a 10 completas). Formula todas las secciones curriculares requeridas.");
            }
            else
            {
                var sectionNames = requestedSections.Select(GetFriendlySectionName);
                sb.AppendLine($"9. ALCANCE ESPECÍFICO SELECCIONADO: El docente solicitó formular ÚNICAMENTE las siguientes {requestedSections.Count} sección(es): {string.Join(", ", sectionNames)}.");
                sb.AppendLine("Debes enfocar tu respuesta exclusivamente en estas secciones solicitadas. Para las claves JSON que no correspondan a estas secciones, devuelve null o un arreglo vacío [].");
            }

            sb.AppendLine("10. PRIORIDAD ABSOLUTA DE LAS DIRECTRICES DEL DOCENTE: Las instrucciones del docente ('INSTRUCCIONES ESPECÍFICAS DEL DOCENTE' y su conversación histórica) tienen máxima prioridad pedagógica y anulan cualquier valor por defecto o inferencia inicial. Si el docente solicita prerrequisitos, cambios de enfoque, tecnologías específicas, más o menos unidades, o cualquier ajuste particular, debes acatarlo con rigor profesional y diseñar el contenido curricular solicitado adaptando coherentemente cada sección.");
            sb.AppendLine("11. ESTADO ACTUAL Y REFINAMIENTO ITERATIVO: Si se proporciona una sección 'ESTADO ACTUAL DEL DOCUMENTO EN EL EDITOR (TRABAJO PREVIO DEL DOCENTE)', contiene lo que el docente ya ha redactado o configurado en la interfaz. Cuando el docente solicite mejoras, ajustes, correcciones, adiciones o adaptaciones (ej. 'mejora el objetivo', 'añade una práctica', 'haz la bibliografía más reciente', 'ajusta las horas'), debes tomar dicho contenido previo como base obligatoria y refinarlo armónicamente, respetando y preservando el trabajo y decisiones ya tomadas por el docente, en lugar de descartarlo o sustituirlo con contenido no relacionado, salvo que el docente pida expresamente rehacerlo desde cero o cambiar de enfoque.");

            return sb.ToString();
        }

        private static string BuildUserPrompt(AcademicPromptContext ctx, GeneratePeaDraftRequestDto request, List<string> requestedSections, bool isAllSections)
        {
            var sb = new StringBuilder();
            if (isAllSections)
            {
                sb.AppendLine($"Genera el contenido curricular estructurado para todo el PEA oficial de la asignatura '{ctx.NombreAsignatura}' de la carrera '{ctx.NombreCarrera}'.");
            }
            else
            {
                var names = requestedSections.Select(GetFriendlySectionName);
                sb.AppendLine($"Genera el contenido curricular estructurado para las siguientes secciones seleccionadas ({string.Join(", ", names)}) de la asignatura '{ctx.NombreAsignatura}' de la carrera '{ctx.NombreCarrera}'.");
            }

            var referenceUnits = (request.CurrentUnidades != null && request.CurrentUnidades.Count > 0)
                ? request.CurrentUnidades
                : ctx.ExistingUnits;

            // ── Inyección del Estado Actual del Documento en el Editor (Editor State Awareness) ──
            var editorState = new StringBuilder();

            if (!string.IsNullOrWhiteSpace(request.CurrentObjetivo))
            {
                editorState.AppendLine($"- Objetivo Actual: {request.CurrentObjetivo.Trim()}");
            }

            if (request.CurrentPrerrequisitos != null && request.CurrentPrerrequisitos.Count > 0)
            {
                editorState.AppendLine("- Prerrequisitos Actuales:");
                foreach (var p in request.CurrentPrerrequisitos)
                {
                    editorState.AppendLine($"  * {p.Asignatura} ({p.Observacion})");
                }
            }

            if (!string.IsNullOrWhiteSpace(request.CurrentRdaCarrera))
            {
                editorState.AppendLine($"- RDA Carrera Actuales: {request.CurrentRdaCarrera.Trim()}");
            }

            if (!string.IsNullOrWhiteSpace(request.CurrentResultadosAprendizaje))
            {
                editorState.AppendLine($"- Resultados de Aprendizaje de la Asignatura Actuales: {request.CurrentResultadosAprendizaje.Trim()}");
            }

            if (referenceUnits.Count > 0)
            {
                editorState.AppendLine("- Unidades Temáticas Actuales:");
                foreach (var u in referenceUnits)
                {
                    editorState.AppendLine($"  * Unidad {u.Num}: {u.Titulo} | Horas CD:{u.HorasCD} APE:{u.HorasAPE} TA:{u.HorasTA} | Contenidos: {u.Contenidos}");
                }
            }

            if (!string.IsNullOrWhiteSpace(request.CurrentMetodologiaEnsenanza))
            {
                editorState.AppendLine($"- Metodología Actual: {request.CurrentMetodologiaEnsenanza.Trim()}");
            }

            if (!string.IsNullOrWhiteSpace(request.CurrentRecursosDidacticos))
            {
                editorState.AppendLine($"- Recursos Didácticos Actuales: {request.CurrentRecursosDidacticos.Trim()}");
            }

            if (request.CurrentActividadesPracticas != null && request.CurrentActividadesPracticas.Count > 0)
            {
                editorState.AppendLine("- Actividades Prácticas Actuales:");
                foreach (var ap in request.CurrentActividadesPracticas)
                {
                    editorState.AppendLine($"  * Unidad {ap.Unidad}: {ap.Nombre} ({ap.Horas}h, Escenario: {ap.Escenario}, Producto: {ap.Producto})");
                }
            }

            if (request.CurrentEvaluaciones != null && request.CurrentEvaluaciones.Count > 0)
            {
                editorState.AppendLine("- Evaluaciones Actuales:");
                foreach (var ev in request.CurrentEvaluaciones)
                {
                    editorState.AppendLine($"  * {ev.Nota} | {ev.Tipo} ({ev.Calificacion} pts)");
                }
            }

            if (request.CurrentBibliografias != null && request.CurrentBibliografias.Count > 0)
            {
                editorState.AppendLine("- Bibliografías Actuales:");
                foreach (var b in request.CurrentBibliografias)
                {
                    editorState.AppendLine($"  * [{b.TipoBibliografia}] {(!string.IsNullOrWhiteSpace(b.CitaCompletaApa) ? b.CitaCompletaApa : $"{b.Autor}. {b.TituloLibro}.")}");
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.CurrentBibliografiaBasica) || !string.IsNullOrWhiteSpace(request.CurrentBibliografiaConsulta))
            {
                if (!string.IsNullOrWhiteSpace(request.CurrentBibliografiaBasica))
                    editorState.AppendLine($"- Bibliografía Básica Actual: {request.CurrentBibliografiaBasica.Trim()}");
                if (!string.IsNullOrWhiteSpace(request.CurrentBibliografiaConsulta))
                    editorState.AppendLine($"- Bibliografía Consulta Actual: {request.CurrentBibliografiaConsulta.Trim()}");
            }

            if (editorState.Length > 0)
            {
                sb.AppendLine();
                sb.AppendLine("ESTADO ACTUAL DEL DOCUMENTO EN EL EDITOR (TRABAJO PREVIO DEL DOCENTE):");
                sb.Append(editorState.ToString());
            }

            if (!string.IsNullOrWhiteSpace(request.CustomInstructions))
            {
                sb.AppendLine();
                sb.AppendLine("INSTRUCCIONES Y REQUERIMIENTOS ESPECÍFICOS DEL DOCENTE (PRIORIDAD ABSOLUTA):");
                sb.AppendLine($"> \"{request.CustomInstructions.Trim()}\"");
                sb.AppendLine("Cumple estrictamente con los requerimientos, contenidos, enfoques o prerrequisitos indicados por el docente.");
            }

            sb.AppendLine();
            sb.AppendLine(BuildJsonSchemaInstruction());

            return sb.ToString();
        }

        private static string BuildJsonSchemaInstruction()
        {
            return @"Devuelve un único objeto JSON con esta estructura exacta de claves:
{
  ""objetivo_asignatura"": ""<p>Verbo en infinitivo + objeto + finalidad + contexto...</p>"",
  ""rda_carrera"": ""<ul><li>Resultado de aprendizaje de carrera...</li></ul>"",
  ""resultados_aprendizaje"": ""<ul><li><strong>RDA 1:</strong> ...</li></ul>"",
  ""metodologia_ensenanza"": ""<p>Estrategias metodológicas activas...</p><ul><li>...</li></ul>"",
  ""recursos_didacticos"": ""<p>Entornos, laboratorios y herramientas...</p><ul><li>...</li></ul>"",
  ""prerrequisitos"": [
    { ""asignatura"": ""Nombre materia previa"", ""observacion"": ""Fundamento requerido"" }
  ],
  ""unidades"": [
    {
      ""num"": 1,
      ""titulo"": ""Título de la Unidad 1"",
      ""contenidos"": ""1.1 Subtema A\n1.2 Subtema B\n1.3 Subtema C"",
      ""horas_cd"": 16,
      ""horas_ape"": 12,
      ""horas_ta"": 16
    }
  ],
  ""actividades_practicas"": [
    {
      ""unidad"": 1,
      ""nombre"": ""Práctica 1: ..."",
      ""horas"": 4,
      ""escenario"": ""Laboratorio especializado"",
      ""producto"": ""Informe técnico y prototipo funcional"",
      ""caracterizacion"": ""Laboratorio especializado | Informe técnico y prototipo funcional""
    }
  ],
  ""evaluaciones"": [
    { ""nota"": ""Actividades de Aprendizaje en Contacto con el Docente"", ""tipo"": ""Evaluación Formativa y Continua"", ""calificacion"": 10 },
    { ""nota"": ""Aplicación y Experimentación de los Aprendizajes (APE)"", ""tipo"": ""Rúbrica de Informes y Prácticas de Laboratorio"", ""calificacion"": 10 },
    { ""nota"": ""Trabajo Autónomo e Investigación"", ""tipo"": ""Control de Lectura y Proyectos"", ""calificacion"": 10 },
    { ""nota"": ""Evaluación Sumativa Parcial / Final"", ""tipo"": ""Reactivos Teórico-Prácticos"", ""calificacion"": 10 }
  ],
  ""bibliografias"": [
    {
      ""tipo_bibliografia"": ""Basica"",
      ""autor"": ""Apellido, N."",
      ""titulo_libro"": ""Título del libro"",
      ""editorial_ciudad"": ""Editorial"",
      ""cita_completa_apa"": ""Apellido, N. (2023). Título del libro (2da ed.). Editorial.""
    }
  ]
}";
        }

        private async Task<string> CallGeminiAsync(
            string apiKey,
            string model,
            string systemPrompt,
            string userPrompt,
            List<PeaAiChatMessageDto>? history,
            CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(90);

            string cleanModel = model.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
                ? model.Substring("models/".Length)
                : model;

            string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{cleanModel}:generateContent?key={Uri.EscapeDataString(apiKey)}";

            var contentsList = new List<object>();
            if (history != null && history.Count > 0)
            {
                foreach (var h in history.TakeLast(6))
                {
                    if (string.IsNullOrWhiteSpace(h.Content)) continue;
                    string geminiRole = h.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "model" : "user";
                    contentsList.Add(new
                    {
                        role = geminiRole,
                        parts = new[] { new { text = h.Content.Trim() } }
                    });
                }
            }
            contentsList.Add(new
            {
                role = "user",
                parts = new[] { new { text = userPrompt } }
            });

            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = contentsList,
                generationConfig = new
                {
                    temperature = 0.35,
                    responseMimeType = "application/json"
                }
            };

            string jsonPayload = JsonSerializer.Serialize(payload);
            using var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            using var response = await client.PostAsync(endpoint, content, ct);
            string responseBody = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[DOSIER AI] Error de proveedor Gemini ({StatusCode}): {Body}", (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El proveedor Gemini rechazó la solicitud (HTTP {(int)response.StatusCode}). Verifique su API Key o cuota disponible.");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("candidates", out var candidates) &&
                candidates.ValueKind == JsonValueKind.Array &&
                candidates.GetArrayLength() > 0)
            {
                var first = candidates[0];
                if (first.TryGetProperty("content", out var contentEl) &&
                    contentEl.TryGetProperty("parts", out var partsEl) &&
                    partsEl.ValueKind == JsonValueKind.Array &&
                    partsEl.GetArrayLength() > 0)
                {
                    var textEl = partsEl[0];
                    if (textEl.TryGetProperty("text", out var txt))
                    {
                        return CleanJsonFence(txt.GetString() ?? "{}");
                    }
                }
            }

            throw new InvalidOperationException("El modelo Gemini no devolvió un contenido JSON válido.");
        }

        private async Task<string> CallAnthropicAsync(
            string apiKey,
            string model,
            string baseUrl,
            string systemPrompt,
            string userPrompt,
            List<PeaAiChatMessageDto>? history,
            CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(120);

            string endpoint = string.IsNullOrWhiteSpace(baseUrl) || !baseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase)
                ? "https://api.anthropic.com/v1/messages"
                : baseUrl.Trim();

            using var req = new HttpRequestMessage(HttpMethod.Post, endpoint);
            req.Headers.TryAddWithoutValidation("x-api-key", apiKey);
            req.Headers.TryAddWithoutValidation("anthropic-version", "2023-06-01");

            var messagesList = new List<object>();
            if (history != null && history.Count > 0)
            {
                foreach (var h in history.TakeLast(6))
                {
                    if (string.IsNullOrWhiteSpace(h.Content)) continue;
                    string role = h.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "assistant" : "user";
                    messagesList.Add(new { role = role, content = h.Content.Trim() });
                }
            }
            messagesList.Add(new { role = "user", content = userPrompt });

            var payload = new
            {
                model = model,
                max_tokens = 8192,
                temperature = 0.35,
                system = systemPrompt,
                messages = messagesList
            };

            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var response = await client.SendAsync(req, ct);
            string responseBody = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[DOSIER AI] Error de proveedor Anthropic ({StatusCode}): {Body}", (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El proveedor Anthropic rechazó la solicitud (HTTP {(int)response.StatusCode}). Verifique su API Key o modelo seleccionado.");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("content", out var contentArr) &&
                contentArr.ValueKind == JsonValueKind.Array &&
                contentArr.GetArrayLength() > 0)
            {
                var first = contentArr[0];
                if (first.TryGetProperty("text", out var txt))
                {
                    return CleanJsonFence(txt.GetString() ?? "{}");
                }
            }

            throw new InvalidOperationException("El modelo Anthropic no devolvió un contenido JSON válido.");
        }

        private async Task<string> CallOpenAiCompatibleAsync(
            string provider,
            string apiKey,
            string model,
            string baseUrl,
            string systemPrompt,
            string userPrompt,
            string? reasoningEffort,
            List<PeaAiChatMessageDto>? history,
            CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(120);

            string rawUrl = string.IsNullOrWhiteSpace(baseUrl)
                ? GetDefaultBaseUrlForProvider(provider)
                : baseUrl.Trim();

            string effectiveUrl = NormalizeOpenAiEndpointUrl(rawUrl);

            bool isReasoner = model.Contains("reasoner", StringComparison.OrdinalIgnoreCase)
                || model.Contains("r1", StringComparison.OrdinalIgnoreCase)
                || model.StartsWith("o1", StringComparison.OrdinalIgnoreCase)
                || model.StartsWith("o3", StringComparison.OrdinalIgnoreCase);

            bool isOpenAiReasoningModel = model.StartsWith("o1", StringComparison.OrdinalIgnoreCase)
                || model.StartsWith("o3", StringComparison.OrdinalIgnoreCase);

            var messagesList = new List<object>
            {
                new { role = "system", content = systemPrompt }
            };

            if (history != null && history.Count > 0)
            {
                foreach (var h in history.TakeLast(6))
                {
                    if (string.IsNullOrWhiteSpace(h.Content)) continue;
                    string role = h.Role.Equals("assistant", StringComparison.OrdinalIgnoreCase) ? "assistant" : "user";
                    messagesList.Add(new { role = role, content = h.Content.Trim() });
                }
            }

            messagesList.Add(new { role = "user", content = userPrompt });

            async Task<HttpResponseMessage> SendRequestAsync(bool minimalMode)
            {
                var req = new HttpRequestMessage(HttpMethod.Post, effectiveUrl);
                if (!string.IsNullOrWhiteSpace(apiKey))
                {
                    req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
                }

                if (provider.Equals("openrouter", StringComparison.OrdinalIgnoreCase))
                {
                    req.Headers.TryAddWithoutValidation("HTTP-Referer", "https://dosier.istpet.edu.ec");
                    req.Headers.TryAddWithoutValidation("X-Title", "DOSIER ISTPET Curriculum Assistant");
                }

                var payloadDict = new Dictionary<string, object?>
                {
                    ["model"] = model,
                    ["messages"] = messagesList
                };

                if (isReasoner || minimalMode)
                {
                    // Si es modelo OpenAI de razonamiento configurable (o1, o3-mini)
                    if (isOpenAiReasoningModel)
                    {
                        string effort = !string.IsNullOrWhiteSpace(reasoningEffort) ? reasoningEffort.Trim().ToLowerInvariant() : "medium";
                        if (effort != "low" && effort != "medium" && effort != "high")
                        {
                            effort = "medium";
                        }
                        payloadDict["reasoning_effort"] = effort;
                    }
                }
                else
                {
                    payloadDict["temperature"] = 0.35;
                    payloadDict["response_format"] = new { type = "json_object" };
                }

                req.Content = new StringContent(JsonSerializer.Serialize(payloadDict), Encoding.UTF8, "application/json");
                return await client.SendAsync(req, ct);
            }

            var response = await SendRequestAsync(minimalMode: isReasoner);
            string responseBody = await response.Content.ReadAsStringAsync(ct);

            // Reintento defensivo universal: si el endpoint o modelo rechaza response_format o temperature (HTTP 400/422)
            if (!response.IsSuccessStatusCode && !isReasoner &&
                ((int)response.StatusCode == 400 || (int)response.StatusCode == 422))
            {
                _logger.LogInformation("[DOSIER AI] El endpoint devolvió {StatusCode} con parámetros extendidos. Reintentando con payload estándar compatible...", (int)response.StatusCode);
                response.Dispose();
                response = await SendRequestAsync(minimalMode: true);
                responseBody = await response.Content.ReadAsStringAsync(ct);
            }

            string providerLabel = provider.ToUpperInvariant();
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[DOSIER AI] Error de proveedor {Provider} ({StatusCode}): {Body}", providerLabel, (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El proveedor {providerLabel} rechazó la solicitud (HTTP {(int)response.StatusCode}). Verifique la URL del endpoint ({effectiveUrl}), API Key, saldo disponible o modelo.");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("choices", out var choices) &&
                choices.ValueKind == JsonValueKind.Array &&
                choices.GetArrayLength() > 0)
            {
                var msg = choices[0].GetProperty("message");
                if (msg.TryGetProperty("content", out var contentEl))
                {
                    return CleanJsonFence(contentEl.GetString() ?? "{}");
                }
            }

            throw new InvalidOperationException($"El modelo {providerLabel} no devolvió un contenido JSON válido.");
        }

        private static PeaStructuredDraftDto ParseAndNormalizeDraft(
            string rawJson,
            AcademicPromptContext ctx,
            string provider,
            string model,
            List<string> requestedSections,
            bool isAllSections,
            GeneratePeaDraftRequestDto request)
        {
            var result = new PeaStructuredDraftDto();
            using var doc = JsonDocument.Parse(rawJson, new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            });
            var root = doc.RootElement;

            string rawObj = SanitizeRedundantHeading(TryGetString(root, "objetivo_asignatura", "ObjetivoAsignatura"), @"^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*(?:b\)\s*)?objetivo\s+de\s+la\s+asignatura\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?");
            result.ObjetivoAsignatura = NormalizeAndValidateBloomObjective(rawObj, ctx.NombreCarrera, ctx.NombreAsignatura, out string? detectedBloomVerb, out bool isBloomValid);
            result.RdaCarrera = TryGetString(root, "rda_carrera", "RdaCarrera");
            result.ResultadosAprendizaje = TryGetString(root, "resultados_aprendizaje", "ResultadosAprendizaje");
            result.MetodologiaEnsenanza = SanitizeRedundantHeading(TryGetString(root, "metodologia_ensenanza", "MetodologiaEnsenanza"), @"^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*(?:estrategias\s+metodol[oó]gicas|metodolog[ií]a\s+de\s+ense[ñn]anza)\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?");
            result.RecursosDidacticos = SanitizeRedundantHeading(TryGetString(root, "recursos_didacticos", "RecursosDidacticos"), @"^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*recursos\s+did[aá]cticos(?:\s*[\/\-]\s*informatizaci[oó]n\s+del\s+aprendizaje)?\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?");
            result.BibliografiaBasica = SanitizeRedundantHeading(TryGetString(root, "bibliografia_basica", "BibliografiaBasica"), @"^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*bibliograf[ií]a\s+b[aá]sica\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?");
            result.BibliografiaConsulta = SanitizeRedundantHeading(TryGetString(root, "bibliografia_consulta", "BibliografiaConsulta"), @"^\s*(?:<p\b[^>]*>)?\s*(?:<strong\b[^>]*>|<b\b[^>]*>)?\s*bibliograf[ií]a\s+de\s+consulta\s*(?:<\/strong>|<\/b>)?\s*(?::|-)?\s*(?:<\/p>|<br\s*\/?>|\n)?");

            // Prerrequisitos
            if (TryGetArray(root, out var prerreqArr, "prerrequisitos", "Prerrequisitos"))
            {
                foreach (var item in prerreqArr.EnumerateArray())
                {
                    if (item.ValueKind == JsonValueKind.String)
                    {
                        string rawStr = item.GetString()?.Trim() ?? string.Empty;
                        if (!string.IsNullOrWhiteSpace(rawStr))
                        {
                            result.Prerrequisitos.Add(new PeaDraftPrerrequisitoDto
                            {
                                Asignatura = rawStr,
                                Observacion = "Haber cursado y aprobado la asignatura según malla curricular"
                            });
                        }
                        continue;
                    }

                    string asig = TryGetString(item, "asignatura", "Asignatura", "nombre_asignatura", "NombreAsignatura", "materia", "Materia", "nombre");
                    string obs = TryGetString(item, "observacion", "Observacion", "condicion", "Condicion", "condicion_curricular", "descripcion");
                    if (!string.IsNullOrWhiteSpace(asig))
                    {
                        result.Prerrequisitos.Add(new PeaDraftPrerrequisitoDto
                        {
                            Asignatura = asig,
                            Observacion = string.IsNullOrWhiteSpace(obs) ? "Haber cursado y aprobado la asignatura según malla curricular" : obs
                        });
                    }
                }
            }

            bool userWantsPrereq = DoesUserRequestPrerequisites(request.CustomInstructions, request.ConversationHistory);

            if (userWantsPrereq)
            {
                // Si el docente solicitó expresamente prerrequisitos, depurar respuestas evasivas tipo "No registra prerrequisitos"
                result.Prerrequisitos.RemoveAll(p =>
                    p.Asignatura.Contains("no registra", StringComparison.OrdinalIgnoreCase) ||
                    p.Asignatura.Contains("sin prerrequisito", StringComparison.OrdinalIgnoreCase) ||
                    p.Asignatura.Contains("nivel inicial", StringComparison.OrdinalIgnoreCase));
            }

            if (result.Prerrequisitos.Count == 0)
            {
                if (ctx.SigafiPrerequisites.Count > 0)
                {
                    foreach (var sigafiPrereq in ctx.SigafiPrerequisites)
                    {
                        result.Prerrequisitos.Add(new PeaDraftPrerrequisitoDto
                        {
                            Asignatura = sigafiPrereq,
                            Observacion = "Haber cursado y aprobado la asignatura según malla curricular oficial"
                        });
                    }
                }
                else if (isAllSections || requestedSections.Contains("pea_prerequisites_section"))
                {
                    if (userWantsPrereq)
                    {
                        var contextualPrereqs = ResolveContextualPrerequisites(ctx.NombreCarrera, ctx.NombreAsignatura, request.CustomInstructions);
                        result.Prerrequisitos.AddRange(contextualPrereqs);
                    }
                    else
                    {
                        result.Prerrequisitos.Add(new PeaDraftPrerrequisitoDto
                        {
                            Asignatura = "No registra prerrequisitos (Nivel inicial)",
                            Observacion = "Asignatura correspondiente al primer período académico sin prerrequisito previo"
                        });
                    }
                }
            }

            // Unidades
            if (TryGetArray(root, out var unidadesArr, "unidades", "Unidades"))
            {
                int idx = 1;
                foreach (var item in unidadesArr.EnumerateArray())
                {
                    string rawTitulo = TryGetString(item, "titulo", "Titulo", "nombre_unidad", "NombreUnidad");
                    string cleanTitulo = System.Text.RegularExpressions.Regex.Replace(
                        rawTitulo.Trim(),
                        @"^unidad\s*\d+\s*[:\.\-]?\s*",
                        string.Empty,
                        System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();

                    string contenidos = TryGetString(item, "contenidos", "Contenidos", "descripcion_subtemas");
                    decimal cd = TryGetDecimal(item, 0m, "horas_cd", "horasCD", "HorasCD", "horas_docencia");
                    decimal ape = TryGetDecimal(item, 0m, "horas_ape", "horasAPE", "HorasAPE", "horas_practica");
                    decimal ta = TryGetDecimal(item, 0m, "horas_ta", "horasTA", "HorasTA", "horas_autonomo");

                    if (!string.IsNullOrWhiteSpace(cleanTitulo) || !string.IsNullOrWhiteSpace(contenidos))
                    {
                        result.Unidades.Add(new PeaDraftUnidadDto
                        {
                            Num = idx++,
                            Titulo = string.IsNullOrWhiteSpace(cleanTitulo) ? $"Fundamentos y Aplicaciones {idx - 1}" : cleanTitulo,
                            Contenidos = contenidos,
                            HorasCD = Math.Max(0m, cd),
                            HorasAPE = Math.Max(0m, ape),
                            HorasTA = Math.Max(0m, ta)
                        });
                    }
                }
            }

            // Reconciliación matemática determinista de horas con SIGAFI
            if (result.Unidades.Count > 0)
            {
                ReconcileUnitHoursWithSigafi(result.Unidades, ctx.HorasCD, ctx.HorasAPE, ctx.HorasTA);
            }

            // Actividades Prácticas
            if (TryGetArray(root, out var practicasArr, "actividades_practicas", "ActividadesPracticas"))
            {
                int pIdx = 1;
                foreach (var item in practicasArr.EnumerateArray())
                {
                    int unidadNum = TryGetInt(item, "unidad", "Unidad");
                    if (unidadNum <= 0) unidadNum = ((pIdx - 1) % Math.Max(1, result.Unidades.Count)) + 1;

                    string nombre = TryGetString(item, "nombre", "Nombre", "nombre_practica", "NombrePractica");
                    decimal horas = TryGetDecimal(item, 0m, "horas", "Horas", "duracion_horas");
                    string escenario = TryGetString(item, "escenario", "Escenario");
                    string producto = TryGetString(item, "producto", "Producto");
                    string caract = TryGetString(item, "caracterizacion", "Caracterizacion");

                    if (string.IsNullOrWhiteSpace(caract))
                    {
                        caract = string.Join(" | ", new[] { escenario, producto }.Where(s => !string.IsNullOrWhiteSpace(s)));
                    }

                    if (!string.IsNullOrWhiteSpace(nombre))
                    {
                        result.ActividadesPracticas.Add(new PeaDraftActividadPracticaDto
                        {
                            Unidad = unidadNum,
                            Nombre = nombre,
                            Horas = horas > 0 ? horas : 2m,
                            Escenario = escenario,
                            Producto = producto,
                            Caracterizacion = caract
                        });
                        pIdx++;
                    }
                }
            }

            // Evaluaciones
            if (TryGetArray(root, out var evalArr, "evaluaciones", "Evaluaciones"))
            {
                foreach (var item in evalArr.EnumerateArray())
                {
                    string nota = TryGetString(item, "nota", "Nota", "denominacion", "Denominacion");
                    string tipo = TryGetString(item, "tipo", "Tipo", "tipo_evaluacion", "TipoEvaluacion");
                    decimal calif = TryGetDecimal(item, 10m, "calificacion", "Calificacion", "calificacion_maxima");

                    if (!string.IsNullOrWhiteSpace(nota))
                    {
                        result.Evaluaciones.Add(new PeaDraftEvaluacionDto
                        {
                            Nota = nota,
                            Tipo = tipo,
                            Calificacion = calif > 0 ? calif : 10m
                        });
                    }
                }
            }

            // Bibliografías
            if (TryGetArray(root, out var bibArr, "bibliografias", "Bibliografias"))
            {
                foreach (var item in bibArr.EnumerateArray())
                {
                    string tipoRaw = TryGetString(item, "tipo_bibliografia", "TipoBibliografia", "tipo");
                    string tipo = tipoRaw.Contains("cons", StringComparison.OrdinalIgnoreCase) ||
                                  tipoRaw.Contains("comp", StringComparison.OrdinalIgnoreCase)
                        ? "Consulta"
                        : "Basica";

                    string autor = TryGetString(item, "autor", "Autor");
                    string titulo = TryGetString(item, "titulo_libro", "TituloLibro", "titulo");
                    string editorial = TryGetString(item, "editorial_ciudad", "EditorialCiudad", "editorial");
                    string cita = TryGetString(item, "cita_completa_apa", "CitaCompletaApa", "cita");

                    if (!string.IsNullOrWhiteSpace(cita) || !string.IsNullOrWhiteSpace(titulo))
                    {
                        result.Bibliografias.Add(new PeaDraftBibliografiaDto
                        {
                            TipoBibliografia = tipo,
                            Autor = autor,
                            TituloLibro = string.IsNullOrWhiteSpace(titulo) ? cita : titulo,
                            EditorialCiudad = editorial,
                            CitaCompletaApa = string.IsNullOrWhiteSpace(cita) ? $"{autor}. {titulo}. {editorial}".Trim() : cita
                        });
                    }
                }
            }

            // Normalización determinista de prácticas experimentales (escenario y producto acreditable)
            bool arePracticesCompliant = NormalizeAndValidatePractices(result.ActividadesPracticas, result.Unidades, ctx);

            // Normalización determinista de referencias bibliográficas (APA 7ma, año, editorial, equilibrio 3/3)
            bool isBibliographyCompliant = NormalizeAndValidateBibliography(result.Bibliografias, ctx);

            // Sincronizar campos HTML BibliografiaBasica y BibliografiaConsulta desde la lista estructurada
            if (result.Bibliografias.Any(b => b.TipoBibliografia == "Basica"))
            {
                var items = result.Bibliografias
                    .Where(b => b.TipoBibliografia == "Basica")
                    .Select((b, i) => $"<p>{i + 1}. {System.Net.WebUtility.HtmlEncode(b.CitaCompletaApa)}</p>");
                result.BibliografiaBasica = string.Join("", items);
            }

            if (result.Bibliografias.Any(b => b.TipoBibliografia == "Consulta"))
            {
                var items = result.Bibliografias
                    .Where(b => b.TipoBibliografia == "Consulta")
                    .Select((b, i) => $"<p>{i + 1}. {System.Net.WebUtility.HtmlEncode(b.CitaCompletaApa)}</p>");
                result.BibliografiaConsulta = string.Join("", items);
            }

            // Resumen de validación matemática y secciones pobladas
            decimal genCd = result.Unidades.Sum(u => u.HorasCD);
            decimal genApe = result.Unidades.Sum(u => u.HorasAPE);
            decimal genTa = result.Unidades.Sum(u => u.HorasTA);
            decimal genTotal = genCd + genApe + genTa;

            var generatedSections = new List<string>();
            if (!string.IsNullOrWhiteSpace(result.ObjetivoAsignatura)) generatedSections.Add("pea_objectives_section");
            if (result.Prerrequisitos.Count > 0) generatedSections.Add("pea_prerequisites_section");
            if (!string.IsNullOrWhiteSpace(result.RdaCarrera)) generatedSections.Add("pea_career_outcomes_section");
            if (!string.IsNullOrWhiteSpace(result.ResultadosAprendizaje)) generatedSections.Add("pea_subject_outcomes_section");
            if (result.Unidades.Count > 0) generatedSections.Add("pea_contents_section");
            if (!string.IsNullOrWhiteSpace(result.MetodologiaEnsenanza) || !string.IsNullOrWhiteSpace(result.RecursosDidacticos)) generatedSections.Add("pea_methodology_section");
            if (result.ActividadesPracticas.Count > 0) generatedSections.Add("pea_resources_section");
            if (result.Evaluaciones.Count > 0) generatedSections.Add("pea_evaluation_section");
            if (!string.IsNullOrWhiteSpace(result.BibliografiaBasica) || !string.IsNullOrWhiteSpace(result.BibliografiaConsulta)) generatedSections.Add("pea_bibliography_section");

            // Si el docente solicitó secciones específicas (!isAllSections), restringir estrictamente las secciones generadas
            if (!isAllSections && requestedSections.Count > 0)
            {
                generatedSections = generatedSections
                    .Where(s => requestedSections.Contains(s.ToLowerInvariant()))
                    .ToList();
            }

            string reportedTargetSection = isAllSections ? "all" : string.Join(",", requestedSections);

            var complianceNotes = new List<string>();
            if (isBloomValid && !string.IsNullOrWhiteSpace(detectedBloomVerb))
            {
                complianceNotes.Add($"Objetivo CACES validado con verbo de acción Bloom: '{detectedBloomVerb}'.");
            }
            if (arePracticesCompliant)
            {
                complianceNotes.Add($"Prácticas APE normalizadas con escenario físico y producto acreditable ({result.ActividadesPracticas.Count} prácticas).");
            }
            if (isBibliographyCompliant)
            {
                complianceNotes.Add($"Bibliografía balanceada bajo norma APA 7ma ({result.Bibliografias.Count} obras con año y editorial).");
            }

            result.ValidationSummary = new PeaDraftValidationSummaryDto
            {
                ProviderUsed = provider,
                ModelUsed = model,
                TargetSection = reportedTargetSection,
                SigafiHorasCD = ctx.HorasCD,
                SigafiHorasAPE = ctx.HorasAPE,
                SigafiHorasTA = ctx.HorasTA,
                SigafiTotalHoras = ctx.TotalHoras,
                GeneratedHorasCD = genCd,
                GeneratedHorasAPE = genApe,
                GeneratedHorasTA = genTa,
                GeneratedTotalHoras = genTotal,
                IsHoursExactMatch = Math.Abs(genCd - ctx.HorasCD) < 0.01m && Math.Abs(genApe - ctx.HorasAPE) < 0.01m && Math.Abs(genTa - ctx.HorasTA) < 0.01m,
                IsBloomVerbValid = isBloomValid,
                BloomVerbDetected = detectedBloomVerb,
                ArePracticesCompliant = arePracticesCompliant,
                IsBibliographyCompliant = isBibliographyCompliant,
                ComplianceNotes = complianceNotes,
                GeneratedSections = generatedSections
            };

            return result;
        }

        private static string SanitizeRedundantHeading(string? text, string regexPattern)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;
            string cleaned = System.Text.RegularExpressions.Regex.Replace(
                text,
                regexPattern,
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline
            ).Trim();

            cleaned = System.Text.RegularExpressions.Regex.Replace(
                cleaned,
                @"^\s*<p\b[^>]*>\s*(?:&nbsp;|\s)*<\/p>",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase
            ).Trim();

            return cleaned;
        }

        private static void ReconcileUnitHoursWithSigafi(
            List<PeaDraftUnidadDto> unidades,
            decimal targetCd,
            decimal targetApe,
            decimal targetTa)
        {
            if (unidades.Count == 0) return;

            decimal sum = targetCd + targetApe + targetTa;
            if (sum > 0 && (targetCd <= 0 || targetApe <= 0))
            {
                decimal third = Math.Floor((sum / 3m) * 100m) / 100m;
                targetCd = third;
                targetApe = third;
                targetTa = sum - targetCd - targetApe;
            }

            DistributeExactBucket(unidades, u => u.HorasCD, (u, val) => u.HorasCD = val, targetCd);
            DistributeExactBucket(unidades, u => u.HorasAPE, (u, val) => u.HorasAPE = val, targetApe);
            DistributeExactBucket(unidades, u => u.HorasTA, (u, val) => u.HorasTA = val, targetTa);
        }

        private static void DistributeExactBucket(
            List<PeaDraftUnidadDto> unidades,
            Func<PeaDraftUnidadDto, decimal> getter,
            Action<PeaDraftUnidadDto, decimal> setter,
            decimal targetTotal)
        {
            int count = unidades.Count;
            if (targetTotal <= 0)
            {
                foreach (var u in unidades) setter(u, 0m);
                return;
            }

            decimal currentSum = unidades.Sum(getter);
            if (Math.Abs(currentSum - targetTotal) < 0.001m) return;

            if (currentSum <= 0)
            {
                decimal baseVal = Math.Floor((targetTotal / count) * 100m) / 100m;
                decimal running = 0m;
                for (int i = 0; i < count - 1; i++)
                {
                    setter(unidades[i], baseVal);
                    running += baseVal;
                }
                setter(unidades[count - 1], Math.Max(0m, targetTotal - running));
                return;
            }

            decimal runningSum = 0m;
            for (int i = 0; i < count - 1; i++)
            {
                decimal ratio = getter(unidades[i]) / currentSum;
                decimal proportional = Math.Round(ratio * targetTotal, 2);
                if (runningSum + proportional > targetTotal)
                {
                    proportional = Math.Max(0m, targetTotal - runningSum);
                }
                setter(unidades[i], proportional);
                runningSum += proportional;
            }

            setter(unidades[count - 1], Math.Max(0m, targetTotal - runningSum));
        }

        private async Task<(string? ApiKey, string? Provider, string? Model, string? BaseUrl, string? ReasoningEffort)> GetUserConfigAsync(int idUsuario, CancellationToken ct)
        {
            if (idUsuario <= 0) return (null, null, null, null, null);
            var meta = await _context.DocUsuariosMetadata
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.IdUsuario == idUsuario, ct);

            if (meta == null || string.IsNullOrWhiteSpace(meta.Configuracion))
                return (null, null, null, null, null);

            try
            {
                using var doc = JsonDocument.Parse(meta.Configuracion);
                var root = doc.RootElement;
                string? protectedKey = root.TryGetProperty("ai_api_key_protected", out var kEl) && kEl.ValueKind == JsonValueKind.String
                    ? kEl.GetString()
                    : null;
                string? provider = root.TryGetProperty("ai_provider", out var pEl) && pEl.ValueKind == JsonValueKind.String
                    ? pEl.GetString()
                    : null;
                string? model = root.TryGetProperty("ai_model", out var mEl) && mEl.ValueKind == JsonValueKind.String
                    ? mEl.GetString()
                    : null;
                string? baseUrl = root.TryGetProperty("ai_base_url", out var bEl) && bEl.ValueKind == JsonValueKind.String
                    ? bEl.GetString()
                    : null;
                string? effort = root.TryGetProperty("ai_reasoning_effort", out var rEl) && rEl.ValueKind == JsonValueKind.String
                    ? rEl.GetString()
                    : null;

                string? rawKey = TryUnprotect(protectedKey);
                return (rawKey, provider, model, baseUrl, effort);
            }
            catch
            {
                return (null, null, null, null, null);
            }
        }

        private async Task<(string? ApiKey, string? Provider, string? Model, string? BaseUrl, string? ReasoningEffort)> GetGlobalConfigAsync(CancellationToken ct)
        {
            var keys = new[] { GlobalKeyClave, GlobalProviderClave, GlobalModelClave, GlobalBaseUrlClave, GlobalReasoningEffortClave };
            var configs = await _context.DocConfigsGenerales
                .AsNoTracking()
                .Where(c => keys.Contains(c.Clave))
                .ToListAsync(ct);

            string? protectedKey = configs.FirstOrDefault(c => c.Clave == GlobalKeyClave)?.Valor;
            string? provider = configs.FirstOrDefault(c => c.Clave == GlobalProviderClave)?.Valor;
            string? model = configs.FirstOrDefault(c => c.Clave == GlobalModelClave)?.Valor;
            string? baseUrl = configs.FirstOrDefault(c => c.Clave == GlobalBaseUrlClave)?.Valor;
            string? effort = configs.FirstOrDefault(c => c.Clave == GlobalReasoningEffortClave)?.Valor;

            return (TryUnprotect(protectedKey), provider, model, baseUrl, effort);
        }

        private async Task UpsertGlobalConfigAsync(string clave, string valor, string descripcion, CancellationToken ct)
        {
            var existing = await _context.DocConfigsGenerales.FirstOrDefaultAsync(c => c.Clave == clave, ct);
            if (existing == null)
            {
                _context.DocConfigsGenerales.Add(new DocConfigGeneral
                {
                    Clave = clave,
                    Valor = valor,
                    Descripcion = descripcion
                });
            }
            else
            {
                existing.Valor = valor;
                existing.Descripcion = descripcion;
            }
        }

        private string? TryUnprotect(string? protectedValue)
        {
            if (string.IsNullOrWhiteSpace(protectedValue)) return null;
            try
            {
                return _protector.Unprotect(protectedValue);
            }
            catch
            {
                return null;
            }
        }

        private static string? MaskApiKey(string? rawKey)
        {
            if (string.IsNullOrWhiteSpace(rawKey)) return null;
            string trimmed = rawKey.Trim();
            if (trimmed.Length <= 8) return "••••••••";
            return $"{trimmed.Substring(0, 4)}••••{trimmed.Substring(trimmed.Length - 4)}";
        }

        private static string NormalizeProvider(string? provider)
        {
            if (string.IsNullOrWhiteSpace(provider)) return "deepseek";
            string p = provider.Trim().ToLowerInvariant();
            if (p == "openai" || p == "gemini" || p == "anthropic" || p == "openrouter" || p == "groq" || p == "ollama" || p == "custom")
            {
                return p;
            }
            return "deepseek";
        }

        private static string GetDefaultModelForProvider(string normalizedProvider)
        {
            return normalizedProvider switch
            {
                "openai" => "gpt-4o-mini",
                "gemini" => "gemini-2.5-flash",
                "anthropic" => "claude-3-5-sonnet-latest",
                "openrouter" => "deepseek/deepseek-chat",
                "groq" => "llama-3.3-70b-versatile",
                "ollama" => "llama3",
                "custom" => "custom-model",
                _ => "deepseek-chat"
            };
        }

        private static string GetDefaultBaseUrlForProvider(string normalizedProvider)
        {
            return normalizedProvider switch
            {
                "openai" => "https://api.openai.com/v1/chat/completions",
                "gemini" => "https://generativelanguage.googleapis.com",
                "anthropic" => "https://api.anthropic.com/v1/messages",
                "openrouter" => "https://openrouter.ai/api/v1/chat/completions",
                "groq" => "https://api.groq.com/openai/v1/chat/completions",
                "ollama" => "http://localhost:11434/v1/chat/completions",
                "custom" => "https://api.openai.com/v1/chat/completions",
                _ => "https://api.deepseek.com/chat/completions"
            };
        }

        private static string ResolveEffectiveBaseUrl(string normalizedProvider, string? configuredBaseUrl, string defaultBaseUrl)
        {
            if (string.IsNullOrWhiteSpace(configuredBaseUrl))
            {
                return defaultBaseUrl;
            }

            string trimmed = configuredBaseUrl.Trim();
            if (normalizedProvider == "custom" || normalizedProvider == "ollama")
            {
                return trimmed;
            }

            // Evitar que una URL residual de otro proveedor predefinido bloquee el cambio de proveedor en appsettings
            bool matchesProviderDomain = normalizedProvider switch
            {
                "deepseek" => trimmed.Contains("deepseek", StringComparison.OrdinalIgnoreCase),
                "openai" => trimmed.Contains("openai.com", StringComparison.OrdinalIgnoreCase),
                "gemini" => trimmed.Contains("googleapis.com", StringComparison.OrdinalIgnoreCase),
                "anthropic" => trimmed.Contains("anthropic.com", StringComparison.OrdinalIgnoreCase),
                "openrouter" => trimmed.Contains("openrouter.ai", StringComparison.OrdinalIgnoreCase),
                "groq" => trimmed.Contains("groq.com", StringComparison.OrdinalIgnoreCase),
                _ => true
            };

            return matchesProviderDomain ? trimmed : defaultBaseUrl;
        }

        private static string NormalizeOpenAiEndpointUrl(string rawUrl)
        {
            string url = rawUrl.Trim().TrimEnd('/');
            if (url.EndsWith("/chat/completions", StringComparison.OrdinalIgnoreCase) ||
                url.EndsWith("/completions", StringComparison.OrdinalIgnoreCase) ||
                url.EndsWith("/messages", StringComparison.OrdinalIgnoreCase))
            {
                return url;
            }

            if (url.EndsWith("/v1", StringComparison.OrdinalIgnoreCase))
            {
                return $"{url}/chat/completions";
            }

            return $"{url}/chat/completions";
        }

        private static string CleanJsonFence(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return "{}";
            string working = text.Trim();

            // 1. Eliminar bloques <think>...</think> de modelos razonadores (DeepSeek R1, QwQ, etc.)
            while (true)
            {
                int thinkStart = working.IndexOf("<think>", StringComparison.OrdinalIgnoreCase);
                if (thinkStart < 0) break;
                int thinkEnd = working.IndexOf("</think>", thinkStart, StringComparison.OrdinalIgnoreCase);
                if (thinkEnd > thinkStart)
                {
                    working = working.Remove(thinkStart, (thinkEnd + "</think>".Length) - thinkStart).Trim();
                }
                else
                {
                    break;
                }
            }

            // 2. Extraer el objeto JSON raíz { ... } ignorando texto conversacional o bloques ```json
            int firstBrace = working.IndexOf('{');
            int lastBrace = working.LastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace)
            {
                return working.Substring(firstBrace, (lastBrace - firstBrace) + 1).Trim();
            }

            return working;
        }

        private static string TryGetString(JsonElement element, params string[] keys)
        {
            if (element.ValueKind != JsonValueKind.Object) return string.Empty;
            foreach (var key in keys)
            {
                if (element.TryGetProperty(key, out var prop))
                {
                    if (prop.ValueKind == JsonValueKind.String) return prop.GetString()?.Trim() ?? string.Empty;
                    if (prop.ValueKind == JsonValueKind.Number || prop.ValueKind == JsonValueKind.True || prop.ValueKind == JsonValueKind.False)
                        return prop.GetRawText();
                    if (prop.ValueKind == JsonValueKind.Array)
                    {
                        var lines = new List<string>();
                        foreach (var item in prop.EnumerateArray())
                        {
                            if (item.ValueKind == JsonValueKind.String)
                            {
                                string s = item.GetString()?.Trim() ?? string.Empty;
                                if (!string.IsNullOrWhiteSpace(s)) lines.Add(s);
                            }
                        }
                        if (lines.Count > 0) return string.Join("\n", lines);
                    }
                }
            }
            return string.Empty;
        }

        private static int TryGetInt(JsonElement element, params string[] keys)
        {
            if (element.ValueKind != JsonValueKind.Object) return 0;
            foreach (var key in keys)
            {
                if (element.TryGetProperty(key, out var prop))
                {
                    if (prop.ValueKind == JsonValueKind.Number && prop.TryGetInt32(out int v)) return v;
                    if (prop.ValueKind == JsonValueKind.String && int.TryParse(prop.GetString(), out int sv)) return sv;
                }
            }
            return 0;
        }

        private static decimal TryGetDecimal(JsonElement element, decimal fallback, params string[] keys)
        {
            if (element.ValueKind != JsonValueKind.Object) return fallback;
            foreach (var key in keys)
            {
                if (element.TryGetProperty(key, out var prop))
                {
                    if (prop.ValueKind == JsonValueKind.Number && prop.TryGetDecimal(out decimal v)) return v;
                    if (prop.ValueKind == JsonValueKind.String && decimal.TryParse(prop.GetString(), out decimal sv)) return sv;
                }
            }
            return fallback;
        }

        private static bool TryGetArray(JsonElement element, out JsonElement arrayProp, params string[] keys)
        {
            arrayProp = default;
            if (element.ValueKind != JsonValueKind.Object) return false;
            foreach (var key in keys)
            {
                if (element.TryGetProperty(key, out var prop) && prop.ValueKind == JsonValueKind.Array)
                {
                    arrayProp = prop;
                    return true;
                }
            }
            return false;
        }

        private static bool DoesUserRequestPrerequisites(string? instructions, List<PeaAiChatMessageDto>? history)
        {
            var terms = new[] { "prerrequisito", "prerequisito", "pre-requisito", "requisito previo", "materia previa", "asignatura previa" };
            if (!string.IsNullOrWhiteSpace(instructions))
            {
                var lower = instructions.ToLowerInvariant();
                if (terms.Any(t => lower.Contains(t))) return true;
            }

            if (history != null && history.Count > 0)
            {
                foreach (var msg in history.Where(h => h.Role.Equals("user", StringComparison.OrdinalIgnoreCase)))
                {
                    if (string.IsNullOrWhiteSpace(msg.Content)) continue;
                    var lower = msg.Content.ToLowerInvariant();
                    if (terms.Any(t => lower.Contains(t))) return true;
                }
            }

            return false;
        }

        private static List<PeaDraftPrerrequisitoDto> ResolveContextualPrerequisites(string carrera, string asignatura, string? instructions)
        {
            var list = new List<PeaDraftPrerrequisitoDto>();
            string c = (carrera ?? string.Empty).ToLowerInvariant();
            string a = (asignatura ?? string.Empty).ToLowerInvariant();
            string inst = (instructions ?? string.Empty).ToLowerInvariant();

            if (inst.Contains("lógica") || inst.Contains("logica"))
            {
                list.Add(new PeaDraftPrerrequisitoDto
                {
                    Asignatura = "Lógica Computacional y Algoritmos",
                    Observacion = "Fundamentación formativa en razonamiento lógico y estructuras algorítmicas previa requerida"
                });
                return list;
            }

            if (inst.Contains("matemátic") || inst.Contains("matematic"))
            {
                list.Add(new PeaDraftPrerrequisitoDto
                {
                    Asignatura = "Matemática Aplicada y Pensamiento Lógico",
                    Observacion = "Fundamentación formativa en cálculo y análisis cuantitativo previa requerida"
                });
                return list;
            }

            if (c.Contains("software") || c.Contains("sistemas") || c.Contains("computaci") || c.Contains("tecnolog"))
            {
                if (a.Contains("programaci") || a.Contains("software") || a.Contains("web") || a.Contains("móvil") || a.Contains("movil") || a.Contains("datos"))
                {
                    list.Add(new PeaDraftPrerrequisitoDto
                    {
                        Asignatura = "Lógica Computacional y Algoritmos",
                        Observacion = "Fundamentación formativa en diseño de algoritmos y estructuras lógicas requerida para la asignatura"
                    });
                }
                else
                {
                    list.Add(new PeaDraftPrerrequisitoDto
                    {
                        Asignatura = "Fundamentos de Tecnologías de la Información",
                        Observacion = "Fundamentación conceptual previa en principios tecnológicos y computacionales"
                    });
                }
                return list;
            }

            if (c.Contains("gastronom") || c.Contains("alimento") || c.Contains("cocina"))
            {
                list.Add(new PeaDraftPrerrequisitoDto
                {
                    Asignatura = "Bases Culinarias y Manipulación Higiénica de Alimentos",
                    Observacion = "Fundamentación formativa en bioseguridad alimentaria y técnicas preliminares de cocina"
                });
                return list;
            }

            if (c.Contains("administra") || c.Contains("contab") || c.Contains("finanz") || c.Contains("marketing") || c.Contains("gesti"))
            {
                list.Add(new PeaDraftPrerrequisitoDto
                {
                    Asignatura = "Fundamentos de Gestión y Contabilidad Básica",
                    Observacion = "Fundamentación formativa en principios organizacionales y contables aplicados"
                });
                return list;
            }

            if (c.Contains("electric") || c.Contains("electr") || c.Contains("mecán") || c.Contains("mecan"))
            {
                list.Add(new PeaDraftPrerrequisitoDto
                {
                    Asignatura = "Física Aplicada y Circuitos Básicos",
                    Observacion = "Fundamentación técnica formativa en magnitudes físicas y principios aplicados"
                });
                return list;
            }

            list.Add(new PeaDraftPrerrequisitoDto
            {
                Asignatura = "Fundamentos Formativos de la Especialidad",
                Observacion = "Competencias formativas preliminares indispensables para el abordaje de la asignatura"
            });
            return list;
        }

        private static readonly HashSet<string> ValidBloomVerbs = new(StringComparer.OrdinalIgnoreCase)
        {
            "diseñar", "disenar", "desarrollar", "implementar", "analizar", "evaluar", "aplicar", "elaborar",
            "construir", "gestionar", "formular", "modelar", "integrar", "configurar", "programar", "optimizar",
            "ejecutar", "estructurar", "determinar", "resolver", "demostrar", "examinar", "interpretar", "sintetizar",
            "crear", "producir", "validar", "auditar", "diagnosticar", "planificar", "administrar", "coordinar"
        };

        private static string NormalizeAndValidateBloomObjective(
            string? rawHtml,
            string carrera,
            string asignatura,
            out string? detectedVerb,
            out bool isCompliant)
        {
            detectedVerb = null;
            isCompliant = false;

            if (string.IsNullOrWhiteSpace(rawHtml))
            {
                string fallbackVerb = ResolveDefaultBloomVerb(carrera, asignatura);
                detectedVerb = fallbackVerb;
                isCompliant = true;
                return $"<p>{fallbackVerb} las competencias fundamentales de {System.Net.WebUtility.HtmlEncode(asignatura)} mediante la aplicación de técnicas y herramientas especializadas en el contexto de {System.Net.WebUtility.HtmlEncode(carrera)}.</p>";
            }

            // 1. Limpiar tags HTML y espacios redundantes
            string plainText = System.Text.RegularExpressions.Regex.Replace(rawHtml, @"<[^>]+>", " ").Trim();
            plainText = System.Text.RegularExpressions.Regex.Replace(plainText, @"\s+", " ");

            // 2. Eliminar prefijos comunes que no son verbos
            string cleanedText = System.Text.RegularExpressions.Regex.Replace(
                plainText,
                @"^(?:el\s+objetivo\s+(?:de\s+la\s+asignatura\s+)?es|esta\s+asignatura\s+(?:tiene\s+como\s+objetivo|busca|pretende)|capacitar\s+al\s+estudiante\s+en|permitir\s+al\s+estudiante|lograr\s+que\s+el\s+estudiante|formar\s+al\s+estudiante\s+en|dotar\s+al\s+estudiante\s+de)\s*[:,\-]?\s*",
                "",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();

            // 3. Extraer la primera palabra
            var matchFirstWord = System.Text.RegularExpressions.Regex.Match(cleanedText, @"^([a-záéíóúñ]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            if (matchFirstWord.Success)
            {
                string firstWord = matchFirstWord.Groups[1].Value;
                if (ValidBloomVerbs.Contains(firstWord))
                {
                    detectedVerb = Capitalize(firstWord);
                    isCompliant = true;
                    string capitalizedBody = detectedVerb + cleanedText.Substring(firstWord.Length);
                    return $"<p>{System.Net.WebUtility.HtmlEncode(capitalizedBody)}</p>";
                }

                if (firstWord.EndsWith("ar", StringComparison.OrdinalIgnoreCase) ||
                    firstWord.EndsWith("er", StringComparison.OrdinalIgnoreCase) ||
                    firstWord.EndsWith("ir", StringComparison.OrdinalIgnoreCase))
                {
                    detectedVerb = Capitalize(firstWord);
                    isCompliant = true;
                    string capitalizedBody = detectedVerb + cleanedText.Substring(firstWord.Length);
                    return $"<p>{System.Net.WebUtility.HtmlEncode(capitalizedBody)}</p>";
                }

                if (firstWord.Equals("conocer", StringComparison.OrdinalIgnoreCase) ||
                    firstWord.Equals("entender", StringComparison.OrdinalIgnoreCase) ||
                    firstWord.Equals("aprender", StringComparison.OrdinalIgnoreCase) ||
                    firstWord.Equals("saber", StringComparison.OrdinalIgnoreCase))
                {
                    string replacement = "Analizar y aplicar";
                    detectedVerb = "Analizar";
                    isCompliant = true;
                    string adjustedBody = replacement + cleanedText.Substring(firstWord.Length);
                    return $"<p>{System.Net.WebUtility.HtmlEncode(adjustedBody)}</p>";
                }
            }

            string defaultVerb = ResolveDefaultBloomVerb(carrera, asignatura);
            detectedVerb = defaultVerb;
            isCompliant = true;
            string finalObjective = $"{defaultVerb} {cleanedText.TrimStart()}";
            return $"<p>{System.Net.WebUtility.HtmlEncode(finalObjective)}</p>";
        }

        private static string ResolveDefaultBloomVerb(string carrera, string asignatura)
        {
            string c = (carrera ?? string.Empty).ToLowerInvariant();
            string a = (asignatura ?? string.Empty).ToLowerInvariant();

            if (a.Contains("programaci") || a.Contains("software") || a.Contains("web") || a.Contains("sistema") || a.Contains("aplicaci"))
                return "Desarrollar";
            if (a.Contains("diseño") || a.Contains("diseno") || a.Contains("arquitectura") || a.Contains("redes") || a.Contains("base de datos"))
                return "Diseñar";
            if (a.Contains("gesti") || a.Contains("administra") || a.Contains("evalua") || a.Contains("auditor"))
                return "Gestionar";
            if (a.Contains("cocina") || a.Contains("gastronom") || a.Contains("alimento"))
                return "Elaborar";
            if (a.Contains("electr") || a.Contains("mecán") || a.Contains("mecan") || a.Contains("mantenimiento"))
                return "Implementar";

            return "Analizar y aplicar";
        }

        private static string Capitalize(string text)
        {
            if (string.IsNullOrEmpty(text)) return string.Empty;
            return char.ToUpperInvariant(text[0]) + text.Substring(1).ToLowerInvariant();
        }

        private static bool NormalizeAndValidatePractices(
            List<PeaDraftActividadPracticaDto> practicas,
            List<PeaDraftUnidadDto> unidades,
            AcademicPromptContext ctx)
        {
            string defaultEscenario = ResolveDefaultEscenario(ctx.NombreCarrera);
            string defaultProducto = ResolveDefaultProducto(ctx.NombreCarrera);

            if (practicas.Count == 0 && unidades.Count > 0 && ctx.HorasAPE > 0)
            {
                decimal horasPerUnit = Math.Max(2m, Math.Round(ctx.HorasAPE / Math.Max(1, unidades.Count), 2));
                foreach (var u in unidades)
                {
                    practicas.Add(new PeaDraftActividadPracticaDto
                    {
                        Unidad = u.Num,
                        Nombre = $"Práctica Experimental: Aplicación Práctica de {u.Titulo}",
                        Horas = u.HorasAPE > 0 ? u.HorasAPE : horasPerUnit,
                        Escenario = defaultEscenario,
                        Producto = defaultProducto,
                        Caracterizacion = $"{defaultEscenario} | {defaultProducto}"
                    });
                }
            }

            int pIdx = 1;
            foreach (var p in practicas)
            {
                if (p.Unidad <= 0)
                {
                    p.Unidad = ((pIdx - 1) % Math.Max(1, unidades.Count)) + 1;
                }

                if (string.IsNullOrWhiteSpace(p.Escenario) ||
                    p.Escenario.Equals("n/a", StringComparison.OrdinalIgnoreCase) ||
                    p.Escenario.Equals("aula", StringComparison.OrdinalIgnoreCase))
                {
                    p.Escenario = defaultEscenario;
                }

                if (string.IsNullOrWhiteSpace(p.Producto) ||
                    p.Producto.Equals("n/a", StringComparison.OrdinalIgnoreCase) ||
                    p.Producto.Equals("tarea", StringComparison.OrdinalIgnoreCase))
                {
                    p.Producto = defaultProducto;
                }

                p.Caracterizacion = $"{p.Escenario.Trim()} | {p.Producto.Trim()}";
                pIdx++;
            }

            // Reconciliar horas de actividades prácticas con ctx.HorasAPE para que la suma de prácticas cubra el componente APE
            if (practicas.Count > 0 && ctx.HorasAPE > 0)
            {
                decimal currentSum = practicas.Sum(p => p.Horas);
                if (Math.Abs(currentSum - ctx.HorasAPE) >= 0.01m)
                {
                    if (unidades.Count == practicas.Count && Math.Abs(unidades.Sum(u => u.HorasAPE) - ctx.HorasAPE) < 0.01m)
                    {
                        for (int i = 0; i < practicas.Count; i++)
                        {
                            practicas[i].Horas = unidades[i].HorasAPE;
                        }
                    }
                    else
                    {
                        decimal baseHours = Math.Floor(ctx.HorasAPE / practicas.Count);
                        decimal rem = ctx.HorasAPE - (baseHours * practicas.Count);
                        for (int i = 0; i < practicas.Count; i++)
                        {
                            practicas[i].Horas = baseHours + (i == 0 ? rem : 0m);
                        }
                    }
                }
            }

            return practicas.Count > 0 && practicas.All(p => !string.IsNullOrWhiteSpace(p.Escenario) && !string.IsNullOrWhiteSpace(p.Producto));
        }

        private static string ResolveDefaultEscenario(string carrera)
        {
            string c = (carrera ?? string.Empty).ToLowerInvariant();
            if (c.Contains("software") || c.Contains("sistema") || c.Contains("computaci") || c.Contains("tecnolog"))
                return "Laboratorio Especializado de Computación y Software";
            if (c.Contains("gastronom") || c.Contains("cocina") || c.Contains("alimento"))
                return "Taller de Gastronomía y Cocina Experimental";
            if (c.Contains("administra") || c.Contains("contab") || c.Contains("finanz") || c.Contains("marketing") || c.Contains("gesti"))
                return "Centro de Simulación de Negocios y Gestión Empresarial";
            if (c.Contains("electric") || c.Contains("electr") || c.Contains("mecán") || c.Contains("mecan"))
                return "Taller Especializado y Laboratorio Técnico";

            return "Laboratorio Especializado / Entorno Tecnológico ISTPET";
        }

        private static string ResolveDefaultProducto(string carrera)
        {
            string c = (carrera ?? string.Empty).ToLowerInvariant();
            if (c.Contains("software") || c.Contains("sistema") || c.Contains("computaci") || c.Contains("tecnolog"))
                return "Informe técnico de laboratorio con código fuente y pruebas funcionales";
            if (c.Contains("gastronom") || c.Contains("cocina") || c.Contains("alimento"))
                return "Ficha técnica de preparación culinaria y rúbrica de degustación";
            if (c.Contains("administra") || c.Contains("contab") || c.Contains("finanz") || c.Contains("marketing") || c.Contains("gesti"))
                return "Informe de caso práctico con matrices de análisis y propuestas de gestión";
            if (c.Contains("electric") || c.Contains("electr") || c.Contains("mecán") || c.Contains("mecan"))
                return "Informe de prácticas técnicas con esquemas, mediciones y reporte operativo";

            return "Informe técnico de experimentación con evidencias y conclusiones";
        }

        private static bool NormalizeAndValidateBibliography(
            List<PeaDraftBibliografiaDto> bibliografias,
            AcademicPromptContext ctx)
        {
            foreach (var b in bibliografias)
            {
                string cita = b.CitaCompletaApa ?? string.Empty;
                string autor = b.Autor ?? string.Empty;
                string titulo = b.TituloLibro ?? string.Empty;
                string editorial = b.EditorialCiudad ?? string.Empty;

                var yearMatch = System.Text.RegularExpressions.Regex.Match(cita, @"\b(20\d{2}|19\d{2})\b");
                string year = yearMatch.Success ? yearMatch.Value : "2023";

                if (string.IsNullOrWhiteSpace(autor))
                {
                    var autorMatch = System.Text.RegularExpressions.Regex.Match(cita, @"^([^\(]+)\s*\(");
                    autor = autorMatch.Success ? autorMatch.Groups[1].Value.Trim() : "Autor Institucional";
                    b.Autor = autor;
                }

                if (string.IsNullOrWhiteSpace(titulo))
                {
                    var tituloMatch = System.Text.RegularExpressions.Regex.Match(cita, @"\)\.\s*([^.]+)\.");
                    titulo = tituloMatch.Success ? tituloMatch.Groups[1].Value.Trim() : ctx.NombreAsignatura;
                    b.TituloLibro = titulo;
                }

                if (string.IsNullOrWhiteSpace(editorial))
                {
                    var edMatch = System.Text.RegularExpressions.Regex.Match(cita, @"\.\s*([^.]+)\s*$");
                    editorial = edMatch.Success && !edMatch.Groups[1].Value.Contains("http")
                        ? edMatch.Groups[1].Value.Trim()
                        : ResolveDefaultEditorial(ctx.NombreCarrera);
                    b.EditorialCiudad = editorial;
                }

                if (string.IsNullOrWhiteSpace(cita) || !cita.Contains("(") || !cita.Contains(")"))
                {
                    b.CitaCompletaApa = $"{autor} ({year}). {titulo}. {editorial}.";
                }
            }

            var defaultBooks = GetDefaultCurriculumBibliography(ctx.NombreCarrera, ctx.NombreAsignatura);
            int basicaCount = bibliografias.Count(b => b.TipoBibliografia.Equals("Basica", StringComparison.OrdinalIgnoreCase));
            int consultaCount = bibliografias.Count(b => b.TipoBibliografia.Equals("Consulta", StringComparison.OrdinalIgnoreCase));

            foreach (var def in defaultBooks)
            {
                if (def.TipoBibliografia == "Basica" && basicaCount < 3)
                {
                    if (!bibliografias.Any(b => b.TituloLibro.Contains(def.TituloLibro, StringComparison.OrdinalIgnoreCase)))
                    {
                        bibliografias.Add(def);
                        basicaCount++;
                    }
                }
                else if (def.TipoBibliografia == "Consulta" && consultaCount < 3)
                {
                    if (!bibliografias.Any(b => b.TituloLibro.Contains(def.TituloLibro, StringComparison.OrdinalIgnoreCase)))
                    {
                        bibliografias.Add(def);
                        consultaCount++;
                    }
                }
            }

            return bibliografias.Count >= 6 &&
                   bibliografias.All(b => b.CitaCompletaApa.Contains("(") && !string.IsNullOrWhiteSpace(b.EditorialCiudad));
        }

        private static string ResolveDefaultEditorial(string carrera)
        {
            string c = (carrera ?? string.Empty).ToLowerInvariant();
            if (c.Contains("software") || c.Contains("sistema") || c.Contains("computaci") || c.Contains("tecnolog"))
                return "Alfaomega / Marcombo";
            if (c.Contains("gastronom") || c.Contains("cocina"))
                return "Editorial Síntesis / Paraninfo";
            if (c.Contains("administra") || c.Contains("contab") || c.Contains("finanz"))
                return "McGraw-Hill Interamericana";

            return "Pearson Educación";
        }

        private static List<PeaDraftBibliografiaDto> GetDefaultCurriculumBibliography(string carrera, string asignatura)
        {
            var list = new List<PeaDraftBibliografiaDto>();
            string c = (carrera ?? string.Empty).ToLowerInvariant();

            if (c.Contains("software") || c.Contains("sistema") || c.Contains("computaci"))
            {
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Basica",
                    Autor = "Deitel, P. J., & Deitel, H. M.",
                    TituloLibro = "Cómo programar: Fundamentos y Buenas Prácticas (10ma ed.)",
                    EditorialCiudad = "Pearson Educación",
                    CitaCompletaApa = "Deitel, P. J., & Deitel, H. M. (2020). Cómo programar: Fundamentos y Buenas Prácticas (10ma ed.). Pearson Educación."
                });
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Basica",
                    Autor = "Pressman, R. S., & Maxim, B. R.",
                    TituloLibro = "Ingeniería del Software: Un enfoque práctico (9na ed.)",
                    EditorialCiudad = "McGraw-Hill Interamericana",
                    CitaCompletaApa = "Pressman, R. S., & Maxim, B. R. (2021). Ingeniería del Software: Un enfoque práctico (9na ed.). McGraw-Hill Interamericana."
                });
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Basica",
                    Autor = "Sommerville, I.",
                    TituloLibro = "Ingeniería de Software (10ma ed.)",
                    EditorialCiudad = "Pearson Educación",
                    CitaCompletaApa = "Sommerville, I. (2022). Ingeniería de Software (10ma ed.). Pearson Educación."
                });
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Consulta",
                    Autor = "Martin, R. C.",
                    TituloLibro = "Código Limpio: Manual de estilo para el desarrollo ágil de software",
                    EditorialCiudad = "Anaya Multimedia",
                    CitaCompletaApa = "Martin, R. C. (2021). Código Limpio: Manual de estilo para el desarrollo ágil de software. Anaya Multimedia."
                });
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Consulta",
                    Autor = "Gamma, E., Helm, R., Johnson, R., & Vlissides, J.",
                    TituloLibro = "Patrones de Diseño: Elementos de software orientado a objetos reutilizable",
                    EditorialCiudad = "Addison-Wesley",
                    CitaCompletaApa = "Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (2020). Patrones de Diseño: Elementos de software orientado a objetos reutilizable. Addison-Wesley."
                });
                list.Add(new PeaDraftBibliografiaDto
                {
                    TipoBibliografia = "Consulta",
                    Autor = "Sedgewick, R., & Wayne, K.",
                    TituloLibro = "Algoritmos (4ta ed.)",
                    EditorialCiudad = "Pearson Educación",
                    CitaCompletaApa = "Sedgewick, R., & Wayne, K. (2021). Algoritmos (4ta ed.). Pearson Educación."
                });
                return list;
            }

            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Basica",
                Autor = "Hernández Sampieri, R., & Mendoza Torres, C. P.",
                TituloLibro = "Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta",
                EditorialCiudad = "McGraw-Hill Interamericana",
                CitaCompletaApa = "Hernández Sampieri, R., & Mendoza Torres, C. P. (2020). Metodología de la investigación: Las rutas cuantitativa, cualitativa y mixta. McGraw-Hill Interamericana."
            });
            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Basica",
                Autor = "Chiavenato, I.",
                TituloLibro = "Introducción a la teoría general de la administración (10ma ed.)",
                EditorialCiudad = "McGraw-Hill Interamericana",
                CitaCompletaApa = "Chiavenato, I. (2022). Introducción a la teoría general de la administración (10ma ed.). McGraw-Hill Interamericana."
            });
            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Basica",
                Autor = "Koontz, H., Weihrich, H., & Cannice, M.",
                TituloLibro = "Administración: Una perspectiva global, empresarial y de innovación (16ta ed.)",
                EditorialCiudad = "McGraw-Hill",
                CitaCompletaApa = "Koontz, H., Weihrich, H., & Cannice, M. (2021). Administración: Una perspectiva global, empresarial y de innovación (16ta ed.). McGraw-Hill."
            });
            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Consulta",
                Autor = "Kotler, P., & Armstrong, G.",
                TituloLibro = "Fundamentos de Marketing (14ta ed.)",
                EditorialCiudad = "Pearson Educación",
                CitaCompletaApa = "Kotler, P., & Armstrong, G. (2022). Fundamentos de Marketing (14ta ed.). Pearson Educación."
            });
            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Consulta",
                Autor = "Gitman, L. J., & Zutter, C. J.",
                TituloLibro = "Principios de Administración Financiera (15ta ed.)",
                EditorialCiudad = "Pearson Educación",
                CitaCompletaApa = "Gitman, L. J., & Zutter, C. J. (2020). Principios de Administración Financiera (15ta ed.). Pearson Educación."
            });
            list.Add(new PeaDraftBibliografiaDto
            {
                TipoBibliografia = "Consulta",
                Autor = "Robbins, S. P., & Judge, T. A.",
                TituloLibro = "Comportamiento Organizacional (18va ed.)",
                EditorialCiudad = "Pearson Educación",
                CitaCompletaApa = "Robbins, S. P., & Judge, T. A. (2021). Comportamiento Organizacional (18va ed.). Pearson Educación."
            });

            return list;
        }

        private sealed class AcademicPromptContext
        {
            public string PeaUuid { get; set; } = string.Empty;
            public string NombreAsignatura { get; set; } = string.Empty;
            public string CodigoAsignatura { get; set; } = string.Empty;
            public string NombreCarrera { get; set; } = string.Empty;
            public string SemestreNivel { get; set; } = string.Empty;
            public string Modalidad { get; set; } = "Presencial";
            public string UnidadOrganizacion { get; set; } = "Unidad Profesional";
            public decimal HorasCD { get; set; }
            public decimal HorasAPE { get; set; }
            public decimal HorasTA { get; set; }
            public decimal TotalHoras { get; set; }
            public List<string> SigafiPrerequisites { get; set; } = new();
            public List<string> RdasPerfilEgreso { get; set; } = new();
            public string? ModeloEducativoResumen { get; set; }
            public string? ExistingObjetivo { get; set; }
            public string? ExistingRdaCarrera { get; set; }
            public string? ExistingResultadosAprendizaje { get; set; }
            public string? ExistingMetodologia { get; set; }
            public string? ExistingRecursos { get; set; }
            public List<PeaDraftPrerrequisitoDto> ExistingPrerequisites { get; set; } = new();
            public List<PeaDraftUnidadDto> ExistingUnits { get; set; } = new();
            public List<PeaDraftActividadPracticaDto> ExistingPractices { get; set; } = new();
            public List<PeaDraftEvaluacionDto> ExistingEvaluations { get; set; } = new();
            public List<PeaDraftBibliografiaDto> ExistingBibliographies { get; set; } = new();
        }

        public async Task<PeaAiReviewAnalysisResponseDto> AnalyzeForReviewAsync(
            string peaUuid,
            int idUsuario,
            AnalyzePeaReviewRequestDto request,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(peaUuid))
            {
                throw new ArgumentException("Se requiere el identificador UUID del PEA o de la instancia documental.");
            }

            var (userKey, userProvider, userModel, userBaseUrl, userEffort) = await GetUserConfigAsync(idUsuario, ct);
            var (globalKey, globalProvider, globalModel, globalBaseUrl, globalEffort) = await GetGlobalConfigAsync(ct);
            string? envKey = _configuration["AiAssistant:ApiKey"]
                ?? _configuration["DeepSeek:ApiKey"]
                ?? _configuration["Gemini:ApiKey"]
                ?? _configuration["OpenAI:ApiKey"];

            string? apiKey = !string.IsNullOrWhiteSpace(request.ApiKeyOverride)
                ? request.ApiKeyOverride.Trim()
                : (!string.IsNullOrWhiteSpace(userKey) ? userKey : (!string.IsNullOrWhiteSpace(globalKey) ? globalKey : envKey));

            string provider = NormalizeProvider(
                !string.IsNullOrWhiteSpace(request.Provider) ? request.Provider :
                (!string.IsNullOrWhiteSpace(userProvider) ? userProvider :
                (!string.IsNullOrWhiteSpace(globalProvider) ? globalProvider : (_configuration["AiAssistant:Provider"] ?? "deepseek"))));

            if (string.IsNullOrWhiteSpace(apiKey) && !provider.Equals("ollama", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("No existe una API Key configurada para el asistente de IA. Configure su API Key antes de continuar.");
            }

            string defaultModel = GetDefaultModelForProvider(provider);
            string defaultBaseUrl = GetDefaultBaseUrlForProvider(provider);

            string model = !string.IsNullOrWhiteSpace(request.Model) ? request.Model.Trim() :
                           (!string.IsNullOrWhiteSpace(userModel) ? userModel! :
                           (!string.IsNullOrWhiteSpace(globalModel) ? globalModel! : (_configuration["AiAssistant:Model"] ?? defaultModel)));

            string? candidateBaseUrl = !string.IsNullOrWhiteSpace(request.BaseUrlOverride) ? request.BaseUrlOverride.Trim() :
                                       (!string.IsNullOrWhiteSpace(userBaseUrl) ? userBaseUrl :
                                       (!string.IsNullOrWhiteSpace(globalBaseUrl) ? globalBaseUrl :
                                       _configuration["AiAssistant:BaseUrl"]));

            string baseUrl = ResolveEffectiveBaseUrl(provider, candidateBaseUrl, defaultBaseUrl);

            string effectiveEffort = !string.IsNullOrWhiteSpace(request.ReasoningEffort)
                ? request.ReasoningEffort.Trim().ToLowerInvariant()
                : (!string.IsNullOrWhiteSpace(userEffort) ? userEffort! : (!string.IsNullOrWhiteSpace(globalEffort) ? globalEffort! : (_configuration["AiAssistant:ReasoningEffort"] ?? "medium")));

            var draftReqAdapter = new GeneratePeaDraftRequestDto
            {
                CurrentHorasCD = request.CurrentHorasCD,
                CurrentHorasAPE = request.CurrentHorasAPE,
                CurrentHorasTA = request.CurrentHorasTA,
                CurrentTotalHoras = request.CurrentTotalHoras
            };

            var contextData = await ResolveAcademicContextAsync(peaUuid, draftReqAdapter, ct);

            string systemPrompt = BuildReviewSystemPrompt(contextData);
            string userPrompt = BuildReviewUserPrompt(contextData, request);

            string rawJson;
            if (provider == "gemini" && string.IsNullOrWhiteSpace(request.BaseUrlOverride))
            {
                rawJson = await CallGeminiAsync(apiKey ?? string.Empty, model, systemPrompt, userPrompt, request.ConversationHistory, ct);
            }
            else if (provider == "anthropic" && (string.IsNullOrWhiteSpace(baseUrl) || baseUrl.Contains("api.anthropic.com/v1/messages", StringComparison.OrdinalIgnoreCase)))
            {
                rawJson = await CallAnthropicAsync(apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, request.ConversationHistory, ct);
            }
            else
            {
                rawJson = await CallOpenAiCompatibleAsync(provider, apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, effectiveEffort, request.ConversationHistory, ct);
            }

            return ParseAndNormalizeReviewAnalysis(rawJson, contextData, request, provider, model);
        }

        private static string BuildReviewSystemPrompt(AcademicPromptContext ctx)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Eres un Asistente Senior de Auditoría y Evaluación Curricular para el Instituto Superior Tecnológico Mayor Pedro Traversari (ISTPET) del Ecuador.");
            sb.AppendLine("Asistes a los revisores institucionales (Coordinador de Carrera, Coordinación Académica y Vicerrectorado Académico) en la evaluación técnica del Programa de Estudio de la Asignatura (PEA) bajo la normativa CES (RRA Art. 21) y estándares de acreditación CACES.");
            sb.AppendLine("Debes responder EXCLUSIVAMENTE con un objeto JSON válido que cumpla exactamente la estructura solicitada, sin bloques markdown externos ni texto fuera del JSON.");
            sb.AppendLine();
            sb.AppendLine("### DATOS OFICIALES DE MALLA Y GOBERNANZA (SIGAFI / ISTPET):");
            sb.AppendLine($"- Asignatura: {ctx.NombreAsignatura} (Código: {ctx.CodigoAsignatura})");
            sb.AppendLine($"- Carrera: {ctx.NombreCarrera}");
            sb.AppendLine($"- Nivel / Semestre: {ctx.SemestreNivel}");
            sb.AppendLine($"- Modalidad: {ctx.Modalidad}");
            sb.AppendLine($"- Unidad de Organización Curricular: {ctx.UnidadOrganizacion}");
            sb.AppendLine($"- Carga Horaria Oficial Referencial: Total = {ctx.TotalHoras}h (Contacto Docente CD = {ctx.HorasCD}h, Práctico Experimental APE = {ctx.HorasAPE}h, Trabajo Autónomo TA = {ctx.HorasTA}h)");

            if (ctx.SigafiPrerequisites.Count > 0)
            {
                sb.AppendLine($"- Prerrequisitos Oficiales en Malla SIGAFI: {string.Join(", ", ctx.SigafiPrerequisites)}");
            }
            else
            {
                sb.AppendLine("- Prerrequisitos Oficiales en Malla SIGAFI: Sin prerrequisitos obligatorios de malla registrados en SIGAFI (o asignatura de nivel inicial).");
            }

            if (ctx.RdasPerfilEgreso.Count > 0)
            {
                sb.AppendLine("- Resultados de Aprendizaje del Perfil de Egreso de la Carrera (RDAs Oficiales):");
                foreach (var rda in ctx.RdasPerfilEgreso.Take(10))
                {
                    sb.AppendLine($"  * {rda}");
                }
            }
            else
            {
                sb.AppendLine($"- Perfil de Egreso de la Carrera: Evaluar pertinencia técnica y profesional directa para un tecnólogo superior en {ctx.NombreCarrera}.");
            }

            if (!string.IsNullOrWhiteSpace(ctx.ModeloEducativoResumen))
            {
                sb.AppendLine($"- Modelo Educativo Institucional: {ctx.ModeloEducativoResumen}");
            }

            sb.AppendLine();
            sb.AppendLine("### CATÁLOGO DE SECCIONES VÁLIDAS PARA OBSERVACIONES (section_key):");
            sb.AppendLine("- \"NombreAsignatura\": 1. Datos Generales de la Asignatura (Horas, Créditos, Modalidad, Unidad Curricular)");
            sb.AppendLine("- \"ObjetivoAsignatura\": 2. Objetivo General de la Asignatura");
            sb.AppendLine("- \"Prerrequisitos\": 3. Prerrequisitos y Co-requisitos");
            sb.AppendLine("- \"AportePerfilEgreso\": 4. Resultados de Aprendizaje de Carrera (Perfil de Egreso)");
            sb.AppendLine("- \"ResultadosAprendizaje\": 5. Resultados de Aprendizaje de la Asignatura (RDA)");
            sb.AppendLine("- \"Unidades\": 6. Contenidos de Enseñanza y Unidades Temáticas");
            sb.AppendLine("- \"MetodologiaEnsenanza\": 7. Metodología de Enseñanza y Recursos Didácticos");
            sb.AppendLine("- \"ActividadesPracticas\": 8. Actividades Prácticas y Experimentales (APE)");
            sb.AppendLine("- \"Evaluaciones\": 9. Evaluación del Aprendizaje");
            sb.AppendLine("- \"Bibliografia\": 10. Bibliografía Institucional (Normas APA 7ma)");
            sb.AppendLine();
            sb.AppendLine("### CRITERIOS NORMATIVOS DE AUDITORÍA CURRICULAR (checks):");
            sb.AppendLine("Genera evaluación obligatoria ('cumple', 'alerta' u 'observado') con un detalle técnico concreto para los siguientes 5 criterios institucionales clave:");
            sb.AppendLine("1. \"Distribución horaria y créditos (RRA Art. 21)\": Verifica que 1 crédito = 48h y que Total = CD + APE + TA.");
            sb.AppendLine("2. \"Suma de horas en unidades vs Sección 1\": Verifica que la suma de horas CD, APE y TA de todas las unidades temáticas coincida exactamente con la Sección 1.");
            sb.AppendLine("3. \"Cobertura de prácticas experimentales (APE)\": Verifica que la suma de horas de las prácticas de laboratorio (Sección 8) cubra las horas APE declaradas.");
            sb.AppendLine("4. \"Alineación con el perfil de egreso de la carrera\": Verifica la coherencia pedagógica del objetivo, RDAs y contenidos con el perfil de egreso y nivel de la carrera.");
            sb.AppendLine("5. \"Coherencia de prerrequisitos con malla SIGAFI\": Verifica la concordancia con la malla curricular oficial en SIGAFI.");
            sb.AppendLine();
            sb.AppendLine("### ESQUEMA JSON DE RESPUESTA OBLIGATORIO:");
            sb.AppendLine("{");
            sb.AppendLine("  \"analysis_summary\": \"Explicación clara, estructurada y directa para el revisor respondiendo al enfoque o pregunta solicitada. Incluye propósito del PEA, progresión de unidades y hallazgos principales.\",");
            sb.AppendLine("  \"checks\": [");
            sb.AppendLine("    { \"criterion\": \"Nombre exacto del criterio de los 5 obligatorios\", \"status\": \"cumple | alerta | observado\", \"detail\": \"Detalle técnico verificable\" }");
            sb.AppendLine("  ],");
            sb.AppendLine("  \"suggested_observations\": [");
            sb.AppendLine("    { \"section_key\": \"Clave exacta del catálogo\", \"section_label\": \"Nombre legible de la sección\", \"severity\": \"alta | media | sugerencia\", \"observation_text\": \"Redacción formal y respetuosa lista para enviar al docente elaborador para su subsanación.\" }");
            sb.AppendLine("  ]");
            sb.AppendLine("}");
            sb.AppendLine();
            sb.AppendLine("REGLAS DE AUDITORÍA:");
            sb.AppendLine("1. Sé riguroso, objetivo, constructivo y fáctico. Cero emojis. Nunca cites etiquetas HTML crudas ('<p></p>') ni claves JSON internas.");
            sb.AppendLine("2. Si todas las secciones están bien formuladas y las horas cuadran, reconócelo en los checks ('cumple'). Incluye en 'suggested_observations' ÚNICAMENTE hallazgos sustantivos que ameriten corrección formal (ej. desfase real de horas en unidades o prácticas APE, o secciones vacías/incompletas). No infles 'suggested_observations' con sugerencias cosméticas cuando la sección ya cumple el estándar.");
            sb.AppendLine("3. REGLA SECCIÓN 1 (NombreAsignatura): Si en la Sección 1 los créditos y horas cuadran matemáticamente (1 crédito = 48h y CD + APE + TA = Total), marca la Sección 1 como 'cumple' y NO generes ninguna observación en 'suggested_observations' para 'NombreAsignatura' por falta de horas en unidades o prácticas. El desfase de horas en unidades o prácticas debe observarse exclusivamente en 'Unidades' (Sección 6) y 'ActividadesPracticas' (Sección 8).");
            sb.AppendLine("4. REGLA SECCIÓN 3 (Prerrequisitos): Si SIGAFI indica que no existen prerrequisitos obligatorios en la malla y el PEA tampoco registra prerrequisitos, marca la Sección 3 como 'cumple' (coherencia total con la malla oficial) y NO generes alertas ni observaciones para 'Prerrequisitos'.");
            sb.AppendLine("5. REGLA SECCIÓN 5 (ResultadosAprendizaje): Si existen al menos 3 resultados de aprendizaje de la asignatura coherentes con las unidades temáticas y redactados con verbos de desempeño o acción (ej. Comprende, Aplica, Utiliza, Implementa, Diseña, Desarrolla), marca la Sección 5 como 'cumple' y NO generes observaciones exigiendo porcentajes numéricos artificiales.");
            sb.AppendLine("6. REGLA SECCIÓN 9 (Evaluaciones): En el formato oficial del ISTPET / SIGAFI, los 4 componentes normativos (Contacto con el Docente, Práctico-Experimental APE, Trabajo Autónomo y Evaluación Sumativa) se califican cada uno sobre 10,0 puntos (que se promedian sobre 10 en el sistema académico). Si la Sección 9 registra los 4 componentes sobre 10 puntos cada uno (o sumando 10 o 100), marca la Sección 9 como 'cumple' y NO generes alertas ni observaciones cuestionando la suma de 40 puntos.");
            sb.AppendLine("7. REGLA SECCIÓN 10 (Bibliografia): Si existen al menos 3 obras de Bibliografía Básica y 3 de Consulta en formato APA 7ma edición vigentes, marca la Sección 10 como 'cumple'. En carreras tecnológicas como Desarrollo de Software es totalmente válido incluir literatura técnica de referencia en inglés o español; NO generes alertas ni observaciones por el idioma de los libros.");
            sb.AppendLine("8. Genera como máximo UNA (1) observación consolidada por cada 'section_key' que requiera subsanación real.");

            return sb.ToString();
        }

        private static string SanitizePromptField(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
            string s = System.Text.RegularExpressions.Regex.Replace(raw, @"<[^>]+>", " ");
            s = System.Net.WebUtility.HtmlDecode(s);
            s = System.Text.RegularExpressions.Regex.Replace(s, @"\{\s*""NumeroTema""\s*:\s*""1""\s*,\s*""TituloTema""\s*:\s*""Contenidos y Subtemas de Aprendizaje""\s*,\s*""DescripcionSubtemas""\s*:\s*""""\s*\}", "");
            s = System.Text.RegularExpressions.Regex.Replace(s, @"\s+", " ").Trim();
            return s == "-" ? string.Empty : s;
        }

        private static string BuildReviewUserPrompt(AcademicPromptContext ctx, AnalyzePeaReviewRequestDto req)
        {
            var sb = new StringBuilder();
            string focus = (req.FocusMode ?? "overview").Trim().ToLowerInvariant();

            decimal declTotal = req.CurrentTotalHoras ?? ctx.TotalHoras;
            decimal declCd = req.CurrentHorasCD ?? ctx.HorasCD;
            decimal declApe = req.CurrentHorasAPE ?? ctx.HorasAPE;
            decimal declTa = req.CurrentHorasTA ?? ctx.HorasTA;
            int creditos = req.CurrentCreditos ?? (int)Math.Round(declTotal / 48m);
            if (creditos <= 0 && declTotal > 0) creditos = (int)Math.Max(1, Math.Round(declTotal / 48m));

            var units = (req.CurrentUnidades != null && req.CurrentUnidades.Count > 0)
                ? req.CurrentUnidades.Select((u, idx) =>
                {
                    var dbUnit = ctx.ExistingUnits.FirstOrDefault(eu => eu.Num == u.Num)
                        ?? (idx < ctx.ExistingUnits.Count ? ctx.ExistingUnits[idx] : null);
                    bool reqHasHours = (u.HorasCD + u.HorasAPE + u.HorasTA) > 0;
                    return new PeaDraftUnidadDto
                    {
                        Num = u.Num > 0 ? u.Num : (dbUnit?.Num ?? (idx + 1)),
                        Titulo = !string.IsNullOrWhiteSpace(u.Titulo) ? u.Titulo : (dbUnit?.Titulo ?? string.Empty),
                        Contenidos = !string.IsNullOrWhiteSpace(u.Contenidos) ? u.Contenidos : (dbUnit?.Contenidos ?? string.Empty),
                        HorasCD = reqHasHours ? u.HorasCD : (dbUnit?.HorasCD ?? 0m),
                        HorasAPE = reqHasHours ? u.HorasAPE : (dbUnit?.HorasAPE ?? 0m),
                        HorasTA = reqHasHours ? u.HorasTA : (dbUnit?.HorasTA ?? 0m)
                    };
                }).ToList()
                : ctx.ExistingUnits;

            decimal sumUnitsCd = units.Sum(u => u.HorasCD);
            decimal sumUnitsApe = units.Sum(u => u.HorasAPE);
            decimal sumUnitsTa = units.Sum(u => u.HorasTA);
            decimal sumUnitsTotal = sumUnitsCd + sumUnitsApe + sumUnitsTa;

            var practicas = (req.CurrentActividadesPracticas != null && req.CurrentActividadesPracticas.Count > 0)
                ? req.CurrentActividadesPracticas
                : ctx.ExistingPractices;
            decimal sumPracticasHoras = practicas.Sum(p => p.Horas);

            string cleanObj = SanitizePromptField(!string.IsNullOrWhiteSpace(req.CurrentObjetivo) ? req.CurrentObjetivo : ctx.ExistingObjetivo);
            string cleanRdaCarrera = SanitizePromptField(!string.IsNullOrWhiteSpace(req.CurrentRdaCarrera) ? req.CurrentRdaCarrera : ctx.ExistingRdaCarrera);
            string cleanRdaAsig = SanitizePromptField(!string.IsNullOrWhiteSpace(req.CurrentResultadosAprendizaje) ? req.CurrentResultadosAprendizaje : ctx.ExistingResultadosAprendizaje);
            string cleanMetod = SanitizePromptField(!string.IsNullOrWhiteSpace(req.CurrentMetodologiaEnsenanza) ? req.CurrentMetodologiaEnsenanza : ctx.ExistingMetodologia);
            string cleanRec = SanitizePromptField(!string.IsNullOrWhiteSpace(req.CurrentRecursosDidacticos) ? req.CurrentRecursosDidacticos : ctx.ExistingRecursos);

            sb.AppendLine("### SNAPSHOT ACTUAL DEL PEA EN REVISIÓN:");
            sb.AppendLine($"1. DATOS GENERALES DECLARADOS: Créditos={creditos} (Equivalencia RRA: {creditos * 48}h) | Total={declTotal}h | CD={declCd}h | APE={declApe}h | TA={declTa}h | Suma Componentes={declCd + declApe + declTa}h");
            sb.AppendLine($"   - Modalidad declarada: {req.CurrentModalidad ?? ctx.Modalidad} | Unidad Curricular: {req.CurrentUnidadOrganizacion ?? ctx.UnidadOrganizacion} | Nivel: {req.CurrentNivel ?? ctx.SemestreNivel}");
            sb.AppendLine($"2. OBJETIVO GENERAL (Sección 2): {(string.IsNullOrWhiteSpace(cleanObj) ? "(VACÍO / NO REGISTRADO)" : cleanObj)}");

            var rawPrereqs = (req.CurrentPrerrequisitos != null && req.CurrentPrerrequisitos.Count > 0)
                ? req.CurrentPrerrequisitos
                : ctx.ExistingPrerequisites;
            var validPrereqs = rawPrereqs
                .Where(p => !string.IsNullOrWhiteSpace(SanitizePromptField(p.Asignatura)))
                .ToList();

            if (validPrereqs.Count > 0)
            {
                sb.AppendLine($"3. PRERREQUISITOS DECLARADOS (Sección 3): {string.Join("; ", validPrereqs.Select(p => $"{SanitizePromptField(p.Asignatura)} ({SanitizePromptField(p.Observacion)})"))}");
            }
            else if (ctx.SigafiPrerequisites.Count == 0)
            {
                sb.AppendLine("3. PRERREQUISITOS DECLARADOS (Sección 3): Esta asignatura no registra prerrequisitos obligatorios (COINCIDE EXACTAMENTE CON LA MALLA OFICIAL EN SIGAFI -> Estado: CUMPLE).");
            }
            else
            {
                sb.AppendLine($"3. PRERREQUISITOS DECLARADOS (Sección 3): (VACÍO EN EL PEA, pero SIGAFI exige: {string.Join(", ", ctx.SigafiPrerequisites)}).");
            }

            sb.AppendLine($"4. APORTE AL PERFIL DE EGRESO / RDA CARRERA (Sección 4): {(string.IsNullOrWhiteSpace(cleanRdaCarrera) ? "(VACÍO / NO REGISTRADO)" : cleanRdaCarrera)}");
            sb.AppendLine($"5. RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA (Sección 5): {(string.IsNullOrWhiteSpace(cleanRdaAsig) ? "(VACÍO / NO REGISTRADO)" : cleanRdaAsig)}");

            sb.AppendLine($"6. UNIDADES TEMÁTICAS (Sección 6) — Total Unidades={units.Count} | Suma CD={sumUnitsCd}h | Suma APE={sumUnitsApe}h | Suma TA={sumUnitsTa}h | Suma Total Unidades={sumUnitsTotal}h:");
            foreach (var u in units)
            {
                string cleanUnitTitle = SanitizePromptField(u.Titulo);
                string cleanUnitContent = SanitizePromptField(u.Contenidos);
                if (string.Equals(cleanUnitContent, "Contenidos y Subtemas de Aprendizaje", StringComparison.OrdinalIgnoreCase))
                {
                    cleanUnitContent = string.Empty;
                }
                sb.AppendLine($"   - Unidad {u.Num}: {(string.IsNullOrWhiteSpace(cleanUnitTitle) ? $"Unidad {u.Num}" : cleanUnitTitle)} [CD:{u.HorasCD}h, APE:{u.HorasAPE}h, TA:{u.HorasTA}h] -> Contenidos: {(string.IsNullOrWhiteSpace(cleanUnitContent) ? "(SIN CONTENIDOS REGISTRADOS)" : cleanUnitContent)}");
            }

            sb.AppendLine($"7. METODOLOGÍA Y RECURSOS (Sección 7): Metodología={(string.IsNullOrWhiteSpace(cleanMetod) ? "(VACÍO)" : cleanMetod)} | Recursos={(string.IsNullOrWhiteSpace(cleanRec) ? "(VACÍO)" : cleanRec)}");

            sb.AppendLine($"8. PRÁCTICAS APE (Sección 8) — Cantidad={practicas.Count} | Suma Horas Prácticas={sumPracticasHoras}h:");
            foreach (var p in practicas)
            {
                sb.AppendLine($"   - U{p.Unidad}: {SanitizePromptField(p.Nombre)} ({p.Horas}h) | Escenario/Producto: {SanitizePromptField(p.Caracterizacion)} {SanitizePromptField(p.Escenario)} {SanitizePromptField(p.Producto)}");
            }

            var evals = (req.CurrentEvaluaciones != null && req.CurrentEvaluaciones.Count > 0)
                ? req.CurrentEvaluaciones
                : ctx.ExistingEvaluations;
            bool isStandardIstpetEval = evals.Count >= 4 && evals.All(e => Math.Abs(e.Calificacion - 10m) < 0.01m && !string.IsNullOrWhiteSpace(SanitizePromptField(e.Nota)));
            sb.AppendLine($"9. EVALUACIÓN (Sección 9) — Componentes={evals.Count}{(isStandardIstpetEval ? " (ESCALA INSTITUCIONAL ISTPET/SIGAFI: cada componente calificado sobre 10,0 puntos -> Estado: CUMPLE)" : $" | Suma={evals.Sum(e => e.Calificacion)} pts")}: {string.Join(" | ", evals.Select(e => $"{SanitizePromptField(e.Nota)}: {SanitizePromptField(e.Tipo)} ({e.Calificacion}/10 pts)"))}");

            string bibBasica = SanitizePromptField(req.CurrentBibliografiaBasica);
            string bibConsulta = SanitizePromptField(req.CurrentBibliografiaConsulta);
            var bibsList = (req.CurrentBibliografias != null && req.CurrentBibliografias.Count > 0)
                ? req.CurrentBibliografias
                : ctx.ExistingBibliographies;
            if (string.IsNullOrWhiteSpace(bibBasica) && bibsList.Count > 0)
            {
                bibBasica = string.Join(" ; ", bibsList.Where(b => b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase)).Select(b => SanitizePromptField(b.CitaCompletaApa)));
                bibConsulta = string.Join(" ; ", bibsList.Where(b => !b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase)).Select(b => SanitizePromptField(b.CitaCompletaApa)));
            }
            int basCount = bibsList.Count(b => b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase));
            int consCount = bibsList.Count(b => !b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase));
            bool isBibCompliant = basCount >= 3 && consCount >= 3;
            sb.AppendLine($"10. BIBLIOGRAFÍA APA (Sección 10){(isBibCompliant ? $" ({basCount} Básicas y {consCount} de Consulta en APA 7ma -> Estado: CUMPLE)" : "")}: Básica=[{(string.IsNullOrWhiteSpace(bibBasica) ? "VACÍA" : bibBasica)}] | Consulta=[{(string.IsNullOrWhiteSpace(bibConsulta) ? "VACÍA" : bibConsulta)}]");

            sb.AppendLine();
            sb.AppendLine("### TAREA SOLICITADA POR EL EVALUADOR CURRICULAR:");
            if (!string.IsNullOrWhiteSpace(req.CustomQuestion))
            {
                sb.AppendLine($"Pregunta / Instrucción directa del revisor: \"{req.CustomQuestion.Trim()}\"");
                sb.AppendLine("Responde directamente a la consulta del revisor en 'analysis_summary' y acompaña con la verificación curricular, perfil de carrera, horas y observaciones sugeridas si corresponden.");
            }
            else
            {
                switch (focus)
                {
                    case "career_profile":
                        sb.AppendLine("Enfócate en COMPARAR EL PEA CON EL PERFIL DE CARRERA Y LA MALLA CURRICULAR: Analiza si el Objetivo (Sección 2), los RDAs de Carrera y Asignatura (Secciones 4 y 5), los Prerrequisitos (Sección 3) y las Unidades (Sección 6) guardan coherencia real con la carrera, el semestre y los RDAs del Perfil de Egreso.");
                        break;
                    case "hours_audit":
                        sb.AppendLine("Enfócate en la AUDITORÍA DE HORAS, CRÉDITOS Y PRÁCTICAS (CACES / RRA Art. 21): Verifica si los créditos cuadran con las horas totales (48h por crédito), si CD + APE + TA en Sección 1 cuadra con el total, si la suma de horas por unidad en Sección 6 coincide con los componentes de Sección 1, y si las prácticas APE de Sección 8 justifican las horas práctico-experimentales.");
                        break;
                    default:
                        sb.AppendLine("Realiza una EXPLICACIÓN INTEGRAL DEL PROYECTO PEA Y AUDITORÍA EJECUTIVA: Explica de qué trata el PEA, cómo está estructurado pedagógicamente, cómo se alinea con el perfil de la carrera, el estado de su distribución horaria y cuáles son los puntos fuertes o correcciones requeridas antes de emitir el aval.");
                        break;
                }
            }

            return sb.ToString();
        }

        private static PeaAiReviewAnalysisResponseDto ParseAndNormalizeReviewAnalysis(
            string rawJson,
            AcademicPromptContext ctx,
            AnalyzePeaReviewRequestDto req,
            string provider,
            string model)
        {
            var response = new PeaAiReviewAnalysisResponseDto
            {
                ProviderUsed = provider,
                ModelUsed = model
            };

            string cleaned = CleanJsonFence(rawJson);
            try
            {
                using var doc = JsonDocument.Parse(cleaned);
                var root = doc.RootElement;

                response.AnalysisSummary = TryGetString(root, "analysis_summary", "analysisSummary", "resumen", "explicacion");
                response.CareerAlignmentAnalysis = TryGetString(root, "career_alignment_analysis", "careerAlignmentAnalysis", "alineacion_carrera", "perfil_carrera");
                response.HoursComparisonSummary = TryGetString(root, "hours_comparison_summary", "hoursComparisonSummary", "comparacion_horas", "horas");

                if (TryGetArray(root, out var checksArr, "checks", "Checks", "criterios"))
                {
                    foreach (var item in checksArr.EnumerateArray())
                    {
                        string crit = TryGetString(item, "criterion", "Criterion", "criterio");
                        string st = TryGetString(item, "status", "Status", "estado").ToLowerInvariant();
                        string det = TryGetString(item, "detail", "Detail", "detalle");

                        if (st != "cumple" && st != "alerta" && st != "observado")
                        {
                            st = st.Contains("obs") || st.Contains("error") || st.Contains("no") ? "observado"
                               : st.Contains("aler") || st.Contains("warn") ? "alerta"
                               : "cumple";
                        }

                        if (!string.IsNullOrWhiteSpace(crit))
                        {
                            response.Checks.Add(new PeaReviewCheckItemDto
                            {
                                Criterion = crit,
                                Status = st,
                                Detail = det
                            });
                        }
                    }
                }

                if (TryGetArray(root, out var obsArr, "suggested_observations", "suggestedObservations", "observaciones_sugeridas"))
                {
                    foreach (var item in obsArr.EnumerateArray())
                    {
                        string secKey = NormalizeReviewSectionKey(TryGetString(item, "section_key", "sectionKey", "seccion"));
                        string secLabel = TryGetString(item, "section_label", "sectionLabel", "etiqueta_seccion");
                        string sev = TryGetString(item, "severity", "Severity", "severidad").ToLowerInvariant();
                        string text = TryGetString(item, "observation_text", "observationText", "texto", "observacion");

                        if (sev != "alta" && sev != "media" && sev != "sugerencia")
                        {
                            sev = "media";
                        }

                        if (string.IsNullOrWhiteSpace(secLabel))
                        {
                            secLabel = GetReviewSectionLabel(secKey);
                        }

                        if (!string.IsNullOrWhiteSpace(text))
                        {
                            response.SuggestedObservations.Add(new PeaReviewSuggestedObservationDto
                            {
                                SectionKey = secKey,
                                SectionLabel = secLabel,
                                Severity = sev,
                                ObservationText = text
                            });
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _loggerFallback(ex);
                response.AnalysisSummary = !string.IsNullOrWhiteSpace(rawJson)
                    ? rawJson.Trim()
                    : $"Se completó la revisión asistida para {ctx.NombreAsignatura} ({ctx.NombreCarrera}).";
            }

            // Garantizar cálculos deterministas de respaldo si el modelo omitió algún campo
            decimal declTotal = req.CurrentTotalHoras ?? ctx.TotalHoras;
            decimal declCd = req.CurrentHorasCD ?? ctx.HorasCD;
            decimal declApe = req.CurrentHorasAPE ?? ctx.HorasAPE;
            decimal declTa = req.CurrentHorasTA ?? ctx.HorasTA;
            int creditos = req.CurrentCreditos ?? (int)Math.Round(declTotal / 48m);
            if (creditos <= 0 && declTotal > 0) creditos = (int)Math.Max(1, Math.Round(declTotal / 48m));
            var units = (req.CurrentUnidades != null && req.CurrentUnidades.Count > 0) ? req.CurrentUnidades : ctx.ExistingUnits;
            decimal sumUnits = units.Sum(u => u.HorasCD + u.HorasAPE + u.HorasTA);

            bool hasPeaPrereqs = req.CurrentPrerrequisitos != null &&
                req.CurrentPrerrequisitos.Any(p => !string.IsNullOrWhiteSpace(SanitizePromptField(p.Asignatura)));

            // Corrección determinista de Sección 3 (Prerrequisitos): si SIGAFI no exige prerrequisitos y el PEA no los registra, siempre CUMPLE
            if (ctx.SigafiPrerequisites.Count == 0 && !hasPeaPrereqs)
            {
                foreach (var chk in response.Checks)
                {
                    if (chk.Criterion.Contains("Prerrequisito", StringComparison.OrdinalIgnoreCase) ||
                        chk.Criterion.Contains("Sección 3", StringComparison.OrdinalIgnoreCase))
                    {
                        chk.Status = "cumple";
                        chk.Detail = "Coincide con la malla curricular oficial en SIGAFI (esta asignatura no registra prerrequisitos obligatorios).";
                    }
                }
                response.SuggestedObservations.RemoveAll(o => o.SectionKey == "Prerrequisitos");
            }

            // Corrección determinista de Sección 1 (Datos Generales): si Sección 1 cuadra, no generar observación en Sección 1 por falta de horas en Unidades/APE
            bool isSec1Balanced = declTotal > 0 &&
                Math.Abs((declCd + declApe + declTa) - declTotal) < 0.01m &&
                (creditos <= 0 || Math.Abs((creditos * 48m) - declTotal) < 0.01m);

            if (isSec1Balanced)
            {
                response.SuggestedObservations.RemoveAll(o =>
                    o.SectionKey == "NombreAsignatura" &&
                    (o.ObservationText.Contains("unidad", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("sección 6", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("práctica", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("sección 8", StringComparison.OrdinalIgnoreCase)));
            }

            // Corrección determinista de Sección 9 (Evaluación): en ISTPET los 4 componentes normativos se califican sobre 10,0 cada uno
            var evalsList = (req.CurrentEvaluaciones != null && req.CurrentEvaluaciones.Count > 0)
                ? req.CurrentEvaluaciones
                : ctx.ExistingEvaluations;
            bool isStandardEval = evalsList.Count >= 4 &&
                evalsList.All(e => Math.Abs(e.Calificacion - 10m) < 0.01m && !string.IsNullOrWhiteSpace(SanitizePromptField(e.Nota)));
            if (isStandardEval)
            {
                foreach (var chk in response.Checks)
                {
                    if (chk.Criterion.Contains("evaluaci", StringComparison.OrdinalIgnoreCase) ||
                        chk.Criterion.Contains("Sección 9", StringComparison.OrdinalIgnoreCase))
                    {
                        chk.Status = "cumple";
                        chk.Detail = "Cumple con el esquema institucional del ISTPET (4 componentes normativos evaluados sobre base de 10,0 puntos cada uno).";
                    }
                }
                response.SuggestedObservations.RemoveAll(o =>
                    o.SectionKey == "Evaluaciones" &&
                    (o.ObservationText.Contains("40", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("escala", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("100", StringComparison.OrdinalIgnoreCase)));
            }

            // Corrección determinista de Sección 10 (Bibliografía): si cuenta con >= 3 básicas y >= 3 de consulta en APA 7ma, cumple
            var bibsCheck = (req.CurrentBibliografias != null && req.CurrentBibliografias.Count > 0)
                ? req.CurrentBibliografias
                : ctx.ExistingBibliographies;
            bool hasFullBib = bibsCheck.Count(b => b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase)) >= 3 &&
                              bibsCheck.Count(b => !b.TipoBibliografia.Contains("Bas", StringComparison.OrdinalIgnoreCase)) >= 3;
            if (hasFullBib)
            {
                foreach (var chk in response.Checks)
                {
                    if (chk.Criterion.Contains("bibliograf", StringComparison.OrdinalIgnoreCase) ||
                        chk.Criterion.Contains("Sección 10", StringComparison.OrdinalIgnoreCase))
                    {
                        chk.Status = "cumple";
                        chk.Detail = "Registra al menos 3 referencias básicas y 3 de consulta vigentes en formato APA 7ma edición.";
                    }
                }
                response.SuggestedObservations.RemoveAll(o =>
                    o.SectionKey == "Bibliografia" &&
                    (o.ObservationText.Contains("inglés", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("ingles", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("español", StringComparison.OrdinalIgnoreCase) ||
                     o.ObservationText.Contains("idioma", StringComparison.OrdinalIgnoreCase)));
            }

            // Filtrar checks para mantener el foco en los criterios de alto impacto normativo y curricular
            var relevantCheckTerms = new[] { "horas", "crédito", "credito", "unidad", "ape", "práctica", "practica", "perfil", "egreso", "prerrequisito", "prerequisito", "malla", "sección 1", "sección 3", "sección 6", "sección 8" };
            var filteredChecks = response.Checks
                .Where(c => relevantCheckTerms.Any(t => c.Criterion.Contains(t, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            if (filteredChecks.Count >= 3)
            {
                response.Checks = filteredChecks;
            }

            // Consolidar observaciones repetidas para la misma sección en una sola tarjeta ordenada (1..10)
            var sectionOrder = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
            {
                ["NombreAsignatura"] = 1,
                ["ObjetivoAsignatura"] = 2,
                ["Prerrequisitos"] = 3,
                ["AportePerfilEgreso"] = 4,
                ["ResultadosAprendizaje"] = 5,
                ["Unidades"] = 6,
                ["MetodologiaEnsenanza"] = 7,
                ["ActividadesPracticas"] = 8,
                ["Evaluaciones"] = 9,
                ["Bibliografia"] = 10
            };

            response.SuggestedObservations = response.SuggestedObservations
                .GroupBy(o => o.SectionKey, StringComparer.OrdinalIgnoreCase)
                .Select(g =>
                {
                    var first = g.First();
                    string combinedText = string.Join(" ", g.Select(x => x.ObservationText.Trim()).Distinct());
                    return new PeaReviewSuggestedObservationDto
                    {
                        SectionKey = first.SectionKey,
                        SectionLabel = GetReviewSectionLabel(first.SectionKey),
                        Severity = g.Any(x => x.Severity == "alta") ? "alta" : first.Severity,
                        ObservationText = combinedText
                    };
                })
                .OrderBy(o => sectionOrder.TryGetValue(o.SectionKey, out int ord) ? ord : 99)
                .ToList();

            if (string.IsNullOrWhiteSpace(response.HoursComparisonSummary))
            {
                response.HoursComparisonSummary =
                    $"Malla SIGAFI: {ctx.TotalHoras}h ({ctx.HorasCD}h CD, {ctx.HorasAPE}h APE, {ctx.HorasTA}h TA). " +
                    $"Declarado en Sección 1: {declTotal}h ({declCd}h CD, {declApe}h APE, {declTa}h TA). " +
                    $"Suma en Unidades (Sección 6): {sumUnits}h en {units.Count} unidad(es).";
            }

            if (string.IsNullOrWhiteSpace(response.CareerAlignmentAnalysis))
            {
                response.CareerAlignmentAnalysis =
                    $"Asignatura '{ctx.NombreAsignatura}' correspondiente a {ctx.UnidadOrganizacion} ({ctx.SemestreNivel}) de la carrera {ctx.NombreCarrera}.";
            }

            if (string.IsNullOrWhiteSpace(response.AnalysisSummary))
            {
                response.AnalysisSummary =
                    $"Análisis técnico completado para {ctx.NombreAsignatura} de la carrera {ctx.NombreCarrera}. Revise el detalle de alineación al perfil de egreso, balance horario y observaciones sugeridas.";
            }

            return response;
        }

        private static void _loggerFallback(Exception _)
        {
            // No-op static helper for graceful JSON fallback
        }

        private static string NormalizeReviewSectionKey(string rawKey)
        {
            string k = (rawKey ?? string.Empty).Trim();
            if (string.IsNullOrEmpty(k)) return "ObjetivoAsignatura";

            string lower = k.ToLowerInvariant();
            if (lower.Contains("general") || lower.Contains("nombre") || lower.Contains("hora") || lower.Contains("credito") || lower == "1") return "NombreAsignatura";
            if (lower.Contains("objetivo") || lower == "2") return "ObjetivoAsignatura";
            if (lower.Contains("prerreq") || lower == "3") return "Prerrequisitos";
            if (lower.Contains("perfil") || lower.Contains("career") || lower.Contains("rdacarrera") || lower.Contains("aporte") || lower == "4") return "AportePerfilEgreso";
            if (lower.Contains("resultado") || lower.Contains("subject") || lower.Contains("rda") || lower == "5") return "ResultadosAprendizaje";
            if (lower.Contains("contenido") || lower.Contains("unidad") || lower.Contains("content") || lower == "6") return "Unidades";
            if (lower.Contains("metodolog") || lower == "7") return "MetodologiaEnsenanza";
            if (lower.Contains("practica") || lower.Contains("ape") || lower.Contains("actividad") || lower.Contains("recurso") || lower == "8") return "ActividadesPracticas";
            if (lower.Contains("evaluac") || lower.Contains("criterio") || lower == "9") return "Evaluaciones";
            if (lower.Contains("bibliog") || lower == "10") return "Bibliografia";

            return k;
        }

        private static string GetReviewSectionLabel(string sectionKey) => sectionKey switch
        {
            "NombreAsignatura" => "1. Datos Generales de la Asignatura",
            "ObjetivoAsignatura" => "2. Objetivo General de la Asignatura",
            "Prerrequisitos" => "3. Prerrequisitos y Co-requisitos",
            "AportePerfilEgreso" => "4. Resultados de Aprendizaje de Carrera (Perfil de Egreso)",
            "ResultadosAprendizaje" => "5. Resultados de Aprendizaje de la Asignatura",
            "Unidades" or "ContenidosCurriculares" => "6. Contenidos de Enseñanza y Unidades Temáticas",
            "MetodologiaEnsenanza" => "7. Metodología de Enseñanza y Recursos Didácticos",
            "ActividadesPracticas" or "RecursosDidacticos" => "8. Actividades Prácticas y Experimentales (APE)",
            "Evaluaciones" or "CriteriosEvaluacion" => "9. Evaluación del Aprendizaje",
            "Bibliografia" => "10. Bibliografía Institucional (Normas APA)",
            _ => "Sección del PEA"
        };
    }
}


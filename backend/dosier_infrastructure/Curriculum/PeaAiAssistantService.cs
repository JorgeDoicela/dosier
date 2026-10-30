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
            var (userKey, userProvider, userModel, userBaseUrl) = await GetUserConfigAsync(idUsuario, ct);
            var (globalKey, globalProvider, globalModel, globalBaseUrl) = await GetGlobalConfigAsync(ct);

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

            bool isReady = !string.IsNullOrWhiteSpace(effectiveKey) || normalizedProvider.Equals("ollama", StringComparison.OrdinalIgnoreCase);

            return new PeaAiConfigStatusDto
            {
                HasUserApiKey = !string.IsNullOrWhiteSpace(userKey),
                HasGlobalApiKey = !string.IsNullOrWhiteSpace(globalKey) || !string.IsNullOrWhiteSpace(envKey),
                ActiveProvider = normalizedProvider,
                ActiveModel = effectiveModel,
                ActiveBaseUrl = effectiveBaseUrl,
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

            // 1. Resolver API Key, Proveedor, Modelo y BaseUrl
            var (userKey, userProvider, userModel, userBaseUrl) = await GetUserConfigAsync(idUsuario, ct);
            var (globalKey, globalProvider, globalModel, globalBaseUrl) = await GetGlobalConfigAsync(ct);
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

            // 2. Resolver Entidad PEA y su Contexto Institucional SIGAFI + Gobernanza
            var contextData = await ResolveAcademicContextAsync(peaUuid, request, ct);

            // 3. Construir System Prompt y User Prompt con esquema JSON estricto
            string targetSection = string.IsNullOrWhiteSpace(request.TargetSection) ? "all" : request.TargetSection.Trim();
            string systemPrompt = BuildSystemPrompt(contextData, targetSection);
            string userPrompt = BuildUserPrompt(contextData, request, targetSection);

            // 4. Invocar al proveedor LLM con Structured JSON (Gemini nativo, Anthropic nativo u OpenAI-Compatible universal)
            string rawJson;
            if (provider == "gemini" && string.IsNullOrWhiteSpace(request.BaseUrlOverride))
            {
                rawJson = await CallGeminiAsync(apiKey ?? string.Empty, model, systemPrompt, userPrompt, ct);
            }
            else if (provider == "anthropic" && (string.IsNullOrWhiteSpace(baseUrl) || baseUrl.Contains("api.anthropic.com/v1/messages", StringComparison.OrdinalIgnoreCase)))
            {
                rawJson = await CallAnthropicAsync(apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, ct);
            }
            else
            {
                rawJson = await CallOpenAiCompatibleAsync(provider, apiKey ?? string.Empty, model, baseUrl, systemPrompt, userPrompt, ct);
            }

            // 5. Parsear, normalizar y cuadrar horas contra SIGAFI
            var draft = ParseAndNormalizeDraft(rawJson, contextData, provider, model, targetSection);
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

            int totalHoras = pea.TotalHorasAsignatura;
            int horasCd = pea.HorasContactoDocente;
            int horasApe = pea.HorasPracticoExperimental;
            int horasTa = pea.HorasAutonomo;

            if (totalHoras <= 0 && pea.IdDetalleMalla.HasValue)
            {
                var detalle = await _context.DetalleMallas.AsNoTracking().FirstOrDefaultAsync(d => d.IdDetalleMalla == pea.IdDetalleMalla, ct);
                if (detalle != null)
                {
                    totalHoras = detalle.Horas ?? 0;
                    horasCd = detalle.HorasDocente ?? 0;
                    horasApe = decimal.ToInt32(detalle.HorasPracticoExperimental ?? 0m);
                    horasTa = Math.Max(0, totalHoras - horasCd - horasApe);
                }
            }

            if (request.CurrentTotalHoras.HasValue && request.CurrentTotalHoras.Value > 0 && totalHoras <= 0)
            {
                totalHoras = request.CurrentTotalHoras.Value;
            }

            // Si el docente ya configuró en el editor una distribución explícita (CD > 0 o APE > 0) que cuadra con el total, respetarla
            if (request.CurrentHorasCD.HasValue && request.CurrentHorasAPE.HasValue && request.CurrentHorasTA.HasValue)
            {
                int reqCd = Math.Max(0, request.CurrentHorasCD.Value);
                int reqApe = Math.Max(0, request.CurrentHorasAPE.Value);
                int reqTa = Math.Max(0, request.CurrentHorasTA.Value);
                if ((reqCd > 0 || reqApe > 0) && totalHoras > 0 && (reqCd + reqApe + reqTa == totalHoras))
                {
                    horasCd = reqCd;
                    horasApe = reqApe;
                    horasTa = reqTa;
                }
            }

            if (totalHoras <= 0)
            {
                horasCd = horasCd > 0 ? horasCd : 48;
                horasApe = horasApe > 0 ? horasApe : 48;
                horasTa = horasTa > 0 ? horasTa : 48;
                totalHoras = horasCd + horasApe + horasTa;
            }
            else if (horasCd <= 0 || horasApe <= 0)
            {
                // En SIGAFI detallemallas muchas asignaturas solo registran el Total de Horas (ej. 144) con HorasDocente=0 y HorasAPE=0,
                // lo que dejaba 0 CD / 0 APE / 144 TA. Distribuimos equitativamente en los 3 componentes normativos (CD, APE, TA).
                int baseThird = totalHoras / 3;
                horasCd = baseThird;
                horasApe = baseThird;
                horasTa = totalHoras - horasCd - horasApe;
            }
            else if (horasCd + horasApe + horasTa != totalHoras)
            {
                horasTa = Math.Max(0, totalHoras - horasCd - horasApe);
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
                ExistingUnits = pea.Unidades.OrderBy(u => u.Orden).Select(u => new PeaDraftUnidadDto
                {
                    Num = u.NumeroUnidad,
                    Titulo = u.NombreUnidad,
                    Contenidos = string.Join("\n", u.Temas.OrderBy(t => t.Orden).Select(t => t.DescripcionSubtemas)),
                    HorasCD = u.HorasDocencia,
                    HorasAPE = u.HorasPracticoExp,
                    HorasTA = u.HorasAutonomo
                }).ToList()
            };
        }

        private static string BuildSystemPrompt(AcademicPromptContext ctx, string targetSection)
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
            sb.AppendLine("2. Los campos 'objetivo_asignatura', 'rda_carrera', 'resultados_aprendizaje', 'metodologia_ensenanza', 'recursos_didacticos', 'bibliografia_basica' y 'bibliografia_consulta' deben entregarse en HTML semántico limpio (<p>, <ul>, <li>, <strong>).");
            sb.AppendLine("3. En 'prerrequisitos', si la asignatura requiere materias previas, genera cada elemento con 'asignatura' (nombre de la materia previa) y 'observacion' ('Haber cursado y aprobado la asignatura según malla curricular'). Si no requiere prerrequisitos, devuelve un arreglo vacío []. NUNCA generes elementos con cadenas vacías.");
            sb.AppendLine("4. En 'unidades', genera exactamente 4 unidades temáticas coherentes. En 'titulo' escribe SOLO el nombre temático de la unidad (sin el prefijo 'Unidad 1:'). La suma de 'horas_cd' de todas las unidades DEBE ser exactamente " + ctx.HorasCD + " (> 0 en cada unidad). La suma de 'horas_ape' DEBE ser exactamente " + ctx.HorasAPE + " (> 0 en cada unidad). La suma de 'horas_ta' DEBE ser exactamente " + ctx.HorasTA + " (> 0 en cada unidad). NUNCA dejes componentes de horas en cero.");
            sb.AppendLine("5. En cada unidad, el campo 'contenidos' debe listar los temas y subtemas numerados separados por saltos de línea (ej: '1.1 Conceptos fundamentales\\n1.2 Técnicas aplicadas\\n1.3 Procesos experimentales').");
            sb.AppendLine("6. En 'actividades_practicas', genera al menos 1 práctica experimental por cada unidad temática, especificando unidad (número), nombre descriptivo de la práctica, horas, escenario (taller/laboratorio/cocina experimental) y producto verificable.");
            sb.AppendLine("7. En 'evaluaciones', incluye los 4 componentes normativos sobre 10 puntos (Gestión Formativa / Docencia, Gestión Práctica y Experimental, Trabajo Autónomo, Evaluación Sumativa).");
            sb.AppendLine("8. En 'bibliografias', incluye al menos 3 obras de tipo 'Basica' y 3 de tipo 'Consulta' reales y vigentes en formato APA 7ma edición.");
            sb.AppendLine($"9. Sección objetivo solicitada: '{targetSection}'.");

            return sb.ToString();
        }

        private static string BuildUserPrompt(AcademicPromptContext ctx, GeneratePeaDraftRequestDto request, string targetSection)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Genera el contenido curricular estructurado para la asignatura '{ctx.NombreAsignatura}' de la carrera '{ctx.NombreCarrera}'.");

            var referenceUnits = (request.CurrentUnidades != null && request.CurrentUnidades.Count > 0)
                ? request.CurrentUnidades
                : ctx.ExistingUnits;

            if (referenceUnits.Count > 0 && targetSection != "all" && targetSection != "pea_contents_section")
            {
                sb.AppendLine("Toma como base las siguientes unidades temáticas ya definidas en la asignatura:");
                foreach (var u in referenceUnits)
                {
                    sb.AppendLine($"- Unidad {u.Num}: {u.Titulo} ({u.Contenidos})");
                }
            }

            if (!string.IsNullOrWhiteSpace(request.CustomInstructions))
            {
                sb.AppendLine();
                sb.AppendLine("INSTRUCCIONES ESPECÍFICAS DEL DOCENTE:");
                sb.AppendLine(request.CustomInstructions.Trim());
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
            CancellationToken ct)
        {
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(90);

            string cleanModel = model.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
                ? model.Substring("models/".Length)
                : model;

            string endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{cleanModel}:generateContent?key={Uri.EscapeDataString(apiKey)}";

            var payload = new
            {
                system_instruction = new
                {
                    parts = new[] { new { text = systemPrompt } }
                },
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = userPrompt } }
                    }
                },
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

            var payload = new
            {
                model = model,
                max_tokens = 8192,
                temperature = 0.35,
                system = systemPrompt,
                messages = new[]
                {
                    new { role = "user", content = userPrompt }
                }
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

                object payload;
                if (isReasoner || minimalMode)
                {
                    payload = new
                    {
                        model = model,
                        messages = new[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = userPrompt }
                        }
                    };
                }
                else
                {
                    payload = new
                    {
                        model = model,
                        temperature = 0.35,
                        response_format = new { type = "json_object" },
                        messages = new[]
                        {
                            new { role = "system", content = systemPrompt },
                            new { role = "user", content = userPrompt }
                        }
                    };
                }

                req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
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
            string targetSection)
        {
            var result = new PeaStructuredDraftDto();
            using var doc = JsonDocument.Parse(rawJson, new JsonDocumentOptions
            {
                AllowTrailingCommas = true,
                CommentHandling = JsonCommentHandling.Skip
            });
            var root = doc.RootElement;

            result.ObjetivoAsignatura = TryGetString(root, "objetivo_asignatura", "ObjetivoAsignatura");
            result.RdaCarrera = TryGetString(root, "rda_carrera", "RdaCarrera");
            result.ResultadosAprendizaje = TryGetString(root, "resultados_aprendizaje", "ResultadosAprendizaje");
            result.MetodologiaEnsenanza = TryGetString(root, "metodologia_ensenanza", "MetodologiaEnsenanza");
            result.RecursosDidacticos = TryGetString(root, "recursos_didacticos", "RecursosDidacticos");
            result.BibliografiaBasica = TryGetString(root, "bibliografia_basica", "BibliografiaBasica");
            result.BibliografiaConsulta = TryGetString(root, "bibliografia_consulta", "BibliografiaConsulta");

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

            if (result.Prerrequisitos.Count == 0 && ctx.SigafiPrerequisites.Count > 0)
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
                    int cd = TryGetInt(item, "horas_cd", "horasCD", "HorasCD", "horas_docencia");
                    int ape = TryGetInt(item, "horas_ape", "horasAPE", "HorasAPE", "horas_practica");
                    int ta = TryGetInt(item, "horas_ta", "horasTA", "HorasTA", "horas_autonomo");

                    if (!string.IsNullOrWhiteSpace(cleanTitulo) || !string.IsNullOrWhiteSpace(contenidos))
                    {
                        result.Unidades.Add(new PeaDraftUnidadDto
                        {
                            Num = idx++,
                            Titulo = string.IsNullOrWhiteSpace(cleanTitulo) ? $"Fundamentos y Aplicaciones {idx - 1}" : cleanTitulo,
                            Contenidos = contenidos,
                            HorasCD = Math.Max(0, cd),
                            HorasAPE = Math.Max(0, ape),
                            HorasTA = Math.Max(0, ta)
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
                    int horas = TryGetInt(item, "horas", "Horas", "duracion_horas");
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
                            Horas = horas > 0 ? horas : 2,
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

            // Sincronizar campos HTML BibliografiaBasica y BibliografiaConsulta desde la lista estructurada si vienen vacíos
            if (string.IsNullOrWhiteSpace(result.BibliografiaBasica) && result.Bibliografias.Any(b => b.TipoBibliografia == "Basica"))
            {
                var items = result.Bibliografias
                    .Where(b => b.TipoBibliografia == "Basica")
                    .Select((b, i) => $"<p>{i + 1}. {System.Net.WebUtility.HtmlEncode(b.CitaCompletaApa)}</p>");
                result.BibliografiaBasica = string.Join("", items);
            }

            if (string.IsNullOrWhiteSpace(result.BibliografiaConsulta) && result.Bibliografias.Any(b => b.TipoBibliografia == "Consulta"))
            {
                var items = result.Bibliografias
                    .Where(b => b.TipoBibliografia == "Consulta")
                    .Select((b, i) => $"<p>{i + 1}. {System.Net.WebUtility.HtmlEncode(b.CitaCompletaApa)}</p>");
                result.BibliografiaConsulta = string.Join("", items);
            }

            // Resumen de validación matemática y secciones pobladas
            int genCd = result.Unidades.Sum(u => u.HorasCD);
            int genApe = result.Unidades.Sum(u => u.HorasAPE);
            int genTa = result.Unidades.Sum(u => u.HorasTA);
            int genTotal = genCd + genApe + genTa;

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

            result.ValidationSummary = new PeaDraftValidationSummaryDto
            {
                ProviderUsed = provider,
                ModelUsed = model,
                TargetSection = targetSection,
                SigafiHorasCD = ctx.HorasCD,
                SigafiHorasAPE = ctx.HorasAPE,
                SigafiHorasTA = ctx.HorasTA,
                SigafiTotalHoras = ctx.TotalHoras,
                GeneratedHorasCD = genCd,
                GeneratedHorasAPE = genApe,
                GeneratedHorasTA = genTa,
                GeneratedTotalHoras = genTotal,
                IsHoursExactMatch = genCd == ctx.HorasCD && genApe == ctx.HorasAPE && genTa == ctx.HorasTA,
                GeneratedSections = generatedSections
            };

            return result;
        }

        private static void ReconcileUnitHoursWithSigafi(
            List<PeaDraftUnidadDto> unidades,
            int targetCd,
            int targetApe,
            int targetTa)
        {
            if (unidades.Count == 0) return;

            int sum = targetCd + targetApe + targetTa;
            if (sum > 0 && (targetCd <= 0 || targetApe <= 0))
            {
                int third = sum / 3;
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
            Func<PeaDraftUnidadDto, int> getter,
            Action<PeaDraftUnidadDto, int> setter,
            int targetTotal)
        {
            int count = unidades.Count;
            if (targetTotal <= 0)
            {
                foreach (var u in unidades) setter(u, 0);
                return;
            }

            int currentSum = unidades.Sum(getter);
            if (currentSum == targetTotal) return;

            if (currentSum <= 0)
            {
                int baseVal = targetTotal / count;
                int rem = targetTotal % count;
                for (int i = 0; i < count; i++)
                {
                    setter(unidades[i], baseVal + (i < rem ? 1 : 0));
                }
                return;
            }

            int runningSum = 0;
            for (int i = 0; i < count - 1; i++)
            {
                double ratio = (double)getter(unidades[i]) / currentSum;
                int proportional = (int)Math.Round(ratio * targetTotal);
                if (runningSum + proportional > targetTotal)
                {
                    proportional = Math.Max(0, targetTotal - runningSum);
                }
                setter(unidades[i], proportional);
                runningSum += proportional;
            }

            setter(unidades[count - 1], Math.Max(0, targetTotal - runningSum));
        }

        private async Task<(string? ApiKey, string? Provider, string? Model, string? BaseUrl)> GetUserConfigAsync(int idUsuario, CancellationToken ct)
        {
            if (idUsuario <= 0) return (null, null, null, null);
            var meta = await _context.DocUsuariosMetadata
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.IdUsuario == idUsuario, ct);

            if (meta == null || string.IsNullOrWhiteSpace(meta.Configuracion))
                return (null, null, null, null);

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

                string? rawKey = TryUnprotect(protectedKey);
                return (rawKey, provider, model, baseUrl);
            }
            catch
            {
                return (null, null, null, null);
            }
        }

        private async Task<(string? ApiKey, string? Provider, string? Model, string? BaseUrl)> GetGlobalConfigAsync(CancellationToken ct)
        {
            var keys = new[] { GlobalKeyClave, GlobalProviderClave, GlobalModelClave, GlobalBaseUrlClave };
            var configs = await _context.DocConfigsGenerales
                .AsNoTracking()
                .Where(c => keys.Contains(c.Clave))
                .ToListAsync(ct);

            string? protectedKey = configs.FirstOrDefault(c => c.Clave == GlobalKeyClave)?.Valor;
            string? provider = configs.FirstOrDefault(c => c.Clave == GlobalProviderClave)?.Valor;
            string? model = configs.FirstOrDefault(c => c.Clave == GlobalModelClave)?.Valor;
            string? baseUrl = configs.FirstOrDefault(c => c.Clave == GlobalBaseUrlClave)?.Valor;

            return (TryUnprotect(protectedKey), provider, model, baseUrl);
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

        private sealed class AcademicPromptContext
        {
            public string PeaUuid { get; set; } = string.Empty;
            public string NombreAsignatura { get; set; } = string.Empty;
            public string CodigoAsignatura { get; set; } = string.Empty;
            public string NombreCarrera { get; set; } = string.Empty;
            public string SemestreNivel { get; set; } = string.Empty;
            public string Modalidad { get; set; } = "Presencial";
            public string UnidadOrganizacion { get; set; } = "Unidad Profesional";
            public int HorasCD { get; set; }
            public int HorasAPE { get; set; }
            public int HorasTA { get; set; }
            public int TotalHoras { get; set; }
            public List<string> SigafiPrerequisites { get; set; } = new();
            public List<string> RdasPerfilEgreso { get; set; } = new();
            public string? ModeloEducativoResumen { get; set; }
            public List<PeaDraftUnidadDto> ExistingUnits { get; set; } = new();
        }
    }
}


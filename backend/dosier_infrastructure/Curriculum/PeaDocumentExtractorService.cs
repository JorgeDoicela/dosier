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
    public class PeaDocumentExtractorService : IPeaDocumentExtractorService
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
        private readonly ILogger<PeaDocumentExtractorService> _logger;

        public PeaDocumentExtractorService(
            DosierContext context,
            IHttpClientFactory httpClientFactory,
            IDataProtectionProvider dataProtectionProvider,
            IConfiguration configuration,
            ILogger<PeaDocumentExtractorService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _protector = dataProtectionProvider.CreateProtector(ProtectorPurpose);
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<PeaStructuredDraftDto> ExtractAndMapDocumentAsync(
            string peaUuid,
            int idUsuario,
            ImportPeaDocumentRequestDto request,
            CancellationToken ct = default)
        {
            if (string.IsNullOrWhiteSpace(peaUuid))
            {
                throw new ArgumentException("Se requiere el identificador UUID del PEA o de la instancia documental.");
            }

            if (request.FileBytes == null || request.FileBytes.Length == 0)
            {
                throw new ArgumentException("El archivo subido está vacío.");
            }

            if (request.FileBytes.Length > 15 * 1024 * 1024)
            {
                throw new InvalidOperationException("El archivo supera el límite máximo permitido de 15 MB.");
            }

            // 1. Extraer texto estructurado digital (.pdf o .docx) rechazando estrictamente imágenes
            string extractedDocumentText = ExtractDigitalDocumentText(request.FileName, request.ContentType, request.FileBytes);

            // 2. Resolver API Key, Proveedor, Modelo y BaseUrl
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
                throw new InvalidOperationException("No existe una API Key configurada para el motor de extracción y estructuración. Configure su API Key antes de importar un documento.");
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

            // 3. Resolver contexto académico SIGAFI para cuadrar horas e ignorar encabezados antiguos
            var contextReq = new GeneratePeaDraftRequestDto
            {
                TargetSection = "all",
                CurrentHorasCD = request.CurrentHorasCD,
                CurrentHorasAPE = request.CurrentHorasAPE,
                CurrentHorasTA = request.CurrentHorasTA,
                CurrentTotalHoras = request.CurrentTotalHoras
            };
            var contextData = await ResolveAcademicContextAsync(peaUuid, contextReq, ct);

            // 4. Construir Prompts especializados para estructuración de documento importado
            string systemPrompt = BuildExtractionSystemPrompt(contextData);
            string userPrompt = BuildDocumentImportUserPrompt(contextData, request.FileName, extractedDocumentText, request.CustomInstructions);

            // 5. Invocar al motor LLM para transformar la extracción en el esquema JSON normativo
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

            // 6. Parsear, normalizar y reconciliar horas contra SIGAFI
            return ParseAndNormalizeDraft(rawJson, contextData, provider, model);
        }

        public static string ExtractDigitalDocumentText(string fileName, string contentType, byte[] fileBytes)
        {
            string ext = Path.GetExtension(fileName ?? string.Empty).ToLowerInvariant();
            string mime = (contentType ?? string.Empty).ToLowerInvariant();

            if (mime.StartsWith("image/") ||
                ext is ".png" or ".jpg" or ".jpeg" or ".webp" or ".gif" or ".bmp" or ".tiff" or ".tif" or ".svg")
            {
                throw new InvalidOperationException("No se aceptan archivos de imagen. Suba únicamente un documento digital en formato PDF (.pdf) o Word (.docx).");
            }

            if (ext != ".pdf" && ext != ".docx")
            {
                throw new InvalidOperationException("Formato de archivo no soportado. Solo se admiten documentos digitales PDF (.pdf) o Word (.docx).");
            }

            string extracted = ext == ".pdf"
                ? ExtractTextFromDigitalPdf(fileBytes)
                : ExtractTextFromWordDocx(fileBytes);

            int alphaNumericCount = extracted.Count(char.IsLetterOrDigit);
            if (alphaNumericCount < 50)
            {
                throw new InvalidOperationException(
                    ext == ".pdf"
                        ? "El archivo PDF no contiene texto digital seleccionable (parece ser un PDF escaneado como imagen). Suba un PDF generado digitalmente o un archivo Word (.docx)."
                        : "El documento Word (.docx) no contiene suficiente contenido textual curricular para procesar.");
            }

            // Limitar a 45,000 caracteres para proteger la ventana de contexto del modelo
            if (extracted.Length > 45000)
            {
                extracted = extracted.Substring(0, 45000);
            }

            return extracted;
        }

        public static string ExtractTextFromDigitalPdf(byte[] pdfBytes)
        {
            try
            {
                using var ms = new MemoryStream(pdfBytes);
                using var reader = new PdfReader(ms);
                using var pdfDoc = new PdfDocument(reader);

                var sb = new StringBuilder();
                int numPages = pdfDoc.GetNumberOfPages();
                for (int pageNum = 1; pageNum <= numPages; pageNum++)
                {
                    var page = pdfDoc.GetPage(pageNum);
                    string pageText = PdfTextExtractor.GetTextFromPage(page, new SimpleTextExtractionStrategy());
                    if (!string.IsNullOrWhiteSpace(pageText))
                    {
                        sb.AppendLine($"--- PÁGINA {pageNum} ---");
                        sb.AppendLine(pageText.Trim());
                        sb.AppendLine();
                    }
                }

                return sb.ToString().Trim();
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                throw new InvalidOperationException("No se pudo leer el archivo PDF. Verifique que sea un documento PDF válido y sin contraseña.", ex);
            }
        }

        public static string ExtractTextFromWordDocx(byte[] docxBytes)
        {
            try
            {
                using var ms = new MemoryStream(docxBytes);
                using var archive = new ZipArchive(ms, ZipArchiveMode.Read);
                var docEntry = archive.GetEntry("word/document.xml");
                if (docEntry == null)
                {
                    throw new InvalidOperationException("El archivo .docx no contiene una estructura OpenXML válida (word/document.xml).");
                }

                using var entryStream = docEntry.Open();
                var xdoc = XDocument.Load(entryStream);
                XNamespace w = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

                var body = xdoc.Root?.Element(w + "body");
                if (body == null)
                {
                    return string.Empty;
                }

                var sb = new StringBuilder();
                ExtractOpenXmlContainerElements(body, w, sb);

                return sb.ToString().Trim();
            }
            catch (Exception ex) when (ex is not InvalidOperationException)
            {
                throw new InvalidOperationException("No se pudo procesar el archivo Word (.docx). Asegúrese de subir un archivo .docx válido.", ex);
            }
        }

        private static void ExtractOpenXmlContainerElements(XElement container, XNamespace w, StringBuilder sb)
        {
            foreach (var element in container.Elements())
            {
                if (element.Name == w + "p")
                {
                    string pText = ExtractOpenXmlParagraphText(element, w);
                    if (!string.IsNullOrWhiteSpace(pText))
                    {
                        sb.AppendLine(pText);
                    }
                }
                else if (element.Name == w + "tbl")
                {
                    sb.AppendLine("[TABLA DOCUMENTAL]");
                    foreach (var row in element.Elements(w + "tr"))
                    {
                        var cells = row.Elements(w + "tc")
                            .Select(tc =>
                            {
                                var cellParagraphs = tc.Descendants(w + "p")
                                    .Select(p => ExtractOpenXmlParagraphText(p, w))
                                    .Where(t => !string.IsNullOrWhiteSpace(t));
                                return string.Join(" / ", cellParagraphs);
                            })
                            .ToList();

                        if (cells.Any(c => !string.IsNullOrWhiteSpace(c)))
                        {
                            sb.AppendLine(string.Join(" | ", cells));
                        }
                    }
                    sb.AppendLine("[FIN TABLA]");
                }
                else if (element.HasElements)
                {
                    ExtractOpenXmlContainerElements(element, w, sb);
                }
            }
        }

        private static string ExtractOpenXmlParagraphText(XElement paragraph, XNamespace w)
        {
            var sb = new StringBuilder();
            foreach (var node in paragraph.Descendants())
            {
                if (node.Name == w + "t")
                {
                    sb.Append(node.Value);
                }
                else if (node.Name == w + "tab")
                {
                    sb.Append('\t');
                }
                else if (node.Name == w + "br" || node.Name == w + "cr")
                {
                    sb.Append(' ');
                }
            }
            return sb.ToString().Trim();
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
                int baseThird = totalHoras / 3;
                horasCd = baseThird;
                horasApe = baseThird;
                horasTa = totalHoras - horasCd - horasApe;
            }
            else if (horasCd + horasApe + horasTa != totalHoras)
            {
                horasTa = Math.Max(0, totalHoras - horasCd - horasApe);
            }

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
                TotalHoras = totalHoras
            };
        }

        private static string BuildExtractionSystemPrompt(AcademicPromptContext ctx)
        {
            var sb = new StringBuilder();
            sb.AppendLine("Eres un motor determinista de extracción y análisis sintáctico (Parser) de documentos curriculares (PEA / Sílabo) del ISTPET.");
            sb.AppendLine("Tu ÚNICA función es LEER Y EXTRAER con absoluta fidelidad textual los contenidos que están redactados en el texto y tablas del documento subido.");
            sb.AppendLine();
            sb.AppendLine("REGLAS INNEGOCIABLES DE FIDELIDAD DE EXTRACCIÓN:");
            sb.AppendLine("1. FIDELIDAD TEXTUAL ABSOLUTA: Extrae el texto exacto que el autor redactó en el documento para cada sección curricular (objetivo de la asignatura, prerrequisitos, resultados de aprendizaje de la carrera, resultados de aprendizaje de la asignatura, unidades temáticas, contenidos temáticos, actividades prácticas, metodología, recursos y bibliografía).");
            sb.AppendLine("2. PROHIBIDO GENERAR, INVENTAR O SUSTITUIR LA MATERIA: Queda terminantemente PROHIBIDO inventar contenidos pedagógicos o sustituir la materia del archivo. Sea cual sea la materia redactada en el archivo (ej. Programación Web, Node.js, Cocina, etc.), extrae con fidelidad esa materia y sus temas. NUNCA sustituyas el contenido del documento por otra asignatura ni intentes adaptarlo o inventar temas que no estén en el texto.");
            sb.AppendLine("3. SECCIONES AUSENTES: Si alguna sección no aparece en el texto del documento, devuélvela como cadena vacía \"\" o arreglo vacío []. NUNCA inventes texto para rellenar secciones ausentes.");
            sb.AppendLine("4. PRERREQUISITOS: En 'prerrequisitos', extrae las filas exactas de materias previas que aparezcan en la tabla del archivo (ej. 'Programación Web II'). Si no hay tabla de prerrequisitos, devuelve un arreglo vacío [].");
            sb.AppendLine("5. UNIDADES Y CONTENIDOS: Extrae cada unidad temática con su título real y sus subtemas tal como aparecen en el documento. Si el documento indica horas de contacto docente (CD), práctico-experimental (APE) y trabajo autónomo (TA), extrae esos valores numéricos exactos. Si un título en el documento original quedó cortado o fragmentado entre celdas (ej. 'UNIDAD 1: FUNDAMENTOS DE' o 'UNIDAD 3: MEJORES PRÁCTICAS Y ESTRATEGIAS DE' con 'SEGURIDAD' en la línea inferior), completa o une el título de manera integral y profesional (ej. 'Fundamentos de Sistemas Web', 'Mejores Prácticas y Estrategias de Seguridad'). NUNCA dejes títulos cortados que terminen en conectores como 'DE' o 'PARA'. En 'contenidos', extrae la lista de temas y subtemas ordenados línea por línea, omitiendo números de fila aislados de columnas adyacentes (como '1', '2', '3').");
            sb.AppendLine("6. FORMATO DE SALIDA: Devuelve exclusivamente un objeto JSON válido que cumpla la estructura solicitada, sin explicaciones ni bloques de texto fuera del JSON.");
            return sb.ToString();
        }

        private static string BuildDocumentImportUserPrompt(
            AcademicPromptContext ctx,
            string fileName,
            string extractedDocumentText,
            string? customInstructions)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Analiza el siguiente texto extraído del archivo '{fileName}' y mapea con estricta fidelidad textual sus secciones al esquema JSON del PEA.");
            sb.AppendLine();
            sb.AppendLine("REGLAS CLAVE DE EXTRACCIÓN:");
            sb.AppendLine("- Extrae exactamente el texto y contenidos presentes en el documento, respetando fielmente la redacción original.");
            sb.AppendLine("- NO alteres los temas, objetivos ni contenidos de las materias que están en el archivo.");
            sb.AppendLine("- Si una sección no está presente en el archivo, déjala vacía (\"\").");

            if (!string.IsNullOrWhiteSpace(customInstructions))
            {
                sb.AppendLine();
                sb.AppendLine("INSTRUCCIONES ADICIONALES DEL USUARIO PARA LA EXTRACCIÓN:");
                sb.AppendLine(customInstructions.Trim());
            }

            sb.AppendLine();
            sb.AppendLine("--- INICIO DEL TEXTO EXTRAÍDO DEL DOCUMENTO ---");
            sb.AppendLine(extractedDocumentText);
            sb.AppendLine("--- FIN DEL TEXTO EXTRAÍDO DEL DOCUMENTO ---");
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
            client.Timeout = TimeSpan.FromSeconds(120);

            string cleanModel = model.StartsWith("models/", StringComparison.OrdinalIgnoreCase)
                ? model.Substring(7)
                : model;

            string url = $"https://generativelanguage.googleapis.com/v1beta/models/{cleanModel}:generateContent?key={apiKey}";

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
                    response_mime_type = "application/json",
                    temperature = 0.2
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            using var response = await client.PostAsync(url, content, ct);
            string responseBody = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[DOSIER EXTRACTOR] Error de Gemini ({StatusCode}): {Body}", (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El servicio Gemini rechazó la solicitud (HTTP {(int)response.StatusCode}). Verifique su API Key o cuota.");
            }

            using var doc = JsonDocument.Parse(responseBody);
            var root = doc.RootElement;
            if (root.TryGetProperty("candidates", out var candidates) &&
                candidates.ValueKind == JsonValueKind.Array &&
                candidates.GetArrayLength() > 0)
            {
                var candidate = candidates[0];
                if (candidate.TryGetProperty("content", out var candContent) &&
                    candContent.TryGetProperty("parts", out var parts) &&
                    parts.ValueKind == JsonValueKind.Array &&
                    parts.GetArrayLength() > 0)
                {
                    var firstPart = parts[0];
                    if (firstPart.TryGetProperty("text", out var textEl))
                    {
                        return CleanJsonFence(textEl.GetString() ?? "{}");
                    }
                }
            }

            throw new InvalidOperationException("Gemini no devolvió un bloque de texto JSON en la respuesta.");
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
                temperature = 0.2,
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
                _logger.LogWarning("[DOSIER EXTRACTOR] Error de Anthropic ({StatusCode}): {Body}", (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El proveedor Anthropic rechazó la solicitud (HTTP {(int)response.StatusCode}).");
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
                    req.Headers.TryAddWithoutValidation("X-Title", "DOSIER ISTPET Curriculum Extractor");
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
                        temperature = 0.2,
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

            if (!response.IsSuccessStatusCode && !isReasoner &&
                ((int)response.StatusCode == 400 || (int)response.StatusCode == 422))
            {
                response.Dispose();
                response = await SendRequestAsync(minimalMode: true);
                responseBody = await response.Content.ReadAsStringAsync(ct);
            }

            string providerLabel = provider.ToUpperInvariant();
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("[DOSIER EXTRACTOR] Error de {Provider} ({StatusCode}): {Body}", providerLabel, (int)response.StatusCode, responseBody);
                throw new InvalidOperationException($"El proveedor {providerLabel} rechazó la solicitud (HTTP {(int)response.StatusCode}). Verifique endpoint, clave o saldo.");
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
            string model)
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
                    contenidos = CleanContenidosOrphanNumbers(contenidos);
                    cleanTitulo = CompleteTruncatedUnitTitle(cleanTitulo, contenidos, idx);

                    int cd = TryGetInt(item, "horas_cd", "horasCD", "HorasCD", "horas_docencia");
                    int ape = TryGetInt(item, "horas_ape", "horasAPE", "HorasAPE", "horas_practica");
                    int ta = TryGetInt(item, "horas_ta", "horasTA", "HorasTA", "horas_autonomo");

                    if (!string.IsNullOrWhiteSpace(cleanTitulo) || !string.IsNullOrWhiteSpace(contenidos))
                    {
                        result.Unidades.Add(new PeaDraftUnidadDto
                        {
                            Num = idx++,
                            Titulo = string.IsNullOrWhiteSpace(cleanTitulo) ? $"Unidad Temática {idx - 1}" : cleanTitulo,
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

            // Sincronizar campos HTML BibliografiaBasica y BibliografiaConsulta
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

            // Resumen de validación
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
                TargetSection = "all",
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

        private static string CleanContenidosOrphanNumbers(string? contenidos)
        {
            if (string.IsNullOrWhiteSpace(contenidos)) return string.Empty;
            var lines = contenidos.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            var cleanLines = new List<string>();
            foreach (var l in lines)
            {
                var trimmed = l.Trim();
                if (System.Text.RegularExpressions.Regex.IsMatch(trimmed, @"^\d{1,2}$"))
                {
                    continue;
                }
                cleanLines.Add(l);
            }
            return string.Join("\n", cleanLines).Trim();
        }

        private static string CompleteTruncatedUnitTitle(string title, string contenidos, int unitNum)
        {
            if (string.IsNullOrWhiteSpace(title)) return $"Unidad Temática {unitNum}";
            var trimmed = title.Trim();
            var lower = trimmed.ToLowerInvariant();

            bool isIncomplete = lower.EndsWith(" de") || lower.EndsWith(" del") || lower.EndsWith(" para") ||
                                lower.EndsWith(" en") || lower.EndsWith(" y") || lower.EndsWith(" con") ||
                                lower == "fundamentos" || lower == "fundamentos de" ||
                                lower == "arquitecturas" || lower == "arquitectura de" ||
                                lower == "introduccion a" || lower == "introducción a";

            if (isIncomplete && !string.IsNullOrWhiteSpace(contenidos))
            {
                var firstLine = contenidos.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries)
                    .Select(l => l.Trim())
                    .FirstOrDefault(l => !string.IsNullOrWhiteSpace(l) && !System.Text.RegularExpressions.Regex.IsMatch(l, @"^\d+$"));

                if (!string.IsNullOrWhiteSpace(firstLine))
                {
                    var cleanTopic = System.Text.RegularExpressions.Regex.Replace(
                        firstLine,
                        @"^(tema\s*\d+\s*[:\.\-]?|\d+(\.\d+)*\s*[:\.\-]?)",
                        "",
                        System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();

                    cleanTopic = System.Text.RegularExpressions.Regex.Replace(
                        cleanTopic,
                        @"^(introducción\s+a\s+(los|las|la|el)?\s*)",
                        "",
                        System.Text.RegularExpressions.RegexOptions.IgnoreCase).Trim();

                    if (!string.IsNullOrWhiteSpace(cleanTopic))
                    {
                        if (lower.EndsWith(" de") || lower == "fundamentos")
                        {
                            return $"Fundamentos de {cleanTopic}";
                        }
                        if (lower == "arquitecturas")
                        {
                            return $"Arquitecturas Web y {cleanTopic}";
                        }
                        return $"{trimmed} {cleanTopic}";
                    }
                }
            }

            return trimmed;
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
            if (string.IsNullOrWhiteSpace(configuredBaseUrl)) return defaultBaseUrl;
            string trimmed = configuredBaseUrl.Trim();
            if (normalizedProvider == "custom" || normalizedProvider == "ollama") return trimmed;

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
        }
    }
}

using Dosier.Application.Common.Documents;
using Dosier.Application.Common;
using System.Text.Json;
using Dosier.Domain.Common.Documents;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Security.Cryptography;
using System.Collections.Concurrent;
using Dosier.Infrastructure.Common.Documents.Engine;
// TemplateImages.cs eliminado — imágenes cargadas desde Resources/Images/ vía ImageResourceLoader
using Dosier.Infrastructure.Common.Documents.Templates.Investigacion;
using iText.IO.Image;
using Microsoft.Extensions.Configuration;
using Dosier.Application.Research.Dtos;
using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;

namespace Dosier.Infrastructure.Common.Documents
{
    /// <summary>
    /// Implementación de DOSIER Builder.
    /// Orquestador encargado de transformar datos colaborativos en documentos legales.
    /// 
    /// Implementa IDocumentEngine y coordina todos los sub-componentes del motor:
    ///   1. HandlebarsTemplateEngine → Inyecta datos en el HTML de la plantilla
    ///   2. LegalComplianceInjector → Añade encabezado institucional, pie LOPDP, código QR
    ///   3. ITextHtmlPdfRenderer    → Convierte el HTML enriquecido a PDF de alta calidad
    ///   4. PdfMergerService        → Ensambla el PDF con los anexos (paquetes CACES)
    ///   5. IDocumentAuditRepository → Registra cada emisión en el log de auditoría
    /// 
    /// VISIÓN DE EVOLUCIÓN NO-CODE (FUTURE ROADMAP):
    /// Para extender este motor de tematización dinámico sin código en el futuro:
    ///   1. Inyección de Web Fonts: Soportar el mapeo y descarga temporal de fuentes de Google Fonts
    ///      desde la propiedad 'theme.typography.fontUrl' o 'fontFamily' para incrustarlas en iText.
    ///   2. Configuración de Logos: Parametrizar la ruta, alineación y escalado de los logotipos de
    ///      cabecera de portada y páginas (ej. 'theme.brand.logoScale') desde el JSON del tema.
    ///   3. UI Dinámica en Frontend (JSON Schema): Renderizar dinámicamente campos de estilo en la barra
    ///      lateral a partir de una especificación schema, facilitando añadir nuevos tokens sin cambiar React.
    ///   4. Consistencia Multiformato (DOCX): Aplicar los mismos tokens de color y márgenes al exportar 
    ///      los documentos colaborativos de CoWork a formatos Word.
    /// 
    /// Uso desde cualquier módulo del sistema:
    ///   var result = await _documentEngine.GenerateAsync(new DocumentRequest {
    ///       TemplateCode = "ACTA_APROBACION",
    ///       Data = proyectoDto,
    ///       RequestedBy = currentUser.Email
    ///   });
    ///   return File(result.PdfBytes, "application/pdf", result.FileName);
    /// 
    /// NOTA DE RESILIENCIA: Este motor es agnóstico. No depende de 'Proyectos' ni 'Informes'.
    /// Recibe datos genéricos y los inyecta en plantillas, permitiendo que DOSIER escale
    /// a cualquier tipo de documento institucional sin cambiar el código del núcleo.
    /// </summary>
    public class DocumentEngine : IDocumentEngine
    {
        private readonly IDocumentTemplateRepository _templateRepository;
        private readonly IDocumentAuditRepository _auditRepository;
        private readonly ILogger<DocumentEngine> _logger;
        private readonly IConfiguration _configuration;
        private readonly TemplateFileLoader _templateFileLoader;
        private readonly ImageResourceLoader _imageLoader;
        private readonly DosierContext _db;
        private readonly dosier_application.Common.IAppUrlService _appUrlService;

        // Stateless engines: safe to share across requests
        private static readonly HandlebarsTemplateEngine _handlebarsEngine = new();
        private static readonly LegalComplianceInjector _complianceInjector = new();

        // Stateful iText engines: must be per-request to avoid PDF indirect object corruption
        // when concurrent requests share the same PdfDocument/PdfWriter instances.
        private readonly ITextHtmlPdfRenderer _pdfRenderer = new();
        private readonly PdfMergerService _mergerService = new();

        public DocumentEngine(
            IDocumentTemplateRepository templateRepository,
            IDocumentAuditRepository auditRepository,
            ILogger<DocumentEngine> logger,
            IConfiguration configuration,
            IHostEnvironment environment,
            DosierContext db,
            dosier_application.Common.IAppUrlService appUrlService)
        {
            _templateRepository = templateRepository;
            _auditRepository = auditRepository;
            _logger = logger;
            _configuration = configuration;
            _templateFileLoader = new TemplateFileLoader(environment);
            _imageLoader = new ImageResourceLoader(environment);
            _db = db;
            _appUrlService = appUrlService;
        }

        public async Task<DocumentResult> GenerateAsync(
            DocumentRequest request,
            CancellationToken cancellationToken = default)
        {
            try 
            {
                _logger.LogInformation(
                    "DOSIER DocumentEngine: Generando [{TemplateCode}] por [{User}] BlindMode={Blind}, DraftMode={Draft}",
                    request.TemplateCode, request.RequestedBy ?? "system", request.IsBlindMode, request.IsDraftMode);

                object renderData = request.Data ?? new { };

                // 0. Auto-completar campos colaborativos desde CoWork en BD (resiliencia ante ceguera de campos en Frontend)
                string? documentInstanceUuid = null;
                if (renderData != null)
                {
                    try
                    {
                        var rawText = renderData is System.Text.Json.JsonElement je 
                            ? je.GetRawText() 
                            : System.Text.Json.JsonSerializer.Serialize(renderData);

                        using var doc = System.Text.Json.JsonDocument.Parse(rawText);
                        if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object)
                        {
                            if (doc.RootElement.TryGetProperty("Uuid", out var uuidProp) ||
                                doc.RootElement.TryGetProperty("uuid", out uuidProp) ||
                                doc.RootElement.TryGetProperty("EntityUuid", out uuidProp) ||
                                doc.RootElement.TryGetProperty("entityUuid", out uuidProp) ||
                                doc.RootElement.TryGetProperty("id", out uuidProp) ||
                                doc.RootElement.TryGetProperty("Id", out uuidProp) ||
                                doc.RootElement.TryGetProperty("projectUuid", out uuidProp) ||
                                doc.RootElement.TryGetProperty("project_uuid", out uuidProp) ||
                                doc.RootElement.TryGetProperty("proyectoId", out uuidProp) ||
                                doc.RootElement.TryGetProperty("proyecto_id", out uuidProp))
                            {
                                documentInstanceUuid = uuidProp.GetString();
                            }
                        }
                    }
                    catch { }
                }

                if (string.IsNullOrEmpty(documentInstanceUuid))
                {
                    documentInstanceUuid = request.EntityUuid ?? request.ProjectUuid;
                }

                var targetUuids = new List<string>();
                if (!string.IsNullOrEmpty(documentInstanceUuid)) targetUuids.Add(documentInstanceUuid);
                if (!string.IsNullOrEmpty(request.EntityUuid)) targetUuids.Add(request.EntityUuid);
                if (!string.IsNullOrEmpty(request.ProjectUuid)) targetUuids.Add(request.ProjectUuid);

                if (renderData != null)
                {
                    try
                    {
                        var rawCheckText = renderData is System.Text.Json.JsonElement je 
                            ? je.GetRawText() 
                            : System.Text.Json.JsonSerializer.Serialize(renderData);

                        using var checkDoc = System.Text.Json.JsonDocument.Parse(rawCheckText);
                        if (checkDoc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object)
                        {
                            foreach (var pName in new[] { "Uuid", "uuid", "EntityUuid", "entityUuid", "ProjectUuid", "projectUuid", "proyectoId", "id", "Id" })
                            {
                                if (checkDoc.RootElement.TryGetProperty(pName, out var pVal) && pVal.ValueKind == System.Text.Json.JsonValueKind.String)
                                {
                                    var strVal = pVal.GetString()?.Trim();
                                    if (!string.IsNullOrEmpty(strVal) && !targetUuids.Contains(strVal))
                                    {
                                        targetUuids.Add(strVal);
                                    }
                                }
                            }
                        }
                    }
                    catch { }
                }

                targetUuids = targetUuids.Distinct().ToList();

                if (targetUuids.Count > 0)
                {
                    try
                    {
                        var coworkDocs = await _db.DocCoworkDocumentos
                            .AsNoTracking()
                            .Where(d => targetUuids.Contains(d.EntidadUuid) || targetUuids.Contains(d.Uuid))
                            .ToListAsync(cancellationToken);

                        var rawText = renderData is System.Text.Json.JsonElement je 
                            ? je.GetRawText() 
                            : System.Text.Json.JsonSerializer.Serialize(renderData);
                        
                        var dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(rawText) 
                            ?? new Dictionary<string, object?>();

                        bool IsHtmlEmpty(object? val)
                        {
                            if (val == null) return true;
                            var str = val.ToString()?.Trim();
                            if (string.IsNullOrWhiteSpace(str)) return true;
                            var clean = Regex.Replace(str, @"<[^>]*>", "").Trim();
                            return string.IsNullOrWhiteSpace(clean);
                        }

                        foreach (var doc in coworkDocs)
                        {
                            if (!string.IsNullOrEmpty(doc.CampoNombre) && !IsHtmlEmpty(doc.ContentHtml))
                            {
                                var htmlVal = doc.ContentHtml;
                                var key = doc.CampoNombre;
                                var pascalKey = key.Length > 0 && char.IsLower(key[0])
                                    ? char.ToUpper(key[0]) + key.Substring(1)
                                    : key;
                                var snakeKey = Regex.Replace(key, @"([A-Z])", "_$1").ToLower().TrimStart('_');

                                bool hasClientVal = !IsHtmlEmpty(dataDict.GetValueOrDefault(key)) ||
                                                     !IsHtmlEmpty(dataDict.GetValueOrDefault(pascalKey)) ||
                                                     !IsHtmlEmpty(dataDict.GetValueOrDefault(snakeKey));

                                var valToUse = hasClientVal
                                    ? (dataDict.GetValueOrDefault(key) ?? dataDict.GetValueOrDefault(pascalKey) ?? dataDict.GetValueOrDefault(snakeKey))
                                    : htmlVal;

                                dataDict[key] = valToUse;
                                dataDict[key.ToLower()] = valToUse;
                                dataDict[key.ToUpper()] = valToUse;
                                dataDict[pascalKey] = valToUse;
                                dataDict[snakeKey] = valToUse;

                                if (key.StartsWith("field_", StringComparison.OrdinalIgnoreCase))
                                {
                                    var upperField = "FIELD_" + key.Substring(6);
                                    dataDict[upperField] = valToUse;
                                    var lowerField = "field_" + key.Substring(6);
                                    dataDict[lowerField] = valToUse;
                                }
                            }
                        }

                        // Además, propagar llaves alternativas para cualquier propiedad enviada por el cliente que no esté en CoWork DB
                        var existingKeys = dataDict.Keys.ToList();
                        foreach (var k in existingKeys)
                        {
                            var val = dataDict[k];
                            if (!IsHtmlEmpty(val))
                            {
                                var pascalKey = k.Length > 0 && char.IsLower(k[0]) ? char.ToUpper(k[0]) + k.Substring(1) : k;
                                var snakeKey = Regex.Replace(k, @"([A-Z])", "_$1").ToLower().TrimStart('_');
                                if (!dataDict.ContainsKey(pascalKey)) dataDict[pascalKey] = val;
                                if (!dataDict.ContainsKey(snakeKey)) dataDict[snakeKey] = val;
                            }
                        }

                        renderData = dataDict;

                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "DOSIER DocumentEngine: Error al intentar fusionar contenidos colaborativos de CoWork para {Uuid}", documentInstanceUuid);
                    }
                }

                // 1. Obtener y Sincronizar Plantilla
                var template = await _templateRepository.FindByCodeAsync(request.TemplateCode, cancellationToken);
                if (template == null || !template.IsActive)
                {
                    var seed = DocumentTemplateRegistry.GetByCode(request.TemplateCode);
                    if (seed != null)
                    {
                        _logger.LogWarning("DOSIER DocumentEngine: Plantilla '{Code}' no encontrada. Restaurando...", request.TemplateCode);
                        await _templateRepository.SaveAsync(seed, cancellationToken);
                        template = seed;
                    }
                    else throw new KeyNotFoundException($"Plantilla '{request.TemplateCode}' no disponible.");
                }


                // 2. Validaciones
                if (request.IsBlindMode && !template.SupportsBlindMode)
                    throw new InvalidOperationException($"La plantilla '{template.Name}' no soporta Doble Ciego.");

                var traceabilityCode = GenerateTraceabilityCode(template.Category);

                // 3. HTML y CSS: Arquitectura Fallback (File-First Default + DB Customization Override)
                //    - Si el Administrador personalizó la plantilla desde la web, usa el Override de la BD.
                //    - De lo contrario, lee directamente el archivo físico oficial de Git (desarrollador).
                var fileHtml = await _templateFileLoader.LoadAsync(template.Code);
                var fileCss  = await _templateFileLoader.LoadCssAsync(template.Code);

                var htmlToRender = !string.IsNullOrWhiteSpace(fileHtml) 
                    ? fileHtml 
                    : template.HtmlContent;

                var cssToUse = !string.IsNullOrWhiteSpace(fileCss)
                    ? fileCss
                    : template.CustomCss;


                // 4. Cargar imágenes desde disco e inyectar como variables extra en Handlebars
                //    Cada plantilla puede referenciar {{portada_base64}}, {{logo_base64}}, etc.
                var extraImageVars = new Dictionary<string, object?>();

                // Tema base estructurado (Schema-Driven): primero intentamos leer el tema global de la BD,
                // si no existe, usamos el fallback institucional de Traversari.
                var baseThemeDict = new Dictionary<string, object>();
                
                try
                {
                    var globalThemeEntry = await _db.DocConfigsGenerales
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.Clave == "Theme.GlobalConfigJson", cancellationToken);
                        
                    if (globalThemeEntry != null && !string.IsNullOrEmpty(globalThemeEntry.Valor))
                    {
                        var parsedGlobal = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(globalThemeEntry.Valor);
                        if (parsedGlobal != null)
                        {
                            baseThemeDict = parsedGlobal;
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "DOSIER DocumentEngine: Error al cargar el tema global desde doc_config_general. Usando fallback.");
                }

                // Fallback institucional en caso de que la BD esté vacía o tenga esquemas dañados
                if (baseThemeDict.Count == 0)
                {
                    baseThemeDict = new Dictionary<string, object>
                    {
                        { "colors", new Dictionary<string, string>
                            {
                                { "primary", "#222c57" },
                                { "secondary", "#c4a857" },
                                { "text", "#222c57" },
                                { "tableHeaderBg", "#222c57" },
                                { "tableHeaderColor", "#ffffff" },
                                { "accent", "#9ad3de" }
                            }
                        },
                        { "typography", new Dictionary<string, string>
                            {
                                { "fontFamily", "'Calibri', 'Open Sans', Arial, sans-serif" },
                                { "baseSize", "10pt" },
                                { "lineHeight", "1.4" }
                            }
                        },
                        { "layout", new Dictionary<string, string>
                            {
                                { "marginTop", "3cm" },
                                { "marginBottom", "2cm" },
                                { "marginLeft", "2cm" },
                                { "marginRight", "2cm" },
                                { "landscapeMarginTop", "1.8cm" },
                                { "landscapeMarginBottom", "1.5cm" },
                                { "landscapeMarginLeft", "1.2cm" },
                                { "landscapeMarginRight", "1.2cm" }
                            }
                        },
                        { "brand", new Dictionary<string, object>
                            {
                                { "showCoverPage", true },
                                { "logoScale", "100%" }
                            }
                        }
                    };
                }

                // Aplicar Overrides por Plantilla (si existen)
                if (!string.IsNullOrEmpty(template.ThemeConfigJson))
                {
                    try
                    {
                        var templateTheme = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(template.ThemeConfigJson);
                        if (templateTheme != null)
                        {
                            // Mezclar categorías
                            foreach (var categoryKey in templateTheme.Keys)
                            {
                                if (templateTheme[categoryKey] is System.Text.Json.JsonElement catVal && catVal.ValueKind == System.Text.Json.JsonValueKind.Object)
                                {
                                    var categoryDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(catVal.GetRawText()) ?? new Dictionary<string, object>();
                                    
                                    if (baseThemeDict.TryGetValue(categoryKey, out var existingCategory) && existingCategory is Dictionary<string, object> baseCatDict)
                                    {
                                        foreach (var kv in categoryDict)
                                        {
                                            baseCatDict[kv.Key] = kv.Value;
                                        }
                                    }
                                    else if (baseThemeDict.TryGetValue(categoryKey, out var existingCategoryStrDict) && existingCategoryStrDict is Dictionary<string, string> baseCatStrDict)
                                    {
                                        foreach (var kv in categoryDict)
                                        {
                                            baseCatStrDict[kv.Key] = kv.Value?.ToString() ?? "";
                                        }
                                    }
                                    else
                                    {
                                        baseThemeDict[categoryKey] = categoryDict;
                                    }
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "DOSIER DocumentEngine: Error al fusionar ThemeConfigJson para {Code}.", template.Code);
                    }
                }

                extraImageVars["theme"] = baseThemeDict;

                if (request.ExtraVariables != null)
                {
                    foreach (var kv in request.ExtraVariables)
                    {
                        extraImageVars[kv.Key] = kv.Value;
                    }
                }

                // CARGA DE PORTADA DESACOPLADA (Schema-driven desde Tema Global o Plantilla con Fallback Histórico)
                string? coverBase64 = null;
                bool isCoverConfigured = false;

                if (baseThemeDict.TryGetValue("brand", out var brandObj) && brandObj != null)
                {
                    try
                    {
                        string? rawVal = null;
                        if (brandObj is JsonElement brandEl && brandEl.ValueKind == JsonValueKind.Object)
                        {
                            if (brandEl.TryGetProperty("coverImage", out var cEl) || brandEl.TryGetProperty("cover_image", out cEl))
                            {
                                isCoverConfigured = true;
                                if (cEl.ValueKind == JsonValueKind.String) rawVal = cEl.GetString();
                            }
                        }
                        else if (brandObj is Dictionary<string, object> brandDict)
                        {
                            if (brandDict.TryGetValue("coverImage", out var cVal) || brandDict.TryGetValue("cover_image", out cVal))
                            {
                                isCoverConfigured = true;
                                rawVal = cVal?.ToString();
                            }
                        }

                        if (!string.IsNullOrEmpty(rawVal))
                        {
                            coverBase64 = rawVal.Contains(",") ? rawVal.Split(',')[1] : rawVal;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error decodificando coverImage del tema para la plantilla [{Code}].", template.Code);
                    }
                }

                // Cargar fallback de disco SOLO SI la portada no ha sido configurada en el tema
                if (string.IsNullOrEmpty(coverBase64) && !isCoverConfigured)
                {
                    var possibleCoverNames = new[]
                    {
                        $"portada_{template.Code.ToLower()}",
                        $"portada_{template.Category.ToString().ToLower()}"
                    }.Where(n => n != null).Cast<string>();

                    foreach (var coverName in possibleCoverNames)
                    {
                        var tempCover = await _imageLoader.LoadAsBase64Async(coverName);
                        if (tempCover != null)
                        {
                            coverBase64 = tempCover;
                            break;
                        }
                    }
                }

                if (coverBase64 != null)
                {
                    extraImageVars["portada_base64"] = coverBase64;
                }

                if (template.Code == ProyectoInvestigacionTemplate.CODE)
                {
                    var logoBase64 = await _imageLoader.LoadAsBase64Async("logo_istpet_negro.png");
                    if (logoBase64 != null)
                    {
                        extraImageVars["logo_base64"] = logoBase64;
                    }

                    ProyectoDto? projectDto = renderData as ProyectoDto;
                    if (projectDto == null && renderData != null)
                    {
                        try
                        {
                            var rawText = renderData is System.Text.Json.JsonElement je 
                                ? je.GetRawText() 
                                : System.Text.Json.JsonSerializer.Serialize(renderData);

                            // Desempaquetar la envoltura "Data" / "data" si existe en el JSON
                            using var doc = System.Text.Json.JsonDocument.Parse(rawText);
                            if (doc.RootElement.ValueKind == System.Text.Json.JsonValueKind.Object &&
                                (doc.RootElement.TryGetProperty("Data", out var dataProp) || 
                                 doc.RootElement.TryGetProperty("data", out dataProp)))
                            {
                                var nestedRaw = dataProp.GetRawText();
                                projectDto = System.Text.Json.JsonSerializer.Deserialize<ProyectoDto>(nestedRaw, ProyectoDto.DefaultDeserializerOptions);
                            }
                            else
                            {
                                var cleanedRaw = Dosier.Infrastructure.Common.Documents.Engine.HandlebarsTemplateEngine.CleanAndNormalizeJson(rawText);
                                projectDto = System.Text.Json.JsonSerializer.Deserialize<ProyectoDto>(cleanedRaw, ProyectoDto.DefaultDeserializerOptions);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "DOSIER DocumentEngine: No se pudo deserializar request.Data a ProyectoDto para {Code}", template.Code);
                        }
                    }

                    if (projectDto != null)
                    {
                        if (projectDto.Investigadores != null && projectDto.Investigadores.Any())
                        {
                            var cedulas = projectDto.Investigadores
                                .Where(i => !string.IsNullOrEmpty(i.Cedula))
                                .Select(i => i.Cedula!.Trim())
                                .Distinct()
                                .ToList();

                            if (cedulas.Any())
                            {
                                var usersDb = await _db.Users
                                    .AsNoTracking()
                                    .Where(u => u.IdSigafi != null && cedulas.Contains(u.IdSigafi.Trim()))
                                    .Select(u => new { u.IdSigafi, u.IdUsuario })
                                    .ToListAsync(cancellationToken);

                                var uIds = usersDb.Select(u => u.IdUsuario).Distinct().ToList();
                                var metasDb = await _db.DocUsuariosMetadata
                                    .AsNoTracking()
                                    .Where(m => uIds.Contains(m.IdUsuario))
                                    .ToDictionaryAsync(m => m.IdUsuario, cancellationToken);

                                var metaByCedula = usersDb
                                    .Where(u => u.IdSigafi != null && metasDb.ContainsKey(u.IdUsuario))
                                    .GroupBy(u => u.IdSigafi!.Trim(), StringComparer.OrdinalIgnoreCase)
                                    .ToDictionary(g => g.Key, g => metasDb[g.First().IdUsuario], StringComparer.OrdinalIgnoreCase);

                                foreach (var inv in projectDto.Investigadores)
                                {
                                    if (!string.IsNullOrEmpty(inv.Cedula) && metaByCedula.TryGetValue(inv.Cedula.Trim(), out var m))
                                    {
                                        if (!inv.FirmaHabilitada.HasValue) inv.FirmaHabilitada = m.AceptoTerminosFirma;
                                    }
                                }
                            }
                        }

                        var director = projectDto.Investigadores?.FirstOrDefault(i => i.EsDirector == true)
                                      ?? projectDto.Investigadores?.FirstOrDefault(i => i.Rol?.Contains("Director", StringComparison.OrdinalIgnoreCase) == true);
                        
                        var docentes = projectDto.Investigadores?.Where(i => i != director && 
                            (i.Rol?.Contains("Docente", StringComparison.OrdinalIgnoreCase) == true || 
                             i.Rol?.Contains("Co-Investigador", StringComparison.OrdinalIgnoreCase) == true || 
                             (i.NivelAcademico != "Pregrado" && i.NivelAcademico != "Estudiante"))).ToList();
                        
                        var estudiantes = projectDto.Investigadores?.Where(i => i != director && 
                            (i.Rol?.Contains("Estudiante", StringComparison.OrdinalIgnoreCase) == true || 
                             i.Rol?.Contains("Alumno", StringComparison.OrdinalIgnoreCase) == true || 
                             i.NivelAcademico == "Pregrado" || 
                             (docentes != null && !docentes.Contains(i)))).ToList();

                        var principalCarrera = projectDto.Carrera?.Trim().ToLower();
                        var coejecutorasSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                        
                        if (projectDto.Investigadores != null)
                        {
                            foreach (var inv in projectDto.Investigadores)
                            {
                                if (inv.Activo == false || string.IsNullOrWhiteSpace(inv.Carrera)) continue;
                                var parts = inv.Carrera.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
                                foreach (var part in parts)
                                {
                                    var cleanPart = part.Trim();
                                    if (!string.IsNullOrEmpty(cleanPart) && 
                                        !cleanPart.Equals(principalCarrera, StringComparison.OrdinalIgnoreCase) &&
                                        !cleanPart.Equals("Docente", StringComparison.OrdinalIgnoreCase) &&
                                        !cleanPart.Equals("Estudiante", StringComparison.OrdinalIgnoreCase))
                                    {
                                        coejecutorasSet.Add(cleanPart.ToUpper());
                                    }
                                }
                            }
                        }

                        extraImageVars["investigador_director"] = director;
                        extraImageVars["investigadores_docentes"] = docentes;
                        extraImageVars["investigadores_estudiantes"] = estudiantes;
                        extraImageVars["carreras_coejecutoras"] = coejecutorasSet.ToList();
                    }
                }

                // 4.1 Enriquecimiento Curricular Integral para PEA_OFICIAL (Failsafe institucional ante snapshots incompletos)
                if (string.Equals(template.Code, "PEA_OFICIAL", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        var rawText = renderData is System.Text.Json.JsonElement je 
                            ? je.GetRawText() 
                            : System.Text.Json.JsonSerializer.Serialize(renderData);
                        
                        var dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object?>>(rawText) 
                            ?? new Dictionary<string, object?>();

                        bool NeedsField(string key)
                        {
                            if (!dataDict.TryGetValue(key, out var val) || val == null) return true;
                            var str = val.ToString()?.Trim();
                            return string.IsNullOrWhiteSpace(str);
                        }

                        bool NeedsList(string key)
                        {
                            if (!dataDict.TryGetValue(key, out var val) || val == null) return true;
                            if (val is System.Text.Json.JsonElement jeList && jeList.ValueKind == System.Text.Json.JsonValueKind.Array)
                                return jeList.GetArrayLength() == 0;
                            if (val is System.Collections.ICollection col)
                                return col.Count == 0;
                            return false;
                        }

                        dosier_domain.Curriculum.Entities.DocPea? pea = null;
                        if (targetUuids.Count > 0)
                        {
                            pea = await _db.DocPeas
                                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                                .Include(p => p.ResultadosAprendizaje)
                                .Include(p => p.ActividadesPracticas)
                                .Include(p => p.Bibliografias)
                                .Include(p => p.Prerrequisitos)
                                .Include(p => p.Evaluaciones)
                                .FirstOrDefaultAsync(p => targetUuids.Contains(p.Uuid) && p.Activo, cancellationToken);

                            if (pea == null)
                            {
                                var inst = await _db.DocumentInstances.FirstOrDefaultAsync(i => targetUuids.Contains(i.Uuid), cancellationToken);
                                if (inst != null && !string.IsNullOrEmpty(inst.EntityUuid))
                                {
                                    pea = await _db.DocPeas
                                        .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                                        .Include(p => p.ResultadosAprendizaje)
                                        .Include(p => p.ActividadesPracticas)
                                        .Include(p => p.Bibliografias)
                                        .Include(p => p.Prerrequisitos)
                                        .Include(p => p.Evaluaciones)
                                        .FirstOrDefaultAsync(p => p.Uuid == inst.EntityUuid && p.Activo, cancellationToken);
                                }
                            }
                        }

                        if (pea != null)
                        {
                            var carrera = await _db.Carreras.AsNoTracking().FirstOrDefaultAsync(c => c.IdCarrera == pea.IdCarrera, cancellationToken);
                            var asignatura = await _db.Asignaturas.AsNoTracking().FirstOrDefaultAsync(a => a.IdAsignatura == pea.IdAsignatura, cancellationToken);
                            var docente = !string.IsNullOrEmpty(pea.IdDocenteElaborador)
                                ? await _db.Profesores.AsNoTracking().FirstOrDefaultAsync(p => p.IdProfesor == pea.IdDocenteElaborador, cancellationToken)
                                : null;

                            var docenteNombre = docente != null ? $"{docente.Nombres} {docente.Apellidos}".Trim() : "";
                            var materiaNombre = asignatura?.Asignatura1 ?? "Asignatura ISTPET";
                            var carreraNombre = carrera?.Carrera1 ?? "Carrera ISTPET";

                            void Put(string k, object? v)
                            {
                                if (v != null)
                                {
                                    dataDict[k] = v;
                                    var pascal = char.ToUpper(k[0]) + k.Substring(1);
                                    var snake = Regex.Replace(k, @"([A-Z])", "_$1").ToLower().TrimStart('_');
                                    dataDict[pascal] = v;
                                    dataDict[snake] = v;
                                }
                            }

                            if (NeedsField("NombreAsignatura")) Put("NombreAsignatura", materiaNombre);
                            if (NeedsField("titulo")) Put("titulo", materiaNombre);
                            if (NeedsField("Carrera")) Put("Carrera", carreraNombre);
                            if (NeedsField("Periodo")) Put("Periodo", pea.IdPeriodo);
                            if (NeedsField("CodigoAsignatura")) Put("CodigoAsignatura", asignatura?.Codigo ?? "");
                            if (NeedsField("Modalidad")) Put("Modalidad", pea.Modalidad);
                            if (NeedsField("Nivel")) Put("Nivel", pea.SemestreNivel);
                            if (NeedsField("UnidadOrganizacion")) Put("UnidadOrganizacion", pea.UnidadOrganizacion);
                            if (NeedsField("DocenteElaborador")) Put("DocenteElaborador", docenteNombre);
                            if (NeedsField("TotalHorasAsignatura") || Convert.ToInt32(dataDict.GetValueOrDefault("TotalHorasAsignatura") ?? 0) == 0)
                                Put("TotalHorasAsignatura", pea.TotalHorasAsignatura);
                            if (NeedsField("Creditos") || Convert.ToDecimal(dataDict.GetValueOrDefault("Creditos") ?? 0) == 0)
                                Put("Creditos", pea.Creditos);
                            if (NeedsField("HorasContactoDocente") || Convert.ToInt32(dataDict.GetValueOrDefault("HorasContactoDocente") ?? 0) == 0)
                                Put("HorasContactoDocente", pea.HorasContactoDocente);
                            if (NeedsField("HorasPracticoExperimental") || Convert.ToInt32(dataDict.GetValueOrDefault("HorasPracticoExperimental") ?? 0) == 0)
                                Put("HorasPracticoExperimental", pea.HorasPracticoExperimental);
                            if (NeedsField("HorasAutonomo") || Convert.ToInt32(dataDict.GetValueOrDefault("HorasAutonomo") ?? 0) == 0)
                                Put("HorasAutonomo", pea.HorasAutonomo);

                            if (NeedsField("ObjetivoAsignatura")) Put("ObjetivoAsignatura", pea.ObjetivoAsignatura);
                            if (NeedsField("MetodologiaEnsenanza")) Put("MetodologiaEnsenanza", pea.MetodologiaEnsenanza);
                            if (NeedsField("RecursosDidacticos")) Put("RecursosDidacticos", pea.RecursosDidacticos);
                            if (NeedsField("EvaluacionAprendizaje")) Put("EvaluacionAprendizaje", pea.EvaluacionAprendizaje);

                            if (NeedsList("Unidades") && pea.Unidades.Any())
                            {
                                dataDict["Unidades"] = pea.Unidades.OrderBy(u => u.Orden).Select(u => new
                                {
                                    NumeroUnidad = u.NumeroUnidad,
                                    NombreUnidad = u.NombreUnidad,
                                    TotalHorasUnidad = u.TotalHorasUnidad,
                                    HorasDocencia = u.HorasDocencia,
                                    HorasPracticoExp = u.HorasPracticoExp,
                                    HorasAutonomo = u.HorasAutonomo,
                                    Temas = u.Temas.OrderBy(t => t.Orden).Select(t => new
                                    {
                                        NumeroTema = t.NumeroTema,
                                        TituloTema = t.TituloTema,
                                        DescripcionSubtemas = t.DescripcionSubtemas
                                    }).ToList()
                                }).ToList();
                            }

                            if (NeedsList("ResultadosAprendizaje") && pea.ResultadosAprendizaje.Any())
                            {
                                dataDict["ResultadosAprendizaje"] = pea.ResultadosAprendizaje.OrderBy(r => r.Orden).Select(r => new
                                {
                                    CodigoRda = r.CodigoRda,
                                    Descripcion = r.Descripcion,
                                    NivelDesarrollo = r.NivelDesarrollo
                                }).ToList();
                            }

                            if (NeedsList("ActividadesPracticas") && pea.ActividadesPracticas.Any())
                            {
                                dataDict["ActividadesPracticas"] = pea.ActividadesPracticas.OrderBy(p => p.Orden).Select(p => new
                                {
                                    NumeroPractica = p.NumeroPractica,
                                    NombrePractica = p.NombrePractica,
                                    Caracterizacion = p.Caracterizacion,
                                    DuracionHoras = p.DuracionHoras
                                }).ToList();
                            }

                            if (NeedsList("Bibliografias") && pea.Bibliografias.Any())
                            {
                                dataDict["Bibliografias"] = pea.Bibliografias.OrderBy(b => b.Orden).Select(b => new
                                {
                                    TipoBibliografia = b.TipoBibliografia,
                                    Autor = b.Autor,
                                    Anio = b.Anio,
                                    TituloLibro = b.TituloLibro,
                                    EditorialCiudad = b.EditorialCiudad,
                                    CitaCompletaApa = b.CitaCompletaApa
                                }).ToList();
                            }

                            if (NeedsList("Prerrequisitos") && pea.Prerrequisitos.Any())
                            {
                                dataDict["Prerrequisitos"] = pea.Prerrequisitos.OrderBy(p => p.Orden).Select(p => new
                                {
                                    NombreAsignatura = p.NombreAsignatura,
                                    Observacion = p.Observacion
                                }).ToList();
                            }

                            if (NeedsList("Evaluaciones") && pea.Evaluaciones.Any())
                            {
                                dataDict["Evaluaciones"] = pea.Evaluaciones.OrderBy(e => e.Orden).Select(e => new
                                {
                                    Denominacion = e.Denominacion,
                                    TipoEvaluacion = e.TipoEvaluacion,
                                    CalificacionMaxima = e.CalificacionMaxima
                                }).ToList();
                            }

                            if (!string.IsNullOrEmpty(pea.FirmaElaboradoDocente))
                                dataDict["FirmaElaboradoDocente"] = pea.FirmaElaboradoDocente;
                            if (!string.IsNullOrEmpty(pea.FirmaRevisadoCoord))
                                dataDict["FirmaRevisadoCoord"] = pea.FirmaRevisadoCoord;
                            if (!string.IsNullOrEmpty(pea.FirmaRevisadoAcad))
                                dataDict["FirmaRevisadoAcad"] = pea.FirmaRevisadoAcad;
                            if (!string.IsNullOrEmpty(pea.FirmaAprobadoVicerrector))
                                dataDict["FirmaAprobadoVicerrector"] = pea.FirmaAprobadoVicerrector;
                        }

                        renderData = dataDict;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "DOSIER DocumentEngine: Error al enriquecer datos de PEA_OFICIAL");
                    }
                }

                // 5. Inyectar datos + imágenes con Handlebars
                var renderedHtml = await _handlebarsEngine.RenderAsync(htmlToRender ?? string.Empty, renderData ?? new object(), extraImageVars.Count > 0 ? extraImageVars : null, request.IsBlindMode);
                
                // 5. Optimizar HTML (Inyectar estilos base y sanitizar imágenes)
                var optimizedHtml = ProcessAndOptimizeHtml(renderedHtml);

                // 6. Inyectar Cumplimiento Legal (Header/Footer, QR, Traceability)
                var finalHtml = _complianceInjector.InjectLegalFooter(optimizedHtml, template, traceabilityCode, request.IsBlindMode);

                var verificationBaseUrl = _appUrlService.GetFrontendUrl();

                // 7. Renderizado a PDF
                //    Carga de fondo de hojas (stationary) desacoplada (Schema-driven desde Tema Global o Plantilla)
                ImageData? stationaryImage = null;
                bool isExplicitlyConfigured = false;

                if (baseThemeDict.TryGetValue("brand", out var bgBrandObj) && bgBrandObj != null)
                {
                    try
                    {
                        string? rawVal = null;
                        if (bgBrandObj is JsonElement brandEl && brandEl.ValueKind == JsonValueKind.Object)
                        {
                            if (brandEl.TryGetProperty("backgroundImage", out var bgEl) || brandEl.TryGetProperty("background_image", out bgEl))
                            {
                                isExplicitlyConfigured = true;
                                if (bgEl.ValueKind == JsonValueKind.String) rawVal = bgEl.GetString();
                            }
                        }
                        else if (bgBrandObj is Dictionary<string, object> brandDict)
                        {
                            if (brandDict.TryGetValue("backgroundImage", out var bgVal) || brandDict.TryGetValue("background_image", out bgVal))
                            {
                                isExplicitlyConfigured = true;
                                rawVal = bgVal?.ToString();
                            }
                        }

                        if (!string.IsNullOrEmpty(rawVal))
                        {
                            var base64Data = rawVal.Contains(",") ? rawVal.Split(',')[1] : rawVal;
                            var bytes = Convert.FromBase64String(base64Data);
                            stationaryImage = ImageDataFactory.Create(bytes);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error decodificando backgroundImage del tema para la plantilla [{Code}].", template.Code);
                    }
                }

                // Cargar fallback de disco SOLO SI la propiedad no ha sido configurada en el esquema del tema
                if (stationaryImage == null && !isExplicitlyConfigured)
                {
                    var possibleBackgroundNames = new[]
                    {
                        $"fondo_{template.Code.ToLower()}",
                        $"fondo_hojas_{template.Code.ToLower()}",
                        $"fondo_hojas_{template.Category.ToString().ToLower()}"
                    }.Where(n => n != null).Cast<string>();

                    foreach (var bgName in possibleBackgroundNames)
                    {
                        var img = await _imageLoader.LoadAsImageDataAsync(bgName);
                        if (img != null)
                        {
                            stationaryImage = img;
                            break;
                        }
                    }
                }

                // Renderizar el CSS asociado a través de Scriban para admitir variables dinámicas (ej: {{portada_base64}})
                string? renderedCss = null;
                if (!string.IsNullOrEmpty(cssToUse))
                {
                    renderedCss = await _handlebarsEngine.RenderAsync(
                        cssToUse,
                        renderData ?? new object(),
                        extraImageVars.Count > 0 ? extraImageVars : null,
                        request.IsBlindMode
                    );
                }

                var pdfBytes = await _pdfRenderer.RenderWithMetadataAsync(finalHtml, new DocumentRenderingMetadata
                {
                    TraceabilityCode = traceabilityCode,
                    IsDraft = request.IsDraftMode,
                    StationaryImageData = stationaryImage,
                    VerificationBaseUrl = verificationBaseUrl,
                    IsBlindMode = request.IsBlindMode
                }, renderedCss);

                // 6. Sello de Integridad (SHA-256)
                var fileHash = CalculateHash(pdfBytes);

                // 7. Auditoría Forense (Resiliencia CACES 2026)
                var fileName = $"DOSIER_{template.Code}_v{template.Version}_{DateTime.Now:yyyyMMdd-HHmm}.pdf";
                try 
                {
                    string? snapshot = null;
                    bool requiresSnapshot = template.Category is DocumentCategory.Protocolo 
                                            or DocumentCategory.ActaAprobacion;

                    if (renderData != null)
                    {
                        snapshot = System.Text.Json.JsonSerializer.Serialize(renderData);
                    }
                    else if (requiresSnapshot)
                    {
                        _logger.LogWarning("DOSIER Forensic: Se intenta generar [{Code}] sin datos de origen. El snapshot será nulo, comprometiendo la resiliencia.", template.Code);
                    }

                    var auditEntry = DocumentAuditEntry.Create(
                        traceabilityCode, template.Code, template.Version, template.Category,
                        request.RequestedBy ?? "sistema", request.IsBlindMode, fileName,
                        request.ProjectUuid, request.EntityUuid, fileHash, snapshot);

                    await _auditRepository.RegisterEmissionAsync(auditEntry, cancellationToken);
                    
                    if (snapshot != null)
                    {
                        _logger.LogInformation("DOSIER Forensic: Snapshot inyectado para [{Code}]. Integridad vinculada a Hash {Hash}.", template.Code, fileHash);
                    }
                }
                catch (Exception ex) { _logger.LogError(ex, "DOSIER DocumentEngine: Error crítico en el log de auditoría forense."); }

                return new DocumentResult
                {
                    PdfBytes = pdfBytes,
                    FileName = fileName,
                    TraceabilityCode = traceabilityCode,
                    TemplateVersion = template.Version,
                    WasBlindMode = request.IsBlindMode,
                    FileHash = fileHash
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "DOSIER DocumentEngine FAILURE.");
                throw;
            }
        }

        public async Task<byte[]> MergeDocumentsAsync(
            IEnumerable<byte[]> pdfDocuments,
            CancellationToken cancellationToken = default)
        {
            return await _mergerService.MergeAsync(pdfDocuments);
        }

        public async Task<IEnumerable<DocumentTemplate>> GetAvailableTemplatesAsync(
            CancellationToken cancellationToken = default)
        {
            return await _templateRepository.GetAllActiveAsync(cancellationToken);
        }

        public async Task ResetTemplateToDefaultAsync(
            string templateCode, string updatedBy,
            CancellationToken cancellationToken = default)
        {
            var template = await _templateRepository.FindByCodeAsync(templateCode, cancellationToken)
                ?? throw new KeyNotFoundException($"Plantilla '{templateCode}' no encontrada.");

            // Al restablecer a fábrica, se limpian las columnas de Override en la BD,
            // de modo que el motor vuelve a leer directamente los archivos físicos en disco.
            template.UpdateHtmlContentOnly(string.Empty);
            template.UpdateCustomCssOnly(null);

            await _templateRepository.SaveAsync(template, cancellationToken);
            _logger.LogInformation("DOSIER DocumentEngine: Plantilla [{Code}] restablecida a la versión por defecto de fábrica por [{User}].", templateCode, updatedBy);
        }

        public async Task UpdateTemplateAsync(
            string templateCode, string newHtmlContent,
            string? customCss, string? collaborativeFieldsJson, string? themeConfigJson, string updatedBy,
            CancellationToken cancellationToken = default)
        {
            var template = await _templateRepository.FindByCodeAsync(templateCode, cancellationToken)
                ?? throw new KeyNotFoundException($"Plantilla '{templateCode}' no encontrada.");

            template.UpdateContent(newHtmlContent, customCss, collaborativeFieldsJson, updatedBy);
            template.UpdateThemeConfig(themeConfigJson, updatedBy);
            await _templateRepository.SaveAsync(template, cancellationToken);

            // Sincronización bidireccional en disco para mantener 100% de paridad con los archivos en caliente (.html/.css)
            await _templateFileLoader.SaveAsync(templateCode, newHtmlContent, customCss);

            _logger.LogInformation(
                "DOSIER DocumentEngine: Plantilla [{Code}] actualizada a v{Version} por [{User}] (BD + Disco).",
                templateCode, template.Version, updatedBy);
        }

        public async Task UpdateSignatureConfigAsync(
            string templateCode, bool requiresSignature,
            string signatureType, string updatedBy,
            CancellationToken cancellationToken = default)
        {
            var template = await _templateRepository.FindByCodeAsync(templateCode, cancellationToken)
                ?? throw new KeyNotFoundException($"Plantilla '{templateCode}' no encontrada.");

            template.UpdateSignatureConfig(requiresSignature, signatureType, updatedBy);
            await _templateRepository.SaveAsync(template, cancellationToken);

            _logger.LogInformation(
                "DOSIER DocumentEngine: Configuración de firma de plantilla [{Code}] actualizada por [{User}]: RequiresSignature={RequiresSignature}, Type={Type}.",
                templateCode, updatedBy, requiresSignature, signatureType);
        }

        /// <summary>
        /// Sanitiza y optimiza el HTML antes del renderizado.
        /// - Fuerza a las imágenes a ser responsivas (max-width: 100%).
        /// - Detecta imágenes Base64 excesivamente grandes para alertar.
        /// </summary>
        private string ProcessAndOptimizeHtml(string html)
        {
            if (string.IsNullOrEmpty(html)) return html;

            // 1. Inyectar estilos globales de seguridad para el PDF
            string globalStyles = @"<style>
                img { max-width: 100% !important; height: auto !important; display: block; margin: 10px 0; }
                table { width: 100% !important; border-collapse: collapse; }
                tr { page-break-inside: avoid; }
            </style>";

            // 2. Limitar tamaño de imágenes Base64 (Previene PDFs corruptos)
            // Si una imagen Base64 supera los 1MB (aprox 1.3M chars), lanzamos advertencia en log
            var matches = Regex.Matches(html, @"src=""data:image/[^;]+;base64,([^""]+)""");
            foreach (Match match in matches)
            {
                if (match.Groups[1].Length > 1500000) // ~1.1 MB
                {
                    _logger.LogWarning("DOSIER Builder: Se detectó una imagen pesada (>1MB). El rendimiento del PDF puede verse afectado.");
                }
            }

            return globalStyles + html;
        }

        /// <summary>
        /// Genera un código de trazabilidad legible para el instituto:
        /// Formato: DOSIER-{CATEGORIA}-{AÑO}-{GUID_CORTO}
        /// Ej: DOSIER-PROTO-2026-A1B2C3D4
        /// </summary>
        private static string GenerateTraceabilityCode(DocumentCategory category)
        {
            var categoryPrefix = category switch
            {
                DocumentCategory.Protocolo => "PROTO",
                DocumentCategory.ActaAprobacion => "ACTA",
                DocumentCategory.TerminosDeReferencia => "TDR",
                DocumentCategory.ProtocoloBioetico => "ETICO",
                DocumentCategory.ConsentimientoInformado => "LOPD",
                DocumentCategory.CesionDerechos => "SNDI",
                DocumentCategory.MatrizIndicadoresCaces => "CACES",
                DocumentCategory.ConvenioMarco => "CONV",
                DocumentCategory.ReporteDistributivoCruce => "DISTR",
                DocumentCategory.ReporteAnaliticas => "ANLT",
                DocumentCategory.PeaCurricular => "PEA",
                _ => "DOC"
            };

            var guid = Guid.NewGuid().ToString("N")[..8].ToUpper();
            return $"DOSIER-{categoryPrefix}-{DateTime.Now.Year}-{guid}";
        }
        
        private static string CalculateHash(byte[] content)
        {
            using var sha256 = SHA256.Create();
            var hash = sha256.ComputeHash(content);
            return Convert.ToHexString(hash).ToLower();
        }
    }
}

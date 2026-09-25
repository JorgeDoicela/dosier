using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using Dosier.Infrastructure.Common.Documents.Engine;
using Dosier.Infrastructure.Common.Documents.Templates.Investigacion;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;

namespace dosier_api.Controllers
{
    /// <summary>
    /// Endpoints de administración del Motor de Documentos DOSIER.
    /// Permiten actualizar plantillas en base de datos sin recompilación.
    /// IMPORTANTE: Proteger con autorización de rol "Admin" en producción.
    /// </summary>
    [ApiController]
    [Route("api/admin/templates")]
    public class DocumentTemplatesController : ControllerBase
    {
        private readonly IDocumentEngine _documentEngine;
        private readonly IDocumentTemplateAdminService _templateAdminService;
        private readonly IHostEnvironment _environment;

        public DocumentTemplatesController(
            IDocumentEngine documentEngine,
            IDocumentTemplateAdminService templateAdminService,
            IHostEnvironment environment)
        {
            _documentEngine = documentEngine;
            _templateAdminService = templateAdminService;
            _environment = environment;
        }

        /// <summary>
        /// Lista todas las plantillas activas registradas en el motor.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
            var customOrder = await _templateAdminService.GetCustomTemplateOrderAsync(ct);

            var orderedTemplates = templates.ToList();
            if (customOrder != null && customOrder.Any())
            {
                orderedTemplates = templates
                    .OrderBy(t =>
                    {
                        var idx = customOrder.IndexOf(t.Code);
                        return idx >= 0 ? idx : int.MaxValue;
                    })
                    .ThenBy(t => t.Category)
                    .ToList();
            }

            return Ok(orderedTemplates.Select(t => new
            {
                t.Id,
                t.Code,
                t.Name,
                t.Description,
                t.Category,
                t.Version,
                t.IsActive,
                t.RequiresLopdpClause,
                t.SupportsBlindMode,
                RequiresElectronicSignature = t.RequiresElectronicSignature,
                SignatureType = t.SignatureType,
                t.ThemeConfigJson,
                t.UpdatedAt,
                t.UpdatedBy
            }));
        }

        /// <summary>
        /// Obtiene el detalle de una plantilla por su código único.
        /// </summary>
        [HttpGet("{code}")]
        public async Task<IActionResult> GetByCode(string code, CancellationToken ct)
        {
            var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
            var template = templates.FirstOrDefault(t => t.Code == code);

            if (template == null)
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });

            var fileLoader = new TemplateFileLoader(_environment);
            var fileHtml = await fileLoader.LoadAsync(template.Code);
            var fileCss = await fileLoader.LoadCssAsync(template.Code);

            var effectiveHtml = !string.IsNullOrWhiteSpace(fileHtml) && (string.IsNullOrWhiteSpace(template.HtmlContent) || template.HtmlContent.StartsWith("<!-- Cargado desde") || template.Version < 400)
                ? fileHtml
                : (!string.IsNullOrWhiteSpace(template.HtmlContent) ? template.HtmlContent : fileHtml);

            var effectiveCss = !string.IsNullOrWhiteSpace(fileCss) && string.IsNullOrWhiteSpace(template.CustomCss)
                ? fileCss
                : template.CustomCss;

            return Ok(new
            {
                template.Id,
                template.Code,
                template.Name,
                template.Description,
                template.Category,
                template.Version,
                template.IsActive,
                template.RequiresLopdpClause,
                template.SupportsBlindMode,
                RequiresElectronicSignature = template.RequiresElectronicSignature,
                SignatureType = template.SignatureType,
                template.CollaborativeFieldsJson,
                template.ThemeConfigJson,
                HtmlContent = effectiveHtml,
                CustomCss = effectiveCss,
                template.UpdatedAt
            });
        }

        /// <summary>
        /// Actualiza el HTML de una plantilla existente en base de datos.
        /// El cambio aplica inmediatamente en el siguiente documento generado.
        /// </summary>
        [HttpPut("{code}")]
        public async Task<IActionResult> Update(string code, [FromBody] UpdateTemplateRequest request, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _templateAdminService.PublishTemplateAsync(
                    code,
                    request.HtmlContent,
                    request.CustomCss,
                    request.CollaborativeFieldsJson,
                    request.ThemeConfigJson,
                    updatedBy,
                    ct);

                return Ok(new { message = $"Plantilla '{code}' actualizada correctamente." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// [DEPRECADO] Las plantillas ahora se cargan desde archivos .html físicos (TemplateFileLoader).
        /// </summary>
        [HttpPost("migrate-protocolo-investigacion")]
        public IActionResult MigrateProtocolo()
        {
            return Ok(new
            {
                message = "Las plantillas ahora se cargan automáticamente desde archivos .html físicos. No se requiere migración manual.",
                templateCode = ProyectoInvestigacionTemplate.CODE,
                htmlFile = "Templates/Investigacion/ProyectoInvestigacion.html",
                info = "Edita el archivo .html y genera el documento. El cambio aplica sin recompilar."
            });
        }

        /// <summary>
        /// Restablece una plantilla en la BD a sus archivos físicos oficiales (HTML y CSS).
        /// </summary>
        [HttpPost("{code}/reset-to-default")]
        public async Task<IActionResult> ResetToDefault(string code, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _documentEngine.ResetTemplateToDefaultAsync(code, updatedBy, ct);
                return Ok(new { message = $"Plantilla '{code}' restablecida exitosamente a sus archivos por defecto de fábrica." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// Actualiza la configuración de firmas de una plantilla.
        /// </summary>
        [HttpPut("{code}/signature-config")]
        public async Task<IActionResult> UpdateSignatureConfig(string code, [FromBody] UpdateSignatureConfigRequest request, CancellationToken ct)
        {
            try
            {
                var updatedBy = User.Identity?.Name ?? "admin";
                await _documentEngine.UpdateSignatureConfigAsync(code, request.RequiresSignature, request.SignatureType, updatedBy, ct);
                return Ok(new { message = $"Configuración de firmas para plantilla '{code}' actualizada correctamente." });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = $"Plantilla '{code}' no encontrada." });
            }
        }

        /// <summary>
        /// Obtiene el conteo de documentos activos asociados a una plantilla.
        /// </summary>
        [HttpGet("{code}/usage-count")]
        public async Task<IActionResult> GetUsageCount(string code, CancellationToken ct)
        {
            var count = await _templateAdminService.GetUsageCountAsync(code, ct);
            return Ok(new { count });
        }

        /// <summary>
        /// Obtiene el tema visual global de la institución.
        /// </summary>
        [HttpGet("global-theme")]
        public async Task<IActionResult> GetGlobalTheme(CancellationToken ct)
        {
            var configValue = await _templateAdminService.GetGlobalThemeConfigAsync(ct);

            if (string.IsNullOrEmpty(configValue))
            {
                var fallbackTheme = new
                {
                    colors = new
                    {
                        primary = "#222c57",
                        secondary = "#c4a857",
                        text = "#1a1a1a",
                        tableHeaderBg = "#222c57",
                        tableHeaderColor = "#ffffff",
                        accent = "#9ad3de"
                    },
                    typography = new
                    {
                        fontFamily = "'Calibri', 'Open Sans', Arial, sans-serif",
                        baseSize = "10pt",
                        lineHeight = "1.4"
                    },
                    layout = new
                    {
                        marginTop = "3cm",
                        marginBottom = "2cm",
                        marginLeft = "2cm",
                        marginRight = "2cm",
                        landscapeMarginTop = "1.8cm",
                        landscapeMarginLeft = "1.2cm"
                    },
                    brand = new
                    {
                        showCoverPage = true,
                        logoScale = "100%"
                    }
                };
                return Ok(new { themeConfigJson = JsonSerializer.Serialize(fallbackTheme) });
            }

            return Ok(new { themeConfigJson = configValue });
        }

        /// <summary>
        /// Actualiza el tema visual global de la institución.
        /// </summary>
        [HttpPut("global-theme")]
        public async Task<IActionResult> UpdateGlobalTheme([FromBody] UpdateGlobalThemeRequest request, CancellationToken ct)
        {
            await _templateAdminService.SaveGlobalThemeConfigAsync(request.ThemeConfigJson ?? string.Empty, ct);
            return Ok(new { message = "Tema global institucional actualizado correctamente." });
        }

        /// <summary>
        /// Actualiza el orden de las plantillas en el catálogo.
        /// </summary>
        [HttpPut("order")]
        public async Task<IActionResult> UpdateOrder([FromBody] UpdateTemplatesOrderRequest request, CancellationToken ct)
        {
            if (request == null || request.Codes == null)
                return BadRequest(new { error = "El cuerpo de la solicitud no puede estar vacío." });

            await _templateAdminService.SaveTemplateOrderAsync(request.Codes, ct);
            return Ok(new { message = "Orden de plantillas guardado correctamente." });
        }

        /// <summary>
        /// Renderiza el PDF oficial de una plantilla con datos institucionales de muestra.
        /// Permite ver el documento tal cual saldrá al generarse o descargarlo.
        /// </summary>
        [HttpGet("{code}/render-pdf")]
        public async Task<IActionResult> RenderPdf(
            string code,
            [FromQuery] bool isDraft = false,
            [FromQuery] bool download = false,
            CancellationToken ct = default)
        {
            try
            {
                var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
                var template = templates.FirstOrDefault(t => t.Code == code);
                if (template == null)
                    return NotFound(new { error = $"Plantilla '{code}' no encontrada." });

                var sampleData = CreateTemplateSampleData(code);

                var request = new DocumentRequest
                {
                    TemplateCode = code,
                    Data = sampleData,
                    IsDraftMode = isDraft,
                    IsPreview = true,
                    RequestedBy = User.Identity?.Name ?? "Administrador DOSIER"
                };

                var result = await _documentEngine.GenerateAsync(request, ct);

                var baseTitle = !string.IsNullOrWhiteSpace(template.Name) ? template.Name : code;
                var safeName = SanitizeFileName($"{baseTitle}.pdf");

                if (download)
                {
                    return File(result.PdfBytes, "application/pdf", safeName);
                }

                Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.ContentDisposition] = $"inline; filename=\"{safeName}\"";
                return File(result.PdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error al renderizar PDF de previsualización: {ex.Message}" });
            }
        }

        /// <summary>
        /// Renderiza un PDF en caliente a partir del HTML/bloques editados actualmente en el diseñador visual.
        /// </summary>
        [HttpPost("{code}/render-pdf")]
        public async Task<IActionResult> RenderCustomPdf(
            string code,
            [FromBody] RenderTemplatePreviewRequest? previewRequest,
            [FromQuery] bool isDraft = false,
            [FromQuery] bool download = false,
            CancellationToken ct = default)
        {
            try
            {
                var templates = await _documentEngine.GetAvailableTemplatesAsync(ct);
                var template = templates.FirstOrDefault(t => t.Code == code);
                if (template == null)
                    return NotFound(new { error = $"Plantilla '{code}' no encontrada." });

                var sampleData = previewRequest?.SampleData ?? CreateTemplateSampleData(code);

                var request = new DocumentRequest
                {
                    TemplateCode = code,
                    Data = sampleData,
                    IsDraftMode = isDraft,
                    IsPreview = true,
                    CustomHtmlContent = previewRequest?.HtmlContent,
                    CustomCss = previewRequest?.CustomCss,
                    CustomThemeConfigJson = previewRequest?.ThemeConfigJson,
                    RequestedBy = User.Identity?.Name ?? "Administrador DOSIER"
                };

                var result = await _documentEngine.GenerateAsync(request, ct);

                var baseTitle = !string.IsNullOrWhiteSpace(template.Name) ? template.Name : code;
                var safeName = SanitizeFileName($"{baseTitle}.pdf");

                if (download)
                {
                    return File(result.PdfBytes, "application/pdf", safeName);
                }

                Response.Headers[Microsoft.Net.Http.Headers.HeaderNames.ContentDisposition] = $"inline; filename=\"{safeName}\"";
                return File(result.PdfBytes, "application/pdf");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = $"Error al renderizar PDF de previsualización: {ex.Message}" });
            }
        }

        private static string SanitizeFileName(string name)
        {
            var invalids = System.IO.Path.GetInvalidFileNameChars();
            var sanitized = string.Concat(name.Select(c => invalids.Contains(c) ? '_' : c));
            return string.IsNullOrWhiteSpace(sanitized) ? "documento.pdf" : sanitized;
        }

        private static object CreateTemplateSampleData(string code)
        {
            return new
            {
                // Datos Institucionales
                institucion = "INSTITUTO SUPERIOR TECNOLÓGICO \"MAYOR PEDRO TRAVERSARI\"",
                institucion_direccion = "MATILDE ALVAREZ S/N Y MARISCAL SUCRE (CHILLOGALLO)",
                carrera = "DESARROLLO DE SOFTWARE",
                codigo_carrera = "TSDS-001",
                modalidad = "Presencial",
                unidad_organizacion = "Unidad Profesional",
                periodo = "2026-1 (Mayo 2026 - Septiembre 2026)",
                periodo_academico = "2026-1 (Mayo 2026 - Septiembre 2026)",
                semestre = "Cuarto Semestre",
                nivel = "Cuarto Semestre",
                paralelo = "A",
                jornada = "Matutina",

                // Asignatura
                nombre_asignatura = "DESARROLLO DE APLICACIONES WEB AVANZADAS",
                asignatura = "DESARROLLO DE APLICACIONES WEB AVANZADAS",
                codigo_asignatura = "SOF-401",
                campo_formacion = "Praxis Profesional",
                creditos = 3.5,
                total_horas_asignatura = 160,
                horas_contacto_docente = 64,
                horas_practicas = 32,
                horas_autonomas = 64,

                // Docente
                docente = new
                {
                    nombre = "Ing. Juan Carlos Pérez Gómez, Mgtr.",
                    cedula = "1712345678",
                    email = "jperez@istpet.edu.ec",
                    titulo = "Magíster en Sistemas de Información",
                    telefono = "0991234567"
                },
                docente_nombre = "Ing. Juan Carlos Pérez Gómez, Mgtr.",
                docente_titulo = "Magíster en Sistemas de Información",
                docente_email = "jperez@istpet.edu.ec",

                // Objetivo y caracterización
                objetivo_asignatura = "Desarrollar soluciones informáticas web escalables mediante arquitecturas modernas y servicios distribuidos para responder a requerimientos empresariales actuales.",
                objetivo = "Desarrollar soluciones informáticas web escalables mediante arquitecturas modernas y servicios distribuidos para responder a requerimientos empresariales actuales.",
                descripcion_asignatura = "La asignatura proporciona al estudiante las competencias técnicas para concebir, diseñar e implementar sistemas web robustos utilizando tecnologías cloud, APIs RESTful y motores concurrentes.",

                // Prerrequisitos y Correquisitos
                prerrequisitos = new[]
                {
                    new { asignatura = "Programación Orientada a Objetos", codigo = "SOF-201", observacion = "Aprobada" },
                    new { asignatura = "Bases de Datos Relacionales", codigo = "SOF-301", observacion = "Aprobada" }
                },

                // Resultados de Aprendizaje
                resultados_aprendizaje_carrera = "Diseña e implementa software de alta calidad aplicando metodologías ágiles, estándares internacionales y criterios de seguridad computacional.",
                resultados_aprendizaje_asignatura = "Construye arquitecturas web modulares integrando bases de datos, mecanismos de autenticación y servicios concurrentes en tiempo real.",

                // Unidades Temáticas
                unidades = new[]
                {
                    new
                    {
                        numero = 1,
                        titulo = "UNIDAD 1: ARQUITECTURAS WEB Y APIs RESTful",
                        horas_totales = 40,
                        horas_docencia = 16,
                        horas_practicas = 8,
                        horas_autonomas = 16,
                        contenidos = "Fundamentos de HTTP/HTTPS, diseño de APIs REST, Clean Architecture, Entity Framework Core y middleware en ASP.NET Core.",
                        mecanismos_evaluacion = "Talleres prácticos de endpoints y control de versiones."
                    },
                    new
                    {
                        numero = 2,
                        titulo = "UNIDAD 2: CLIENTES MODERNOS Y REACT",
                        horas_totales = 40,
                        horas_docencia = 16,
                        horas_practicas = 8,
                        horas_autonomas = 16,
                        contenidos = "Componentes funcionales, React Hooks, Vite, Tailwind CSS, TypeScript y consumo de servicios con Axios.",
                        mecanismos_evaluacion = "Desarrollo de interfaces de usuario interactivas."
                    },
                    new
                    {
                        numero = 3,
                        titulo = "UNIDAD 3: CONCURRENCIA, TIEMPO REAL Y SEGURIDAD",
                        horas_totales = 40,
                        horas_docencia = 16,
                        horas_practicas = 8,
                        horas_autonomas = 16,
                        contenidos = "WebSockets con SignalR, CRDTs con Yjs para edición colaborativa, autenticación JWT y roles.",
                        mecanismos_evaluacion = "Prácticas de laboratorio colaborativas en vivo."
                    },
                    new
                    {
                        numero = 4,
                        titulo = "UNIDAD 4: DESPLIEGUE Y EVALUACIÓN FINAL",
                        horas_totales = 40,
                        horas_docencia = 16,
                        horas_practicas = 8,
                        horas_autonomas = 16,
                        contenidos = "Dockerización de aplicaciones, pipeline CI/CD básico, pruebas automatizadas y entrega del proyecto integrador.",
                        mecanismos_evaluacion = "Defensa del proyecto final integrador de cátedra."
                    }
                },

                // Metodología y Recursos
                estrategias_metodologicas = "Aprendizaje basado en proyectos (ABP), estudio de casos prácticos, sesiones de pair programming y laboratorios guiados en entornos de simulación.",
                recursos_didacticos = "Laboratorio de computación con conexión a Internet de alta velocidad, entornos IDE (VS Code / Visual Studio), repositorios Git institucionales y plataforma virtual.",

                // Actividades Prácticas
                actividades_practicas = new[]
                {
                    new { numero_unidad = "1", nombre_practica = "Construcción de API REST modular con EF Core", descripcion = "Implementación de endpoints CRUD con DTOs y validación fluida en Docker." },
                    new { numero_unidad = "2", nombre_practica = "Integración de Frontend React con Service Layer", descripcion = "Desarrollo de SPA con Vite y gestión de estado reactivo." },
                    new { numero_unidad = "3", nombre_practica = "Canal de concurrencia SignalR + Yjs", descripcion = "Sincronización en tiempo real de campos compartidos entre múltiples usuarios." }
                },

                // Criterios de Evaluación
                criterios_evaluacion = new
                {
                    nota_parcial_1 = "10.00 pts",
                    nota_parcial_2 = "10.00 pts",
                    nota_examen_final = "10.00 pts"
                },

                // Bibliografía
                bibliografia_basica = "Freeman, A. (2022). Pro ASP.NET Core 6: Develop Cloud-Ready Web Applications. Apress.\nBanks, A., & Porcello, E. (2020). Learning React: Modern Patterns for Developing React Apps. O'Reilly Media.",
                bibliografia_complementaria = "Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall.",

                // Firmas Oficiales
                coordinador_carrera = new { nombre = "Ing. Roberto M. Dávila, Mgtr.", cargo = "Coordinador de Carrera" },
                coordinador_carrera_nombre = "Ing. Roberto M. Dávila, Mgtr.",
                coordinador_academico = new { nombre = "Lic. Andrea V. Salazar, Mgtr.", cargo = "Coordinador Académico" },
                coordinador_academico_nombre = "Lic. Andrea V. Salazar, Mgtr.",
                vicerrector = new { nombre = "Msc. Carlos E. Morales, Ph.D.", cargo = "Vicerrector Académico" },
                vicerrector_nombre = "Msc. Carlos E. Morales, Ph.D.",
                fecha = DateTime.Now.ToString("dd/MM/yyyy")
            };
        }
    }

    public class UpdateTemplateRequest
    {
        [JsonPropertyName("htmlContent")]
        public string HtmlContent { get; set; } = string.Empty;

        [JsonPropertyName("customCss")]
        public string? CustomCss { get; set; }

        [JsonPropertyName("collaborativeFieldsJson")]
        public string? CollaborativeFieldsJson { get; set; }

        [JsonPropertyName("themeConfigJson")]
        public string? ThemeConfigJson { get; set; }
    }

    public class UpdateSignatureConfigRequest
    {
        [JsonPropertyName("requiresSignature")]
        public bool RequiresSignature { get; set; }

        [JsonPropertyName("signatureType")]
        public string SignatureType { get; set; } = string.Empty;
    }

    public class UpdateGlobalThemeRequest
    {
        [JsonPropertyName("themeConfigJson")]
        public string? ThemeConfigJson { get; set; }
    }

    public class UpdateTemplatesOrderRequest
    {
        [JsonPropertyName("codes")]
        public List<string> Codes { get; set; } = new();
    }

    public class RenderTemplatePreviewRequest
    {
        [JsonPropertyName("htmlContent")]
        public string? HtmlContent { get; set; }

        [JsonPropertyName("customCss")]
        public string? CustomCss { get; set; }

        [JsonPropertyName("themeConfigJson")]
        public string? ThemeConfigJson { get; set; }

        [JsonPropertyName("sampleData")]
        public object? SampleData { get; set; }
    }
}

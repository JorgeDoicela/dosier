using Dosier.Application.Common.Documents;
using Dosier.Domain.Common.Documents;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using System;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/documents/instances")]
    [Authorize]
    public partial class DocumentInstancesController : ControllerBase
    {
        private readonly IDocumentInstanceService _instanceService;
        private readonly IDocumentEngine _documentEngine;
        private readonly IDocumentDataOrchestrator _orchestrator;
        private readonly IEnumerable<IDocumentBlockProvider> _blockProviders;
        private readonly Microsoft.Extensions.Hosting.IHostEnvironment _environment;

        public DocumentInstancesController(
            IDocumentInstanceService instanceService,
            IDocumentEngine documentEngine,
            IDocumentDataOrchestrator orchestrator,
            IEnumerable<IDocumentBlockProvider> blockProviders,
            Microsoft.Extensions.Hosting.IHostEnvironment environment)
        {
            _instanceService = instanceService;
            _documentEngine = documentEngine;
            _orchestrator = orchestrator;
            _blockProviders = blockProviders;
            _environment = environment;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInstanceRequest request, CancellationToken ct)
        {
            var userUuid = User.Identity?.Name ?? "anon";
            var instance = await _instanceService.CreateAsync(
                request.TemplateCode,
                request.EntityUuid,
                userUuid,
                request.Title,
                request.EntityType ?? "Proyecto",
                ct);

            return Ok(instance);
        }

        [HttpGet("{uuid}")]
        public async Task<IActionResult> Get(string uuid, CancellationToken ct)
        {
            var instance = await _instanceService.GetByUuidAsync(uuid, ct);
            if (instance == null) return NotFound();
            return Ok(instance);
        }

        /// <summary>
        /// Obtiene todos los documentos vinculados a una entidad (ej: a un proyecto específico).
        /// </summary>
        [HttpGet("entity/{entityUuid}")]
        public async Task<IActionResult> GetByEntity(string entityUuid, CancellationToken ct)
        {
            var instances = await _instanceService.GetByEntityAsync(entityUuid, ct);
            return Ok(instances);
        }

        /// <summary>
        /// RESOLVER ATÓMICO: Busca una instancia existente por (entityUuid, templateCode).
        /// Si no existe, la crea con los datos proporcionados. Evita duplicados y race conditions.
        /// </summary>
        [HttpGet("resolve")]
        public async Task<IActionResult> Resolve(
            [FromQuery] string templateCode,
            [FromQuery] string entityUuid,
            [FromQuery] string? title = null,
            [FromQuery] string entityType = "Proyecto",
            CancellationToken ct = default)
        {
            try
            {
                var userUuid = User.Identity?.Name ?? "anon";
                var instance = await _instanceService.ResolveAsync(templateCode, entityUuid, userUuid, title, entityType, ct: ct);
                return Ok(instance);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Obtiene el historial global de los últimos documentos generados por el núcleo.
        /// Ideal para tableros de control y auditoría general.
        /// </summary>
        [HttpGet("global")]
        public async Task<IActionResult> GetGlobalHistory(CancellationToken ct)
        {
            var instances = await _instanceService.GetAllAsync(20, ct);
            return Ok(instances);
        }

        /// <summary>
        /// PROCESO: Finaliza un documento orquestando el Builder y CoWork.
        /// No recibe el PDF del cliente (evita manipulación). El servidor lo genera
        /// usando los datos oficiales y el contenido colaborativo auditado.
        /// </summary>
        [HttpPost("{uuid}/finalize")]
        public async Task<IActionResult> Finalize(string uuid, CancellationToken ct)
        {
            try
            {
                var userUuid = User.Identity?.Name ?? "anon";

                // 1. Orquestar los datos (Investigación + CoWork) en modo oficial (sin marca borrador)
                var docRequest = await _orchestrator.PrepareRequestAsync(uuid, userUuid, forceDraftMode: false, ct: ct);

                // 2. Generar el PDF oficial usando el Motor de Documentos (DOSIER Builder)
                var buildResult = await _documentEngine.GenerateAsync(docRequest, ct);

                // 3. Persistir y cerrar el ciclo de vida del documento
                var hash = "SHA256-" + Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper(); // En producción sería el hash real del PDF

                var instance = await _instanceService.FinalizeAsync(
                    uuid,
                    buildResult.PdfBytes,
                    buildResult.FileName,
                    hash,
                    buildResult.TraceabilityCode,
                    ct);

                return Ok(new {
                    Instance = instance,
                    TraceabilityCode = buildResult.TraceabilityCode,
                    FileName = buildResult.FileName
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = $"Error en la orquestación del documento: {ex.Message}" });
            }
        }

        /// <summary>
        /// ENDPOINT UNIVERSAL: Permite a DOSIER Builder (Frontend) autoguardar
        /// cualquier estructura de datos JSON (Rúbricas, Actas, Proyectos) sin
        /// depender de modelos rígidos como ProyectoDto.
        /// </summary>
        [HttpPatch("{uuid}/metadata")]
        public async Task<IActionResult> UpdateMetadata(
            string uuid,
            [FromBody] System.Text.Json.JsonElement metadata,
            CancellationToken ct)
        {
            try
            {
                string metadataJson = metadata.GetRawText();
                var instance = await _instanceService.UpdateMetadataAsync(uuid, metadataJson, ct);

                if (instance.TemplateCode == "PEA_OFICIAL")
                {
                    try
                    {
                        var peaService = HttpContext.RequestServices.GetService<dosier_application.Curriculum.Interfaces.IPeaService>();
                        if (peaService != null && !string.IsNullOrEmpty(instance.EntityUuid))
                        {
                            await peaService.SincronizarMetadataAsync(instance.EntityUuid, instance.DataSnapshotJson ?? metadataJson);
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"[DOSIER] Error en sincronización curricular del PEA: {ex.Message}");
                    }
                }

                return Ok(new { success = true, uuid = instance.Uuid });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { success = false, message = "Documento no encontrado." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{uuid}/upgrade-template")]
        public async Task<IActionResult> UpgradeTemplate(string uuid, CancellationToken ct)
        {
            try
            {
                var instance = await _instanceService.UpgradeTemplateAsync(uuid, ct);
                return Ok(new { success = true, version = instance.TemplateVersion });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { success = false, message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }

    public record CreateInstanceRequest(
        [property: JsonPropertyName("templateCode")] string TemplateCode,
        [property: JsonPropertyName("entityUuid")] string EntityUuid,
        [property: JsonPropertyName("entityType")] string? EntityType = null,
        [property: JsonPropertyName("title")] string? Title = null);

    public record FinalizeRequest(
        [property: JsonPropertyName("pdfBase64")] string? PdfBase64,
        [property: JsonPropertyName("hash")] string Hash,
        [property: JsonPropertyName("traceabilityCode")] string TraceabilityCode);

    public class UiSectionDto
    {
        public string Id { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public string IconName { get; set; } = string.Empty;
        public string? ComponentName { get; set; }
        public object? Config { get; set; }
    }
}

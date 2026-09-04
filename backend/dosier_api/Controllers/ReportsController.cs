using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Dosier.Application.Common.Documents;
using Dosier.Application.Research;
using dosier_application.Research;
using System.Security.Claims;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IDocumentEngine _documentEngine;
        private readonly IProjectOrchestrator _projectOrchestrator;
        private readonly IGroupsService _groupsService;
        private readonly DosierContext _context;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(
            IDocumentEngine documentEngine,
            IProjectOrchestrator projectOrchestrator,
            IGroupsService groupsService,
            DosierContext context,
            ILogger<ReportsController> logger)
        {
            _documentEngine = documentEngine;
            _projectOrchestrator = projectOrchestrator;
            _groupsService = groupsService;
            _context = context;
            _logger = logger;
        }

        [HttpGet("analiticas")]
        [Authorize(Roles = "DOSIER_ADMIN")]
        public async Task<IActionResult> GenerateAnalyticsReport(
            [FromQuery] string? period = null,
            [FromQuery] string? carrera = null)
        {
            try
            {
                _logger.LogInformation("[DOSIER Reports] Generando reporte de analíticas. Periodo={Period}, Carrera={Carrera}", period, carrera);

                var isAdmin = User.FindFirst("es_admin")?.Value == "true";
                var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier);

                var projects = await _projectOrchestrator.GetAllProjectsAsync();
                var stats = await _projectOrchestrator.GetDashboardStatsAsync(userIdRef ?? "system", isAdmin);
                var groups = await _groupsService.GetAllAsync();

                var filteredProjects = projects.AsEnumerable();

                if (!string.IsNullOrEmpty(period) && period != "TODOS")
                {
                    filteredProjects = filteredProjects
                        .Where(p => p.ConvocatoriaTitulo != null &&
                                    p.ConvocatoriaTitulo.Contains(period, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrEmpty(carrera) && carrera != "TODAS")
                {
                    filteredProjects = filteredProjects
                        .Where(p => p.Carrera != null &&
                                    p.Carrera.Equals(carrera, StringComparison.OrdinalIgnoreCase));
                }

                var filteredList = filteredProjects.ToList();

                var stateColorsFromDb = await _context.DocConfigWorkflows
                    .Where(w => w.Activo && w.ColorHex != null)
                    .Select(w => new { w.EstadoDestino, w.ColorHex })
                    .Distinct()
                    .ToListAsync();

                var stateColors = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    ["Borrador"] = "#6B7280",
                    ["Enviado"] = "#3B82F6",
                    ["En Revisión"] = "#F59E0B",
                    ["En Revision"] = "#F59E0B",
                    ["Aprobado"] = "#10B981",
                    ["En Ejecución"] = "#8B5CF6",
                    ["En Ejecucion"] = "#8B5CF6",
                    ["Finalizado"] = "#059669",
                    ["Rechazado"] = "#EF4444"
                };

                foreach (var dbColor in stateColorsFromDb)
                {
                    if (dbColor.EstadoDestino != null)
                    {
                        stateColors[dbColor.EstadoDestino] = dbColor.ColorHex!;
                    }
                }

                var estadosDistribucion = filteredList
                    .GroupBy(p => p.Estado ?? "Sin Estado")
                    .Select(g => new
                    {
                        estado = g.Key,
                        cantidad = g.Count(),
                        porcentaje = filteredList.Count > 0 ? Math.Round((double)g.Count() / filteredList.Count * 100, 1) : 0,
                        color = stateColors.ContainsKey(g.Key) ? stateColors[g.Key] : "#94A3B8"
                    })
                    .OrderByDescending(x => x.cantidad)
                    .ToList();

                var lineasDistribucion = filteredList
                    .Where(p => !string.IsNullOrEmpty(p.LineaInvestigacion))
                    .GroupBy(p => p.LineaInvestigacion!)
                    .Select(g => new
                    {
                        nombre = g.Key,
                        proyectos = g.Count()
                    })
                    .OrderByDescending(x => x.proyectos)
                    .ToList();

                var pndAligned = filteredList.Count(p => !string.IsNullOrEmpty(p.ObjetivoPnd));
                var pndPct = filteredList.Count > 0 ? Math.Round((double)pndAligned / filteredList.Count * 100, 1) : 0;
                var pndUmbralC = 80.0;
                var pndUmbralP = 50.0;
                var pndStatus = pndPct >= pndUmbralC ? "CUMPLIDO" : pndPct >= pndUmbralP ? "EN PROCESO" : "ALERTA";

                var totalProd = filteredList.Sum(p => p.TotalProductos);
                var researchers = stats.TotalInvestigadoresActivos > 0 ? stats.TotalInvestigadoresActivos : stats.MisProyectosActivos;
                var prodRate = researchers > 0 ? (double)totalProd / researchers : 0;
                var prodReferencia = 0.5;
                var prodPct = Math.Round(prodRate / prodReferencia * 100, 1);
                prodPct = Math.Min(prodPct, 100);
                var prodUmbralC = 100.0;
                var prodUmbralP = 50.0;
                var prodStatus = prodPct >= prodUmbralC ? "CUMPLIDO" : prodPct >= prodUmbralP ? "EN PROCESO" : "ALERTA";

                var trlMinimo = 5;
                var trlConfigRaw = await _context.DocConfigsGenerales
                    .Where(c => c.Clave == "Caces.TrlMinimoInnovacion")
                    .Select(c => c.Valor)
                    .FirstOrDefaultAsync();
                if (int.TryParse(trlConfigRaw, out var trlVal))
                {
                    trlMinimo = trlVal;
                }
                var withTrlOrPartner = filteredList.Count(p => (p.TrlActual.HasValue && p.TrlActual >= trlMinimo) || !string.IsNullOrEmpty(p.EntidadAliada));
                var innovPct = filteredList.Count > 0 ? Math.Round((double)withTrlOrPartner / filteredList.Count * 100, 1) : 0;
                var innovUmbralC = 15.0;
                var innovUmbralP = 7.5;
                var innovStatus = innovPct >= innovUmbralC ? "CUMPLIDO" : innovPct >= innovUmbralP ? "EN PROCESO" : "ALERTA";
                innovPct = Math.Min(innovPct, 100);

                var withStudents = filteredList.Count(p => p.TotalEstudiantes > 0);
                var studPct = filteredList.Count > 0 ? Math.Round((double)withStudents / filteredList.Count * 100, 1) : 0;
                var studUmbralC = 30.0;
                var studUmbralP = 15.0;
                var studStatus = studPct >= studUmbralC ? "CUMPLIDO" : studPct >= studUmbralP ? "EN PROCESO" : "ALERTA";
                studPct = Math.Min(studPct, 100);

                var indicadoresCaces = new List<object>
                {
                    new { codigo = "E1.PLAN", nombre = "Alineación PND y POA", descripcion = "Proyectos alineados al Plan Nacional de Desarrollo", progreso = (double)pndPct, meta = $"≥{pndUmbralC}%", estado = pndStatus, badge_class = pndStatus == "CUMPLIDO" ? "badge-success" : pndStatus == "EN PROCESO" ? "badge-warning" : "badge-danger", bar_color = pndStatus == "CUMPLIDO" ? "green" : pndStatus == "EN PROCESO" ? "amber" : "red", valor_actual = $"{pndAligned} de {filteredList.Count} proyectos alineados" },
                    new { codigo = "E2.PROD", nombre = "Producción Científica del Claustro", descripcion = $"Tasa de publicaciones: {prodRate:F1}/investigador (meta: {prodReferencia:F1})", progreso = (double)prodPct, meta = $"≥{prodReferencia:F1} pub/invest.", estado = prodStatus, badge_class = prodStatus == "CUMPLIDO" ? "badge-success" : prodStatus == "EN PROCESO" ? "badge-warning" : "badge-danger", bar_color = prodStatus == "CUMPLIDO" ? "green" : prodStatus == "EN PROCESO" ? "amber" : "red", valor_actual = $"{totalProd} productos de {researchers} investigadores" },
                    new { codigo = "E3.INNO", nombre = "Innovación y Transferencia Tecnológica", descripcion = $"Proyectos con TRL≥{trlMinimo} o entidad aliada", progreso = (double)innovPct, meta = $"≥{innovUmbralC}%", estado = innovStatus, badge_class = innovStatus == "CUMPLIDO" ? "badge-success" : innovStatus == "EN PROCESO" ? "badge-warning" : "badge-danger", bar_color = innovStatus == "CUMPLIDO" ? "green" : innovStatus == "EN PROCESO" ? "amber" : "red", valor_actual = $"{withTrlOrPartner} de {filteredList.Count} proyectos innovadores" },
                    new { codigo = "E4.STUD", nombre = "Vinculación Formativa (Semilleros)", descripcion = "Proyectos con participación estudiantil", progreso = (double)studPct, meta = $"≥{studUmbralC}%", estado = studStatus, badge_class = studStatus == "CUMPLIDO" ? "badge-success" : studStatus == "EN PROCESO" ? "badge-warning" : "badge-danger", bar_color = studStatus == "CUMPLIDO" ? "green" : studStatus == "EN PROCESO" ? "amber" : "red", valor_actual = $"{withStudents} de {filteredList.Count} proyectos con estudiantes" }
                };

                var proyectosTabla = filteredList.Select(p =>
                {
                    var estadoLower = (p.Estado ?? "").ToLower();
                    var badge = estadoLower switch
                    {
                        "aprobado" => "badge-success",
                        "en ejecución" or "en ejecucion" => "badge-success",
                        "finalizado" => "badge-success",
                        "en revisión" or "en revision" => "badge-warning",
                        "enviado" => "badge-neutral",
                        _ => "badge-neutral"
                    };
                    return new
                    {
                        codigo = p.CodigoInstitucional ?? $"IST-{p.IdProyecto:D3}",
                        titulo = p.Titulo ?? "Sin título",
                        linea = p.LineaInvestigacion ?? "General",
                        estudiantes = p.TotalEstudiantes,
                        productos = p.TotalProductos,
                        estado = p.Estado ?? "Sin estado",
                        estado_badge = badge,
                        entidad_aliada = p.EntidadAliada
                    };
                }).ToList();

                var consolidatedGroups = groups.Count(g =>
                    g.CategoriaConsolidacion?.Contains("Consolid", StringComparison.OrdinalIgnoreCase) == true ||
                    g.CategoriaConsolidacion?.Contains("A", StringComparison.OrdinalIgnoreCase) == true);

                var periodLabel = string.IsNullOrEmpty(period) || period == "TODOS" ? "Todos los Periodos" : period;
                var carreraLabel = string.IsNullOrEmpty(carrera) || carrera == "TODAS" ? "Todas las Tecnologías" : carrera;

                var reportData = new
                {
                    periodo = periodLabel,
                    carrera = carreraLabel,
                    fecha_generacion = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
                    generado_por = User.Identity?.Name ?? "Sistema DOSIER",
                    total_proyectos = filteredList.Count,
                    proyectos_ejecucion = filteredList.Count(p => p.Estado?.ToLower() == "en ejecución" || p.Estado?.ToLower() == "en ejecucion"),
                    proyectos_borrador = filteredList.Count(p => p.Estado?.ToLower() == "borrador"),
                    total_productos = totalProd,
                    articulos_indexados = stats.ArticulosIndexados,
                    prototipos = stats.Prototipos,
                    total_grupos = groups.Count(),
                    investigadores_activos = stats.TotalInvestigadoresActivos,
                    convocatorias = stats.TotalConvocatoriasAbiertas,
                    estados_distribucion = estadosDistribucion,
                    lineas_distribucion = lineasDistribucion,
                    indicadores_caces = indicadoresCaces,
                    proyectos_tabla = proyectosTabla,
                    grupos_consolidados = consolidatedGroups,
                    proyectos_con_estudiantes = withStudents
                };

                var request = new DocumentRequest
                {
                    TemplateCode = "REPORTE_ANALITICAS",
                    Data = reportData,
                    IsDraftMode = false,
                    IsBlindMode = false,
                    RequestedBy = User.Identity?.Name ?? "Sistema DOSIER"
                };

                var result = await _documentEngine.GenerateAsync(request);

                _logger.LogInformation("[DOSIER Reports] Reporte generado exitosamente. Hash={Hash}, Trazabilidad={Trace}",
                    result.FileHash, result.TraceabilityCode);

                var fileName = $"Reporte_Analiticas_ISTPET_{DateTime.Now:yyyyMMdd-HHmm}.pdf";
                return File(result.PdfBytes, "application/pdf", fileName);
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, "[DOSIER Reports] Error crítico al generar el reporte de analíticas");
                return BadRequest(new { error = "Error al generar el reporte: " + ex.Message });
            }
        }
    }
}
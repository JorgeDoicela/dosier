using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using dosier_application.Research;

namespace dosier_api.Controllers
{
    [ApiController]
    [Route("api/reports")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportsService _reportsService;

        public ReportsController(IReportsService reportsService)
        {
            _reportsService = reportsService;
        }

        [HttpGet("analiticas")]
        [Authorize(Roles = "DOSIER_ADMIN")]
        public async Task<IActionResult> GenerateAnalyticsReport(
            [FromQuery] string? period = null,
            [FromQuery] string? carrera = null)
        {
            try
            {
                var isAdmin = User.FindFirst("es_admin")?.Value == "true" || User.IsInRole("DOSIER_ADMIN");
                var userIdRef = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "system";
                var userName = User.Identity?.Name ?? "Sistema DOSIER";

                var pdfBytes = await _reportsService.GenerateAnalyticsReportPdfAsync(period, carrera, userIdRef, isAdmin, userName);
                var fileName = $"Reporte_Analiticas_ISTPET_{DateTime.Now:yyyyMMdd-HHmm}.pdf";

                return File(pdfBytes, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = "Error al generar el reporte: " + ex.Message });
            }
        }
    }
}
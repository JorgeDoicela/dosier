using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Common.Interfaces;
using dosier_infrastructure.data.models;
using dosier_domain.Curriculum.Entities;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using iText.Kernel.Colors;

namespace dosier_infrastructure.Common
{
    public class ReportsService : IReportsService
    {
        private readonly DosierContext _context;
        private readonly ILogger<ReportsService> _logger;

        public ReportsService(
            DosierContext context,
            ILogger<ReportsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<byte[]> GenerateAnalyticsReportPdfAsync(string? period, string? carrera, string userIdRef, bool isAdmin, string userName)
        {
            _logger.LogInformation("[DOSIER Reports] Generando reporte curricular PEA. Periodo={Period}, Carrera={Carrera}, Usuario={Usuario}", period, carrera, userName);

            var query = _context.Set<DocPea>()
                .AsNoTracking()
                .Where(p => p.Activo);

            // Gobernanza institucional de acceso:
            // Coordinador Académico, Vicerrector y Administrador: visualizan todas las carreras.
            // Coordinadores de Carrera: supervisan estrictamente las carreras que coordinan.
            var user = await _context.Users.AsNoTracking()
                .FirstOrDefaultAsync(u => u.IdSigafi == userIdRef || u.IdUsuario.ToString() == userIdRef || u.Nombre == userIdRef);

            bool isCoordAcad = false;
            bool isVicerrector = false;
            bool isCoordCarrera = false;

            if (user != null)
            {
                var roles = await _context.UserRoles.AsNoTracking()
                    .Where(ur => ur.IdUsuario == user.IdUsuario && (ur.EsActivo ?? true) && ur.Role != null)
                    .Select(ur => ur.Role.CodigoRol)
                    .ToListAsync();

                isCoordAcad = roles.Contains("DOSIER_COORD_ACAD");
                isVicerrector = roles.Contains("DOSIER_VICERRECTOR");
                isCoordCarrera = roles.Contains("DOSIER_COORD_CARRERA");
            }

            bool esSuperAutoridad = isAdmin || isVicerrector || isCoordAcad;

            if (!esSuperAutoridad && isCoordCarrera && user != null && !string.IsNullOrEmpty(user.IdSigafi))
            {
                var carrerasCoordinadas = await _context.DocAutoridadesCurriculares.AsNoTracking()
                    .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo && a.CargoCurricular == "COORD_CARRERA" && a.IdCarrera != null)
                    .Select(a => a.IdCarrera!.Value)
                    .ToListAsync();

                if (carrerasCoordinadas.Any())
                {
                    query = query.Where(p => carrerasCoordinadas.Contains(p.IdCarrera) || p.IdDocenteElaborador == user.IdSigafi);
                }
            }

            // Filtro opcional por período académico
            if (!string.IsNullOrWhiteSpace(period) &&
                !string.Equals(period, "todos", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(period, "todas", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.IdPeriodo == period.Trim());
            }

            var peas = await query.ToListAsync();

            using var ms = new MemoryStream();
            using var writer = new PdfWriter(ms);
            using var pdf = new PdfDocument(writer);
            using var document = new Document(pdf);

            document.Add(new Paragraph("INSTITUTO SUPERIOR TECNOLÓGICO PET")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontSize(16));

            document.Add(new Paragraph("REPORTE OFICIAL DE GOBERNANZA CURRICULAR — PROGRAMAS DE ESTUDIO (PEA)")
                .SetTextAlignment(TextAlignment.CENTER)
                .SetFontSize(12)
                .SetFontColor(ColorConstants.GRAY));

            document.Add(new Paragraph($"Generado por: {userName} | Fecha: {DateTime.Now:yyyy-MM-dd HH:mm:ss} UTC-5")
                .SetFontSize(9)
                .SetMarginBottom(20));

            // Resumen de estados
            var totalPeas = peas.Count;
            var borradores = peas.Count(p => p.Estado == "Borrador");
            var enRevision = peas.Count(p => p.Estado == "EnRevision");
            var revisadoCoord = peas.Count(p => p.Estado == "RevisadoCoord");
            var revisadoAcad = peas.Count(p => p.Estado == "RevisadoAcad");
            var aprobados = peas.Count(p => p.Estado == "Aprobado");
            var observados = peas.Count(p => p.Estado == "Observado");

            var table = new Table(UnitValue.CreatePercentArray(new float[] { 50, 50 })).UseAllAvailableWidth();
            table.AddHeaderCell(new Cell().Add(new Paragraph("Métrica Curricular")));
            table.AddHeaderCell(new Cell().Add(new Paragraph("Cantidad Total")));

            table.AddCell("Total PEAs Registrados");
            table.AddCell(totalPeas.ToString());

            table.AddCell("En Formulación (Borrador)");
            table.AddCell(borradores.ToString());

            table.AddCell("En Revisión de Coordinación de Carrera");
            table.AddCell(enRevision.ToString());

            table.AddCell("Con Observaciones Disciplinarias");
            table.AddCell(observados.ToString());

            table.AddCell("Revisado por Coordinación de Carrera");
            table.AddCell(revisadoCoord.ToString());

            table.AddCell("Revisado por Coordinación Académica");
            table.AddCell(revisadoAcad.ToString());

            table.AddCell("Legalizados y Aprobados (Vicerrectorado)");
            table.AddCell(aprobados.ToString());

            document.Add(table);

            document.Close();
            return ms.ToArray();
        }
    }
}

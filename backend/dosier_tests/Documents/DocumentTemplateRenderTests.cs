using System;
using System.IO;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.Extensions.Hosting;
using Dosier.Infrastructure.Common.Documents.Engine;

namespace dosier_tests.Documents
{
    public class DocumentTemplateRenderTests
    {
        private readonly Mock<IHostEnvironment> _environmentMock;
        private readonly TemplateFileLoader _fileLoader;
        private readonly HandlebarsTemplateEngine _handlebarsEngine;
        private readonly ITextHtmlPdfRenderer _pdfRenderer;

        public DocumentTemplateRenderTests()
        {
            _environmentMock = new Mock<IHostEnvironment>();
            _environmentMock.Setup(e => e.EnvironmentName).Returns(Environments.Development);

            _fileLoader = new TemplateFileLoader(_environmentMock.Object);
            _handlebarsEngine = new HandlebarsTemplateEngine();
            _pdfRenderer = new ITextHtmlPdfRenderer();
        }

        [Theory]
        [InlineData("PLAN_ANALITICO")]
        [InlineData("SEGUIMIENTO_TUTORIAS")]
        [InlineData("INFORME_ACOMPANAMIENTO_CARRERA")]
        [InlineData("PEA_OFICIAL")]
        public async Task Template_ShouldLoadHtml_And_RenderPdf_Successfully(string templateCode)
        {
            // Act 1: Load file
            var html = await _fileLoader.LoadAsync(templateCode);

            // Assert 1
            Assert.NotNull(html);
            Assert.NotEmpty(html);
            Assert.True(html.Length > 500, $"El HTML de '{templateCode}' debe contener estructura sustancial.");

            // Act 2: Handlebars interpolation
            var sampleData = new
            {
                carrera = "DESARROLLO DE SOFTWARE",
                asignatura = "DESARROLLO DE APLICACIONES WEB AVANZADAS",
                codigo_asignatura = "SOF-401",
                docente_nombre = "Ing. Juan Carlos Pérez Gómez, Mgtr.",
                periodo_academico = "2026-1"
            };

            var renderedHtml = await _handlebarsEngine.RenderAsync(html, sampleData, null, false);
            Assert.NotNull(renderedHtml);
            Assert.NotEmpty(renderedHtml);

            // Act 3: Render PDF
            var metadata = new DocumentRenderingMetadata
            {
                TemplateCode = templateCode,
                DocumentTitle = $"Test Render {templateCode}",
                TraceabilityCode = "TEST-TRAC-001",
                IsDraft = false
            };

            var pdfBytes = await _pdfRenderer.RenderWithMetadataAsync(renderedHtml, metadata);

            // Assert 2: PDF bytes exist and start with PDF header (%PDF)
            Assert.NotNull(pdfBytes);
            Assert.True(pdfBytes.Length > 1000, $"El PDF generado para '{templateCode}' debe ser un PDF válido (obtenido: {pdfBytes.Length} bytes).");

            var header = System.Text.Encoding.ASCII.GetString(pdfBytes, 0, 4);
            Assert.Equal("%PDF", header);
        }
    }
}

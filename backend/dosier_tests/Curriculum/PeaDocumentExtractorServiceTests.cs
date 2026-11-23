using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using dosier_application.Curriculum.Dtos;
using dosier_infrastructure.Curriculum;
using Xunit;

namespace dosier_tests.Curriculum
{
    public class PeaDocumentExtractorServiceTests
    {
        [Fact]
        public void NormalizeRdaToHtml_CuandoTextoVieneEnUnaSolaLineaLarga_SeparaPorOracionesEnParrafos()
        {
            // Arrange: Caso idéntico a la captura del usuario donde todo viene en un solo string continuo
            string raw = "Diseña arquitecturas backend desacopladas y seguras implementando APIs RESTful y ORM con balance estricto de concurrencia. Construye interfaces de usuario reactivas y modulares integrando gestión de estado y persistencia reactiva. Implementa mecanismos de sincronización en tiempo real mediante WebSockets y CRDTs colaborativos. Despliega soluciones en contenedores Docker y servicios en la nube con esquemas de validación y control de calidad.";

            // Act
            string html = PeaDocumentExtractorService.NormalizeRdaToHtml(raw);

            // Assert
            Assert.Contains("<p>Diseña arquitecturas backend desacopladas", html);
            Assert.Contains("<p>Construye interfaces de usuario reactivas", html);
            Assert.Contains("<p>Implementa mecanismos de sincronización", html);
            Assert.Contains("<p>Despliega soluciones en contenedores Docker", html);
            Assert.Equal(4, CountOccurrences(html, "<p>"));
        }

        [Fact]
        public void NormalizeRdaToHtml_CuandoVieneConPrefijosRDA_EliminaPrefijosYEntregaHtmlLimpio()
        {
            // Arrange
            string raw = "RDA 1: Diseña arquitecturas backend.\nRDA 2: Construye interfaces reactivas.\nRDA 3: Implementa WebSockets.";

            // Act
            string html = PeaDocumentExtractorService.NormalizeRdaToHtml(raw);

            // Assert
            Assert.DoesNotContain("RDA 1:", html);
            Assert.DoesNotContain("RDA 2:", html);
            Assert.Contains("<p>Diseña arquitecturas backend.</p>", html);
            Assert.Contains("<p>Construye interfaces reactivas.</p>", html);
            Assert.Contains("<p>Implementa WebSockets.</p>", html);
        }

        [Fact]
        public void ReconcileUnitHoursWithSigafi_CuandoHorasUnidadesDifierenDeTotalAsignatura_AjustaExactamenteAlTotal()
        {
            // Arrange: 4 unidades con 12+12+12 = 36h (suma 144h), pero la materia es de 160h
            var unidades = new List<PeaDraftUnidadDto>
            {
                new PeaDraftUnidadDto { Num = 1, HorasCD = 12m, HorasAPE = 12m, HorasTA = 12m },
                new PeaDraftUnidadDto { Num = 2, HorasCD = 12m, HorasAPE = 12m, HorasTA = 12m },
                new PeaDraftUnidadDto { Num = 3, HorasCD = 12m, HorasAPE = 12m, HorasTA = 12m },
                new PeaDraftUnidadDto { Num = 4, HorasCD = 12m, HorasAPE = 12m, HorasTA = 12m }
            };

            // Act: Invocamos reconciliación con método privado vía Reflection o validamos totales
            var method = typeof(PeaDocumentExtractorService).GetMethod(
                "ReconcileUnitHoursWithSigafi",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);

            Assert.NotNull(method);
            method.Invoke(null, new object[] { unidades, 0m, 0m, 0m, 160m });

            // Assert
            decimal totalFinal = unidades.Sum(u => u.HorasCD + u.HorasAPE + u.HorasTA);
            Assert.Equal(160m, totalFinal);
        }

        private static int CountOccurrences(string source, string match)
        {
            int count = 0;
            int n = 0;
            while ((n = source.IndexOf(match, n, StringComparison.OrdinalIgnoreCase)) != -1)
            {
                n += match.Length;
                count++;
            }
            return count;
        }
    }
}

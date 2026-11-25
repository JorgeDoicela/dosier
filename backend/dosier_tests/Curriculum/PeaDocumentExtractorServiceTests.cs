using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using dosier_application.Curriculum.Dtos;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.Curriculum;
using dosier_infrastructure.data.models;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
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

        [Fact]
        public void DeterministicParser_CuandoDocumentoTieneEstructuraPeaOficial_ExtraeTodasLasSeccionesSinIa()
        {
            // Arrange
            string rawDocumentText = @"
[TABLA DOCUMENTAL]
CARRERA: Tecnología Superior en Desarrollo de Software | CÓDIGO DE CARRERA: DS
MODALIDAD: Presencial | UNIDAD DE ORGANIZACIÓN CURRICULAR: Unidad Profesional
SEMESTRE: Cuarto | CRÉDITOS: 2
TOTAL DE HORAS: 96 | HORAS CONTACTO DOCENTE: 32 | HORAS PRÁCTICO-EXPERIMENTAL: 32 | HORAS APRENDIZAJE AUTÓNOMO: 32
[FIN TABLA]

b) OBJETIVO DE LA ASIGNATURA
Desarrollar aplicaciones web seguras y escalables utilizando arquitecturas modernas basadas en servicios REST.

c) PRERREQUISITOS:
[TABLA DOCUMENTAL]
ASIGNATURA | OBSERVACIONES
Programación Web I | Haber cursado y aprobado la asignatura según malla curricular
[FIN TABLA]

d) RESULTADOS DE APRENDIZAJE DE LA CARRERA A LOS QUE LA ASIGNATURA APORTA
• Implementa soluciones de software empresarial aplicando buenas prácticas de ingeniería.

e) RESULTADOS DE APRENDIZAJE DE LA ASIGNATURA:
RDA 1: Diseña APIs RESTful desacopladas con validación de esquemas.
RDA 2: Construye interfaces web reactivas conectadas a servicios en tiempo real.

f) CONTENIDOS DE ENSEÑANZA:
[TABLA DOCUMENTAL]
UNIDADES DE ESTUDIO Y SUS CONTENIDOS
UNIDAD 1: Fundamentos de Arquitecturas Web
Horas contacto docente: 16 | Horas práctico-experimental: 16 | Horas autónomo: 16
1.1. Protocolo HTTP y REST
1.2. Serialización JSON
UNIDAD 2: Seguridad y Despliegue
Horas contacto docente: 16 | Horas práctico-experimental: 16 | Horas autónomo: 16
2.1. Autenticación JWT
2.2. Contenedores Docker
[FIN TABLA]

g) METODOLOGÍA DE ENSEÑANZA
[TABLA DOCUMENTAL]
METODOLOGÍA DE ENSEÑANZA | RECURSOS DIDÁCTICOS / INFORMATIZACIÓN DEL APRENDIZAJE
Aprendizaje Basado en Problemas (ABP): Resolución de casos reales. | Visual Studio Code; Docker; Postman
[FIN TABLA]

h) ACTIVIDADES PRÁCTICAS
[TABLA DOCUMENTAL]
UNIDAD | NOMBRE DE LA PRÁCTICA Y CARACTERIZACIÓN DE LA ACTIVIDAD
1 | Construcción de un endpoint REST con validación de DTOs en laboratorio.
1, 2 | Despliegue integral de API y cliente web mediante contenedores.
[FIN TABLA]

i) EVALUACIÓN DEL APRENDIZAJE
[TABLA DOCUMENTAL]
NOTA | TIPO DE EVALUACIÓN | CALIFICACIÓN
FRECUENTE | Actividades autónomas y práctico experimentales | 3.00
PARCIAL | Evaluaciones sumativas de las unidades | 3.00
FINAL | Evaluación final de la asignatura | 4.00
TOTAL | 10.00
[FIN TABLA]

j) BIBLIOGRAFÍA
Bibliografía básica
1. Martin, R. C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design. Prentice Hall.
Bibliografía de consulta
1. Richardson, L., & Amundsen, M. (2013). RESTful Web APIs. O'Reilly Media.
";

            // Act
            var draft = DeterministicPeaDocumentParser.Parse(rawDocumentText);

            // Assert
            Assert.Equal("Presencial", draft.Modalidad);
            Assert.Equal("Unidad Profesional", draft.UnidadOrganizacion);
            Assert.Equal("Cuarto", draft.Semestre);
            Assert.Equal(2m, draft.Creditos);
            Assert.Equal("DS", draft.CodigoCarrera);
            Assert.Equal(96m, draft.TotalHorasAsignatura);

            Assert.Contains("Desarrollar aplicaciones web seguras", draft.ObjetivoAsignatura);
            Assert.Single(draft.Prerrequisitos);
            Assert.Equal("Programación Web I", draft.Prerrequisitos[0].Asignatura);
            Assert.Contains("Implementa soluciones de software empresarial", draft.RdaCarrera);
            Assert.DoesNotContain("RDA 1:", draft.ResultadosAprendizaje);
            Assert.Contains("Diseña APIs RESTful desacopladas", draft.ResultadosAprendizaje);

            Assert.Equal(2, draft.Unidades.Count);
            Assert.Equal("Fundamentos de Arquitecturas Web", draft.Unidades[0].Titulo);
            Assert.Equal(16m, draft.Unidades[0].HorasCD);
            Assert.Contains("1.1. Protocolo HTTP y REST", draft.Unidades[0].Contenidos);

            Assert.Contains("Aprendizaje Basado en Problemas", draft.MetodologiaEnsenanza);
            Assert.Contains("Visual Studio Code", draft.RecursosDidacticos);
            Assert.Contains("Docker", draft.RecursosDidacticos);

            Assert.Equal(2, draft.ActividadesPracticas.Count);
            Assert.Equal("1, 2", draft.ActividadesPracticas[1].UnidadTexto);
            Assert.Equal(3, draft.Evaluaciones.Count);
            Assert.Equal(2, draft.Bibliografias.Count);
            Assert.Contains(draft.Bibliografias, b => b.TipoBibliografia == "Basica");
            Assert.Contains(draft.Bibliografias, b => b.TipoBibliografia == "Consulta");
        }

        [Fact]
        public async Task ExtractAndMapDocumentAsync_SinApiKeyConfigurada_UsaParserDeterministaYReconciliaHoras()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseInMemoryDatabase($"PeaExtractorNoKey_{Guid.NewGuid()}")
                .Options;
            using var context = new DosierContext(options);

            string peaUuid = Guid.NewGuid().ToString();
            context.DocPeas.Add(new DocPea
            {
                IdPea = 1,
                Uuid = peaUuid,
                Activo = true,
                IdCarrera = 1,
                IdAsignatura = 1,
                TotalHorasAsignatura = 96m,
                HorasContactoDocente = 32m,
                HorasPracticoExperimental = 32m,
                HorasAutonomo = 32m,
                Estado = "Borrador"
            });
            await context.SaveChangesAsync();

            var emptyConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>()).Build();
            var httpFactoryMock = new Mock<IHttpClientFactory>();
            var dataProtection = new EphemeralDataProtectionProvider();

            var service = new PeaDocumentExtractorService(
                context,
                httpFactoryMock.Object,
                dataProtection,
                emptyConfig,
                NullLogger<PeaDocumentExtractorService>.Instance);

            byte[] docxBytes = BuildMinimalDocx(@"
                <w:p><w:r><w:t>b) OBJETIVO DE LA ASIGNATURA</w:t></w:r></w:p>
                <w:p><w:r><w:t>Diseñar sistemas de software modulares y mantenibles aplicando principios SOLID.</w:t></w:r></w:p>
                <w:p><w:r><w:t>f) CONTENIDOS DE ENSEÑANZA:</w:t></w:r></w:p>
                <w:p><w:r><w:t>UNIDAD 1: Fundamentos de Arquitectura</w:t></w:r></w:p>
                <w:p><w:r><w:t>1.1. Cohesión y acoplamiento</w:t></w:r></w:p>
                <w:p><w:r><w:t>UNIDAD 2: Patrones de Diseño</w:t></w:r></w:p>
                <w:p><w:r><w:t>2.1. Repository y Strategy</w:t></w:r></w:p>
            ");

            var request = new ImportPeaDocumentRequestDto
            {
                FileName = "silabo_prueba.docx",
                ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                FileBytes = docxBytes
            };

            // Act
            var result = await service.ExtractAndMapDocumentAsync(peaUuid, 10, request);

            // Assert
            Assert.Equal("deterministic-parser", result.ValidationSummary.ProviderUsed);
            Assert.Equal("regex-heuristic-v1", result.ValidationSummary.ModelUsed);
            Assert.Contains("Diseñar sistemas de software modulares", result.ObjetivoAsignatura);
            Assert.Equal(2, result.Unidades.Count);
            Assert.Equal(96m, result.Unidades.Sum(u => u.HorasCD + u.HorasAPE + u.HorasTA));
            Assert.True(result.ValidationSummary.IsHoursExactMatch);
            httpFactoryMock.Verify(f => f.CreateClient(It.IsAny<string>()), Times.Never);
        }

        [Fact]
        public void DeterministicParser_PdfRealSinPipesConLineasPartidasYEspaciosMultiples_ExtraeCorrectamente()
        {
            // Arrange: Simula la salida real de LocationTextExtractionStrategy de iText sobre un PDF sin pipes '|'
            string pdfExtractedText = @"
--- PÁGINA 1 ---
MODALIDAD:   Semipresencial    UNIDAD DE ORGANIZACIÓN CURRICULAR:   Básica
SEMESTRE:   Segundo            CRÉDITOS:   3
TOTAL DE HORAS: 144    HORAS CONTACTO DOCENTE: 48    HORAS PRÁCTICO EXPERIMENTAL: 48    HORAS AUTÓNOMO: 48
Página 1 de 3

2. OBJETIVO DE LA ASIGNATURA
Implementar algoritmos eficientes y estructuras de datos dinámicas para resolver problemas
computacionales complejos en entornos empresariales.

3. PRERREQUISITOS
Fundamentos de Programación    Haber aprobado el primer nivel de carrera

6. CONTENIDOS DE ENSEÑANZA
UNIDAD TEMÁTICA I: Estructuras Lineales    16    16    16    48
1.1. Listas enlazadas y pilas
1.2. Colas de prioridad
Página 2 de 3

8. ACTIVIDADES PRÁCTICAS
1    Implementación de una cola de atención con listas enlazadas en lenguaje C#.
1, 2    Optimización de algoritmos de búsqueda y ordenamiento con métricas de tiempo.

9. EVALUACIÓN DEL APRENDIZAJE
FRECUENTE    Talleres prácticos semanales    3,00
PARCIAL    Examen teórico de unidad    3,00
FINAL    Proyecto integrador final    4,00

10. BIBLIOGRAFÍA
Bibliografía básica
1. Cormen, T. H. (2022). Introduction to Algorithms (4th ed.).
MIT Press.
Bibliografía de consulta
1. Sedgewick, R. (2011). Algorithms. Addison-Wesley Professional.
Página 3 de 3
";

            // Act
            var draft = DeterministicPeaDocumentParser.Parse(pdfExtractedText);

            // Assert
            Assert.Equal("Semipresencial", draft.Modalidad);
            Assert.Equal("Unidad Básica", draft.UnidadOrganizacion);
            Assert.Equal("Segundo", draft.Semestre);
            Assert.Equal(3m, draft.Creditos);

            Assert.Contains("resolver problemas computacionales complejos", draft.ObjetivoAsignatura);
            Assert.Single(draft.Prerrequisitos);
            Assert.Equal("Fundamentos de Programación", draft.Prerrequisitos[0].Asignatura);
            Assert.Contains("primer nivel", draft.Prerrequisitos[0].Observacion);

            Assert.Single(draft.Unidades);
            Assert.Equal("Estructuras Lineales", draft.Unidades[0].Titulo);
            Assert.Equal(16m, draft.Unidades[0].HorasCD);
            Assert.Equal(16m, draft.Unidades[0].HorasAPE);
            Assert.Equal(16m, draft.Unidades[0].HorasTA);

            Assert.Equal(2, draft.ActividadesPracticas.Count);
            Assert.Equal("1, 2", draft.ActividadesPracticas[1].UnidadTexto);
            Assert.Equal(3, draft.Evaluaciones.Count);
            Assert.Equal(4.00m, draft.Evaluaciones[2].Calificacion);

            Assert.Equal(2, draft.Bibliografias.Count);
            Assert.Contains("MIT Press.", draft.Bibliografias[0].CitaCompletaApa);
        }

        [Fact]
        public void ExtractDigitalDocumentText_CuandoArchivoTieneFirmaBinariaDocLegadoORenombrada_RechazaConMensajeClaro()
        {
            byte[] fakeLegacyDoc = new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00 };
            var docEx = Assert.Throws<InvalidOperationException>(() =>
                PeaDocumentExtractorService.ExtractDigitalDocumentText("viejo.docx", "application/octet-stream", fakeLegacyDoc));
            Assert.Contains(".doc", docEx.Message);

            byte[] fakePdf = Encoding.UTF8.GetBytes("<html><body>Esto no es un PDF real</body></html>");
            var pdfEx = Assert.Throws<InvalidOperationException>(() =>
                PeaDocumentExtractorService.ExtractDigitalDocumentText("falso.pdf", "application/pdf", fakePdf));
            Assert.Contains("cabecera PDF válida", pdfEx.Message);
        }

        [Fact]
        public void DeterministicParser_EvaluacionOficialIstpet_MapeaNotaEnColumnaNotasYTipoEnColumnaTipo()
        {
            string raw = @"
i) EVALUACIÓN DEL APRENDIZAJE
Notas | TIPO DE EVALUACIÓN | CALIFICACION
NOTA PARCIAL 1 | ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES) | 10,00
NOTA PARCIAL 2 | EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL) | 10,00
EVALUACIÓN | EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN) | 10,00
";
            var draft = DeterministicPeaDocumentParser.Parse(raw);

            Assert.Equal(3, draft.Evaluaciones.Count);
            Assert.Equal("NOTA PARCIAL 1", draft.Evaluaciones[0].Nota);
            Assert.Equal("ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)", draft.Evaluaciones[0].Tipo);
            Assert.Equal(10.00m, draft.Evaluaciones[0].Calificacion);

            Assert.Equal("NOTA PARCIAL 2", draft.Evaluaciones[1].Nota);
            Assert.Equal("EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)", draft.Evaluaciones[1].Tipo);

            Assert.Equal("EVALUACIÓN", draft.Evaluaciones[2].Nota);
            Assert.Equal("EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)", draft.Evaluaciones[2].Tipo);

            // También validar formato PDF de una sola línea sin separadores de columna
            string singleLinePdf = @"
i) EVALUACIÓN DEL APRENDIZAJE
NOTA PARCIAL 1 ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES) 10,00
NOTA PARCIAL 2 EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL) 10,00
EVALUACIÓN EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN) 10,00
";
            var draftPdf = DeterministicPeaDocumentParser.Parse(singleLinePdf);

            Assert.Equal(3, draftPdf.Evaluaciones.Count);
            Assert.Equal("NOTA PARCIAL 1", draftPdf.Evaluaciones[0].Nota);
            Assert.Equal("ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)", draftPdf.Evaluaciones[0].Tipo);
            Assert.Equal("NOTA PARCIAL 2", draftPdf.Evaluaciones[1].Nota);
            Assert.Equal("EVALUACIÓN", draftPdf.Evaluaciones[2].Nota);
        }

        [Fact]
        public void NormalizeEvaluacionColumns_CuandoLlmInvierteNotaYTipo_CorrigeOrdenCanonicamente()
        {
            var inverted = new List<PeaDraftEvaluacionDto>
            {
                new() { Nota = "ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)", Tipo = "NOTA PARCIAL 1", Calificacion = 10m },
                new() { Nota = "EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)", Tipo = "NOTA PARCIAL 2", Calificacion = 10m },
                new() { Nota = "EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)", Tipo = "EVALUACIÓN", Calificacion = 10m }
            };

            PeaDocumentExtractorService.NormalizeEvaluacionColumns(inverted);

            Assert.Equal("NOTA PARCIAL 1", inverted[0].Nota);
            Assert.Equal("ACTIVIDADES AUTÓNOMAS Y PRÁCTICO EXPERIMENTALES (FRECUENTES)", inverted[0].Tipo);
            Assert.Equal("NOTA PARCIAL 2", inverted[1].Nota);
            Assert.Equal("EVALUACIONES SUMATIVAS DE LAS UNIDADES DE ESTUDIO (PARCIAL)", inverted[1].Tipo);
            Assert.Equal("EVALUACIÓN", inverted[2].Nota);
            Assert.Equal("EVALUACIÓN FINAL DE LA ASIGNATURA (EXAMEN)", inverted[2].Tipo);
        }

        private static byte[] BuildMinimalDocx(string bodyInnerXml)
        {
            using var ms = new MemoryStream();
            using (var archive = new ZipArchive(ms, ZipArchiveMode.Create, leaveOpen: true))
            {
                var entry = archive.CreateEntry("word/document.xml");
                using var writer = new StreamWriter(entry.Open(), Encoding.UTF8);
                writer.Write($@"<?xml version=""1.0"" encoding=""UTF-8"" standalone=""yes""?>
<w:document xmlns:w=""http://schemas.openxmlformats.org/wordprocessingml/2006/main"">
  <w:body>
    {bodyInnerXml}
  </w:body>
</w:document>");
            }
            return ms.ToArray();
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

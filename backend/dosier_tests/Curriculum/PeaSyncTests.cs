using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using dosier_infrastructure.data.models;
using dosier_domain.Curriculum.Entities;
using dosier_infrastructure.Curriculum;
using dosier_infrastructure.Signatures;
using dosier_infrastructure.Signatures.Subservices;
using dosier_application.Common;
using dosier_application.Academico;
using dosier_application.Curriculum.Interfaces;
using dosier_application.Security;
using dosier_infrastructure.Security;

namespace dosier_tests.Curriculum
{
    public class PeaSyncTests
    {
        private static DosierContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new DosierContext(options);
        }

        private static PeaService CreatePeaService(DosierContext context)
        {
            var mockResolver = new Mock<IAcademicContextResolver>();
            var mockExpedienteService = new Mock<IExpedienteCurricularService>();
            var mockFirmaElectronicaService = new Mock<IFirmaElectronicaService>();
            
            var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
            {
                {"DosierFirma:SigningSecret", "ClaveSecretaInstitucionalDOSIER2026SuperSegura!"},
                {"App:FrontendUrl", "https://dosier.istpet.edu.ec"}
            }).Build();

            var hashService = new SignatureHashService(config);

            var mockUrlService = new Mock<IAppUrlService>();
            mockUrlService.Setup(u => u.BuildFrontendUrl(It.IsAny<string>()))
                .Returns<string>(path => $"https://dosier.istpet.edu.ec{path}");

            return new PeaService(
                context,
                mockResolver.Object,
                mockExpedienteService.Object,
                hashService,
                mockUrlService.Object,
                mockFirmaElectronicaService.Object
            );
        }

        [Fact]
        public async Task SincronizarMetadataAsync_DebeSincronizarTodosLosCamposDelDocenteExitosamente()
        {
            // Arrange
            using var context = CreateInMemoryContext(Guid.NewGuid().ToString());
            var service = CreatePeaService(context);

            string peaUuid = Guid.NewGuid().ToString();
            var pea = new DocPea
            {
                IdPea = 10,
                Uuid = peaUuid,
                Estado = "EnRevision",
                Activo = true,
                TotalHorasAsignatura = 144,
                Creditos = 3
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            string snapshotJson = @"{
                ""NombreAsignatura"": ""GASTRONOMIA INTERNACIONAL"",
                ""ObjetivoAsignatura"": ""<p>Formar profesionales capaces de dominar la alta cocina internacional.</p>"",
                ""RdaCarrera"": ""<p>Aplica técnicas culinarias globales con rigor técnico.</p>"",
                ""TotalHorasAsignatura"": ""144"",
                ""Creditos"": ""3"",
                ""HorasContactoDocente"": ""48"",
                ""HorasPracticoExperimental"": ""48"",
                ""HorasAutonomo"": ""48"",
                ""Prerrequisitos"": [
                    { ""Asignatura"": ""COCINA BASICA"", ""Observacion"": ""Aprobada obligatoria"" },
                    { ""Asignatura"": ""HIGIENE ALIMENTARIA"", ""Observacion"": ""Requisito previo"" }
                ],
                ""ResultadosAprendizaje"": ""<p>Dominar cocinas europeas y asiáticas</p>"",
                ""Unidades"": [
                    {
                        ""titulo"": ""Unidad 1: Cocina Francesa Clásica"",
                        ""horasCD"": ""16"",
                        ""horasAPE"": ""16"",
                        ""horasTA"": ""16"",
                        ""horasTotal"": ""48"",
                        ""contenidos"": ""Fondos, salsas madre y técnicas de cocción francesas.""
                    }
                ],
                ""ActividadesPracticas"": [
                    {
                        ""nombre"": ""Elaboración de Salsas Madre"",
                        ""horas"": ""4"",
                        ""caracterizacion"": ""Taller de cocina caliente | Informe técnico de brigada""
                    }
                ],
                ""Evaluaciones"": [
                    {
                        ""Denominacion"": ""Examen Teórico Parcial 1"",
                        ""TipoEvaluacion"": ""Evaluación Escrita"",
                        ""CalificacionMaxima"": ""10""
                    }
                ],
                ""Bibliografias"": [
                    {
                        ""TipoBibliografia"": ""Basica"",
                        ""Autor"": ""Escoffier, Auguste"",
                        ""TituloLibro"": ""Le Guide Culinaire"",
                        ""CitaCompletaApa"": ""Escoffier, A. (1903). Le Guide Culinaire.""
                    }
                ]
            }";

            // Act
            bool resultado = await service.SincronizarMetadataAsync(peaUuid, snapshotJson);

            // Assert
            Assert.True(resultado);

            var peaActualizado = await context.DocPeas
                .Include(p => p.Unidades).ThenInclude(u => u.Temas)
                .Include(p => p.ResultadosAprendizaje)
                .Include(p => p.Prerrequisitos)
                .Include(p => p.ActividadesPracticas)
                .Include(p => p.Evaluaciones)
                .Include(p => p.Bibliografias)
                .FirstOrDefaultAsync(p => p.Uuid == peaUuid);

            Assert.NotNull(peaActualizado);
            Assert.Contains("Formar profesionales", peaActualizado.ObjetivoAsignatura);
            Assert.Equal(48, peaActualizado.HorasContactoDocente);
            Assert.Equal(2, peaActualizado.Prerrequisitos.Count);
            Assert.Equal("COCINA BASICA", peaActualizado.Prerrequisitos.First().NombreAsignatura);

            // RDA de Carrera y RDA de Asignatura
            Assert.Contains(peaActualizado.ResultadosAprendizaje, r => r.TipoRda == "Carrera");
            Assert.Contains(peaActualizado.ResultadosAprendizaje, r => r.TipoRda == "Asignatura");

            // Unidades y Temas
            Assert.Single(peaActualizado.Unidades);
            Assert.Equal("Unidad 1: Cocina Francesa Clásica", peaActualizado.Unidades.First().NombreUnidad);
            Assert.Equal(16, peaActualizado.Unidades.First().HorasDocencia);
            Assert.Equal(16, peaActualizado.Unidades.First().HorasPracticoExp);
            Assert.Equal(16, peaActualizado.Unidades.First().HorasAutonomo);
            Assert.Equal(48, peaActualizado.Unidades.First().TotalHorasUnidad);
            Assert.Single(peaActualizado.Unidades.First().Temas);

            // Actividades Prácticas
            Assert.Single(peaActualizado.ActividadesPracticas);
            Assert.Equal("Elaboración de Salsas Madre", peaActualizado.ActividadesPracticas.First().NombrePractica);
            Assert.Equal(4, peaActualizado.ActividadesPracticas.First().DuracionHoras);

            // Evaluaciones
            Assert.Single(peaActualizado.Evaluaciones);
            Assert.Equal("Examen Teórico Parcial 1", peaActualizado.Evaluaciones.First().Denominacion);
            Assert.Equal(10m, peaActualizado.Evaluaciones.First().CalificacionMaxima);

            // Bibliografía
            Assert.Single(peaActualizado.Bibliografias);
            Assert.Equal("Basica", peaActualizado.Bibliografias.First().TipoBibliografia);
            Assert.Equal("Le Guide Culinaire", peaActualizado.Bibliografias.First().TituloLibro);
        }

        [Fact]
        public async Task SincronizarInstanciasRealesMySql_DebeSincronizarDocumentosExistentes()
        {
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseMySql("Server=127.0.0.1;Port=3306;Database=sigafi_es;User=root;Password=12345;", ServerVersion.AutoDetect("Server=127.0.0.1;Port=3306;Database=sigafi_es;User=root;Password=12345;"))
                .Options;

            using var context = new DosierContext(options);
            var service = CreatePeaService(context);

            var instancias = await context.DocumentInstances
                .Where(d => d.TemplateCode == "PEA_OFICIAL" && !string.IsNullOrWhiteSpace(d.EntityUuid) && !string.IsNullOrWhiteSpace(d.DataSnapshotJson))
                .ToListAsync();

            foreach (var inst in instancias)
            {
                bool syncOk = await service.SincronizarMetadataAsync(inst.EntityUuid, inst.DataSnapshotJson!);
                Console.WriteLine($"[TEST-SYNC] Entity: {inst.EntityUuid} -> Sync: {syncOk}");
            }
        }
    }
}

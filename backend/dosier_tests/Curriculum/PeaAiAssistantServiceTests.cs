using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Domain.Common.Documents;
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
    public class PeaAiAssistantServiceTests
    {
        private sealed class StubHttpMessageHandler : HttpMessageHandler
        {
            private readonly Func<HttpRequestMessage, int, CancellationToken, Task<HttpResponseMessage>> _responder;
            public int CallCount { get; private set; }
            public List<string> CapturedBodies { get; } = new();
            public List<Uri?> CapturedUris { get; } = new();

            public StubHttpMessageHandler(Func<HttpRequestMessage, int, CancellationToken, Task<HttpResponseMessage>> responder)
            {
                _responder = responder;
            }

            protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
            {
                CallCount++;
                CapturedUris.Add(request.RequestUri);
                if (request.Content != null)
                {
                    CapturedBodies.Add(await request.Content.ReadAsStringAsync(cancellationToken));
                }
                return await _responder(request, CallCount, cancellationToken);
            }
        }

        private static DosierContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new DosierContext(options);
        }

        private static PeaAiAssistantService CreateService(
            DosierContext context,
            HttpMessageHandler handler,
            Dictionary<string, string?>? configOverrides = null)
        {
            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock
                .Setup(f => f.CreateClient(It.IsAny<string>()))
                .Returns(() => new HttpClient(handler, disposeHandler: false));

            var dataProtection = DataProtectionProvider.Create("dosier-ai-tests");
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(configOverrides ?? new Dictionary<string, string?>())
                .Build();

            return new PeaAiAssistantService(
                context,
                httpClientFactoryMock.Object,
                dataProtection,
                config,
                NullLogger<PeaAiAssistantService>.Instance);
        }

        private static async Task<(string PeaUuid, string InstanceUuid)> SeedPeaContextAsync(
            DosierContext context,
            bool withSigafiPrereqs = false,
            decimal totalHoras = 144m,
            decimal horasCd = 48m,
            decimal horasApe = 48m,
            decimal horasTa = 48m)
        {
            var carrera = new Carrera
            {
                IdCarrera = 10,
                Carrera1 = "Tecnología Superior en Desarrollo de Software",
                CodigoCases = "TSDS",
                EsInstituto = 1
            };
            var asignatura = new Asignatura
            {
                IdAsignatura = 200,
                Asignatura1 = "Programación Orientada a Objetos",
                Codigo = "TSDS-201"
            };
            var prereqAsig = new Asignatura
            {
                IdAsignatura = 199,
                Asignatura1 = "Fundamentos de Programación",
                Codigo = "TSDS-101"
            };
            var detalleMalla = new DetalleMalla
            {
                IdDetalleMalla = 300,
                IdAsignatura = 200,
                Horas = (int)totalHoras,
                HorasDocente = (int)horasCd,
                HorasPracticoExperimental = (int)horasApe
            };

            context.Carreras.Add(carrera);
            context.Asignaturas.AddRange(asignatura, prereqAsig);
            context.DetalleMallas.Add(detalleMalla);

            if (withSigafiPrereqs)
            {
                context.Prerequisitos.Add(new Prerequisito
                {
                    IdDetalleMalla = 300,
                    IdAsignatura = 199,
                    Activa = 1
                });
            }

            var perfil = new DocPerfilEgreso
            {
                IdPerfilEgreso = 1,
                Uuid = Guid.NewGuid().ToString(),
                IdCarrera = 10,
                IdMalla = 1,
                Version = "1.0",
                DescripcionGeneral = "Perfil TSDS",
                Activo = true,
                Resultados = new List<DocPerfilEgresoResultado>
                {
                    new()
                    {
                        IdResultadoPerfil = 1,
                        Uuid = Guid.NewGuid().ToString(),
                        Codigo = "RDA-CAR-1",
                        Descripcion = "Desarrollar aplicaciones modulares aplicando programación orientada a objetos.",
                        Orden = 1
                    }
                }
            };
            context.DocPerfilesEgreso.Add(perfil);

            string peaUuid = Guid.NewGuid().ToString();

            var pea = new DocPea
            {
                IdPea = 500,
                Uuid = peaUuid,
                IdCarrera = 10,
                IdAsignatura = 200,
                IdDetalleMalla = 300,
                SemestreNivel = "Segundo Semestre",
                Modalidad = "Presencial",
                UnidadOrganizacion = "Unidad Profesional",
                TotalHorasAsignatura = totalHoras,
                HorasContactoDocente = horasCd,
                HorasPracticoExperimental = horasApe,
                HorasAutonomo = horasTa,
                Activo = true
            };
            context.DocPeas.Add(pea);

            var docInstance = DocumentInstance.Create("PEA_OFICIAL", 1, peaUuid, "1", "PEA POO", "Pea");
            context.DocumentInstances.Add(docInstance);

            await context.SaveChangesAsync();
            return (peaUuid, docInstance.Uuid);
        }

        private static HttpResponseMessage OpenAiJsonResponse(object payloadObject)
        {
            string innerJson = JsonSerializer.Serialize(payloadObject);
            return OpenAiRawContentResponse(innerJson);
        }

        private static HttpResponseMessage OpenAiRawContentResponse(string content)
        {
            var envelope = new
            {
                choices = new[]
                {
                    new
                    {
                        message = new
                        {
                            role = "assistant",
                            content
                        }
                    }
                }
            };
            return new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(JsonSerializer.Serialize(envelope), Encoding.UTF8, "application/json")
            };
        }

        [Fact]
        public async Task SaveConfigAsync_NonAdminGlobalScope_ThrowsUnauthorized()
        {
            using var ctx = CreateInMemoryContext(nameof(SaveConfigAsync_NonAdminGlobalScope_ThrowsUnauthorized));
            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));
            var service = CreateService(ctx, handler);

            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.SaveConfigAsync(10, isAdmin: false, new SavePeaAiConfigRequestDto
                {
                    Provider = "deepseek",
                    ApiKey = "sk-test-12345678",
                    Scope = "global"
                }));
        }

        [Fact]
        public async Task SaveConfigAsync_InvalidEndpointUrl_ThrowsArgumentException()
        {
            using var ctx = CreateInMemoryContext(nameof(SaveConfigAsync_InvalidEndpointUrl_ThrowsArgumentException));
            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));
            var service = CreateService(ctx, handler);

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SaveConfigAsync(10, isAdmin: false, new SavePeaAiConfigRequestDto
                {
                    Provider = "custom",
                    BaseUrl = "ftp://internal-service:21/api",
                    Scope = "user"
                }));

            Assert.Contains("HTTP o HTTPS", ex.Message);
        }

        [Fact]
        public async Task SaveConfigAsync_And_GetConfigStatus_EncryptsAndMasksApiKey()
        {
            using var ctx = CreateInMemoryContext(nameof(SaveConfigAsync_And_GetConfigStatus_EncryptsAndMasksApiKey));
            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));
            var service = CreateService(ctx, handler);

            var status = await service.SaveConfigAsync(42, isAdmin: false, new SavePeaAiConfigRequestDto
            {
                Provider = "openai",
                Model = "gpt-4o-mini",
                ApiKey = "sk-proj-secret12345678abcd",
                ReasoningEffort = "high",
                Scope = "user"
            });

            Assert.True(status.IsReady);
            Assert.True(status.HasUserApiKey);
            Assert.Equal("openai", status.ActiveProvider);
            Assert.Equal("gpt-4o-mini", status.ActiveModel);
            Assert.Equal("high", status.ActiveReasoningEffort);
            Assert.Equal("sk-p••••abcd", status.MaskedApiKey);

            var dbMeta = await ctx.DocUsuariosMetadata.FirstAsync(m => m.IdUsuario == 42);
            Assert.DoesNotContain("sk-proj-secret12345678abcd", dbMeta.Configuracion);
        }

        [Fact]
        public async Task GenerateDraftAsync_ThinkBlocks_MarkdownFence_And_TrailingBraces_ParsesCleanly()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_ThinkBlocks_MarkdownFence_And_TrailingBraces_ParsesCleanly));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            string noisyModelOutput = @"<think>
Analizando horas: 48 CD + 48 APE + 48 TA = 144. Evaluando {estructura} previa...
</think>
Aquí tienes el borrador solicitado:
```json
{
  ""objetivo_asignatura"": ""<p>Diseñar soluciones de software orientadas a objetos con buenas prácticas.</p>"",
  ""rda_carrera"": ""<ul><li>Desarrolla software modular.</li></ul>"",
  ""resultados_aprendizaje"": ""<ul><li><strong>RDA 1:</strong> Modela clases y objetos.</li></ul>"",
  ""metodologia_ensenanza"": ""<p>Aprendizaje basado en proyectos.</p>"",
  ""recursos_didacticos"": ""<p>IDE, Git y servidor de pruebas.</p>"",
  ""unidades"": [
    { ""num"": 1, ""titulo"": ""Unidad 1: Fundamentos OOP"", ""contenidos"": ""1.1 Clases\n1.2 Objetos"", ""horas_cd"": 12, ""horas_ape"": 12, ""horas_ta"": 12 },
    { ""num"": 2, ""titulo"": ""Herencia y Polimorfismo"", ""contenidos"": ""2.1 Herencia\n2.2 Interfaces"", ""horas_cd"": 12, ""horas_ape"": 12, ""horas_ta"": 12 },
    { ""num"": 3, ""titulo"": ""Patrones Básicos"", ""contenidos"": ""3.1 SOLID\n3.2 Factory"", ""horas_cd"": 12, ""horas_ape"": 12, ""horas_ta"": 12 },
    { ""num"": 4, ""titulo"": ""Persistencia y Pruebas"", ""contenidos"": ""4.1 Unit Testing\n4.2 Repositorios"", ""horas_cd"": 12, ""horas_ape"": 12, ""horas_ta"": 12 }
  ]
}
```
Nota adicional para el docente: verifica el formato {oficial}.";

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiRawContentResponse(noisyModelOutput)));
            var service = CreateService(ctx, handler);

            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                Provider = "deepseek",
                Model = "deepseek-reasoner",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Contains("Diseñar soluciones de software", System.Net.WebUtility.HtmlDecode(draft.ObjetivoAsignatura));
            Assert.Equal(4, draft.Unidades.Count);
            Assert.Equal("Fundamentos OOP", draft.Unidades[0].Titulo);
            Assert.True(draft.ValidationSummary.IsHoursExactMatch);
            Assert.Equal(144m, draft.ValidationSummary.GeneratedTotalHoras);
        }

        [Fact]
        public async Task GenerateDraftAsync_Transient429And503_RetriesAndSucceeds()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_Transient429And503_RetriesAndSucceeds));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, attempt, _) =>
            {
                if (attempt == 1)
                    return Task.FromResult(new HttpResponseMessage((HttpStatusCode)429) { Content = new StringContent("rate limit") });
                if (attempt == 2)
                    return Task.FromResult(new HttpResponseMessage(HttpStatusCode.ServiceUnavailable) { Content = new StringContent("overloaded") });

                return Task.FromResult(OpenAiJsonResponse(new
                {
                    objetivo_asignatura = "<p>Implementar aplicaciones robustas orientadas a objetos.</p>"
                }));
            });

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Equal(3, handler.CallCount);
            Assert.Contains("Implementar aplicaciones robustas", draft.ObjetivoAsignatura);
        }

        [Fact]
        public async Task GenerateDraftAsync_Timeout_ThrowsClearTimeoutException()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_Timeout_ThrowsClearTimeoutException));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, _, _) =>
                throw new TaskCanceledException("HttpClient.Timeout expired"));

            var service = CreateService(ctx, handler);

            var ex = await Assert.ThrowsAsync<TimeoutException>(() =>
                service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
                {
                    TargetSection = "pea_objectives_section",
                    Provider = "deepseek",
                    ApiKeyOverride = "sk-test-key"
                }));

            Assert.Contains("excedió el tiempo máximo", ex.Message);
            Assert.Equal(3, handler.CallCount);
        }

        [Fact]
        public async Task GenerateDraftAsync_WeakBloomVerb_Conocer_IsReplacedBeforeGenericSuffix()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_WeakBloomVerb_Conocer_IsReplacedBeforeGenericSuffix));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Conocer los principios de la programación orientada a objetos en entornos empresariales.</p>"
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.StartsWith("<p>Analizar y aplicar los principios", draft.ObjetivoAsignatura);
            Assert.Equal("Analizar", draft.ValidationSummary.BloomVerbDetected);
            Assert.True(draft.ValidationSummary.IsBloomVerbValid);
        }

        [Fact]
        public async Task GenerateDraftAsync_ReconcilesUnitsHoursWithSigafi_ExactMatchWithRemainders()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_ReconcilesUnitsHoursWithSigafi_ExactMatchWithRemainders));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, totalHoras: 144m, horasCd: 48m, horasApe: 48m, horasTa: 48m);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Desarrollar sistemas modulares.</p>",
                unidades = new[]
                {
                    new { num = 1, titulo = "U1", contenidos = "1.1 A", horas_cd = 10, horas_ape = 5, horas_ta = 5 },
                    new { num = 2, titulo = "U2", contenidos = "2.1 B", horas_cd = 10, horas_ape = 5, horas_ta = 5 },
                    new { num = 3, titulo = "U3", contenidos = "3.1 C", horas_cd = 10, horas_ape = 5, horas_ta = 5 },
                    new { num = 4, titulo = "U4", contenidos = "4.1 D", horas_cd = 10, horas_ape = 5, horas_ta = 5 },
                    new { num = 5, titulo = "U5", contenidos = "5.1 E", horas_cd = 10, horas_ape = 5, horas_ta = 5 }
                }
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Equal(48m, draft.Unidades.Sum(u => u.HorasCD));
            Assert.Equal(48m, draft.Unidades.Sum(u => u.HorasAPE));
            Assert.Equal(48m, draft.Unidades.Sum(u => u.HorasTA));
            Assert.True(draft.ValidationSummary.IsHoursExactMatch);
        }

        [Fact]
        public async Task GenerateDraftAsync_PartialScopeSingleSection_DoesNotHallucinateOtherSections()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_PartialScopeSingleSection_DoesNotHallucinateOtherSections));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Implementar arquitecturas limpias en aplicaciones orientadas a objetos.</p>"
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Contains("Implementar arquitecturas limpias", draft.ObjetivoAsignatura);
            Assert.Empty(draft.Bibliografias);
            Assert.Empty(draft.ActividadesPracticas);
            Assert.Equal(new[] { "pea_objectives_section" }, draft.ValidationSummary.GeneratedSections);
        }

        [Fact]
        public async Task GenerateDraftAsync_DocenteRequestsPrerequisites_OverridesNivelInicial()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_DocenteRequestsPrerequisites_OverridesNivelInicial));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, withSigafiPrereqs: false);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                prerrequisitos = new[]
                {
                    new { asignatura = "No registra prerrequisitos (Nivel inicial)", observacion = "Sin requisitos" }
                }
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_prerequisites_section",
                CustomInstructions = "Por favor agrega un prerrequisito técnico acorde a programación.",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.NotEmpty(draft.Prerrequisitos);
            Assert.DoesNotContain(draft.Prerrequisitos, p => p.Asignatura.Contains("No registra", StringComparison.OrdinalIgnoreCase));
        }

        [Fact]
        public async Task GenerateDraftAsync_ResolvesByDocumentInstanceUuid_And_SendsEditorContext()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_ResolvesByDocumentInstanceUuid_And_SendsEditorContext));
            var (_, instanceUuid) = await SeedPeaContextAsync(ctx, withSigafiPrereqs: true);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Desarrollar componentes reutilizables en POO.</p>"
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(instanceUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                CurrentObjetivo = "<p>Objetivo previo del docente</p>",
                CustomInstructions = "Mejora la redacción conservando el enfoque práctico.",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Contains("Desarrollar componentes reutilizables", draft.ObjetivoAsignatura);
            Assert.Single(handler.CapturedBodies);
            Assert.Contains("Objetivo previo del docente", handler.CapturedBodies[0]);
            Assert.Contains("Fundamentos de Programación", System.Text.RegularExpressions.Regex.Unescape(handler.CapturedBodies[0]));
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_HoursMismatchAndMissingApe_DetectsObservationsDeterministically()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_HoursMismatchAndMissingApe_DetectsObservationsDeterministically));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, totalHoras: 144m, horasCd: 48m, horasApe: 48m, horasTa: 48m);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "Se detectan desfases horarios en las unidades y prácticas APE.",
                checks = new[]
                {
                    new { criterion = "Distribución horaria y créditos (RRA Art. 21)", status = "cumple", detail = "3 créditos = 144h." }
                }
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m,
                CurrentUnidades = new List<PeaDraftUnidadDto>
                {
                    new() { Num = 1, Titulo = "U1", Contenidos = "1.1 Intro", HorasCD = 20, HorasAPE = 10, HorasTA = 20 },
                    new() { Num = 2, Titulo = "U2", Contenidos = "2.1 Clases", HorasCD = 20, HorasAPE = 10, HorasTA = 20 }
                },
                CurrentActividadesPracticas = new List<PeaDraftActividadPracticaDto>
                {
                    new() { Unidad = 1, Nombre = "Práctica 1", Horas = 10, Escenario = "Lab", Producto = "Código" }
                }
            });

            Assert.True(analysis.Checks.Count >= 5);
            Assert.Contains(analysis.Checks, c => c.Criterion.Contains("unidades", StringComparison.OrdinalIgnoreCase) && c.Status == "observado");
            Assert.Contains(analysis.Checks, c => c.Criterion.Contains("APE", StringComparison.OrdinalIgnoreCase) && c.Status == "alerta");
            Assert.Contains(analysis.SuggestedObservations, o => o.SectionKey == "Unidades");
            Assert.Contains(analysis.SuggestedObservations, o => o.SectionKey == "ActividadesPracticas");
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_CompliantIstpetPeaWith4x10EvalAndEnglishBib_NoFalsePositives()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_CompliantIstpetPeaWith4x10EvalAndEnglishBib_NoFalsePositives));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, withSigafiPrereqs: false);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "El PEA cumple con la normativa.",
                checks = new[]
                {
                    new { criterion = "Evaluación del Aprendizaje (Sección 9)", status = "observado", detail = "La suma da 40 puntos en vez de 10." },
                    new { criterion = "Bibliografía (Sección 10)", status = "alerta", detail = "Incluye libros en inglés." },
                    new { criterion = "Coherencia de prerrequisitos con malla SIGAFI", status = "alerta", detail = "No hay prerrequisitos." }
                },
                suggested_observations = new[]
                {
                    new { section_key = "Evaluaciones", section_label = "9. Evaluación", severity = "alta", observation_text = "La suma da 40 puntos, corregir escala a 100." },
                    new { section_key = "Bibliografia", section_label = "10. Bibliografía", severity = "media", observation_text = "Traducir libros en inglés a español." },
                    new { section_key = "Prerrequisitos", section_label = "3. Prerrequisitos", severity = "media", observation_text = "Agregar prerrequisitos." }
                }
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m,
                CurrentEvaluaciones = new List<PeaDraftEvaluacionDto>
                {
                    new() { Nota = "Docencia", Tipo = "Formativa", Calificacion = 10m },
                    new() { Nota = "APE", Tipo = "Rúbrica", Calificacion = 10m },
                    new() { Nota = "Autónomo", Tipo = "Proyecto", Calificacion = 10m },
                    new() { Nota = "Sumativa", Tipo = "Examen", Calificacion = 10m }
                },
                CurrentBibliografias = new List<PeaDraftBibliografiaDto>
                {
                    new() { TipoBibliografia = "Basica", CitaCompletaApa = "Gamma, E. (2020). Design Patterns. Addison-Wesley." },
                    new() { TipoBibliografia = "Basica", CitaCompletaApa = "Martin, R. (2021). Clean Code. Prentice Hall." },
                    new() { TipoBibliografia = "Basica", CitaCompletaApa = "Fowler, M. (2020). Refactoring. Addison-Wesley." },
                    new() { TipoBibliografia = "Consulta", CitaCompletaApa = "Bloch, J. (2021). Effective Java. Addison-Wesley." },
                    new() { TipoBibliografia = "Consulta", CitaCompletaApa = "Kleppmann, M. (2022). Designing Data-Intensive Applications. O'Reilly." },
                    new() { TipoBibliografia = "Consulta", CitaCompletaApa = "Evans, E. (2020). Domain-Driven Design. Addison-Wesley." }
                }
            });

            Assert.DoesNotContain(analysis.SuggestedObservations, o => o.SectionKey == "Evaluaciones");
            Assert.DoesNotContain(analysis.SuggestedObservations, o => o.SectionKey == "Bibliografia");
            Assert.DoesNotContain(analysis.SuggestedObservations, o => o.SectionKey == "Prerrequisitos");
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_CorruptedJsonResponse_FallsBackToDeterministic5Checks()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_CorruptedJsonResponse_FallsBackToDeterministic5Checks));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, totalHoras: 144m, horasCd: 48m, horasApe: 48m, horasTa: 48m);

            var handler = new StubHttpMessageHandler((_, _, _) =>
                Task.FromResult(OpenAiRawContentResponse("{\"analysis_summary\": \"truncado\", \"checks\": [")));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "ollama",
                Model = "qwen2.5",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m
            });

            Assert.False(analysis.AnalysisSummary.StartsWith("{"));
            Assert.Equal(5, analysis.Checks.Count);
            Assert.Contains("144", analysis.HoursComparisonSummary);
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_LlmHallucinatesArithmetic_BackendEnforcesMathematicalTruth()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_LlmHallucinatesArithmetic_BackendEnforcesMathematicalTruth));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, totalHoras: 144m, horasCd: 48m, horasApe: 48m, horasTa: 48m);

            // El LLM alucina: dice que unidades cumplen (cuando suman 100h != 144h) y que APE falla (cuando suman 48h == 48h)
            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "Revisión con errores aritméticos del modelo.",
                checks = new[]
                {
                    new { criterion = "Distribución horaria y créditos (RRA Art. 21)", status = "cumple", detail = "OK" },
                    new { criterion = "Suma de horas en unidades vs Sección 1", status = "cumple", detail = "Las unidades cuadran perfectamente." },
                    new { criterion = "Cobertura de prácticas experimentales (APE)", status = "observado", detail = "Faltan horas de práctica APE." }
                },
                suggested_observations = new[]
                {
                    new { section_key = "ActividadesPracticas", section_label = "8. Prácticas APE", severity = "alta", observation_text = "Faltan horas de práctica APE en la sección 8." }
                }
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m,
                CurrentUnidades = new List<PeaDraftUnidadDto>
                {
                    new() { Num = 1, Titulo = "U1", Contenidos = "1.1 A", HorasCD = 20, HorasAPE = 15, HorasTA = 15 },
                    new() { Num = 2, Titulo = "U2", Contenidos = "2.1 B", HorasCD = 20, HorasAPE = 15, HorasTA = 15 }
                },
                CurrentActividadesPracticas = new List<PeaDraftActividadPracticaDto>
                {
                    new() { Unidad = 1, Nombre = "Práctica 1", Horas = 24, Escenario = "Lab 1", Producto = "Código" },
                    new() { Unidad = 2, Nombre = "Práctica 2", Horas = 24, Escenario = "Lab 2", Producto = "Informe" }
                }
            });

            var unitsCheck = analysis.Checks.First(c => c.Criterion.Contains("unidades", StringComparison.OrdinalIgnoreCase));
            var apeCheck = analysis.Checks.First(c => c.Criterion.Contains("APE", StringComparison.OrdinalIgnoreCase));

            Assert.Equal("observado", unitsCheck.Status);
            Assert.Contains("Desfase", unitsCheck.Detail);
            Assert.Equal("cumple", apeCheck.Status);
            Assert.Contains("48", apeCheck.Detail);
            Assert.Contains(analysis.SuggestedObservations, o => o.SectionKey == "Unidades");
            Assert.DoesNotContain(analysis.SuggestedObservations, o => o.SectionKey == "ActividadesPracticas");
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_WithNivelInicialPlaceholderAndEmptySigafiPrereqs_MarksCumple()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_WithNivelInicialPlaceholderAndEmptySigafiPrereqs_MarksCumple));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, withSigafiPrereqs: false);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "Análisis completado."
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m,
                CurrentPrerrequisitos = new List<PeaDraftPrerrequisitoDto>
                {
                    new() { Asignatura = "No registra prerrequisitos (Nivel inicial)", Observacion = "Primer nivel" }
                }
            });

            var prereqCheck = analysis.Checks.First(c => c.Criterion.Contains("prerrequisitos", StringComparison.OrdinalIgnoreCase));
            Assert.Equal("cumple", prereqCheck.Status);
            Assert.DoesNotContain(analysis.SuggestedObservations, o => o.SectionKey == "Prerrequisitos");
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_SigafiRequiresPrereqButPeaEmpty_DetectsAndGeneratesObservation()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_SigafiRequiresPrereqButPeaEmpty_DetectsAndGeneratesObservation));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, withSigafiPrereqs: true);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "Análisis completado sin observaciones de prerrequisitos."
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 48m,
                CurrentHorasAPE = 48m,
                CurrentHorasTA = 48m,
                CurrentPrerrequisitos = new List<PeaDraftPrerrequisitoDto>()
            });

            var prereqCheck = analysis.Checks.First(c => c.Criterion.Contains("prerrequisitos", StringComparison.OrdinalIgnoreCase));
            Assert.Equal("observado", prereqCheck.Status);
            Assert.Contains("Fundamentos de Programación", prereqCheck.Detail);
            Assert.Contains(analysis.SuggestedObservations, o =>
                o.SectionKey == "Prerrequisitos" &&
                o.ObservationText.Contains("Fundamentos de Programación"));
        }

        [Fact]
        public async Task AnalyzeForReviewAsync_ExplicitZeroHoursInEditor_NotMaskedByAutoThirds()
        {
            using var ctx = CreateInMemoryContext(nameof(AnalyzeForReviewAsync_ExplicitZeroHoursInEditor_NotMaskedByAutoThirds));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx, totalHoras: 144m, horasCd: 0m, horasApe: 0m, horasTa: 144m);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                analysis_summary = "Revisión con ceros explícitos."
            })));

            var service = CreateService(ctx, handler);
            var analysis = await service.AnalyzeForReviewAsync(peaUuid, 1, new AnalyzePeaReviewRequestDto
            {
                Provider = "openai",
                ApiKeyOverride = "sk-test-key",
                CurrentCreditos = 3,
                CurrentTotalHoras = 144m,
                CurrentHorasCD = 0m,
                CurrentHorasAPE = 0m,
                CurrentHorasTA = 144m
            });

            Assert.Contains("0h CD, 0h APE, 144h TA", analysis.HoursComparisonSummary);
        }

        [Fact]
        public async Task GenerateDraftAsync_PartialScopeWithHallucinatedExtraSections_StripsUnrequestedFields()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_PartialScopeWithHallucinatedExtraSections_StripsUnrequestedFields));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Diseñar sistemas distribuidos resilientes.</p>",
                metodologia_ensenanza = "<p>Aprendizaje basado en retos.</p>",
                unidades = new[]
                {
                    new { num = 1, titulo = "Arquitectura", contenidos = "1.1 Microservicios", horas_cd = 48, horas_ape = 48, horas_ta = 48 }
                },
                bibliografias = new[]
                {
                    new { tipo_bibliografia = "Basica", autor = "Newman, S.", titulo_libro = "Building Microservices", editorial_ciudad = "O'Reilly", cita_completa_apa = "Newman, S. (2021). Building Microservices. O'Reilly." }
                }
            })));

            var service = CreateService(ctx, handler);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "openai",
                ApiKeyOverride = "sk-test-key"
            });

            Assert.Contains("Diseñar sistemas distribuidos", System.Net.WebUtility.HtmlDecode(draft.ObjetivoAsignatura));
            Assert.Equal(string.Empty, draft.MetodologiaEnsenanza);
            Assert.Empty(draft.Unidades);
            Assert.Empty(draft.Bibliografias);
            Assert.Equal(string.Empty, draft.BibliografiaBasica);
            Assert.Equal(new[] { "pea_objectives_section" }, draft.ValidationSummary.GeneratedSections);
        }

        [Fact]
        public async Task GenerateDraftAsync_GeminiAndAnthropicProtocols_And_OpenAi400Fallback()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_GeminiAndAnthropicProtocols_And_OpenAi400Fallback));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            // 1. Gemini nativo
            var geminiHandler = new StubHttpMessageHandler((_, _, _) =>
            {
                var payload = new
                {
                    candidates = new[]
                    {
                        new { content = new { parts = new[] { new { text = "{\"objetivo_asignatura\":\"<p>Implementar APIs REST.</p>\"}" } } } }
                    }
                };
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                });
            });

            var geminiService = CreateService(ctx, geminiHandler);
            var geminiDraft = await geminiService.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "gemini",
                Model = "gemini-2.5-flash",
                ApiKeyOverride = "AIzaTestKey123"
            });
            Assert.Contains("generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", geminiHandler.CapturedUris[0]!.ToString());
            Assert.Contains("Implementar APIs REST", geminiDraft.ObjetivoAsignatura);

            // 2. Anthropic nativo
            bool hasAnthropicHeaders = false;
            var anthropicHandler = new StubHttpMessageHandler((req, _, _) =>
            {
                hasAnthropicHeaders = req.Headers.Contains("x-api-key") && req.Headers.Contains("anthropic-version");
                var payload = new
                {
                    content = new[] { new { type = "text", text = "{\"objetivo_asignatura\":\"<p>Analizar patrones de diseño.</p>\"}" } }
                };
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
                });
            });

            var anthropicService = CreateService(ctx, anthropicHandler);
            var anthropicDraft = await anthropicService.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "anthropic",
                Model = "claude-3-5-sonnet-latest",
                ApiKeyOverride = "sk-ant-test"
            });
            Assert.True(hasAnthropicHeaders);
            Assert.Contains("Analizar patrones de diseño", System.Net.WebUtility.HtmlDecode(anthropicDraft.ObjetivoAsignatura));

            // 3. Fallback automático HTTP 400 cuando endpoint custom rechaza response_format/temperature
            var fallbackHandler = new StubHttpMessageHandler((_, attempt, _) =>
            {
                if (attempt == 1)
                {
                    return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest)
                    {
                        Content = new StringContent("{\"error\":\"response_format not supported\"}")
                    });
                }
                return Task.FromResult(OpenAiJsonResponse(new
                {
                    objetivo_asignatura = "<p>Construir servicios en la nube.</p>"
                }));
            });

            var fallbackService = CreateService(ctx, fallbackHandler);
            var fallbackDraft = await fallbackService.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "custom",
                BaseUrlOverride = "https://llm.local.example.com/v1",
                ApiKeyOverride = "sk-custom"
            });
            Assert.Equal(2, fallbackHandler.CallCount);
            Assert.Contains("response_format", fallbackHandler.CapturedBodies[0]);
            Assert.DoesNotContain("response_format", fallbackHandler.CapturedBodies[1]);
            Assert.Contains("Construir servicios en la nube", fallbackDraft.ObjetivoAsignatura);
        }

        [Fact]
        public async Task GenerateDraftAsync_OpenAiO3Mini_SendsReasoningEffort_And_TruncatesHugeHistory()
        {
            using var ctx = CreateInMemoryContext(nameof(GenerateDraftAsync_OpenAiO3Mini_SendsReasoningEffort_And_TruncatesHugeHistory));
            var (peaUuid, _) = await SeedPeaContextAsync(ctx);

            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(OpenAiJsonResponse(new
            {
                objetivo_asignatura = "<p>Optimizar algoritmos concurrentes.</p>"
            })));

            var service = CreateService(ctx, handler);
            string hugeContent = new string('X', 10000);
            var draft = await service.GenerateDraftAsync(peaUuid, 1, new GeneratePeaDraftRequestDto
            {
                TargetSection = "pea_objectives_section",
                Provider = "openai",
                Model = "o3-mini",
                ReasoningEffort = "high",
                ApiKeyOverride = "sk-openai-test",
                ConversationHistory = new List<PeaAiChatMessageDto>
                {
                    new() { Role = "user", Content = hugeContent }
                }
            });

            Assert.Single(handler.CapturedBodies);
            Assert.Contains("\"reasoning_effort\":\"high\"", handler.CapturedBodies[0]);
            Assert.DoesNotContain("\"temperature\"", handler.CapturedBodies[0]);
            Assert.DoesNotContain(new string('X', 5000), handler.CapturedBodies[0]);
            Assert.Contains("Optimizar algoritmos concurrentes", draft.ObjetivoAsignatura);
        }

        [Fact]
        public async Task SaveConfigAsync_SsrfMetadataUrl_ThrowsArgumentException()
        {
            using var ctx = CreateInMemoryContext(nameof(SaveConfigAsync_SsrfMetadataUrl_ThrowsArgumentException));
            var handler = new StubHttpMessageHandler((_, _, _) => Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)));
            var service = CreateService(ctx, handler);

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SaveConfigAsync(10, isAdmin: false, new SavePeaAiConfigRequestDto
                {
                    Provider = "custom",
                    BaseUrl = "http://169.254.169.254/latest/meta-data/",
                    Scope = "user"
                }));

            Assert.Contains("no permitida", ex.Message);
        }
    }
}

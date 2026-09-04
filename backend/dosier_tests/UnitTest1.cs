using System;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Dosier.Application.Research;
using Dosier.Application.Research.Dtos;
using dosier_application.Research.Dtos;
using Dosier.Application.Common.Documents;
using Microsoft.Extensions.Configuration;
using dosier_application.Security;
using dosier_application.Common.Notifications;
using dosier_infrastructure.data.models;
using dosier_infrastructure.Research;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Dosier.Infrastructure.Common.Documents;
using dosier_api.Controllers;
using Dosier.Infrastructure.Common.Storage;

namespace dosier_tests;

public class UnitTest1
{
    private static readonly bool _skipTests = Environment.GetEnvironmentVariable("GITHUB_ACTIONS") == "true";

    private static string GetConnectionString()
        => Environment.GetEnvironmentVariable("TEST_DB_CONNECTION")
           ?? "Server=127.0.0.1;Port=3306;Database=sigafi_es;User=root;Password=YOUR_LOCAL_DB_PASSWORD;";

    private async Task EnsureDatabaseColumnsExistAsync(DosierContext context)
    {
        var statements = new[]
        {
            "ALTER TABLE doc_proyectos_profesores ADD COLUMN activo TINYINT(1) DEFAULT 1;",
            "ALTER TABLE doc_proyectos_profesores ADD COLUMN fecha_fin DATETIME NULL;",
            "ALTER TABLE doc_proyectos_profesores ADD COLUMN fecha_inicio DATETIME NULL;",
            "ALTER TABLE doc_proyectos_profesores ADD COLUMN motivo_cambio VARCHAR(150) NULL;",

            "ALTER TABLE doc_proyectos_alumnos ADD COLUMN activo TINYINT(1) DEFAULT 1;",
            "ALTER TABLE doc_proyectos_alumnos ADD COLUMN fecha_fin DATETIME NULL;",
            "ALTER TABLE doc_proyectos_alumnos ADD COLUMN fecha_inicio DATETIME NULL;",
            "ALTER TABLE doc_proyectos_alumnos ADD COLUMN motivo_cambio VARCHAR(150) NULL;",

            "ALTER TABLE doc_grupos_investigacion ADD COLUMN estado VARCHAR(20) DEFAULT 'Aprobado';",
            "ALTER TABLE doc_proyectos ADD COLUMN autoExtendDeadlines TINYINT(1) DEFAULT 0;",
            "ALTER TABLE doc_proyectos ADD COLUMN autoExtendDays INT DEFAULT 7;",
            "ALTER TABLE doc_cronograma ADD COLUMN responsable VARCHAR(255) NULL;",
            "ALTER TABLE doc_cronograma ADD COLUMN entregable TEXT NULL;"
        };

        foreach (var sql in statements)
        {
            try
            {
                await context.Database.ExecuteSqlRawAsync(sql);
            }
            catch (Exception)
            {
                // Ignorar excepciones (ej: si la columna ya existe)
            }
        }
    }

    [Fact]
    public async Task TestProjectSync()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        await EnsureDatabaseColumnsExistAsync(context);
        
        var mockAuth = new Mock<IAuthService>();
        var mockAudit = new Mock<IAuditService>();
        var mockNotification = new Mock<INotificationService>();
        var mockLogger = new Mock<ILogger<ProjectOrchestrator>>();
        
        mockAuth.Setup(a => a.GetOrProvisionUserByCedulaAsync(It.IsAny<string>()))
            .ReturnsAsync((dosier_domain.Identity.Entities.User?)null);
        var queryService = new ProjectQueryService(context);
        var securityService = new ProjectSecurityService(context, queryService);
        var mockTeamChange = new Mock<IProjectTeamChangeService>();
        var mockTeamSync = new Mock<IProjectTeamSyncService>();
        var teamService = new ProjectTeamService(context, mockAuth.Object, mockAudit.Object, mockNotification.Object, mockTeamChange.Object, mockTeamSync.Object, new Mock<ILogger<ProjectTeamService>>().Object);
        var wizardService = new ProjectWizardService(context, mockAuth.Object, mockAudit.Object, queryService, teamService, new Mock<ILogger<ProjectWizardService>>().Object);
        
        var orchestrator = new ProjectOrchestrator(
            securityService,
            wizardService,
            teamService,
            queryService
        );
        
        string json = "{\"Titulo\":\"\",\"IdCarrera\":0,\"IdConvocatoria\":0,\"Periodo\":\"\",\"TiempoEjecucion\":\"\",\"Programa\":\"\",\"GrupoInvestigacionTipo\":\"NO\",\"GrupoInvestigacionNombre\":\"\",\"Dominio\":\"\",\"LineaInvestigacion\":\"\",\"SublineaInvestigacion\":\"\",\"TipoInvestigacion\":\"APLICADA\",\"CampoAmplio\":\"\",\"CampoEspecifico\":\"\",\"CampoDetallado\":\"\",\"DirectorProyecto\":\"\",\"FechaPresentacion\":\"\",\"FechaInicio\":\"\",\"FechaFin\":\"\",\"Investigadores\":[],\"Antecedentes\":\"\",\"DescripcionProyecto\":\"\",\"Justificacion\":\"\",\"ObjetivoGeneral\":\"\",\"ObjetivosEspecificos\":\"\",\"ObjetivosDesarrolloSostenible\":\"\",\"MarcoTeorico\":\"\",\"Metodologia\":\"\",\"Evaluacion\":\"\",\"RecursosDisponibles\":[],\"RecursosNecesarios\":[],\"CostoTotal\":0,\"FinanciamientoIstpet\":false,\"FinanciamientoOtrasFuentes\":false,\"NombresOtrasFuentes\":\"\",\"ProductosEsperados\":[],\"Impacto\":{\"social\":\"\",\"cientifico\":\"\",\"economico\":\"\",\"politico\":\"\",\"ambiental\":\"\",\"otro\":\"\"},\"Cronograma\":[{\"Actividad\":\"Actividad\",\"Numero\":0,\"RecursosNecesarios\":\"Actividad\",\"id\":\"rand_j5nicbi\"},{\"Actividad\":\"\",\"Numero\":1,\"RecursosNecesarios\":\"\",\"id\":\"rand_q2gywrb\"}],\"Bibliografia\":\"\",\"FirmasResponsabilidad\":{\"DirectorNombre\":\"\",\"DirectorCargo\":\"Director del Proyecto\",\"CoordinadorNombre\":\"\",\"CoordinadorCargo\":\"Coordinador de Carrera\"},\"Uuid\":\"7921b3de-9682-4595-81ff-b974bcb0149c\",\"EntityUuid\":\"c4515615-d3a5-44e0-998a-14111b2c8ebf\",\"entityUuid\":\"c4515615-d3a5-44e0-998a-14111b2c8ebf\"}";
        
        var options = new System.Text.Json.JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
        var dto = System.Text.Json.JsonSerializer.Deserialize<ProyectoDto>(json, options);
        Assert.NotNull(dto);
        dto.Uuid = "c4515615-d3a5-44e0-998a-14111b2c8ebf"; // Simulating the real EntityUuid mapping
        
        var result1 = await orchestrator.SyncProjectWizardDataAsync(dto, "0302144159");
        if (!result1.Success)
        {
            Console.WriteLine($"FIRST SYNC FAILURE: {result1.Message}");
        }
        Assert.True(result1.Success, $"First sync failed: {result1.Message}");

        // Modify a field and sync again
        dto.Titulo = "UPDATED TITLE FOR INTEGRATION TEST";
        var result2 = await orchestrator.SyncProjectWizardDataAsync(dto, "0302144159");
        if (!result2.Success)
        {
            Console.WriteLine($"SECOND SYNC FAILURE: {result2.Message}");
        }
        Assert.True(result2.Success, $"Second sync failed: {result2.Message}");

        await CleanProjectAsync(context, "c4515615-d3a5-44e0-998a-14111b2c8ebf");
    }

    [Fact]
    public async Task TestPrintUserHours()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        
        var projectUuid = "a79989c8-7f22-4d74-b27f-a09401b8bebc";
        var project = await context.DocProyectos.FirstOrDefaultAsync(p => p.Uuid == projectUuid);
        if (project == null)
        {
            Console.WriteLine($"[DIAG] Project NOT found in database: {projectUuid}");
        }
        else
        {
            Console.WriteLine($"[DIAG] Raw Project: Id={project.IdProyecto}, Uuid={project.Uuid}, Titulo='{project.Titulo}', Estado='{project.Estado}', MetadataCacesJson='{project.MetadataCacesJson}'");
        }

        var instances = await context.DocumentInstances.Where(i => i.EntityUuid == projectUuid).ToListAsync();
        Console.WriteLine($"[DIAG] DocumentInstances count for {projectUuid}: {instances.Count}");
        foreach (var inst in instances)
        {
            Console.WriteLine($"[DIAG] Instance: Uuid={inst.Uuid}, EntityUuid={inst.EntityUuid}, TemplateCode={inst.TemplateCode}, Title='{inst.Title}', State={inst.State}, SnapshotLength={inst.DataSnapshotJson?.Length ?? 0}, Snapshot='{inst.DataSnapshotJson}'");
        }
    }


    [Fact]
    public async Task TestFetchSnapshot()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        var instance = await context.DocumentInstances.FirstOrDefaultAsync(i => i.Uuid == "307c9503-d112-4545-b3c3-b7ba8655ddac");
        if (instance != null)
        {
            Console.WriteLine("SNAPSHOT JSON FOR 307c9503-d112-4545-b3c3-b7ba8655ddac:");
            Console.WriteLine(instance.DataSnapshotJson);
        }
        else
        {
            Console.WriteLine("INSTANCE NOT FOUND");
        }
    }

    [Fact]
    public async Task TestCheckProjectState()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        var project = await context.DocProyectos
            .Include(p => p.DocCronogramas)
            .FirstOrDefaultAsync(p => p.Uuid == "c4515615-d3a5-44e0-998a-14111b2c8ebf");
            
        if (project != null)
        {
            Console.WriteLine($"PROJECT c4515615-d3a5-44e0-998a-14111b2c8ebf: Titulo='{project.Titulo}', Estado='{project.Estado}'");
            Console.WriteLine($"Activities count: {project.DocCronogramas.Count}");
            foreach (var act in project.DocCronogramas)
            {
                Console.WriteLine($"- Activity: Id={act.IdActividad}, Uuid={act.Uuid}, Desc='{act.Descripcion}', Orden={act.NumeroActividad}");
            }
        }
        else
        {
            Console.WriteLine("PROJECT NOT FOUND");
        }
    }

    [Fact]
    public async Task TestUpdateMetadataController()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        await EnsureDatabaseColumnsExistAsync(context);
        
        var mockAuth = new Mock<IAuthService>();
        var mockAudit = new Mock<IAuditService>();
        var mockNotification = new Mock<INotificationService>();
        var mockLoggerOrch = new Mock<ILogger<ProjectOrchestrator>>();
        
        mockAuth.Setup(a => a.GetOrProvisionUserByCedulaAsync(It.IsAny<string>()))
            .ReturnsAsync((dosier_domain.Identity.Entities.User?)null);
        var queryService = new ProjectQueryService(context);
        var securityService = new ProjectSecurityService(context, queryService);
        var mockTeamChange = new Mock<IProjectTeamChangeService>();
        var mockTeamSync = new Mock<IProjectTeamSyncService>();
        var teamService = new ProjectTeamService(context, mockAuth.Object, mockAudit.Object, mockNotification.Object, mockTeamChange.Object, mockTeamSync.Object, new Mock<ILogger<ProjectTeamService>>().Object);
        var wizardService = new ProjectWizardService(context, mockAuth.Object, mockAudit.Object, queryService, teamService, new Mock<ILogger<ProjectWizardService>>().Object);
        
        var orchestrator = new ProjectOrchestrator(
            securityService,
            wizardService,
            teamService,
            queryService
        );
        
        var mockStorage = new Mock<IFileStorageService>();
        var mockServiceProvider = new Mock<IServiceProvider>();
        mockServiceProvider.Setup(x => x.GetService(typeof(Dosier.Application.Research.IProjectOrchestrator)))
            .Returns(orchestrator);
            
        var instanceService = new DocumentInstanceService(context, mockStorage.Object, mockServiceProvider.Object);
        
        var mockEngine = new Mock<IDocumentEngine>();
        var mockDocOrch = new Mock<IDocumentDataOrchestrator>();
        var mockEnv = new Mock<Microsoft.Extensions.Hosting.IHostEnvironment>();
        var providersList = new System.Collections.Generic.List<IDocumentBlockProvider>();
        var controller = new DocumentInstancesController(instanceService, mockEngine.Object, mockDocOrch.Object, context, providersList, mockEnv.Object);
        
        var claims = new[] { new Claim(ClaimTypes.NameIdentifier, "0302144159") };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
        
        string json = "{\"Titulo\":\"\",\"IdCarrera\":0,\"IdConvocatoria\":0,\"Periodo\":\"\",\"TiempoEjecucion\":\"\",\"Programa\":\"\",\"GrupoInvestigacionTipo\":\"NO\",\"GrupoInvestigacionNombre\":\"\",\"Dominio\":\"\",\"LineaInvestigacion\":\"\",\"SublineaInvestigacion\":\"\",\"TipoInvestigacion\":\"APLICADA\",\"CampoAmplio\":\"\",\"CampoEspecifico\":\"\",\"CampoDetallado\":\"\",\"DirectorProyecto\":\"\",\"FechaPresentacion\":\"\",\"FechaInicio\":\"\",\"FechaFin\":\"\",\"Investigadores\":[],\"Antecedentes\":\"\",\"DescripcionProyecto\":\"\",\"Justificacion\":\"\",\"ObjetivoGeneral\":\"\",\"ObjetivosEspecificos\":\"\",\"ObjetivosDesarrolloSostenible\":\"\",\"MarcoTeorico\":\"\",\"Metodologia\":\"\",\"Evaluacion\":\"\",\"RecursosDisponibles\":[],\"RecursosNecesarios\":[],\"CostoTotal\":0,\"FinanciamientoIstpet\":false,\"FinanciamientoOtrasFuentes\":false,\"NombresOtrasFuentes\":\"\",\"ProductosEsperados\":[],\"Impacto\":{\"social\":\"\",\"cientifico\":\"\",\"economico\":\"\",\"politico\":\"\",\"ambiental\":\"\",\"otro\":\"\"},\"Cronograma\":[{\"Actividad\":\"Actividad\",\"Numero\":0,\"RecursosNecesarios\":\"Actividad\",\"id\":\"rand_j5nicbi\",\"Semanas\":[true,false,true,false,false,false,false,false,false,false,false,false]},{\"Actividad\":\"\",\"Numero\":1,\"RecursosNecesarios\":\"\",\"id\":\"rand_q2gywrb\",\"Semanas\":[false,false,false,false,false,false,false,false,false,false,false,false]}],\"Bibliografia\":\"\",\"FirmasResponsabilidad\":{\"DirectorNombre\":\"\",\"DirectorCargo\":\"Director del Proyecto\",\"CoordinadorNombre\":\"\",\"CoordinadorCargo\":\"Coordinador de Carrera\"},\"Uuid\":\"7921b3de-9682-4595-81ff-b974bcb0149c\",\"EntityUuid\":\"c4515615-d3a5-44e0-998a-14111b2c8ebf\",\"entityUuid\":\"c4515615-d3a5-44e0-998a-14111b2c8ebf\"}";
        var jsonElement = System.Text.Json.JsonSerializer.Deserialize<System.Text.Json.JsonElement>(json);
        
        var result1 = await controller.UpdateMetadata("7921b3de-9682-4595-81ff-b974bcb0149c", jsonElement, orchestrator, CancellationToken.None);
        var badRequest1 = result1 as BadRequestObjectResult;
        if (badRequest1 != null)
        {
            Console.WriteLine($"FIRST CONTROLLER CALL FAILED: {System.Text.Json.JsonSerializer.Serialize(badRequest1.Value)}");
        }
        else
        {
            Console.WriteLine("FIRST CONTROLLER CALL SUCCEEDED");
        }
        Assert.Null(badRequest1);
        
        var result2 = await controller.UpdateMetadata("7921b3de-9682-4595-81ff-b974bcb0149c", jsonElement, orchestrator, CancellationToken.None);
        var badRequest2 = result2 as BadRequestObjectResult;
        if (badRequest2 != null)
        {
            Console.WriteLine($"SECOND CONTROLLER CALL FAILED: {System.Text.Json.JsonSerializer.Serialize(badRequest2.Value)}");
        }
        else
        {
            Console.WriteLine("SECOND CONTROLLER CALL SUCCEEDED");
        }
        Assert.Null(badRequest2);

        await CleanProjectAsync(context, "c4515615-d3a5-44e0-998a-14111b2c8ebf");
    }

    [Fact]
    public async Task TestDiagnoseDuplication()
    {
        if (_skipTests) return;
        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        var project = await context.DocProyectos.FirstOrDefaultAsync(p => p.Uuid.StartsWith("0b0601fb"));
        if (project != null)
        {
            Console.WriteLine("DIAG PROJECT:");
            Console.WriteLine($"Uuid: {project.Uuid}");
            Console.WriteLine($"Titulo: {project.Titulo}");
            Console.WriteLine($"Metadata: {project.MetadataCacesJson}");

            var objectives = await context.DocObjetivosProyecto.Where(o => o.IdProyecto == project.IdProyecto).ToListAsync();
            Console.WriteLine($"Found {objectives.Count} DocObjetivosProyecto records for project Id {project.IdProyecto}:");
            foreach (var obj in objectives)
            {
                Console.WriteLine($"- Objective: Id={obj.IdObjetivo}, EsGeneral={obj.EsGeneral}, Orden={obj.Orden}, Descripcion='{obj.Descripcion}'");
            }

            var instances = await context.DocumentInstances.Where(i => i.EntityUuid == project.Uuid).ToListAsync();
            Console.WriteLine($"Found {instances.Count} DocumentInstances for project Uuid {project.Uuid}:");
            foreach (var instance in instances)
            {
                Console.WriteLine($"- Instance Uuid: {instance.Uuid}, State: {instance.State}");
                
                var coworkDocs = await context.DocCoworkDocumentos.Where(d => d.Uuid.StartsWith(instance.Uuid)).ToListAsync();
                Console.WriteLine($"  Found {coworkDocs.Count} CoWork docs starting with instance Uuid {instance.Uuid}:");
                foreach (var coworkDoc in coworkDocs)
                {
                    Console.WriteLine($"  * CoWork Doc Uuid: {coworkDoc.Uuid}");
                    Console.WriteLine($"    ContentHtml: {coworkDoc.ContentHtml}");
                    Console.WriteLine($"    ContentJson: {coworkDoc.ContentJson}");
                }
            }
        }
    }

    [Fact]
    public void TestHandlebarsStringEach()
    {
        var handlebars = HandlebarsDotNet.Handlebars.Create();
        var template = "{{#each objetivos_especificos}}<li>{{this}}</li>{{/each}}";
        var compiled = handlebars.Compile(template);

        var data = new Dictionary<string, object>
        {
            { "objetivos_especificos", "<p>Prueba</p>" }
        };

        var result = compiled(data);
        Console.WriteLine($"RENDER RESULT FOR STRING: '{result}'");
    }

    [Fact]
    public void TestCleanAndNormalizeJson()
    {
        var dirtyJson = "{\"Titulo\":\"PRUEBA1\",\"titulo\":\"\",\"IdCarrera\":13,\"idCarrera\":0,\"Investigadores\":[{\"Nombre\":\"Erika\",\"nombre\":\"\"}]}";
        var cleanedJson = Dosier.Infrastructure.Common.Documents.Engine.HandlebarsTemplateEngine.CleanAndNormalizeJson(dirtyJson);
        
        Assert.Contains("\"Titulo\":\"PRUEBA1\"", cleanedJson);
        Assert.DoesNotContain("\"titulo\"", cleanedJson);
        
        Assert.Contains("\"IdCarrera\":13", cleanedJson);
        Assert.DoesNotContain("\"idCarrera\"", cleanedJson);
        
        Assert.Contains("\"Nombre\":\"Erika\"", cleanedJson);
        Assert.DoesNotContain("\"nombre\"", cleanedJson);
    }


    private async Task CleanProjectAsync(DosierContext context, string projectUuid)
    {
        var project = await context.DocProyectos.FirstOrDefaultAsync(p => p.Uuid == projectUuid);
        if (project != null)
        {
            var cronograma = context.Set<DocCronograma>().Where(c => c.IdProyecto == project.IdProyecto);
            context.Set<DocCronograma>().RemoveRange(cronograma);

            var carreras = context.Set<DocProyectoCarrera>().Where(c => c.IdProyecto == project.IdProyecto);
            context.Set<DocProyectoCarrera>().RemoveRange(carreras);

            var participantes = context.Set<DocProyectoParticipante>().Where(p => p.IdProyecto == project.IdProyecto);
            context.Set<DocProyectoParticipante>().RemoveRange(participantes);

            var objetivos = context.Set<DocObjetivoProyecto>().Where(o => o.IdProyecto == project.IdProyecto);
            context.Set<DocObjetivoProyecto>().RemoveRange(objetivos);

            var mml = context.Set<DocProyectoMml>().Where(m => m.IdProyecto == project.IdProyecto);
            context.Set<DocProyectoMml>().RemoveRange(mml);

            var impactos = context.Set<DocImpactoProyecto>().Where(i => i.IdProyecto == project.IdProyecto);
            context.Set<DocImpactoProyecto>().RemoveRange(impactos);

            var bibliografia = context.Set<DocBibliografiaProyecto>().Where(b => b.IdProyecto == project.IdProyecto);
            context.Set<DocBibliografiaProyecto>().RemoveRange(bibliografia);

            context.DocProyectos.Remove(project);
            await context.SaveChangesAsync();
        }

        var documentInstance = await context.DocumentInstances.FirstOrDefaultAsync(d => d.EntityUuid == projectUuid);
        if (documentInstance != null)
        {
            context.DocumentInstances.Remove(documentInstance);
            await context.SaveChangesAsync();
        }
    }

    [Fact]
    public async Task TestTemplateFileLoader_LoadCssAsync()
    {
        // Arrange
        var mockEnv = new Mock<Microsoft.Extensions.Hosting.IHostEnvironment>();
        mockEnv.Setup(e => e.EnvironmentName).Returns("Development");
        
        var loader = new Dosier.Infrastructure.Common.Documents.Engine.TemplateFileLoader(mockEnv.Object);
        
        // Act
        var result = await loader.LoadCssAsync("TEMPLATE_INEXISTENTE_TEST");
        
        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task TestDocumentEngine_TemplateCssSync()
    {
        if (_skipTests) return;

        var optionsBuilder = new DbContextOptionsBuilder<DosierContext>();
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 31));
        optionsBuilder.UseMySql(GetConnectionString(), serverVersion);
        
        using var context = new DosierContext(optionsBuilder.Options);
        
        var mockTemplateRepo = new Mock<IDocumentTemplateRepository>();
        var mockAuditRepo = new Mock<IDocumentAuditRepository>();
        var mockLogger = new Mock<ILogger<DocumentEngine>>();
        var mockConfig = new Mock<IConfiguration>();
        var mockEnv = new Mock<Microsoft.Extensions.Hosting.IHostEnvironment>();
        mockEnv.Setup(e => e.EnvironmentName).Returns("Development");

        var testTemplate = Dosier.Domain.Common.Documents.DocumentTemplate.Create(
            "PROTOCOLO_INVESTIGACION",
            "Proyecto de Investigación Test",
            "<html><body>{{titulo}}</body></html>",
            Dosier.Domain.Common.Documents.DocumentCategory.Protocolo,
            requiresLopdp: false
        );
        testTemplate.UpdateCustomCssOnly(".cover-page { margin: 0; }");

        mockTemplateRepo.Setup(r => r.FindByCodeAsync("PROTOCOLO_INVESTIGACION", It.IsAny<CancellationToken>()))
            .ReturnsAsync(testTemplate);

        var mockAppUrlService = new Mock<dosier_application.Common.IAppUrlService>();
        var engine = new DocumentEngine(
            mockTemplateRepo.Object,
            mockAuditRepo.Object,
            mockLogger.Object,
            mockConfig.Object,
            mockEnv.Object,
            context,
            mockAppUrlService.Object
        );

        var request = new DocumentRequest
        {
            TemplateCode = "PROTOCOLO_INVESTIGACION",
            Data = new { titulo = "Proyecto Desacoplado Test" },
            IsDraftMode = true,
            IsBlindMode = false,
            RequestedBy = "Test Suite"
        };

        // Act
        var result = await engine.GenerateAsync(request);

        // Assert
        Assert.NotNull(result);
        Assert.NotNull(result.PdfBytes);
        Assert.NotNull(testTemplate.CustomCss);
        Assert.Contains(".cover-page", testTemplate.CustomCss);
    }
}


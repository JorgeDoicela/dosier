using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;
using dosier_application.Common;
using dosier_application.Common.Notifications;
using dosier_domain.Curriculum.Entities;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.Common.Notifications;
using dosier_infrastructure.data.models;
using dosier_infrastructure.Security;
using Dosier.Application.Common.Documents;

namespace dosier_tests.Notifications
{
    public class EmailEngineTests
    {
        private static DosierContext CreateInMemoryContext()
        {
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseInMemoryDatabase($"DosierEmailTests_{Guid.NewGuid()}")
                .Options;
            return new DosierContext(options);
        }

        private static IConfiguration CreateConfiguration()
        {
            return new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Email:FromEmail"] = "dosier@istpet.edu.ec",
                    ["Email:FromName"] = "DOSIER Gestión Curricular"
                })
                .Build();
        }

        [Fact]
        public void ResolveActionUrl_DebePriorizarTokensCurricularesDePea()
        {
            var replacements = new Dictionary<string, string>
            {
                ["[[pea_workspace_url]]"] = "https://dosier.istpet.edu.ec/documentacion/workspace/PEA_OFICIAL/abc-123"
            };

            var url = EmailMasterLayoutRenderer.ResolveActionUrl(
                replacements,
                "<p>Revisar documento</p>",
                "https://dosier.istpet.edu.ec");

            Assert.Equal("https://dosier.istpet.edu.ec/documentacion/workspace/PEA_OFICIAL/abc-123", url);
        }

        [Fact]
        public async Task SendTemplatedEmailAsync_ConContextoPea_DebeInyectarTokensCurricularesYEncolarOutbox()
        {
            using var context = CreateInMemoryContext();

            context.Asignaturas.Add(new Asignatura
            {
                IdAsignatura = 101,
                Asignatura1 = "Programación Orientada a Objetos",
                Codigo = "TDS-301"
            });
            context.Carreras.Add(new Carrera
            {
                IdCarrera = 10,
                Carrera1 = "Tecnología en Desarrollo de Software",
                EsInstituto = 1
            });
            context.Periodos.Add(new Periodo
            {
                IdPeriodo = "ABR2026",
                Detalle = "ABRIL - SEPTIEMBRE 2026",
                Activo = true
            });
            context.DocPeas.Add(new DocPea
            {
                IdPea = 1,
                Uuid = "pea-uuid-001",
                IdAsignatura = 101,
                IdCarrera = 10,
                IdPeriodo = "ABR2026",
                Modalidad = "Presencial",
                SemestreNivel = "Tercer Nivel",
                TotalHorasAsignatura = 144,
                Creditos = 3,
                Estado = "EnRevision",
                Activo = true
            });
            context.DocEmailTemplates.Add(new DocEmailTemplate
            {
                Uuid = Guid.NewGuid().ToString(),
                Codigo = "PEA_SOLICITUD_AVAL",
                Nombre = "Solicitud de Aval",
                Asunto = "Revisión PEA [[pea_asignatura]] ([[pea_codigo]])",
                CuerpoHtml = "<p>Carrera: [[pea_carrera]] | Período: [[pea_periodo]] | Horas: [[pea_horas_totales]]</p>",
                Activo = true
            });
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            appUrlMock.Setup(a => a.BuildFrontendUrl(It.IsAny<string>()))
                .Returns<string>(path => $"https://dosier.istpet.edu.ec{path}");

            var config = CreateConfiguration();
            var renderer = new EmailMasterLayoutRenderer(
                config,
                Mock.Of<ILogger<EmailMasterLayoutRenderer>>(),
                appUrlMock.Object);

            var templateService = new EmailTemplateService(context);
            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                renderer,
                templateService,
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var result = await sender.SendTemplatedEmailAsync(new EmailSendRequest
            {
                TemplateCodigo = "PEA_SOLICITUD_AVAL",
                DestinatariosEmails = new List<string> { "coordinador@istpet.edu.ec" },
                EntityType = "PEA",
                EntityUuid = "pea-uuid-001"
            });

            Assert.True(result);
            var historial = await context.DocEmailHistorials.SingleAsync();
            Assert.Equal("coordinador@istpet.edu.ec", historial.Destinatario);
            Assert.Equal("Pendiente", historial.Estado);
            Assert.Equal("Revisión PEA Programación Orientada a Objetos (TDS-301)", historial.Asunto);
            Assert.Contains("Tecnología en Desarrollo de Software", historial.Cuerpo);
            Assert.Contains("ABRIL - SEPTIEMBRE 2026", historial.Cuerpo);
            Assert.Contains("144", historial.Cuerpo);
        }

        [Fact]
        public async Task SendTemplatedEmailAsync_ConContextoPeriodo_DebeInyectarTokensDePeriodo()
        {
            using var context = CreateInMemoryContext();

            context.Periodos.Add(new Periodo
            {
                IdPeriodo = "OCT2026",
                Detalle = "OCTUBRE 2026 - MARZO 2027",
                FechaInicial = new DateOnly(2026, 10, 12),
                FechaFinal = new DateOnly(2027, 3, 19),
                Activo = true,
                Cerrado = false
            });
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            appUrlMock.Setup(a => a.BuildFrontendUrl(It.IsAny<string>()))
                .Returns<string>(path => $"https://dosier.istpet.edu.ec{path}");

            var config = CreateConfiguration();
            var renderer = new EmailMasterLayoutRenderer(
                config,
                Mock.Of<ILogger<EmailMasterLayoutRenderer>>(),
                appUrlMock.Object);

            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                renderer,
                new EmailTemplateService(context),
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var result = await sender.SendTemplatedEmailAsync(new EmailSendRequest
            {
                DestinatariosEmails = new List<string> { "docente@istpet.edu.ec" },
                CustomSubject = "Apertura [[periodo_nombre]] ([[periodo_codigo]])",
                CustomBody = "<p>Estado: [[periodo_estado]]</p>",
                EntityType = "Periodo",
                EntityUuid = "OCT2026"
            });

            Assert.True(result);
            var historial = await context.DocEmailHistorials.SingleAsync();
            Assert.Equal("Apertura OCTUBRE 2026 - MARZO 2027 (OCT2026)", historial.Asunto);
            Assert.Contains("Activo", historial.Cuerpo);
        }

        [Fact]
        public async Task GetScopeAsync_ParaCoordinadorCarrera_DebeRestringirASusCarrerasYSoloDocentes()
        {
            using var context = CreateInMemoryContext();

            context.Carreras.AddRange(
                new Carrera { IdCarrera = 10, Carrera1 = "Desarrollo de Software", EsInstituto = 1 },
                new Carrera { IdCarrera = 20, Carrera1 = "Gastronomía", EsInstituto = 1 }
            );
            context.Users.Add(new User
            {
                IdUsuario = 50,
                IdSigafi = "1710000001",
                TablaSigafi = "profesor",
                Nombre = "Coord Software",
                EmailInstitucional = "coord.software@istpet.edu.ec",
                Activo = true,
                Administrador = false,
                Contrasenia = "hash"
            });
            context.DocAutoridadesCurriculares.Add(new DocAutoridadCurricular
            {
                IdSigafi = "1710000001",
                CargoCurricular = "COORD_CARRERA",
                IdCarrera = 10,
                EsActivo = true
            });
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            var config = CreateConfiguration();
            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                new EmailMasterLayoutRenderer(config, Mock.Of<ILogger<EmailMasterLayoutRenderer>>(), appUrlMock.Object),
                new EmailTemplateService(context),
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var scope = await sender.GetScopeAsync(new EmailActorContext
            {
                UserId = 50,
                Identifier = "1710000001",
                Roles = new List<string> { "DOSIER_COORD_CARRERA" }
            });

            Assert.False(scope.IsGlobalScope);
            Assert.False(scope.CanManageTemplates);
            Assert.False(scope.CanDeleteTemplates);
            Assert.False(scope.CanViewAllHistory);
            Assert.Equal(new[] { "DOSIER_DOCENTE" }, scope.AllowedBroadcastRoles);
            Assert.Equal(new[] { 10 }, scope.AllowedCarreraIds);
        }

        [Fact]
        public async Task SendTemplatedEmailAsync_CoordinadorCarrera_DebeBloquearRolSuperiorOCarreraAjenaOPeaAjeno()
        {
            using var context = CreateInMemoryContext();

            context.Carreras.AddRange(
                new Carrera { IdCarrera = 10, Carrera1 = "Desarrollo de Software", EsInstituto = 1 },
                new Carrera { IdCarrera = 20, Carrera1 = "Gastronomía", EsInstituto = 1 }
            );
            context.Users.Add(new User
            {
                IdUsuario = 50,
                IdSigafi = "1710000001",
                TablaSigafi = "profesor",
                Nombre = "Coord Software",
                EmailInstitucional = "coord.software@istpet.edu.ec",
                Activo = true,
                Administrador = false,
                Contrasenia = "hash"
            });
            context.DocAutoridadesCurriculares.Add(new DocAutoridadCurricular
            {
                IdSigafi = "1710000001",
                CargoCurricular = "COORD_CARRERA",
                IdCarrera = 10,
                EsActivo = true
            });
            context.DocPeas.Add(new DocPea
            {
                IdPea = 2,
                Uuid = "pea-otra-carrera",
                IdAsignatura = 202,
                IdCarrera = 20,
                IdPeriodo = "ABR2026",
                Estado = "Borrador",
                Activo = true
            });
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            var config = CreateConfiguration();
            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                new EmailMasterLayoutRenderer(config, Mock.Of<ILogger<EmailMasterLayoutRenderer>>(), appUrlMock.Object),
                new EmailTemplateService(context),
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var actor = new EmailActorContext
            {
                UserId = 50,
                Identifier = "1710000001",
                Roles = new List<string> { "DOSIER_COORD_CARRERA" }
            };

            // 1. Bloquear difusión a rol superior
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                sender.SendTemplatedEmailAsync(new EmailSendRequest
                {
                    TargetRole = "DOSIER_VICERRECTOR",
                    TargetCarreraId = 10,
                    CustomSubject = "Test",
                    CustomBody = "<p>Test</p>"
                }, actor));

            // 2. Bloquear difusión a carrera ajena
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                sender.SendTemplatedEmailAsync(new EmailSendRequest
                {
                    TargetRole = "DOSIER_DOCENTE",
                    TargetCarreraId = 20,
                    CustomSubject = "Test",
                    CustomBody = "<p>Test</p>"
                }, actor));

            // 3. Bloquear vinculación de PEA de otra carrera
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                sender.SendTemplatedEmailAsync(new EmailSendRequest
                {
                    TargetRole = "DOSIER_DOCENTE",
                    TargetCarreraId = 10,
                    EntityType = "PEA",
                    EntityUuid = "pea-otra-carrera",
                    CustomSubject = "Test",
                    CustomBody = "<p>Test</p>"
                }, actor));
        }

        [Fact]
        public async Task GetEmailHistoryAsync_ParaCoordinadorCarrera_SoloRetornaSusPropiosEnvios()
        {
            using var context = CreateInMemoryContext();

            context.DocEmailHistorials.AddRange(
                new DocEmailHistorial
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Destinatario = "doc1@istpet.edu.ec",
                    Asunto = "Correo del coord 5",
                    Cuerpo = "<p>A</p>",
                    Estado = "Enviado",
                    FechaEnvio = DateTime.UtcNow,
                    MetadataJson = "{\"senderUserId\":5,\"senderRole\":\"DOSIER_COORD_CARRERA\"}"
                },
                new DocEmailHistorial
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Destinatario = "doc2@istpet.edu.ec",
                    Asunto = "Correo del coord 50",
                    Cuerpo = "<p>B</p>",
                    Estado = "Enviado",
                    FechaEnvio = DateTime.UtcNow,
                    MetadataJson = "{\"senderUserId\":50,\"senderRole\":\"DOSIER_COORD_CARRERA\"}"
                },
                new DocEmailHistorial
                {
                    Uuid = Guid.NewGuid().ToString(),
                    Destinatario = "admin@istpet.edu.ec",
                    Asunto = "Recuperación de contraseña",
                    Cuerpo = "<p>C</p>",
                    Estado = "Enviado",
                    FechaEnvio = DateTime.UtcNow,
                    MetadataJson = "{}"
                }
            );
            await context.SaveChangesAsync();

            var templateService = new EmailTemplateService(context);
            var listCoord5 = await templateService.GetEmailHistoryAsync(50, filterBySenderUserId: 5);

            var single = Assert.Single(listCoord5);
            Assert.Equal("Correo del coord 5", single.Asunto);
        }

        [Fact]
        public async Task PreviewAudienceAsync_PorModalidadPresencial_SoloIncluyeCarrerasPresenciales()
        {
            using var context = CreateInMemoryContext();

            context.Modalidades.AddRange(
                new Modalidad { IdModalidad = 1, Modalidad1 = "PRESENCIAL", ModalidadImpresion = "Presencial" },
                new Modalidad { IdModalidad = 2, Modalidad1 = "EN LINEA", ModalidadImpresion = "En Línea" }
            );
            context.Carreras.AddRange(
                new Carrera { IdCarrera = 10, Carrera1 = "Desarrollo de Software", EsInstituto = 1 },
                new Carrera { IdCarrera = 20, Carrera1 = "Administración en Línea", EsInstituto = 1 }
            );
            context.ModalidadesCarreras.AddRange(
                new ModalidadCarrera { IdModalidadCarrera = 1, IdCarrera = 10, IdModalidad = 1, EsActivo = 1 },
                new ModalidadCarrera { IdModalidadCarrera = 2, IdCarrera = 20, IdModalidad = 2, EsActivo = 1 }
            );
            context.Users.AddRange(
                new User
                {
                    IdUsuario = 101,
                    IdSigafi = "DOC-PRES-1",
                    TablaSigafi = "profesor",
                    Nombre = "Docente Presencial",
                    EmailInstitucional = "presencial@istpet.edu.ec",
                    Activo = true,
                    Contrasenia = "hash"
                },
                new User
                {
                    IdUsuario = 102,
                    IdSigafi = "DOC-LIN-1",
                    TablaSigafi = "profesor",
                    Nombre = "Docente En Línea",
                    EmailInstitucional = "linea@istpet.edu.ec",
                    Activo = true,
                    Contrasenia = "hash"
                }
            );
            context.ProfesoresCarrerasPeriodos.AddRange(
                new ProfesoresCarrerasPeriodo { IdProfesor = "DOC-PRES-1", IdCarrera = 10, IdPeriodo = "ABR2026", EsActivo = 1 },
                new ProfesoresCarrerasPeriodo { IdProfesor = "DOC-LIN-1", IdCarrera = 20, IdPeriodo = "ABR2026", EsActivo = 1 }
            );
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            var config = CreateConfiguration();
            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                new EmailMasterLayoutRenderer(config, Mock.Of<ILogger<EmailMasterLayoutRenderer>>(), appUrlMock.Object),
                new EmailTemplateService(context),
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var adminActor = new EmailActorContext
            {
                UserId = 1,
                Roles = new List<string> { "DOSIER_ADMIN" }
            };

            var scope = await sender.GetScopeAsync(adminActor);
            Assert.Equal(2, scope.AvailableModalidades.Count);

            var preview = await sender.PreviewAudienceAsync(new EmailAudiencePreviewRequest
            {
                TargetModalidadIds = new List<int> { 1 }
            }, adminActor);

            Assert.Equal(1, preview.TotalRecipients);
            Assert.Single(preview.Sample);
            Assert.Equal("presencial@istpet.edu.ec", preview.Sample[0].Email);
        }

        [Fact]
        public async Task PreviewAudienceAsync_PorEstadoPeaObservado_SoloIncluyeDocentesConPeaObservado()
        {
            using var context = CreateInMemoryContext();

            context.Carreras.Add(new Carrera { IdCarrera = 10, Carrera1 = "Desarrollo de Software", EsInstituto = 1 });
            context.Users.AddRange(
                new User
                {
                    IdUsuario = 201,
                    IdSigafi = "DOC-OBS",
                    TablaSigafi = "profesor",
                    Nombre = "Docente Observado",
                    EmailInstitucional = "observado@istpet.edu.ec",
                    Activo = true,
                    Contrasenia = "hash"
                },
                new User
                {
                    IdUsuario = 202,
                    IdSigafi = "DOC-APR",
                    TablaSigafi = "profesor",
                    Nombre = "Docente Aprobado",
                    EmailInstitucional = "aprobado@istpet.edu.ec",
                    Activo = true,
                    Contrasenia = "hash"
                }
            );
            context.DocPeas.AddRange(
                new DocPea
                {
                    IdPea = 11,
                    Uuid = "pea-obs-1",
                    IdAsignatura = 1,
                    IdCarrera = 10,
                    IdPeriodo = "ABR2026",
                    IdDocenteElaborador = "DOC-OBS",
                    Estado = "Observado",
                    Activo = true
                },
                new DocPea
                {
                    IdPea = 12,
                    Uuid = "pea-apr-1",
                    IdAsignatura = 2,
                    IdCarrera = 10,
                    IdPeriodo = "ABR2026",
                    IdDocenteElaborador = "DOC-APR",
                    Estado = "Aprobado",
                    Activo = true
                }
            );
            await context.SaveChangesAsync();

            var appUrlMock = new Mock<IAppUrlService>();
            appUrlMock.Setup(a => a.GetFrontendUrl()).Returns("https://dosier.istpet.edu.ec");
            var config = CreateConfiguration();
            var sender = new EmailSenderSubservice(
                context,
                config,
                Mock.Of<ILogger<EmailSenderSubservice>>(),
                Mock.Of<IDocumentEngine>(),
                Mock.Of<IFirmaElectronicaService>(),
                new EmailMasterLayoutRenderer(config, Mock.Of<ILogger<EmailMasterLayoutRenderer>>(), appUrlMock.Object),
                new EmailTemplateService(context),
                appUrlMock.Object,
                Mock.Of<IServiceProvider>());

            var preview = await sender.PreviewAudienceAsync(new EmailAudiencePreviewRequest
            {
                TargetPeaEstado = "Observado",
                TargetPeriodoId = "ABR2026"
            }, new EmailActorContext { UserId = 1, Roles = new List<string> { "DOSIER_ADMIN" } });

            Assert.Equal(1, preview.TotalRecipients);
            Assert.Equal("observado@istpet.edu.ec", preview.Sample[0].Email);
        }
    }
}

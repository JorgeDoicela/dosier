using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;
using dosier_domain.Curriculum.Entities;
using dosier_application.Curriculum.Dtos;
using dosier_infrastructure.Curriculum;
using dosier_infrastructure.Signatures;
using dosier_infrastructure.Signatures.Subservices;
using dosier_infrastructure.Security;
using dosier_application.Common;
using dosier_application.Academico;
using dosier_application.Curriculum.Interfaces;

namespace dosier_tests.Curriculum
{
    public class PeaFirmaTests
    {
        private static DosierContext CreateInMemoryContext(string dbName)
        {
            var options = new DbContextOptionsBuilder<DosierContext>()
                .UseInMemoryDatabase(databaseName: dbName)
                .Options;
            return new DosierContext(options);
        }

        private static IConfiguration CreateMockConfiguration()
        {
            var myConfiguration = new Dictionary<string, string?>
            {
                {"DosierFirma:SigningSecret", "ClaveSecretaInstitucionalDOSIER2026SuperSegura!"},
                {"Firma:SkipCertificateValidation", "false"},
                {"App:FrontendUrl", "https://dosier.istpet.edu.ec"}
            };

            return new ConfigurationBuilder()
                .AddInMemoryCollection(myConfiguration)
                .Build();
        }

        private static PeaService CreatePeaService(DosierContext context, IConfiguration config)
        {
            var mockResolver = new Mock<IAcademicContextResolver>();
            var mockExpedienteService = new Mock<IExpedienteCurricularService>();
            var mockFirmaElectronicaService = new Mock<IFirmaElectronicaService>();
            
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
        [Trait("Category", "Unit")]
        [Trait("Feature", "FirmaCurricular")]
        public async Task PeaFirma_DocenteFirmaExitosamente_PasaAEnRevisionYGeneraFirmaCode()
        {
            var dbName = nameof(PeaFirma_DocenteFirmaExitosamente_PasaAEnRevisionYGeneraFirmaCode);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            // 1. Arrange: Usuario docente
            string rawPassword = "DocentePassword2026!";
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(rawPassword, 11);
            var docente = new User
            {
                IdUsuario = 101,
                Nombre = "Ing. Juan Pérez",
                IdSigafi = "1712345678",
                Contrasenia = hashedPassword,
                Activo = true
            };
            context.Users.Add(docente);

            // 2. Arrange: PEA en Borrador
            var pea = new DocPea
            {
                IdPea = 1,
                Uuid = Guid.NewGuid().ToString(),
                IdCarrera = 5,
                IdAsignatura = 12,
                IdPeriodo = "2026-1",
                TotalHorasAsignatura = 160,
                Creditos = 3.5m,
                HorasContactoDocente = 64,
                HorasPracticoExperimental = 32,
                HorasAutonomo = 64,
                ObjetivoAsignatura = "Desarrollar competencias de programación orientada a objetos.",
                MetodologiaEnsenanza = "Aprendizaje Basado en Proyectos y Talleres Prácticos.",
                EvaluacionAprendizaje = "Evaluación continua y proyecto integrador.",
                Estado = "Borrador",
                Version = 1,
                Activo = true
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            // 3. Act: Firma del docente
            var dto = new FirmarPeaDto
            {
                Password = rawPassword,
                RolFirmante = "Docente",
                TipoFirma = "DOSIER",
                Motivo = "Envío oficial a revisión curricular de carrera"
            };

            var resultado = await service.FirmarPeaAsync(pea.IdPea, docente.IdUsuario, dto, "192.168.1.50", "Mozilla/5.0 TestAgent");

            // 4. Assert
            Assert.True(resultado.Exito);
            Assert.Equal("EnRevision", resultado.EstadoNuevo);
            Assert.StartsWith("DFRM-", resultado.FirmaCode);
            Assert.Equal(64, resultado.DocHash.Length); // SHA-256 hex string
            Assert.Contains(resultado.FirmaCode, resultado.VerificationUrl);

            // Verificar persistencia en base de datos
            var peaActualizado = await context.DocPeas.FindAsync(1);
            Assert.NotNull(peaActualizado);
            Assert.Equal("EnRevision", peaActualizado!.Estado);
            Assert.Equal(resultado.FirmaCode, peaActualizado.FirmaElaboradoDocente);
            Assert.NotNull(peaActualizado.FechaElaborado);

            // Verificar registro transversal en doc_documentos_firmas
            var firmaRegistro = await context.DocDocumentoFirmas.FirstOrDefaultAsync(f => f.FirmaCode == resultado.FirmaCode);
            Assert.NotNull(firmaRegistro);
            Assert.Equal("USR-101", firmaRegistro!.FirmanteId);
            Assert.Equal("Docente", firmaRegistro.FirmanteRol);
            Assert.Equal("DOSIER", firmaRegistro.TipoFirma);
            Assert.True(firmaRegistro.EsValida);
            Assert.Equal(resultado.DocHash, firmaRegistro.DocHash);

            // Verificar trazabilidad forense
            var traza = await context.DocPeaTrazabilidades.FirstOrDefaultAsync(t => t.IdPea == 1 && t.EstadoNuevo == "EnRevision");
            Assert.NotNull(traza);
            Assert.Equal(resultado.DocHash, traza!.HashIntegridadSha256);
            Assert.Equal("Borrador", traza.EstadoAnterior);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "FirmaCurricular")]
        public async Task PeaFirma_PasswordIncorrecto_LanzaUnauthorizedAccessException()
        {
            var dbName = nameof(PeaFirma_PasswordIncorrecto_LanzaUnauthorizedAccessException);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var docente = new User
            {
                IdUsuario = 102,
                Nombre = "Dra. María López",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("ContraseniaVerdadera123!", 11),
                Activo = true
            };
            context.Users.Add(docente);

            var pea = new DocPea
            {
                IdPea = 2,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Borrador",
                Activo = true
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            var dto = new FirmarPeaDto
            {
                Password = "PasswordEquivocado!",
                RolFirmante = "Docente",
                TipoFirma = "DOSIER"
            };

            // Act & Assert
            await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
                service.FirmarPeaAsync(pea.IdPea, docente.IdUsuario, dto, "127.0.0.1", "TestAgent")
            );

            // Verificar que el estado no cambió
            var peaNoModificado = await context.DocPeas.FindAsync(2);
            Assert.Equal("Borrador", peaNoModificado!.Estado);
            Assert.Null(peaNoModificado.FirmaElaboradoDocente);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "FirmaCurricular")]
        public async Task PeaFirma_CoordinadorYVicerrector_FlujoCompletoDeAprobacion()
        {
            var dbName = nameof(PeaFirma_CoordinadorYVicerrector_FlujoCompletoDeAprobacion);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var coord = new User
            {
                IdUsuario = 201,
                Nombre = "Coordinador Académico",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("Coord123!", 11),
                Activo = true
            };
            var vicerrector = new User
            {
                IdUsuario = 301,
                Nombre = "Vicerrector Académico",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("Vice123!", 11),
                Activo = true
            };
            context.Users.AddRange(coord, vicerrector);

            var pea = new DocPea
            {
                IdPea = 3,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "EnRevision", // Ya enviado por el docente
                FirmaElaboradoDocente = "DFRM-2026-DOC001",
                Activo = true
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            // 1. Coordinador revisa y firma
            var dtoCoord = new FirmarPeaDto
            {
                Password = "Coord123!",
                RolFirmante = "Coordinador",
                TipoFirma = "DOSIER"
            };
            var resCoord = await service.FirmarPeaAsync(pea.IdPea, coord.IdUsuario, dtoCoord, "127.0.0.1", "TestAgent");

            Assert.True(resCoord.Exito);
            Assert.Equal("RevisadoCoord", resCoord.EstadoNuevo);
            Assert.StartsWith("DFRM-", resCoord.FirmaCode);

            // 2. Vicerrector aprueba y firma
            var dtoVice = new FirmarPeaDto
            {
                Password = "Vice123!",
                RolFirmante = "Vicerrector",
                TipoFirma = "DOSIER"
            };
            var resVice = await service.FirmarPeaAsync(pea.IdPea, vicerrector.IdUsuario, dtoVice, "127.0.0.1", "TestAgent");

            Assert.True(resVice.Exito);
            Assert.Equal("Aprobado", resVice.EstadoNuevo);
            Assert.StartsWith("DFRM-", resVice.FirmaCode);

            // Verificar estado final
            var peaAprobado = await context.DocPeas.FindAsync(3);
            Assert.Equal("Aprobado", peaAprobado!.Estado);
            Assert.Equal(resCoord.FirmaCode, peaAprobado.FirmaRevisadoCoord);
            Assert.Equal(resVice.FirmaCode, peaAprobado.FirmaAprobadoVicerrector);
            Assert.NotNull(peaAprobado.FechaAprobado);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "FirmaCurricular")]
        public async Task PeaFirma_VerificacionPublica_ValidaFirmaCorrectamente()
        {
            var dbName = nameof(PeaFirma_VerificacionPublica_ValidaFirmaCorrectamente);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var user = new User
            {
                IdUsuario = 501,
                Nombre = "Dr. Carlos Revisor",
                IdSigafi = "0987654321",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("Pass501!", 11),
                Activo = true
            };
            context.Users.Add(user);

            var pea = new DocPea
            {
                IdPea = 4,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Borrador",
                Activo = true
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            // Firmar
            var res = await service.FirmarPeaAsync(4, 501, new FirmarPeaDto
            {
                Password = "Pass501!",
                RolFirmante = "Docente",
                TipoFirma = "DOSIER"
            }, "127.0.0.1", "TestAgent");

            // Verificar públicamente a través de SignatureVerificationSubservice
            var loggerMock = new Mock<ILogger<SignatureVerificationSubservice>>();
            var hashService = new SignatureHashService(config);
            var verifier = new SignatureVerificationSubservice(context, hashService, loggerMock.Object);

            var verification = await verifier.VerifyAsync(res.FirmaCode);

            Assert.True(verification.EsValida);
            Assert.Equal(res.FirmaCode, verification.FirmaCode);
            Assert.Equal(res.DocHash, verification.DocHash);
            Assert.Contains("Carlos Revisor", verification.FirmanteNombre);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "FirmaCurricular")]
        public async Task PeaFirma_CambioEnContenidoPedagogico_GeneraHashDiferente()
        {
            var dbName = nameof(PeaFirma_CambioEnContenidoPedagogico_GeneraHashDiferente);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var user = new User
            {
                IdUsuario = 601,
                IdSigafi = "1799999999",
                Nombre = "Profesor Prueba",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("Pass601!"),
                Activo = true
            };
            context.Users.Add(user);

            var pea1 = new DocPea
            {
                IdPea = 10,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Borrador",
                Activo = true,
                Unidades = new List<DocPeaUnidad>
                {
                    new DocPeaUnidad
                    {
                        IdUnidad = 1,
                        NombreUnidad = "Unidad 1 Original",
                        Orden = 1,
                        Temas = new List<DocPeaTema>
                        {
                            new DocPeaTema { IdTema = 1, TituloTema = "Tema A", Orden = 1 }
                        }
                    }
                }
            };
            context.DocPeas.Add(pea1);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            var res1 = await service.FirmarPeaAsync(10, 601, new FirmarPeaDto
            {
                Password = "Pass601!",
                RolFirmante = "Docente",
                TipoFirma = "DOSIER"
            }, "127.0.0.1", "TestAgent");

            // Crear un segundo PEA con exactamente el mismo número de unidades pero título modificado
            var pea2 = new DocPea
            {
                IdPea = 11,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Borrador",
                Activo = true,
                Unidades = new List<DocPeaUnidad>
                {
                    new DocPeaUnidad
                    {
                        IdUnidad = 2,
                        NombreUnidad = "Unidad 1 Modificada",
                        Orden = 1,
                        Temas = new List<DocPeaTema>
                        {
                            new DocPeaTema { IdTema = 2, TituloTema = "Tema A Modificado", Orden = 1 }
                        }
                    }
                }
            };
            context.DocPeas.Add(pea2);
            await context.SaveChangesAsync();

            var res2 = await service.FirmarPeaAsync(11, 601, new FirmarPeaDto
            {
                Password = "Pass601!",
                RolFirmante = "Docente",
                TipoFirma = "DOSIER"
            }, "127.0.0.1", "TestAgent");

            Assert.NotEqual(res1.DocHash, res2.DocHash);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "FormatoOficialISTPET")]
        public async Task Pea_PrerrequisitosYEvaluaciones_PersistenYFormanParteDelHash()
        {
            var dbName = nameof(Pea_PrerrequisitosYEvaluaciones_PersistenYFormanParteDelHash);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var user = new User
            {
                IdUsuario = 701,
                IdSigafi = "1788888888",
                Nombre = "Docente Titular",
                Contrasenia = BCrypt.Net.BCrypt.HashPassword("Pass701!"),
                Activo = true
            };
            context.Users.Add(user);

            var pea = new DocPea
            {
                IdPea = 20,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Borrador",
                Activo = true,
                Prerrequisitos = new List<DocPeaPrerequisito>
                {
                    new DocPeaPrerequisito
                    {
                        CodigoAsignatura = "PROG-101",
                        NombreAsignatura = "Fundamentos de Programación",
                        Observacion = "Aprobada con nota mínima 7.0",
                        Orden = 1
                    }
                },
                Evaluaciones = new List<DocPeaEvaluacion>
                {
                    new DocPeaEvaluacion
                    {
                        Denominacion = "Nota parcial 1",
                        TipoEvaluacion = "Actividades autónomas y práctico-experimentales",
                        CalificacionMaxima = 10.0m,
                        Orden = 1
                    }
                }
            };
            context.DocPeas.Add(pea);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            var res = await service.FirmarPeaAsync(20, 701, new FirmarPeaDto
            {
                Password = "Pass701!",
                RolFirmante = "Docente",
                TipoFirma = "DOSIER"
            }, "127.0.0.1", "TestAgent");

            Assert.True(res.Exito);
            Assert.NotEmpty(res.DocHash);

            var dto = await service.GetByIdAsync(20);
            Assert.NotNull(dto);
            Assert.Single(dto.Prerrequisitos);
            Assert.Equal("PROG-101", dto.Prerrequisitos[0].CodigoAsignatura);
            Assert.Single(dto.Evaluaciones);
            Assert.Equal("Nota parcial 1", dto.Evaluaciones[0].Denominacion);
        }

        [Fact]
        [Trait("Category", "Unit")]
        [Trait("Feature", "InmutabilidadCurricular")]
        public async Task Pea_ModificarPeaAprobado_LanzaInvalidOperationException()
        {
            var dbName = nameof(Pea_ModificarPeaAprobado_LanzaInvalidOperationException);
            await using var context = CreateInMemoryContext(dbName);
            var config = CreateMockConfiguration();

            var peaAprobado = new DocPea
            {
                IdPea = 30,
                Uuid = Guid.NewGuid().ToString(),
                Estado = "Aprobado",
                Activo = true,
                ObjetivoAsignatura = "Objetivo Original"
            };
            context.DocPeas.Add(peaAprobado);
            await context.SaveChangesAsync();

            var service = CreatePeaService(context, config);

            var dtoModificado = new PeaDto
            {
                IdPea = 30,
                ObjetivoAsignatura = "Intento de modificación no autorizada"
            };

            var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                service.GuardarPeaAsync(dtoModificado, "1712345678"));

            Assert.Contains("está legalmente cerrado", ex.Message);
        }
    }
}

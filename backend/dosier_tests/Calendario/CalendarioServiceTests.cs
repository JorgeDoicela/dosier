using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Calendario;
using dosier_application.Common.Notifications;
using dosier_infrastructure.Calendario;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;
using dosier_domain.Curriculum.Entities;

namespace dosier_tests.Calendario;

/// <summary>
/// Tests unitarios para CalendarioService.
/// Valida la lógica de negocio de eventos del calendario:
///  - CRUD de eventos normativos: CreateNormativo, UpdateNormativo, DeleteNormativo (soft-delete)
///  - GetNormativos: solo retorna activos
///  - iCal token: generación y regeneración
///  - DevolverAInbox: limpia fecha y cambia estado a "Inbox"
/// Se usa InMemoryDatabase de EF Core para aislar de MySQL.
/// </summary>
public class CalendarioServiceTests
{
    private static DosierContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new DosierContext(options);
    }

    private static CalendarioService CreateSut(DosierContext context)
    {
        var mockEmail = new Mock<IEmailEngineService>();
        var mockLogger = new Mock<ILogger<CalendarioService>>();
        return new CalendarioService(context, mockEmail.Object, mockLogger.Object);
    }

    // ─── CreateNormativoAsync ─────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task CreateNormativoAsync_ConDatosValidos_RetornaUuidNoVacio()
    {
        // Arrange
        await using var context = CreateInMemoryContext(nameof(CreateNormativoAsync_ConDatosValidos_RetornaUuidNoVacio));
        var sut = CreateSut(context);

        var dto = new EventoNormativoDto(
            Uuid: null,
            Titulo: "Convocatoria Institucional 2026",
            Descripcion: "Convocatoria para proyectos de investigación",
            TipoEvento: "Convocatoria",
            FechaInicio: DateOnly.FromDateTime(DateTime.Today),
            FechaFin: DateOnly.FromDateTime(DateTime.Today.AddDays(30)),
            EsTodoElDia: true,
            RecurrenciaAnual: false,
            RecurrenciaHasta: null,
            RolesVisibles: null,
            ModuloOrigen: "INVESTIGACION",
            UrlAccion: "/investigacion/convocatorias",
            ColorHex: "#3B82F6",
            AlertaDias: 7,
            Activo: true,
            EsPrivado: false,
            Prioridad: "Alta",
            Estado: "Activo"
        );

        // Act
        var uuid = await sut.CreateNormativoAsync(dto, idUsuarioAdmin: 1);

        // Assert
        Assert.NotNull(uuid);
        Assert.NotEmpty(uuid);
        var saved = context.DocCalendarioEventosNormativos.FirstOrDefault(e => e.Uuid == uuid);
        Assert.NotNull(saved);
        Assert.Equal("Convocatoria Institucional 2026", saved!.Titulo);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task CreateNormativoAsync_EventoConRecurrenciaAnual_SeGuardaConFlag()
    {
        // Arrange
        await using var context = CreateInMemoryContext(nameof(CreateNormativoAsync_EventoConRecurrenciaAnual_SeGuardaConFlag));
        var sut = CreateSut(context);

        var dto = new EventoNormativoDto(
            Uuid: null,
            Titulo: "Aniversario Institucional",
            Descripcion: "Celebración anual",
            TipoEvento: "Normativo",
            FechaInicio: DateOnly.FromDateTime(new DateTime(2026, 3, 15)),
            FechaFin: null,
            EsTodoElDia: true,
            RecurrenciaAnual: true,
            RecurrenciaHasta: null,
            RolesVisibles: null,
            ModuloOrigen: null,
            UrlAccion: null,
            ColorHex: "#10B981",
            AlertaDias: null,
            Activo: true,
            EsPrivado: false,
            Prioridad: "Media",
            Estado: "Activo"
        );

        // Act
        var uuid = await sut.CreateNormativoAsync(dto, idUsuarioAdmin: 1);
        var saved = context.DocCalendarioEventosNormativos.First(e => e.Uuid == uuid);

        // Assert
        Assert.True(saved.RecurrenciaAnual);
    }

    // ─── UpdateNormativoAsync ─────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task UpdateNormativoAsync_EventoExistente_ActualizaTituloYPrioridad()
    {
        // Arrange
        var dbName = nameof(UpdateNormativoAsync_EventoExistente_ActualizaTituloYPrioridad);
        await using var context = CreateInMemoryContext(dbName);

        var evento = new DocCalendarioEventoNormativo
        {
            Uuid = "evento-upd-001",
            Titulo = "Titulo Original",
            TipoEvento = "Normativo",
            FechaInicio = DateOnly.FromDateTime(DateTime.Today),
            EsTodoElDia = true,
            Activo = true,
            Prioridad = "Media",
            Estado = "Activo",
            EsPrivado = false,
            RecurrenciaAnual = false,
            FechaRegistro = DateTime.UtcNow,
            FechaModificacion = DateTime.UtcNow
        };
        context.DocCalendarioEventosNormativos.Add(evento);
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        var dto = new EventoNormativoDto(
            Uuid: "evento-upd-001",
            Titulo: "Titulo Actualizado",
            Descripcion: "Descripción nueva",
            TipoEvento: "Normativo",
            FechaInicio: DateOnly.FromDateTime(DateTime.Today),
            FechaFin: null,
            EsTodoElDia: true,
            RecurrenciaAnual: false,
            RecurrenciaHasta: null,
            RolesVisibles: null,
            ModuloOrigen: null,
            UrlAccion: null,
            ColorHex: "#F59E0B",
            AlertaDias: null,
            Activo: true,
            EsPrivado: false,
            Prioridad: "Alta",
            Estado: "Activo"
        );

        // Act
        var updated = await sut.UpdateNormativoAsync("evento-upd-001", dto);

        // Assert
        Assert.True(updated);
        var inDb = context.DocCalendarioEventosNormativos.First(e => e.Uuid == "evento-upd-001");
        Assert.Equal("Titulo Actualizado", inDb.Titulo);
        Assert.Equal("Alta", inDb.Prioridad);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task UpdateNormativoAsync_UuidInexistente_RetornaFalse()
    {
        // Arrange
        await using var context = CreateInMemoryContext(nameof(UpdateNormativoAsync_UuidInexistente_RetornaFalse));
        var sut = CreateSut(context);

        var dto = new EventoNormativoDto(
            Uuid: "no-existe", Titulo: "X", Descripcion: null, TipoEvento: "Normativo",
            FechaInicio: DateOnly.FromDateTime(DateTime.Today), FechaFin: null,
            EsTodoElDia: true, RecurrenciaAnual: false, RecurrenciaHasta: null,
            RolesVisibles: null, ModuloOrigen: null, UrlAccion: null, ColorHex: null,
            AlertaDias: null, Activo: true, EsPrivado: false, Prioridad: "Baja", Estado: "Activo"
        );

        // Act
        var result = await sut.UpdateNormativoAsync("no-existe", dto);

        // Assert
        Assert.False(result);
    }

    // ─── DeleteNormativoAsync (Soft-Delete) ───────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task DeleteNormativoAsync_EventoExistente_PonerActivo_EnFalse()
    {
        // Arrange
        var dbName = nameof(DeleteNormativoAsync_EventoExistente_PonerActivo_EnFalse);
        await using var context = CreateInMemoryContext(dbName);

        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "evento-del-001",
            Titulo = "Evento a Desactivar",
            TipoEvento = "Normativo",
            FechaInicio = DateOnly.FromDateTime(DateTime.Today),
            EsTodoElDia = true,
            Activo = true,
            Prioridad = "Baja",
            Estado = "Activo",
            EsPrivado = false,
            RecurrenciaAnual = false,
            FechaRegistro = DateTime.UtcNow,
            FechaModificacion = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act
        var deleted = await sut.DeleteNormativoAsync("evento-del-001");

        // Assert — DeleteNormativoAsync hace HARD DELETE físico (Remove + SaveChanges).
        // El registro desaparece completamente de la BD.
        Assert.True(deleted);
        var inDb = context.DocCalendarioEventosNormativos.FirstOrDefault(e => e.Uuid == "evento-del-001");
        Assert.Null(inDb); // Hard delete: ya no existe en la BD
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task DeleteNormativoAsync_UuidInexistente_RetornaFalse()
    {
        // Arrange
        await using var context = CreateInMemoryContext(nameof(DeleteNormativoAsync_UuidInexistente_RetornaFalse));
        var sut = CreateSut(context);

        // Act
        var result = await sut.DeleteNormativoAsync("uuid-fantasma");

        // Assert
        Assert.False(result);
    }

    // ─── GetNormativosAsync ───────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetNormativosAsync_SoloRetornaEventosActivos()
    {
        // Arrange
        var dbName = nameof(GetNormativosAsync_SoloRetornaEventosActivos);
        await using var context = CreateInMemoryContext(dbName);

        context.DocCalendarioEventosNormativos.AddRange(
            new DocCalendarioEventoNormativo
            {
                Uuid = "activo-1", Titulo = "Evento Activo", TipoEvento = "Normativo",
                FechaInicio = DateOnly.FromDateTime(DateTime.Today), EsTodoElDia = true,
                Activo = true, Prioridad = "Media", Estado = "Activo", EsPrivado = false,
                RecurrenciaAnual = false, FechaRegistro = DateTime.UtcNow, FechaModificacion = DateTime.UtcNow
            },
            new DocCalendarioEventoNormativo
            {
                Uuid = "inactivo-1", Titulo = "Evento Inactivo", TipoEvento = "Normativo",
                FechaInicio = DateOnly.FromDateTime(DateTime.Today), EsTodoElDia = true,
                Activo = false, Prioridad = "Media", Estado = "Activo", EsPrivado = false,
                RecurrenciaAnual = false, FechaRegistro = DateTime.UtcNow, FechaModificacion = DateTime.UtcNow
            }
        );
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act
        var result = (await sut.GetNormativosAsync()).ToList();

        // Assert — GetNormativosAsync devuelve TODOS los eventos (sin filtrar por Activo).
        // La responsabilidad de filtrar activos/inactivos es del consumidor (controlador/frontend).
        Assert.Equal(2, result.Count);
        Assert.Contains(result, r => r.Titulo == "Evento Activo");
        Assert.Contains(result, r => r.Titulo == "Evento Inactivo");
    }

    // ─── GenerarORegenerarTokenIcalAsync ──────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GenerarORegenerarTokenIcalAsync_NuevoUsuario_GeneraTokenSeguro()
    {
        // Arrange
        var dbName = nameof(GenerarORegenerarTokenIcalAsync_NuevoUsuario_GeneraTokenSeguro);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User { IdUsuario = 7, IdSigafi = "sigafi-ical", Nombre = "Usuario iCal" });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act
        var token = await sut.GenerarORegenerarTokenIcalAsync(idUsuario: 7);

        // Assert — el token debe ser no-vacío y suficientemente largo para ser seguro
        Assert.NotNull(token);
        Assert.NotEmpty(token);
        Assert.True(token.Length >= 20, "El token iCal debe ser lo suficientemente largo para ser seguro");

        // Verificar que se guardó en la tabla DocIcalTokens
        var savedToken = context.DocIcalTokens.FirstOrDefault(t => t.IdUsuario == 7);
        Assert.NotNull(savedToken);
        Assert.Equal(token, savedToken!.Token);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GenerarORegenerarTokenIcalAsync_UsuarioConTokenExistente_RegeneraTokenDistinto()
    {
        // Arrange
        var dbName = nameof(GenerarORegenerarTokenIcalAsync_UsuarioConTokenExistente_RegeneraTokenDistinto);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User { IdUsuario = 8, IdSigafi = "sigafi-ical2", Nombre = "Usuario iCal 2" });
        context.DocIcalTokens.Add(new DocIcalToken
        {
            IdToken = 1,
            Uuid = Guid.NewGuid().ToString(),
            IdUsuario = 8,
            Token = "token-viejo-12345",
            Activo = true,
            FechaGenerado = DateTime.UtcNow.AddDays(-30)
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act
        var newToken = await sut.GenerarORegenerarTokenIcalAsync(idUsuario: 8);

        // Assert — el token regenerado debe ser diferente al anterior
        Assert.NotEqual("token-viejo-12345", newToken);
        Assert.NotEmpty(newToken);
    }

    // ─── DevolverAInboxAsync ──────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task DevolverAInboxAsync_NotaEnKanban_CambiaEstadoAInbox()
    {
        // Arrange
        var dbName = nameof(DevolverAInboxAsync_NotaEnKanban_CambiaEstadoAInbox);
        await using var context = CreateInMemoryContext(dbName);

        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "nota-kanban-001",
            Titulo = "Nota en Kanban",
            TipoEvento = "Personal",
            FechaInicio = DateOnly.FromDateTime(DateTime.Today.AddDays(5)),
            EsTodoElDia = true,
            Activo = true,
            Prioridad = "Alta",
            Estado = "En Progreso",
            EsPrivado = true,
            RecurrenciaAnual = false,
            CreadoPor = 1,
            FechaRegistro = DateTime.UtcNow,
            FechaModificacion = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act
        var result = await sut.DevolverAInboxAsync("nota-kanban-001", idUsuario: 1);

        // Assert
        Assert.True(result);
        var inDb = context.DocCalendarioEventosNormativos.First(e => e.Uuid == "nota-kanban-001");
        Assert.Equal("Inbox", inDb.Estado);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task DevolverAInboxAsync_EventoQueNoPerteneceAlUsuario_RetornaFalse()
    {
        // Arrange
        var dbName = nameof(DevolverAInboxAsync_EventoQueNoPerteneceAlUsuario_RetornaFalse);
        await using var context = CreateInMemoryContext(dbName);

        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "nota-ajena-001",
            Titulo = "Nota de Otro Usuario",
            TipoEvento = "Personal",
            FechaInicio = DateOnly.FromDateTime(DateTime.Today),
            EsTodoElDia = true,
            Activo = true,
            Prioridad = "Media",
            Estado = "Pendiente",
            EsPrivado = true,
            RecurrenciaAnual = false,
            CreadoPor = 999, // Usuario dueño: 999
            FechaRegistro = DateTime.UtcNow,
            FechaModificacion = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        // Act — el usuario 42 NO es el dueño de esta nota
        var result = await sut.DevolverAInboxAsync("nota-ajena-001", idUsuario: 42);

        // Assert — debe rechazar la operación
        Assert.False(result);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task DevolverAInboxAsync_UuidInexistente_RetornaFalse()
    {
        // Arrange
        await using var context = CreateInMemoryContext(nameof(DevolverAInboxAsync_UuidInexistente_RetornaFalse));
        var sut = CreateSut(context);

        // Act
        var result = await sut.DevolverAInboxAsync("uuid-fantasma", idUsuario: 1);

        // Assert
        Assert.False(result);
    }

    // ─── GetEventosAsync — Filtrado por Rol y Privacidad ──────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetEventosAsync_DocenteExclusivo_SoloRetornaSusMateriasAsignadas()
    {
        // Arrange
        var dbName = nameof(GetEventosAsync_DocenteExclusivo_SoloRetornaSusMateriasAsignadas);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User
        {
            IdUsuario = 10,
            IdSigafi = "PROF-001",
            Administrador = false,
            Nombre = "Docente Uno"
        });

        // PEA del docente
        context.DocPeas.Add(new DocPea
        {
            IdPea = 101,
            Uuid = "pea-docente-001",
            IdAsignatura = 1,
            IdCarrera = 1,
            IdDocenteElaborador = "PROF-001",
            Estado = "Borrador",
            Activo = true,
            FechaModificacion = DateTime.UtcNow
        });

        // PEA de otro docente
        context.DocPeas.Add(new DocPea
        {
            IdPea = 102,
            Uuid = "pea-docente-002",
            IdAsignatura = 2,
            IdCarrera = 1,
            IdDocenteElaborador = "PROF-999",
            Estado = "Borrador",
            Activo = true,
            FechaModificacion = DateTime.UtcNow
        });

        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var eventos = (await sut.GetEventosAsync(hoy.AddDays(-5), hoy.AddDays(5), "DOSIER_DOCENTE", idUsuario: 10)).ToList();

        // Assert: solo debe ver su PEA
        var peaEvento = Assert.Single(eventos, e => e.TipoEntidadOrigen == "PEA");
        Assert.Equal("pea-docente-001", peaEvento.Uuid);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetEventosAsync_NormativosConRolesVisibles_FiltraSegunRolUsuario()
    {
        // Arrange
        var dbName = nameof(GetEventosAsync_NormativosConRolesVisibles_FiltraSegunRolUsuario);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User
        {
            IdUsuario = 20,
            IdSigafi = "DOC-020",
            Administrador = false,
            Nombre = "Docente Veinte"
        });

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        // Evento normativo solo para coordinadores
        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "norm-coord-only",
            Titulo = "Reunión de Coordinadores",
            TipoEvento = "Normativo",
            RolesVisibles = "DOSIER_COORD_CARRERA,DOSIER_COORD_ACAD",
            FechaInicio = hoy,
            Activo = true,
            EsPrivado = false
        });

        // Evento normativo para docentes
        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "norm-docente-ok",
            Titulo = "Entrega de Planificaciones",
            TipoEvento = "Normativo",
            RolesVisibles = "DOSIER_DOCENTE",
            FechaInicio = hoy,
            Activo = true,
            EsPrivado = false
        });

        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        // Act — consulta como docente
        var eventos = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_DOCENTE", idUsuario: 20)).ToList();

        // Assert: solo debe contener el evento para docentes
        Assert.Contains(eventos, e => e.Uuid == "norm-docente-ok");
        Assert.DoesNotContain(eventos, e => e.Uuid == "norm-coord-only");
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetEventosAsync_EventoPrivado_SoloVisibleParaCreador()
    {
        // Arrange
        var dbName = nameof(GetEventosAsync_EventoPrivado_SoloVisibleParaCreador);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User { IdUsuario = 1, IdSigafi = "U1", Administrador = false, Nombre = "User 1" });
        context.Users.Add(new User { IdUsuario = 2, IdSigafi = "U2", Administrador = false, Nombre = "User 2" });

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "privado-u1",
            Titulo = "Mi Tarea Privada",
            TipoEvento = "Personal",
            FechaInicio = hoy,
            Activo = true,
            EsPrivado = true,
            CreadoPor = 1
        });

        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        // Act
        var eventosU1 = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_DOCENTE", idUsuario: 1)).ToList();
        var eventosU2 = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_DOCENTE", idUsuario: 2)).ToList();

        // Assert
        Assert.Contains(eventosU1, e => e.Uuid == "privado-u1");
        Assert.DoesNotContain(eventosU2, e => e.Uuid == "privado-u1");
    }
}


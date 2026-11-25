using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_application.Academico;
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

    private static CalendarioService CreateSut(DosierContext context, string? periodoActivo = null)
    {
        var mockEmail = new Mock<IEmailEngineService>();
        var mockPeriodo = new Mock<IPeriodoInstitucionalResolver>();
        mockPeriodo
            .Setup(p => p.GetIdPeriodoActivoAsync(default))
            .ReturnsAsync(periodoActivo ?? string.Empty);
        var mockLogger = new Mock<ILogger<CalendarioService>>();
        return new CalendarioService(context, mockEmail.Object, mockPeriodo.Object, mockLogger.Object);
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

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetEventosAsync_Docente_VeTodosLosEstadosPeaDeSuCarrera()
    {
        // Arrange
        var dbName = nameof(GetEventosAsync_Docente_VeTodosLosEstadosPeaDeSuCarrera);
        await using var context = CreateInMemoryContext(dbName);

        context.Users.Add(new User
        {
            IdUsuario = 30,
            IdSigafi = "PROF-030",
            Administrador = false,
            Nombre = "Docente Treinta"
        });

        var estados = new[]
        {
            ("pea-borrador", "Borrador"),
            ("pea-observado", "Observado"),
            ("pea-enrevision", "EnRevision"),
            ("pea-corregido", "Corregido"),
            ("pea-revisadocoord", "RevisadoCoord"),
            ("pea-revisadoacad", "RevisadoAcad"),
            ("pea-aprobado", "Aprobado"),
            ("pea-publicado", "Publicado")
        };

        int id = 200;
        foreach (var (uuid, estado) in estados)
        {
            context.DocPeas.Add(new DocPea
            {
                IdPea = id++,
                Uuid = uuid,
                IdAsignatura = 1,
                IdCarrera = 1,
                IdDocenteElaborador = "PROF-030",
                Estado = estado,
                Activo = true,
                FechaModificacion = DateTime.UtcNow,
                FechaElaborado = DateTime.UtcNow,
                FechaRevisadoCoord = DateTime.UtcNow,
                FechaRevisadoAcad = DateTime.UtcNow,
                FechaAprobado = DateTime.UtcNow
            });
        }

        await context.SaveChangesAsync();
        var sut = CreateSut(context);
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        // Act
        var eventos = (await sut.GetEventosAsync(hoy.AddDays(-5), hoy.AddDays(5), "DOSIER_DOCENTE", idUsuario: 30))
            .Where(e => e.TipoEntidadOrigen == "PEA")
            .ToList();

        // Assert: todos los estados del ciclo PEA de la carrera son visibles
        Assert.Equal(8, eventos.Count);
        Assert.Contains(eventos, e => e.Uuid == "pea-borrador" && e.UrlAccion == "/documentacion/mis-proyectos/workspace/pea-oficial/pea-borrador?edit=pea-oficial");
        Assert.Contains(eventos, e => e.Uuid == "pea-observado" && e.UrlAccion == "/documentacion/mis-proyectos/workspace/pea-oficial/pea-observado?edit=pea-oficial");
        Assert.Contains(eventos, e => e.Uuid == "pea-aprobado");
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task CreateUsuarioEventoAsync_DocenteEnSuCarrera_PermiteCarreraYBloqueaInstituto()
    {
        var dbName = nameof(CreateUsuarioEventoAsync_DocenteEnSuCarrera_PermiteCarreraYBloqueaInstituto);
        await using var context = CreateInMemoryContext(dbName);

        context.Carreras.Add(new Carrera { IdCarrera = 5, Carrera1 = "Software", EsInstituto = 1 });
        context.Users.Add(new User { IdUsuario = 40, IdSigafi = "PROF-040", Administrador = false, Nombre = "Profe Software" });
        context.DocPeas.Add(new DocPea
        {
            IdPea = 301,
            Uuid = "pea-soft-1",
            IdAsignatura = 1,
            IdCarrera = 5,
            IdDocenteElaborador = "PROF-040",
            Estado = "Borrador",
            Activo = true,
            FechaModificacion = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var dtoCarrera = new EventoNormativoDto(
            null, "Reunión de Software", "Avance PEA", "Reunion",
            hoy, null, true, false, null, null, "CARRERA", null, "#3B82F6", 3, true, false, "Media", "Pendiente",
            IdCarrera: 5
        );
        var (uuidCarrera, forbiddenCarrera) = await sut.CreateUsuarioEventoAsync(dtoCarrera, 40, "DOSIER_DOCENTE");
        Assert.False(forbiddenCarrera);
        Assert.False(string.IsNullOrEmpty(uuidCarrera));

        var dtoInstituto = dtoCarrera with { Titulo = "Global Instituto", IdCarrera = null };
        var (uuidInst, forbiddenInst) = await sut.CreateUsuarioEventoAsync(dtoInstituto, 40, "DOSIER_DOCENTE");
        Assert.True(forbiddenInst);
        Assert.Null(uuidInst);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task UpdateUsuarioEventoAsync_DocenteNoPuedeEscalarPersonalAInstitutoNiCarreraAjena()
    {
        var dbName = nameof(UpdateUsuarioEventoAsync_DocenteNoPuedeEscalarPersonalAInstitutoNiCarreraAjena);
        await using var context = CreateInMemoryContext(dbName);

        context.Carreras.AddRange(
            new Carrera { IdCarrera = 5, Carrera1 = "Software", EsInstituto = 1 },
            new Carrera { IdCarrera = 9, Carrera1 = "Gastronomía", EsInstituto = 1 }
        );
        context.Users.Add(new User { IdUsuario = 50, IdSigafi = "PROF-050", Administrador = false, Nombre = "Docente 50" });
        context.DocPeas.Add(new DocPea
        {
            IdPea = 401,
            Uuid = "pea-soft-50",
            IdAsignatura = 1,
            IdCarrera = 5,
            IdDocenteElaborador = "PROF-050",
            Estado = "Borrador",
            Activo = true,
            FechaModificacion = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var sut = CreateSut(context);
        var hoy = DateOnly.FromDateTime(DateTime.Today);

        var dtoPersonal = new EventoNormativoDto(
            null, "Nota personal", "Detalle", "Personal",
            hoy, null, true, false, null, null, "PERSONAL", null, "#F59E0B", null, true, true, "Media", "Pendiente"
        );
        var (uuid, forbidden) = await sut.CreateUsuarioEventoAsync(dtoPersonal, 50, "DOSIER_DOCENTE");
        Assert.False(forbidden);
        Assert.NotNull(uuid);

        // Intento de escalada a todo el instituto (EsPrivado = false, IdCarrera = null) -> bloqueado
        var escalateInst = await sut.UpdateUsuarioEventoAsync(uuid!, dtoPersonal with { EsPrivado = false, IdCarrera = null }, 50, "DOSIER_DOCENTE");
        Assert.False(escalateInst);

        // Intento de escalada a carrera ajena (IdCarrera = 9) -> bloqueado
        var escalateOtraCarrera = await sut.UpdateUsuarioEventoAsync(uuid!, dtoPersonal with { EsPrivado = false, IdCarrera = 9 }, 50, "DOSIER_DOCENTE");
        Assert.False(escalateOtraCarrera);

        // Cambio legítimo a su propia carrera (IdCarrera = 5) -> permitido
        var moveOwnCarrera = await sut.UpdateUsuarioEventoAsync(uuid!, dtoPersonal with { EsPrivado = false, IdCarrera = 5 }, 50, "DOSIER_DOCENTE");
        Assert.True(moveOwnCarrera);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetEventosAsync_EventoDeCarrera_ClasificaComoCarreraYAsignaPuedeGestionarPorRol()
    {
        var dbName = nameof(GetEventosAsync_EventoDeCarrera_ClasificaComoCarreraYAsignaPuedeGestionarPorRol);
        await using var context = CreateInMemoryContext(dbName);

        context.Carreras.AddRange(
            new Carrera { IdCarrera = 5, Carrera1 = "Software", EsInstituto = 1 },
            new Carrera { IdCarrera = 9, Carrera1 = "Gastronomía", EsInstituto = 1 }
        );
        context.Users.AddRange(
            new User { IdUsuario = 60, IdSigafi = "PROF-060", Administrador = false, Nombre = "Docente Creador" },
            new User { IdUsuario = 61, IdSigafi = "PROF-061", Administrador = false, Nombre = "Docente Compañero" },
            new User { IdUsuario = 62, IdSigafi = "COORD-062", Administrador = false, Nombre = "Coord Software" },
            new User { IdUsuario = 63, IdSigafi = "PROF-063", Administrador = false, Nombre = "Docente Otra Carrera" }
        );
        context.DocPeas.AddRange(
            new DocPea { IdPea = 501, Uuid = "p1", IdAsignatura = 1, IdCarrera = 5, IdDocenteElaborador = "PROF-060", Estado = "Borrador", Activo = true, FechaModificacion = DateTime.UtcNow },
            new DocPea { IdPea = 502, Uuid = "p2", IdAsignatura = 2, IdCarrera = 5, IdDocenteElaborador = "PROF-061", Estado = "Borrador", Activo = true, FechaModificacion = DateTime.UtcNow },
            new DocPea { IdPea = 503, Uuid = "p3", IdAsignatura = 3, IdCarrera = 9, IdDocenteElaborador = "PROF-063", Estado = "Borrador", Activo = true, FechaModificacion = DateTime.UtcNow }
        );
        context.DocAutoridadesCurriculares.Add(new DocAutoridadCurricular
        {
            IdSigafi = "COORD-062",
            CargoCurricular = "COORD_CARRERA",
            IdCarrera = 5,
            EsActivo = true
        });

        var hoy = DateOnly.FromDateTime(DateTime.Today);
        context.DocCalendarioEventosNormativos.AddRange(
            new DocCalendarioEventoNormativo
            {
                Uuid = "evt-carrera-5",
                Titulo = "Reunión de Software",
                TipoEvento = "Reunion",
                FechaInicio = hoy,
                Activo = true,
                EsPrivado = false,
                IdCarrera = 5,
                CreadoPor = 60
            },
            new DocCalendarioEventoNormativo
            {
                Uuid = "evt-privado-anual",
                Titulo = "Recordatorio personal anual",
                TipoEvento = "Personal",
                FechaInicio = hoy,
                RecurrenciaAnual = true,
                Activo = true,
                EsPrivado = true,
                CreadoPor = 60
            }
        );
        await context.SaveChangesAsync();

        var sut = CreateSut(context);

        var eventosCreador = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_DOCENTE", 60)).ToList();
        var evCarreraCreador = Assert.Single(eventosCreador, e => e.Uuid == "evt-carrera-5");
        Assert.Equal("Carrera", evCarreraCreador.CategoriaGlobal);
        Assert.True(evCarreraCreador.PuedeGestionar);

        var evPrivadoAnual = Assert.Single(eventosCreador, e => e.Uuid == "evt-privado-anual");
        Assert.Equal("Personal", evPrivadoAnual.CategoriaGlobal);
        Assert.True(evPrivadoAnual.PuedeGestionar);

        var eventosCompanero = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_DOCENTE", 61)).ToList();
        var evCarreraCompanero = Assert.Single(eventosCompanero, e => e.Uuid == "evt-carrera-5");
        Assert.Equal("Carrera", evCarreraCompanero.CategoriaGlobal);
        Assert.True(evCarreraCompanero.PuedeGestionar);

        // Docente de otra carrera (IdCarrera = 9) no ve ni puede editar el evento de carrera 5
        var dtoEditAjeno = new EventoNormativoDto(
            "evt-carrera-5", "Intento ajeno", null, "Reunion",
            hoy, null, true, false, null, null, "CARRERA", null, "#3B82F6", 3, true, false, "Media", "Pendiente",
            IdCarrera: 5
        );
        var editOtraCarrera = await sut.UpdateUsuarioEventoAsync("evt-carrera-5", dtoEditAjeno, 63, "DOSIER_DOCENTE");
        Assert.False(editOtraCarrera);

        var eventosCoord = (await sut.GetEventosAsync(hoy.AddDays(-1), hoy.AddDays(1), "DOSIER_COORD_CARRERA", 62)).ToList();
        var evCarreraCoord = Assert.Single(eventosCoord, e => e.Uuid == "evt-carrera-5");
        Assert.True(evCarreraCoord.PuedeGestionar);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task ProcesarAlertasDiariasAsync_EventoCarrera_EnviaSoloAMiembrosDeCarrera()
    {
        var dbName = nameof(ProcesarAlertasDiariasAsync_EventoCarrera_EnviaSoloAMiembrosDeCarrera);
        await using var context = CreateInMemoryContext(dbName);

        context.Carreras.AddRange(
            new Carrera { IdCarrera = 5, Carrera1 = "Software", EsInstituto = 1 },
            new Carrera { IdCarrera = 9, Carrera1 = "Gastronomía", EsInstituto = 1 }
        );
        context.Users.AddRange(
            new User { IdUsuario = 70, IdSigafi = "PROF-070", Activo = true, Administrador = false, Nombre = "Profe Soft", EmailInstitucional = "soft@istpet.edu.ec" },
            new User { IdUsuario = 71, IdSigafi = "PROF-071", Activo = true, Administrador = false, Nombre = "Profe Gastro", EmailInstitucional = "gastro@istpet.edu.ec" }
        );
        context.DocPeas.AddRange(
            new DocPea { IdPea = 601, Uuid = "ps1", IdAsignatura = 1, IdCarrera = 5, IdDocenteElaborador = "PROF-070", Estado = "Borrador", Activo = true, FechaModificacion = DateTime.UtcNow },
            new DocPea { IdPea = 602, Uuid = "pg1", IdAsignatura = 2, IdCarrera = 9, IdDocenteElaborador = "PROF-071", Estado = "Borrador", Activo = true, FechaModificacion = DateTime.UtcNow }
        );

        var hoy = DateOnly.FromDateTime(DateTime.Today);
        context.DocCalendarioEventosNormativos.Add(new DocCalendarioEventoNormativo
        {
            Uuid = "evt-alerta-soft",
            Titulo = "Entrega PEA Software",
            TipoEvento = "Reunion",
            FechaInicio = hoy.AddDays(1),
            AlertaDias = 2,
            Activo = true,
            EsPrivado = false,
            IdCarrera = 5,
            CreadoPor = 70
        });
        await context.SaveChangesAsync();

        var mockEmail = new Mock<IEmailEngineService>();
        var mockPeriodo = new Mock<IPeriodoInstitucionalResolver>();
        mockPeriodo.Setup(p => p.GetIdPeriodoActivoAsync(default)).ReturnsAsync(string.Empty);
        var mockLogger = new Mock<ILogger<CalendarioService>>();
        var sut = new CalendarioService(context, mockEmail.Object, mockPeriodo.Object, mockLogger.Object);

        await sut.ProcesarAlertasDiariasAsync();

        mockEmail.Verify(e => e.SendTemplatedEmailAsync(It.Is<EmailSendRequest>(r => r.DestinatariosEmails.Contains("soft@istpet.edu.ec"))), Times.Once);
        mockEmail.Verify(e => e.SendTemplatedEmailAsync(It.Is<EmailSendRequest>(r => r.DestinatariosEmails.Contains("gastro@istpet.edu.ec"))), Times.Never);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "Calendario")]
    public async Task GetCarrerasUsuarioAsync_IgnoraAsignacionesHistoricasDePeriodosPasados()
    {
        await using var context = CreateInMemoryContext(nameof(GetCarrerasUsuarioAsync_IgnoraAsignacionesHistoricasDePeriodosPasados));

        var roleCoord = new Role { IdRol = 90, CodigoRol = "DOSIER_COORD_CARRERA", Nombre = "Coordinador de Carrera" };
        var user = new User { IdUsuario = 90, IdSigafi = "1709890626", Nombre = "WILFRIDO QUINTO", Activo = true };
        context.Roles.Add(roleCoord);
        context.Users.Add(user);
        context.UserRoles.Add(new UserRole { IdUsuario = 90, IdRol = 90, EsActivo = true, Role = roleCoord });

        context.Carreras.AddRange(
            new Carrera { IdCarrera = 9, Carrera1 = "DESARROLLO DE SOFTWARE", EsInstituto = 1 },
            new Carrera { IdCarrera = 10, Carrera1 = "MECANICA AUTOMOTRIZ", EsInstituto = 1 }
        );

        context.DocAutoridadesCurriculares.Add(new DocAutoridadCurricular
        {
            IdAutoridad = 6,
            IdSigafi = "1709890626",
            NombreCompleto = "WILFRIDO QUINTO",
            CargoCurricular = "COORD_CARRERA",
            IdCarrera = 9,
            EsActivo = true
        });

        context.Cursos.AddRange(
            new Curso { IdNivel = 50, IdCarrera = 9 },
            new Curso { IdNivel = 57, IdCarrera = 10 }
        );

        context.AsignacionesProfesores.AddRange(
            new AsignacionesProfesore { IdAsignacion = 25355, IdProfesor = "1709890626", IdPeriodo = "OCT2026", IdNivel = 50, Activo = 1 },
            new AsignacionesProfesore { IdAsignacion = 15298, IdProfesor = "1709890626", IdPeriodo = "OCT2020", IdNivel = 57, Activo = 1 }
        );

        context.ProfesoresCarrerasPeriodos.AddRange(
            new ProfesoresCarrerasPeriodo { IdProfesoresCarrerasPeriodos = 1, IdProfesor = "1709890626", IdPeriodo = "OCT2026", IdCarrera = 9, EsActivo = 1 },
            new ProfesoresCarrerasPeriodo { IdProfesoresCarrerasPeriodos = 2, IdProfesor = "1709890626", IdPeriodo = "OCT2020", IdCarrera = 10, EsActivo = 1 },
            new ProfesoresCarrerasPeriodo { IdProfesoresCarrerasPeriodos = 3, IdProfesor = "1709890626", IdPeriodo = "OCT2026", IdCarrera = 10, EsActivo = 0 }
        );

        await context.SaveChangesAsync();

        var sut = CreateSut(context, periodoActivo: "OCT2026");

        var carreras = (await sut.GetCarrerasUsuarioAsync(90, "DOSIER_COORD_CARRERA")).ToList();

        Assert.Single(carreras);
        Assert.Equal(9, carreras[0].IdCarrera);
        Assert.Equal("DESARROLLO DE SOFTWARE", carreras[0].Nombre);
    }
}


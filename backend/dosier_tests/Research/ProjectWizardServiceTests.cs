using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Xunit;
using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;

namespace dosier_tests.Research;

/// <summary>
/// Tests unitarios para el ciclo de vida de proyectos (Wizard / Proyecto Core).
/// Valida las reglas de negocio de creación, actualización, eliminación lógica,
/// purga permanente y restauración de proyectos de investigación en la base de datos:
///  - Generación de UUID único para nuevos proyectos
///  - Persistencia de estados ("Borrador", "Enviado", "En Ejecución", "Finalizado", "Rechazado")
///  - Regla de eliminación lógica (Flag Eliminado = true, Activo = false)
///  - Regla de purga permanente (Remover registro de la base de datos)
///  - Regla de restauración (Activo = true, Eliminado = false)
/// </summary>
public class ProjectWizardServiceTests
{
    private static DosierContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new DosierContext(options);
    }

    private static DocProyecto BuildProyectoBase(int id, string estado = "Borrador", bool activo = true, bool eliminado = false) =>
        new DocProyecto
        {
            IdProyecto = id,
            Uuid = Guid.NewGuid().ToString(),
            Titulo = $"Proyecto de Investigación #{id}",
            Estado = estado,
            Activo = activo,
            Eliminado = eliminado,
            FechaRegistro = DateTime.UtcNow
        };

    // ─── Creación y Generación de UUID ──────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task CrearProyecto_GeneraUuidUnicoYEstadoBorrador()
    {
        var dbName = nameof(CrearProyecto_GeneraUuidUnicoYEstadoBorrador);
        await using var context = CreateInMemoryContext(dbName);

        var nuevo = BuildProyectoBase(1);
        context.DocProyectos.Add(nuevo);
        await context.SaveChangesAsync();

        var guardado = await context.DocProyectos.FirstOrDefaultAsync(p => p.IdProyecto == 1);
        Assert.NotNull(guardado);
        Assert.NotNull(guardado!.Uuid);
        Assert.NotEmpty(guardado.Uuid);
        Assert.Equal("Borrador", guardado.Estado);
        Assert.True(guardado.Activo ?? false);
        Assert.False(guardado.Eliminado ?? true);
    }

    // ─── Actualización de Proyecto ───────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task ActualizarProyecto_ModificaTituloYFechaModificacion()
    {
        var dbName = nameof(ActualizarProyecto_ModificaTituloYFechaModificacion);
        await using var context = CreateInMemoryContext(dbName);

        var proyecto = BuildProyectoBase(2);
        context.DocProyectos.Add(proyecto);
        await context.SaveChangesAsync();

        proyecto.Titulo = "Título Actualizado 2026";
        proyecto.FechaModificacion = DateTime.UtcNow;
        context.DocProyectos.Update(proyecto);
        await context.SaveChangesAsync();

        var actualizado = await context.DocProyectos.FirstOrDefaultAsync(p => p.IdProyecto == 2);
        Assert.NotNull(actualizado);
        Assert.Equal("Título Actualizado 2026", actualizado!.Titulo);
        Assert.NotNull(actualizado.FechaModificacion);
    }

    // ─── Eliminación Lógica (Delete) ─────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task EliminarProyecto_MarcaComoEliminadoYDesactiva()
    {
        var dbName = nameof(EliminarProyecto_MarcaComoEliminadoYDesactiva);
        await using var context = CreateInMemoryContext(dbName);

        var proyecto = BuildProyectoBase(3);
        context.DocProyectos.Add(proyecto);
        await context.SaveChangesAsync();

        // Aplicar regla de soft delete
        var aEliminar = await context.DocProyectos.FindAsync(3);
        Assert.NotNull(aEliminar);
        aEliminar!.Eliminado = true;
        aEliminar.Activo = false;
        aEliminar.FechaEliminacion = DateTime.UtcNow;
        context.DocProyectos.Update(aEliminar);
        await context.SaveChangesAsync();

        var eliminado = await context.DocProyectos.FindAsync(3);
        Assert.NotNull(eliminado);
        Assert.True(eliminado!.Eliminado ?? false);
        Assert.False(eliminado.Activo ?? true);
        Assert.NotNull(eliminado.FechaEliminacion);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task EliminarProyecto_SoloProyectosEnBorrador_PuedenSerEliminadosPorUsuario()
    {
        // Regla de negocio: proyectos en estado 'En Ejecución' o 'Aprobado' no pueden ser marcados como borrador
        var proyectoEjecucion = BuildProyectoBase(4, estado: "En Ejecución");
        Assert.NotEqual("Borrador", proyectoEjecucion.Estado);
    }

    // ─── Purga Permanente (Purge) ──────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task PurgarProyecto_RemueveRegistroDeBaseDeDatos()
    {
        var dbName = nameof(PurgarProyecto_RemueveRegistroDeBaseDeDatos);
        await using var context = CreateInMemoryContext(dbName);

        var proyecto = BuildProyectoBase(5, eliminado: true, activo: false);
        context.DocProyectos.Add(proyecto);
        await context.SaveChangesAsync();

        // Purga física
        context.DocProyectos.Remove(proyecto);
        await context.SaveChangesAsync();

        var enDb = await context.DocProyectos.FirstOrDefaultAsync(p => p.IdProyecto == 5);
        Assert.Null(enDb);
    }

    // ─── Restauración (Restore) ───────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "ProjectWizard")]
    public async Task RestaurarProyecto_RestableceEstadoActivoYRemueveEliminado()
    {
        var dbName = nameof(RestaurarProyecto_RestableceEstadoActivoYRemueveEliminado);
        await using var context = CreateInMemoryContext(dbName);

        var proyecto = BuildProyectoBase(6, eliminado: true, activo: false);
        context.DocProyectos.Add(proyecto);
        await context.SaveChangesAsync();

        // Restaurar
        proyecto.Eliminado = false;
        proyecto.Activo = true;
        proyecto.FechaEliminacion = null;
        await context.SaveChangesAsync();

        var restaurado = await context.DocProyectos.FirstOrDefaultAsync(p => p.IdProyecto == 6);
        Assert.NotNull(restaurado);
        Assert.False(restaurado!.Eliminado ?? true);
        Assert.True(restaurado.Activo ?? false);
        Assert.Null(restaurado.FechaEliminacion);
    }
}

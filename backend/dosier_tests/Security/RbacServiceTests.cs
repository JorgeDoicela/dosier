using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using dosier_infrastructure.Security;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;

namespace dosier_tests.Security;

/// <summary>
/// Tests unitarios para RbacService y logica de roles.
/// Role.Nombre (no NombreRol), User.Administrador es bool (no bool?).
/// </summary>
public class RbacServiceTests
{
    private static DosierContext CreateInMemoryContext(string dbName)
    {
        var options = new DbContextOptionsBuilder<DosierContext>()
            .UseInMemoryDatabase(databaseName: dbName)
            .Options;
        return new DosierContext(options);
    }

    private static RbacService CreateSut(DosierContext context) =>
        new RbacService(context,
            new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?> { ["Security:MasterAdminId"] = "admin-test" })
                .Build());

    // ─── Logica RBAC pura ────────────────────────────────────────────────────

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public void UsuarioAdministrador_TieneBanderaAdminEnTrue()
    {
        var user = new User { IdUsuario = 99, IdSigafi = "admin", Nombre = "Admin", Administrador = true };
        Assert.True(user.Administrador);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public void UsuarioNoAdministrador_TieneBanderaAdminEnFalse()
    {
        var user = new User { IdUsuario = 1, IdSigafi = "docente", Nombre = "Docente", Administrador = false };
        Assert.False(user.Administrador);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public void Rol_TieneCodigoYNombreCorrectamente()
    {
        // Role.Nombre (no NombreRol), Role.CodigoRol
        var rol = new Role { IdRol = 1, Nombre = "DOCENTE_INVESTIGADOR", CodigoRol = "DOCENTE_INV" };
        Assert.Equal("DOCENTE_INV", rol.CodigoRol);
        Assert.Equal("DOCENTE_INVESTIGADOR", rol.Nombre);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public async Task UserRoles_PersistenEnDB_Correctamente()
    {
        var dbName = nameof(UserRoles_PersistenEnDB_Correctamente);
        await using var context = CreateInMemoryContext(dbName);

        var rol  = new Role { IdRol = 1, Nombre = "Docente", CodigoRol = "DOCENTE" };
        var user = new User { IdUsuario = 10, IdSigafi = "doc001", Nombre = "Docente Test", Administrador = false };
        context.Roles.Add(rol);
        context.Users.Add(user);
        context.UserRoles.Add(new UserRole { IdUsuario = 10, IdRol = 1, EsActivo = true });
        await context.SaveChangesAsync();

        var userRoles = context.UserRoles.Where(ur => ur.IdUsuario == 10 && ur.EsActivo == true).ToList();
        Assert.Single(userRoles);
        Assert.Equal(1, userRoles[0].IdRol);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public async Task SynchronizeUserRolesAsync_ConUserValido_NoLanzaExcepcion()
    {
        var dbName = nameof(SynchronizeUserRolesAsync_ConUserValido_NoLanzaExcepcion);
        await using var context = CreateInMemoryContext(dbName);
        var user = new User { IdUsuario = 20, IdSigafi = "testsync", Nombre = "Sync Test", Administrador = false, TablaSigafi = "profesor" };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        var exception = await Record.ExceptionAsync(() => sut.SynchronizeUserRolesAsync(user));
        Assert.Null(exception);
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public async Task SynchronizeUserRolesAsync_UsuarioConAdminLegacy_NoRecibeDosierAdmin_YDesactivaBanderaAdmin()
    {
        var dbName = nameof(SynchronizeUserRolesAsync_UsuarioConAdminLegacy_NoRecibeDosierAdmin_YDesactivaBanderaAdmin);
        await using var context = CreateInMemoryContext(dbName);
        // Usuario que no es admin-test pero que venía con Administrador = true por SIGAFI antiguo
        var user = new User { IdUsuario = 30, IdSigafi = "1724649338", Nombre = "Docente Con Admin Legacy", Administrador = true, TablaSigafi = "profesor" };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.SynchronizeUserRolesAsync(user);

        // Debe haber corregido la bandera a false y no otorgar DOSIER_ADMIN
        Assert.False(user.Administrador);
        var userRoles = await context.UserRoles.Include(ur => ur.Role).Where(ur => ur.IdUsuario == 30).ToListAsync();
        Assert.DoesNotContain(userRoles, ur => ur.Role.CodigoRol == "DOSIER_ADMIN");
        Assert.Contains(userRoles, ur => ur.Role.CodigoRol == "DOSIER_DOCENTE");
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public async Task SynchronizeUserRolesAsync_MasterAdmin_RecibeDosierAdminYActivaBanderaAdmin()
    {
        var dbName = nameof(SynchronizeUserRolesAsync_MasterAdmin_RecibeDosierAdminYActivaBanderaAdmin);
        await using var context = CreateInMemoryContext(dbName);
        // Usuario cuya cédula coincide con Security:MasterAdminId ("admin-test")
        var user = new User { IdUsuario = 40, IdSigafi = "admin-test", Nombre = "Master Admin", Administrador = false, TablaSigafi = "profesor" };
        context.Users.Add(user);
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.SynchronizeUserRolesAsync(user);

        // Debe asignar DOSIER_ADMIN y activar la bandera Administrador
        Assert.True(user.Administrador);
        var userRoles = await context.UserRoles.Include(ur => ur.Role).Where(ur => ur.IdUsuario == 40).ToListAsync();
        Assert.Contains(userRoles, ur => ur.Role.CodigoRol == "DOSIER_ADMIN");
    }

    [Fact]
    [Trait("Category", "Unit")]
    [Trait("Feature", "RBAC")]
    public async Task SynchronizeUserRolesAsync_UsuarioConRolDosierAdminActivo_MantieneBanderaAdmin()
    {
        var dbName = nameof(SynchronizeUserRolesAsync_UsuarioConRolDosierAdminActivo_MantieneBanderaAdmin);
        await using var context = CreateInMemoryContext(dbName);
        var adminRole = new Role { IdRol = 99, CodigoRol = "DOSIER_ADMIN", Nombre = "Administrador DOSIER", EsActivo = true };
        context.Roles.Add(adminRole);
        var user = new User { IdUsuario = 50, IdSigafi = "docente-manual-admin", Nombre = "Admin Manual", Administrador = false, TablaSigafi = "profesor" };
        context.Users.Add(user);
        context.UserRoles.Add(new UserRole { IdUsuario = 50, IdRol = 99, EsActivo = true, Role = adminRole });
        await context.SaveChangesAsync();
        var sut = CreateSut(context);

        await sut.SynchronizeUserRolesAsync(user);

        // Debe sincronizar Administrador = true porque tiene el rol activo
        Assert.True(user.Administrador);
    }
}

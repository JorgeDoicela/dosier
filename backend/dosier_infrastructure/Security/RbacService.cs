using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.data.models;
using dosier_application.Security;

namespace dosier_infrastructure.Security;

public class RbacService : IRbacService
{
    private readonly DosierContext _context;
    private readonly string _superAdminCedula;
    private readonly string _masterAdminId;
    private static bool _rbacSeeded = false;

    public RbacService(DosierContext context, IConfiguration configuration)
    {
        _context = context;
        _superAdminCedula = configuration["Security:SuperAdminCedula"]?.Trim() ?? string.Empty;
        _masterAdminId = configuration["Security:MasterAdminId"]?.Trim() ?? string.Empty;
    }

    public async Task SeedRbacStructureAsync()
    {
        if (_rbacSeeded) return;

        // 1. Asegurar Sistema
        var system = await _context.Systems.FirstOrDefaultAsync(s => s.Codigo == "DOSIER");
        if (system == null)
        {
            system = new SystemEntity { Codigo = "DOSIER", Detalle = "Gestión Curricular y Acreditación ISTPET" };
            _context.Systems.Add(system);
            await _context.SaveChangesAsync();
        }

        // 2. Extraer todos los Módulos y Operaciones definidos en el Enum de Permisos
        var permissions = typeof(dosier_domain.Identity.Enums.Permissions)
            .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.FlattenHierarchy)
            .Where(f => f.IsLiteral && !f.IsInitOnly)
            .Select(f => f.GetValue(null)?.ToString() ?? "")
            .Where(p => p.Contains(":"))
            .Select(p => {
                var parts = p.Split(':');
                return new { Modulo = parts[0], Operacion = parts[1] };
            })
            .Distinct()
            .ToList();

        if (!permissions.Any())
        {
            _rbacSeeded = true;
            return;
        }

        // 3. Traer todos los módulos, operaciones y relaciones de DOSIER a memoria en una sola tanda
        var existingModulesList = await _context.Modules
            .Where(m => m.IdSistema == system.IdSistema)
            .ToListAsync();
        var existingModules = existingModulesList
            .GroupBy(m => m.Nombre, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var existingOperationsList = await _context.Operations
            .ToListAsync();
        var existingOperations = existingOperationsList
            .GroupBy(o => o.NombreOperacion, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.First(), StringComparer.OrdinalIgnoreCase);

        var existingRelations = await _context.ModuleOperations
            .Where(mo => mo.Module.IdSistema == system.IdSistema)
            .Select(mo => new { mo.IdModulos, mo.IdOperaciones })
            .ToListAsync();

        var relationSet = new HashSet<(int, int)>(
            existingRelations.Select(r => (r.IdModulos, r.IdOperaciones))
        );

        bool changesMade = false;

        foreach (var p in permissions)
        {
            // Asegurar Módulo en memoria / DB
            if (!existingModules.TryGetValue(p.Modulo, out var module))
            {
                module = new IdentityModule { Nombre = p.Modulo, IdSistema = system.IdSistema, EsActivo = true };
                _context.Modules.Add(module);
                changesMade = true;
                // Guardamos cambios temporalmente para obtener el ID generado por la base de datos
                await _context.SaveChangesAsync();
                existingModules[p.Modulo] = module;
            }

            // Asegurar Operación en memoria / DB
            if (!existingOperations.TryGetValue(p.Operacion, out var operation))
            {
                operation = new IdentityOperation { NombreOperacion = p.Operacion };
                _context.Operations.Add(operation);
                changesMade = true;
                await _context.SaveChangesAsync();
                existingOperations[p.Operacion] = operation;
            }

            // Asegurar Relación Módulo-Operación
            var relKey = (module.IdModulos, operation.IdOperaciones);
            if (!relationSet.Contains(relKey))
            {
                _context.ModuleOperations.Add(new ModuleOperation
                {
                    IdModulos = module.IdModulos,
                    IdOperaciones = operation.IdOperaciones,
                    EsActivo = true,
                    FechaCreacion = DateOnly.FromDateTime(DateTime.Now)
                });
                changesMade = true;
                relationSet.Add(relKey);
            }
        }

        if (changesMade)
        {
            await _context.SaveChangesAsync();
        }

        // 4. Asegurar que los roles oficiales de DOSIER existan formalmente en rbac_rol
        var officialRoles = new[]
        {
            ("DOSIER_ADMIN", "Administrador DOSIER"),
            ("DOSIER_DOCENTE", "Docente"),
            ("DOSIER_COORD_CARRERA", "Coordinador de Carrera DOSIER"),
            ("DOSIER_COORD_ACAD", "Coordinación Académica DOSIER"),
            ("DOSIER_VICERRECTOR", "Vicerrectorado Académico DOSIER")
        };

        foreach (var (code, name) in officialRoles)
        {
            var role = await _context.Roles.FirstOrDefaultAsync(r => r.CodigoRol == code);
            if (role == null)
            {
                role = new Role
                {
                    CodigoRol = code,
                    Nombre = name,
                    EsActivo = true
                };
                _context.Roles.Add(role);
                await _context.SaveChangesAsync();
                await AssignDefaultPermissionsToRoleAsync(role);
            }
        }

        // 5. Semilla base de autoridades si doc_autoridades_curriculares está vacía
        try
        {
            if (!await _context.DocAutoridadesCurriculares.AnyAsync())
            {
                _context.DocAutoridadesCurriculares.AddRange(new[]
                {
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1802707511",
                        NombreCompleto = "FREDDY PATRICIO BAÑO NARANJO",
                        CargoCurricular = "VICERRECTOR",
                        IdCarrera = null,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1003987763",
                        NombreCompleto = "ELVA DAYANA TAPIA VELASQUEZ",
                        CargoCurricular = "COORD_ACADEMICO",
                        IdCarrera = null,
                        EsActivo = false,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1720004793",
                        NombreCompleto = "CHRISTIAN GIOVANNY CASTRO HERRERA",
                        CargoCurricular = "COORD_ACADEMICO",
                        IdCarrera = null,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1720000004",
                        NombreCompleto = "DAVID ALEJANDRO GUAMAN PEREZ",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 1,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1721465431",
                        NombreCompleto = "WILMER PATRICIO TOAPANTA TOCTAGUANO",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 7,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1709890626",
                        NombreCompleto = "WILFRIDO AMILCAR TRUJILLO QUINTO",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 9,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1717774861",
                        NombreCompleto = "RAMIRO ALEXANDER CAMACHO CEVALLOS",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 10,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1726546763",
                        NombreCompleto = "DANIELA ESTEFANIA GUILLEN ARAUZ",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 12,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1716750268",
                        NombreCompleto = "ANDREA FABIOLA ACOSTA BELTRAN",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 13,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1720114600",
                        NombreCompleto = "JULIO ESTEBAN ROBALINO COLCHA",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 14,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1719322149",
                        NombreCompleto = "DIANA MAGALY SALDAÑA OBANDO",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 15,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "0503640997",
                        NombreCompleto = "CARMEN NASHALI GALARZA VASQUEZ",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 16,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1722380969",
                        NombreCompleto = "CHRISTIAN ALEXANDER FLORES ALVEAR",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 17,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1717591307",
                        NombreCompleto = "OLGA MERIDA ALVEAR PRADO",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 18,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "1723151781",
                        NombreCompleto = "DANIEL ISMAEL DURAN CALDERON",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 19,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "0802362574",
                        NombreCompleto = "CRISTHIAN ALEX VALENCIA ASTUDILLO",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 20,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    },
                    new dosier_domain.Curriculum.Entities.DocAutoridadCurricular
                    {
                        IdSigafi = "0604114280",
                        NombreCompleto = "EDISON ALBERTO AGREDA CUENCA",
                        CargoCurricular = "COORD_CARRERA",
                        IdCarrera = 21,
                        EsActivo = true,
                        FechaDesignacion = new DateOnly(2024, 1, 1)
                    }
                });
                await _context.SaveChangesAsync();
            }
        }        catch
        {
            // Ignorar de forma resiliente si la tabla aún no ha sido provisionada por los scripts iniciales
        }

        _rbacSeeded = true;
    }

    public async Task SynchronizeUserRolesAsync(User user)
    {
        var currentRoles = await _context.UserRoles
            .Include(ur => ur.Role)
            .Where(ur => ur.IdUsuario == user.IdUsuario && (ur.EsActivo ?? true))
            .ToListAsync();

        var requiredRoleCodes = new List<string>();

        // Reglas de negocio para roles automáticos (RBAC Declarativo)
        // Aislamiento estricto: Únicamente son administradores automáticos las identidades maestras declaradas en configuración
        var isDesignatedAdmin = (!string.IsNullOrEmpty(_superAdminCedula) && user.IdSigafi == _superAdminCedula) ||
                                (!string.IsNullOrEmpty(_masterAdminId) && user.IdSigafi == _masterAdminId);

        if (isDesignatedAdmin)
        {
            if (!user.Administrador)
            {
                user.Administrador = true;
                await _context.SaveChangesAsync();
            }
            if (!requiredRoleCodes.Contains("DOSIER_ADMIN"))
            {
                requiredRoleCodes.Add("DOSIER_ADMIN");
            }
        }
        else
        {
            // Para cualquier otro usuario, su bandera Administrador debe coincidir estrictamente con tener el rol DOSIER_ADMIN asignado en rbac_usuario_rol
            var hasActiveAdminRole = currentRoles.Any(r => r.Role.CodigoRol == "DOSIER_ADMIN");
            if (user.Administrador != hasActiveAdminRole)
            {
                user.Administrador = hasActiveAdminRole;
                await _context.SaveChangesAsync();
            }
        }


        if (user.TablaSigafi == "profesor")
        {
            if (!requiredRoleCodes.Contains("DOSIER_DOCENTE"))
            {
                requiredRoleCodes.Add("DOSIER_DOCENTE");
            }
        }

        // ── Designaciones Curriculares Institucionales (doc_autoridades_curriculares) ──
        if (!string.IsNullOrEmpty(user.IdSigafi))
        {
            List<string> designaciones = new();
            try
            {
                designaciones = await _context.DocAutoridadesCurriculares
                    .AsNoTracking()
                    .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo)
                    .Select(a => a.CargoCurricular)
                    .ToListAsync();
            }
            catch
            {
                designaciones = new();
            }

            foreach (var cargo in designaciones)
            {
                if (cargo == "VICERRECTOR" && !requiredRoleCodes.Contains("DOSIER_VICERRECTOR"))
                    requiredRoleCodes.Add("DOSIER_VICERRECTOR");
                else if (cargo == "COORD_ACADEMICO" && !requiredRoleCodes.Contains("DOSIER_COORD_ACAD"))
                    requiredRoleCodes.Add("DOSIER_COORD_ACAD");
                else if (cargo == "COORD_CARRERA" && !requiredRoleCodes.Contains("DOSIER_COORD_CARRERA"))
                    requiredRoleCodes.Add("DOSIER_COORD_CARRERA");
            }
        }

        foreach (var requiredRoleCode in requiredRoleCodes)
        {
            if (!currentRoles.Any(r => r.Role.CodigoRol == requiredRoleCode))
            {
                var role = await _context.Roles.FirstOrDefaultAsync(r => r.CodigoRol == requiredRoleCode);

                // Si el ROL no existe en la base de datos (tabla rbac_rol), lo CREAMOS automáticamente
                if (role == null)
                {
                    role = new Role
                    {
                        CodigoRol = requiredRoleCode,
                        Nombre = requiredRoleCode == "DOSIER_ADMIN" ? "Administrador DOSIER" :
                                 requiredRoleCode == "DOSIER_DOCENTE" ? "Docente" :
                                 requiredRoleCode == "DOSIER_COORD_CARRERA" ? "Coordinador de Carrera DOSIER" :
                                 requiredRoleCode == "DOSIER_COORD_ACAD" ? "Coordinación Académica DOSIER" :
                                 requiredRoleCode == "DOSIER_VICERRECTOR" ? "Vicerrectorado Académico DOSIER" : requiredRoleCode,
                        EsActivo = true
                    };
                    _context.Roles.Add(role);
                    await _context.SaveChangesAsync();

                    // Asignar permisos por defecto al nuevo rol (AISLAMIENTO DE SISTEMA)
                    await AssignDefaultPermissionsToRoleAsync(role);
                }

                // Ahora que el rol existe, lo asignamos al usuario
                _context.UserRoles.Add(new UserRole
                {
                    IdUsuario = user.IdUsuario,
                    IdRol = role.IdRol,
                    EsActivo = true,
                    FechaCreacion = DateOnly.FromDateTime(DateTime.Now)
                });
                await _context.SaveChangesAsync();
            }
        }
    }

    public async Task AssignDefaultPermissionsToRoleAsync(Role role)
    {
        // Obtener el IdSistema de DOSIER primero (no se puede usar await dentro de Where lambda)
        var dosierSistemaId = await _context.Systems
            .Where(s => s.Codigo == "DOSIER")
            .Select(s => s.IdSistema)
            .FirstOrDefaultAsync();

        // Obtener todas las operaciones de DOSIER
        var dosierOps = await _context.ModuleOperations
            .Include(mo => mo.Module)
            .Include(mo => mo.Operation)
            .Where(mo => mo.Module.IdSistema == dosierSistemaId)
            .ToListAsync();

        foreach (var op in dosierOps)
        {
            bool shouldAssign = false;
            var perm = $"{op.Module.Nombre}:{op.Operation.NombreOperacion}".ToUpper();

            if (role.CodigoRol == "DOSIER_ADMIN")
            {
                shouldAssign = true; // Admin tiene TODO de DOSIER
            }
            else if (role.CodigoRol == "DOSIER_DOCENTE")
            {
                if (perm == "PEA:VER" || perm == "PEA:CREAR" || perm == "PEA:EDITAR" || perm == "PEA:COWORK" || perm == "PEA:SUBSANAR" || perm == "PEA:EXPORTAR_PDF") shouldAssign = true;
                if (perm == "GOBERNANZA_CURRICULAR:VER") shouldAssign = true;
                if (perm == "CONFIGURACION:VER") shouldAssign = true;
            }
            else if (role.CodigoRol == "DOSIER_COORD_CARRERA")
            {
                if (perm == "PEA:VER" || perm == "PEA:OBSERVAR" || perm == "PEA:AVALAR_CARRERA" || perm == "PEA:EXPORTAR_PDF") shouldAssign = true;
                if (perm == "GOBERNANZA_CURRICULAR:VER" || perm == "GOBERNANZA_CURRICULAR:GESTIONAR") shouldAssign = true;
                if (perm == "AUDITORIA_CACES:REPORTES") shouldAssign = true;
                if (perm == "CONFIGURACION:VER") shouldAssign = true;
            }
            else if (role.CodigoRol == "DOSIER_COORD_ACAD")
            {
                if (perm == "PEA:VER" || perm == "PEA:OBSERVAR" || perm == "PEA:AVALAR_ACADEMICO" || perm == "PEA:EXPORTAR_PDF") shouldAssign = true;
                if (perm == "GOBERNANZA_CURRICULAR:VER" || perm == "GOBERNANZA_CURRICULAR:GESTIONAR") shouldAssign = true;
                if (perm == "AUDITORIA_CACES:VER-AUDITORIA" || perm == "AUDITORIA_CACES:REPORTES") shouldAssign = true;
                if (perm == "CONFIGURACION:VER") shouldAssign = true;
            }
            else if (role.CodigoRol == "DOSIER_VICERRECTOR")
            {
                if (perm == "PEA:VER" || perm == "PEA:OBSERVAR" || perm == "PEA:APROBAR" || perm == "PEA:EXPORTAR_PDF") shouldAssign = true;
                if (perm == "GOBERNANZA_CURRICULAR:VER" || perm == "GOBERNANZA_CURRICULAR:GESTIONAR") shouldAssign = true;
                if (perm == "AUDITORIA_CACES:VER-AUDITORIA" || perm == "AUDITORIA_CACES:REPORTES") shouldAssign = true;
                if (perm == "CONFIGURACION:VER" || perm == "CONFIGURACION:EDITAR") shouldAssign = true;
            }

            if (shouldAssign)
            {
                _context.RoleModuleOperations.Add(new RoleModuleOperation
                {
                    IdRol = role.IdRol,
                    IdModulosOperaciones = op.IdModulosOperaciones,
                    EsActivo = true,
                    FechaAsignacion = DateOnly.FromDateTime(DateTime.Now)
                });
            }
        }
        await _context.SaveChangesAsync();
    }
}

using Microsoft.AspNetCore.Authorization;

namespace dosier_infrastructure.Security;

/// <summary>
/// Requerimiento para validar un permiso específico de DOSIER
/// </summary>
public class PermissionRequirement : IAuthorizationRequirement
{
    public string Permission { get; }

    public PermissionRequirement(string permission)
    {
        Permission = permission;
    }
}

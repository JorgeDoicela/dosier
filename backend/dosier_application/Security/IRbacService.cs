using dosier_domain.Identity.Entities;

namespace dosier_application.Security;

public interface IRbacService
{
    Task SeedRbacStructureAsync();
    Task SynchronizeUserRolesAsync(User user);
    Task AssignDefaultPermissionsToRoleAsync(Role role);
}

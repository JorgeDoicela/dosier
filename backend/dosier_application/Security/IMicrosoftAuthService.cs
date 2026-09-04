using dosier_application.Security.DTOs;

namespace dosier_application.Security;

public interface IMicrosoftAuthService
{
    Task<AuthResponse?> LoginWithMicrosoftAsync(MicrosoftLoginRequest request);
}

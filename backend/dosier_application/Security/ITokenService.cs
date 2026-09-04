using dosier_application.Security.DTOs;

namespace dosier_application.Security;

public interface ITokenService
{
    string GenerateToken(AuthResponse user);
    string GenerateRefreshToken(string username);
}

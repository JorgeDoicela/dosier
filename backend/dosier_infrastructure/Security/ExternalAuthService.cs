using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.Security;

public interface IExternalAuthService
{
    Task<string> CreateAccessTokenAsync(int idReferencia, string tipoReferencia, string? scopes = null, int hoursValid = 24);
    Task<AccessToken?> ValidateTokenAsync(string token);
}

public class ExternalAuthService : IExternalAuthService
{
    private readonly DosierContext _context;

    public ExternalAuthService(DosierContext context)
    {
        _context = context;
    }

    public async Task<string> CreateAccessTokenAsync(int idReferencia, string tipoReferencia, string? scopes = null, int hoursValid = 24)
    {
        var token = Guid.NewGuid().ToString("N");
        var accessToken = new AccessToken
        {
            Token = token,
            IdReferencia = idReferencia,
            TipoReferencia = tipoReferencia,
            Scopes = scopes,
            FechaExpiracion = DateTime.Now.AddHours(hoursValid),
            Activo = true,
            UsosActuales = 0,
            MaxUsos = 1,
            Version = 1
        };

        _context.DocTokensAcceso.Add(accessToken);
        await _context.SaveChangesAsync();

        return token;
    }

    public async Task<AccessToken?> ValidateTokenAsync(string token)
    {
        var accessToken = await _context.DocTokensAcceso
            .FirstOrDefaultAsync(t => t.Token == token && t.Activo && t.UsosActuales < t.MaxUsos && (t.FechaExpiracion == null || t.FechaExpiracion > DateTime.Now));

        return accessToken;
    }

    public async Task<bool> MarkTokenAsUsedAsync(string token)
    {
        var accessToken = await _context.DocTokensAcceso.FirstOrDefaultAsync(t => t.Token == token);
        if (accessToken != null && accessToken.UsosActuales < accessToken.MaxUsos)
        {
            accessToken.UsosActuales++;
            await _context.SaveChangesAsync();
            return true;
        }
        return false;
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Http;
using dosier_domain.Identity.Entities;
using dosier_infrastructure.data.models;
using dosier_application.Security;
using dosier_application.Security.DTOs;
using dosier_application.Common.Notifications;
using Microsoft.Extensions.DependencyInjection;

namespace dosier_infrastructure.Security;

public class MagicLinkService : IMagicLinkService
{
    private readonly DosierContext _context;
    private readonly IConfiguration _configuration;
    private readonly IAuditService _auditService;
    private readonly dosier_application.Common.Notifications.INotificationService _notificationService;
    private readonly IServiceProvider _serviceProvider;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IPasswordService _passwordService;
    private readonly dosier_application.Common.IAppUrlService _appUrlService;
    
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (int Attempts, DateTime LockedUntil)> _ipLockouts = new();

    public MagicLinkService(
        DosierContext context,
        IConfiguration configuration,
        IAuditService auditService,
        dosier_application.Common.Notifications.INotificationService notificationService,
        IServiceProvider serviceProvider,
        IHttpContextAccessor httpContextAccessor,
        IPasswordService passwordService,
        dosier_application.Common.IAppUrlService appUrlService)
    {
        _context = context;
        _configuration = configuration;
        _auditService = auditService;
        _notificationService = notificationService;
        _serviceProvider = serviceProvider;
        _httpContextAccessor = httpContextAccessor;
        _passwordService = passwordService;
        _appUrlService = appUrlService;
    }

    private static int GetIpLockoutMinutes(int attempts) => attempts switch
    {
        >= 12 => 60,
        >= 9  => 30,
        >= 6  => 15,
        _     => 5
    };

    public async Task<string> CreateMagicLinkAsync(int idUsuario, DateTime expirationDate)
    {
        // Generar token aleatorio criptográficamente seguro
        var tokenBytes = new byte[32];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(tokenBytes);
        }
        var plainToken = Convert.ToHexString(tokenBytes);

        // Calcular Hash SHA-256
        var tokenHashBytes = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(plainToken));
        var tokenHash = Convert.ToHexString(tokenHashBytes);

        // Guardar en doc_magic_links
        var magicLink = new DocMagicLink
        {
            IdUsuario = idUsuario,
            TokenHash = tokenHash,
            FechaCreacion = DateTime.Now,
            FechaExpiracion = expirationDate,
            Utilizado = false
        };

        _context.Set<DocMagicLink>().Add(magicLink);
        await _context.SaveChangesAsync();

        return plainToken;
    }

    public async Task<MagicLoginResponseDto?> ValidateAndConsumeMagicLinkAsync(string tokenHash, string? ipAddress, string? userAgent)
    {
        var magicLink = await _context.Set<DocMagicLink>()
            .FirstOrDefaultAsync(l => l.TokenHash == tokenHash && !l.Utilizado && l.FechaExpiracion > DateTime.Now);

        if (magicLink == null) return null;

        // Auditoría del último acceso (sin marcar como utilizado definitivamente)
        magicLink.FechaUtilizado = DateTime.Now;
        magicLink.IpUtilizacion = ipAddress;
        magicLink.UserAgent = userAgent;

        // Generar un PIN nuevo en cada uso — de 5 caracteres
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I para evitar confusiones
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        var bytes = new byte[5];
        rng.GetBytes(bytes);
        var pin = new string(bytes.Select(b => chars[b % chars.Length]).ToArray());
        magicLink.CodigoPinHandoff = pin;
        magicLink.FechaExpiracionPin = DateTime.Now.AddMinutes(30);

        await _context.SaveChangesAsync();

        // Obtener el AuthService de forma diferida para obtener los roles y armar el AuthResponse final
        // Esto evita dependencias circulares directas en constructor
        using var scope = _serviceProvider.CreateScope();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        var authResponse = await authService.GetAuthResponseForUserByIdAsync(magicLink.IdUsuario);
        if (authResponse == null) return null;

        return new MagicLoginResponseDto
        {
            Auth = authResponse,
            Pin = pin
        };
    }

    public async Task<AuthResponse?> ValidateAndConsumeHandoffPinAsync(string pin, string? ipAddress)
    {
        // ── 1. Verificar bloqueo por IP ──────────────────────────────────────────
        if (!string.IsNullOrEmpty(ipAddress))
        {
            if (_ipLockouts.TryGetValue(ipAddress, out var lockout))
            {
                if (lockout.LockedUntil > DateTime.Now)
                {
                    var secondsLeft = (int)(lockout.LockedUntil - DateTime.Now).TotalSeconds;
                    throw new IpLockoutException($"Demasiados intentos fallidos. Esta dirección IP está bloqueada por {GetIpLockoutMinutes(lockout.Attempts)} minutos.", secondsLeft);
                }
            }
        }

        var magicLink = await _context.Set<DocMagicLink>()
            .FirstOrDefaultAsync(l => l.CodigoPinHandoff == pin && l.FechaExpiracionPin > DateTime.Now);

        if (magicLink == null)
        {
            // Incrementar contador de fallos por IP
            if (!string.IsNullOrEmpty(ipAddress))
            {
                _ipLockouts.AddOrUpdate(ipAddress,
                    (Attempts: 1, LockedUntil: DateTime.MinValue),
                    (key, old) =>
                    {
                        var newAttempts = old.Attempts + 1;
                        DateTime lockedUntil = DateTime.MinValue;
                        if (newAttempts >= 3)
                        {
                            int minutes = GetIpLockoutMinutes(newAttempts);
                            lockedUntil = DateTime.Now.AddMinutes(minutes);
                        }
                        return (newAttempts, lockedUntil);
                    });

                if (_ipLockouts.TryGetValue(ipAddress, out var updatedLockout) && updatedLockout.LockedUntil > DateTime.Now)
                {
                    var secondsLeft = (int)(updatedLockout.LockedUntil - DateTime.Now).TotalSeconds;
                    throw new IpLockoutException($"Demasiados intentos fallidos de PIN. Esta dirección IP ha sido bloqueada por {GetIpLockoutMinutes(updatedLockout.Attempts)} minutos.", secondsLeft);
                }
            }
            return null;
        }

        // ── 2. Limpiar bloqueo e intentos en caso de éxito ─────────────────────────
        if (!string.IsNullOrEmpty(ipAddress))
        {
            _ipLockouts.TryRemove(ipAddress, out _);
        }

        // Clear pin to make it one-time use
        magicLink.CodigoPinHandoff = null;
        magicLink.FechaExpiracionPin = null;

        // Audit/log IP
        magicLink.IpUtilizacion = ipAddress;

        await _context.SaveChangesAsync();

        using var scope = _serviceProvider.CreateScope();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
        return await authService.GetAuthResponseForUserByIdAsync(magicLink.IdUsuario);
    }

    public async Task<bool> ResendMagicLinkAsync(string email)
    {
        email = email.Trim().ToLower();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Activo &&
                ((u.EmailInstitucional != null && u.EmailInstitucional.ToLower() == email) ||
                 (u.IdSigafi != null && u.IdSigafi.ToLower() == email)));

        if (user == null) return false;

        var expirationDate = DateTime.UtcNow.AddDays(7);
        var plainToken = await CreateMagicLinkAsync(user.IdUsuario, expirationDate);
        var magicLinkUrl = _appUrlService.BuildFrontendUrl($"/auth/magic-login?token={plainToken}");

        await _notificationService.NotifyUserAsync(
            user.IdUsuario,
            "Enlace de Acceso Seguro - DOSIER",
            $"<p>Usted ha solicitado un enlace de acceso seguro a la plataforma DOSIER.</p><p>Acceso válido hasta: {expirationDate:dd/MM/yyyy}</p>",
            "AUTENTICACION",
            magicLinkUrl
        );

        return true;
    }
}

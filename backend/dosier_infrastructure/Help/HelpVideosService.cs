using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using dosier_application.Help;
using dosier_application.Help.DTOs;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Help;

public sealed class HelpVideosService : IHelpVideosService
{
    public const string ConfigKeyPrefix = "Help.Videos.";
    private const long MaxVideoBytes = 80L * 1024L * 1024L;

    private static readonly HashSet<string> AllowedVideoExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".mp4", ".webm", ".ogg", ".m4v", ".mov"
    };

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    private readonly DosierContext _context;
    private readonly IConfiguration _configuration;

    public HelpVideosService(DosierContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<IReadOnlyList<HelpVideoDto>> GetVideosByRouteAsync(
        string routeKey,
        IReadOnlyCollection<string>? callerRoles = null,
        CancellationToken ct = default)
    {
        var normalizedRoute = NormalizeRouteKey(routeKey);
        if (string.IsNullOrEmpty(normalizedRoute))
            return Array.Empty<HelpVideoDto>();

        var configKey = BuildConfigKey(normalizedRoute);
        var entry = await _context.DocConfigsGenerales
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Clave == configKey, ct);

        if (entry == null || string.IsNullOrWhiteSpace(entry.Valor))
            return Array.Empty<HelpVideoDto>();

        var items = DeserializeList(entry.Valor, normalizedRoute);

        if (callerRoles != null && callerRoles.Count > 0)
        {
            var roleSet = new HashSet<string>(
                callerRoles.Where(r => !string.IsNullOrWhiteSpace(r)).Select(r => r.Trim().ToLowerInvariant()),
                StringComparer.OrdinalIgnoreCase);

            var isAdmin = roleSet.Contains("admin") || roleSet.Contains("dosier_admin") || roleSet.Contains("administrador");
            if (!isAdmin)
            {
                items = items.Where(v =>
                    v.Roles == null ||
                    v.Roles.Count == 0 ||
                    v.Roles.Any(r =>
                        r.Equals("todos", StringComparison.OrdinalIgnoreCase) ||
                        roleSet.Contains(r.Trim().ToLowerInvariant())))
                    .ToList();
            }
        }

        return items.OrderBy(v => v.Order).ThenBy(v => v.CreatedAt).ToList();
    }

    public async Task<IReadOnlyList<HelpVideoDto>> GetAllVideosAsync(CancellationToken ct = default)
    {
        var entries = await _context.DocConfigsGenerales
            .AsNoTracking()
            .Where(c => c.Clave.StartsWith(ConfigKeyPrefix))
            .ToListAsync(ct);

        var all = new List<HelpVideoDto>();
        foreach (var entry in entries)
        {
            var route = entry.Clave.Length > ConfigKeyPrefix.Length
                ? entry.Clave.Substring(ConfigKeyPrefix.Length)
                : "/";
            all.AddRange(DeserializeList(entry.Valor, route));
        }

        return all
            .OrderBy(v => v.RouteKey, StringComparer.OrdinalIgnoreCase)
            .ThenBy(v => v.Order)
            .ThenBy(v => v.CreatedAt)
            .ToList();
    }

    public async Task<HelpVideoDto> AddVideoAsync(
        CreateHelpVideoRequest request,
        CancellationToken ct = default)
    {
        var normalizedRoute = NormalizeRouteKey(request.RouteKey);
        if (string.IsNullOrEmpty(normalizedRoute))
            throw new InvalidOperationException("La ruta del módulo es obligatoria.");

        var title = (request.Title ?? string.Empty).Trim();
        if (string.IsNullOrEmpty(title))
            throw new InvalidOperationException("El título del video es obligatorio.");

        var configKey = BuildConfigKey(normalizedRoute);
        if (configKey.Length > 100)
            throw new InvalidOperationException("La ruta del módulo excede la longitud permitida (100 caracteres).");

        string finalUrl;
        bool isUploaded = false;
        string? savedFileName = null;

        if (request.Archivo != null && request.Archivo.Length > 0)
        {
            if (request.Archivo.Length > MaxVideoBytes)
                throw new InvalidOperationException("El video supera el tamaño máximo permitido de 80 MB.");

            var ext = Path.GetExtension(request.Archivo.FileName)?.ToLowerInvariant() ?? string.Empty;
            if (!AllowedVideoExtensions.Contains(ext))
                throw new InvalidOperationException("Formato de video no soportado. Usa MP4, WebM, OGG, M4V o MOV.");

            var uploadDir = EnsureUploadsDirectory();
            savedFileName = $"help_{Guid.NewGuid():N}{ext}";
            var destPath = Path.Combine(uploadDir, savedFileName);

            await using (var fs = new FileStream(destPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
            {
                await request.Archivo.Stream.CopyToAsync(fs, ct);
            }

            isUploaded = true;
            finalUrl = $"/api/help/videos/media/{savedFileName}";
        }
        else
        {
            var trimmedUrl = (request.Url ?? string.Empty).Trim();
            if (!IsValidExternalOrRelativeUrl(trimmedUrl))
                throw new InvalidOperationException("Debes subir un archivo de video o ingresar una URL válida (http/https).");

            finalUrl = trimmedUrl;
        }

        var entry = await _context.DocConfigsGenerales
            .FirstOrDefaultAsync(c => c.Clave == configKey, ct);

        var list = entry != null
            ? DeserializeList(entry.Valor, normalizedRoute)
            : new List<HelpVideoDto>();

        var nextOrder = list.Count == 0 ? 1 : list.Max(v => v.Order) + 1;
        var normalizedRoles = (request.Roles ?? new List<string>())
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim().ToLowerInvariant())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var newVideo = new HelpVideoDto
        {
            Id = Guid.NewGuid().ToString("N")[..12],
            RouteKey = normalizedRoute,
            Title = title,
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            Duration = string.IsNullOrWhiteSpace(request.Duration) ? null : request.Duration.Trim(),
            Url = finalUrl,
            IsUploadedFile = isUploaded,
            FileName = savedFileName,
            Roles = normalizedRoles,
            Order = nextOrder,
            CreatedAt = DateTime.UtcNow
        };

        list.Add(newVideo);
        var serialized = JsonSerializer.Serialize(list, JsonOptions);

        if (entry == null)
        {
            _context.DocConfigsGenerales.Add(new DocConfigGeneral
            {
                Clave = configKey,
                Valor = serialized,
                Descripcion = $"Videos tutoriales para {normalizedRoute}"
            });
        }
        else
        {
            entry.Valor = serialized;
        }

        await _context.SaveChangesAsync(ct);
        return newVideo;
    }

    public async Task<HelpVideoDto?> UpdateVideoAsync(
        string routeKey,
        string videoId,
        UpdateHelpVideoRequest request,
        CancellationToken ct = default)
    {
        var normalizedRoute = NormalizeRouteKey(routeKey);
        if (string.IsNullOrEmpty(normalizedRoute) || string.IsNullOrWhiteSpace(videoId))
            return null;

        var title = (request.Title ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(title))
            throw new InvalidOperationException("El título del video es obligatorio.");

        var configKey = BuildConfigKey(normalizedRoute);
        var entry = await _context.DocConfigsGenerales
            .FirstOrDefaultAsync(c => c.Clave == configKey, ct);

        if (entry == null)
            return null;

        var list = DeserializeList(entry.Valor, normalizedRoute);
        var target = list.FirstOrDefault(v => string.Equals(v.Id, videoId.Trim(), StringComparison.OrdinalIgnoreCase));
        if (target == null)
            return null;

        target.Title = title;
        target.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        target.Duration = string.IsNullOrWhiteSpace(request.Duration) ? null : request.Duration.Trim();
        target.Roles = (request.Roles ?? new List<string>())
            .Where(r => !string.IsNullOrWhiteSpace(r))
            .Select(r => r.Trim().ToLowerInvariant())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (!target.IsUploadedFile && request.Url != null)
        {
            var trimmedUrl = request.Url.Trim();
            if (!IsValidExternalOrRelativeUrl(trimmedUrl))
                throw new InvalidOperationException("La URL del video no es válida (debe ser http/https).");
            target.Url = trimmedUrl;
        }

        entry.Valor = JsonSerializer.Serialize(list, JsonOptions);
        await _context.SaveChangesAsync(ct);
        return target;
    }

    public async Task<IReadOnlyList<HelpVideoDto>> ReorderVideosAsync(
        string routeKey,
        IReadOnlyList<string> orderedIds,
        CancellationToken ct = default)
    {
        var normalizedRoute = NormalizeRouteKey(routeKey);
        if (string.IsNullOrEmpty(normalizedRoute))
            return Array.Empty<HelpVideoDto>();

        var configKey = BuildConfigKey(normalizedRoute);
        var entry = await _context.DocConfigsGenerales
            .FirstOrDefaultAsync(c => c.Clave == configKey, ct);

        if (entry == null)
            return Array.Empty<HelpVideoDto>();

        var list = DeserializeList(entry.Valor, normalizedRoute);
        if (list.Count == 0)
            return Array.Empty<HelpVideoDto>();

        var byId = list.ToDictionary(v => v.Id, StringComparer.OrdinalIgnoreCase);
        var reordered = new List<HelpVideoDto>(list.Count);
        var added = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        if (orderedIds != null)
        {
            foreach (var rawId in orderedIds)
            {
                var cleanId = (rawId ?? string.Empty).Trim();
                if (byId.TryGetValue(cleanId, out var item) && added.Add(item.Id))
                {
                    reordered.Add(item);
                }
            }
        }

        foreach (var item in list)
        {
            if (added.Add(item.Id))
            {
                reordered.Add(item);
            }
        }

        for (var i = 0; i < reordered.Count; i++)
        {
            reordered[i].Order = i + 1;
        }

        entry.Valor = JsonSerializer.Serialize(reordered, JsonOptions);
        await _context.SaveChangesAsync(ct);
        return reordered;
    }

    public async Task<bool> DeleteVideoAsync(
        string routeKey,
        string videoId,
        CancellationToken ct = default)
    {
        var normalizedRoute = NormalizeRouteKey(routeKey);
        if (string.IsNullOrEmpty(normalizedRoute) || string.IsNullOrWhiteSpace(videoId))
            return false;

        var configKey = BuildConfigKey(normalizedRoute);
        var entry = await _context.DocConfigsGenerales
            .FirstOrDefaultAsync(c => c.Clave == configKey, ct);

        if (entry == null)
            return false;

        var list = DeserializeList(entry.Valor, normalizedRoute);
        var target = list.FirstOrDefault(v => string.Equals(v.Id, videoId.Trim(), StringComparison.OrdinalIgnoreCase));
        if (target == null)
            return false;

        list.Remove(target);

        if (list.Count == 0)
        {
            _context.DocConfigsGenerales.Remove(entry);
        }
        else
        {
            entry.Valor = JsonSerializer.Serialize(list, JsonOptions);
        }

        await _context.SaveChangesAsync(ct);

        if (target.IsUploadedFile && !string.IsNullOrWhiteSpace(target.FileName))
        {
            var filePath = ResolveUploadedVideoPath(target.FileName);
            if (filePath != null && File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }

        return true;
    }

    public string? ResolveUploadedVideoPath(string fileName)
    {
        var safeFileName = Path.GetFileName(fileName ?? string.Empty);
        if (string.IsNullOrWhiteSpace(safeFileName))
            return null;

        foreach (var root in GetCandidateUploadRoots())
        {
            var candidate = Path.Combine(root, "uploads", "help-videos", safeFileName);
            if (File.Exists(candidate))
            {
                return Path.GetFullPath(candidate);
            }
        }

        return null;
    }

    private string EnsureUploadsDirectory()
    {
        var root = GetCandidateUploadRoots().First();
        var dir = Path.Combine(root, "uploads", "help-videos");
        Directory.CreateDirectory(dir);
        return dir;
    }

    private IEnumerable<string> GetCandidateUploadRoots()
    {
        var roots = new List<string>();
        var configured = _configuration["Support:UploadsRootPath"];
        if (!string.IsNullOrWhiteSpace(configured))
        {
            roots.Add(configured.Trim());
        }

        roots.Add(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"));
        roots.Add(Directory.GetCurrentDirectory());
        roots.Add(Path.Combine(AppContext.BaseDirectory, "wwwroot"));
        roots.Add(AppContext.BaseDirectory);

        return roots.Distinct(StringComparer.OrdinalIgnoreCase);
    }

    private static string NormalizeRouteKey(string? routeKey)
    {
        if (string.IsNullOrWhiteSpace(routeKey)) return string.Empty;
        var clean = routeKey.Trim().Split('?')[0].Split('#')[0].TrimEnd('/');
        if (string.IsNullOrEmpty(clean)) return "/";
        return clean.StartsWith('/') ? clean : $"/{clean}";
    }

    private static string BuildConfigKey(string normalizedRoute) => $"{ConfigKeyPrefix}{normalizedRoute}";

    private static bool IsValidExternalOrRelativeUrl(string url)
    {
        if (string.IsNullOrWhiteSpace(url)) return false;
        if (url.StartsWith('/') && !url.StartsWith("//")) return true;
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)) return false;
        return uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps;
    }

    private static List<HelpVideoDto> DeserializeList(string? json, string routeKey)
    {
        if (string.IsNullOrWhiteSpace(json))
            return new List<HelpVideoDto>();

        try
        {
            var items = JsonSerializer.Deserialize<List<HelpVideoDto>>(json, JsonOptions) ?? new List<HelpVideoDto>();
            foreach (var item in items)
            {
                if (string.IsNullOrWhiteSpace(item.RouteKey))
                {
                    item.RouteKey = routeKey;
                }
            }
            return items;
        }
        catch (JsonException)
        {
            return new List<HelpVideoDto>();
        }
    }
}

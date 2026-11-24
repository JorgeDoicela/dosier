using System.Text.Json;
using dosier_application.Signatures;
using dosier_domain.Signatures;
using dosier_infrastructure.data.models;
using Dosier.Infrastructure.Common.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace dosier_infrastructure.Signatures.Subservices;

public class SignatureProfileSubservice : ISignatureProfileSubservice
{
    private readonly DosierContext _context;
    private readonly IFileStorageService _storageService;
    private readonly ILogger<SignatureProfileSubservice> _logger;

    public SignatureProfileSubservice(
        DosierContext context,
        IFileStorageService storageService,
        ILogger<SignatureProfileSubservice> logger)
    {
        _context = context;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<UserSignatureProfileDto?> GetProfileAsync(int idUsuario)
    {
        var perfil = await _context.DocUserSignaturePerfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        UserSignatureProfileDto? dto = null;
        if (perfil != null)
        {
            dto = await MapToProfileDtoAsync(perfil);
            if (!string.IsNullOrWhiteSpace(dto.Cargo) && !string.IsNullOrWhiteSpace(dto.Departamento))
            {
                return dto;
            }
        }

        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.IdUsuario == idUsuario);

        if (user == null) return dto;

        string? cargoAuto = dto?.Cargo;
        string? deptoAuto = dto?.Departamento;

        // Inferencia inteligente de Cargo y Departamento por Autoridad Curricular oficial o Contrato
        if (!string.IsNullOrEmpty(user.IdSigafi) && (string.IsNullOrWhiteSpace(cargoAuto) || string.IsNullOrWhiteSpace(deptoAuto)))
        {
            var autoridad = await _context.DocAutoridadesCurriculares
                .AsNoTracking()
                .Where(a => a.IdSigafi == user.IdSigafi && a.EsActivo)
                .OrderByDescending(a => a.CargoCurricular == "VICERRECTOR")
                .ThenByDescending(a => a.CargoCurricular == "COORD_ACADEMICO")
                .ThenByDescending(a => a.CargoCurricular == "COORD_CARRERA")
                .FirstOrDefaultAsync();

            if (autoridad != null)
            {
                if (autoridad.CargoCurricular == "VICERRECTOR")
                {
                    cargoAuto ??= "Vicerrector Académico";
                    deptoAuto ??= "Vicerrectorado";
                }
                else if (autoridad.CargoCurricular == "COORD_ACADEMICO")
                {
                    cargoAuto ??= "Coordinador Académico";
                    deptoAuto ??= "Coordinación Académica";
                }
                else if (autoridad.CargoCurricular == "COORD_CARRERA")
                {
                    cargoAuto ??= "Coordinador de Carrera";
                    if (autoridad.IdCarrera.HasValue)
                    {
                        var carrera = await _context.Carreras
                            .AsNoTracking()
                            .FirstOrDefaultAsync(c => c.IdCarrera == autoridad.IdCarrera.Value);
                        if (carrera != null && !string.IsNullOrWhiteSpace(carrera.Carrera1))
                        {
                            deptoAuto ??= carrera.Carrera1;
                        }
                    }
                    deptoAuto ??= "Coordinación de Carrera";
                }
            }
        }

        if (user.TablaSigafi == "profesor" && !string.IsNullOrEmpty(user.IdSigafi))
        {
            if (string.IsNullOrWhiteSpace(cargoAuto) || string.IsNullOrWhiteSpace(deptoAuto))
            {
                var contrato = await _context.Contratos
                    .Include(c => c.DepartamentoNavigation)
                    .Include(c => c.CargoInstitutoNavigation)
                    .AsNoTracking()
                    .Where(c => c.IdProfesor == user.IdSigafi && (c.EsActivo == 1 || c.EsActivo == null))
                    .OrderByDescending(c => c.DepartamentoNavigation != null && (c.DepartamentoNavigation.NombreDepartamento == "DOCENCIA" || c.DepartamentoNavigation.NombreDepartamento == "ACADEMIA"))
                    .ThenByDescending(c => c.CargoInstitutoNavigation != null && c.CargoInstitutoNavigation.Nombre != null && (c.CargoInstitutoNavigation.Nombre.ToLower().Contains("profesor") || c.CargoInstitutoNavigation.Nombre.ToLower().Contains("docente")))
                    .ThenByDescending(c => c.EsActivo == 1)
                    .ThenByDescending(c => c.IdContrato)
                    .FirstOrDefaultAsync();

                if (contrato != null)
                {
                    if (string.IsNullOrWhiteSpace(cargoAuto))
                        cargoAuto = contrato.CargoInstitutoNavigation?.Nombre ?? "Docente Titular";

                    if (string.IsNullOrWhiteSpace(deptoAuto))
                        deptoAuto = contrato.DepartamentoNavigation?.NombreDepartamento ?? "Docencia";
                }
            }
        }
        else if (user.TablaSigafi == "alumno" && !string.IsNullOrEmpty(user.IdSigafi))
        {
            if (string.IsNullOrWhiteSpace(cargoAuto))
                cargoAuto = "Estudiante";

            if (string.IsNullOrWhiteSpace(deptoAuto))
            {
                var alumCarrera = await _context.AlumnosCarreras
                    .AsNoTracking()
                    .FirstOrDefaultAsync(ac => ac.IdAlumno == user.IdSigafi);

                if (alumCarrera != null)
                {
                    var carrera = await _context.Carreras
                        .AsNoTracking()
                        .FirstOrDefaultAsync(c => c.IdCarrera == alumCarrera.IdCarrera);

                    deptoAuto = carrera?.Carrera1;
                }
            }
        }

        string? iniciales = dto?.Iniciales;
        if (string.IsNullOrWhiteSpace(iniciales) && !string.IsNullOrWhiteSpace(user.Nombre))
        {
            var parts = user.Nombre.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            iniciales = string.Concat(parts.Take(2).Select(p => char.ToUpper(p[0])));
        }

        return new UserSignatureProfileDto
        {
            IdUsuario = idUsuario,
            EsConfigurado = dto?.EsConfigurado ?? false,
            FirmaImagenB64 = dto?.FirmaImagenB64,
            Iniciales = iniciales,
            Cargo = cargoAuto,
            Departamento = deptoAuto,
            TipoSello = dto?.TipoSello ?? "completo",
            ActualizadoEn = dto?.ActualizadoEn ?? DateTime.UtcNow
        };
    }

    public async Task<UserSignatureProfileDto> UpsertProfileAsync(int idUsuario, UpdateSignatureProfileDto dto)
    {
        const int MaxBase64Length = 307_200; // 300 KB
        string? firmaPath = null;

        if (!string.IsNullOrWhiteSpace(dto.FirmaImagenB64))
        {
            var rawB64 = dto.FirmaImagenB64.Contains(',')
                ? dto.FirmaImagenB64.Split(',')[1]
                : dto.FirmaImagenB64;

            if (rawB64.Length > MaxBase64Length)
                throw new ArgumentException(
                    "La imagen de firma excede el tamaño máximo permitido (300 KB). " +
                    "Reduzca la resolución o use la función de recorte antes de guardar.");

            try
            {
                var imageBytes = Convert.FromBase64String(rawB64);
                firmaPath = await _storageService.SaveFileAsync($"firma_{idUsuario}.png", imageBytes, "signatures");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[DOSIER Firma] Error al guardar archivo de firma de usuario {IdUsuario}", idUsuario);
                throw new InvalidOperationException("No se pudo almacenar la imagen de la firma. Intente nuevamente.");
            }
        }

        var perfil = await _context.DocUserSignaturePerfiles
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        bool isNew = perfil is null;

        if (isNew)
        {
            perfil = new DocUserSignaturePerfil
            {
                Uuid = Guid.NewGuid().ToString(),
                IdUsuario = idUsuario,
                CreadoEn = DateTime.UtcNow,
            };
            _context.DocUserSignaturePerfiles.Add(perfil);
        }

        if (!isNew && !string.IsNullOrWhiteSpace(perfil!.FirmaImagenB64)
            && !perfil.FirmaImagenB64.StartsWith("data:image/")
            && perfil.FirmaImagenB64.Length <= 512)
        {
            try
            {
                await _storageService.DeleteFileAsync(perfil.FirmaImagenB64);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "[DOSIER Firma] No se pudo eliminar la firma antigua en {Path}", perfil.FirmaImagenB64);
            }
        }

        perfil!.FirmaImagenB64 = firmaPath;
        perfil.Iniciales = dto.Iniciales?.Trim().ToUpper();
        perfil.Cargo = dto.Cargo?.Trim();
        perfil.Departamento = dto.Departamento?.Trim();
        if (!string.IsNullOrWhiteSpace(dto.TipoSello))
        {
            var cleanTipo = dto.TipoSello.Trim().ToLowerInvariant();
            perfil.TipoSello = cleanTipo switch
            {
                "solo_sello" or "sello_sin_firma" => "solo_sello",
                "sello_y_firma" or "sello_institucional" or "sello_vectorial" or "sello_oficial" => "sello_y_firma",
                "solo_firma" or "firma" or "trazo" => "solo_firma",
                _ => "completo"
            };
        }
        var finalFirmaPath = firmaPath ?? perfil.FirmaImagenB64;
        perfil.FirmaImagenB64 = finalFirmaPath;
        bool firmaRequerida = perfil.TipoSello != "solo_sello";
        perfil.EsConfigurado = !string.IsNullOrWhiteSpace(dto.Cargo)
                              && !string.IsNullOrWhiteSpace(dto.Departamento)
                              && (!firmaRequerida || !string.IsNullOrWhiteSpace(finalFirmaPath));
        perfil.ActualizadoEn = DateTime.UtcNow;

        var audit = new DocLopdpAuditoriaDatos
        {
            Uuid = Guid.NewGuid(),
            IdUsuarioActor = idUsuario,
            IdUsuarioAfectado = idUsuario,
            TablaAfectada = "doc_user_signature_profiles",
            ColumnaAfectada = "firma_imagen_b64",
            Operacion = "ESCRITURA",
            Motivo = isNew ? "Creación de perfil de firma institucional." : "Actualización de perfil de firma institucional.",
            FechaAcceso = DateTime.UtcNow
        };
        _context.DocLopdpAuditoriaDatos.Add(audit);

        await _context.SaveChangesAsync();

        _logger.LogInformation("[DOSIER Firma] Perfil de firma actualizado para usuario {Id}", idUsuario);
        return await MapToProfileDtoAsync(perfil);
    }

    private async Task<UserSignatureProfileDto> MapToProfileDtoAsync(DocUserSignaturePerfil p) => new()
    {
        IdUsuario = p.IdUsuario,
        EsConfigurado = p.EsConfigurado,
        FirmaImagenB64 = await GetFirmaBase64Async(p.FirmaImagenB64),
        Iniciales = p.Iniciales,
        Cargo = p.Cargo,
        Departamento = p.Departamento,
        TipoSello = string.IsNullOrWhiteSpace(p.TipoSello) ? "completo" : p.TipoSello,
        ActualizadoEn = p.ActualizadoEn,
    };

    private async Task<string?> GetFirmaBase64Async(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        try
        {
            if (path.StartsWith("data:image/") || path.Length > 512)
            {
                return path;
            }

            var bytes = await _storageService.GetFileAsync(path);
            return $"data:image/png;base64,{Convert.ToBase64String(bytes)}";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "[DOSIER Firma] No se pudo leer el archivo de firma desde {Path}", path);
            return null;
        }
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using dosier_application.Security;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Security
{
    public class BackupAdminService : IBackupAdminService
    {
        private readonly DosierContext _context;
        private readonly IConfiguration _configuration;

        public BackupAdminService(DosierContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private string GetBackupDestinationPath()
        {
            var destFolder = _configuration["BackupSettings:DestinationFolder"] ?? "backups";
            var rootDir = Directory.GetCurrentDirectory();
            return Path.GetFullPath(Path.Combine(rootDir, destFolder));
        }

        public async Task<List<BackupLogDto>> GetBackupLogsAsync()
        {
            var destAbsPath = GetBackupDestinationPath();

            var logs = await _context.DocBackupLogs
                .AsNoTracking()
                .OrderByDescending(l => l.FechaBackup)
                .ToListAsync();

            return logs.Select(l => new BackupLogDto
            {
                IdBackup = l.IdBackup,
                Uuid = l.Uuid,
                FechaBackup = l.FechaBackup,
                Tipo = l.Tipo,
                Destino = l.Destino,
                NombreArchivo = l.NombreArchivo,
                TamanioBytes = l.TamanioBytes,
                Estado = l.Estado,
                HashVerificacion = l.HashVerificacion,
                ErrorMensaje = l.ErrorMensaje,
                IsFilePresent = !string.IsNullOrEmpty(l.NombreArchivo) && File.Exists(Path.Combine(destAbsPath, l.NombreArchivo))
            }).ToList();
        }

        public DiskInfoDto GetDiskInfo()
        {
            var destAbsPath = GetBackupDestinationPath();
            var driveRoot = Path.GetPathRoot(destAbsPath) ?? "C:\\";
            var drive = new DriveInfo(driveRoot);

            long totalSpace = drive.TotalSize;
            long freeSpace = drive.AvailableFreeSpace;
            long usedSpace = totalSpace - freeSpace;
            double usedPercentage = totalSpace > 0 ? Math.Round((double)usedSpace / totalSpace * 100, 1) : 0;

            return new DiskInfoDto
            {
                DriveName = drive.Name,
                DriveFormat = drive.DriveFormat,
                TotalSizeBytes = totalSpace,
                FreeSizeBytes = freeSpace,
                UsedSizeBytes = usedSpace,
                UsedPercentage = usedPercentage
            };
        }

        public async Task<(string? FilePath, string? FileName)> GetBackupFileForDownloadAsync(Guid uuid)
        {
            var log = await _context.DocBackupLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Uuid == uuid);
            if (log == null || string.IsNullOrEmpty(log.NombreArchivo))
            {
                return (null, null);
            }

            var destAbsPath = GetBackupDestinationPath();
            var filePath = Path.Combine(destAbsPath, log.NombreArchivo);

            if (!File.Exists(filePath))
            {
                return (null, log.NombreArchivo);
            }

            return (filePath, log.NombreArchivo);
        }

        public async Task<BackupVerifyResultDto> VerifyBackupIntegrityAsync(Guid uuid)
        {
            var log = await _context.DocBackupLogs.AsNoTracking().FirstOrDefaultAsync(l => l.Uuid == uuid);
            if (log == null || string.IsNullOrEmpty(log.NombreArchivo))
            {
                return new BackupVerifyResultDto
                {
                    Success = false,
                    Message = "Registro de respaldo no encontrado."
                };
            }

            var destAbsPath = GetBackupDestinationPath();
            var filePath = Path.Combine(destAbsPath, log.NombreArchivo);

            if (!File.Exists(filePath))
            {
                return new BackupVerifyResultDto
                {
                    Success = false,
                    IsMatch = false,
                    Message = "El archivo físico ya no existe en el disco del servidor."
                };
            }

            using var sha256 = SHA256.Create();
            using var stream = File.OpenRead(filePath);
            var hashBytes = await sha256.ComputeHashAsync(stream);
            var currentHash = BitConverter.ToString(hashBytes).Replace("-", "").ToLowerInvariant();

            var recordedHash = log.HashVerificacion?.ToLowerInvariant();
            bool isMatch = !string.IsNullOrEmpty(recordedHash) && recordedHash == currentHash;

            return new BackupVerifyResultDto
            {
                Success = true,
                IsMatch = isMatch,
                CurrentHash = currentHash,
                RecordedHash = recordedHash,
                Message = isMatch
                    ? "Integridad del archivo confirmada. El checksum SHA-256 coincide con el registro original."
                    : "¡Advertencia! El hash SHA-256 difiere del registro grabado al momento de la creación."
            };
        }

        public async Task<bool> PurgeBackupAsync(Guid uuid)
        {
            var log = await _context.DocBackupLogs.FirstOrDefaultAsync(l => l.Uuid == uuid);
            if (log == null) return false;

            var destAbsPath = GetBackupDestinationPath();
            if (!string.IsNullOrEmpty(log.NombreArchivo))
            {
                var filePath = Path.Combine(destAbsPath, log.NombreArchivo);
                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                }
            }

            _context.DocBackupLogs.Remove(log);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}

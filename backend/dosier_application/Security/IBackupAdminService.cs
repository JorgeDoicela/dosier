using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace dosier_application.Security
{
    public class BackupLogDto
    {
        public int IdBackup { get; set; }
        public Guid Uuid { get; set; }
        public DateTime FechaBackup { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Destino { get; set; } = string.Empty;
        public string? NombreArchivo { get; set; }
        public long? TamanioBytes { get; set; }
        public string Estado { get; set; } = string.Empty;
        public string? HashVerificacion { get; set; }
        public string? ErrorMensaje { get; set; }
        public bool IsFilePresent { get; set; }
    }

    public class BackupVerifyResultDto
    {
        public bool Success { get; set; }
        public bool IsMatch { get; set; }
        public string? CurrentHash { get; set; }
        public string? RecordedHash { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public interface IBackupAdminService
    {
        Task<List<BackupLogDto>> GetBackupLogsAsync();
        Task<(string? FilePath, string? FileName)> GetBackupFileForDownloadAsync(Guid uuid);
        Task<BackupVerifyResultDto> VerifyBackupIntegrityAsync(Guid uuid);
        Task<bool> PurgeBackupAsync(Guid uuid);
    }
}

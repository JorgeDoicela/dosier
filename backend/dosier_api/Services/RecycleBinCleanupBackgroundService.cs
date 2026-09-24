using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;

namespace dosier_api.Services
{
    /// <summary>
    /// Servicio en segundo plano para purgar automáticamente los elementos de la papelera
    /// de reciclaje que hayan superado los 30 días de retención.
    /// </summary>
    public class RecycleBinCleanupBackgroundService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RecycleBinCleanupBackgroundService> _logger;

        public RecycleBinCleanupBackgroundService(
            IServiceProvider serviceProvider, 
            ILogger<RecycleBinCleanupBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("DOSIER Recycle Bin Cleanup Service iniciado.");

            // Esperar un momento al iniciar para no retrasar el inicio de la aplicación
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("Ejecutando limpieza programada de papelera de reciclaje.");
                    await CleanExpiredItemsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error durante la limpieza automática de la papelera.");
                }

                // Ejecutar una vez al día
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
        }

        private async Task CleanExpiredItemsAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DosierContext>();
            var expirationLimit = DateTime.UtcNow.AddDays(-30);

            // 1. Purgar PEAs inactivos que hayan superado los 30 días de retención
            var expiredPeas = await context.Set<dosier_domain.Curriculum.Entities.DocPea>()
                .IgnoreQueryFilters()
                .Where(p => !p.Activo && p.FechaModificacion != null && p.FechaModificacion < expirationLimit)
                .ToListAsync();

            if (expiredPeas.Any())
            {
                _logger.LogInformation("Encontrados {Count} PEAs expirados en la papelera. Purgando.", expiredPeas.Count);
                context.Set<dosier_domain.Curriculum.Entities.DocPea>().RemoveRange(expiredPeas);
                await context.SaveChangesAsync();
            }

            // 2. Purgar DocumentInstances archivadas expiradas
            var expiredDocs = await context.DocumentInstances
                .Where(d => d.State == Dosier.Domain.Common.Documents.DocumentState.Archived && d.UpdatedAt < expirationLimit)
                .ToListAsync();

            if (expiredDocs.Any())
            {
                _logger.LogInformation("Encontradas {Count} instancias de documentos expiradas en la papelera. Purgando.", expiredDocs.Count);
                context.DocumentInstances.RemoveRange(expiredDocs);
                await context.SaveChangesAsync();
            }
        }
    }
}

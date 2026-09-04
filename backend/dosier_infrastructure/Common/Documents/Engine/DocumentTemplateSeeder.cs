using Dosier.Domain.Common.Documents;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using dosier_infrastructure.data.models;

namespace Dosier.Infrastructure.Common.Documents.Engine
{
    /// <summary>
    /// Utilidad para sembrar y sincronizar el catálogo maestro de plantillas de documentos
    /// (DocumentTemplateRegistry) con la base de datos activa al arrancar la aplicación.
    ///
    /// ESTRATEGIA DE SINCRONIZACIÓN AUTOMÁTICA (Content-Diff + Version):
    ///   Compara el contenido de los archivos físicos (.html, .css) en disco con lo almacenado
    ///   en la BD. Si detecta diferencias O si la versión en código es mayor, actualiza la BD
    ///   automáticamente al arrancar la aplicación (dotnet run).
    /// </summary>
    public static class DocumentTemplateSeeder
    {
        public static async Task SeedTemplatesAsync(
            DosierContext context, 
            IHostEnvironment environment,
            ILogger logger)
        {
            var seedTemplates = DocumentTemplateRegistry.GetSeedTemplates().ToList();
            var fileLoader = new TemplateFileLoader(environment, null);

            logger.LogInformation("DOSIER DocumentSeeder: Iniciando sincronización de {Count} plantillas semilla...", seedTemplates.Count);

            var dbSet = context.Set<DocumentTemplate>();

            foreach (var seed in seedTemplates)
            {
                var template = await dbSet.FirstOrDefaultAsync(t => t.Code == seed.Code);

                // Cargar archivos físicos desde disco
                var fileHtml = await fileLoader.LoadAsync(seed.Code);
                var fileCss  = await fileLoader.LoadCssAsync(seed.Code);

                if (template == null)
                {
                    // Primera vez: registrar la plantilla en MySQL
                    logger.LogInformation("DOSIER DocumentSeeder: Registrando nueva plantilla [{Code}]...", seed.Code);
                    if (fileHtml != null) seed.UpdateHtmlContentOnly(fileHtml);
                    if (fileCss  != null) seed.UpdateCustomCssOnly(fileCss);
                    await dbSet.AddAsync(seed);
                }
                else
                {
                    // Comprobar si el HTML en BD está corrupto o vacío
                    bool dbHtmlIsEmptyOrCorrupt = string.IsNullOrWhiteSpace(template.HtmlContent) || 
                                                 template.HtmlContent.Contains("<div class=\"doc-container\">\n</div>") ||
                                                 template.HtmlContent.Contains("<div class=\"doc-container\"></div>");

                    // Comprobar si el contenido en disco difiere del almacenado en MySQL
                    bool htmlDiffers = fileHtml != null && template.HtmlContent != fileHtml;
                    bool cssDiffers  = fileCss  != null && template.CustomCss   != fileCss;
                    bool contentDiffers = htmlDiffers || cssDiffers;

                    // Comprobar si la versión de fábrica es mayor (semilla en código)
                    bool versionBumped = seed.Version > template.Version;

                    // No sobreescribir si un usuario/admin personalizó la plantilla desde la interfaz web, a menos que esté corrupta o la semilla tenga versión mayor
                    bool isUserCustomized = !string.IsNullOrEmpty(template.UpdatedBy) && 
                                           template.UpdatedBy != "system" && 
                                           template.UpdatedBy != "seeder";

                    if (dbHtmlIsEmptyOrCorrupt || versionBumped || (contentDiffers && !isUserCustomized))
                    {
                        var reason = dbHtmlIsEmptyOrCorrupt 
                            ? "Reparación de HTML incompleto en BD"
                            : (versionBumped ? $"Versión mayor v{seed.Version} > v{template.Version}" : "Sincronización de archivos físicos");
                        
                        logger.LogInformation("DOSIER DocumentSeeder: Actualizando plantilla [{Code}] ({Reason})...", seed.Code, reason);

                        if (fileHtml != null) template.UpdateHtmlContentOnly(fileHtml);
                        if (fileCss  != null) template.UpdateCustomCssOnly(fileCss);
                        template.SyncWithSeed(seed);
                        dbSet.Update(template);
                    }
                    else if (seed.SupportsBlindMode          != template.SupportsBlindMode     ||
                             seed.RequiresLopdpClause        != template.RequiresLopdpClause   ||
                             seed.RequiresElectronicSignature!= template.RequiresElectronicSignature)
                    {
                        // Solo metadatos cambiaron
                        logger.LogInformation("DOSIER DocumentSeeder: Sincronizando metadatos de plantilla [{Code}]...", seed.Code);
                        template.SyncWithSeed(seed);
                        dbSet.Update(template);
                    }
                }
            }

            var affected = await context.SaveChangesAsync();
            logger.LogInformation(
                affected > 0
                    ? "DOSIER DocumentSeeder: Sincronización finalizada. {Count} cambio(s) aplicados en base de datos."
                    : "DOSIER DocumentSeeder: Sincronización finalizada. Sin cambios pendientes en base de datos.",
                affected);
        }
    }
}

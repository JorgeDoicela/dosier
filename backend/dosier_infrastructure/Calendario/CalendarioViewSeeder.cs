using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using dosier_infrastructure.data.models;

namespace dosier_infrastructure.Calendario
{
    public static class CalendarioViewSeeder
    {
        /// <summary>
        /// Prohibición estricta de DDL en código C#: Las tablas y vistas son gestionadas
        /// exclusivamente por los scripts SQL oficiales en scripts/base_datos/.
        /// </summary>
        public static Task EnsureCalendarioViewCreatedAsync(DosierContext context, ILogger logger)
        {
            return Task.CompletedTask;
        }
    }
}

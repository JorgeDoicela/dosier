using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Dosier.Application.Common.Documents;
using dosier_infrastructure.data.models;
using Microsoft.EntityFrameworkCore;

namespace Dosier.Infrastructure.Common.Documents.Providers
{
    /// <summary>
    /// Proveedor de Datos para el Informe Final de Investigación.
    /// Consolida toda la trazabilidad del proyecto: Planificación inicial vs Ejecución real.
    /// </summary>
    public class FinalReportDataProvider : IDocumentDataProvider
    {
        private readonly DosierContext _db;

        public FinalReportDataProvider(DosierContext db)
        {
            _db = db;
        }

        public bool CanHandle(string entityType) => entityType == "INFORME_FINAL_INVESTIGACION" || entityType == "InformeFinal";

        public async Task<object> GetDocumentDataAsync(string entityUuid, CancellationToken ct = default)
        {
            // En este caso, entityUuid es el Uuid del PROYECTO al que pertenece el informe
            var proyecto = await _db.DocProyectos
                .AsSplitQuery()
                .Include(p => p.DocProyectoParticipantes).ThenInclude(pp => pp.IdUsuarioNavigation)
                .Include(p => p.DocObjetivosProyecto)
                .Include(p => p.DocPresupuestoItems)
                .Include(p => p.DocCronogramas)
                .Include(p => p.DocGastos)
                .FirstOrDefaultAsync(p => p.Uuid == entityUuid, ct)
                ?? throw new System.Collections.Generic.KeyNotFoundException($"Proyecto no encontrado para el informe: {entityUuid}");

            // Cálculos de Consolidación Presupuestaria
            decimal planificado = proyecto.DocPresupuestoItems.Sum(i => i.ValorTotal);
            decimal ejecutado = proyecto.DocGastos.Sum(g => g.Monto);
            
            // Cálculos de Avance
            double progresoPromedio = proyecto.DocCronogramas.Any() 
                ? (double)proyecto.DocCronogramas.Average(c => c.Progreso) 
                : 0;

            var director = proyecto.DocProyectoParticipantes.FirstOrDefault(p => p.EsDirector == true && p.Activo != false && p.TipoParticipante == "Docente");

            return new
            {
                Titulo = proyecto.Titulo,
                Codigo = proyecto.CodigoInstitucional,
                FechaInicio = proyecto.FechaInicio?.ToString("dd/MM/yyyy") ?? "N/A",
                FechaFin = proyecto.FechaFin?.ToString("dd/MM/yyyy") ?? "N/A",
                LineaInvestigacion = "Línea de Prueba Institutional", // TODO: Link with actual line name
                
                NombreDirector = director?.IdUsuarioNavigation?.Nombre ?? "DIRECTOR NO ASIGNADO",
                CedulaDirector = director?.IdUsuarioNavigation?.IdSigafi ?? "__________",
                
                CumplimientoCronograma = (int)progresoPromedio,
                TrlAlcanzado = proyecto.TrlActual ?? 1,
                ProductosGenerados = 0,

                // Datos Presupuestarios Consolidados
                PresupuestoPlanificado = planificado,
                PresupuestoEjecutado = ejecutado,
                PresupuestoDiferencia = planificado - ejecutado,
                
                ContrapartePlanificada = 0, // Por ahora 0, integrar con contrapartes externas si aplica
                ContraparteEjecutada = 0,
                ContraparteDiferencia = 0,
                
                TotalPlanificado = planificado,
                TotalEjecutado = ejecutado,
                TotalDiferencia = planificado - ejecutado,

                // Trazabilidad de Objetivos
                Objetivos = proyecto.DocObjetivosProyecto.OrderBy(o => o.Orden).Select(o => new {
                    o.Descripcion,
                    EsGeneral = o.EsGeneral
                })
            };
        }
    }
}

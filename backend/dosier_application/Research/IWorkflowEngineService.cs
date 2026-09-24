using System;
using System.Threading.Tasks;

namespace Dosier.Application.Research
{
    public interface IWorkflowEngineService
    {
        Task<bool> TransicionarEstadoAsync(string proyectoUuid, string nuevoEstado, int idUsuario, string observacion, DateOnly? fechaLimite = null);
        Task<bool> IniciarEjecucionAsync(string proyectoUuid, int idUsuario);
        Task<System.Collections.Generic.IEnumerable<object>> GetTrazabilidadAsync(string proyectoUuid);
    }
}

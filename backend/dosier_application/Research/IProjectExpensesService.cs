using System.Security.Claims;
using System.Threading.Tasks;
using Dosier.Application.Research.Dtos;

namespace Dosier.Application.Research
{
    public interface IProjectExpensesService
    {
        Task<ExpenseOperationResult<GastoDto>> RegistrarGastoAsync(string projectUuid, RegistrarGastoRequest request, ClaimsPrincipal user);
        Task<ExpenseOperationResult<bool>> EliminarGastoAsync(string projectUuid, string gastoUuid, ClaimsPrincipal user);
    }

    public class RegistrarGastoRequest
    {
        public string Descripcion { get; set; } = string.Empty;
        public string Partida { get; set; } = string.Empty;
        public decimal Monto { get; set; }
        public string ReferenciaFactura { get; set; } = string.Empty;
        public string Categoria { get; set; } = string.Empty;
        public string? Fecha { get; set; }
    }

    public class ExpenseOperationResult<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public string? Message { get; set; }
        public int StatusCode { get; set; } = 400;
    }
}

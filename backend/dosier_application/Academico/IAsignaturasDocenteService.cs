using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Academico.Dtos;

namespace dosier_application.Academico;

public interface IAsignaturasDocenteService
{
    Task<PeriodoAcademicoDto?> GetPeriodoActivoAsync();
    Task<List<PeriodoAcademicoDto>> GetPeriodosDisponiblesAsync();
    Task<List<DocenteAsignaturaDto>> GetMisAsignaturasAsync(string idProfesor, string? idPeriodo = null);
    Task<CurriculoAsignaturaDetalleDto?> GetCurriculoAsignaturaAsync(int idAsignatura, int idCarrera);
}

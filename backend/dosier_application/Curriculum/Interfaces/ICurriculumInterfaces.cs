using System.Collections.Generic;
using System.Threading.Tasks;
using dosier_application.Curriculum.Dtos;

namespace dosier_application.Curriculum.Interfaces
{
    public interface ICurriculumCatalogService
    {
        Task<List<CarreraDocenteDto>> GetCarrerasDocenteAsync(string? idProfesor, string? idPeriodo);
        Task<List<DocenteAsignaturaMallaDto>> GetAsignaturasMallaAsync(int idCarrera, string? idProfesor, string? idPeriodo);
        Task<List<PeriodoAcademicoDto>> GetPeriodosAcademicosAsync();
    }

    public interface IPeaService
    {
        Task<PeaDto?> GetByIdAsync(int idPea);
        Task<PeaDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo);
        Task<PeaDto> GuardarPeaAsync(PeaDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario);
        Task<PeaDto> ClonarPeaPeriodoAsync(int idPeaOrigen, string nuevoPeriodo, string? idUsuario);
    }

    public interface ISilaboService
    {
        Task<SilaboDto?> GetByIdAsync(int idSilabo);
        Task<SilaboDto?> GetByPeaIdAsync(int idPea);
        Task<SilaboDto> GenerarSilaboDesdePeaAsync(int idPea, string? idUsuario);
        Task<SilaboDto> GuardarSilaboAsync(SilaboDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idSilabo, string nuevoEstado, string? firma, string? idUsuario);
    }

    public interface IGuiaApeService
    {
        Task<GuiaApeDto?> GetByIdAsync(int idGuiaApe);
        Task<List<GuiaApeDto>> GetGuiasByPeaIdAsync(int idPea);
        Task<GuiaApeDto> GenerarGuiaDesdePracticaPeaAsync(int idPea, int idPracticaPea, string? idUsuario);
        Task<GuiaApeDto> GuardarGuiaApeAsync(GuiaApeDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idGuiaApe, string nuevoEstado, string? firma, string? idUsuario);
    }

    public interface IGuiaEstudioService
    {
        Task<GuiaEstudioDto?> GetByIdAsync(int idGuiaEstudio);
        Task<GuiaEstudioDto?> GetByPeaIdAsync(int idPea);
        Task<GuiaEstudioDto> GenerarGuiaEstudioDesdePeaAsync(int idPea, string? idUsuario);
        Task<GuiaEstudioDto> GuardarGuiaEstudioAsync(GuiaEstudioDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idGuiaEstudio, string nuevoEstado, string? firma, string? idUsuario);
    }
}

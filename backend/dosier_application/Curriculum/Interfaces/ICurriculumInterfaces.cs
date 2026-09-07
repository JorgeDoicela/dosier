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

    public interface INormativaService
    {
        Task<List<NormativaDto>> GetNormativasVigentesAsync(string? organismo = null);
        Task<List<NormativaArticuloDto>> GetChecklistCurricularAsync(string? organismo = null);
        Task<ModeloEducativoDto?> GetModeloEducativoVigenteAsync();
    }

    public interface IPerfilEgresoService
    {
        Task<PerfilEgresoDto?> GetPerfilByCarreraMallaAsync(int idCarrera, int idMalla);
        Task<List<PerfilEgresoResultadoDto>> GetResultadosAprendizajeCarreraAsync(int idCarrera, int idMalla);
        Task<List<AsignaturaResultadoPerfilDto>> GetTributacionAsignaturaAsync(int idAsignatura, int idMalla);
        Task<ProyectoCurricularDto?> GetProyectoCurricularAsync(int idCarrera, int idMalla);
    }

    public interface IExpedienteCurricularService
    {
        Task<ExpedienteCurricularDto?> GetByIdAsync(int idExpediente);
        Task<ExpedienteCurricularDetalleDto?> GetDetalleByIdAsync(int idExpediente);
        Task<ExpedienteCurricularDto?> GetByAsignacionAsync(int idAsignacion);
        Task<ExpedienteCurricularDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo);
        Task<ExpedienteCurricularDto> ObtenerOCrearExpedienteAsync(int idAsignacion, string? idProfesor);
        Task<List<ExpedienteCurricularDto>> ListarExpedientesPeriodoAsync(string idPeriodo, int? idCarrera = null);
    }

    public interface IPeaService
    {
        Task<PeaDto?> GetByIdAsync(int idPea);
        Task<PeaDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo);
        Task<PeaDto> CrearDesdeAsignacionAsync(int idAsignacion, string idProfesor);
        Task<PeaDto> GuardarPeaAsync(PeaDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario, string? motivo = null);
        Task<PeaDto> ClonarPeaPeriodoAsync(int idPeaOrigen, string nuevoPeriodo, string? idUsuario);

        // Workflow Colegiado
        Task<PeaObservacionDto> AgregarObservacionAsync(int idPea, string rolObservador, string seccion, string texto, int? idUsuario);
        Task<bool> SubsanarObservacionAsync(int idObservacion, string respuestaDocente, int? idUsuario);
        Task<List<PeaObservacionDto>> GetObservacionesByPeaAsync(int idPea);
        Task<List<PeaTrazabilidadDto>> GetTrazabilidadByPeaAsync(int idPea);
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

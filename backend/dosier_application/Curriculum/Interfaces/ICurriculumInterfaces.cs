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
        Task<PeaDto?> GetByUuidAsync(string uuid);
        Task<PeaDto?> GetByAsignaturaPeriodoAsync(int idAsignatura, string idPeriodo);
        Task<PeaDto> CrearDesdeAsignacionAsync(int idAsignacion, string idProfesor);
        Task<PeaDto> GuardarPeaAsync(PeaDto dto, string? idUsuarioModificador);
        Task<bool> CambiarEstadoAsync(int idPea, string nuevoEstado, string? firmaDocente, string? idUsuario, string? motivo = null);
        Task<PeaDto> ClonarPeaPeriodoAsync(int idPeaOrigen, string nuevoPeriodo, string? idUsuario);

        // Workflow Colegiado y Firma Digital (Ley 67 Ecuador)
        Task<PeaFirmaResultadoDto> FirmarPeaAsync(int idPea, int idUsuario, FirmarPeaDto dto, string ipAddress, string userAgent);
        Task<PeaObservacionDto> AgregarObservacionAsync(int idPea, string rolObservador, string seccion, string texto, int? idUsuario);
        Task<bool> SubsanarObservacionAsync(int idObservacion, string respuestaDocente, int? idUsuario);
        Task<List<PeaObservacionDto>> GetObservacionesByPeaAsync(int idPea);
        Task<List<PeaTrazabilidadDto>> GetTrazabilidadByPeaAsync(int idPea);

        // Sincronización con Document Instances (CoWork Yjs)
        Task<bool> SincronizarMetadataAsync(string peaUuid, string snapshotJson);
    }
}

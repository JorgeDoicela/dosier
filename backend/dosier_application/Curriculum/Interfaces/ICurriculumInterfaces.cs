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

        // Salas Curriculares de Carrera en Tiempo Real y Pre-PEA
        Task<SalaCarreraEstadoDto> GetEstadoSalaCarreraAsync(int idCarrera, string idPeriodo, string? idUsuario);
        Task<bool> ConmutarEstadoSalaCarreraAsync(int idCarrera, string idPeriodo, bool activar, string? tema, string idUsuario);
        Task<BorradorPrePeaDto?> GetBorradorPrePeaAsync(int idExpediente);
        Task<BorradorPrePeaDto> GuardarBorradorPrePeaAsync(int idExpediente, BorradorPrePeaDto dto, string idUsuario);
        Task<PeaDto> AplicarBorradorASalaPeaAsync(int idExpediente, int? idPea, string idUsuario);
        Task<(byte[] PdfBytes, string FileName, string TraceabilityCode)> GenerarActaAcuerdosCarreraAsync(int idCarrera, string idPeriodo, string idUsuario);
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
        Task<PeaObservacionDto> AgregarObservacionByUuidAsync(string uuid, string rolObservador, string seccion, string texto, int? idUsuario);
        Task<bool> SubsanarObservacionAsync(int idObservacion, string respuestaDocente, int? idUsuario);
        Task<bool> EliminarObservacionAsync(int idObservacion, int? idUsuario);
        Task<List<PeaObservacionDto>> GetObservacionesByPeaAsync(int idPea);
        Task<List<PeaTrazabilidadDto>> GetTrazabilidadByPeaAsync(int idPea);

        // Sincronización con Document Instances (CoWork Yjs)
        Task<bool> SincronizarMetadataAsync(string peaUuid, string snapshotJson);

        // Bandeja de Supervisión Curricular (Coordinadores, Vicerrector y Docentes)
        Task<List<PeaBandejaItemDto>> ListarBandejaAsync(string? idPeriodo, int? idCarrera, string? estado, int idUsuario, string? identifier = null, System.Threading.CancellationToken cancellationToken = default);

        // Exploración de PEAs de otros docentes para apoyo intercurricular y co-diseño colegiado
        Task<List<PeaBandejaItemDto>> ListarPeasOtrosDocentesAsync(string? idPeriodo, int? idCarrera, string? identifier = null, System.Threading.CancellationToken cancellationToken = default);

        // Solicitudes y gobernanza de colaboración entre docentes
        Task<PeaColaboracionItemDto> SolicitarColaboracionAsync(SolicitarColaboracionDto dto, string idDocenteSolicitante, System.Threading.CancellationToken cancellationToken = default);
        Task<bool> ResponderColaboracionAsync(string uuidColaboracion, bool aceptar, string idDocenteTitular, string? motivo = null, System.Threading.CancellationToken cancellationToken = default);
        Task<List<PeaColaboracionItemDto>> ListarMisSolicitudesColaboracionAsync(string idDocente, System.Threading.CancellationToken cancellationToken = default);
        Task<List<PeaColaboracionItemDto>> ListarSolicitudesRecibidasAsync(string idDocenteTitular, System.Threading.CancellationToken cancellationToken = default);
        Task<Dictionary<int, string>> ObtenerEstadosColaboracionPorAsignacionesAsync(List<int> idAsignaciones, string idDocenteSolicitante, System.Threading.CancellationToken cancellationToken = default);
    }
}

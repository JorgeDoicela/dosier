using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class PeaDto
    {
        public int IdPea { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public int IdAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public string? CodigoAsignatura { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public int? IdAsignacion { get; set; }
        public int? IdMalla { get; set; }
        public int? IdDetalleMalla { get; set; }
        public int? IdNivel { get; set; }
        public int? IdModalidad { get; set; }
        public int? IdSeccion { get; set; }
        public string? Paralelo { get; set; }
        public string? FuenteMalla { get; set; }
        public string? IdDocenteElaborador { get; set; }
        public string? NombreDocenteElaborador { get; set; }
        public string Modalidad { get; set; } = "Presencial";
        public string? UnidadOrganizacion { get; set; }
        public string? SemestreNivel { get; set; }
        public int TotalHorasAsignatura { get; set; }
        public decimal Creditos { get; set; }
        public int HorasContactoDocente { get; set; }
        public int HorasPracticoExperimental { get; set; }
        public int HorasAutonomo { get; set; }
        public string? ObjetivoAsignatura { get; set; }
        public string? MetodologiaEnsenanza { get; set; }
        public string? RecursosDidacticos { get; set; }
        public string? EvaluacionAprendizaje { get; set; }
        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;
        public int? IdExpediente { get; set; }

        public List<PeaUnidadDto> Unidades { get; set; } = new List<PeaUnidadDto>();
        public List<PeaResultadoAprendizajeDto> ResultadosAprendizaje { get; set; } = new List<PeaResultadoAprendizajeDto>();
        public List<PeaActividadPracticaDto> ActividadesPracticas { get; set; } = new List<PeaActividadPracticaDto>();
        public List<PeaBibliografiaDto> Bibliografias { get; set; } = new List<PeaBibliografiaDto>();
        public List<PeaObservacionDto> Observaciones { get; set; } = new List<PeaObservacionDto>();
        public List<PeaTrazabilidadDto> Trazabilidades { get; set; } = new List<PeaTrazabilidadDto>();
    }

    public class PeaUnidadDto
    {
        public int IdUnidad { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int NumeroUnidad { get; set; }
        public string NombreUnidad { get; set; } = string.Empty;
        public int TotalHorasUnidad { get; set; }
        public int HorasDocencia { get; set; }
        public int HorasPracticoExp { get; set; }
        public int HorasAutonomo { get; set; }
        public int Orden { get; set; }
        public List<PeaTemaDto> Temas { get; set; } = new List<PeaTemaDto>();
    }

    public class PeaTemaDto
    {
        public int IdTema { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdUnidad { get; set; }
        public int NumeroTema { get; set; }
        public string TituloTema { get; set; } = string.Empty;
        public string? DescripcionSubtemas { get; set; }
        public int Orden { get; set; }
    }

    public class PeaResultadoAprendizajeDto
    {
        public int IdRda { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public string TipoRda { get; set; } = "Asignatura";
        public string? CodigoRda { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string NivelDesarrollo { get; set; } = "Medio";
        public int Orden { get; set; }
    }

    public class PeaActividadPracticaDto
    {
        public int IdPractica { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int? IdUnidad { get; set; }
        public int NumeroPractica { get; set; }
        public string NombrePractica { get; set; } = string.Empty;
        public string? Caracterizacion { get; set; }
        public int DuracionHoras { get; set; } = 2;
        public int Orden { get; set; }
    }

    public class PeaBibliografiaDto
    {
        public int IdBiblio { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public string TipoBibliografia { get; set; } = "Basica";
        public string? Autor { get; set; }
        public int? Anio { get; set; }
        public string TituloLibro { get; set; } = string.Empty;
        public string? EditorialCiudad { get; set; }
        public string? Isbn { get; set; }
        public string? UrlRecurso { get; set; }
        public string CitaCompletaApa { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    public class PeaObservacionDto
    {
        public int IdObservacion { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int? IdUsuarioObservador { get; set; }
        public string? NombreObservador { get; set; }
        public string RolObservador { get; set; } = "CoordinadorCarrera";
        public string SeccionAfectada { get; set; } = string.Empty;
        public string TextoObservacion { get; set; } = string.Empty;
        public string Estado { get; set; } = "Pendiente"; // Pendiente, Subsanada, Desestimada
        public string? RespuestaDocente { get; set; }
        public DateTime FechaObservacion { get; set; }
        public DateTime? FechaResolucion { get; set; }
    }

    public class PeaTrazabilidadDto
    {
        public int IdTrazabilidad { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int? IdUsuario { get; set; }
        public string? NombreUsuario { get; set; }
        public string EstadoAnterior { get; set; } = string.Empty;
        public string EstadoNuevo { get; set; } = string.Empty;
        public string? Motivo { get; set; }
        public string? HashIntegridadSha256 { get; set; }
        public DateTime FechaTransicion { get; set; }
    }
}

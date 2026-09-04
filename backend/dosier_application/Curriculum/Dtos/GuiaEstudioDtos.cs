using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class GuiaEstudioDto
    {
        public int IdGuiaEstudio { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public int IdAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public int IdCarrera { get; set; }
        public string NombreCarrera { get; set; } = string.Empty;
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocenteElaborador { get; set; }
        public string? NombreDocenteElaborador { get; set; }
        public string? EncabezadoOficial { get; set; }
        public string? IntroduccionGeneral { get; set; }

        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;

        public List<GuiaEstudioUnidadDto> Unidades { get; set; } = new List<GuiaEstudioUnidadDto>();
    }

    public class GuiaEstudioUnidadDto
    {
        public int IdGuiaUnidad { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaEstudio { get; set; }
        public int NumeroUnidad { get; set; }
        public string NombreUnidad { get; set; } = string.Empty;
        public int Orden { get; set; }

        public List<GuiaEstudioTemaDto> Temas { get; set; } = new List<GuiaEstudioTemaDto>();
        public List<GuiaEstudioPreguntaGuiaDto> PreguntasGuia { get; set; } = new List<GuiaEstudioPreguntaGuiaDto>();
        public List<GuiaEstudioGlosarioDto> Glosarios { get; set; } = new List<GuiaEstudioGlosarioDto>();
        public List<GuiaEstudioActividadDto> Actividades { get; set; } = new List<GuiaEstudioActividadDto>();
        public List<GuiaEstudioReferenciaDto> Referencias { get; set; } = new List<GuiaEstudioReferenciaDto>();
    }

    public class GuiaEstudioTemaDto
    {
        public int IdGuiaTema { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaUnidad { get; set; }
        public int NumeroTema { get; set; }
        public string NombreTema { get; set; } = string.Empty;
        public string? ContenidoDesarrollo { get; set; }
        public string? CuadrosApoyoJson { get; set; }
        public int Orden { get; set; }
        public List<GuiaEstudioSubtemaDto> Subtemas { get; set; } = new List<GuiaEstudioSubtemaDto>();
    }

    public class GuiaEstudioSubtemaDto
    {
        public int IdGuiaSubtema { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaTema { get; set; }
        public string NumeroSubtema { get; set; } = string.Empty; // 1.1, 1.2
        public string TituloSubtema { get; set; } = string.Empty;
        public string ContenidoTeorico { get; set; } = string.Empty;
        public string? EjemplosCodigo { get; set; }
        public int Orden { get; set; }
    }

    public class GuiaEstudioPreguntaGuiaDto
    {
        public int IdPreguntaGuia { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaUnidad { get; set; }
        public int NumeroPregunta { get; set; }
        public string Pregunta { get; set; } = string.Empty;
        public string RespuestaDocente { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    public class GuiaEstudioGlosarioDto
    {
        public int IdGlosario { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaUnidad { get; set; }
        public string Termino { get; set; } = string.Empty;
        public string Definicion { get; set; } = string.Empty;
        public int Orden { get; set; }
    }

    public class GuiaEstudioActividadDto
    {
        public int IdActividad { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaUnidad { get; set; }
        public string? CodigoTabla { get; set; }
        public string TituloActividad { get; set; } = string.Empty;
        public string? DescripcionActividad { get; set; }
        public string? TipoPracticaP { get; set; }
        public string? RubricaDetalleJson { get; set; }
        public int Orden { get; set; }
    }

    public class GuiaEstudioReferenciaDto
    {
        public int IdGuiaRef { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdGuiaUnidad { get; set; }
        public string ReferenciaCompletaApa { get; set; } = string.Empty;
        public int Orden { get; set; }
    }
}

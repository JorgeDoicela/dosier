using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    public class DocGuiaEstudio
    {
        public int IdGuiaEstudio { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int IdAsignatura { get; set; }
        public int IdCarrera { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocenteElaborador { get; set; }
        public string? EncabezadoOficial { get; set; }
        public string? IntroduccionGeneral { get; set; }

        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;
        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaModificacion { get; set; } = DateTime.UtcNow;

        // Firmas
        public string? FirmaElaboradoDocente { get; set; }
        public DateTime? FechaElaborado { get; set; }
        public string? FirmaRevisadoCoord { get; set; }
        public DateTime? FechaRevisadoCoord { get; set; }
        public string? FirmaAprobadoAcad { get; set; }
        public DateTime? FechaAprobado { get; set; }

        public virtual DocPea? Pea { get; set; }
        public virtual ICollection<DocGuiaEstudioUnidad> Unidades { get; set; } = new List<DocGuiaEstudioUnidad>();
    }

    public class DocGuiaEstudioUnidad
    {
        public int IdGuiaUnidad { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaEstudio { get; set; }
        public int NumeroUnidad { get; set; }
        public string NombreUnidad { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudio? GuiaEstudio { get; set; }
        public virtual ICollection<DocGuiaEstudioTema> Temas { get; set; } = new List<DocGuiaEstudioTema>();
        public virtual ICollection<DocGuiaEstudioPreguntaGuia> PreguntasGuia { get; set; } = new List<DocGuiaEstudioPreguntaGuia>();
        public virtual ICollection<DocGuiaEstudioGlosario> Glosarios { get; set; } = new List<DocGuiaEstudioGlosario>();
        public virtual ICollection<DocGuiaEstudioActividad> Actividades { get; set; } = new List<DocGuiaEstudioActividad>();
        public virtual ICollection<DocGuiaEstudioReferencia> Referencias { get; set; } = new List<DocGuiaEstudioReferencia>();
    }

    public class DocGuiaEstudioTema
    {
        public int IdGuiaTema { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaUnidad { get; set; }
        public int NumeroTema { get; set; }
        public string NombreTema { get; set; } = string.Empty;
        public string? ContenidoDesarrollo { get; set; }
        public string? CuadrosApoyoJson { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioUnidad? GuiaUnidad { get; set; }
        public virtual ICollection<DocGuiaEstudioSubtema> Subtemas { get; set; } = new List<DocGuiaEstudioSubtema>();
    }

    public class DocGuiaEstudioSubtema
    {
        public int IdGuiaSubtema { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaTema { get; set; }
        public string NumeroSubtema { get; set; } = string.Empty; // 1.1, 1.2
        public string TituloSubtema { get; set; } = string.Empty;
        public string ContenidoTeorico { get; set; } = string.Empty;
        public string? EjemplosCodigo { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioTema? GuiaTema { get; set; }
    }

    public class DocGuiaEstudioPreguntaGuia
    {
        public int IdPreguntaGuia { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaUnidad { get; set; }
        public int NumeroPregunta { get; set; }
        public string Pregunta { get; set; } = string.Empty;
        public string RespuestaDocente { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioUnidad? GuiaUnidad { get; set; }
    }

    public class DocGuiaEstudioGlosario
    {
        public int IdGlosario { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaUnidad { get; set; }
        public string Termino { get; set; } = string.Empty;
        public string Definicion { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioUnidad? GuiaUnidad { get; set; }
    }

    public class DocGuiaEstudioActividad
    {
        public int IdActividad { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaUnidad { get; set; }
        public string? CodigoTabla { get; set; }
        public string TituloActividad { get; set; } = string.Empty;
        public string? DescripcionActividad { get; set; }
        public string? TipoPracticaP { get; set; }
        public string? RubricaDetalleJson { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioUnidad? GuiaUnidad { get; set; }
    }

    public class DocGuiaEstudioReferencia
    {
        public int IdGuiaRef { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaUnidad { get; set; }
        public string ReferenciaCompletaApa { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        public virtual DocGuiaEstudioUnidad? GuiaUnidad { get; set; }
    }
}

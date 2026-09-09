using System;

namespace dosier_domain.Curriculum.Entities
{
    public class DocPeaResultadoAprendizaje
    {
        public int IdRda { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int? IdResultadoPerfil { get; set; }
        public string TipoRda { get; set; } = "Asignatura"; // Carrera, Asignatura
        public string? CodigoRda { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public string NivelDesarrollo { get; set; } = "Medio"; // Inicial, Medio, Alto
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
        public virtual DocPerfilEgresoResultado? PerfilResultado { get; set; }
    }

    public class DocPeaActividadPractica
    {
        public int IdPractica { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int? IdUnidad { get; set; }
        public int NumeroPractica { get; set; }
        public string NombrePractica { get; set; } = string.Empty;
        public string? Caracterizacion { get; set; }
        public int DuracionHoras { get; set; } = 2;
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
        public virtual DocPeaUnidad? Unidad { get; set; }
    }

    public class DocPeaBibliografia
    {
        public int IdBiblio { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public string TipoBibliografia { get; set; } = "Basica"; // Basica, Consulta, Virtual
        public string? Autor { get; set; }
        public int? Anio { get; set; }
        public string TituloLibro { get; set; } = string.Empty;
        public string? EditorialCiudad { get; set; }
        public string? Isbn { get; set; }
        public string? UrlRecurso { get; set; }
        public string CitaCompletaApa { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
    }

    public class DocPeaPrerequisito
    {
        public int IdPrerequisito { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int? IdAsignaturaOrigen { get; set; }
        public string? CodigoAsignatura { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public string? Observacion { get; set; }
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
    }

    public class DocPeaEvaluacion
    {
        public int IdEvaluacion { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public string Denominacion { get; set; } = string.Empty;
        public string TipoEvaluacion { get; set; } = string.Empty;
        public decimal CalificacionMaxima { get; set; } = 10.0m;
        public int Orden { get; set; } = 1;

        public virtual DocPea? Pea { get; set; }
    }
}

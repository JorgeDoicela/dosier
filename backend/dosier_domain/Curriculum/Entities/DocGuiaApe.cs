using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    public class DocGuiaApe
    {
        public int IdGuiaApe { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public int IdAsignatura { get; set; }
        public int IdCarrera { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocente { get; set; }

        // Control documental oficial
        public string CodigoFormato { get; set; } = "IT-P03-F05";
        public string VersionFormato { get; set; } = "01";
        public string? FechaRevisionFormato { get; set; }
        public string? VigenciaFormato { get; set; }

        // Datos de la práctica
        public string? FechaPractica { get; set; }
        public int DuracionHoras { get; set; } = 2;
        public int DuracionSemanas { get; set; } = 1;
        public string? NivelSemestre { get; set; }
        public string? Paralelo { get; set; }
        public int NumeroPractica { get; set; } = 1;
        public string? TallerLaboratorio { get; set; }
        public string TituloPractica { get; set; } = string.Empty;

        // Secciones estructuradas
        public string? FundamentosTeoricos { get; set; }
        public string? InvestigacionAutonoma { get; set; }
        public string? MetodologiaDidactica { get; set; }
        public string? NormasSeguridad { get; set; }
        public string? HabilidadesBlandas { get; set; }
        public string? IndicacionesEntrega { get; set; }

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
        public string? FirmaAprobadoDocencia { get; set; }
        public DateTime? FechaAprobado { get; set; }

        public virtual DocPea? Pea { get; set; }
        public virtual ICollection<DocGuiaApeObjetivo> Objetivos { get; set; } = new List<DocGuiaApeObjetivo>();
        public virtual ICollection<DocGuiaApeRda> ResultadosAprendizaje { get; set; } = new List<DocGuiaApeRda>();
        public virtual ICollection<DocGuiaApeCriterio> CriteriosEvaluacion { get; set; } = new List<DocGuiaApeCriterio>();
        public virtual ICollection<DocGuiaApePreparacion> PreparacionPrevia { get; set; } = new List<DocGuiaApePreparacion>();
        public virtual ICollection<DocGuiaApeProcedimiento> Procedimientos { get; set; } = new List<DocGuiaApeProcedimiento>();
        public virtual ICollection<DocGuiaApeReferencia> Referencias { get; set; } = new List<DocGuiaApeReferencia>();
    }

    public class DocGuiaApeObjetivo
    {
        public int IdObjetivo { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public string Descripcion { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
    }

    public class DocGuiaApeRda
    {
        public int IdGuiaRda { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public int? IdRda { get; set; }
        public string DescripcionRda { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
        public virtual DocPeaResultadoAprendizaje? PeaResultadoAprendizaje { get; set; }
    }

    public class DocGuiaApeCriterio
    {
        public int IdCriterio { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public string CriterioEvaluacion { get; set; } = string.Empty;
        public decimal Puntaje { get; set; } = 2.50m;
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
    }

    public class DocGuiaApePreparacion
    {
        public int IdPrep { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public string Tipo { get; set; } = "IndicacionPrevia"; // IndicacionPrevia, MaterialEquipo
        public string Descripcion { get; set; } = string.Empty;
        public string? CaracteristicasCantidad { get; set; }
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
    }

    public class DocGuiaApeProcedimiento
    {
        public int IdProcedimiento { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public int NumeroParte { get; set; } = 1;
        public string NombreEtapa { get; set; } = string.Empty;
        public string? DescripcionEtapa { get; set; }
        public string? InstruccionesDetalle { get; set; } // JSON o texto
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
    }

    public class DocGuiaApeReferencia
    {
        public int IdReferencia { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdGuiaApe { get; set; }
        public string CitaApa { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;
        public virtual DocGuiaApe? GuiaApe { get; set; }
    }
}

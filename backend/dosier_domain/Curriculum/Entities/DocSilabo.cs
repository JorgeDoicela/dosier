using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    public class DocSilabo
    {
        public int IdSilabo { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPea { get; set; }
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocenteResponsable { get; set; }
        public string? HorarioTutoria { get; set; }
        public string? EmailDocente { get; set; }

        public decimal PorcentajeDocencia { get; set; } = 40.00m;
        public decimal PorcentajePractico { get; set; } = 30.00m;
        public decimal PorcentajeAutonomo { get; set; } = 30.00m;
        public decimal HorasSemanaDocencia { get; set; }
        public decimal HorasSemanaPractico { get; set; }
        public decimal HorasSemanaAutonomo { get; set; }

        public bool AplicaAdaptacion { get; set; } = false;
        public string? DetalleAdaptacion { get; set; }
        public string? RecursosDidacticos { get; set; }

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

        // Navegación
        public virtual DocPea? Pea { get; set; }
        public virtual ICollection<DocSilaboSemana> Semanas { get; set; } = new List<DocSilaboSemana>();
        public virtual ICollection<DocSilaboAdaptacion> Adaptaciones { get; set; } = new List<DocSilaboAdaptacion>();
    }

    public class DocSilaboSemana
    {
        public int IdSemana { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdSilabo { get; set; }
        public int NumeroSemana { get; set; } // 1 a 19
        public int? IdUnidad { get; set; }
        public string ContenidosTemas { get; set; } = string.Empty;
        public string? DocenciaMetodologia { get; set; }
        public string? PracticoExperimental { get; set; }
        public string? ActividadesAutonomas { get; set; }
        public string? IdRdaEvaluado { get; set; }
        public string? CalificacionEvaluativa { get; set; }
        public bool EsHitoEvaluativo { get; set; } = false; // Semana 9, 18, 19

        public virtual DocSilabo? Silabo { get; set; }
        public virtual DocPeaUnidad? Unidad { get; set; }
    }

    public class DocSilaboAdaptacion
    {
        public int IdAdaptacion { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdSilabo { get; set; }
        public string? EstudianteId { get; set; }
        public string TipoNecesidad { get; set; } = string.Empty;
        public string AdaptacionAplicada { get; set; } = string.Empty;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        public virtual DocSilabo? Silabo { get; set; }
    }
}

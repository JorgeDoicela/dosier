using System;
using System.Collections.Generic;

namespace dosier_application.Curriculum.Dtos
{
    public class SilaboDto
    {
        public int IdSilabo { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdPea { get; set; }
        public string NombreAsignatura { get; set; } = string.Empty;
        public string NombreCarrera { get; set; } = string.Empty;
        public string IdPeriodo { get; set; } = string.Empty;
        public string? IdDocenteResponsable { get; set; }
        public string? NombreDocenteResponsable { get; set; }
        public string? HorarioTutoria { get; set; }
        public string? EmailDocente { get; set; }

        public decimal? PorcentajeDocencia { get; set; } = 40.00m;
        public decimal? PorcentajePractico { get; set; } = 30.00m;
        public decimal? PorcentajeAutonomo { get; set; } = 30.00m;
        public decimal? HorasSemanaDocencia { get; set; }
        public decimal? HorasSemanaPractico { get; set; }
        public decimal? HorasSemanaAutonomo { get; set; }

        public bool AplicaAdaptacion { get; set; }
        public string? DetalleAdaptacion { get; set; }
        public string? RecursosDidacticos { get; set; }

        public string Estado { get; set; } = "Borrador";
        public int Version { get; set; } = 1;
        public bool Activo { get; set; } = true;

        public List<SilaboSemanaDto> Semanas { get; set; } = new List<SilaboSemanaDto>();
        public List<SilaboAdaptacionDto> Adaptaciones { get; set; } = new List<SilaboAdaptacionDto>();
    }

    public class SilaboSemanaDto
    {
        public int IdSemana { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdSilabo { get; set; }
        public int NumeroSemana { get; set; } // 1 a 19
        public int? IdUnidad { get; set; }
        public string? NombreUnidad { get; set; }
        public string ContenidosTemas { get; set; } = string.Empty;
        public string? DocenciaMetodologia { get; set; }
        public string? PracticoExperimental { get; set; }
        public string? ActividadesAutonomas { get; set; }
        public string? IdRdaEvaluado { get; set; }
        public string? CalificacionEvaluativa { get; set; }
        public bool EsHitoEvaluativo { get; set; }
    }

    public class SilaboAdaptacionDto
    {
        public int IdAdaptacion { get; set; }
        public string Uuid { get; set; } = string.Empty;
        public int IdSilabo { get; set; }
        public string? EstudianteId { get; set; }
        public string TipoNecesidad { get; set; } = string.Empty;
        public string AdaptacionAplicada { get; set; } = string.Empty;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}

using System;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Designación formal de autoridad curricular o coordinación de carrera para el circuito del PEA
    /// </summary>
    public class DocAutoridadCurricular
    {
        public int IdAutoridad { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public string IdSigafi { get; set; } = string.Empty;
        public string NombreCompleto { get; set; } = string.Empty;
        public string CargoCurricular { get; set; } = string.Empty; // VICERRECTOR, COORD_ACADEMICO, COORD_CARRERA
        public int? IdCarrera { get; set; }
        public bool EsActivo { get; set; } = true;
        public DateOnly FechaDesignacion { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    }
}

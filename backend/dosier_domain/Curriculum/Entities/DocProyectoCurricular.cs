using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Proyecto curricular aprobado de carrera y resoluciones CES de rediseño
    /// </summary>
    public class DocProyectoCurricular
    {
        public int IdProyectoCurricular { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdCarrera { get; set; }
        public int IdMalla { get; set; }
        public string? CodigoResolucionCes { get; set; }
        public string NombreProyecto { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0";
        public DateTime? FechaAprobacion { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual ICollection<DocExpedienteCurricular> Expedientes { get; set; } = new List<DocExpedienteCurricular>();
    }
}

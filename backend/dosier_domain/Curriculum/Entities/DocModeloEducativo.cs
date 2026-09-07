using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Modelo Educativo Institucional ISTPET versionado formalmente
    /// </summary>
    public class DocModeloEducativo
    {
        public int IdModelo { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public string Codigo { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Version { get; set; } = "1.0";
        public string? ResolucionAprobacion { get; set; }
        public string? Descripcion { get; set; }
        public DateTime FechaVigenciaDesde { get; set; }
        public DateTime? FechaVigenciaHasta { get; set; }
        public string? ArchivoUrl { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual ICollection<DocExpedienteCurricular> Expedientes { get; set; } = new List<DocExpedienteCurricular>();
    }
}

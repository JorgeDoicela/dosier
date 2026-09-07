using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Perfil de egreso formal institucional por carrera y malla
    /// </summary>
    public class DocPerfilEgreso
    {
        public int IdPerfilEgreso { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdCarrera { get; set; }
        public int IdMalla { get; set; }
        public string Version { get; set; } = "1.0";
        public string DescripcionGeneral { get; set; } = string.Empty;
        public bool Activo { get; set; } = true;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual ICollection<DocPerfilEgresoResultado> Resultados { get; set; } = new List<DocPerfilEgresoResultado>();
        public virtual ICollection<DocExpedienteCurricular> Expedientes { get; set; } = new List<DocExpedienteCurricular>();
    }
}

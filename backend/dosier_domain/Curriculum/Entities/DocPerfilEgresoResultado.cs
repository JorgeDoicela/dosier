using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Resultados de Aprendizaje del Perfil de Egreso (RDA oficiales de carrera administrados centralmente)
    /// </summary>
    public class DocPerfilEgresoResultado
    {
        public int IdResultadoPerfil { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public int IdPerfilEgreso { get; set; }
        public string Codigo { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public int Orden { get; set; } = 1;

        // Navegación
        public virtual DocPerfilEgreso? PerfilEgreso { get; set; }
        public virtual ICollection<DocAsignaturaResultadoPerfil> AsignaturasRelacionadas { get; set; } = new List<DocAsignaturaResultadoPerfil>();
    }
}

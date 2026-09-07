using System;
using System.Collections.Generic;

namespace dosier_domain.Curriculum.Entities
{
    /// <summary>
    /// Repositorio inalterable de normativas externas reguladoras (CES, CACES, SENESCYT, etc.)
    /// </summary>
    public class DocNormativa
    {
        public int IdNormativa { get; set; }
        public string Uuid { get; set; } = Guid.NewGuid().ToString();
        public string OrganismoEmisor { get; set; } = "CACES";
        public string TipoNormativa { get; set; } = "Reglamento";
        public string CodigoResolucion { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string? Descripcion { get; set; }
        public DateTime? FechaEmision { get; set; }
        public DateTime? FechaVigencia { get; set; }
        public string? ArchivoUrl { get; set; }
        public bool Activo { get; set; } = true;
        public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;

        // Navegación
        public virtual ICollection<DocNormativaArticulo> Articulos { get; set; } = new List<DocNormativaArticulo>();
    }
}

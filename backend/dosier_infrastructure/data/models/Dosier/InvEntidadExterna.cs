using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocEntidadExterna
{
    public int IdEntidad { get; set; }
    public string Uuid { get; set; } = null!;
    public string? Ruc { get; set; }
    public string RazonSocial { get; set; } = null!;
    public string? Tipo { get; set; } // Pública, Privada, ONG, Académica
    public string? Sector { get; set; }
    public string? ContactoNombre { get; set; }
    public string? ContactoEmail { get; set; }
    public bool? Activo { get; set; }
    public DateTime? FechaRegistro { get; set; }

    public virtual ICollection<DocProyecto> DocProyectos { get; set; } = new List<DocProyecto>();
}

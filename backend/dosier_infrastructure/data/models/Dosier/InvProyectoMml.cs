using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocProyectoMml
{
    public int IdMml { get; set; }
    public int IdProyecto { get; set; }
    public string Nivel { get; set; } = null!; // Fin, Propósito, Componente, Actividad
    public string ResumenNarrativo { get; set; } = null!;
    public string? Indicadores { get; set; }
    public string? MediosVerificacion { get; set; }
    public string? Supuestos { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
}

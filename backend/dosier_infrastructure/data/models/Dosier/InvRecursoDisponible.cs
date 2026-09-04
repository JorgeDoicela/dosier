using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocRecursoDisponible
{
    public int IdRecurso { get; set; }
    public int IdProyecto { get; set; }
    public string Detalle { get; set; } = null!;
    public decimal Cantidad { get; set; }
    public string? Fuente { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
}

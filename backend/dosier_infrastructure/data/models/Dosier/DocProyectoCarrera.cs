using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocProyectoCarrera
{
    public int IdProyectoCarrera { get; set; }
    public int IdProyecto { get; set; }
    public int IdCarrera { get; set; }
    public string? Modalidad { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual Carrera IdCarreraNavigation { get; set; } = null!;
}

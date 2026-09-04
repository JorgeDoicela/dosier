using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocProyectoOds
{
    public int IdProyectoOds { get; set; }
    public int IdProyecto { get; set; }
    public int IdOds { get; set; }
    public string ObjetivoEspecificoODS { get; set; } = null!;

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual DocOds IdOdsNavigation { get; set; } = null!;
}

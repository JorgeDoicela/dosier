using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocImpactoProyecto
{
    public int IdImpactoProyecto { get; set; }
    public int IdProyecto { get; set; }
    public int IdCatImpacto { get; set; }
    public string Descripcion { get; set; } = null!;

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual DocCatImpacto IdCatImpactoNavigation { get; set; } = null!;
}

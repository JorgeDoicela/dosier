using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocCatImpacto
{
    public int IdCatImpacto { get; set; }
    public string Nombre { get; set; } = null!;

    public virtual ICollection<DocImpactoProyecto> DocImpactosProyecto { get; set; } = new List<DocImpactoProyecto>();
}

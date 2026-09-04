using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocOds
{
    public int IdOds { get; set; }
    public int IdEje { get; set; }
    public int NumeroOds { get; set; }
    public string Titulo { get; set; } = null!;

    public virtual DocOdsEje IdEjeNavigation { get; set; } = null!;
    public virtual ICollection<DocProyectoOds> DocProyectosOds { get; set; } = new List<DocProyectoOds>();
}

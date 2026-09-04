using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocOdsEje
{
    public int IdEje { get; set; }
    public string Nombre { get; set; } = null!;

    public virtual ICollection<DocOds> DocOds { get; set; } = new List<DocOds>();
}

using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocObjetivoProyecto
{
    public int IdObjetivo { get; set; }
    public int IdProyecto { get; set; }
    public bool EsGeneral { get; set; }
    public string Descripcion { get; set; } = null!;
    public int? Orden { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual ICollection<DocCronograma> DocCronogramas { get; set; } = new List<DocCronograma>();
}

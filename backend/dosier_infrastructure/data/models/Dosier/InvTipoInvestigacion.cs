using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocTipoInvestigacion
{
    public int IdTipo { get; set; }
    public string Uuid { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public int? IdTipoPadre { get; set; }
    public bool? Activo { get; set; }

    public virtual DocTipoInvestigacion? IdTipoPadreNavigation { get; set; }
    public virtual ICollection<DocTipoInvestigacion> InverseIdTipoPadreNavigation { get; set; } = new List<DocTipoInvestigacion>();
    public virtual ICollection<DocProyecto> DocProyectos { get; set; } = new List<DocProyecto>();
}

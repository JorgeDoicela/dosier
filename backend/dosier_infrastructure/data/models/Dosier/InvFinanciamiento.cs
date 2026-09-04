using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocFinanciamiento
{
    public int IdFinanciamiento { get; set; }
    public int IdProyecto { get; set; }
    public bool? EsIstpet { get; set; }
    public string? NombreEmpresa { get; set; }
    public bool? OtrasFuentes { get; set; }
    public decimal? Monto { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
}

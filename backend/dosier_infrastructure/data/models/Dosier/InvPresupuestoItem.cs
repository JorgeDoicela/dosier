using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocPresupuestoItem
{
    public int IdItem { get; set; }
    public int IdProyecto { get; set; }
    public string Categoria { get; set; } = null!;
    public string? IdPartida { get; set; }
    public string Detalle { get; set; } = null!;
    public decimal Cantidad { get; set; }
    public decimal ValorUnitario { get; set; }
    public decimal ValorTotal { get; set; }
    public bool EsGastoCapital { get; set; } = false;

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
    public virtual ICollection<DocGasto> DocGastos { get; set; } = new List<DocGasto>();
}

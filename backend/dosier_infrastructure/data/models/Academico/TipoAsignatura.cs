using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class TipoAsignatura
{
    public int IdTipoAsignatura { get; set; }
    public string? TipoAsignatura1 { get; set; }
    public string? Abreviatura { get; set; }
    public sbyte? Activo { get; set; }
    public sbyte? NoDefinida { get; set; }

    public virtual ICollection<DetalleMalla> DetalleMallas { get; set; } = new List<DetalleMalla>();
}

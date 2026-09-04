using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class Malla
{
    public int IdMalla { get; set; }
    public int IdCarrera { get; set; }
    public int? Vigencia { get; set; }
    public string? Descripcion { get; set; }
    public int? CreditosMinimo { get; set; }
    public int? CreditosMaximo { get; set; }
    public int? CreditosReprobatorio { get; set; }
    public bool? Activa { get; set; }

    public virtual Carrera? Carrera { get; set; }
    public virtual ICollection<DetalleMalla> DetalleMallas { get; set; } = new List<DetalleMalla>();
}

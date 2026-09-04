using System;

namespace dosier_infrastructure.data.models;

public partial class Prerequisito
{
    public int IdDetalleMalla { get; set; }
    public int IdAsignatura { get; set; }
    public sbyte? Activa { get; set; }

    public virtual DetalleMalla? DetalleMalla { get; set; }
    public virtual Asignatura? Asignatura { get; set; }
}

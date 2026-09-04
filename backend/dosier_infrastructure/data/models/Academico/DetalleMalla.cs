using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DetalleMalla
{
    public int IdDetalleMalla { get; set; }
    public int IdMalla { get; set; }
    public int IdAsignatura { get; set; }
    public int IdNivel { get; set; }
    public int IdTipoAsignatura { get; set; }
    public string? Tipo { get; set; }
    public bool? Opcional { get; set; }
    public int? Creditos { get; set; }
    public int? Horas { get; set; }
    public bool? Anulada { get; set; }
    public int? HorasDocente { get; set; }
    public decimal? HorasPracticoExperimental { get; set; }

    public virtual Malla? Malla { get; set; }
    public virtual Asignatura? Asignatura { get; set; }
    public virtual TipoAsignatura? TipoAsignaturaNavigation { get; set; }
    public virtual ICollection<Prerequisito> Prerequisitos { get; set; } = new List<Prerequisito>();
}

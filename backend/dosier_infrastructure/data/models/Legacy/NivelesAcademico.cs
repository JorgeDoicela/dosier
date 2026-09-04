using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class NivelesAcademico
{
    public int IdNivelAcademico { get; set; }

    public string? Nombre { get; set; }

    public virtual ICollection<GradosAcademico> GradosAcademicos { get; set; } = new List<GradosAcademico>();
}

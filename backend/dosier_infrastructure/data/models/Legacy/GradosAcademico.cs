using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class GradosAcademico
{
    public int IdGradoAcademico { get; set; }

    public int IdNivelAcademico { get; set; }

    public string? Nombre { get; set; }

    public virtual NivelesAcademico IdNivelAcademicoNavigation { get; set; } = null!;

    public virtual ICollection<TitulosProfesore> TitulosProfesores { get; set; } = new List<TitulosProfesore>();
}

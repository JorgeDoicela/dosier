using System;
using System.Collections.Generic;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;

public partial class DocGrupoMiembro
{
    public int IdGrupoMiembro { get; set; }
    public int IdGrupo { get; set; }
    public int IdUsuario { get; set; }
    public string? Rol { get; set; }
    public bool? Activo { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public string? MotivoSalida { get; set; }
    public string? TelefonoContacto { get; set; }

    public virtual DocGrupoInvestigacion IdGrupoNavigation { get; set; } = null!;
    public virtual User IdUsuarioNavigation { get; set; } = null!;
}

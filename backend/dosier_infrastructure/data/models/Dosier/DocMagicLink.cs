using System;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;

public class DocMagicLink
{
    public int IdMagicLink { get; set; }
    public int IdUsuario { get; set; }
    public string TokenHash { get; set; } = null!;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime FechaExpiracion { get; set; }
    public bool Utilizado { get; set; } = false;
    public DateTime? FechaUtilizado { get; set; }
    public string? IpCreacion { get; set; }
    public string? IpUtilizacion { get; set; }
    public string? UserAgent { get; set; }
    public string? CodigoPinHandoff { get; set; }
    public DateTime? FechaExpiracionPin { get; set; }
    public string Proposito { get; set; } = "MAGIC_LINK";

    public virtual User? Usuario { get; set; }
}

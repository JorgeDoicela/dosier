using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;

[Table("doc_audit_admin")]
public class DocAuditAdmin
{
    [Key]
    public int IdAudit { get; set; }
    public int? IdUsuarioAdmin { get; set; }
    public int? IdUsuarioAfectado { get; set; }
    public string Accion { get; set; } = null!;
    public string? Modulo { get; set; }
    public string? Detalle { get; set; }
    public string? IpOrigen { get; set; }
    public string? UserAgent { get; set; }
    public string? ValoresAnteriores { get; set; } // JSON
    public string? ValoresNuevos { get; set; }     // JSON
    public DateTime Fecha { get; set; } = DateTime.UtcNow;

    [ForeignKey("IdUsuarioAdmin")]
    public virtual User? UserAdmin { get; set; }

    [ForeignKey("IdUsuarioAfectado")]
    public virtual User? UserAfectado { get; set; }
}

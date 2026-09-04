using System;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;


/// <summary>
/// [SISTEMA] Perfil extendido del investigador y configuraciones de firma/seguridad
/// </summary>
public partial class DocUsuarioMetadata
{
    public int IdMetadata { get; set; }
    public Guid Uuid { get; set; } = Guid.NewGuid();
    public int IdUsuario { get; set; }
    
    // Configuración de Firma Electrónica (.p12) y LOPDP
    public bool AceptoTerminosFirma { get; set; } = false;
    public DateTime? FechaConsentimientoFirma { get; set; }
    
    // Preferencias y UI (JSON)
    public string? Configuracion { get; set; }
    
    public DateTime FechaRegistro { get; set; } = DateTime.UtcNow;
    public DateTime? FechaUltimoAcceso { get; set; }
    public int Version { get; set; } = 1;

    // Navegación
    public virtual User? User { get; set; }
}

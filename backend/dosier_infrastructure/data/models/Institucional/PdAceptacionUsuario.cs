using System;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Registro institucional de aceptación de términos / LOPDP en SIGAFI (pd_aceptaciones_usuarios)
/// </summary>
public class PdAceptacionUsuario
{
    public int IdAceptacionUsuario { get; set; }
    
    /// <summary>
    /// Cédula de identidad (idSigafi) del usuario que aceptó los términos.
    /// </summary>
    public string? IdUsuario { get; set; }
    
    public int? IdTermino { get; set; }
    public string? Sistema { get; set; }
    public DateTime? FechaRegistro { get; set; }
    public string? IpOrigen { get; set; }
    public string? Dispositivo { get; set; }

    public virtual PdTerminoCondicion? Termino { get; set; }
}


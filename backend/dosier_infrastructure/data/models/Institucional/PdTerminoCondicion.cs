using System;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Término oficial vigente de la Ley de Protección de Datos Personales (pd_terminos_condiciones)
/// </summary>
public class PdTerminoCondicion
{
    public int IdTermino { get; set; }
    public int? IdCategoria { get; set; }
    public string? VersionTermino { get; set; }
    public string? Contenido { get; set; }
    public DateOnly? FechaPublicacion { get; set; }
    public DateTime FechaRegistro { get; set; }
    public string? ArchivoHtml { get; set; }
    public sbyte? EsVigente { get; set; }
}


using System;

namespace dosier_infrastructure.data.models;

public partial class Parcial
{
    public int IdParcial { get; set; }
    public string? Parcial1 { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFinal { get; set; }
    public sbyte? EsPrimero { get; set; }
    public sbyte? EsSegundo { get; set; }
    public sbyte? EsExamenFinal { get; set; }
    public sbyte? EsRemedial { get; set; }
}

public partial class ParcialModalidadFecha
{
    public string? IdPeriodo { get; set; }
    public int? IdParcial { get; set; }
    public int? IdModalidad { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public sbyte? Activo { get; set; }
}

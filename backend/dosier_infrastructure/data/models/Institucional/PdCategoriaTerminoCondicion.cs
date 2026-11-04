using System;

namespace dosier_infrastructure.data.models;

/// <summary>
/// Categoría institucional de términos y condiciones / LOPDP de SIGAFI (pd_categorias_terminos_condiciones)
/// </summary>
public class PdCategoriaTerminoCondicion
{
    public int IdCategoria { get; set; }
    public string? Categoria { get; set; }
    public sbyte? EsAlumno { get; set; }
    public sbyte? EsDocente { get; set; }
    public sbyte? EsAdministrativo { get; set; }
    public sbyte? EsExterno { get; set; }
    public DateOnly? FechaRegistro { get; set; }
    public sbyte? Activo { get; set; }
}


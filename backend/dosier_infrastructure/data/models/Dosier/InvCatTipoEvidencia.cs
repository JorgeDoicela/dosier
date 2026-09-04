using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocCatTipoEvidencia
{
    public int IdTipoEvidencia { get; set; }
    public string Uuid { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string? Extensiones { get; set; }
    public bool? Activo { get; set; }
}

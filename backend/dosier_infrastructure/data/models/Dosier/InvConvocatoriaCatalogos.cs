using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocTipoConvocatoria
{
    public int IdTipoConvocatoria { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Descripcion { get; set; }
}

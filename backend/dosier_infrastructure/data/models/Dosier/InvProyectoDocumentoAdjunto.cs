using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocProyectoDocumentoAdjunto
{
    public int IdDocAdj { get; set; }
    public string Uuid { get; set; } = null!;
    public int IdProyecto { get; set; }
    public string NombreArchivo { get; set; } = null!;
    public string RutaArchivo { get; set; } = null!;
    public DateTime? FechaSubida { get; set; }

    public virtual DocProyecto IdProyectoNavigation { get; set; } = null!;
}

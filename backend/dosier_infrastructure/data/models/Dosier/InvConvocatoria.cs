using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocConvocatoria
{
    public int IdConvocatoria { get; set; }
    public string Uuid { get; set; } = null!;
    public string CodigoConvocatoria { get; set; } = null!;
    public string Titulo { get; set; } = null!;
    public string IdPeriodo { get; set; } = null!;
    public DateOnly FechaApertura { get; set; }
    public DateOnly FechaCierre { get; set; }
    public string Anio { get; set; } = null!;
    public string? Descripcion { get; set; }
    public string? UrlBases { get; set; }
    public string? RequisitosMinimos { get; set; }
    public int? IdTipoConvocatoria { get; set; }
    public string Estado { get; set; } = "Borrador";
    public bool? Eliminado { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? EliminadoPorUsuarioId { get; set; }

    public virtual Periodo IdPeriodoNavigation { get; set; } = null!;
    public virtual ICollection<DocProyecto> Proyectos { get; set; } = new List<DocProyecto>();
}

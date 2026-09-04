using System;
using System.Collections.Generic;
using dosier_domain.Identity.Entities;

namespace dosier_infrastructure.data.models;

public partial class DocGrupoInvestigacion
{
    public int IdGrupo { get; set; }
    public string Uuid { get; set; } = null!;
    public string Nombre { get; set; } = null!;
    public string? Siglas { get; set; }
    public string TipoGrupo { get; set; } = "Investigación";
    public int? IdCoordinador { get; set; }
    public string? ObjetivoGeneral { get; set; }
    public string? Mision { get; set; }
    public string? Vision { get; set; }
    public string? ResolucionAprobacion { get; set; }
    public DateOnly? FechaCreacion { get; set; }
    public string? CategoriaConsolidacion { get; set; } = "En Formación";
    public bool? Activo { get; set; }
    public bool? Eliminado { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? EliminadoPorUsuarioId { get; set; }
    public string? Estado { get; set; } = "Aprobado";
    public DateTime? FechaRegistro { get; set; }
    public string? LinkWhatsapp { get; set; }
    public string? TelefonoCoordinador { get; set; }
    public string? FotoUrl { get; set; }

    public virtual User? IdCoordinadorNavigation { get; set; }
    public virtual ICollection<DocProyecto> DocProyectos { get; set; } = new List<DocProyecto>();
    public virtual ICollection<DocGrupoMiembro> DocGruposMiembros { get; set; } = new List<DocGrupoMiembro>();
    public virtual ICollection<Carrera> IdCarreras { get; set; } = new List<Carrera>();
}

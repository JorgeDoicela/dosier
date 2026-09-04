using System;
using System.Collections.Generic;

namespace dosier_infrastructure.data.models;

public partial class DocProyecto
{
    public int IdProyecto { get; set; }
    public string Uuid { get; set; } = null!;
    public int? IdConvocatoria { get; set; }
    public string? CodigoInstitucional { get; set; }
    public string Titulo { get; set; } = null!;
    // Nota: Los textos descriptivos (Antecedentes, Justificacion, MarcoTeorico, Metodologia,
    // MetodoEvaluacion) viven exclusivamente en MetadataCacesJson. No se duplican aquí.
    public int? IdGrupo { get; set; }
    public bool? TieneGrupo { get; set; }
    public DateOnly? FechaPresentacion { get; set; }
    public DateOnly? FechaInicio { get; set; }
    public DateOnly? FechaFin { get; set; }
    public string? TiempoEjecucion { get; set; }
    public string Estado { get; set; } = "Borrador";
    public decimal? PuntajeEvaluacion { get; set; }
    public string? MetadataCacesJson { get; set; }
    public bool? Activo { get; set; }
    public bool? Eliminado { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? EliminadoPorUsuarioId { get; set; }
    public DateTime? FechaRegistro { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public bool AutoExtendDeadlines { get; set; } = false;
    public int AutoExtendDays { get; set; } = 7;

    // GESTIÓN Y CONTROL DE PLAZOS INSTITUCIONALES (DEADLINES)
    public DateOnly? FechaLimiteSubsanacion { get; set; }

    public virtual DocConvocatoria? IdConvocatoriaNavigation { get; set; }
    public virtual DocGrupoInvestigacion? IdGrupoNavigation { get; set; }

    public virtual ICollection<DocProyectoCarrera> DocProyectosCarreras { get; set; } = new List<DocProyectoCarrera>();
    /// <summary>Participantes unificados: docentes, alumnos y externos. Reemplaza DocProyectosProfesores e DocProyectosAlumnos.</summary>
    public virtual ICollection<DocProyectoParticipante> DocProyectoParticipantes { get; set; } = new List<DocProyectoParticipante>();
    public virtual ICollection<DocObjetivoProyecto> DocObjetivosProyecto { get; set; } = new List<DocObjetivoProyecto>();
    public virtual ICollection<DocCronograma> DocCronogramas { get; set; } = new List<DocCronograma>();
    public virtual ICollection<DocBibliografiaProyecto> DocBibliografiasProyecto { get; set; } = new List<DocBibliografiaProyecto>();

    public virtual ICollection<DocProyectoDocumentoAdjunto> DocumentosAdjuntos { get; set; } = new List<DocProyectoDocumentoAdjunto>();
}

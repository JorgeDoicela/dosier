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
    public decimal? ValorEjecucion { get; set; }
    public decimal? PresupuestoEstimado { get; set; }
    public string? MetadataCacesJson { get; set; }
    public bool? Activo { get; set; }
    public bool? Eliminado { get; set; }
    public DateTime? FechaEliminacion { get; set; }
    public int? EliminadoPorUsuarioId { get; set; }
    public DateTime? FechaRegistro { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public int? IdObjetivoPnd { get; set; }

    // NÚCLEO DE INNOVACIÓN Y VINCULACIÓN PRODUCTIVA
    public int? IdEntidadAliada { get; set; }
    public sbyte? TrlInicial { get; set; }
    public sbyte? TrlActual { get; set; }
    public sbyte? TrlMeta { get; set; }
    public bool AutoExtendDeadlines { get; set; } = false;
    public int AutoExtendDays { get; set; } = 7;

    // GESTIÓN Y CONTROL DE PLAZOS INSTITUCIONALES (DEADLINES)
    public DateOnly? FechaLimiteSubsanacion { get; set; }
    public DateOnly? FechaLimiteInformeFinal { get; set; }
    public DateOnly? FechaLimiteSubsanacionFinal { get; set; }


    public virtual DocConvocatoria? IdConvocatoriaNavigation { get; set; }
    public virtual DocGrupoInvestigacion? IdGrupoNavigation { get; set; }
    public virtual DocPndObjetivo? IdObjetivoPndNavigation { get; set; }
    public virtual DocEntidadExterna? IdEntidadAliadaNavigation { get; set; }

    public virtual ICollection<DocProyectoCarrera> DocProyectosCarreras { get; set; } = new List<DocProyectoCarrera>();
    /// <summary>Participantes unificados: docentes, alumnos y externos. Reemplaza DocProyectosProfesores e DocProyectosAlumnos.</summary>
    public virtual ICollection<DocProyectoParticipante> DocProyectoParticipantes { get; set; } = new List<DocProyectoParticipante>();
    public virtual ICollection<DocObjetivoProyecto> DocObjetivosProyecto { get; set; } = new List<DocObjetivoProyecto>();
    public virtual ICollection<DocProyectoOds> DocProyectosOds { get; set; } = new List<DocProyectoOds>();
    public virtual ICollection<DocRecursoDisponible> DocRecursosDisponibles { get; set; } = new List<DocRecursoDisponible>();
    public virtual ICollection<DocPresupuestoItem> DocPresupuestoItems { get; set; } = new List<DocPresupuestoItem>();
    public virtual ICollection<DocFinanciamiento> DocFinanciamientos { get; set; } = new List<DocFinanciamiento>();
    public virtual ICollection<DocImpactoProyecto> DocImpactosProyecto { get; set; } = new List<DocImpactoProyecto>();
    public virtual ICollection<DocCronograma> DocCronogramas { get; set; } = new List<DocCronograma>();
    public virtual ICollection<DocBibliografiaProyecto> DocBibliografiasProyecto { get; set; } = new List<DocBibliografiaProyecto>();
    public virtual ICollection<DocInformeAvance> DocInformesAvance { get; set; } = new List<DocInformeAvance>();
    public virtual ICollection<DocGasto> DocGastos { get; set; } = new List<DocGasto>();
    public virtual ICollection<DocTransferencia> DocTransferencias { get; set; } = new List<DocTransferencia>();

    public virtual ICollection<DocProyectoMml> MatrizMarcoLogico { get; set; } = new List<DocProyectoMml>();

    public virtual ICollection<DocProyectoDocumentoAdjunto> DocumentosAdjuntos { get; set; } = new List<DocProyectoDocumentoAdjunto>();
}
